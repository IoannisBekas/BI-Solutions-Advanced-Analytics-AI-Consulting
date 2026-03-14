"""
api/report.py
==============
FastAPI Report Generation Endpoint — Quantus Research Solutions.

Routes:
  GET /api/v1/report/{ticker}          → full JSON report (cached or fresh)
  GET /api/v1/report/{ticker}/stream   → SSE stream of Claude chunks
  GET /api/v1/report/{ticker}/status   → cache status (HIT/MISS/GENERATING)
"""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query
from fastapi.responses import JSONResponse, StreamingResponse

from pipelines.cache import (
    MockReportCache,
    ReportCache,
    invalidate_report,
    resolve_queue_tier,
)
from pipelines.claude_engine import (
    ENGINE_VERSION,
    call_claude_collect,
    call_claude_realtime,
)
from pipelines.equity import run_equity_pipeline

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/report", tags=["reports"])

# ---------------------------------------------------------------------------
# Shared cache (override in tests / DI in production)
# ---------------------------------------------------------------------------
_cache: ReportCache = MockReportCache()


def get_cache() -> ReportCache:
    return _cache


def set_cache(c: ReportCache) -> None:
    global _cache
    _cache = c

# ---------------------------------------------------------------------------
# GET /api/v1/report/{ticker}/status
# ---------------------------------------------------------------------------

@router.get("/{ticker}/status")
async def report_status(ticker: str) -> JSONResponse:
    """Return cache status for *ticker*."""
    ticker = ticker.upper().strip()
    cache  = get_cache()
    status = cache.get_status(ticker)

    if status in ("MISS", None, ""):
        return JSONResponse({"ticker": ticker, "status": "MISS",
                             "cached": False, "report": None})

    # Map internal Redis status → user-facing label
    status_label = {
        "ready":      "HIT",
        "refreshing": "GENERATING",
        "queued":     "GENERATING",
    }.get(status.lower(), status.upper())

    meta = cache.get_metadata(ticker)
    return JSONResponse({
        "ticker":      ticker,
        "status":      status_label,
        "cached":      status_label == "HIT",
        "metadata":    meta,
    })

# ---------------------------------------------------------------------------
# GET /api/v1/report/{ticker}  — main report endpoint
# ---------------------------------------------------------------------------

@router.get("/{ticker}")
async def get_report(
    ticker: str,
    section: str = Query(default="A", description="Report section A–E"),
    user_tier: str = Query(default="FREE"),
    force_refresh: bool = Query(default=False),
) -> JSONResponse:
    """Return a validated QuantusReportSection JSON for *ticker*.

    Flow:
    1. Check Redis → HIT → return cached JSON immediately
    2. Run equity pipeline → QuantusPayload
    3. Call Claude (with one retry on invalid JSON)
    4. Validate output against QuantusReportSection schema
    5. Store in Redis (96h TTL)
    6. Return report JSON
    """
    ticker = ticker.upper().strip()
    cache  = get_cache()

    # ------------------------------------------------------------------ #
    # 1. Cache hit                                                         #
    # ------------------------------------------------------------------ #
    if not force_refresh:
        cached = cache.get_report(ticker)
        if cached:
            logger.info("report | %s | CACHE HIT", ticker)
            return JSONResponse({"cached": True, "report": cached})

    # ------------------------------------------------------------------ #
    # 2. Mark as generating                                                #
    # ------------------------------------------------------------------ #
    cache.set_status(ticker, "refreshing")

    # ------------------------------------------------------------------ #
    # 3. Run equity pipeline                                               #
    # ------------------------------------------------------------------ #
    logger.info("report | %s | running equity pipeline", ticker)
    try:
        payload = await run_equity_pipeline(ticker, user_tier=user_tier)
    except Exception as exc:
        logger.error("report | %s | pipeline failed: %s", ticker, exc)
        cache.set_status(ticker, "MISS")
        raise HTTPException(status_code=502, detail=f"Equity pipeline failed: {exc}")

    # ------------------------------------------------------------------ #
    # 4. Call Claude                                                       #
    # ------------------------------------------------------------------ #
    logger.info("report | %s | calling Claude (%s)", ticker, ENGINE_VERSION)
    try:
        report, errors = await call_claude_collect(payload, section=section)
    except Exception as exc:
        logger.error("report | %s | Claude failed: %s", ticker, exc)
        cache.set_status(ticker, "MISS")
        raise HTTPException(status_code=502, detail=f"Claude API error: {exc}")

    if errors:
        logger.error("report | %s | Claude validation errors: %s", ticker, errors)
        cache.set_status(ticker, "MISS")
        raise HTTPException(status_code=422, detail={
            "message": "Claude returned invalid JSON after retry",
            "errors":  errors,
        })

    # ------------------------------------------------------------------ #
    # 5. Store in Redis                                                    #
    # ------------------------------------------------------------------ #
    report["report_id"] = report.get("report_id") or str(uuid.uuid4())
    cache.set_report(ticker, report)
    cache.set_metadata(ticker, {
        "report_id":    report["report_id"],
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "engine":       ENGINE_VERSION,
        "section":      section,
        "ticker":       ticker,
    })
    logger.info("report | %s | cached (96h TTL)", ticker)

    # ------------------------------------------------------------------ #
    # 6. Return                                                            #
    # ------------------------------------------------------------------ #
    return JSONResponse({"cached": False, "report": report})

# ---------------------------------------------------------------------------
# GET /api/v1/report/{ticker}/stream — SSE
# ---------------------------------------------------------------------------

@router.get("/{ticker}/stream")
async def stream_report(
    ticker: str,
    section: str = Query(default="A"),
    user_tier: str = Query(default="FREE"),
) -> StreamingResponse:
    """Stream Claude chunks as Server-Sent Events.

    Each event: ``data: {"chunk": "<text>"}\\n\\n``
    Final event: ``data: {"done": true, "report_id": "<id>"}\\n\\n``
    """
    ticker = ticker.upper().strip()

    async def event_generator() -> AsyncGenerator[str, None]:
        try:
            payload = await run_equity_pipeline(ticker, user_tier=user_tier)
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"
            return

        report_id  = str(uuid.uuid4())
        full_text  = []

        try:
            async for chunk in call_claude_realtime(payload, section=section):
                full_text.append(chunk)
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"
            return

        yield f"data: {json.dumps({'done': True, 'report_id': report_id})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache",
                                      "X-Accel-Buffering": "no"})
