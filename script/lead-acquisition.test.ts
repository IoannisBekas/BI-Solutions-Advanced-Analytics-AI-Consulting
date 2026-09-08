import assert from "node:assert/strict";
import { test } from "node:test";
import type { Express, Request, Response } from "express";
import { campaignAttribution, usInquiryHref } from "../apps/client/src/lib/leadAttribution";
import { COOKIE_CONSENT_KEY, trackLeadConversion } from "../apps/client/src/lib/analytics";
import { registerContactRoute } from "../apps/server/routes/contact";

test("US inquiry links retain bounded campaign context and prefill the right service", () => {
  const search = "?utm_campaign=24219706214&utm_term=power+bi&adgroup_id=123&matchtype=e&email=private@example.com&gclid=ignored";
  const href = new URL(usInquiryHref("power-bi", search), "https://example.com");
  assert.equal(href.pathname, "/start-a-project");
  assert.equal(href.searchParams.get("need"), "business-intelligence");
  assert.equal(href.searchParams.get("currency"), "USD");
  assert.equal(href.searchParams.get("utm_campaign"), "24219706214");
  assert.equal(href.searchParams.get("adgroup_id"), "123");
  assert.equal(href.searchParams.get("email"), null);
  assert.equal(href.searchParams.get("gclid"), null);
  assert.equal(new URL(usInquiryHref("ai-automation"), "https://example.com").searchParams.get("need"), "ai-automation");
  assert.equal(campaignAttribution(`?utm_source=${"a".repeat(300)}`).utm_source.length, 100);
  assert.equal(campaignAttribution("?utm_source=google%0Aads").utm_source, "google ads");
});

test("lead conversion requires advertising consent and carries a non-personal deduplication ID", () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const events: unknown[][] = [];
  let consent: unknown = null;
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    localStorage: { getItem: (key: string) => key === COOKIE_CONSENT_KEY ? JSON.stringify(consent) : null },
    gtag: (...args: unknown[]) => events.push(args),
  } });
  try {
    trackLeadConversion("test-reference");
    consent = { analytics: true, ads: false, savedAt: Date.now() };
    trackLeadConversion("test-reference");
    assert.equal(events.length, 0);
    consent = { analytics: false, ads: true, savedAt: Date.now() };
    trackLeadConversion("test-reference");
    assert.equal(events.length, 1);
    assert.equal(events[0][1], "conversion");
    assert.equal((events[0][2] as Record<string, unknown>).transaction_id, "test-reference");
    consent = { analytics: true, ads: true, savedAt: Date.now() - 181 * 86400000 };
    trackLeadConversion("expired");
    assert.equal(events.length, 1);
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
});

test("contact route validates, escapes content, propagates reference, and handles delivery failure", async () => {
  let handler: (req: Request, res: Response) => Promise<void>;
  registerContactRoute({ post: (_path: string, callback: typeof handler) => { handler = callback; } } as unknown as Express);
  const previousKey = process.env.RESEND_API_KEY;
  const previousRecipient = process.env.CONTACT_RECIPIENT_EMAIL;
  const originalFetch = globalThis.fetch;
  process.env.RESEND_API_KEY = "re_test_not_a_real_key";
  process.env.CONTACT_RECIPIENT_EMAIL = "test@example.com";
  const calls: { url: string; init?: RequestInit }[] = [];
  let providerFails = false;
  globalThis.fetch = async (url, init) => {
    assert.equal(String(url), "https://api.resend.com/emails");
    calls.push({ url: String(url), init });
    return new globalThis.Response(JSON.stringify(providerFails ? { name: "validation_error", message: "Test rejection" } : { id: "test-email" }), { status: providerFails ? 422 : 200, headers: { "Content-Type": "application/json" } });
  };
  const invoke = async (body: unknown) => {
    let status = 200;
    let result: unknown;
    const res = { status: (code: number) => { status = code; return res; }, json: (value: unknown) => { result = value; return res; } };
    await handler!({ body } as Request, res as unknown as Response);
    return { status, result };
  };
  try {
    assert.equal((await invoke({})).status, 400);
    assert.equal(calls.length, 0);
    const inquiryId = "c1108252-03d2-4a7e-b40f-9d6c53e3712a";
    const body = { name: "<QA>", email: "qa@example.com", subject: "US inquiry", message: "<script>test</script>\nBudget: US$5,000", inquiryId };
    assert.equal((await invoke({ ...body, inquiryId: "invalid" })).status, 400);
    const success = await invoke(body);
    assert.deepEqual(success, { status: 200, result: { success: true, inquiryId } });
    assert.equal(new Headers(calls[0].init?.headers).get("Idempotency-Key"), `contact/${inquiryId}`);
    const sent = JSON.parse(String(calls[0].init?.body));
    assert.match(sent.html, /&lt;script&gt;/);
    assert.match(sent.html, new RegExp(inquiryId));
    await invoke(body);
    assert.equal(new Headers(calls[1].init?.headers).get("Idempotency-Key"), `contact/${inquiryId}`);
    providerFails = true;
    assert.equal((await invoke(body)).status, 502);
  } finally {
    globalThis.fetch = originalFetch;
    if (previousKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = previousKey;
    if (previousRecipient === undefined) delete process.env.CONTACT_RECIPIENT_EMAIL; else process.env.CONTACT_RECIPIENT_EMAIL = previousRecipient;
  }
});
