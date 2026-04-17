---
name: 02-search-resolution
description: |
  Use when building the universal search input, autocomplete dropdown, ticker
  resolution engine, or name-to-ticker lookup. Handles full names (TESLA, Tesla,
  Bitcoin), aliases (S&P 500, Nasdaq), ISIN/CUSIP, and fuzzy partial matches.
---

# Universal Search & Resolution Layer

## Goal
Build the search input and resolution engine that accepts any format — ticker,
full name, alias, partial string, crypto name, commodity name, ISIN, or CUSIP —
and resolves it to a canonical ticker + asset class before triggering any pipeline.

## Accepted Input Formats
| Input | Resolves to |
|---|---|
| `TSLA` | Tesla, Inc. · EQUITY |
| `TESLA` / `Tesla` / `tesla` | Tesla, Inc. · EQUITY |
| `BTC` / `Bitcoin` / `BITCOIN` | BTC-USD · CRYPTO |
| `Ethereum` / `ETH` | ETH-USD · CRYPTO |
| `GOLD` / `Gold` | Disambiguation: GC=F (Futures) or GLD (ETF) |
| `S&P 500` / `SPX` / `S&P` | SPY · ETF |
| `Nasdaq` / `NDX` | QQQ · ETF |
| `Amazn` | Amazon.com Inc. · EQUITY (fuzzy, 94%) |
| `US0378331005` | AAPL · EQUITY (ISIN lookup) |
| `037833100` | AAPL · EQUITY (CUSIP lookup) |

## Instructions

### 1. Resolution Engine (runs on every keystroke, debounced 120ms)
```python
async def resolve_input(raw_input: str) -> list[ResolvedAsset]:
    # Priority order:
    # 1. Exact ticker match → Redis asset registry (O(1), <1ms)
    # 2. Fuzzy name match → Levenshtein + phonetic (Redis index, <5ms)
    # 3. Crypto name match → CoinGecko name list (Redis, daily refresh)
    # 4. Commodity alias → Quantus commodity registry (Redis, static)
    # 5. Common alias lookup → hardcoded alias table (S&P 500, Nasdaq, etc.)
    # 6. ISIN/CUSIP → Financial Modeling Prep API (cached 30d in Redis)
    # 7. No match → return empty + suggest phonetic alternatives
```

### 2. Redis Asset Index Structure
```
quantus:assets:ticker:{TICKER}     → AssetMeta JSON   (equity, ETF)
quantus:assets:name:{NAME_LOWER}   → ticker string     (name → ticker map)
quantus:assets:crypto:{NAME_LOWER} → ticker string     (BTC-USD, ETH-USD)
quantus:assets:commodity:{NAME}    → futures_ticker    (GC=F, CL=F, NG=F)
quantus:assets:alias:{ALIAS}       → ticker string     (s&p500 → SPY)
quantus:assets:isin:{ISIN}         → ticker string
quantus:assets:cusip:{CUSIP}       → ticker string
```

Index refresh schedule:
- Equities: weekly (Russell 3000 + top 200 global)
- Crypto: daily (top 100 by CoinGecko market cap)
- Commodities: static (update on new contract listing only)
- Aliases: manual (operator-maintained, logged from failed searches)

### 3. Fuzzy Matching
```python
from rapidfuzz import fuzz, process

def fuzzy_name_match(query: str, threshold: int = 75) -> list[tuple]:
    # Search against pre-built name index in Redis
    # Return: [(ticker, name, confidence_score), ...]
    # Filter: confidence >= threshold
    # Limit: top 6 results
    # Sort: confidence DESC, then market cap DESC (equity) / vol DESC (crypto)
```

### 4. Autocomplete Dropdown — Each Result Card
```typescript
interface SearchResult {
  ticker: string           // "TSLA"
  displayName: string      // "Tesla, Inc."
  exchange: string         // "NASDAQ"
  assetClass: AssetClass   // "EQUITY" | "CRYPTO" | "COMMODITY" | "ETF"
  logoUrl: string          // Clearbit / yfinance logo URL
  currentPrice: number     // live (yfinance, cached 60s)
  dayChangePercent: number
  cachedReport?: {
    available: boolean
    generatedAgo: string   // "4h ago"
    researcherCount: number
    reportId: string
  }
  confidence?: number      // only shown for fuzzy matches (<100%)
}
```

### 5. Disambiguation UI
When one input matches multiple assets (e.g. "Gold" → GC=F + GLD):
- Show both results with clear asset class badges
- Labels: "Gold · Commodity Futures · GC=F" vs "SPDR Gold Shares · ETF · GLD"
- Never auto-select — always let user choose
- Crypto vs equity: "Bitdeer Technologies · EQUITY" vs "Bitcoin · CRYPTO"

### 6. Failed Resolution
```typescript
// After 400ms with no match:
{
  type: "no_match",
  query: rawInput,
  suggestions: [
    // Top 3 phonetic near-matches from the index
    { ticker: "TSLA", name: "Tesla, Inc.", reason: "Did you mean Tesla?" }
  ],
  requestCoverageLink: "/coverage-request?q=" + encodeURIComponent(rawInput)
}
```
Every failed resolution logs to `quantus:search:misses` (Redis sorted set by count).
Operator dashboard surfaces top 20 misses weekly → feeds alias/registry expansion.

### 7. Frontend Behaviour
- Debounce: 120ms after last keystroke
- Min chars: 2 before triggering search
- Show skeleton loader while resolving (never blank dropdown)
- Keyboard: ↑↓ to navigate, Enter to select, Escape to close
- Asset class badge uses brand colours:
  - [EQUITY] → slate  [CRYPTO] → amber  [COMMODITY] → emerald  [ETF] → blue

### 8. Pre-fetch on Selection
On user selection (before they press Generate):
- Immediately pre-fetch all Tier 1 + Tier 2 data for the resolved ticker
- This ensures Welcome Card appears within ~1 second of Generate click
- Store pre-fetched data in session (TTL: 5 minutes)

## Constraints
- Autocomplete response must be <150ms from keystroke (Redis-only path)
- ISIN/CUSIP lookup may be up to 800ms — show loading indicator for this path
- Never auto-resolve ambiguous matches — always surface disambiguation UI
- Never show raw ticker format in the dropdown for crypto (show "Bitcoin" not "BTC-USD")
- Log every successful resolution with input→output mapping to audit trail
- Alias table is operator-controlled — never auto-add aliases from user input without review
