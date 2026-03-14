---
name: 01-asset-class-router
description: |
  Use when building or modifying the asset classification layer — the Python
  module that detects whether a ticker is an Equity, Crypto, Commodity, or ETF
  and routes it to the correct data pipeline before any API call is made.
---

# Asset Class Router

## Goal
Build the first Python module that runs on every report request — before any data
is fetched and before Claude is called. It classifies the input and returns the
correct pipeline identifier, asset metadata, and disclaimer variant.

## Architecture
This module sits at Step 0 of the report pipeline:
```
User Input → Search Resolution → [ASSET CLASS ROUTER] → Pipeline A/B/C/D → Claude
```

## Instructions

### 1. Classification Logic (priority order)
```python
def classify_asset(ticker: str) -> AssetClass:
    # 1. Exact match against Quantus asset registry (Redis lookup, <5ms)
    # 2. yfinance quoteType field:
    #    "EQUITY"       → AssetClass.EQUITY
    #    "CRYPTOCURRENCY" → AssetClass.CRYPTO
    #    "ETF"          → AssetClass.ETF
    #    "MUTUALFUND"   → AssetClass.ETF  (simplified)
    #    "FUTURE"       → AssetClass.COMMODITY
    # 3. Fallback: default to EQUITY with disclosure flag
```

### 2. Return Contract
The router must return an `AssetContext` dataclass:
```python
@dataclass
class AssetContext:
    asset_class: Literal["EQUITY", "CRYPTO", "COMMODITY", "ETF"]
    canonical_ticker: str        # e.g. "BTC-USD", "GC=F", "TSLA"
    display_name: str            # e.g. "Bitcoin", "Gold (Futures)", "Tesla, Inc."
    exchange: str
    currency: str                # default "USD"
    pipeline_id: str             # maps to pipeline module
    disclaimer_variant: str      # "US_EQUITY" | "EU_EQUITY" | "CRYPTO_US" | "COMMODITY" etc.
    data_sources_active: list[str]   # which sources apply for this class
    data_sources_removed: list[str]  # which sources are inapplicable (logged, not fetched)
    regime_model_params: dict    # volatility thresholds per asset class
    unknown_fallback: bool       # True if classification was uncertain
```

### 3. Pipeline Routing Map
```python
PIPELINE_MAP = {
    "EQUITY":    "pipelines.equity",
    "CRYPTO":    "pipelines.crypto",
    "COMMODITY": "pipelines.commodity",
    "ETF":       "pipelines.etf",
}
```

### 4. Regime Model Parameters by Asset Class
```python
REGIME_PARAMS = {
    "EQUITY": {
        "strong_uptrend_threshold": 0.15,   # 15% 30d gain
        "high_vol_threshold": 0.30,          # 30% annualised vol
        "downtrend_drawdown": 0.15,
    },
    "CRYPTO": {
        "strong_uptrend_threshold": 0.40,   # 40% 30d gain
        "high_vol_threshold": 0.80,          # 80% annualised vol
        "downtrend_drawdown": 0.30,
        "position_size_reduction": 0.50,     # always reduce 40-60% vs equity
        "market_hours": "24/7",
    },
    "COMMODITY": {
        "strong_uptrend_threshold": 0.10,
        "high_vol_threshold": 0.25,
        "seasonality_aware": True,
    },
    "ETF": {
        # inherits from underlying — set dynamically
        "track_nav_premium": True,
    },
}
```

### 5. Disclosure Handling
- Always attach `disclaimer_variant` to the AssetContext
- The report renderer reads this and injects the correct legal text
- Crypto: include MiCA (EU), FCA (UK), and "not FDIC insured" (US) variants
- Commodity: include futures risk warning
- Never use equity disclaimer for non-equity assets

### 6. Special ETF Routing
For commodity or crypto ETFs, apply hybrid routing:
```python
if asset_class == "ETF":
    underlying = detect_etf_underlying(ticker)
    if underlying in COMMODITY_ETFs:  # GLD, SLV, USO
        pipeline_id = "pipelines.commodity"
        overlay = "etf_overlay"
    elif underlying in CRYPTO_ETFs:   # IBIT, FBTC, ETHA
        pipeline_id = "pipelines.crypto"
        overlay = "etf_overlay"
    else:
        pipeline_id = "pipelines.etf"
```

### 7. Unknown Asset Handling
If classification fails after all checks:
- Set `unknown_fallback = True`
- Default to EQUITY pipeline
- Log to operator dashboard as unresolved classification
- Show user: "Asset class unconfirmed — report generated using equity pipeline.
  Signal accuracy may be reduced."
- Reduce overall confidence score by 10 points

## Constraints
- This module must complete in <100ms — it runs on every request
- Never make external API calls here except yfinance quoteType (cached 24h in Redis)
- Never pass an unclassified asset to the Claude layer
- Never apply equity-specific data sources to non-equity assets
- Log every classification decision with ticker, result, and confidence to the audit trail
- Do not hardcode ticker lists — use the Quantus asset registry (Redis) as the source of truth
