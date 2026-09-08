import type { Locale } from "./config";

type PageTranslations = Record<string, { el: string; de: string }>;

let pageTranslations: PageTranslations = {};

export function setPageTranslations(translations: PageTranslations) {
  pageTranslations = translations;
}

const translatedAttributes = ["alt", "aria-label", "placeholder", "title"];
const protectedTerms = new Set([
  "en",
  "Airtable",
  "Azure",
  "Azure OpenAI",
  "BigQuery",
  "Cloud",
  "CMS",
  "Databricks",
  "DAX",
  "dbt",
  "Excel",
  "Git & GitHub",
  "Make",
  "Microsoft Fabric",
  "MLOps",
  "n8n",
  "Next.js",
  "Node.js",
  "Notion",
  "OpenAI",
  "PostgreSQL",
  "Power BI",
  "Power Query",
  "Python",
  "RAG",
  "React",
  "Schema.org",
  "Snowflake",
  "SQL",
  "Tabular Editor",
  "TypeScript",
]);
const legacyTranslations: Record<string, { el: string; de: string }> = {
  "Cookies & Analytics": {
    el: "Cookies και αναλυτικά στοιχεία",
    de: "Cookies und Analysen",
  },
  "We use essential cookies and basic analytics to improve the site experience.": {
    el: "Χρησιμοποιούμε απαραίτητα cookies και βασικά αναλυτικά στοιχεία για να βελτιώνουμε την εμπειρία του ιστότοπου.",
    de: "Wir verwenden notwendige Cookies und grundlegende Analysen, um das Nutzungserlebnis zu verbessern.",
  },
  "Essential cookies and basic analytics.": {
    el: "Απαραίτητα cookies και βασικά αναλυτικά στοιχεία.",
    de: "Notwendige Cookies und grundlegende Analysen.",
  },
  "Privacy Policy": { el: "Πολιτική απορρήτου", de: "Datenschutzerklärung" },
  Decline: { el: "Απόρριψη", de: "Ablehnen" },
  Accept: { el: "Αποδοχή", de: "Akzeptieren" },
};

function shouldSkipTranslation(node: Node) {
  const element = node instanceof Element ? node : node.parentElement;
  return Boolean(element?.closest('[translate="no"]'));
}

export function translatePageCopy(value: string, locale: Locale) {
  if (locale === "en") return value;
  const normalized = value.replace(/\s+/g, " ").trim();
  if (protectedTerms.has(normalized)) return value;
  const translation =
    pageTranslations[normalized]?.[locale] ?? legacyTranslations[normalized]?.[locale];
  if (!translation) return value;
  return value.replace(normalized, translation);
}

function localizeElement(element: Element, locale: Exclude<Locale, "en">) {
  if (shouldSkipTranslation(element)) return;

  for (const attribute of translatedAttributes) {
    const value = element.getAttribute(attribute);
    if (!value) continue;
    const localized = translatePageCopy(value, locale);
    if (localized !== value) element.setAttribute(attribute, localized);
  }

  if (element instanceof HTMLMetaElement && element.content) {
    const localized = translatePageCopy(element.content, locale);
    if (localized !== element.content) element.content = localized;
  }
}

function localizeNode(node: Node, locale: Exclude<Locale, "en">) {
  if (shouldSkipTranslation(node)) return;

  if (node.nodeType === Node.TEXT_NODE && node.textContent) {
    const localized = translatePageCopy(node.textContent, locale);
    if (localized !== node.textContent) node.textContent = localized;
    return;
  }

  if (!(node instanceof Element)) return;
  localizeElement(node, locale);

  const walker = document.createTreeWalker(
    node,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
  );
  while (walker.nextNode()) {
    const current = walker.currentNode;
    if (shouldSkipTranslation(current)) continue;

    if (current.nodeType === Node.TEXT_NODE && current.textContent) {
      const localized = translatePageCopy(current.textContent, locale);
      if (localized !== current.textContent) current.textContent = localized;
    } else if (current instanceof Element) {
      localizeElement(current, locale);
    }
  }
}

export function localizeDocument(locale: Locale) {
  if (locale === "en") return () => undefined;

  localizeNode(document.documentElement, locale);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        localizeNode(mutation.target, locale);
      } else if (mutation.type === "attributes") {
        if (mutation.target instanceof Element) {
          localizeElement(mutation.target, locale);
        }
      } else {
        mutation.addedNodes.forEach((node) => localizeNode(node, locale));
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [...translatedAttributes, "content"],
    characterData: true,
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
}
