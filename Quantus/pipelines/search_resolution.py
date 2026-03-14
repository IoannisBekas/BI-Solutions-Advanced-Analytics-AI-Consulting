"""
pipelines/search_resolution.py
================================
Universal Search & Resolution Engine — Step 1 of the Quantus Research pipeline.

Accepts any input format:
  - Ticker symbol    : "TSLA", "BTC-USD", "GC=F"
  - Full / common name: "Tesla", "Bitcoin", "Gold"
  - Alias            : "S&P 500" → SPY, "Nasdaq" → QQQ
  - Fuzzy / typo     : "Amazn" → AMZN (rapidfuzz, threshold 75)
  - ISIN             : "US0378331005" → AAPL
  - CUSIP            : "037833100"    → AAPL

Returns:  list[ResolvedAsset]  — sorted by confidence DESC.
          Multiple results signal disambiguation (e.g. "Gold" → GC=F + GLD).

Performance contract:
  - Redis-only paths : <5 ms
  - Fuzzy path       : <20 ms  (in-process, no network)
  - ISIN/CUSIP path  : <800 ms (external API, not mocked in tests)
  - Debounce guard   : 120 ms  (caller manages debounce; helper provided)
"""

from __future__ import annotations

import asyncio
import logging
import re
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Literal

from rapidfuzz import fuzz, process as fuzz_process

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Types
# ---------------------------------------------------------------------------
AssetClass = Literal["EQUITY", "CRYPTO", "COMMODITY", "ETF"]
MatchMethod = Literal["exact", "alias", "crypto", "commodity", "fuzzy", "isin", "cusip"]

# ---------------------------------------------------------------------------
# ResolvedAsset — return contract
# ---------------------------------------------------------------------------

@dataclass
class ResolvedAsset:
    """A single resolved candidate returned by the search engine."""
    ticker: str               # Canonical ticker: "TSLA", "BTC-USD", "GC=F"
    display_name: str         # Human name:  "Tesla, Inc.", "Bitcoin", "Gold (Futures)"
    exchange: str             # "NMS", "CMX", "CCC", "PCX", …
    asset_class: AssetClass   # "EQUITY" | "CRYPTO" | "COMMODITY" | "ETF"
    confidence: float         # 0–100; 100 = exact/alias match
    match_method: MatchMethod # how it was resolved
    is_ambiguous: bool = False  # True when caller surfaces disambiguation UI

# ---------------------------------------------------------------------------
# Static lookup tables
# ---------------------------------------------------------------------------

# Common aliases → canonical ticker  (operator-maintained; never auto-updated from user input)
ALIAS_TABLE: dict[str, str] = {
    "s&p 500": "SPY",  "s&p500": "SPY",   "s&p": "SPY",   "spx": "SPY",
    "nasdaq":  "QQQ",  "ndx":    "QQQ",   "nasdaq 100": "QQQ",
    "dow":     "DIA",  "dow jones": "DIA", "djia": "DIA",
    "russell": "IWM",  "russell 2000": "IWM",
    "vix":     "^VIX",
    "bitcoin etf": "IBIT",
    "gold etf":    "GLD",
}

# Crypto — top-30 common names + symbols → yfinance ticker
CRYPTO_NAME_MAP: dict[str, str] = {
    "bitcoin":    "BTC-USD", "btc": "BTC-USD",
    "ethereum":   "ETH-USD", "eth": "ETH-USD", "ether": "ETH-USD",
    "solana":     "SOL-USD", "sol": "SOL-USD",
    "xrp":        "XRP-USD", "ripple": "XRP-USD",
    "cardano":    "ADA-USD", "ada": "ADA-USD",
    "dogecoin":   "DOGE-USD","doge": "DOGE-USD",
    "polkadot":   "DOT-USD", "dot": "DOT-USD",
    "avalanche":  "AVAX-USD","avax": "AVAX-USD",
    "chainlink":  "LINK-USD","link": "LINK-USD",
    "litecoin":   "LTC-USD", "ltc": "LTC-USD",
    "uniswap":    "UNI-USD", "uni": "UNI-USD",
    "stellar":    "XLM-USD", "xlm": "XLM-USD",
    "monero":     "XMR-USD", "xmr": "XMR-USD",
    "binance coin": "BNB-USD","bnb": "BNB-USD",
    "toncoin":    "TON-USD", "ton": "TON-USD",
    "shiba inu":  "SHIB-USD","shib": "SHIB-USD",
    "pepe":       "PEPE-USD",
    "arbitrum":   "ARB-USD", "arb": "ARB-USD",
    "polygon":    "MATIC-USD","matic": "MATIC-USD",
}

