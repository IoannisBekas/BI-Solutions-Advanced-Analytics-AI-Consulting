"""
pipelines/llm_provider.py
==========================
LLM Provider Abstraction — Quantus Research Solutions.

Supports Claude (full reports) and Gemini (quick insights) behind a
unified interface. Selection via LLM_PROVIDER env var:
  - "claude"  → always Claude
  - "gemini"  → always Gemini
  - "auto"    → Claude for reports, Gemini for insights/deep-dives (default)
"""

from __future__ import annotations

import dataclasses
import json
import logging
import os
import uuid
from abc import ABC, abstractmethod
from typing import Any, AsyncGenerator

from pipelines.data_architecture import QuantusPayload

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Abstract interface
# ---------------------------------------------------------------------------

class NarrativeProvider(ABC):
    """Base interface for LLM-based narrative generation."""

    @abstractmethod
    async def generate_report(
        self,
        payload: QuantusPayload,
        section: str = "A",
    ) -> tuple[dict, list[str]]:
        """Generate a full report section.
        Returns (report_dict, validation_errors).
        """
        ...

    @abstractmethod
    async def generate_report_stream(
        self,
        payload: QuantusPayload,
        section: str = "A",
    ) -> AsyncGenerator[str, None]:
        """Stream report text chunks."""
        ...

    @abstractmethod
    async def generate_deepdive(
        self,
        ticker: str,
        module_index: int,
        asset_class: str,
        context: dict | None = None,
    ) -> str:
        """Generate a deep-dive analysis for a specific module."""
        ...


# ---------------------------------------------------------------------------
# Claude Provider
# ---------------------------------------------------------------------------

class ClaudeProvider(NarrativeProvider):
    """Uses Anthropic Claude for narrative generation (primary)."""

    def __init__(self):
        self._key = os.getenv("ANTHROPIC_API_KEY")
        if not self._key:
            raise RuntimeError("ANTHROPIC_API_KEY not set")

    async def generate_report(
        self, payload: QuantusPayload, section: str = "A",
    ) -> tuple[dict, list[str]]:
        from pipelines.claude_engine import call_claude_collect
        return await call_claude_collect(payload, section=section)

    async def generate_report_stream(
        self, payload: QuantusPayload, section: str = "A",
    ) -> AsyncGenerator[str, None]:
        from pipelines.claude_engine import call_claude_realtime
        async for chunk in call_claude_realtime(payload, section=section):
            yield chunk

    async def generate_deepdive(
        self, ticker: str, module_index: int, asset_class: str,
        context: dict | None = None,
    ) -> str:
        import anthropic
        from pipelines.claude_engine import MODEL, MAX_TOKENS, TEMPERATURE

        modules = [
            "Time Series Forecasting", "Mean Reversion Strategy",
            "Sentiment Analysis", "Portfolio Optimization",
            "ML Feature Importance", "High-Frequency Signal Detection",
            "Risk Management & VaR", "Options Pricing & Greeks",
            "Pairs Trading Cointegration", "ML Backtesting Framework",
            "Reinforcement Learning Agent", "Factor Investing Model",
        ]
        module_name = modules[module_index] if module_index < len(modules) else modules[0]

        prompt = (
            f"You are Quantus Engine Meridian v2.4. Generate a Deep Dive for "
            f"{ticker} ({asset_class}). Topic: {module_name}. "
            f"Write 4-6 paragraphs of expert-level institutional analysis. "
            f"No code, no tables. Conclude with a 1-sentence bottom line."
        )

        client = anthropic.AsyncAnthropic()
        response = await client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            temperature=TEMPERATURE,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.content[0].text


# ---------------------------------------------------------------------------
# Gemini Provider
# ---------------------------------------------------------------------------

