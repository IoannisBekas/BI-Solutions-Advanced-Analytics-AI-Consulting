---
name: 03-data-architecture
description: |
  Use when building data fetching, caching, storage, or refresh logic. Defines
  the three-tier data model (Static/Semi-Dynamic/Dynamic), cache TTLs, webhook
  invalidation triggers, data quality scoring, and the pre-computed JSON payload
  contract that gets sent to Claude. Never let Claude fetch or compute data.
---

# Data Architecture — Three-Tier Model

## Goal
Build the data layer that classifies every data point by change frequency, stores
it appropriately, fetches only what needs to be fresh, validates quality, and
assembles a pre-computed JSON payload for Claude. Claude never fetches or computes.

## The Core Rule
**Python computes everything. Claude interprets only.**
Every number Claude sees has already been calculated by Python.
Claude receives a validated JSON payload and writes narrative. Nothing else.

## Tier Definitions

### Tier 1 — Static Data
**Changes:** quarterly / annually / on material event
**Storage:** PostgreSQL / Supabase
**Never re-fetched per report generation**

```python
TIER_1_FIELDS = [
    "company_description", "business_model", "founded_year",
    "sector", "industry", "exchange", "country",
    "revenue_history", "earnings_history", "balance_sheet",
    "executive_team", "board_composition",
    "competitive_positioning", "peer_group",
    "knowledge_graph",          # supplier/customer/competitor relationships
    "sec_filing_language_delta", # NLP-processed 10-K / 10-Q delta
    "institutional_holdings_13f", # quarterly
    "analyst_consensus",
    "factor_scores",            # P/E, P/B, ROE — updated on earnings
    "earnings_transcript_nlp",  # per quarter, Quantus proprietary corpus
    "dividend_history",
    "buyback_history",
    "geographic_revenue",
    "esg_scores",
    "quantus_signal_history",   # all past signals for this ticker
    "prompt_version_per_signal", # which engine generated each signal
]
```

Refresh triggers (webhook-driven):
- SEC 10-K / 10-Q filing
- Earnings release
- Annual event
- Data restatement → flag all cached reports using old figure

### Tier 2 — Semi-Dynamic Data
**Changes:** weekly / on event trigger
**Storage:** Redis (weekly TTL + webhook invalidation)

```python
TIER_2_FIELDS = [
    "earnings_date",           # and implied move (options-derived)
    "analyst_price_targets",   # on update
    "short_interest",          # bi-weekly
    "insider_transactions",    # SEC Form 4, filed within 2 days
    "iv_rank",
    "options_term_structure",
    "macro_indicators",        # fed_rate, yield_curve, credit_spreads, vix
    "institutional_flow_signals",  # 13F approximations between filings
    "sector_rotation_signals",
    "etf_constituent_weights",
    # CRYPTO ONLY:
    "fear_greed_index",        # daily but semi-dynamic usage
    "btc_dominance",
    # COMMODITY ONLY:
    "cot_report",              # CFTC, weekly
    "futures_term_structure",  # contango/backwardation
    "real_yield",              # FRED TIPS
    "dxy_level",               # US Dollar Index
]
```

### Tier 3 — Dynamic Data
**Changes:** daily / intraday
**Fetched:** fresh on every report generation cycle

```python
TIER_3_FIELDS = [
    "ohlcv",                   # yfinance
    "rsi", "macd", "bollinger_bands",  # computed from price
    "zscore_vs_rolling_mean",
    "var_99", "expected_shortfall",    # Monte Carlo daily
    "grok_x_sentiment",        # Grok API
    "reddit_sentiment",
    "news_sentiment",
    "implied_volatility_realtime",    # CBOE
    "market_regime",           # HMM, daily
    "current_price", "day_change", "sparkline",
    "premarket_afterhours",
    "options_implied_move",
    # CRYPTO ONLY:
    "exchange_net_flow",       # Glassnode/CryptoQuant
    "mvrv_zscore",
    "active_addresses",
    "hash_rate",               # BTC only
    "funding_rates",
    "open_interest",
    "liquidation_levels",
    # COMMODITY ONLY:
    "seasonal_pattern_overlay",
    "eia_supply_data",         # Oil/NatGas
]
```

## Data Quality Scoring

Every data point receives a quality score (0–100) before entering the payload:

