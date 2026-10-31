import { Link, useRoute } from "wouter";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useLocale, useLocalizedHref } from "@/i18n/LocaleProvider";
import { LOCALES } from "@/i18n/config";
import {
  portfolioProjects,
  portfolioCopy as copy,
  projectImage,
  projectCategory,
} from "@/data/portfolio";
import { withAssetBase } from "@/lib/site";
import { trackEvent } from "@/lib/analytics";
import NotFound from "@/pages/NotFound";

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:slug");
  const { locale } = useLocale();
  const localizedHref = useLocalizedHref();
  const project = portfolioProjects.find((item) => item.slug === params?.slug);
  if (!project) return <NotFound />;
  const category = projectCategory(project);
  const path = `/projects/${project.slug}`;
  const url = `https://www.bisolutions.group${localizedHref(path)}`;
  const related = portfolioProjects
    .filter(
      (item) =>
        item.category === project.category && item.slug !== project.slug,
    )
    .slice(0, 3);
  const service =
    project.category === "web-apps-dashboards"
      ? "/services#business-intelligence-semantic-modeling"
      : "/services#website-app-development";
  return (
    <div className="min-h-screen bg-[#f5f3f0] font-sans text-foreground [overflow-wrap:anywhere]">
      <Seo
        title={`${project.title} — ${copy.overview[locale]}`}
        description={project.summary[locale]}
        path={path}
        image={projectImage(project, "social")}
        translatedLocales={LOCALES}
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "@id": `${url}#project`,
            name: project.title,
            description: project.summary[locale],
            url,
            image: `https://www.bisolutions.group${projectImage(project, "social")}`,
            inLanguage: locale,
            genre: category.name[locale],
            creator: { "@id": "https://www.bisolutions.group/#organization" },
            mainEntityOfPage: url,
            workExample: {
              "@type": "WebSite",
              url: project.url,
              name: project.title,
            },
            isPartOf: {
              "@type": "CollectionPage",
              url: `https://www.bisolutions.group${localizedHref("/projects")}`,
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "BI Solutions Group",
                item: `https://www.bisolutions.group${localizedHref("/")}`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: copy.title[locale],
                item: `https://www.bisolutions.group${localizedHref("/projects")}`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: category.name[locale],
                item: `https://www.bisolutions.group${localizedHref(`/projects/category/${category.slug}`)}`,
              },
              {
                "@type": "ListItem",
                position: 4,
                name: project.title,
                item: url,
              },
            ],
          },
        ]}
      />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="pb-24 pt-32">
        <div className="site-container px-6 md:px-12">
          <nav
            aria-label={copy.all[locale]}
            className="mb-10 flex flex-wrap gap-x-5 gap-y-3 text-sm text-gray-600"
          >
            <Link
              href="/projects"
              className="inline-flex min-h-11 items-center gap-2 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {copy.all[locale]}
            </Link>
            <Link
              href={`/projects/category/${category.slug}`}
              className="inline-flex min-h-11 items-center hover:underline"
            >
              {category.name[locale]}
            </Link>
          </nav>
          <header className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#a51f25]">
              {category.name[locale]}
            </p>
            <h1
              className="mt-5 font-heading text-4xl font-bold leading-tight tracking-tight text-gray-950 sm:text-5xl lg:text-6xl"
              translate="no"
            >
              {project.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-gray-600">
              {project.summary[locale]}
            </p>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent("website_project_open", {
                  project: project.slug,
                  placement: "project_detail",
                  target: project.url,
                })
              }
              className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-black px-6 py-3 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
            >
              {copy.live[locale]}
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="sr-only">{copy.newTab[locale]}</span>
            </a>
          </header>
          <figure className="mt-12">
            <img
              src={withAssetBase(projectImage(project))}
              srcSet={`${withAssetBase(projectImage(project, "800"))} 800w, ${withAssetBase(projectImage(project))} 1440w`}
              sizes="(min-width: 1440px) 1320px, 100vw"
              width={1440}
              height={810}
              alt={`${project.title} — ${copy.alt[locale]}`}
              fetchPriority="high"
              className="aspect-video w-full rounded-[2rem] border border-gray-200 bg-white object-cover"
            />
            <figcaption className="mt-4 text-sm leading-relaxed text-gray-500">
              {copy.captureNote[locale]}
            </figcaption>
          </figure>
          <div className="mt-16 grid gap-10 lg:grid-cols-2">
            <section className="rounded-[2rem] border border-gray-200 bg-white p-7 sm:p-10">
              <h2 className="font-heading text-2xl font-bold">
                {copy.overview[locale]}
              </h2>
              <p className="mt-5 leading-relaxed text-gray-600">
                {category.description[locale]}
              </p>
              <p className="mt-5 text-sm leading-relaxed text-gray-500">
                {copy.note[locale]}
              </p>
            </section>
            <section className="rounded-[2rem] border border-gray-200 bg-white p-7 sm:p-10">
              <h2 className="font-heading text-2xl font-bold">
                {copy.features[locale]}
              </h2>
              <ul className="mt-5 space-y-4">
                {project.features[locale].map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-3 leading-relaxed text-gray-700"
                  >
                    <span
                      className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#a51f25]"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={service}
                className="mt-8 inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
              >
                {copy.service[locale]}
              </Link>
            </section>
          </div>
          <section className="mt-16">
            <h2 className="mb-8 font-heading text-3xl font-bold">
              {copy.related[locale]}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProjectCard key={item.slug} project={item} />
              ))}
            </div>
          </section>
          <Link
            href="/start-a-project?need=web-app"
            className="mt-12 inline-flex min-h-12 items-center rounded-full bg-black px-6 py-3 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
          >
            {copy.start[locale]}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
