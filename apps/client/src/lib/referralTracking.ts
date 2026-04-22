type AiReferralSource =
  | "ChatGPT"
  | "Claude"
  | "Gemini"
  | "Perplexity"
  | "Microsoft Copilot"
  | "Google Search";

export interface AiSearchReferral {
  source: AiReferralSource;
  referrerDomain: string;
  landingPath: string;
  capturedAt: string;
}

const SESSION_KEY = "bi-ai-search-referral";
const LOCAL_KEY = "bi-last-ai-search-referral";

type DataLayerWindow = Window & {
  dataLayer?: unknown[];
};

const sourceRules: Array<{
  source: AiReferralSource;
  patterns: string[];
}> = [
  { source: "ChatGPT", patterns: ["chatgpt", "openai", "oai-search"] },
  { source: "Claude", patterns: ["claude", "anthropic"] },
  { source: "Gemini", patterns: ["gemini"] },
  { source: "Perplexity", patterns: ["perplexity"] },
  { source: "Microsoft Copilot", patterns: ["copilot"] },
  { source: "Google Search", patterns: ["google."] },
];

function safeStorage(storage: Storage, key: string, value?: string) {
  try {
    if (typeof value === "string") {
      storage.setItem(key, value);
      return value;
    }

    return storage.getItem(key);
  } catch {
    return null;
  }
}

function getReferrerDomain(referrer: string) {
  if (!referrer) return "";

  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function detectSource(referrerDomain: string, search: string): AiReferralSource | null {
  const params = new URLSearchParams(search);
  const hints = [
    referrerDomain,
    params.get("utm_source") || "",
    params.get("utm_medium") || "",
    params.get("utm_campaign") || "",
    params.get("ref") || "",
    params.get("source") || "",
  ]
    .join(" ")
    .toLowerCase();

  const matchedRule = sourceRules.find((rule) =>
    rule.patterns.some((pattern) => hints.includes(pattern)),
  );

  return matchedRule?.source || null;
}

export function getStoredAiSearchReferral(): AiSearchReferral | null {
  const raw = safeStorage(window.sessionStorage, SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AiSearchReferral;
  } catch {
    return null;
  }
}

export function pushAiSearchReferralToDataLayer(referral: AiSearchReferral) {
  (window as DataLayerWindow).dataLayer?.push({
    event: "ai_search_referral",
    ai_source: referral.source,
    referrer_domain: referral.referrerDomain,
    landing_path: referral.landingPath,
  });
}

export function captureAiSearchReferral() {
  const referrerDomain = getReferrerDomain(document.referrer);
  const source = detectSource(referrerDomain, window.location.search);

  if (!source) return null;

  const referral: AiSearchReferral = {
    source,
    referrerDomain,
    landingPath: window.location.pathname,
    capturedAt: new Date().toISOString(),
  };
  const serialized = JSON.stringify(referral);

  safeStorage(window.sessionStorage, SESSION_KEY, serialized);
  safeStorage(window.localStorage, LOCAL_KEY, serialized);
  pushAiSearchReferralToDataLayer(referral);

  window.dispatchEvent(
    new CustomEvent("bi:ai-search-referral", {
      detail: referral,
    }),
  );

  return referral;
}
