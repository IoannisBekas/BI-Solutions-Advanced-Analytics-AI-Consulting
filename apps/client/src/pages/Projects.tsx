import { Link, useLocation } from "wouter";
import { useRef, useState } from "react";
import { ChevronDown, LayoutGrid, List, Search, X } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { PublicPageHero } from "@/components/sections/PublicPageHero";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CaseStudyCard } from "@/components/projects/CaseStudyCard";
import { caseStudies } from "@/data/caseStudies";
import { useLocale } from "@/i18n/LocaleProvider";
import { translatePageCopy } from "@/i18n/localizeDocument";
import { normalizeSearch } from "@/lib/search";
import {
  portfolioProjects,
  portfolioCategories,
  portfolioCopy as copy,
  projectImage,
  portfolioCanonicalUrl,
  caseStudyLocale,
} from "@/data/portfolio";
import { LOCALES } from "@/i18n/config";
import NotFound from "@/pages/NotFound";

export default function Projects({
  category: categorySlug,
}: {
  category?: string;
}) {
  const { locale, t } = useLocale();
  const [, navigate] = useLocation();
  const [view, setView] = useState<"compact" | "cards">("compact");
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const category = portfolioCategories.find(
    (item) => item.slug === categorySlug,
  );
  if (categorySlug && !category) return <NotFound />;
  const projects = category
    ? portfolioProjects.filter((project) => project.category === category.slug)
    : portfolioProjects;
  const categories = category ? [category] : portfolioCategories;
  const path = category ? `/projects/category/${category.slug}` : "/projects";
  const title = category ? category.name[locale] : copy.title[locale];
  const description = category
    ? category.description[locale]
    : copy.description[locale];
  const url = portfolioCanonicalUrl(path, locale);
  const visibleCaseStudies = category ? [] : caseStudies;
  const entries = [
    ...visibleCaseStudies.map((caseStudy) => ({
      name: caseStudy.cardTitle,
      url: portfolioCanonicalUrl(
        `/case-studies/${caseStudy.slug}`,
        caseStudyLocale(caseStudy, locale),
      ),
    })),
    ...projects.map((project) => ({
      name: project.title,
      url: portfolioCanonicalUrl(`/projects/${project.slug}`, locale),
    })),
  ];
  const search = normalizeSearch(query.trim());
  const filteredProjects = projects.filter((project) =>
    normalizeSearch([
      project.title,
      project.summary[locale],
      portfolioCategories.find((item) => item.slug === project.category)?.name[locale],
    ].join(" ")).includes(search),
  );
  const filteredCaseStudies = visibleCaseStudies.filter((caseStudy) =>
    normalizeSearch([
      caseStudy.title,
      caseStudy.cardTitle,
      caseStudy.summary,
      translatePageCopy(caseStudy.cardTitle, locale),
      translatePageCopy(caseStudy.summary, locale),
      translatePageCopy(caseStudy.relationship, locale),
    ].join(" ")).includes(search),
  );
  const visibleCount = filteredProjects.length + filteredCaseStudies.length;
  const scrollToResultsIfNeeded = () => {
    if (!resultsRef.current) return;
    const top = resultsRef.current.getBoundingClientRect().top + window.scrollY;
    if (window.scrollY > top) resultsRef.current.scrollIntoView({ block: "start", behavior: "instant" });
  };
  const updateSearch = (value: string) => {
    setQuery(value);
    scrollToResultsIfNeeded();
  };
  const clearSearch = () => {
    updateSearch("");
    searchRef.current?.focus();
  };
  return (
    <div className="projects-page min-h-screen bg-[var(--surface-paper)] font-sans text-foreground [overflow-wrap:anywhere]" data-view={view}>
      <Seo
        title={title}
        description={description}
        path={path}
        image={projectImage(projects[0], "social")}
        translatedLocales={LOCALES}
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `${url}#page`,
            name: title,
            description,
            url,
            inLanguage: locale,
            isPartOf: { "@id": "https://www.bisolutions.group/#website" },
            mainEntity: { "@id": `${url}#projects` },
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "@id": `${url}#projects`,
            name: title,
            numberOfItems: entries.length,
            itemListElement: entries.map((entry, index) => ({
              "@type": "ListItem",
              position: index + 1,
              ...entry,
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "BI Solutions Group",
                item: portfolioCanonicalUrl("/", locale),
              },
              {
                "@type": "ListItem",
                position: 2,
                name: copy.title[locale],
                item: portfolioCanonicalUrl("/projects", locale),
              },
              ...(category
                ? [{ "@type": "ListItem", position: 3, name: title, item: url }]
                : []),
            ],
          },
        ]}
      />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="page-main">
        <PublicPageHero
          className="projects-hero"
          titleClassName="projects-hero__title"
          descriptionClassName="projects-hero__description"
          eyebrow={`${entries.length} · ${copy.title[locale]}`}
          title={category ? title : copy.heading[locale]}
          description={description}
        />
        <div className="site-container">
          <div className="relative my-5 md:hidden">
            <label htmlFor="project-category" className="sr-only">{copy.browseCategory[locale]}</label>
            <select
              id="project-category"
              className="form-control appearance-none pr-11"
              value={category?.slug ?? ""}
              onChange={(event) => {
                setQuery("");
                navigate(event.target.value ? `/projects/category/${event.target.value}` : "/projects");
              }}
            >
              <option value="">{copy.all[locale]}</option>
              {portfolioCategories.map((item) => <option key={item.slug} value={item.slug}>{item.name[locale]}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" aria-hidden="true" />
          </div>
          <nav
            aria-label={copy.title[locale]}
            className="my-6 hidden flex-wrap gap-3 md:flex"
          >
            {[{ slug: "", name: copy.all }, ...portfolioCategories].map(
              (item) => (
                <Link
                  key={item.slug}
                  onClick={() => setQuery("")}
                  href={
                    item.slug ? `/projects/category/${item.slug}` : "/projects"
                  }
                  aria-current={
                    (category?.slug ?? "") === item.slug ? "page" : undefined
                  }
                  className={`flex min-h-11 items-center rounded-full border px-5 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${(category?.slug ?? "") === item.slug ? "border-black bg-black text-white" : "border-gray-300 bg-white text-gray-700 hover:border-black"}`}
                >
                  {item.name[locale]}
                </Link>
              ),
            )}
            <Link
              href="/projects#case-studies"
              onClick={() => setQuery("")}
              className="flex min-h-11 items-center rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              {t.nav.caseStudies}
            </Link>
          </nav>
          <div className="projects-toolbar">
            <div className="relative min-w-0">
              <label htmlFor="project-search" className="sr-only">{copy.search[locale]}</label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden="true" />
              <input
                ref={searchRef}
                id="project-search"
                type="search"
                value={query}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder={copy.searchPlaceholder[locale]}
                aria-controls="project-results"
                className="form-control pl-11 pr-14"
              />
              {query && (
                <button type="button" onClick={clearSearch} aria-label={copy.clearSearch[locale]} className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-gray-600 hover:text-black">
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2" role="group" aria-label={copy.view[locale]}>
                {([
                  { value: "compact", label: copy.compact[locale], icon: List },
                  { value: "cards", label: copy.cards[locale], icon: LayoutGrid },
                ] as const).map(({ value, label, icon: Icon }) => (
                  <Button key={value} type="button" variant={view === value ? "default" : "outline"} aria-pressed={view === value} aria-controls="project-results" className="px-3" onClick={() => { setView(value); scrollToResultsIfNeeded(); }}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </Button>
                ))}
              </div>
              <p className="whitespace-nowrap text-xs text-gray-600" role="status" aria-live="polite" aria-atomic="true">
                {visibleCount} / {entries.length} · {copy.nav[locale]}
              </p>
            </div>
          </div>
          <div ref={resultsRef} id="project-results">
            {!category && filteredCaseStudies.length > 0 && (
              <section
                id="case-studies"
                aria-labelledby="case-studies-heading"
                className="projects-section section-gap scroll-mt-28"
              >
                <div className="projects-section__intro mb-8 max-w-3xl">
                  <h2
                    id="case-studies-heading"
                    className="section-title text-gray-950"
                  >
                    {t.nav.caseStudies}
                  </h2>
                  <p className="mt-4 leading-relaxed text-gray-600">
                    {copy.caseStudiesDescription[locale]}
                  </p>
                </div>
                <div className="grid gap-[var(--space-grid)] md:grid-cols-2">
                  {filteredCaseStudies.map((caseStudy) => (
                    <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} compact={view === "compact"} />
                  ))}
                </div>
              </section>
            )}
            {categories.filter((item) => filteredProjects.some((project) => project.category === item.slug)).map((item) => (
              <section
                key={item.slug}
                aria-labelledby={`category-${item.slug}`}
                className="projects-section section-gap scroll-mt-28"
              >
                <div className="projects-section__intro mb-8 max-w-3xl">
                  <h2
                    id={`category-${item.slug}`}
                    className="section-title text-gray-950"
                  >
                    {item.name[locale]}
                  </h2>
                  <p className="mt-4 leading-relaxed text-gray-600">
                    {item.description[locale]}
                  </p>
                </div>
                <div className="card-grid">
                  {filteredProjects
                    .filter((project) => project.category === item.slug)
                    .map((project) => (
                      <ProjectCard key={project.slug} project={project} compact={view === "compact"} />
                    ))}
                </div>
              </section>
            ))}
            {visibleCount === 0 && (
              <div className="content-panel my-8 text-center">
                <p>{copy.noResults[locale]}</p>
                <Button type="button" variant="outline" onClick={clearSearch} className="mt-4">{copy.clearSearch[locale]}</Button>
              </div>
            )}
          </div>
          <div className="content-panel section-gap">
            <p className="max-w-3xl text-sm leading-relaxed text-gray-600">
              {copy.note[locale]}
            </p>
            <Link
              href="/start-a-project?need=web-app"
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-black px-6 py-3 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
            >
              {copy.start[locale]}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
