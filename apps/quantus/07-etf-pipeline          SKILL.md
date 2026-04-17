---
name: 07-etf-pipeline
description: |
  Use when building the ETF pipeline for SPY, QQQ, GLD, ARKK, and other exchange
  traded funds. Hybrid pipeline — equity-like signals plus ETF-specific overlays
  (NAV premium, fund flows, holdings breakdown). Smart-routes commodity ETFs (GLD)
  to commodity pipeline and crypto ETFs (IBIT) to crypto pipeline.
---

# ETF Pipeline

## Goal
Build the hybrid pipeline for ETF assets. Leverages the equity pipeline as a
base and adds ETF-specific data overlays. Smart-routes specialized ETFs to
their underlying asset class pipeline with an ETF overlay layer on top.

## Smart Routing for Specialized ETFs

```python
COMMODITY_ETFS = ["GLD", "IAU", "SLV", "USO", "BNO", "UNG", "PDBC"]
CRYPTO_ETFS = ["IBIT", "FBTC", "ETHA", "BITB", "ARKB"]
LEVERAGED_ETFS_PREFIX = ["SSO", "QLD", "UPRO", "TQQQ", "SQQQ", "SDS"]

def route_etf(ticker: str) -> tuple[str, str]:
    if ticker in COMMODITY_ETFS:
        return "pipelines.commodity", "etf_overlay"
    if ticker in CRYPTO_ETFS:
        return "pipelines.crypto", "etf_overlay"
    if ticker in LEVERAGED_ETFS_PREFIX or is_leveraged(ticker):
        return "pipelines.etf", "leveraged_overlay"
    return "pipelines.etf", None
```

## ADDED — ETF-Specific Data Sources

```python
async def fetch_etf_specific_data(ticker: str) -> dict:
    # NAV Premium / Discount (ETF-specific risk)
    nav_data = await fetch_nav_premium(ticker)
    # Source: ETF issuer website or Bloomberg
    # Significant premium/discount = arb opportunity or liquidity risk

    # Fund Flows (weekly inflow/outflow)
    flows = await fetch_fund_flows(ticker)
    # Source: ETF.com, VettaFi, or issuer reporting
    # Sustained outflows = redemption pressure signal

    # Expense Ratio + AUM Trend
    meta = await fetch_etf_meta(ticker)
    # Source: Financial Modeling Prep or ETF issuer

    # Top 10 Holdings Breakdown
    holdings = await fetch_etf_holdings(ticker, top_n=10)
    # Source: Financial Modeling Prep or iShares/Vanguard API
    # Returns: [{ticker, name, weight_pct, sector}, ...]

    # Tracking Error (how well it tracks its index)
    tracking_error = compute_tracking_error(ticker, benchmark=meta["index"])

    # Sector/Factor Exposure Breakdown
    exposure = compute_exposure_breakdown(holdings)
    # Returns: {sector: weight, factor: tilt}

    # Index Rebalancing Calendar
    rebalance = fetch_rebalance_schedule(meta["index"])

    return {
        "nav_premium_pct": nav_data["premium_discount_pct"],
        "nav_premium_signal": classify_nav_premium(nav_data),
        "fund_flows_1w": flows["1w_usd"],
        "fund_flows_4w": flows["4w_usd"],
        "flow_trend": flows["trend"],  # "inflow" | "outflow" | "neutral"
        "aum_usd": meta["aum"],
        "expense_ratio": meta["expense_ratio"],
        "index_tracked": meta["index"],
        "tracking_error_annualised": tracking_error,
        "top_holdings": holdings,
        "sector_exposure": exposure["sector"],
        "factor_tilt": exposure["factor"],
        "next_rebalance_date": rebalance["next_date"],
        "rebalance_frequency": rebalance["frequency"],
    }
```

## REMOVED — Inapplicable for ETFs

```python
DISABLED_FOR_ETF = [
    "earnings_date",            # ETFs have no earnings
    "earnings_transcript_nlp",  # No earnings calls
    "insider_transactions",     # Irrelevant at ETF level
    "sec_10k_10q",             # ETFs file N-CSR not 10-K
    "knowledge_graph",          # Company-specific — not applicable
    "kelly_criterion",          # Replaced by vol-adjusted sizing
]
# Short interest: kept but noted as less meaningful for ETFs
# Analyst consensus: replaced with fund flow sentiment
```

## Leveraged ETF Overlay

```python
def apply_leveraged_etf_overlay(report: dict, leverage_factor: float) -> dict:
    # Mandatory warnings for leveraged ETFs:
    report["leveraged_etf_warnings"] = [
        f"This is a {leverage_factor}x leveraged ETF. It is designed for "
        f"SHORT-TERM TRADING ONLY — not buy-and-hold investing.",
        "Volatility decay (beta slippage) erodes returns in volatile/sideways markets.",
        f"In a -10% underlying move, this ETF loses approximately "
        f"{abs(leverage_factor) * 10}% — not including decay.",
        "Daily rebalancing creates compounding effects that diverge from "
        f"{leverage_factor}x the underlying index over multi-day periods.",
    ]
    # Scale VaR by leverage factor
    report["var_99"] = report["var_99"] * abs(leverage_factor) * 1.2  # add 20% for decay
    # Reduce maximum position sizing
    report["max_position_pct"] = min(report["max_position_pct"] / leverage_factor, 2.0)
    return report
```

## Report Section Adaptations

### Section A — Executive Summary
- Replace earnings flag → "Next index rebalance: {DATE}" (if within 30 days)
- Add NAV premium/discount badge
- Fund flow trend replaces analyst consensus:
  - Inflow (4w): $2.3B → signal: accumulation
  - Outflow (4w): $1.1B → signal: distribution

### Section B — Opportunity
- `[Holdings & Exposure]` replaces `[Alternative Data]` tab:
  - Top 10 holdings table with weights
  - Sector exposure pie chart
  - Factor tilt bar chart (value/growth/quality/momentum exposure)
  - NAV premium/discount history chart
  - Fund flows chart (weekly, 12-week window)
  - Tracking error vs benchmark
  - Expense ratio context ("Lower than X% of peers in this category")
- `[Momentum]` and `[Forecast]` tabs unchanged from equity

### Section C — Risk
- Standard VaR/ES (unchanged, but scaled for leveraged ETFs)
- Add ETF-specific risks:
  - NAV premium risk: "Trading at X% premium to NAV — potential mean reversion"
  - Concentration risk: "Top 10 holdings = X% of fund"
  - Counterparty risk (synthetic ETFs only)
  - Liquidity risk (small AUM ETFs: AUM < $100M flagged)
  - Index reconstitution risk

### Section D — Strategy
- Position sizing: vol-adjusted
- Note for leveraged ETFs: mandatory short-term-only disclaimer
- Pairs opportunity: ETF vs benchmark index

## Constraints
- NAV premium/discount must always be shown for ETF reports — never omit
- Leveraged ETF warnings are mandatory and non-suppressible
- For commodity/crypto ETFs: show both the ETF-specific data AND the underlying
  asset class signals (e.g. GLD shows gold macro context + ETF flows)
- AUM < $100M: always flag liquidity risk
- Expense ratio must always be shown with peer comparison
- Holdings breakdown capped at top 10 — never show full portfolio
