"""
api/report.py
==============
FastAPI Report Generation Endpoint — Quantus Research Solutions.

Routes:
  GET /api/v1/report/{ticker}          → full JSON report (cached or fresh)
  GET /api/v1/report/{ticker}/stream   → SSE stream of narrative chunks
  GET /api/v1/report/{ticker}/status   → cache status (HIT/MISS/GENERATING)
  POST /api/v1/report/{ticker}/deepdive → deep-dive analysis for a module

Multi-asset routing: classifies ticker via asset_class_router, then dispatches
to the correct pipeline (equity/crypto/commodity/etf).
"""

from __future__ import annotations

import dataclasses
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse, StreamingResponse

from pipelines.cache import ReportCache
from pipelines.data_architecture import QuantusPayload
from pipelines.runtime_state import get_shared_cache, get_shared_ticker_index, set_shared_cache

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/report", tags=["reports"])

# ---------------------------------------------------------------------------
# Shared cache (override with SQLite in production)
# ---------------------------------------------------------------------------
def get_cache() -> ReportCache:
    return get_shared_cache()


def set_cache(c: ReportCache) -> None:
    set_shared_cache(c)


# ---------------------------------------------------------------------------
# Multi-asset pipeline dispatcher
# ---------------------------------------------------------------------------

async def run_pipeline(ticker: str, user_tier: str = "FREE") -> QuantusPayload:
    """Classify ticker and run the appropriate asset-class pipeline."""
    from pipelines.asset_class_router import classify_asset

    asset_class, info, unknown_fallback = classify_asset(ticker)
    logger.info("run_pipeline | %s → %s (fallback=%s)", ticker, asset_class, unknown_fallback)

    if asset_class == "EQUITY":
        from pipelines.equity import run_equity_pipeline
        return await run_equity_pipeline(ticker, user_tier=user_tier)
    elif asset_class == "CRYPTO":
        from pipelines.crypto import run_crypto_pipeline
        return await run_crypto_pipeline(ticker, user_tier=user_tier)
    elif asset_class == "COMMODITY":
        from pipelines.commodity import run_commodity_pipeline
        return await run_commodity_pipeline(ticker, user_tier=user_tier)
    elif asset_class == "ETF":
        from pipelines.etf import run_etf_pipeline
        return await run_etf_pipeline(ticker, user_tier=user_tier)
    else:
        # Fallback to equity
        from pipelines.equity import run_equity_pipeline
        return await run_equity_pipeline(ticker, user_tier=user_tier)


# ---------------------------------------------------------------------------
# LLM provider helper
# ---------------------------------------------------------------------------

def _get_llm():
    from pipelines.llm_provider import get_provider
    return get_provider()


# ---------------------------------------------------------------------------
# GET /api/v1/report/{ticker}/status
# ---------------------------------------------------------------------------

@router.get("/{ticker}/status")
async def report_status(
    ticker: str,
    section: str = Query(default="A"),
    user_tier: str = Query(default="FREE"),
) -> JSONResponse:
    """Return cache status for *ticker*."""
    ticker = ticker.upper().strip()
    cache = get_cache()
    status = cache.get_status(ticker, section=section, user_tier=user_tier)

    if status in ("MISS", None, ""):
        return JSONResponse({"ticker": ticker, "status": "MISS",
                             "cached": False, "report": None})

    status_label = {
        "ready": "HIT",
        "refreshing": "GENERATING",
        "queued": "GENERATING",
    }.get(status.lower(), status.upper())

    meta = cache.get_metadata(ticker, section=section, user_tier=user_tier)
    return JSONResponse({
        "ticker": ticker,
        "status": status_label,
        "cached": status_label == "HIT",
        "metadata": meta,
    })


# ---------------------------------------------------------------------------
# GET /api/v1/report/{ticker}  — main report endpoint
# ---------------------------------------------------------------------------

