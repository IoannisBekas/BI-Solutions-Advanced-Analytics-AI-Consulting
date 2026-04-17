"""
api/sec_edgar.py
================
SEC EDGAR Endpoints — Quantus Research Solutions.

Routes:
  GET /api/v1/sec-edgar/{ticker}       → recent filings + insider transaction summary
  GET /api/v1/news/{ticker}            → recent news articles with AI summaries

Both endpoints are lightweight wrappers around the pipeline modules.
No Claude API calls here — Claude is invoked inside pipelines/news.py only.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from pipelines.edgar import fetch_sec_filings
from pipelines.news import fetch_news_for_ticker

logger = logging.getLogger(__name__)

router = APIRouter(tags=["market-intelligence"])


# ---------------------------------------------------------------------------
# GET /api/v1/sec-edgar/{ticker}
# ---------------------------------------------------------------------------

@router.get("/api/v1/sec-edgar/{ticker}")
async def get_sec_filings(
    ticker: str,
    include_form4: bool = Query(default=True, description="Include Form 4 insider data"),
) -> JSONResponse:
    """Return recent SEC filings for *ticker*.

    Data comes from the EDGAR Submissions API — completely free, no key needed.
    Response shape matches the SecFilingsData TypeScript interface.
    """
    ticker = ticker.upper().strip()
    logger.info("sec-edgar | fetching filings for %s", ticker)

    try:
        data = await fetch_sec_filings(ticker)
    except Exception as exc:
        logger.error("sec-edgar | %s failed: %s", ticker, exc)
        return JSONResponse(
            status_code=502,
            content={"error": f"EDGAR fetch failed: {exc}"},
        )

    return JSONResponse({
        "ticker":             ticker,
        "recent_filings":     data.get("recent_filings", []),
        "form4_count":        data.get("form4_count", 0),
        "latest_form4_date":  data.get("latest_form4_date"),
        "insider_activity":   data.get("insider_activity", "NEUTRAL"),
        "cik":                data.get("cik"),
        "edgar_url":          data.get("edgar_url", ""),
    })


# ---------------------------------------------------------------------------
# GET /api/v1/news/{ticker}
# ---------------------------------------------------------------------------

@router.get("/api/v1/news/{ticker}")
async def get_news(
    ticker: str,
    limit: int = Query(default=20, ge=1, le=50, description="Max articles"),
) -> JSONResponse:
    """Return recent news articles with AI-generated summaries for *ticker*.

    Requires FMP_API_KEY env var.  Returns empty list gracefully if not set.
    Response shape matches the NewsArticle[] TypeScript interface.
    """
    ticker = ticker.upper().strip()
    logger.info("news | fetching articles for %s (limit=%d)", ticker, limit)

    try:
        articles, avg_sentiment = await fetch_news_for_ticker(ticker, limit=limit)
    except Exception as exc:
        logger.error("news | %s failed: %s", ticker, exc)
        return JSONResponse(
            status_code=502,
            content={"error": f"News fetch failed: {exc}"},
        )

    return JSONResponse({
        "ticker":        ticker,
        "articles":      articles,
        "avg_sentiment": avg_sentiment,
        "count":         len(articles),
    })
