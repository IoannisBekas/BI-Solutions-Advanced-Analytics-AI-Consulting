"""
tests/test_commodity_pipeline.py
==================================
Unit tests for pipelines/commodity.py.

Verifies for GC=F (Gold) and CL=F (Crude Oil):
  1. Payload is valid
  2. COT signal is present
  3. Futures term structure is present
  4. Real yield is present
  5. Seasonal overlay is present
  6. EIA supply data present for oil, absent for gold
  7. No equity-specific fields (earnings, analyst, 13F, insider, Kelly)
  8. No crypto-specific fields (on-chain, fear/greed, funding rates)
"""

from __future__ import annotations

import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pandas as pd
import pytest

from pipelines.commodity import run_commodity_pipeline
from pipelines.data_architecture import QuantusPayload, validate_payload
from tests.test_equity_pipeline import _make_ohlcv


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_GOLD_INFO = {
    "longName":   "Gold Futures,  Jun 2026",
    "exchange":   "CMX",
    "marketCap":  0,
    "beta":       0.0,
}

_OIL_INFO = {
    "longName":   "Crude Oil Jul 26",
    "exchange":   "NYM",
    "marketCap":  0,
    "beta":       0.0,
}


def _run(ticker: str, info: dict, **kwargs) -> QuantusPayload:
    price_base = 2_300 if "GC" in ticker else 70
    df = _make_ohlcv(n=504, base_price=price_base)
    mock = MagicMock()
    mock.info = info
    mock.history.return_value = df.rename(columns=str.capitalize)

    async def _inner():
        with (
            patch("pipelines.commodity.yf.Ticker", return_value=mock),
            patch("pipelines.equity.yf.Ticker",    return_value=mock),
            patch("pipelines.commodity.fetch_grok_sentiment",
                  new=AsyncMock(return_value={"score": 0.0, "volume": 100,
                                               "campaign_detected": False, "top_themes": []})),
            patch("pipelines.commodity.fetch_reddit_sentiment",
                  new=AsyncMock(return_value=0.02)),
            patch("pipelines.commodity.fetch_news_sentiment",
                  new=AsyncMock(return_value=-0.01)),
        ):
            return await run_commodity_pipeline(ticker, **kwargs)

    return asyncio.run(_inner())


# ---------------------------------------------------------------------------
# 1. Payload validity
# ---------------------------------------------------------------------------

class TestCommodityPayloadValid:

    def test_gold_payload_valid(self):
        p = _run("GC=F", _GOLD_INFO)
        is_valid, errors = validate_payload(p)
        assert is_valid, f"Validation errors: {errors}"

    def test_crude_payload_valid(self):
        p = _run("CL=F", _OIL_INFO)
        is_valid, errors = validate_payload(p)
        assert is_valid, f"Validation errors: {errors}"

    def test_asset_class_is_commodity(self):
        p = _run("GC=F", _GOLD_INFO)
        assert p.asset_class == "COMMODITY"

    def test_market_cap_is_zero_for_futures(self):
        p = _run("GC=F", _GOLD_INFO)
        assert p.market_cap == 0.0


# ---------------------------------------------------------------------------
# 2. COT report
# ---------------------------------------------------------------------------

class TestCOTReport:

    payload: QuantusPayload

    @classmethod
    def setup_class(cls):
        cls.payload = _run("GC=F", _GOLD_INFO)

    def test_cot_data_present(self):
        assert "cot_data" in self.payload.asset_specific

    def test_cot_has_commercial_net(self):
        assert "commercial_net" in self.payload.asset_specific["cot_data"]

    def test_cot_has_non_commercial_net(self):
        assert "non_commercial_net" in self.payload.asset_specific["cot_data"]

    def test_cot_has_divergence_signal(self):
        assert "divergence_signal" in self.payload.asset_specific["cot_data"]

    def test_cot_has_interpretation(self):
        interp = self.payload.asset_specific["cot_data"].get("interpretation", "")
        assert isinstance(interp, str) and len(interp) > 0


# ---------------------------------------------------------------------------
# 3. Futures term structure
# ---------------------------------------------------------------------------

class TestFuturesTermStructure:

    def test_gold_term_structure_present(self):
        p = _run("GC=F", _GOLD_INFO)
        assert "futures_curve" in p.asset_specific

    def test_term_structure_has_contango_or_backwardation(self):
        p = _run("GC=F", _GOLD_INFO)
        structure = p.asset_specific["futures_curve"]["structure"]
        assert structure in ("CONTANGO", "BACKWARDATION")

    def test_roll_yield_present(self):
        p = _run("GC=F", _GOLD_INFO)
        assert "roll_yield_annualised_pct" in p.asset_specific["futures_curve"]

    def test_roll_yield_is_numeric(self):
        p = _run("GC=F", _GOLD_INFO)
        ry = p.asset_specific["futures_curve"]["roll_yield_annualised_pct"]
        assert isinstance(ry, (int, float))

    def test_oil_has_contango_structure(self):
        """Energy commodities typically in contango (storage costs)."""
        p = _run("CL=F", _OIL_INFO)
        # The stub returns CONTANGO for energy
        assert p.asset_specific["futures_curve"]["structure"] == "CONTANGO"

    def test_gold_has_backwardation_structure(self):
        """Non-energy like gold typically in backwardation (convenience yield)."""
        p = _run("GC=F", _GOLD_INFO)
        assert p.asset_specific["futures_curve"]["structure"] == "BACKWARDATION"


