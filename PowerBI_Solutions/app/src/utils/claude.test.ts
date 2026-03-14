import { describe, expect, it } from 'vitest';
import { parseVisualReviewResponse } from '@/utils/claude';

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
});
