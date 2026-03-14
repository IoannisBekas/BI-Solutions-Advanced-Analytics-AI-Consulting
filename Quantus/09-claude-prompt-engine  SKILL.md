---
name: 09-claude-prompt-engine
description: |
  Use when building the Claude API integration, writing or modifying system prompts,
  implementing prompt caching, configuring the Batch API for scheduled runs, setting
  up streaming via SSE, or defining the JSON output schema. Claude interprets data —
  it never fetches or computes. Use Claude Sonnet 4.5 as the model.
---

# Claude Prompt Engine — Meridian v2.4

## Core Rule
**Python computes. Claude interprets.**
Claude receives a pre-validated JSON payload and writes narrative.
Claude never fetches data, runs calculations, or derives metrics.

## Model Configuration
```python
MODEL = "claude-sonnet-4-5-20251001"  # always Claude Sonnet 4.5 — never Opus for cost
MAX_TOKENS = 4096                      # per section — Deep Dives may need up to 6000
TEMPERATURE = 0.3                      # low — authoritative, consistent tone
```

## Prompt Architecture — Two Layers

### Layer 1: Static Cached System Prompt
Cached via `cache_control: {"type": "ephemeral"}`. Sent once, cached up to 5 minutes.
Contains all content that never changes between reports:

```python
STATIC_SYSTEM_PROMPT = """
You are Quantus Engine Meridian v2.4 — the analytical intelligence of Quantus
Research Solutions, a service of BI Solutions Group (bisolutions.group).

ROLE: Interpret pre-computed quantitative metrics and translate them into concise,
authoritative, institutional research narratives. You never compute — all numbers
are provided. Communicate them with precision and clarity.

HOUSE STYLE (non-negotiable):
- Concise and authoritative. Every sentence earns its place.
- Zero filler: never use "it's worth noting", "it is important to remember",
  "needless to say", "as we can see", "it should be noted", "clearly",
  "obviously", "of course", "importantly"
- Plain-English default. Technical detail only on toggle.
- Dollar-denominated risk always (user currency applied)
- No false precision: max 2 decimal places
- Always answer "so what?" — never state a fact without its implication
- Peer group comparison always (not broad sector)
- Data freshness referenced for key metrics
- Active voice preferred
- Never include code. Never derive numbers. Use only the payload provided.

AUDIENCE: Portfolio managers and executives.
Confidence scores always explained (breakdown required).
Data limitations flagged honestly and specifically.
Cross-ticker knowledge graph insights included where payload indicates relationships.

[...full house style, regime definitions, stress test definitions,
confidence score composition, data source credibility tiers,
graceful degradation rules, output JSON schema — all cached here...]
"""
```

One static layer per asset class:
- `STATIC_EQUITY_PROMPT` — current spec
- `STATIC_CRYPTO_PROMPT` — crypto-native language, on-chain metric definitions,
  vol-adjusted position sizing, MiCA/FCA disclaimers
- `STATIC_COMMODITY_PROMPT` — futures language, COT interpretation, contango/backwardation,
  seasonal framing, real yield correlation context
- `STATIC_ETF_PROMPT` — NAV/premium logic, fund flow interpretation, holdings narrative

### Layer 2: Dynamic Prompt (unique per report — not cached)
```python
def build_dynamic_prompt(payload: QuantusPayload, section: str) -> str:
    return f"""
Engine: Meridian v2.4
Section: {section}
User tier: {payload.user_tier}
Language: {payload.language} | Currency: {payload.currency}
Jurisdiction: {payload.jurisdiction}
Asset Class: {payload.asset_class}

TICKER: {payload.ticker} | Company: {payload.company_name}
Exchange: {payload.exchange}
Sector: {payload.sector} | Industry: {payload.industry}
Market Cap: {payload.market_cap}
Peer Group: {", ".join(payload.peer_group)}

Knowledge Graph: {json.dumps(payload.knowledge_graph)}
Cross-ticker alerts: {json.dumps(payload.cross_ticker_alerts)}
Current Regime: {payload.regime_label} (confidence: {payload.regime_confidence})

Macro Context:
  Fed rate: {payload.fed_rate}
  Yield curve: {payload.yield_curve_shape}
  VIX: {payload.vix_level}

[...all pre-computed metrics from QuantusPayload...]

PRE-COMPUTED METRICS:
{json.dumps(payload.dict(), indent=2)}

Generate section {section} of the Quantus report.
Respond ONLY with valid JSON matching the output schema in your system prompt.
"""
```

## API Call Implementation

### Standard (real-time, on-demand Deep Dives)
```python
async def call_claude_realtime(
    payload: QuantusPayload,
    section: str,
    stream: bool = True,
) -> AsyncGenerator[str, None]:
    client = anthropic.AsyncAnthropic()

    asset_class = payload.asset_class.lower()
    static_prompt = STATIC_PROMPTS[asset_class]
    dynamic_prompt = build_dynamic_prompt(payload, section)

    messages = [{"role": "user", "content": dynamic_prompt}]

    async with client.messages.stream(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=[
            {
                "type": "text",
                "text": static_prompt,
                "cache_control": {"type": "ephemeral"},  # prompt caching
            }
        ],
        messages=messages,
    ) as stream:
        async for text in stream.text_stream:
            yield text  # SSE to frontend
```

