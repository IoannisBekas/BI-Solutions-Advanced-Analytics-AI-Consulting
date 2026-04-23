#!/usr/bin/env node

const baseUrl = (process.argv[2] || process.env.SMOKE_BASE_URL || "http://localhost:5001").replace(/\/+$/, "");

const routes = [
  {
    path: "/",
    title: "BI Solutions Group",
    body: "BI Solutions Group",
  },
  {
    path: "/contact",
    title: "BI Solutions Group",
    body: "BI Solutions Group",
  },
  {
    path: "/products",
    title: "BI Solutions Group",
    body: "BI Solutions Group",
  },
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
];

function includesAll(haystack, needles) {
  return needles.every((needle) => haystack.includes(needle));
}

async function smokeRoute(route) {
  const url = `${baseUrl}${route.path}`;
  const response = await fetch(url, { redirect: "manual" });
  const contentType = response.headers.get("content-type") || "";
  const body = await response.text();
  const titleMatch = body.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : "";
  const requiredBody = Array.isArray(route.body) ? route.body : [route.body];

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

  return `${route.path} -> ${title}`;
}

async function main() {
  console.log(`Smoke testing route shells at ${baseUrl}`);
  const failures = [];

  for (const route of routes) {
    try {
      const line = await smokeRoute(route);
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
