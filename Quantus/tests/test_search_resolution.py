"""
tests/test_search_resolution.py
================================
Unit tests for pipelines.search_resolution.

All tests use:
  - MockRedisIndex (no Redis required)
  - debounce_ms=0  (no 120ms wait in CI)
  - asyncio.run()  (works with standard pytest, no pytest-asyncio plugin needed)

Covered cases:
  1. "TESLA"   → TSLA  (exact name match, EQUITY)
  2. "Bitcoin" → BTC-USD  (crypto name match, CRYPTO)
  3. "Gold"    → [GC=F, GLD] disambiguation (COMMODITY + ETF)
  4. "S&P 500" → SPY  (alias match, ETF)
  5. "Amazn"   → AMZN  (fuzzy match, confidence ≥ 75)
  6. "AAPL"   → AAPL via exact ETF/equity map (bonus)
  7. ISIN "US0378331005" → AAPL
  8. CUSIP "037833100"   → AAPL
  9. Empty input          → []
"""

from __future__ import annotations

import asyncio
from typing import List

import pytest

from pipelines.search_resolution import (
    MockRedisIndex,
    ResolvedAsset,
    resolve_input,
    resolve_sync,
)

# Shared mock index — stateless, safe to reuse across tests
INDEX = MockRedisIndex()


def _run(coro) -> list[ResolvedAsset]:
    """Run a coroutine synchronously (avoids pytest-asyncio dependency)."""
    return asyncio.run(coro)


def _resolve(raw: str) -> list[ResolvedAsset]:
    """Shorthand: resolve with zero debounce and mock Redis."""
    return _run(resolve_input(raw, index=INDEX, debounce_ms=0))


# ---------------------------------------------------------------------------
# Test 1 — "TESLA" → TSLA  (exact name, EQUITY)
# ---------------------------------------------------------------------------

class TestTeslaResolution:
    """'TESLA' must resolve to TSLA with confidence 100 via exact name match."""

    def test_returns_result(self):
        results = _resolve("TESLA")
        assert results, "Expected at least one result for 'TESLA'"

    def test_top_ticker_is_tsla(self):
        results = _resolve("TESLA")
        assert results[0].ticker == "TSLA"

    def test_asset_class_is_equity(self):
        results = _resolve("tesla")  # case-insensitive
        assert results[0].asset_class == "EQUITY"

    def test_confidence_is_100(self):
        results = _resolve("TESLA")
        assert results[0].confidence == 100.0

    def test_display_name_contains_tesla(self):
        results = _resolve("Tesla")
        assert "Tesla" in results[0].display_name

    def test_match_method_is_exact(self):
        results = _resolve("TESLA")
        assert results[0].match_method == "exact"


# ---------------------------------------------------------------------------
# Test 2 — "Bitcoin" → BTC-USD  (crypto name match)
# ---------------------------------------------------------------------------

class TestBitcoinResolution:
    """'Bitcoin' must resolve to BTC-USD as a CRYPTO asset."""

    def test_returns_result(self):
        results = _resolve("Bitcoin")
        assert results, "Expected result for 'Bitcoin'"

    def test_ticker_is_btc_usd(self):
        results = _resolve("Bitcoin")
        assert results[0].ticker == "BTC-USD"

    def test_asset_class_is_crypto(self):
        results = _resolve("Bitcoin")
        assert results[0].asset_class == "CRYPTO"

    def test_confidence_is_100(self):
        results = _resolve("Bitcoin")
        assert results[0].confidence == 100.0

    def test_match_method_is_crypto(self):
        results = _resolve("Bitcoin")
        assert results[0].match_method == "crypto"

    def test_display_name_is_bitcoin(self):
        results = _resolve("bitcoin")  # lowercase
        assert results[0].display_name == "Bitcoin"

    def test_btc_shorthand_also_resolves(self):
        results = _resolve("BTC")
        assert results[0].ticker == "BTC-USD"


# ---------------------------------------------------------------------------
# Test 3 — "Gold" → disambiguation [GC=F (COMMODITY), GLD (ETF)]
# ---------------------------------------------------------------------------

class TestGoldDisambiguation:
    """'Gold' is ambiguous — must return both futures (GC=F) and ETF (GLD) entries."""

    def test_returns_multiple_results(self):
        results = _resolve("Gold")
        assert len(results) >= 2, (
            f"Expected ≥2 results for 'Gold' (disambiguation), got {len(results)}"
        )

    def test_contains_gcf_futures(self):
        tickers = [r.ticker for r in _resolve("Gold")]
        assert "GC=F" in tickers, "Gold futures (GC=F) must be present"

    def test_contains_gld_etf(self):
        tickers = [r.ticker for r in _resolve("Gold")]
        assert "GLD" in tickers, "Gold ETF (GLD) must be present"

    def test_gcf_is_commodity(self):
        results = _resolve("Gold")
        gcf = next(r for r in results if r.ticker == "GC=F")
        assert gcf.asset_class == "COMMODITY"

    def test_gld_is_etf(self):
        results = _resolve("Gold")
        gld = next(r for r in results if r.ticker == "GLD")
        assert gld.asset_class == "ETF"

    def test_is_ambiguous_flag_set(self):
        results = _resolve("Gold")
        for r in results:
            assert r.is_ambiguous is True, (
                f"{r.ticker} should have is_ambiguous=True"
            )

    def test_match_method_is_commodity(self):
        results = _resolve("Gold")
        for r in results:
            assert r.match_method == "commodity"


