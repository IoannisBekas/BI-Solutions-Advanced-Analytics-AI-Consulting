---
name: 11-email-system
description: |
  Use when building email notifications — new report alerts, material event
  refreshes, signal change alerts, cross-ticker knowledge graph alerts, daily
  digests, weekly summaries, or engine upgrade announcements. Every email drives
  users back on-platform. Uses SendGrid or Resend.
---

# Email Notification System

## Core Principle
Email is a notification and preview layer — not a replacement for the app.
Every email has ONE primary CTA that drives users back on-platform.
Never replicate the full report in email — always leave something to click through for.

## Email Types & Templates

### Type 1 — New Report Available
```
Subject: "{TICKER} · Quantus Report · {SIGNAL} ({CONFIDENCE}%)"
Example: "NVDA · Quantus Report · STRONG BUY (82%)"

Content:
- Company logo + name + ticker + [ASSET_CLASS] badge
- Regime badge (colour-coded: green/amber/red)
- Overall signal badge
- 3 headline metrics (asset-class appropriate):
    Equity:    Momentum · Sentiment · 30-Day Forecast
    Crypto:    Momentum · On-Chain · 30-Day Forecast
    Commodity: Momentum · COT Position · 30-Day Forecast
    ETF:       Momentum · Fund Flows · 30-Day Forecast
- Natural language summary (2–3 sentences, house style)
- Quantus vs. consensus divergence (equity/ETF only, if applicable)
- Earnings flag (equity/ETF only, if within 30 days)
- Data freshness note: "Report generated {X} hours ago · Meridian v2.4"
- [Read Full Report →] PRIMARY CTA
- [Add to Watchlist] SECONDARY CTA
- Report ID + engine version
- Jurisdiction-adaptive disclaimer
```

### Type 2 — Report Refreshed (Material Event)
```
Subject: "⚠️ {TICKER} Report Updated · {EVENT}"
Example: "⚠️ AAPL Report Updated · Earnings Released"

Content: Same as Type 1 PLUS:
- Change delta banner:
  "Signal upgraded: HOLD → BUY
   Key driver: earnings beat + improved management NLP score."
- What triggered the refresh (plain English)
- Previous signal vs new signal comparison
```

### Type 3 — Alert Triggered
```
Subject: "🔔 Alert: {TICKER} Signal Changed {OLD} → {NEW}"

Content (concise):
- What changed (signal, regime, confidence)
- One-sentence reason
- Key metric that changed
- [View Updated Report →] ONLY CTA
```

### Type 4 — Cross-Ticker Knowledge Graph Alert
```
Subject: "⚠️ {RELATED_TICKER} event may affect your {TICKER} position"
Example: "⚠️ TSMC miss may affect your NVDA position"

Content:
- Event summary (what happened to the related ticker)
- Relationship context ("TSMC is a primary supplier to NVDA")
- Impact assessment (plain English, 2–3 sentences)
- [View Updated {TICKER} Report →] CTA
```

### Type 5 — Daily Digest (opt-in)
```
Subject: "Your Quantus Daily — {DATE}"
Example: "Your Quantus Daily — Feb 23, 2026"

Content: Max 5 ticker cards from user's watchlist:
- Compact card per ticker: signal badge + 1-line summary + [View →]
- No metrics — just direction and link
- Bottom: "X tickers on your watchlist · Manage preferences →"
```

### Type 6 — Weekly Research Summary (opt-in)
```
Subject: "Quantus Weekly · Top Signals This Week"

Content (editorial style):
- Top 3 signal changes across all Quantus users (anonymised)
- Major regime shifts detected this week
- Macro context summary (what happened, what it means)
- Quantus accuracy update for the week
- [Read Full Weekly Briefing →] CTA
- This email is Claude-generated (weekly Batch API call)
```

### Type 7 — Engine Upgrade Announcement
```
Subject: "Quantus Engine Updated — {ENGINE_NAME} v{VERSION}"
Example: "Quantus Engine Updated — Meridian v2.4"

Content:
- What improved (3 bullet points, specific)
- Accuracy comparison: Meridian X% vs Atlas Y% (if data available)
- [Regenerate your watchlist reports →] CTA
- All future reports will use the new engine
```

## Implementation

