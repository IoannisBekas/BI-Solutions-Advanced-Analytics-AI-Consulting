"""
api/earnings.py
================
Earnings Calendar + AI Preview.

Endpoints:
    GET /api/v1/earnings/calendar?days=7    → upcoming earnings (UNLOCKED)
    GET /api/v1/earnings/preview/{ticker}   → AI "what to watch" preview (INSTITUTIONAL)
    GET /api/v1/earnings/recap/{ticker}     → post-earnings AI recap (INSTITUTIONAL)

Data sources:
    FMP /v3/earning_calendar              (calendar)
    cached QuantusPayload                 (context for the preview)
    Anthropic Claude / Gemini             (narrative generation)
"""

from __future__ import annotations

import asyncio
import logging
import os
from datetime import date, datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from fastapi.responses import JSONResponse

from api._auth import SubscribedUser, require_tier
from pipelines.runtime_state import get_shared_ticker_index

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/earnings", tags=["earnings"])

FMP_V3 = "https://financialmodelingprep.com/api/v3"


def _normalize_calendar_entry(raw: dict) -> dict:
    return {
        "ticker": (raw.get("symbol") or "").upper(),
        "date": raw.get("date") or "",
        "time": (raw.get("time") or "").lower(),  # bmo|amc|""
        "eps_estimate": raw.get("epsEstimated"),
        "eps_actual": raw.get("eps"),
        "revenue_estimate": raw.get("revenueEstimated"),
        "revenue_actual": raw.get("revenue"),
        "fiscal_period": raw.get("fiscalDateEnding") or "",
        "updated_at": raw.get("updatedFromDate") or "",
    }


async def _fmp_calendar(from_date: date, to_date: date) -> list[dict]:
    api_key = os.environ.get("FMP_API_KEY", "").strip()
    if not api_key:
        return []
    url = f"{FMP_V3}/earning_calendar"
    params = {"from": from_date.isoformat(), "to": to_date.isoformat(), "apikey": api_key}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(url, params=params)
            if not resp.is_success:
                logger.warning("earnings | FMP calendar -> %s", resp.status_code)
                return []
            data = resp.json()
            return data if isinstance(data, list) else []
    except Exception as exc:
        logger.warning("earnings | FMP calendar failed: %s", exc)
        return []


def _enrich_with_signal(entry: dict, index) -> dict:
    report = index.get_report(entry["ticker"])
    if not report:
        return {**entry, "has_coverage": False}
    return {
        **entry,
        "has_coverage": True,
        "overall_signal": report.get("overall_signal", "NEUTRAL"),
        "confidence_score": report.get("confidence_score", 0),
        "regime_label": (report.get("regime") or {}).get("label", "UNKNOWN"),
        "sector": report.get("sector", ""),
    }


@router.get("/calendar")
async def calendar(
    days: int = Query(7, ge=1, le=30),
    sector: str | None = Query(None),
    user: SubscribedUser = Depends(require_tier("UNLOCKED")),
) -> JSONResponse:
    today = datetime.now(timezone.utc).date()
    to_date = today + timedelta(days=days)
    rows = await _fmp_calendar(today, to_date)
    index = get_shared_ticker_index()

    cards = [_enrich_with_signal(_normalize_calendar_entry(r), index) for r in rows]
    cards = [c for c in cards if c["ticker"]]

    if sector:
        sector_up = sector.strip().upper()
        cards = [
            c
            for c in cards
            if c.get("sector") and sector_up in (c["sector"] or "").upper()
        ]

    cards.sort(key=lambda c: (c["date"], -(c.get("confidence_score") or 0)))

    # Group by date
    buckets: dict[str, list[dict]] = {}
    for c in cards:
        buckets.setdefault(c["date"], []).append(c)

    return JSONResponse(
        {
            "from": today.isoformat(),
            "to": to_date.isoformat(),
            "days": days,
            "count": len(cards),
            "buckets": [
                {"date": d, "entries": entries}
                for d, entries in sorted(buckets.items())
            ],
            "user_tier": user.tier_name,
        }
    )


# ---------------------------------------------------------------------------
# AI preview / recap — uses existing LLM provider
# ---------------------------------------------------------------------------


def _build_preview_context(ticker: str, report: dict | None) -> str:
    if not report:
        return (
            f"Ticker: {ticker}. No cached Quantus payload available — provide a "
            "generic earnings-preview framework asking about guidance, margins, "
            "and macro sensitivity."
        )

    regime = (report.get("regime") or {}).get("label", "UNKNOWN")
    signal = report.get("overall_signal", "NEUTRAL")
    confidence = report.get("confidence_score", 0)
    sector = report.get("sector", "")
    insight = report.get("early_insight", "")
    metrics = report.get("key_metrics") or []
    metric_lines = "\n".join(
        f"- {m.get('label')}: {m.get('value')} ({m.get('note', '')})" for m in metrics[:5]
    )
    return (
        f"Ticker: {ticker} ({sector})\n"
        f"Regime: {regime}\n"
        f"Current Quantus signal: {signal} @ {confidence}% confidence\n"
        f"Early insight: {insight}\n"
        f"Key metrics:\n{metric_lines}\n"
    )


