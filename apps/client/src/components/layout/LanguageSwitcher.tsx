import { Globe } from "lucide-react";

import { useLocale } from "@/i18n/LocaleProvider";
import { LOCALES, LOCALE_NAMES, pathForLocale, type Locale } from "@/i18n/config";
import { trackEvent } from "@/lib/analytics";
import { SITE_BASE_PATH } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Real anchors rather than in-app navigation: a language change should reload
 * so the document language, translated copy, and canonical tags all reset
 * together.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, t } = useLocale();

  const hrefFor = (target: Locale) => {
    const pathname =
      typeof window === "undefined" ? "/" : window.location.pathname;
    const withoutBase =
      SITE_BASE_PATH && pathname.startsWith(SITE_BASE_PATH)
        ? pathname.slice(SITE_BASE_PATH.length) || "/"
        : pathname;

    return `${SITE_BASE_PATH}${pathForLocale(withoutBase, target)}`;
  };

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="group"
      aria-label={t.nav.language}
    >
      <Globe aria-hidden="true" className="mr-1 h-4 w-4 opacity-60" />
      {LOCALES.map((target) => (
        <a
          key={target}
          href={hrefFor(target)}
          hrefLang={target}
          lang={target}
          aria-current={target === locale ? "true" : undefined}
          className={cn(
            "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-2 text-xs font-semibold uppercase transition-colors",
            target === locale
              ? "bg-black/10 text-current"
              : "text-current opacity-60 hover:opacity-100",
          )}
          onClick={() =>
            trackEvent("language_switch", { from: locale, to: target })
          }
          title={LOCALE_NAMES[target]}
        >
          {target}
        </a>
      ))}
    </div>
  );
}
