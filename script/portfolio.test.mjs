import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const projects = JSON.parse(read("shared/portfolio-projects.json"));
const manifest = JSON.parse(
  read("apps/client/public/assets/projects/manifest.json"),
);
const inventory = JSON.parse(read("shared/search-routes.json"));
const caseStudySlugs = [
  ...read("apps/client/src/data/caseStudies.ts").matchAll(
    /^\s*slug:\s*"([^"]+)"/gm,
  ),
].map((match) => match[1]);
const canonicalOrigin = "https://www.bisolutions.group";
const moduleScript = read("dist/public/index.html").match(
  /<script\b[^>]*\btype="module"[^>]*\bsrc="([^"]+)"/,
)?.[1];
assert.ok(moduleScript, "the production entrypoint must be present");
const buildBase = moduleScript.slice(0, moduleScript.indexOf("/assets/"));
const requestedUrls = [
  "https://e-synergo.gr/",
  "https://stavrosflamouridis.gr/",
  "https://boutique-pilates-wellness-studio.vercel.app/",
  ...[
    "Dental-Clinic-Website",
    "patty-gang",
    "kids-from-the-block",
    "meat-the-block",
    "kalamaki-club",
    "bubbletale",
    "bark-n-groom",
    "Barber",
    "Real-estate-Dubai",
    "Kalokairi-Boutique-Residence",
    "StudioKalliopiKoufonisia",
    "summer-sail",
    "gnv-hellas",
    "accounting-website-template",
    "margin-apparel",
    "Car",
    "niki-gigourtaki-coaching",
    "return-lab",
    "everywatch-market-dashboard",
    "opendoor-telemetry",
    "subscription-bizops-dashboard",
  ].map((slug) => `https://ioannisbekas.github.io/${slug}/`),
];
const localPath = (locale, route) =>
  `${locale === "en" ? "" : `/${locale}`}${route}`;
const caseStudyPath = (locale, slug) => {
  const route = `/case-studies/${slug}`;
  const available = inventory.routes.find(
    (item) => item.path === route,
  )?.locales;
  assert.ok(available, `missing case-study route: ${slug}`);
  return localPath(available.includes(locale) ? locale : "en", route);
};
const htmlFor = (locale, route) =>
  read(`dist/public${localPath(locale, route)}/index.html`);
const schemas = (html) =>
  [
    ...html.matchAll(
      /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].flatMap((match) => JSON.parse(match[1]));

test("all 24 requested URLs are represented once, with the existing PAROLI retained", () => {
  assert.equal(requestedUrls.length, 24);
  assert.equal(projects.length, 25);
  assert.equal(
    new Set(projects.map((project) => project.slug)).size,
    projects.length,
  );
  assert.equal(
    new Set(projects.map((project) => project.url)).size,
    projects.length,
  );
  for (const url of requestedUrls)
    assert.equal(
      projects.filter((project) => project.url === url).length,
      1,
      url,
    );
  assert.ok(
    projects.some(
      (project) => project.url === "https://ioannisbekas.github.io/paroli/",
    ),
  );
  assert.deepEqual(
    [...new Set(projects.map((project) => project.category))].sort(),
    [
      "corporate-commerce",
      "food-local-business",
      "health-wellness",
      "hospitality-real-estate",
      "web-apps-dashboards",
    ],
  );
});

test("all eight websites formerly featured on the homepage remain in the project directory", () => {
  const featuredUrls = [
    ...read("apps/client/src/data/websiteProjects.ts").matchAll(
      /href:\s*"([^"]+)"/g,
    ),
  ].map((match) => match[1]);
  assert.equal(featuredUrls.length, 8);
  const normalise = (href) => {
    const url = new URL(href);
    return `${url.origin}${url.pathname.replace(/\/$/, "")}`;
  };
  const urls = new Set(projects.map((project) => normalise(project.url)));
  for (const href of featuredUrls) assert.ok(urls.has(normalise(href)), href);
});

