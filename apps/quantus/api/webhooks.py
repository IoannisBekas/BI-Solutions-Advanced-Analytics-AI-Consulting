"""
api/webhooks.py
================
Webhook Receivers — Quantus Research Solutions.

Receives events from external providers and triggers cache invalidation.
All webhook handlers are idempotent — the same event delivered twice
produces the same cache outcome as delivering it once.

Providers:
  POST /webhooks/fmp      → Financial Modeling Prep (earnings, ratings, insider)
  POST /webhooks/polygon  → Polygon.io (SEC 8-K filings)
  POST /webhooks/fred     → FRED (Fed rate announcements)
  POST /webhooks/price    → Internal price monitor (yfinance WebSocket proxy)
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from pipelines.cache import (
    ReportCache,
    INVALIDATION_TRIGGERS,
    check_price_move_trigger,
    invalidate_report,
)
from pipelines.runtime_state import get_shared_cache, set_shared_cache

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

# ---------------------------------------------------------------------------
# Shared cache (same instance as api/report.py — wired at app startup)
# ---------------------------------------------------------------------------
_cache: ReportCache | None = None


def get_cache() -> ReportCache:
    global _cache
    if _cache is None:
        _cache = get_shared_cache()
    return _cache


def set_cache(c: ReportCache) -> None:
    global _cache
    _cache = c
    set_shared_cache(c)

# ---------------------------------------------------------------------------
# Pydantic event models
# ---------------------------------------------------------------------------

class FMPEvent(BaseModel):
    symbol: str
    type: str                          # "earnings" | "analyst_rating_change" | "insider_transaction"
    rating_change_notches: int = 0     # for analyst_rating_change
    metadata: dict[str, Any] = Field(default_factory=dict)


class PolygonEvent(BaseModel):
    ticker: str
    type: str                          # "sec_filing"
    filing_type: str = ""              # "8-K" | "10-K" | …
    metadata: dict[str, Any] = Field(default_factory=dict)


class FREDEvent(BaseModel):
    series_id: str                     # "FEDFUNDS" | "DFF" | …
    value: float
    metadata: dict[str, Any] = Field(default_factory=dict)


class PriceEvent(BaseModel):
    ticker: str
    current_price: float
    prev_close: float
    asset_class: str = "EQUITY"

# ---------------------------------------------------------------------------
# Helper — idempotency guard via cache status check
# ---------------------------------------------------------------------------

async def _safe_invalidate(
    ticker: str,
    reason: str,
    priority: str,
    cache: ReportCache,
) -> dict:
    """Invalidate if not already refreshing (idempotency)."""
    status = cache.get_status(ticker)
    if status == "refreshing":
        logger.info("webhook | %s already refreshing, skipping duplicate invalidation", ticker)
        return {"ticker": ticker, "action": "skipped", "reason": "already_refreshing"}

    event = await invalidate_report(ticker, reason=reason, priority=priority, cache=cache)
    return {
        "ticker":      event.ticker,
        "action":      "invalidated",
        "reason":      event.reason,
        "priority":    event.priority,
        "archive_id":  event.metadata.get("archive_id"),
        "job_id":      event.metadata.get("job_id"),
    }

# ---------------------------------------------------------------------------
# POST /webhooks/fmp — Financial Modeling Prep
# ---------------------------------------------------------------------------

@router.post("/fmp")
async def handle_fmp_webhook(
    event: FMPEvent,
    background_tasks: BackgroundTasks,
) -> JSONResponse:
    """Handle FMP events: earnings releases, analyst rating changes, insider transactions."""
    cache  = get_cache()
    ticker = event.symbol.upper().strip()

    if event.type == "earnings":
        result = await _safe_invalidate(
            ticker, reason="earnings_release", priority="immediate", cache=cache
        )
        return JSONResponse(result)

    if event.type == "analyst_rating_change":
        notches = abs(event.rating_change_notches)
        threshold = INVALIDATION_TRIGGERS["analyst_rating_change"]["threshold"]
        if notches >= threshold:
            result = await _safe_invalidate(
                ticker, reason=f"analyst_rating_change_{notches}_notches",
                priority="immediate", cache=cache
            )
            return JSONResponse(result)
        logger.info("webhook/fmp | %s rating change %d notch(es) below threshold %d — ignored",
                    ticker, notches, threshold)
        return JSONResponse({"ticker": ticker, "action": "ignored",
                             "reason": f"rating_change_{notches}_notches_below_threshold"})

    if event.type == "insider_transaction":
        result = await _safe_invalidate(
            ticker, reason="insider_transaction", priority="standard", cache=cache
        )
        return JSONResponse(result)

    if event.type == "fundamental_restatement":
        result = await _safe_invalidate(
            ticker, reason="fundamental_restatement", priority="immediate", cache=cache
        )
        return JSONResponse(result)

    # Unknown event type — acknowledge without action
    return JSONResponse({"ticker": ticker, "action": "ignored", "reason": f"unknown_type:{event.type}"})


# ---------------------------------------------------------------------------
# POST /webhooks/polygon — Polygon.io (SEC filings)
# ---------------------------------------------------------------------------

@router.post("/polygon")
async def handle_polygon_webhook(
    event: PolygonEvent,
    background_tasks: BackgroundTasks,
) -> JSONResponse:
    """Handle Polygon.io events: SEC 8-K filings."""
    cache  = get_cache()
    ticker = event.ticker.upper().strip()

    if event.type == "sec_filing" and event.filing_type == "8-K":
        result = await _safe_invalidate(
            ticker, reason="sec_8k_filing", priority="immediate", cache=cache
        )
        return JSONResponse(result)

    logger.info("webhook/polygon | %s unhandled event type=%s filing=%s",
                ticker, event.type, event.filing_type)
    return JSONResponse({"ticker": ticker, "action": "ignored",
                         "reason": f"unhandled:{event.type}/{event.filing_type}"})


# ---------------------------------------------------------------------------
# POST /webhooks/fred — Federal Reserve data releases
# ---------------------------------------------------------------------------

@router.post("/fred")
async def handle_fred_webhook(
    event: FREDEvent,
    background_tasks: BackgroundTasks,
) -> JSONResponse:
    """Handle FRED events: Fed rate announcements invalidate ALL equity reports.

    Note: In production this would query the set of cached equity tickers
    from Redis SCAN. The stub returns a count of 0 for testability.
    """
    cache = get_cache()

    if event.series_id in ("FEDFUNDS", "DFF"):
        logger.info("webhook/fred | FOMC event — broadcasting macro invalidation")
        # Production: scan quantus:report:*:current, extract tickers, invalidate all
        # Stub: return indicator that broadcast would occur
        return JSONResponse({
            "action":        "broadcast_macro_invalidation",
            "series_id":     event.series_id,
            "value":         event.value,
            "tickers_queued": 0,   # production: len(all_equity_tickers)
        })

    return JSONResponse({"action": "ignored", "reason": f"series_id {event.series_id!r} not monitored"})


# ---------------------------------------------------------------------------
# POST /webhooks/price — Internal price monitor
# ---------------------------------------------------------------------------

@router.post("/price")
async def handle_price_event(
    event: PriceEvent,
    background_tasks: BackgroundTasks,
) -> JSONResponse:
    """Receive a price tick and invalidate if the move exceeds the threshold."""
    cache  = get_cache()
    ticker = event.ticker.upper().strip()

    triggered = check_price_move_trigger(
        ticker, event.current_price, event.prev_close, event.asset_class
    )

    if triggered:
        pct = (event.current_price - event.prev_close) / event.prev_close * 100
        result = await _safe_invalidate(
            ticker,
            reason=f"price_move_{pct:.1f}pct",
            priority="immediate",
            cache=cache,
        )
        return JSONResponse({**result, "price_change_pct": round(pct, 2)})

    pct = (event.current_price - event.prev_close) / event.prev_close * 100 \
          if event.prev_close else 0.0
    return JSONResponse({
        "ticker":            ticker,
        "action":            "ignored",
        "reason":            "below_threshold",
        "price_change_pct":  round(pct, 2),
    })
