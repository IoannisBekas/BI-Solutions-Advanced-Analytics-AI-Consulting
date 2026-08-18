import express, { type Express, type Request, type Response } from "express";
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

function sendUncachedHtml(res: Response, html: string) {
  res.setHeader("Cache-Control", "no-cache, must-revalidate");
  sendHtmlWithNonce(res, html);
}

function isStaticAssetRequest(requestPath: string) {
  const normalizedPath = requestPath.split("?")[0];
  return path.posix.extname(normalizedPath) !== "";
}

function resolveContainedPath(rootPath: string, requestPath: string) {
  const candidate = path.resolve(rootPath, `.${requestPath}`);
  const relative = path.relative(rootPath, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }
  return candidate;
}

function setStaticCacheHeaders(res: Response, filePath: string) {
  const normalizedPath = filePath.replace(/\\/g, "/");
  const baseName = path.basename(normalizedPath);
  const ext = path.extname(normalizedPath).toLowerCase();

  if (
    ext === ".html" ||
    baseName === "service-worker.js" ||
    baseName === "manifest.json" ||
    baseName === "manifest.webmanifest"
  ) {
    res.setHeader("Cache-Control", "no-cache, must-revalidate");
    return;
  }

  if (normalizedPath.includes("/assets/")) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  }
}

