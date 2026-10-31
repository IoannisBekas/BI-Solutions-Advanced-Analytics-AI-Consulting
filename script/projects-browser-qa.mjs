import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const origin = process.env.PROJECTS_QA_URL || "http://127.0.0.1:5001";
const output = "output/playwright/projects-compact";
fs.mkdirSync(output, { recursive: true });
const baseline = fs.existsSync(`${output}/before.json`) ? JSON.parse(fs.readFileSync(`${output}/before.json`, "utf8")) : [];
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const report = [];
const meta = () => page.evaluate(() => {
  const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .flatMap((el) => { const data = JSON.parse(el.textContent); return Array.isArray(data) ? data : [data]; });
  return {
    canonical: document.querySelector('link[rel="canonical"]').href,
    count: schemas.find((schema) => schema["@type"] === "ItemList").numberOfItems,
  };
});
const fit = async () => {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  const overflow = await page.locator("main article").evaluateAll((nodes) => nodes.some((el) => {
    const box = el.getBoundingClientRect();
    return box.left < -1 || box.right > innerWidth + 1;
  }));
  assert.equal(overflow, false);
};

try {
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Reject optional", exact: true }).click();
  for (const locale of ["en", "el", "de"]) for (const width of [320, 390, 768, 1024, 1440]) {
    const prefix = locale === "en" ? "" : `/${locale}`;
    const labels = {
      en: { compact: "Compact", cards: "Cards", clear: "Clear search" },
      el: { compact: "Σύνοψη", cards: "Κάρτες", clear: "Καθαρισμός αναζήτησης" },
      de: { compact: "Kompakt", cards: "Karten", clear: "Suche löschen" },
    }[locale];
    await page.setViewportSize({ width, height: 1050 });
    await page.goto(`${origin}${prefix}/projects`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator("main article").count(), 29);
    assert.equal(await page.locator(".projects-page").getAttribute("data-view"), "compact");
    const originalMeta = await meta();
    assert.equal(originalMeta.count, 29);
    const links = await page.locator("main article a").evaluateAll((nodes) => nodes.map((el) => el.getAttribute("href")).sort());
    assert.equal(new Set(links).size, 29);
    const before = baseline.find((item) => item.locale === locale && item.width === width);
    if (before) assert.deepEqual(links, before.links);
    const compactHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    await fit();
    const screenshot = (locale === "en" && width === 1440) || (locale === "el" && width === 390);
    if (screenshot) {
      await page.screenshot({ path: `${output}/after-${locale}-${width}.png` });
      await page.locator("main article").first().evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - (innerWidth < 768 ? 240 : 180), behavior: "instant" }));
      await page.waitForTimeout(200);
      await page.screenshot({ path: `${output}/compact-${locale}-${width}.png` });
    }
    await page.getByRole("button", { name: labels.cards, exact: true }).click();
    assert.equal(await page.locator("main article").count(), 29);
    const detailedHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    assert.ok(detailedHeight > compactHeight * 1.5);
    await fit();
    await page.getByRole("button", { name: labels.compact, exact: true }).click();

    // Searching while far down the catalogue should bring the matches into view.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.6));
    const search = page.locator("#project-search");
    await search.fill("dental");
    assert.equal(await page.locator("main article").count(), 1);
    const match = await page.locator("main article").boundingBox();
    const toolbar = await page.locator(".projects-toolbar").boundingBox();
    assert.ok(match.y >= toolbar.y + toolbar.height - 2 && match.y < 1050, `${locale} ${width}: search match hidden behind toolbar`);
    assert.deepEqual(await meta(), originalMeta);
    await search.fill("unicef");
    assert.equal(await page.locator("main article").count(), 1);
    assert.ok((await page.locator("main article a").first().getAttribute("href")).includes("unicef-audit-compliance"));
    if (locale === "el") {
      await search.fill("υγεια");
      assert.equal(await page.locator("main article").count(), 4);
    }
    await search.fill("zz-no-matching-project-9919");
    assert.equal(await page.locator("main article").count(), 0);
    await page.locator("#project-results").getByRole("button", { name: labels.clear, exact: true }).click();
    assert.equal(await page.locator("main article").count(), 29);
    assert.equal(await search.evaluate((el) => el === document.activeElement), true);
    await fit();

    if (width < 768) await page.locator("#project-category").selectOption("health-wellness");
    else await page.locator('main nav a[href$="/projects/category/health-wellness"]').click();
    await page.waitForURL(`${origin}${prefix}/projects/category/health-wellness`);
    assert.equal(await page.locator("main article").count(), 4);
    assert.equal((await meta()).count, 4);
    await page.locator("#project-search").fill("e-synergo");
    assert.equal(await page.locator("main article").count(), 1);
    await fit();
    assert.deepEqual(errors, []);
    report.push({ locale, width, entries: 29, compactHeight, detailedHeight, beforeHeight: before?.height, reduction: before ? Math.round(100 * (1 - compactHeight / before.height)) : null, passed: true });
    console.log(`${locale} ${width}: passed`);
  }
  fs.writeFileSync(`${output}/qa.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally {
  await browser.close();
}
