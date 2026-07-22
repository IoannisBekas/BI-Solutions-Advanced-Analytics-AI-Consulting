type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

export const COOKIE_CONSENT_KEY = "cookie-consent";

export function hasAnalyticsConsent() {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
  } catch {
    return false;
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
  const analyticsWindow = window as AnalyticsWindow;

  if (typeof analyticsWindow.gtag === "function") {
    analyticsWindow.gtag("event", eventName, params);
    return;
  }

  if (Array.isArray(analyticsWindow.dataLayer)) {
    analyticsWindow.dataLayer.push(["event", eventName, params]);
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
