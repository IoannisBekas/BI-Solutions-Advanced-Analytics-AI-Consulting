---
name: 05-crypto-pipeline
description: |
  Use when building the crypto data pipeline for Bitcoin, Ethereum, Solana, and
  other cryptocurrencies. Adds on-chain data sources (Glassnode, CryptoQuant),
  Fear & Greed Index, funding rates, liquidation levels, and removes all
  equity-specific data (earnings, SEC filings, analyst consensus, 13F, Kelly).
---

# Crypto Pipeline

## Goal
Build the pipeline for CRYPTO asset class. Extends the base pipeline with on-chain
data, recalibrated regime detection, crypto-specific sentiment, and vol-adjusted
position sizing. Removes all equity-specific data that is structurally inapplicable.

## Key Differences from Equity Pipeline

### ADDED — Crypto-Specific Data Sources
| Source | Data | Tier | Refresh |
|---|---|---|---|
| Glassnode / CryptoQuant | Exchange net flow, MVRV Z-score, active addresses | 3 | Daily |
| Glassnode | Hash rate (BTC only), stablecoin supply ratio | 2 | Daily |
| Coinglass | Funding rates, open interest, liquidation levels | 3 | Live |
| Alternative.me | Fear & Greed Index (0-100) | 3 | Daily |
| CoinGecko | BTC dominance %, market cap rank | 2 | Daily |

### REMOVED — Inapplicable for Crypto
```python
DISABLED_FOR_CRYPTO = [
    "institutional_holdings_13f",    # No SEC filing equivalent
    "insider_transactions",          # No Form 4 equivalent
    "earnings_date",                 # Crypto has no earnings
    "earnings_transcript_nlp",       # No earnings calls
    "sec_10k_10q_filing",           # No SEC filings
    "analyst_consensus",             # No Buy/Hold/Sell ratings
    "short_interest_pct",           # No float / short interest
    "pe_ratio", "pb_ratio", "roe",  # No fundamental factor scores
    "knowledge_graph",               # No company relationships
    "kelly_criterion",               # Crypto vol invalidates Kelly assumptions
]
```

## On-Chain Data Module

```python
async def fetch_on_chain_data(ticker: str) -> dict:
    base_coin = normalize_ticker(ticker)  # "BTC-USD" → "bitcoin"

    data = {}

    # Exchange Net Flow (bullish signal when negative = coins leaving exchanges)
    data["exchange_net_flow_30d"] = await glassnode.get_exchange_flow(base_coin)
    data["exchange_flow_signal"] = "bullish" if data["exchange_net_flow_30d"] < 0 else "bearish"

    # MVRV Z-Score (market value vs realized value)
    data["mvrv_zscore"] = await glassnode.get_mvrv_zscore(base_coin)
    # Interpretation: >7 = historically overvalued | <0 = historically undervalued

    # Active Addresses (network usage trend)
    data["active_addresses_30d_trend"] = await glassnode.get_active_addresses_trend(base_coin)

    # BTC-specific
    if base_coin == "bitcoin":
        data["hash_rate_trend"] = await glassnode.get_hash_rate_trend()
        # Miner capitulation signal: hash rate drops >20% = potential bottom signal

    # Funding Rates (perpetual futures sentiment proxy)
    data["funding_rate"] = await coinglass.get_funding_rate(ticker)
    # Positive = longs paying shorts (bullish but crowded) | Negative = shorts paying longs

    # Open Interest
    data["open_interest_usd"] = await coinglass.get_open_interest(ticker)
    data["open_interest_change_24h"] = await coinglass.get_oi_change(ticker)

    # Liquidation Levels
    data["liquidation_clusters"] = await coinglass.get_liquidation_map(ticker)
    # Returns: [{"price": x, "usd_amount": y, "side": "long/short"}, ...]

    # Fear & Greed Index
    data["fear_greed_index"] = await alternative_me.get_fear_greed()
    data["fear_greed_label"] = classify_fear_greed(data["fear_greed_index"])

    # BTC Dominance (macro signal for altcoins)
    data["btc_dominance_pct"] = await coingecko.get_btc_dominance()
    if ticker != "BTC-USD":
        data["dominance_note"] = interpret_dominance_for_altcoin(data["btc_dominance_pct"])

    return data
```

## Regime Detection — Crypto Parameters

```python
CRYPTO_REGIME_PARAMS = {
    "strong_uptrend": {
        "threshold_30d_gain": 0.40,     # 40% (vs 15% for equity)
        "vol_max": 1.20,                 # 120% annualised
    },
    "uptrend": {
        "threshold_30d_gain": 0.15,
        "vol_max": 0.80,
    },
    "mean_reverting": {
        "bollinger_band_width_max": 0.05,
        "mvrv_range": (0.8, 1.2),        # MVRV near 1.0
    },
    "high_volatility": {
        "vol_min": 0.80,                  # >80% annualised (vs 30% equity)
    },
    "downtrend": {
        "drawdown_from_high_min": 0.30,   # >30% drawdown (vs 15% equity)
    },
    "strong_downtrend": {
        "drawdown_from_high_min": 0.50,
    },
}

# ALWAYS add this note to any crypto regime label in the report:
REGIME_CAVEAT = (
    "Crypto regimes shift faster and more severely than equity regimes. "
    "Reduce position sizing by 40–60% relative to equity equivalents in all regimes."
)
```

