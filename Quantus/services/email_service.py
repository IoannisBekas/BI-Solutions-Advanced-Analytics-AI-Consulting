"""
services/email.py
==================
Email Notification Service — Quantus Research Solutions.

Implements 5 email types (send via Resend / SendGrid in production):
  1. new_report_available   — first report for a ticker
  2. report_refreshed       — re-generated on material event
  3. alert_triggered        — signal level change
  4. cross_ticker_alert     — knowledge graph relationship event
  5. daily_digest           — watchlist summary with top movers

Each email contains:
  - Asset class badge, regime badge, signal badge
  - 3 headline metrics (asset-class appropriate)
  - Single primary CTA linking to the report
  - Jurisdiction-adaptive disclaimer
  - Unsubscribe link

Production: swap MockEmailSender for ResendEmailSender or SendGridEmailSender.
"""

from __future__ import annotations

import dataclasses
import json
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

BASE_URL = "https://app.quantus.ai"   # production URL

SIGNAL_EMOJI = {
    "STRONG BUY":  "🟢",
    "BUY":         "🟩",
    "NEUTRAL":     "⬜",
    "SELL":        "🟧",
    "STRONG SELL": "🔴",
}

REGIME_EMOJI = {
    "STRONG_UPTREND": "🚀",
    "UPTREND":        "📈",
    "SIDEWAYS":       "↔️",
    "DOWNTREND":      "📉",
    "HIGH_VOL":       "⚡",
}

ASSET_CLASS_BADGE = {
    "EQUITY":    "📊 EQUITY",
    "CRYPTO":    "₿  CRYPTO",
    "COMMODITY": "🪨 COMMODITY",
    "ETF":       "🧺 ETF",
}

# Jurisdiction → disclaimer text
DISCLAIMERS = {
    "US": (
        "This report is provided for informational purposes only and does not constitute "
        "investment advice or an offer to buy or sell securities. Past performance is not "
        "indicative of future results. Quantus Research Solutions is not a registered "
        "investment adviser. Please consult a qualified financial professional before "
        "making any investment decisions."
    ),
    "UK": (
        "This report is for informational purposes only. Quantus Research Solutions is "
        "not authorised by the FCA. This communication does not constitute financial "
        "promotion under section 21 of the Financial Services and Markets Act 2000."
    ),
    "EU": (
        "This report is for informational purposes only and does not constitute "
        "investment advice within the meaning of MiFID II Directive 2014/65/EU. "
        "Past performance does not guarantee future results."
    ),
    "GLOBAL": (
        "For informational purposes only. Not investment advice. "
        "Past performance does not guarantee future results."
    ),
}

# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

class EmailType(str, Enum):
    NEW_REPORT     = "new_report_available"
    REFRESHED      = "report_refreshed"
    ALERT          = "alert_triggered"
    CROSS_TICKER   = "cross_ticker_alert"
    DAILY_DIGEST   = "daily_digest"


@dataclass
class UserEmailPreferences:
    user_id: str
    email: str
    name: str
    tier: str = "FREE"              # FREE | UNLOCKED | INSTITUTIONAL
    jurisdiction: str = "US"
    language: str = "en"
    currency: str = "USD"
    unsubscribe_token: str = ""

    # Per-notification type opt-ins
    new_report:   bool = True
    refreshed:    bool = True
    alerts:       bool = True
    cross_ticker: bool = True
    daily_digest: bool = True

    # Watchlist tickers
    watchlist: list[str] = field(default_factory=list)

    def unsubscribe_url(self) -> str:
        return f"{BASE_URL}/unsubscribe?token={self.unsubscribe_token}"


@dataclass
class EmailPayload:
    """Internal email payload passed to the sender."""
    to_email: str
    to_name: str
    subject: str
    html_body: str
    text_body: str
    email_type: EmailType
    ticker: str = ""
    metadata: dict = field(default_factory=dict)


@dataclass
class HeadlineMetric:
    label: str
    value: str
    trend: str   # "up" | "down" | "neutral"
    one_liner: str


# ---------------------------------------------------------------------------
# Asset-class appropriate headline metrics selector
# ---------------------------------------------------------------------------