// Blog post meta - keep in sync with client/src/data/blogData.ts
const blogPostMeta: Record<string, { title: string; description: string }> = {
  "website-web-app-development-greece-business-needs": {
    title: "Website & Web App Development in Greece: What Businesses Actually Need",
    description: "A practical view of what Greek businesses should expect from modern website and web app development: positioning, speed, conversion paths, analytics, and maintainable delivery.",
  },
  "power-bi-consulting-dashboards-business-infrastructure": {
    title: "BI Consulting: When Dashboards Become Business Infrastructure",
    description: "Business intelligence work becomes strategic when dashboards stop being isolated reports and start operating as trusted business infrastructure.",
  },
  "semantic-modeling-power-bi-clean-models": {
    title: "Semantic Modeling in Power BI: Why Clean Models Matter More Than Pretty Reports",
    description: "Pretty dashboards can hide weak models. Clean semantic modeling is what makes Power BI reports faster, clearer, and easier to govern.",
  },
  "ai-consulting-greek-businesses-practical-use-cases": {
    title: "AI Consulting for Greek Businesses: Practical Use Cases Beyond Hype",
    description: "AI consulting should help businesses choose useful workflows, not chase generic trends. Here are practical AI use cases for Greek companies.",
  },
  "data-strategy-before-ai-better-foundations": {
    title: "Data Strategy Before AI: Why Companies Need Better Foundations First",
    description: "AI projects depend on data foundations. Without clear ownership, quality, and access rules, AI becomes harder to trust and harder to scale.",
  },
  "cloud-migration-analytics-teams-manual-reports": {
    title: "Cloud Migration for Analytics Teams: Moving Beyond Local Files and Manual Reports",
    description: "Cloud migration becomes valuable when it reduces manual reporting work, improves access, and gives analytics teams a stronger operating foundation.",
  },
  "mlops-small-mid-sized-teams-productionize-ai": {
    title: "MLOps for Small and Mid-Sized Teams: How to Productionize AI Workflows",
    description: "MLOps is not only for large technology companies. Smaller teams also need versioning, deployment habits, and reliable AI workflow operations.",
  },
  "data-governance-gdpr-scale-analytics-control": {
    title: "Data Governance and GDPR: How to Scale Analytics Without Losing Control",
    description: "Analytics growth needs governance. Clear ownership, access controls, and GDPR-aware processes help teams scale without weakening trust.",
  },
  "ai-literacy-teams-adopt-ai-without-operational-risk": {
    title: "AI Literacy for Teams: How to Adopt AI Without Creating Operational Risk",
    description: "AI literacy helps teams understand what AI can do, where it fails, and how to use it responsibly inside real business workflows.",
  },
  "modern-websites-track-business-outcomes": {
    title: "From Website to Analytics System: Why Modern Sites Should Track Business Outcomes",
    description: "A modern website should not only look good. It should measure visits, actions, conversion paths, and business outcomes that matter.",
  },
  "corporate-website-redesign-warning-signs": {
    title: "Corporate Website Redesign: Warning Signs It Is Time to Rebuild",
    description: "A redesign is not only about visual age. Slow pages, unclear offers, weak conversion paths, and missing analytics are stronger signals that the website needs work.",
  },
  "booking-flows-service-businesses": {
    title: "Booking Flows for Service Businesses: Why the Form Is Part of the Product",
    description: "For service businesses, booking flows are not small details. They shape trust, reduce admin work, and turn attention into scheduled demand.",
  },
  "landing-pages-for-ai-products": {
    title: "Landing Pages for AI Products: Explain the Workflow, Not Just the Model",
    description: "AI product pages convert better when they explain the user workflow, proof, data boundaries, and expected outcome instead of only naming the model.",
  },
  "dashboard-requirements-before-power-bi-build": {
    title: "Dashboard Requirements: What to Define Before a Power BI Build",
    description: "Strong dashboards start before design. Define decisions, users, KPIs, sources, refresh needs, and ownership before building visuals.",
  },
  "kpi-dictionary-business-intelligence": {
    title: "KPI Dictionary: The Small BI Asset That Prevents Big Reporting Arguments",
    description: "A KPI dictionary gives teams shared definitions for metrics, owners, formulas, and business context before dashboards multiply.",
  },
  "power-bi-tableau-looker-tool-choice": {
    title: "Power BI, Tableau, or Looker: How to Choose the Right BI Tool",
    description: "BI tool choice should follow data architecture, user needs, governance, cost, and operating skills rather than brand preference alone.",
  },
  "data-quality-checklist-analytics-projects": {
    title: "Data Quality Checklist for Analytics Projects",
    description: "A lightweight data quality checklist can prevent dashboard errors, weak AI outputs, and repeated manual corrections.",
  },
  "customer-data-foundation-small-business": {
    title: "Customer Data Foundations for Small and Mid-Sized Businesses",
    description: "Customer analytics starts with clean identifiers, useful segments, consistent touchpoints, and a practical owner for customer data.",
  },
  "ai-document-workflows-professional-services": {
    title: "AI Document Workflows for Professional Services",
    description: "Professional-service teams can use AI to summarize, classify, draft, and review documents when the workflow includes human control and privacy rules.",
  },
  "prompt-workflow-design-business-teams": {
    title: "Prompt Workflow Design: Turning AI Prompts Into Repeatable Business Processes",
    description: "Prompts create more value when they become reusable workflows with inputs, review rules, outputs, and ownership.",
  },
  "ai-assistant-governance-company-policy": {
    title: "AI Assistant Governance: What Company Policy Should Cover",
    description: "A practical AI policy should explain allowed use cases, sensitive data rules, review expectations, and escalation paths.",
  },
  "predictive-analytics-forecasting-mistakes": {
    title: "Predictive Analytics: Common Forecasting Mistakes Business Teams Make",
    description: "Forecasting work fails when teams ignore data quality, uncertainty, business context, and how the prediction will be used.",
  },
  "analytics-roadmap-first-90-days": {
    title: "Analytics Roadmap: What to Do in the First 90 Days",
    description: "The first 90 days of analytics work should clarify priorities, data sources, reporting pain, governance gaps, and a delivery backlog.",
  },
  "cloud-data-warehouse-vs-spreadsheets": {
    title: "Cloud Data Warehouse vs Spreadsheets: When the Move Becomes Worth It",
    description: "Spreadsheets are useful until reporting needs reliability, shared logic, access control, and repeatable refreshes.",
  },
  "dbt-airflow-analytics-automation": {
    title: "dbt and Airflow: When Analytics Teams Need Automation",
    description: "Analytics automation becomes useful when transformations, refreshes, and quality checks need to run reliably without manual coordination.",
  },
  "model-monitoring-ai-workflows": {
    title: "Model Monitoring for AI Workflows: What to Watch After Launch",
    description: "AI workflow launch is not the end. Teams need to monitor data changes, output quality, failures, usage, and business impact.",
  },
  "gdpr-safe-web-analytics": {
    title: "GDPR-Safe Web Analytics: Measuring Demand Without Overcollecting Data",
    description: "Web analytics should help teams understand demand while respecting consent, minimization, and responsible data handling.",
  },
  "data-literacy-training-for-managers": {
    title: "Data Literacy Training for Managers: Better Questions, Better Decisions",
    description: "Managers do not need to become data engineers. They need to ask better questions, understand uncertainty, and interpret dashboards responsibly.",
  },
  "internal-tools-vs-saas-build-buy": {
    title: "Internal Tools vs SaaS: How to Decide Whether to Build or Buy",
    description: "The build-vs-buy decision should compare workflow fit, data integration, maintenance, cost, and strategic differentiation.",
  },
  "portfolio-case-studies-that-sell-services": {
    title: "Portfolio Case Studies That Sell Services Without Sounding Generic",
    description: "Good case studies explain the problem, constraints, delivery decisions, and outcome instead of only showing screenshots.",
  },
  "google-gemini-import-ai-chats": {
    title: "Google Gemini is Making it Easy to Quit ChatGPT, Claude and other LLMs",
    description: "Google is testing a breakthrough 'Import AI chats' feature that allows users to migrate their entire conversation histories from rival platforms directly into Gemini.",
  },
  "power-bi-solutions-semantic-model-analysis-workspace": {
    title: "Why Power BI Solutions Deserves a Dedicated Semantic Model Workspace",
    description: "Power BI Solutions brings TMDL review, semantic model diagnostics, AI guidance, and product-specific authentication into a focused workspace hosted directly on the BI Solutions domain.",
  },
};

