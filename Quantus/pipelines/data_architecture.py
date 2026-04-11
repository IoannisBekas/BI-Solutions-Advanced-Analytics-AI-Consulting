"""
pipelines/data_architecture.py
================================
Three-Tier Data Model — Quantus Research Solutions.

Defines:
  - TIER_1/2/3_FIELDS  : field registry for each storage tier
  - score_data_quality(): weighted quality function (0–100)
  - QuantusPayload      : pre-computed JSON contract sent to Claude
  - validate_payload()  : checks types, non-None invariants, quality coverage

Core rule: Python computes everything. Claude interprets only.
Every number in the payload has been calculated here before Claude is called.
"""

from __future__ import annotations

import dataclasses
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

# ---------------------------------------------------------------------------
# Quality thresholds (skill spec §Data Quality Scoring)
# ---------------------------------------------------------------------------
QUALITY_EXCLUDE   = 60   # < 60  → exclude from payload, add to data_caveats
QUALITY_REDUCED   = 75   # 60–74 → include with reduced confidence contribution
QUALITY_FULL      = 75   # ≥ 75  → include at full confidence contribution

# ---------------------------------------------------------------------------
# Tier field registries
# ---------------------------------------------------------------------------

TIER_1_FIELDS: list[str] = [
    "company_description",
    "business_model",
    "founded_year",
    "sector",
    "industry",
    "exchange",
    "country",
    "revenue_history",
    "earnings_history",
    "balance_sheet",
    "executive_team",
    "board_composition",
    "competitive_positioning",
    "peer_group",
    "knowledge_graph",               # supplier/customer/competitor relationships
    "sec_filing_language_delta",     # NLP-processed 10-K / 10-Q delta
    "institutional_holdings_13f",    # quarterly
    "analyst_consensus",
    "factor_scores",                 # P/E, P/B, ROE — updated on earnings
    "earnings_transcript_nlp",       # per quarter, Quantus proprietary corpus
    "dividend_history",
    "buyback_history",
    "geographic_revenue",
    "esg_scores",
    "quantus_signal_history",        # all past signals for this ticker
    "prompt_version_per_signal",     # which engine generated each signal
]

TIER_2_FIELDS: list[str] = [
    "earnings_date",
    "analyst_price_targets",         # on update
    "short_interest",                # bi-weekly
    "insider_transactions",          # SEC Form 4, filed within 2 days
    "iv_rank",
    "options_term_structure",
    "macro_indicators",              # fed_rate, yield_curve, credit_spreads, vix
    "institutional_flow_signals",    # 13F approximations between filings
    "sector_rotation_signals",
    "etf_constituent_weights",
    # CRYPTO ONLY
    "fear_greed_index",
    "btc_dominance",
    # COMMODITY ONLY
    "cot_report",                    # CFTC, weekly
    "futures_term_structure",        # contango / backwardation
    "real_yield",                    # FRED TIPS
    "dxy_level",                     # US Dollar Index
]

TIER_3_FIELDS: list[str] = [
    "ohlcv",                         # yfinance
    "rsi",
    "macd",
    "bollinger_bands",               # computed from price
    "zscore_vs_rolling_mean",
    "var_99",
    "expected_shortfall",            # Monte Carlo daily
    "grok_x_sentiment",              # Grok API
    "reddit_sentiment",
    "news_sentiment",
    "implied_volatility_realtime",   # CBOE
    "market_regime",                 # HMM, daily
    "current_price",
    "day_change",
    "sparkline",
    "premarket_afterhours",
    "options_implied_move",
    # CRYPTO ONLY
    "exchange_net_flow",             # Glassnode / CryptoQuant
    "mvrv_zscore",
    "active_addresses",
    "hash_rate",                     # BTC only
    "funding_rates",
    "open_interest",
    "liquidation_levels",
    # COMMODITY ONLY
    "seasonal_pattern_overlay",
    "eia_supply_data",               # Oil / NatGas
]

# ---------------------------------------------------------------------------
# Data quality scoring  (skill spec §Data Quality Scoring)
# ---------------------------------------------------------------------------

