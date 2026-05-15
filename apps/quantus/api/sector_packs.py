"""
api/sector_packs.py
====================
Sector Packs API — institutional weekly digests.

Endpoints:
    GET    /api/v1/sector-packs/catalog           → list all sectors + ticker counts (FREE preview)
    GET    /api/v1/sector-packs/subscriptions     → user's subscribed sectors (UNLOCKED+)
    POST   /api/v1/sector-packs/subscriptions     → set subscriptions (INSTITUTIONAL)
    DELETE /api/v1/sector-packs/subscriptions/{s} → unsubscribe (INSTITUTIONAL)
    GET    /api/v1/sector-packs/{sector}/digest   → latest top-20 digest (INSTITUTIONAL)

All ticker rankings come from the existing cached report index, so this
adds ZERO new external API calls.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Path
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from api._auth import (
    SubscribedUser,
    Tier,
    current_user,
    require_tier,
)
from pipelines.runtime_state import get_shared_ticker_index
from services.subscription_store import (
    list_subscriptions,
    remove_subscription,
    set_subscriptions,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/sector-packs", tags=["sector-packs"])

# Canonical list — broad GICS-style buckets.
SECTORS: list[str] = [
    "Technology",
    "Healthcare",
    "Financials",
    "Energy",
    "Consumer Discretionary",
    "Consumer Staples",
    "Industrials",
    "Materials",
    "Utilities",
    "Real Estate",
    "Communications",
]

# Synonym fuzzy match — handles sector strings from different data providers.
_SECTOR_ALIASES: dict[str, str] = {
    "TECH": "Technology",
    "INFORMATION TECHNOLOGY": "Technology",
    "HEALTH": "Healthcare",
    "HEALTH CARE": "Healthcare",
    "FINANCE": "Financials",
    "FINANCIAL SERVICES": "Financials",
    "CONSUMER": "Consumer Discretionary",
    "CONSUMER DISCRETIONARY": "Consumer Discretionary",
    "CONSUMER STAPLES": "Consumer Staples",
    "STAPLES": "Consumer Staples",
    "OIL": "Energy",
    "OIL & GAS": "Energy",
    "INDUSTRIAL": "Industrials",
    "MATERIAL": "Materials",
    "BASIC MATERIALS": "Materials",
    "UTILITY": "Utilities",
    "REIT": "Real Estate",
    "REAL ESTATE": "Real Estate",
    "COMMUNICATION SERVICES": "Communications",
    "TELECOM": "Communications",
    "MEDIA": "Communications",
}


def _canonical_sector(raw: str | None) -> str | None:
    if not raw:
        return None
    up = raw.strip().upper()
    if not up:
        return None
    for s in SECTORS:
        if up == s.upper():
            return s
    for alias, target in _SECTOR_ALIASES.items():
        if alias in up:
            return target
    return None


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------


class SubscriptionRequest(BaseModel):
    sectors: list[str] = Field(min_length=0, max_length=len(SECTORS))


# ---------------------------------------------------------------------------
# Catalog (public preview)
# ---------------------------------------------------------------------------


@router.get("/catalog")
async def sector_catalog(user: SubscribedUser = Depends(current_user)) -> JSONResponse:
    """List every sector with ticker counts + top-3 preview tickers.

    Free preview: anyone can see what the packs contain. They just can't
    download the full digest unless they're INSTITUTIONAL.
    """
    index = get_shared_ticker_index()
    by_sector: dict[str, list[dict]] = {s: [] for s in SECTORS}

    for ticker in index.all_tickers():
        report = index.get_report(ticker)
        if not report:
            continue
        sector = _canonical_sector(report.get("sector"))
        if not sector:
            continue
        by_sector.setdefault(sector, []).append(
            {
                "ticker": ticker,
                "company_name": report.get("company_name", ticker),
                "overall_signal": report.get("overall_signal", "NEUTRAL"),
                "confidence_score": report.get("confidence_score", 0),
            }
        )

    # Sort each sector bucket by confidence desc.
    for sector, items in by_sector.items():
        items.sort(key=lambda r: r["confidence_score"], reverse=True)

    user_subs = (
        set(list_subscriptions("sector", user.user_id))
        if user.tier >= Tier.UNLOCKED
        else set()
    )

    catalog = [
        {
            "sector": sector,
            "ticker_count": len(items),
            "top_preview": items[:3],
            "subscribed": sector.upper() in user_subs,
        }
        for sector, items in by_sector.items()
    ]
    catalog.sort(key=lambda c: c["ticker_count"], reverse=True)

    return JSONResponse(
        {
            "sectors": catalog,
            "user_tier": user.tier_name,
            "required_tier_for_digest": "INSTITUTIONAL",
        }
    )


# ---------------------------------------------------------------------------
# Subscriptions (UNLOCKED can save; INSTITUTIONAL to receive digests)
# ---------------------------------------------------------------------------


@router.get("/subscriptions")
async def get_subscriptions(
    user: SubscribedUser = Depends(require_tier("UNLOCKED")),
) -> JSONResponse:
    return JSONResponse(
        {
            "user_id": user.user_id,
            "tier": user.tier_name,
            "sectors": list_subscriptions("sector", user.user_id),
        }
    )


@router.post("/subscriptions")
async def replace_subscriptions(
    req: SubscriptionRequest,
    user: SubscribedUser = Depends(require_tier("INSTITUTIONAL")),
) -> JSONResponse:
    cleaned: list[str] = []
    invalid: list[str] = []
    for s in req.sectors:
        canon = _canonical_sector(s)
        if canon:
            cleaned.append(canon)
        else:
            invalid.append(s)
    if invalid:
        raise HTTPException(
            status_code=400,
            detail={"message": "Unknown sectors", "invalid": invalid, "valid": SECTORS},
        )
    saved = set_subscriptions("sector", user.user_id, cleaned)
    return JSONResponse({"sectors": saved})


@router.delete("/subscriptions/{sector}")
async def delete_subscription(
    sector: str = Path(...),
    user: SubscribedUser = Depends(require_tier("INSTITUTIONAL")),
) -> JSONResponse:
    canon = _canonical_sector(sector)
    if not canon:
        raise HTTPException(status_code=404, detail={"message": f"Unknown sector: {sector}"})
    saved = remove_subscription("sector", user.user_id, canon)
    return JSONResponse({"sectors": saved})


# ---------------------------------------------------------------------------
# Digest (institutional gated)
# ---------------------------------------------------------------------------


@router.get("/{sector}/digest")
async def sector_digest(
    sector: str = Path(...),
    limit: int = 20,
    user: SubscribedUser = Depends(require_tier("INSTITUTIONAL")),
) -> JSONResponse:
    """Top-N tickers in the sector ranked by confidence, with the same
    Skim-Summary payload the workspace already renders.
    """
    canon = _canonical_sector(sector)
    if not canon:
        raise HTTPException(
            status_code=404,
            detail={"message": f"Unknown sector: {sector}", "valid": SECTORS},
        )

    index = get_shared_ticker_index()
    cards: list[dict] = []
    for ticker in index.all_tickers():
        report = index.get_report(ticker)
        if not report:
            continue
        if _canonical_sector(report.get("sector")) != canon:
            continue
        regime = report.get("regime", {}) or {}
        cards.append(
            {
                "ticker": ticker,
                "company_name": report.get("company_name", ticker),
                "overall_signal": report.get("overall_signal", "NEUTRAL"),
                "confidence_score": report.get("confidence_score", 0),
                "regime_label": regime.get("label", "UNKNOWN"),
                "regime_implication": regime.get("implication", ""),
                "early_insight": report.get("early_insight", ""),
                "key_metrics": (report.get("key_metrics") or [])[:3],
                "report_id": report.get("report_id", ""),
                "asset_class": report.get("asset_class", "EQUITY"),
                "report_url": f"/api/v1/report/{ticker}",
            }
        )

    cards.sort(key=lambda r: r["confidence_score"], reverse=True)
    top = cards[: max(1, min(limit, 50))]

    return JSONResponse(
        {
            "sector": canon,
            "user_id": user.user_id,
            "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "ticker_count": len(cards),
            "top_count": len(top),
            "results": top,
        }
    )
