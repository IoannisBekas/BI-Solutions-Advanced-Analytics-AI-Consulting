---
name: 04-equity-pipeline
description: |
  Use when building the equity data pipeline — fetching, computing, and assembling
  the full pre-computed payload for stocks and shares (TSLA, AAPL, NVDA, etc.).
  Covers all data sources, Python model execution, and payload assembly for equities.
---

# Equity Pipeline

## Goal
Build the default pipeline that runs for all classified EQUITY assets. Fetches all
three data tiers, runs Python computation models, scores data quality, and assembles
the pre-computed JSON payload to be sent to Claude.

## Data Sources — Full List (Equity)

| Source | Data | Tier | Refresh |
|---|---|---|---|
| yfinance | OHLCV, company info, peers | 3 | Daily |
| SEC EDGAR | 10-K/10-Q language delta | 1 | On filing |
| Financial Modeling Prep | 13F, consensus, earnings dates, Form 4 | 1/2 | Weekly + webhook |
| CBOE / Polygon.io | IV rank, term structure, options events | 2/3 | Live |
| FRED | Fed rate, yield curve, CPI, credit spreads | 2 | On release |
| Grok API (xAI) | X/Twitter sentiment (full firehose) | 3 | Daily |
| Reddit API | Reddit sentiment (r/stocks, r/investing, r/wallstreetbets) | 3 | Daily |
| NewsAPI | News sentiment, top headlines | 3 | Daily |
| Quantus DB | Static Tier 1 data, transcript corpus, signal history | 1 | On event |
| Knowledge Graph | Cross-ticker relationships | 1 | On event |

## Python Computation Models

Run in this exact order — each feeds into the next:

```python
# Step 1: Price & Technical (yfinance → pandas)
ohlcv = fetch_ohlcv(ticker, period="2y")
rsi = compute_rsi(ohlcv, period=14)
macd = compute_macd(ohlcv)
bollinger = compute_bollinger(ohlcv, period=20, std=2)
zscore = compute_zscore(ohlcv["close"], window=90)

# Step 2: Regime Detection (hmmlearn / ruptures)
regime = detect_regime(ohlcv, asset_class="EQUITY")
# Returns: label + confidence + active/suppressed strategies

# Step 3: Forecast Ensemble
arima = run_arima(ohlcv, steps=30)
prophet = run_prophet(ohlcv, steps=30)
lstm = run_lstm(ohlcv, steps=30)           # pre-trained model loaded from Modal
ensemble = compute_ensemble(arima, prophet, lstm, regime=regime)
# Weights: LSTM 45%, Prophet 35%, ARIMA 20% (regime-adjusted)

# Step 4: Risk Models (scipy Monte Carlo)
var_99 = compute_var(ohlcv, confidence=0.99, per_notional=10000)
expected_shortfall = compute_es(ohlcv, confidence=0.99)
stress_tests = run_stress_tests(ohlcv)     # 2008, COVID, 2022

# Step 5: ML Feature Importance (scikit-learn)
shap_values = compute_shap(ohlcv, features=[rsi, macd, sentiment, flow_delta])

# Step 6: Pairs Trading (statsmodels)
cointegration = compute_cointegration(ticker, peers=peer_group)

# Step 7: Sentiment (parallel async calls)
grok = await fetch_grok_sentiment(ticker, company_name)
reddit = await fetch_reddit_sentiment(ticker)
news = await fetch_news_sentiment(ticker, company_name)
composite_sentiment = weighted_average(grok, reddit, news)

# Step 8: Alternative Data (parallel async)
flow_13f = fetch_institutional_flow(ticker)     # from DB (Tier 1)
insider = fetch_insider_activity(ticker)         # Form 4 (Tier 2)
short_interest = fetch_short_interest(ticker)    # bi-weekly (Tier 2)

# Step 9: Kelly Criterion
kelly = compute_kelly(
    win_rate=historical_accuracy,
    win_loss_ratio=avg_win / avg_loss,
    max_position=0.10    # cap at 10%
)

# Step 10: Portfolio Fit
sharpe_improvement = compute_sharpe_delta(ticker, benchmark_portfolio)

# Step 11: Data Quality Scoring
quality_scores = score_all_fields(payload_fields)

# Step 12: Assemble QuantusPayload
payload = assemble_payload(**all_above)
validate_payload(payload)    # schema validation before Claude call
```

## Grok API Query (Equity)
```python
query = f'"{ticker}" OR "${ticker}" OR "{company_name}" stock'
filters = {
    "language": "en",
    "context": "financial",
    "min_account_age_days": 30,   # bot filter
    "deduplicate": True,
}
# Campaign detection: flag if >40% volume from accounts <30 days old
# or if sentiment spike >3 SD from 90-day baseline
```

## Stress Test Scenarios
Always run all three — never skip:
```python
STRESS_SCENARIOS = {
    "2008_gfc": {"market_shock": -0.45, "recovery_months": 18},
    "covid_2020": {"market_shock": -0.30, "recovery_months": 5},
    "inflation_2022": {"market_shock": -0.35, "recovery_months": 12},
}
# Apply historical beta of this ticker vs SPY for each scenario
# Return: estimated return % + historical recovery time
```

## Kelly Criterion — Equity Only
```python
# Used in Section D Strategy Recommendation
# Gated to INSTITUTIONAL tier only in the UI
# Display: "Kelly-derived max: 8% — recommended position: 4-6%"
# Always cap at 10% regardless of Kelly output
# Add note: "Kelly assumes uncorrelated bets — reduce in correlated portfolios"
```

## Circuit Breakers — Equity Pipeline
```python
CIRCUIT_BREAKERS = {
    "grok_api":            {"fallback": "finbert_newsapi_reddit", "confidence_impact": -11},
    "yfinance":            {"fallback": "alpha_vantage", "confidence_impact": -5},
    "financial_modeling":  {"fallback": "sec_edgar_direct", "confidence_impact": -8},
    "fred_api":            {"fallback": "cached_macro_tier2", "confidence_impact": -6},
    "cboe_options":        {"fallback": "estimated_iv_from_price", "confidence_impact": -7},
    "sec_edgar":           {"fallback": "cached_tier1_db", "confidence_impact": -3},
    "anthropic_api":       {"fallback": "queue_and_notify", "confidence_impact": 0},
}
# Circuit breaker states: Closed → Open (3 failures in 60s) → Half-Open (retry 30s)
```

## Confidence Score Composition (Equity)
```python
CONFIDENCE_WEIGHTS = {
    "momentum":                 20,   # RSI, MACD, regime alignment
    "sentiment":                15,   # Grok, Reddit, News composite
    "regime_alignment":         15,   # signal direction matches regime type
    "model_ensemble_agreement": 15,   # LSTM/Prophet/ARIMA directional agreement
    "alternative_data":         15,   # 13F, insider, IV rank
    "macro_context":            10,   # Fed rate, yield curve, VIX
    "data_quality":             10,   # avg quality score across all fields
    # TOTAL:                   100
}
# Subtract circuit breaker confidence impacts from relevant weights
```

## Constraints
- All Python computation must complete before Claude is called
- Total pipeline execution target: <60 seconds for full report
- LSTM model loaded from Modal — never train inline
- Kelly position sizing NEVER shown to FREE or UNLOCKED tiers
- All stress tests must run — partial stress test output is not acceptable
- Insider transaction data always shown with SEC Form 4 filing date
- Cross-ticker knowledge graph checked on every run — never skip
