"""
pipelines/commodity.py
=======================
Commodity Asset Pipeline — Quantus Research Solutions.

Removes all equity-specific and crypto-specific data:
  No earnings, analyst consensus, 13F, insider, short interest, Kelly,
  knowledge graph, or on-chain data.

Commodity-specific additions:
  - COT report (mock CFTC weekly: commercial vs non-commercial net positioning,
    divergence signal)
  - Futures term structure (contango/backwardation detection, roll yield)
  - Macro context (real yield from FRED TIPS, DXY level)
  - Seasonal pattern overlay
  - EIA supply data mock (oil/natgas)
"""

from __future__ import annotations

import asyncio
import logging
import math
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
    build_ohlcv_summary,
    compute_bollinger,
    compute_ensemble,
    compute_es,
    compute_macd,
    compute_max_drawdown,
    compute_rsi,
    compute_sharpe,
    compute_var,
    compute_zscore,
    composite_sentiment,
    detect_regime,
    fetch_grok_sentiment,
    fetch_news_sentiment,
    fetch_ohlcv,
    fetch_reddit_sentiment,
    run_arima,
    run_lstm,
    run_prophet,
)
from pipelines.etf import apply_etf_overlay

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Commodity stress scenarios — macro-driven shocks
# ---------------------------------------------------------------------------

COMMODITY_STRESS_SCENARIOS = {
    "2008": {"market_shock": -0.30, "recovery_months": 18},
    "COVID": {"market_shock": -0.40, "recovery_months": 6},
    "2022":  {"market_shock": 0.45,  "recovery_months": 18},  # supply squeeze
}

# ---------------------------------------------------------------------------
# COT report module (mock CFTC weekly)
# ---------------------------------------------------------------------------

async def fetch_cot_report(ticker: str) -> dict:
    """CFTC Commitments of Traders — commercial vs non-commercial positioning.

    Production: CFTC weekly CSV released every Tuesday at 15:30 ET.
    Stub returns representative values.
    """
    return {
        "commercial_net": -85_420,       # commercials net short (hedgers)
        "non_commercial_net": 142_310,   # speculators net long
        "open_interest_total": 512_800,
        "spec_net_pct_oi": round(142_310 / 512_800 * 100, 2),
        "divergence_signal": "SPEC_LONG_EXTREME",
        "interpretation": (
            "Non-commercial (speculative) net long at 27.8% of open interest — "
            "approaching crowded territory. Commercials (hedgers) are net short, "
            "typical for rising price environment."
        ),
        "stub": True,
    }

# ---------------------------------------------------------------------------
# Futures term structure module
# ---------------------------------------------------------------------------

async def fetch_futures_term_structure(ticker: str) -> dict:
    """Detect contango/backwardation from front-month vs next-month pricing.

    Production: CBOE/CME live futures chain.
    Stub returns synthetic term structure for gold.
    """
    is_energy = any(t in ticker for t in ("CL", "NG", "RB", "HO"))
    structure = "CONTANGO" if is_energy else "BACKWARDATION"
    # Contango = curve slopes up (near < far) = negative roll yield (bearish spot holds)
    # Backwardation = curve slopes down (near > far) = positive roll yield (bullish)
    return {
        "structure":       structure,
        "front_month":     1.0,         # normalised index (1 = spot)
        "second_month":    0.998 if structure == "BACKWARDATION" else 1.005,
        "third_month":     0.995 if structure == "BACKWARDATION" else 1.012,
        "roll_yield_annualised_pct": 2.4 if structure == "BACKWARDATION" else -5.9,
        "interpretation": (
            f"{structure}: {'positive' if structure == 'BACKWARDATION' else 'negative'} "
            f"roll yield — {'supports' if structure == 'BACKWARDATION' else 'erodes'} "
            "long holders over time."
        ),
        "stub": True,
    }


def compute_roll_yield(front_price: float, next_price: float) -> float:
    """Annualised roll yield % from monthly futures roll."""
    if front_price == 0:
        return 0.0
    monthly_yield = (front_price - next_price) / front_price
    return round(monthly_yield * 12 * 100, 2)