CRYPTO_META: dict[str, dict] = {
    "BTC-USD":  {"display_name": "Bitcoin",          "exchange": "CCC"},
    "ETH-USD":  {"display_name": "Ethereum",         "exchange": "CCC"},
    "SOL-USD":  {"display_name": "Solana",           "exchange": "CCC"},
    "XRP-USD":  {"display_name": "XRP",              "exchange": "CCC"},
    "ADA-USD":  {"display_name": "Cardano",          "exchange": "CCC"},
    "DOGE-USD": {"display_name": "Dogecoin",         "exchange": "CCC"},
    "DOT-USD":  {"display_name": "Polkadot",         "exchange": "CCC"},
    "AVAX-USD": {"display_name": "Avalanche",        "exchange": "CCC"},
    "LINK-USD": {"display_name": "Chainlink",        "exchange": "CCC"},
    "LTC-USD":  {"display_name": "Litecoin",         "exchange": "CCC"},
    "BNB-USD":  {"display_name": "Binance Coin",     "exchange": "CCC"},
    "TON-USD":  {"display_name": "Toncoin",          "exchange": "CCC"},
    "SHIB-USD": {"display_name": "Shiba Inu",        "exchange": "CCC"},
    "MATIC-USD":{"display_name": "Polygon",          "exchange": "CCC"},
    "ARB-USD":  {"display_name": "Arbitrum",         "exchange": "CCC"},
    "PEPE-USD": {"display_name": "Pepe",             "exchange": "CCC"},
    "UNI-USD":  {"display_name": "Uniswap",          "exchange": "CCC"},
    "XLM-USD":  {"display_name": "Stellar",          "exchange": "CCC"},
    "XMR-USD":  {"display_name": "Monero",           "exchange": "CCC"},
}

# Commodity common names.  Multiple entries represent the disambiguation set.
# Each value is a list so "Gold" can resolve to multiple candidates.
COMMODITY_MAP: dict[str, list[dict]] = {
    "gold": [
        {"ticker": "GC=F",  "display_name": "Gold (Futures)",      "exchange": "CMX", "asset_class": "COMMODITY"},
        {"ticker": "GLD",   "display_name": "SPDR Gold Shares",    "exchange": "PCX", "asset_class": "ETF"},
    ],
    "silver": [
        {"ticker": "SI=F",  "display_name": "Silver (Futures)",    "exchange": "CMX", "asset_class": "COMMODITY"},
        {"ticker": "SLV",   "display_name": "iShares Silver Trust","exchange": "PCX", "asset_class": "ETF"},
    ],
    "crude oil": [
        {"ticker": "CL=F",  "display_name": "Crude Oil (WTI)",     "exchange": "NYM", "asset_class": "COMMODITY"},
        {"ticker": "USO",   "display_name": "US Oil Fund ETF",     "exchange": "PCX", "asset_class": "ETF"},
    ],
    "oil": [
        {"ticker": "CL=F",  "display_name": "Crude Oil (WTI)",     "exchange": "NYM", "asset_class": "COMMODITY"},
        {"ticker": "USO",   "display_name": "US Oil Fund ETF",     "exchange": "PCX", "asset_class": "ETF"},
    ],
    "natural gas": [
        {"ticker": "NG=F",  "display_name": "Natural Gas (Futures)","exchange": "NYM","asset_class": "COMMODITY"},
    ],
    "platinum": [
        {"ticker": "PL=F",  "display_name": "Platinum (Futures)",  "exchange": "NYM", "asset_class": "COMMODITY"},
    ],
    "copper": [
        {"ticker": "HG=F",  "display_name": "Copper (Futures)",    "exchange": "CMX", "asset_class": "COMMODITY"},
    ],
    "wheat": [
        {"ticker": "ZW=F",  "display_name": "Wheat (Futures)",     "exchange": "CBT", "asset_class": "COMMODITY"},
    ],
    "corn": [
        {"ticker": "ZC=F",  "display_name": "Corn (Futures)",      "exchange": "CBT", "asset_class": "COMMODITY"},
    ],
}

