"""
tests/test_asset_class_router.py
=================================
Unit tests for pipelines.asset_class_router.

All yfinance network calls are mocked — no internet connection required.

Covered cases:
  1. TSLA  → EQUITY   (quoteType = "EQUITY")
  2. BTC-USD → CRYPTO  (quoteType = "CRYPTOCURRENCY")
  3. GC=F  → COMMODITY (quoteType = "FUTURE")
  4. SPY   → ETF       (quoteType = "ETF", standard equity-tracking ETF)
  5. GLD   → ETF / pipelines.commodity  (commodity ETF hybrid routing)
  6. XXXX  → EQUITY fallback (yfinance raises, unknown_fallback=True)
"""

from __future__ import annotations

from unittest.mock import patch, MagicMock

import pytest

from pipelines.asset_class_router import (
    AssetContext,
    PIPELINE_MAP,
    REGIME_PARAMS,
    route,
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _mock_info(quote_type: str, long_name: str = "Mock Asset",
               exchange: str = "NMS", currency: str = "USD") -> dict:
    """Build a minimal yfinance .info dict for mocking."""
    return {
        "quoteType": quote_type,
        "longName": long_name,
        "exchange": exchange,
        "currency": currency,
    }


def _patch_ticker(info: dict):
    """Return a context manager that patches yfinance.Ticker.info."""
    mock_ticker = MagicMock()
    mock_ticker.info = info
    return patch("pipelines.asset_class_router.yf.Ticker", return_value=mock_ticker)


# ---------------------------------------------------------------------------
# Test 1 — TSLA (EQUITY)
# ---------------------------------------------------------------------------

def test_equity_tsla():
    """TSLA with quoteType='EQUITY' must be classified as EQUITY."""
    info = _mock_info("EQUITY", long_name="Tesla, Inc.", exchange="NMS", currency="USD")

    with _patch_ticker(info):
        ctx = route("TSLA")

    assert isinstance(ctx, AssetContext)
    assert ctx.asset_class == "EQUITY"
    assert ctx.canonical_ticker == "TSLA"
    assert ctx.pipeline_id == PIPELINE_MAP["EQUITY"]      # "pipelines.equity"
    assert ctx.disclaimer_variant == "US_EQUITY"
    assert ctx.unknown_fallback is False
    assert ctx.currency == "USD"
    assert ctx.display_name == "Tesla, Inc."
    assert ctx.regime_model_params == REGIME_PARAMS["EQUITY"]
    assert "price_history" in ctx.data_sources_active
    assert "sec_filings" in ctx.data_sources_active
    assert "on_chain_metrics" in ctx.data_sources_removed
    assert "nav_premium" in ctx.data_sources_removed


# ---------------------------------------------------------------------------
# Test 2 — BTC-USD (CRYPTO)
# ---------------------------------------------------------------------------

def test_crypto_btc_usd():
    """BTC-USD with quoteType='CRYPTOCURRENCY' must be classified as CRYPTO."""
    info = _mock_info("CRYPTOCURRENCY", long_name="Bitcoin USD",
                      exchange="CCC", currency="USD")

    with _patch_ticker(info):
        ctx = route("BTC-USD")

    assert ctx.asset_class == "CRYPTO"
    assert ctx.canonical_ticker == "BTC-USD"
    assert ctx.pipeline_id == PIPELINE_MAP["CRYPTO"]      # "pipelines.crypto"
    assert ctx.disclaimer_variant == "CRYPTO_US"
    assert ctx.unknown_fallback is False
    assert ctx.display_name == "Bitcoin USD"
    assert ctx.regime_model_params["market_hours"] == "24/7"
    assert ctx.regime_model_params["high_vol_threshold"] == 0.80
    assert "on_chain_metrics" in ctx.data_sources_active
    assert "funding_rates" in ctx.data_sources_active
    assert "sec_filings" in ctx.data_sources_removed
    assert "earnings" in ctx.data_sources_removed


# ---------------------------------------------------------------------------
# Test 3 — GC=F (COMMODITY)
# ---------------------------------------------------------------------------

def test_commodity_gcf():
    """GC=F with quoteType='FUTURE' must be classified as COMMODITY."""
    info = _mock_info("FUTURE", long_name="Gold (Futures)",
                      exchange="CMX", currency="USD")

    with _patch_ticker(info):
        ctx = route("GC=F")

    assert ctx.asset_class == "COMMODITY"
    assert ctx.canonical_ticker == "GC=F"
    assert ctx.pipeline_id == PIPELINE_MAP["COMMODITY"]   # "pipelines.commodity"
    assert ctx.disclaimer_variant == "COMMODITY"
    assert ctx.unknown_fallback is False
    assert ctx.display_name == "Gold (Futures)"
    assert ctx.regime_model_params["seasonality_aware"] is True
    assert "futures_basis" in ctx.data_sources_active
    assert "cot_report" in ctx.data_sources_active
    assert "sec_filings" in ctx.data_sources_removed
    assert "on_chain_metrics" in ctx.data_sources_removed


# ---------------------------------------------------------------------------
# Test 4 — SPY (ETF, standard equity-tracking)
# ---------------------------------------------------------------------------

def test_etf_spy():
    """SPY with quoteType='ETF' must be classified as ETF → pipelines.etf."""
    info = _mock_info("ETF", long_name="SPDR S&P 500 ETF Trust",
                      exchange="PCX", currency="USD")

    with _patch_ticker(info):
        ctx = route("SPY")

    assert ctx.asset_class == "ETF"
    assert ctx.canonical_ticker == "SPY"
    assert ctx.pipeline_id == PIPELINE_MAP["ETF"]         # "pipelines.etf"
    assert ctx.disclaimer_variant == "US_EQUITY"          # standard ETF → equity disclaimer
    assert ctx.unknown_fallback is False
    assert ctx.display_name == "SPDR S&P 500 ETF Trust"
    assert ctx.regime_model_params["track_nav_premium"] is True
    assert "nav_premium" in ctx.data_sources_active
    assert "holdings" in ctx.data_sources_active
    assert "on_chain_metrics" in ctx.data_sources_removed


# ---------------------------------------------------------------------------
# Test 5 — GLD (commodity ETF hybrid routing)
# ---------------------------------------------------------------------------

def test_etf_gld_hybrid_commodity():
    """GLD is a commodity ETF — must route to pipelines.commodity even though
    yfinance reports quoteType='ETF'."""
    info = _mock_info("ETF", long_name="SPDR Gold Shares",
                      exchange="PCX", currency="USD")

    with _patch_ticker(info):
        ctx = route("GLD")

    assert ctx.asset_class == "ETF"                       # still classified as ETF
    assert ctx.canonical_ticker == "GLD"
    assert ctx.pipeline_id == PIPELINE_MAP["COMMODITY"]   # hybrid → "pipelines.commodity"
    assert ctx.disclaimer_variant == "COMMODITY"          # commodity disclaimer
    assert ctx.unknown_fallback is False


# ---------------------------------------------------------------------------
# Test 6 — Unknown ticker fallback
# ---------------------------------------------------------------------------

def test_unknown_ticker_fallback():
    """An unrecognised ticker that makes yfinance raise must trigger
    unknown_fallback=True and default to the EQUITY pipeline."""
    with patch(
        "pipelines.asset_class_router.yf.Ticker",
        side_effect=Exception("simulated yfinance failure"),
    ):
        ctx = route("XXXX")

    assert ctx.asset_class == "EQUITY"
    assert ctx.canonical_ticker == "XXXX"
    assert ctx.pipeline_id == PIPELINE_MAP["EQUITY"]
    assert ctx.unknown_fallback is True
    # Even in fallback, all fields must be populated
    assert ctx.disclaimer_variant == "US_EQUITY"
    assert isinstance(ctx.data_sources_active, list)
    assert isinstance(ctx.data_sources_removed, list)
    assert isinstance(ctx.regime_model_params, dict)


# ---------------------------------------------------------------------------
# Additional structural tests
# ---------------------------------------------------------------------------

def test_asset_context_is_dataclass():
    """AssetContext must be a proper dataclass with all required fields."""
    import dataclasses
    fields = {f.name for f in dataclasses.fields(AssetContext)}
    required = {
        "asset_class", "canonical_ticker", "display_name", "exchange",
        "currency", "pipeline_id", "disclaimer_variant",
        "data_sources_active", "data_sources_removed",
        "regime_model_params", "unknown_fallback",
    }
    assert required.issubset(fields), (
        f"Missing AssetContext fields: {required - fields}"
    )


def test_pipeline_map_completeness():
    """PIPELINE_MAP must cover every asset class."""
    for cls in ("EQUITY", "CRYPTO", "COMMODITY", "ETF"):
        assert cls in PIPELINE_MAP
        assert PIPELINE_MAP[cls].startswith("pipelines.")


def test_regime_params_completeness():
    """REGIME_PARAMS must cover every asset class."""
    for cls in ("EQUITY", "CRYPTO", "COMMODITY", "ETF"):
        assert cls in REGIME_PARAMS
        assert isinstance(REGIME_PARAMS[cls], dict)
