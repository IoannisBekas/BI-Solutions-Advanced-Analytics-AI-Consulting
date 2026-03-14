---
name: 06-commodity-pipeline
description: |
  Use when building the commodity pipeline for Gold, Silver, Oil, Natural Gas,
  Copper, Wheat, and other commodities. Adds COT report, futures term structure,
  real yield correlation, DXY overlay, and seasonal patterns. Removes all
  equity and crypto-specific data.
---

# Commodity Pipeline

## Goal
Build the pipeline for COMMODITY assets (Gold → GC=F, Oil → CL=F, etc.). Adds
macro-driven and futures-specific data sources. Removes all company-specific data.

## Ticker Mapping
```python
COMMODITY_TICKER_MAP = {
    "GOLD": "GC=F",     "SILVER": "SI=F",
    "OIL": "CL=F",      "CRUDE OIL": "CL=F",
    "NATURAL GAS": "NG=F", "NATGAS": "NG=F",
    "COPPER": "HG=F",   "WHEAT": "ZW=F",
    "CORN": "ZC=F",     "SOYBEANS": "ZS=F",
}
```

## ADDED — Commodity-Specific Data Sources
| Source | Data | Tier | Refresh |
|---|---|---|---|
| CFTC | COT (Commitment of Traders) report | 2 | Weekly (Tuesday) |
| FRED | Real yield (TIPS), DXY, CPI, PCE | 2 | On release |
| EIA | Oil/NatGas supply & demand | 2 | Weekly |
| World Gold Council | Gold demand, central bank buying | 1 | Monthly |
| USDA | Agricultural supply/demand (WASDE) | 1 | Monthly |
| yfinance | Futures OHLCV (GC=F format) | 3 | Daily |

## REMOVED — Inapplicable for Commodities
```python
DISABLED_FOR_COMMODITY = [
    "institutional_holdings_13f",
    "insider_transactions",
    "earnings_date", "earnings_transcript_nlp",
    "sec_filings",
    "analyst_consensus",
    "short_interest_pct",
    "factor_scores",            # P/E, P/B — no company fundamentals
    "knowledge_graph",          # no company relationships
    "kelly_criterion",          # futures-specific sizing used instead
    "on_chain_data",            # crypto-specific
    "fear_greed_index",         # crypto-specific
]
```

## COT Report Module

```python
async def fetch_cot_data(futures_ticker: str) -> dict:
    # CFTC publishes weekly — available every Tuesday for prior week
    # Fetch via CFTC public API or Quandl/Nasdaq Data Link

    cot = await cftc_api.get_cot(futures_ticker)
    return {
        "commercial_net_position": cot["commercial_long"] - cot["commercial_short"],
        "noncommercial_net_position": cot["noncom_long"] - cot["noncom_short"],
        # Commercial = hedgers (producers/consumers) — smart money
        # Non-commercial = speculators (funds, retail) — trend following
        "speculator_sentiment": classify_speculator_positioning(cot),
        # "Extreme long" | "Moderately long" | "Neutral" | "Moderately short" | "Extreme short"
        "commercial_vs_spec_divergence": detect_divergence(cot),
        # When commercials buy while specs sell = contrarian bullish signal
        "cot_signal": derive_cot_signal(cot),
        "freshness": cot["report_date"],
        "source": "CFTC Commitments of Traders",
    }
```

## Futures Term Structure Module

```python
async def fetch_futures_curve(commodity: str) -> dict:
    # Fetch front month and next 3-6 contracts from yfinance or Quandl
    contracts = await fetch_futures_chain(commodity, months=6)

    front_month_price = contracts[0]["price"]
    twelve_month_price = contracts[-1]["price"]
    spread = twelve_month_price - front_month_price

    return {
        "structure": "contango" if spread > 0 else "backwardation",
        "front_to_12m_spread_pct": spread / front_month_price * 100,
        "roll_yield_annual": compute_roll_yield(contracts),
        # Contango = negative roll yield (cost to hold)
        # Backwardation = positive roll yield (benefit to hold)
        "term_structure_chart_data": contracts,
        "implication": (
            "Backwardation suggests physical supply tightness — historically bullish."
            if spread < 0 else
            "Contango creates negative roll yield drag for long positions."
        ),
    }
```

## Macro Correlation Module (Gold-specific, adaptable)

