---
name: 08-report-generation
description: |
  Use when building or modifying the report output UI — Sections A through E,
  the Progressive Insight Feed, Welcome Card, Executive Summary, signal cards,
  Deep Dives, Accuracy Tracker, or the report header. Defines layout, data
  binding, section structure, and the "so what?" principle for all report content.
---

# Report Generation — Sections A–E

## Core Principle
Every section must answer "so what?" — never state a fact without its implication.
House style: concise, authoritative, zero filler.
Banned vocabulary: "it's worth noting", "it is important to remember",
"needless to say", "as we can see", "it should be noted", "clearly", "obviously".

## Report Header (always rendered first)
```typescript
interface ReportHeader {
  companyLogo: string
  companyName: string
  ticker: string
  exchange: string
  assetClassBadge: "EQUITY" | "CRYPTO" | "COMMODITY" | "ETF"  // NEW
  sector: string
  industry: string
  marketCap: string
  timestamp: string
  reportId: string           // QRS-2026-00847
  engineVersion: string      // Meridian v2.4
  researcherCount: number    // "👥 23 researchers"
  communityInterest?: string // "🔥 NVDA searches ↑ 340% (48h)"

  // Regime badge — prominent, color-coded
  regime: {
    label: RegimeLabel
    implication: string       // plain-English: "Momentum active — mean reversion suppressed"
    activeStrategies: string[]
    suppressedStrategies: string[]
  }

  // Overall signal
  signal: SignalLevel          // STRONG BUY | BUY | NEUTRAL | SELL | STRONG SELL
  confidenceScore: number      // 0-100
  confidenceBreakdown: ConfidenceBreakdown  // expandable on click

  crossTickerAlerts?: CrossTickerAlert[]
  earningsFlag?: EarningsFlag  // equity/ETF only — null for crypto/commodity

  actionButtons: ["Export PDF", "Share Report", "Set Alert", "Subscribe", "Watchlist", "Annotate"]
}
```

## Section A — Executive Summary

Layout: 4–5 headline signal cards + natural language summary + peer radar chart

```typescript
interface SignalCard {
  icon: string           // "📈" | "⚠️" | "💬" | "🔬" | "📊"
  label: string          // "Momentum Signal"
  value: string          // "Bullish ↑"
  confidence: number     // 82
  trend: "up" | "down" | "neutral"
  oneLiner: string       // plain-English implication
  dataFreshness: string  // "RSI 67.3 · live · 4 min ago"
  userFeedback: null | "up" | "down"   // 👍👎
}
```

Signal cards shown (adapt by asset class):
- **Equity:** Momentum, Sentiment, Risk Level, Forecast, Factor Score
- **Crypto:** Momentum, Sentiment, On-Chain (replaces Factor), Risk Level, Forecast
- **Commodity:** Momentum, Macro/COT (replaces Sentiment), Risk Level, Forecast, Seasonal
- **ETF:** Momentum, Fund Flows (replaces Factor), Risk Level, Forecast, NAV Premium

## Section B — Opportunity (tabbed)

### [Forecast] tab — all asset classes
- Model ensemble: LSTM vs Prophet vs ARIMA — weights + 30-day accuracy
- Shaded confidence band (NEVER point estimates)
- Regime accuracy note: "In {regime} regimes, Meridian achieved X% accuracy on
  30-day forecasts for {asset_class} assets"
- Earnings event adjustment flag (equity/ETF only)

### [Momentum] tab — all asset classes
- Regime context FIRST — always lead with regime
- RSI, MACD, Bollinger Band pills
- Mean reversion signal + SD context
- Entry/exit zone chart with shaded bands
- Peer momentum comparison (equity: vs peer group | ETF: vs benchmark | crypto: vs BTC | commodity: vs sector)
- **Crypto addition:** Funding rate pill + interpretation

### [Sentiment] tab — equity/ETF
- Grok/X: score + volume + campaign detection status
- Reddit: score + volume + relevant subreddits
- News: score + top 3 headlines (paraphrased — no direct quotes)
- Earnings call NLP (equity only)
- SEC language delta (equity only)

### [On-Chain Data] tab — crypto ONLY (replaces Alternative Data)
- Exchange net flow chart + signal
- MVRV Z-score gauge
- Active addresses trend
- Funding rate bar
- Liquidation cluster heatmap
- Open interest change
- Fear & Greed Index history

### [Macro & Fundamentals] tab — commodity ONLY (replaces Alternative Data)
- Real yield + correlation to commodity
- DXY level + trend
- COT positioning chart (specs vs commercials)
- Futures term structure chart
- Seasonal pattern overlay
- Supply/demand fundamental