const indexableBlogSlugs = new Set([
  "power-bi-consulting-dashboards-business-infrastructure",
  "semantic-modeling-power-bi-clean-models",
  "dashboard-requirements-before-power-bi-build",
  "data-strategy-before-ai-better-foundations",
  "ai-consulting-greek-businesses-practical-use-cases",
  "website-web-app-development-greece-business-needs",
  "kpi-dictionary-business-intelligence",
  "data-quality-checklist-analytics-projects",
  "analytics-roadmap-first-90-days",
  "data-governance-gdpr-scale-analytics-control",
  "cloud-data-warehouse-vs-spreadsheets",
  "internal-tools-vs-saas-build-buy",
  "ai-document-workflows-professional-services",
  "prompt-workflow-design-business-teams",
  "ai-assistant-governance-company-policy",
  "predictive-analytics-forecasting-mistakes",
  "ai-literacy-teams-adopt-ai-without-operational-risk",
  "mlops-small-mid-sized-teams-productionize-ai",
  "model-monitoring-ai-workflows",
]);

function redirectLegacyProductPath(app: Express, fromPath: string, toPath: string) {
  // Compare raw and decoded paths so URL-encoded variants and their decoded
  // equivalents both normalize to the canonical URL.
  // Query strings are preserved in the redirect destination.
  const decodedFrom = decodeURIComponent(fromPath);
  app.use((req, res, next) => {
    let decodedRequestPath = req.path;
    try {
      decodedRequestPath = decodeURIComponent(req.path);
    } catch {
      decodedRequestPath = req.path;
    }

    const isLegacyPath =
      req.path === fromPath ||
      req.path === decodedFrom ||
      decodedRequestPath === decodedFrom;

    if ((req.method === "GET" || req.method === "HEAD") && isLegacyPath) {
      const qs = req.originalUrl.includes("?")
        ? req.originalUrl.slice(req.originalUrl.indexOf("?"))
        : "";
      const fragmentIndex = toPath.indexOf("#");
      const destination = fragmentIndex === -1
        ? `${toPath}${qs}`
        : `${toPath.slice(0, fragmentIndex)}${qs}${toPath.slice(fragmentIndex)}`;
      res.redirect(308, destination);
      return;
    }
    next();
  });
}

function serveGonePath(app: Express, removedPath: string) {
  const normalizedRemovedPath = removedPath.replace(/\/$/, "");
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }

    const normalizedRequestPath = req.path.replace(/\/$/, "");
    const isRemovedPath =
      normalizedRequestPath === normalizedRemovedPath ||
      req.path.startsWith(`${normalizedRemovedPath}/`);

    if (!isRemovedPath) {
      next();
      return;
    }

    res.setHeader("Cache-Control", "no-cache, must-revalidate");
    res.status(410).type("text/plain").send("Gone");
  });
}

