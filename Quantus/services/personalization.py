"""
services/personalization.py
===========================
Ingests frontend telemetry (e.g., searches, module clicks) to track user activity.
Future state: feeds Quantus recommendations & reinforcement learning pipelines.
"""
import os
import json
import logging
import uuid
from datetime import datetime, timezone

try:
    import psycopg2
    from psycopg2.extras import Json
    HAS_DB = True
except ImportError:
    HAS_DB = False

logger = logging.getLogger(__name__)

# Fallback in-memory store if DB is absent
_MOCK_EVENT_STORE = []

class EventTrackerService:
    def __init__(self):
        self.db_url = os.environ.get("DATABASE_URL")
        self.conn = None
        self._initialize_db()

    def _initialize_db(self):
        if self.db_url and HAS_DB:
            try:
                self.conn = psycopg2.connect(self.db_url)
                self._create_tables()
            except Exception as e:
                logger.warning(f"Failed to connect to PG for Personalization: {e}")
                self.conn = None

    def _create_tables(self):
        if not self.conn:
            return
        with self.conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS user_events (
                    id UUID PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL,
                    event_type VARCHAR(100) NOT NULL,
                    event_data JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            # Create an index for faster ML queries later
            cur.execute("CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id)")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_user_events_type ON user_events(event_type)")
            self.conn.commit()

    def track_event(self, user_id: str, event_type: str, event_data: dict) -> bool:
        """
        Record a telemetry event to the database.
        """
        if not user_id or not event_type:
            logger.error("Missing required fields for event tracking.")
            return False
            
        logger.info(f"Tracking event [{event_type}] for user {user_id[:8]}... Data: {event_data}")

        if self.conn:
            try:
                with self.conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO user_events (id, user_id, event_type, event_data)
                        VALUES (%s, %s, %s, %s)
                    """, (str(uuid.uuid4()), user_id, event_type, Json(event_data)))
                self.conn.commit()
                return True
            except Exception as e:
                logger.error(f"Failed to persist event to PG: {e}")
                
        # Fallback to memory
        _MOCK_EVENT_STORE.append({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "event_type": event_type,
            "event_data": event_data,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        return True

    def get_recent_events(self, limit: int = 50):
        """Mock method strictly to verify logging works during dev"""
        if self.conn:
            with self.conn.cursor() as cur:
                cur.execute("SELECT user_id, event_type, event_data, created_at FROM user_events ORDER BY created_at DESC LIMIT %s", (limit,))
                return cur.fetchall()
        return _MOCK_EVENT_STORE[-limit:]

tracker = EventTrackerService()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logger.info("Testing Personalization Event Tracker")
    
    mock_uid = "anon_" + str(uuid.uuid4())[:8]
    
    # Simulate a user flow
    tracker.track_event(mock_uid, "search_ticker", {"ticker": "NVDA", "source": "hero_search"})
    tracker.track_event(mock_uid, "click_deep_dive", {"module": "Time Series Forecasting", "ticker": "NVDA"})
    
    events = tracker.get_recent_events()
    logger.info(f"Verified {len(events)} events in the datastore.")