### Batch API (scheduled / low-demand)
```python
async def submit_batch_job(payloads: list[QuantusPayload]) -> str:
    client = anthropic.Anthropic()

    requests = [
        {
            "custom_id": f"{p.ticker}-{p.section_requested}-{p.payload_timestamp}",
            "params": {
                "model": MODEL,
                "max_tokens": MAX_TOKENS,
                "system": [...static_prompt with cache_control...],
                "messages": [{"role": "user", "content": build_dynamic_prompt(p, p.section_requested)}],
            }
        }
        for p in payloads
    ]

    batch = client.beta.messages.batches.create(requests=requests)
    return batch.id
    # Poll results: client.beta.messages.batches.results(batch.id)
```

Use Batch API for:
- Nightly top-50 ticker refresh (11pm–5am)
- Low-demand ticker queue (1–2 requests per 96h window)
- Scheduled cache expiry regeneration for watchlist tickers
- Screener mode bulk report generation
- Portfolio analyzer aggregation
- Overnight language variant generation

## Streaming to Frontend (SSE)

```python
# FastAPI endpoint
@router.get("/api/v1/report/{ticker}/stream")
async def stream_report(ticker: str, section: str, user: User = Depends(get_user)):
    async def event_generator():
        async for chunk in call_claude_realtime(payload, section):
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        yield f"data: {json.dumps({'done': True, 'report_id': report_id})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

```typescript
// React frontend — consume SSE
const eventSource = new EventSource(`/api/v1/report/${ticker}/stream?section=A`);
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.done) { eventSource.close(); finalizeReport(data.report_id); }
  else { appendToReport(data.chunk); }
};
```

## JSON Output Schema (Claude must return this — validated before rendering)

```typescript
interface QuantusReportSection {
  engine: "Meridian v2.4"
  report_id: string
  section: string
  asset_class: string       // NEW — included in every section output

  // Section A only:
  regime?: RegimeOutput
  overall_signal?: SignalLevel
  confidence_score?: number
  confidence_breakdown?: ConfidenceBreakdown
  vs_consensus?: ConsensusComparison
  earnings_flag?: EarningsFlag | null      // null for crypto/commodity
  cross_ticker_alerts?: CrossTickerAlert[]
  model_ensemble?: ModelEnsemble

  // Core content
  narrative_technical: string    // 3-4 paragraphs, house style
  narrative_plain: string        // 2-3 sentences, plain English
  narrative_language: string
  key_metrics: MetricCard[]

  // Asset-class-specific data
  alternative_data?: AlternativeData      // equity/ETF
  on_chain_data?: OnChainData             // crypto only
  macro_fundamentals?: MacroFundamentals  // commodity only
  etf_data?: ETFData                      // ETF only

  chart_config: ChartConfig
  data_sources: DataSource[]
  data_caveats: string[]
  graceful_degradation: DegradationNote[]
  signals: Signal[]
  stress_tests?: StressTest[]
  strategy?: StrategyRecommendation
  risk_warnings: string[]
  cross_references: string[]

  early_insight: string    // one sentence for Progressive Insight Feed
  email_preview: EmailPreview

  audit: {
    prompt_version: string
    python_model_versions: Record<string, string>
    data_quality_scores: Record<string, number>
    circuit_breakers_activated: string[]
    fallbacks_used: string[]
  }
}
```

## Prompt Versioning
```python
ENGINE_VERSIONS = {
    "current": "Meridian v2.4",
    "previous": "Atlas v1.x",
}
# Every report stores: prompt_version, python_model_versions, data_source_versions
# Accuracy Tracker segmented by prompt version
# On major upgrade: in-app banner shown to all users
```

## Graceful Degradation Rules
```python
# If any data source unavailable:
# 1. Exclude from payload calculation
# 2. Reduce confidence score by the source's weight
# 3. Add to graceful_degradation list with exact disclosure:
#    "X unavailable — [reason]. Confidence reduced from Y% to Z%.
#     Strategy recommendation [unchanged / adjusted]."
# 4. Never suppress the disclosure
# 5. Never fail silently — always partial report > no report

# Anthropic API down → queue + notify user via email
# Never return an error page — always a partial report
```

## Constraints
- Always use `claude-sonnet-4-5-20251001` — never Opus (cost), never Haiku (quality)
- Static prompt layer MUST use `cache_control: {"type": "ephemeral"}`
- Dynamic prompt NEVER uses cache_control — it's unique per report
- Claude output must be validated against JSON schema before rendering
- Invalid JSON from Claude → retry once → if still invalid → generate partial report with notice
- All audit data stored before rendering — never skip the audit write
- Language variants generated as separate Batch API calls (one per language)
- Token usage tracked per section, tier, language → operator dashboard
