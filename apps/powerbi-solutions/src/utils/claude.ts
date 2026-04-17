import type { TMDLModel, DashboardReviewResult, VisualRecommendation } from '@/types';

const CLAUDE_MODEL = import.meta.env.VITE_CLAUDE_MODEL || 'claude-haiku-4-5-20251001';
const POWERBI_SOLUTIONS_API_BASE =
  (import.meta.env.VITE_POWERBI_SOLUTIONS_API_BASE || '/power-bi-solutions/api').replace(/\/$/, '');
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 1;

class PowerBiProxyError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'PowerBiProxyError';
    this.status = status;
  }
}

async function readProxyErrorMessage(response: Response) {
  const responseText = await response.text();
  if (!responseText) {
    return '';
  }

  try {
    const parsed = JSON.parse(responseText) as { message?: unknown; error?: unknown };
    if (typeof parsed.message === 'string' && parsed.message.trim()) {
      return parsed.message.trim();
    }
    if (typeof parsed.error === 'string' && parsed.error.trim()) {
      return parsed.error.trim();
    }
  } catch {
    return responseText.trim();
  }

  return responseText.trim();
}

function getProxyStatusMessage(status: number, fallback: string) {
  switch (status) {
    case 401:
      return 'Please sign in to use the Power BI AI features.';
    case 403:
      return 'This Power BI AI proxy only accepts requests from trusted browser origins.';
    case 429:
      return 'Rate limit exceeded. Please wait a moment and try again.';
    case 503:
      return 'This deployment has the preview AI proxy disabled until server-side access control is configured.';
    default:
      return fallback;
  }
}

