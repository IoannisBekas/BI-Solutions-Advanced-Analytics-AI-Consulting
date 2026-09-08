import { build as viteBuild } from "vite";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import { getDeployBasePath } from "./deployBase";
import {
  DEFAULT_LOCALE,
  LOCALES,
  localePrefix,
  splitLocaleFromPath,
} from "../apps/client/src/i18n/config";
import {
  setPageTranslations,
  translatePageCopy,
} from "../apps/client/src/i18n/localizeDocument";
import { pageTranslations } from "../apps/client/src/i18n/pageTranslations.generated";

setPageTranslations(pageTranslations);

// Kept in sync with apps/client/src/components/seo/ssrHead.ts. Declared here
// too because the SSR bundle is loaded dynamically, without type info.
interface SsrHeadData {
  title: string;
  description: string;
  robots: string;
  keywords?: string;
  canonicalUrl: string;
  imageUrl: string;
  ogType: string;
  ogLocale: string;
  htmlLang: string;
  alternates?: Array<{ hreflang: string; href: string }>;
  structuredDataJson?: string;
}

interface PrerenderedPage {
  appHtml: string;
  head?: SsrHeadData;
}

type RenderPage = (ssrPath: string, pagePath: string) => Promise<PrerenderedPage>;

const SSR_OUT_DIR = path.resolve("dist", "ssr");
const PUBLIC_OUT_DIR = path.resolve("dist", "public");
const SITEMAP_PATH = path.resolve("apps", "client", "public", "sitemap.xml");
const ROOT_DIV = '<div id="root"></div>';

/** The sitemap is the canonical list of indexable routes — prerender exactly those. */
async function readRoutesFromSitemap() {
  const xml = await readFile(SITEMAP_PATH, "utf-8");
  const routes = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => new URL(match[1].trim()).pathname,
  );
  const normalized = routes.map((route) =>
    route !== "/" && route.endsWith("/") ? route.slice(0, -1) : route,
  );

  // The sitemap already lists the localised homepages, so prefixing every entry
  // blindly would emit /el/el and /de/el. Localise only the unprefixed routes.
  const canonicalRoutes = normalized.filter(
    (route) => splitLocaleFromPath(route).locale === DEFAULT_LOCALE,
  );

  // General site routes ship under every locale prefix. US acquisition pages
  // are English-only and link directly to the English inquiry flow.
  // Links inside a locale carry that prefix, so a route without a prerendered
  // file 404s on static hosting — the visitor is bounced through 404.html and a
  // crawler simply records a dead link. Untranslated pages still serve English
  // copy and canonicalise to the English URL, so nothing is indexed twice;
  // hreflang stays limited to TRANSLATED_ROUTES.
  const localised = canonicalRoutes.filter((route) => !route.startsWith("/us/")).flatMap((route) =>
    LOCALES.filter((locale) => locale !== DEFAULT_LOCALE).map(
      (locale) => `${localePrefix(locale)}${route === "/" ? "" : route}`,
    ),
  );

  return [...new Set([...normalized, ...localised])];
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function decodeReactText(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

interface LocalizedHtml {
  html: string;
  textReversions: Record<string, string[]>;
  attributeReversions: Record<string, string[]>;
}

function localizeRenderedHtml(html: string, route: string): LocalizedHtml {
  const { locale } = splitLocaleFromPath(route);
  if (locale === DEFAULT_LOCALE) {
    return { html, textReversions: {}, attributeReversions: {} };
  }

  const textReversions: Record<string, string[]> = {};
  const attributeReversions: Record<string, string[]> = {};
  const rememberTranslation = (
    target: Record<string, string[]>,
    original: string,
    translated: string,
  ) => {
    const source = original.replace(/\s+/g, " ").trim();
    const localized = translated.replace(/\s+/g, " ").trim();
    (target[localized] ??= []).push(source);
  };

  const localizedHtml = html
    .replace(/>([^<]+)</g, (match, text: string) => {
      const decoded = decodeReactText(text);
      const translated = translatePageCopy(decoded, locale);
      if (translated !== decoded) {
        rememberTranslation(textReversions, decoded, translated);
      }
      return translated === decoded ? match : `>${escapeHtmlAttribute(translated)}<`;
    })
    .replace(/\s(alt|aria-label|placeholder|title)="([^"]*)"/g, (match, attribute, value) => {
      const decoded = decodeReactText(value);
      const translated = translatePageCopy(decoded, locale);
      if (translated !== decoded) {
        rememberTranslation(attributeReversions, decoded, translated);
      }
      return translated === decoded
        ? match
        : ` ${attribute}="${escapeHtmlAttribute(translated)}"`;
    });

  return {
    html: localizedHtml,
    textReversions,
    attributeReversions,
  };
}

/**
 * React components still contain their English source strings. Restore those
 * strings immediately before hydration, then LocaleProvider reapplies the
 * localized catalogue after React attaches. The inline script runs during HTML
 * parsing, before deferred module scripts, so users never see the source copy.
 */
