"""
services/model_scheduler.py
===========================
Weekly Retraining Scheduler for LSTM Models.
Runs in the 11pm-5am Batch API window.
"""
import logging
from datetime import datetime

from models.lstm_trainer import LSTMTrainer

logger = logging.getLogger(__name__)

class ModelScheduler:
    def __init__(self):
        pass

    def _record_version(self, result: dict):
        logger.info(f"Recording Model Version: {result}")

    def run_weekly_retraining(self):
        """
        Triggered by external Cron/Celery at 11pm on Sundays.
        Generates a new semantic version based on date.
        """
        now = datetime.now()
        version_tag = f"v{now.year}.{now.month}.{now.strftime('%U')}" # e.g. v2026.2.08
        
        logger.info(f"Starting Weekly LSTM Retraining Job -> Version {version_tag}")
        
        trainer = LSTMTrainer()
        
        for asset_class in ["equity", "crypto", "commodity"]:
            try:
                result = trainer.train(asset_class, version_tag)
                self._record_version(result)
            except Exception as e:
                logger.error(f"Failed to train model for {asset_class}: {e}")
                
        logger.info("Weekly Retraining Job Completed.")

# Expose singleton
model_scheduler = ModelScheduler()