# Equity name → ticker  (Russell 1000 sample — extended for fuzzy index)
# Keys are lowercased to allow case-insensitive lookup.
EQUITY_NAME_MAP: dict[str, dict] = {
    "tesla":            {"ticker": "TSLA", "display_name": "Tesla, Inc.",           "exchange": "NMS"},
    "tesla inc":        {"ticker": "TSLA", "display_name": "Tesla, Inc.",           "exchange": "NMS"},
    "apple":            {"ticker": "AAPL", "display_name": "Apple Inc.",            "exchange": "NMS"},
    "microsoft":        {"ticker": "MSFT", "display_name": "Microsoft Corporation", "exchange": "NMS"},
    "amazon":           {"ticker": "AMZN", "display_name": "Amazon.com Inc.",       "exchange": "NMS"},
    "amazon com":       {"ticker": "AMZN", "display_name": "Amazon.com Inc.",       "exchange": "NMS"},
    "alphabet":         {"ticker": "GOOGL","display_name": "Alphabet Inc.",         "exchange": "NMS"},
    "google":           {"ticker": "GOOGL","display_name": "Alphabet Inc.",         "exchange": "NMS"},
    "meta":             {"ticker": "META", "display_name": "Meta Platforms, Inc.",  "exchange": "NMS"},
    "nvidia":           {"ticker": "NVDA", "display_name": "NVIDIA Corporation",   "exchange": "NMS"},
    "berkshire":        {"ticker": "BRK-B","display_name": "Berkshire Hathaway Inc.","exchange": "NYQ"},
    "berkshire hathaway":{"ticker":"BRK-B","display_name": "Berkshire Hathaway Inc.","exchange": "NYQ"},
    "jpmorgan":         {"ticker": "JPM",  "display_name": "JPMorgan Chase & Co.", "exchange": "NYQ"},
    "jp morgan":        {"ticker": "JPM",  "display_name": "JPMorgan Chase & Co.", "exchange": "NYQ"},
    "johnson johnson":  {"ticker": "JNJ",  "display_name": "Johnson & Johnson",    "exchange": "NYQ"},
    "visa":             {"ticker": "V",    "display_name": "Visa Inc.",            "exchange": "NYQ"},
    "unitedhealth":     {"ticker": "UNH",  "display_name": "UnitedHealth Group",   "exchange": "NYQ"},
    "exxon":            {"ticker": "XOM",  "display_name": "Exxon Mobil Corporation","exchange": "NYQ"},
    "walmart":          {"ticker": "WMT",  "display_name": "Walmart Inc.",         "exchange": "NYQ"},
    "mastercard":       {"ticker": "MA",   "display_name": "Mastercard Incorporated","exchange": "NYQ"},
    "netflix":          {"ticker": "NFLX", "display_name": "Netflix Inc.",          "exchange": "NMS"},
    "palantir":         {"ticker": "PLTR", "display_name": "Palantir Technologies","exchange": "NYQ"},
    "coinbase":         {"ticker": "COIN", "display_name": "Coinbase Global, Inc.","exchange": "NMS"},
    "robinhood":        {"ticker": "HOOD", "display_name": "Robinhood Markets",    "exchange": "NMS"},
    "amd":              {"ticker": "AMD",  "display_name": "Advanced Micro Devices","exchange": "NMS"},
    "advanced micro devices":{"ticker":"AMD","display_name":"Advanced Micro Devices","exchange":"NMS"},
    "intel":            {"ticker": "INTC", "display_name": "Intel Corporation",    "exchange": "NMS"},
    "qualcomm":         {"ticker": "QCOM", "display_name": "QUALCOMM Incorporated","exchange": "NMS"},
    "broadcom":         {"ticker": "AVGO", "display_name": "Broadcom Inc.",        "exchange": "NMS"},
    "tsmc":             {"ticker": "TSM",  "display_name": "Taiwan Semiconductor", "exchange": "NYQ"},
    "taiwan semiconductor":{"ticker":"TSM","display_name": "Taiwan Semiconductor", "exchange": "NYQ"},
    "salesforce":       {"ticker": "CRM",  "display_name": "Salesforce, Inc.",     "exchange": "NYQ"},
    "adobe":            {"ticker": "ADBE", "display_name": "Adobe Inc.",           "exchange": "NMS"},
    "uber":             {"ticker": "UBER", "display_name": "Uber Technologies",    "exchange": "NYQ"},
    "airbnb":           {"ticker": "ABNB", "display_name": "Airbnb, Inc.",         "exchange": "NMS"},
    "spotify":          {"ticker": "SPOT", "display_name": "Spotify Technology",   "exchange": "NYQ"},
    "shopify":          {"ticker": "SHOP", "display_name": "Shopify Inc.",         "exchange": "NYQ"},
    "snowflake":        {"ticker": "SNOW", "display_name": "Snowflake Inc.",       "exchange": "NYQ"},
    "crowdstrike":      {"ticker": "CRWD", "display_name": "CrowdStrike Holdings", "exchange": "NMS"},
    "palantir technologies":{"ticker":"PLTR","display_name":"Palantir Technologies","exchange":"NYQ"},
}

