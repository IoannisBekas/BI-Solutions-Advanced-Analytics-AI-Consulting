---
name: 12-screener-portfolio
description: |
  Use when building the Screener Mode, Portfolio Analyzer, Comparison Mode,
  or Watchlist Dashboard. Screener queries cached reports — zero Claude API calls.
  Portfolio aggregates individual cached reports into portfolio-level view.
  Comparison Mode uses a single Claude API call for both tickers simultaneously.
---

# Screener, Portfolio Analyzer & Comparison Mode

## Screener Mode

### Core Principle
Screener queries run against Quantus database of cached reports — ZERO Claude API calls.
Results are instant (Redis + PostgreSQL index queries). No new reports generated.

### Available Filters (all asset classes)
```python
SCREENER_FILTERS = {
    # Universal
    "signal":          ["STRONG_BUY", "BUY", "NEUTRAL", "SELL", "STRONG_SELL"],
    "confidence_min":  int,          # minimum confidence score (0-100)
    "regime":          [RegimeLabel], # one or more regime types
    "asset_class":     ["EQUITY", "CRYPTO", "COMMODITY", "ETF"],  # NEW
    "market_cap_range": (float, float),  # USD
    "momentum_min":    float,         # momentum score threshold
    "sentiment_min":   float,         # sentiment score threshold
    "var_max":         float,         # max acceptable VaR per $10k
    "quantus_accuracy_min": float,    # min historical accuracy for this ticker
    "engine_version":  str,           # current only or all

    # Equity-specific
    "sector":          list[str],
    "industry":        list[str],
    "earnings_days_min": int,         # "earnings more than X days away"
    "factor_quintile": int,           # 1-5 factor score quintile
    "short_interest_max": float,

    # Crypto-specific
    "mvrv_zscore_max": float,         # "not overvalued" filter
    "fear_greed_min":  int,           # min Fear & Greed index

    # Commodity-specific
    "futures_structure": ["contango", "backwardation"],
    "cot_signal":      ["bullish", "bearish", "neutral"],

    # ETF-specific
    "nav_premium_max": float,         # max premium to NAV
    "aum_min":         float,         # minimum AUM (USD)
    "expense_ratio_max": float,
}
```

### Example Screener Query
```python
query = ScreenerQuery(
    signal=["STRONG_BUY", "BUY"],
    regime=["STRONG_UPTREND", "UPTREND"],
    asset_class=["EQUITY"],
    sector=["Technology", "Semiconductors"],
    earnings_days_min=30,
    confidence_min=75,
    market_cap_range=(10_000_000_000, None),  # large cap only
)
# Returns: ranked list of matching tickers with mini-cards
# Sorted by: confidence DESC, then signal strength DESC
```

### Screener Result Card
```typescript
interface ScreenerResultCard {
  ticker: string
  displayName: string
  assetClass: AssetClass
  assetClassBadge: string
  signal: SignalLevel
  confidence: number
  regime: RegimeLabel
  forecastPct: number
  keyMetric: string           // most relevant metric for this asset class
  cachedReportAge: string     // "generated 4h ago"
  reportId: string
  onClickAction: "load_cached_report"  // always instant — never re-generate
}
```

### Screener Features
- Results exportable as CSV or PDF table
- Queries saveable to account (up to 3 saved queries for Unlocked, unlimited for Institutional)
- New tickers matching saved screener → email alert (opt-in)
- Max results: 50 per query (paginated)
- Query execution time target: <500ms (Redis index + PostgreSQL)

---

## Portfolio Analyzer

### Core Principle
Aggregates individual cached reports into a portfolio-level view.
Minimal additional Claude API calls — computation is Python-only aggregation.
Data vintage: always show oldest report timestamp across all holdings.

### Input Schema
```typescript
interface PortfolioInput {
  holdings: {
    ticker: string        // resolves via search resolution layer
    weightPct: number     // user-defined portfolio weight
    quantity?: number     // optional — for dollar P&L calculation
    avgCostBasis?: number // optional
  }[]
  currency: string        // user's preferred display currency
  baseCurrency: string    // portfolio base currency
}
```

### Portfolio-Level Outputs

