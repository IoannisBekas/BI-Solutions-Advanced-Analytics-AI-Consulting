import { useContext, useEffect } from "react";
import { SsrHeadContext } from "./ssrHead";
import { useLocale } from "@/i18n/LocaleProvider";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_TAGS,
  localePrefix,
  splitLocaleFromPath,
  type Locale,
} from "@/i18n/config";
import { TRANSLATED_ROUTES } from "@/i18n/translations";

const SITE_NAME = "BI Solutions Group";

/**
 * Google truncates the title around 60 characters. Appending the full site
 * name costs 20, which pushed most article titles past the cut so the
 * distinguishing half was the part that disappeared. Append the shorter brand
 * when it still fits, and drop it entirely when the page title already carries
 * the page on its own.
 */
const TITLE_LIMIT = 60;
const SHORT_SITE_NAME = "BI Solutions";

function composeTitle(title: string) {
  const full = `${title} | ${SITE_NAME}`;
  if (full.length <= TITLE_LIMIT) return full;

  const short = `${title} | ${SHORT_SITE_NAME}`;
  if (short.length <= TITLE_LIMIT) return short;

  return title;
}
const SITE_URL = "https://www.bisolutions.group";
const DEFAULT_IMAGE = "/og.png";

type StructuredData = Record<string, unknown> | Array<Record<string, unknown>>;

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  robots?: string;
  keywords?: string[];
  structuredData?: StructuredData;
}

function toAbsoluteUrl(pathOrUrl: string) {
  if (/^(https?:\/\/|data:|blob:)/i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return `${SITE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

function setMetaTag(
  attribute: "name" | "property",
  key: string,
  content: string,
) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function setCanonicalLink(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }

  link.setAttribute("href", href);
}

function setAlternateLinks(alternates: Array<{ hreflang: string; href: string }>) {
  document.head
    .querySelectorAll('link[rel="alternate"][data-seo-alternate]')
    .forEach((link) => link.remove());

  for (const alternate of alternates) {
    const link = document.createElement("link");
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", alternate.hreflang);
    link.setAttribute("href", alternate.href);
    link.setAttribute("data-seo-alternate", "");
    document.head.appendChild(link);
  }
}

/**
 * Untranslated routes reached under a locale prefix (e.g. /el/services) serve
 * the English page, so they must canonicalise to the English URL rather than
 * claim to be a separate page.
 */
function canonicalFor(routePath: string, locale: Locale) {
  const prefix = TRANSLATED_ROUTES.has(routePath)
    ? localePrefix(locale)
    : localePrefix(DEFAULT_LOCALE);

  return toAbsoluteUrl(`${prefix}${routePath === "/" ? "/" : routePath}`);
}

/**
 * Only routes with genuine translations advertise alternates — pointing search
 * engines at untranslated duplicates is worse than staying silent.
 */
function buildAlternates(routePath: string) {
  if (!TRANSLATED_ROUTES.has(routePath)) return [];

  const urlFor = (prefix: string) =>
    `${SITE_URL}${prefix}${routePath === "/" ? "/" : routePath}`;

  return [
    ...LOCALES.map((candidate) => ({
      hreflang: LOCALE_TAGS[candidate],
      href: urlFor(localePrefix(candidate)),
    })),
    { hreflang: "x-default", href: urlFor(localePrefix(DEFAULT_LOCALE)) },
  ];
}

export function Seo({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  type = "website",
  robots = "index,follow",
  keywords,
  structuredData,
}: SeoProps) {
  const ssrHead = useContext(SsrHeadContext);
  const { locale } = useLocale();

  useEffect(() => {
    const pageTitle = composeTitle(title);
    const routePath = path ?? splitLocaleFromPath(window.location.pathname).path;
    const canonicalUrl = canonicalFor(routePath, locale);
    const imageUrl = toAbsoluteUrl(image);
    const structuredDataId = "seo-structured-data";

    document.title = pageTitle;

    setMetaTag("name", "description", description);
    setMetaTag("name", "robots", robots);
    if (keywords && keywords.length > 0) {
      setMetaTag("name", "keywords", keywords.join(", "));
    }
    setMetaTag("property", "og:site_name", SITE_NAME);
    setMetaTag("property", "og:locale", LOCALE_TAGS[locale].replace("-", "_"));
    setMetaTag("property", "og:title", pageTitle);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:url", canonicalUrl);
    setMetaTag("property", "og:type", type);
    setMetaTag("property", "og:image", imageUrl);
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", pageTitle);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", imageUrl);
    setCanonicalLink(canonicalUrl);
    setAlternateLinks(buildAlternates(routePath));

    const existingScript = document.getElementById(structuredDataId);
    if (existingScript) {
      existingScript.remove();
    }

    if (structuredData) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = structuredDataId;
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return () => {
      const staleScript = document.getElementById(structuredDataId);
      if (staleScript) {
        staleScript.remove();
      }
    };
  }, [
    description,
    image,
    keywords,
    locale,
    path,
    robots,
    structuredData,
    title,
    type,
  ]);

  // Effects never run during build-time prerendering, so hand the head
  // values to the collector for the prerender script to inject statically.
  if (ssrHead) {
    const routePath = path ?? splitLocaleFromPath(ssrHead.pagePath).path;

    ssrHead.head = {
      title: composeTitle(title),
      description,
      robots,
      keywords: keywords && keywords.length > 0 ? keywords.join(", ") : undefined,
      canonicalUrl: canonicalFor(routePath, locale),
      imageUrl: toAbsoluteUrl(image),
      ogType: type,
      ogLocale: LOCALE_TAGS[locale].replace("-", "_"),
      htmlLang: LOCALE_TAGS[locale],
      alternates: buildAlternates(routePath),
      structuredDataJson: structuredData ? JSON.stringify(structuredData) : undefined,
    };
  }

  return null;
}
