import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const advisoryUrl = "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm";
const expiresAt = Date.parse("2027-01-01T00:00:00Z");
const buildPackages = new Set([
  "braces", "chokidar", "micromatch", "fast-glob", "tailwindcss", "tailwindcss-animate",
]);
const severities = new Map(["info", "low", "moderate", "high", "critical"].map((name, i) => [name, i]));
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

// Temporary exception through 2026-12-31: braces has no published patched release.
// https://github.com/micromatch/braces/pull/72 remains an unpublished fix.
// These dev-only Tailwind tools consume trusted repository globs in tailwind.config.js;
// they are not shipped in the static app. Keep the advisory visible and fail all other
// moderate+ findings, production paths, changed braces versions, or expired exceptions.
export function validateAudit(report, lock, now = new Date()) {
  if (report?.error || report?.auditReportVersion !== 2 || !isObject(report.vulnerabilities)
      || !isObject(report.metadata?.vulnerabilities) || !isObject(lock?.packages)) {
    throw new Error("Invalid npm audit report or package lock; dependency audit failed closed.");
  }
  const findings = report.vulnerabilities;
  let exceptions = 0;
  const inspect = (name, visiting = new Set()) => {
    const finding = findings[name];
    if (!buildPackages.has(name) || !isObject(finding) || finding.name !== name
        || visiting.has(name) || !Array.isArray(finding.via) || finding.via.length === 0
        || !Array.isArray(finding.nodes) || finding.nodes.length === 0) {
      throw new Error(`Unapproved or invalid dependency finding: ${name}`);
    }
    for (const node of finding.nodes) {
      const installed = lock.packages[node];
      if (!node.startsWith("node_modules/") || installed?.dev !== true
          || (name === "braces" && installed.version !== "3.0.3")) {
        throw new Error(`Exception cannot cover production or changed dependency: ${node}`);
      }
    }
    const next = new Set([...visiting, name]);
    for (const via of finding.via) {
      if (typeof via === "string") {
        inspect(via, next);
      } else if (!isObject(via) || name !== "braces" || via.name !== "braces"
          || via.dependency !== "braces" || via.url !== advisoryUrl
          || via.severity !== "high" || via.range !== "<=3.0.3") {
        throw new Error(`Unapproved advisory affecting ${name}`);
      }
    }
  };
  for (const [name, finding] of Object.entries(findings)) {
    if (!isObject(finding) || !severities.has(finding.severity)) {
      throw new Error(`Invalid dependency severity: ${name}`);
    }
    if (severities.get(finding.severity) < severities.get("moderate")) continue;
    if (!Number.isFinite(+now) || +now >= expiresAt) {
      throw new Error("The Power BI build-only braces exception expired; review the upstream fix.");
    }
    inspect(name);
    exceptions += 1;
  }
  if (report.metadata.vulnerabilities.total !== Object.keys(findings).length) {
    throw new Error("Inconsistent npm audit totals; dependency audit failed closed.");
  }
  return exceptions;
}

function main() {
  const appDirectory = fileURLToPath(new URL("../apps/powerbi-solutions/", import.meta.url));
  const audit = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm",
    ["audit", "--json", "--audit-level=moderate"], {
      cwd: appDirectory, encoding: "utf8", maxBuffer: 10 * 1024 * 1024,
      shell: process.platform === "win32",
    });
  // Preserve the complete npm report, including the acknowledged advisory, in CI logs.
  process.stdout.write(audit.stdout || "");
  process.stderr.write(audit.stderr || "");
  if (audit.error || ![0, 1].includes(audit.status)) {
    throw new Error(`npm audit failed to run: ${audit.error?.message || audit.status}`);
  }
  const report = JSON.parse(audit.stdout);
  const lock = JSON.parse(readFileSync(path.join(appDirectory, "package-lock.json"), "utf8"));
  const exceptions = validateAudit(report, lock);
  if (audit.status === 1 && exceptions === 0) throw new Error("npm audit failed without an approved finding.");
  console.log(exceptions
    ? `Dependency audit passed with ${exceptions} dev-only findings from ${advisoryUrl}; exception expires 2026-12-31.`
    : "Dependency audit passed with no moderate-or-higher findings.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
