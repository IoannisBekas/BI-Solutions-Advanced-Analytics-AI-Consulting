import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useLocale } from "@/i18n/LocaleProvider";
import { trackEvent } from "@/lib/analytics";
import { servicePillarPages } from "@/lib/servicePages";

/**
 * The grey panel that scrolls up over the sticky hero. It carries the service
 * copy that used to live inside the hero itself, so the page keeps the same
 * crawlable content while the hero stays quiet.
 */
export function ServicesPanel() {
  const { t } = useLocale();

  return (
    <section
      id="services"
      className="relative z-10 -mt-10 rounded-t-[2.5rem] bg-[#efece7] pb-24 pt-14 shadow-[0_-28px_70px_rgba(15,17,20,0.35)] scroll-mt-24 md:-mt-14 md:rounded-t-[3rem] md:pt-20"
    >
      <div className="site-container px-6 md:px-12">
        <div
          aria-hidden="true"
          className="mx-auto mb-12 h-1 w-10 rounded-full bg-gray-950/15 md:mb-16"
        />

        <ScrollReveal
          className="mb-12 flex flex-col gap-5 md:mb-16 md:flex-row md:items-end md:justify-between"
          width="100%"
        >
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              {t.services.eyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
              {t.services.heading}
            </h2>
          </div>
          <Link
            href="/services"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-gray-950 underline decoration-gray-400 underline-offset-4"
            onClick={() =>
              trackEvent("services_overview_click", {
                placement: "homepage_panel",
                target: "/services",
              })
            }
          >
            {t.services.seeAll}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </ScrollReveal>

        <div className="divide-y divide-gray-950/10 border-t border-gray-950/10">
          {servicePillarPages.map((service, index) => {
            const Icon = service.icon;
            const translated = t.services.items[service.slug];

            return (
              <ScrollReveal key={service.slug} delay={index * 0.08} width="100%">
                <a
                  href={service.path}
                  className="group grid grid-cols-1 gap-4 py-8 transition-colors md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-start md:gap-10 md:py-10"
                  onClick={() =>
                    trackEvent("service_card_click", {
                      service: service.slug,
                      placement: "homepage_panel",
                      target: service.path,
                    })
                  }
                >
                  <div className="flex items-center gap-4 md:w-40 md:flex-col md:items-start md:gap-6">
                    <span className="text-sm font-semibold tabular-nums text-gray-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Icon
                      aria-hidden="true"
                      className="h-6 w-6 text-gray-950 transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  <div className="max-w-2xl">
                    <h3 className="text-2xl font-bold font-heading leading-tight text-gray-950 md:text-3xl">
                      {translated?.title ?? service.shortTitle}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-gray-600">
                      {translated?.description ?? service.description}
                    </p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {service.metrics.slice(0, 2).map((metric) => (
                        <li
                          key={metric.label}
                          className="rounded-full border border-gray-950/12 px-3 py-1 text-xs font-medium text-gray-600"
                        >
                          {metric.value}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-950 md:pt-2">
                    {t.services.explore}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </a>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
