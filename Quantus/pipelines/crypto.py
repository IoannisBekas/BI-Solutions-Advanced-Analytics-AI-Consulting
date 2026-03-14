"""
pipelines/crypto.py
====================
Crypto Asset Pipeline — Quantus Research Solutions.

Extends the equity pipeline base but removes equity-specific fields (earnings,
13F, insider, analyst consensus, short interest, knowledge graph, Kelly).

Crypto-specific additions:
  - On-chain data: exchange net flow, MVRV Z-score, active addresses,
    hash rate (BTC only), funding rates, open interest, liquidation levels
  - Fear & Greed Index (alternative.me)
  - Recalibrated regime parameters (3× volatility thresholds)
  - Vol-adjusted position sizing instead of Kelly

All external data sources are mocked (Glassnode/CryptoQuant/Coinglass/alternative.me)
and designed to be drop-in replaced with live API calls in production.
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
    score_data_quality,
)
from pipelines.equity import (
    build_ohlcv_summary,
    compute_bollinger,
    compute_ensemble,
    compute_ensemble_price,
    compute_es,
    compute_macd,
    compute_max_drawdown,
    compute_rsi,
    compute_sharpe,
    compute_var,
    compute_zscore,
    composite_sentiment,
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
# Crypto regime parameters — 3× equity volatility thresholds
# ---------------------------------------------------------------------------

CRYPTO_REGIME_THRESHOLDS = {
    "strong_uptrend": 0.45,   # vs 0.15 for equity
    "uptrend":        0.15,   # vs 0.05
    "downtrend":     -0.45,   # vs -0.15
    "high_vol_annualised": 1.05,  # vs 0.35
}

CRYPTO_STRESS_SCENARIOS = {
    "2018_bear":   {"market_shock": -0.84, "recovery_months": 36},
    "covid_2020":  {"market_shock": -0.63, "recovery_months": 4},
    "luna_ust":    {"market_shock": -0.70, "recovery_months": 20},
}

# ---------------------------------------------------------------------------
# On-chain data stubs (Glassnode / CryptoQuant / Coinglass)
# ---------------------------------------------------------------------------

async def fetch_exchange_net_flow(ticker: str) -> dict:
    """Exchange net flow — positive = inflow to exchanges (selling pressure)."""
    return {
        "net_flow_btc":   -1250.4,  # negative = outflow (bullish)
        "signal":         "BULLISH",
        "interpretation": "Exchange outflow suggests accumulation by long-term holders.",
        "stub": True,
    }


async def fetch_mvrv_zscore(ticker: str) -> dict:
    """MVRV Z-score — market value vs realised value."""
    return {
        "value":   1.8,
        "signal":  "NEUTRAL",
        "interpretation": "MVRV Z-score below 3.5 — not in historical bubble territory.",
        "stub": True,
    }


async def fetch_active_addresses(ticker: str) -> dict:
    """Daily active addresses trend."""
    return {
        "count_24h":   875_430,
        "change_7d_pct": 4.2,
        "signal":      "GROWING",
        "stub": True,
    }


async def fetch_hash_rate(ticker: str) -> dict | None:
    """Hash rate — BTC only."""
    if "BTC" not in ticker.upper():
        return None
    return {
        "hash_rate_eh_s":  620.3,
        "change_30d_pct":  8.5,
        "signal":          "STRONG",
        "stub": True,
    }


async def fetch_funding_rates(ticker: str) -> dict:
    """Perpetual swap funding rates (Coinglass)."""
    return {
        "rate_8h":         0.0002,
        "annualised_pct":  21.9,
        "signal":          "NEUTRAL",
        "interpretation":  "Positive funding — longs pay shorts (mild leverage overhang).",
        "stub": True,
    }


async def fetch_open_interest(ticker: str) -> dict:
    """Open interest + liquidation clusters (Coinglass)."""
    return {
        "open_interest_usd": 18_400_000_000,
        "change_24h_pct":    3.1,
        "liquidation_clusters": {
            "above": [{"price": 72_000, "size_usd": 420_000_000}],
            "below": [{"price": 58_000, "size_usd": 380_000_000}],
        },
        "stub": True,
    }


async def fetch_fear_greed(ticker: str) -> dict:
    """Fear & Greed Index (alternative.me)."""
    return {
        "value":       62,
        "label":       "Greed",
        "change_7d":   +8,
        "stub": True,
    }

# ---------------------------------------------------------------------------
# Crypto regime detection (3× thresholds)
# ---------------------------------------------------------------------------

def detect_crypto_regime(df: pd.DataFrame) -> dict:
    """Regime detection for crypto with 3× volatility thresholds."""
    ret_30d = float(df["close"].pct_change(30).iloc[-1]) if len(df) > 30 else 0.0
    vol     = float(df["close"].pct_change().std() * math.sqrt(252))
    thresh  = CRYPTO_REGIME_THRESHOLDS

    if ret_30d > thresh["strong_uptrend"]:
        label, confidence = "STRONG_UPTREND", 0.83
    elif ret_30d > thresh["uptrend"]:
        label, confidence = "UPTREND",        0.72
    elif ret_30d < thresh["downtrend"]:
        label, confidence = "DOWNTREND",      0.79
    elif vol > thresh["high_vol_annualised"]:
        label, confidence = "HIGH_VOL",       0.67
    else:
        label, confidence = "SIDEWAYS",       0.62

    return {
        "label":          label,
        "confidence":     confidence,
        "vol_annualised": round(vol, 4),
        "ret_30d":        round(ret_30d, 4),
    }

# ---------------------------------------------------------------------------
# Vol-adjusted position sizing (crypto — never Kelly)
# ---------------------------------------------------------------------------

def vol_adjusted_position_size(
    annualised_vol: float,
    target_vol: float = 0.15,
    max_position: float = 0.025,      # hard cap: 2.5% for crypto
) -> float:
    """Scale position inversely to volatility.

    position = (target_vol / asset_vol) × max_position, capped at max_position.
    """
    if annualised_vol <= 0:
        return 0.0
    raw = (target_vol / annualised_vol) * max_position
    return round(min(raw, max_position), 4)

# ---------------------------------------------------------------------------
# Crypto stress tests
# ---------------------------------------------------------------------------

def run_crypto_stress_tests(df: pd.DataFrame) -> dict:
    """Apply crypto-specific historical stress scenarios."""
    current_price = float(df["close"].iloc[-1])
    results: dict[str, dict] = {}
    for name, params in CRYPTO_STRESS_SCENARIOS.items():
        shock = params["market_shock"]
        est_price = round(current_price * (1 + shock), 2)
        results[name] = {
            "market_shock":         shock,
            "estimated_price":      est_price,
            "beta_adjusted_return": round(shock, 4),
            "recovery_months":      params["recovery_months"],
        }
    return results

# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

async def run_crypto_pipeline(
    ticker: str,
    user_tier: str = "FREE",
    language: str = "en",
    currency: str = "USD",
    jurisdiction: str = "GLOBAL",
    section_requested: str = "A",
    asset_class: str = "CRYPTO",
) -> QuantusPayload:
    """Run the full crypto pipeline for *ticker* and return a validated payload.

    Equity-specific fields set to None:
      days_to_earnings, implied_earnings_move, transcript_nlp_score,
      analyst_buy/hold/sell, analyst_avg_target, insider_net_activity,
      institutional_flow_delta, short_interest_pct, kelly_criterion_pct.
    """
    ticker = ticker.upper().strip()
    logger.info("crypto | %s | starting pipeline", ticker)

    # ------------------------------------------------------------------ #
    # Step 1 — OHLCV + metadata                                           #
    # ------------------------------------------------------------------ #
    df   = fetch_ohlcv(ticker)
    info: dict[str, Any] = yf.Ticker(ticker).info

    company_name  = info.get("longName") or info.get("shortName") or ticker
    exchange      = info.get("exchange") or "CRYPTO"
    sector        = "Cryptocurrency"
    industry      = info.get("category") or "Digital Assets"
    market_cap    = float(info.get("marketCap") or 0.0)

    current_price = float(df["close"].iloc[-1])
    prev_close    = float(df["close"].iloc[-2]) if len(df) > 1 else current_price
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
    # Step 3 — Regime (crypto-calibrated)                                 #
    # ------------------------------------------------------------------ #
    regime    = detect_crypto_regime(df)
    reg_label = regime["label"]
    reg_conf  = regime["confidence"]
    vol_ann   = regime["vol_annualised"]

    # ------------------------------------------------------------------ #
    # Step 4 — Forecast ensemble                                           #
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
    vol_peers    = round(vol_ann, 4)
    stress_tests = run_crypto_stress_tests(df)

    # ------------------------------------------------------------------ #
    # Step 6 — On-chain data (parallel async)                             #
    # ------------------------------------------------------------------ #
    logger.info("crypto | %s | fetching on-chain data", ticker)
    (
        net_flow,
        mvrv,
        active_addr,
        hash_rate_data,
        funding,
        open_int,
        fear_greed,
    ) = await asyncio.gather(
        fetch_exchange_net_flow(ticker),
        fetch_mvrv_zscore(ticker),
        fetch_active_addresses(ticker),
        fetch_hash_rate(ticker),
        fetch_funding_rates(ticker),
        fetch_open_interest(ticker),
        fetch_fear_greed(ticker),
    )

    # ------------------------------------------------------------------ #
    # Step 7 — Sentiment (parallel)                                        #
    # ------------------------------------------------------------------ #
    grok_result, reddit_score, news_score = await asyncio.gather(
        fetch_grok_sentiment(ticker, company_name),
        fetch_reddit_sentiment(ticker),
        fetch_news_sentiment(ticker, company_name),
    )
    grok_raw    = float(grok_result.get("score", 0.0)) if isinstance(grok_result, dict) else 0.0
    comp_sent   = composite_sentiment(grok_raw, float(reddit_score), float(news_score))

    # ------------------------------------------------------------------ #
    # Step 8 — Vol-adjusted position sizing                                #
    # ------------------------------------------------------------------ #
    vol_pos_size = vol_adjusted_position_size(vol_ann)

    # ------------------------------------------------------------------ #
    # Step 9 — Macro (stubs)                                              #
    # ------------------------------------------------------------------ #
    fed_rate          = 5.25
    yield_curve_shape = "INVERTED"
    vix_level         = 18.5
    credit_spreads    = 1.2

    # ------------------------------------------------------------------ #
    # Step 10 — Asset-specific block                                       #
    # ------------------------------------------------------------------ #
    asset_specific = {
        "on_chain": {
            "exchange_net_flow": net_flow,
            "mvrv_zscore":       mvrv,
            "active_addresses":  active_addr,
            "hash_rate":         hash_rate_data,
            "funding_rates":     funding,
            "open_interest":     open_int,
            "fear_greed_index":  fear_greed,
        },
        "vol_adjusted_position_pct": vol_pos_size,
    }

    # ------------------------------------------------------------------ #
    # Step 11 — Quality scores                                             #
    # ------------------------------------------------------------------ #
    quality_scores = {f: 80 for f in _REQUIRED_FIELDS}

    # ------------------------------------------------------------------ #
    # Step 12 — Assemble QuantusPayload                                    #
    # No equity-specific fields: earnings, analyst, insider, 13F, Kelly   #
    # ------------------------------------------------------------------ #
    payload = QuantusPayload(
        ticker=ticker,
        company_name=company_name,
        asset_class=asset_class,
        exchange=exchange,
        sector=sector,
        industry=industry,
        market_cap=market_cap,
        peer_group=[],                  # no peer radar for crypto

        # Macro
        fed_rate=fed_rate,
        yield_curve_shape=yield_curve_shape,
        vix_level=round(vix_level, 2),
        credit_spreads=credit_spreads,

        cross_ticker_alerts=[],         # knowledge graph removed for crypto

        # Earnings — None (crypto has no earnings)
        days_to_earnings=None,
        implied_earnings_move=None,
        transcript_nlp_score=None,

        # Analyst — None (no traditional analyst consensus)
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

        # Optional — all crypto-N/A fields are None
        sec_language_delta=None,
        institutional_flow_delta=None,      # no 13F
        insider_net_activity=None,          # no insider filings
        short_interest_pct=None,            # no short interest data
        iv_rank=None,
        implied_move_pct=None,
        factor_scores=None,
        shap_importance={},
        kelly_criterion_pct=None,           # never Kelly for crypto
        pairs_cointegration=None,
        community_interest={},

        # Quality & meta
        data_quality_scores=quality_scores,
        signal_track_record=[],
        asset_specific=asset_specific,
        payload_timestamp=datetime.now(timezone.utc).isoformat(),
        python_model_versions={"arima": "0.14", "regime": "crypto_stub"},
        data_sources_used=["yfinance", "glassnode_stub", "coinglass_stub", "alternative_me_stub"],
        data_caveats=[
            "on-chain: stub data",
            "fear_greed: stub data",
            "funding_rates: stub data",
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
        raise ValueError(f"Crypto QuantusPayload invalid for {ticker!r}: {errors}")

    logger.info("crypto | %s | payload valid", ticker)

    if asset_class == "ETF":
        payload = await apply_etf_overlay(payload, ticker, info)

    return payload


def run_crypto_pipeline_sync(ticker: str, **kwargs) -> QuantusPayload:
    return asyncio.run(run_crypto_pipeline(ticker, **kwargs))
