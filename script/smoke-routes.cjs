#!/usr/bin/env node

const baseUrl = (process.argv[2] || process.env.SMOKE_BASE_URL || "http://localhost:5001").replace(/\/+$/, "");

const publicRoutes = [
  {
    path: "/",
    title: "AI, BI & Web App Development",
    body: "BI Solutions Group",
    absent: ["AI Products"],
  },
  {
    path: "/services",
    title: "Analytics, AI, and Data Services",
    body: "End-to-end analytics and AI services built to move from strategy into production.",
  },
  {
    path: "/services/business-intelligence-semantic-modeling",
    title: "Business Intelligence & Semantic Modeling Services",
    body: "Power BI, Tableau, Looker",
  },
  {
    path: "/services/advanced-analytics-ai",
    title: "AI Consulting Services & Implementation",
    body: "AI consulting services from strategy to production.",
    canonical: "https://www.bisolutions.group/services/advanced-analytics-ai",
    robots: "index,follow",
  },
  {
    path: "/services/ai-strategy-readiness",
    title: "AI Strategy & Readiness Consulting",
    body: "Build an AI strategy your organization can act on.",
    canonical: "https://www.bisolutions.group/services/ai-strategy-readiness",
    robots: "index,follow",
  },
  {
    path: "/services/ai-automation-consulting",
    title: "AI Automation & Workflow Consulting",
    body: "Turn repetitive work into controlled AI-assisted workflows.",
    canonical: "https://www.bisolutions.group/services/ai-automation-consulting",
    robots: "index,follow",
  },
  {
    path: "/services/generative-ai-llm-consulting",
    title: "Generative AI & LLM Consulting Services",
    body: "Build generative AI tools around real work and trusted knowledge.",
    canonical: "https://www.bisolutions.group/services/generative-ai-llm-consulting",
    robots: "index,follow",
  },
  {
    path: "/services/predictive-analytics-machine-learning",
    title: "Predictive Analytics & Machine Learning Consulting",
    body: "Use predictive analytics to make better-informed decisions.",
    canonical: "https://www.bisolutions.group/services/predictive-analytics-machine-learning",
    robots: "index,follow",
  },
  {
    path: "/services/ai-governance-literacy-adoption",
    title: "AI Governance, Literacy & Adoption Consulting",
    body: "Put practical governance around how your organization uses AI.",
    canonical: "https://www.bisolutions.group/services/ai-governance-literacy-adoption",
    robots: "index,follow",
  },
  {
    path: "/services/mlops-model-monitoring",
    title: "MLOps & Model Monitoring Services",
    body: "MLOps and model monitoring that keep AI reliable after launch.",
    canonical: "https://www.bisolutions.group/services/mlops-model-monitoring",
    robots: "index,follow",
  },
  {
    path: "/services/ai-business-intelligence",
    title: "AI & Business Intelligence Consulting",
    body: "Make business intelligence more useful with practical AI.",
    canonical: "https://www.bisolutions.group/services/ai-business-intelligence",
    robots: "index,follow",
  },
  {
    path: "/services/ai-consulting-greece",
    title: "AI Consulting Services in Greece",
    body: "Practical AI consulting for businesses and organizations in Greece.",
    canonical: "https://www.bisolutions.group/services/ai-consulting-greece",
    robots: "index,follow",
  },
  {
    path: "/services/data-strategy-governance",
    title: "Data Strategy & Cloud Foundations Services",
    body: "Data strategy and cloud foundations for analytics that can scale.",
  },
  {
    path: "/services/website-app-development",
    title: "Website & Web App Development",
    body: "Website and web app development for businesses that need more than a template.",
  },
  {
    path: "/products",
    title: "Products",
    body: "Focused analytics products.",
    absent: ["Bonusaki", "Greek AI Professional Advisor", "Website & App Portfolio"],
  },
  {
    path: "/quantus",
    title: "Quantus Investing",
    body: "Quantus Investing",
  },
  {
    path: "/power-bi-solutions",
    title: "Power BI Solutions",
    body: "Power BI Solutions",
  },
  {
    path: "/portfolio",
    title: "Portfolio",
    body: "Selected BI Solutions work",
  },
  {
    path: "/blog",
    title: "Insights",
    body: "Practical guides for BI, AI, data strategy, and web app delivery.",
  },
  {
    path: "/blog/ai-consulting-greek-businesses-practical-use-cases",
    title: "AI Consulting for Greek Businesses",
    body: "AI is easy to discuss in general terms and much harder to implement usefully.",
    canonical: "https://www.bisolutions.group/blog/ai-consulting-greek-businesses-practical-use-cases",
  },
  {
    path: "/blog/ai-document-workflows-professional-services",
    title: "AI Document Workflows for Professional Services",
    body: "Professional-service work often includes document-heavy tasks",
    canonical: "https://www.bisolutions.group/blog/ai-document-workflows-professional-services",
    robots: "index,follow",
  },
  {
    path: "/blog/prompt-workflow-design-business-teams",
    title: "Prompt Workflow Design",
    body: "A useful prompt is a start, not a process.",
    canonical: "https://www.bisolutions.group/blog/prompt-workflow-design-business-teams",
    robots: "index,follow",
  },
  {
    path: "/blog/ai-assistant-governance-company-policy",
    title: "AI Assistant Governance",
    body: "AI assistant use is already happening in many companies",
    canonical: "https://www.bisolutions.group/blog/ai-assistant-governance-company-policy",
    robots: "index,follow",
  },
  {
    path: "/blog/predictive-analytics-forecasting-mistakes",
    title: "Predictive Analytics",
    body: "Predictive analytics can support better planning",
    canonical: "https://www.bisolutions.group/blog/predictive-analytics-forecasting-mistakes",
    robots: "index,follow",
  },
  {
    path: "/blog/ai-literacy-teams-adopt-ai-without-operational-risk",
    title: "AI Literacy for Teams",
    body: "AI tools are already entering daily work.",
    canonical: "https://www.bisolutions.group/blog/ai-literacy-teams-adopt-ai-without-operational-risk",
    robots: "index,follow",
  },
  {
    path: "/blog/mlops-small-mid-sized-teams-productionize-ai",
    title: "MLOps for Small and Mid-Sized Teams",
    body: "A machine learning or AI workflow can create value in a notebook",
    canonical: "https://www.bisolutions.group/blog/mlops-small-mid-sized-teams-productionize-ai",
    robots: "index,follow",
  },
  {
    path: "/blog/model-monitoring-ai-workflows",
    title: "Model Monitoring for AI Workflows",
    body: "Launching an AI workflow is only the beginning.",
    canonical: "https://www.bisolutions.group/blog/model-monitoring-ai-workflows",
    robots: "index,follow",
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy",
    body: "How BI Solutions Group handles personal data",
  },
  {
    path: "/terms-of-service",
    title: "Terms of Service",
    body: "The service terms for BI Solutions Group",
  },
];