export async function askClaude(
    question: string,
    model: TMDLModel | null,
    externalSignal?: AbortSignal
): Promise<string> {
    if (!model) return "Please upload a TMDL file first so I can analyze your model.";

    const systemPrompt = `You are a helpful Power BI assistant. You are analyzing a Power BI Semantic Model defined in TMDL (Tabular Model Definition Language).

  Model Name: ${model.name || 'Unnamed Model'}

  Tables:
  ${model.tables.map(t => `- ${t.name} (${t.columns.length} columns): [${t.columns.slice(0, 10).map(c => c.name).join(', ')}${t.columns.length > 10 ? '...' : ''}]`).join('\n')}

  Relationships:
  ${model.relationships.map(r => `- ${r.fromTable}.${r.fromColumn} -> ${r.toTable}.${r.toColumn} (${r.cardinality})`).join('\n')}

  Measures:
  ${model.measures.map(m => `- ${m.name} (Table: ${m.table}) - Expression: ${m.expression}`).join('\n')}

  Answer the user's question about this model directly and concisely. Provide DAX suggestions if relevant.`;

    const makeRequest = async (signal: AbortSignal): Promise<string> => {
        const response = await fetch(`${POWERBI_SOLUTIONS_API_BASE}/anthropic/v1/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: CLAUDE_MODEL,
                max_tokens: 2048,
                messages: [
                    { role: 'user', content: question }
                ],
                system: systemPrompt
            }),
            signal
        });

        if (!response.ok) {
            const status = response.status;
            const fallbackMessage = await readProxyErrorMessage(response);
            const message = getProxyStatusMessage(
                status,
                fallbackMessage || `API error (${status}). Please try again.`,
            );
            if (status === 401 || status === 403 || status === 429 || status === 503) {
                return message;
            }
            // Throw on 5xx to trigger retry
            if (status >= 500) {
                throw new Error(message);
            }
            return message;
        }

        const data = await response.json();
        if (data.content && data.content.length > 0 && data.content[0].text) {
            return data.content[0].text;
        }
        return "Received empty response from Claude.";
    };

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        // Link external signal to internal controller
        const onExternalAbort = () => controller.abort();
        externalSignal?.addEventListener('abort', onExternalAbort);

        try {
            // If already externally aborted, bail immediately
            if (externalSignal?.aborted) {
                throw new DOMException('Aborted', 'AbortError');
            }

            const result = await makeRequest(controller.signal);
            return result;
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                // External abort: propagate immediately, no retry
                if (externalSignal?.aborted) throw error;
                // Timeout on last attempt
                if (attempt >= MAX_RETRIES) {
                    return "Request timed out. The server took too long to respond. Please try again.";
                }
            }
            // Network/5xx error on last attempt
            if (attempt >= MAX_RETRIES) {
                return "Unable to reach the AI service. Please check your network connection and try again.";
            }
            // Otherwise retry
        } finally {
            clearTimeout(timeoutId);
            externalSignal?.removeEventListener('abort', onExternalAbort);
        }
    }

    return "Unable to reach the AI service. Please try again.";
}

// --- Dashboard Visual Review (Claude Vision) ---

const VISION_TIMEOUT_MS = 60_000;

function buildModelContext(model: TMDLModel | null): string {
  if (!model) return 'No data model context available.';
  return `Data Model: ${model.name || 'Unnamed Model'}
Tables: ${model.tables.map(t => `${t.name} (${t.columns.length} cols)`).join(', ')}
Measures: ${model.measures.map(m => `${m.table}.${m.name}`).join(', ') || 'None'}
Relationships: ${model.relationships.map(r => `${r.fromTable}.${r.fromColumn} → ${r.toTable}.${r.toColumn}`).join(', ') || 'None'}`;
}

const VISUAL_REVIEW_SCHEMA = `{
  "summary": "2-3 sentence overall assessment",
  "overallScore": <number 1-10>,
  "recommendations": [
    {
      "id": "rec-1",
      "type": "<layout|color-contrast|readability|chart-choice|accessibility|branding|mobile>",
      "title": "Short title",
      "description": "Detailed explanation",
      "severity": "<low|medium|high|critical>",
      "screenshotIndex": <0-based index or omit if general>,
      "suggestion": "Actionable fix"
    }
  ]
}`;

export function parseVisualReviewResponse(text: string): DashboardReviewResult {
  // Try to extract JSON from the response (Claude may wrap it in markdown code blocks)
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();

  try {
    const parsed = JSON.parse(jsonStr);
    // Validate structure
    if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
      return {
        summary: typeof parsed.summary === 'string' ? parsed.summary : 'Review complete.',
        overallScore: typeof parsed.overallScore === 'number' ? Math.min(10, Math.max(1, parsed.overallScore)) : undefined,
        recommendations: parsed.recommendations.map((r: VisualRecommendation, i: number) => ({
          id: r.id || `rec-${i + 1}`,
          type: r.type || 'layout',
          title: r.title || 'Recommendation',
          description: r.description || '',
          severity: r.severity || 'medium',
          screenshotIndex: r.screenshotIndex,
          suggestion: r.suggestion,
        })),
      };
    }
  } catch {
    // JSON parse failed — fallback
  }

  // Fallback: return raw text as a single recommendation
  return {
    summary: 'Review complete. See recommendations below.',
    recommendations: [{
      id: 'rec-fallback',
      type: 'layout',
      title: 'Dashboard Review',
      description: text,
      severity: 'medium',
    }],
  };
}

export async function reviewDashboard(
  images: Array<{ base64: string; mediaType: string }>,
  model: TMDLModel | null,
  externalSignal?: AbortSignal
): Promise<DashboardReviewResult> {
  const systemPrompt = `You are a Power BI dashboard design expert reviewing dashboard screenshots for UI/UX quality.

${buildModelContext(model)}

Evaluate each screenshot for:
1. Layout — visual hierarchy, whitespace, alignment, information density
2. Color & Contrast — WCAG compliance, color blindness considerations, palette coherence
3. Readability — font sizes, label clarity, data label formatting
4. Chart Choices — whether the chart type suits the data being represented
5. Accessibility — screen reader friendliness, alt text needs, contrast ratios
6. Branding — consistency of colors, fonts, logo placement
7. Mobile-friendliness — whether the layout works on smaller screens

Correlate visual elements with the data model where possible (e.g., reference measure names you see).

Return your analysis as JSON matching this exact schema:
${VISUAL_REVIEW_SCHEMA}

Return ONLY the JSON object, no other text.`;

  const messageContent = [
    ...images.map(img => ({
      type: 'image' as const,
      source: {
        type: 'base64' as const,
        media_type: img.mediaType,
        data: img.base64,
      },
    })),
    {
      type: 'text' as const,
      text: `Analyze ${images.length === 1 ? 'this' : 'these'} Power BI dashboard screenshot${images.length > 1 ? 's' : ''}. Provide detailed UI/UX recommendations.`,
    },
  ];

  const makeRequest = async (signal: AbortSignal): Promise<string> => {
    const response = await fetch(`${POWERBI_SOLUTIONS_API_BASE}/anthropic/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        messages: [{ role: 'user', content: messageContent }],
        system: systemPrompt,
      }),
      signal,
    });

    if (!response.ok) {
      const status = response.status;
      const fallbackMessage = await readProxyErrorMessage(response);
      const message = getProxyStatusMessage(
        status,
        fallbackMessage || `API error (${status}). Please try again.`,
      );
      throw new PowerBiProxyError(status, message);
    }

    const data = await response.json();
    if (data.content?.[0]?.text) {
      return data.content[0].text;
    }
    throw new Error('Empty response from Claude');
  };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), VISION_TIMEOUT_MS);

    const onExternalAbort = () => controller.abort();
    externalSignal?.addEventListener('abort', onExternalAbort);

    try {
      if (externalSignal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      const text = await makeRequest(controller.signal);
      return parseVisualReviewResponse(text);
    } catch (error) {
      if (error instanceof PowerBiProxyError && error.status < 500) {
        throw error;
      }
      if (error instanceof DOMException && error.name === 'AbortError') {
        if (externalSignal?.aborted) throw error;
        if (attempt >= MAX_RETRIES) throw new Error('Request timed out');
      }
      if (attempt >= MAX_RETRIES) throw error;
    } finally {
      clearTimeout(timeoutId);
      externalSignal?.removeEventListener('abort', onExternalAbort);
    }
  }

  throw new Error('Unable to reach the AI service');
}