test("the homepage omits both portfolio sections while every case study is preserved in Projects", () => {
  assert.deepEqual(caseStudySlugs, [
    "risenfire-workforce-reporting",
    "unicef-audit-compliance",
    "iaea-scientific-analysis",
    "ifc-talent-strategy",
  ]);
  for (const locale of ["en", "el", "de"]) {
    const home = htmlFor(locale, "");
    assert.ok(!home.includes('id="case-studies"'));
    assert.ok(!home.includes('id="analytics-case-studies"'));
    const directory = htmlFor(locale, "/projects");
    const list = schemas(directory).find(
      (item) => item["@type"] === "ItemList",
    );
    for (const slug of caseStudySlugs) {
      const route = caseStudyPath(locale, slug);
      assert.ok(
        directory.includes(`href="${buildBase}${route}"`),
        `missing case card: ${locale}/${slug}`,
      );
      assert.ok(
        list.itemListElement.some(
          (item) => item.url === `${canonicalOrigin}${route}`,
        ),
      );
      const detail = read(`dist/public${route}/index.html`);
      assert.ok(
        detail.includes(`/projects#case-studies`),
        `missing return to Projects: ${route}`,
      );
    }
  }
});

test("each project has verified real screenshots and three complete content languages", () => {
  for (const project of projects) {
    const entry = manifest.find((item) => item.slug === project.slug);
    assert.equal(entry?.httpStatus, 200, project.slug);
    assert.equal(entry.sourceUrl, project.url);
    assert.equal(entry.assets.length, 3);
    for (const asset of entry.assets) {
      const bytes = fs.readFileSync(
        path.join(root, "apps/client/public/assets/projects", asset.file),
      );
      assert.equal(bytes.subarray(0, 4).toString(), "RIFF");
      assert.equal(bytes.subarray(8, 12).toString(), "WEBP");
      assert.ok(bytes.length < 250000, `${asset.file} should stay lightweight`);
    }
    for (const locale of ["en", "el", "de"]) {
      assert.ok(
        project.summary[locale].length > 70,
        `${project.slug}: ${locale}`,
      );
      assert.equal(project.features[locale].length, 3);
      if (locale !== "en")
        assert.notEqual(project.summary[locale], project.summary.en);
    }
  }
});

test("the complete directory is crawlable without JavaScript in each language", () => {
  for (const locale of ["en", "el", "de"]) {
    const html = htmlFor(locale, "/projects");
    const list = schemas(html).find((schema) => schema["@type"] === "ItemList");
    assert.equal(list.numberOfItems, projects.length + caseStudySlugs.length);
    assert.equal(
      list.itemListElement.length,
      projects.length + caseStudySlugs.length,
    );
    for (const project of projects) {
      const route = localPath(locale, `/projects/${project.slug}`);
      assert.ok(
        html.includes(`href="${buildBase}${route}"`),
        `${locale}: missing visible ${project.slug} link`,
      );
      assert.ok(
        list.itemListElement.some(
          (item) => item.url === `${canonicalOrigin}${route}`,
        ),
      );
    }
    const categoryLinks = [
      ...new Set(projects.map((project) => project.category)),
    ];
    for (const category of categoryLinks)
      assert.ok(
        html.includes(
          `href="${buildBase}${localPath(locale, `/projects/category/${category}`)}"`,
        ),
      );
  }
});

test("every project detail is prerendered, uses the submitted live URL and has discoverable metadata", () => {
  for (const project of projects)
    for (const locale of ["en", "el", "de"]) {
      const route = `/projects/${project.slug}`;
      assert.ok(
        inventory.routes.some(
          (item) => item.path === route && item.locales.includes(locale),
        ),
      );
      const html = htmlFor(locale, route);
      const schema = schemas(html).find(
        (item) => item["@type"] === "CreativeWork",
      );
      assert.equal(schema.workExample.url, project.url);
      assert.equal(schema.url, `${canonicalOrigin}${localPath(locale, route)}`);
      assert.ok(html.includes(`href="${project.url}"`));
      assert.ok(
        html.includes(
          `content="${canonicalOrigin}/assets/projects/${project.slug}/social.webp"`,
        ),
      );
      assert.ok(
        schemas(html).some((item) => item["@type"] === "BreadcrumbList"),
      );
      assert.equal((html.match(/<h1\b/g) || []).length, 1);
      assert.ok(!html.includes('content="noindex'));
      assert.ok(html.includes("srcSet=") || html.includes("srcset="));
    }
});
