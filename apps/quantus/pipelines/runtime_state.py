from __future__ import annotations

import json
import logging
import os

from pipelines.cache import MockReportCache, ReportCache

logger = logging.getLogger(__name__)

TICKER_INDEX_KEY = "quantus:index:tickers"
DEFAULT_SCREENER_SEED_TICKERS = (
    "NVDA",
    "TSLA",
    "BTC",
    "SPY",
    "GLD",
    "ASST",
    "AAPL",
    "MSFT",
    "AMZN",
    "GOOGL",
)

_shared_cache: ReportCache | None = None
_shared_ticker_index: "PersistentTickerIndex | None" = None


def get_screener_seed_tickers() -> list[str]:
    raw = os.getenv("SCREENER_SEED_TICKERS", "")
    if not raw.strip():
        return list(DEFAULT_SCREENER_SEED_TICKERS)

    tickers = [
        ticker.strip().upper()
        for ticker in raw.split(",")
        if ticker.strip()
    ]
    return tickers or list(DEFAULT_SCREENER_SEED_TICKERS)


def _build_shared_cache() -> ReportCache:
    try:
        from pipelines.sqlite_cache import SQLiteReportCache

        cache = SQLiteReportCache()
        logger.info("Runtime cache: SQLiteReportCache")
        return cache
    except Exception as exc:
        logger.warning("Runtime cache fallback to MockReportCache: %s", exc)
        return MockReportCache()


def get_shared_cache() -> ReportCache:
    global _shared_cache
    if _shared_cache is None:
        _shared_cache = _build_shared_cache()
    return _shared_cache


def set_shared_cache(cache: ReportCache) -> None:
    global _shared_cache, _shared_ticker_index
    _shared_cache = cache
    _shared_ticker_index = PersistentTickerIndex(cache)


class PersistentTickerIndex:
    def __init__(self, cache: ReportCache):
        self._cache = cache

    def _read_registered_tickers(self) -> list[str]:
        raw = self._cache.get(TICKER_INDEX_KEY)
        if not raw:
            return []

        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            logger.warning("Ticker index cache entry is invalid JSON, resetting it")
            return []

        if not isinstance(parsed, list):
            return []

        tickers: list[str] = []
        for item in parsed:
            if isinstance(item, str):
                normalized = item.strip().upper()
                if normalized and normalized not in tickers:
                    tickers.append(normalized)
        return tickers

    def _write_registered_tickers(self, tickers: list[str]) -> None:
        self._cache.set(TICKER_INDEX_KEY, json.dumps(tickers))

    def register(self, ticker: str) -> None:
        normalized = ticker.strip().upper()
        if not normalized:
            return

        tickers = self._read_registered_tickers()
        if normalized not in tickers:
            tickers.append(normalized)
            self._write_registered_tickers(tickers)

    def all_tickers(self) -> list[str]:
        merged: list[str] = []
        for ticker in [*get_screener_seed_tickers(), *self._read_registered_tickers()]:
            normalized = ticker.strip().upper()
            if normalized and normalized not in merged:
                merged.append(normalized)
        return merged

    def get_report(self, ticker: str) -> dict | None:
        return self._cache.get_report(ticker.strip().upper())


def get_shared_ticker_index() -> PersistentTickerIndex:
    global _shared_ticker_index
    if _shared_ticker_index is None:
        _shared_ticker_index = PersistentTickerIndex(get_shared_cache())
    return _shared_ticker_index


def set_shared_ticker_index(index: PersistentTickerIndex) -> None:
    global _shared_ticker_index
    _shared_ticker_index = index
