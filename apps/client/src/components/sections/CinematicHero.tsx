import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

import { IntroCallLink } from "@/components/contact/DirectContact";
import { useLocale, useLocalizedHref } from "@/i18n/LocaleProvider";
import { homeGrowthCopy } from "@/i18n/homeGrowth";
import { trackEvent } from "@/lib/analytics";
import { START_PROJECT_PATH } from "@/lib/contact";
import { withAssetBase } from "@/lib/site";

const POSTER = withAssetBase("scroll-world-v4/posters/clip-01.webp");
const POSTER_MOBILE = withAssetBase(
  "scroll-world-v4/posters/clip-01-mobile.webp",
);
const POSTER_TABLET = withAssetBase("scroll-world-v4/posters/clip-01-900.webp");
const projectHref = `${START_PROJECT_PATH}?source=homepage&context=hero`;

export function CinematicHero() {
  const { t, locale } = useLocale();
  const copy = homeGrowthCopy[locale];
  const localizedHref = useLocalizedHref();

  return (
    <section className="cinematic-hero" aria-label="BI Solutions Group">
      <div className="cinematic-hero__media" aria-hidden="true">
        <img
          className="cinematic-hero__poster"
          src={POSTER}
          srcSet={`${POSTER_MOBILE} 600w, ${POSTER_TABLET} 900w, ${POSTER} 1280w`}
          sizes="100vw"
          alt=""
          fetchPriority="high"
          decoding="sync"
        />
        <div className="cinematic-hero__scrim" />
      </div>

      <div className="cinematic-hero__content">
        <p className="cinematic-hero__eyebrow">{copy.heroEyebrow}</p>
        <h1 className="cinematic-hero__title">{copy.heroTitle}</h1>
        <p className="cinematic-hero__subtitle">{copy.heroSubtitle}</p>

        <div className="cinematic-hero__actions">
          <IntroCallLink
            placement="homepage"
            projectHref={localizedHref(projectHref)}
            className="cinematic-hero__action"
          />
          <Link
            href={projectHref}
            className="cinematic-hero__action cinematic-hero__action--secondary"
            onClick={() =>
              trackEvent("contact_cta_click", {
                placement: "cinematic_hero",
                target: START_PROJECT_PATH,
              })
            }
          >
            {copy.brief}
            <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
          </Link>
        </div>
      </div>

      <div className="cinematic-hero__cue" aria-hidden="true">
        <span>{t.hero.scroll}</span>
        <i />
      </div>
    </section>
  );
}
