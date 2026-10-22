import { writeFile } from "node:fs/promises";
import path from "node:path";
import sitemap from "./sitemap.cjs";

const sitemapPath = path.resolve("apps", "client", "public", "sitemap.xml");
const output = sitemap.buildSitemap();
const routes = sitemap.assertSitemapCoverage(output);
await writeFile(sitemapPath, output, "utf8");
console.log(`Wrote ${routes.length} sitemap URLs from the maintained search inventory.`);
