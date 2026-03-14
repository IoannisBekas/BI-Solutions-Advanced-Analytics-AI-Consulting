"""
services/knowledge_graph.py
===========================
Knowledge Graph & Intelligence Layer.

Connects to Supabase/pgvector to store relationships between tickers and their
vector embeddings for semantic search and cross-ticker intelligence.
"""
import os
import json
import logging
import datetime
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional, Any

# Optional dependencies based on environment
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    from pgvector.psycopg2 import register_vector
    HAS_PGVECTOR = True
except ImportError:
    HAS_PGVECTOR = False

logger = logging.getLogger(__name__)

# Fallback for local testing
_MOCK_STORE = {
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
        self.db_url = os.environ.get("DATABASE_URL")
        self.conn = None
        self._initialize_db()

    def _initialize_db(self):
        """Initialize connection to PostgreSQL and register pgvector."""
        if self.db_url and HAS_PGVECTOR:
            try:
                self.conn = psycopg2.connect(self.db_url, cursor_factory=RealDictCursor)
                register_vector(self.conn)
                self._create_tables()
                logger.info("Connected to pgvector database.")
            except Exception as e:
                logger.warning(f"Failed to connect to database: {e}. Using in-memory mock store.")
                self.conn = None
        else:
            logger.info("DATABASE_URL not set or pgvector missing. Using in-memory mock store.")

    def _create_tables(self):
        """Initialize required pgvector tables if they do not exist."""
        if not self.conn:
            return
            
        with self.conn.cursor() as cur:
            cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
            cur.execute("""
                CREATE TABLE IF NOT EXISTS ticker_relationships (
                    id SERIAL PRIMARY KEY,
                    source_ticker VARCHAR(10) NOT NULL,
                    target_ticker VARCHAR(10) NOT NULL,
                    relationship_type VARCHAR(50) NOT NULL,
                    metadata JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(source_ticker, target_ticker, relationship_type)
                )
            """)
            # Assuming ~1536 dim for OpenAI or 768 for FinBERT embedding sizes. Using 768 as default.
            cur.execute("""
                CREATE TABLE IF NOT EXISTS report_embeddings (
                    report_id VARCHAR(50) PRIMARY KEY,
                    ticker VARCHAR(10) NOT NULL,
                    embedding vector(768),
                    narrative_text TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            self.conn.commit()

    def add_relationship(self, rel: TickerRelationship) -> None:
        if self.conn:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO ticker_relationships (source_ticker, target_ticker, relationship_type, metadata)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (source_ticker, target_ticker, relationship_type) 
                    DO UPDATE SET metadata = EXCLUDED.metadata
                """, (rel.source_ticker, rel.target_ticker, rel.relationship_type, json.dumps(rel.metadata)))
            self.conn.commit()
        else:
            _MOCK_STORE["relationships"].append(asdict(rel))

    def get_related_tickers(self, ticker: str) -> List[Dict[str, Any]]:
        """Returns suppliers, customers, competitors, ETF memberships."""
        if self.conn:
            with self.conn.cursor() as cur:
                cur.execute("""
                    SELECT target_ticker, relationship_type, metadata 
                    FROM ticker_relationships 
                    WHERE source_ticker = %s
                """, (ticker.upper(),))
                return cur.fetchall()
        else:
            return [r for r in _MOCK_STORE["relationships"] if r["source_ticker"] == ticker.upper()]

    def store_report_embedding(self, report_id: str, ticker: str, narrative_text: str, embedding: List[float]) -> None:
        """Store narrative as a vector embedding."""
        if self.conn:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO report_embeddings (report_id, ticker, narrative_text, embedding)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (report_id) DO UPDATE SET embedding = EXCLUDED.embedding
                """, (report_id, ticker.upper(), narrative_text, embedding))
            self.conn.commit()
        else:
            _MOCK_STORE["embeddings"].append({
                "report_id": report_id,
                "ticker": ticker.upper(),
                "narrative_text": narrative_text,
                "embedding": embedding
            })

    def semantic_search(self, query_embedding: List[float], limit: int = 5) -> List[Dict[str, Any]]:
        """Find reports where narrative is semantically similar."""
        if self.conn:
            with self.conn.cursor() as cur:
                cur.execute("""
                    SELECT report_id, ticker, narrative_text, 
                           1 - (embedding <=> %s::vector) AS similarity 
                    FROM report_embeddings 
                    ORDER BY embedding <=> %s::vector 
                    LIMIT %s
                """, (query_embedding, query_embedding, limit))
                return cur.fetchall()
        else:
            # Mock cosine similarity logic if needed, but for now just return empty
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
