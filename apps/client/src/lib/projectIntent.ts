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

export interface ProjectOptionGroup {
  label: string;
  options: ProjectOption[];
}

export const projectNeedGroups: ProjectOptionGroup[] = [
  {
    label: "Build or improve",
    options: [
      { value: "business-intelligence", label: "Business intelligence and reporting" },
      { value: "ai-automation", label: "AI workflows and automation" },
      { value: "data-strategy", label: "Data engineering and cloud foundations" },
      { value: "web-app", label: "Website or web application" },
      { value: "content-operations", label: "Content system or digital product" },
    ],
  },
  {
    label: "Training and career development",
    options: [
      { value: "team-enablement", label: "Team training and enablement" },
      { value: "career-mentorship", label: "Individual career mentorship" },
    ],
  },
  {
    label: "Advisory and ongoing support",
    options: [
      { value: "advisory-sprint", label: "Diagnostic or roadmap sprint" },
      { value: "project-implementation", label: "Implementation project" },
      { value: "fractional-leadership", label: "Fractional data and AI leadership" },
      { value: "managed-operations", label: "Managed BI, data, or AI support" },
    ],
  },
  {
    label: "Other",
    options: [
      { value: "product-walkthrough", label: "Product walkthrough" },
      { value: "not-sure", label: "Help me define the right approach" },
    ],
  },
];

export const projectNeedOptions = projectNeedGroups.flatMap(
  (group) => group.options,
);

export const heroNeedValues = [
  "business-intelligence",
  "ai-automation",
  "data-strategy",
  "web-app",
  "content-operations",
  "team-enablement",
  "career-mentorship",
  "not-sure",
] as const;

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
