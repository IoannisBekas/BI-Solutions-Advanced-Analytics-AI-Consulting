"""
api/whales.py
==============
13F Whale Tracking — institutional positions, new buys, exits, % QoQ.

Endpoints:
    GET /api/v1/whales/funds                  → curated whale fund list (UNLOCKED)
    GET /api/v1/whales/holdings/{cik}         → top holdings for a fund (INSTITUTIONAL)
    GET /api/v1/whales/ticker/{ticker}        → which whales own this stock (UNLOCKED)
    GET /api/v1/whales/new-positions          → newest meaningful initiations (INSTITUTIONAL)

Data sources:
    FMP /v3/institutional-holder/{ticker}
    FMP /v3/13f/{cik}/{date}
    Local curated whale registry (CIK → display name)

The "curated whale list" is the value-add: most users don't know Berkshire's CIK
is 0001067983; this gives them a clickable directory of the funds that matter.
"""

from __future__ import annotations

import asyncio
import logging
import os
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from fastapi.responses import JSONResponse

from api._auth import SubscribedUser, require_tier

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/whales", tags=["whales"])

FMP_V3 = "https://financialmodelingprep.com/api/v3"


# Curated whale registry — CIK → (display_name, manager, style, aum_usd_b approx)
WHALES: list[dict] = [
    {"cik": "0001067983", "name": "Berkshire Hathaway", "manager": "Warren Buffett", "style": "Value", "aum_usd_b": 320},
    {"cik": "0001336528", "name": "Pershing Square", "manager": "Bill Ackman", "style": "Activist", "aum_usd_b": 18},
    {"cik": "0001037389", "name": "Renaissance Technologies", "manager": "Renaissance Technologies", "style": "Quant", "aum_usd_b": 130},
    {"cik": "0001540531", "name": "Scion Asset Management", "manager": "Michael Burry", "style": "Contrarian", "aum_usd_b": 0.4},
    {"cik": "0001061165", "name": "Tiger Global Management", "manager": "Chase Coleman", "style": "Growth", "aum_usd_b": 51},
    {"cik": "0001167483", "name": "Bridgewater Associates", "manager": "Ray Dalio", "style": "Macro", "aum_usd_b": 124},
    {"cik": "0001603466", "name": "Pelosi Disclosure", "manager": "Nancy Pelosi (PTR)", "style": "Politician", "aum_usd_b": 0.1},
    {"cik": "0000934639", "name": "Greenlight Capital", "manager": "David Einhorn", "style": "Long/Short", "aum_usd_b": 1.5},
    {"cik": "0001656456", "name": "Third Point", "manager": "Daniel Loeb", "style": "Activist", "aum_usd_b": 12},
    {"cik": "0001423053", "name": "Appaloosa Management", "manager": "David Tepper", "style": "Distressed", "aum_usd_b": 17},
    {"cik": "0001029160", "name": "Soros Fund Management", "manager": "Soros Family", "style": "Macro", "aum_usd_b": 25},
    {"cik": "0001112520", "name": "Coatue Management", "manager": "Philippe Laffont", "style": "Tech Growth", "aum_usd_b": 27},
]


async def _fetch_fmp(path: str, params: dict | None = None) -> list[dict]:
    api_key = os.environ.get("FMP_API_KEY", "").strip()
    if not api_key:
        logger.debug("whales | FMP_API_KEY not set")
        return []
    url = f"{FMP_V3}/{path}"
    params = {**(params or {}), "apikey": api_key}
    try:
        async with httpx.AsyncClient(timeout=12) as client:
            resp = await client.get(url, params=params)
            if not resp.is_success:
                logger.warning("whales | FMP %s -> %s", path, resp.status_code)
                return []
            data = resp.json()
            return data if isinstance(data, list) else []
    except Exception as exc:
        logger.warning("whales | FMP %s failed: %s", path, exc)
        return []


@router.get("/funds")
async def list_funds(
    user: SubscribedUser = Depends(require_tier("UNLOCKED")),
) -> JSONResponse:
    """Curated whale fund directory — no external call, instant."""
    return JSONResponse(
        {
            "count": len(WHALES),
            "funds": sorted(WHALES, key=lambda w: -w["aum_usd_b"]),
            "user_tier": user.tier_name,
        }
    )