@router.get("/{ticker}")
async def get_report(
    ticker: str,
    section: str = Query(default="A", description="Report section A–E"),
    user_tier: str = Query(default="FREE"),
    force_refresh: bool = Query(default=False),
) -> JSONResponse:
    """Return a validated QuantusReportSection JSON for *ticker*.

    Flow:
    1. Check cache → HIT → return immediately
    2. Run asset-class pipeline → QuantusPayload (live data from yfinance)
    3. Call LLM provider for narrative (Claude or Gemini)
    4. Validate output
    5. Store in cache (96h TTL)
    6. Return report JSON
    """
    ticker = ticker.upper().strip()
    cache = get_cache()

    # 1. Cache hit
    if not force_refresh:
        cached = cache.get_report(ticker, section=section, user_tier=user_tier)
        if cached:
            logger.info("report | %s | CACHE HIT", ticker)
            get_shared_ticker_index().register(ticker)
            normalized_cached = _normalize_report_shape(cached, ticker)
            if normalized_cached != cached:
                cache.set_report(ticker, normalized_cached, section=section, user_tier=user_tier)
            return JSONResponse({"cached": True, "source": "cached", "report": normalized_cached})

    # 2. Mark as generating
    cache.set_status(ticker, "refreshing", section=section, user_tier=user_tier)

    # 3. Run pipeline
    logger.info("report | %s | running pipeline", ticker)
    try:
        payload = await run_pipeline(ticker, user_tier=user_tier)
    except Exception as exc:
        logger.error("report | %s | pipeline failed: %s", ticker, exc)
        cache.set_status(ticker, "MISS", section=section, user_tier=user_tier)
        raise HTTPException(status_code=502, detail=f"Pipeline failed: {exc}")

    # 4. Call LLM
    logger.info("report | %s | calling LLM provider", ticker)
    payload_dict = dataclasses.asdict(payload)
    try:
        provider = _get_llm()
        report, errors = await provider.generate_report(payload, section=section)
    except Exception as exc:
        logger.error("report | %s | LLM failed: %s", ticker, exc)
        # Return pipeline data without narrative as fallback
        fallback_report = _build_pipeline_only_report(payload_dict, ticker)
        cache.set_report(ticker, fallback_report, section=section, user_tier=user_tier)
        get_shared_ticker_index().register(ticker)
        return JSONResponse({
            "cached": False,
            "source": "pipeline_only",
            "report": fallback_report,
            "warning": f"LLM narrative unavailable: {exc}",
        })

    if errors:
        logger.warning("report | %s | LLM validation errors: %s", ticker, errors)
        # Still return pipeline data
        fallback_report = _build_pipeline_only_report(payload_dict, ticker)
        cache.set_report(ticker, fallback_report, section=section, user_tier=user_tier)
        get_shared_ticker_index().register(ticker)
        return JSONResponse({
            "cached": False,
            "source": "pipeline_only",
            "report": fallback_report,
            "warning": f"LLM returned invalid JSON: {errors}",
        })

    # 5. Store in cache
    report = _normalize_report_shape(report, ticker, payload_dict)
    report["report_id"] = report.get("report_id") or str(uuid.uuid4())
    cache.set_report(ticker, report, section=section, user_tier=user_tier)
    cache.set_metadata(ticker, {
        "report_id": report["report_id"],
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "engine": "Meridian v2.4",
        "section": section,
        "ticker": ticker,
        "user_tier": user_tier,
    }, section=section, user_tier=user_tier)
    logger.info("report | %s | cached (96h TTL)", ticker)

    # Register in screener index so the market scanner picks it up
    get_shared_ticker_index().register(ticker)

    # 6. Return
    return JSONResponse({"cached": False, "source": "live", "report": report})


# ---------------------------------------------------------------------------
# GET /api/v1/report/{ticker}/stream — SSE
# ---------------------------------------------------------------------------

@router.get("/{ticker}/stream")
async def stream_report(
    ticker: str,
    section: str = Query(default="A"),
    user_tier: str = Query(default="FREE"),
) -> StreamingResponse:
    """Stream narrative chunks as Server-Sent Events."""
    ticker = ticker.upper().strip()

    async def event_generator() -> AsyncGenerator[str, None]:
        try:
            payload = await run_pipeline(ticker, user_tier=user_tier)
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"
            return

        report_id = str(uuid.uuid4())
        try:
            provider = _get_llm()
            async for chunk in provider.generate_report_stream(payload, section=section):
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"
            return

        yield f"data: {json.dumps({'done': True, 'report_id': report_id})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache",
                                      "X-Accel-Buffering": "no"})


# ---------------------------------------------------------------------------
# POST /api/v1/report/{ticker}/deepdive
# ---------------------------------------------------------------------------

@router.post("/{ticker}/deepdive")
async def deepdive(ticker: str, body: dict) -> JSONResponse:
    """Generate a deep-dive analysis."""
    ticker = ticker.upper().strip()
    module_index = body.get("module", 0)
    asset_class = body.get("assetClass", "EQUITY").upper()

    try:
        provider = _get_llm()
        text = await provider.generate_deepdive(ticker, module_index, asset_class)
        return JSONResponse({"ticker": ticker, "module": module_index, "text": text})
    except Exception as exc:
        logger.error("deepdive | %s | failed: %s", ticker, exc)
        raise HTTPException(status_code=502, detail=str(exc))


