"""
services/explainability.py
==========================
Translates complex institutional quantitative outputs into simple string explanations (ELI5).
Acts as an abstraction layer over an LLM provider (e.g., Gemini / Claude).
"""
import logging
import time

logger = logging.getLogger(__name__)

# Fallback mocked translations to avoid burning API tokens during dev/tests
_MOCK_TRANSLATION_DICT = {
    "regime_mean_reverting": "The stock price has dropped or surged much faster than usual, and our models think it's about to bounce back to its average price.",
    "macd_divergence": "The stock's momentum is slowing down even as the price edges higher, which often signals a trend reversal is coming.",
    "var_high": "This asset is currently very volatile. In a worst-case scenario, our models estimate it could drop significantly more than an average stock.",
    "lstm_confidence_band_wide": "Our AI prediction model is highly uncertain right now because recent market movements have been chaotic. Expect wild price swings.",
    "default": "This is a complex quantitative metric. In simple terms: it tracks the mathematical patterns of how buyers and sellers are behaving right now."
}

class ExplainabilityService:
    def __init__(self, use_mock: bool = True):
        self.use_mock = use_mock
        # In prod, initialize `google.generativeai` client here

    def generate_explanation(self, context_string: str, target_audience: str = "retail_beginner") -> str:
        """
        Takes a complex string like 'Vol-adjusted MACD divergence on 4H' 
        and returns a retail-friendly translation.
        """
        logger.info(f"Generating '{target_audience}' explanation for: {context_string[:30]}...")
        
        if self.use_mock:
            # Simulate LLM latency
            time.sleep(0.5)
            
            # Simple keyword matching for the mock
            ctx_lower = context_string.lower()
            if "regime" in ctx_lower and "reverting" in ctx_lower:
                return _MOCK_TRANSLATION_DICT["regime_mean_reverting"]
            elif "macd" in ctx_lower and "divergence" in ctx_lower:
                return _MOCK_TRANSLATION_DICT["macd_divergence"]
            elif "var" in ctx_lower or "value at risk" in ctx_lower:
                return _MOCK_TRANSLATION_DICT["var_high"]
            elif "lstm" in ctx_lower or "confidence band" in ctx_lower:
                return _MOCK_TRANSLATION_DICT["lstm_confidence_band_wide"]
            else:
                # Use default, appending a bit of the original text to make it look dynamic
                return _MOCK_TRANSLATION_DICT["default"]
                
        else:
            # PROD: Build prompt:
            # "You are a financial educator. Translate the following institutional trading 
            # signal into a single, easy-to-understand sentence for a {target_audience}. 
            # Signal: {context_string}"
            # 
            # return llm.generate_content(prompt).text
            pass

explain_service = ExplainabilityService(use_mock=True)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logger.info("Testing Explainability Engine")
    
    test_cases = [
        "The current regime is Mean-Reverting.",
        "Significant MACD divergence detected.",
        "VaR is elevated above 95th percentile.",
        "Unrelated generic market data metric."
    ]
    
    for t in test_cases:
        res = explain_service.generate_explanation(t)
        logger.info(f"Original: {t}")
        logger.info(f"Explained: {res}\n")
