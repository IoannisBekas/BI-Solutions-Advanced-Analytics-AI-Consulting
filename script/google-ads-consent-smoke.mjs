// Local-only browser smoke checks. All external requests and form delivery are mocked.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const preview = new URL(process.env.SMOKE_BASE_URL || "http://127.0.0.1:5178");
const base = "https://www.bisolutions.group";
const key = "bi-measurement-consent-v2";
const destination = "AW-18432612818/QZdDCIrolO8cENKzrdVE";
const output = "output/playwright/google-ads-consent";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  channel: "chrome",
  args: ["--host-resolver-rules=MAP www.bisolutions.group ~NOTFOUND"],
});
const results = [];
let closingBrowser = false;

async function open(viewport = { width: 1280, height: 900 }, stored = {}) {
  const context = await browser.newContext({ viewport });
  let closing = false;
  const close = async () => {
    closing = true;
    await context.close();
  };
  await context.addInitScript((items) => {
    for (const [name, value] of Object.entries(items)) localStorage.setItem(name, value);
  }, stored);
  const requests = [];
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== base) {
      requests.push(url.href);
      // No Google collection or real advertising conversion is sent by these tests.
      return route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
    }
    // Exercise the production hostname gate using only the local preview.
    try {
      const response = await route.fetch({ url: new URL(url.pathname + url.search, preview).href, maxRedirects: 0 });
      await route.fulfill({ response });
    } catch (error) {
      if (!closing && !closingBrowser) throw error;
    }
  });
  const page = await context.newPage();
  await page.goto(`${base}/start-a-project`);
  await page.getByRole("heading", { name: "Tell us about the project", exact: true }).waitFor();
  return { page, context, requests, close };
}

async function events(page) {
  return page.evaluate(() => (window.dataLayer || []).map((entry) => Array.from(entry)));
}

async function submit(page, status) {
  let inquiryId;
  await page.route("**/api/contact", (route) => {
    inquiryId = route.request().postDataJSON().inquiryId;
    return route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ success: status === 200, inquiryId }) });
  }, { times: 1 });
  await page.locator('input[name="name"]').fill("Local QA example");
  await page.locator('input[name="email"]').fill("qa@example.invalid");
  await page.locator('input[name="company"]').fill("Test only");
  await page.locator('select[name="need"]').selectOption("business-intelligence");
  await page.locator('textarea[name="description"]').fill("Mocked local test. No message should be delivered.");
  await page.locator('select[name="timing"]').selectOption({ label: "Within 1–3 months" });
  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: "Send project brief", exact: true }).click();
  if (status === 200) await page.getByRole("heading", { name: "Your brief was sent." }).waitFor();
  else await page.getByRole("alert").waitFor();
  return inquiryId;
}