```python
def score_data_quality(
    source_reliability: float,    # 0-1, based on source tier
    recency_score: float,         # 0-1, based on age vs expected TTL
    cross_source_agreement: float,# 0-1, how much sources agree
    anomaly_score: float,         # 0-1, 1 = no anomaly
) -> int:
    weighted = (
        source_reliability * 0.35 +
        recency_score * 0.25 +
        cross_source_agreement * 0.25 +
        anomaly_score * 0.15
    )
    return int(weighted * 100)
```

Rules:
- Quality score < 60 → exclude from payload, add to `data_caveats` list
- Quality score 60–74 → include with reduced confidence contribution
- Quality score ≥ 75 → include at full confidence contribution
- Coordinated social media campaign detected → discount sentiment to quality 40 (auto-excluded)

## Pre-Computed JSON Payload Contract

This is the exact structure Python must assemble before calling Claude:

```python
@dataclass
class QuantusPayload:
    # Identity
    ticker: str
    company_name: str
    asset_class: str          # from Asset Class Router
    exchange: str
    sector: str
    industry: str
    market_cap: float
    peer_group: list[str]     # curated, not broad sector

    # Macro context (Tier 2)
    fed_rate: float
    yield_curve_shape: str
    vix_level: float
    credit_spreads: float

    # Cross-ticker intelligence
    cross_ticker_alerts: list[dict]   # from knowledge graph

    # Earnings (equity/ETF only)
    days_to_earnings: int | None
    implied_earnings_move: float | None
    transcript_nlp_score: float | None

    # Analyst consensus (equity/ETF only)
    analyst_buy: int | None
    analyst_hold: int | None
    analyst_sell: int | None
    analyst_avg_target: float | None

    # Pre-computed metrics (all Python-calculated — NEVER let Claude derive these)
    current_price: float
    day_change_pct: float
    ohlcv_summary: dict
    rsi: float
    macd: dict
    bollinger_position: str
    zscore_90d: float
    var_99_per_10k: float
    expected_shortfall: float
    max_drawdown_historical: float
    sharpe_ratio: float
    volatility_vs_peers: float
    stress_tests: dict          # 2008 / COVID / 2022 results
    regime_label: str
    regime_confidence: float
    arima_forecast: dict
    prophet_forecast: dict
    lstm_forecast: dict
    ensemble_forecast: dict
    grok_sentiment: dict        # score, volume, campaign_detected
    reddit_sentiment: float
    news_sentiment: float
    composite_sentiment: float
    sec_language_delta: str | None
    institutional_flow_delta: float | None
    insider_net_activity: float | None
    short_interest_pct: float | None
    iv_rank: float | None
    implied_move_pct: float | None
    factor_scores: dict | None
    shap_importance: dict
    kelly_criterion_pct: float | None   # equity only
    pairs_cointegration: dict | None
    community_interest: dict
    data_quality_scores: dict           # per-field quality scores
    signal_track_record: list[dict]     # historical Quantus signals for this ticker

    # Asset-class-specific additions
    # Crypto: on_chain_data dict
    # Commodity: cot_data, futures_curve, real_yield, seasonal_pattern
    # ETF: nav_premium, fund_flows, holdings_breakdown
    asset_specific: dict

    # Meta
    payload_timestamp: str
    python_model_versions: dict
    data_sources_used: list[str]
    data_caveats: list[str]       # excluded fields + reason
    circuit_breaker_activations: list[str]
    fallbacks_used: list[str]
    user_tier: str                # FREE | UNLOCKED | INSTITUTIONAL
    language: str
    currency: str
    jurisdiction: str
    section_requested: str        # A | B | C | D | E-{module}
```

## Cache Lifecycle

Report cache TTL: 96 hours (dynamic — not a fixed timer)

Auto-invalidation triggers (webhook-driven, instant):
- Price move > 5% in single session
- Earnings announcement released
- Major analyst rating change (≥3 notch)
- Fed announcement / VIX spike > 20%
- Regime change detected
- SEC 8-K material event filing
- Fundamental data restatement

On invalidation:
- Mark report "Refreshing..." in discovery feed
- Notify watchlist subscribers with change delta
- Generate new report once → serve to all users
- Archive previous report with Report ID preserved
- Add data lineage flag if fundamental data changed

## Constraints
- Python must assemble the FULL payload before calling Claude — no lazy loading
- Every field in the payload must have a corresponding quality score
- Unvalidated data must never reach Claude
- Data lineage (source, timestamp, version) stored for every field
- On restatement: flag ALL cached reports using the old figure inline
- Circuit breaker states tracked in Redis — never make external calls in open state
