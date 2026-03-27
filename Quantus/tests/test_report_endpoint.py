"""
tests/test_report_endpoint.py
==============================
Integration tests for api/report.py.

All external calls mocked:
  - run_pipeline     → pre-built TSLA QuantusPayload
  - LLM provider     → valid QuantusReportSection payload
  - cache            → MockReportCache
"""

from __future__ import annotations

import asyncio
import json
import uuid
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.report import router, set_cache
from pipelines.cache import MockReportCache
from pipelines.data_architecture import QuantusPayload

# ---------------------------------------------------------------------------
# Helpers — shared fixtures
# ---------------------------------------------------------------------------

def _make_tsla_payload() -> QuantusPayload:
    """Minimal valid TSLA QuantusPayload for mocking."""
    from tests.test_data_architecture import _make_tsla_payload as _mk
    return _mk()


def _make_valid_report(ticker: str = "TSLA", section: str = "A") -> dict:
    """Return a mock QuantusReportSection dict that passes validation."""
    return {
        "engine":               "Meridian v2.4",
        "report_id":            str(uuid.uuid4()),
        "section":              section,
        "asset_class":          "EQUITY",
        "overall_signal":       "BUY",
        "confidence_score":     72,
        "confidence_breakdown": {
            "momentum": 14, "sentiment": 10, "regime_alignment": 11,
            "model_ensemble_agreement": 11, "alternative_data": 9,
            "macro_context": 8, "data_quality": 9,
        },
        "regime": {
            "label": "SIDEWAYS",
            "implication": "Mean reversion active — momentum signals suppressed.",
            "active_strategies": ["mean_reversion"],
            "suppressed_strategies": ["momentum"],
        },
        "narrative_technical": (
            "Tesla trades at $248 with RSI at 44.7, marginally oversold relative "
            "to its 90-day Z-score of -0.83. MACD histogram remains negative, "
            "consistent with a SIDEWAYS regime where mean-reversion setups dominate.\n\n"
            "The VaR model estimates up to -$312 per $10,000 notional at 99% confidence, "
            "elevated relative to the peer median. Stress tests indicate -45% beta-adjusted "
            "drawdown in a 2008-style shock, recovering within 18 months historically.\n\n"
            "Composite sentiment is effectively neutral at 0.02, with no campaign detected "
            "on Grok/X. News flow is slightly negative at -0.15, consistent with margin "
            "concerns that have weighed on EV names sector-wide."
        ),
        "narrative_plain": (
            "Tesla is range-bound with no strong directional signal at current prices. "
            "Risk is elevated relative to peers — size positions accordingly. "
            "Watch for RSI below 40 or a MACD crossover as potential entry signals."
        ),
        "narrative_language": "en",
        "key_metrics": [
            {"label": "RSI (14)", "value": "44.7", "confidence": 90,
             "trend": "neutral", "one_liner": "Approaching oversold — no reversal signal yet.",
             "data_freshness": "yfinance · live · 2 min ago"},
        ],
        "signals": [
            {"type": "momentum", "direction": "neutral", "strength": "weak",
             "rationale": "RSI and MACD both below neutral, regime suppresses momentum."},
        ],
        "stress_tests": [
            {"scenario": "2008", "estimated_return_pct": -38.0,
             "dollar_loss_per_10k": 3800, "recovery_months": 18},
            {"scenario": "COVID", "estimated_return_pct": -25.2,
             "dollar_loss_per_10k": 2520, "recovery_months": 5},
            {"scenario": "2022", "estimated_return_pct": -29.4,
             "dollar_loss_per_10k": 2940, "recovery_months": 12},
        ],
        "strategy": {
            "action": "BUY",
            "confidence": 72,
            "regime_context": "SIDEWAYS regime — mean reversion preferred over trend-following.",
            "plain_english_summary": "A modest BUY at current levels. Wait for RSI < 40 before adding.",
        },
        "early_insight": "Tesla sits near 90-day mean with neutral sentiment — patient accumulation window.",
        "data_sources": [
            {"name": "yfinance", "tier": "B", "freshness": "live"},
        ],
        "data_caveats": ["prophet: stub", "lstm: stub"],
        "graceful_degradation": [],
        "risk_warnings": [
            "VaR elevated vs peer median — reduce position size.",
            "Grok sentiment volume below 90-day average — signal weight reduced.",
        ],
        "cross_references": [],
        "audit": {
            "prompt_version":           "Meridian v2.4",
            "python_model_versions":    {"arima": "0.14"},
            "data_quality_scores":      {"rsi": 90},
            "circuit_breakers_activated": [],
            "fallbacks_used":           [],
        },
    }


class FakeLLMProvider:
    def __init__(self, report: dict, errors: list[str] | None = None):
        self._report = report
        self._errors = errors or []
        self.generate_report = AsyncMock(return_value=(report, self._errors))


def _build_app(cache: MockReportCache) -> tuple[FastAPI, TestClient]:
    """Build a test FastAPI app with the report router mounted."""
    set_cache(cache)
    app = FastAPI()
    app.include_router(router)
    return app, TestClient(app)


# ---------------------------------------------------------------------------
# 1. GET /api/v1/report/{ticker} — fresh report
# ---------------------------------------------------------------------------

