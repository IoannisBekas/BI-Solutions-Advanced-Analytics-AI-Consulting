import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { PublicPageHero } from "@/components/sections/PublicPageHero";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useLocale } from "@/i18n/LocaleProvider";
import {
  portfolioProjects,
  portfolioCategories,
  portfolioCopy as copy,
  projectImage,
  portfolioCanonicalUrl,
} from "@/data/portfolio";
import { LOCALES } from "@/i18n/config";
import NotFound from "@/pages/NotFound";

export default function Projects({
  category: categorySlug,
}: {
  category?: string;
}) {
  const { locale } = useLocale();
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
  return (
    <div className="min-h-screen bg-[#f5f3f0] font-sans text-foreground [overflow-wrap:anywhere]">
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
            numberOfItems: projects.length,
            itemListElement: projects.map((project, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: project.title,
              url: portfolioCanonicalUrl(`/projects/${project.slug}`, locale),
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
      <main id="main-content" tabIndex={-1} className="pb-24 pt-32">
        <PublicPageHero
          eyebrow={`${projects.length} · ${copy.title[locale]}`}
          title={category ? title : copy.heading[locale]}
          description={description}
        />
        <div className="site-container px-6 md:px-12">
          <nav
            aria-label={copy.title[locale]}
            className="my-8 flex flex-wrap gap-3"
          >
            {[{ slug: "", name: copy.all }, ...portfolioCategories].map(
              (item) => (
                <Link
                  key={item.slug}
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
          </nav>
          {categories.map((item) => (
            <section
              key={item.slug}
              aria-labelledby={`category-${item.slug}`}
              className="mt-16 scroll-mt-28"
            >
              <div className="mb-8 max-w-3xl">
                <h2
                  id={`category-${item.slug}`}
                  className="font-heading text-3xl font-bold leading-tight text-gray-950"
                >
                  {item.name[locale]}
                </h2>
                <p className="mt-4 leading-relaxed text-gray-600">
                  {item.description[locale]}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects
                  .filter((project) => project.category === item.slug)
                  .map((project) => (
                    <ProjectCard key={project.slug} project={project} />
                  ))}
              </div>
            </section>
          ))}
          <div className="mt-16 rounded-[2rem] border border-gray-200 bg-white p-6 sm:p-10">
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
