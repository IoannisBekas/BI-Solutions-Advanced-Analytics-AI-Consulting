import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const sourceRoots = [
  "apps/client/src/pages",
  "apps/client/src/components",
  "apps/client/src/data",
  "apps/client/src/lib/servicePages.ts",
];
const outputPath = path.join(
  root,
  "apps/client/src/i18n/pageTranslations.generated.ts",
);

const ignoredPathParts = ["/components/ui/", "/assets/"];
const translatableAttributes = new Set([
  "alt",
  "aria-label",
  "placeholder",
  "title",
]);

function normalize(value) {
  return value.replace(/\s+/g, " ").trim();
}

function looksLikeCopy(value) {
  if (value.length < 2 || !/[A-Za-z]/.test(value)) return false;
  if (/^(https?:|mailto:|tel:|data:|\/|#|\.|[a-z]+\/)/i.test(value)) return false;
  if (/^[\w-]+(?:\s+[\w:[\]()./%#-]+){2,}$/.test(value) && /[[\]/%#]/.test(value)) {
    return false;
  }
  return true;
}

function addCopy(values, value) {
  const normalizedLines = value.replace(/\r\n/g, "\n").trim();
  if (!normalizedLines) return;
  const fragments = normalizedLines.split(/\n\s*\n/);

  for (const fragment of fragments) {
    const clean = normalize(fragment)
      .replace(/^#{1,6}\s+/, "")
      .replace(/^>\s+/, "")
      .replace(/^[-*]\s+/, "")
      .replace(/^\*\*(.+)\*\*$/, "$1");
    if (looksLikeCopy(clean)) values.add(clean);
  }
}

async function collectFiles(entry) {
  const absolute = path.join(root, entry);
  const stat = await fs.stat(absolute);
  if (stat.isFile()) return [absolute];

  const files = [];
  for (const child of await fs.readdir(absolute, { withFileTypes: true })) {
    const childPath = path.join(absolute, child.name);
    if (child.isDirectory()) files.push(...(await collectFiles(path.relative(root, childPath))));
    else if (/\.(ts|tsx)$/.test(child.name)) files.push(childPath);
  }
  return files;
}

function collectFromNode(node, values) {
  if (
    ts.isPropertyAssignment(node) &&
    (node.name.getText() === "el" || node.name.getText() === "de")
  ) {
    return;
  }

  if (ts.isJsxText(node)) addCopy(values, node.text);

  if (ts.isJsxAttribute(node) && translatableAttributes.has(node.name.text)) {
    if (node.initializer && ts.isStringLiteral(node.initializer)) {
      addCopy(values, node.initializer.text);
    }
  }

  if (
    ts.isStringLiteral(node) ||
    ts.isNoSubstitutionTemplateLiteral(node) ||
    ts.isTemplateHead(node) ||
    ts.isTemplateMiddle(node) ||
    ts.isTemplateTail(node)
  ) {
    addCopy(values, node.text);
  }

  ts.forEachChild(node, (child) => collectFromNode(child, values));
}

async function translateBatch(batch, target) {
  const source = batch
    .map((text, index) => `${text}\n<<<${String(index).padStart(4, "0")}>>>`)
    .join("\n");
  const params = new URLSearchParams({
    client: "gtx",
    sl: "en",
    tl: target,
    dt: "t",
    q: source,
  });
  const response = await fetch("https://translate.googleapis.com/translate_a/single", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: params,
  });
  if (!response.ok) throw new Error(`Translation failed (${response.status})`);
  const data = await response.json();
  const translated = data[0].map((part) => part[0]).join("");
  const parts = translated.split(/\n?<<<\d{4}>>>\n?/);
  if (parts.at(-1)?.trim() === "") parts.pop();
  if (parts.length !== batch.length) {
    throw new Error(`Expected ${batch.length} translations, received ${parts.length}`);
  }
  return parts.map(normalize);
}

function makeBatches(values, maxCharacters = 5500) {
  const batches = [];
  let batch = [];
  let length = 0;
  for (const value of values) {
    if (batch.length && length + value.length > maxCharacters) {
      batches.push(batch);
      batch = [];
      length = 0;
    }
    batch.push(value);
    length += value.length + 12;
  }
  if (batch.length) batches.push(batch);
  return batches;
}

const files = (await Promise.all(sourceRoots.map(collectFiles)))
  .flat()
  .filter((file) => !ignoredPathParts.some((part) => file.replaceAll("\\", "/").includes(part)));
const values = new Set();

for (const file of files) {
  const sourceText = await fs.readFile(file, "utf8");
  const source = ts.createSourceFile(
    file,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  collectFromNode(source, values);
}

const english = [...values].filter((value) => value.length <= 4500).sort();
const existingSource = await fs.readFile(outputPath, "utf8").catch(() => "");
const assignmentStart = existingSource.indexOf("= {", existingSource.indexOf("export const"));
const objectStart = assignmentStart >= 0 ? assignmentStart + 2 : -1;
const objectEnd = existingSource.lastIndexOf("};");
const existingTranslations =
  objectStart >= 0 && objectEnd > objectStart
    ? JSON.parse(existingSource.slice(objectStart, objectEnd + 1))
    : {};
const untranslated = english.filter((value) => !existingTranslations[value]);
console.log(
  `Collected ${english.length} strings; translating ${untranslated.length} new strings...`,
);

const batches = makeBatches(untranslated);
const newTranslations = {};
for (const [batchIndex, batch] of batches.entries()) {
  const el = await translateBatch(batch, "el");
  const de = await translateBatch(batch, "de");
  batch.forEach((text, index) => {
    newTranslations[text] = { el: el[index], de: de[index] };
  });
  console.log(`${batchIndex + 1}/${batches.length} batches`);
}

const entries = english.map((text) => [
  text,
  existingTranslations[text] ?? newTranslations[text],
]);

const body = `// Generated by script/generate-page-translations.mjs.\n` +
  `// Do not edit by hand; update the English source copy and regenerate.\n` +
  `export const pageTranslations: Record<string, { el: string; de: string }> = ${JSON.stringify(Object.fromEntries(entries), null, 2)};\n`;

await fs.writeFile(outputPath, body, "utf8");
console.log(`Wrote ${path.relative(root, outputPath)}`);
