"""
tests/test_equity_pipeline.py
==============================
Unit tests for pipelines.equity — the equity data pipeline.

All external API calls are mocked:
  - yfinance.Ticker.history   → synthetic 500-row OHLCV DataFrame
  - yfinance.Ticker.info      → TSLA metadata dict
  - fetch_grok_sentiment      → AsyncMock returning stub dict
  - fetch_reddit_sentiment    → AsyncMock returning 0.05
  - fetch_news_sentiment      → AsyncMock returning -0.03

Tests validate the payload contract is fully met for TSLA.
"""

from __future__ import annotations

import asyncio
import math
from datetime import date, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import numpy as np
import pandas as pd
import pytest

from pipelines.equity import (
    STRESS_SCENARIOS,
    compute_bollinger,
    compute_es,
    compute_kelly,
    compute_macd,
    compute_max_drawdown,
    compute_rsi,
    compute_sharpe,
    compute_var,
    compute_zscore,
    detect_regime,
    run_arima,
    run_equity_pipeline,
)
from pipelines.data_architecture import QuantusPayload, validate_payload, _REQUIRED_FIELDS


# ---------------------------------------------------------------------------
# Helpers — synthetic market data
# ---------------------------------------------------------------------------

def _make_ohlcv(n: int = 504, base_price: float = 240.0,
                seed: int = 42) -> pd.DataFrame:
    """Return a realistic OHLCV DataFrame with `n` daily bars."""
    rng = np.random.default_rng(seed)
    dates = [date(2023, 1, 3) + timedelta(days=i * 365 // 252) for i in range(n)]
    log_ret = rng.normal(0.0003, 0.02, n)
    close = base_price * np.exp(np.cumsum(log_ret))
    high  = close * (1 + rng.uniform(0.001, 0.015, n))
    low   = close * (1 - rng.uniform(0.001, 0.015, n))
    open_ = close * (1 + rng.normal(0, 0.005, n))
    vol   = rng.integers(50_000_000, 150_000_000, n)
    idx   = pd.to_datetime(dates)
    return pd.DataFrame(
        {"open": open_, "high": high, "low": low, "close": close, "volume": vol},
        index=idx,
    )


_TSLA_INFO: dict = {
    "longName":       "Tesla, Inc.",
    "exchange":       "NMS",
    "sector":         "Consumer Cyclical",
    "industry":       "Auto Manufacturers",
    "marketCap":      700_000_000_000,
    "beta":           2.0,
    "targetMeanPrice": 285.0,
    "relatedTickers": ["F", "GM", "RIVN", "NIO"],
}

_OHLCV_DF = _make_ohlcv()


def _mock_ticker(info: dict = _TSLA_INFO, ohlcv: pd.DataFrame = _OHLCV_DF):
    """Build a MagicMock that mimics yf.Ticker with .info and .history()."""
    mock = MagicMock()
    mock.info = info
    mock.history.return_value = ohlcv.rename(columns=str.capitalize)  # yfinance returns Title case
    return mock


def _run_pipeline(**overrides) -> QuantusPayload:
    """Run the equity pipeline for TSLA with all external calls mocked."""
    ticker_mock = _mock_ticker()

    async def _inner():
        with (
            patch("pipelines.equity.yf.Ticker", return_value=ticker_mock),
            patch("pipelines.equity.fetch_grok_sentiment",
                  new=AsyncMock(return_value={"score": 0.05, "volume": 1200,
                                               "campaign_detected": False,
                                               "top_themes": ["FSD"]})),
            patch("pipelines.equity.fetch_reddit_sentiment",
                  new=AsyncMock(return_value=0.08)),
            patch("pipelines.equity.fetch_news_sentiment",
                  new=AsyncMock(return_value=-0.02)),
        ):
            return await run_equity_pipeline("TSLA", **overrides)

    return asyncio.run(_inner())


# ---------------------------------------------------------------------------
# 1. Core payload validity — the primary contract test
# ---------------------------------------------------------------------------

class TestTSLAPayloadContract:
    """Validate that the equity pipeline produces a schema-compliant QuantusPayload for TSLA."""

    payload: QuantusPayload

    @classmethod
    def setup_class(cls):
        cls.payload = _run_pipeline(user_tier="INSTITUTIONAL")

    def test_payload_passes_validate(self):
        is_valid, errors = validate_payload(self.payload)
        assert is_valid, f"Validation errors: {errors}"

    def test_no_validation_errors(self):
        _, errors = validate_payload(self.payload)
        assert errors == []

    def test_payload_is_quantus_payload_instance(self):
        assert isinstance(self.payload, QuantusPayload)

    def test_ticker_is_tsla(self):
        assert self.payload.ticker == "TSLA"

    def test_asset_class_is_equity(self):
        assert self.payload.asset_class == "EQUITY"

    def test_company_name_present(self):
        assert isinstance(self.payload.company_name, str)
        assert len(self.payload.company_name) > 0


# ---------------------------------------------------------------------------
# 2. Required fields — every non-optional field must be non-None
# ---------------------------------------------------------------------------

class TestRequiredFieldsPresent:

    payload: QuantusPayload

    @classmethod
    def setup_class(cls):
        cls.payload = _run_pipeline()

    def test_required_fields_non_none(self):
        """No required field should be None."""
        import dataclasses
        as_dict = dataclasses.asdict(self.payload)
        for fname in _REQUIRED_FIELDS:
            assert as_dict[fname] is not None, f"Required field '{fname}' is None"

    def test_data_quality_scores_cover_required_fields(self):
        dqs = self.payload.data_quality_scores
        for fname in _REQUIRED_FIELDS:
            if fname not in ("data_quality_scores", "payload_timestamp"):
                assert fname in dqs, f"No quality score for '{fname}'"

    def test_data_sources_used_non_empty(self):
        assert isinstance(self.payload.data_sources_used, list)
        assert len(self.payload.data_sources_used) > 0


# ---------------------------------------------------------------------------
# 3. Technical indicators — range and type checks
# ---------------------------------------------------------------------------

class TestTechnicalIndicators:

    payload: QuantusPayload

    @classmethod
    def setup_class(cls):
        cls.payload = _run_pipeline()

    def test_rsi_in_valid_range(self):
        assert 0.0 <= self.payload.rsi <= 100.0

    def test_rsi_is_float(self):
        assert isinstance(self.payload.rsi, float)

    def test_macd_is_dict_with_required_keys(self):
        assert isinstance(self.payload.macd, dict)
        for key in ("macd_line", "signal_line", "histogram", "crossover"):
            assert key in self.payload.macd, f"MACD missing key '{key}'"

    def test_bollinger_position_is_valid_label(self):
        valid = {"ABOVE_UPPER", "UPPER_HALF", "LOWER_HALF", "BELOW_LOWER"}
        assert self.payload.bollinger_position in valid

    def test_zscore_is_float(self):
        assert isinstance(self.payload.zscore_90d, float)

    def test_current_price_positive(self):
        assert self.payload.current_price > 0

    def test_ohlcv_summary_has_required_keys(self):
        for key in ("open", "high", "low", "close", "volume"):
            assert key in self.payload.ohlcv_summary


# ---------------------------------------------------------------------------
# 4. Risk metrics
# ---------------------------------------------------------------------------

class TestRiskMetrics:

    payload: QuantusPayload

    @classmethod
    def setup_class(cls):
        cls.payload = _run_pipeline()

    def test_var_99_positive(self):
        assert self.payload.var_99_per_10k > 0

    def test_expected_shortfall_positive(self):
        assert self.payload.expected_shortfall > 0

    def test_es_greater_than_var(self):
        """Expected Shortfall must be ≥ VaR (by definition of CVaR)."""
        assert self.payload.expected_shortfall >= self.payload.var_99_per_10k

    def test_max_drawdown_negative_or_zero(self):
        assert self.payload.max_drawdown_historical <= 0

    def test_stress_tests_have_all_three_scenarios(self):
        st = self.payload.stress_tests
        assert isinstance(st, dict)
        for scenario in ("2008", "COVID", "2022"):
            assert scenario in st, f"Stress test missing scenario '{scenario}'"

    def test_each_stress_scenario_has_required_keys(self):
        for name, result in self.payload.stress_tests.items():
            assert "market_shock" in result, f"Scenario '{name}' missing market_shock"
            assert "beta_adjusted_return" in result

    def test_sharpe_is_float(self):
        assert isinstance(self.payload.sharpe_ratio, float)


# ---------------------------------------------------------------------------
# 5. Regime detection
# ---------------------------------------------------------------------------

class TestRegimeDetection:

    payload: QuantusPayload

    @classmethod
    def setup_class(cls):
        cls.payload = _run_pipeline()

    def test_regime_label_is_valid(self):
        valid = {"STRONG_UPTREND", "UPTREND", "SIDEWAYS", "DOWNTREND", "HIGH_VOL"}
        assert self.payload.regime_label in valid

    def test_regime_confidence_in_range(self):
        assert 0.0 <= self.payload.regime_confidence <= 1.0


# ---------------------------------------------------------------------------
# 6. Forecast ensemble
# ---------------------------------------------------------------------------

class TestForecastEnsemble:

    payload: QuantusPayload

    @classmethod
    def setup_class(cls):
        cls.payload = _run_pipeline()

    def test_ensemble_forecast_has_weights(self):
        ef = self.payload.ensemble_forecast
        assert isinstance(ef, dict)
        assert "weights" in ef
        assert "lstm" in ef["weights"]
        assert "prophet" in ef["weights"]
        assert "arima" in ef["weights"]

    def test_ensemble_weights_sum_to_one(self):
        w = self.payload.ensemble_forecast["weights"]
        assert abs(sum(w.values()) - 1.0) < 1e-6

    def test_arima_forecast_is_dict(self):
        assert isinstance(self.payload.arima_forecast, dict)

    def test_arima_has_30d_key(self):
        assert "30d" in self.payload.arima_forecast

    def test_ensemble_has_directional_agreement(self):
        assert "directional_agreement" in self.payload.ensemble_forecast


# ---------------------------------------------------------------------------
# 7. Sentiment
# ---------------------------------------------------------------------------

class TestSentiment:

    payload: QuantusPayload

    @classmethod
    def setup_class(cls):
        cls.payload = _run_pipeline()

    def test_grok_sentiment_is_dict(self):
        assert isinstance(self.payload.grok_sentiment, dict)
        assert "score" in self.payload.grok_sentiment

    def test_reddit_sentiment_in_range(self):
        assert -1.0 <= self.payload.reddit_sentiment <= 1.0

    def test_news_sentiment_in_range(self):
        assert -1.0 <= self.payload.news_sentiment <= 1.0

    def test_composite_sentiment_in_range(self):
        assert -1.0 <= self.payload.composite_sentiment <= 1.0

    def test_composite_is_weighted_of_components(self):
        """Composite = Grok×0.5 + Reddit×0.25 + News×0.25."""
        p = self.payload
        grok_score = float(p.grok_sentiment.get("score", 0.0))
        expected = round(grok_score * 0.50 + p.reddit_sentiment * 0.25
                         + p.news_sentiment * 0.25, 4)
        assert abs(p.composite_sentiment - expected) < 0.001


# ---------------------------------------------------------------------------
# 8. Kelly criterion (INSTITUTIONAL only)
# ---------------------------------------------------------------------------

class TestKellyCriterion:

    def test_kelly_present_for_institutional(self):
        p = _run_pipeline(user_tier="INSTITUTIONAL")
        assert p.kelly_criterion_pct is not None
        assert isinstance(p.kelly_criterion_pct, float)

    def test_kelly_absent_for_free(self):
        p = _run_pipeline(user_tier="FREE")
        assert p.kelly_criterion_pct is None

    def test_kelly_capped_at_10_pct(self):
        from pipelines.equity import compute_kelly
        assert compute_kelly(0.99, 100.0) <= 0.10


# ---------------------------------------------------------------------------
# 9. Unit tests for individual computation functions
# ---------------------------------------------------------------------------

class TestComputationFunctions:

    df: pd.DataFrame

    @classmethod
    def setup_class(cls):
        cls.df = _make_ohlcv()

    def test_rsi_stays_in_bounds(self):
        assert 0 <= compute_rsi(self.df) <= 100

    def test_macd_returns_dict(self):
        m = compute_macd(self.df)
        assert isinstance(m, dict)
        assert "crossover" in m

    def test_bollinger_returns_string(self):
        b = compute_bollinger(self.df)
        assert isinstance(b, str)

    def test_zscore_is_numeric(self):
        z = compute_zscore(self.df)
        assert math.isfinite(z)

    def test_var_positive(self):
        assert compute_var(self.df) > 0

    def test_es_positive(self):
        assert compute_es(self.df) > 0

    def test_max_drawdown_nonpositive(self):
        assert compute_max_drawdown(self.df) <= 0

    def test_sharpe_is_finite(self):
        assert math.isfinite(compute_sharpe(self.df))

    def test_arima_has_30d(self):
        fc = run_arima(self.df)
        assert "30d" in fc
        assert fc["30d"] > 0

    def test_detect_regime_returns_valid_label(self):
        r = detect_regime(self.df)
        valid = {"STRONG_UPTREND", "UPTREND", "SIDEWAYS", "DOWNTREND", "HIGH_VOL"}
        assert r["label"] in valid
        assert 0.0 <= r["confidence"] <= 1.0

    def test_kelly_zero_for_zero_edge(self):
        assert compute_kelly(0.0, 1.0) == 0.0

    def test_stress_scenarios_all_present(self):
        for name in ("2008", "COVID", "2022"):
            assert name in STRESS_SCENARIOS
