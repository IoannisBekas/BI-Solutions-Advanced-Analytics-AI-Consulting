import { ArrowUpRight } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { translatePageCopy } from "@/i18n/localizeDocument";
import { portfolioCopy, caseStudyLocale } from "@/data/portfolio";
import type { CaseStudy } from "@/data/caseStudies";
import { localePrefix } from "@/i18n/config";
import { withAssetBase, withSiteBase } from "@/lib/site";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function CaseStudyCard({ caseStudy, compact = false }: { caseStudy: CaseStudy; compact?: boolean }) {
  const { locale } = useLocale();
  const targetLocale = caseStudyLocale(caseStudy, locale);
  const href = withSiteBase(
    `${localePrefix(targetLocale)}/case-studies/${caseStudy.slug}`,
  );
  return (
    <article className={cn("case-study-card surface-card surface-card--interactive group overflow-hidden", compact && "case-study-card--compact")}>
      <a
        href={href}
        className="case-study-card__link flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black"
        onClick={() =>
          trackEvent("case_study_open", {
            case_study: caseStudy.slug,
            placement: "projects",
            target: href,
          })
        }
      >
        <img
          src={withAssetBase(caseStudy.image)}
          alt={translatePageCopy(caseStudy.imageAlt, locale)}
          width={1440}
          height={810}
          loading="lazy"
          decoding="async"
          className="case-study-card__preview aspect-video w-full border-b border-gray-200 bg-gray-50 object-contain"
        />
        <div className="case-study-card__body card-padding flex flex-1 flex-col">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-accent)]">
            {translatePageCopy(caseStudy.relationship, locale)}
          </p>
          <h3 className="card-title mt-3 text-gray-950">
            {translatePageCopy(caseStudy.cardTitle, locale)}
            {targetLocale !== locale && (
              <span
                lang="en"
                className="ml-2 inline-block rounded border border-gray-300 px-1.5 py-0.5 align-middle text-xs"
                translate="no"
              >
                EN
              </span>
            )}
          </h3>
          <p className="case-study-card__summary mt-4 flex-1 text-base leading-relaxed text-gray-600">
            {translatePageCopy(caseStudy.summary, locale)}
          </p>
          <span className="case-study-card__action mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-gray-950">
            {portfolioCopy.caseStudyDetails[locale]}
            <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </span>
        </div>
      </a>
    </article>
  );
}
