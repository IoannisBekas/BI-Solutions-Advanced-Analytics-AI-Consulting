import { build as viteBuild } from "vite";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import { getDeployBasePath } from "./deployBase";

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
  return [...new Set(normalized)];
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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
    meta("property", "og:locale", "en_US"),
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
    await writeFile(outFile, renderTemplate(template, page), "utf-8");
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