function serveGoneExactPath(app: Express, removedPath: string) {
  const normalizePath = (value: string) => {
    let decodedPath = value;
    try {
      decodedPath = decodeURIComponent(value);
    } catch {
      decodedPath = value;
    }

    return decodedPath.replace(/\/$/, "") || "/";
  };
  const normalizedRemovedPath = normalizePath(removedPath);

  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }

    if (normalizePath(req.path) !== normalizedRemovedPath) {
      next();
      return;
    }

    res.setHeader("Cache-Control", "no-cache, must-revalidate");
    res.status(410).type("text/plain").send("Gone");
  });
}

function serveProductSpa(app: Express, mountPath: string, productDistPath: string) {
  if (!fs.existsSync(productDistPath)) {
    return;
  }

  const indexPath = path.resolve(productDistPath, "index.html");
  const indexHtml = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, "utf-8") : "";

  app.use(mountPath, (req, res, next) => {
    if ((req.method !== "GET" && req.method !== "HEAD") || path.posix.extname(req.path).toLowerCase() !== ".html") {
      next();
      return;
    }

    const htmlPath = resolveContainedPath(productDistPath, req.path);
    if (!htmlPath) {
      res.status(404).type("text/plain").send("Not found");
      return;
    }

    if (!fs.existsSync(htmlPath) || !fs.statSync(htmlPath).isFile()) {
      next();
      return;
    }

    sendUncachedHtml(res, fs.readFileSync(htmlPath, "utf-8"));
  });

  app.use(mountPath, express.static(productDistPath, {
    index: false,
    redirect: false,
    setHeaders: setStaticCacheHeaders,
  }));
  app.use(mountPath, (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }

    if (req.path !== "/" && isStaticAssetRequest(req.path)) {
      res.status(404).type("text/plain").send("Not found");
      return;
    }

    sendUncachedHtml(res, indexHtml);
  });
}

interface RouteMeta {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  robots?: string;
}

const BASE_URL = "https://www.bisolutions.group";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og.png`;
const ORGANIZATION_LOGO_IMAGE = `${BASE_URL}/bi-solutions-logo.png`;
const ORGANIZATION_ID = `${BASE_URL}/#organization`;
const WEBSITE_ID = `${BASE_URL}/#website`;
const FOUNDER_ID = `${BASE_URL}/about#ioannis-bekas`;

const routeMetaMap: Record<string, RouteMeta> = {
  "/": {
    title: "AI, BI & Web App Development - BI Solutions Group",
    description: "BI Solutions Group helps organizations worldwide build BI dashboards, analytics systems, AI workflows, data strategies, and modern web applications connected to measurable business outcomes.",
    path: "/",
  },
  "/services": {
    title: "Analytics, AI, Data & Web Services - BI Solutions Group",
    description: "Explore every BI Solutions Group service on one page: business intelligence, Power BI, AI consulting, automation, data strategy, cloud foundations, websites, and web applications.",
    path: "/services",
  },
  "/case-studies/unicef-audit-compliance": {
    title: "Audit Compliance Power BI Case Study - BI Solutions Group",
    description: "Independent Power BI portfolio analysis showing how audit ratings, risks, expenditure, and recommendation progress can work in one reporting flow.",
    path: "/case-studies/unicef-audit-compliance",
  },
  "/case-studies/iaea-scientific-analysis": {
    title: "Scientific Analysis Power BI Case Study - BI Solutions Group",
    description: "Independent Power BI portfolio analysis for comparing representative laboratory measurements across regions, dates, water types, and isotope measures.",
    path: "/case-studies/iaea-scientific-analysis",
  },
  "/case-studies/ifc-talent-strategy": {
    title: "Talent Analytics Power BI Case Study - BI Solutions Group",
    description: "Independent Power BI portfolio analysis connecting recruitment activity, funnel stages, candidate sources, diversity, and applicant detail.",
    path: "/case-studies/ifc-talent-strategy",
  },
  "/about": {
    title: "About Ioannis Bekas and BI Solutions Group",
    description: "Meet Ioannis Bekas and learn how BI Solutions Group delivers business intelligence, AI, data strategy, and focused web applications for organizations worldwide.",
    path: "/about",
  },
  "/start-a-project": {
    title: "Start a Project - BI Solutions Group",
    description: "Tell BI Solutions Group about your business intelligence, AI, data strategy, web application, or product-workspace requirement.",
    path: "/start-a-project",
  },
  "/blog": {
    title: "Insights - BI Solutions Group",
    description: "Curated BI Solutions resources on business intelligence, semantic modeling, AI workflows, data strategy, and web app delivery.",
    path: "/blog",
  },
  "/privacy-policy": {
    title: "Privacy Policy - BI Solutions Group",
    description: "Privacy policy for bisolutions.group - how we collect, use, and protect your data.",
    path: "/privacy-policy",
  },
  "/terms-of-service": {
    title: "Terms of Service - BI Solutions Group",
    description: "Terms of service for bisolutions.group.",
    path: "/terms-of-service",
  },
};

