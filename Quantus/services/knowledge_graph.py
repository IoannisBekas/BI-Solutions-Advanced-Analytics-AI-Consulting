"""
services/knowledge_graph.py
===========================
Knowledge Graph & Intelligence Layer.

Stores relationships between tickers and their vector embeddings
for semantic search and cross-ticker intelligence.
"""
import logging
import datetime
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional, Any

logger = logging.getLogger(__name__)

# In-memory store
_STORE = {
    "relationships": [],
    "embeddings": []
}

@dataclass
class TickerRelationship:
    source_ticker: str
    target_ticker: str
    relationship_type: str  # Competitor, Supplier, Customer, ETF constituent, Index constituent, Sector peer
    metadata: Dict[str, Any]

@dataclass
class CrossTickerAlert:
    primary_ticker: str
    related_ticker: str
    relationship: str
    event: str
    impact_assessment: str
    created_at: str

class KnowledgeGraphService:
    def __init__(self):
        pass

    def add_relationship(self, rel: TickerRelationship) -> None:
        _STORE["relationships"].append(asdict(rel))

    def get_related_tickers(self, ticker: str) -> List[Dict[str, Any]]:
        """Returns suppliers, customers, competitors, ETF memberships."""
        return [r for r in _STORE["relationships"] if r["source_ticker"] == ticker.upper()]

    def store_report_embedding(self, report_id: str, ticker: str, narrative_text: str, embedding: List[float]) -> None:
        """Store narrative as a vector embedding."""
        _STORE["embeddings"].append({
            "report_id": report_id,
            "ticker": ticker.upper(),
            "narrative_text": narrative_text,
            "embedding": embedding
        })

    def semantic_search(self, query_embedding: List[float], limit: int = 5) -> List[Dict[str, Any]]:
        """Find reports where narrative is semantically similar."""
        return []

    def process_material_event(self, ticker: str, event_description: str) -> List[CrossTickerAlert]:
        """Automated cross-ticker intelligence."""
        related = self.get_related_tickers(ticker)
        alerts = []
        for rel in related:
            target = rel.get("target_ticker")
            rtype = rel.get("relationship_type")
            
            # Simple heuristic mock - in production this would run through an LLM prompt
            impact = f"Potential impact on {target} due to its {rtype} relationship with {ticker}."
            
            alerts.append(CrossTickerAlert(
                primary_ticker=ticker,
                related_ticker=target,
                relationship=rtype,
                event=event_description,
                impact_assessment=impact,
                created_at=datetime.datetime.utcnow().isoformat()
            ))
            
        return alerts

    def seed_initial_relationships(self):
        """Seed S&P 100 tickers using FMP data (Mocked)."""
        logger.info("Seeding initial relationships...")
        mocks = [
            TickerRelationship("AAPL", "TSMC", "Supplier", {"tier": 1}),
            TickerRelationship("TSLA", "PANW", "Competitor", {"competitor_type": "indirect"}),
            TickerRelationship("NVDA", "TSMC", "Customer", {"dependency_weight": 0.8}),
            TickerRelationship("AAPL", "QQQ", "ETF constituent", {"weight": 0.11}),
        ]
        for m in mocks:
            self.add_relationship(m)
        logger.info("Seeding complete.")

# Singleton instance
kg_service = KnowledgeGraphService()
