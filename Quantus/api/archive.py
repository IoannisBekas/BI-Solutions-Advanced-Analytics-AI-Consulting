"""
api/archive.py
==============
Historical archive API — read-only report snapshots, semantic search,
accuracy track record.
"""
from __future__ import annotations

import logging
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any

try:
    from services.knowledge_graph import kg_service
except ImportError:
    # Fallback if running outside path
    import sys, os
    sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
    from services.knowledge_graph import kg_service

logger = logging.getLogger(__name__)

# ─── Resolved signal threshold for Accuracy Dashboard ────────────────────────
ACCURACY_UNLOCK_THRESHOLD = 50   # signals with 30-day outcomes measured

# ─── Data models ─────────────────────────────────────────────────────────────

@dataclass
class ReportSnapshot:
    report_id:      str
    ticker:         str
    company:        str
    asset_class:    str
    signal:         str          # STRONG BUY / BUY / NEUTRAL / SELL / STRONG SELL
    confidence:     float
    regime:         str
    sector:         str
    market_cap:     str          # LARGE / MID / SMALL / NANO / CRYPTO
    engine_version: str          # Meridian v2.4 / Atlas
    generated_at:   str          # ISO
    price_at_gen:   float
    has_restatement: bool        = False
    restatement_note: str        = ""
    language:       str          = "en"
    jurisdiction:   str          = "US"
    narrative_summary: str       = ""

@dataclass
class ResolvedSignal:
    """A signal with a 30-day price outcome — used for accuracy scoring."""
    report_id:       str
    ticker:          str
    signal:          str
    confidence:      float
    engine_version:  str
    regime:          str
    sector:          str
    market_cap:      str
    price_at_gen:    float
    price_30d:       float
    return_pct:      float       # (price_30d - price_at_gen) / price_at_gen * 100
    benchmark_return: float      # S&P 500 / BTC / Gold 30d return
    excess_return:   float       # return_pct - benchmark_return
    resolved_at:     str         # ISO

# ─── In-memory store ─────────────────────────────────────────────────────────

_snapshots:       list[ReportSnapshot] = []
_resolved_signals: list[ResolvedSignal] = []

# Seed mock resolved signals for dashboard
def _seed_mock():
    import random, math
    rng = random.Random(42)
    signals = ["STRONG BUY", "BUY", "NEUTRAL", "SELL", "STRONG SELL"]
    engines = ["Meridian v2.4", "Meridian v2.3", "Atlas"]
    regimes = ["Strong Uptrend", "Uptrend", "Sideways", "Downtrend", "High Volatility"]
    sectors = ["Technology", "Healthcare", "Energy", "Financials", "Consumer"]
    caps    = ["LARGE", "MID", "SMALL"]

    for i in range(80):
        sig = signals[i % len(signals)]
        price = rng.uniform(50, 800)
        # Simulate directional accuracy: STRONG BUY → avg +5%, SELL → avg -3%
        drift = {"STRONG BUY": 0.07, "BUY": 0.04, "NEUTRAL": 0.01,
                 "SELL": -0.03, "STRONG SELL": -0.06}.get(sig, 0)
        ret30 = drift + rng.gauss(0, 0.06)
        bench = rng.gauss(0.01, 0.03)
        _resolved_signals.append(ResolvedSignal(
            report_id=f"QRS-{10000+i}",
            ticker=f"TICK{i%12}",
            signal=sig,
            confidence=round(rng.uniform(55, 92), 1),
            engine_version=engines[i % len(engines)],
            regime=regimes[i % len(regimes)],
            sector=sectors[i % len(sectors)],
            market_cap=caps[i % len(caps)],
            price_at_gen=round(price, 2),
            price_30d=round(price * (1 + ret30), 2),
            return_pct=round(ret30 * 100, 2),
            benchmark_return=round(bench * 100, 2),
            excess_return=round((ret30 - bench) * 100, 2),
            resolved_at=(datetime.now(timezone.utc) - timedelta(days=i)).isoformat(),
        ))

_seed_mock()

# ─── Archive service ──────────────────────────────────────────────────────────

class ArchiveService:

    @staticmethod
    def store_snapshot(snap: ReportSnapshot) -> None:
        """Append-only. Never update existing snapshots."""
        _snapshots.append(snap)
        logger.info("archive_store | report=%s ticker=%s", snap.report_id, snap.ticker)

    @staticmethod
    def get_by_id(report_id: str) -> Optional[ReportSnapshot]:
        return next((s for s in _snapshots if s.report_id == report_id), None)

    @staticmethod
    def list_by_ticker(ticker: str) -> list[ReportSnapshot]:
        return sorted(
            [s for s in _snapshots if s.ticker.upper() == ticker.upper()],
            key=lambda s: s.generated_at,
            reverse=True,
        )

    @staticmethod
    def semantic_search(query: str, limit: int = 20) -> list[ReportSnapshot]:
        """Keyword-based search across report snapshots."""
        q = query.lower()
        results = [
            s for s in _snapshots
            if q in s.narrative_summary.lower()
            or q in s.ticker.lower()
            or q in s.signal.lower()
            or q in s.regime.lower()
            or q in s.sector.lower()
        ]
        return results[:limit]