function getOrganizationSchema() {
  return {
    "@type": "ProfessionalService",
    "@id": ORGANIZATION_ID,
    name: "BI Solutions Group",
    alternateName: "BI Solutions",
    url: `${BASE_URL}/`,
    logo: ORGANIZATION_LOGO_IMAGE,
    image: DEFAULT_OG_IMAGE,
    description:
      "AI, business intelligence, data strategy, cloud foundations, and web app development consultancy for organizations worldwide.",
    areaServed: "Worldwide",
    founder: {
      "@id": FOUNDER_ID,
    },
    sameAs: [
      "https://www.linkedin.com/company/bi-solutions-by-bekas-ioannis/",
      "https://github.com/IoannisBekas",
      "https://www.instagram.com/bisolutions.group/",
    ],
    knowsAbout: [
      "Power BI",
      "Tableau",
      "Looker",
      "semantic modeling",
      "AI workflows",
      "data strategy",
      "cloud foundations",
      "web app development",
      "analytics engineering",
    ],
  };
}

function getFounderSchema() {
  return {
    "@type": "Person",
    "@id": FOUNDER_ID,
    name: "Ioannis Bekas",
    jobTitle: "Data Scientist & AI Developer",
    url: `${BASE_URL}/about`,
    worksFor: {
      "@id": ORGANIZATION_ID,
    },
    sameAs: [
      "https://linkedin.com/in/ioannisbekas",
      "https://github.com/IoannisBekas",
      "https://www.linkedin.com/company/bi-solutions-by-bekas-ioannis/",
    ],
    knowsAbout: [
      "Power BI",
      "Tableau",
      "Looker",
      "semantic modeling",
      "AI consulting",
      "advanced analytics",
      "data strategy",
      "web app development",
    ],
  };
}

function getServerStructuredData(meta: RouteMeta) {
  if (meta.robots?.includes("noindex")) {
    return null;
  }

  const fullUrl = `${BASE_URL}${meta.path}`;
  const organization = getOrganizationSchema();
  const founder = getFounderSchema();

  if (meta.path === "/") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": WEBSITE_ID,
          name: "BI Solutions Group",
          url: `${BASE_URL}/`,
          inLanguage: "en",
          publisher: {
            "@id": ORGANIZATION_ID,
          },
          about: [
            "business intelligence consulting",
            "AI consulting",
            "website and web app development",
            "data strategy",
            "business intelligence",
          ],
        },
        organization,
        founder,
      ],
    };
  }

  if (meta.path.startsWith("/services/")) {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          "@id": `${fullUrl}#service`,
          name: meta.title.replace(" - BI Solutions Group", ""),
          serviceType: meta.title.replace(" - BI Solutions Group", ""),
          description: meta.description,
          url: fullUrl,
          areaServed: "Worldwide",
          provider: {
            "@id": ORGANIZATION_ID,
          },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: `${BASE_URL}/`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Services",
              item: `${BASE_URL}/services`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: meta.title.replace(" - BI Solutions Group", ""),
              item: fullUrl,
            },
          ],
        },
        organization,
      ],
    };
  }

  if (meta.path.startsWith("/blog/")) {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          headline: meta.title,
          description: meta.description,
          url: fullUrl,
          image: meta.ogImage || DEFAULT_OG_IMAGE,
          inLanguage: "en",
          author: {
            "@id": ORGANIZATION_ID,
          },
          publisher: {
            "@id": ORGANIZATION_ID,
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": fullUrl,
          },
        },
        organization,
      ],
    };
  }

  if (meta.path === "/blog") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          name: "BI Solutions Group Blog",
          description: meta.description,
          url: fullUrl,
          publisher: {
            "@id": ORGANIZATION_ID,
          },
        },
        organization,
      ],
    };
  }

  return null;
}