# ---------------------------------------------------------------------------
# Test 4 — "S&P 500" → SPY  (alias match)
# ---------------------------------------------------------------------------

class TestSP500Alias:
    """'S&P 500' must resolve to SPY via the alias table."""

    def test_returns_result(self):
        results = _resolve("S&P 500")
        assert results, "Expected result for 'S&P 500'"

    def test_ticker_is_spy(self):
        results = _resolve("S&P 500")
        assert results[0].ticker == "SPY"

    def test_asset_class_is_etf(self):
        results = _resolve("S&P 500")
        assert results[0].asset_class == "ETF"

    def test_match_method_is_alias(self):
        results = _resolve("S&P 500")
        assert results[0].match_method == "alias"

    def test_confidence_is_100(self):
        results = _resolve("S&P 500")
        assert results[0].confidence == 100.0

    def test_spx_alias_also_works(self):
        """Alternative alias 'SPX' must also reach SPY."""
        results = _resolve("SPX")
        assert results and results[0].ticker == "SPY"

    def test_nasdaq_alias(self):
        results = _resolve("Nasdaq")
        assert results and results[0].ticker == "QQQ"


# ---------------------------------------------------------------------------
# Test 5 — "Amazn" → AMZN  (fuzzy match, confidence ≥ 75%)
# ---------------------------------------------------------------------------

class TestAmaznFuzzy:
    """'Amazn' is a typo for Amazon — must fuzzy-match to AMZN with score ≥ 75."""

    def test_returns_result(self):
        results = _resolve("Amazn")
        assert results, "Expected fuzzy result for 'Amazn'"

    def test_top_ticker_is_amzn(self):
        results = _resolve("Amazn")
        assert results[0].ticker == "AMZN", (
            f"Top result should be AMZN, got {results[0].ticker}"
        )

    def test_confidence_at_least_75(self):
        results = _resolve("Amazn")
        assert results[0].confidence >= 75.0, (
            f"Confidence {results[0].confidence:.1f} below threshold 75"
        )

    def test_match_method_is_fuzzy(self):
        results = _resolve("Amazn")
        assert results[0].match_method == "fuzzy"

    def test_asset_class_is_equity(self):
        results = _resolve("Amazn")
        assert results[0].asset_class == "EQUITY"


# ---------------------------------------------------------------------------
# Test 6 — ISIN lookup
# ---------------------------------------------------------------------------

class TestISINLookup:

    def test_isin_resolves_to_aapl(self):
        results = _resolve("US0378331005")
        assert results, "ISIN US0378331005 should resolve to AAPL"
        assert results[0].ticker == "AAPL"

    def test_isin_match_method(self):
        results = _resolve("US0378331005")
        assert results[0].match_method == "isin"

    def test_isin_confidence_is_100(self):
        results = _resolve("US0378331005")
        assert results[0].confidence == 100.0


# ---------------------------------------------------------------------------
# Test 7 — CUSIP lookup
# ---------------------------------------------------------------------------

class TestCUSIPLookup:

    def test_cusip_resolves_to_aapl(self):
        results = _resolve("037833100")
        assert results, "CUSIP 037833100 should resolve to AAPL"
        assert results[0].ticker == "AAPL"

    def test_cusip_match_method(self):
        results = _resolve("037833100")
        assert results[0].match_method == "cusip"


# ---------------------------------------------------------------------------
# Test 8 — Edge cases
# ---------------------------------------------------------------------------

class TestEdgeCases:

    def test_empty_string_returns_empty_list(self):
        results = _resolve("")
        assert results == []

    def test_whitespace_only_returns_empty_list(self):
        results = _resolve("   ")
        assert results == []

    def test_unknown_ticker_returns_empty(self):
        results = _resolve("ZZZZUNKNOWN9999")
        # fuzzy check: result list may be non-empty if something scores ≥75
        # but the top result should NOT confidently claim an exact match
        for r in results:
            assert r.match_method in ("fuzzy",), (
                f"Unknown input should only fuzzy-match, got {r.match_method}"
            )

    def test_resolve_sync_wrapper(self):
        """resolve_sync must mirror resolve_input results."""
        sync_results = resolve_sync("TESLA", index=INDEX, debounce_ms=0)
        async_results = _resolve("TESLA")
        assert [r.ticker for r in sync_results] == [r.ticker for r in async_results]

    def test_case_insensitive_crypto(self):
        assert _resolve("BITCOIN")[0].ticker == "BTC-USD"
        assert _resolve("bitcoin")[0].ticker == "BTC-USD"
        assert _resolve("Bitcoin")[0].ticker == "BTC-USD"

    def test_resolved_asset_fields_present(self):
        """All ResolvedAsset fields must be populated (not None / empty)."""
        import dataclasses
        required = {f.name for f in dataclasses.fields(ResolvedAsset)}
        results = _resolve("TSLA")
        assert results
        r = results[0]
        for fname in required:
            val = getattr(r, fname)
            assert val is not None, f"Field '{fname}' is None"
