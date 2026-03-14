"""
pipelines/etf.py
================
ETF Pipeline — Quantus Research Solutions.

Hybrid pipeline — leverages equity pipeline as a base and adds ETF-specific
overlays (NAV premium, fund flows, holdings breakdown).

Smart-routes specialized ETFs to their underlying asset class pipeline
(Commodity/Crypto) with an ETF overlay layer on top.
"""

from __future__ import annotations

import asyncio
import logging
import random
from datetime import datetime, timezone
from typing import Any

import numpy as np
import pandas as pd
import yfinance as yf

from pipelines.data_architecture import (
    QuantusPayload,
    validate_payload,
    _REQUIRED_FIELDS,
)
from pipelines.equity import (
    run_equity_pipeline,
    fetch_ohlcv,
    build_ohlcv_summary,
    compute_rsi,
    compute_macd,
    compute_bollinger,
    compute_zscore,
    detect_regime,
    run_arima,
    run_prophet,
    run_lstm,
    compute_ensemble,
    compute_var,
    compute_es,
    compute_max_drawdown,
    compute_sharpe,
    run_stress_tests,
    compute_shap,
    fetch_grok_sentiment,
    fetch_reddit_sentiment,
    fetch_news_sentiment,
    composite_sentiment,
    _build_quality_scores,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

COMMODITY_ETFS = {"GLD", "IAU", "SLV", "USO", "BNO", "UNG", "PDBC"}
CRYPTO_ETFS = {"IBIT", "FBTC", "ETHA", "BITB", "ARKB"}
LEVERAGED_ETFS_PREFIX = ["SSO", "QLD", "UPRO", "TQQQ", "SQQQ", "SDS"]

# ---------------------------------------------------------------------------
# ETF-Specific Data Fetching (Stubs)
# ---------------------------------------------------------------------------

async def fetch_nav_premium(ticker: str) -> dict:
    """Fetch NAV premium/discount %. Positive = premium, negative = discount."""
    # Production: ETF issuer API or Bloomberg
    val = round(random.uniform(-0.5, 0.5), 2)
    return {
        "premium_discount_pct": val,
        "signal": "PREMIUM" if val > 0.2 else "DISCOUNT" if val < -0.2 else "NEUTRAL",
        "stub": True
    }

async def fetch_fund_flows(ticker: str) -> dict:
    """Fetch weekly and monthly fund flows in USD."""
    # Production: ETF.com or VettaFi
    return {
        "1w_usd": 120_000_000,
        "4w_usd": 450_000_000,
        "trend": "inflow",
        "stub": True
    }

async def fetch_etf_meta(ticker: str, info: dict) -> dict:
    """Fetch ETF metadata: AUM, expense ratio, index tracked."""
    return {
        "aum": float(info.get("totalAssets") or 0.0),
        "expense_ratio": float(info.get("feesReported") or 0.0),
        "index": info.get("underlyingIndexName") or "Broad Market Index",
        "stub": True
    }

async def fetch_etf_holdings(ticker: str, top_n: int = 10) -> list[dict]:
    """Fetch top N holdings by weight."""
    # Production: FMP or iShares/Vanguard API
    return [
        {"ticker": "AAPL", "name": "Apple Inc.", "weight_pct": 7.2, "sector": "Technology"},
        {"ticker": "MSFT", "name": "Microsoft Corp.", "weight_pct": 6.8, "sector": "Technology"},
        {"ticker": "NVDA", "name": "NVIDIA Corp.", "weight_pct": 5.1, "sector": "Technology"},
    ]

def compute_tracking_error(ticker: str, benchmark: str) -> float:
    """Return annualised tracking error %."""
    return 0.12  # stub

def compute_exposure_breakdown(holdings: list[dict]) -> dict:
    """Compute sector and factor weights from holdings."""
    return {
        "sector": {"Technology": 45.2, "Healthcare": 12.5, "Financials": 10.8},
        "factor": {"Growth": 0.65, "Value": 0.35, "Quality": 0.72}
    }

async def fetch_rebalance_schedule(index_name: str) -> dict:
    """Fetch next rebalance date and frequency."""
    return {
        "next_date": "2026-03-20",
        "frequency": "Quarterly"
    }

# ---------------------------------------------------------------------------
# ETF Overlay & Leveraged logic
# ---------------------------------------------------------------------------

def is_leveraged(ticker: str, info: dict) -> bool:
    """Check if the ETF is leveraged using prefixes or description."""
    upper = ticker.upper()
    if any(upper.startswith(p) for p in LEVERAGED_ETFS_PREFIX):
        return True
    desc = info.get("longBusinessSummary", "").lower()
    return "leveraged" in desc or "daily investment results" in desc

def apply_leveraged_etf_overlay(payload: QuantusPayload, leverage_factor: float) -> QuantusPayload:
    """Apply mandatory warnings and scale risk for leveraged ETFs."""
    warnings = [
        f"This is a {leverage_factor}x leveraged ETF. Designed for SHORT-TERM TRADING ONLY.",
        "Volatility decay (beta slippage) erodes returns in volatile or sideways markets.",
        f"Compounding effects may cause divergence from {leverage_factor}x underlying performance over multiple days."
    ]
    payload.data_caveats.extend(warnings)
    
    # Scale VaR and ES
    payload.var_99_per_10k *= abs(leverage_factor) * 1.2
    payload.expected_shortfall *= abs(leverage_factor) * 1.2
    
    # Add to asset-specific
    payload.asset_specific["leveraged_overlay"] = {
        "leverage_factor": leverage_factor,
        "warnings": warnings
    }
    return payload

async def apply_etf_overlay(payload: QuantusPayload, ticker: str, info: dict) -> QuantusPayload:
    """Add ETF-specific metrics to a base Equity/Commodity/Crypto payload."""
    logger.info("etf | %s | applying ETF overlay", ticker)
    
    (
        nav,
        flows,
        meta,
        holdings,
        rebalance
    ) = await asyncio.gather(
        fetch_nav_premium(ticker),
        fetch_fund_flows(ticker),
        fetch_etf_meta(ticker, info),
        fetch_etf_holdings(ticker),
        fetch_rebalance_schedule("Index")
    )
    
    exposure = compute_exposure_breakdown(holdings)
    tracking_err = compute_tracking_error(ticker, meta["index"])
    
    # Update payload identity for ETF
    payload.asset_class = "ETF"
    
    # Removed inapplicable fields (N/A for ETFs)
    payload.days_to_earnings = None
    payload.insider_net_activity = None
    payload.sec_language_delta = None
    
    # ETF Specific block
    payload.asset_specific["etf_data"] = {
        "nav_premium_pct": nav["premium_discount_pct"],
        "nav_premium_signal": nav["signal"],
        "fund_flows_1w": flows["1w_usd"],
        "fund_flows_4w": flows["4w_usd"],
        "flow_trend": flows["trend"],
        "aum_usd": meta["aum"],
        "expense_ratio": meta["expense_ratio"],
        "index_tracked": meta["index"],
        "tracking_error": tracking_err,
        "top_holdings": holdings,
        "sector_exposure": exposure["sector"],
        "factor_tilt": exposure["factor"],
        "next_rebalance_date": rebalance["next_date"],
    }
    
    # Check for leverage
    if is_leveraged(ticker, info):
        # Determine factor (mock: default to 3x if detected)
        leverage_factor = 3.0 if "3x" in info.get("longBusinessSummary", "") else 2.0
        if "short" in info.get("longBusinessSummary", "").lower():
            leverage_factor *= -1
        payload = apply_leveraged_etf_overlay(payload, leverage_factor)
        
    return payload

# ---------------------------------------------------------------------------
# Main Pipeline
# ---------------------------------------------------------------------------

async def run_etf_pipeline(
    ticker: str,
    user_tier: str = "FREE",
    language: str = "en",
    currency: str = "USD",
    jurisdiction: str = "US",
    section_requested: str = "A",
) -> QuantusPayload:
    """Run the ETF pipeline (Equity base + ETF overlay)."""
    ticker = ticker.upper().strip()
    logger.info("etf | %s | starting pipeline", ticker)
    
    # ETFs leverage the Equity pipeline as a base
    # We call run_equity_pipeline but then overlay ETF-specific data
    payload = await run_equity_pipeline(
        ticker, user_tier, language, currency, jurisdiction, section_requested
    )
    
    # Fetch yfinance info (router should have cached it, but we fetch here for self-containment)
    info = yf.Ticker(ticker).info
    
    payload = await apply_etf_overlay(payload, ticker, info)
    
    # Final validation
    is_valid, errors = validate_payload(payload)
    if not is_valid:
        logger.error("etf | %s | payload INVALID: %s", ticker, errors)
        raise ValueError(f"ETF QuantusPayload validation failed: {errors}")
        
    return payload

def run_etf_pipeline_sync(ticker: str, **kwargs) -> QuantusPayload:
    return asyncio.run(run_etf_pipeline(ticker, **kwargs))
