"""
api/comparison.py
==================
Comparison Mode API — Quantus Research Solutions.

Single Claude API call with BOTH ticker payloads injected into shared context.
Claude generates a head-to-head table + plain-English verdict.

Endpoint: GET /api/v1/compare?tickers=TSLA,RIVN
  - Pulls both cached reports from Redis
  - If one is missing, runs the equity pipeline to fetch it
  - Sends a single Claude call with both payloads
  - Returns structured ComparisonResult
"""

from __future__ import annotations

import dataclasses
import json
import logging
import uuid
from dataclasses import dataclass, field
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

from pipelines.cache import MockReportCache, ReportCache
from pipelines.claude_engine import ENGINE_VERSION, MODEL, MAX_TOKENS, TEMPERATURE, STATIC_EQUITY_PROMPT, validate_report_json
from pipelines.equity import run_equity_pipeline
import anthropic

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/compare", tags=["comparison"])

# ---------------------------------------------------------------------------
# Shared cache
# ---------------------------------------------------------------------------
_cache: ReportCache = MockReportCache()
def get_cache() -> ReportCache: return _cache
def set_cache(c: ReportCache) -> None:
    global _cache; _cache = c

# ---------------------------------------------------------------------------
# Comparison result schema
# ---------------------------------------------------------------------------

@dataclass
class ComparisonResult:
    comparison_id: str
    ticker_a: str
    ticker_b: str
    engine: str
    winner: str                    # ticker that Claude favours, or "NEUTRAL"
    verdict: str                   # plain-English 2-3 sentence verdict
    head_to_head: list[dict]       # [{metric, ticker_a_value, ticker_b_value, winner}]
    risk_comparison: dict          # side-by-side VaR, ES, drawdown
    signal_comparison: dict        # signal + confidence for each
    regime_comparison: dict        # regime + implication for each
    caveats: list[str]

# ---------------------------------------------------------------------------
# Comparison prompt builder
# ---------------------------------------------------------------------------

def _build_comparison_prompt(
    ticker_a: str, report_a: dict,
    ticker_b: str, report_b: dict,
) -> str:
    return (
        f"Engine: {ENGINE_VERSION}\n"
        f"Task: HEAD-TO-HEAD COMPARISON\n\n"
        f"--- TICKER A: {ticker_a} ---\n"
        f"{json.dumps(report_a, indent=2, default=str)[:8000]}\n\n"
        f"--- TICKER B: {ticker_b} ---\n"
        f"{json.dumps(report_b, indent=2, default=str)[:8000]}\n\n"
        "Generate a structured comparison. Respond ONLY with valid JSON:\n"
        "{\n"
        "  \"engine\": \"Meridian v2.4\",\n"
        "  \"report_id\": \"<uuid>\",\n"
        "  \"section\": \"COMPARISON\",\n"
        "  \"asset_class\": \"MIXED\",\n"
        "  \"winner\": \"<ticker_a|ticker_b|NEUTRAL>\",\n"
        "  \"verdict\": \"<2-3 sentence plain-English verdict>\",\n"
        "  \"head_to_head\": [\n"
        "    {\"metric\": \"<name>\", \"ticker_a\": \"<value>\", \"ticker_b\": \"<value>\", \"winner\": \"<A|B|NEUTRAL>\"}\n"
        "  ],\n"
        "  \"risk_comparison\": {\"ticker_a\": {\"var\": null, \"es\": null, \"max_dd\": null},\n"
        "                        \"ticker_b\": {\"var\": null, \"es\": null, \"max_dd\": null}},\n"
        "  \"signal_comparison\": {\"ticker_a\": {\"signal\": null, \"confidence\": null},\n"
        "                          \"ticker_b\": {\"signal\": null, \"confidence\": null}},\n"
        "  \"regime_comparison\": {\"ticker_a\": {\"label\": null, \"implication\": null},\n"
        "                          \"ticker_b\": {\"label\": null, \"implication\": null}},\n"
        "  \"narrative_technical\": \"<one comprehensive paragraph>\",\n"
        "  \"narrative_plain\": \"<same as verdict>\",\n"
        "  \"narrative_language\": \"en\",\n"
        "  \"key_metrics\": [],\n"
        "  \"signals\": [],\n"
        "  \"strategy\": {\"action\": null, \"confidence\": null, \"regime_context\": null, \"plain_english_summary\": null},\n"
        "  \"early_insight\": \"<one sentence>\",\n"
        "  \"caveats\": [\"<caveat>\"],\n"
        "  \"data_sources\": [],\n"
        "  \"data_caveats\": [],\n"
        "  \"risk_warnings\": [],\n"
        "  \"audit\": {\"prompt_version\": \"Meridian v2.4\", \"python_model_versions\": {},\n"
        "             \"data_quality_scores\": {}, \"circuit_breakers_activated\": [],\n"
        "             \"fallbacks_used\": []}\n"
        "}\n"
        f"Use exactly {ticker_a} and {ticker_b} as keys (not ticker_a / ticker_b)."
    )

# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.get("")
async def compare(
    tickers: str = Query(..., description="Exactly 2 comma-separated tickers, e.g. TSLA,RIVN"),
    user_tier: str = Query("FREE"),
) -> JSONResponse:
    """Compare two tickers with a single Claude API call.

    Both cached reports are injected into a shared system prompt context.
    """
    parts = [t.strip().upper() for t in tickers.split(",")]
    if len(parts) != 2:
        raise HTTPException(status_code=422, detail="Exactly 2 tickers required.")
    ticker_a, ticker_b = parts
    cache = get_cache()

    # ---- Resolve reports (cache first, then live pipeline) --------------
    async def _get_or_fetch(ticker: str) -> dict:
        cached = cache.get_report(ticker)
        if cached:
            return cached
        logger.info("compare | %s | not cached — running pipeline", ticker)
        payload = await run_equity_pipeline(ticker, user_tier=user_tier)
        # Build a minimal stub report since we don't want a full Claude call here
        return {
            "ticker":           ticker,
            "asset_class":      payload.asset_class,
            "overall_signal":   "NEUTRAL",
            "confidence_score": 0,
            "regime":           {"label": payload.regime_label, "implication": ""},
            "key_metrics":      [],
            "signals":          [],
            "early_insight":    f"{ticker} live data available — no cached report yet.",
            "metrics_raw":      dataclasses.asdict(payload),
        }

    try:
        report_a = await _get_or_fetch(ticker_a)
        report_b = await _get_or_fetch(ticker_b)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to resolve one or both tickers: {exc}")

    # ---- Single Claude API call -----------------------------------------
    logger.info("compare | %s vs %s | calling Claude", ticker_a, ticker_b)
    prompt = _build_comparison_prompt(ticker_a, report_a, ticker_b, report_b)

    try:
        client   = anthropic.AsyncAnthropic()
        response = await client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            temperature=TEMPERATURE,
            system=[
                {
                    "type": "text",
                    "text": STATIC_EQUITY_PROMPT,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=[{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Claude API error: {exc}")

    result, errors = validate_report_json(raw)
    if errors or not result:
        raise HTTPException(status_code=422, detail={"message": "Claude returned invalid comparison JSON", "errors": errors})

    # ---- Inject comparison_id + normalise keys --------------------------
    comparison_id = str(uuid.uuid4())
    result["comparison_id"] = comparison_id
    result["ticker_a"]  = ticker_a
    result["ticker_b"]  = ticker_b

    return JSONResponse({"comparison_id": comparison_id, "result": result})
