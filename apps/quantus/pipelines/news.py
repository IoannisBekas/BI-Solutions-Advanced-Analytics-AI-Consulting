"""
pipelines/news.py
==================
Real-time news fetching + Claude-powered article summarization.

Data source:  Financial Modeling Prep (FMP) /v3/stock_news
AI summaries: Claude claude-haiku-20240307 (fast, cheap — ~$0.001 per article batch)

Requires env var:
    FMP_API_KEY       — FMP API key (free tier: 250 req/day, paid: unlimited)
    ANTHROPIC_API_KEY — already required by the LLM provider

Graceful degradation:
    - No FMP_API_KEY  → returns empty list (report still works, news_articles = [])
    - Claude unavailable → title used as summary, sentiment = 0.0
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
from datetime import datetime, timezone

import httpx

logger = logging.getLogger(__name__)

FMP_BASE = "https://financialmodelingprep.com/api/v3"
_IMPACT_TAGS = frozenset({
    "earnings-risk", "regulatory", "partnership", "product",
    "macro", "guidance", "insider", "merger", "general",
})

# ---------------------------------------------------------------------------
# FMP news fetch
# ---------------------------------------------------------------------------

async def fetch_fmp_news(ticker: str, limit: int = 20) -> list[dict]:
    """Fetch recent news articles for *ticker* from FMP.

    Returns a list of raw FMP article dicts, or [] on failure/no-key.
    Each dict has at minimum: title, publishedDate, text, url, symbol.
    """
    api_key = os.environ.get("FMP_API_KEY", "").strip()
    if not api_key:
        logger.debug("news | FMP_API_KEY not set — skipping news fetch")
        return []

    url = (
        f"{FMP_BASE}/stock_news"
        f"?tickers={ticker}"
        f"&limit={limit}"
        f"&apikey={api_key}"
    )
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url)
            if not resp.is_success:
                logger.warning("news | FMP returned %s for %s", resp.status_code, ticker)
                return []
            data = resp.json()
            return data if isinstance(data, list) else []
    except Exception as exc:
        logger.warning("news | FMP fetch failed for %s: %s", ticker, exc)
        return []


# ---------------------------------------------------------------------------
# Claude article summarizer
# ---------------------------------------------------------------------------

async def _summarize_batch(ticker: str, articles: list[dict]) -> list[dict]:
    """Summarize up to 10 articles in a single Claude call (batched prompt).

    Returns a list of enriched article dicts, each with:
        summary     — 1-2 sentence key insight
        sentiment   — float -1.0 to +1.0
        impact_tag  — one of _IMPACT_TAGS
    Falls back gracefully if Claude is unavailable.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not api_key or not articles:
        return _fallback_enrich(articles)

    # Build a compact numbered prompt to minimise tokens
    lines = []
    for i, a in enumerate(articles[:10]):
        title = (a.get("title") or "")[:120]
        snippet = (a.get("text") or "")[:200].replace("\n", " ")
        lines.append(f"{i+1}. TITLE: {title}\n   SNIPPET: {snippet}")

    prompt = (
        f"You are a financial news analyst. Below are up to 10 news items about {ticker}.\n"
        f"For EACH item output exactly one JSON object on its own line with these keys:\n"
        f'  "summary": string (max 100 chars, key market insight)\n'
        f'  "sentiment": float -1.0 (very bearish) to +1.0 (very bullish)\n'
        f'  "impact_tag": one of {sorted(_IMPACT_TAGS)}\n\n'
        + "\n\n".join(lines)
        + "\n\nOutput ONLY the JSON objects, one per line, no extra text."
    )

    try:
        from anthropic import AsyncAnthropic
        client = AsyncAnthropic(api_key=api_key)
        response = await client.messages.create(
            model="claude-haiku-20240307",
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}],
        )
        raw_text = response.content[0].text.strip()
        parsed = _parse_batch_response(raw_text, len(articles[:10]))
    except Exception as exc:
        logger.warning("news | Claude summarization failed: %s", exc)
        return _fallback_enrich(articles)

    enriched = []
    for i, article in enumerate(articles[:10]):
        info = parsed[i] if i < len(parsed) else {}
        enriched.append({
            "title":        (article.get("title") or "")[:200],
            "url":          article.get("url") or "",
            "published_at": _normalize_date(article.get("publishedDate") or ""),
            "source":       article.get("site") or article.get("symbol") or ticker,
            "summary":      info.get("summary") or (article.get("title") or "")[:100],
            "sentiment":    _clamp(float(info.get("sentiment", 0.0))),
            "impact_tag":   info.get("impact_tag", "general") if info.get("impact_tag") in _IMPACT_TAGS else "general",
        })
    return enriched


def _parse_batch_response(text: str, expected: int) -> list[dict]:
    """Parse newline-delimited JSON objects from the batch response."""
    results: list[dict] = []
    for line in text.splitlines():
        line = line.strip()
        if not line.startswith("{"):
            continue
        try:
            results.append(json.loads(line))
        except json.JSONDecodeError:
            pass
    # Pad with empty dicts if Claude returned fewer than expected
    while len(results) < expected:
        results.append({})
    return results


def _fallback_enrich(articles: list[dict]) -> list[dict]:
    """Return articles with title-as-summary and neutral sentiment."""
    return [
        {
            "title":        (a.get("title") or "")[:200],
            "url":          a.get("url") or "",
            "published_at": _normalize_date(a.get("publishedDate") or ""),
            "source":       a.get("site") or a.get("symbol") or "",
            "summary":      (a.get("title") or "")[:100],
            "sentiment":    0.0,
            "impact_tag":   "general",
        }
        for a in articles
    ]


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

async def fetch_news_for_ticker(
    ticker: str,
    company_name: str = "",
    limit: int = 20,
) -> tuple[list[dict], float]:
    """Fetch news, summarize, and return (articles, avg_sentiment).

    This is the single function called from equity.py Step 9.
    It replaces the stub `fetch_news_sentiment` and also populates
    `news_articles` in the payload.

    Args:
        ticker:       Equity ticker, e.g. "NVDA"
        company_name: Human-readable name for better Claude context
        limit:        Max articles to fetch from FMP

    Returns:
        (articles, avg_sentiment) — articles is a list of enriched dicts,
        avg_sentiment is -1..+1 float suitable for composite_sentiment.
    """
    raw_articles = await fetch_fmp_news(ticker, limit=limit)
    if not raw_articles:
        return [], 0.0

    enriched = await _summarize_batch(ticker, raw_articles)

    scores = [a["sentiment"] for a in enriched if isinstance(a.get("sentiment"), float)]
    avg_sentiment = round(sum(scores) / len(scores), 4) if scores else 0.0

    return enriched, avg_sentiment


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _normalize_date(raw: str) -> str:
    """Return an ISO-8601 UTC string, falling back to raw if unparseable."""
    if not raw:
        return datetime.now(timezone.utc).isoformat()
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            dt = datetime.strptime(raw[:19], fmt)
            return dt.replace(tzinfo=timezone.utc).isoformat()
        except ValueError:
            continue
    return raw


def _clamp(v: float, lo: float = -1.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, v))
