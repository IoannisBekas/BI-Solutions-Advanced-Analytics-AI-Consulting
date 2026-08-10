/**
 * Shared vocabulary for project enquiries.
 *
 * The homepage hero and the Start a project form both encode intent into the
 * URL, so the accepted values live here rather than in either surface. Each
 * surface keeps its own wording, but the values must stay identical or the
 * form silently fails to prefill.
 */

export interface ProjectOption {
  value: string;
  label: string;
}

export const projectNeedOptions: ProjectOption[] = [
  { value: "business-intelligence", label: "BI & dashboards" },
  { value: "ai-automation", label: "AI & automation" },
  { value: "data-strategy", label: "Data strategy" },
  { value: "web-app", label: "Website or web app" },
  { value: "product-walkthrough", label: "Product walkthrough" },
  { value: "not-sure", label: "Not sure yet" },
];

export const projectTimingOptions: ProjectOption[] = [
  { value: "asap", label: "As soon as practical" },
  { value: "1-3-months", label: "Within 1–3 months" },
  { value: "3-6-months", label: "Within 3–6 months" },
  { value: "later", label: "Exploring for later" },
];

function resolve(options: ProjectOption[], raw: string | null | undefined) {
  const candidate = raw?.trim().toLowerCase();
  if (!candidate) return undefined;

  return options.find(
    (option) =>
      option.value === candidate || option.label.toLowerCase() === candidate,
  );
}

/** Accepts either the canonical value or the human label, from a URL param. */
export function resolveProjectNeed(raw: string | null | undefined) {
  return resolve(projectNeedOptions, raw);
}

export function resolveProjectTiming(raw: string | null | undefined) {
  return resolve(projectTimingOptions, raw);
}