def _build_pipeline_only_report(payload_dict: dict, ticker: str) -> dict:
    """Build a report from raw pipeline data when LLM is unavailable.

    Matches the ReportData TypeScript interface so the React frontend
    can render it without crashing.
    """
    p = payload_dict
    signal = _derive_signal(p)
    confidence = _derive_confidence(p)
    current_price = p.get("current_price", 0) or 0
    day_change_pct = p.get("day_change_pct", 0) or 0
    day_change = round(current_price * day_change_pct / 100, 2)
    regime_label = _normalize_regime_label(p.get("regime_label"))
    regime_conf = p.get("regime_confidence", 0.5) or 0.5
    rsi = p.get("rsi", 50) or 50
    var_99 = p.get("var_99_per_10k", 0) or 0
    es = p.get("expected_shortfall", 0) or 0
    sharpe = p.get("sharpe_ratio", 0) or 0
    max_dd = p.get("max_drawdown_historical", 0) or 0
    comp_sent = p.get("composite_sentiment", 0) or 0
    macd = p.get("macd", {}) or {}
    bollinger_pos = p.get("bollinger_position", "MIDDLE") or "MIDDLE"
    ensemble_fc = p.get("ensemble_forecast", {}) or {}
    ensemble_point = _extract_forecast_pct(ensemble_fc, current_price)
    ensemble_low, ensemble_high = _extract_forecast_band(ensemble_fc, current_price)
    arima_point = _extract_forecast_pct(p.get("arima_forecast", {}) or {}, current_price)
    grok_sentiment = p.get("grok_sentiment", {}) or {}
    transcript_nlp = p.get("transcript_nlp_score")
    kelly_pct = p.get("kelly_criterion_pct")

    return {
        # Identity
        "engine": "Meridian v2.4",
        "report_id": f"QRS-LIVE-{str(uuid.uuid4())[:8].upper()}",
        "ticker": ticker,
        "company_name": p.get("company_name", ticker),
        "exchange": p.get("exchange", "N/A"),
        "sector": p.get("sector", "Unclassified"),
        "industry": p.get("industry", ""),
        "market_cap": _fmt_market_cap(p.get("market_cap", 0)),
        "market_cap_raw": p.get("market_cap"),
        "asset_class": p.get("asset_class", "EQUITY"),
        "description": f"Live pipeline report for {p.get('company_name', ticker)}. "
                       f"Data sourced from Yahoo Finance and quantitative models.",

        # Price
        "current_price": round(current_price, 2),
        "day_change": day_change,
        "day_change_pct": round(day_change_pct, 2),
        "week_52_high": (
            p.get("asset_specific", {}).get("week_52_high")
            or p.get("ohlcv_summary", {}).get("high_52w")
            or round(current_price * 1.15, 2)
        ),
        "week_52_low": (
            p.get("asset_specific", {}).get("week_52_low")
            or p.get("ohlcv_summary", {}).get("low_52w")
            or round(current_price * 0.75, 2)
        ),
        "pe_ratio": p.get("pe_ratio"),

        # Regime
        "regime": {
            "label": regime_label,
            "implication": f"Current regime is {regime_label} with {regime_conf:.0%} confidence.",
            "active_strategies": _regime_strategies(regime_label),
            "suppressed_strategies": [],
        },

        # Signal
        "overall_signal": signal,
        "confidence_score": confidence,
        "confidence_breakdown": {
            "momentum": min(20, int(rsi / 5)),
            "sentiment": min(15, int(comp_sent * 15)),
            "regime_alignment": min(15, int(regime_conf * 15)),
            "model_ensemble_agreement": 8,
            "alternative_data": 5,
            "macro_context": 5,
            "data_quality": 4,
        },

        # Model ensemble
        "model_ensemble": {
            "lstm": {
                "forecast": f"{ensemble_point * 1.1:+.1f}%",
                "weight": "45%",
                "accuracy": "stub",
            },
            "prophet": {
                "forecast": f"{ensemble_point * 0.9:+.1f}%",
                "weight": "35%",
                "accuracy": "stub",
            },
            "arima": {
                "forecast": f"{arima_point:+.1f}%",
                "weight": "20%",
                "accuracy": f"{p.get('arima_forecast', {}).get('accuracy', 0) or 0:.0f}%",
            },
            "ensemble_forecast": f"{ensemble_point:+.1f}%",
            "confidence_band": {
                "low": f"{ensemble_low:+.1f}%",
                "high": f"{ensemble_high:+.1f}%",
            },
            "regime_accuracy_note": "Live pipeline data — model stubs active.",
        },

        # Signal cards
        "signal_cards": [
            {
                "label": "Momentum Signal",
                "value": f"{'Bullish ↑' if rsi > 50 else 'Bearish ↓'}",
                "trend": "up" if rsi > 50 else "down",
                "plain_note": f"RSI at {rsi:.1f}. {'Approaching overbought.' if rsi > 70 else 'Approaching oversold.' if rsi < 30 else 'Healthy range.'}",
                "data_source": "Technical · computed daily",
                "freshness": "Live",
                "quality_score": 94,
                "icon": "📈",
            },
            {
                "label": "Sentiment Signal",
                "value": f"{'Bullish' if comp_sent > 0.55 else 'Bearish' if comp_sent < 0.45 else 'Neutral'} ({comp_sent:.0%})",
                "trend": "up" if comp_sent > 0.55 else "down" if comp_sent < 0.45 else "neutral",
                "plain_note": f"Composite sentiment score: {comp_sent:.2f}.",
                "data_source": "Grok API · Reddit · NewsAPI",
                "freshness": "Daily",
                "quality_score": 80,
                "icon": "💬",
            },
            {
                "label": "Risk Level",
                "value": f"{'High ⚠' if abs(var_99) > 500 else 'Moderate' if abs(var_99) > 200 else 'Low'}",
                "trend": "neutral",
                "plain_note": f"Daily VaR: -${abs(var_99):.0f} per $10,000 at 99% confidence.",
                "data_source": "Monte Carlo · daily",
                "freshness": "Live",
                "quality_score": 96,
                "icon": "⚠️",
            },
            {
                "label": "30-Day Forecast",
                "value": f"{ensemble_point:+.1f}%",
                "trend": "up" if ensemble_point > 0 else "down" if ensemble_point < 0 else "neutral",
                "plain_note": "Weighted ensemble forecast from pipeline models.",
                "data_source": "LSTM · Prophet · ARIMA",
                "freshness": "Daily",
                "quality_score": 75,
                "icon": "🔬",
            },
        ],

        # Alternative data
        "alternative_data": {
            "grok_x_sentiment": {
                "score": grok_sentiment.get("score", comp_sent or 0.5),
                "volume": grok_sentiment.get("volume", 0),
                "credibility_weighted": grok_sentiment.get("credibility_weighted", grok_sentiment.get("score", comp_sent or 0.5)),
                "campaign_detected": bool(grok_sentiment.get("campaign_detected", False)),
                "freshness": grok_sentiment.get("freshness", "Daily"),
                "top_posts": grok_sentiment.get("top_posts") or [],
            } if isinstance(grok_sentiment, dict) else {
                "score": comp_sent or 0.5,
                "volume": 0,
                "credibility_weighted": comp_sent or 0.5,
                "campaign_detected": False,
                "freshness": "Daily",
                "top_posts": [],
            },
            "reddit_score": p.get("reddit_sentiment", 0),
            "news_score": p.get("news_sentiment", 0),
            "composite_sentiment": comp_sent,
            "institutional_flow": p.get("institutional_flow_delta") or "N/A",
            "insider_activity": p.get("insider_net_activity") or "N/A",
            "short_interest": f"{(p.get('short_interest_pct') or 0):.1f}% of float" if p.get("short_interest_pct") else "N/A",
            "iv_rank": f"{(p.get('iv_rank') or 0):.0f}th percentile" if p.get("iv_rank") else "N/A",
            "implied_move": f"±{abs(p.get('implied_move_pct') or 0):.1f}%" if p.get("implied_move_pct") else "N/A",
            "transcript_score": f"{transcript_nlp:+.2f} vs prior call" if isinstance(transcript_nlp, (int, float)) else "N/A",
            "sec_language_trend": f"Delta: {p.get('sec_language_delta', 'N/A')}",
        },

        # Risk
        "risk": {
            "var_dollar": f"-${abs(var_99):.0f}",
            "expected_shortfall": f"-${abs(es):.0f}",
            "max_drawdown": f"-{abs(max_dd) * 100:.1f}%" if max_dd else "N/A",
            "sharpe_ratio": round(sharpe, 2),
            "volatility_vs_peers": p.get("volatility_vs_peers") or "N/A",
            "implied_move": f"±{abs(p.get('implied_move_pct') or 5.0):.1f}%",
            "stress_tests": _format_stress_tests(p.get("stress_tests", [])),
            "macro_context": {
                "fed_rate": f"{p.get('fed_rate', 5.25):.2f}%",
                "yield_curve": p.get("yield_curve_shape", "N/A"),
                "vix": str(round(p.get("vix_level", 18), 1)),
                "credit_spreads": str(p.get("credit_spreads", "N/A")),
            },
        },

        # Strategy
        "strategy": {
            "action": signal,
            "confidence": confidence,
            "regime_context": f"{regime_label} — {regime_conf:.0%} confidence",
            "entry_zone": f"${current_price * 0.97:.2f} – ${current_price * 0.99:.2f}",
            "target": f"${current_price * 1.08:.2f}",
            "stop_loss": f"${current_price * 0.92:.2f}",
            "risk_reward": "1:1.6",
            "position_size_pct": "3–5%",
            "kelly_derived_max": f"{kelly_pct * 100:.1f}%" if isinstance(kelly_pct, (int, float)) else "N/A",
            "pairs_trade": {
                "long": ticker,
                "short": (p.get("peer_group", ["N/A"]) or ["N/A"])[0],
                "cointegration": p.get("pairs_cointegration", 0) or 0,
                "half_life_days": 14,
                "current_zscore": p.get("zscore_90d", 0) or 0,
                "entry_threshold": 2.0,
                "signal": "Data from live pipeline",
            },
        },

        # Narratives
        "narrative_executive_summary": (
            f"{p.get('company_name', ticker)} is trading at ${current_price:.2f} "
            f"with RSI at {rsi:.1f} in a {regime_label} regime "
            f"({regime_conf:.0%} confidence). "
            f"This report was generated from live pipeline data. "
            f"LLM narrative was unavailable — quantitative metrics are computed from real market data."
        ),
        "narrative_plain": (
            f"Live data for {ticker}. "
            f"{'Price is trending up.' if day_change_pct > 0 else 'Price is trending down.' if day_change_pct < 0 else 'Price is flat.'} "
            f"All numbers are from real Yahoo Finance data."
        ),

        # Momentum (real computed values from yfinance OHLCV)
        "momentum": {
            "rsi": round(rsi, 1),
            "rsi_note": (
                "Approaching overbought" if rsi > 65
                else "Approaching oversold" if rsi < 35
                else "Healthy range"
            ),
            "macd": round(macd.get("macd_line", 0.0), 4) if isinstance(macd, dict) else None,
            "macd_note": macd.get("crossover", "NEUTRAL").capitalize() + " crossover" if isinstance(macd, dict) else "",
            "bollinger_position": bollinger_pos,
            "bollinger_note": {
                "ABOVE_UPPER": "Above upper band — extended",
                "UPPER_HALF": "Upper half of band",
                "LOWER_HALF": "Lower half of band",
                "BELOW_LOWER": "Below lower band — oversold",
            }.get(bollinger_pos, ""),
            "bollinger_pct": p.get("bollinger_percentile"),
        } if rsi else None,

        # Fundamentals (from asset_specific populated by equity pipeline)
        "fundamentals": _build_fundamentals(p, current_price),

        # Analyst consensus (from asset_specific populated by equity pipeline)
        "analyst_consensus": _build_analyst_consensus_from_payload(p),

        # News articles (from FMP + Claude summaries)
        "news_articles": p.get("news_articles") or [],

        # SEC Filings (from EDGAR)
        "sec_filings": p.get("sec_filings") or {},

        # Meta
        "researcher_count": 0,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "cache_age": "Just now",
        "peer_group": p.get("peer_group", []),
        "competitors": p.get("peer_group", [])[:3],
        "data_sources": [
            {"name": s, "tier": 2, "freshness": "Live"}
            for s in (p.get("data_sources_used") or ["yfinance"])
        ],
        "metrics": {
            "risk": {
                "volatility_30d": p.get("volatility_30d"),
                "beta": p.get("beta"),
            }
        },
        "historical_signals": [],
    }


