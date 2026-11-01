const inventory = require("../shared/search-routes.json");
const liveBaseline = require("./fixtures/search-routes-live-2026-10-22.json");
const publicRedirects = require("../shared/public-redirects.json");
const localeTags = { en: "en", el: "el-GR", de: "de-DE" };

function routeForLocale(route, locale) {
  return locale === "en" ? route : `/${locale}${route === "/" ? "/" : route}`;
}

function canonicalRoutes(source = inventory) {
  return source.routes.flatMap((route) => {
    if (!route.path.startsWith("/") || /[?#]/.test(route.path)) {
      throw new Error(`Invalid canonical route: ${route.path}`);
    }
    const alternates = route.render === "static" || (route.locales.length === 1 && route.locales[0] !== "en") ? [] : [
      ...route.locales.map((locale) => ({
        hreflang: localeTags[locale],
        href: `${source.origin}${routeForLocale(route.path, locale)}`,
      })),
      { hreflang: "x-default", href: `${source.origin}${route.path}` },
    ];
    return route.locales.map((locale) => {
      if (!localeTags[locale]) throw new Error(`Unsupported locale: ${locale}`);
      const routePath = routeForLocale(route.path, locale);
      return { ...route, path: routePath, url: `${source.origin}${routePath}`, locale, alternates };
    });
  });
}

function buildSitemap(source = inventory) {
  const entries = canonicalRoutes(source).map((route) => [
    "  <url>",
    `    <loc>${route.url}</loc>`,
    ...route.alternates.map((alternate) => `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${alternate.href}" />`),
    ...["lastmod", "changefreq", "priority"].flatMap((field) =>
      route[field] ? [`    <${field}>${route[field]}</${field}>`] : [],
    ),
    "  </url>",
  ].join("\n"));
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- Generated from shared/search-routes.json by npm run generate:sitemap. -->',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");
}

function assertSitemapCoverage(xml, source = inventory, baseline = liveBaseline) {
  const routes = canonicalRoutes(source);
  const expected = new Set(routes.map((route) => route.url));
  if (expected.size !== routes.length) throw new Error("Duplicate routes in the search inventory.");
  const actual = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
  if (new Set(actual).size !== actual.length) throw new Error("Duplicate URLs in sitemap.xml.");
  const missing = [...expected].filter((url) => !actual.includes(url));
  const unexpected = actual.filter((url) => !expected.has(url));
  if (missing.length || unexpected.length) {
    throw new Error(`Sitemap inventory mismatch. Missing: ${missing.join(", ") || "none"}. Unexpected: ${unexpected.join(", ") || "none"}. Run npm run generate:sitemap.`);
  }
  for (const routePath of baseline.paths) {
    if (!expected.has(`${source.origin}${routePath}`)) {
      throw new Error(`Previously live route ${routePath} disappeared. Restore it before release.`);
    }
  }
  if (xml.replace(/\r\n/g, "\n") !== buildSitemap(source)) {
    throw new Error("Sitemap alternates or metadata differ from the route inventory. Run npm run generate:sitemap.");
  }
  return routes;
}

/** Static-host counterpart to the production server's permanent redirects. */
function redirectDocument(destination, deployBase = "/", locale = "en") {
  const target = `${inventory.origin}${destination}`;
  const deploymentTarget = `${deployBase.replace(/\/$/, "")}${destination}`;
  const copy = {
    en: ["Page moved", "This page has moved.", "Continue to the page"],
    el: ["Η σελίδα μεταφέρθηκε", "Αυτή η σελίδα έχει μεταφερθεί.", "Συνέχεια στη σελίδα"],
    de: ["Seite verschoben", "Diese Seite wurde verschoben.", "Weiter zur Seite"],
  }[locale];
  return `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${copy[0]} | BI Solutions Group</title>
  <meta name="robots" content="noindex,follow" />
  <link rel="canonical" href="${target}" />
  <script>window.location.replace(${JSON.stringify(deploymentTarget)} + window.location.search + window.location.hash);</script>
  <noscript><meta http-equiv="refresh" content="0;url=${deploymentTarget}" /></noscript>
</head>
<body><p>${copy[1]} <a href="${deploymentTarget}">${copy[2]}</a>.</p></body>
</html>
`;
}

module.exports = { inventory, canonicalRoutes, buildSitemap, assertSitemapCoverage, publicRedirects, redirectDocument };