class GeminiProvider(NarrativeProvider):
    """Uses Google Gemini for narrative generation (fallback / insights)."""

    def __init__(self):
        self._key = os.getenv("GEMINI_API_KEY")
        if not self._key:
            raise RuntimeError("GEMINI_API_KEY not set")

    def _get_client(self):
        from google.genai import Client
        return Client(api_key=self._key)

    async def generate_report(
        self, payload: QuantusPayload, section: str = "A",
    ) -> tuple[dict, list[str]]:
        """Gemini report generation — returns a simplified report dict."""
        from google import genai

        client = genai.Client(api_key=self._key)
        payload_dict = dataclasses.asdict(payload)

        system_prompt = (
            "You are Quantus Engine Meridian v2.4. Generate a structured research "
            "report as valid JSON. Include keys: engine, report_id, section, "
            "asset_class, overall_signal, confidence_score, narrative_technical, "
            "narrative_plain, narrative_language, key_metrics, signals, strategy, "
            "early_insight, data_sources, data_caveats, risk_warnings, audit."
        )

        prompt = (
            f"{system_prompt}\n\n"
            f"TICKER: {payload.ticker}\n"
            f"PAYLOAD:\n{json.dumps(payload_dict, indent=2, default=str)}\n\n"
            f"Generate section {section}. Respond with valid JSON only."
        )

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        text = response.text or ""
        # Strip markdown fences
        if text.strip().startswith("```"):
            lines = text.strip().split("\n")
            text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

        try:
            report = json.loads(text)
            report["report_id"] = report.get("report_id") or str(uuid.uuid4())
            return report, []
        except json.JSONDecodeError as exc:
            return {}, [f"Gemini JSON parse error: {exc}"]

    async def generate_report_stream(
        self, payload: QuantusPayload, section: str = "A",
    ) -> AsyncGenerator[str, None]:
        from google import genai

        client = genai.Client(api_key=self._key)
        payload_dict = dataclasses.asdict(payload)

        prompt = (
            f"You are Quantus Engine Meridian v2.4. Generate a research narrative "
            f"for {payload.ticker} ({payload.asset_class}), section {section}.\n\n"
            f"Key metrics: RSI={payload.rsi}, Regime={payload.regime_label}, "
            f"Price=${payload.current_price}\n\n"
            f"Write 3-4 concise paragraphs."
        )

        stream = client.models.generate_content_stream(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        for chunk in stream:
            if chunk.text:
                yield chunk.text

    async def generate_deepdive(
        self, ticker: str, module_index: int, asset_class: str,
        context: dict | None = None,
    ) -> str:
        from google import genai

        client = genai.Client(api_key=self._key)

        modules = [
            "Time Series Forecasting", "Mean Reversion Strategy",
            "Sentiment Analysis", "Portfolio Optimization",
            "ML Feature Importance", "High-Frequency Signal Detection",
            "Risk Management & VaR", "Options Pricing & Greeks",
            "Pairs Trading Cointegration", "ML Backtesting Framework",
            "Reinforcement Learning Agent", "Factor Investing Model",
        ]
        module_name = modules[module_index] if module_index < len(modules) else modules[0]

        prompt = (
            f"You are Quantus Engine Meridian v2.4. Generate a Deep Dive for "
            f"{ticker} ({asset_class}). Topic: {module_name}. "
            f"Write 4-6 paragraphs of expert analysis. No code or tables."
        )

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response.text or ""


# ---------------------------------------------------------------------------
# Auto Provider — routes by task type
# ---------------------------------------------------------------------------

class AutoProvider(NarrativeProvider):
    """Routes Claude for full reports, Gemini for insights/deep-dives.
    Falls back to whichever is available if one key is missing."""

    def __init__(self):
        self._claude: ClaudeProvider | None = None
        self._gemini: GeminiProvider | None = None

        try:
            self._claude = ClaudeProvider()
            logger.info("AutoProvider: Claude available")
        except RuntimeError:
            logger.warning("AutoProvider: Claude unavailable (no ANTHROPIC_API_KEY)")

        try:
            self._gemini = GeminiProvider()
            logger.info("AutoProvider: Gemini available")
        except RuntimeError:
            logger.warning("AutoProvider: Gemini unavailable (no GEMINI_API_KEY)")

        if not self._claude and not self._gemini:
            raise RuntimeError("No LLM provider available — set ANTHROPIC_API_KEY or GEMINI_API_KEY")

    @property
    def _report_provider(self) -> NarrativeProvider:
        return self._claude or self._gemini  # type: ignore

    @property
    def _insight_provider(self) -> NarrativeProvider:
        return self._gemini or self._claude  # type: ignore

    async def generate_report(self, payload: QuantusPayload, section: str = "A") -> tuple[dict, list[str]]:
        return await self._report_provider.generate_report(payload, section)

    async def generate_report_stream(self, payload: QuantusPayload, section: str = "A") -> AsyncGenerator[str, None]:
        async for chunk in self._report_provider.generate_report_stream(payload, section):
            yield chunk

    async def generate_deepdive(self, ticker: str, module_index: int, asset_class: str, context: dict | None = None) -> str:
        return await self._insight_provider.generate_deepdive(ticker, module_index, asset_class, context)


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------

_provider: NarrativeProvider | None = None


def get_provider() -> NarrativeProvider:
    """Get the configured LLM provider (singleton)."""
    global _provider
    if _provider is not None:
        return _provider

    choice = os.getenv("LLM_PROVIDER", "auto").lower()

    if choice == "claude":
        _provider = ClaudeProvider()
    elif choice == "gemini":
        _provider = GeminiProvider()
    else:
        _provider = AutoProvider()

    logger.info("LLM provider: %s (%s)", type(_provider).__name__, choice)
    return _provider
