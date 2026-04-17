---
name: 10-cache-invalidation
description: |
  Use when building cache logic, webhook receivers, report lifecycle management,
  the report generation queue (BullMQ/Celery), or the 96-hour TTL system. Covers
  auto-invalidation triggers, graceful degradation on stale reports, and the
  priority queue tiers for report regeneration.
---

# Cache Invalidation & Report Lifecycle

## Goal
Build the event-driven cache system that keeps every report fresh, invalidates
on material events in real time, and regenerates once for all users — never per user.

## Cache Architecture

```
Redis Keys:
  quantus:report:{ticker}:current      → full report JSON (96h TTL, dynamic)
  quantus:report:{ticker}:status       → "ready" | "refreshing" | "queued"
  quantus:report:{ticker}:metadata     → {generated_at, researcher_count, report_id, engine}
  quantus:report:{ticker}:deep:{n}     → Deep Dive module n (cached on first expansion)
  quantus:report:{ticker}:archive:{id} → read-only historical snapshot
  quantus:circuit:{service}            → "closed" | "open" | "half-open"
  quantus:queue:priority               → BullMQ queue (>10 requests/96h)
  quantus:queue:standard               → BullMQ queue (3-10 requests/96h)
  quantus:queue:batch                  → Batch API queue (1-2 requests/96h)
```

## Auto-Invalidation Triggers

```python
INVALIDATION_TRIGGERS = {
    "price_move": {
        "threshold": 0.05,       # >5% single session
        "source": "yfinance websocket",
        "priority": "immediate",
    },
    "earnings_release": {
        "source": "Financial Modeling Prep webhook",
        "priority": "immediate",
    },
    "analyst_rating_change": {
        "threshold": 3,          # ≥3 notch change
        "source": "Financial Modeling Prep webhook",
        "priority": "immediate",
    },
    "fed_announcement": {
        "source": "FRED webhook",
        "priority": "immediate",
    },
    "vix_spike": {
        "threshold": 0.20,       # >20% VIX spike
        "source": "CBOE",
        "priority": "immediate",
    },
    "regime_change": {
        "source": "daily regime detection job",
        "priority": "standard",
    },
    "sec_8k_filing": {
        "source": "Polygon.io webhook",
        "priority": "immediate",
    },
    "fundamental_restatement": {
        "source": "Financial Modeling Prep webhook",
        "priority": "immediate",
        "special": "flag_all_cached_reports_with_old_figure",
    },
    "cache_ttl_expiry": {
        "ttl_hours": 96,
        "priority": "batch",
    },
    # CRYPTO-specific:
    "crypto_price_move": {
        "threshold": 0.08,       # 8% (higher threshold for crypto)
        "source": "yfinance / Coinglass websocket",
        "priority": "immediate",
    },
    # COMMODITY-specific:
    "cot_report_release": {
        "source": "CFTC weekly Tuesday release",
        "priority": "standard",
    },
    "eia_weekly_report": {
        "source": "EIA Wednesday release",
        "priority": "standard",
    },
}
```

## Webhook Receiver

```python
# FastAPI webhook endpoints
@router.post("/webhooks/fmp")  # Financial Modeling Prep
async def handle_fmp_webhook(event: FMPEvent, background_tasks: BackgroundTasks):
    ticker = event.symbol
    event_type = event.type

    if event_type in ["earnings", "analyst_rating_change", "insider_transaction"]:
        await invalidate_report(ticker, reason=event_type, priority="immediate")
        await notify_watchlist_subscribers(ticker, event)
        background_tasks.add_task(send_refresh_email, ticker, event)

@router.post("/webhooks/polygon")  # Polygon.io — SEC 8-K
async def handle_polygon_webhook(event: PolygonEvent, background_tasks: BackgroundTasks):
    if event.type == "sec_filing" and event.filing_type == "8-K":
        await invalidate_report(event.ticker, reason="sec_8k", priority="immediate")

@router.post("/webhooks/fred")   # FRED — Fed announcements
async def handle_fred_webhook(event: FREDEvent, background_tasks: BackgroundTasks):
    if event.series_id in ["FEDFUNDS", "DFF"]:
        # Invalidate ALL equity reports (macro shock)
        await invalidate_all_reports(reason="fed_announcement", priority="immediate")
```

## Invalidation Flow