```python
# Email service (SendGrid or Resend)
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

async def send_report_email(
    user: User,
    ticker: str,
    report: QuantusReport,
    email_type: EmailType,
):
    template_id = EMAIL_TEMPLATES[email_type][user.jurisdiction]
    # Templates stored in SendGrid — not hardcoded
    # One template variant per jurisdiction (US/EU/CA/other)

    payload = build_email_payload(user, ticker, report, email_type)

    message = Mail(
        from_email="research@bisolutions.group",
        to_emails=user.email,
    )
    message.template_id = template_id
    message.dynamic_template_data = payload

    client = SendGridAPIClient(SENDGRID_API_KEY)
    response = client.send(message)
    await log_email_send(user.id, ticker, email_type, response.status_code)
```

```python
def build_email_payload(user, ticker, report, email_type) -> dict:
    base = {
        "ticker": ticker,
        "company_name": report.company_name,
        "asset_class_badge": report.asset_class,
        "signal": report.overall_signal,
        "confidence": report.confidence_score,
        "regime_label": report.regime.label,
        "regime_color": REGIME_COLORS[report.regime.label],
        "report_url": f"https://bisolutions.group/report/{report.report_id}",
        "report_id": report.report_id,
        "engine_version": "Meridian v2.4",
        "generated_ago": format_time_ago(report.generated_at),
        "disclaimer": DISCLAIMERS[user.jurisdiction],
        "unsubscribe_url": f"https://bisolutions.group/unsubscribe?token={user.unsub_token}",
        "preferences_url": f"https://bisolutions.group/preferences?token={user.auth_token}",
    }

    # Asset-class-specific headline metrics
    if report.asset_class == "EQUITY":
        base["headline_metrics"] = [
            {"label": "Momentum", "value": report.momentum_signal},
            {"label": "Sentiment", "value": report.composite_sentiment_label},
            {"label": "30-Day Forecast", "value": report.ensemble_forecast},
        ]
    elif report.asset_class == "CRYPTO":
        base["headline_metrics"] = [
            {"label": "Momentum", "value": report.momentum_signal},
            {"label": "On-Chain Signal", "value": report.on_chain_summary},
            {"label": "30-Day Forecast", "value": report.ensemble_forecast},
        ]
    # ... commodity, ETF variants

    return base
```

## Subscription Preferences Schema

```python
@dataclass
class UserEmailPreferences:
    # Specific tickers: immediate on new report or refresh
    ticker_subscriptions: list[str]

    # Sector subscriptions
    sector_subscriptions: list[str]

    # Signal type filter
    signal_types: list[str]   # ["STRONG_BUY", "STRONG_SELL"] or ["ALL"]

    # Frequency
    frequency: Literal["immediate", "daily_digest", "weekly_only"]

    # Special events only
    material_events_only: bool

    # Cross-ticker alerts
    knowledge_graph_alerts: bool

    # Engine upgrade announcements
    engine_updates: bool

    # Asset class filter (NEW)
    asset_classes: list[str]  # ["EQUITY", "CRYPTO", "COMMODITY", "ETF"]
```

## Email Design Standards
- Dark background (#0A0D14) matching app — same visual identity
- Signal + regime badges in brand colours
- Company logos top-left (Clearbit API)
- Single primary CTA per email (exception: Type 5 digest — one CTA per ticker card)
- Mobile-optimised single column
- Plain-text fallback (always include)
- Unsubscribe + preference management link in every email (CAN-SPAM / GDPR)
- "Quantus Research Solutions | bisolutions.group" in footer
- Jurisdiction-adaptive disclaimer (US/EU/CA/other)

## Rate Limiting
- Immediate alerts: max 3 per ticker per 24h per user (prevent alert fatigue)
- Daily digest: sent at user's preferred time (default: 7am local)
- Weekly summary: sent Monday 7am user's local time
- Engine announcements: max 1 per month

## Constraints
- Never replicate full report content in email — always drive to the platform
- Every email must have an unsubscribe link — no exceptions (GDPR, CAN-SPAM)
- Plain-text fallback required for every HTML email
- Email sends logged to audit trail (user_id, ticker, type, timestamp, status)
- Disclaimer must be jurisdiction-appropriate — never use US equity disclaimer for crypto
- Failed email sends retried 3x with exponential backoff, then logged to operator dashboard
- Email delivery rate monitored in operator dashboard — alert if <95% delivery rate
