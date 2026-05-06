#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const ignoredDirs = new Set([
  ".git",
  "node_modules",
  "dist",
  "dev-dist",
  "build",
  "coverage",
  "data",
  "attached_assets",
  "__pycache__",
]);

const clientSecretNamePattern = /^VITE_.*(?:API_?KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY)$/i;

function isEnvFile(fileName) {
  return fileName === ".env" || fileName.startsWith(".env.");
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, out);
      continue;
    }

    if (entry.isFile() && isEnvFile(entry.name)) {
      out.push(fullPath);
    }
  }
  return out;
}

function parseEnvKey(line) {
  const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/);
  return match?.[1] ?? null;
}

const findings = [];
for (const filePath of walk(root)) {
  const relPath = path.relative(root, filePath).replace(/\\/g, "/");
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  lines.forEach((line, index) => {
    const key = parseEnvKey(line);
    if (!key) {
      return;
    }

    if (clientSecretNamePattern.test(key)) {
      findings.push(`${relPath}:${index + 1} uses client-exposed secret-like env name ${key}`);
    }
  });
}

if (findings.length > 0) {
  console.error("Unsafe env names found:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("No client-exposed secret-like env names found.");
