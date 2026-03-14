"""
services/credits.py
====================
Credit system — Quantus Research Solutions.

Credit costs:
  Standard report      = 1.0 credit
  Comparison report    = 1.5 credits
  Deep Dive module     = 0.5 credits
  Portfolio analyzer   = 2.0 credits
  Screener query       = 0.5 credits

Credits stored in PostgreSQL users table.
Deductions are atomic (SELECT FOR UPDATE in a DB transaction).
Institutional clients: team credit pool, admin assigns per-user allocations.
"""

from __future__ import annotations

import enum
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)

# ─── Credit cost catalogue ────────────────────────────────────────────────────

class CreditCost(float, enum.Enum):
    STANDARD_REPORT    = 1.0
    COMPARISON_REPORT  = 1.5
    DEEP_DIVE_MODULE   = 0.5
    PORTFOLIO_ANALYZER = 2.0
    SCREENER_QUERY     = 0.5

# ─── Credit bundles (for Stripe purchase flow) ────────────────────────────────

@dataclass(frozen=True)
class CreditBundle:
    name: str
    credits: float
    price_usd_cents: int    # Stripe amount
    stripe_price_id: str    # placeholder

CREDIT_BUNDLES = [
    CreditBundle("Starter",      credits=10,   price_usd_cents=999,   stripe_price_id="price_starter_placeholder"),
    CreditBundle("Standard",     credits=25,   price_usd_cents=1999,  stripe_price_id="price_standard_placeholder"),
    CreditBundle("Pro",          credits=60,   price_usd_cents=3999,  stripe_price_id="price_pro_placeholder"),
    CreditBundle("Institutional",credits=200,  price_usd_cents=9999,  stripe_price_id="price_inst_placeholder"),
]

# ─── In-memory mock store (replace with PostgreSQL) ──────────────────────────

_user_credits: dict[str, float] = {}
_team_pools:   dict[str, float] = {}    # team_id → pool balance
_ledger:       list[dict]       = []    # audit trail

def _get_balance(user_id: str) -> float:
    return _user_credits.get(user_id, 0.0)

def _set_balance(user_id: str, balance: float) -> None:
    _user_credits[user_id] = max(0.0, round(balance, 4))

# ─── Core credit operations ───────────────────────────────────────────────────

class InsufficientCreditsError(Exception):
    def __init__(self, needed: float, available: float):
        self.needed    = needed
        self.available = available
        super().__init__(f"Insufficient credits: needed {needed}, have {available}")

class CreditService:
    """Atomic credit accounting.

    Production: all mutating operations run inside a PostgreSQL
    transaction with `SELECT balance FROM users WHERE id=$1 FOR UPDATE`
    to prevent double-spend.
    """

    @staticmethod
    def get_balance(user_id: str, tier: str = "UNLOCKED") -> float:
        if tier == "INSTITUTIONAL":
            return float("inf")   # unlimited
        return _get_balance(user_id)

    @staticmethod
    def top_up(user_id: str, amount: float, reason: str = "purchase") -> float:
        """Add credits to a user's account. Returns new balance."""
        current = _get_balance(user_id)
        new_bal = current + amount
        _set_balance(user_id, new_bal)
        _ledger.append({
            "user_id":    user_id,
            "delta":      +amount,
            "reason":     reason,
            "balance_after": new_bal,
            "ts":         datetime.now(timezone.utc).isoformat(),
        })
        logger.info("credit_top_up | user=%s | +%.2f | balance=%.2f", user_id, amount, new_bal)
        return new_bal

    @staticmethod
    def deduct(
        user_id:  str,
        cost:     CreditCost,
        label:    str = "",
        tier:     str = "UNLOCKED",
    ) -> float:
        """Atomically deduct credits. Returns new balance.

        Raises InsufficientCreditsError if balance < cost.
        INSTITUTIONAL tier bypasses deduction entirely.
        """
        if tier == "INSTITUTIONAL":
            logger.info("credit_deduct | INSTITUTIONAL bypass | user=%s | %s", user_id, cost.name)
            return float("inf")

        # Production: BEGIN; SELECT … FOR UPDATE;
        current = _get_balance(user_id)
        if current < cost.value:
            raise InsufficientCreditsError(needed=cost.value, available=current)

        new_bal = current - cost.value
        _set_balance(user_id, new_bal)
        _ledger.append({
            "user_id":       user_id,
            "delta":         -cost.value,
            "reason":        cost.name.lower() + (f" — {label}" if label else ""),
            "balance_after": new_bal,
            "ts":            datetime.now(timezone.utc).isoformat(),
        })
        logger.info("credit_deduct | user=%s | −%.2f (%s) | balance=%.2f", user_id, cost.value, cost.name, new_bal)
        return new_bal

    @staticmethod
    def get_ledger(user_id: str, limit: int = 50) -> list[dict]:
        """Return most recent `limit` ledger entries for `user_id`."""
        entries = [e for e in _ledger if e["user_id"] == user_id]
        return sorted(entries, key=lambda e: e["ts"], reverse=True)[:limit]

    # ── Institutional team pool ────────────────────────────────────────────────

    @staticmethod
    def allocate_team_pool(team_id: str, amount: float) -> None:
        """Admin allocates credits to a team pool."""
        _team_pools[team_id] = _team_pools.get(team_id, 0.0) + amount
        logger.info("team_pool_allocate | team=%s | +%.2f", team_id, amount)

    @staticmethod
    def assign_from_pool(team_id: str, user_id: str, amount: float) -> float:
        """Team admin assigns credits from pool to an analyst."""
        pool = _team_pools.get(team_id, 0.0)
        if pool < amount:
            raise InsufficientCreditsError(needed=amount, available=pool)
        _team_pools[team_id] = pool - amount
        return CreditService.top_up(user_id, amount, reason=f"team_pool:{team_id}")

    @staticmethod
    def get_pool_balance(team_id: str) -> float:
        return _team_pools.get(team_id, 0.0)

# ─── Low-balance check (used by frontend via API) ─────────────────────────────

LOW_BALANCE_THRESHOLD = 2.0

def is_low_balance(user_id: str) -> bool:
    return _get_balance(user_id) <= LOW_BALANCE_THRESHOLD
