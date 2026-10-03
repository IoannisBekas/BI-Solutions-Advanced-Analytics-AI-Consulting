import assert from "node:assert/strict";
import test from "node:test";
import { validateAudit } from "./audit-powerbi-dependencies.mjs";

function fixture() {
  const via = {
    braces: [{ name: "braces", dependency: "braces", severity: "high", range: "<=3.0.3",
      url: "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm" }],
    chokidar: ["braces"], micromatch: ["braces"], "fast-glob": ["micromatch"],
    tailwindcss: ["chokidar", "fast-glob", "micromatch"], "tailwindcss-animate": ["tailwindcss"],
  };
  const vulnerabilities = Object.fromEntries(Object.entries(via).map(([name, causes]) =>
    [name, { name, severity: "high", via: causes, nodes: [`node_modules/${name}`] }]));
  const report = { auditReportVersion: 2, vulnerabilities, metadata: { vulnerabilities: { total: 6 } } };
  const lock = { packages: Object.fromEntries(Object.keys(via).map((name) =>
    [`node_modules/${name}`, { dev: true, version: name === "braces" ? "3.0.3" : "1.0.0" }])) };
  return { report, lock };
}
const today = new Date("2026-10-03T12:00:00Z");

test("accepts only the known dev-only advisory chain and retains its six findings", () => {
  const { report, lock } = fixture();
  assert.equal(validateAudit(report, lock, today), 6);
  assert.equal(Object.keys(report.vulnerabilities).length, 6);
});

test("rejects another advisory attached to a known dependency", () => {
  const { report, lock } = fixture();
  report.vulnerabilities.braces.via.push({ ...report.vulnerabilities.braces.via[0], url: "https://github.com/advisories/another" });
  assert.throws(() => validateAudit(report, lock, today), /Unapproved advisory/);
});

test("rejects unrelated moderate findings", () => {
  const { report, lock } = fixture();
  report.vulnerabilities.other = { name: "other", severity: "moderate", via: [], nodes: [] };
  report.metadata.vulnerabilities.total += 1;
  assert.throws(() => validateAudit(report, lock, today), /Unapproved or invalid/);
});

test("rejects any production path, missing lock entry, or changed braces version", () => {
  for (const mutation of [
    (lock) => { lock.packages["node_modules/braces"].dev = false; },
    (lock) => { lock.packages["node_modules/tailwindcss"].dev = false; },
    (lock) => { delete lock.packages["node_modules/braces"]; },
    (lock) => { lock.packages["node_modules/braces"].version = "3.0.4"; },
  ]) {
    const { report, lock } = fixture();
    mutation(lock);
    assert.throws(() => validateAudit(report, lock, today), /production or changed/);
  }
});

test("exception expires at the first instant after 2026-12-31 UTC", () => {
  const { report, lock } = fixture();
  assert.equal(validateAudit(report, lock, new Date("2026-12-31T23:59:59Z")), 6);
  assert.throws(() => validateAudit(report, lock, new Date("2027-01-01T00:00:00Z")), /expired/);
});

test("fails closed for npm errors, missing reports, inconsistent totals, or via cycles", () => {
  for (const mutation of [
    (report) => { report.error = { code: "ENOAUDIT" }; },
    (report) => { delete report.vulnerabilities; },
    (report) => { report.metadata.vulnerabilities.total = 0; },
    (report) => { report.vulnerabilities.braces.via = ["tailwindcss"]; },
  ]) {
    const { report, lock } = fixture();
    mutation(report);
    assert.throws(() => validateAudit(report, lock, today));
  }
});

test("a clean report passes after expiry; low findings do not weaken the moderate threshold", () => {
  const lock = { packages: {} };
  const report = { auditReportVersion: 2, vulnerabilities: {}, metadata: { vulnerabilities: { total: 0 } } };
  assert.equal(validateAudit(report, lock, new Date("2027-01-01T00:00:00Z")), 0);
  report.vulnerabilities.other = { name: "other", severity: "low" };
  report.metadata.vulnerabilities.total = 1;
  assert.equal(validateAudit(report, lock, today), 0);
});
