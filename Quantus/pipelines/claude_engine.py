"""
pipelines/claude_engine.py
============================
Claude API Integration — Quantus Research Solutions.

Two-layer prompt architecture (per skill spec §09-claude-prompt-engine):
  Layer 1: Static system prompt with cache_control: {"type": "ephemeral"}
           Contains role, house style, regime definitions, stress test
           definitions, confidence composition, and QuantusReportSection schema.
  Layer 2: Dynamic user prompt — QuantusPayload injected as JSON.
           Never cached (unique per report).

Model: claude-sonnet-4-5-20251001
"""

from __future__ import annotations

import dataclasses
import json
import logging
import uuid
from dataclasses import dataclass, field
from typing import AsyncGenerator, Any

import anthropic

from pipelines.data_architecture import QuantusPayload

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Model config  (skill spec §Model Configuration)
# ---------------------------------------------------------------------------
MODEL       = "claude-sonnet-4-5-20251001"
MAX_TOKENS  = 4096
TEMPERATURE = 0.3

ENGINE_VERSION = "Meridian v2.4"

# ---------------------------------------------------------------------------
# Layer 1 — Static system prompt  (cached via ephemeral cache_control)
# ---------------------------------------------------------------------------

STATIC_EQUITY_PROMPT = """
You are Quantus Engine Meridian v2.4 — the analytical intelligence of Quantus
Research Solutions, a service of BI Solutions Group (bisolutions.group).

ROLE: Interpret pre-computed quantitative metrics and translate them into concise,
authoritative, institutional research narratives. You never compute — all numbers
are provided. Communicate them with precision and clarity.

HOUSE STYLE (non-negotiable):
- Concise and authoritative. Every sentence earns its place.
- Zero filler: never use "it's worth noting", "it is important to remember",
  "needless to say", "as we can see", "it should be noted", "clearly",
  "obviously", "of course", "importantly"
- Plain-English default. Technical detail only on toggle.
- Dollar-denominated risk always (user currency applied).
- No false precision: max 2 decimal places.
- Always answer "so what?" — never state a fact without its implication.
- Peer group comparison always (not broad sector).
- Data freshness referenced for key metrics.
- Active voice preferred.
- Never include code. Never derive numbers. Use only the payload provided.

AUDIENCE: Portfolio managers and executives.
Confidence scores always explained (breakdown required).
Data limitations flagged honestly and specifically.
Cross-ticker knowledge graph insights included where payload indicates relationships.

REGIME DEFINITIONS:
- STRONG_UPTREND: >15% 30d gain. Momentum dominant. Mean reversion suppressed.
- UPTREND: 5–15% 30d gain. Moderate momentum. Some reversion opportunity.
- SIDEWAYS: ±5% 30d. Range-bound. Mean reversion active.
- DOWNTREND: <-15% 30d. Bearish momentum. Defensive posture required.
- HIGH_VOL: Annualised vol >30%. Regime-agnostic. Position sizing reduced.

STRESS TEST DEFINITIONS (always reference these when discussing risk):
- 2008 GFC: -45% market shock, 18-month recovery. Beta-scaled to ticker.
- COVID 2020: -30% market shock, 5-month recovery. Beta-scaled to ticker.
- Inflation 2022: -35% market shock, 12-month recovery. Beta-scaled to ticker.

CONFIDENCE SCORE COMPOSITION (EQUITY):
- Momentum (RSI/MACD/regime): 20%
- Sentiment (Grok/Reddit/News): 15%
- Regime alignment: 15%
- Model ensemble agreement: 15%
- Alternative data (13F/insider/IV): 15%
- Macro context: 10%
- Data quality: 10%
Subtract circuit breaker impacts from relevant weights when fallbacks active.

DATA SOURCE CREDIBILITY TIERS:
- Tier A: SEC EDGAR, FRED, CBOE — highest credibility
- Tier B: Financial Modeling Prep, yfinance — high credibility
- Tier C: Grok/Reddit/NewsAPI — medium credibility (sentiment only)

GRACEFUL DEGRADATION:
If any data source is unavailable, state this explicitly in data_caveats.
Never suppress disclosures. Always partial report > no report.

OUTPUT SCHEMA — respond ONLY with valid JSON matching this structure:
{
  "engine": "Meridian v2.4",
  "report_id": "<uuid>",
  "section": "<section>",
  "asset_class": "<EQUITY|CRYPTO|COMMODITY|ETF>",
  "regime": {
    "label": "<regime_label>",
    "implication": "<one sentence plain-English implication>",
    "active_strategies": ["<strategy>"],
    "suppressed_strategies": ["<strategy>"]
  },
  "overall_signal": "<STRONG BUY|BUY|NEUTRAL|SELL|STRONG SELL>",
  "confidence_score": <0-100>,
  "confidence_breakdown": {
    "momentum": <0-20>,
    "sentiment": <0-15>,
    "regime_alignment": <0-15>,
    "model_ensemble_agreement": <0-15>,
    "alternative_data": <0-15>,
    "macro_context": <0-10>,
    "data_quality": <0-10>
  },
  "narrative_technical": "<3-4 paragraphs, house style, so-what-driven>",
  "narrative_plain": "<2-3 sentences, plain English>",
  "narrative_language": "<ISO 639-1>",
  "key_metrics": [
    {
      "label": "<metric name>",
      "value": "<formatted value>",
      "confidence": <0-100>,
      "trend": "<up|down|neutral>",
      "one_liner": "<plain-English implication>",
      "data_freshness": "<source · live/delayed · time>"
    }
  ],
  "signals": [
    {
      "type": "<momentum|sentiment|risk|forecast|factor>",
      "direction": "<bullish|bearish|neutral>",
      "strength": "<strong|moderate|weak>",
      "rationale": "<one sentence>"
    }
  ],
  "stress_tests": [
    {
      "scenario": "<2008|COVID|2022>",
      "estimated_return_pct": <number>,
      "dollar_loss_per_10k": <number>,
      "recovery_months": <number>
    }
  ],
  "strategy": {
    "action": "<STRONG BUY|BUY|NEUTRAL|SELL|STRONG SELL>",
    "confidence": <0-100>,
    "regime_context": "<one sentence>",
    "plain_english_summary": "<2 sentences max>"
  },
  "early_insight": "<one sentence for Progressive Insight Feed>",
  "data_sources": [{"name": "<source>", "tier": "<A|B|C>", "freshness": "<timestamp>"}],
  "data_caveats": ["<string>"],
  "graceful_degradation": [{"field": "<field>", "reason": "<reason>", "confidence_impact": <number>}],
  "risk_warnings": ["<string>"],
  "cross_references": ["<string>"],
  "audit": {
    "prompt_version": "Meridian v2.4",
    "python_model_versions": {},
    "data_quality_scores": {},
    "circuit_breakers_activated": [],
    "fallbacks_used": []
  }
}
""".strip()