```python
async def invalidate_report(ticker: str, reason: str, priority: str):
    # 1. Mark report as refreshing in Redis
    await redis.set(f"quantus:report:{ticker}:status", "refreshing")

    # 2. Archive current report
    current = await redis.get(f"quantus:report:{ticker}:current")
    if current:
        report = json.loads(current)
        archive_id = report["report_id"]
        await redis.set(f"quantus:report:{ticker}:archive:{archive_id}", current)
        # Add data lineage flag if fundamental data changed
        if reason == "fundamental_restatement":
            await flag_archived_report(archive_id, reason)

    # 3. Update discovery feed (all connected clients)
    await broadcast_status_update(ticker, "refreshing", reason)

    # 4. Queue regeneration
    await queue_report_generation(ticker, priority, reason)

    # 5. Log invalidation event
    await log_invalidation(ticker, reason, priority, timestamp=now())
```

## Report Generation Queue

```python
# BullMQ queue tiers (or Celery with task priorities)
QUEUE_TIERS = {
    "priority": {
        "condition": "requests_per_96h > 10 OR user_tier == INSTITUTIONAL",
        "sla": "Executive Summary <25s, Full report <90s, Deep Dive <12s",
        "api_type": "realtime",
    },
    "standard": {
        "condition": "3 <= requests_per_96h <= 10",
        "sla": "<5 minutes",
        "api_type": "realtime",
    },
    "batch": {
        "condition": "requests_per_96h < 3",
        "sla": "<4 hours",
        "api_type": "anthropic_batch",
        "schedule": "11pm-5am",
    },
    "scheduled": {
        "condition": "nightly top-50 refresh OR watchlist subscriber refresh",
        "api_type": "anthropic_batch",
        "schedule": "11pm-5am",
    },
}
```

## SLA Breach Handling

```python
async def monitor_sla(report_id: str, sla_seconds: int):
    await asyncio.sleep(sla_seconds)
    status = await redis.get(f"quantus:report:{report_id}:status")
    if status != "ready":
        # SLA breach
        await alert_operator(report_id, "SLA_BREACH")
        await notify_user(report_id, "Report generation is taking longer than expected.
            You'll receive an email when it's ready.")
        # Auto-switch to batch mode
        await move_to_batch_queue(report_id)
```

## Circuit Breaker Implementation

```python
class CircuitBreaker:
    """
    States: Closed → Open (3 failures in 60s) → Half-Open (retry after 30s) → Closed
    """
    def __init__(self, service: str, failure_threshold: int = 3, reset_timeout: int = 30):
        self.service = service
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.redis_key = f"quantus:circuit:{service}"

    async def call(self, func, *args, fallback=None, **kwargs):
        state = await self.get_state()

        if state == "open":
            if fallback:
                return await fallback(*args, **kwargs)
            raise CircuitOpenError(self.service)

        try:
            result = await func(*args, **kwargs)
            await self.record_success()
            return result
        except Exception as e:
            await self.record_failure()
            if await self.should_open():
                await self.open()
                await self.log_operator(f"Circuit {self.service} OPENED: {e}")
            if fallback:
                return await fallback(*args, **kwargs)
            raise
```

## Restatement Handling

```python
async def handle_data_restatement(ticker: str, field: str, old_value, new_value):
    # 1. Find all archived reports using the old value
    affected_reports = await find_reports_using_value(ticker, field, old_value)

    # 2. Add inline flag to each affected report
    for report_id in affected_reports:
        await add_restatement_flag(report_id, {
            "field": field,
            "old_value": old_value,
            "new_value": new_value,
            "flagged_at": now(),
            "display": f"Key figure revised — {field} updated from {old_value} to {new_value} since this report was generated.",
        })

    # 3. Invalidate current cache for immediate regeneration
    await invalidate_report(ticker, reason="fundamental_restatement", priority="immediate")
```

## Constraints
- Reports are NEVER generated per user — always once per ticker per 96h window
- Invalidation must complete in <2 seconds — never block the user response
- Archive every report before overwriting — report_id is permanent and immutable
- Circuit breaker state stored in Redis — shared across all FastAPI instances
- Webhook receiver must be idempotent — same event delivered twice = same result once
- SLA timer starts from the moment the user requests the report
- Never delete from the archive — only append
- Batch jobs must run 11pm–5am to avoid real-time queue interference