# ETF alias registry (commonly searched names that live in ALIAS_TABLE too)
ETF_META: dict[str, dict] = {
    "SPY": {"display_name": "SPDR S&P 500 ETF Trust",       "exchange": "PCX"},
    "QQQ": {"display_name": "Invesco QQQ Trust",            "exchange": "NMS"},
    "DIA": {"display_name": "SPDR Dow Jones ETF",           "exchange": "PCX"},
    "IWM": {"display_name": "iShares Russell 2000 ETF",     "exchange": "PCX"},
    "GLD": {"display_name": "SPDR Gold Shares",             "exchange": "PCX"},
    "SLV": {"display_name": "iShares Silver Trust",         "exchange": "PCX"},
    "USO": {"display_name": "United States Oil Fund",       "exchange": "PCX"},
    "IBIT":{"display_name": "iShares Bitcoin Trust ETF",   "exchange": "NMS"},
}

# ISIN / CUSIP patterns
_ISIN_RE  = re.compile(r"^[A-Z]{2}[A-Z0-9]{9}[0-9]$", re.IGNORECASE)
_CUSIP_RE = re.compile(r"^[0-9]{3}[A-Z0-9]{5}[0-9]$", re.IGNORECASE)

# ---------------------------------------------------------------------------
# Redis abstraction — allows tests to run without Redis
# ---------------------------------------------------------------------------

class RedisAssetIndex(ABC):
    """Abstract interface over the Quantus Redis asset registry."""

    @abstractmethod
    def get_ticker(self, key: str) -> str | None:
        """Resolve a Redis key → ticker string. Returns None on miss."""

    @abstractmethod
    def get_isin(self, isin: str) -> str | None: ...

    @abstractmethod
    def get_cusip(self, cusip: str) -> str | None: ...


class MockRedisIndex(RedisAssetIndex):
    """In-process mock used in tests and local development.

    Populated from the static tables above so tests need no network or Redis.
    """

    _ISIN_MAP: dict[str, str] = {
        "US0378331005": "AAPL",
        "US5949181045": "MSFT",
        "US88160R1014": "TSLA",
        "US30303M1027": "META",
    }
    _CUSIP_MAP: dict[str, str] = {
        "037833100": "AAPL",
        "594918104": "MSFT",
        "881624209": "TSLA",
    }

    def get_ticker(self, key: str) -> str | None:
        return None  # static tables handle lookups directly in this mock

    def get_isin(self, isin: str) -> str | None:
        return self._ISIN_MAP.get(isin.upper())

    def get_cusip(self, cusip: str) -> str | None:
        return self._CUSIP_MAP.get(cusip.upper())


# Module-level default index — swap for production Redis client
_default_index: RedisAssetIndex = MockRedisIndex()


def set_asset_index(index: RedisAssetIndex) -> None:
    """Replace the module-level index (call once at app startup)."""
    global _default_index
    _default_index = index


# ---------------------------------------------------------------------------
# Internal resolution helpers
# ---------------------------------------------------------------------------

def _normalise(raw: str) -> str:
    """Lowercase, strip, collapse internal whitespace."""
    return " ".join(raw.strip().lower().split())


