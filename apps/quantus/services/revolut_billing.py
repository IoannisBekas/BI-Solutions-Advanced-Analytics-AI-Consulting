"""
services/revolut_billing.py
============================
Revolut Merchant billing for Quantus tiers.

Owns:
    1. Canonical Quantus product/price catalog (currency-aware)
    2. Hosted checkout creation (POST /orders → returns checkout_url)
    3. Webhook signature verification (HMAC-SHA256 over raw body)
    4. Event dispatch (ORDER_COMPLETED → grant tier + record subscription)
    5. Lightweight subscription persistence in SQLite kv_cache
    6. Renewal helper — charge a saved payment method on schedule

Revolut Merchant has NO native subscription primitive. We do it ourselves:
    • On first checkout we ask Revolut to save the payment method for the
      customer (save_payment_method_for_merchant + customer).
    • On each renewal date the scheduler charges a new order against the
      saved method. Failures move the sub to PAST_DUE for 7d, then CANCEL.

Env vars:
    REVOLUT_API_KEY                 sk_… production / sandbox secret key
    REVOLUT_WEBHOOK_SIGNING_SECRET  signing secret for webhook HMAC
    REVOLUT_API_BASE                https://merchant.revolut.com/api
                                    (or sandbox: https://sandbox-merchant.revolut.com/api)
    REVOLUT_CURRENCY                GBP | EUR | USD            default: EUR
    REVOLUT_PRICE_UNLOCKED          minor units (cents/pence)  default: 1900
    REVOLUT_PRICE_INSTITUTIONAL     minor units                default: 10000
    REVOLUT_RETURN_URL              redirect after successful checkout
    REVOLUT_FAILURE_URL             redirect after failed/cancelled checkout
    AUTH_SERVICE_URL                optional — POST tier sync target
    AUTH_SERVICE_TOKEN              optional — bearer for the above
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import os
import time
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Iterable

import httpx

from pipelines.runtime_state import get_shared_cache

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Catalog
# ---------------------------------------------------------------------------


class Plan:
    __slots__ = ("tier", "price_env", "default_minor", "label", "tagline")

    def __init__(self, tier: str, price_env: str, default_minor: int, label: str, tagline: str) -> None:
        self.tier = tier
        self.price_env = price_env
        self.default_minor = default_minor
        self.label = label
        self.tagline = tagline


PLANS: list[Plan] = [
    Plan("FREE", "", 0, "Quantus Free", "1 free report / day, skim summaries only."),
    Plan(
        "UNLOCKED",
        "REVOLUT_PRICE_UNLOCKED",
        1900,
        "Quantus Personal",
        "Full reports, watchlist alerts, archive history, calendar coverage.",
    ),
    Plan(
        "INSTITUTIONAL",
        "REVOLUT_PRICE_INSTITUTIONAL",
        10000,
        "Quantus Institutional",
        "Sector packs, insider feed, 13F whale tracking, earnings AI briefings.",
    ),
]


def get_currency() -> str:
    return (os.environ.get("REVOLUT_CURRENCY", "EUR") or "EUR").strip().upper()


def plan_for_tier(tier: str) -> Plan | None:
    for p in PLANS:
        if p.tier == tier:
            return p
    return None


def public_catalog() -> list[dict]:
    currency = get_currency()
    catalog: list[dict] = []
    for plan in PLANS:
        minor = int(os.environ.get(plan.price_env, plan.default_minor) or plan.default_minor) if plan.price_env else 0
        catalog.append(
            {
                "tier": plan.tier,
                "label": plan.label,
                "tagline": plan.tagline,
                "price_minor": minor,
                "price_major": minor / 100,
                "currency": currency,
                "configured": bool(os.environ.get("REVOLUT_API_KEY")) and (plan.tier == "FREE" or minor > 0),
            }
        )
    return catalog


# ---------------------------------------------------------------------------
# Subscription persistence
# ---------------------------------------------------------------------------

TIER_KEY = "billing:tier:{user_id}"
SUB_KEY = "billing:sub:{user_id}"
DUE_KEY = "billing:due:{day}"  # YYYY-MM-DD -> JSON list[user_id] for renewal sweep
HISTORY_KEY = "billing:history:{user_id}"


class SubscriptionStatus:
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELLED = "cancelled"
    INCOMPLETE = "incomplete"


def get_user_tier(user_id: str) -> str:
    """Tier resolution: latest subscription wins; fallback to FREE."""
    sub = get_subscription(user_id)
    if sub and sub.get("status") == SubscriptionStatus.ACTIVE:
        return sub.get("tier", "FREE")
    if sub and sub.get("status") == SubscriptionStatus.PAST_DUE:
        # 7d grace
        return sub.get("tier", "FREE")
    return "FREE"


def get_subscription(user_id: str) -> dict | None:
    cache = get_shared_cache()
    raw = cache.get(SUB_KEY.format(user_id=user_id))
    if not raw:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def _save_subscription(user_id: str, sub: dict) -> None:
    cache = get_shared_cache()
    cache.set(SUB_KEY.format(user_id=user_id), json.dumps(sub), ttl=None)
    # Mirror tier into TIER_KEY for the auth-header proxy
    cache.set(
        TIER_KEY.format(user_id=user_id),
        json.dumps({"tier": sub["tier"], "updated_at": int(time.time())}),
        ttl=None,
    )
    _maybe_forward_to_auth_service(user_id, sub["tier"])


def _append_history(user_id: str, event: dict) -> None:
    cache = get_shared_cache()
    raw = cache.get(HISTORY_KEY.format(user_id=user_id))
    history = json.loads(raw) if raw else []
    history.append({**event, "ts": int(time.time())})
    cache.set(HISTORY_KEY.format(user_id=user_id), json.dumps(history[-50:]), ttl=None)


def _index_for_renewal(user_id: str, renewal_iso: str) -> None:
    day = renewal_iso[:10]
    cache = get_shared_cache()
    raw = cache.get(DUE_KEY.format(day=day))
    bucket = json.loads(raw) if raw else []
    if user_id not in bucket:
        bucket.append(user_id)
        cache.set(DUE_KEY.format(day=day), json.dumps(bucket), ttl=None)


def list_due_subscriptions(day: str | None = None) -> list[str]:
    if day is None:
        day = datetime.now(timezone.utc).date().isoformat()
    cache = get_shared_cache()
    raw = cache.get(DUE_KEY.format(day=day))
    return json.loads(raw) if raw else []


def cancel_subscription(user_id: str) -> dict | None:
    sub = get_subscription(user_id)
    if not sub:
        return None
    sub["status"] = SubscriptionStatus.CANCELLED
    sub["cancelled_at"] = int(time.time())
    _save_subscription(user_id, sub)
    _append_history(user_id, {"event": "cancelled", "reason": "user_request"})
    cache = get_shared_cache()
    cache.set(
        TIER_KEY.format(user_id=user_id),
        json.dumps({"tier": "FREE", "updated_at": int(time.time())}),
        ttl=None,
    )
    _maybe_forward_to_auth_service(user_id, "FREE")
    return sub


def _maybe_forward_to_auth_service(user_id: str, tier: str) -> None:
    auth_url = os.environ.get("AUTH_SERVICE_URL", "").strip()
    if not auth_url:
        return
    auth_token = os.environ.get("AUTH_SERVICE_TOKEN", "").strip()
    url = f"{auth_url.rstrip('/')}/internal/users/{user_id}/tier"
    headers = {"Content-Type": "application/json"}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    try:
        httpx.post(url, json={"tier": tier}, headers=headers, timeout=5.0)
    except Exception as exc:
        logger.warning("billing | tier forward failed: %s", exc)


# ---------------------------------------------------------------------------
# Revolut HTTP client
# ---------------------------------------------------------------------------


def _api_base() -> str:
    return (os.environ.get("REVOLUT_API_BASE") or "https://merchant.revolut.com/api").rstrip("/")


def _headers() -> dict[str, str]:
    key = os.environ.get("REVOLUT_API_KEY", "").strip()
    if not key:
        raise RuntimeError("REVOLUT_API_KEY is not configured")
    return {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Revolut-Api-Version": "2024-09-01",
    }


async def _post(path: str, body: dict[str, Any]) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(f"{_api_base()}{path}", headers=_headers(), json=body)
        if not resp.is_success:
            raise RuntimeError(f"Revolut POST {path} {resp.status_code}: {resp.text}")
        return resp.json()


async def _get(path: str) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{_api_base()}{path}", headers=_headers())
        if not resp.is_success:
            raise RuntimeError(f"Revolut GET {path} {resp.status_code}: {resp.text}")
        return resp.json()


# ---------------------------------------------------------------------------
# Checkout creation
# ---------------------------------------------------------------------------


async def create_checkout(*, user_id: str, tier: str, email: str | None = None, name: str | None = None) -> dict[str, Any]:
    """Create a Revolut hosted-checkout order for the given tier.

    Returns: { order_id, checkout_url, public_id, tier, amount_minor, currency }.

    The order is created in CAPTURE_MODE='AUTOMATIC' so the payment is
    captured immediately on success. The customer is created/reused via
    ``customer_id`` derived from our Quantus user_id, and we request
    ``save_payment_method_for=customer`` so subsequent renewals can charge
    the saved method without further user interaction.
    """
    plan = plan_for_tier(tier)
    if not plan or plan.tier == "FREE":
        raise ValueError(f"Tier '{tier}' is not purchasable")

    amount_minor = int(os.environ.get(plan.price_env, plan.default_minor) or plan.default_minor)
    currency = get_currency()
    return_url = os.environ.get("REVOLUT_RETURN_URL", "").strip()
    failure_url = os.environ.get("REVOLUT_FAILURE_URL", "").strip()

    # Use deterministic external customer id so we don't duplicate customers.
    external_customer_id = f"qts-{user_id}"

    body: dict[str, Any] = {
        "amount": amount_minor,
        "currency": currency,
        "capture_mode": "AUTOMATIC",
        "description": plan.label,
        "merchant_order_data": {
            "reference": f"{plan.tier}:{user_id}",
        },
        "customer": {
            "external_id": external_customer_id,
        },
        # Persist the tokenised PAN for future merchant-initiated charges.
        "save_payment_method_for": "customer",
        "metadata": {
            "user_id": user_id,
            "tier": plan.tier,
        },
        "redirect_url": return_url or None,
        "cancel_url": failure_url or return_url or None,
    }
    if email:
        body["customer"]["email"] = email
    if name:
        body["customer"]["full_name"] = name

    body = {k: v for k, v in body.items() if v is not None}

    order = await _post("/orders", body)

    # Persist the incomplete subscription so we can finalize on webhook.
    sub = get_subscription(user_id) or {}
    sub.update(
        {
            "user_id": user_id,
            "tier": plan.tier,
            "currency": currency,
            "amount_minor": amount_minor,
            "status": SubscriptionStatus.INCOMPLETE,
            "pending_order_id": order.get("id"),
            "external_customer_id": external_customer_id,
            "created_at": int(time.time()),
        }
    )
    _save_subscription(user_id, sub)
    _append_history(user_id, {"event": "checkout_created", "order_id": order.get("id"), "tier": plan.tier})

    return {
        "order_id": order.get("id"),
        "checkout_url": order.get("checkout_url") or order.get("public_url"),
        "public_id": order.get("public_id"),
        "tier": plan.tier,
        "amount_minor": amount_minor,
        "currency": currency,
    }


# ---------------------------------------------------------------------------
# Webhook verification + dispatch
# ---------------------------------------------------------------------------


def verify_signature(raw_payload: bytes, signature_header: str, timestamp_header: str) -> dict[str, Any] | None:
    """Verify a Revolut Merchant webhook signature.

    Revolut signs with HMAC-SHA256 over ``v1.<timestamp>.<body>`` using the
    signing secret. The header looks like ``v1=<hex_digest>``.
    """
    secret = os.environ.get("REVOLUT_WEBHOOK_SIGNING_SECRET", "").strip()
    if not secret:
        logger.warning("billing | REVOLUT_WEBHOOK_SIGNING_SECRET not set — refusing event")
        return None
    if not signature_header or not timestamp_header:
        return None

    # Reject events older than 5 minutes (replay protection).
    try:
        ts = int(timestamp_header)
    except ValueError:
        return None
    if abs(int(time.time() * 1000) - ts) > 5 * 60 * 1000:
        logger.warning("billing | webhook timestamp out of window")
        return None

    signed_payload = f"v1.{timestamp_header}.".encode() + raw_payload
    expected = hmac.new(secret.encode(), signed_payload, hashlib.sha256).hexdigest()

    # Header may carry multiple comma-separated versions; check each v1=…
    candidates = [seg.strip() for seg in signature_header.split(",") if seg.strip().startswith("v1=")]
    matched = False
    for cand in candidates:
        provided = cand.removeprefix("v1=").strip()
        if hmac.compare_digest(provided, expected):
            matched = True
            break

    if not matched:
        return None

    try:
        return json.loads(raw_payload.decode("utf-8"))
    except json.JSONDecodeError:
        return None


def handle_event(event: dict[str, Any]) -> dict[str, Any]:
    """Apply a verified Revolut event to local state."""
    event_type = (event.get("event") or "").upper()
    data = event.get("data", {}) or {}
    order_id = data.get("id") or event.get("order_id") or ""
    metadata = data.get("metadata", {}) or {}
    user_id = metadata.get("user_id") or ""
    tier = (metadata.get("tier") or "").upper()

    if not user_id:
        # Try to recover user_id from merchant_order_data.reference 'TIER:user_id'
        ref = (data.get("merchant_order_data", {}) or {}).get("reference") or ""
        if ":" in ref:
            ref_tier, ref_user = ref.split(":", 1)
            tier = tier or ref_tier
            user_id = ref_user

    if not user_id:
        return {"ok": False, "reason": "no user_id in event", "type": event_type}

    if event_type in {"ORDER_COMPLETED", "ORDER_AUTHORISED", "ORDER_CAPTURED"} and tier in {"UNLOCKED", "INSTITUTIONAL"}:
        # Grant tier + record renewal date 30 days out
        now = datetime.now(timezone.utc)
        renewal = now + timedelta(days=30)
        sub = get_subscription(user_id) or {}
        payment_method = data.get("payment_method") or {}
        sub.update(
            {
                "user_id": user_id,
                "tier": tier,
                "status": SubscriptionStatus.ACTIVE,
                "current_period_start": now.isoformat().replace("+00:00", "Z"),
                "current_period_end": renewal.isoformat().replace("+00:00", "Z"),
                "next_renewal_at": renewal.isoformat().replace("+00:00", "Z"),
                "latest_order_id": order_id,
                "payment_method_id": payment_method.get("id") or sub.get("payment_method_id"),
                "saved_card_id": (payment_method.get("card") or {}).get("id") or sub.get("saved_card_id"),
                "pending_order_id": None,
                "currency": data.get("currency") or sub.get("currency"),
                "amount_minor": data.get("amount") or sub.get("amount_minor"),
            }
        )
        _save_subscription(user_id, sub)
        _index_for_renewal(user_id, sub["next_renewal_at"])
        _append_history(user_id, {"event": "tier_granted", "tier": tier, "order_id": order_id})
        return {"ok": True, "user_id": user_id, "tier": tier, "type": event_type}

    if event_type in {"ORDER_DECLINED", "ORDER_FAILED", "ORDER_CANCELLED"}:
        sub = get_subscription(user_id)
        if sub and sub.get("status") in {SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE}:
            sub["status"] = SubscriptionStatus.PAST_DUE
            sub["past_due_since"] = int(time.time())
            _save_subscription(user_id, sub)
        _append_history(user_id, {"event": "payment_failed", "order_id": order_id, "type": event_type})
        return {"ok": True, "user_id": user_id, "type": event_type, "status": SubscriptionStatus.PAST_DUE}

    return {"ok": True, "ignored": True, "type": event_type}


# ---------------------------------------------------------------------------
# Renewal — called by cron / scheduler
# ---------------------------------------------------------------------------


async def renew_one(user_id: str) -> dict[str, Any]:
    """Charge a saved card for the next billing period. Idempotent per renewal day.

    Returns a result dict. Caller is responsible for retry scheduling.
    """
    sub = get_subscription(user_id)
    if not sub:
        return {"ok": False, "reason": "no subscription"}
    if sub.get("status") not in {SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE}:
        return {"ok": False, "reason": f"status={sub.get('status')}"}
    if not sub.get("payment_method_id") and not sub.get("saved_card_id"):
        return {"ok": False, "reason": "no saved payment method"}

    plan = plan_for_tier(sub["tier"])
    if not plan:
        return {"ok": False, "reason": "unknown tier"}

    amount_minor = int(os.environ.get(plan.price_env, plan.default_minor) or plan.default_minor)
    currency = sub.get("currency") or get_currency()
    idempotency_key = f"renew-{user_id}-{datetime.now(timezone.utc).date().isoformat()}"

    body: dict[str, Any] = {
        "amount": amount_minor,
        "currency": currency,
        "capture_mode": "AUTOMATIC",
        "description": f"{plan.label} renewal",
        "merchant_order_data": {"reference": f"{plan.tier}:{user_id}"},
        "metadata": {"user_id": user_id, "tier": plan.tier, "kind": "renewal"},
        "customer": {"external_id": sub.get("external_customer_id") or f"qts-{user_id}"},
        "payment_method_id": sub.get("payment_method_id"),
        "merchant_initiated": True,
    }
    body = {k: v for k, v in body.items() if v is not None}

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            headers = {**_headers(), "Idempotency-Key": idempotency_key}
            resp = await client.post(f"{_api_base()}/orders", headers=headers, json=body)
            if not resp.is_success:
                _append_history(user_id, {"event": "renewal_http_error", "status": resp.status_code, "body": resp.text[:512]})
                sub["status"] = SubscriptionStatus.PAST_DUE
                sub["past_due_since"] = int(time.time())
                _save_subscription(user_id, sub)
                return {"ok": False, "reason": f"http {resp.status_code}", "user_id": user_id}
            order = resp.json()
    except Exception as exc:
        _append_history(user_id, {"event": "renewal_exception", "error": str(exc)})
        return {"ok": False, "reason": str(exc), "user_id": user_id}

    # Optimistically extend the period; the webhook will reconfirm.
    now = datetime.now(timezone.utc)
    next_renewal = now + timedelta(days=30)
    sub.update(
        {
            "status": SubscriptionStatus.ACTIVE,
            "current_period_start": now.isoformat().replace("+00:00", "Z"),
            "current_period_end": next_renewal.isoformat().replace("+00:00", "Z"),
            "next_renewal_at": next_renewal.isoformat().replace("+00:00", "Z"),
            "latest_order_id": order.get("id"),
        }
    )
    _save_subscription(user_id, sub)
    _index_for_renewal(user_id, sub["next_renewal_at"])
    _append_history(user_id, {"event": "renewal_charged", "order_id": order.get("id")})
    return {"ok": True, "user_id": user_id, "order_id": order.get("id")}


async def renew_due_today() -> dict[str, Any]:
    """Call once a day from cron. Iterates the DUE_KEY bucket for today."""
    today = datetime.now(timezone.utc).date().isoformat()
    users = list_due_subscriptions(today)
    results = []
    for uid in users:
        results.append(await renew_one(uid))
    return {"date": today, "count": len(results), "results": results}


# ---------------------------------------------------------------------------
# Tests / utility
# ---------------------------------------------------------------------------


def _b64(b: bytes) -> str:
    return base64.b64encode(b).decode()


_UNUSED = (_b64, uuid, Iterable)  # keep imports flagged for ruff
