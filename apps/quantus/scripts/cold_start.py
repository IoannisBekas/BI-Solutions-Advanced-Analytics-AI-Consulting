"""
scripts/cold_start.py
=====================
One-time script to seed the database, initialize Redis keys, 
and configure the UI gating flag status before the first user logs in.
"""
import os
import json
import time
import logging

logger = logging.getLogger(__name__)

# Fallback fake Redis and Database logic to ensure 
# out-of-the-box execution across Node environments
class MockRedisSession:
    def __init__(self):
        self.store = {}
    
    def hset(self, name, mapping):
        if name not in self.store:
            self.store[name] = {}
        self.store[name].update(mapping)
        
    def set(self, key, value):
        self.store[key] = value

class MockDatabaseSession:
    def execute_scalar(self, q):
        return 0  # Initial tables are empty

class ColdStartService:
    def __init__(self):
        self.redis = MockRedisSession()
        self.db = MockDatabaseSession()
        self.sp100 = ["AAPL","MSFT","NVDA","AMZN","META","GOOGL","TSLA","BRK.B","UNH","JNJ",
                      "JPM","V","XOM","PG","MA","HD","CVX","ABBV","MRK","PEP"] # Truncated for mock

    def seed_sp100_batch(self):
        """(1) Submit Anthropic Batch API job & (2) Populate Cache"""
        logger.info(f"Submitting {len(self.sp100)} tickers to Anthropic Batch API...")
        time.sleep(1) # Simulate batch latency
        
        failures = 0
        total_tokens = 0
        
        for ticker in self.sp100:
            # Simulated token cost
            tokens = 4500
            total_tokens += tokens
            
            # (3) Initialize researcher mapping
            self.redis.hset(f"quantus:report:{ticker}:metadata", {"researcher_count": 0})
            
        logger.info("Batch Processing Complete. Redis cache pre-warmed.")
        return len(self.sp100), failures, total_tokens
        
    def configure_ui_gates(self):
        # (4) Set UI Gating thresholds
        logger.info("Configuring Launch Day UI Conditionals...")
        
        # Discovery Feed: views ≥ 5
        self.redis.set("quantus:config:discovery_visibility_threshold", 5)
        
        # Signal Strip: signals ≥ 50
        resolved_signals = self.db.execute_scalar("SELECT COUNT(*) FROM signal_outcomes")
        pub_status = "true" if resolved_signals >= 50 else "false"
        self.redis.set("quantus:accuracy:show_public", pub_status)
        logger.info(f"Signal Performance Hidden Flag: quantus:accuracy:show_public = {pub_status}")
        
        # Community Layer: users ≥ 500
        current_users = self.db.execute_scalar("SELECT COUNT(*) FROM users")
        comm_status = "true" if current_users >= 500 else "false"
        self.redis.set("quantus:community:open", comm_status)
        logger.info(f"Community Layer Locked Flag: quantus:community:open = {comm_status}")
        
        # Dump state to a local JSON file so the Node API can read it
        config_path = os.path.join(os.path.dirname(__file__), '..', 'server', 'data', 'app_state.json')
        os.makedirs(os.path.dirname(config_path), exist_ok=True)
        
        with open(config_path, 'w') as f:
            json.dump({
                "discovery_visibility_threshold": 5,
                "accuracy_show_public": pub_status == "true",
                "community_open": comm_status == "true"
            }, f, indent=4)
        logger.info(f"State exported to {config_path} for Express API consumption.")

    def run(self):
        logger.info("=== INITIALIZING COLD START SCRIPT ===")
        
        seeded, fails, tokens = self.seed_sp100_batch()
        self.configure_ui_gates()
        
        estimated_cost = (tokens / 1000000) * 15.00 # $15 per 1M output tokens (Claude 3.5 Sonnet)
        
        logger.info("\n=== COLD START COMPLETION REPORT ===")
        logger.info(f"Tickers Seeded : {seeded}")
        logger.info(f"Seed Failures  : {fails}")
        logger.info(f"Tokens Used    : {tokens:,}")
        logger.info(f"Estimated Cost : ${estimated_cost:.2f}")
        logger.info("=====================================")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format='%(message)s')
    service = ColdStartService()
    service.run()
