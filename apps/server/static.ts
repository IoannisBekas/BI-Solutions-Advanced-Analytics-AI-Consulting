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

function redirectLegacyProductPath(app: Express, fromPath: string, toPath: string) {
  // Compare against the decoded path so URL-encoded variants ("/Power%20BI%20Solutions")
  // and their decoded equivalents ("/Power BI Solutions") both match.
  // Query strings are preserved in the redirect destination.
  const decodedFrom = decodeURIComponent(fromPath);
  app.use((req, res, next) => {
    if (req.method === "GET" && req.path === decodedFrom) {
      const qs = req.originalUrl.includes("?")
        ? req.originalUrl.slice(req.originalUrl.indexOf("?"))
        : "";
      res.redirect(308, `${toPath}${qs}`);
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
}

const BASE_URL = "https://www.bisolutions.group";
const DEFAULT_OG_IMAGE = `${BASE_URL}/bi-solutions-logo.png`;
const ORGANIZATION_ID = `${BASE_URL}/#organization`;
const WEBSITE_ID = `${BASE_URL}/#website`;
const FOUNDER_ID = `${BASE_URL}/about#ioannis-bekas`;

const routeMetaMap: Record<string, RouteMeta> = {
  "/": {
    title: "AI, BI & Web App Development - BI Solutions Group",
    description: "BI Solutions Group helps companies in Greece and Europe build BI dashboards, analytics systems, AI workflows, data strategies, and modern web applications connected to measurable business outcomes.",
    path: "/",
  },
  "/products": {
    title: "Products - BI Solutions Group",
    description: "Purpose-built analytics products: Quantus Investing, Power BI Solutions, Greek AI Professional Advisor, and Website & App Portfolio.",
    path: "/products",
  },
  "/quantus": {
    title: "Quantus Investing - Institutional-Grade Quantitative Research",
    description: "Search markets, load research faster, and surface signals across equities, ETFs, crypto, and commodities with Quantus Investing.",
    path: "/quantus",
  },
  "/power-bi-solutions": {
    title: "Power BI Solutions - Semantic Model Analysis & AI Optimization",
    description: "Upload TMDL files, review semantic models, and get AI-powered guidance to optimize your Power BI data architecture.",
    path: "/power-bi-solutions",
  },
  "/ai-advisor": {
    title: "Greek AI Professional Advisor - AI for Accountants, Lawyers & Consultants",
    description: "AI-powered professional guidance trained on Greek law and business practices for accountants, lawyers, and consultants.",
    path: "/ai-advisor",
  },
  "/website-app-portfolio": {
    title: "Website & App Portfolio - BI Solutions Group",
    description: "Full-stack web development portfolio: personal brand websites, organization sites, and education platforms.",
    path: "/website-app-portfolio",
  },
  "/services": {
    title: "Services - BI Solutions Group",
    description: "Digital transformation, cloud migration, advanced analytics, statistical modeling, and business intelligence services.",
    path: "/services",
  },
  "/services/digital-transformation-cloud-migration": {
    title: "Digital Transformation & Cloud Migration Services - BI Solutions Group",
    description: "BI Solutions supports cloud migration, data platform modernization, and digital transformation delivery for organizations in Greece and Europe.",
    path: "/services/digital-transformation-cloud-migration",
  },
  "/services/advanced-analytics-ai": {
    title: "Advanced Analytics & AI Consulting - BI Solutions Group",
    description: "Advanced analytics and AI consulting from BI Solutions, covering predictive models, statistical analysis, and practical AI workflows.",
    path: "/services/advanced-analytics-ai",
  },
  "/services/mlops-productionization": {
    title: "MLOps & AI Productionization Services - BI Solutions Group",
    description: "BI Solutions helps teams productionize analytics, ML, and AI workflows with CI/CD, orchestration, documentation, and operating controls.",
    path: "/services/mlops-productionization",
  },
  "/services/business-intelligence-semantic-modeling": {
    title: "Business Intelligence & Semantic Modeling Services - BI Solutions Group",
    description: "Power BI, Tableau, Looker, dashboard, KPI, and semantic model consulting from BI Solutions for trusted reporting systems.",
    path: "/services/business-intelligence-semantic-modeling",
  },
  "/services/website-app-development": {
    title: "Website & Web App Development in Greece - BI Solutions Group",
    description: "BI Solutions builds modern websites, landing pages, booking flows, dashboards, and web applications for Greek and international businesses.",
    path: "/services/website-app-development",
  },
  "/services/data-strategy-governance": {
    title: "Data Strategy & Governance Services - BI Solutions Group",
    description: "BI Solutions helps organizations design data strategy, governance, access controls, quality rules, and GDPR-aware analytics processes.",
    path: "/services/data-strategy-governance",
  },
  "/services/ai-literacy-change-management": {
    title: "AI Literacy & Change Management Services - BI Solutions Group",
    description: "AI literacy, analytics enablement, executive briefings, and practical change management support from BI Solutions.",
    path: "/services/ai-literacy-change-management",
  },
  "/about": {
    title: "About - BI Solutions Group",
    description: "Ioannis Bekas - Data Scientist & AI Developer with 9+ years delivering analytics, customer insight, and product innovation.",
    path: "/about",
  },
  "/contact": {
    title: "Contact - BI Solutions Group",
    description: "Book a consultation, find us on Google Maps, or send a message to discuss your analytics and AI project.",
    path: "/contact",
  },
  "/blog": {
    title: "Blog - BI Solutions Group",
    description: "Insights on analytics, AI, data engineering, and digital transformation from BI Solutions Group.",
    path: "/blog",
  },
  "/portfolio": {
    title: "Portfolio and Selected Analytics Work - BI Solutions Group",
    description: "See BI Solutions portfolio work across UNICEF, IAEA, IFC, and strategic partnerships delivering analytics, dashboards, and digital transformation.",
    path: "/portfolio",
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
    logo: DEFAULT_OG_IMAGE,
    image: DEFAULT_OG_IMAGE,
    description:
      "AI, business intelligence, data strategy, cloud migration, and web app development consultancy for businesses in Greece and Europe.",
    areaServed: ["Greece", "Europe"],
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
      "cloud migration",
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
          name: meta.title.replace(" - BI Solutions Group", ""),
          serviceType: meta.title.replace(" - BI Solutions Group", ""),
          description: meta.description,
          url: fullUrl,
          areaServed: ["Greece", "Europe"],
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
            "@id": FOUNDER_ID,
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
        founder,
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

function injectMeta(html: string, meta: RouteMeta): string {
  const ogImage = meta.ogImage || DEFAULT_OG_IMAGE;
  const fullUrl = `${BASE_URL}${meta.path}`;
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
    `  <link rel="canonical" href="${fullUrl}" />\n${structuredDataScript}</head>`,
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

  // Quantus workspace sub-paths remain mounted below the public product page.
  redirectLegacyProductPath(app, "/quantus/sectors", "/quantus/workspace/sectors");

  // Old capitalized / URL-encoded product marketing pages -> canonical kebab-case URLs.
  // 308 is permanent: browsers and crawlers update their records and pass link equity.
  redirectLegacyProductPath(app, "/Quantus-Investing", "/quantus");
  redirectLegacyProductPath(app, "/Quantus%20Investing", "/quantus");
  redirectLegacyProductPath(app, "/Quantus", "/quantus");
  redirectLegacyProductPath(app, "/Power%20BI%20Solutions", "/power-bi-solutions");
  redirectLegacyProductPath(app, "/Greek%20AI%20Professional%20Advisor", "/ai-advisor");
  redirectLegacyProductPath(app, "/Website%20%26%20App%20Portfolio", "/website-app-portfolio");

  const quantusDirCandidates = [
    path.resolve(distPath, "quantus", "workspace"),
    path.resolve(distPath, "quantus"),
  ];
  const quantusDir =
    quantusDirCandidates.find((candidate) => fs.existsSync(candidate)) || null;
  const powerBiDir = fs.existsSync(path.resolve(distPath, "power-bi-solutions", "workspace"))
    ? path.resolve(distPath, "power-bi-solutions", "workspace")
    : null;

  if (quantusDir) {
    serveProductSpa(app, "/quantus/workspace", quantusDir);
  }

  if (powerBiDir) {
    serveProductSpa(app, "/power-bi-solutions/workspace", powerBiDir);
  }

  serveProductSpa(
    app,
    "/insights/disaster-risk-reduction-finance",
    path.resolve(distPath, "insights", "disaster-risk-reduction-finance"),
  );

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
          meta = { ...postMeta, path: routePath };
        }
      }
    }

    sendUncachedHtml(res, injectMeta(indexHtml, meta || routeMetaMap["/"]));
  });
}
