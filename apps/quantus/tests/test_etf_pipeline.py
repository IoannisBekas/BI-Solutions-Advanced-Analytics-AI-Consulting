import pytest
import asyncio
from pipelines.etf import run_etf_pipeline
from pipelines.commodity import run_commodity_pipeline
from pipelines.crypto import run_crypto_pipeline

@pytest.mark.asyncio
async def test_general_etf_pipeline():
    # SPY is a general equity ETF
    payload = await run_etf_pipeline("SPY")
    assert payload.ticker == "SPY"
    assert payload.asset_class == "ETF"
    assert "etf_data" in payload.asset_specific
    assert payload.asset_specific["etf_data"]["nav_premium_pct"] is not None
    assert len(payload.asset_specific["etf_data"]["top_holdings"]) > 0

@pytest.mark.asyncio
async def test_commodity_etf_overlay():
    # GLD is a commodity ETF
    # We call run_commodity_pipeline with asset_class="ETF"
    payload = await run_commodity_pipeline("GLD", asset_class="ETF")
    assert payload.ticker == "GLD"
    assert payload.asset_class == "ETF"
    assert "cot_data" in payload.asset_specific  # Commodity data
    assert "etf_data" in payload.asset_specific  # ETF overlay
    assert payload.asset_specific["etf_data"]["nav_premium_pct"] is not None

@pytest.mark.asyncio
async def test_crypto_etf_overlay():
    # IBIT is a crypto ETF
    payload = await run_crypto_pipeline("IBIT", asset_class="ETF")
    assert payload.ticker == "IBIT"
    assert payload.asset_class == "ETF"
    assert "on_chain" in payload.asset_specific  # Crypto data
    assert "etf_data" in payload.asset_specific # ETF overlay
    assert payload.asset_specific["etf_data"]["nav_premium_pct"] is not None

@pytest.mark.asyncio
async def test_leveraged_etf_overlay():
    # TQQQ is a 3x leveraged ETF
    payload = await run_etf_pipeline("TQQQ")
    assert payload.asset_class == "ETF"
    assert "leveraged_overlay" in payload.asset_specific
    assert payload.asset_specific["leveraged_overlay"]["leverage_factor"] in [3.0, -3.0]
    assert any("leveraged" in caveat.lower() for caveat in payload.data_caveats)
