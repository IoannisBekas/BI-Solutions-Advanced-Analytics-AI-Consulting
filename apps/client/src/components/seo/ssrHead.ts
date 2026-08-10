import { createContext } from "react";

export interface SsrHeadData {
  title: string;
  description: string;
  robots: string;
  keywords?: string;
  canonicalUrl: string;
  imageUrl: string;
  ogType: "website" | "article";
  ogLocale: string;
  htmlLang: string;
  alternates?: Array<{ hreflang: string; href: string }>;
  structuredDataJson?: string;
}

/**
 * Provided only during build-time prerendering. The Seo component cannot
 * touch `document` on the server, so it writes the head values it would
 * apply in the browser into this collector instead, and the prerender
 * script bakes them into the static HTML.
 */
export interface SsrHeadCollector {
  pagePath: string;
  head?: SsrHeadData;
}

export const SsrHeadContext = createContext<SsrHeadCollector | null>(null);
