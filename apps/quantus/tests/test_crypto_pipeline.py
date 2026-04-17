"""
tests/test_crypto_pipeline.py
==============================
Unit tests for pipelines/crypto.py.

Verifies:
  1. BTC-USD and ETH-USD produce valid QuantusPayload
  2. All equity-specific fields are None (no earnings, analyst, 13F, insider, Kelly)
  3. On-chain data block is present and correctly structured
  4. Crypto stress scenarios (2018/COVID/Luna) are present
  5. Regime thresholds are 3× equity thresholds
  6. Vol-adjusted position sizing is populated for INSTITUTIONAL tier
"""

from __future__ import annotations

import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import numpy as np
import pandas as pd
import pytest

from pipelines.crypto import (
    CRYPTO_REGIME_THRESHOLDS,
    CRYPTO_STRESS_SCENARIOS,
    detect_crypto_regime,
    run_crypto_pipeline,
    vol_adjusted_position_size,
)
from pipelines.data_architecture import QuantusPayload, validate_payload
from tests.test_equity_pipeline import _make_ohlcv, _TSLA_INFO


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_BTCUSD_INFO = {
    "longName":   "Bitcoin USD",
    "exchange":   "CCC",
    "marketCap":  1_350_000_000_000,
    "beta":       1.0,
}

_ETHUSD_INFO = {
    "longName":   "Ethereum USD",
    "exchange":   "CCC",
    "marketCap":  420_000_000_000,
    "beta":       1.0,
}


def _mock_ticker(info: dict, df: pd.DataFrame):
    mock = MagicMock()
    mock.info = info
    mock.history.return_value = df.rename(columns=str.capitalize)
    return mock


def _run_pipeline(ticker: str, info: dict, **kwargs) -> QuantusPayload:
    df = _make_ohlcv(n=504, base_price=60_000 if "BTC" in ticker else 3_000)
    mock_ticker = _mock_ticker(info, df)

    async def _inner():
        with (
            patch("pipelines.crypto.yf.Ticker", return_value=mock_ticker),
            patch("pipelines.equity.yf.Ticker", return_value=mock_ticker),
            patch("pipelines.crypto.fetch_grok_sentiment",
                  new=AsyncMock(return_value={"score": 0.1, "volume": 500,
                                               "campaign_detected": False, "top_themes": []})),
            patch("pipelines.crypto.fetch_reddit_sentiment",
                  new=AsyncMock(return_value=0.05)),
            patch("pipelines.crypto.fetch_news_sentiment",
                  new=AsyncMock(return_value=-0.01)),
        ):
            return await run_crypto_pipeline(ticker, **kwargs)

    return asyncio.run(_inner())


# ---------------------------------------------------------------------------
# 1. Payload validity
# ---------------------------------------------------------------------------

class TestCryptoPayloadValid:

    def test_btcusd_payload_passes_validation(self):
        p = _run_pipeline("BTC-USD", _BTCUSD_INFO)
        is_valid, errors = validate_payload(p)
        assert is_valid, f"Validation errors: {errors}"

    def test_ethusd_payload_passes_validation(self):
        p = _run_pipeline("ETH-USD", _ETHUSD_INFO)
        is_valid, errors = validate_payload(p)
        assert is_valid, f"Validation errors: {errors}"

    def test_asset_class_is_crypto(self):
        p = _run_pipeline("BTC-USD", _BTCUSD_INFO)
        assert p.asset_class == "CRYPTO"

    def test_ticker_stored_correctly(self):
        p = _run_pipeline("BTC-USD", _BTCUSD_INFO)
        assert p.ticker == "BTC-USD"


# ---------------------------------------------------------------------------
# 2. Equity-specific fields MUST be None
# ---------------------------------------------------------------------------

class TestEquityFieldsAbsent:

    payload: QuantusPayload

    @classmethod
    def setup_class(cls):
        cls.payload = _run_pipeline("BTC-USD", _BTCUSD_INFO)

    def test_days_to_earnings_is_none(self):
        assert self.payload.days_to_earnings is None

    def test_implied_earnings_move_is_none(self):
        assert self.payload.implied_earnings_move is None

    def test_transcript_nlp_score_is_none(self):
        assert self.payload.transcript_nlp_score is None

    def test_analyst_buy_is_none(self):
        assert self.payload.analyst_buy is None

    def test_analyst_hold_is_none(self):
        assert self.payload.analyst_hold is None

    def test_analyst_sell_is_none(self):
        assert self.payload.analyst_sell is None

    def test_analyst_avg_target_is_none(self):
        assert self.payload.analyst_avg_target is None

    def test_insider_net_activity_is_none(self):
        assert self.payload.insider_net_activity is None

    def test_institutional_flow_delta_is_none(self):
        assert self.payload.institutional_flow_delta is None

    def test_short_interest_pct_is_none(self):
        assert self.payload.short_interest_pct is None

    def test_kelly_criterion_pct_is_none(self):
        """Kelly NEVER shown for crypto — always None regardless of tier."""
        assert self.payload.kelly_criterion_pct is None

    def test_kelly_none_even_for_institutional(self):
        p = _run_pipeline("BTC-USD", _BTCUSD_INFO, user_tier="INSTITUTIONAL")
        assert p.kelly_criterion_pct is None


