export const START_PROJECT_PATH = "/start-a-project";

export const CONTACT_EMAIL = "info@bisolutions.group";

function readIntroBookingUrl() {
  const raw = import.meta.env?.VITE_INTRO_BOOKING_URL?.trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}

export const BOOKING_URL = readIntroBookingUrl();

export function introCallRequestHref(projectHref: string) {
  const url = new URL(projectHref, "https://www.bisolutions.group");
  url.searchParams.set("meeting", "intro");
  return `${url.pathname}${url.search}${url.hash}`;
}

export const DEFAULT_CONTACT_ENDPOINT = "/api/contact";
export const CONTACT_ENDPOINT = import.meta.env?.VITE_CONTACT_ENDPOINT || DEFAULT_CONTACT_ENDPOINT;

export async function isContactSubmissionAcknowledged(
  response: Response,
  endpoint: string,
  expectedInquiryId?: string,
): Promise<boolean> {
  if (!response.ok) return false;
  const payload: unknown = await response.json().catch(() => null);
  if (typeof payload !== "object" || payload === null) return false;

  if ("success" in payload) {
    return payload.success === true && (
      expectedInquiryId === undefined || ("inquiryId" in payload && payload.inquiryId === expectedInquiryId)
    );
  }

  // Formspree's JSON acknowledgement supplies the next page URL.
  return expectedInquiryId === undefined
    && /^https:\/\/(?:www\.)?formspree\.io\//i.test(endpoint)
    && !("error" in payload || "errors" in payload)
    && "next" in payload
    && typeof payload.next === "string"
    && payload.next.length > 0;
}
