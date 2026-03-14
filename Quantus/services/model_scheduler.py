"""
services/model_scheduler.py
===========================
Weekly Retraining Scheduler for LSTM Models. Track model versions in PostgreSQL.
Runs in the 11pm-5am Batch API window.
"""
import os
import logging
from datetime import datetime
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    HAS_DB = True
except ImportError:
    HAS_DB = False

from models.lstm_trainer import LSTMTrainer

logger = logging.getLogger(__name__)

class ModelScheduler:
    def __init__(self):
        self.db_url = os.environ.get("DATABASE_URL")
        self.conn = None
        self._initialize_db()

    def _initialize_db(self):
        if self.db_url and HAS_DB:
            try:
                self.conn = psycopg2.connect(self.db_url, cursor_factory=RealDictCursor)
                self._create_tables()
            except Exception as e:
                logger.warning(f"Failed to connect to database for model versions: {e}")
                self.conn = None

    def _create_tables(self):
        if not self.conn:
            return
        with self.conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS model_versions (
                    id SERIAL PRIMARY KEY,
                    version VARCHAR(50) NOT NULL,
                    asset_class VARCHAR(50) NOT NULL,
                    trained_at TIMESTAMP NOT NULL,
                    accuracy_30d FLOAT NOT NULL,
                    sample_size INT NOT NULL,
                    is_active BOOLEAN DEFAULT false,
                    UNIQUE(version, asset_class)
                )
            """)
            self.conn.commit()

    def _record_version(self, result: dict):
        if not self.conn:
            logger.info(f"Mock Recording Model Version: {result}")
            return
            
        with self.conn.cursor() as cur:
            # Deactivate older models for this asset class
            cur.execute("""
                UPDATE model_versions SET is_active = false 
                WHERE asset_class = %s
            """, (result['asset_class'],))
            
            # Insert the newly trained model
            cur.execute("""
                INSERT INTO model_versions 
                (version, asset_class, trained_at, accuracy_30d, sample_size, is_active)
                VALUES (%s, %s, %s, %s, %s, true)
            """, (
                result['version'], 
                result['asset_class'], 
                result['trained_at'], 
                result['accuracy_30d'], 
                result['sample_size']
            ))
            self.conn.commit()
            logger.info(f"Recorded new model version {result['version']} for {result['asset_class']} to DB.")

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
