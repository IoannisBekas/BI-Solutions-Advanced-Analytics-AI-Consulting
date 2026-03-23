"""
api/community.py
==================
Community Layer — per-report section comment threads with moderation.

Rules:
- Read  access: all (FREE, unauthenticated)
- Write access: verified email minimum (UNLOCKED+)
- Institutional badge: INSTITUTIONAL tier only
- Comments are AI-moderated first; flagged → human review queue only
- Community tab hidden to all until registered_user_count >= 500
- Proprietary signals: high volume → "high analyst interest" flag
  consistent disagreement → confidence score adjustment (logged)
"""

from __future__ import annotations

import time
import uuid
import logging
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional

logger = logging.getLogger(__name__)

# ─── Config ───────────────────────────────────────────────────────────────────

COMMUNITY_UNLOCK_THRESHOLD = 500   # registered users required to open community
DISAGREEMENT_THRESHOLD     = 0.60  # ≥60% disagree comments → confidence adj.
HIGH_INTEREST_THRESHOLD    = 10    # ≥10 comments on section → "high interest" flag
CONFIDENCE_ADJ_MAX         = -5.0  # max adjustment from community disagreement

# ─── Types ────────────────────────────────────────────────────────────────────

class CommentAnchor(str, Enum):
    SECTION_A  = "A"
    SECTION_B  = "B"
    SECTION_C  = "C"
    SECTION_D  = "D"
    SECTION_E  = "E"
    DEEP_DIVE  = "deep_dive"  # module-specific: "deep_dive:7"

class ModerationStatus(str, Enum):
    APPROVED   = "approved"
    PENDING    = "pending"    # awaiting human review
    REJECTED   = "rejected"
    FLAGGED    = "flagged"    # AI flagged, queued for human review

@dataclass
class Comment:
    id:          str
    report_id:   str
    anchor:      str
    author_id:   str
    author_name: str
    author_tier: str                  # FREE / UNLOCKED / INSTITUTIONAL
    body:        str
    upvotes:     int                  = 0
    downvotes:   int                  = 0
    flag_reason: Optional[str]        = None
    status:      ModerationStatus     = ModerationStatus.PENDING
    created_at:  float                = field(default_factory=time.time)
    is_disagreement: bool             = False  # extracted by AI pass

@dataclass
class ModerationQueueItem:
    comment_id:  str
    reason:      str
    ai_score:    float   # 0–1 confidence of policy violation
    created_at:  float   = field(default_factory=time.time)

# ─── In-memory stores ────────────────────────────────────────────────────────

_comments:   dict[str, Comment]              = {}  # comment_id → Comment
_votes:      dict[str, set[str]]             = {}  # comment_id → set of user_ids who voted
_mod_queue:  list[ModerationQueueItem]       = []
_user_count: int                             = 0   # updated by auth service

# ─── AI moderation (stub) ─────────────────────────────────────────────────────

_MISLEADING_PATTERNS = [
    "guaranteed return", "get rich", "100% sure", "certain profit",
    "risk-free", "never lose", "buy now before",
]

def _ai_moderate(body: str) -> tuple[bool, str, float]:
    """
    Returns (is_flagged, reason, confidence_0_to_1).
    Production: call Claude or fine-tuned classifier.
    """
    body_lower = body.lower()
    for pattern in _MISLEADING_PATTERNS:
        if pattern in body_lower:
            return True, f"Potentially misleading financial claim: '{pattern}'", 0.85
    # Rough heuristic: very short comments are not flagged
    if len(body.strip()) < 10:
        return True, "Comment too short to be substantive", 0.6
    return False, "", 0.0

def _extract_disagreement(body: str) -> bool:
    """Heuristic: does this comment disagree with the signal?"""
    disagree_tokens = ["disagree", "wrong", "overvalued", "too high", "sell",
                       "short", "missed", "incorrect", "bearish", "overpriced"]
    return any(t in body.lower() for t in disagree_tokens)

# ─── Community operations ─────────────────────────────────────────────────────

