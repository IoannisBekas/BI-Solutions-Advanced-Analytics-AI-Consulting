#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "dev-dist",
  "build",
  "coverage",
  "__pycache__",
  "attached_assets",
]);

const TEXT_EXTENSIONS = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".py",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);

const MOJIBAKE_PATTERNS = [
  /â[\u0080-\u00BF]/u,
  /Ã[\u0080-\u00BF]/u,
  /\uFFFD/,
];

const findings = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        walk(path.join(dir, entry.name));
      }
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const filePath = path.join(dir, entry.name);
    const ext = path.extname(entry.name).toLowerCase();
    if (!TEXT_EXTENSIONS.has(ext)) {
      continue;
    }

    const text = fs.readFileSync(filePath, "utf8");
    const lines = text.split(/\r?\n/);
    for (const [index, line] of lines.entries()) {
      if (MOJIBAKE_PATTERNS.some((pattern) => pattern.test(line))) {
        findings.push(`${path.relative(ROOT, filePath)}:${index + 1}`);
      }
    }
  }
}

walk(ROOT);

if (findings.length > 0) {
  console.error("Possible mojibake/encoding corruption found:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("No common mojibake sequences found.");
