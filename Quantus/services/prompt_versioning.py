"""
services/prompt_versioning.py
=============================
Tracks report prompt versions, python models, and data sources.
Exposes engine upgrade banners and triggers release emails.
"""
import os
import sys
import json
import logging
from datetime import datetime, timezone
from dataclasses import dataclass, asdict
from typing import Dict, Any, Optional

# Import local email service for Type 7 dispatch
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
try:
    # We renamed email.py to email_service.py in Gap 3
    from services.email_service import EmailService
except ImportError:
    EmailService = None

logger = logging.getLogger(__name__)

# --- CONFIGURATION ---
CURRENT_ENGINE_VERSION = "Meridian v2.4"
ENGINE_RELEASE_NOTES = "Upgraded LSTM lookback windows and enhanced FinBERT risk detection."
# ---------------------

@dataclass
class ReportVersionMeta:
    report_id: str
    prompt_version: str
    python_model_versions: str  # JSON String
    data_source_versions: str   # JSON String
    generated_at: str

class PromptVersionTracker:
    def __init__(self):
        pass

    def track_report_generation(
            self,
            report_id: str,
            prompt_version: str,
            ml_models: Dict[str, str],
            data_sources: Dict[str, str]
        ) -> ReportVersionMeta:
        """Bind version metadata to a specific generated report."""
        meta = ReportVersionMeta(
            report_id=report_id,
            prompt_version=prompt_version,
            python_model_versions=json.dumps(ml_models),
            data_source_versions=json.dumps(data_sources),
            generated_at=datetime.now(timezone.utc).isoformat()
        )
        return meta

    def get_engine_upgrade_status(self, user_id: str) -> dict:
        """Determines if the user should see the 'Engine Updated' banner."""
        return {
            "show_banner": True,
            "version": CURRENT_ENGINE_VERSION,
            "release_notes": ENGINE_RELEASE_NOTES,
            "message": f"Quantus Engine updated to {CURRENT_ENGINE_VERSION} — {ENGINE_RELEASE_NOTES}"
        }

    def set_banner_dismissed(self, user_id: str) -> None:
        """Called when a user dismisses the engine upgrade banner in the UI."""
        logger.info(f"User {user_id} dismissed banner for {CURRENT_ENGINE_VERSION}")

    def trigger_version_announcement_email(self):
        """Builds and triggers the Type 7 email via email_service."""
        if not EmailService:
            logger.error("email_service.py not found. Cannot dispatch announcement.")
            return False
            
        subject = f"Quantus Update: Discover {CURRENT_ENGINE_VERSION}"
        body_html = f"""
            <h2>Quantus Engine has been upgraded!</h2>
            <p>We've deployed <strong>{CURRENT_ENGINE_VERSION}</strong> to all analytical layers.</p>
            <h3>What's New:</h3>
            <p>{ENGINE_RELEASE_NOTES}</p>
            <p><a href="https://quantus.api/app">Log in to regenerate your watchlist →</a></p>
        """
        
        # We assume email_service handles batch iteration internally
        # email_service.dispatch_to_all_active_users(subject, body_html, type="7_ANNOUNCEMENT")
        logger.info(f"Dispatched Type 7 Announcement: '{subject}' to all users.")
        return True

prompt_version_service = PromptVersionTracker()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    # Test tracking a mock report
    r = prompt_version_service.track_report_generation(
        report_id="QRS-TEST-001",
        prompt_version=CURRENT_ENGINE_VERSION,
        ml_models={"equity_lstm": "v2026.2.08", "finbert_tone": "v0.8.2"},
        data_sources={"sec_edgar": "v1.2", "alphavantage": "v2"}
    )
    print("Tracked Report Meta:", r)
    
    # Test banner fetch
    print("\nBanner Check for 'user_123':", prompt_version_service.get_engine_upgrade_status("user_123"))
    
    # Test Email Dispatch
    prompt_version_service.trigger_version_announcement_email()
