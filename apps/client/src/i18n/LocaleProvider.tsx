import {
  createContext,
  useContext,
  useEffect,
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
import { withSiteBase } from "@/lib/site";

interface LocaleContextValue {
  locale: Locale;
  /** Current locale's catalogue, with English filled in behind it. */
  t: TranslationCatalogue;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
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
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ locale, t: withFallback(locale) }),
    [locale],
  );

  useEffect(() => {
    document.documentElement.lang = LOCALE_TAGS[locale];
  }, [locale]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
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
