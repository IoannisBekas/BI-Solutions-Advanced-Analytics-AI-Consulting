"""
services/subscription_store.py
================================
Thin persistence layer for per-user feature subscriptions
(sector packs, insider alerts, earnings reminders).

Reuses the existing SQLite kv_cache so we don't add a new schema.
All values are JSON-encoded.

Key shape:
    subs:sector:{user_id}    → list[str]    sector subscriptions
    subs:insider:{user_id}   → list[str]    tickers user watches for insider trades
    subs:earnings:{user_id}  → list[str]    tickers user watches for earnings
    subs:whales:{user_id}    → list[str]    CIKs / fund names user follows
"""

from __future__ import annotations

import json
import logging
from typing import Iterable

from pipelines.runtime_state import get_shared_cache

logger = logging.getLogger(__name__)

VALID_NAMESPACES = {"sector", "insider", "earnings", "whales"}


def _key(namespace: str, user_id: str) -> str:
    if namespace not in VALID_NAMESPACES:
        raise ValueError(f"Unknown subscription namespace: {namespace}")
    return f"subs:{namespace}:{user_id}"


def list_subscriptions(namespace: str, user_id: str) -> list[str]:
    cache = get_shared_cache()
    raw = cache.get(_key(namespace, user_id))
    if not raw:
        return []
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            return [str(x) for x in parsed]
    except json.JSONDecodeError:
        logger.warning("Corrupt subscription payload for %s/%s — resetting", namespace, user_id)
    return []


def set_subscriptions(namespace: str, user_id: str, items: Iterable[str]) -> list[str]:
    cache = get_shared_cache()
    deduped = sorted({str(x).strip().upper() for x in items if str(x).strip()})
    cache.set(_key(namespace, user_id), json.dumps(deduped), ttl=None)  # no expiry
    return deduped


def add_subscription(namespace: str, user_id: str, item: str) -> list[str]:
    current = set(list_subscriptions(namespace, user_id))
    current.add(item.strip().upper())
    return set_subscriptions(namespace, user_id, current)


def remove_subscription(namespace: str, user_id: str, item: str) -> list[str]:
    current = set(list_subscriptions(namespace, user_id))
    current.discard(item.strip().upper())
    return set_subscriptions(namespace, user_id, current)
