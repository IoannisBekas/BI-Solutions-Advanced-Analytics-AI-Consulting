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
import hmac
import os
import re
import sys
import time
import uuid
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import FastAPI, Request
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
REQUEST_ID_HEADER = "x-request-id"
REQUEST_ID_RE = re.compile(r"^[A-Za-z0-9._:-]{1,128}$")
QUANTUS_INTERNAL_HEADER = "x-quantus-internal-key"
IS_PRODUCTION = os.getenv("NODE_ENV") == "production"


def _read_env(name: str) -> str:
    return os.getenv(name, "").strip()


def _read_internal_key() -> str:
    key = _read_env("QUANTUS_INTERNAL_KEY")
    if IS_PRODUCTION and len(key) < 32:
        raise RuntimeError("QUANTUS_INTERNAL_KEY env var (min 32 chars) is required in production")
    return key


def _validate_allowed_origins(raw_origins: str) -> list[str]:
    origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    if IS_PRODUCTION and not origins:
        raise RuntimeError("ALLOWED_ORIGINS env var must be set in production")

    for origin in origins:
        if origin == "*":
            raise RuntimeError("ALLOWED_ORIGINS must not contain wildcard '*' when credentials are enabled")
        try:
            from urllib.parse import urlparse
            parsed = urlparse(origin)
            if not parsed.scheme or not parsed.netloc:
                raise ValueError("origin must include scheme and host")
            if IS_PRODUCTION and parsed.scheme != "https":
                raise ValueError("production origins must use https://")
            if not parsed.hostname or "*" in parsed.hostname:
                raise ValueError("origin host must be concrete")
        except Exception as exc:
            raise RuntimeError(f"Invalid ALLOWED_ORIGINS entry {origin!r}: {exc}") from exc

    return origins


def _build_runtime_config() -> dict[str, object]:
    anthropic_key = _read_env("ANTHROPIC_API_KEY")
    gemini_key = _read_env("GEMINI_API_KEY")
    fmp_key = _read_env("FMP_API_KEY")
    sec_user_agent = _read_env("SEC_EDGAR_USER_AGENT")
    data_dir = _read_env("DATA_DIR") or os.path.join(os.getcwd(), "..", "data")

    missing_recommended: list[str] = []
    if not anthropic_key and not gemini_key:
        missing_recommended.append("ANTHROPIC_API_KEY or GEMINI_API_KEY")
    if not fmp_key:
        missing_recommended.append("FMP_API_KEY")
    if not sec_user_agent:
        missing_recommended.append("SEC_EDGAR_USER_AGENT")

    return {
        "anthropic_key_set": bool(anthropic_key),
        "gemini_key_set": bool(gemini_key),
        "fmp_key_set": bool(fmp_key),
        "sec_edgar_user_agent_set": bool(sec_user_agent),
        "llm_provider": _read_env("LLM_PROVIDER") or "auto",
        "data_dir": data_dir,
        "missing_recommended_env": missing_recommended,
    }

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Quantus Research Solutions API",
    version="2.4.0",
    description="Python-side API for live quant pipeline execution and Claude narrative generation.",
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json",
)

_internal_key = _read_internal_key()
_allowed_origins = _validate_allowed_origins(
    os.getenv("ALLOWED_ORIGINS", "" if IS_PRODUCTION else "http://localhost:5001,http://localhost:3000")
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "Cache-Control",
        "Last-Event-Id",
        REQUEST_ID_HEADER,
        QUANTUS_INTERNAL_HEADER,
    ],
)

_runtime_config = _build_runtime_config()
if _runtime_config["missing_recommended_env"]:
    logger.warning(
        "Quantus Python optional env vars missing: %s",
        ", ".join(_runtime_config["missing_recommended_env"]),
    )


@app.middleware("http")
async def attach_request_id(request: Request, call_next):
    candidate_request_id = (
        request.headers.get(REQUEST_ID_HEADER, "").strip()
        or request.headers.get("request-id", "").strip()
    )
    request_id = candidate_request_id if REQUEST_ID_RE.fullmatch(candidate_request_id) else uuid.uuid4().hex
    request.state.request_id = request_id
    start = time.perf_counter()

    try:
        response = await call_next(request)
    except Exception:
        duration_ms = round((time.perf_counter() - start) * 1000)
        logger.exception("[%s] %s %s failed in %sms", request_id, request.method, request.url.path, duration_ms)
        raise

    duration_ms = round((time.perf_counter() - start) * 1000)
    response.headers[REQUEST_ID_HEADER] = request_id
    logger.info("[%s] %s %s %s in %sms", request_id, request.method, request.url.path, response.status_code, duration_ms)
    return response


@app.middleware("http")
async def require_internal_key(request: Request, call_next):
    protected_path = request.url.path.startswith("/api/") or request.url.path.startswith("/webhooks/")
    if protected_path and _internal_key:
        provided = request.headers.get(QUANTUS_INTERNAL_HEADER, "")
        if not hmac.compare_digest(provided, _internal_key):
            from fastapi.responses import JSONResponse
            return JSONResponse(status_code=403, content={"error": "Forbidden"})
    elif protected_path and IS_PRODUCTION:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=403, content={"error": "Forbidden"})

    return await call_next(request)

# ---------------------------------------------------------------------------
# Mount routers
# ---------------------------------------------------------------------------
from api.report import router as report_router          # noqa: E402
from api.sec_edgar import router as market_intel_router  # noqa: E402
from api.screener import router as screener_router       # noqa: E402
from api.portfolio import router as portfolio_router     # noqa: E402
from api.comparison import router as comparison_router   # noqa: E402
from api.webhooks import router as webhook_router        # noqa: E402

app.include_router(report_router)
app.include_router(market_intel_router)
app.include_router(screener_router)
app.include_router(portfolio_router)
app.include_router(comparison_router)
app.include_router(webhook_router)

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
async def health(request: Request):
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "requestId": getattr(request.state, "request_id", ""),
    }


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PYTHON_API_PORT", "8000"))
    host = os.getenv("PYTHON_API_HOST") or ("127.0.0.1" if IS_PRODUCTION else "0.0.0.0")
    logger.info("Starting Quantus Python API on %s:%d", host, port)
    uvicorn.run(app, host=host, port=port, log_level="info")
