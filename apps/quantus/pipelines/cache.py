"""
pipelines/cache.py
===================
Cache Invalidation & Report Lifecycle — Quantus Research Solutions.

Redis key schema:
  quantus:report:{ticker}:current      → full report JSON (96h TTL)
  quantus:report:{ticker}:status       → "ready" | "refreshing" | "queued"
  quantus:report:{ticker}:metadata     → {generated_at, report_id, engine}
  quantus:report:{ticker}:archive:{id} → read-only historical snapshot
  quantus:circuit:{service}            → circuit breaker state JSON
  quantus:queue:priority / :standard / :batch → generation queue entries

Auto-invalidation triggers (per skill spec §10-cache-invalidation):
  price_move >5%, earnings_release, analyst_rating_change ≥3 notches,
  vix_spike >20%, regime_change, sec_8k_filing, fundamental_restatement

Circuit breaker: Closed → Open (3 failures/60s) → Half-Open (retry 30s) → Closed
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Redis key helpers
# ---------------------------------------------------------------------------
REPORT_TTL_SECONDS = 96 * 3600   # 96 hours


def _normalize_cache_scope(section: str = "A", user_tier: str = "FREE") -> str:
    safe_section = (section or "A").strip().upper() or "A"
    safe_tier = (user_tier or "FREE").strip().upper() or "FREE"
    return f"{safe_section}:{safe_tier}"


def _key_current(ticker: str, section: str = "A", user_tier: str = "FREE") -> str:
    return f"quantus:report:{ticker}:{_normalize_cache_scope(section, user_tier)}:current"


def _key_status(ticker: str, section: str = "A", user_tier: str = "FREE") -> str:
    return f"quantus:report:{ticker}:{_normalize_cache_scope(section, user_tier)}:status"


def _key_metadata(ticker: str, section: str = "A", user_tier: str = "FREE") -> str:
    return f"quantus:report:{ticker}:{_normalize_cache_scope(section, user_tier)}:metadata"


def _key_archive(ticker: str, report_id: str) -> str:
    return f"quantus:report:{ticker}:archive:{report_id}"
def _key_circuit(service: str) -> str: return f"quantus:circuit:{service}"
def _key_queue(tier: str)      -> str: return f"quantus:queue:{tier}"

# ---------------------------------------------------------------------------
# Auto-invalidation triggers (from skill spec)
# ---------------------------------------------------------------------------
INVALIDATION_TRIGGERS: dict[str, dict] = {
    "price_move": {
        "threshold": 0.05,
        "source":    "yfinance websocket",
        "priority":  "immediate",
    },
    "earnings_release": {
        "source":   "Financial Modeling Prep webhook",
        "priority": "immediate",
    },
    "analyst_rating_change": {
        "threshold": 3,
        "source":    "Financial Modeling Prep webhook",
        "priority":  "immediate",
    },
    "vix_spike": {
        "threshold": 0.20,
        "source":    "CBOE",
        "priority":  "immediate",
    },
    "regime_change": {
        "source":   "daily regime detection job",
        "priority": "standard",
    },
    "sec_8k_filing": {
        "source":   "Polygon.io webhook",
        "priority": "immediate",
    },
    "fundamental_restatement": {
        "source":   "Financial Modeling Prep webhook",
        "priority": "immediate",
        "special":  "flag_all_cached_reports_with_old_figure",
    },
    "cache_ttl_expiry": {
        "ttl_hours": 96,
        "priority":  "batch",
    },
    "crypto_price_move": {
        "threshold": 0.08,
        "source":    "yfinance / Coinglass websocket",
        "priority":  "immediate",
    },
    "cot_report_release": {
        "source":   "CFTC weekly Tuesday release",
        "priority": "standard",
    },
    "eia_weekly_report": {
        "source":   "EIA Wednesday release",
        "priority": "standard",
    },
}

# ---------------------------------------------------------------------------
# Queue tier definitions
# ---------------------------------------------------------------------------
QUEUE_TIERS: dict[str, dict] = {
    "priority": {
        "condition": "requests_per_96h > 10 OR user_tier == INSTITUTIONAL",
        "sla":       "Executive Summary <25s, Full report <90s, Deep Dive <12s",
        "api_type":  "realtime",
    },
    "standard": {
        "condition": "3 <= requests_per_96h <= 10",
        "sla":       "<5 minutes",
        "api_type":  "realtime",
    },
    "batch": {
        "condition": "requests_per_96h < 3",
        "sla":       "<4 hours",
        "api_type":  "anthropic_batch",
        "schedule":  "11pm-5am",
    },
}


def resolve_queue_tier(requests_per_96h: int, user_tier: str) -> str:
    """Return the appropriate queue tier given request frequency and user tier."""
    if user_tier == "INSTITUTIONAL" or requests_per_96h > 10:
        return "priority"
    if requests_per_96h >= 3:
        return "standard"
    return "batch"

# ---------------------------------------------------------------------------
# Redis cache abstraction
# ---------------------------------------------------------------------------

class ReportCache(ABC):
    """Abstract Redis cache. MockReportCache used in tests."""

    @abstractmethod
    def get(self, key: str) -> str | None: ...

    @abstractmethod
    def set(self, key: str, value: str, ttl: int | None = None) -> None: ...

    @abstractmethod
    def delete(self, key: str) -> None: ...

    @abstractmethod
    def exists(self, key: str) -> bool: ...

    # High-level helpers
    def get_report(self, ticker: str, section: str = "A", user_tier: str = "FREE") -> dict | None:
        raw = self.get(_key_current(ticker, section=section, user_tier=user_tier))
        return json.loads(raw) if raw else None

    def set_report(self, ticker: str, report: dict, section: str = "A", user_tier: str = "FREE") -> None:
        self.set(
            _key_current(ticker, section=section, user_tier=user_tier),
            json.dumps(report),
            ttl=REPORT_TTL_SECONDS,
        )
        self.set(_key_status(ticker, section=section, user_tier=user_tier), "ready")

    def get_status(self, ticker: str, section: str = "A", user_tier: str = "FREE") -> str:
        return self.get(_key_status(ticker, section=section, user_tier=user_tier)) or "MISS"

    def set_status(self, ticker: str, status: str, section: str = "A", user_tier: str = "FREE") -> None:
        self.set(_key_status(ticker, section=section, user_tier=user_tier), status)

    def archive_report(self, ticker: str, report: dict) -> str:
        report_id = report.get("report_id") or str(uuid.uuid4())
        self.set(_key_archive(ticker, report_id), json.dumps(report))
        return report_id

    def get_archive(self, ticker: str, report_id: str) -> dict | None:
        raw = self.get(_key_archive(ticker, report_id))
        return json.loads(raw) if raw else None

    def set_metadata(self, ticker: str, meta: dict, section: str = "A", user_tier: str = "FREE") -> None:
        self.set(_key_metadata(ticker, section=section, user_tier=user_tier), json.dumps(meta))

    def get_metadata(self, ticker: str, section: str = "A", user_tier: str = "FREE") -> dict | None:
        raw = self.get(_key_metadata(ticker, section=section, user_tier=user_tier))
        return json.loads(raw) if raw else None

    def enqueue(self, ticker: str, tier: str, reason: str) -> str:
        job_id = str(uuid.uuid4())
        entry  = json.dumps({"job_id": job_id, "ticker": ticker,
                              "reason": reason, "queued_at": time.time()})
        self.set(f"{_key_queue(tier)}:{job_id}", entry)
        return job_id


class MockReportCache(ReportCache):
    """In-process mock used in tests. Thread-safe via dict."""

    def __init__(self):
        self._store: dict[str, tuple[str, float | None]] = {}
        # (value, expiry_epoch or None)

    def get(self, key: str) -> str | None:
        entry = self._store.get(key)
        if entry is None:
            return None
        val, exp = entry
        if exp is not None and time.time() > exp:
            del self._store[key]
            return None
        return val

    def set(self, key: str, value: str, ttl: int | None = None) -> None:
        exp = time.time() + ttl if ttl else None
        self._store[key] = (value, exp)

    def delete(self, key: str) -> None:
        self._store.pop(key, None)

    def exists(self, key: str) -> bool:
        return self.get(key) is not None

# ---------------------------------------------------------------------------
# Invalidation flow
# ---------------------------------------------------------------------------

@dataclass
class InvalidationEvent:
    ticker: str
    reason: str
    priority: str
    timestamp: float = field(default_factory=time.time)
    metadata: dict = field(default_factory=dict)


async def invalidate_report(
    ticker: str,
    reason: str,
    priority: str,
    cache: ReportCache,
) -> InvalidationEvent:
    """Invalidate the current cached report for *ticker*.

    Steps:
    1. Mark report as "refreshing"
    2. Archive current report (immutable snapshot)
    3. Queue regeneration at the correct priority tier
    4. Log the invalidation event

    Idempotent — safe to call multiple times for the same event.
    """
    ticker = ticker.upper().strip()
    logger.info("invalidate_report | ticker=%s reason=%s priority=%s", ticker, reason, priority)

    # 1. Mark refreshing
    cache.set_status(ticker, "refreshing")

    # 2. Archive current report if present
    current = cache.get_report(ticker)
    archive_id = None
    if current:
        archive_id = cache.archive_report(ticker, current)
        logger.info("invalidate_report | archived %s → archive_id=%s", ticker, archive_id)

    # 3. Remove current (will be regenerated)
    cache.delete(_key_current(ticker))

    # 4. Queue regeneration
    job_id = cache.enqueue(ticker, priority if priority in QUEUE_TIERS else "standard", reason)
    logger.info("invalidate_report | queued job_id=%s tier=%s", job_id, priority)

    event = InvalidationEvent(
        ticker=ticker,
        reason=reason,
        priority=priority,
        metadata={"archive_id": archive_id, "job_id": job_id},
    )
    return event


def check_price_move_trigger(
    ticker: str,
    current_price: float,
    prev_close: float,
    asset_class: str = "EQUITY",
) -> bool:
    """Return True if the price move exceeds the invalidation threshold."""
    if prev_close == 0:
        return False
    threshold = INVALIDATION_TRIGGERS["crypto_price_move"]["threshold"] \
                if asset_class == "CRYPTO" else \
                INVALIDATION_TRIGGERS["price_move"]["threshold"]
    move = abs(current_price - prev_close) / prev_close
    return move > threshold


# ---------------------------------------------------------------------------
# Circuit Breaker
# ---------------------------------------------------------------------------

class CircuitState(str, Enum):
    CLOSED    = "closed"
    OPEN      = "open"
    HALF_OPEN = "half-open"


class CircuitOpenError(Exception):
    def __init__(self, service: str):
        super().__init__(f"Circuit breaker OPEN for service: {service!r}")
        self.service = service


@dataclass
class CircuitBreakerState:
    state: str = CircuitState.CLOSED
    failures: int = 0
    last_failure_time: float = 0.0
    last_success_time: float = 0.0
    opened_at: float = 0.0


class CircuitBreaker:
    """Closed → Open (3 failures in 60s) → Half-Open (retry after 30s) → Closed.

    State persisted in Redis (shared across all FastAPI instances in prod).
    Tests use MockReportCache for state storage.
    """

    def __init__(
        self,
        service: str,
        cache: ReportCache,
        failure_threshold: int = 3,
        failure_window_s: float = 60.0,
        reset_timeout_s: float = 30.0,
    ):
        self.service          = service
        self.cache            = cache
        self.failure_threshold = failure_threshold
        self.failure_window_s  = failure_window_s
        self.reset_timeout_s   = reset_timeout_s
        self._key              = _key_circuit(service)

    # ---- State persistence ------------------------------------------------

    def _load(self) -> CircuitBreakerState:
        raw = self.cache.get(self._key)
        if not raw:
            return CircuitBreakerState()
        try:
            d = json.loads(raw)
            return CircuitBreakerState(**d)
        except Exception:
            return CircuitBreakerState()

    def _save(self, state: CircuitBreakerState) -> None:
        self.cache.set(self._key, json.dumps({
            "state":             state.state,
            "failures":          state.failures,
            "last_failure_time": state.last_failure_time,
            "last_success_time": state.last_success_time,
            "opened_at":         state.opened_at,
        }))

    # ---- Public API --------------------------------------------------------

    def get_state(self) -> str:
        cb = self._load()
        now = time.time()

        if cb.state == CircuitState.OPEN:
            if now - cb.opened_at >= self.reset_timeout_s:
                # Transition to HALF_OPEN for a probe attempt
                cb.state = CircuitState.HALF_OPEN
                self._save(cb)
                logger.info("circuit | %s → HALF_OPEN", self.service)

        return cb.state

    def record_success(self) -> None:
        cb = self._load()
        cb.state             = CircuitState.CLOSED
        cb.failures          = 0
        cb.last_success_time = time.time()
        self._save(cb)
        logger.debug("circuit | %s → CLOSED (success)", self.service)

    def record_failure(self) -> CircuitBreakerState:
        cb  = self._load()
        now = time.time()

        # Reset failure window counter if outside window
        if now - cb.last_failure_time > self.failure_window_s:
            cb.failures = 0

        cb.failures         += 1
        cb.last_failure_time = now

        if cb.failures >= self.failure_threshold and cb.state != CircuitState.OPEN:
            cb.state     = CircuitState.OPEN
            cb.opened_at = now
            logger.warning("circuit | %s → OPEN after %d failures", self.service, cb.failures)
        elif cb.state == CircuitState.HALF_OPEN:
            # Probe failed — reopen
            cb.state     = CircuitState.OPEN
            cb.opened_at = now
            logger.warning("circuit | %s probe FAILED → OPEN", self.service)

        self._save(cb)
        return cb

    async def call(
        self,
        func: Callable,
        *args,
        fallback: Callable | None = None,
        **kwargs,
    ) -> Any:
        """Execute *func* guarded by the circuit breaker.

        If OPEN and no fallback, raises CircuitOpenError.
        """
        state = self.get_state()

        if state == CircuitState.OPEN:
            logger.warning("circuit | %s is OPEN — using fallback", self.service)
            if fallback:
                return await fallback(*args, **kwargs)
            raise CircuitOpenError(self.service)

        try:
            result = await func(*args, **kwargs) if asyncio.iscoroutinefunction(func) \
                     else func(*args, **kwargs)
            self.record_success()
            return result
        except Exception as exc:
            self.record_failure()
            logger.error("circuit | %s failure: %s", self.service, exc)
            if fallback:
                return await fallback(*args, **kwargs) if asyncio.iscoroutinefunction(fallback) \
                       else fallback(*args, **kwargs)
            raise