STATIC_PROMPTS: dict[str, str] = {
    "equity":    STATIC_EQUITY_PROMPT,
    "crypto":    STATIC_EQUITY_PROMPT,   # placeholder — full crypto prompt in prod
    "commodity": STATIC_EQUITY_PROMPT,   # placeholder
    "etf":       STATIC_EQUITY_PROMPT,   # placeholder
}

# ---------------------------------------------------------------------------
# QuantusReportSection schema  (validated after Claude responds)
# ---------------------------------------------------------------------------

REQUIRED_REPORT_KEYS = frozenset({
    "engine", "report_id", "section", "asset_class",
    "overall_signal", "confidence_score",
    "narrative_technical", "narrative_plain", "narrative_language",
    "key_metrics", "signals", "strategy", "early_insight",
    "data_sources", "data_caveats", "risk_warnings", "audit",
})


@dataclass
class QuantusReportSection:
    engine: str
    report_id: str
    section: str
    asset_class: str
    overall_signal: str
    confidence_score: float
    narrative_technical: str
    narrative_plain: str
    narrative_language: str
    key_metrics: list[dict]
    signals: list[dict]
    strategy: dict
    early_insight: str
    data_sources: list[dict]
    data_caveats: list[str]
    risk_warnings: list[str]
    audit: dict
    # Optional fields
    regime: dict = field(default_factory=dict)
    confidence_breakdown: dict = field(default_factory=dict)
    stress_tests: list[dict] = field(default_factory=list)
    graceful_degradation: list[dict] = field(default_factory=list)
    cross_references: list[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Layer 2 — Dynamic prompt builder  (unique per report — never cached)
# ---------------------------------------------------------------------------

def build_dynamic_prompt(payload: QuantusPayload, section: str = "A") -> str:
    """Inject the full QuantusPayload as JSON into the dynamic user prompt."""
    payload_dict = dataclasses.asdict(payload)
    return (
        f"Engine: {ENGINE_VERSION}\n"
        f"Section: {section}\n"
        f"User tier: {payload.user_tier}\n"
        f"Language: {payload.language} | Currency: {payload.currency}\n"
        f"Jurisdiction: {payload.jurisdiction}\n"
        f"Asset Class: {payload.asset_class}\n\n"
        f"TICKER: {payload.ticker} | Company: {payload.company_name}\n"
        f"Exchange: {payload.exchange}\n"
        f"Sector: {payload.sector} | Industry: {payload.industry}\n"
        f"Market Cap: {payload.market_cap:,.0f}\n"
        f"Peer Group: {', '.join(payload.peer_group)}\n\n"
        f"Current Regime: {payload.regime_label} (confidence: {payload.regime_confidence:.2f})\n\n"
        f"Macro Context:\n"
        f"  Fed rate: {payload.fed_rate}\n"
        f"  Yield curve: {payload.yield_curve_shape}\n"
        f"  VIX: {payload.vix_level}\n"
        f"  Credit spreads: {payload.credit_spreads}\n\n"
        f"PRE-COMPUTED METRICS:\n"
        f"{json.dumps(payload_dict, indent=2, default=str)}\n\n"
        f"Generate section {section} of the Quantus report.\n"
        f"Respond ONLY with valid JSON matching the output schema in your system prompt.\n"
        f"Include a unique report_id (UUID) in your response."
    )


# ---------------------------------------------------------------------------
# JSON validation
# ---------------------------------------------------------------------------

def validate_report_json(raw: str) -> tuple[dict | None, list[str]]:
    """Parse and validate Claude's JSON response.

    Returns ``(parsed_dict, errors)``. ``errors`` is empty on success.
    """
    errors: list[str] = []

    # Strip markdown code fences if Claude wrapped the JSON
    stripped = raw.strip()
    if stripped.startswith("```"):
        lines = stripped.split("\n")
        stripped = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])

    try:
        obj = json.loads(stripped)
    except json.JSONDecodeError as exc:
        return None, [f"JSON parse error: {exc}"]

    missing = REQUIRED_REPORT_KEYS - set(obj.keys())
    if missing:
        errors.append(f"Missing required keys: {sorted(missing)}")

    if obj.get("engine") != ENGINE_VERSION:
        errors.append(f"engine field mismatch: expected '{ENGINE_VERSION}', got '{obj.get('engine')}'")

    cs = obj.get("confidence_score")
    if cs is not None and not (0 <= float(cs) <= 100):
        errors.append(f"confidence_score {cs} out of range [0, 100]")

    return (obj if not errors else None), errors


