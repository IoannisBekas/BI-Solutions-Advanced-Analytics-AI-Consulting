export const LOCALES = ["en", "el", "de"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Native names, used in the language switcher. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  el: "Ελληνικά",
  de: "Deutsch",
};

/** BCP 47 tags for <html lang> and hreflang. */
export const LOCALE_TAGS: Record<Locale, string> = {
  en: "en",
  el: "el-GR",
  de: "de-DE",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * English is served from the root; other locales sit behind a path prefix so
 * every language has its own indexable URL.
 */
export function localePrefix(locale: Locale) {
  return locale === DEFAULT_LOCALE ? "" : `/${locale}`;
}

/** Splits "/el/services" into { locale: "el", path: "/services" }. */
export function splitLocaleFromPath(pathname: string) {
  const match = /^\/([a-z]{2})(?=\/|$)/i.exec(pathname);
  const candidate = match?.[1]?.toLowerCase();

  if (candidate && isLocale(candidate) && candidate !== DEFAULT_LOCALE) {
    const rest = pathname.slice(match![0].length);
    return { locale: candidate, path: rest || "/" };
  }

  return { locale: DEFAULT_LOCALE, path: pathname || "/" };
}

/** Rebuilds a path for a different locale, keeping the route the same. */
export function pathForLocale(pathname: string, locale: Locale) {
  const { path } = splitLocaleFromPath(pathname);
  const prefixed = `${localePrefix(locale)}${path}`;
  return prefixed || "/";
}

// Deliberately no Accept-Language auto-redirect: Google advises against it,
// since a redirected crawler may never reach the other locales.
