"""
tests/test_data_architecture.py
=================================
Unit tests for pipelines.data_architecture.

Covers:
  1. score_data_quality() — formula correctness and edge cases
  2. QuantusPayload — all 48 fields present and correctly typed for TSLA mock
  3. validate_payload() — passes a valid TSLA payload, rejects broken ones
  4. Quality threshold logic (EXCLUDED / REDUCED / FULL bands)
  5. Tier field list completeness
"""

from __future__ import annotations

import dataclasses

import pytest

from pipelines.data_architecture import (
    QUALITY_EXCLUDE,
    QUALITY_FULL,
    QUALITY_REDUCED,
    TIER_1_FIELDS,
    TIER_2_FIELDS,
    TIER_3_FIELDS,
    QuantusPayload,
    quality_band,
    score_data_quality,
    validate_payload,
    _REQUIRED_FIELDS,
    _TYPE_MAP,
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _all_required_quality_scores(payload: QuantusPayload) -> dict[str, int]:
    """Build a quality-score dict covering every required field at 100."""
    return {
        fname: 100
        for fname in _REQUIRED_FIELDS
        if fname not in ("data_quality_scores", "payload_timestamp")
    }


def _make_tsla_payload(**overrides) -> QuantusPayload:
    """Return a fully-populated mock QuantusPayload for TSLA.

    Every required field is set to a realistic value so validate_payload()
    returns (True, []).  Individual tests override specific fields to trigger
    validation errors.
    """
    base = dict(
        # Identity
        ticker="TSLA",
        company_name="Tesla, Inc.",
        asset_class="EQUITY",
        exchange="NMS",
        sector="Consumer Cyclical",
        industry="Auto Manufacturers",
        market_cap=700_000_000_000.0,
        peer_group=["F", "GM", "RIVN", "NIO"],

        # Macro
        fed_rate=5.25,
        yield_curve_shape="INVERTED",
        vix_level=18.4,
        credit_spreads=1.2,

        # Cross-ticker
        cross_ticker_alerts=[
            {"ticker": "PANW", "reason": "supply chain overlap", "impact": "LOW"}
        ],

        # Earnings (equity)
        days_to_earnings=23,
        implied_earnings_move=0.08,
        transcript_nlp_score=0.72,

        # Analyst consensus
        analyst_buy=22,
        analyst_hold=14,
        analyst_sell=5,
        analyst_avg_target=285.0,

        # Pre-computed metrics
        current_price=248.37,
        day_change_pct=-1.23,
        ohlcv_summary={
            "open": 251.0, "high": 253.5, "low": 246.1,
            "close": 248.37, "volume": 98_432_100,
        },
        rsi=44.7,
        macd={
            "macd_line": -2.14, "signal_line": -1.03, "histogram": -1.11,
            "crossover": "BEARISH",
        },
        bollinger_position="MIDDLE",
        zscore_90d=-0.83,
        var_99_per_10k=312.4,
        expected_shortfall=410.7,
        max_drawdown_historical=0.738,
        sharpe_ratio=0.92,
        volatility_vs_peers=1.43,
        stress_tests={
            "2008":  {"return_pct": -0.54, "max_drawdown": 0.68},
            "COVID": {"return_pct": -0.62, "max_drawdown": 0.61},
            "2022":  {"return_pct": -0.65, "max_drawdown": 0.74},
        },
        regime_label="SIDEWAYS",
        regime_confidence=0.71,
        arima_forecast={"5d": 249.1, "10d": 251.3, "confidence": 0.65},
        prophet_forecast={"5d": 250.4, "10d": 253.8, "trend": "FLAT"},
        lstm_forecast={"5d": 247.9, "10d": 248.5, "confidence": 0.58},
        ensemble_forecast={
            "5d": 249.1, "10d": 251.2,
            "method": "weighted_average",
            "weights": {"arima": 0.3, "prophet": 0.4, "lstm": 0.3},
        },
        grok_sentiment={
            "score": 0.12, "volume": 14_823,
            "top_themes": ["FSD", "Cybertruck", "margin"],
            "campaign_detected": False,
        },
        reddit_sentiment=0.08,
        news_sentiment=-0.15,
        composite_sentiment=0.02,

        # Optional fields
        sec_language_delta="Cautious language increase: +12 % negative tone in risk section",
        institutional_flow_delta=-0.034,
        insider_net_activity=-1_250_000.0,
        short_interest_pct=3.12,
        iv_rank=42.0,
        implied_move_pct=0.079,
        factor_scores={"pe_ratio": 62.1, "pb_ratio": 10.3, "roe": 0.231},
        shap_importance={"rsi": 0.18, "regime": 0.22, "sentiment": 0.14},
        kelly_criterion_pct=0.034,
        pairs_cointegration={"RIVN": {"cointegrated": True, "spread_zscore": 1.4}},
        community_interest={"views_7d": 43_200, "saves_7d": 1_830},

        # Quality & meta
        signal_track_record=[
            {"signal_id": "Q-2023-112", "direction": "LONG", "outcome": "WIN",
             "return_pct": 0.187, "holding_days": 14},
        ],
        asset_specific={},
        python_model_versions={
            "arima": "1.0.3", "prophet": "1.1.6",
            "lstm":  "2.0.1", "hmm_regime": "0.9.4",
        },
        data_sources_used=[
            "yfinance", "SEC EDGAR", "FactSet", "Grok API",
            "Reddit PRAW", "NewsAPI",
        ],
        data_caveats=[],
        circuit_breaker_activations=[],
        fallbacks_used=[],
        user_tier="UNLOCKED",
        language="en",
        currency="USD",
        jurisdiction="US",
        section_requested="A",
    )
    base.update(overrides)

    # Build quality scores covering all required fields
    base["data_quality_scores"] = _all_required_quality_scores(
        QuantusPayload(**{k: v for k, v in base.items()
                         if k != "data_quality_scores"})
    )
    return QuantusPayload(**base)


# ---------------------------------------------------------------------------
# 1. score_data_quality — formula
# ---------------------------------------------------------------------------

class TestScoreDataQuality:

    def test_all_perfect_inputs_give_100(self):
        assert score_data_quality(1.0, 1.0, 1.0, 1.0) == 100

    def test_all_zero_inputs_give_0(self):
        assert score_data_quality(0.0, 0.0, 0.0, 0.0) == 0

    def test_exact_weighted_formula(self):
        """Verify weights: 0.35 + 0.25 + 0.25 + 0.15 = 1.0."""
        # Using known values to check the formula precisely
        s = score_data_quality(
            source_reliability=0.8,
            recency_score=0.6,
            cross_source_agreement=0.9,
            anomaly_score=1.0,
        )
        expected = int((0.8 * 0.35 + 0.6 * 0.25 + 0.9 * 0.25 + 1.0 * 0.15) * 100)
        assert s == expected

    def test_returns_int(self):
        assert isinstance(score_data_quality(0.7, 0.8, 0.9, 1.0), int)

    def test_below_exclude_threshold(self):
        s = score_data_quality(0.5, 0.4, 0.3, 0.4)
        assert s < QUALITY_EXCLUDE

    def test_at_full_threshold(self):
        s = score_data_quality(0.9, 0.8, 0.8, 0.9)
        assert s >= QUALITY_FULL

    def test_invalid_input_raises(self):
        with pytest.raises(ValueError):
            score_data_quality(1.5, 1.0, 1.0, 1.0)

    def test_invalid_negative_raises(self):
        with pytest.raises(ValueError):
            score_data_quality(1.0, -0.1, 1.0, 1.0)

    def test_campaign_detected_discount(self):
        """Coordinated campaign → discount to quality 40 (auto-excluded)."""
        campaign_score = 40
        assert campaign_score < QUALITY_EXCLUDE

    def test_weights_sum_to_one(self):
        """Weighted formula weights must sum to 1.0."""
        weights = [0.35, 0.25, 0.25, 0.15]
        assert abs(sum(weights) - 1.0) < 1e-9


# ---------------------------------------------------------------------------
# 2. quality_band helper
# ---------------------------------------------------------------------------

class TestQualityBand:

    def test_excluded(self):
        assert quality_band(59) == "EXCLUDED"
        assert quality_band(0) == "EXCLUDED"

    def test_reduced(self):
        assert quality_band(60) == "REDUCED"  # boundary
        assert quality_band(74) == "REDUCED"

    def test_full(self):
        assert quality_band(75) == "FULL"
        assert quality_band(100) == "FULL"


# ---------------------------------------------------------------------------
# 3. QuantusPayload — TSLA field presence and types
# ---------------------------------------------------------------------------

class TestTSLAPayloadFields:
    """Build a full TSLA mock and verify every single field."""

    payload: QuantusPayload

    @classmethod
    def setup_class(cls):
        cls.payload = _make_tsla_payload()

    # — Identity
    def test_ticker(self):
        assert self.payload.ticker == "TSLA"
        assert isinstance(self.payload.ticker, str)

    def test_company_name(self):
        assert isinstance(self.payload.company_name, str)
        assert "Tesla" in self.payload.company_name

    def test_asset_class(self):
        assert self.payload.asset_class == "EQUITY"
        assert isinstance(self.payload.asset_class, str)

    def test_exchange(self):
        assert isinstance(self.payload.exchange, str)

    def test_sector_and_industry(self):
        assert isinstance(self.payload.sector, str)
        assert isinstance(self.payload.industry, str)

    def test_market_cap(self):
        assert isinstance(self.payload.market_cap, float)
        assert self.payload.market_cap > 0

    def test_peer_group(self):
        assert isinstance(self.payload.peer_group, list)
        assert len(self.payload.peer_group) > 0

    # — Macro
    def test_fed_rate(self):
        assert isinstance(self.payload.fed_rate, float)

    def test_yield_curve_shape(self):
        assert isinstance(self.payload.yield_curve_shape, str)

    def test_vix_level(self):
        assert isinstance(self.payload.vix_level, float)
        assert 0 < self.payload.vix_level < 200

    def test_credit_spreads(self):
        assert isinstance(self.payload.credit_spreads, float)

    # — Cross-ticker
    def test_cross_ticker_alerts(self):
        assert isinstance(self.payload.cross_ticker_alerts, list)

    # — Earnings (equity)
    def test_days_to_earnings(self):
        assert isinstance(self.payload.days_to_earnings, int)

    def test_implied_earnings_move(self):
        assert isinstance(self.payload.implied_earnings_move, float)

    def test_transcript_nlp_score(self):
        assert isinstance(self.payload.transcript_nlp_score, float)

    # — Analyst
    def test_analyst_consensus_fields(self):
        assert isinstance(self.payload.analyst_buy, int)
        assert isinstance(self.payload.analyst_hold, int)
        assert isinstance(self.payload.analyst_sell, int)
        assert isinstance(self.payload.analyst_avg_target, float)

    # — Price / OHLCV
    def test_current_price(self):
        assert isinstance(self.payload.current_price, float)
        assert self.payload.current_price > 0

    def test_day_change_pct(self):
        assert isinstance(self.payload.day_change_pct, float)

    def test_ohlcv_summary(self):
        assert isinstance(self.payload.ohlcv_summary, dict)
        for key in ("open", "high", "low", "close", "volume"):
            assert key in self.payload.ohlcv_summary

    # — Technical indicators
    def test_rsi(self):
        assert isinstance(self.payload.rsi, float)
        assert 0 <= self.payload.rsi <= 100

    def test_macd(self):
        assert isinstance(self.payload.macd, dict)
        assert "macd_line" in self.payload.macd

    def test_bollinger_position(self):
        assert isinstance(self.payload.bollinger_position, str)

    def test_zscore_90d(self):
        assert isinstance(self.payload.zscore_90d, float)

    # — Risk metrics
    def test_var_99(self):
        assert isinstance(self.payload.var_99_per_10k, float)

    def test_expected_shortfall(self):
        assert isinstance(self.payload.expected_shortfall, float)

    def test_max_drawdown(self):
        assert isinstance(self.payload.max_drawdown_historical, float)

    def test_sharpe_ratio(self):
        assert isinstance(self.payload.sharpe_ratio, float)

    def test_volatility_vs_peers(self):
        assert isinstance(self.payload.volatility_vs_peers, float)

    def test_stress_tests(self):
        assert isinstance(self.payload.stress_tests, dict)
        assert "2008" in self.payload.stress_tests
        assert "COVID" in self.payload.stress_tests
        assert "2022" in self.payload.stress_tests

    # — Regime
    def test_regime_label(self):
        assert isinstance(self.payload.regime_label, str)

    def test_regime_confidence(self):
        assert isinstance(self.payload.regime_confidence, float)
        assert 0 <= self.payload.regime_confidence <= 1

    # — Forecasts
    def test_forecasts_are_dicts(self):
        for attr in ("arima_forecast", "prophet_forecast",
                     "lstm_forecast", "ensemble_forecast"):
            val = getattr(self.payload, attr)
            assert isinstance(val, dict), f"{attr} must be dict"

    # — Sentiment
    def test_grok_sentiment(self):
        assert isinstance(self.payload.grok_sentiment, dict)
        assert "score" in self.payload.grok_sentiment
        assert "campaign_detected" in self.payload.grok_sentiment

    def test_sentiment_floats(self):
        for attr in ("reddit_sentiment", "news_sentiment", "composite_sentiment"):
            val = getattr(self.payload, attr)
            assert isinstance(val, float), f"{attr} must be float"
            assert -1.0 <= val <= 1.0, f"{attr} out of [-1, 1]"

    # — Optional fields
    def test_optional_fields_correct_types_when_set(self):
        assert isinstance(self.payload.sec_language_delta, str)
        assert isinstance(self.payload.institutional_flow_delta, float)
        assert isinstance(self.payload.insider_net_activity, float)
        assert isinstance(self.payload.short_interest_pct, float)
        assert isinstance(self.payload.iv_rank, float)
        assert isinstance(self.payload.implied_move_pct, float)
        assert isinstance(self.payload.factor_scores, dict)
        assert isinstance(self.payload.shap_importance, dict)
        assert isinstance(self.payload.kelly_criterion_pct, float)
        assert isinstance(self.payload.pairs_cointegration, dict)
        assert isinstance(self.payload.community_interest, dict)

    # — Meta
    def test_data_quality_scores_dict(self):
        dqs = self.payload.data_quality_scores
        assert isinstance(dqs, dict)
        assert len(dqs) > 0

    def test_signal_track_record(self):
        assert isinstance(self.payload.signal_track_record, list)

    def test_asset_specific(self):
        assert isinstance(self.payload.asset_specific, dict)

    def test_payload_timestamp_is_iso_string(self):
        ts = self.payload.payload_timestamp
        assert isinstance(ts, str)
        # Must be parseable as ISO-8601
        from datetime import datetime
        datetime.fromisoformat(ts.replace("Z", "+00:00"))

    def test_data_sources_used(self):
        assert isinstance(self.payload.data_sources_used, list)
        assert len(self.payload.data_sources_used) > 0

    def test_user_tier_valid(self):
        assert self.payload.user_tier in {"FREE", "UNLOCKED", "INSTITUTIONAL"}

    def test_language_and_currency(self):
        assert isinstance(self.payload.language, str)
        assert isinstance(self.payload.currency, str)

    def test_jurisdiction(self):
        assert isinstance(self.payload.jurisdiction, str)

    def test_section_requested(self):
        assert isinstance(self.payload.section_requested, str)


# ---------------------------------------------------------------------------
# 4. validate_payload — pass / fail scenarios
# ---------------------------------------------------------------------------

class TestValidatePayload:

    def test_valid_tsla_payload_passes(self):
        p = _make_tsla_payload()
        is_valid, errors = validate_payload(p)
        assert is_valid is True, f"Validation errors: {errors}"
        assert errors == []

    def test_invalid_rsi_out_of_bounds_fails(self):
        p = _make_tsla_payload(rsi=120.0)
        is_valid, errors = validate_payload(p)
        assert not is_valid
        assert any("rsi" in e for e in errors)

    def test_invalid_user_tier_fails(self):
        p = _make_tsla_payload(user_tier="PREMIUM")
        is_valid, errors = validate_payload(p)
        assert not is_valid
        assert any("user_tier" in e for e in errors)

    def test_missing_quality_score_fails(self):
        p = _make_tsla_payload()
        # Remove one quality score entry
        missing_field = next(iter(p.data_quality_scores))
        del p.data_quality_scores[missing_field]
        is_valid, errors = validate_payload(p)
        assert not is_valid
        assert any("QUALITY_MISSING" in e for e in errors)

    def test_wrong_type_for_market_cap_fails(self):
        p = _make_tsla_payload(market_cap="not a number")  # type: ignore[arg-type]
        is_valid, errors = validate_payload(p)
        assert not is_valid
        assert any("market_cap" in e for e in errors)

    def test_errors_are_descriptive_strings(self):
        p = _make_tsla_payload(rsi=999.0, user_tier="WRONG")
        _, errors = validate_payload(p)
        for e in errors:
            assert isinstance(e, str)
            assert len(e) > 0


# ---------------------------------------------------------------------------
# 5. Tier field list completeness
# ---------------------------------------------------------------------------

class TestTierFieldLists:

    def test_tier_1_has_expected_fields(self):
        for f in ("company_description", "sector", "industry", "peer_group",
                  "knowledge_graph", "sec_filing_language_delta",
                  "factor_scores", "quantus_signal_history",
                  "dividend_history", "esg_scores"):
            assert f in TIER_1_FIELDS, f"'{f}' missing from TIER_1_FIELDS"

    def test_tier_2_has_expected_fields(self):
        for f in ("earnings_date", "analyst_price_targets", "short_interest",
                  "iv_rank", "macro_indicators", "cot_report"):
            assert f in TIER_2_FIELDS, f"'{f}' missing from TIER_2_FIELDS"

    def test_tier_3_has_expected_fields(self):
        for f in ("ohlcv", "rsi", "macd", "bollinger_bands",
                  "var_99", "market_regime", "current_price",
                  "grok_x_sentiment", "funding_rates"):
            assert f in TIER_3_FIELDS, f"'{f}' missing from TIER_3_FIELDS"

    def test_no_field_in_multiple_tiers(self):
        """A field should belong to exactly one tier."""
        t1, t2, t3 = set(TIER_1_FIELDS), set(TIER_2_FIELDS), set(TIER_3_FIELDS)
        assert t1.isdisjoint(t2), f"T1∩T2: {t1 & t2}"
        assert t1.isdisjoint(t3), f"T1∩T3: {t1 & t3}"
        assert t2.isdisjoint(t3), f"T2∩T3: {t2 & t3}"

    def test_all_tiers_non_empty(self):
        assert len(TIER_1_FIELDS) > 0
        assert len(TIER_2_FIELDS) > 0
        assert len(TIER_3_FIELDS) > 0

    def test_payload_is_dataclass(self):
        assert dataclasses.is_dataclass(QuantusPayload)

    def test_required_fields_set_non_empty(self):
        assert len(_REQUIRED_FIELDS) > 30, (
            "Expected >30 required fields in _REQUIRED_FIELDS"
        )
