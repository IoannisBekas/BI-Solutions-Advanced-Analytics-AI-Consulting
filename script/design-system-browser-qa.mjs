import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const phase = process.argv.includes("--before") ? "before" : "after";
const baseUrl = process.env.DESIGN_QA_URL || "http://127.0.0.1:5001";
const output = path.resolve("output/playwright/design-system");
const inventory = JSON.parse(fs.readFileSync("shared/search-routes.json", "utf8"));
const representativePaths = new Set([
  "/", "/projects", "/projects/category/health-wellness", "/projects/e-synergo",
  "/services", "/services/power-bi-consulting", "/services/ai-automation",
  "/case-studies/unicef-audit-compliance", "/about", "/start-a-project",
  "/blog", "/blog/website-web-app-development-greece-business-needs",
  "/resources/ai-prompt-packs", "/privacy-policy", "/terms-of-service",
  "/us/power-bi-consulting", "/us/ai-automation", "/online-paraggelies",
]);
const routes = inventory.routes.filter((route) => route.render === "react" &&
  (process.argv.includes("--full") || representativePaths.has(route.path)));
const widths = process.argv.includes("--edges") ? [320, 1024, 1920] : [390, 768, 1440];
const jobs = routes.flatMap((route) => route.locales.flatMap((locale) =>
  widths.map((width) => ({
    path: `${locale === "en" ? "" : `/${locale}`}${route.path}`,
    locale, width,
    screenshot: locale === "el" && ["/", "/projects", "/about", "/services", "/blog", "/start-a-project", "/resources/ai-prompt-packs"].includes(route.path),
  }))));
fs.mkdirSync(path.join(output, phase), { recursive: true });
const baseline = phase === "after" && fs.existsSync(path.join(output, "before.json"))
  ? JSON.parse(fs.readFileSync(path.join(output, "before.json"), "utf8")) : [];
const results = [];
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ reducedMotion: "reduce" });
try {
  const consentPage = await context.newPage();
  await consentPage.goto(baseUrl, { waitUntil: "networkidle" });
  await consentPage.getByRole("button", { name: "Reject optional", exact: true }).click();
  await consentPage.close();
  let cursor = 0;
  await Promise.all(Array.from({ length: 3 }, async () => {
    const page = await context.newPage();
    let errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      errors = [];
      try {
        await page.setViewportSize({ width: job.width, height: 1050 });
        await page.goto(`${baseUrl}${job.path}`, { waitUntil: "networkidle" });
        await page.locator("main h1").first().waitFor();
        await page.evaluate(() => document.fonts.ready);
        const snapshot = await page.evaluate(() => {
          const main = document.querySelector("main");
          const clean = (s) => s.replace(/\s+/g, " ").trim();
          const headings = [...main.querySelectorAll("h1,h2,h3")].map((el) => ({
            tag: el.tagName, text: clean(el.textContent),
          }));
          const clipping = [...main.querySelectorAll("h1,h2,h3,p,button,input,select,textarea,a")]
            .filter((el) => {
              const box = el.getBoundingClientRect();
              return box.width && box.height && !el.closest('[aria-roledescription="carousel"]') &&
                (box.left < -2 || box.right > innerWidth + 2);
            }).map((el) => ({ tag: el.tagName, text: clean(el.textContent).slice(0, 90) }));
          const h1 = main.querySelector("h1");
          const style = getComputedStyle(h1);
          return {
            text: clean(main.textContent), headings,
            links: [...main.querySelectorAll("a[href]")].map((el) => el.getAttribute("href")).sort(),
            title: document.title,
            canonical: document.querySelector('link[rel="canonical"]')?.href,
            description: document.querySelector('meta[name="description"]')?.content,
            alternates: [...document.querySelectorAll('link[rel="alternate"]')].map((el) => el.outerHTML).sort(),
            schema: [...document.querySelectorAll('script[type="application/ld+json"]')].map((el) => el.textContent),
            h1Style: { font: style.fontFamily, size: style.fontSize, lineHeight: style.lineHeight },
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            clipping,
          };
        });
        const { text, ...details } = snapshot;
        const textHash = createHash("sha256").update(text).digest("hex");
        const previous = baseline.find((r) => r.path === job.path && r.width === job.width);
        const preservation = previous ? ["textHash", "headings", "links", "title", "canonical", "description", "alternates", "schema"]
          .filter((key) => JSON.stringify(previous[key]) !== JSON.stringify(({ ...details, textHash })[key])) : [];
        if (job.screenshot) {
          await page.waitForTimeout(400);
          const name = `${job.path.replaceAll("/", "_").replace(/^_/, "") || "home"}-${job.width}`;
          await page.screenshot({ path: path.join(output, phase, `${name}.png`) });
          if (job.path === "/el/projects") {
            await page.locator("main > section").first().screenshot({ path: path.join(output, phase, `projects-panel-${job.width}.png`) });
          }
          if (job.path === "/el/") {
            const section = page.locator("main section").filter({ hasText: "ATHANASIOS" });
            await section.evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 24, behavior: "instant" }));
            await page.waitForTimeout(400);
            await page.screenshot({ path: path.join(output, phase, `reviews-${job.width}.png`) });
          }
        }
        results.push({ ...job, ...details, textHash, preservation, errors });
      } catch (error) {
        results.push({ ...job, failure: error.message });
      }
      if (results.length % 30 === 0) console.log(`${phase}: ${results.length}/${jobs.length} pages checked`);
    }
    await page.close();
  }));
} finally {
  await browser.close();
}
results.sort((a, b) => a.path.localeCompare(b.path) || a.width - b.width);
fs.writeFileSync(path.join(output, `${phase}${process.argv.includes("--edges") ? "-edges" : ""}.json`), JSON.stringify(results, null, 2));
const issues = results.filter((r) => r.failure || r.errors?.length || r.overflow || r.clipping?.length || r.preservation?.length);
console.log(JSON.stringify({ phase, pages: results.length, issues: issues.map(({ path, width, failure, overflow, clipping, errors, preservation }) => ({ path, width, failure, overflow, clipping, errors, preservation })) }, null, 2));
if (phase === "after" && issues.length) process.exitCode = 1;
