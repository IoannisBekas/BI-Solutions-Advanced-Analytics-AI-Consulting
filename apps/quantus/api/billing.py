"""
api/billing.py
===============
Quantus billing (Revolut Merchant).

Endpoints:
    GET  /api/v1/billing/catalog        public price list
    GET  /api/v1/billing/me             caller's tier + active subscription
    POST /api/v1/billing/checkout       create Revolut hosted checkout (auth)
    POST /api/v1/billing/cancel         cancel my subscription (auth)
    POST /api/v1/billing/admin/renew    operator-triggered renewal sweep
    POST /webhooks/revolut              Revolut → Quantus webhook (HMAC signed)
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from api._auth import SubscribedUser, current_user, require_tier
from services.revolut_billing import (
    cancel_subscription,
    create_checkout,
    get_subscription,
    handle_event,
    public_catalog,
    renew_due_today,
    verify_signature,
)

logger = logging.getLogger(__name__)
billing_router = APIRouter(prefix="/api/v1/billing", tags=["billing"])
revolut_webhook_router = APIRouter(prefix="/webhooks", tags=["webhooks"])


class CheckoutRequest(BaseModel):
    tier: str  # "UNLOCKED" | "INSTITUTIONAL"
    email: str | None = None
    name: str | None = None


@billing_router.get("/catalog")
async def catalog() -> JSONResponse:
    return JSONResponse({"plans": public_catalog()})


@billing_router.get("/me")
async def me(user: SubscribedUser = Depends(current_user)) -> JSONResponse:
    sub = get_subscription(user.user_id)
    return JSONResponse(
        {
            "user_id": user.user_id,
            "tier": user.tier_name,
            "subscription": sub,
        }
    )


@billing_router.post("/checkout")
async def checkout(
    req: CheckoutRequest,
    user: SubscribedUser = Depends(current_user),
) -> JSONResponse:
    if user.user_id.startswith("anon:"):
        raise HTTPException(status_code=401, detail={"message": "Sign in before subscribing"})
    if req.tier.upper() not in {"UNLOCKED", "INSTITUTIONAL"}:
        raise HTTPException(status_code=400, detail={"message": "tier must be UNLOCKED or INSTITUTIONAL"})
    try:
        result = await create_checkout(
            user_id=user.user_id,
            tier=req.tier.upper(),
            email=req.email,
            name=req.name,
        )
    except RuntimeError as exc:
        logger.error("billing | checkout failed: %s", exc)
        raise HTTPException(status_code=503, detail={"message": "Billing provider unavailable", "error": str(exc)}) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail={"message": str(exc)}) from exc
    return JSONResponse(result)


@billing_router.post("/cancel")
async def cancel(user: SubscribedUser = Depends(current_user)) -> JSONResponse:
    if user.user_id.startswith("anon:"):
        raise HTTPException(status_code=401, detail={"message": "Sign in first"})
    sub = cancel_subscription(user.user_id)
    if not sub:
        raise HTTPException(status_code=404, detail={"message": "No active subscription found"})
    return JSONResponse({"ok": True, "subscription": sub})


@billing_router.post("/admin/renew")
async def admin_renew(_: SubscribedUser = Depends(require_tier("INSTITUTIONAL"))) -> JSONResponse:
    """Operator hook: sweep today's renewals. Gated by INSTITUTIONAL tier so
    only admins (who you'd grant that tier to internally) can fire it."""
    result = await renew_due_today()
    return JSONResponse(result)


@revolut_webhook_router.post("/revolut")
async def revolut_webhook(
    request: Request,
    revolut_signature: str | None = Header(default=None, alias="revolut-signature"),
    revolut_request_timestamp: str | None = Header(default=None, alias="revolut-request-timestamp"),
) -> JSONResponse:
    raw = await request.body()
    if not revolut_signature or not revolut_request_timestamp:
        return JSONResponse(status_code=400, content={"error": "missing signature headers"})
    event = verify_signature(raw, revolut_signature, revolut_request_timestamp)
    if not event:
        return JSONResponse(status_code=400, content={"error": "invalid signature"})
    summary = handle_event(event)
    logger.info("billing webhook | %s", summary)
    return JSONResponse(summary)
