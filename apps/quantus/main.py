"""
main.py — Quantus Research Solutions FastAPI Application.

Runs on port 8000. The Express server on port 3001 proxies
report requests here for live pipeline execution.

Usage:
    python main.py
    # or: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

from __future__ import annotations

import logging
import os
import sys

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure pipelines/ and services/ are importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv(".env.local")
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Quantus Research Solutions API",
    version="2.4.0",
    description="Python-side API for live quant pipeline execution and Claude narrative generation.",
)

_allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5001,http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Cache-Control", "Last-Event-Id"],
)

# ---------------------------------------------------------------------------
# Mount routers
# ---------------------------------------------------------------------------
from api.report import router as report_router  # noqa: E402

app.include_router(report_router)

@app.get("/api/v1/search")
async def search_tickers(q: str = "", limit: int = 5):
    """Search SEC registry for autocomplete."""
    from services.sec_edgar import SECEdgarService
    svc = SECEdgarService()
    return svc.search_tickers(q, limit)

# ---------------------------------------------------------------------------
# Health / status
# ---------------------------------------------------------------------------
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "engine": "Meridian v2.4",
        "python_version": sys.version,
        "anthropic_key_set": bool(os.getenv("ANTHROPIC_API_KEY")),
        "gemini_key_set": bool(os.getenv("GEMINI_API_KEY")),
        "llm_provider": os.getenv("LLM_PROVIDER", "auto"),
    }


@app.get("/api/v1/sec-edgar/{ticker}")
async def sec_edgar(ticker: str):
    """Proxy SEC EDGAR analysis through the Python service."""
    from services.sec_edgar import SECEdgarService
    svc = SECEdgarService()
    result = svc.analyze_ticker(ticker.upper().strip())
    return {
        "ticker": result.ticker,
        "form_type": result.form_type,
        "filing_date": result.filing_date,
        "prior_filing_date": result.prior_filing_date,
        "delta_score": result.delta_score,
        "summary_plain": result.summary_plain,
        "is_cached_fallback": result.is_cached_fallback,
    }


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PYTHON_API_PORT", "8000"))
    logger.info("Starting Quantus Python API on port %d", port)
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