try {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 640 }]) {
    const { page, requests, close } = await open(viewport, { "cookie-consent": "accepted" });
    const dialog = page.getByRole("dialog", { name: "Cookies & measurement" });
    await dialog.waitFor();
    // First visit shows the compact notice: both actions, no per-purpose options yet.
    assert.equal(await dialog.getByRole("checkbox").count(), 0);
    assert.equal(requests.some((url) => /googletagmanager|googleadservices|doubleclick/.test(url)), false);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `${output}/notice-${viewport.width}.png` });
    await dialog.getByRole("button", { name: "Customize", exact: true }).click();
    assert.equal(await dialog.getByRole("checkbox").first().isChecked(), false);
    assert.equal(await dialog.getByRole("checkbox").last().isChecked(), false);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.getByRole("button", { name: "Reject optional" }).click();
    await submit(page, 200);
    assert.equal((await events(page)).filter((event) => event[1] === "conversion").length, 0);
    assert.equal(requests.some((url) => /googletagmanager/.test(url)), false);
    await page.getByRole("button", { name: "Cookie settings", exact: true }).click();
    await dialog.waitFor();
    results.push(`legacy consent, reject, form success without tracking, reopen, no overflow: ${viewport.width}px`);
    await close();
  }

  for (const mode of ["analytics", "ads", "both"]) {
    const { page, requests, close } = await open();
    await page.getByRole("button", { name: "Customize", exact: true }).click();
    if (mode !== "ads") await page.getByRole("checkbox", { name: "Analytics (Google Analytics)", exact: true }).check();
    if (mode !== "analytics") await page.getByRole("checkbox", { name: "Ad measurement (Google Ads)", exact: true }).check();
    await page.getByRole("button", { name: "Save choices", exact: true }).click();
    const queue = await events(page);
    assert.deepEqual(queue[0], ["consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" }]);
    const configs = queue.filter((event) => event[0] === "config").map((event) => event[1]);
    assert.equal(configs.includes("G-M1276CBX6M"), mode !== "ads");
    assert.equal(configs.includes("AW-18432612818"), mode !== "analytics");
    await submit(page, 500);
    assert.equal((await events(page)).filter((event) => event[1] === "conversion").length, 0);
    const inquiryId = await submit(page, 200);
    const leads = (await events(page)).filter((event) => event[1] === "conversion");
    assert.equal(leads.length, mode === "analytics" ? 0 : 1);
    if (leads.length) {
      assert.ok(inquiryId);
      assert.deepEqual(leads[0][2], { send_to: destination, value: 1, currency: "EUR", transaction_id: inquiryId });
    }
    // Reloading the success route must not fire a second conversion.
    await page.reload();
    await page.getByRole("button", { name: "Cookie settings", exact: true }).waitFor();
    assert.equal((await events(page)).filter((event) => event[1] === "conversion").length, 0);
    await page.evaluate(() => { document.cookie = "_gcl_aw=mock; path=/"; document.cookie = "_ga=mock; path=/"; });
    await page.getByRole("button", { name: "Cookie settings", exact: true }).click();
    const requestCount = requests.length;
    await page.getByRole("button", { name: "Reject optional", exact: true }).click();
    await page.waitForLoadState("domcontentloaded");
    await page.getByRole("button", { name: "Cookie settings", exact: true }).waitFor();
    assert.equal(await page.evaluate(() => typeof window.gtag), "undefined");
    assert.equal(await page.evaluate(() => /_ga=|_gcl_aw=/.test(document.cookie)), false);
    assert.equal(requests.slice(requestCount).some((url) => /googletagmanager/.test(url)), false);
    results.push(`${mode}: consent isolation, failure/success, reload, withdrawal, cookies cleared`);
    await close();
  }
  const expired = await open(undefined, { [key]: JSON.stringify({ analytics: true, ads: true, savedAt: 0 }) });
  await expired.page.getByRole("dialog", { name: "Cookies & measurement" }).waitFor();
  assert.equal(await expired.page.evaluate(() => typeof window.gtag), "undefined");
  await expired.close();
  const blocked = await open();
  await blocked.page.getByRole("button", { name: "Accept both" }).click();
  await blocked.page.evaluate(() => { window.gtag = () => { throw new Error("Measurement blocked"); }; });
  await submit(blocked.page, 200);
  await blocked.close();
  results.push("blocked measurement cannot turn a successful enquiry into an error");
  const crossTab = await open();
  await crossTab.page.getByRole("button", { name: "Accept both" }).click();
  const otherPage = await crossTab.context.newPage();
  await otherPage.goto(base + "/start-a-project");
  await otherPage.getByRole("button", { name: "Cookie settings", exact: true }).click();
  await otherPage.getByRole("button", { name: "Reject optional", exact: true }).click();
  await crossTab.page.waitForFunction(() => typeof window.gtag === "undefined");
  await crossTab.close();
  results.push("withdrawal propagates to another open tab");
  console.log(JSON.stringify({ ok: true, results, expiredConsent: "not inherited", externalNetwork: "mocked; no real leads sent" }, null, 2));
} finally {
  closingBrowser = true;
  await browser.close();
}
