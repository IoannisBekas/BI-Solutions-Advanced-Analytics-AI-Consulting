import { Link } from "wouter";
import { ArrowDown, ArrowRight, Check, ChevronDown, Globe2, List, Rows3, Search, X, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/LocaleProvider";
import { translatePageCopy } from "@/i18n/localizeDocument";
import type { Locale } from "@/i18n/config";
import { normalizeSearch } from "@/lib/search";
import {
  aiCapabilityPages,
  servicePillarPages,
  type ServicePage,
} from "@/lib/servicePages";

const pillarCopy: Record<
  string,
  { number: string; eyebrow: string; promise: string }
> = {
  "business-intelligence-semantic-modeling": {
    number: "01",
    eyebrow: "Business intelligence",
    promise:
      "One governed view of the business—from source data to the decisions people make every day.",
  },
  "advanced-analytics-ai": {
    number: "02",
    eyebrow: "Applied AI",
    promise:
      "AI designed around real work, approved knowledge, measurable quality, and clear human control.",
  },
  "data-strategy-governance": {
    number: "03",
    eyebrow: "Data foundations",
    promise:
      "A reliable path from operational systems to trusted analytics, AI, and accountable ownership.",
  },
  "website-app-development": {
    number: "04",
    eyebrow: "Web apps & search visibility",
    promise:
      "Fast, focused websites and applications engineered for performance, conversion, and discoverability across search engines, answer features, and AI-powered experiences.",
  },
  "content-operations-automation": {
    number: "05",
    eyebrow: "Content systems",
    promise:
      "A repeatable operating system for turning expertise into coordinated content, useful assets, and measurable digital products.",
  },
  "data-career-enablement-mentorship": {
    number: "06",
    eyebrow: "Capability development",
    promise:
      "Practical enablement that helps individuals and teams build stronger skills, judgment, adoption, and evidence of progress.",
  },
};

const deliveryFlow = [
  {
    number: "01",
    title: "Diagnostic or roadmap sprint",
    description:
      "Clarify the current state, priority decisions, delivery risks, and the most valuable next move.",
    need: "advisory-sprint",
  },
  {
    number: "02",
    title: "Implementation project",
    description:
      "Design, build, validate, and hand over a complete solution around a defined operational outcome.",
    need: "project-implementation",
  },
  {
    number: "03",
    title: "Fractional data and AI leadership",
    description:
      "Add senior direction for roadmaps, architecture, vendors, governance, investment, and executive decisions.",
    need: "fractional-leadership",
  },
  {
    number: "04",
    title: "Managed operations and support",
    description:
      "Keep dashboards, data workflows, and AI systems reliable through monitoring, releases, support, and optimization.",
    need: "managed-operations",
  },
  {
    number: "05",
    title: "Team enablement or mentorship",
    description:
      "Build lasting capability through role-based workshops, office hours, practical training, or one-to-one guidance.",
    need: "team-enablement",
  },
];

const listedServices = [...servicePillarPages, ...aiCapabilityPages];

const serviceNavigation = [
  ...servicePillarPages.map((service) => ({
    id: service.slug,
    label: service.shortTitle,
  })),
  { id: "ways-to-work-together", label: "Ways to work together" },
];

const servicesStructuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "BI Solutions Group services",
  itemListElement: listedServices.map((service, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Service",
      "@id": `https://www.bisolutions.group/services#${service.slug}`,
      name: service.title,
      url: `https://www.bisolutions.group/services#${service.slug}`,
      provider: {
        "@id": "https://www.bisolutions.group/#organization",
      },
    },
  })),
};

const browserCopy = {
  en: { compact: "Compact", details: "Details", view: "Service view", search: "Search services", placeholder: "Search services or capabilities…", clear: "Clear search", empty: "No services match your search.", sections: "sections" },
  el: { compact: "Σύνοψη", details: "Αναλυτικά", view: "Προβολή υπηρεσιών", search: "Αναζήτηση υπηρεσιών", placeholder: "Αναζήτηση υπηρεσιών ή δυνατοτήτων…", clear: "Καθαρισμός αναζήτησης", empty: "Δεν βρέθηκαν υπηρεσίες για αυτή την αναζήτηση.", sections: "ενότητες" },
  de: { compact: "Kompakt", details: "Details", view: "Leistungsansicht", search: "Leistungen durchsuchen", placeholder: "Leistungen oder Funktionen suchen…", clear: "Suche löschen", empty: "Keine Leistungen entsprechen Ihrer Suche.", sections: "Bereiche" },
};