def _pick_headline_metrics(report: dict) -> list[HeadlineMetric]:
    """Extract 3 most relevant metrics from a QuantusReportSection."""
    asset_class = report.get("asset_class", "EQUITY")
    metrics     = report.get("key_metrics", [])[:3]

    if metrics:
        return [
            HeadlineMetric(
                label=m.get("label", ""),
                value=m.get("value", ""),
                trend=m.get("trend", "neutral"),
                one_liner=m.get("one_liner", ""),
            )
            for m in metrics
        ]

    # Fallback defaults per asset class
    defaults: dict[str, list[HeadlineMetric]] = {
        "EQUITY": [
            HeadlineMetric("Signal",        report.get("overall_signal", "—"), "neutral", ""),
            HeadlineMetric("Confidence",    f"{report.get('confidence_score', 0):.0f}/100", "neutral", ""),
            HeadlineMetric("Regime",        report.get("regime", {}).get("label", "—"), "neutral", ""),
        ],
        "CRYPTO": [
            HeadlineMetric("Signal",        report.get("overall_signal", "—"), "neutral", ""),
            HeadlineMetric("Confidence",    f"{report.get('confidence_score', 0):.0f}/100", "neutral", ""),
            HeadlineMetric("Regime",        report.get("regime", {}).get("label", "—"), "neutral", ""),
        ],
        "COMMODITY": [
            HeadlineMetric("Signal",        report.get("overall_signal", "—"), "neutral", ""),
            HeadlineMetric("Confidence",    f"{report.get('confidence_score', 0):.0f}/100", "neutral", ""),
            HeadlineMetric("Regime",        report.get("regime", {}).get("label", "—"), "neutral", ""),
        ],
    }
    return defaults.get(asset_class, defaults["EQUITY"])


# ---------------------------------------------------------------------------
# HTML/text renderers (template-free, no Jinja dependency)
# ---------------------------------------------------------------------------

