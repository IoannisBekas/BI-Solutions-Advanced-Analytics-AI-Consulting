import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

// QA inventory: complete directory, five category routes, 75 localized detail
// pages, locale-preserving navigation, live links, enquiry intent, mobile menu,
// no-JS discovery, image loading, overflow, hydration and unknown-route states.
// Use an artifact server that resolves /route to /route/index.html, rather
// than a SPA preview that returns homepage HTML for every route.
const origin = process.env.PORTFOLIO_QA_ORIGIN || "http://127.0.0.1:5177";
const projects = JSON.parse(
  await fs.readFile("shared/portfolio-projects.json", "utf8"),
);
const directory = "output/portfolio/qa";
await fs.mkdir(directory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = { checks: [], errors: [] };
const context = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage();
page.on("pageerror", (error) => report.errors.push(error.message));
page.on("console", (message) => {
  if (
    message.type() === "error" &&
    !message.text().startsWith("Failed to load resource:")
  )
    report.errors.push(message.text());
});
page.on("response", (response) => {
  if (response.status() >= 400 && !response.url().includes("does-not-exist"))
    report.errors.push(`HTTP ${response.status()}: ${response.url()}`);
});
const url = (locale, path) =>
  `${origin}${locale === "en" ? "" : `/${locale}`}${path}`;
const overflow = () =>
  page.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
    offenders: [...document.querySelectorAll("main *")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width && (rect.left < -1 || rect.right > innerWidth + 1);
      })
      .slice(0, 5)
      .map((element) => element.outerHTML.slice(0, 140)),
  }));

try {
  for (const locale of ["en", "el", "de"]) {
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 960 });
      await page.goto(url(locale, "/projects"), { waitUntil: "networkidle" });
      const rejectCookies = page.getByRole("button", {
        name: /^(Reject optional|Απόρριψη προαιρετικών|Optionale ablehnen)$/,
      });
      if (await rejectCookies.isVisible()) await rejectCookies.click();
      assert.equal(await page.locator("main article").count(), 25);
      const fit = await overflow();
      assert.ok(fit.scroll <= width + 1, JSON.stringify({ locale, ...fit }));
      assert.equal(fit.offenders.length, 0, JSON.stringify({ locale, ...fit }));
      assert.equal(await page.locator("main h1").count(), 1);
      if (width === 390 || width === 1440) {
        await page.screenshot({
          path: `${directory}/${locale}-directory-${width}.png`,
        });
        await page.locator("main article").first().scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `${directory}/${locale}-cards-${width}.png`,
        });
      }
      report.checks.push({
        locale,
        width,
        type: "directory",
        cards: 25,
        overflow: false,
      });
    }
    for (const category of [
      ...new Set(projects.map((project) => project.category)),
    ]) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(url(locale, `/projects/category/${category}`), {
        waitUntil: "networkidle",
      });
      assert.equal(
        await page.locator("main article").count(),
        projects.filter((project) => project.category === category).length,
      );
      assert.ok((await overflow()).scroll <= 391);
      report.checks.push({ locale, category, type: "category" });
    }
    for (const project of projects) {
      await page.goto(url(locale, `/projects/${project.slug}`), {
        waitUntil: "networkidle",
      });
      assert.equal(await page.locator("main h1").innerText(), project.title);
      const link = page.locator(`main a[href="${project.url}"]`);
      assert.equal(await link.getAttribute("target"), "_blank");
      assert.ok((await link.getAttribute("rel")).includes("noopener"));
      assert.ok(
        await page
          .locator("main figure img")
          .evaluate((image) => image.complete && image.naturalWidth > 0),
      );
      assert.ok((await overflow()).scroll <= 391);
      if (
        [
          "real-estate-dubai",
          "e-synergo",
          "subscription-bizops-dashboard",
        ].includes(project.slug)
      ) {
        await page.screenshot({
          path: `${directory}/${locale}-${project.slug}-390.png`,
        });
      }
      report.checks.push({
        locale,
        slug: project.slug,
        type: "detail",
        imageLoaded: true,
      });
    }
    // User-level navigation keeps the current language and correct category.
    await page.goto(url(locale, "/projects"), { waitUntil: "networkidle" });
    await page
      .locator(
        `main a[href="${locale === "en" ? "" : `/${locale}`}/projects/e-synergo"]`,
      )
      .first()
      .click();
    await page.waitForURL(url(locale, "/projects/e-synergo"));
    await page.locator("main nav a").first().click();
    await page.waitForURL(url(locale, "/projects"));
    // Mobile navigation opens and closes through real controls.
    await page.locator("header button[aria-expanded]").last().click();
    const dialog = page.locator('[role="dialog"][aria-modal="true"]');
    await dialog.waitFor();
    const navProjectLink = dialog.locator(
      `a[href="${locale === "en" ? "" : `/${locale}`}/projects"]:not([hreflang])`,
    );
    assert.equal(await navProjectLink.count(), 1);
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    report.checks.push({ locale, type: "navigation" });
    await page.goto(url(locale, "/projects/e-synergo"), { waitUntil: "networkidle" });
    const enquiry = page.locator('main a[href*="/start-a-project?"]').last();
    assert.equal(new URL(await enquiry.getAttribute("href"), origin).searchParams.get("need"), "web-app");
    await enquiry.click();
    await page.waitForURL(url(locale, "/start-a-project?need=web-app"));
    report.checks.push({ locale, type: "enquiry-navigation", need: "web-app" });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(url(locale, "/"), { waitUntil: "networkidle" });
    const featured = page.locator("#case-studies");
    await featured.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const featuredFit = await featured.evaluate(section => {
      const bounds = section.getBoundingClientRect();
      const buttons = section.querySelectorAll("button");
      return { bottom: bounds.bottom, controlsBottom: buttons[buttons.length - 1].getBoundingClientRect().bottom };
    });
    assert.ok(featuredFit.controlsBottom <= featuredFit.bottom, JSON.stringify({ locale, featuredFit }));
    assert.equal(await featured.locator(`a[href="${locale === "en" ? "" : `/${locale}`}/projects"]`).count(), 1);
    await page.screenshot({ path: `${directory}/${locale}-homepage-projects-1440.png` });
    report.checks.push({ locale, type: "homepage-project-link", controlsClipped: false });
    console.log(
      `${locale}: directory, categories, all 25 details and navigation passed.`,
    );
  }
  for (const path of [
    "/projects/does-not-exist",
    "/projects/category/does-not-exist",
  ]) {
    await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
    assert.ok(
      (
        await page.locator('meta[name="robots"]').getAttribute("content")
      ).includes("noindex"),
    );
    report.checks.push({ path, type: "not-found", noindex: true });
  }
  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJsContext.newPage();
  await noJsPage.goto(url("el", "/projects"));
  assert.equal(await noJsPage.locator("main article").count(), 25);
  report.checks.push({ type: "no-JavaScript", cards: 25 });
  await noJsContext.close();
  assert.deepEqual(report.errors, []);
  console.log(
    `Passed ${report.checks.length} browser checks; no page or console errors.`,
  );
} catch (error) {
  report.failure = error.stack;
  await page.screenshot({ path: `${directory}/failure.png` });
  console.error(error);
  process.exitCode = 1;
} finally {
  await fs.writeFile(
    `${directory}/report.json`,
    JSON.stringify(report, null, 2) + "\n",
  );
  await browser.close();
}