def score_data_quality(
    source_reliability: float,      # 0–1, based on source tier
    recency_score: float,           # 0–1, based on age vs expected TTL
    cross_source_agreement: float,  # 0–1, how much sources agree
    anomaly_score: float,           # 0–1, 1 = no anomaly detected
) -> int:
    """Return a quality score 0–100 for a single data point.

    Weights (per skill spec):
      source_reliability     → 35 %
      recency_score          → 25 %
      cross_source_agreement → 25 %
      anomaly_score          → 15 %

    Thresholds:
      < 60  → exclude from payload; add field to ``data_caveats``
      60–74 → include with reduced confidence contribution
      ≥ 75  → include at full confidence contribution

    Args:
        source_reliability:      0.0–1.0
        recency_score:           0.0–1.0
        cross_source_agreement:  0.0–1.0
        anomaly_score:           0.0–1.0 (1.0 means no anomaly)

    Returns:
        Integer quality score in range [0, 100].
    """
    for name, val in (
        ("source_reliability",     source_reliability),
        ("recency_score",          recency_score),
        ("cross_source_agreement", cross_source_agreement),
        ("anomaly_score",          anomaly_score),
    ):
        if not (0.0 <= val <= 1.0):
            raise ValueError(f"{name} must be in [0.0, 1.0], got {val!r}")

    weighted = (
        source_reliability     * 0.35
        + recency_score        * 0.25
        + cross_source_agreement * 0.25
        + anomaly_score        * 0.15
    )
    return int(weighted * 100)


def quality_band(score: int) -> str:
    """Return a human-readable quality band label."""
    if score < QUALITY_EXCLUDE:
        return "EXCLUDED"
    if score < QUALITY_FULL:
        return "REDUCED"
    return "FULL"


# ---------------------------------------------------------------------------
# QuantusPayload  — pre-computed JSON contract sent to Claude
# ---------------------------------------------------------------------------