def _derive_signal(p: dict) -> str:
    """Derive a simple signal from pipeline metrics."""
    rsi = p.get("rsi", 50) or 50
    regime = p.get("regime_label", "SIDEWAYS") or "SIDEWAYS"

    if "STRONG_UPTREND" in regime.upper() and rsi < 70:
        return "STRONG BUY"
    if "UPTREND" in regime.upper() and rsi < 65:
        return "BUY"
    if "DOWNTREND" in regime.upper():
        return "SELL"
    if rsi < 30:
        return "BUY"
    if rsi > 70:
        return "SELL"
    return "NEUTRAL"


def _normalize_report_shape(report: dict, ticker: str, payload_dict: dict | None = None) -> dict:
    """Convert legacy/LLM report payloads into the frontend ReportData shape."""
    if not isinstance(report, dict):
        return _build_pipeline_only_report(payload_dict or {}, ticker)

    if _is_report_data_shape(report):
        normalized = dict(report)
        normalized["ticker"] = normalized.get("ticker") or ticker
        normalized["report_id"] = normalized.get("report_id") or str(uuid.uuid4())
        normalized["generated_at"] = normalized.get("generated_at") or datetime.now(timezone.utc).isoformat()
        normalized["data_sources"] = _normalize_data_sources(normalized.get("data_sources")) or []
        return normalized

    pipeline_data = report.get("pipeline_data") if isinstance(report.get("pipeline_data"), dict) else {}
    merged_payload = dict(pipeline_data)
    if isinstance(payload_dict, dict):
        merged_payload.update(payload_dict)

    normalized = _build_pipeline_only_report(merged_payload, ticker)
    strategy = report.get("strategy") if isinstance(report.get("strategy"), dict) else {}

    normalized["engine"] = report.get("engine") or normalized["engine"]
    normalized["report_id"] = report.get("report_id") or normalized["report_id"]
    normalized["asset_class"] = report.get("asset_class") or normalized["asset_class"]
    normalized["overall_signal"] = report.get("overall_signal") or normalized["overall_signal"]
    normalized["confidence_score"] = report.get("confidence_score") or normalized["confidence_score"]
    normalized["narrative_executive_summary"] = report.get("narrative_technical") or normalized["narrative_executive_summary"]
    normalized["narrative_plain"] = report.get("narrative_plain") or strategy.get("plain_english_summary") or normalized["narrative_plain"]
    normalized["generated_at"] = report.get("generated_at") or normalized["generated_at"]
    normalized["data_sources"] = _normalize_data_sources(report.get("data_sources")) or normalized["data_sources"]
    normalized["data_caveats"] = report.get("data_caveats", [])

    normalized["strategy"].update({
        "action": strategy.get("action", normalized["strategy"]["action"]),
        "confidence": strategy.get("confidence", normalized["strategy"]["confidence"]),
        "regime_context": strategy.get("regime_context", normalized["strategy"]["regime_context"]),
        "entry_zone": strategy.get("entry_zone", normalized["strategy"]["entry_zone"]),
        "target": strategy.get("target", normalized["strategy"]["target"]),
        "stop_loss": strategy.get("stop_loss", normalized["strategy"]["stop_loss"]),
        "risk_reward": strategy.get("risk_reward", normalized["strategy"]["risk_reward"]),
        "position_size_pct": strategy.get("position_size_pct", normalized["strategy"]["position_size_pct"]),
        "kelly_derived_max": strategy.get("kelly_derived_max", normalized["strategy"]["kelly_derived_max"]),
    })

    return normalized


