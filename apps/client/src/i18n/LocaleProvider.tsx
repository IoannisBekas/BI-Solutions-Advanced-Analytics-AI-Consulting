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
  type Locale,
} from "./config";
import { catalogues, type TranslationCatalogue } from "./translations";

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