# ---------------------------------------------------------------------------
# Macro context — real yield + DXY
# ---------------------------------------------------------------------------

async def fetch_real_yield() -> dict:
    """10-year TIPS real yield from FRED.

    Production: FRED API series 'DFII10'.
    Stub returns last known value.
    """
    return {
        "real_yield_10y": 2.12,
        "series": "DFII10",
        "correlation_note": "Rising real yields typically pressure gold prices. "
                            "Current level is restrictive — headwind for non-yielding assets.",
        "stub": True,
    }


async def fetch_dxy() -> dict:
    """DXY (US Dollar Index) level.

    Production: yfinance DX=F or Polygon.io.
    """
    return {
        "level":        104.2,
        "change_1d_pct": -0.21,
        "trend_30d":    "WEAKENING",
        "correlation_note": "Weakening DXY supports commodity prices (inverse correlation).",
        "stub": True,
    }

# ---------------------------------------------------------------------------
# Seasonal pattern overlay
# ---------------------------------------------------------------------------

def compute_seasonal_overlay(ticker: str) -> dict:
    """Return a seasonal pattern stub for the given commodity ticker."""
    # Gold: seasonally strong Sep–Oct (Indian wedding season + global uncertainty)
    # Crude: seasonally strong Apr–Jun (driving season) and weak Sep–Oct (refinery maintenance)
    is_gold  = any(t in ticker for t in ("GC", "GLD", "GOLD"))
    is_crude = any(t in ticker for t in ("CL", "USO", "OIL"))
    is_natgas = any(t in ticker for t in ("NG", "UNG"))

    if is_gold:
        pattern = "POSITIVE_SEP_OCT"
        note    = "Gold historically strong Sep–Oct on Indian festival demand and year-end hedging."
    elif is_crude:
        pattern = "POSITIVE_APR_JUN"
        note    = "Crude seasonally firm Apr–Jun on summer driving demand. Sep–Oct maintenance weakness."
    elif is_natgas:
        pattern = "POSITIVE_NOV_MAR"
        note    = "Natural gas demand peaks Nov–Mar on Northern Hemisphere heating load."
    else:
        pattern = "NO_SIGNIFICANT_PATTERN"
        note    = "No strong seasonal pattern identified for this commodity."

    return {
        "pattern":     pattern,
        "note":        note,
        "current_month_alignment": "ALIGNED",   # stub
        "stub": True,
    }

# ---------------------------------------------------------------------------
# EIA supply data (oil and natgas only)
# ---------------------------------------------------------------------------

async def fetch_eia_supply(ticker: str) -> dict | None:
    """EIA weekly supply/inventory data.

    Production: EIA API (api.eia.gov), released Wednesdays 10:30 ET.
    Returns None for non-energy commodities.
    """
    if not any(t in ticker for t in ("CL", "NG", "RB", "HO")):
        return None

    return {
        "crude_inventories_mbbl": 421_500,
        "change_week_mbbl":      -3_200,
        "vs_5yr_avg_pct":        -4.1,
        "signal":                "BULLISH",
        "interpretation": (
            "Inventory draw of 3.2 MMbbl vs forecast -1.5 MMbbl — "
            "supply tighter than seasonal norms. Supportive for near-term prices."
        ),
        "stub": True,
    }

# ---------------------------------------------------------------------------
# Commodity stress tests
# ---------------------------------------------------------------------------

def run_commodity_stress_tests(df: pd.DataFrame) -> dict:
    current_price = float(df["close"].iloc[-1])
    results: dict[str, dict] = {}
    for name, params in COMMODITY_STRESS_SCENARIOS.items():
        shock = params["market_shock"]
        results[name] = {
            "market_shock":         shock,
            "estimated_price":      round(current_price * (1 + shock), 2),
            "beta_adjusted_return": round(shock, 4),
            "recovery_months":      params["recovery_months"],
        }
    return results

# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

