"""
api/screener.py
================
Screener API — Quantus Research Solutions.

Queries the Redis cache index — ZERO new Claude API calls.
All filtering and ranking is pure Python on cached QuantusPayload data.

Filters: signal, confidence_min, regime, asset_class, sector,
         earnings_days_max, var_max, user_tier
Returns: ranked result cards sorted by confidence_score desc.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse

from pipelines.cache import MockReportCache, ReportCache

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/screener", tags=["screener"])

# ---------------------------------------------------------------------------
# Shared cache (injected at startup)
# ---------------------------------------------------------------------------
_cache: ReportCache = MockReportCache()

def get_cache() -> ReportCache:  return _cache
def set_cache(c: ReportCache) -> None:
    global _cache; _cache = c

# ---------------------------------------------------------------------------
# In-memory ticker index
# ---------------------------------------------------------------------------

class TickerIndex:
    """Lightweight in-memory index of cached report metadata."""

    def __init__(self, cache: ReportCache):
        self._cache = cache
        self._tickers: list[str] = []

    def register(self, ticker: str) -> None:
        if ticker not in self._tickers:
            self._tickers.append(ticker)

    def all_tickers(self) -> list[str]:
        return list(self._tickers)

    def get_report(self, ticker: str) -> dict | None:
        return self._cache.get_report(ticker)


_index = TickerIndex(_cache)

# Seed with well-known demo tickers so the scanner shows results
# without requiring prior report generation. Reports are registered
# lazily when actually loaded; this just ensures the index isn't empty.
for _t in ["NVDA", "TSLA", "BTC", "SPY", "GLD", "ASST", "AAPL", "MSFT", "AMZN", "GOOGL"]:
    _index.register(_t)


def get_index() -> TickerIndex:   return _index
def set_index(i: TickerIndex) -> None:
    global _index; _index = i

# ---------------------------------------------------------------------------
# Filter + rank logic
# ---------------------------------------------------------------------------

def _matches(
    report: dict,
    *,
    signal:           str | None,
    confidence_min:   float,
    regime:           str | None,
    asset_class:      str | None,
    sector:           str | None,
    earnings_days_max: int | None,
    var_max:          float | None,
) -> bool:
    """Return True if *report* passes all active filters."""
    if signal and report.get("overall_signal") != signal:
        return False

    cs = report.get("confidence_score", 0)
    if cs < confidence_min:
        return False

    reg = report.get("regime", {}).get("label")
    if regime and reg != regime:
        return False

    if asset_class and report.get("asset_class") != asset_class:
        return False

    # sector is inside strategy or audit — best effort from metadata
    if sector:
        meta_sector = report.get("sector") or report.get("audit", {}).get("sector", "")
        if sector.upper() not in meta_sector.upper():
            return False

    if earnings_days_max is not None:
        days = report.get("days_to_earnings")
        if days is None or days > earnings_days_max:
            return False

    if var_max is not None:
        var = None
        for m in report.get("key_metrics", []):
            if "var" in m.get("label", "").lower():
                try:
                    var = float(str(m["value"]).replace("$", "").replace(",", ""))
                except ValueError:
                    pass
        if var is not None and var > var_max:
            return False

    return True


def _to_result_card(ticker: str, report: dict) -> dict:
    regime  = report.get("regime", {})
    momentum = report.get("momentum", {}) or {}
    # has_news: True if report contains at least one news article
    has_news = bool(report.get("news_articles"))
    # has_filings: True if EDGAR returned at least one material filing
    sec = report.get("sec_filings", {}) or {}
    has_filings = bool(sec.get("recent_filings")) or (sec.get("form4_count", 0) > 0)
    return {
        "ticker":              ticker,
        "company_name":        report.get("company_name", ticker),
        "asset_class":         report.get("asset_class", "EQUITY"),
        "sector":              report.get("sector", ""),
        "overall_signal":      report.get("overall_signal", "NEUTRAL"),
        "confidence_score":    report.get("confidence_score", 0),
        "regime_label":        regime.get("label", "UNKNOWN"),
        "regime_implication":  regime.get("implication", ""),
        "early_insight":       report.get("early_insight", ""),
        "key_metrics":         report.get("key_metrics", [])[:3],
        "report_id":           report.get("report_id", ""),
        "report_url":          f"/api/v1/report/{ticker}",
        # Enrichment flags for the scanner UI
        "has_news":            has_news,
        "has_filings":         has_filings,
        "rsi":                 momentum.get("rsi"),
        "news_count":          len(report.get("news_articles") or []),
        "filings_count":       len(sec.get("recent_filings") or []),
    }

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("")
async def screen(
    signal:            str | None = Query(None, description="STRONG BUY|BUY|NEUTRAL|SELL|STRONG SELL"),
    confidence_min:   float = Query(0,    description="Minimum confidence score 0–100"),
    regime:           str | None = Query(None, description="STRONG_UPTREND|UPTREND|SIDEWAYS|DOWNTREND|HIGH_VOL"),
    asset_class:      str | None = Query(None, description="EQUITY|CRYPTO|COMMODITY|ETF"),
    sector:           str | None = Query(None, description="Partial sector name match"),
    earnings_days_max: int | None = Query(None, description="Max days to next earnings (equity only)"),
    var_max:          float | None = Query(None, description="Max VaR per $10k"),
    limit:            int = Query(20, ge=1, le=100, description="Max results"),
    sort_by:          str = Query("confidence_score", description="confidence_score|signal"),
) -> JSONResponse:
    """Screen the cached report index with zero Claude API calls."""
    index   = get_index()
    results: list[dict] = []

    for ticker in index.all_tickers():
        report = index.get_report(ticker)
        if not report:
            continue
        if _matches(
            report,
            signal=signal, confidence_min=confidence_min,
            regime=regime, asset_class=asset_class,
            sector=sector, earnings_days_max=earnings_days_max,
            var_max=var_max,
        ):
            results.append(_to_result_card(ticker, report))

    # Sort
    reverse = True
    if sort_by == "confidence_score":
        results.sort(key=lambda r: r["confidence_score"], reverse=True)
    elif sort_by == "signal":
        _signal_rank = {"STRONG BUY": 5, "BUY": 4, "NEUTRAL": 3, "SELL": 2, "STRONG SELL": 1}
        results.sort(key=lambda r: _signal_rank.get(r["overall_signal"], 0), reverse=True)

    return JSONResponse({
        "count":   len(results[:limit]),
        "total":   len(results),
        "results": results[:limit],
    })
