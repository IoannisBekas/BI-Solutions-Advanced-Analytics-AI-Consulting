import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const sitemapPath = path.resolve("apps", "client", "public", "sitemap.xml");
const siteOrigin = "https://www.bisolutions.group";
const locales = [
  { hreflang: "en", prefix: "" },
  { hreflang: "el-GR", prefix: "/el" },
  { hreflang: "de-DE", prefix: "/de" },
];

function tagValue(block, tagName) {
  return block.match(new RegExp(`<${tagName}>([^<]+)</${tagName}>`))?.[1]?.trim();
}

function routeForLocale(route, prefix) {
  if (route === "/") return prefix ? `${prefix}/` : "/";
  return `${prefix}${route}`;
}

function urlFor(route, prefix) {
  return `${siteOrigin}${routeForLocale(route, prefix)}`;
}

const source = await readFile(sitemapPath, "utf8");
const sourceEntries = [...source.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(
  (match) => match[1],
);
const canonicalEntries = sourceEntries
  .map((block) => {
    const loc = tagValue(block, "loc");
    if (!loc) throw new Error("Sitemap entry is missing <loc>.");
    const route = new URL(loc).pathname.replace(/\/$/, "") || "/";
    return {
      route,
      lastmod: tagValue(block, "lastmod"),
      changefreq: tagValue(block, "changefreq"),
      priority: tagValue(block, "priority"),
    };
  })
  .filter(({ route }) => !/^\/(?:el|de)(?:\/|$)/.test(route));

const seenRoutes = new Set();
const uniqueEntries = canonicalEntries.filter(({ route }) => {
  if (seenRoutes.has(route)) return false;
  seenRoutes.add(route);
  return true;
});

const body = uniqueEntries.flatMap((entry) =>
  locales.map(({ prefix }) => {
    const alternates = [
      ...locales.map(
        (locale) =>
          `    <xhtml:link rel="alternate" hreflang="${locale.hreflang}" href="${urlFor(entry.route, locale.prefix)}" />`,
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(entry.route, "")}" />`,
    ].join("\n");
    const metadata = [
      entry.lastmod && `    <lastmod>${entry.lastmod}</lastmod>`,
      entry.changefreq && `    <changefreq>${entry.changefreq}</changefreq>`,
      entry.priority && `    <priority>${entry.priority}</priority>`,
    ]
      .filter(Boolean)
      .join("\n");

    return `  <url>\n    <loc>${urlFor(entry.route, prefix)}</loc>\n${alternates}\n${metadata}\n  </url>`;
  }),
).join("\n");

const output = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`;

await writeFile(sitemapPath, output, "utf8");
console.log(`Wrote ${uniqueEntries.length * locales.length} localized sitemap URLs.`);
