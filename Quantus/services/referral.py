"""
services/referral.py
=====================
Referral program — Quantus Research Solutions.

Every shared report URL embeds a referral token:
  bisolutions.group/report/{report_id}?ref={token}

When a new user signs up via that URL:
  - Referral is attributed to the token owner
  - Referrer earns 5 credits immediately
  - Attribution stored in PostgreSQL referrals table

Schema (production PostgreSQL):
  CREATE TABLE referrals (
    id            SERIAL PRIMARY KEY,
    referrer_id   TEXT NOT NULL,
    referred_id   TEXT NOT NULL,
    token         TEXT NOT NULL UNIQUE,
    report_id     TEXT,
    credited_at   TIMESTAMPTZ,
    credits_earned NUMERIC(10,4) DEFAULT 5,
    created_at    TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX ON referrals (referrer_id);
  CREATE INDEX ON referrals (token);
"""

from __future__ import annotations

import hashlib
import logging
import secrets
import uuid
from datetime import datetime, timezone
from typing import Optional

from services.credits import CreditService

logger = logging.getLogger(__name__)

# ─── Constants ────────────────────────────────────────────────────────────────

REFERRAL_CREDIT_REWARD = 5.0

# ─── In-memory store (replace with PostgreSQL) ───────────────────────────────

_tokens:   dict[str, str] = {}     # token → referrer_user_id
_referrals: list[dict]    = []     # full attribution log

# ─── Token helpers ────────────────────────────────────────────────────────────

def generate_referral_token(user_id: str) -> str:
    """Generate a deterministic but unguessable referral token for user_id."""
    raw = f"{user_id}:{secrets.token_hex(8)}"
    token = hashlib.sha256(raw.encode()).hexdigest()[:16]
    _tokens[token] = user_id
    return token

def make_referral_url(report_id: str, token: str, base: str = "https://bisolutions.group/report") -> str:
    return f"{base}/{report_id}?ref={token}"

# ─── Attribution ──────────────────────────────────────────────────────────────

class ReferralService:
    """Handle referral attribution and credit rewards."""

    @staticmethod
    def register_token(user_id: str) -> str:
        """Create and store a referral token for user. Returns token."""
        token = generate_referral_token(user_id)
        logger.info("referral_token | user=%s | token=%s", user_id, token)
        return token

    @staticmethod
    def get_referrer(token: str) -> str | None:
        """Look up which user owns a referral token."""
        return _tokens.get(token)

    @staticmethod
    def attribute_signup(
        referred_user_id: str,
        token: str,
        report_id: str | None = None,
        referrer_tier: str = "UNLOCKED",
    ) -> dict | None:
        """Called when a new user signs up via a referral link.

        - Validates token → referrer
        - Prevents self-referral
        - Awards REFERRAL_CREDIT_REWARD credits to referrer
        - Records attribution

        Returns attribution record, or None if invalid.
        """
        referrer_id = ReferralService.get_referrer(token)
        if not referrer_id:
            logger.warning("referral | unknown token=%s", token)
            return None

        if referrer_id == referred_user_id:
            logger.warning("referral | self-referral blocked | user=%s", referred_user_id)
            return None

        # Check for duplicate attribution (token already claimed)
        already = any(r["token"] == token and r["referred_id"] == referred_user_id for r in _referrals)
        if already:
            logger.info("referral | duplicate attribution skipped | token=%s", token)
            return None

        # Award credits
        new_balance = CreditService.top_up(
            referrer_id,
            REFERRAL_CREDIT_REWARD,
            reason=f"referral_signup:{referred_user_id}",
        )

        record = {
            "id":            str(uuid.uuid4()),
            "referrer_id":   referrer_id,
            "referred_id":   referred_user_id,
            "token":         token,
            "report_id":     report_id,
            "credits_earned": REFERRAL_CREDIT_REWARD,
            "referrer_balance_after": new_balance,
            "credited_at":   datetime.now(timezone.utc).isoformat(),
        }
        _referrals.append(record)
        logger.info("referral | attributed | referrer=%s +%.0f credits | referred=%s",
                    referrer_id, REFERRAL_CREDIT_REWARD, referred_user_id)
        return record

    @staticmethod
    def get_user_referrals(user_id: str) -> list[dict]:
        """Return all referrals where user_id is the referrer."""
        return [r for r in _referrals if r["referrer_id"] == user_id]

    @staticmethod
    def get_referral_stats(user_id: str) -> dict:
        """Summary stats for the settings page."""
        user_refs  = ReferralService.get_user_referrals(user_id)
        total_earned = sum(r["credits_earned"] for r in user_refs)
        return {
            "total_referrals": len(user_refs),
            "total_credits_earned": total_earned,
            "referrals": user_refs,
        }
