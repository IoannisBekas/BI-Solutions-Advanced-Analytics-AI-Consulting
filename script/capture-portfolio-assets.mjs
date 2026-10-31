import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

// Capture real project interfaces; never substitute a guessed website preview.
const projects = JSON.parse(
  await fs.readFile("shared/portfolio-projects.json", "utf8"),
);
const directory = path.resolve("output/portfolio/raw");
await fs.mkdir(directory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
let next = 0;
await Promise.all(
  Array.from({ length: 3 }, async () => {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    while (next < projects.length) {
      const project = projects[next++];
      try {
        const response = await page.goto(project.url, {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });
        if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
        await page.waitForTimeout(5000);
        await page.evaluate(async () => {
          await Promise.race([
            document.fonts.ready,
            new Promise((resolve) => setTimeout(resolve, 3000)),
          ]);
          await Promise.race([
            Promise.all(
              Array.from(document.images)
                .filter(
                  (image) => image.getBoundingClientRect().top < innerHeight,
                )
                .map((image) => image.decode().catch(() => {})),
            ),
            new Promise((resolve) => setTimeout(resolve, 5000)),
          ]);
        });
        await page.screenshot({
          path: path.join(directory, `${project.slug}.png`),
        });
        const record = {
          slug: project.slug,
          url: project.url,
          finalUrl: page.url(),
          status: response.status(),
          title: await page.title(),
          excerpt: (await page.locator("body").innerText())
            .replace(/\s+/g, " ")
            .slice(0, 2500),
          capturedAt: new Date().toISOString(),
        };
        results.push(record);
        console.log(`${project.slug}: ${record.status} ${record.title}`);
      } catch (error) {
        results.push({
          slug: project.slug,
          url: project.url,
          error: error.message,
        });
        console.log(`${project.slug}: FAILED ${error.message}`);
      }
    }
    await page.close();
  }),
);
await browser.close();
await fs.writeFile(
  "output/portfolio/capture-report.json",
  JSON.stringify(results, null, 2) + "\n",
);
if (results.some((result) => result.error)) process.exitCode = 1;
