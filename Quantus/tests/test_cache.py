"""
tests/test_cache.py
====================
Unit tests for pipelines/cache.py.

Covers:
  1. MockReportCache — get/set/delete/TTL
  2. invalidate_report() — full invalidation flow
  3. archive creation on invalidation
  4. queue enqueueing
  5. check_price_move_trigger()
  6. CircuitBreaker — state machine transitions
     (Closed → Open → Half-Open → Closed)
"""

from __future__ import annotations

import asyncio
import json
import time
import uuid
from unittest.mock import AsyncMock, patch

import pytest

from pipelines.cache import (
    CircuitBreaker,
    CircuitOpenError,
    CircuitState,
    InvalidationEvent,
    MockReportCache,
    INVALIDATION_TRIGGERS,
    QUEUE_TIERS,
    _key_archive,
    _key_current,
    _key_queue,
    _key_status,
    check_price_move_trigger,
    invalidate_report,
    resolve_queue_tier,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


def _sample_report(ticker: str = "TSLA") -> dict:
    return {
        "engine": "Meridian v2.4",
        "report_id": str(uuid.uuid4()),
        "section": "A",
        "asset_class": "EQUITY",
        "overall_signal": "BUY",
        "confidence_score": 72,
        "ticker": ticker,
    }


# ---------------------------------------------------------------------------
# 1. MockReportCache basic operations
# ---------------------------------------------------------------------------

class TestMockReportCache:

    def setup_method(self):
        self.cache = MockReportCache()

    def test_set_and_get(self):
        self.cache.set("k", "v")
        assert self.cache.get("k") == "v"

    def test_get_missing_returns_none(self):
        assert self.cache.get("nonexistent") is None

    def test_delete(self):
        self.cache.set("k", "v")
        self.cache.delete("k")
        assert self.cache.get("k") is None

    def test_exists_true(self):
        self.cache.set("k", "v")
        assert self.cache.exists("k") is True

    def test_exists_false(self):
        assert self.cache.exists("missing") is False

    def test_ttl_expiry(self):
        self.cache.set("k", "v", ttl=1)
        assert self.cache.get("k") == "v"
        # Manually expire
        key = "k"
        self.cache._store[key] = (self.cache._store[key][0], time.time() - 1)
        assert self.cache.get(key) is None

    def test_set_report_and_get_report(self):
        report = _sample_report()
        self.cache.set_report("TSLA", report)
        retrieved = self.cache.get_report("TSLA")
        assert retrieved["report_id"] == report["report_id"]

    def test_status_set_and_get(self):
        self.cache.set_status("TSLA", "ready")
        assert self.cache.get_status("TSLA") == "ready"

    def test_status_miss_default(self):
        assert self.cache.get_status("AAPL") == "MISS"

    def test_enqueue_returns_job_id(self):
        job_id = self.cache.enqueue("TSLA", "priority", "earnings_release")
        assert isinstance(job_id, str)
        assert len(job_id) > 0


# ---------------------------------------------------------------------------
# 2. invalidate_report() — full flow
# ---------------------------------------------------------------------------

class TestInvalidateReport:

    def setup_method(self):
        self.cache = MockReportCache()

    def test_returns_invalidation_event(self):
        event = _run(invalidate_report("TSLA", "earnings_release", "immediate", self.cache))
        assert isinstance(event, InvalidationEvent)
        assert event.ticker == "TSLA"
        assert event.reason == "earnings_release"
        assert event.priority == "immediate"

    def test_status_set_to_refreshing(self):
        _run(invalidate_report("TSLA", "price_move_6pct", "immediate", self.cache))
        assert self.cache.get_status("TSLA") == "refreshing"

    def test_current_report_removed_after_invalidation(self):
        report = _sample_report()
        self.cache.set_report("TSLA", report)
        _run(invalidate_report("TSLA", "earnings_release", "immediate", self.cache))
        assert self.cache.get_report("TSLA") is None

    def test_archive_created_before_invalidation(self):
        report = _sample_report()
        rid    = report["report_id"]
        self.cache.set_report("TSLA", report)
        event = _run(invalidate_report("TSLA", "earnings_release", "immediate", self.cache))
        archive_id = event.metadata.get("archive_id")
        assert archive_id is not None
        archived = self.cache.get_archive("TSLA", archive_id)
        assert archived is not None
        assert archived["report_id"] == rid

    def test_archive_not_created_when_no_current(self):
        event = _run(invalidate_report("TSLA", "earnings_release", "immediate", self.cache))
        assert event.metadata.get("archive_id") is None

    def test_job_id_in_metadata(self):
        event = _run(invalidate_report("TSLA", "sec_8k_filing", "immediate", self.cache))
        assert "job_id" in event.metadata
        assert event.metadata["job_id"] is not None

    def test_idempotent_when_already_refreshing(self):
        """Calling invalidate twice is safe — status stays refreshing."""
        _run(invalidate_report("TSLA", "earnings_release", "immediate", self.cache))
        _run(invalidate_report("TSLA", "earnings_release", "immediate", self.cache))
        assert self.cache.get_status("TSLA") == "refreshing"

    def test_ticker_normalised_to_uppercase(self):
        event = _run(invalidate_report("tsla", "regime_change", "standard", self.cache))
        assert event.ticker == "TSLA"


# ---------------------------------------------------------------------------
# 3. check_price_move_trigger()
# ---------------------------------------------------------------------------

class TestPriceMoveTrigger:

    def test_equity_above_5pct_triggers(self):
        assert check_price_move_trigger("TSLA", 260.0, 245.0, "EQUITY") is True

    def test_equity_below_5pct_no_trigger(self):
        assert check_price_move_trigger("TSLA", 248.0, 245.0, "EQUITY") is False

    def test_crypto_above_8pct_triggers(self):
        assert check_price_move_trigger("BTC-USD", 55000.0, 50000.0, "CRYPTO") is True  # 10% move

    def test_crypto_between_5_and_8pct_no_trigger(self):
        """Crypto threshold is 8% — 6% should not trigger."""
        assert check_price_move_trigger("BTC-USD", 53000.0, 50000.0, "CRYPTO") is False

    def test_negative_move_triggers(self):
        assert check_price_move_trigger("TSLA", 220.0, 245.0, "EQUITY") is True

    def test_zero_prev_close_no_trigger(self):
        assert check_price_move_trigger("TSLA", 248.0, 0.0, "EQUITY") is False


# ---------------------------------------------------------------------------
# 4. resolve_queue_tier()
# ---------------------------------------------------------------------------

class TestResolveQueueTier:

    def test_institutional_always_priority(self):
        assert resolve_queue_tier(1, "INSTITUTIONAL") == "priority"

    def test_high_request_count_priority(self):
        assert resolve_queue_tier(15, "FREE") == "priority"

    def test_moderate_request_count_standard(self):
        assert resolve_queue_tier(5, "FREE") == "standard"

    def test_low_request_count_batch(self):
        assert resolve_queue_tier(2, "FREE") == "batch"

    def test_exactly_3_requests_standard(self):
        assert resolve_queue_tier(3, "FREE") == "standard"

    def test_exactly_10_requests_standard(self):
        assert resolve_queue_tier(10, "FREE") == "standard"

    def test_exactly_11_requests_priority(self):
        assert resolve_queue_tier(11, "FREE") == "priority"


# ---------------------------------------------------------------------------
# 5. CircuitBreaker — state machine
# ---------------------------------------------------------------------------

class TestCircuitBreakerStateMachine:

    def setup_method(self):
        self.cache = MockReportCache()
        self.cb = CircuitBreaker(
            service="test_service",
            cache=self.cache,
            failure_threshold=3,
            failure_window_s=60.0,
            reset_timeout_s=30.0,
        )

    def test_initial_state_closed(self):
        assert self.cb.get_state() == CircuitState.CLOSED

    def test_single_failure_stays_closed(self):
        self.cb.record_failure()
        assert self.cb.get_state() == CircuitState.CLOSED

    def test_two_failures_stays_closed(self):
        self.cb.record_failure()
        self.cb.record_failure()
        assert self.cb.get_state() == CircuitState.CLOSED

    def test_three_failures_opens(self):
        self.cb.record_failure()
        self.cb.record_failure()
        self.cb.record_failure()
        assert self.cb.get_state() == CircuitState.OPEN

    def test_success_resets_to_closed(self):
        self.cb.record_failure()
        self.cb.record_failure()
        self.cb.record_success()
        assert self.cb.get_state() == CircuitState.CLOSED

    def test_success_resets_failure_count(self):
        self.cb.record_failure()
        self.cb.record_failure()
        self.cb.record_success()
        # Two more failures should NOT open the circuit
        self.cb.record_failure()
        self.cb.record_failure()
        assert self.cb.get_state() == CircuitState.CLOSED

    def test_open_transitions_to_half_open_after_timeout(self):
        # Open the circuit
        self.cb.record_failure()
        self.cb.record_failure()
        self.cb.record_failure()
        assert self.cb.get_state() == CircuitState.OPEN

        # Simulate timeout elapsed by backdating opened_at
        state_key = self.cb._key
        raw = self.cache.get(state_key)
        s = json.loads(raw)
        s["opened_at"] = 0.0   # far in the past
        self.cache.set(state_key, json.dumps(s))

        assert self.cb.get_state() == CircuitState.HALF_OPEN

    def test_half_open_success_closes(self):
        # Open then manually set to half-open
        self.cb.record_failure()
        self.cb.record_failure()
        self.cb.record_failure()
        state_key = self.cb._key
        raw = json.loads(self.cache.get(state_key))
        raw["state"] = CircuitState.HALF_OPEN
        raw["opened_at"] = 0.0
        self.cache.set(state_key, json.dumps(raw))

        self.cb.record_success()
        assert self.cb.get_state() == CircuitState.CLOSED

    def test_half_open_failure_reopens(self):
        self.cb.record_failure()
        self.cb.record_failure()
        self.cb.record_failure()
        state_key = self.cb._key
        raw = json.loads(self.cache.get(state_key))
        raw["state"] = CircuitState.HALF_OPEN
        raw["opened_at"] = 0.0
        self.cache.set(state_key, json.dumps(raw))

        self.cb.record_failure()
        assert self.cb.get_state() == CircuitState.OPEN

    def test_call_closed_executes_function(self):
        async def ok():
            return "success"
        result = _run(self.cb.call(ok))
        assert result == "success"

    def test_call_open_with_fallback_uses_fallback(self):
        # Force open
        self.cb.record_failure()
        self.cb.record_failure()
        self.cb.record_failure()

        async def fallback():
            return "fallback_result"

        result = _run(self.cb.call(lambda: None, fallback=fallback))
        assert result == "fallback_result"

    def test_call_open_no_fallback_raises(self):
        self.cb.record_failure()
        self.cb.record_failure()
        self.cb.record_failure()

        with pytest.raises(CircuitOpenError) as exc_info:
            _run(self.cb.call(lambda: None))
        assert "test_service" in str(exc_info.value)

    def test_state_persisted_in_cache(self):
        """State must survive creating a new CircuitBreaker instance with same service."""
        self.cb.record_failure()
        self.cb.record_failure()
        self.cb.record_failure()

        # New instance pointing at same cache
        cb2 = CircuitBreaker("test_service", self.cache,
                              failure_threshold=3, failure_window_s=60, reset_timeout_s=30)
        assert cb2.get_state() == CircuitState.OPEN

    def test_invalidation_triggers_all_defined(self):
        """Sanity check: all 6 equity invalidation triggers are present."""
        for trigger in ("price_move", "earnings_release", "analyst_rating_change",
                        "vix_spike", "regime_change", "sec_8k_filing"):
            assert trigger in INVALIDATION_TRIGGERS, f"Missing trigger: {trigger}"

    def test_queue_tiers_all_defined(self):
        for tier in ("priority", "standard", "batch"):
            assert tier in QUEUE_TIERS, f"Missing queue tier: {tier}"