_SYSTEM_PROMPT = (
    "You are Quantus Engine Meridian v2.4 — a quantitative trading analyst. "
    "Generate concise institutional research narrative. No code, no tables. "
    "House style: zero filler, lead with the metric, every sentence earns its place."
)


async def _llm_preview(ticker: str, context: str, mode: str) -> str:
    """mode = 'preview' (pre-earnings) or 'recap' (post-earnings)."""
    if mode == "recap":
        user_prompt = (
            f"Post-earnings recap for {ticker}.\nContext:\n{context}\n\n"
            "Produce 3 paragraphs:\n"
            "  1) Headline read — did the print confirm, contradict, or muddy the prior signal?\n"
            "  2) Reaction read — what does the implied move tell us about positioning?\n"
            "  3) So what — does Quantus tighten, hold, or flip its signal? End with one explicit verdict."
        )
    else:
        user_prompt = (
            f"Pre-earnings preview for {ticker}.\nContext:\n{context}\n\n"
            "Produce 3 paragraphs:\n"
            "  1) What to watch — the 2-3 specific metrics that will move the print.\n"
            "  2) Setup risk — positioning, options-implied move, and what's priced in.\n"
            "  3) Quantus stance — current signal and what would force a re-rating."
        )

    # Prefer Anthropic; fall back to Gemini; finally to canned text.
    anthropic_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if anthropic_key:
        try:
            import anthropic  # type: ignore

            client = anthropic.AsyncAnthropic(api_key=anthropic_key)
            msg = await client.messages.create(
                model=os.environ.get("ANTHROPIC_MODEL", "claude-haiku-4-5"),
                max_tokens=700,
                system=_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_prompt}],
            )
            text = "".join(
                block.text for block in msg.content if getattr(block, "type", "") == "text"
            ).strip()
            if text:
                return text
        except Exception as exc:
            logger.warning("earnings preview | anthropic failed for %s: %s", ticker, exc)

    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if gemini_key:
        try:
            from google import genai  # type: ignore

            client = genai.Client(api_key=gemini_key)
            resp = await asyncio.to_thread(
                client.models.generate_content,
                model=os.environ.get("GEMINI_MODEL", "gemini-2.5-flash"),
                contents=f"{_SYSTEM_PROMPT}\n\n{user_prompt}",
            )
            text = (getattr(resp, "text", "") or "").strip()
            if text:
                return text
        except Exception as exc:
            logger.warning("earnings preview | gemini failed for %s: %s", ticker, exc)

    return _fallback_preview(ticker, mode)


def _fallback_preview(ticker: str, mode: str) -> str:
    if mode == "recap":
        return (
            f"{ticker} earnings recap unavailable — narrative generation offline. "
            "Check the per-ticker Quantus report for the latest signal."
        )
    return (
        f"{ticker} pre-earnings preview unavailable — narrative generation offline. "
        "Refer to the per-ticker Quantus report for the active signal and risk framing."
    )


@router.get("/preview/{ticker}")
async def preview(
    ticker: str = Path(..., min_length=1, max_length=10),
    user: SubscribedUser = Depends(require_tier("INSTITUTIONAL")),
) -> JSONResponse:
    symbol = ticker.strip().upper()
    index = get_shared_ticker_index()
    report = index.get_report(symbol)
    context = _build_preview_context(symbol, report)
    narrative = await _llm_preview(symbol, context, "preview")
    return JSONResponse(
        {
            "ticker": symbol,
            "mode": "preview",
            "narrative": narrative,
            "has_coverage": bool(report),
            "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "user_tier": user.tier_name,
        }
    )


@router.get("/recap/{ticker}")
async def recap(
    ticker: str = Path(..., min_length=1, max_length=10),
    user: SubscribedUser = Depends(require_tier("INSTITUTIONAL")),
) -> JSONResponse:
    symbol = ticker.strip().upper()
    index = get_shared_ticker_index()
    report = index.get_report(symbol)
    context = _build_preview_context(symbol, report)
    narrative = await _llm_preview(symbol, context, "recap")
    return JSONResponse(
        {
            "ticker": symbol,
            "mode": "recap",
            "narrative": narrative,
            "has_coverage": bool(report),
            "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "user_tier": user.tier_name,
        }
    )


_ = asyncio  # keep async import flagged
