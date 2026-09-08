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

const prerenderChecks = [
  ["el/index.html", ["Selected case studies", "Client Reviews", "Start a project"]],
  ["de/index.html", ["Selected case studies", "Client Reviews", "Start a project"]],
  ["el/services/index.html", ["The complete service atlas", "One partner for better"]],
  ["de/services/index.html", ["The complete service atlas", "One partner for better"]],
  ["el/blog/index.html", ["Start a project"]],
  ["de/blog/index.html", ["Start a project"]],
];
const prerenderLeaks = [];

for (const [relativePath, markers] of prerenderChecks) {
  const html = await fs.readFile(path.join(root, "dist", "public", relativePath), "utf8");
  const visibleHtml = html.replace(
    /<script id="i18n-prehydrate">[\s\S]*?<\/script>/g,
    "",
  );
  for (const marker of markers) {
    if (visibleHtml.includes(marker)) prerenderLeaks.push(`${relativePath}: ${marker}`);
  }

  if (!html.includes('<script id="i18n-prehydrate">')) {
    prerenderLeaks.push(`${relativePath}: missing pre-hydration localization bridge`);
  }
}

if (prerenderLeaks.length > 0) {
  throw new Error(`English copy leaked into localized prerender output:\n${prerenderLeaks.join("\n")}`);
}

console.log(`Prerender localization checks passed for ${prerenderChecks.length} priority pages.`);

function visibleTextSegments(html) {
  const withoutNonContent = html
    .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(
      /<([a-z][\w:-]*)\b[^>]*\btranslate=(['"])no\2[^>]*>[\s\S]*?<\/\1>/gi,
      " ",
    )
    .replace(/<!--[\s\S]*?-->/g, " ");

  return new Set(
    [...withoutNonContent.matchAll(/>([^<>]+)</g)]
      .map((match) => normalize(match[1]))
      .filter(Boolean),
  );
}

function isExpectedSharedText(segment) {
  return (
    segment === "BI Solutions Group" ||
    segment === "Power BI Solutions" ||
    /^© \d{4} BI Solutions Group\.$/.test(segment) ||
    /^(?:https?:\/\/)?(?:www\.)?[a-z0-9.-]+\.[a-z]{2,}(?:\/\S*)?$/i.test(segment)
  );
}

const localizedRoots = ["el", "de"];
const shortCopyThatMustBeLocalized = new Set(["Previous slide", "Next slide"]);
const sharedEnglishLeaks = [];
let localizedPagesChecked = 0;

async function collectIndexPages(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) pages.push(...(await collectIndexPages(entryPath)));
    else if (entry.name === "index.html") pages.push(entryPath);
  }

  return pages;
}

for (const locale of localizedRoots) {
  const localeRoot = path.join(root, "dist", "public", locale);
  const localizedPages = await collectIndexPages(localeRoot);

  for (const localizedPage of localizedPages) {
    const relativePath = path.relative(localeRoot, localizedPage);
    const englishPage = path.join(root, "dist", "public", relativePath);
    const [englishHtml, localizedHtml] = await Promise.all([
      fs.readFile(englishPage, "utf8"),
      fs.readFile(localizedPage, "utf8"),
    ]);
    const englishSegments = visibleTextSegments(englishHtml);
    const localizedSegments = visibleTextSegments(localizedHtml);

    for (const segment of englishSegments) {
      if (!localizedSegments.has(segment) || isExpectedSharedText(segment)) continue;

      const latinWords = segment
        .replace(/&[a-z0-9#]+;/gi, " ")
        .match(/[A-Za-z][A-Za-z'-]*/g);
      if ((latinWords?.length ?? 0) >= 3 || shortCopyThatMustBeLocalized.has(segment)) {
        sharedEnglishLeaks.push(`${locale}/${relativePath}: ${segment}`);
      }
    }

    localizedPagesChecked += 1;
  }
}

if (sharedEnglishLeaks.length > 0) {
  throw new Error(
    `English copy leaked into localized pages:\n${sharedEnglishLeaks.slice(0, 30).join("\n")}${
      sharedEnglishLeaks.length > 30
        ? `\n...and ${sharedEnglishLeaks.length - 30} more`
        : ""
    }`,
  );
}

console.log(
  `Full prerender localization audit passed for ${localizedPagesChecked} Greek and German pages.`,
);
