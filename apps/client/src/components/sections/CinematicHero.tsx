import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

import { HeroSelect } from "@/components/ui/HeroSelect";
import { useLocale } from "@/i18n/LocaleProvider";
import { trackEvent } from "@/lib/analytics";
import { START_PROJECT_PATH } from "@/lib/contact";
import { heroNeedValues, projectTimingOptions } from "@/lib/projectIntent";
import { withAssetBase } from "@/lib/site";

const POSTER = withAssetBase("scroll-world-v4/posters/clip-01.webp");
const POSTER_MOBILE = withAssetBase(
  "scroll-world-v4/posters/clip-01-mobile.webp",
);

const timingValues = projectTimingOptions.map((option) => option.value);

export function CinematicHero() {
  const [, navigate] = useLocation();
  const { t, locale } = useLocale();
  const [need, setNeed] = useState<string>(heroNeedValues[0]);
  const [timing, setTiming] = useState(timingValues[1]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = `${START_PROJECT_PATH}?need=${need}&timing=${timing}`;
    trackEvent("hero_intent_submit", {
      need,
      timing,
      locale,
      target,
      placement: "cinematic_hero",
    });
    navigate(target);
  };

  return (
    <section className="cinematic-hero" aria-label="BI Solutions Group">
      <div className="cinematic-hero__media" aria-hidden="true">
        <img
          className="cinematic-hero__poster"
          src={POSTER}
          srcSet={`${POSTER_MOBILE} 600w, ${POSTER} 1280w`}
          sizes="100vw"
          alt=""
          fetchPriority="high"
          decoding="sync"
        />
        <div className="cinematic-hero__scrim" />
      </div>

      <div className="cinematic-hero__content">
        <p className="cinematic-hero__eyebrow">{t.hero.eyebrow}</p>
        <h1 className="cinematic-hero__title">{t.hero.title}</h1>
        <p className="cinematic-hero__subtitle">{t.hero.subtitle}</p>

        <form className="cinematic-hero__intent" onSubmit={handleSubmit}>
          <div className="cinematic-hero__field">
            <span id="hero-need-label">{t.hero.needLabel}</span>
            <HeroSelect
              id="hero-need"
              label={t.hero.needLabel}
              value={need}
              onChange={setNeed}
              options={heroNeedValues.map((value) => ({
                value,
                label: t.hero.needs[value],
              }))}
            />
          </div>

          <div className="cinematic-hero__field">
            <span id="hero-timing-label">{t.hero.timingLabel}</span>
            <HeroSelect
              id="hero-timing"
              label={t.hero.timingLabel}
              value={timing}
              onChange={setTiming}
              options={timingValues.map((value) => ({
                value,
                label: t.hero.timings[value],
              }))}
            />
          </div>

          <button type="submit" className="cinematic-hero__submit">
            {t.hero.submit}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </form>
      </div>

      <div className="cinematic-hero__cue" aria-hidden="true">
        <span>{t.hero.scroll}</span>
        <i />
      </div>
    </section>
  );
}
