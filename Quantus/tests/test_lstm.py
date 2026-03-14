"""
tests/test_lstm.py
==================
Benchmark test ensuring the TSLA 30-day forecast runs in < 5 seconds.
"""
import time
import unittest
from models.lstm_trainer import LSTMInference, LSTMTrainer

class TestLSTMPipeline(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        # Ensure we have at least one saved model to test with
        trainer = LSTMTrainer()
        trainer.train("equity", "test-1.0")

    def test_tsla_inference_speed(self):
        """Test confirming TSLA forecast runs in <5 seconds using the saved model."""
        start = time.time()
        
        # 1. Load model
        # 2. Provide mocked 14-feature input array
        mock_features = [150.5, 155.2, 149.8, 154.1, 12000450, 45.2, 1.2, -0.5, 150, 160, 140, 0.4, 0.05, 1.0]
        
        result = LSTMInference.predict("equity", mock_features)
        
        elapsed = time.time() - start
        
        print(f"\n--- TSLA Forecast Result ---")
        print(f"Forecast: {result['forecast_30d_pct']}%")
        print(f"Confidence: {result['confidence_score']}%")
        print(f"Time Taken: {elapsed:.4f} seconds")
        
        self.assertLess(elapsed, 5.0, "Inference took longer than 5 seconds!")
        self.assertIn("forecast_30d_pct", result)
        self.assertIn("confidence_score", result)

if __name__ == '__main__':
    unittest.main()
