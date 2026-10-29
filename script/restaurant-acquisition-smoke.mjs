// Local browser checks: contact delivery and advertising endpoints are mocked.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const base = (process.env.SMOKE_BASE_URL || "http://127.0.0.1:5178").replace(/\/$/, "");
const output = "output/playwright/restaurant-acquisition";
const consentKey = "bi-measurement-consent-v2";
const routes = ["/el/online-paraggelies", "/el/meiosi-kostous-delivery"];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const results = [];

async function open(path, width = 1280, measurement = false) {
  const context = await browser.newContext({ viewport: { width, height: width < 500 ? 844 : 900 }, reducedMotion: "reduce" });
  await context.addInitScript(({ consentKey, measurement }) => {
    localStorage.setItem(consentKey, JSON.stringify({ analytics: measurement, ads: measurement, savedAt: Date.now() }));
  }, { consentKey, measurement });
  const external = [];
  await context.route("**/*", async (route) => {
    const url = route.request().url();
    if (url.startsWith(base)) return route.continue();
    if (/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//.test(url)) return route.continue();
    external.push(url);
    return route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.locator(".restaurant-page h1").waitFor();
  await page.locator('form[aria-label="Αξιολόγηση καταστήματος για απευθείας παραγγελίες"]').waitFor();
  return { page, context, errors, external };
}

async function events(page) {
  return page.evaluate(() => (window.dataLayer || []).map((entry) => Array.from(entry)));
}

async function fillStepOne(page) {
  await page.locator('[name="company"]').fill("QA κατάστημα — δοκιμή χωρίς αποστολή");
  await page.locator('[name="area"]').fill("Αθήνα");
  await page.locator('[name="role"]').selectOption("owner");
  await page.locator('[name="platforms"][value="Wolt"]').check();
  await page.locator('[name="goal"]').selectOption("leave");
  await page.locator('[name="fulfilment"]').selectOption("own");
  await page.locator('[name="timing"]').selectOption("30-days");
  await page.getByRole("button", { name: "Συνέχεια στα στοιχεία επικοινωνίας" }).click();
  await page.locator('[name="name"]').waitFor();
}

async function fillStepTwo(page) {
  await page.locator('[name="name"]').fill("QA Δοκιμή");
  await page.locator('[name="phone"]').fill("2100000000");
  await page.locator('[name="email"]').fill("qa@example.invalid");
  await page.locator('[name="consent"]').check();
}

try {
  for (const path of routes) {
    for (const width of [1440, 390, 320]) {
      const { page, context, errors, external } = await open(path, width);
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await page.locator("html").getAttribute("lang"), "el-GR");
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), `https://www.bisolutions.group${path}`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      const brokenImages = await page.locator(".restaurant-page img").evaluateAll((images) => images.filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src));
      assert.deepEqual(brokenImages, []);
      await page.screenshot({ path: `${output}/${path.endsWith("online-paraggelies") ? "ordering" : "transition"}-${width}.png`, fullPage: true });
      if (width === 390) {
        await page.locator(".restaurant-assessment").screenshot({ path: `${output}/${path.endsWith("online-paraggelies") ? "ordering" : "transition"}-form-mobile.png` });
        await page.locator(".restaurant-faq details").first().locator("summary").click();
        assert.equal(await page.locator(".restaurant-faq details").first().getAttribute("open"), "");
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      }
      assert.deepEqual(errors, []);
      assert.equal(external.some((url) => /googletagmanager|googleadservices|doubleclick/.test(url)), false);
      await context.close();
      results.push(`${path}: ${width}px, Greek metadata, images, no overflow or runtime errors`);
    }
  }

  for (const measurement of [false, true]) {
    const { page, context, errors } = await open(`${routes[0]}?utm_source=google&utm_medium=cpc&utm_campaign=restaurant-qa&utm_content=leave&utm_term=online&gclid=do-not-copy`, 390, measurement);
    let mode = "failure";
    const submissions = [];
    await page.route("**/api/contact", async (route) => {
      submissions.push(route.request().postDataJSON());
      if (mode === "failure") return route.fulfill({ status: 502, contentType: "application/json", body: '{"success":false}' });
      if (mode === "html") return route.fulfill({ status: 200, contentType: "text/html", body: "<html>Fallback page</html>" });
      await new Promise((resolve) => setTimeout(resolve, 150));
      return route.fulfill({ status: 200, contentType: "application/json", body: '{"success":true}' });
    });

    await page.getByRole("button", { name: "Συνέχεια στα στοιχεία επικοινωνίας" }).click();
    assert.equal(submissions.length, 0);
    assert.equal(await page.locator('[name="company"]').evaluate((field) => field.validity.valid), false);
    await page.locator('[name="company"]').fill("   ");
    await page.locator('[name="area"]').fill("   ");
    await page.locator('[name="role"]').selectOption("owner");
    await page.locator('[name="goal"]').selectOption("leave");
    await page.locator('[name="fulfilment"]').selectOption("own");
    await page.locator('[name="timing"]').selectOption("30-days");
    await page.getByRole("button", { name: "Συνέχεια στα στοιχεία επικοινωνίας" }).click();
    assert.equal(await page.locator('[name="name"]').count(), 0);
    assert.equal(await page.locator('[name="company"]').evaluate((field) => document.activeElement === field), true);
    await fillStepOne(page);
    await page.getByRole("button", { name: "Πίσω", exact: true }).click();
    assert.equal(await page.locator('[name="company"]').inputValue(), "QA κατάστημα — δοκιμή χωρίς αποστολή");
    await page.getByRole("button", { name: "Συνέχεια στα στοιχεία επικοινωνίας" }).click();
    await fillStepTwo(page);
    await page.getByRole("button", { name: "Ζήτησε αξιολόγηση", exact: true }).click();
    await page.getByRole("alert").waitFor();
    assert.equal(await page.locator('[name="phone"]').inputValue(), "2100000000");
    assert.equal((await events(page)).filter((entry) => entry[1] === "conversion").length, 0);
    await page.screenshot({ path: `${output}/form-error-${measurement}.png`, fullPage: false });

    mode = "html";
    await page.getByRole("button", { name: "Ζήτησε αξιολόγηση", exact: true }).click();
    await page.getByRole("button", { name: "Ζήτησε αξιολόγηση", exact: true }).waitFor();
    assert.equal(await page.getByRole("alert").count(), 1);
    assert.equal((await events(page)).filter((entry) => entry[1] === "conversion").length, 0);

    mode = "success";
    await page.locator("form.restaurant-lead").dispatchEvent("submit");
    await page.locator("form.restaurant-lead").dispatchEvent("submit");
    await page.locator(".restaurant-lead-success").waitFor();
    assert.equal(submissions.length, 3, "rapid duplicate submits must create one request");
    assert.match(submissions[2].message, /utm_campaign: restaurant-qa/);
    assert.match(submissions[2].message, /Πλατφόρμες: Wolt/);
    assert.doesNotMatch(submissions[2].message, /gclid|do-not-copy/);
    const queue = await events(page);
    assert.equal(queue.filter((entry) => entry[1] === "conversion").length, measurement ? 1 : 0);
    assert.doesNotMatch(JSON.stringify(queue), /qa@example.invalid|2100000000|QA Δοκιμή|restaurant-qa/);
    await page.locator(".restaurant-lead-success").screenshot({ path: `${output}/form-success-${measurement}.png` });
    await page.reload({ waitUntil: "networkidle" });
    assert.equal((await events(page)).filter((entry) => entry[1] === "conversion").length, 0);
    const crossLink = page.locator('a.restaurant-text-link[href*="meiosi-kostous-delivery"]');
    await crossLink.click();
    await page.locator("#transition-title").waitFor();
    assert.equal(new URL(page.url()).searchParams.get("utm_campaign"), "restaurant-qa");
    assert.equal(new URL(page.url()).searchParams.has("gclid"), false);
    assert.deepEqual(errors, []);
    await context.close();
    results.push(`measurement ${measurement}: validation, retained input, HTML rejection, single submission/conversion, attribution and cross-page navigation`);
  }

  const report = { ok: true, base, delivery: "mocked; no message sent", results };
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