def _make_equity(ticker: str, meta: dict, confidence: float,
                 method: MatchMethod) -> ResolvedAsset:
    return ResolvedAsset(
        ticker=ticker,
        display_name=meta.get("display_name", ticker),
        exchange=meta.get("exchange", "UNKNOWN"),
        asset_class="EQUITY",
        confidence=confidence,
        match_method=method,
    )


def _make_etf(ticker: str, confidence: float, method: MatchMethod) -> ResolvedAsset:
    meta = ETF_META.get(ticker, {"display_name": ticker, "exchange": "UNKNOWN"})
    return ResolvedAsset(
        ticker=ticker,
        display_name=meta["display_name"],
        exchange=meta["exchange"],
        asset_class="ETF",
        confidence=confidence,
        match_method=method,
    )


def _exact_ticker(query_upper: str) -> list[ResolvedAsset]:
    """Step 1 — bare ticker symbol present in equity or ETF registry."""
    if query_upper in ETF_META:
        return [_make_etf(query_upper, 100.0, "exact")]
    name_key = _normalise(query_upper)
    if name_key in EQUITY_NAME_MAP:
        m = EQUITY_NAME_MAP[name_key]
        return [_make_equity(m["ticker"], m, 100.0, "exact")]
    return []


def _alias_lookup(query_norm: str) -> list[ResolvedAsset]:
    """Step 2 — common alias table (S&P 500 → SPY, Nasdaq → QQQ …)."""
    ticker = ALIAS_TABLE.get(query_norm)
    if not ticker:
        return []
    # Determine asset class
    if ticker in ETF_META:
        return [_make_etf(ticker, 100.0, "alias")]
    meta = {"display_name": ticker, "exchange": "UNKNOWN"}
    return [_make_equity(ticker, meta, 100.0, "alias")]


def _crypto_lookup(query_norm: str) -> list[ResolvedAsset]:
    """Step 3 — crypto name / symbol → yfinance ticker."""
    ticker = CRYPTO_NAME_MAP.get(query_norm)
    if not ticker:
        return []
    meta = CRYPTO_META.get(ticker, {"display_name": ticker, "exchange": "CCC"})
    return [ResolvedAsset(
        ticker=ticker,
        display_name=meta["display_name"],
        exchange=meta["exchange"],
        asset_class="CRYPTO",
        confidence=100.0,
        match_method="crypto",
    )]


def _commodity_lookup(query_norm: str) -> list[ResolvedAsset]:
    """Step 4 — commodity name → futures ticker(s) + possible ETF."""
    candidates = COMMODITY_MAP.get(query_norm)
    if not candidates:
        return []
    results = []
    for c in candidates:
        cls: AssetClass = c["asset_class"]  # type: ignore[assignment]
        results.append(ResolvedAsset(
            ticker=c["ticker"],
            display_name=c["display_name"],
            exchange=c["exchange"],
            asset_class=cls,
            confidence=100.0,
            match_method="commodity",
            is_ambiguous=len(candidates) > 1,
        ))
    return results


def _fuzzy_match(query_norm: str, threshold: float = 75.0,
                 limit: int = 6) -> list[ResolvedAsset]:
    """Step 5 — rapidfuzz over EQUITY_NAME_MAP keys.

    Uses token_set_ratio which handles word-order variance well.
    """
    choices = list(EQUITY_NAME_MAP.keys())
    hits = fuzz_process.extract(
        query_norm,
        choices,
        scorer=fuzz.token_set_ratio,
        limit=limit,
    )
    results: list[ResolvedAsset] = []
    for name_key, score, _ in hits:
        if score < threshold:
            continue
        m = EQUITY_NAME_MAP[name_key]
        results.append(_make_equity(m["ticker"], m, float(score), "fuzzy"))

    # Deduplicate by ticker (keep highest confidence)
    seen: dict[str, ResolvedAsset] = {}
    for r in results:
        if r.ticker not in seen or r.confidence > seen[r.ticker].confidence:
            seen[r.ticker] = r
    return sorted(seen.values(), key=lambda r: r.confidence, reverse=True)


