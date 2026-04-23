type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

export function trackEvent(
  name: string,
  params: Record<string, string | number | boolean | null | undefined> = {},
) {
  if (typeof window === "undefined") {
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
