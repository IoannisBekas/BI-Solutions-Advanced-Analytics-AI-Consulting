"""
services/personalization.py
===========================
Ingests frontend telemetry (e.g., searches, module clicks) to track user activity.
Future state: feeds Quantus recommendations & reinforcement learning pipelines.
"""
import logging
import uuid
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

# In-memory event store
_EVENT_STORE = []

class EventTrackerService:
    def __init__(self):
        pass

    def track_event(self, user_id: str, event_type: str, event_data: dict) -> bool:
        """
        Record a telemetry event.
        """
        if not user_id or not event_type:
            logger.error("Missing required fields for event tracking.")
            return False

        logger.info(f"Tracking event [{event_type}] for user {user_id[:8]}... Data: {event_data}")

        _EVENT_STORE.append({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "event_type": event_type,
            "event_data": event_data,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        return True

    def get_recent_events(self, limit: int = 50):
        """Return recent tracked events."""
        return _EVENT_STORE[-limit:]

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
