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
    title: "Services - BI Solutions Group",
    body: "Four focused service pillars",
  },
  {
    path: "/services/business-intelligence-semantic-modeling",
    title: "Business Intelligence & Semantic Modeling",
    body: "Power BI, Tableau, Looker",
  },
  {
    path: "/services/advanced-analytics-ai",
    title: "Advanced Analytics & AI Consulting",
    body: "practical AI workflows",
  },
  {
    path: "/services/data-strategy-governance",
    title: "Data Strategy & Governance",
    body: "governance, access controls",
  },
  {
    path: "/services/website-app-development",
    title: "Website & Web App Development",
    body: "web applications for Greek and international businesses",
  },
  {
    path: "/products",
    title: "Products - BI Solutions Group",
    body: "Focused analytics product workspaces",
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
    body: "portfolio work",
  },
  {
    path: "/blog",
    title: "Blog - BI Solutions Group",
    body: "Insights on analytics",
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy",
    body: "Privacy policy",
  },
  {
    path: "/terms-of-service",
    title: "Terms of Service",
    body: "Terms of service",
  },
];

const hiddenRoutes = [
  {
    path: "/bonusaki",
    title: "Bonusaki Cafe Pilot",
    body: "Bonusaki",
    robots: "noindex,follow",
  },
  {
    path: "/ai-advisor",
    title: "Greek AI Professional Advisor",
    body: "Greek AI Professional Advisor",
    robots: "noindex,follow",
  },
  {
    path: "/blog/google-gemini-import-ai-chats",
    title: "Google Gemini is Making it Easy to Quit ChatGPT",
    body: "Google Gemini",
    robots: "noindex,follow",
  },
];

const workspaceRoutes = [
  {
    path: "/quantus/workspace/",
    title: "Quantus Research Platform",
    body: "Quantus",
  },
  {
    path: "/power-bi-solutions/workspace/",
    title: "Power BI Solutions Workspace",
    body: "Power BI Solutions",
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
    path: "/services/mlops-productionization",
    location: "/services/advanced-analytics-ai",
  },
  {
    path: "/services/digital-transformation-cloud-migration",
    location: "/services/data-strategy-governance",
  },
  {
    path: "/services/ai-literacy-change-management",
    location: "/services/advanced-analytics-ai",
  },
  {
    path: "/services/website-web-app-development",
    location: "/services/website-app-development",
  },
];

const goneRoutes = [
  {
    path: "/contact",
  },
];

function includesAll(haystack, needles) {
  return needles.every((needle) => haystack.includes(needle));
}

function getTitle(body) {
  const titleMatch = body.match(/<title>(.*?)<\/title>/i);
  return titleMatch ? titleMatch[1] : "";
}

function getMetaContent(body, name) {
  const pattern = new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["']\\s*\\/?>`, "i");
  const match = body.match(pattern);
  return match ? match[1] : "";
}

async function smokeHtmlRoute(route) {
  const url = `${baseUrl}${route.path}`;
  const response = await fetch(url, { redirect: "manual" });
  const contentType = response.headers.get("content-type") || "";
  const body = await response.text();
  const title = getTitle(body);
  const requiredBody = Array.isArray(route.body) ? route.body : [route.body];
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
  if (!includesAll(body, requiredBody)) {
    throw new Error(`${route.path} did not include expected marker(s): ${requiredBody.join(", ")}`);
  }
  for (const marker of absent) {
    if (body.includes(marker)) {
      throw new Error(`${route.path} still includes removed marker: ${marker}`);
    }
  }
  if (route.robots) {
    const robots = getMetaContent(body, "robots");
    if (robots !== route.robots) {
      throw new Error(`${route.path} robots meta was "${robots || "(missing)"}", expected "${route.robots}"`);
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
  const response = await fetch(url, { redirect: "manual" });
  const location = response.headers.get("location") || "";

  if (![301, 302, 307, 308].includes(response.status)) {
    throw new Error(`${route.path} returned HTTP ${response.status}, expected redirect`);
  }
  if (location !== route.location) {
    throw new Error(`${route.path} redirected to "${location || "(missing)"}", expected "${route.location}"`);
  }

  return `${route.path} -> ${location}`;
}

async function smokeGoneRoute(route) {
  const url = `${baseUrl}${route.path}`;
  const response = await fetch(url, { redirect: "manual" });

  if (response.status !== 410) {
    throw new Error(`${route.path} returned HTTP ${response.status}, expected 410`);
  }

  return `${route.path} -> gone`;
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

  if (failures.length > 0) {
    console.error(`\n${failures.length} route smoke check(s) failed.`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
