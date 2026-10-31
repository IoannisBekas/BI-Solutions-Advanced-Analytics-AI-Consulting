const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const liveBaseline = require("./fixtures/search-routes-live-2026-10-22.json");
const { inventory, canonicalRoutes, buildSitemap, assertSitemapCoverage } = require("./sitemap.cjs");

test("the committed sitemap matches the maintained inventory and preserves the live baseline", () => {
  const sitemap = fs.readFileSync(path.join(__dirname, "../apps/client/public/sitemap.xml"), "utf8");
  assert.doesNotThrow(() => assertSitemapCoverage(sitemap));
  assert.equal(sitemap.replace(/\r\n/g, "\n"), buildSitemap());
});

test("the release adds the approved service, restaurant, client case and portfolio pages to the live URL set", () => {
  const baseline = new Set(liveBaseline.paths);
  const additions = canonicalRoutes().map((route) => route.path).filter((route) => !baseline.has(route));
  const projects = require("../shared/portfolio-projects.json");
  const categories = [...new Set(projects.map((project) => project.category))];
  const projectPaths = ["/projects", ...categories.map((category) => `/projects/category/${category}`), ...projects.map((project) => `/projects/${project.slug}`)];
  const portfolioAdditions = projectPaths.flatMap((projectPath) => [projectPath, `/el${projectPath}`, `/de${projectPath}`]);
  assert.deepEqual(additions.sort(), ["/case-studies/risenfire-workforce-reporting", "/el/online-paraggelies", "/services/ai-automation", "/services/power-bi-consulting", ...portfolioAdditions].sort());
});

test("dropping a translated URL from XML fails coverage", () => {
  const sitemap = buildSitemap().replace(/  <url>\n    <loc>https:\/\/www\.bisolutions\.group\/el\/about<\/loc>[\s\S]*?<\/url>\n/, "");
  assert.throws(() => assertSitemapCoverage(sitemap), /Missing: https:\/\/www\.bisolutions\.group\/el\/about/);
});

test("removing live routes from both inventory and regenerated XML still fails", () => {
  for (const path of ["/about", "/us/power-bi-consulting", "/btc-companies/"]) {
    const changed = structuredClone(inventory);
    changed.routes = changed.routes.filter((route) => route.path !== path);
    assert.throws(() => assertSitemapCoverage(buildSitemap(changed), changed), /Previously live route .* disappeared/);
  }
});

test("duplicate sitemap URLs and duplicate inventory routes fail", () => {
  const duplicateXml = buildSitemap().replace("</urlset>", `<url><loc>${inventory.origin}/about</loc></url></urlset>`);
  assert.throws(() => assertSitemapCoverage(duplicateXml), /Duplicate URLs/);
  const changed = structuredClone(inventory);
  changed.routes.push(changed.routes[0]);
  assert.throws(() => assertSitemapCoverage(buildSitemap(changed), changed), /Duplicate routes/);
});

test("focused services stay English-only while US pages retain their own canonical URLs", () => {
  const routes = canonicalRoutes();
  for (const slug of ["power-bi-consulting", "ai-automation"]) {
    const focused = routes.filter((route) => route.path.endsWith(`/services/${slug}`));
    assert.deepEqual(focused.map((route) => route.path), [`/services/${slug}`]);
    assert.deepEqual(focused[0].alternates, [
      { hreflang: "en", href: `${inventory.origin}/services/${slug}` },
      { hreflang: "x-default", href: `${inventory.origin}/services/${slug}` },
    ]);
    assert.ok(routes.some((route) => route.path === `/us/${slug}` && route.locale === "en"));
  }
});

test("the unified restaurant page has one Greek canonical URL and no indexed legacy alias", () => {
  const routes = canonicalRoutes();
  const entries = routes.filter((route) => route.path.endsWith("/online-paraggelies"));
  assert.deepEqual(entries.map((route) => route.path), ["/el/online-paraggelies"]);
  assert.deepEqual(entries[0].alternates, []);
  assert.equal(entries[0].render, "react");
  assert.equal(routes.some((route) => route.path.endsWith("/meiosi-kostous-delivery")), false);
});

test("translated pages have reciprocal alternates and prompt packs retain only their real languages", () => {
  const routes = canonicalRoutes();
  for (const route of routes.filter((entry) => entry.path.endsWith("/about"))) {
    assert.deepEqual(route.alternates, [
      { hreflang: "en", href: `${inventory.origin}/about` },
      { hreflang: "el-GR", href: `${inventory.origin}/el/about` },
      { hreflang: "de-DE", href: `${inventory.origin}/de/about` },
      { hreflang: "x-default", href: `${inventory.origin}/about` },
    ]);
  }
  const packs = routes.filter((route) => route.path.endsWith("/resources/ai-prompt-packs"));
  assert.deepEqual(packs.map((route) => route.locale), ["en", "el"]);
});

test("Windows line endings are accepted but missing language alternates are rejected", () => {
  assert.doesNotThrow(() => assertSitemapCoverage(buildSitemap().replace(/\n/g, "\r\n")));
  const changed = buildSitemap().replace(/    <xhtml:link rel="alternate" hreflang="el-GR"[^>]+\/>\n/, "");
  assert.throws(() => assertSitemapCoverage(changed), /Sitemap alternates or metadata differ/);
});

test("all production treasury trackers remain standalone pages without invented locales", () => {
  const routes = canonicalRoutes();
  for (const ticker of ["bnb", "sol", "btc"]) {
    const tracker = routes.filter((route) => route.path.endsWith(`/${ticker}-companies/`));
    assert.equal(tracker.length, 1);
    assert.equal(tracker[0].render, "static");
    assert.equal(tracker[0].locale, "en");
    assert.deepEqual(tracker[0].alternates, []);
  }
});
