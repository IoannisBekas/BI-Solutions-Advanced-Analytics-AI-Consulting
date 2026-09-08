const fs = require("node:fs");
const path = require("node:path");

const workspaceRoot = path.resolve(__dirname, "..");
const publicSource = path.join(workspaceRoot, "apps", "client", "public");
const builtPublic = path.join(workspaceRoot, "dist", "public");
const siteOrigin = "https://www.bisolutions.group";

function fail(message) {
  throw new Error(message);
}

function read(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`Missing ${path.relative(workspaceRoot, filePath)}. Run npm run build first.`);
  }

  return fs.readFileSync(filePath, "utf8");
}

function extractAttributeTag(html, tagName, attributeName, attributeValue) {
  const tags = html.match(new RegExp(`<${tagName}\\b[^>]*>`, "gi")) || [];
  return tags.find((tag) =>
    new RegExp(`\\b${attributeName}=["']${attributeValue}["']`, "i").test(tag),
  );
}

function attribute(tag, name) {
  return tag?.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] || "";
}

function visibleTextLength(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

function structuredDataTypes(html) {
  const types = new Set();
  const scripts = html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  function collect(value) {
    if (Array.isArray(value)) {
      value.forEach(collect);
      return;
    }

    if (!value || typeof value !== "object") return;
    const type = value["@type"];
    if (Array.isArray(type)) type.forEach((item) => types.add(item));
    else if (typeof type === "string") types.add(type);
    Object.values(value).forEach(collect);
  }

  for (const match of scripts) {
    try {
      collect(JSON.parse(match[1]));
    } catch (error) {
      fail(`Invalid JSON-LD: ${error.message}`);
    }
  }

  return types;
}

function expectedSchemaType(routePath) {
  if (routePath === "/") return "ProfessionalService";
  if (routePath === "/about") return "Person";
  if (routePath === "/services") return "Service";
  if (routePath.startsWith("/blog/")) return "BlogPosting";
  if (routePath.startsWith("/case-studies/")) return "CreativeWork";
  return null;
}

function splitLocalizedPath(routePath) {
  const match = /^\/(el|de)(?=\/|$)/.exec(routePath);
  const pathWithoutLocale = match ? routePath.slice(match[0].length) || "/" : routePath;
  return { locale: match?.[1] || "en", path: pathWithoutLocale };
}

function localizedUrl(routePath, locale) {
  const prefix = locale === "en" ? "" : `/${locale}`;
  const suffix = routePath === "/" ? "/" : routePath;
  return `${siteOrigin}${prefix}${suffix}`;
}

const sitemap = read(path.join(publicSource, "sitemap.xml"));
const sitemapEntries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(
  (match) => ({
    block: match[1],
    loc: match[1].match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim(),
  }),
);
const sitemapUrls = sitemapEntries.map((entry) => entry.loc).filter(Boolean);

if (sitemapUrls.length === 0) fail("The sitemap contains no URLs.");

const localeGroups = new Map();
for (const entry of sitemapEntries) {
  if (!entry.loc) fail("A sitemap entry is missing <loc>.");
  const url = new URL(entry.loc);
  const routePath = url.pathname === "/" ? "/" : url.pathname.replace(/\/$/, "");
  const { locale, path: basePath } = splitLocalizedPath(routePath);
  const group = localeGroups.get(basePath) ?? new Set();
  group.add(locale);
  localeGroups.set(basePath, group);

  const alternates = [...entry.block.matchAll(/<xhtml:link\b[^>]*>/g)].map(
    (match) => ({
      hreflang: attribute(match[0], "hreflang"),
      href: attribute(match[0], "href"),
    }),
  );
  const expectedAlternates = new Map([
    ["en", localizedUrl(basePath, "en")],
    ["el-GR", localizedUrl(basePath, "el")],
    ["de-DE", localizedUrl(basePath, "de")],
    ["x-default", localizedUrl(basePath, "en")],
  ]);
  // US acquisition pages are intentionally English-only.
  if (basePath.startsWith("/us/")) {
    expectedAlternates.delete("el-GR");
    expectedAlternates.delete("de-DE");
    if (locale !== "en") fail(`${entry.loc} must use the English US landing page.`);
  }
  if (alternates.length !== expectedAlternates.size) {
    fail(`${entry.loc} must have ${expectedAlternates.size} reciprocal hreflang entries.`);
  }
  for (const alternate of alternates) {
    if (expectedAlternates.get(alternate.hreflang) !== alternate.href) {
      fail(`${entry.loc} has an incorrect ${alternate.hreflang || "blank"} alternate.`);
    }
  }
}

for (const [basePath, locales] of localeGroups) {
  if (basePath.startsWith("/us/")) continue;
  if (!["en", "el", "de"].every((locale) => locales.has(locale))) {
    fail(`${basePath} is missing an English, Greek, or German sitemap URL.`);
  }
}

for (const canonicalUrl of sitemapUrls) {
  const url = new URL(canonicalUrl);
  if (url.origin !== siteOrigin) fail(`Unexpected sitemap origin: ${canonicalUrl}`);

  const routePath = url.pathname === "/" ? "/" : url.pathname.replace(/\/$/, "");
  const relativePath = routePath === "/" ? "index.html" : path.join(routePath.slice(1), "index.html");
  const html = read(path.join(builtPublic, relativePath));
  const canonicalTag = extractAttributeTag(html, "link", "rel", "canonical");
  const robotsTag = extractAttributeTag(html, "meta", "name", "robots");
  const descriptionTag = extractAttributeTag(html, "meta", "name", "description");
  const h1Count = (html.match(/<h1\b/gi) || []).length;

  if (attribute(canonicalTag, "href") !== canonicalUrl) {
    fail(`${routePath} has an incorrect canonical URL.`);
  }
  if (attribute(robotsTag, "content") !== "index,follow") {
    fail(`${routePath} must be indexable because it is in the sitemap.`);
  }
  if (attribute(descriptionTag, "content").trim().length < 50) {
    fail(`${routePath} is missing a useful meta description.`);
  }
  if (h1Count !== 1) fail(`${routePath} has ${h1Count} h1 elements; expected one.`);
  if (visibleTextLength(html) < 250) fail(`${routePath} has too little prerendered text.`);
  if (html.includes('<div id="root"></div>')) fail(`${routePath} contains an empty app shell.`);

  const schemaTypes = structuredDataTypes(html);
  if (schemaTypes.has("FAQPage")) {
    fail(`${routePath} contains FAQPage schema, which is not useful for this commercial site.`);
  }

  const expectedType = expectedSchemaType(splitLocalizedPath(routePath).path);
  if (expectedType && !schemaTypes.has(expectedType)) {
    fail(`${routePath} is missing ${expectedType} structured data.`);
  }
}

const robots = read(path.join(publicSource, "robots.txt"));
for (const agent of [
  "Googlebot",
  "OAI-SearchBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Applebot",
  "Google-Extended",
  "GPTBot",
  "ClaudeBot",
  "Applebot-Extended",
]) {
  const group = robots.match(
    new RegExp(`User-agent:\\s*${agent}\\s*([\\s\\S]*?)(?=\\n\\s*User-agent:|$)`, "i"),
  )?.[1];
  if (!group || !/^Allow:\s*\/\s*$/im.test(group)) {
    fail(`robots.txt does not explicitly allow ${agent}.`);
  }
}

if (!robots.includes(`Sitemap: ${siteOrigin}/sitemap.xml`)) {
  fail("robots.txt does not reference the canonical sitemap.");
}

const llms = read(path.join(publicSource, "llms.txt"));
const sitemapPaths = new Set(
  sitemapUrls.map((value) => new URL(value).pathname.replace(/\/$/, "") || "/"),
);
for (const match of llms.matchAll(/https:\/\/www\.bisolutions\.group\/[^\s)\]]*/g)) {
  const linkedPath = new URL(match[0]).pathname.replace(/\/$/, "") || "/";
  if (!sitemapPaths.has(linkedPath)) {
    fail(`llms.txt links to a page outside the sitemap: ${match[0]}`);
  }
}

console.log(`SEO checks passed for ${sitemapUrls.length} sitemap routes.`);