# ─── Knowledge Graph API ──────────────────────────────────────────────────────

class KnowledgeGraphAPI:
    @staticmethod
    def get_related(ticker: str) -> Dict[str, Any]:
        """GET /api/v1/knowledge-graph/{ticker}"""
        raw_relations = kg_service.get_related_tickers(ticker)
        # Group by relationship type
        grouped = {}
        for r in raw_relations:
            rtype = r.get("relationship_type", "Unknown")
            if rtype not in grouped:
                grouped[rtype] = []
            grouped[rtype].append({
                "ticker": r.get("target_ticker"),
                "metadata": r.get("metadata", {})
            })
            
        return {
            "ticker": ticker.upper(),
            "relationships": grouped
        }


    @staticmethod
    def compare(report_id_a: str, report_id_b: str) -> dict:
        """Return field-level diff between two snapshots."""
        a = ArchiveService.get_by_id(report_id_a)
        b = ArchiveService.get_by_id(report_id_b)
        if not a or not b:
            return {}
        fields = ["signal", "confidence", "regime", "engine_version", "language", "jurisdiction"]
        diff = {}
        for f in fields:
            va, vb = getattr(a, f), getattr(b, f)
            diff[f] = {"old": va, "new": vb, "changed": va != vb}
        diff["price_change_pct"] = round(
            (b.price_at_gen - a.price_at_gen) / a.price_at_gen * 100, 2
        ) if a.price_at_gen else 0
        return diff

# ─── Accuracy service ─────────────────────────────────────────────────────────

class AccuracyService:

    @staticmethod
    def is_open() -> bool:
        return len(_resolved_signals) >= ACCURACY_UNLOCK_THRESHOLD

    @staticmethod
    def summary_by_signal() -> list[dict]:
        """Avg return + excess return grouped by signal type."""
        from collections import defaultdict
        buckets: dict[str, list[ResolvedSignal]] = defaultdict(list)
        for s in _resolved_signals:
            buckets[s.signal].append(s)
        result = []
        for sig, items in buckets.items():
            result.append({
                "signal":         sig,
                "count":          len(items),
                "avg_return_pct": round(sum(i.return_pct for i in items) / len(items), 2),
                "avg_excess_pct": round(sum(i.excess_return for i in items) / len(items), 2),
                "win_rate":       round(sum(1 for i in items if i.excess_return > 0) / len(items) * 100, 1),
            })
        return sorted(result, key=lambda r: r["avg_return_pct"], reverse=True)

    @staticmethod
    def summary_by_engine() -> list[dict]:
        from collections import defaultdict
        buckets: dict[str, list[ResolvedSignal]] = defaultdict(list)
        for s in _resolved_signals:
            buckets[s.engine_version].append(s)
        return [
            {
                "engine":         eng,
                "count":          len(items),
                "avg_return_pct": round(sum(i.return_pct for i in items) / len(items), 2),
                "avg_excess_pct": round(sum(i.excess_return for i in items) / len(items), 2),
                "win_rate":       round(sum(1 for i in items if i.excess_return > 0) / len(items) * 100, 1),
            }
            for eng, items in buckets.items()
        ]

    @staticmethod
    def summary_by_regime() -> list[dict]:
        from collections import defaultdict
        buckets: dict[str, list[ResolvedSignal]] = defaultdict(list)
        for s in _resolved_signals:
            buckets[s.regime].append(s)
        return [
            {
                "regime":         regime,
                "count":          len(items),
                "avg_return_pct": round(sum(i.return_pct for i in items) / len(items), 2),
                "avg_excess_pct": round(sum(i.excess_return for i in items) / len(items), 2),
            }
            for regime, items in buckets.items()
        ]

    @staticmethod
    def summary_by_sector() -> list[dict]:
        from collections import defaultdict
        buckets: dict[str, list[ResolvedSignal]] = defaultdict(list)
        for s in _resolved_signals:
            buckets[s.sector].append(s)
        return [
            {
                "sector":         sector,
                "count":          len(items),
                "avg_return_pct": round(sum(i.return_pct for i in items) / len(items), 2),
                "avg_excess_pct": round(sum(i.excess_return for i in items) / len(items), 2),
            }
            for sector, items in buckets.items()
        ]

    @staticmethod
    def summary_by_market_cap() -> list[dict]:
        from collections import defaultdict
        buckets: dict[str, list[ResolvedSignal]] = defaultdict(list)
        for s in _resolved_signals:
            buckets[s.market_cap].append(s)
        return [{"market_cap": mc, "count": len(items),
                 "avg_return_pct": round(sum(i.return_pct for i in items) / len(items), 2),
                 "avg_excess_pct": round(sum(i.excess_return for i in items) / len(items), 2)}
                for mc, items in buckets.items()]