def _render_html(
    prefs: UserEmailPreferences,
    report: dict,
    email_type: EmailType,
    headline_metrics: list[HeadlineMetric],
    report_url: str,
    extra_body: str = "",
) -> str:
    ticker      = report.get("ticker", "") or report.get("audit", {}).get("ticker", "")
    asset_badge = ASSET_CLASS_BADGE.get(report.get("asset_class", "EQUITY"), "")
    regime      = report.get("regime", {})
    regime_label = regime.get("label", "UNKNOWN")
    regime_emoji = REGIME_EMOJI.get(regime_label, "")
    signal      = report.get("overall_signal", "NEUTRAL")
    sig_emoji   = SIGNAL_EMOJI.get(signal, "")
    conf        = report.get("confidence_score", 0)
    disclaimer  = DISCLAIMERS.get(prefs.jurisdiction, DISCLAIMERS["GLOBAL"])

    metric_rows = "".join(
        f"""
        <tr>
          <td style="padding:6px 0;color:#94a3b8;font-size:13px;">{m.label}</td>
          <td style="padding:6px 0;font-weight:600;font-size:13px;">
            {m.value}
            {"↑" if m.trend == "up" else "↓" if m.trend == "down" else ""}
          </td>
          <td style="padding:6px 0;color:#64748b;font-size:12px;">{m.one_liner}</td>
        </tr>"""
        for m in headline_metrics
    )

    return f"""<!DOCTYPE html>
<html lang="{prefs.language}">
<head><meta charset="UTF-8"><title>Quantus Research — {ticker}</title></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0f172a">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:12px;overflow:hidden;">

        <!-- Header bar -->
        <tr><td bgcolor="#6366f1" style="padding:20px 32px;">
          <span style="color:#fff;font-size:22px;font-weight:700;">Quantus Research</span>
          <span style="float:right;color:#c7d2fe;font-size:12px;line-height:32px;">Meridian v2.4</span>
        </td></tr>

        <!-- Badges -->
        <tr><td style="padding:20px 32px 12px;">
          <span style="background:#1d4ed8;color:#fff;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:600;">
            {asset_badge}
          </span>&nbsp;
          <span style="background:#374151;color:#e5e7eb;padding:4px 10px;border-radius:4px;font-size:12px;">
            {regime_emoji} {regime_label.replace("_", " ")}
          </span>&nbsp;
          <span style="background:#064e3b;color:#6ee7b7;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:700;">
            {sig_emoji} {signal}
          </span>
          <span style="float:right;color:#94a3b8;font-size:12px;padding-top:4px;">
            Confidence: <strong style="color:#e2e8f0;">{conf:.0f}/100</strong>
          </span>
        </td></tr>

        <!-- Ticker + company info -->
        <tr><td style="padding:0 32px 16px;">
          <h1 style="margin:0;color:#f8fafc;font-size:28px;">{ticker}</h1>
          <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">{report.get("section","A")} — {email_type.value.replace("_"," ").title()}</p>
        </td></tr>

        <!-- Headline metrics -->
        <tr><td style="padding:0 32px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="border-top:1px solid #334155;border-bottom:1px solid #334155;">
            {metric_rows}
          </table>
        </td></tr>

        <!-- Extra body (event-specific text) -->
        {"<tr><td style='padding:0 32px 20px;color:#cbd5e1;font-size:14px;line-height:1.6;'>" + extra_body + "</td></tr>" if extra_body else ""}

        <!-- CTA -->
        <tr><td align="center" style="padding:8px 32px 28px;">
          <a href="{report_url}"
             style="background:#6366f1;color:#fff;text-decoration:none;padding:14px 32px;
                    border-radius:8px;font-size:15px;font-weight:600;display:inline-block;">
            View Full Report →
          </a>
        </td></tr>

        <!-- Disclaimer -->
        <tr><td style="padding:16px 32px;border-top:1px solid #334155;">
          <p style="margin:0;color:#64748b;font-size:11px;line-height:1.6;">{disclaimer}</p>
        </td></tr>

        <!-- Unsubscribe -->
        <tr><td style="padding:8px 32px 20px;">
          <p style="margin:0;color:#475569;font-size:11px;">
            You're receiving this because you follow {ticker} on Quantus Research.&nbsp;
            <a href="{prefs.unsubscribe_url()}" style="color:#6366f1;">Unsubscribe</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


def _render_text(
    prefs: UserEmailPreferences,
    report: dict,
    email_type: EmailType,
    headline_metrics: list[HeadlineMetric],
    report_url: str,
    extra_body: str = "",
) -> str:
    ticker   = report.get("ticker", "")
    signal   = report.get("overall_signal", "NEUTRAL")
    regime   = report.get("regime", {}).get("label", "UNKNOWN")
    conf     = report.get("confidence_score", 0)
    disclaimer = DISCLAIMERS.get(prefs.jurisdiction, DISCLAIMERS["GLOBAL"])
    metrics_text = "\n".join(f"  {m.label}: {m.value}" for m in headline_metrics)

    return (
        f"Quantus Research — {ticker}\n"
        f"{'=' * 50}\n"
        f"Signal: {signal} | Regime: {regime} | Confidence: {conf:.0f}/100\n\n"
        f"Key Metrics:\n{metrics_text}\n\n"
        f"{extra_body}\n\n" if extra_body else ""
        f"View Full Report: {report_url}\n\n"
        f"---\n{disclaimer}\n\n"
        f"Unsubscribe: {prefs.unsubscribe_url()}"
    )

# ---------------------------------------------------------------------------
# Email sender abstraction
# ---------------------------------------------------------------------------

class EmailSender(ABC):
    @abstractmethod
    async def send(self, payload: EmailPayload) -> bool: ...


class MockEmailSender(EmailSender):
    """In-process mock — stores all sent emails for test assertions."""

    def __init__(self):
        self.sent: list[EmailPayload] = []

    async def send(self, payload: EmailPayload) -> bool:
        logger.info("mock_email | %s → %s (%s)", payload.ticker,
                    payload.to_email, payload.email_type.value)
        self.sent.append(payload)
        return True


# ---------------------------------------------------------------------------
# Email type builders
# ---------------------------------------------------------------------------

class EmailService:
    """High-level email service. Inject a custom sender in production."""

    def __init__(self, sender: EmailSender | None = None):
        self.sender = sender or MockEmailSender()

    def _report_url(self, ticker: str, section: str = "A") -> str:
        return f"{BASE_URL}/report/{ticker}?section={section}"

    # ---- 1. New report available ----------------------------------------

    async def send_new_report(
        self, prefs: UserEmailPreferences, report: dict
    ) -> bool:
        if not prefs.new_report:
            return False
        ticker   = report.get("ticker", "")
        signal   = report.get("overall_signal", "NEUTRAL")
        metrics  = _pick_headline_metrics(report)
        url      = self._report_url(ticker)
        extra    = (
            f"<strong>{ticker}</strong> report is now available. "
            f"Signal: <strong>{signal}</strong>. {report.get('early_insight', '')}"
        )
        subject  = f"📊 {ticker} Report Ready — {signal}"
        html     = _render_html(prefs, report, EmailType.NEW_REPORT, metrics, url, extra)
        text     = _render_text(prefs, report, EmailType.NEW_REPORT, metrics, url, extra)
        return await self.sender.send(EmailPayload(
            to_email=prefs.email, to_name=prefs.name,
            subject=subject, html_body=html, text_body=text,
            email_type=EmailType.NEW_REPORT, ticker=ticker,
        ))

    # ---- 2. Report refreshed on material event --------------------------

    async def send_report_refreshed(
        self, prefs: UserEmailPreferences, report: dict, event_reason: str
    ) -> bool:
        if not prefs.refreshed:
            return False
        ticker   = report.get("ticker", "")
        metrics  = _pick_headline_metrics(report)
        url      = self._report_url(ticker)
        reason_human = event_reason.replace("_", " ").title()
        extra    = f"Report refreshed due to: <strong>{reason_human}</strong>. New analysis now available."
        subject  = f"🔄 {ticker} Report Updated — {reason_human}"
        html     = _render_html(prefs, report, EmailType.REFRESHED, metrics, url, extra)
        text     = _render_text(prefs, report, EmailType.REFRESHED, metrics, url, extra)
        return await self.sender.send(EmailPayload(
            to_email=prefs.email, to_name=prefs.name,
            subject=subject, html_body=html, text_body=text,
            email_type=EmailType.REFRESHED, ticker=ticker,
            metadata={"event_reason": event_reason},
        ))

    # ---- 3. Alert triggered (signal change) -----------------------------

    async def send_alert_triggered(
        self,
        prefs: UserEmailPreferences,
        report: dict,
        previous_signal: str,
        new_signal: str,
    ) -> bool:
        if not prefs.alerts:
            return False
        ticker   = report.get("ticker", "")
        metrics  = _pick_headline_metrics(report)
        url      = self._report_url(ticker)
        extra    = (
            f"Signal changed: <strong>{previous_signal}</strong> → "
            f"<strong>{new_signal}</strong><br>"
            f"{report.get('early_insight', '')}"
        )
        subject  = f"🔔 {ticker} Signal Change — {previous_signal} → {new_signal}"
        html     = _render_html(prefs, report, EmailType.ALERT, metrics, url, extra)
        text     = _render_text(prefs, report, EmailType.ALERT, metrics, url, extra)
        return await self.sender.send(EmailPayload(
            to_email=prefs.email, to_name=prefs.name,
            subject=subject, html_body=html, text_body=text,
            email_type=EmailType.ALERT, ticker=ticker,
            metadata={"previous_signal": previous_signal, "new_signal": new_signal},
        ))

    # ---- 4. Cross-ticker knowledge graph alert --------------------------

    async def send_cross_ticker_alert(
        self,
        prefs: UserEmailPreferences,
        watched_ticker: str,
        related_ticker: str,
        relationship: str,
        event_description: str,
    ) -> bool:
        if not prefs.cross_ticker:
            return False
        stub_report = {
            "ticker": watched_ticker, "asset_class": "EQUITY",
            "overall_signal": "NEUTRAL", "confidence_score": 0,
            "regime": {"label": "UNKNOWN"},
        }
        metrics  = []
        url      = self._report_url(watched_ticker)
        extra    = (
            f"<strong>{related_ticker}</strong> ({relationship}) — "
            f"{event_description}<br><br>"
            f"This may affect <strong>{watched_ticker}</strong> via the knowledge graph."
        )
        subject  = f"🔗 Cross-Ticker Alert: {related_ticker} may affect {watched_ticker}"
        html     = _render_html(prefs, stub_report, EmailType.CROSS_TICKER, metrics, url, extra)
        text     = _render_text(prefs, stub_report, EmailType.CROSS_TICKER, metrics, url, extra)
        return await self.sender.send(EmailPayload(
            to_email=prefs.email, to_name=prefs.name,
            subject=subject, html_body=html, text_body=text,
            email_type=EmailType.CROSS_TICKER, ticker=watched_ticker,
            metadata={"related_ticker": related_ticker, "relationship": relationship},
        ))

    # ---- 5. Daily digest ------------------------------------------------

    async def send_daily_digest(
        self,
        prefs: UserEmailPreferences,
        reports: list[dict],   # one per watchlist ticker
    ) -> bool:
        if not prefs.daily_digest:
            return False
        if not reports:
            return False

        # Build a compact summary per ticker
        lines = []
        for r in reports:
            t   = r.get("ticker", "")
            sig = r.get("overall_signal", "NEUTRAL")
            conf = r.get("confidence_score", 0)
            reg = r.get("regime", {}).get("label", "–")
            emoji = SIGNAL_EMOJI.get(sig, "")
            lines.append(f"<li><strong>{t}</strong>: {emoji} {sig} | {conf:.0f}/100 | {reg.replace('_',' ')}</li>")

        digest_html = "<ul style='padding-left:18px;color:#cbd5e1;font-size:13px;'>" + "".join(lines) + "</ul>"
        url         = f"{BASE_URL}/watchlist"
        first_report = reports[0]
        metrics     = []
        extra       = f"Your watchlist for {datetime.now(timezone.utc).strftime('%b %d, %Y')}:{digest_html}"
        subject     = f"📋 Daily Digest — {len(reports)} tickers updated"

        stub = {
            "ticker": "DIGEST", "asset_class": "EQUITY",
            "overall_signal": "–", "confidence_score": 0,
            "regime": {"label": "MIXED"},
        }
        html = _render_html(prefs, stub, EmailType.DAILY_DIGEST, metrics, url, extra)
        text = _render_text(prefs, stub, EmailType.DAILY_DIGEST, metrics, url, extra)
        return await self.sender.send(EmailPayload(
            to_email=prefs.email, to_name=prefs.name,
            subject=subject, html_body=html, text_body=text,
            email_type=EmailType.DAILY_DIGEST, ticker="DIGEST",
            metadata={"tickers": [r.get("ticker") for r in reports]},
        ))