const hiddenRoutes = [
  {
    path: "/bonusaki",
    title: "Bonusaki Cafe Pilot",
    clientShell: true,
    robots: "noindex,follow",
  },
  {
    path: "/ai-advisor",
    title: "Greek AI Professional Advisor",
    clientShell: true,
    robots: "noindex,follow",
  },
  {
    path: "/blog/google-gemini-import-ai-chats",
    title: "Google Gemini is Making it Easy to Quit ChatGPT",
    clientShell: true,
    robots: "noindex,follow",
  },
];

const workspaceRoutes = [
  {
    path: "/quantus/workspace/",
    title: "Quantus Research Platform",
    clientShell: true,
  },
  {
    path: "/power-bi-solutions/workspace/",
    title: "Power BI Solutions Workspace",
    clientShell: true,
  },
  {
    path: "/bonusaki/demo/",
    title: "Bonusaki",
    body: "Bonusaki",
  },
];

const jsonRoutes = [
  {
    path: "/api/bonusaki/health",
    marker: "bonusaki",
  },
  {
    path: "/api/bonusaki/campaign",
    marker: "rewards",
  },
];

const redirectRoutes = [
  {
    path: "/Quantus",
    location: "/quantus",
  },
  {
    path: "/all-products",
    location: "/products",
  },
  {
    path: "/website-app-portfolio",
    location: "/portfolio#web-apps",
  },
  {
    path: "/Website%20%26%20App%20Portfolio",
    location: "/portfolio#web-apps",
  },
  {
    path: "/services/digital-transformation-cloud-migration",
    location: "/services/data-strategy-governance",
  },
  {
    path: "/services/ai-literacy-change-management",
    location: "/services/ai-governance-literacy-adoption",
  },
  {
    path: "/services/mlops-productionization",
    location: "/services/mlops-model-monitoring",
  },
  {
    path: "/services/website-web-app-development",
    location: "/services/website-app-development",
  },
  {
    path: "/website-app-portfolio?utm_source=smoke",
    location: "/portfolio?utm_source=smoke#web-apps",
  },
  {
    path: "/Quantus",
    location: "/quantus",
    method: "HEAD",
  },
];