## Grok / X Sentiment — Crypto Query

```python
def build_crypto_sentiment_query(ticker: str, name: str) -> str:
    # e.g. ticker="BTC-USD", name="Bitcoin"
    symbol = ticker.split("-")[0]   # "BTC"
    return f'{name} OR ${symbol} OR #{symbol} OR {name} crypto OR {name} price'

# Additional Reddit sources for crypto:
CRYPTO_SUBREDDITS = {
    "BTC-USD": ["r/Bitcoin", "r/CryptoCurrency"],
    "ETH-USD": ["r/ethereum", "r/CryptoCurrency"],
    "SOL-USD": ["r/solana", "r/CryptoCurrency"],
    "default":  ["r/CryptoCurrency", "r/CryptoMarkets"],
}
# Weight crypto-specific subreddits 2x vs general finance subs
```

## Position Sizing — Vol-Adjusted (replaces Kelly for Crypto)

```python
def compute_crypto_position_size(
    var_99: float,
    portfolio_size: float,
    max_portfolio_risk_pct: float = 0.02,  # max 2% portfolio at risk per position
) -> dict:
    # Maximum position where 99% VaR <= 2% of portfolio
    max_position = (portfolio_size * max_portfolio_risk_pct) / abs(var_99)
    recommended_position = max_position * 0.5  # conservative: half of max

    return {
        "max_position_pct": min(max_position * 100, 5.0),       # hard cap 5%
        "recommended_position_pct": min(recommended_position * 100, 2.5),  # cap 2.5%
        "basis": "99% VaR-adjusted — not Kelly (crypto volatility invalidates Kelly assumptions)",
        "note": "Reduce further if holding multiple correlated crypto assets",
    }
```

## Report Section Adaptations

### Section A — Executive Summary
- Replace earnings flag with Fear & Greed Index badge
- Replace analyst consensus strip with BTC Dominance pill (for altcoins)
- Add funding rate sentiment indicator

### Section B — Opportunity
- `[On-Chain Data]` tab replaces `[Alternative Data]` tab entirely:
  - Exchange net flow chart + interpretation
  - MVRV Z-score gauge (overvalued / fair / undervalued)
  - Active addresses trend
  - Funding rate bar (crowded long / neutral / crowded short)
  - Liquidation cluster heatmap
  - Open interest change
  - Fear & Greed Index history chart

### Section C — Risk
- Add crypto-specific risks after standard VaR/ES:
  - Exchange counterparty risk (is this held on exchange or self-custody?)
  - Regulatory risk (jurisdiction-adaptive: SEC stance, MiCA, FCA)
  - Smart contract risk (for ETH, SOL, and L2 tokens — not for BTC)
  - Liquidity risk (for lower-cap tokens — bid/ask spread, depth)
  - 24/7 market note: "Price can move significantly outside traditional market hours"

### Section D — Strategy
- Show vol-adjusted position sizing (not Kelly)
- No entry/exit zones for FREE/UNLOCKED tiers (same regulatory gate as equity)
- Add funding rate carry note: if funding rate very positive, consider shorting
  the perp to earn funding while holding spot (for institutional tier only)

## Disclaimer — Crypto (Jurisdiction-Adaptive)

```python
CRYPTO_DISCLAIMERS = {
    "US": (
        "Cryptocurrency is not a security under current SEC guidance. "
        "This is not investment advice. Crypto assets are highly speculative "
        "and may lose all value. Not FDIC insured. Not SIPC protected."
    ),
    "EU": (
        "This communication is provided for informational purposes under MiCA "
        "(Markets in Crypto-Assets Regulation). Past performance does not "
        "guarantee future results. Crypto-assets carry significant risk of loss."
    ),
    "UK": (
        "Cryptoassets are high risk and largely unregulated. You should not "
        "expect to be protected if something goes wrong. Don't invest unless "
        "you're prepared to lose all the money you invest. — FCA required disclosure."
    ),
    "other": (
        "Cryptocurrency involves substantial risk of loss. Not financial advice. "
        "Regulatory status varies by jurisdiction."
    ),
}
```

## Constraints
- Never show earnings flag, P/E, analyst consensus, or 13F for crypto assets
- Never use Kelly position sizing for crypto — always vol-adjusted
- Always show crypto-specific risk warnings in Section C
- BTC dominance context required for all non-BTC crypto reports
- Campaign detection thresholds same as equity but applied to crypto subreddits too
- On-chain data circuit breaker: if Glassnode/CryptoQuant unavailable,
  generate report without on-chain tab + disclose: "On-chain data unavailable.
  Confidence reduced from X% to Y%."
- Liquidation map is indicative only — add note: "Liquidation levels are
  approximate and based on reported exchange data which may be incomplete."
