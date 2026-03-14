"""
tests/test_email_service.py
============================
Unit tests for services/email.py.

Covers all 5 email types using MockEmailSender (no live SendGrid/Resend calls).
The primary integration test sends a TSLA STRONG BUY email and validates
every required element: asset class badge, regime badge, signal badge,
3 headline metrics, CTA link, jurisdiction disclaimer, unsubscribe link.
"""

from __future__ import annotations

import asyncio
import uuid

import pytest

from services.email import (
    ASSET_CLASS_BADGE,
    DISCLAIMERS,
    EmailService,
    EmailType,
    MockEmailSender,
    UserEmailPreferences,
    _pick_headline_metrics,
)


# ---------------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------------

def _tsla_report() -> dict:
    return {
        "ticker":           "TSLA",
        "company_name":     "Tesla, Inc.",
        "asset_class":      "EQUITY",
        "overall_signal":   "STRONG BUY",
        "confidence_score": 81,
        "section":          "A",
        "report_id":        str(uuid.uuid4()),
        "regime": {
            "label":       "UPTREND",
            "implication": "Momentum active — mean reversion suppressed.",
        },
        "key_metrics": [
            {"label": "RSI (14)",    "value": "67.3",    "trend": "up",
             "one_liner": "Approaching overbought — momentum intact."},
            {"label": "MACD",        "value": "Bullish",  "trend": "up",
             "one_liner": "Crossover confirmed — signal strengthening."},
            {"label": "VaR",         "value": "$310",     "trend": "neutral",
             "one_liner": "Up to -$310 per $10,000 at 99% confidence."},
        ],
        "early_insight": "Tesla momentum accelerating — breakout above $255 targets $280.",
        "signals":    [],
        "strategy":   {"action": "STRONG BUY", "confidence": 81, "regime_context": "",
                        "plain_english_summary": ""},
        "data_sources":  [],
        "data_caveats":  [],
        "risk_warnings": [],
        "audit":         {"prompt_version": "Meridian v2.4",
                           "python_model_versions": {}, "data_quality_scores": {},
                           "circuit_breakers_activated": [], "fallbacks_used": []},
        "narrative_technical": "TSLA in strong uptrend…",
        "narrative_plain":     "Tesla is bullish.",
        "narrative_language":  "en",
    }


def _prefs(jurisdiction: str = "US") -> UserEmailPreferences:
    return UserEmailPreferences(
        user_id="usr_001",
        email="test@example.com",
        name="Alex Researcher",
        tier="INSTITUTIONAL",
        jurisdiction=jurisdiction,
        unsubscribe_token="tok_abc123",
        watchlist=["TSLA", "AAPL"],
    )


def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


# ---------------------------------------------------------------------------
# 1. TSLA STRONG BUY — primary integration test
# ---------------------------------------------------------------------------

class TestTSLAStrongBuyEmail:
    """Validate every required element is present in the email body."""

    sender: MockEmailSender
    service: EmailService
    report: dict
    prefs: UserEmailPreferences

    @classmethod
    def setup_class(cls):
        cls.sender  = MockEmailSender()
        cls.service = EmailService(sender=cls.sender)
        cls.report  = _tsla_report()
        cls.prefs   = _prefs("US")
        _run(cls.service.send_new_report(cls.prefs, cls.report))

    def test_email_is_sent(self):
        assert len(self.sender.sent) == 1

    def test_email_type_is_new_report(self):
        assert self.sender.sent[0].email_type == EmailType.NEW_REPORT

    def test_subject_contains_signal(self):
        assert "STRONG BUY" in self.sender.sent[0].subject

    def test_subject_contains_ticker(self):
        assert "TSLA" in self.sender.sent[0].subject

    # ---- Asset class badge ----
    def test_html_contains_equity_badge(self):
        html = self.sender.sent[0].html_body
        assert "EQUITY" in html

    # ---- Regime badge ----
    def test_html_contains_regime_label(self):
        html = self.sender.sent[0].html_body
        assert "UPTREND" in html

    # ---- Signal badge ----
    def test_html_contains_signal(self):
        html = self.sender.sent[0].html_body
        assert "STRONG BUY" in html

    # ---- 3 headline metrics ----
    def test_html_contains_rsi_metric(self):
        html = self.sender.sent[0].html_body
        assert "RSI" in html

    def test_html_contains_macd_metric(self):
        html = self.sender.sent[0].html_body
        assert "MACD" in html

    def test_html_contains_var_metric(self):
        html = self.sender.sent[0].html_body
        assert "VaR" in html

    def test_exactly_three_metrics_rendered(self):
        metrics = _pick_headline_metrics(self.report)
        assert len(metrics) == 3

    # ---- CTA link ----
    def test_html_contains_cta_link(self):
        html = self.sender.sent[0].html_body
        assert "View Full Report" in html
        assert "TSLA" in html    # report URL contains ticker

    # ---- Jurisdiction disclaimer ----
    def test_html_contains_us_disclaimer(self):
        html = self.sender.sent[0].html_body
        assert "investment advice" in html.lower()

    def test_disclaimer_is_us_specific(self):
        html = self.sender.sent[0].html_body
        assert "registered investment adviser" in html.lower()

    # ---- Unsubscribe link ----
    def test_html_contains_unsubscribe_link(self):
        html = self.sender.sent[0].html_body
        assert "unsubscribe" in html.lower()

    def test_unsubscribe_contains_token(self):
        html = self.sender.sent[0].html_body
        assert "tok_abc123" in html


# ---------------------------------------------------------------------------
# 2. All 5 email types send without error
# ---------------------------------------------------------------------------

