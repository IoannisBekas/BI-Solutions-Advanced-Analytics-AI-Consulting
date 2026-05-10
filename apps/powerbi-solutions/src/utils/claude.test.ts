import { afterEach, describe, expect, it, vi } from 'vitest';
import { askClaude, buildDetailedModelContext, parseVisualReviewResponse } from '@/utils/claude';
import type { TMDLModel } from '@/types';

function createLargeModel(): TMDLModel {
  return {
    name: `Enterprise Semantic Model ${'x'.repeat(200)}`,
    tables: Array.from({ length: 25 }, (_, tableIndex) => ({
      name: `Fact Table ${tableIndex} ${'x'.repeat(80)}`,
      columns: Array.from({ length: 20 }, (_, columnIndex) => ({
        name: `Column ${columnIndex} ${'y'.repeat(80)}`,
        dataType: columnIndex % 2 === 0 ? 'decimal' : 'string',
        isHidden: columnIndex % 5 === 0,
      })),
    })),
    relationships: Array.from({ length: 45 }, (_, index) => ({
      name: `Relationship ${index} ${'r'.repeat(80)}`,
      fromTable: `Fact Table ${index % 25}`,
      fromColumn: `Column ${index % 20}`,
      toTable: `Dim Table ${index % 10}`,
      toColumn: 'Id',
      cardinality: 'many-to-one',
    })),
    measures: Array.from({ length: 80 }, (_, index) => ({
      name: `Measure ${index} ${'m'.repeat(80)}`,
      table: `Fact Table ${index % 25}`,
      expression: `CALCULATE(SUM('Fact Table ${index % 25}'[Column ${index % 20}]), ${'FILTER(ALL(Date), Date[IsClosed] = TRUE()), '.repeat(30)})`,
      formatString: '$#,0.00',
      displayFolder: 'Executive Metrics',
    })),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('parseVisualReviewResponse', () => {
  it('extracts JSON from a fenced response and clamps the score', () => {
    const result = parseVisualReviewResponse(`\`\`\`json
{
  "summary": "Strong overall structure with a few spacing issues.",
  "overallScore": 14,
  "recommendations": [
    {
      "type": "layout",
      "title": "Tighten card spacing",
      "description": "The KPI cards need more breathing room.",
      "severity": "high",
      "suggestion": "Increase vertical spacing between the header and KPI band."
    }
  ]
}
\`\`\``);

    expect(result.summary).toContain('Strong overall structure');
    expect(result.overallScore).toBe(10);
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0]).toMatchObject({
      id: 'rec-1',
      type: 'layout',
      title: 'Tighten card spacing',
      severity: 'high',
    });
  });

  it('falls back to a single recommendation when the response is not valid JSON', () => {
    const rawText = 'Improve contrast on the filters and reduce the chart density on smaller screens.';
    const result = parseVisualReviewResponse(rawText);

    expect(result.summary).toBe('Review complete. See recommendations below.');
    expect(result.recommendations).toEqual([
      expect.objectContaining({
        id: 'rec-fallback',
        title: 'Dashboard Review',
        description: rawText,
      }),
    ]);
  });

  it('normalizes invalid recommendation fields from model output', () => {
    const result = parseVisualReviewResponse(JSON.stringify({
      summary: 'x'.repeat(800),
      recommendations: [
        {
          id: '',
          type: 'unknown',
          title: '',
          description: 'Use clearer labels.',
          severity: 'urgent',
          screenshotIndex: -1,
        },
      ],
    }));

    expect(result.summary.length).toBeLessThanOrEqual(600);
    expect(result.recommendations[0]).toMatchObject({
      id: 'rec-1',
      type: 'layout',
      title: 'Recommendation',
      description: 'Use clearer labels.',
      severity: 'medium',
      screenshotIndex: undefined,
    });
  });
});

describe('Power BI prompt context', () => {
  it('keeps large TMDL context inside the proxy text budget', () => {
    const context = buildDetailedModelContext(createLargeModel());
    const parsed = JSON.parse(context) as { summary?: { measureCount?: number } };

    expect(context.length).toBeLessThanOrEqual(6000);
    expect(parsed.summary?.measureCount).toBe(80);
  });

  it('sends the user question before bounded model context', async () => {
    let requestBody: unknown;

    vi.stubGlobal('fetch', vi.fn(async (_url: unknown, init?: RequestInit) => {
      requestBody = JSON.parse(String(init?.body));
      return new Response(JSON.stringify({ content: [{ text: 'ok' }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }));

    const question = 'Which measures should I optimize first?';
    const answer = await askClaude(question, createLargeModel());
    const body = requestBody as { messages: Array<{ content: string }> };
    const content = body.messages[0].content;

    expect(answer).toBe('ok');
    expect(content.startsWith(`Question:\n${question}`)).toBe(true);
    expect(content).toContain('Untrusted TMDL-derived model context');
    expect(content.length).toBeLessThanOrEqual(7900);
  });
});