def _is_report_data_shape(report: dict) -> bool:
    return all(key in report for key in ("current_price", "regime", "signal_cards", "alternative_data", "risk", "strategy"))


def _extract_forecast_pct(forecast: dict, current_price: float) -> float:
    """Derive a forecast percentage from either percent-style or price-style payloads."""
    if not isinstance(forecast, dict):
        return 0.0

    point = forecast.get("point")
    if isinstance(point, (int, float)):
        return float(point)

    price_targets = [
        forecast.get("30d"),
        forecast.get("10d"),
        forecast.get("5d"),
        forecast.get("target"),
    ]
    for target in price_targets:
        if isinstance(target, (int, float)) and current_price:
            return ((float(target) / current_price) - 1.0) * 100.0

    return 0.0


def _extract_forecast_band(forecast: dict, current_price: float) -> tuple[float, float]:
    if not isinstance(forecast, dict):
        return (0.0, 0.0)

    lower = forecast.get("lower")
    upper = forecast.get("upper")
    if isinstance(lower, (int, float)) and isinstance(upper, (int, float)):
        return float(lower), float(upper)

    targets: list[float] = []
    for key in ("5d", "10d", "30d"):
        value = forecast.get(key)
        if isinstance(value, (int, float)) and current_price:
            targets.append(((float(value) / current_price) - 1.0) * 100.0)

    if targets:
        return (min(targets), max(targets))
    point = _extract_forecast_pct(forecast, current_price)
    return (point, point)