def _isin_cusip_lookup(raw: str, index: RedisAssetIndex) -> list[ResolvedAsset]:
    """Step 6 — ISIN or CUSIP pattern detection + Redis lookup."""
    raw_stripped = raw.strip().upper()
    ticker: str | None = None
    method: MatchMethod = "isin"

    if _ISIN_RE.match(raw_stripped):
        ticker = index.get_isin(raw_stripped)
        method = "isin"
    elif _CUSIP_RE.match(raw_stripped):
        ticker = index.get_cusip(raw_stripped)
        method = "cusip"

    if not ticker:
        return []

    # Check equity map first, then ETF
    name_key = ticker.lower()
    if name_key in EQUITY_NAME_MAP:
        m = EQUITY_NAME_MAP[name_key]
    else:
        m = {"display_name": ticker, "exchange": "UNKNOWN"}

    return [ResolvedAsset(
        ticker=ticker,
        display_name=m.get("display_name", ticker),
        exchange=m.get("exchange", "UNKNOWN"),
        asset_class="EQUITY",
        confidence=100.0,
        match_method=method,
    )]


# ---------------------------------------------------------------------------
# Public async resolution entry point
# ---------------------------------------------------------------------------

async def resolve_input(
    raw_input: str,
    *,
    index: RedisAssetIndex | None = None,
    debounce_ms: int = 120,
    fuzzy_threshold: float = 75.0,
    fuzzy_limit: int = 6,
) -> list[ResolvedAsset]:
    """Resolve *raw_input* to a ranked list of :class:`ResolvedAsset` objects.

    Args:
        raw_input:       User's raw search string (any format).
        index:           Redis index implementation. Defaults to module singleton.
        debounce_ms:     Async sleep applied before resolution begins (default 120ms).
                         Set to 0 in unit tests to avoid waiting.
        fuzzy_threshold: Minimum rapidfuzz score to include a fuzzy candidate.
        fuzzy_limit:     Maximum fuzzy candidates before deduplication.

    Returns:
        Sorted list of :class:`ResolvedAsset`, confidence DESC.
        Empty list when nothing matched.
    """
    idx = index or _default_index

    if not raw_input or not raw_input.strip():
        return []

    # Debounce — callers that debounce on the frontend still benefit from
    # server-side guard against burst calls.
    if debounce_ms > 0:
        await asyncio.sleep(debounce_ms / 1000)

    query_norm  = _normalise(raw_input)
    query_upper = raw_input.strip().upper()

    logger.info("resolve_input | raw=%r norm=%r", raw_input, query_norm)

    # --- Priority chain ---

    # 1. Exact ticker / exact name
    results = _exact_ticker(query_upper)
    if results:
        logger.info("resolve_input | method=exact ticker=%s", results[0].ticker)
        return results

    # 2. Alias table
    results = _alias_lookup(query_norm)
    if results:
        logger.info("resolve_input | method=alias → %s", results[0].ticker)
        return results

    # 3. Crypto name
    results = _crypto_lookup(query_norm)
    if results:
        logger.info("resolve_input | method=crypto → %s", results[0].ticker)
        return results

    # 4. Commodity name (may return multiple → disambiguation)
    results = _commodity_lookup(query_norm)
    if results:
        logger.info(
            "resolve_input | method=commodity count=%d ambiguous=%s",
            len(results), results[0].is_ambiguous,
        )
        return results

    # 5. ISIN / CUSIP
    results = _isin_cusip_lookup(raw_input, idx)
    if results:
        logger.info("resolve_input | method=%s → %s", results[0].match_method, results[0].ticker)
        return results

    # 6. Fuzzy name match
    results = _fuzzy_match(query_norm, threshold=fuzzy_threshold, limit=fuzzy_limit)
    if results:
        logger.info(
            "resolve_input | method=fuzzy top=%s score=%.1f",
            results[0].ticker, results[0].confidence,
        )
        return results

    # 7. No match
    logger.warning("resolve_input | NO MATCH for %r", raw_input)
    return []


# ---------------------------------------------------------------------------
# Synchronous convenience wrapper (for non-async callers / CLI testing)
# ---------------------------------------------------------------------------

def resolve_sync(
    raw_input: str,
    *,
    index: RedisAssetIndex | None = None,
    debounce_ms: int = 0,
) -> list[ResolvedAsset]:
    """Blocking wrapper around :func:`resolve_input`.

    Uses debounce_ms=0 by default so CLI / test usage is instant.
    """
    return asyncio.run(resolve_input(
        raw_input,
        index=index,
        debounce_ms=debounce_ms,
    ))
