"""
api/insider.py
===============
Insider Trades feed — Form 4 transactions clustered, ranked by signal value.

Data source: Financial Modeling Prep /v4/insider-trading.

Endpoints:
    GET /api/v1/insider/feed?limit=50              → cross-ticker feed (INSTITUTIONAL)
    GET /api/v1/insider/ticker/{ticker}?limit=30   → per-ticker history (UNLOCKED)
    GET /api/v1/insider/cluster?days=30            → "Cluster Buying" alerts (INSTITUTIONAL)

Filings are normalized into a uniform card shape:
    {
        ticker, company, name, title, txn_type, txn_date,
        shares, price, value_usd, post_holdings, source_url,
        sentiment ("bullish"|"bearish"|"neutral")
    }
"""

from __future__ import annotations

import asyncio
import logging
import os
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from fastapi.responses import JSONResponse

from api._auth import SubscribedUser, require_tier

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/insider", tags=["insider"])

FMP_BASE = "https://financialmodelingprep.com/api/v4"

# FMP transactionType values that imply a directional view.
_BULLISH = {"P-Purchase", "P", "A-Award", "A", "G-Gift"}
_BEARISH = {"S-Sale", "S", "D-Return", "F-InKind"}


def _classify(transaction_type: str | None) -> str:
    if not transaction_type:
        return "neutral"
    if transaction_type in _BULLISH:
        return "bullish"
    if transaction_type in _BEARISH:
        return "bearish"
    return "neutral"


def _normalize(raw: dict) -> dict:
    """Map raw FMP insider-trading payload → uniform card."""
    shares = raw.get("securitiesTransacted") or 0
    price = raw.get("price") or 0.0
    value = float(shares) * float(price) if shares and price else None
    return {
        "ticker": (raw.get("symbol") or "").upper(),
        "company": raw.get("companyName") or "",
        "name": raw.get("reportingName") or "",
        "title": raw.get("typeOfOwner") or "",
        "txn_type": raw.get("transactionType") or "",
        "txn_type_label": (raw.get("acquistionOrDisposition") or "").upper() or None,
        "txn_date": raw.get("transactionDate") or raw.get("filingDate") or "",
        "filing_date": raw.get("filingDate") or "",
        "shares": int(shares) if shares else 0,
        "price": float(price) if price else None,
        "value_usd": round(value, 2) if value else None,
        "post_holdings": raw.get("securitiesOwned") or 0,
        "source_url": raw.get("link") or "",
        "sentiment": _classify(raw.get("transactionType")),
    }


async def _fetch_fmp(path: str, params: dict[str, str | int]) -> list[dict]:
    api_key = os.environ.get("FMP_API_KEY", "").strip()
    if not api_key:
        logger.debug("insider | FMP_API_KEY not set")
        return []
    params = {**params, "apikey": api_key}
    url = f"{FMP_BASE}/{path}"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url, params=params)
            if not resp.is_success:
                logger.warning("insider | FMP %s -> %s", path, resp.status_code)
                return []
            data = resp.json()
            return data if isinstance(data, list) else []
    except Exception as exc:
        logger.warning("insider | FMP %s failed: %s", path, exc)
        return []


@router.get("/feed")
async def feed(
    limit: int = Query(50, ge=1, le=200),
    user: SubscribedUser = Depends(require_tier("INSTITUTIONAL")),
) -> JSONResponse:
    """Cross-ticker insider feed, newest first, $-value-weighted."""
    rows = await _fetch_fmp("insider-trading", {"page": 0})
    cards = [_normalize(r) for r in rows]
    # Keep only the meaningful trades (>$10k) and sort by value desc.
    cards = [c for c in cards if (c.get("value_usd") or 0) > 10_000]
    cards.sort(key=lambda c: c.get("value_usd") or 0, reverse=True)
    return JSONResponse(
        {
            "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "count": min(len(cards), limit),
            "results": cards[:limit],
            "user_tier": user.tier_name,
        }
    )


@router.get("/ticker/{ticker}")
async def ticker_history(
    ticker: str = Path(..., min_length=1, max_length=10),
    limit: int = Query(30, ge=1, le=100),
    user: SubscribedUser = Depends(require_tier("UNLOCKED")),
) -> JSONResponse:
    symbol = ticker.strip().upper()
    rows = await _fetch_fmp("insider-trading", {"symbol": symbol, "page": 0})
    cards = [_normalize(r) for r in rows]
    cards.sort(key=lambda c: c.get("filing_date") or "", reverse=True)

    # Cluster summary: did >=3 distinct insiders buy in the last 90d?
    cutoff = (datetime.now(timezone.utc) - timedelta(days=90)).date().isoformat()
    recent_bulls = {
        c["name"] for c in cards if c["sentiment"] == "bullish" and c["filing_date"] >= cutoff
    }
    recent_bears = {
        c["name"] for c in cards if c["sentiment"] == "bearish" and c["filing_date"] >= cutoff
    }
    cluster_state = (
        "CLUSTER_BUYING"
        if len(recent_bulls) >= 3 and len(recent_bulls) > len(recent_bears)
        else "CLUSTER_SELLING"
        if len(recent_bears) >= 3 and len(recent_bears) > len(recent_bulls)
        else "NEUTRAL"
    )

    return JSONResponse(
        {
            "ticker": symbol,
            "count": min(len(cards), limit),
            "results": cards[:limit],
            "cluster_state": cluster_state,
            "insiders_buying_90d": len(recent_bulls),
            "insiders_selling_90d": len(recent_bears),
            "user_tier": user.tier_name,
        }
    )


@router.get("/cluster")
async def cluster_buying(
    days: int = Query(30, ge=7, le=180),
    min_insiders: int = Query(3, ge=2, le=10),
    user: SubscribedUser = Depends(require_tier("INSTITUTIONAL")),
) -> JSONResponse:
    """Tickers with multi-insider buying clusters in the recent window."""
    rows = await _fetch_fmp("insider-trading", {"page": 0})
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).date().isoformat()

    by_ticker: dict[str, dict] = {}
    for raw in rows:
        card = _normalize(raw)
        if card["sentiment"] != "bullish":
            continue
        if (card["filing_date"] or "") < cutoff:
            continue
        bucket = by_ticker.setdefault(
            card["ticker"],
            {
                "ticker": card["ticker"],
                "company": card["company"],
                "insiders": set(),
                "total_value_usd": 0.0,
                "first_date": card["filing_date"],
                "last_date": card["filing_date"],
            },
        )
        bucket["insiders"].add(card["name"])
        bucket["total_value_usd"] += float(card.get("value_usd") or 0)
        if card["filing_date"] < bucket["first_date"]:
            bucket["first_date"] = card["filing_date"]
        if card["filing_date"] > bucket["last_date"]:
            bucket["last_date"] = card["filing_date"]

    clusters = []
    for bucket in by_ticker.values():
        if len(bucket["insiders"]) < min_insiders:
            continue
        clusters.append(
            {
                "ticker": bucket["ticker"],
                "company": bucket["company"],
                "insider_count": len(bucket["insiders"]),
                "insider_names": sorted(bucket["insiders"]),
                "total_value_usd": round(bucket["total_value_usd"], 2),
                "first_date": bucket["first_date"],
                "last_date": bucket["last_date"],
            }
        )
    clusters.sort(key=lambda c: c["total_value_usd"], reverse=True)

    return JSONResponse(
        {
            "window_days": days,
            "min_insiders": min_insiders,
            "count": len(clusters),
            "results": clusters[:50],
            "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "user_tier": user.tier_name,
        }
    )


# Avoid unused import warning when running with --strict
_ = asyncio
