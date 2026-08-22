#!/usr/bin/env node

const baseUrl = (process.argv[2] || process.env.SMOKE_BASE_URL || "http://localhost:5001").replace(/\/+$/, "");

const publicRoutes = [
  {
    path: "/",
    title: "AI, BI & Web App Development",
    body: "Clarity from complexity",
    absent: [
      "AI Products",
      "How engagements work",
      "Two focused workspaces",
      "Why BI Solutions Group",
    ],
  },
  {
    path: "/services",
    title: "Analytics, AI, Data, Digital Products & Enablement Services",
    body: "One partner for the systems behind better decisions.",
  },
  {
    path: "/case-studies/unicef-audit-compliance",
    title: "Audit Compliance Power BI Case Study",
    body: "Independent portfolio analysis",
    canonical: "https://www.bisolutions.group/case-studies/unicef-audit-compliance",
  },
  {
    path: "/case-studies/iaea-scientific-analysis",
    title: "Scientific Analysis Power BI Case Study",
    body: "Independent portfolio analysis",
    canonical: "https://www.bisolutions.group/case-studies/iaea-scientific-analysis",
  },
  {
    path: "/case-studies/ifc-talent-strategy",
    title: "Talent Analytics Power BI Case Study",
    body: "Independent portfolio analysis",
    canonical: "https://www.bisolutions.group/case-studies/ifc-talent-strategy",
  },
  {
    path: "/start-a-project",
    title: "Start a Project",
    body: "Bring the problem.",
    canonical: "https://www.bisolutions.group/start-a-project",
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

const serviceRedirectAnchors = {
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

const redirectRoutes = Object.entries(serviceRedirectAnchors).map(
  ([slug, anchor]) => ({
    path: `/services/${slug}`,
    location: `/services#${anchor}`,
  }),
);

const goneRoutes = [
  {
    path: "/quantus",
  },
  {
    path: "/quantus?utm_source=smoke",
  },
  {
    path: "/power-bi-solutions",
  },
  {
    path: "/bonusaki",
  },
  {
    path: "/ai-advisor",
  },
  {
    path: "/Quantus-Investing",
  },
  {
    path: "/Quantus%20Investing",
  },
  {
    path: "/Quantus",
  },
  {
    path: "/Power%20BI%20Solutions",
  },
  {
    path: "/Bonusaki",
  },
  {
    path: "/Greek%20AI%20Professional%20Advisor",
  },
  {
    path: "/products",
  },
  {
    path: "/all-products",
  },
  {
    path: "/portfolio",
  },
  {
    path: "/website-app-portfolio",
  },
  {
    path: "/website-app-portfolio?utm_source=smoke",
  },
  {
    path: "/Website%20%26%20App%20Portfolio",
  },
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