# ---------------------------------------------------------------------------
# 3. On-chain data block
# ---------------------------------------------------------------------------

class TestOnChainData:

    payload: QuantusPayload

    @classmethod
    def setup_class(cls):
        cls.payload = _run_pipeline("BTC-USD", _BTCUSD_INFO)

    def test_asset_specific_has_on_chain_key(self):
        assert "on_chain" in self.payload.asset_specific

    def test_on_chain_has_exchange_net_flow(self):
        assert "exchange_net_flow" in self.payload.asset_specific["on_chain"]

    def test_on_chain_has_mvrv_zscore(self):
        assert "mvrv_zscore" in self.payload.asset_specific["on_chain"]

    def test_on_chain_has_active_addresses(self):
        assert "active_addresses" in self.payload.asset_specific["on_chain"]

    def test_on_chain_has_funding_rates(self):
        assert "funding_rates" in self.payload.asset_specific["on_chain"]

    def test_on_chain_has_open_interest(self):
        assert "open_interest" in self.payload.asset_specific["on_chain"]

    def test_on_chain_has_fear_greed(self):
        assert "fear_greed_index" in self.payload.asset_specific["on_chain"]

    def test_btc_has_hash_rate(self):
        """Hash rate present for BTC, None for ETH."""
        hr = self.payload.asset_specific["on_chain"]["hash_rate"]
        assert hr is not None
        assert "hash_rate_eh_s" in hr

    def test_eth_has_no_hash_rate(self):
        p = _run_pipeline("ETH-USD", _ETHUSD_INFO)
        hr = p.asset_specific["on_chain"]["hash_rate"]
        assert hr is None


# ---------------------------------------------------------------------------
# 4. Crypto stress scenarios
# ---------------------------------------------------------------------------

class TestCryptoStressScenarios:

    payload: QuantusPayload

    @classmethod
    def setup_class(cls):
        cls.payload = _run_pipeline("BTC-USD", _BTCUSD_INFO)

    def test_all_crypto_scenarios_present(self):
        st = self.payload.stress_tests
        for scenario in ("2018_bear", "covid_2020", "luna_ust"):
            assert scenario in st, f"Missing scenario '{scenario}'"

    def test_no_equity_scenarios(self):
        """Crypto must NOT have the 2008/COVID/2022 equity scenarios."""
        st = self.payload.stress_tests
        assert "2008" not in st
        assert "COVID" not in st
        assert "2022" not in st

    def test_luna_shock_severe(self):
        """Luna/UST collapse was -70% — verify the shock is severe."""
        assert self.payload.stress_tests["luna_ust"]["market_shock"] <= -0.60

    def test_each_scenario_has_recovery_months(self):
        for name, result in self.payload.stress_tests.items():
            assert "recovery_months" in result, f"'{name}' missing recovery_months"


# ---------------------------------------------------------------------------
# 5. Regime calibration — 3× equity thresholds
# ---------------------------------------------------------------------------

class TestCryptoRegime:

    def test_strong_uptrend_threshold_is_3x_equity(self):
        """Equity: 0.15, Crypto: 0.45."""
        assert CRYPTO_REGIME_THRESHOLDS["strong_uptrend"] == pytest.approx(0.45)

    def test_uptrend_threshold_is_3x_equity(self):
        """Equity: 0.05, Crypto: 0.15."""
        assert CRYPTO_REGIME_THRESHOLDS["uptrend"] == pytest.approx(0.15)

    def test_detect_regime_returns_valid_label(self):
        df = _make_ohlcv(n=100)
        r  = detect_crypto_regime(df)
        valid = {"STRONG_UPTREND", "UPTREND", "SIDEWAYS", "DOWNTREND", "HIGH_VOL"}
        assert r["label"] in valid

    def test_extreme_gain_gives_strong_uptrend(self):
        """50% 30d gain → STRONG_UPTREND for crypto."""
        df   = _make_ohlcv(n=60, base_price=100)
        # Manually set last price much higher
        df.loc[df.index[-1], "close"] = df["close"].iloc[-31] * 1.55
        r = detect_crypto_regime(df)
        assert r["label"] == "STRONG_UPTREND"


# ---------------------------------------------------------------------------
# 6. Vol-adjusted position sizing
# ---------------------------------------------------------------------------

class TestVolAdjustedSize:

    def test_high_vol_gives_small_position(self):
        assert vol_adjusted_position_size(1.2) < vol_adjusted_position_size(0.3)

    def test_capped_at_max_position(self):
        assert vol_adjusted_position_size(0.001) == pytest.approx(0.025)

    def test_zero_vol_gives_zero_position(self):
        assert vol_adjusted_position_size(0.0) == 0.0

    def test_result_in_asset_specific(self):
        p = _run_pipeline("BTC-USD", _BTCUSD_INFO)
        assert "vol_adjusted_position_pct" in p.asset_specific
        assert isinstance(p.asset_specific["vol_adjusted_position_pct"], float)