@router.get("/holdings/{cik}")
async def fund_holdings(
    cik: str = Path(..., min_length=4, max_length=20),
    user: SubscribedUser = Depends(require_tier("INSTITUTIONAL")),
) -> JSONResponse:
    """Top-N holdings for the given 13F filer CIK, most recent filing."""
    cik_padded = cik.strip().zfill(10) if cik.strip().isdigit() else cik.strip()

    # FMP exposes "13f filings list" for a CIK, then we fetch the most recent.
    filings = await _fetch_fmp(f"form-thirteen-date/{cik_padded}", {})
    if not filings:
        # Try alternative form: institutional holders snapshot
        meta = next((w for w in WHALES if w["cik"].lstrip("0") == cik_padded.lstrip("0") or w["cik"] == cik_padded), None)
        return JSONResponse(
            {
                "cik": cik_padded,
                "fund": meta,
                "filing_date": None,
                "count": 0,
                "holdings": [],
                "note": "No 13F filings available — fund may not file or API quota exhausted.",
            }
        )

    latest = filings[0] if isinstance(filings[0], dict) else {}
    filing_date = latest.get("date") or latest.get("filingDate") or ""

    rows = await _fetch_fmp(f"form-thirteen/{cik_padded}", {"date": filing_date}) if filing_date else []

    holdings: list[dict] = []
    for r in rows:
        value = float(r.get("value") or 0)
        if value < 1_000_000:  # skip clutter <$1M
            continue
        holdings.append(
            {
                "ticker": (r.get("tickercusip") or r.get("ticker") or r.get("symbol") or "").upper(),
                "company": r.get("nameOfIssuer") or "",
                "value_usd": value,
                "shares": r.get("shares") or 0,
                "weight_pct": None,  # filled in below
            }
        )

    total = sum(h["value_usd"] for h in holdings) or 1
    for h in holdings:
        h["weight_pct"] = round(100 * h["value_usd"] / total, 2)

    holdings.sort(key=lambda h: h["value_usd"], reverse=True)

    meta = next((w for w in WHALES if w["cik"].lstrip("0") == cik_padded.lstrip("0") or w["cik"] == cik_padded), None)
    return JSONResponse(
        {
            "cik": cik_padded,
            "fund": meta,
            "filing_date": filing_date,
            "count": len(holdings),
            "total_aum_usd": round(total, 2),
            "holdings": holdings[:50],
            "user_tier": user.tier_name,
        }
    )


@router.get("/ticker/{ticker}")
async def whales_owning_ticker(
    ticker: str = Path(..., min_length=1, max_length=10),
    user: SubscribedUser = Depends(require_tier("UNLOCKED")),
) -> JSONResponse:
    """Institutional holders for a single ticker (FMP /v3/institutional-holder)."""
    symbol = ticker.strip().upper()
    rows = await _fetch_fmp(f"institutional-holder/{symbol}", {})
    holdings = []
    for r in rows:
        holdings.append(
            {
                "holder": r.get("holder") or "",
                "shares": r.get("shares") or 0,
                "date_reported": r.get("dateReported") or "",
                "change": r.get("change") or 0,
            }
        )

    # Cross-reference with curated whale list.
    whale_holders = []
    for h in holdings:
        for w in WHALES:
            if w["name"].lower() in h["holder"].lower() or h["holder"].lower() in w["name"].lower():
                whale_holders.append({**h, "whale": w})
                break

    holdings.sort(key=lambda h: h["shares"], reverse=True)
    return JSONResponse(
        {
            "ticker": symbol,
            "total_institutional_holders": len(holdings),
            "top_holders": holdings[:30],
            "whale_holders": whale_holders,
            "user_tier": user.tier_name,
        }
    )


@router.get("/new-positions")
async def new_positions(
    user: SubscribedUser = Depends(require_tier("INSTITUTIONAL")),
    limit: int = Query(40, ge=1, le=100),
) -> JSONResponse:
    """Newest meaningful initiations across curated whales (sequential fetches).

    NOTE: parallelism is bounded to respect FMP rate limits.
    """
    api_key = os.environ.get("FMP_API_KEY", "").strip()
    if not api_key:
        return JSONResponse(
            {"count": 0, "results": [], "note": "FMP_API_KEY not set"}
        )

    sem = asyncio.Semaphore(3)

    async def whale_latest(whale: dict) -> list[dict]:
        async with sem:
            filings = await _fetch_fmp(f"form-thirteen-date/{whale['cik']}", {})
            if not filings:
                return []
            latest = filings[0]
            filing_date = latest.get("date") or latest.get("filingDate") or ""
            if not filing_date:
                return []
            rows = await _fetch_fmp(f"form-thirteen/{whale['cik']}", {"date": filing_date})
            new_pos = []
            for r in rows:
                value = float(r.get("value") or 0)
                if value < 5_000_000:
                    continue
                # FMP marks new positions when there's no prior period match.
                # Heuristic: shares > 0 and the previous period column is missing/0.
                if (r.get("change") in (None, 0)) and (r.get("previousShare", 0) or 0) == 0:
                    new_pos.append(
                        {
                            "whale": whale["name"],
                            "manager": whale["manager"],
                            "style": whale["style"],
                            "ticker": (r.get("tickercusip") or r.get("ticker") or r.get("symbol") or "").upper(),
                            "company": r.get("nameOfIssuer") or "",
                            "value_usd": value,
                            "shares": r.get("shares") or 0,
                            "filing_date": filing_date,
                        }
                    )
            return new_pos

    nested = await asyncio.gather(*[whale_latest(w) for w in WHALES])
    flat: list[dict] = [item for sub in nested for item in sub]
    flat.sort(key=lambda x: (x["filing_date"], x["value_usd"]), reverse=True)
    return JSONResponse(
        {
            "count": min(len(flat), limit),
            "results": flat[:limit],
            "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "user_tier": user.tier_name,
        }
    )
