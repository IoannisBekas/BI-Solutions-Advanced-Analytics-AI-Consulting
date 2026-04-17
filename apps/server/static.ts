import express, { type Express, type Response } from "express";
import fs from "fs";
import path from "path";

function injectScriptNonce(html: string, nonce: string): string {
  // Add nonce="..." to every <script tag that doesn't already have one.
  return html.replace(/<script(?![^>]*\snonce=)([^>]*)>/gi, `<script nonce="${nonce}"$1>`);
}

function sendHtmlWithNonce(res: Response, html: string) {
  const nonce = (res.locals.cspNonce as string) || "";
  const output = nonce ? injectScriptNonce(html, nonce) : html;
  res.type("html").send(output);
}

// Blog post meta — keep in sync with client/src/data/blogData.ts
const blogPostMeta: Record<string, { title: string; description: string }> = {
  "google-gemini-import-ai-chats": {
    title: "Google Gemini is Making it Easy to Quit ChatGPT, Claude and other LLMs",
    description: "Google is testing a breakthrough 'Import AI chats' feature that allows users to migrate their entire conversation histories from rival platforms directly into Gemini.",
  },
  "power-bi-solutions-semantic-model-analysis-workspace": {
    title: "Why Power BI Solutions Deserves a Dedicated Semantic Model Workspace",
    description: "Power BI Solutions brings TMDL review, semantic model diagnostics, AI guidance, and product-specific authentication into a focused workspace hosted directly on the BI Solutions domain.",
  },
};

function redirectLegacyProductPath(app: Express, fromPath: string, toPath: string) {
  app.use((req, res, next) => {
    if (req.method === "GET" && req.originalUrl === fromPath) {
      res.redirect(308, toPath);
      return;
    }

    next();
  });
}

function serveProductSpa(app: Express, mountPath: string, productDistPath: string) {
  if (!fs.existsSync(productDistPath)) {
    return;
  }

  const indexPath = path.resolve(productDistPath, "index.html");
  const indexHtml = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, "utf-8") : "";

  app.use(mountPath, express.static(productDistPath, { index: false }));
  app.use(`${mountPath}/*`, (_req, res) => {
    sendHtmlWithNonce(res, indexHtml);
  });
}

interface RouteMeta {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
}

const BASE_URL = "https://bisolutions.group";
const DEFAULT_OG_IMAGE = `${BASE_URL}/bi-solutions-logo.png`;

const routeMetaMap: Record<string, RouteMeta> = {
  "/": {
    title: "BI Solutions Group — Advanced Analytics & AI Consulting",
    description: "Digital transformation, advanced analytics, and AI delivery for enterprise data platforms and intelligent organizations.",
    path: "/",
  },
  "/products": {
    title: "Products — BI Solutions Group",
    description: "Purpose-built analytics products: Quantus Investing, Power BI Solutions, Greek AI Professional Advisor, and Website & App Portfolio.",
    path: "/products",
  },
  "/quantus": {
    title: "Quantus Investing — Institutional-Grade Quantitative Research",
    description: "Search markets, load research faster, and surface signals across equities, ETFs, crypto, and commodities with Quantus Investing.",
    path: "/quantus",
  },
  "/power-bi-solutions": {
    title: "Power BI Solutions — Semantic Model Analysis & AI Optimization",
    description: "Upload TMDL files, review semantic models, and get AI-powered guidance to optimize your Power BI data architecture.",
    path: "/power-bi-solutions",
  },
  "/ai-advisor": {
    title: "Greek AI Professional Advisor — AI for Accountants, Lawyers & Consultants",
    description: "AI-powered professional guidance trained on Greek law and business practices for accountants, lawyers, and consultants.",
    path: "/ai-advisor",
  },
  "/website-app-portfolio": {
    title: "Website & App Portfolio — BI Solutions Group",
    description: "Full-stack web development portfolio: personal brand websites, organization sites, and education platforms.",
    path: "/website-app-portfolio",
  },
  "/services": {
    title: "Services — BI Solutions Group",
    description: "Digital transformation, cloud migration, advanced analytics, statistical modeling, and business intelligence services.",
    path: "/services",
  },
  "/about": {
    title: "About — BI Solutions Group",
    description: "Ioannis Bekas — Data Scientist & AI Developer with 9+ years delivering analytics, customer insight, and product innovation.",
    path: "/about",
  },
  "/contact": {
    title: "Contact — BI Solutions Group",
    description: "Book a consultation, find us on Google Maps, or send a message to discuss your analytics and AI project.",
    path: "/contact",
  },
  "/blog": {
    title: "Blog — BI Solutions Group",
    description: "Insights on analytics, AI, data engineering, and digital transformation from BI Solutions Group.",
    path: "/blog",
  },
  "/portfolio": {
    title: "Portfolio and Selected Analytics Work — BI Solutions Group",
    description: "See BI Solutions portfolio work across UNICEF, IAEA, IFC, and strategic partnerships delivering analytics, dashboards, and digital transformation.",
    path: "/portfolio",
  },
  "/privacy-policy": {
    title: "Privacy Policy — BI Solutions Group",
    description: "Privacy policy for bisolutions.group — how we collect, use, and protect your data.",
    path: "/privacy-policy",
  },
  "/terms-of-service": {
    title: "Terms of Service — BI Solutions Group",
    description: "Terms of service for bisolutions.group.",
    path: "/terms-of-service",
  },
};