class CommunityService:

    @staticmethod
    def is_open() -> bool:
        return _user_count >= COMMUNITY_UNLOCK_THRESHOLD

    @staticmethod
    def set_user_count(n: int) -> None:
        global _user_count
        _user_count = n

    @staticmethod
    def post_comment(
        report_id:   str,
        anchor:      str,
        author_id:   str,
        author_name: str,
        author_tier: str,
        body:        str,
    ) -> Comment:
        """Post a comment. Runs AI moderation pass before storing.
        Flagged comments go to manual review queue — NEVER auto-published."""

        flagged, flag_reason, ai_score = _ai_moderate(body)
        is_disagree = _extract_disagreement(body)

        status = ModerationStatus.FLAGGED if flagged else ModerationStatus.APPROVED
        comment = Comment(
            id=str(uuid.uuid4()),
            report_id=report_id,
            anchor=anchor,
            author_id=author_id,
            author_name=author_name,
            author_tier=author_tier,
            body=body,
            flag_reason=flag_reason if flagged else None,
            status=status,
            is_disagreement=is_disagree,
        )
        _comments[comment.id] = comment

        if flagged:
            _mod_queue.append(ModerationQueueItem(
                comment_id=comment.id,
                reason=flag_reason,
                ai_score=ai_score,
            ))
            logger.info("comment_flagged | id=%s | reason=%s", comment.id, flag_reason)

        # Update community property signals
        CommunityService._update_signals(report_id, anchor)
        return comment

    @staticmethod
    def get_comments(report_id: str, anchor: str | None = None) -> list[Comment]:
        """Return visible (approved) comments for a report/anchor."""
        return [
            c for c in _comments.values()
            if c.report_id == report_id
            and (anchor is None or c.anchor == anchor)
            and c.status == ModerationStatus.APPROVED
        ]

    @staticmethod
    def vote(comment_id: str, user_id: str, direction: str) -> Comment | None:
        """Upvote or downvote. Each user can vote once per comment."""
        c = _comments.get(comment_id)
        if not c or c.status != ModerationStatus.APPROVED:
            return None
        voters = _votes.setdefault(comment_id, set())
        if user_id in voters:
            return c  # already voted
        voters.add(user_id)
        if direction == 'up':
            c.upvotes += 1
        else:
            c.downvotes += 1
        return c

    @staticmethod
    def get_moderation_queue() -> list[ModerationQueueItem]:
        return sorted(_mod_queue, key=lambda x: x.created_at)

    @staticmethod
    def moderate_decision(comment_id: str, decision: str, operator_id: str) -> None:
        """Operator approves or rejects a flagged comment."""
        c = _comments.get(comment_id)
        if not c:
            return
        c.status = ModerationStatus.APPROVED if decision == 'approve' else ModerationStatus.REJECTED
        _mod_queue[:] = [m for m in _mod_queue if m.comment_id != comment_id]
        logger.info("moderation | comment=%s | decision=%s | operator=%s", comment_id, decision, operator_id)
        CommunityService._update_signals(c.report_id, c.anchor)

    # ── Proprietary community signals ─────────────────────────────────────────

    @staticmethod
    def _update_signals(report_id: str, anchor: str) -> None:
        """Recalculate community signals for a report section after any change."""
        section_comments = CommunityService.get_comments(report_id, anchor)
        count = len(section_comments)

        # High analyst interest flag
        high_interest = count >= HIGH_INTEREST_THRESHOLD
        if high_interest:
            logger.info("community_signal | high_interest | report=%s anchor=%s count=%d",
                        report_id, anchor, count)

        # Consistent disagreement → confidence adjustment
        disagree_count = sum(1 for c in section_comments if c.is_disagreement)
        if count > 0:
            disagree_ratio = disagree_count / count
            if disagree_ratio >= DISAGREEMENT_THRESHOLD and count >= 5:
                adj = round(CONFIDENCE_ADJ_MAX * disagree_ratio, 2)
                logger.info("community_signal | confidence_adj | report=%s anchor=%s adj=%.2f ratio=%.2f",
                            report_id, anchor, adj, disagree_ratio)

    @staticmethod
    def get_section_signals(report_id: str) -> dict[str, dict]:
        """
        Return community signals per section for injection into report header.
        {
          "A": {"high_interest": True, "disagree_ratio": 0.65, "confidence_adj": -3.25, "comment_count": 12},
          ...
        }
        """
        signals: dict[str, dict] = {}
        anchors = {c.anchor for c in _comments.values() if c.report_id == report_id}
        for anchor in anchors:
            section_comments = CommunityService.get_comments(report_id, anchor)
            count = len(section_comments)
            disagree = sum(1 for c in section_comments if c.is_disagreement)
            ratio = disagree / count if count > 0 else 0.0
            adj   = round(CONFIDENCE_ADJ_MAX * ratio, 2) if (ratio >= DISAGREEMENT_THRESHOLD and count >= 5) else 0.0
            signals[anchor] = {
                "high_interest": count >= HIGH_INTEREST_THRESHOLD,
                "disagree_ratio": round(ratio, 3),
                "confidence_adj": adj,
                "comment_count":  count,
            }
        return signals
