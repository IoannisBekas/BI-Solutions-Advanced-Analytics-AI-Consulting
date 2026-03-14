import { getIndustryPrompts } from "../constants/prompts";

export type Industry = "Health" | "Car" | "Tech" | "Other";

export async function identifyIndustry(ticker: string): Promise<Industry> {
  const response = await fetch('/quantus/api/identify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticker })
  });

  if (!response.ok) {
    throw new Error('Failed to identify industry');
  }

  const data = await response.json();
  return data.industry as Industry;
}

export async function generateQuantReportSequentially(
  ticker: string,
  industry: Industry,
  onSectionComplete: (section: { title: string; content: string }) => void
) {
  const prompts = getIndustryPrompts(industry);

  for (const section of prompts) {
    const finalPrompt = section.prompt.replace(/\[TICKER\]/g, ticker).replace(/\[STOCK\/ASSET\]/g, ticker);

    const response = await fetch('/quantus/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: finalPrompt })
    });

    if (!response.ok || !response.body) {
      throw new Error('Failed to generate report section');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let sectionContent = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      sectionContent += decoder.decode(value, { stream: true });
    }

    onSectionComplete({ title: section.title, content: sectionContent });
  }
}