### [Alternative Data] tab — equity/ETF only
- 13F institutional flow (equity) / Fund flows (ETF)
- Insider activity (equity) / NAV premium (ETF)
- Short interest
- IV rank + implied move
- Quantus community interest signal

## Section C — Risk

```typescript
interface RiskSection {
  riskBadge: "Low" | "Moderate" | "Elevated" | "High" | "Extreme"
  macroRegimeOverlay: {
    fedRate: string
    yieldCurveShape: string
    vixLevel: number
    historicalContext: string   // "This macro combination has preceded..."
  }
  keyRiskCards: RiskCard[]
  stressTests: StressTest[]     // always all 3: 2008 / COVID / 2022
  crossTickerRisks?: string[]   // knowledge graph supply chain
  assetSpecificRisks: string[]  // crypto | commodity | ETF specific additions
}
```

Risk expressed in USER CURRENCY, per $10,000 notional:
- "Up to -$420 per $10,000 invested (99% confidence, daily)"
- Never express VaR as a percentage alone — always dollar-denominate

## Section D — Strategy Recommendation

**CRITICAL: Entry zones, stop-losses, and position sizing gated to INSTITUTIONAL tier only.**
Free + Unlocked tiers see: signal + confidence + plain-English direction only.

```typescript
interface StrategySection {
  // Shown to ALL tiers:
  action: SignalLevel
  confidence: number
  regimeContext: string
  plainEnglishSummary: string

  // INSTITUTIONAL tier only:
  entryZone?: { low: number; high: number }
  target?: number
  stopLoss?: number
  riskReward?: string      // "1:2.3"
  positionSizePct?: string // "4-6%" (equity Kelly) | "1-2.5%" (crypto vol-adj)
  positionSizingMethod?: "Kelly" | "Vol-Adjusted"  // never use Kelly for crypto/commodity

  earningsAdjustmentNote?: string  // equity/ETF only
  pairsTrade?: PairsTradeOpportunity
  portfolioFit?: { sharpeImprovement: number }
}
```

## Section E — Deep Dives (12 modules, on-demand only)

Generated ONLY when user expands — never pre-generated. Each call:
- Uses cached static system prompt
- Receives pre-computed metrics for that module only
- Cached immediately for all users
- Loading: slim progress bar + "~8 seconds"

**Active Deep Dive modules per asset class:**

| Module | Equity | Crypto | Commodity | ETF |
|---|---|---|---|---|
| 1. Time Series Forecasting | ✓ | ✓ | ✓ | ✓ |
| 2. Mean Reversion | ✓ | ✓ | ✓ | ✓ |
| 3. Sentiment Analysis | ✓ | ✓ | ✓ | ✓ |
| 4. Portfolio Optimization | ✓ | ✓ | ✓ | ✓ |
| 5. ML Feature Importance (SHAP) | ✓ | ✓ | ✓ | ✓ |
| 6. High-Frequency Signal | ✓ | ✓ | — | ✓ |
| 7. Risk Management & VaR | ✓ | ✓ | ✓ | ✓ |
| 8. Options Pricing & Greeks | ✓ | — | ✓ | ✓ |
| 9. Pairs Trading | ✓ | ✓ | ✓ | ✓ |
| 10. ML Backtesting | ✓ | ✓ | ✓ | ✓ |
| 11. Reinforcement Learning Agent | ✓ | ✓ | — | ✓ |
| 12. Factor Investing | ✓ | — | — | ✓ |
| 12. On-Chain Deep Dive | — | ✓ | — | — |
| 12. COT & Macro Analysis | — | — | ✓ | — |

## Accuracy Tracker (shown when ≥ 3 historical signals exist)

```typescript
interface AccuracyTracker {
  signals: HistoricalSignal[]   // paginated, most recent first
  overallAccuracy: number       // only shown if ≥50 resolved signals
  accuracyByEngine: Record<string, { accuracy: number; sampleSize: number }>
  minimumThresholdMet: boolean
  inceptionDate: string         // always shown alongside accuracy figures
  methodology: string           // "Signal measured at generation. Outcome at 30 calendar days."
  disclaimer: string            // "Past performance does not guarantee future results."
}
```

## Constraints
- "So what?" must be answerable by every sentence Claude writes
- Data freshness indicator required on every metric shown in the UI
- User feedback 👍👎 on every signal card → feeds training data
- Report annotation: users can add private notes to any section
- Section order is user-preference adaptive (long-term investor = fundamentals first)
- Deep Dives must show "~8 seconds" loading estimate — never hide wait time
- Accuracy Tracker hidden until ≥50 resolved signals — show "Track record accumulating" before threshold
- Plain-English toggle on every section (default on; technical detail opt-in)