function matchesText(values: string[], query: string, locale: Locale) {
  return normalizeSearch(values.flatMap((value) => [value, translatePageCopy(value, locale)]).join(" ")).includes(query);
}

function matchesService(service: ServicePage, query: string, locale: Locale) {
  return matchesText([
    service.title, service.shortTitle, service.navLabel, service.description,
    pillarCopy[service.slug]?.promise ?? "", ...service.items, ...service.outcomes,
    ...service.keywords, ...(service.techStack ?? []),
  ], query, locale);
}

type ChapterProps = {
  service: ServicePage;
  expanded: boolean;
  hidden: boolean;
  onToggle: (open: boolean) => void;
};

function ServiceSection({ id, number, eyebrow, title, icon: Icon, expanded, hidden, onToggle, children }: {
  id: string;
  number?: string;
  eyebrow: string;
  title: string;
  icon?: LucideIcon;
  expanded: boolean;
  hidden: boolean;
  onToggle: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <section id={id} hidden={hidden} className="service-section surface-card">
      <div className="service-section__eyebrow flex items-center gap-3 text-gray-500">
        {number && <span className="shrink-0 whitespace-nowrap font-mono text-xs tracking-[0.2em]">{number} / 06</span>}
        {Icon && <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />}
        <p className="text-xs font-semibold uppercase tracking-[0.16em]">{eyebrow}</p>
      </div>
      <details open={expanded} onToggle={(event) => onToggle(event.currentTarget.open)}>
        <summary tabIndex={0} className="service-section__summary">
          <h2 className="service-section__title section-title">
            <span>{title}</span>
            <ChevronDown aria-hidden="true" className="service-section__chevron h-5 w-5 shrink-0" />
          </h2>
        </summary>
        <div className="service-section__content">{children}</div>
      </details>
    </section>
  );
}

