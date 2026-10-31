import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const origin = process.env.SERVICES_QA_URL || "http://127.0.0.1:5001";
const output = "output/playwright/services-compact";
fs.mkdirSync(output, { recursive: true });
const baseline = fs.existsSync(`${output}/before.json`) ? JSON.parse(fs.readFileSync(`${output}/before.json`, "utf8")) : [];
const report = { pages: [], anchors: [], reopenedLinks: [], motionAnchors: [], noJavaScript: [] };
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error" && /hydrat|Minified React error|did not match/i.test(message.text())) errors.push(message.text());
});
const fit = async () => {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  const clipped = await page.locator(".service-section__eyebrow p, .service-section__title").evaluateAll((nodes) => nodes.some((el) => {
    const box = el.getBoundingClientRect();
    const card = el.closest(".service-section").getBoundingClientRect();
    return box.width && (box.right > card.right + 1 || box.left < card.left - 1 || el.scrollWidth > el.clientWidth + 1);
  }));
  assert.equal(clipped, false, "service heading or label is clipped");
};
const allClosed = () => page.waitForFunction(() => document.querySelectorAll(".service-section details[open]").length === 0);
const allOpen = () => page.waitForFunction(() => document.querySelectorAll(".service-section details[open]").length === 7);

try {
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Reject optional", exact: true }).click();
  for (const locale of ["en", "el", "de"]) for (const width of [320, 390, 768, 1024, 1440]) {
    const prefix = locale === "en" ? "" : `/${locale}`;
    const labels = { en: { compact: "Compact", details: "Details", clear: "Clear search" }, el: { compact: "Σύνοψη", details: "Αναλυτικά", clear: "Καθαρισμός αναζήτησης" }, de: { compact: "Kompakt", details: "Details", clear: "Suche löschen" } }[locale];
    await page.setViewportSize({ width, height: 1050 });
    await page.goto(`${origin}${prefix}/services`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await allClosed();
    assert.equal(await page.locator(".service-section summary").count(), 7);
    const initial = await page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      paragraphs: [...document.querySelectorAll("main p")].map((el) => el.textContent.replace(/\s+/g, " ").trim()),
      headings: [...document.querySelectorAll("main h1,main h2,main h3")].map((el) => el.textContent.trim()),
      links: [...document.querySelectorAll("main a")].map((el) => el.getAttribute("href")).sort(),
      ids: [...document.querySelectorAll("main [id]")].map((el) => el.id),
      schema: [...document.querySelectorAll('script[type="application/ld+json"]')].map((el) => el.textContent),
    }));
    const before = baseline.find((item) => item.locale === locale && item.width === width);
    if (before) {
      assert.deepEqual(initial.links, before.links);
      assert.deepEqual(initial.schema, before.schema);
      assert.ok(before.paragraphs.every((text) => initial.paragraphs.includes(text)), `${locale}: lost paragraph`);
      assert.ok(before.headings.every((text) => initial.headings.includes(text)), `${locale}: lost heading`);
      assert.ok(before.ids.every((id) => initial.ids.includes(id)), `${locale}: lost anchor`);
      assert.ok(initial.height < before.height * 0.5);
    }
    assert.equal(new Set(initial.ids).size, initial.ids.length);
    await fit();
    const screenshot = (locale === "en" && width === 1440) || (locale === "el" && width === 390);
    if (screenshot) await page.screenshot({ path: `${output}/after-${locale}-${width}.png` });

    const first = page.locator(".service-section summary").first();
    await first.focus();
    assert.ok(await first.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth) >= 2));
    await first.press("Space");
    await page.waitForFunction(() => document.querySelectorAll(".service-section details[open]").length === 1);
    await first.press("Enter");
    await allClosed();
    await page.getByRole("button", { name: labels.details, exact: true }).click();
    await allOpen();
    const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    assert.ok(fullHeight > initial.height * 1.5);
    await fit();
    if (screenshot) {
      await page.locator(".service-section").first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await page.screenshot({ path: `${output}/details-${locale}-${width}.png` });
    }
    await page.getByRole("button", { name: labels.compact, exact: true }).click();
    await allClosed();
    const input = page.locator("#service-search");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.65));
    await input.fill("RAG");
    await page.waitForFunction(() => document.querySelector("#advanced-analytics-ai details").open);
    assert.ok(await page.locator(".service-section:not([hidden])").count());
    assert.ok(await page.locator("#advanced-analytics-ai article:not([hidden])").count());
    assert.deepEqual(await page.locator('script[type="application/ld+json"]').allTextContents(), initial.schema);
    const target = await page.locator(".service-section:not([hidden])").first().boundingBox();
    const toolbar = await page.locator(".services-toolbar").boundingBox();
    assert.ok(target.y >= toolbar.y + toolbar.height - 2 && target.y < 1050, `${locale} ${width}: filtered section hidden behind toolbar`);
    await input.fill("zz-no-matching-service-9919");
    assert.equal(await page.locator(".service-section:not([hidden])").count(), 0);
    await page.locator("#service-results").getByRole("button", { name: labels.clear, exact: true }).click();
    assert.equal(await page.locator(".service-section:not([hidden])").count(), 7);
    await allClosed();
    assert.equal(await input.evaluate((el) => el === document.activeElement), true);
    await fit();
    assert.deepEqual(errors, []);
    report.pages.push({ locale, width, compactHeight: initial.height, fullHeight, beforeHeight: before?.height, reduction: before ? Math.round(100 * (1 - initial.height / before.height)) : null, passed: true });
    console.log(`${locale} ${width}: views, search and content passed`);
  }

  // Every existing service and AI-capability fragment must reveal its parent.
  await page.setViewportSize({ width: 390, height: 1050 });
  for (const locale of ["en", "el", "de"]) {
    const prefix = locale === "en" ? "" : `/${locale}`;
    await page.goto(`${origin}${prefix}/services`, { waitUntil: "networkidle" });
    const anchors = await page.locator(".service-section[id], .service-section article[id]").evaluateAll((nodes) => nodes.map((el) => el.id));
    for (const anchor of anchors) {
      await page.goto(`${origin}${prefix}/services#${anchor}`, { waitUntil: "networkidle" });
      await page.waitForFunction((id) => {
        const el = document.getElementById(id);
        const section = el?.closest(".service-section");
        if (!section?.querySelector("details")?.open) return false;
        const box = el.getBoundingClientRect();
        const toolbar = document.querySelector(".services-toolbar").getBoundingClientRect();
        return box.top >= toolbar.bottom - 2 && box.top < innerHeight;
      }, anchor);
      assert.deepEqual(errors, []);
      report.anchors.push({ locale, anchor, passed: true });
    }
    console.log(`${locale}: ${anchors.length} direct service links passed`);
    await page.setViewportSize({ width: 1440, height: 1050 });
    const sameAnchor = "business-intelligence-semantic-modeling";
    await page.goto(origin + prefix + "/services#" + sameAnchor, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: locale === "en" ? "Compact" : locale === "el" ? "Σύνοψη" : "Kompakt", exact: true }).click();
    await page.locator('main a[href="#' + sameAnchor + '"]').click();
    await page.waitForFunction(() => document.querySelector("#business-intelligence-semantic-modeling details").open);
    await page.locator("#service-search").fill("zz-no-match-9919");
    await page.locator('main a[href="#' + sameAnchor + '"]').click();
    await page.waitForFunction(() => document.querySelector("#business-intelligence-semantic-modeling details").open);
    assert.equal(await page.locator("#service-search").inputValue(), "");
    report.reopenedLinks.push({ locale, passed: true });
    await page.setViewportSize({ width: 390, height: 1050 });
  }

  const motion = await browser.newContext({ reducedMotion: "no-preference", viewport: { width: 390, height: 1050 } });
  const motionPage = await motion.newPage();
  await motionPage.goto(origin, { waitUntil: "networkidle" });
  await motionPage.getByRole("button", { name: "Reject optional", exact: true }).click();
  for (const locale of ["en", "el", "de"]) for (const anchor of ["ai-strategy-readiness", "mlops-model-monitoring"]) {
    await motionPage.goto(origin + (locale === "en" ? "" : "/" + locale) + "/services", { waitUntil: "networkidle" });
    await motionPage.waitForTimeout(200);
    await motionPage.evaluate((id) => { location.hash = id; }, anchor);
    await motionPage.waitForFunction(() => document.querySelector("#advanced-analytics-ai details").open);
    await motionPage.waitForTimeout(1100);
    const visible = await motionPage.evaluate((id) => document.getElementById(id).getBoundingClientRect().top >= document.querySelector(".services-toolbar").getBoundingClientRect().bottom - 2, anchor);
    assert.equal(visible, true, "motion hid the anchor behind the toolbar");
    report.motionAnchors.push({ locale, anchor, passed: true });
  }
  await motion.close();

  if (process.argv.includes("--no-js")) {
    for (const locale of ["en", "el", "de"]) {
      const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1050 } });
      const tab = await noJs.newPage();
      await tab.goto(`${origin}${locale === "en" ? "" : `/${locale}`}/services`, { waitUntil: "load" });
      assert.equal(await tab.locator(".service-section summary").count(), 7);
      await tab.locator(".service-section summary").first().click();
      assert.equal(await tab.locator(".service-section details[open]").count(), 1);
      assert.equal(await tab.locator(".service-section__content p").first().isVisible(), true);
      report.noJavaScript.push({ locale, nativeDetails: true });
      await noJs.close();
    }
  }
  fs.writeFileSync(`${output}/qa.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ pages: report.pages.length, anchors: report.anchors.length, reopenedLinks: report.reopenedLinks.length, motionAnchors: report.motionAnchors.length, noJavaScript: report.noJavaScript.length, reductions: report.pages.filter((item) => item.reduction !== null).map(({ locale, width, reduction }) => ({ locale, width, reduction })) }));
} finally {
  await browser.close();
}