```python
class PortfolioAnalysis:
    # Regime Exposure Breakdown
    regime_exposure: dict  # {"STRONG_UPTREND": 0.62, "MEAN_REVERTING": 0.28, ...}
    regime_exposure_note: str  # "62% of holdings in uptrend regime"

    # Aggregate Signal (weighted average of individual signals)
    aggregate_signal: SignalLevel
    aggregate_confidence: float

    # Risk Aggregation
    portfolio_var_99: float          # aggregate VaR (Monte Carlo with correlation)
    var_contribution: dict           # {ticker: var_contribution_pct}
    portfolio_expected_shortfall: float
    stress_test_portfolio: dict      # 2008/COVID/2022 at portfolio level

    # Concentration Risk
    top_5_concentration: float       # weight of top 5 positions
    concentration_flag: bool         # True if top 3 > 50%

    # Correlation
    correlation_heatmap: dict        # {(ticker_a, ticker_b): correlation}
    highly_correlated_pairs: list    # pairs with |correlation| > 0.8

    # Factor Tilt (equity holdings only)
    aggregate_factor_exposure: dict  # {value: x, momentum: y, quality: z, low_vol: w}
    factor_tilt_chart_data: list

    # Diversification
    diversification_score: float     # 0-100
    diversification_vs_peers: str

    # Asset Class Mix (NEW)
    asset_class_breakdown: dict      # {EQUITY: 0.70, CRYPTO: 0.15, COMMODITY: 0.15}

    # Knowledge Graph Risk
    supply_chain_dependencies: list  # cross-ticker risks within portfolio
    # e.g. "NVDA (15%) and TSLA (8%) both depend on TSMC — concentration risk"

    # Earnings Calendar (equity/ETF only)
    upcoming_earnings: list          # {ticker, date, implied_move, weight_in_portfolio}

    # Improvement Suggestions
    sharpe_improvement_suggestions: list  # [{replace: X, with: Y, sharpe_delta: 0.14}]

    # Data Vintage (IMPORTANT)
    oldest_report_timestamp: str     # "Portfolio analysis based on data as of {date}"
    holdings_report_ages: dict       # {ticker: age_hours}
    stale_holdings: list             # holdings with reports >48h old (flag for refresh)
```

### Data Vintage UI Notice
```typescript
// Always shown at top of Portfolio Analyzer
const DataVintageNotice = () => (
  <Alert variant="info">
    Portfolio analysis based on data as of {oldestReportTimestamp}.
    {staleHoldings.length > 0 && (
      <> {staleHoldings.length} holdings have reports older than 48 hours.
      <RefreshButton onClick={refreshStaleHoldings}>Refresh all</RefreshButton></>
    )}
  </Alert>
)
```

---

## Comparison Mode

### Core Principle
Single Claude API call with both tickers in shared context.
System prompt sent once. Claude generates comparative narrative simultaneously.
~45% token saving vs two independent calls.

### Implementation
```python
async def generate_comparison_report(
    ticker_a: str,
    ticker_b: str,
    user: User,
) -> ComparisonReport:
    # 1. Fetch both payloads in parallel
    payload_a, payload_b = await asyncio.gather(
        build_payload(ticker_a),
        build_payload(ticker_b),
    )

    # 2. Single Claude call with both payloads
    comparison_prompt = f"""
    Generate a comparative analysis of {ticker_a} vs {ticker_b}.
    
    {ticker_a} PAYLOAD:
    {json.dumps(payload_a.dict())}
    
    {ticker_b} PAYLOAD:
    {json.dumps(payload_b.dict())}
    
    Produce the comparison JSON schema including:
    - Head-to-head metric table
    - Winner determination per metric
    - Plain-English verdict ("Which should I choose?")
    - Knowledge graph relationship disclosure (if applicable)
    - Asset class note (if different asset classes compared)
    """

    response = await call_claude_realtime(comparison_prompt)
    return parse_comparison_response(response)
```

### Head-to-Head Table
```typescript
interface ComparisonTable {
  metrics: {
    label: string          // "Regime" | "Signal" | "Confidence" | etc.
    valueA: string
    valueB: string
    winner: "A" | "B" | "tie" | null
    winnerNote?: string    // "Higher momentum score"
  }[]
  knowledgeGraphNote?: string  // "NVDA is a customer of TSMC — not independent"
  assetClassNote?: string      // "Comparing Equity vs Crypto — different risk profiles"
  plainEnglishVerdict: string  // "Which should I choose?"
}
```

### Comparison Report Features
- Unique Report ID for comparison: `CMP-2026-00123`
- Shareable URL: `bisolutions.group/compare/NVDA-vs-AMD`
- Both tickers pre-fetched in parallel (same as hero input)
- If tickers from different asset classes: prominent notice at top
  "You are comparing an Equity (TSLA) with a Cryptocurrency (BTC).
   These assets have fundamentally different risk profiles and signals."

---

## Watchlist Dashboard

### Card Layout
```typescript
interface WatchlistCard {
  ticker: string
  displayName: string
  assetClass: AssetClass        // badge shown
  regimeBadge: RegimeLabel
  signalBadge: SignalLevel
  confidence: number
  momentumPill: string
  sentimentPill: string
  // Asset-class specific pill:
  assetSpecificPill: string     // Crypto: Fear&Greed | Commodity: COT | ETF: Fund Flows
  earningsFlag?: EarningsFlag   // equity/ETF only
  forecastPct: number
  knowledgeGraphAlert?: string  // amber banner if active
  lastUpdated: string
  nextRefresh: string
  engineVersion: string
  researcherCount: number
  dataFreshness: "fresh" | "aging" | "stale"  // >24h = aging, >48h = stale
}
```

## Constraints
- Screener NEVER triggers new Claude API calls — cached reports only
- Portfolio aggregation NEVER triggers new Claude API calls — Python-only
- Comparison Mode: ONE Claude call for both tickers — never two separate calls
- Data vintage ALWAYS shown in Portfolio Analyzer — never hide report age
- Stale holdings (>48h) flagged with visual indicator on watchlist cards
- Screener max 50 results per query — never unlimited (performance + UX)
- Comparison between different asset classes: always show asset class difference notice
- Portfolio analyzer: covariance matrix calculation uses synchronized timestamps
  where possible — note vintage skew when timestamps differ by >24h
