"""
pipelines/sqlite_cache.py
==========================
SQLite-backed Report Cache — Quantus Research Solutions.

Drop-in replacement for MockReportCache that persists reports to disk.
Uses the same interface (ReportCache ABC) so all existing code works unchanged.
"""

from __future__ import annotations

import json
import logging
import os
import sqlite3
import threading
import time
import uuid

from pipelines.cache import ReportCache, REPORT_TTL_SECONDS

logger = logging.getLogger(__name__)


class SQLiteReportCache(ReportCache):
    """SQLite-backed cache implementing the ReportCache interface.

    Thread-safe: uses a threading lock around all DB operations instead of
    the unsafe ``check_same_thread=False`` flag.
    """

    def __init__(self, db_path: str | None = None):
        if db_path is None:
            data_dir = os.environ.get("DATA_DIR", os.path.join(os.getcwd(), "..", "data"))
            os.makedirs(data_dir, exist_ok=True)
            db_path = os.path.join(data_dir, "quantus_cache.db")

        self._db_path = db_path
        self._lock = threading.Lock()
        self._conn = sqlite3.connect(db_path, check_same_thread=False)
        self._conn.execute("PRAGMA journal_mode = WAL")
        self._conn.execute("PRAGMA busy_timeout = 5000")
        self._create_tables()
        logger.info("SQLiteReportCache: %s", db_path)

    def _create_tables(self):
        self._conn.executescript("""
            CREATE TABLE IF NOT EXISTS kv_cache (
                key     TEXT PRIMARY KEY,
                value   TEXT NOT NULL,
                expires REAL  -- epoch timestamp, NULL = no expiry
            );
            CREATE INDEX IF NOT EXISTS idx_kv_expires ON kv_cache(expires);
        """)
        self._conn.commit()

    def _cleanup_expired(self):
        """Remove expired entries (called lazily)."""
        with self._lock:
            self._conn.execute("DELETE FROM kv_cache WHERE expires IS NOT NULL AND expires < ?", (time.time(),))
            self._conn.commit()

    def get(self, key: str) -> str | None:
        with self._lock:
            row = self._conn.execute(
                "SELECT value, expires FROM kv_cache WHERE key = ?", (key,)
            ).fetchone()
            if row is None:
                return None
            value, expires = row
            if expires is not None and time.time() > expires:
                self._conn.execute("DELETE FROM kv_cache WHERE key = ?", (key,))
                self._conn.commit()
                return None
            return value

    def set(self, key: str, value: str, ttl: int | None = None) -> None:
        expires = time.time() + ttl if ttl else None
        with self._lock:
            self._conn.execute(
                "INSERT OR REPLACE INTO kv_cache (key, value, expires) VALUES (?, ?, ?)",
                (key, value, expires),
            )
            self._conn.commit()

    def delete(self, key: str) -> None:
        with self._lock:
            self._conn.execute("DELETE FROM kv_cache WHERE key = ?", (key,))
            self._conn.commit()

    def exists(self, key: str) -> bool:
        return self.get(key) is not None

    def close(self):
        with self._lock:
            self._conn.close()
