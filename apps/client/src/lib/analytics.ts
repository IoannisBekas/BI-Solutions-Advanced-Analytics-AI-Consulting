type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

// Do not inherit the old analytics-only consent for advertising measurement.
export const COOKIE_CONSENT_KEY = "bi-measurement-consent-v2";
export const GA_ID = "G-M1276CBX6M";
export const ADS_ID = "AW-18432612818";
export const LEAD_CONVERSION = `${ADS_ID}/QZdDCIrolO8cENKzrdVE`;
export type MeasurementConsent = { analytics: boolean; ads: boolean };

export function readMeasurementConsent(): MeasurementConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = JSON.parse(window.localStorage.getItem(COOKIE_CONSENT_KEY) || "null");
    if (!stored || typeof stored.analytics !== "boolean" || typeof stored.ads !== "boolean" ||
        typeof stored.savedAt !== "number" || Date.now() - stored.savedAt > 180 * 86400000) return null;
    return { analytics: stored.analytics, ads: stored.ads };
  } catch {
    return null;
  }
}

export function saveMeasurementConsent(consent: MeasurementConsent): boolean {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ ...consent, savedAt: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

function consentSignals(consent: MeasurementConsent) {
  return {
    analytics_storage: consent.analytics ? "granted" : "denied",
    ad_storage: consent.ads ? "granted" : "denied",
    ad_user_data: consent.ads ? "granted" : "denied",
    ad_personalization: "denied",
  };
}

export function initializeMeasurement() {
  const consent = readMeasurementConsent();
  if (!consent || (!consent.analytics && !consent.ads)) return;
  const analyticsWindow = window as AnalyticsWindow;
  if (analyticsWindow.gtag) return;
  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  analyticsWindow.gtag = function () {
    // Use the Arguments queue format from Google's installation snippet.
    analyticsWindow.dataLayer?.push(arguments);
  };
  const gtag = analyticsWindow.gtag;
  gtag("consent", "default", consentSignals({ analytics: false, ads: false }));
  gtag("set", "ads_data_redaction", true);
  gtag("set", "url_passthrough", false);
  gtag("consent", "update", consentSignals(consent));
  gtag("js", new Date());
  if (consent.analytics) gtag("config", GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  if (consent.ads) gtag("config", ADS_ID, { allow_enhanced_conversions: false, allow_ad_personalization_signals: false });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${consent.analytics ? GA_ID : ADS_ID}`;
  document.head.appendChild(script);
}

export function applyMeasurementConsent(consent: MeasurementConsent) {
  const analyticsWindow = window as AnalyticsWindow;
  analyticsWindow.gtag?.("consent", "update", consentSignals(consent));
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0].trim();
    if ((!consent.analytics && /^(?:_ga(?:_|$)|_gid$|_gat)/.test(name)) || (!consent.ads && /^_gcl_/.test(name))) {
      const domains = ["", window.location.hostname, `.${window.location.hostname}`];
      if (window.location.hostname.endsWith(".bisolutions.group")) domains.push(".bisolutions.group");
      for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/;${domain ? ` domain=${domain};` : ""}`;
    }
  }
  // Tear down already-loaded tags when changing an existing choice.
  if (analyticsWindow.gtag) window.location.reload();
  else initializeMeasurement();
}

export function hasAnalyticsConsent() {
  return readMeasurementConsent()?.analytics === true;
}

// Only call after a successful enquiry response; never pass form contents.
export function trackLeadConversion() {
  if (readMeasurementConsent()?.ads !== true) return;
  try {
    initializeMeasurement();
    (window as AnalyticsWindow).gtag?.("event", "conversion", {
      send_to: LEAD_CONVERSION,
      value: 1.0,
      currency: "EUR",
    });
  } catch {
    // Blocked measurement must not turn a delivered enquiry into a form error.
  }
}

export type AnalyticsParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export function trackEvent(
  name: string,
  params: AnalyticsParams = {},
) {
  if (typeof window === "undefined") {
    return;
  }

  if (!hasAnalyticsConsent()) {
    return;
  }

  const eventName = name.replace(/[^A-Za-z0-9_]/g, "_");
  try {
    initializeMeasurement();
    (window as AnalyticsWindow).gtag?.("event", eventName, { ...params, send_to: GA_ID });
  } catch {
    // Optional measurement must not interrupt navigation or form submission.
  }
}

export function trackNavClick(
  label: string,
  destination: string,
  placement: "header" | "mobile_menu" | "footer",
) {
  trackEvent("nav_click", {
    link_label: label,
    destination,
    placement,
  });
}
