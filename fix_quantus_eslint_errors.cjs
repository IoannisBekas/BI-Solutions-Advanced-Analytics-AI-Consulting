const fs = require('fs');
const path = require('path');

const repoRoot = String.raw`C:\Users\bekas\Downloads\BI Solutions`;

function read(relPath) {
  return fs.readFileSync(path.join(repoRoot, relPath), 'utf8').replace(/\r\n/g, '\n');
}

function write(relPath, content) {
  fs.writeFileSync(path.join(repoRoot, relPath), content, 'utf8');
}

function replaceOrThrow(source, searchValue, replaceValue, file) {
  if (!source.includes(searchValue)) {
    throw new Error(`Could not find expected text in ${file}: ${searchValue.slice(0, 80)}`);
  }
  return source.replace(searchValue, replaceValue);
}

function fixEslintConfig() {
  const file = path.join('Quantus', 'eslint.config.js');
  let content = read(file);
  content = replaceOrThrow(
    content,
    "{ ignores: ['dist/', 'node_modules/', 'server/data/'] },",
    "{ ignores: ['dist/', 'dev-dist/', 'node_modules/', 'server/data/'] },",
    file,
  );
  write(file, content);
}

function fixApp() {
  const file = path.join('Quantus', 'src', 'App.tsx');
  let content = read(file);
  content = replaceOrThrow(
    content,
    "  const [currentAsset, setCurrentAsset] = useState<AssetEntry | null>(null);\n",
    "  const [, setCurrentAsset] = useState<AssetEntry | null>(null);\n",
    file,
  );
  content = replaceOrThrow(
    content,
    "        case 't':\n          e.preventDefault();\n          const searchInput = document.querySelector('input[type=\"text\"]') as HTMLInputElement;\n          if (searchInput) searchInput.focus();\n          break;\n",
    "        case 't': {\n          e.preventDefault();\n          const searchInput = document.querySelector('input[type=\"text\"]') as HTMLInputElement;\n          if (searchInput) searchInput.focus();\n          break;\n        }\n",
    file,
  );
  content = replaceOrThrow(
    content,
    "        case 'e':\n          // Expand/collapse Deep Dive\n          e.preventDefault();\n          const firstDeepDive = document.querySelector('.deep-dive-trigger') as HTMLButtonElement;\n          if (firstDeepDive) firstDeepDive.click();\n          break;\n",
    "        case 'e': {\n          // Expand/collapse Deep Dive\n          e.preventDefault();\n          const firstDeepDive = document.querySelector('.deep-dive-trigger') as HTMLButtonElement;\n          if (firstDeepDive) firstDeepDive.click();\n          break;\n        }\n",
    file,
  );
  content = replaceOrThrow(
    content,
    "          console.log('Added to watchlist');\n",
    "          console.warn('Added to watchlist');\n",
    file,
  );
  content = content.replaceAll("onWatchlist={() => { }}", "onWatchlist={() => undefined}");
  content = content.replaceAll("onScreener={() => { }}", "onScreener={() => undefined}");
  content = content.replaceAll("onPortfolio={() => { }}", "onPortfolio={() => undefined}");
  content = content.replaceAll("onSubscribe={() => { }}", "onSubscribe={() => undefined}");
  write(file, content);
}

function fixErrorBoundary() {
  const file = path.join('Quantus', 'src', 'components', 'ErrorBoundary.tsx');
  let content = read(file);
  content = replaceOrThrow(
    content,
    "import React, { Component, ErrorInfo, ReactNode, PropsWithChildren } from 'react';\n\ninterface Props extends PropsWithChildren { }\n",
    "import React, { Component, ErrorInfo, PropsWithChildren } from 'react';\n\ntype Props = PropsWithChildren;\n",
    file,
  );
  write(file, content);
}

function fixReportViewer() {
  const file = path.join('Quantus', 'src', 'components', 'ReportViewer.tsx');
  let content = read(file);
  content = content.replaceAll("catch { }", "catch { /* ignore malformed SSE chunks */ }");
  write(file, content);
}

function main() {
  fixEslintConfig();
  fixApp();
  fixErrorBoundary();
  fixReportViewer();
  console.log('Applied Quantus ESLint blocker fixes.');
}

main();
