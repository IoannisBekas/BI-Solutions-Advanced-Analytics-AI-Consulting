const campaignKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "adgroup_id", "matchtype"] as const;

/** Keep campaign context in the current navigation, without setting tracking storage. */
export function campaignAttribution(search: string) {
  const params = new URLSearchParams(search);
  return Object.fromEntries(campaignKeys.flatMap((key) => {
    const value = params.get(key)?.replace(/[\r\n\t]/g, " ").trim().slice(0, 100);
    return value ? [[key, value]] : [];
  }));
}

export function usInquiryHref(service: "power-bi" | "ai-automation", search = "") {
  const params = new URLSearchParams(campaignAttribution(search));
  params.set("need", service === "power-bi" ? "business-intelligence" : "ai-automation");
  params.set("source", "us-landing-page");
  params.set("context", service);
  params.set("market", "US");
  params.set("currency", "USD");
  return `/start-a-project?${params}`;
}
