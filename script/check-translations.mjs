import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const blogDataPath = path.join(root, "apps", "client", "src", "data", "blogData.ts");
const cataloguePath = path.join(
  root,
  "apps",
  "client",
  "src",
  "i18n",
  "pageTranslations.generated.ts",
);

function normalize(value) {
  return value.replace(/\s+/g, " ").trim();
}

function translationKey(section) {
  const withoutMarkdown = section
    .replace(/^#{1,6}\s+/, "")
    .replace(/^>\s+/, "")
    .replace(/^[-*]\s+/, "");
  return normalize(withoutMarkdown);
}

const [blogSource, catalogueSource] = await Promise.all([
  fs.readFile(blogDataPath, "utf8"),
  fs.readFile(cataloguePath, "utf8"),
]);
const assignmentStart = catalogueSource.indexOf(
  "= {",
  catalogueSource.indexOf("export const"),
);
const objectEnd = catalogueSource.lastIndexOf("};");
if (assignmentStart < 0 || objectEnd < assignmentStart) {
  throw new Error("Could not parse the generated translation catalogue.");
}
const catalogue = JSON.parse(catalogueSource.slice(assignmentStart + 2, objectEnd + 1));
const sourceFile = ts.createSourceFile(
  blogDataPath,
  blogSource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
);
const missing = [];
let checked = 0;

function checkKey(value, context) {
  const key = translationKey(value);
  if (!key) return;
  checked += 1;
  if (!catalogue[key]?.el || !catalogue[key]?.de) missing.push(`${context}: ${key}`);
}

function visit(node) {
  if (ts.isPropertyAssignment(node)) {
    const propertyName = node.name.getText(sourceFile);
    const initializer = node.initializer;

    if (propertyName === "content") {
      if (!ts.isNoSubstitutionTemplateLiteral(initializer)) {
        missing.push("content: interpolated template strings cannot be translated block by block");
      } else {
        initializer.text
          .replace(/\r\n/g, "\n")
          .split(/\n\s*\n/)
          .forEach((section, index) => checkKey(section, `content block ${index + 1}`));
      }
    } else if (
      ["title", "seoTitle", "excerpt"].includes(propertyName) &&
      (ts.isStringLiteral(initializer) || ts.isNoSubstitutionTemplateLiteral(initializer))
    ) {
      checkKey(initializer.text, propertyName);
    }
  }

  ts.forEachChild(node, visit);
}

visit(sourceFile);

if (missing.length > 0) {
  throw new Error(
    `Missing Greek or German blog translations:\n${missing.slice(0, 20).join("\n")}${
      missing.length > 20 ? `\n...and ${missing.length - 20} more` : ""
    }`,
  );
}

console.log(`Translation checks passed for ${checked} blog fields and content blocks.`);
