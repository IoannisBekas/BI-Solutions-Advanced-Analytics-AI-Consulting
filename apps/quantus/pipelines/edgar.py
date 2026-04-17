"""
pipelines/edgar.py
===================
SEC EDGAR API integration — completely free, no API key required.

Provides:
    fetch_sec_filings(ticker)  → recent 8-K / 10-K / 10-Q + Form 4 transactions
    ticker_to_cik(ticker)      → CIK string (zero-padded to 10 digits)

EDGAR endpoints used:
    https://www.sec.gov/files/company_tickers.json   — ticker→CIK mapping
    https://data.sec.gov/submissions/CIK{cik}.json   — all filings for a company

Rate limits: SEC asks for max 10 req/sec with a User-Agent header identifying the app.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone

import httpx

logger = logging.getLogger(__name__)

_EDGAR_UA = "QuantusResearchSolutions/2.4 contact@bisolutions.group"
_TICKER_CIK_URL = "https://www.sec.gov/files/company_tickers.json"
_SUBMISSIONS_URL = "https://data.sec.gov/submissions/CIK{cik}.json"

# Forms we care about for the "recent filings" card
_TARGET_FORMS = {"8-K", "10-K", "10-Q", "S-1", "DEF 14A", "4"}
_MATERIAL_FORMS = {"8-K", "10-K", "10-Q", "S-1", "DEF 14A"}

# In-memory CIK cache (reset on each server restart — acceptable for a pipeline)
_cik_cache: dict[str, str | None] = {}


# ---------------------------------------------------------------------------
# CIK lookup
# ---------------------------------------------------------------------------

async def ticker_to_cik(ticker: str) -> str | None:
    """Return the zero-padded 10-digit CIK for *ticker*, or None if not found."""
    t = ticker.upper().strip()
    if t in _cik_cache:
        return _cik_cache[t]

    try:
        async with httpx.AsyncClient(
            headers={"User-Agent": _EDGAR_UA},
            timeout=10,
        ) as client:
            resp = await client.get(_TICKER_CIK_URL)
            if not resp.is_success:
                logger.warning("edgar | company_tickers.json returned %s", resp.status_code)
                _cik_cache[t] = None
                return None

            data: dict = resp.json()
            # data is {"0": {"cik_str": 320193, "ticker": "AAPL", "title": "..."}, ...}
            for entry in data.values():
                if isinstance(entry, dict) and entry.get("ticker", "").upper() == t:
                    raw_cik = str(entry["cik_str"])
                    padded = raw_cik.zfill(10)
                    _cik_cache[t] = padded
                    return padded

    except Exception as exc:
        logger.warning("edgar | CIK lookup failed for %s: %s", t, exc)

    _cik_cache[t] = None
    return None


# ---------------------------------------------------------------------------
# Submissions fetch
# ---------------------------------------------------------------------------

async def _fetch_submissions(cik: str) -> dict:
    """Fetch the raw EDGAR submissions JSON for a CIK."""
    url = _SUBMISSIONS_URL.format(cik=cik)
    try:
        async with httpx.AsyncClient(
            headers={"User-Agent": _EDGAR_UA},
            timeout=15,
        ) as client:
            resp = await client.get(url)
            if not resp.is_success:
                logger.warning("edgar | submissions %s returned %s", cik, resp.status_code)
                return {}
            return resp.json()
    except Exception as exc:
        logger.warning("edgar | submissions fetch failed for cik=%s: %s", cik, exc)
        return {}


# ---------------------------------------------------------------------------
# Parse filings from submissions
# ---------------------------------------------------------------------------

def _build_filing_url(cik_raw: str, accession: str, primary_doc: str) -> str:
    """Build the viewer URL for a specific filing document."""
    acc_clean = accession.replace("-", "")
    return f"https://www.sec.gov/Archives/edgar/data/{cik_raw}/{acc_clean}/{primary_doc}"


def _describe_form(form: str, description: str) -> str:
    """Return a human-readable description for common form types."""
    _FORM_LABELS = {
        "8-K":     "Material Event (8-K)",
        "10-K":    "Annual Report (10-K)",
        "10-Q":    "Quarterly Report (10-Q)",
        "S-1":     "IPO / Registration (S-1)",
        "DEF 14A": "Proxy Statement",
        "4":       "Insider Transaction (Form 4)",
    }
    base = _FORM_LABELS.get(form, form)
    if description and len(description) > 3 and description.upper() != form.upper():
        return f"{base} — {description[:80]}"
    return base


def _extract_filings_from_recent(
    cik_raw: str,
    recent: dict,
    max_material: int = 6,
    max_form4: int = 8,
) -> tuple[list[dict], list[dict]]:
    """Parse the 'recent' block of a submissions JSON into material filings + Form 4s.

    Returns:
        material_filings  — list of {form_type, title, filed_at, url}
        form4_entries     — list of {filed_at, url, accession_no}
    """
    forms        = recent.get("form", [])
    dates        = recent.get("filingDate", [])
    accessions   = recent.get("accessionNumber", [])
    primary_docs = recent.get("primaryDocument", [])
    descriptions = recent.get("primaryDocDescription", [])

    material: list[dict] = []
    form4s:   list[dict] = []

    for i, form in enumerate(forms):
        if form not in _TARGET_FORMS:
            continue

        filed_at   = dates[i]        if i < len(dates) else ""
        accession  = accessions[i]   if i < len(accessions) else ""
        primary    = primary_docs[i] if i < len(primary_docs) else ""
        desc       = descriptions[i] if i < len(descriptions) else ""

        url = _build_filing_url(cik_raw, accession, primary) if accession and primary else (
            f"https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={cik_raw}&type={form}"
        )

        if form == "4":
            if len(form4s) < max_form4:
                form4s.append({
                    "filed_at":    filed_at,
                    "url":         url,
                    "accession_no": accession,
                })
        elif form in _MATERIAL_FORMS and len(material) < max_material:
            material.append({
                "form_type":   form,
                "title":       _describe_form(form, desc),
                "filed_at":    filed_at,
                "url":         url,
            })

    return material, form4s


def _derive_insider_sentiment(form4_count: int, recent_days: int = 90) -> str:
    """Heuristic: more Form 4s filed recently → higher insider activity."""
    if form4_count == 0:
        return "NEUTRAL"
    if form4_count >= 5:
        return "ACTIVE"  # could be buys or sells — flagged for attention
    return "NEUTRAL"


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

async def fetch_sec_filings(ticker: str) -> dict:
    """Fetch SEC filings for *ticker* and return a structured dict.

    Returns:
    {
        "recent_filings":       list of material filings (8-K, 10-K, 10-Q …)
        "form4_count":          number of Form 4s in last ~100 filings
        "latest_form4_date":    ISO date of most recent Form 4, or None
        "insider_activity":     "ACTIVE" | "NEUTRAL"
        "cik":                  zero-padded CIK string, or None
        "edgar_url":            direct EDGAR company page URL
    }
    Falls back to empty structure on any error.
    """
    _empty = {
        "recent_filings": [],
        "form4_count": 0,
        "latest_form4_date": None,
        "insider_activity": "NEUTRAL",
        "cik": None,
        "edgar_url": "",
    }

    cik = await ticker_to_cik(ticker)
    if not cik:
        logger.info("edgar | no CIK found for %s — skipping", ticker)
        return _empty

    cik_raw = str(int(cik))  # un-padded for URL use
    edgar_url = f"https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={cik}&type=8-K&dateb=&owner=include&count=10"

    data = await _fetch_submissions(cik)
    if not data:
        return {**_empty, "cik": cik, "edgar_url": edgar_url}

    recent = data.get("filings", {}).get("recent", {})
    material_filings, form4s = _extract_filings_from_recent(cik_raw, recent)

    latest_form4_date = form4s[0]["filed_at"] if form4s else None
    insider_activity = _derive_insider_sentiment(len(form4s))

    return {
        "recent_filings":    material_filings,
        "form4_count":       len(form4s),
        "latest_form4_date": latest_form4_date,
        "insider_activity":  insider_activity,
        "cik":               cik,
        "edgar_url":         edgar_url,
    }