@dataclass
class QuantusPayload:
    """Complete pre-computed payload assembled by Python before calling Claude.

    Claude receives this payload and writes narrative only.
    It never fetches data, derives numbers, or performs calculations.

    Fields mirror the skill spec §Pre-Computed JSON Payload Contract exactly.
    Optional fields (None when not applicable to the asset class) use
    ``field(default=None)`` so dataclass instantiation remains explicit.
    """

    # ------------------------------------------------------------------
    # Identity  (Tier 1)
    # ------------------------------------------------------------------
    ticker: str
    company_name: str
    asset_class: str            # from Asset Class Router: EQUITY|CRYPTO|COMMODITY|ETF
    exchange: str
    sector: str
    industry: str
    market_cap: float
    peer_group: list[str]       # curated, not broad sector

    # ------------------------------------------------------------------
    # Macro context  (Tier 2 — Redis)
    # ------------------------------------------------------------------
    fed_rate: float
    yield_curve_shape: str      # "NORMAL" | "INVERTED" | "FLAT" | "STEEPENING"
    vix_level: float
    credit_spreads: float

    # ------------------------------------------------------------------
    # Cross-ticker intelligence
    # ------------------------------------------------------------------
    cross_ticker_alerts: list[dict]     # from knowledge graph

    # ------------------------------------------------------------------
    # Earnings  (equity / ETF only — None for crypto / commodity)
    # ------------------------------------------------------------------
    days_to_earnings: int | None
    implied_earnings_move: float | None
    transcript_nlp_score: float | None

    # ------------------------------------------------------------------
    # Analyst consensus  (equity / ETF only)
    # ------------------------------------------------------------------
    analyst_buy: int | None
    analyst_hold: int | None
    analyst_sell: int | None
    analyst_avg_target: float | None

    # ------------------------------------------------------------------
    # Pre-computed metrics  (Tier 3 — fresh per report)
    # Python calculated every one of these. Claude must not re-derive them.
    # ------------------------------------------------------------------
    current_price: float
    day_change_pct: float
    ohlcv_summary: dict
    rsi: float
    macd: dict
    bollinger_position: str     # "ABOVE_UPPER" | "MIDDLE" | "BELOW_LOWER" | etc.
    bollinger_percentile: float | None = None   # 0–100 position within band
    zscore_90d: float
    var_99_per_10k: float       # VaR at 99 % confidence per $10 k notional
    expected_shortfall: float
    max_drawdown_historical: float
    sharpe_ratio: float
    volatility_vs_peers: float
    stress_tests: dict          # keys: "2008", "COVID", "2022"
    regime_label: str           # "STRONG_UPTREND" | "UPTREND" | "SIDEWAYS" | "DOWNTREND" | "HIGH_VOL"
    regime_confidence: float
    arima_forecast: dict
    prophet_forecast: dict
    lstm_forecast: dict
    ensemble_forecast: dict
    grok_sentiment: dict        # {"score": float, "volume": int, "campaign_detected": bool}
    reddit_sentiment: float
    news_sentiment: float
    composite_sentiment: float

    # ------------------------------------------------------------------
    # Optional / conditional fields
    # ------------------------------------------------------------------
    sec_language_delta: str | None = field(default=None)
    institutional_flow_delta: float | None = field(default=None)
    insider_net_activity: float | None = field(default=None)
    short_interest_pct: float | None = field(default=None)
    iv_rank: float | None = field(default=None)
    implied_move_pct: float | None = field(default=None)
    factor_scores: dict | None = field(default=None)
    shap_importance: dict = field(default_factory=dict)
    kelly_criterion_pct: float | None = field(default=None)   # equity only
    pairs_cointegration: dict | None = field(default=None)
    community_interest: dict = field(default_factory=dict)

    # ------------------------------------------------------------------
    # Data quality & meta
    # ------------------------------------------------------------------
    data_quality_scores: dict = field(default_factory=dict)
    # {"field_name": int (0-100), ...} — every field must have an entry
    signal_track_record: list[dict] = field(default_factory=list)

    # Asset-class-specific additions
    # Crypto:    {"on_chain": {...}}
    # Commodity: {"cot_data": {...}, "futures_curve": [...], "real_yield": float, "seasonal": {...}}
    # ETF:       {"nav_premium": float, "fund_flows": float, "holdings_breakdown": [...]}
    asset_specific: dict = field(default_factory=dict)

    # Pipeline metadata
    payload_timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    python_model_versions: dict = field(default_factory=dict)
    data_sources_used: list[str] = field(default_factory=list)
    data_caveats: list[str] = field(default_factory=list)
    circuit_breaker_activations: list[str] = field(default_factory=list)
    fallbacks_used: list[str] = field(default_factory=list)
    user_tier: str = "FREE"          # FREE | UNLOCKED | INSTITUTIONAL
    language: str = "en"
    currency: str = "USD"
    jurisdiction: str = "US"
    section_requested: str = "A"     # A | B | C | D | E-{module}


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

# Required fields that must be present and non-None in a valid payload.
# Optional fields (e.g. `days_to_earnings`) are intentionally excluded.
_REQUIRED_FIELDS: frozenset[str] = frozenset({
    "ticker", "company_name", "asset_class", "exchange", "sector", "industry",
    "market_cap", "peer_group",
    "fed_rate", "yield_curve_shape", "vix_level", "credit_spreads",
    "cross_ticker_alerts",
    "current_price", "day_change_pct", "ohlcv_summary",
    "rsi", "macd", "bollinger_position", "zscore_90d",
    "var_99_per_10k", "expected_shortfall", "max_drawdown_historical",
    "sharpe_ratio", "volatility_vs_peers", "stress_tests",
    "regime_label", "regime_confidence",
    "arima_forecast", "prophet_forecast", "lstm_forecast", "ensemble_forecast",
    "grok_sentiment", "reddit_sentiment", "news_sentiment", "composite_sentiment",
    "data_quality_scores", "payload_timestamp",
    "data_sources_used", "user_tier", "language", "currency",
    "jurisdiction", "section_requested",
})