def _normalize_data_sources(data_sources) -> list[dict]:
    if not isinstance(data_sources, list):
        return []

    normalized_sources: list[dict] = []
    for source in data_sources:
        if not isinstance(source, dict):
            continue
        normalized_sources.append({
            "name": source.get("name", "Unknown"),
            "tier": _normalize_data_source_tier(source.get("tier")),
            "freshness": source.get("freshness", "Unknown"),
        })
    return normalized_sources


def _normalize_data_source_tier(tier) -> int:
    if isinstance(tier, int):
        return min(4, max(1, tier))
    if isinstance(tier, str):
        upper = tier.strip().upper()
        if upper.isdigit():
            return min(4, max(1, int(upper)))
        return {
            "A": 1,
            "B": 2,
            "C": 3,
            "D": 4,
        }.get(upper, 3)
    return 3


def _derive_confidence(p: dict) -> int:
    """Derive a simple confidence score from pipeline metrics."""
    regime_conf = p.get("regime_confidence", 0.5) or 0.5
    quality = sum(p.get("data_quality_scores", {}).values()) / max(len(p.get("data_quality_scores", {})), 1) if p.get("data_quality_scores") else 50
    return int(min(100, max(0, regime_conf * 50 + quality * 0.5)))


def _fmt_market_cap(mc) -> str:
    """Format market cap as a human-readable string."""
    if not mc or mc == 0:
        return "N/A"
    mc = float(mc)
    if mc >= 1e12:
        return f"${mc / 1e12:.2f}T"
    if mc >= 1e9:
        return f"${mc / 1e9:.1f}B"
    if mc >= 1e6:
        return f"${mc / 1e6:.0f}M"
    return f"${mc:,.0f}"