function buildPreHydrationScript(
  textReversions: Record<string, string[]>,
  attributeReversions: Record<string, string[]>,
) {
  if (
    Object.keys(textReversions).length === 0 &&
    Object.keys(attributeReversions).length === 0
  ) {
    return "";
  }

  const serialized = JSON.stringify({
    text: textReversions,
    attributes: attributeReversions,
  }).replace(/</g, "\\u003c");
  return `<script id="i18n-prehydrate">(()=>{const m=${serialized};const r=document.getElementById("root");if(!r)return;const take=(b,k)=>{const q=b[k];return q?.shift()};const w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT);while(w.nextNode()){const n=w.currentNode;const k=n.data.replace(/\\s+/g," ").trim();const v=take(m.text,k);if(v!==undefined)n.data=n.data.replace(k,v)}for(const e of r.querySelectorAll("*"))for(const a of ["alt","aria-label","placeholder","title"]){const s=e.getAttribute(a);if(!s)continue;const k=s.replace(/\\s+/g," ").trim();const v=take(m.attributes,k);if(v!==undefined)e.setAttribute(a,s.replace(k,v))}document.currentScript?.remove()})();</script>`;
}

function buildHeadBlock(head: SsrHeadData) {
  const meta = (attribute: "name" | "property", key: string, content: string) =>
    `<meta ${attribute}="${key}" content="${escapeHtmlAttribute(content)}" />`;

  const lines = [
    `<title>${escapeHtmlAttribute(head.title)}</title>`,
    meta("name", "description", head.description),
    meta("name", "robots", head.robots),
  ];

  if (head.keywords) {
    lines.push(meta("name", "keywords", head.keywords));
  }

  lines.push(
    `<link rel="canonical" href="${escapeHtmlAttribute(head.canonicalUrl)}" />`,
    meta("property", "og:site_name", "BI Solutions Group"),
    meta("property", "og:locale", head.ogLocale),
    meta("property", "og:title", head.title),
    meta("property", "og:description", head.description),
    meta("property", "og:url", head.canonicalUrl),
    meta("property", "og:type", head.ogType),
    meta("property", "og:image", head.imageUrl),
    meta("name", "twitter:card", "summary_large_image"),
    meta("name", "twitter:title", head.title),
    meta("name", "twitter:description", head.description),
    meta("name", "twitter:image", head.imageUrl),
  );

  for (const alternate of head.alternates ?? []) {
    lines.push(
      `<link rel="alternate" hreflang="${escapeHtmlAttribute(alternate.hreflang)}" href="${escapeHtmlAttribute(alternate.href)}" />`,
    );
  }

  if (head.structuredDataJson) {
    lines.push(
      `<script type="application/ld+json" id="seo-structured-data">${head.structuredDataJson.replace(/</g, "\\u003c")}</script>`,
    );
  }

  return lines.join("\n    ");
}

/** Drop the template's default title/description/social tags so the per-page block replaces them. */
function stripDefaultHeadTags(html: string) {
  return html
    .replace(/[ \t]*<title>[^<]*<\/title>\r?\n?/i, "")
    .replace(/[ \t]*<meta[^>]*name="description"[^>]*>\r?\n?/gi, "")
    .replace(/[ \t]*<meta[^>]*property="og:[^"]*"[^>]*>\r?\n?/gi, "")
    .replace(/[ \t]*<meta[^>]*name="twitter:[^"]*"[^>]*>\r?\n?/gi, "");
}

function renderTemplate(template: string, page: PrerenderedPage) {
  let html = template.replace(ROOT_DIV, `<div id="root">${page.appHtml}</div>`);

  if (page.head) {
    html = stripDefaultHeadTags(html);
    html = html.replace("</head>", `  ${buildHeadBlock(page.head)}\n</head>`);
    html = html.replace(
      /<html\s+lang="[^"]*"/i,
      `<html lang="${escapeHtmlAttribute(page.head.htmlLang)}"`,
    );
  }

  return html;
}

export async function prerenderClient() {
  console.log("building SSR bundle for prerendering...");
  await viteBuild({
    configFile: path.resolve("vite.config.ts"),
    build: {
      ssr: "src/entry-server.tsx",
      outDir: SSR_OUT_DIR,
      emptyOutDir: true,
    },
  });

  const template = await readFile(path.join(PUBLIC_OUT_DIR, "index.html"), "utf-8");
  if (!template.includes(ROOT_DIV)) {
    throw new Error(`Prerender template is missing '${ROOT_DIV}' — cannot inject page HTML.`);
  }

  const entryUrl = pathToFileURL(path.join(SSR_OUT_DIR, "entry-server.js")).href;
  const { renderPage } = (await import(entryUrl)) as { renderPage: RenderPage };

  const base = getDeployBasePath();
  const basePrefix = base === "/" ? "" : base.replace(/\/$/, "");

  for (const route of await readRoutesFromSitemap()) {
    const page = await renderPage(`${basePrefix}${route}`, route);
    const outFile =
      route === "/"
        ? path.join(PUBLIC_OUT_DIR, "index.html")
        : path.join(PUBLIC_OUT_DIR, ...route.slice(1).split("/"), "index.html");

    await mkdir(path.dirname(outFile), { recursive: true });
    const localized = localizeRenderedHtml(page.appHtml, route);
    const localizedPage = {
      ...page,
      appHtml: `${localized.html}${buildPreHydrationScript(
        localized.textReversions,
        localized.attributeReversions,
      )}`,
    };
    await writeFile(outFile, renderTemplate(template, localizedPage), "utf-8");
    console.log(
      `prerendered ${route}${page.head ? "" : " (no <Seo> data — kept default head)"}`,
    );
  }

  await rm(SSR_OUT_DIR, { recursive: true, force: true });
}

// Standalone entry: `npx tsx script/prerender.ts [--build-client]` rebuilds
// the prerendered pages without running the full multi-app build.
const isDirectRun =
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isDirectRun) {
  (async () => {
    if (process.argv.includes("--build-client")) {
      console.log("building client...");
      await viteBuild({ configFile: path.resolve("vite.config.ts") });
    }
    await prerenderClient();
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
