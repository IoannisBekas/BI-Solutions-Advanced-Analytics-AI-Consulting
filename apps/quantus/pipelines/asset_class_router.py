"""
pipelines/asset_class_router.py
================================
Step 0 of the Quantus Research report pipeline.

Classifies a ticker as EQUITY | CRYPTO | COMMODITY | ETF via yfinance quoteType,
then emits a fully populated AssetContext that downstream pipeline modules
and the Claude narrative layer consume.

Performance contract: <100 ms per call (yfinance info is cached 24 h in Redis
in production; the raw call is made here only when the cache misses).
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Literal

import yfinance as yf

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Types
# ---------------------------------------------------------------------------
AssetClass = Literal["EQUITY", "CRYPTO", "COMMODITY", "ETF"]

# ---------------------------------------------------------------------------
# Static lookup tables (per skill spec §3, §4, §5)
# ---------------------------------------------------------------------------

PIPELINE_MAP: dict[str, str] = {
    "EQUITY":    "pipelines.equity",
    "CRYPTO":    "pipelines.crypto",
    "COMMODITY": "pipelines.commodity",
    "ETF":       "pipelines.etf",
}

REGIME_PARAMS: dict[str, dict] = {
    "EQUITY": {
        "strong_uptrend_threshold": 0.15,   # 15 % 30-day gain
        "high_vol_threshold": 0.30,          # 30 % annualised vol
        "downtrend_drawdown": 0.15,
    },
    "CRYPTO": {
        "strong_uptrend_threshold": 0.40,   # 40 % 30-day gain
        "high_vol_threshold": 0.80,          # 80 % annualised vol
        "downtrend_drawdown": 0.30,
        "position_size_reduction": 0.50,     # always reduce 40–60 % vs equity
        "market_hours": "24/7",
    },
    "COMMODITY": {
        "strong_uptrend_threshold": 0.10,
        "high_vol_threshold": 0.25,
        "seasonality_aware": True,
    },
    "ETF": {
        # Inherited from underlying — refined dynamically at pipeline layer
        "track_nav_premium": True,
    },
}

# Active data sources per asset class
_DATA_SOURCES: dict[str, dict[str, list[str]]] = {
    "EQUITY": {
        "active":  ["price_history", "fundamentals", "earnings", "sec_filings",
                    "analyst_ratings", "insider_transactions", "options_chain"],
        "removed": ["on_chain_metrics", "futures_basis", "nav_premium"],
    },
    "CRYPTO": {
        "active":  ["price_history", "on_chain_metrics", "funding_rates",
                    "exchange_flows", "dominance_data"],
        "removed": ["sec_filings", "earnings", "analyst_ratings",
                    "insider_transactions", "nav_premium"],
    },
    "COMMODITY": {
        "active":  ["price_history", "futures_basis", "cot_report",
                    "seasonality", "inventory_data"],
        "removed": ["sec_filings", "earnings", "insider_transactions",
                    "on_chain_metrics", "nav_premium"],
    },
    "ETF": {
        "active":  ["price_history", "nav_premium", "holdings", "flows",
                    "analyst_ratings"],
        "removed": ["on_chain_metrics", "sec_filings", "earnings",
                    "insider_transactions", "futures_basis"],
    },
}

DISCLAIMER_MAP: dict[str, str] = {
    "EQUITY":    "US_EQUITY",
    "CRYPTO":    "CRYPTO_US",
    "COMMODITY": "COMMODITY",
    "ETF":       "US_EQUITY",   # ETF uses equity disclaimer by default
}

# ---------------------------------------------------------------------------
# ETF hybrid routing sets (skill spec §6)
# ---------------------------------------------------------------------------
COMMODITY_ETFs: frozenset[str] = frozenset({"GLD", "SLV", "USO", "IAU", "PDBC"})
CRYPTO_ETFs: frozenset[str]    = frozenset({"IBIT", "FBTC", "ETHA", "BITB", "ARKB"})

# ---------------------------------------------------------------------------
# yfinance quoteType → internal AssetClass mapping
# ---------------------------------------------------------------------------
_QUOTE_TYPE_MAP: dict[str, AssetClass] = {
    "EQUITY":         "EQUITY",
    "CRYPTOCURRENCY": "CRYPTO",
    "ETF":            "ETF",
    "MUTUALFUND":     "ETF",    # simplified per skill spec §1
    "FUTURE":         "COMMODITY",
    "INDEX":          "EQUITY", # broad-market indices treated as EQUITY
}

# ---------------------------------------------------------------------------
# AssetContext — the return contract (skill spec §2)
# ---------------------------------------------------------------------------

@dataclass
class AssetContext:
    """Complete classification context emitted by the asset class router."""

    asset_class: AssetClass
    canonical_ticker: str
    display_name: str
    exchange: str
    currency: str
    pipeline_id: str
    disclaimer_variant: str
    data_sources_active: list[str]
    data_sources_removed: list[str]
    regime_model_params: dict
    unknown_fallback: bool = False


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _fetch_yf_info(ticker: str) -> dict:
    """Return the yfinance .info dict for *ticker*.

    Raises ``ValueError`` if the ticker is unrecognised (empty info dict or
    missing ``quoteType``).

    In production this call goes through a Redis cache layer (TTL = 24 h).
    """
    info: dict = yf.Ticker(ticker).info
    if not info or "quoteType" not in info:
        raise ValueError(f"yfinance returned no usable data for ticker '{ticker}'")
    return info


def detect_etf_underlying(ticker: str) -> str | None:
    """Return ``'COMMODITY'`` or ``'CRYPTO'`` for hybrid ETFs; ``None`` otherwise."""
    upper = ticker.upper()
    if upper in COMMODITY_ETFs:
        return "COMMODITY"
    if upper in CRYPTO_ETFs:
        return "CRYPTO"
    return None


# ---------------------------------------------------------------------------
# Classification entry point
# ---------------------------------------------------------------------------

def classify_asset(ticker: str) -> tuple[AssetClass, dict, bool]:
    """Classify *ticker* using yfinance quoteType.

    Returns ``(asset_class, yf_info, unknown_fallback)``.

    Priority (per skill spec §1):
    1. yfinance ``quoteType`` field
    2. Fallback → EQUITY with ``unknown_fallback=True``
    """
    try:
        info = _fetch_yf_info(ticker)
        quote_type: str = info.get("quoteType", "").upper()
        asset_class = _QUOTE_TYPE_MAP.get(quote_type)

        if asset_class is None:
            logger.warning(
                "classify_asset | ticker=%s quoteType='%s' — unrecognised, "
                "defaulting to EQUITY (unknown_fallback=True)",
                ticker, quote_type,
            )
            return "EQUITY", info, True

        logger.info(
            "classify_asset | ticker=%s quoteType='%s' → %s",
            ticker, quote_type, asset_class,
        )
        return asset_class, info, False

    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "classify_asset | ticker=%s raised %s — defaulting to EQUITY "
            "(unknown_fallback=True)",
            ticker, exc,
        )
        return "EQUITY", {}, True


# ---------------------------------------------------------------------------
# Pipeline routing
# ---------------------------------------------------------------------------

def _resolve_pipeline(asset_class: AssetClass, ticker: str) -> tuple[str, AssetClass]:
    """Return ``(pipeline_id, effective_asset_class)`` after ETF hybrid check."""
    if asset_class != "ETF":
        return PIPELINE_MAP[asset_class], asset_class

    underlying = detect_etf_underlying(ticker)
    if underlying == "COMMODITY":
        logger.info(
            "route | %s classified as commodity ETF → pipelines.commodity + etf_overlay",
            ticker,
        )
        return PIPELINE_MAP["COMMODITY"], "ETF"
    if underlying == "CRYPTO":
        logger.info(
            "route | %s classified as crypto ETF → pipelines.crypto + etf_overlay",
            ticker,
        )
        return PIPELINE_MAP["CRYPTO"], "ETF"

    return PIPELINE_MAP["ETF"], "ETF"


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def route(ticker: str) -> AssetContext:
    """Classify *ticker* and return a fully populated :class:`AssetContext`.

    This is the single public entry point consumed by the report orchestrator.
    Call ``route(ticker)`` before any data-fetch or Claude invocation.

    Args:
        ticker: Raw ticker symbol (e.g. ``"TSLA"``, ``"BTC-USD"``, ``"GC=F"``).

    Returns:
        :class:`AssetContext` with all fields set according to the skill spec.
    """
    canonical_ticker = ticker.upper().strip()

    asset_class, info, unknown_fallback = classify_asset(canonical_ticker)

    pipeline_id, effective_class = _resolve_pipeline(asset_class, canonical_ticker)

    # Metadata from yfinance (graceful defaults when info is empty)
    display_name = (
        info.get("longName")
        or info.get("shortName")
        or canonical_ticker
    )
    exchange  = info.get("exchange") or info.get("fullExchangeName") or "UNKNOWN"
    currency  = info.get("currency") or "USD"

    # Disclaimer: crypto ETFs inherit CRYPTO disclaimer; commodity ETFs → COMMODITY
    if asset_class == "ETF":
        underlying = detect_etf_underlying(canonical_ticker)
        if underlying:
            disclaimer = DISCLAIMER_MAP[underlying]
        else:
            disclaimer = DISCLAIMER_MAP["ETF"]
    else:
        disclaimer = DISCLAIMER_MAP[asset_class]

    sources = _DATA_SOURCES[asset_class]

    ctx = AssetContext(
        asset_class=asset_class,
        canonical_ticker=canonical_ticker,
        display_name=display_name,
        exchange=exchange,
        currency=currency,
        pipeline_id=pipeline_id,
        disclaimer_variant=disclaimer,
        data_sources_active=list(sources["active"]),
        data_sources_removed=list(sources["removed"]),
        regime_model_params=dict(REGIME_PARAMS[asset_class]),
        unknown_fallback=unknown_fallback,
    )

    # Audit log — every classification decision is recorded
    logger.info(
        "route | ticker=%s → class=%s pipeline=%s fallback=%s",
        canonical_ticker, ctx.asset_class, ctx.pipeline_id, ctx.unknown_fallback,
    )

    return ctx