function ServiceChapter({ service, expanded, hidden, onToggle }: ChapterProps) {
  const { locale } = useLocale();
  const copy = pillarCopy[service.slug];
  return (
    <ServiceSection id={service.slug} number={copy.number} eyebrow={copy.eyebrow} title={service.title} icon={service.icon} expanded={expanded} hidden={hidden} onToggle={onToggle}>
      <ScrollReveal width="100%">
        <div>
          <p className="service-section__promise body-lead text-gray-800">{copy.promise}</p>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-gray-600">
            {service.description}
          </p>
          {service.slug === "website-app-development" && (
            <Link href="/projects" className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-gray-950 underline underline-offset-4">
              {locale === "el" ? "Δείτε όλα τα έργα ιστοσελίδων & εφαρμογών" : locale === "de" ? "Alle Website- & App-Projekte entdecken" : "Explore all website & app projects"}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          )}

          <div className="mt-12 grid gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  What we can deliver
                </p>
                <ol className="mt-5 divide-y divide-gray-950/15 border-y border-gray-950/15">
                  {service.items.map((item, index) => (
                    <li
                      key={item}
                      className="grid grid-cols-[2.25rem_1fr] gap-4 py-5 text-base leading-relaxed text-gray-700"
                    >
                      <span className="font-mono text-xs text-gray-400">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="border-l border-gray-950/15 pl-6 md:pl-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  What should improve
                </p>
                <ul className="mt-5 space-y-5">
                  {service.outcomes.slice(0, 3).map((outcome) => (
                    <li
                      key={outcome}
                      className="flex gap-3 text-sm leading-relaxed text-gray-700"
                    >
                      <Check
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0"
                      />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>

                {service.techStack && (
                  <div className="mt-9">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Typical stack
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {service.techStack.map((technology) => (
                        <li
                          key={technology}
                          className="rounded-full border border-gray-950/15 px-3 py-1.5 text-xs font-medium text-gray-700"
                        >
                          {technology}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {locale === "en" && service.slug === "business-intelligence-semantic-modeling" && (
                  <Link
                    href="/services/power-bi-consulting"
                    className="mt-8 flex min-h-11 items-center gap-2 text-sm font-semibold text-gray-950 underline decoration-gray-400 underline-offset-4"
                  >
                    Explore Power BI consulting <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                )}
                <Link
                  href={`/start-a-project?source=services&service=${service.slug}`}
                  className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-gray-950 underline decoration-gray-400 underline-offset-4"
                >
                  {service.slug === "data-career-enablement-mentorship"
                    ? "Discuss mentorship"
                    : "Discuss this service"}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
          </div>
        </div>
      </ScrollReveal>
    </ServiceSection>
  );
}

function AiChapter({ service, expanded, hidden, onToggle, query }: ChapterProps & { query: string }) {
  const { locale } = useLocale();
  const matchingCapabilities = aiCapabilityPages.filter((capability) => matchesService(capability, query, locale));
  return (
    <ServiceSection id={service.slug} number="02" eyebrow="Applied AI" title={service.title} icon={service.icon} expanded={expanded} hidden={hidden} onToggle={onToggle}>
      <div>
        <ScrollReveal width="100%">
          <div>
            <p className="service-section__promise body-lead text-gray-800">{pillarCopy[service.slug].promise}</p>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-gray-600">
              {service.description}
            </p>
            {locale === "en" && (
              <Link href="/services/ai-automation" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline decoration-gray-400 underline-offset-4">
                Explore AI workflow automation <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            )}
          </div>
        </ScrollReveal>

        <div className="mt-16 border-y border-gray-950/15">
          {aiCapabilityPages.map((capability, index) => {
            const CapabilityIcon = capability.icon;

            return (
                <article
                  key={capability.slug}
                  id={capability.slug}
                  hidden={query !== "" && matchingCapabilities.length > 0 && !matchingCapabilities.includes(capability)}
                  className="scroll-mt-28 grid gap-5 border-b border-gray-950/15 py-7 last:border-b-0 md:grid-cols-[3rem_3rem_minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-start md:gap-7"
                >
                  <span className="font-mono text-xs text-gray-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <CapabilityIcon
                    aria-hidden="true"
                    className="h-5 w-5 text-gray-500"
                  />
                  <h3 className="card-title text-gray-950">
                    {capability.navLabel}
                  </h3>
                  <div>
                    <p className="text-base leading-relaxed text-gray-600">
                      {capability.description}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-700">
                      {capability.items.slice(0, 2).map((item) => (
                        <li key={item} className="flex gap-2">
                          <span aria-hidden="true" className="text-gray-400">
                            —
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
            );
          })}
        </div>

        <ScrollReveal width="100%">
          <div className="content-panel mt-12 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <div className="flex items-center gap-3 text-gray-500">
                <Globe2 aria-hidden="true" className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                  International delivery
                </p>
              </div>
              <h3 className="card-title mt-4 text-gray-950">
                AI consulting for organizations worldwide
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600">
                Senior-led delivery for international organizations, adapted to
                their operating environment, governance requirements, and
                adoption realities.
              </p>
            </div>
            <Button
              asChild
              className="rounded-full bg-gray-950 px-6 text-white hover:bg-gray-800"
            >
              <Link href="/start-a-project?source=services&service=advanced-analytics-ai">
                Discuss an AI project
                <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </ServiceSection>
  );
}

export default function Services() {
  const { locale } = useLocale();
  const copy = browserCopy[locale];
  const [query, setQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const pendingAnchor = useRef<{ target: string; section: string } | null>(null);

  const matchingSections = (search: string) => [
    ...servicePillarPages.filter((service) => matchesService(service, search, locale) ||
      (service.slug === "advanced-analytics-ai" && aiCapabilityPages.some((capability) => matchesService(capability, search, locale))))
      .map((service) => service.slug),
    ...(matchesText(["Ways to work together", "Choose the level of support the work actually needs.", ...deliveryFlow.flatMap((item) => [item.title, item.description])], search, locale) ? ["ways-to-work-together"] : []),
  ];
  const search = normalizeSearch(query.trim());
  const visibleSections = matchingSections(search);
  const allExpanded = serviceNavigation.every((section) => expandedSections.includes(section.id));
  const setSectionOpen = (id: string, open: boolean) => setExpandedSections((current) => {
    if (current.includes(id) === open) return current;
    return open ? [...current, id] : current.filter((value) => value !== id);
  });
  const updateSearch = (value: string) => {
    setQuery(value);
    const normalized = normalizeSearch(value.trim());
    setExpandedSections(normalized ? matchingSections(normalized) : []);
    if (resultsRef.current) {
      const top = resultsRef.current.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY > top) resultsRef.current.scrollIntoView({ block: "start", behavior: "instant" });
    }
  };
  const clearSearch = () => { updateSearch(""); searchRef.current?.focus({ preventScroll: true }); };

  useEffect(() => {
    const revealAnchor = (target = window.location.hash.slice(1)) => {
      const section = serviceNavigation.some((item) => item.id === target) ? target
        : aiCapabilityPages.some((item) => item.slug === target) ? "advanced-analytics-ai" : null;
      if (!section) return;
      pendingAnchor.current = { target, section };
      setQuery("");
      setExpandedSections((current) => current.includes(section) ? [...current] : [...current, section]);
    };
    const handleHashChange = () => revealAnchor();
    const handleAnchorClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin === window.location.origin &&
          destination.pathname.replace(/\/$/, "") === window.location.pathname.replace(/\/$/, "") &&
          destination.hash && destination.hash === window.location.hash) {
        revealAnchor(destination.hash.slice(1));
      }
    };
    revealAnchor();
    window.addEventListener("hashchange", handleHashChange);
    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, []);

  useEffect(() => {
    const pending = pendingAnchor.current;
    if (!pending || !expandedSections.includes(pending.section)) return;
    pendingAnchor.current = null;
    const frame = requestAnimationFrame(() => document.getElementById(pending.target)?.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    }));
    return () => cancelAnimationFrame(frame);
  }, [expandedSections]);

  return (
    <div className="services-page min-h-screen bg-[var(--surface-paper)] font-sans text-foreground" data-view={allExpanded ? "details" : "compact"}>
      <Seo
        title="BI, AI, Data, Web & Search Services"
        description="Business intelligence, AI, data and cloud foundations, web development, technical SEO and AI-search visibility, digital products, training, and mentorship."
        path="/services"
        structuredData={servicesStructuredData}
      />
      <Navbar />
      <main className="page-main">
        <section className="site-container">
          <div className="services-hero content-panel overflow-hidden border-gray-950 bg-gray-950 text-white">
            <div className="w-full">
              <div className="services-hero__layout grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)] lg:items-end">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
                    The complete service atlas
                  </p>
                  <h1 className="services-hero__title page-title mt-6 break-words">
                    One partner for better data systems, decisions, and careers.
                  </h1>
                </div>
                <div className="max-w-xl lg:pb-2">
                  <p className="services-hero__description text-lg leading-relaxed text-white/65 md:text-xl">
                    Business intelligence, applied AI, data foundations, web
                    applications, content operations, digital products, and
                    enablement—presented in one place and shaped around
                    practical progress.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Button
                      asChild
                      className="rounded-full bg-white px-7 text-black hover:bg-white/90"
                    >
                      <Link href="/start-a-project?source=services">
                        Start a project
                        <ArrowRight
                          aria-hidden="true"
                          className="ml-2 h-4 w-4"
                        />
                      </Link>
                    </Button>
                    <a
                      href="#service-index"
                      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                    >
                      See every service
                      <ArrowDown aria-hidden="true" className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <nav
              aria-label="Services on this page"
              className="services-hero__index mt-16 grid scroll-mt-28 border-t border-white/15 sm:grid-cols-2 xl:grid-cols-6"
            >
              {servicePillarPages.map((service, index) => (
                <a
                  key={service.slug}
                  href={`#${service.slug}`}
                  className="group flex items-center justify-between gap-5 border-b border-white/15 py-5 text-sm font-semibold text-white/75 transition-colors hover:text-white sm:px-5 sm:first:pl-0 xl:border-b-0 xl:border-r xl:last:border-r-0"
                >
                  <span>
                    <span className="mr-3 font-mono text-xs text-white/60">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {service.shortTitle}
                  </span>
                  <ArrowDown
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform group-hover:translate-y-1"
                  />
                </a>
              ))}
            </nav>
          </div>
        </section>
        <div className="site-container section-gap">
          <div id="service-index" className="catalog-toolbar services-toolbar">
            <div className="relative min-w-0">
              <label htmlFor="service-search" className="sr-only">{copy.search}</label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden="true" />
              <input ref={searchRef} id="service-search" type="search" value={query} onChange={(event) => updateSearch(event.target.value)} placeholder={copy.placeholder} aria-controls="service-results" className="form-control pl-11 pr-14" />
              {query && <button type="button" onClick={clearSearch} aria-label={copy.clear} className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-gray-600 hover:text-black"><X className="h-4 w-4" aria-hidden="true" /></button>}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div role="group" aria-label={copy.view} className="flex gap-2">
                <Button type="button" variant={allExpanded ? "outline" : "default"} aria-pressed={!allExpanded} aria-controls="service-results" className="px-3" onClick={() => setExpandedSections([])}><List aria-hidden="true" />{copy.compact}</Button>
                <Button type="button" variant={allExpanded ? "default" : "outline"} aria-pressed={allExpanded} aria-controls="service-results" className="px-3" onClick={() => setExpandedSections(serviceNavigation.map((section) => section.id))}><Rows3 aria-hidden="true" />{copy.details}</Button>
              </div>
              <p role="status" aria-live="polite" aria-atomic="true" className="whitespace-nowrap text-xs text-gray-600">{visibleSections.length} / {serviceNavigation.length} · {copy.sections}</p>
            </div>
          </div>
          <div ref={resultsRef} id="service-results" className="services-list">
            {servicePillarPages.map((service) => {
              const props = { service, expanded: expandedSections.includes(service.slug), hidden: !visibleSections.includes(service.slug), onToggle: (open: boolean) => setSectionOpen(service.slug, open) };
              return service.slug === "advanced-analytics-ai" ? <AiChapter key={service.slug} {...props} query={search} /> : <ServiceChapter key={service.slug} {...props} />;
            })}
            <ServiceSection id="ways-to-work-together" eyebrow="Ways to work together" title="Choose the level of support the work actually needs." expanded={expandedSections.includes("ways-to-work-together")} hidden={!visibleSections.includes("ways-to-work-together")} onToggle={(open) => setSectionOpen("ways-to-work-together", open)}>
              <div className="service-delivery-grid grid border-y border-gray-950/15 md:grid-cols-2 2xl:grid-cols-3 min-[2200px]:grid-cols-5">
                {deliveryFlow.map((item) => (
                  <ScrollReveal key={item.number} width="100%">
                    <article className="flex h-full flex-col border-b border-gray-950/15 py-8 md:px-6 min-[2200px]:min-h-80 min-[2200px]:border-b-0 min-[2200px]:border-r min-[2200px]:first:pl-0 min-[2200px]:last:border-r-0">
                      <p className="font-mono text-xs text-gray-400">
                        {item.number}
                      </p>
                      <h3 className="card-title mt-8 text-gray-950">
                        {item.title}
                      </h3>
                      <p className="mt-4 max-w-sm text-base leading-relaxed text-gray-600">
                        {item.description}
                      </p>
                      <Link
                        href={`/start-a-project?source=services-engagement&need=${item.need}`}
                        className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-950 underline decoration-gray-400 underline-offset-4 min-[2200px]:mt-auto"
                      >
                        Discuss this option
                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                      </Link>
                    </article>
                  </ScrollReveal>
                ))}
              </div>
            </ServiceSection>
            {visibleSections.length === 0 && <div className="content-panel text-center"><p>{copy.empty}</p><Button type="button" variant="outline" className="mt-4" onClick={clearSearch}>{copy.clear}</Button></div>}
          </div>
        </div>
        <section className="bg-[#0a0b0d] py-20 text-white md:py-24">
          <ScrollReveal width="100%">
            <div className="site-container flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-4xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                  Not sure where your need belongs?
                </p>
                <h2 className="section-title mt-5 text-white">
                  Tell us what should become clearer, faster, stronger, or
                  easier to use.
                </h2>
              </div>
              <Button
                asChild
                className="shrink-0 rounded-full bg-white px-8 text-black hover:bg-white/90"
              >
                <Link href="/start-a-project?source=services-final">
                  Start a project
                  <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </section>
      </main>
      <Footer />
    </div>
  );
}