# Expected Python types for key fields (field_name → expected type or tuple of types)
_TYPE_MAP: dict[str, type | tuple] = {
    "ticker":                   str,
    "company_name":             str,
    "asset_class":              str,
    "exchange":                 str,
    "sector":                   str,
    "industry":                 str,
    "market_cap":               (int, float),
    "peer_group":               list,
    "fed_rate":                 (int, float),
    "yield_curve_shape":        str,
    "vix_level":                (int, float),
    "credit_spreads":           (int, float),
    "cross_ticker_alerts":      list,
    "current_price":            (int, float),
    "day_change_pct":           (int, float),
    "ohlcv_summary":            dict,
    "rsi":                      (int, float),
    "macd":                     dict,
    "bollinger_position":       str,
    "zscore_90d":               (int, float),
    "var_99_per_10k":           (int, float),
    "expected_shortfall":       (int, float),
    "max_drawdown_historical":  (int, float),
    "sharpe_ratio":             (int, float),
    "volatility_vs_peers":      (int, float),
    "stress_tests":             dict,
    "regime_label":             str,
    "regime_confidence":        (int, float),
    "arima_forecast":           dict,
    "prophet_forecast":         dict,
    "lstm_forecast":            dict,
    "ensemble_forecast":        dict,
    "grok_sentiment":           dict,
    "reddit_sentiment":         (int, float),
    "news_sentiment":           (int, float),
    "composite_sentiment":      (int, float),
    "data_quality_scores":      dict,
    "signal_track_record":      list,
    "asset_specific":           dict,
    "payload_timestamp":        str,
    "python_model_versions":    dict,
    "data_sources_used":        list,
    "data_caveats":             list,
    "circuit_breaker_activations": list,
    "fallbacks_used":           list,
    "user_tier":                str,
    "language":                 str,
    "currency":                 str,
    "jurisdiction":             str,
    "section_requested":        str,
}

# Numeric fields must be within these inclusive bounds (field → (min, max))
_NUMERIC_BOUNDS: dict[str, tuple[float, float]] = {
    "rsi":               (0.0,   100.0),
    "regime_confidence": (0.0,   1.0),
    "composite_sentiment": (-1.0, 1.0),
    "reddit_sentiment":  (-1.0,  1.0),
    "news_sentiment":    (-1.0,  1.0),
    "vix_level":         (0.0,   200.0),
    "fed_rate":          (-1.0,  20.0),
    "market_cap":        (0.0,   1e15),
}


def validate_payload(p: QuantusPayload) -> tuple[bool, list[str]]:
    """Validate a :class:`QuantusPayload` before handing it to Claude.

    Checks:
    1. All required fields are present and non-None.
    2. Each field matches its expected Python type.
    3. Numeric fields are within declared bounds.
    4. `data_quality_scores` has an entry for every required field.
    5. `user_tier` is one of the allowed enum values.

    Returns:
        ``(is_valid, errors)`` — ``errors`` is empty when valid.
    """
    errors: list[str] = []
    as_dict: dict[str, Any] = dataclasses.asdict(p)

    # 1. Required fields present and non-None
    for fname in _REQUIRED_FIELDS:
        val = as_dict.get(fname)
        if val is None:
            errors.append(f"REQUIRED_MISSING: '{fname}' is None or absent")

    # 2. Type checks
    for fname, expected_type in _TYPE_MAP.items():
        val = as_dict.get(fname)
        if val is None:
            continue  # covered by check 1 for required fields
        if not isinstance(val, expected_type):
            errors.append(
                f"TYPE_ERROR: '{fname}' expected {expected_type}, "
                f"got {type(val).__name__}"
            )

    # 3. Numeric bounds (only checked when the value is the right type)
    for fname, (lo, hi) in _NUMERIC_BOUNDS.items():
        val = as_dict.get(fname)
        if val is None:
            continue
        try:
            if not (lo <= val <= hi):
                errors.append(
                    f"BOUNDS_ERROR: '{fname}' = {val} outside [{lo}, {hi}]"
                )
        except TypeError:
            # Wrong type already reported in check 2; skip bounds check silently
            pass

    # 4. Quality score coverage
    dqs: dict = as_dict.get("data_quality_scores") or {}
    for fname in _REQUIRED_FIELDS:
        if fname not in ("data_quality_scores", "payload_timestamp"):
            if fname not in dqs:
                errors.append(
                    f"QUALITY_MISSING: no data_quality_scores entry for '{fname}'"
                )

    # 5. user_tier enum
    allowed_tiers = {"FREE", "UNLOCKED", "INSTITUTIONAL"}
    if p.user_tier not in allowed_tiers:
        errors.append(
            f"ENUM_ERROR: user_tier '{p.user_tier}' not in {allowed_tiers}"
        )

    return (len(errors) == 0), errors