class TestGetReportEndpoint:

    def setup_method(self):
        self.cache = MockReportCache()
        self.app, self.client = _build_app(self.cache)
        self.payload = _make_tsla_payload()
        self.report  = _make_valid_report()

    def test_report_returns_200(self):
        provider = FakeLLMProvider(self.report)
        with (
            patch("api.report.run_pipeline", new=AsyncMock(return_value=self.payload)),
            patch("api.report._get_llm", return_value=provider),
        ):
            resp = self.client.get("/api/v1/report/TSLA")
        assert resp.status_code == 200

    def test_report_body_has_report_key(self):
        provider = FakeLLMProvider(self.report)
        with (
            patch("api.report.run_pipeline", new=AsyncMock(return_value=self.payload)),
            patch("api.report._get_llm", return_value=provider),
        ):
            body = self.client.get("/api/v1/report/TSLA").json()
        assert "report" in body

    def test_report_has_required_fields(self):
        provider = FakeLLMProvider(self.report)
        with (
            patch("api.report.run_pipeline", new=AsyncMock(return_value=self.payload)),
            patch("api.report._get_llm", return_value=provider),
        ):
            body = self.client.get("/api/v1/report/TSLA").json()
        r = body["report"]
        for key in ("engine", "report_id", "asset_class",
                    "overall_signal", "confidence_score"):
            assert key in r, f"Missing key '{key}'"

    def test_engine_is_meridian(self):
        provider = FakeLLMProvider(self.report)
        with (
            patch("api.report.run_pipeline", new=AsyncMock(return_value=self.payload)),
            patch("api.report._get_llm", return_value=provider),
        ):
            body = self.client.get("/api/v1/report/TSLA").json()
        assert body["report"]["engine"] == "Meridian v2.4"

    def test_fresh_report_cached_false(self):
        provider = FakeLLMProvider(self.report)
        with (
            patch("api.report.run_pipeline", new=AsyncMock(return_value=self.payload)),
            patch("api.report._get_llm", return_value=provider),
        ):
            body = self.client.get("/api/v1/report/TSLA").json()
        assert body["cached"] is False

    def test_ticker_normalised_to_uppercase(self):
        """Lowercase ticker in URL should still return a valid report."""
        provider = FakeLLMProvider(self.report)
        with (
            patch("api.report.run_pipeline", new=AsyncMock(return_value=self.payload)),
            patch("api.report._get_llm", return_value=provider),
        ):
            resp = self.client.get("/api/v1/report/tsla")
        assert resp.status_code == 200


# ---------------------------------------------------------------------------
# 2. Cache hit — second request served from cache
# ---------------------------------------------------------------------------

class TestCacheHit:

    def setup_method(self):
        self.cache = MockReportCache()
        self.app, self.client = _build_app(self.cache)
        self.payload = _make_tsla_payload()
        self.report  = _make_valid_report()

    def _first_request(self):
        provider = FakeLLMProvider(self.report)
        with (
            patch("api.report.run_pipeline", new=AsyncMock(return_value=self.payload)),
            patch("api.report._get_llm", return_value=provider),
        ):
            return self.client.get("/api/v1/report/TSLA").json()

    def test_second_request_returns_cached_true(self):
        self._first_request()
        body = self.client.get("/api/v1/report/TSLA").json()
        assert body["cached"] is True

    def test_cache_hit_returns_same_report_id(self):
        first  = self._first_request()
        second = self.client.get("/api/v1/report/TSLA").json()
        assert first["report"]["report_id"] == second["report"]["report_id"]

    def test_pipeline_not_called_on_cache_hit(self):
        self._first_request()
        mock_pipeline = AsyncMock(return_value=self.payload)
        with patch("api.report.run_pipeline", new=mock_pipeline):
            self.client.get("/api/v1/report/TSLA")
        mock_pipeline.assert_not_called()


# ---------------------------------------------------------------------------
# 3. GET /api/v1/report/{ticker}/status
# ---------------------------------------------------------------------------

class TestStatusEndpoint:

    def setup_method(self):
        self.cache = MockReportCache()
        self.app, self.client = _build_app(self.cache)
        self.payload = _make_tsla_payload()
        self.report  = _make_valid_report()

    def test_status_miss_on_empty_cache(self):
        resp = self.client.get("/api/v1/report/TSLA/status")
        assert resp.status_code == 200
        assert resp.json()["status"] == "MISS"

    def test_status_hit_after_report_generated(self):
        provider = FakeLLMProvider(self.report)
        with (
            patch("api.report.run_pipeline", new=AsyncMock(return_value=self.payload)),
            patch("api.report._get_llm", return_value=provider),
        ):
            self.client.get("/api/v1/report/TSLA")
        status = self.client.get("/api/v1/report/TSLA/status").json()
        assert status["status"] == "HIT"
        assert status["cached"] is True

    def test_status_has_metadata_after_generation(self):
        provider = FakeLLMProvider(self.report)
        with (
            patch("api.report.run_pipeline", new=AsyncMock(return_value=self.payload)),
            patch("api.report._get_llm", return_value=provider),
        ):
            self.client.get("/api/v1/report/TSLA")
        status = self.client.get("/api/v1/report/TSLA/status").json()
        assert "metadata" in status
        assert status["metadata"]["ticker"] == "TSLA"

    def test_status_cached_false_before_generation(self):
        resp = self.client.get("/api/v1/report/TSLA/status").json()
        assert resp["cached"] is False


# ---------------------------------------------------------------------------
# 4. Claude validation errors → 422
# ---------------------------------------------------------------------------

class TestClaudeValidationError:

    def setup_method(self):
        self.cache = MockReportCache()
        self.app, self.client = _build_app(self.cache)
        self.payload = _make_tsla_payload()

    def test_invalid_llm_output_falls_back_to_pipeline_only(self):
        provider = FakeLLMProvider({}, ["Missing required keys: ..."])
        with (
            patch("api.report.run_pipeline", new=AsyncMock(return_value=self.payload)),
            patch("api.report._get_llm", return_value=provider),
        ):
            resp = self.client.get("/api/v1/report/TSLA")
        body = resp.json()
        assert resp.status_code == 200
        assert body["source"] == "pipeline_only"
        assert "warning" in body