class TestAllEmailTypes:

    def setup_method(self):
        self.sender  = MockEmailSender()
        self.service = EmailService(sender=self.sender)
        self.report  = _tsla_report()
        self.prefs   = _prefs()

    def test_send_new_report(self):
        result = _run(self.service.send_new_report(self.prefs, self.report))
        assert result is True
        assert self.sender.sent[-1].email_type == EmailType.NEW_REPORT

    def test_send_report_refreshed(self):
        result = _run(self.service.send_report_refreshed(
            self.prefs, self.report, "earnings_release"
        ))
        assert result is True
        assert self.sender.sent[-1].email_type == EmailType.REFRESHED

    def test_send_alert_triggered(self):
        result = _run(self.service.send_alert_triggered(
            self.prefs, self.report, "NEUTRAL", "STRONG BUY"
        ))
        assert result is True
        assert self.sender.sent[-1].email_type == EmailType.ALERT

    def test_send_cross_ticker_alert(self):
        result = _run(self.service.send_cross_ticker_alert(
            self.prefs, "TSLA", "PANW", "supply_chain",
            "PANW reported a security breach — may impact EV software supply chain."
        ))
        assert result is True
        assert self.sender.sent[-1].email_type == EmailType.CROSS_TICKER

    def test_send_daily_digest(self):
        reports = [self.report, {**self.report, "ticker": "AAPL", "overall_signal": "BUY"}]
        result = _run(self.service.send_daily_digest(self.prefs, reports))
        assert result is True
        assert self.sender.sent[-1].email_type == EmailType.DAILY_DIGEST


# ---------------------------------------------------------------------------
# 3. Opt-out respected
# ---------------------------------------------------------------------------

class TestOptOut:

    def setup_method(self):
        self.sender  = MockEmailSender()
        self.service = EmailService(sender=self.sender)
        self.report  = _tsla_report()

    def test_new_report_opt_out(self):
        prefs = _prefs()
        prefs.new_report = False
        result = _run(self.service.send_new_report(prefs, self.report))
        assert result is False
        assert len(self.sender.sent) == 0

    def test_refresh_opt_out(self):
        prefs = _prefs()
        prefs.refreshed = False
        result = _run(self.service.send_report_refreshed(prefs, self.report, "earnings_release"))
        assert result is False

    def test_alert_opt_out(self):
        prefs = _prefs()
        prefs.alerts = False
        result = _run(self.service.send_alert_triggered(prefs, self.report, "NEUTRAL", "BUY"))
        assert result is False

    def test_digest_opt_out(self):
        prefs = _prefs()
        prefs.daily_digest = False
        result = _run(self.service.send_daily_digest(prefs, [self.report]))
        assert result is False


# ---------------------------------------------------------------------------
# 4. Jurisdiction disclaimers
# ---------------------------------------------------------------------------

class TestJurisdictionDisclaimers:

    def setup_method(self):
        self.sender  = MockEmailSender()
        self.service = EmailService(sender=self.sender)
        self.report  = _tsla_report()

    def _send(self, jurisdiction: str) -> str:
        prefs = _prefs(jurisdiction)
        _run(self.service.send_new_report(prefs, self.report))
        return self.sender.sent[-1].html_body

    def test_us_disclaimer_contains_registered_adviser(self):
        html = self._send("US")
        assert "registered investment adviser" in html.lower()

    def test_uk_disclaimer_contains_fca(self):
        html = self._send("UK")
        assert "FCA" in html

    def test_eu_disclaimer_contains_mifid(self):
        html = self._send("EU")
        assert "MiFID" in html

    def test_global_disclaimer_is_short(self):
        html = self._send("GLOBAL")
        assert "informational purposes" in html.lower()

    def test_all_jurisdictions_defined(self):
        for jurisdiction in ("US", "UK", "EU", "GLOBAL"):
            assert jurisdiction in DISCLAIMERS


# ---------------------------------------------------------------------------
# 5. Refreshed email — event reason in subject and body
# ---------------------------------------------------------------------------

class TestRefreshedEmail:

    def setup_method(self):
        self.sender  = MockEmailSender()
        self.service = EmailService(sender=self.sender)
        self.report  = _tsla_report()
        self.prefs   = _prefs()
        _run(self.service.send_report_refreshed(
            self.prefs, self.report, "earnings_release"
        ))

    def test_subject_mentions_update(self):
        assert "Updated" in self.sender.sent[0].subject

    def test_subject_contains_ticker(self):
        assert "TSLA" in self.sender.sent[0].subject

    def test_body_contains_reason(self):
        html = self.sender.sent[0].html_body
        assert "Earnings" in html or "earnings" in html

    def test_metadata_contains_event_reason(self):
        meta = self.sender.sent[0].metadata
        assert meta["event_reason"] == "earnings_release"


# ---------------------------------------------------------------------------
# 6. Signal change alert
# ---------------------------------------------------------------------------

class TestAlertEmail:

    def setup_method(self):
        self.sender  = MockEmailSender()
        self.service = EmailService(sender=self.sender)
        self.report  = _tsla_report()
        self.prefs   = _prefs()
        _run(self.service.send_alert_triggered(
            self.prefs, self.report, "NEUTRAL", "STRONG BUY"
        ))

    def test_subject_shows_transition(self):
        subj = self.sender.sent[0].subject
        assert "NEUTRAL" in subj and "STRONG BUY" in subj

    def test_html_shows_both_signals(self):
        html = self.sender.sent[0].html_body
        assert "NEUTRAL" in html
        assert "STRONG BUY" in html
