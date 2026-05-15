"""
api/_auth.py
=============
Subscription gating for premium Quantus endpoints.

Pattern:
    @router.get("/foo")
    async def foo(user: SubscribedUser = Depends(require_tier("UNLOCKED"))):
        ...

The Express server forwards the authenticated user identity via
`x-quantus-user-id` and `x-quantus-user-tier` headers when proxying
into the Python API. The Express side trusts only its own JWT cookie
session; the Python side trusts the headers because the request was
already pre-authorized by the QUANTUS_INTERNAL_KEY middleware in
main.py before reaching this dependency.

Tier semantics:
    FREE          — free signup; sees 1 free report / day + skim summary
    UNLOCKED      — $19/mo personal tier; full reports + watchlist + alerts
    INSTITUTIONAL — $100/mo pro tier; sector packs + insider + 13F + earnings
"""

from __future__ import annotations

from enum import IntEnum
from typing import Literal

from fastapi import Depends, Header, HTTPException, Request
from fastapi.responses import JSONResponse


class Tier(IntEnum):
    FREE = 0
    UNLOCKED = 1
    INSTITUTIONAL = 2


TIER_NAME: dict[Tier, str] = {
    Tier.FREE: "FREE",
    Tier.UNLOCKED: "UNLOCKED",
    Tier.INSTITUTIONAL: "INSTITUTIONAL",
}
TIER_FROM_NAME: dict[str, Tier] = {v: k for k, v in TIER_NAME.items()}

TierName = Literal["FREE", "UNLOCKED", "INSTITUTIONAL"]


class SubscribedUser:
    """The minimum the API needs about the caller."""

    __slots__ = ("user_id", "tier")

    def __init__(self, user_id: str, tier: Tier) -> None:
        self.user_id = user_id
        self.tier = tier

    @property
    def tier_name(self) -> str:
        return TIER_NAME[self.tier]


def _parse_tier(raw: str | None) -> Tier:
    if not raw:
        return Tier.FREE
    return TIER_FROM_NAME.get(raw.strip().upper(), Tier.FREE)


async def current_user(
    request: Request,
    x_quantus_user_id: str | None = Header(default=None, alias="x-quantus-user-id"),
    x_quantus_user_tier: str | None = Header(default=None, alias="x-quantus-user-tier"),
) -> SubscribedUser:
    """Read user identity from the proxy headers. Anonymous → free."""
    user_id = (x_quantus_user_id or "").strip() or f"anon:{request.client.host if request.client else 'unknown'}"
    return SubscribedUser(user_id=user_id, tier=_parse_tier(x_quantus_user_tier))


def require_tier(min_tier: TierName):
    """FastAPI dependency factory: raises 402 if the user is below the required tier."""
    required = TIER_FROM_NAME[min_tier]

    async def _enforcer(user: SubscribedUser = Depends(current_user)) -> SubscribedUser:
        if user.tier < required:
            raise HTTPException(
                status_code=402,  # Payment Required
                detail={
                    "code": "SUBSCRIPTION_REQUIRED",
                    "message": f"This feature requires {TIER_NAME[required]} or higher.",
                    "required_tier": TIER_NAME[required],
                    "current_tier": user.tier_name,
                    "upgrade_url": "/quantus/workspace/upgrade",
                },
            )
        return user

    return _enforcer


def paywall_response(required: TierName, current: TierName = "FREE") -> JSONResponse:
    """Helper for manual paywall responses outside dependency injection."""
    return JSONResponse(
        status_code=402,
        content={
            "code": "SUBSCRIPTION_REQUIRED",
            "message": f"This feature requires {required} or higher.",
            "required_tier": required,
            "current_tier": current,
            "upgrade_url": "/quantus/workspace/upgrade",
        },
    )
