import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const base = process.env.DESIGN_QA_URL || "http://127.0.0.1:5001";
const output = "output/playwright/design-system";
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = [];
try {
  for (const locale of ["en", "el", "de"]) {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 1000 } });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Reject optional", exact: true }).click();
    const prefix = locale === "en" ? "" : `/${locale}`;
    await page.goto(`${base}${prefix}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);

    // All review slides must be reachable, fit the mobile viewport, and keep dates visible.
    const reviews = page.locator("main section").filter({ hasText: "ATHANASIOS" });
    for (let index = 0; index < 9; index++) {
      const tab = reviews.getByRole("tab").nth(index);
      await tab.click();
      await page.waitForFunction((label) => document.querySelector(`[aria-label="${label}"]`)?.getAttribute("aria-selected") === "true", `Review ${index + 1} of 9`);
      await page.waitForFunction((slideIndex) => {
        const viewport = document.querySelector(".review-carousel__viewport");
        const slide = viewport.querySelectorAll('[aria-roledescription="slide"]')[slideIndex];
        const frame = viewport.getBoundingClientRect();
        const card = slide.querySelector(".surface-card").getBoundingClientRect();
        return Math.abs(frame.height - card.height - 16) < 3 &&
          card.left >= frame.left - 1 && card.right <= frame.right + 1;
      }, index);
      const slide = reviews.locator('[aria-roledescription="slide"]').nth(index);
      assert.match(await slide.locator("time").getAttribute("datetime"), /^\d{4}-\d{2}(?:-\d{2})?$/);
    }
    await reviews.locator("button").last().click();
    await page.waitForFunction(() => document.querySelector('[aria-label="Review 1 of 9"]')?.getAttribute("aria-selected") === "true");
    console.log(`${locale}: review navigation and mobile heights passed`);

    await page.locator('header button[aria-controls="mobile-site-menu"]').click();
    const menu = page.locator("#mobile-site-menu");
    await menu.waitFor();
    const first = menu.locator("nav a").first();
    assert.ok((await first.getAttribute("href")).endsWith("/projects"));
    await first.click();
    await page.waitForURL(`**${prefix}/projects`);
    await page.locator("#project-category").selectOption("health-wellness");
    await page.waitForURL("**/projects/category/health-wellness");
    assert.equal(await page.locator("main article").count(), 4);
    console.log(`${locale}: mobile navigation and project filtering passed`);

    await page.goto(`${base}${prefix}/blog`, { waitUntil: "networkidle" });
    const articles = await page.locator("main article").count();
    await page.locator("#insights-search").fill("zz-no-matching-article-9919");
    await page.waitForFunction(() => document.querySelectorAll("main article").length === 0);
    await page.locator("#insights-search").fill("");
    await page.waitForFunction((count) => document.querySelectorAll("main article").length === count, articles);
    console.log(`${locale}: article search passed`);

    await page.goto(`${base}${prefix}/start-a-project`, { waitUntil: "networkidle" });
    const email = page.locator('input[type="email"]').first();
    await email.fill("invalid-email");
    assert.equal(await email.evaluate((el) => el.checkValidity()), false);
    await email.fill("preview@example.com");
    assert.equal(await email.evaluate((el) => el.checkValidity()), true);
    await email.focus();
    assert.ok(await email.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth) >= 2));
    assert.ok((await email.boundingBox()).height >= 48);
    console.log(`${locale}: form validity and keyboard focus passed`);

    // The learning finder changes local state only; no email or lead is submitted.
    await page.goto(`${base}${prefix}/resources/ai-prompt-packs`, { waitUntil: "networkidle" });
    const finder = page.locator("#find-your-pack");
    const back = () => finder.getByRole("button", { name: locale === "el" ? "Πίσω" : "Back", exact: true });
    await page.locator('label:has(input[name="experience"])').first().click();
    await back().click();
    await page.locator('label:has(input[name="experience"])').first().click();
    await page.locator('select').first().selectOption({ index: 1 });
    await back().click();
    await page.locator('select').first().selectOption({ index: 1 });
    await page.locator('label:has(input[name="language"]:checked)').click();
    await page.locator('input[type="email"]').waitFor();
    assert.ok(await page.locator("main h2").count());
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: `${output}/after/learning-result-${locale}-390.png` });
    report.push({ locale, reviewSlides: 9, navigation: true, category: true, search: true, form: true, finder: true });
    await context.close();
  }
} finally {
  await browser.close();
}
fs.writeFileSync(`${output}/interactions.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
