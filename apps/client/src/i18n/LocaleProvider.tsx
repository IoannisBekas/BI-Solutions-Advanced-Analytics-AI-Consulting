import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  type ReactNode,
} from "react";

import {
  DEFAULT_LOCALE,
  LOCALE_TAGS,
  localePrefix,
  type Locale,
} from "./config";
import { catalogues, type TranslationCatalogue } from "./translations";
import { localizeDocument } from "./localizeDocument";
import { withSiteBase } from "@/lib/site";

interface LocaleContextValue {
  locale: Locale;
  currentPath: string;
  /** Current locale's catalogue, with English filled in behind it. */
  t: TranslationCatalogue;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  currentPath: "/",
  t: catalogues[DEFAULT_LOCALE],
});

/** Shallow-merges each catalogue section over English so gaps fall back. */
function withFallback(locale: Locale): TranslationCatalogue {
  const base = catalogues[DEFAULT_LOCALE];
  if (locale === DEFAULT_LOCALE) return base;

  const active = catalogues[locale];
  return {
    home: { ...base.home, ...active.home },
    nav: { ...base.nav, ...active.nav },
    hero: {
      ...base.hero,
      ...active.hero,
      needs: { ...base.hero.needs, ...active.hero.needs },
      timings: { ...base.hero.timings, ...active.hero.timings },
    },
    services: {
      ...base.services,
      ...active.services,
      items: { ...base.services.items, ...active.services.items },
    },
    footer: { ...base.footer, ...active.footer },
  };
}

export function LocaleProvider({
  locale,
  currentPath,
  children,
}: {
  locale: Locale;
  currentPath: string;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ locale, currentPath, t: withFallback(locale) }),
    [currentPath, locale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

/** Runs only after the lazy route has hydrated, avoiding translated DOM drift. */
export function DocumentLocalizer({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  useLayoutEffect(() => {
    document.documentElement.lang = LOCALE_TAGS[locale];
    return localizeDocument(locale);
  }, [locale]);

  return children;
}

export function useLocale() {
  return useContext(LocaleContext);
}

/**
 * Href builder for raw <a> tags (anchors, hash links) that must stay inside
 * the active locale. Router <Link>s get the locale from the router base, but
 * plain anchors bypass it — linking "/#case-studies" from /el/ would silently
 * drop the visitor back to the English homepage.
 */
export function useLocalizedHref() {
  const { locale } = useLocale();
  return (path: string) => withSiteBase(`${localePrefix(locale)}${path}`);
}