function injectMeta(html: string, meta: RouteMeta): string {
  const ogImage = meta.ogImage || DEFAULT_OG_IMAGE;
  const fullUrl = `${BASE_URL}${meta.path}`;

  // Title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${meta.title}</title>`,
  );

  // Meta description
  html = html.replace(
    /<meta name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${meta.description}" />`,
  );

  // Open Graph
  html = html.replace(
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${meta.title}" />`,
  );
  html = html.replace(
    /<meta property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${meta.description}" />`,
  );
  html = html.replace(
    /<meta property="og:image" content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${ogImage}" />`,
  );

  // Twitter
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${meta.title}" />`,
  );
  html = html.replace(
    /<meta name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${meta.description}" />`,
  );
  html = html.replace(
    /<meta name="twitter:image" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:image" content="${ogImage}" />`,
  );

  // Canonical link — inject before </head>
  html = html.replace(
    "</head>",
    `  <link rel="canonical" href="${fullUrl}" />\n</head>`,
  );

  return html;
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Cache index.html in memory for meta injection
  const indexHtml = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");

  redirectLegacyProductPath(app, "/quantus/", "/quantus/workspace/");
  redirectLegacyProductPath(app, "/quantus/sectors", "/quantus/workspace/sectors");

  const quantusDirCandidates = [
    path.resolve(distPath, "quantus", "workspace"),
    path.resolve(distPath, "quantus"),
  ];
  const quantusDir =
    quantusDirCandidates.find((candidate) => fs.existsSync(candidate)) || null;
  const powerBiDir = fs.existsSync(path.resolve(distPath, "power-bi-solutions"))
    ? path.resolve(distPath, "power-bi-solutions")
    : null;

  if (quantusDir) {
    serveProductSpa(app, "/quantus/workspace", quantusDir);
  }

  if (powerBiDir) {
    serveProductSpa(app, "/power-bi-solutions", powerBiDir);
  }

  app.use(express.static(distPath, { index: false, redirect: false }));

  // fall through to index.html with route-specific meta tags
  app.use("*", (req, res) => {
    const routePath = req.originalUrl.split("?")[0].replace(/\/$/, "") || "/";

    let meta = routeMetaMap[routePath];

    if (!meta) {
      const blogMatch = routePath.match(/^\/blog\/(.+)$/);
      if (blogMatch) {
        const slug = blogMatch[1];
        const postMeta = blogPostMeta[slug];
        if (postMeta) {
          meta = { ...postMeta, path: routePath };
        }
      }
    }

    sendHtmlWithNonce(res, injectMeta(indexHtml, meta || routeMetaMap["/"]));
  });
}