async def run_commodity_pipeline(
    ticker: str,
    user_tier: str = "FREE",
    language: str = "en",
    currency: str = "USD",
    jurisdiction: str = "US",
    section_requested: str = "A",
    asset_class: str = "COMMODITY",
) -> QuantusPayload:
    """Run the full commodity pipeline and return a validated QuantusPayload.

    Equity-specific fields explicitly set to None:
      days_to_earnings, implied_earnings_move, transcript_nlp_score,
      analyst_buy/hold/sell, analyst_avg_target, insider_net_activity,
      institutional_flow_delta, short_interest_pct, kelly_criterion_pct.
    """
    ticker = ticker.upper().strip()
    logger.info("commodity | %s | starting pipeline", ticker)

    # ------------------------------------------------------------------ #
    # Step 1 — OHLCV + metadata                                           #
    # ------------------------------------------------------------------ #
    df   = fetch_ohlcv(ticker)
    info: dict[str, Any] = yf.Ticker(ticker).info

    company_name  = info.get("longName") or info.get("shortName") or ticker
    exchange      = info.get("exchange") or "CME"
    sector        = "Commodity"
    industry      = info.get("category") or "Commodity Futures"
    market_cap    = 0.0   # futures have no market cap

    current_price  = float(df["close"].iloc[-1])
    prev_close     = float(df["close"].iloc[-2]) if len(df) > 1 else current_price
    day_change_pct = round(
        (current_price - prev_close) / prev_close * 100, 4
    ) if prev_close else 0.0

    # ------------------------------------------------------------------ #
    # Step 2 — Technical indicators                                        #
    # ------------------------------------------------------------------ #
    rsi           = compute_rsi(df)
    macd          = compute_macd(df)
    bollinger_pos = compute_bollinger(df)
    zscore_90d    = compute_zscore(df)
    ohlcv_summary = build_ohlcv_summary(df)

    # ------------------------------------------------------------------ #
    # Step 3 — Regime                                                      #
    # ------------------------------------------------------------------ #
    regime    = detect_regime(df, asset_class="COMMODITY")
    reg_label = regime["label"]
    reg_conf  = regime["confidence"]

    # ------------------------------------------------------------------ #
    # Step 4 — Forecasts                                                   #
    # ------------------------------------------------------------------ #
    arima_fc    = run_arima(df)
    prophet_fc  = run_prophet(df)
    lstm_fc     = run_lstm(df)
    ensemble_fc = compute_ensemble(arima_fc, prophet_fc, lstm_fc, regime)

    # ------------------------------------------------------------------ #
    # Step 5 — Risk models                                                 #
    # ------------------------------------------------------------------ #
    var_99       = compute_var(df)
    es           = compute_es(df)
    max_dd       = compute_max_drawdown(df)
    sharpe       = compute_sharpe(df)
    vol_peers    = round(float(df["close"].pct_change().std() * math.sqrt(252)), 4)
    stress_tests = run_commodity_stress_tests(df)

    # ------------------------------------------------------------------ #
    # Step 6 — Commodity-specific data (parallel async)                   #
    # ------------------------------------------------------------------ #
    logger.info("commodity | %s | fetching commodity-specific data", ticker)
    (
        cot_data,
        term_structure,
        real_yield,
        dxy,
        eia_supply,
    ) = await asyncio.gather(
        fetch_cot_report(ticker),
        fetch_futures_term_structure(ticker),
        fetch_real_yield(),
        fetch_dxy(),
        fetch_eia_supply(ticker),
    )

    seasonal = compute_seasonal_overlay(ticker)

    # ------------------------------------------------------------------ #
    # Step 7 — Sentiment                                                   #
    # ------------------------------------------------------------------ #
    grok_result, reddit_score, news_score = await asyncio.gather(
        fetch_grok_sentiment(ticker, company_name),
        fetch_reddit_sentiment(ticker),
        fetch_news_sentiment(ticker, company_name),
    )
    grok_raw   = float(grok_result.get("score", 0.0)) if isinstance(grok_result, dict) else 0.0
    comp_sent  = composite_sentiment(grok_raw, float(reddit_score), float(news_score))

    # ------------------------------------------------------------------ #
    # Step 8 — Asset-specific block                                        #
    # ------------------------------------------------------------------ #
    asset_specific = {
        "cot_data":       cot_data,
        "futures_curve":  term_structure,
        "real_yield":     real_yield,
        "dxy":            dxy,
        "seasonal":       seasonal,
        "eia_supply":     eia_supply,     # None for non-energy
    }

    # ------------------------------------------------------------------ #
    # Step 9 — Quality scores                                              #
    # ------------------------------------------------------------------ #
    quality_scores = {f: 78 for f in _REQUIRED_FIELDS}

    # ------------------------------------------------------------------ #
    # Step 10 — Assemble QuantusPayload                                    #
    # ------------------------------------------------------------------ #
    payload = QuantusPayload(
        ticker=ticker,
        company_name=company_name,
        asset_class=asset_class,
        exchange=exchange,
        sector=sector,
        industry=industry,
        market_cap=market_cap,
        peer_group=[],

        # Macro
        fed_rate=real_yield.get("real_yield_10y", 2.12),
        yield_curve_shape="INVERTED",
        vix_level=18.5,
        credit_spreads=1.2,

        cross_ticker_alerts=[],

        # Earnings — None (no earnings for commodities)
        days_to_earnings=None,
        implied_earnings_move=None,
        transcript_nlp_score=None,

        # Analyst — None
        analyst_buy=None,
        analyst_hold=None,
        analyst_sell=None,
        analyst_avg_target=None,

        # Pre-computed metrics
        current_price=round(current_price, 4),
        day_change_pct=day_change_pct,
        ohlcv_summary=ohlcv_summary,
        rsi=rsi,
        macd=macd,
        bollinger_position=bollinger_pos,
        zscore_90d=zscore_90d,
        var_99_per_10k=var_99,
        expected_shortfall=es,
        max_drawdown_historical=max_dd,
        sharpe_ratio=sharpe,
        volatility_vs_peers=vol_peers,
        stress_tests=stress_tests,
        regime_label=reg_label,
        regime_confidence=reg_conf,
        arima_forecast=arima_fc,
        prophet_forecast=prophet_fc,
        lstm_forecast=lstm_fc,
        ensemble_forecast=ensemble_fc,
        grok_sentiment=grok_result if isinstance(grok_result, dict)
                       else {"score": grok_result},
        reddit_sentiment=float(reddit_score),
        news_sentiment=float(news_score),
        composite_sentiment=comp_sent,

        # Optional fields — equity/crypto-specific all None
        sec_language_delta=None,
        institutional_flow_delta=None,     # no 13F
        insider_net_activity=None,         # no insider filings
        short_interest_pct=None,
        iv_rank=None,
        implied_move_pct=None,
        factor_scores=None,
        shap_importance={},
        kelly_criterion_pct=None,          # never Kelly for commodity
        pairs_cointegration=None,
        community_interest={},

        # Quality & meta
        data_quality_scores=quality_scores,
        signal_track_record=[],
        asset_specific=asset_specific,
        payload_timestamp=datetime.now(timezone.utc).isoformat(),
        python_model_versions={"arima": "0.14", "regime": "stub"},
        data_sources_used=[
            "yfinance", "cftc_cot_stub", "eia_stub", "fred_tips_stub",
        ],
        data_caveats=[
            "cot_data: stub",
            "futures_curve: stub",
            "real_yield: stub",
            "eia_supply: stub",
            "seasonal: stub",
        ],
        circuit_breaker_activations=[],
        fallbacks_used=[],
        user_tier=user_tier,
        language=language,
        currency=currency,
        jurisdiction=jurisdiction,
        section_requested=section_requested,
    )

    is_valid, errors = validate_payload(payload)
    if not is_valid:
        raise ValueError(f"Commodity QuantusPayload invalid for {ticker!r}: {errors}")

    logger.info("commodity | %s | payload valid", ticker)

    if asset_class == "ETF":
        payload = await apply_etf_overlay(payload, ticker, info)

    return payload


def run_commodity_pipeline_sync(ticker: str, **kwargs) -> QuantusPayload:
    return asyncio.run(run_commodity_pipeline(ticker, **kwargs))