# ---------------------------------------------------------------------------
# 4. Real yield (FRED TIPS)
# ---------------------------------------------------------------------------

class TestRealYield:

    def test_real_yield_present(self):
        p = _run("GC=F", _GOLD_INFO)
        assert "real_yield" in p.asset_specific

    def test_real_yield_has_value(self):
        p = _run("GC=F", _GOLD_INFO)
        assert "real_yield_10y" in p.asset_specific["real_yield"]
        assert isinstance(p.asset_specific["real_yield"]["real_yield_10y"], float)

    def test_real_yield_has_series_id(self):
        p = _run("GC=F", _GOLD_INFO)
        assert p.asset_specific["real_yield"]["series"] == "DFII10"

    def test_real_yield_has_correlation_note(self):
        p = _run("GC=F", _GOLD_INFO)
        note = p.asset_specific["real_yield"].get("correlation_note", "")
        assert isinstance(note, str) and len(note) > 10


# ---------------------------------------------------------------------------
# 5. Seasonal overlay
# ---------------------------------------------------------------------------

class TestSeasonalOverlay:

    def test_seasonal_present(self):
        p = _run("GC=F", _GOLD_INFO)
        assert "seasonal" in p.asset_specific

    def test_gold_has_positive_sep_oct_pattern(self):
        p = _run("GC=F", _GOLD_INFO)
        assert p.asset_specific["seasonal"]["pattern"] == "POSITIVE_SEP_OCT"

    def test_crude_has_positive_apr_jun_pattern(self):
        p = _run("CL=F", _OIL_INFO)
        assert p.asset_specific["seasonal"]["pattern"] == "POSITIVE_APR_JUN"

    def test_seasonal_has_note(self):
        p = _run("GC=F", _GOLD_INFO)
        note = p.asset_specific["seasonal"].get("note", "")
        assert isinstance(note, str) and len(note) > 10


# ---------------------------------------------------------------------------
# 6. EIA supply data (oil only)
# ---------------------------------------------------------------------------

class TestEIASupply:

    def test_eia_supply_present_for_crude(self):
        p = _run("CL=F", _OIL_INFO)
        eia = p.asset_specific.get("eia_supply")
        assert eia is not None
        assert "crude_inventories_mbbl" in eia

    def test_eia_supply_absent_for_gold(self):
        p = _run("GC=F", _GOLD_INFO)
        eia = p.asset_specific.get("eia_supply")
        assert eia is None

    def test_eia_has_signal(self):
        p = _run("CL=F", _OIL_INFO)
        assert "signal" in p.asset_specific["eia_supply"]
        assert p.asset_specific["eia_supply"]["signal"] in ("BULLISH", "BEARISH", "NEUTRAL")


# ---------------------------------------------------------------------------
# 7. No equity-specific fields
# ---------------------------------------------------------------------------

class TestEquityFieldsAbsent:

    payload: QuantusPayload

    @classmethod
    def setup_class(cls):
        cls.payload = _run("GC=F", _GOLD_INFO)

    def test_days_to_earnings_none(self):
        assert self.payload.days_to_earnings is None

    def test_analyst_buy_none(self):
        assert self.payload.analyst_buy is None

    def test_analyst_hold_none(self):
        assert self.payload.analyst_hold is None

    def test_analyst_sell_none(self):
        assert self.payload.analyst_sell is None

    def test_analyst_avg_target_none(self):
        assert self.payload.analyst_avg_target is None

    def test_institutional_flow_delta_none(self):
        assert self.payload.institutional_flow_delta is None

    def test_insider_net_activity_none(self):
        assert self.payload.insider_net_activity is None

    def test_short_interest_none(self):
        assert self.payload.short_interest_pct is None

    def test_kelly_criterion_none(self):
        assert self.payload.kelly_criterion_pct is None

    def test_kelly_none_for_institutional_too(self):
        p = _run("GC=F", _GOLD_INFO, user_tier="INSTITUTIONAL")
        assert p.kelly_criterion_pct is None


# ---------------------------------------------------------------------------
# 8. No crypto-specific fields
# ---------------------------------------------------------------------------

class TestCryptoFieldsAbsent:

    def test_no_on_chain_key_in_asset_specific(self):
        p = _run("GC=F", _GOLD_INFO)
        assert "on_chain" not in p.asset_specific

    def test_no_fear_greed_in_asset_specific(self):
        p = _run("GC=F", _GOLD_INFO)
        assert "fear_greed_index" not in p.asset_specific

    def test_no_funding_rates_in_asset_specific(self):
        p = _run("GC=F", _GOLD_INFO)
        assert "funding_rates" not in p.asset_specific