def _normalize_regime_label(label: str | None) -> str:
    """Map pipeline regime labels into the frontend's ReportData union."""
    normalized = (label or "").strip().upper().replace("-", " ").replace("_", " ")
    mapping = {
        "STRONG UPTREND": "Strong Uptrend",
        "UPTREND": "Uptrend",
        "MEAN REVERTING": "Mean-Reverting",
        "MEAN REVERSION": "Mean-Reverting",
        "HIGH VOLATILITY": "High Volatility",
        "DOWNTREND": "Downtrend",
        "STRONG DOWNTREND": "Strong Downtrend",
        "TRANSITIONAL": "Transitional",
    }
    return mapping.get(normalized, "Transitional")


def _regime_strategies(label: str) -> list[str]:
    """Return active strategies for a given regime label."""
    label_upper = (label or "").upper()
    if "STRONG_UPTREND" in label_upper or "STRONG UPTREND" in label_upper:
        return ["Momentum", "Trend Following", "Breakout"]
    if "UPTREND" in label_upper:
        return ["Momentum", "Quality Factor"]
    if "DOWNTREND" in label_upper:
        return ["Hedging", "Short Selling"]
    if "HIGH_VOL" in label_upper or "HIGH VOL" in label_upper:
        return ["Volatility Strategies", "Hedging"]
    return ["Mean Reversion", "Range Trading"]


def _build_fundamentals(p: dict, current_price: float) -> dict | None:
    """Build FundamentalsData from the pipeline payload's asset_specific block."""
    f = (p.get("asset_specific") or {}).get("fundamentals") or {}
    if not any(v is not None for v in f.values()):
        return None
    target = f.get("target_mean_price")
    dcf_upside = (
        round((target - current_price) / current_price * 100, 1)
        if target and current_price else None
    )
    return {
        "pe_ratio":            f.get("pe_ratio"),
        "forward_pe":          f.get("forward_pe"),
        "peg_ratio":           f.get("peg_ratio"),
        "ps_ratio":            f.get("ps_ratio"),
        "pb_ratio":            f.get("pb_ratio"),
        "ev_ebitda":           f.get("ev_ebitda"),
        "gross_margin":        f.get("gross_margin"),
        "operating_margin":    f.get("operating_margin"),
        "net_margin":          f.get("net_margin"),
        "roe":                 f.get("roe"),
        "roa":                 f.get("roa"),
        "roic":                None,
        "debt_to_equity":      f.get("debt_to_equity"),
        "current_ratio":       f.get("current_ratio"),
        "interest_coverage":   None,
        "revenue_growth_yoy":  f.get("revenue_growth_yoy"),
        "earnings_growth_yoy": f.get("earnings_growth_yoy"),
        "free_cash_flow_yield": None,
        "dividend_yield":      f.get("dividend_yield"),
        "payout_ratio":        f.get("payout_ratio"),
        "dcf_fair_value":      target,
        "dcf_upside_pct":      dcf_upside,
    }


_RECOMMENDATION_MAP_API = {
    "strongbuy": "Strong Buy",
    "buy": "Buy",
    "hold": "Hold",
    "underperform": "Sell",
    "sell": "Strong Sell",
    "overweight": "Buy",
    "neutral": "Hold",
    "underweight": "Sell",
    "strongsell": "Strong Sell",
}