function serializeStructuredData(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function stripRouteSeoTags(html: string) {
  return html
    .replace(/\s*<meta(?=[^>]*\bname=["']robots["'])[^>]*>\s*/gi, "\n")
    .replace(/\s*<link(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/gi, "\n")
    .replace(
      /\s*<script(?=[^>]*\bid=["']seo-structured-data["'])[^>]*>[\s\S]*?<\/script>\s*/gi,
      "\n",
    );
}

function stripPrerenderedRootContent(html: string) {
  const rootOpen = '<div id="root">';
  const rootStart = html.indexOf(rootOpen);
  if (rootStart === -1) {
    return html;
  }

  const bodySchemaStart = html.indexOf(
    '<script type="application/ld+json">',
    rootStart,
  );
  const bodyEnd = html.indexOf("</body>", rootStart);
  const searchEnd = bodySchemaStart === -1 ? bodyEnd : bodySchemaStart;
  const rootEnd = html.lastIndexOf("</div>", searchEnd);

  if (searchEnd === -1 || rootEnd === -1 || rootEnd < rootStart) {
    return html;
  }

  return `${html.slice(0, rootStart)}${rootOpen}</div>${html.slice(rootEnd + 6)}`;
}

function injectMeta(html: string, meta: RouteMeta): string {
  html = stripRouteSeoTags(html);
  const ogImage = meta.ogImage || DEFAULT_OG_IMAGE;
  const fullUrl = `${BASE_URL}${meta.path}`;
  const robots = meta.robots || "index,follow";
  const structuredData = getServerStructuredData(meta);

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

  // Canonical link - inject before </head>
  const structuredDataScript = structuredData
    ? `  <script id="seo-structured-data" type="application/ld+json">${serializeStructuredData(structuredData)}</script>\n`
    : "";
  html = html.replace(
    "</head>",
    `  <meta name="robots" content="${robots}" />\n  <link rel="canonical" href="${fullUrl}" />\n${structuredDataScript}</head>`,
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
  const clientShellHtml = stripPrerenderedRootContent(indexHtml);

  // Preserve the Quantus workspace redirect after retiring the marketing root.
  redirectLegacyProductPath(app, "/quantus/sectors", "/quantus/workspace/sectors");

  // Service detail pages now resolve to sections of the single service atlas.
  const retiredServiceRoutes: Record<string, string> = {
    "advanced-analytics-ai": "advanced-analytics-ai",
    "ai-strategy-readiness": "ai-strategy-readiness",
    "ai-automation-consulting": "ai-automation-consulting",
    "generative-ai-llm-consulting": "generative-ai-llm-consulting",
    "predictive-analytics-machine-learning": "predictive-analytics-machine-learning",
    "ai-governance-literacy-adoption": "ai-governance-literacy-adoption",
    "mlops-model-monitoring": "mlops-model-monitoring",
    "ai-business-intelligence": "ai-business-intelligence",
    "ai-consulting-greece": "advanced-analytics-ai",
    "business-intelligence-semantic-modeling": "business-intelligence-semantic-modeling",
    "website-app-development": "website-app-development",
    "data-strategy-governance": "data-strategy-governance",
    "digital-transformation-cloud-migration": "data-strategy-governance",
    "ai-literacy-change-management": "ai-governance-literacy-adoption",
    "mlops-productionization": "mlops-model-monitoring",
    "website-web-app-development": "website-app-development",
  };
  Object.entries(retiredServiceRoutes).forEach(([routeSlug, anchor]) => {
    redirectLegacyProductPath(
      app,
      `/services/${routeSlug}`,
      `/services#${anchor}`,
    );
  });

  serveGonePath(app, "/products");
  serveGonePath(app, "/all-products");
  serveGonePath(app, "/portfolio");
  serveGonePath(app, "/Website%20%26%20App%20Portfolio");
  serveGonePath(app, "/Website & App Portfolio");
  serveGonePath(app, "/website-app-portfolio");
  serveGonePath(app, "/insights/disaster-risk-reduction-finance");
  serveGonePath(app, "/blog/disaster-risk-reduction-finance-dashboard-launch");
  serveGonePath(app, "/contact");
  [
    "/quantus",
    "/power-bi-solutions",
    "/bonusaki",
    "/ai-advisor",
    "/Quantus-Investing",
    "/Quantus Investing",
    "/Quantus",
    "/Power BI Solutions",
    "/Bonusaki",
    "/Greek AI Professional Advisor",
  ].forEach((routePath) => serveGoneExactPath(app, routePath));

  const quantusDirCandidates = [
    path.resolve(distPath, "quantus", "workspace"),
    path.resolve(distPath, "quantus"),
  ];
  const quantusDir =
    quantusDirCandidates.find((candidate) => fs.existsSync(candidate)) || null;
  const powerBiDir = fs.existsSync(path.resolve(distPath, "power-bi-solutions", "workspace"))
    ? path.resolve(distPath, "power-bi-solutions", "workspace")
    : null;
  const bonusakiDir = fs.existsSync(path.resolve(distPath, "bonusaki", "demo"))
    ? path.resolve(distPath, "bonusaki", "demo")
    : null;

  if (quantusDir) {
    serveProductSpa(app, "/quantus/workspace", quantusDir);
  }

  if (powerBiDir) {
    serveProductSpa(app, "/power-bi-solutions/workspace", powerBiDir);
  }

  if (bonusakiDir) {
    serveProductSpa(app, "/bonusaki/demo", bonusakiDir);
  }

  // Marketing routes are prerendered as <route>/index.html. Serve those files
  // directly so crawlers receive each page's real body and self-canonical.
  app.use((req, res, next) => {
    if ((req.method !== "GET" && req.method !== "HEAD") || isStaticAssetRequest(req.path)) {
      next();
      return;
    }

    const routePath = req.path.replace(/\/$/, "") || "/";
    const htmlRequestPath =
      routePath === "/" ? "/index.html" : `${routePath}/index.html`;
    const htmlPath = resolveContainedPath(distPath, htmlRequestPath);

    if (!htmlPath || !fs.existsSync(htmlPath) || !fs.statSync(htmlPath).isFile()) {
      next();
      return;
    }

    sendUncachedHtml(res, fs.readFileSync(htmlPath, "utf-8"));
  });

  app.use(express.static(distPath, {
    index: false,
    redirect: false,
    setHeaders: setStaticCacheHeaders,
  }));

  // fall through to index.html with route-specific meta tags
  app.use("*", (req: Request, res: Response) => {
    if (isStaticAssetRequest(req.path)) {
      res.status(404).type("text/plain").send("Not found");
      return;
    }

    const routePath = req.originalUrl.split("?")[0].replace(/\/$/, "") || "/";

    let meta = routeMetaMap[routePath];

    if (!meta) {
      const blogMatch = routePath.match(/^\/blog\/(.+)$/);
      if (blogMatch) {
        const slug = blogMatch[1];
        const postMeta = blogPostMeta[slug];
        if (postMeta) {
          meta = {
            ...postMeta,
            path: routePath,
            robots: indexableBlogSlugs.has(slug) ? "index,follow" : "noindex,follow",
          };
        }
      }
    }

    if (!meta) {
      res.status(404);
      sendUncachedHtml(res, injectMeta(clientShellHtml, {
        title: "Page Not Found - BI Solutions Group",
        description: "The requested BI Solutions Group page could not be found.",
        path: routePath,
        robots: "noindex,follow",
      }));
      return;
    }

    sendUncachedHtml(res, injectMeta(clientShellHtml, meta));
  });
}