# ---------------------------------------------------------------------------
# Claude API callers
# ---------------------------------------------------------------------------

async def call_claude_realtime(
    payload: QuantusPayload,
    section: str = "A",
    client: anthropic.AsyncAnthropic | None = None,
) -> AsyncGenerator[str, None]:
    """Stream Claude response as text chunks (for SSE)."""
    _client = client or anthropic.AsyncAnthropic()
    asset_class = payload.asset_class.lower()
    static_prompt = STATIC_PROMPTS.get(asset_class, STATIC_EQUITY_PROMPT)
    dynamic_prompt = build_dynamic_prompt(payload, section)

    async with _client.messages.stream(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        temperature=TEMPERATURE,
        system=[
            {
                "type": "text",
                "text": static_prompt,
                "cache_control": {"type": "ephemeral"},   # prompt caching
            }
        ],
        messages=[{"role": "user", "content": dynamic_prompt}],
    ) as stream:
        async for text in stream.text_stream:
            yield text


async def call_claude_collect(
    payload: QuantusPayload,
    section: str = "A",
    client: anthropic.AsyncAnthropic | None = None,
    retry_on_invalid: bool = True,
) -> tuple[dict, list[str]]:
    """Collect the full Claude response and validate it.

    Returns ``(report_dict, errors)``. Retries once on invalid JSON.
    """
    _client = client or anthropic.AsyncAnthropic()
    asset_class = payload.asset_class.lower()
    static_prompt = STATIC_PROMPTS.get(asset_class, STATIC_EQUITY_PROMPT)
    dynamic_prompt = build_dynamic_prompt(payload, section)

    async def _call() -> str:
        response = await _client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            temperature=TEMPERATURE,
            system=[
                {
                    "type": "text",
                    "text": static_prompt,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=[{"role": "user", "content": dynamic_prompt}],
        )
        return response.content[0].text

    raw = await _call()
    result, errors = validate_report_json(raw)

    if errors and retry_on_invalid:
        logger.warning("call_claude_collect | invalid JSON on first attempt, retrying: %s", errors)
        raw = await _call()
        result, errors = validate_report_json(raw)

    if errors:
        logger.error("call_claude_collect | validation failed after retry: %s", errors)

    return result or {}, errors