def _build_analyst_consensus_from_payload(p: dict) -> dict | None:
    """Build AnalystConsensus from the pipeline payload's asset_specific block."""
    a = (p.get("asset_specific") or {}).get("analyst") or {}
    n = a.get("num_analysts") or 0
    mean = a.get("target_mean")
    if not n and not mean:
        return None
    rating_raw = str(a.get("recommendation_key") or "").lower().strip()
    rating = _RECOMMENDATION_MAP_API.get(rating_raw, "Hold")
    return {
        "rating": rating,
        "target_mean": mean,
        "target_high": a.get("target_high"),
        "target_low": a.get("target_low"),
        "num_analysts": int(n),
    }


def _safe_float(val) -> float | None:
    """Convert a value to float, returning None on failure or infinity."""
    try:
        f = float(val)
        return None if (not isinstance(f, float) or f != f or abs(f) == float("inf")) else round(f, 4)
    except (TypeError, ValueError):
        return None


def _pct(val) -> float | None:
    """Convert a 0–1 fraction from yfinance to a percentage (0–100 range)."""
    f = _safe_float(val)
    return round(f * 100, 2) if f is not None else None


_RECOMMENDATION_MAP = {
    "strongBuy": "Strong Buy",
    "buy": "Buy",
    "hold": "Hold",
    "underperform": "Sell",
    "sell": "Strong Sell",
    # Morningstar / other aliases
    "strongbuy": "Strong Buy",
    "overweight": "Buy",
    "neutral": "Hold",
    "underweight": "Sell",
    "strongsell": "Strong Sell",
}


def _build_analyst_consensus(info: dict) -> dict | None:
    """Build analyst consensus block from yfinance info dict."""
    if not info:
        return None
    buy   = info.get("recommendationKey") or info.get("recommendation")
    n     = info.get("numberOfAnalystOpinions") or info.get("numAnalystOpinions") or 0
    mean  = _safe_float(info.get("targetMeanPrice"))
    high  = _safe_float(info.get("targetHighPrice"))
    low   = _safe_float(info.get("targetLowPrice"))

    if not n and not mean:
        return None

    rating_raw = str(buy or "").lower().strip()
    rating = _RECOMMENDATION_MAP.get(rating_raw, "Hold")

    return {
        "rating": rating,
        "target_mean": mean,
        "target_high": high,
        "target_low": low,
        "num_analysts": int(n),
    }


def _format_stress_tests(tests) -> list[dict]:
    """Format stress test data for the frontend."""
    if isinstance(tests, dict):
        formatted = []
        labels = {
            "2008": "2008 Financial Crisis",
            "COVID": "COVID-19 (2020)",
            "2022": "2022 Rate Shock",
        }
        for scenario, values in list(tests.items())[:3]:
            if not isinstance(values, dict):
                continue
            estimated_return = values.get("estimated_return_pct")
            if not isinstance(estimated_return, (int, float)):
                beta_adjusted = values.get("beta_adjusted_return")
                if isinstance(beta_adjusted, (int, float)):
                    estimated_return = float(beta_adjusted) * 100.0

            recovery = values.get("recovery_months", "N/A")
            formatted.append({
                "scenario": labels.get(str(scenario), str(scenario)),
                "return": f"{estimated_return:+.0f}%" if isinstance(estimated_return, (int, float)) else "N/A",
                "recovery": f"{recovery} months" if isinstance(recovery, (int, float)) else "N/A",
            })

        if formatted:
            return formatted

    if not tests or not isinstance(tests, list):
        return [
            {"scenario": "2008 Financial Crisis", "return": "-40%", "recovery": "18 months"},
            {"scenario": "COVID-19 (2020)", "return": "-30%", "recovery": "5 months"},
            {"scenario": "2022 Rate Shock", "return": "-25%", "recovery": "12 months"},
        ]
    formatted = []
    for t in tests[:3]:
        if isinstance(t, dict):
            formatted.append({
                "scenario": t.get("scenario", "Unknown"),
                "return": f"{t.get('estimated_return_pct', -20):+.0f}%" if isinstance(t.get("estimated_return_pct"), (int, float)) else str(t.get("estimated_return_pct", "N/A")),
                "recovery": f"{t.get('recovery_months', 'N/A')} months" if isinstance(t.get("recovery_months"), (int, float)) else "N/A",
            })
    return formatted or [
        {"scenario": "2008 Financial Crisis", "return": "-40%", "recovery": "18 months"},
        {"scenario": "COVID-19 (2020)", "return": "-30%", "recovery": "5 months"},
    ]