const goneRoutes = [
  {
    path: "/contact",
  },
];

const notFoundRoutes = [
  {
    path: "/services/not-a-real-service",
    title: "Page Not Found",
    robots: "noindex,follow",
  },
];

function includesAll(haystack, needles) {
  return needles.every((needle) => haystack.includes(needle));
}

function getTitle(body) {
  const titleMatch = body.match(/<title>(.*?)<\/title>/i);
  return titleMatch ? titleMatch[1].replace(/&amp;/gi, "&") : "";
}

function getRootContent(body) {
  const match = body.match(/<div\s+id=["']root["']>([\s\S]*)<\/div>/i);
  return match ? match[1] : null;
}

function getMetaContent(body, name) {
  const pattern = new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["']\\s*\\/?>`, "i");
  const match = body.match(pattern);
  return match ? match[1] : "";
}

function getCanonicalHrefs(body) {
  return [...body.matchAll(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']\s*\/?>/gi)]
    .map((match) => match[1]);
}

async function smokeHtmlRoute(route) {
  const url = `${baseUrl}${route.path}`;
  const response = await fetch(url, { redirect: "manual" });
  const contentType = response.headers.get("content-type") || "";
  const body = await response.text();
  const title = getTitle(body);
  const rootContent = getRootContent(body);
  const searchableBody = rootContent ?? body;
  const requiredBody = route.body
    ? Array.isArray(route.body) ? route.body : [route.body]
    : [];
  const absent = route.absent || [];

  if (response.status !== 200) {
    throw new Error(`${route.path} returned HTTP ${response.status}`);
  }
  if (!contentType.includes("text/html")) {
    throw new Error(`${route.path} returned ${contentType || "unknown content type"}`);
  }
  if (!title.includes(route.title)) {
    throw new Error(`${route.path} served unexpected shell title "${title || "(missing title)"}"`);
  }
  if (route.clientShell && rootContent !== "") {
    throw new Error(`${route.path} did not serve the empty client shell`);
  }
  if (!route.clientShell && !includesAll(searchableBody, requiredBody)) {
    throw new Error(`${route.path} did not include expected marker(s): ${requiredBody.join(", ")}`);
  }
  for (const marker of absent) {
    if (searchableBody.includes(marker)) {
      throw new Error(`${route.path} still includes removed marker: ${marker}`);
    }
  }
  if (route.robots) {
    const robots = getMetaContent(body, "robots");
    if (robots !== route.robots) {
      throw new Error(`${route.path} robots meta was "${robots || "(missing)"}", expected "${route.robots}"`);
    }
  }
  if (route.canonical) {
    const canonicals = getCanonicalHrefs(body);
    if (canonicals.length !== 1 || canonicals[0] !== route.canonical) {
      throw new Error(
        `${route.path} canonicals were [${canonicals.join(", ") || "none"}], expected only ${route.canonical}`,
      );
    }
  }

  return `${route.path} -> ${title}`;
}

async function smokeJsonRoute(route) {
  const url = `${baseUrl}${route.path}`;
  const response = await fetch(url, { redirect: "manual" });
  const contentType = response.headers.get("content-type") || "";
  const body = await response.text();

  if (response.status !== 200) {
    throw new Error(`${route.path} returned HTTP ${response.status}`);
  }
  if (!contentType.includes("application/json")) {
    throw new Error(`${route.path} returned ${contentType || "unknown content type"}`);
  }
  if (!body.includes(route.marker)) {
    throw new Error(`${route.path} did not include expected marker: ${route.marker}`);
  }

  return `${route.path} -> json`;
}

async function smokeRedirectRoute(route) {
  const url = `${baseUrl}${route.path}`;
  const method = route.method || "GET";
  const response = await fetch(url, { redirect: "manual", method });
  const location = response.headers.get("location") || "";

  if (![301, 302, 307, 308].includes(response.status)) {
    throw new Error(`${route.path} returned HTTP ${response.status}, expected redirect`);
  }
  if (location !== route.location) {
    throw new Error(`${route.path} redirected to "${location || "(missing)"}", expected "${route.location}"`);
  }

  return `${method} ${route.path} -> ${location}`;
}

async function smokeGoneRoute(route) {
  const url = `${baseUrl}${route.path}`;
  const response = await fetch(url, { redirect: "manual" });

  if (response.status !== 410) {
    throw new Error(`${route.path} returned HTTP ${response.status}, expected 410`);
  }

  return `${route.path} -> gone`;
}

async function smokeNotFoundRoute(route) {
  const url = `${baseUrl}${route.path}`;
  const response = await fetch(url, { redirect: "manual" });
  const body = await response.text();
  const title = getTitle(body);
  const robots = getMetaContent(body, "robots");

  if (response.status !== 404) {
    throw new Error(`${route.path} returned HTTP ${response.status}, expected 404`);
  }
  if (!title.includes(route.title)) {
    throw new Error(`${route.path} served unexpected title "${title || "(missing title)"}"`);
  }
  if (robots !== route.robots) {
    throw new Error(`${route.path} robots meta was "${robots || "(missing)"}", expected "${route.robots}"`);
  }
  if (!body.includes('<div id="root"></div>')) {
    throw new Error(`${route.path} did not serve the empty client shell`);
  }

  return `${route.path} -> not found`;
}

async function main() {
  console.log(`Smoke testing route shells at ${baseUrl}`);
  const failures = [];

  for (const route of [...publicRoutes, ...hiddenRoutes, ...workspaceRoutes]) {
    try {
      const line = await smokeHtmlRoute(route);
      console.log(`ok ${line}`);
    } catch (error) {
      failures.push(`${route.path}: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`fail ${failures[failures.length - 1]}`);
    }
  }

  for (const route of jsonRoutes) {
    try {
      const line = await smokeJsonRoute(route);
      console.log(`ok ${line}`);
    } catch (error) {
      failures.push(`${route.path}: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`fail ${failures[failures.length - 1]}`);
    }
  }

  for (const route of redirectRoutes) {
    try {
      const line = await smokeRedirectRoute(route);
      console.log(`ok ${line}`);
    } catch (error) {
      failures.push(`${route.path}: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`fail ${failures[failures.length - 1]}`);
    }
  }

  for (const route of goneRoutes) {
    try {
      const line = await smokeGoneRoute(route);
      console.log(`ok ${line}`);
    } catch (error) {
      failures.push(`${route.path}: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`fail ${failures[failures.length - 1]}`);
    }
  }

  for (const route of notFoundRoutes) {
    try {
      const line = await smokeNotFoundRoute(route);
      console.log(`ok ${line}`);
    } catch (error) {
      failures.push(`${route.path}: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`fail ${failures[failures.length - 1]}`);
    }
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} route smoke check(s) failed.`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
