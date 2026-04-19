import { useEffect } from "react";

const SITE_NAME = "BI Solutions Group";
const SITE_URL = "https://www.bisolutions.group";
const DEFAULT_IMAGE = "/bi-solutions-logo.png";

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
  if (/^https?:\/\//i.test(pathOrUrl)) {
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
  useEffect(() => {
    const pageTitle = `${title} | ${SITE_NAME}`;
    const canonicalUrl = toAbsoluteUrl(path ?? window.location.pathname);
    const imageUrl = toAbsoluteUrl(image);
    const structuredDataId = "seo-structured-data";

    document.title = pageTitle;

    setMetaTag("name", "description", description);
    setMetaTag("name", "robots", robots);
    if (keywords && keywords.length > 0) {
      setMetaTag("name", "keywords", keywords.join(", "));
    }
    setMetaTag("property", "og:site_name", SITE_NAME);
    setMetaTag("property", "og:locale", "en_US");
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
  }, [description, image, keywords, path, robots, structuredData, title, type]);

  return null;
}