```python
async def fetch_commodity_macro_context(commodity: str) -> dict:
    context = {}

    # Real Yield (FRED: DFII10 — 10yr TIPS yield)
    real_yield = await fred.get_series("DFII10")
    context["real_yield_10yr"] = real_yield["value"]
    context["real_yield_trend"] = real_yield["30d_change"]
    # Gold historically inversely correlated with real yields

    # DXY (US Dollar Index)
    dxy = await yfinance.get_price("DX-Y.NYB")
    context["dxy_level"] = dxy["price"]
    context["dxy_30d_change"] = dxy["30d_change_pct"]
    # Most commodities inversely correlated with USD

    if commodity in ["GC=F", "SI=F"]:  # Precious metals
        context["correlation_real_yield"] = compute_correlation("GC=F", "DFII10", days=252)
        context["correlation_dxy"] = compute_correlation("GC=F", "DX-Y.NYB", days=252)
        context["gold_implication"] = (
            f"Real yield at {real_yield['value']:.2f}% — "
            + ("headwind for gold." if real_yield['value'] > 1.5 else "supportive for gold.")
        )

    if commodity == "CL=F":  # Oil
        eia = await eia_api.get_weekly_inventory()
        context["crude_inventory_change"] = eia["crude_change_barrels"]
        context["inventory_signal"] = "bullish" if eia["crude_change_barrels"] < 0 else "bearish"

    return context
```

## Seasonal Pattern Module

```python
SEASONAL_PATTERNS = {
    "GC=F": {  # Gold
        "Q1": "historically strong (January effect, Chinese New Year jewelry demand)",
        "Q2": "typically weak (seasonal lull)",
        "Q3": "mixed (summer doldrums)",
        "Q4": "strong (year-end demand, festival season in India)",
    },
    "CL=F": {  # Crude Oil
        "Q1": "weak (low driving demand, refinery maintenance)",
        "Q2": "strengthening (summer driving season build)",
        "Q3": "peak demand (summer driving season)",
        "Q4": "declining (end of driving season)",
    },
    "NG=F": {  # Natural Gas
        "Q1": "high (winter heating demand peak)",
        "Q2": "low (shoulder season)",
        "Q3": "high (air conditioning demand)",
        "Q4": "rising (winter build)",
    },
    "ZW=F": {  # Wheat
        "pattern": "driven by Northern Hemisphere harvest cycle",
        "harvest_pressure_months": [6, 7, 8],  # June-August
    },
}

def get_seasonal_context(commodity: str, current_month: int) -> str:
    # Returns plain-English seasonal context for the current period
```

## Report Section Adaptations

### Section A — Executive Summary
- Replace earnings flag → `Futures curve: [CONTANGO/BACKWARDATION]` badge
- Replace analyst consensus → COT positioning summary
- Add macro overlay: real yield + DXY direction
- Regime note always includes: "Commodity regimes are macro-driven —
  Fed policy, DXY, and geopolitical events are primary regime drivers."

### Section B — Opportunity
- `[Macro & Fundamentals]` replaces `[Alternative Data]` tab:
  - Real yield chart + gold correlation (precious metals)
  - DXY level + commodity correlation
  - COT net positioning chart (specs vs commercials)
  - Futures term structure chart (contango/backwardation)
  - Seasonal pattern overlay chart
  - Supply/demand fundamental (EIA for energy, WGC for gold, USDA for agriculture)

### Section C — Risk
- Standard VaR/ES (unchanged)
- Add commodity-specific risks:
  - Contango drag (for long futures positions)
  - Geopolitical risk (Oil, Gold — conflict/supply disruption sensitivity)
  - Weather risk (agriculture — drought, flood impact on supply)
  - Currency risk (most commodities priced in USD — non-USD investors face FX exposure)
  - Storage/logistics risk note (for physical commodity investors)

### Section D — Strategy
- Futures roll strategy note: "Front-month contract expiry: {DATE}.
  Holders must roll to avoid physical delivery."
- Position sizing: vol-adjusted (same as crypto approach, NOT Kelly)
- Pairs opportunity: precious metals pair (Gold vs Silver GSR — Gold/Silver Ratio)

## Disclaimer — Commodities
```python
COMMODITY_DISCLAIMER = (
    "Commodity trading, including futures contracts, involves substantial risk "
    "of loss and is not appropriate for all investors. Futures positions may "
    "result in losses exceeding the initial investment. This is not financial "
    "or trading advice. Past performance does not guarantee future results."
)
```

## Constraints
- Always show futures contract expiry date and roll date in report header
- Contango/backwardation must be explained in plain English in every report
- COT data lag: always show "COT data as of [date] — published 3 days after collection"
- Real yield and DXY context mandatory for precious metals reports
- Seasonal pattern must be shown as: current season + expected duration
- Never show P/E, earnings, insider data, or analyst ratings for commodities
- Supply/demand source must be cited: EIA (energy), WGC (gold), USDA (agriculture)
