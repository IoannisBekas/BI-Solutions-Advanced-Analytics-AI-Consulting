import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";
import type { Express, Request, Response } from "express";
import { campaignAttribution, usInquiryHref } from "../apps/client/src/lib/leadAttribution";
import { COOKIE_CONSENT_KEY, trackLeadConversion } from "../apps/client/src/lib/analytics";
import { introCallRequestHref } from "../apps/client/src/lib/contact";
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

test("intro-call requests retain service and localization context", () => {
  const href = introCallRequestHref("/de/start-a-project?need=business-intelligence&utm_source=proof#details");
  assert.equal(href, "/de/start-a-project?need=business-intelligence&utm_source=proof&meeting=intro#details");
});

test("lead conversion requires advertising consent and carries a non-personal deduplication ID", () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const events: unknown[][] = [];
  let consent: unknown = null;
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    location: { hostname: "www.bisolutions.group" },
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

test("contact route persists inquiries before delivery and retries without duplicating notifications", async (t) => {
  let handler: (req: Request, res: Response) => Promise<void>;
  const app = { post: (_path: string, callback: typeof handler) => { handler = callback; } } as unknown as Express;
  let contact = registerContactRoute(app);
  const testDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "bisolutions-contact-"));
  const previousEnvironment = { ...process.env };
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;
  const warnings: unknown[][] = [];
  const calls: RequestInit[] = [];
  const alertUrl = "https://alerts.example.com/contact";
  const alerts: unknown[] = [];
  const databaseFile = path.join(testDirectory, "contact-inquiries.db");
  let inspector: Database.Database | undefined;
  let providerFails = false;
  Object.assign(process.env, {
    CONTACT_DATA_DIR: testDirectory,
    RESEND_API_KEY: "re_test_not_a_real_key",
    CONTACT_RECIPIENT_EMAIL: "test@example.com",
    CONTACT_FROM_EMAIL: "Test <sender@example.com>",
    CONTACT_ALERT_WEBHOOK_URL: alertUrl,
  });
  console.warn = (...parts: unknown[]) => { warnings.push(parts); };
  globalThis.fetch = async (url, init) => {
    if (String(url) === alertUrl) {
      alerts.push(JSON.parse(String(init?.body)));
      return new Response("Mock webhook unavailable", { status: 503 });
    }
    assert.equal(String(url), "https://api.resend.com/emails");
    calls.push(init!);
    const header = new Headers(init?.headers).get("Idempotency-Key")!;
    const row = getInquiry(header.slice("contact/".length));
    assert.equal(row.email, "qa@example.com", "The inquiry is committed on disk before the provider is called");
    assert.equal(row.delivery_status, "pending");
    return new Response(JSON.stringify(providerFails ? { message: "Rejected qa@example.com" } : { id: "test-email" }), {
      status: providerFails ? 503 : 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  t.after(() => {
    contact.close();
    inspector?.close();
    globalThis.fetch = originalFetch;
    console.warn = originalWarn;
    for (const key of ["CONTACT_DATA_DIR", "RESEND_API_KEY", "CONTACT_RECIPIENT_EMAIL", "CONTACT_FROM_EMAIL", "CONTACT_ALERT_WEBHOOK_URL"]) {
      if (previousEnvironment[key] === undefined) delete process.env[key];
      else process.env[key] = previousEnvironment[key];
    }
    fs.rmSync(testDirectory, { recursive: true });
  });

  function getInquiry(id: string) {
    inspector ??= new Database(databaseFile, { fileMustExist: true });
    return inspector.prepare("SELECT * FROM contact_inquiries WHERE id = ?").get(id) as {
      email: string; delivery_status: string; delivery_error: string | null; delivery_attempts: number; provider_email_id: string | null;
      alert_attempted_at: number | null;
    };
  }
  async function invoke(body: unknown) {
    let status = 200;
    let result: unknown;
    const res = { status: (code: number) => { status = code; return res; }, json: (value: unknown) => { result = value; return res; } };
    await handler!({ body } as Request, res as unknown as Response);
    return { status, result };
  }

  const inquiryId = "c1108252-03d2-4a7e-b40f-9d6c53e3712a";
  const body = { name: "<QA>", email: "qa@example.com", subject: "US inquiry", message: "<script>test</script>\nBudget: US$5,000", inquiryId };
  assert.equal((await invoke({})).status, 400);
  assert.equal((await invoke({ ...body, inquiryId: "invalid" })).status, 400);
  assert.equal(fs.existsSync(databaseFile), false);
  assert.equal(calls.length, 0);

  assert.deepEqual(await invoke(body), { status: 200, result: { success: true, inquiryId } });
  assert.equal(new Headers(calls[0].headers).get("Idempotency-Key"), `contact/${inquiryId}`);
  const sent = JSON.parse(String(calls[0].body));
  assert.match(sent.html, /&lt;script&gt;/);
  assert.match(sent.html, new RegExp(inquiryId));
  assert.equal(getInquiry(inquiryId).delivery_status, "accepted");
  assert.equal(getInquiry(inquiryId).provider_email_id, "test-email");
  assert.equal(getInquiry(inquiryId).alert_attempted_at, null);
  assert.equal(alerts.length, 0);
  assert.equal((await invoke({ ...body, inquiryId: inquiryId.toUpperCase() })).status, 200);
  assert.equal((await invoke({ ...body, message: "A different brief" })).status, 409);
  assert.equal(calls.length, 1);

  providerFails = true;
  const retryId = randomUUID();
  const retryBody = { ...body, inquiryId: retryId };
  assert.deepEqual(await invoke(retryBody), { status: 202, result: { success: true, inquiryId: retryId } });
  assert.equal(getInquiry(retryId).delivery_status, "pending");
  assert.equal(getInquiry(retryId).delivery_error, "resend_http_503");
  assert.ok(getInquiry(retryId).alert_attempted_at);
  assert.deepEqual(alerts, [{ text: `Contact notification pending for ${retryId} (resend_http_503).` }]);
  assert.doesNotMatch(JSON.stringify(warnings), /qa@example.com/);
  assert.equal((await invoke(retryBody)).status, 202);
  assert.equal(calls.length, 2);

  // Restart the worker against the persisted queue and make the failed notification due.
  contact.close();
  contact = registerContactRoute(app);
  const makeDue = inspector!.prepare("UPDATE contact_inquiries SET next_attempt_at = 0 WHERE id = ?");
  makeDue.run(retryId);
  await Promise.all([contact.retryPending(), contact.retryPending()]);
  assert.equal(calls.length, 3);
  assert.equal(alerts.length, 1);

  makeDue.run(retryId);
  providerFails = false;
  await contact.retryPending();
  assert.equal(calls.length, 4);
  assert.equal(new Headers(calls[3].headers).get("Idempotency-Key"), new Headers(calls[1].headers).get("Idempotency-Key"));
  assert.equal(calls[3].body, calls[1].body);
  assert.equal(getInquiry(retryId).delivery_attempts, 3);
  assert.equal(getInquiry(retryId).delivery_status, "accepted");
  assert.equal(getInquiry(retryId).delivery_error, null);

  const unconfiguredId = randomUUID();
  delete process.env.CONTACT_FROM_EMAIL;
  assert.equal((await invoke({ ...body, inquiryId: unconfiguredId })).status, 202);
  assert.equal(getInquiry(unconfiguredId).delivery_attempts, 0);
  assert.equal(getInquiry(unconfiguredId).delivery_error, "notification_not_configured");
  assert.deepEqual(alerts[1], { text: `Contact notification pending for ${unconfiguredId} (notification_not_configured).` });
  assert.equal(calls.length, 4);
  process.env.CONTACT_FROM_EMAIL = "Test <sender@example.com>";
  await contact.retryPending();
  assert.equal(calls.length, 5);
  assert.equal(getInquiry(unconfiguredId).delivery_status, "accepted");

  providerFails = true;
  delete process.env.CONTACT_ALERT_WEBHOOK_URL;
  const expiredId = randomUUID();
  assert.equal((await invoke({ ...body, inquiryId: expiredId })).status, 202);
  assert.equal(getInquiry(expiredId).alert_attempted_at, null);
  assert.equal(alerts.length, 2);
  inspector!.prepare("UPDATE contact_inquiries SET next_attempt_at = 0, first_attempt_at = 0 WHERE id = ?").run(expiredId);
  await contact.retryPending();
  assert.equal(calls.length, 6);
  assert.equal(getInquiry(expiredId).delivery_status, "needs_review");

  contact.close();
  // A regular file cannot serve as the database directory.
  process.env.CONTACT_DATA_DIR = databaseFile;
  assert.equal((await invoke({ ...body, inquiryId: randomUUID() })).status, 503);
  assert.equal(calls.length, 6);
});
