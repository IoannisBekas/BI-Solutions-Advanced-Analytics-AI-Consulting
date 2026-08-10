import { Navbar } from "@/components/layout/Navbar";
import { CinematicHero } from "@/components/sections/CinematicHero";
import { ServicesPanel } from "@/components/sections/ServicesPanel";
import { ScrollStoryHero } from "@/components/sections/ScrollStoryHero";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { aiCapabilityPages, aiLocationPages } from "@/lib/servicePages";
import { blogPosts } from "@/data/blogData";
import { caseStudies } from "@/data/caseStudies";
import { trackEvent } from "@/lib/analytics";
import { useLocale } from "@/i18n/LocaleProvider";

const latestInsight = blogPosts[0];

/**
 * Flip to "story" to restore the scroll-scrubbed video hero. Kept switchable so
 * both treatments can be compared before one is retired.
 */
const HERO_VARIANT: "cinematic" | "story" = "cinematic";

export default function Home() {
  const { t } = useLocale();
  const isCinematic = HERO_VARIANT === "cinematic";

  return (
    <div
      className="min-h-screen bg-background font-sans text-foreground"
      data-hero-overlay={isCinematic ? "true" : undefined}
    >
      <Seo
        title={t.home.seoTitle}
        description={t.home.seoDescription}
        path="/"
        keywords={[
          "AI consulting Greece",
          "AI consulting services",
          "generative AI consulting",
          "predictive analytics consulting",
          "BI consultant Greece",
          "business intelligence consultant Greece",
          "Power BI Tableau Looker consulting",
          "web app development Greece",
          "data strategy consulting",
          "business intelligence consulting",
          "BI Solutions Group",
        ]}
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": "https://www.bisolutions.group/#website",
            name: "BI Solutions Group",
            url: "https://www.bisolutions.group/",
            inLanguage: "en",
            publisher: {
              "@id": "https://www.bisolutions.group/#organization",
            },
            about: [
              "business intelligence consulting",
              "AI consulting",
              "generative AI consulting",
              "AI automation",
              "predictive analytics",
              "website and web app development",
              "data strategy",
              "business intelligence",
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "@id": "https://www.bisolutions.group/#organization",
            name: "BI Solutions Group",
            alternateName: "BI Solutions",
            url: "https://www.bisolutions.group/",
            logo: "https://www.bisolutions.group/bi-solutions-logo.png",
            image: "https://www.bisolutions.group/bi-solutions-logo.png",
            description:
              "AI, business intelligence, data strategy, cloud foundations, and web app development consultancy for businesses in Greece and Europe.",
            areaServed: ["Greece", "Europe"],
            founder: {
              "@id": "https://www.bisolutions.group/about#ioannis-bekas",
            },
            knowsAbout: [
              "Power BI",
              "Tableau",
              "Looker",
              "semantic modeling",
              "AI workflows",
              "generative AI",
              "LLM applications",
              "predictive analytics",
              "AI governance",
              "MLOps",
              "data strategy",
              "cloud foundations",
              "web app development",
              "analytics engineering",
            ],
            sameAs: [
              "https://www.linkedin.com/company/bi-solutions-by-bekas-ioannis/",
              "https://github.com/IoannisBekas",
              "https://www.instagram.com/bisolutions.group/",
            ],
            makesOffer: [
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Business intelligence consulting and semantic modeling",
                  url: "https://www.bisolutions.group/services/business-intelligence-semantic-modeling",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "AI consulting services and implementation",
                  url: "https://www.bisolutions.group/services/advanced-analytics-ai",
                },
              },
              ...[...aiCapabilityPages, ...aiLocationPages].map((service) => ({
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: service.title,
                  url: `https://www.bisolutions.group${service.path}`,
                },
              })),
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Data strategy and cloud foundations",
                  url: "https://www.bisolutions.group/services/data-strategy-governance",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Website and web app development",
                  url: "https://www.bisolutions.group/services/website-app-development",
                },
              },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "Person",
            "@id": "https://www.bisolutions.group/about#ioannis-bekas",
            name: "Ioannis Bekas",
            jobTitle: "Data Scientist & AI Developer",
            url: "https://www.bisolutions.group/about",
            worksFor: {
              "@id": "https://www.bisolutions.group/#organization",
            },
            sameAs: [
              "https://linkedin.com/in/ioannisbekas",
              "https://github.com/IoannisBekas",
              "https://www.linkedin.com/company/bi-solutions-by-bekas-ioannis/",
            ],
            knowsAbout: [
              "business intelligence",
              "Power BI",
              "Tableau",
              "Looker",
              "semantic modeling",
              "AI consulting",
              "advanced analytics",
              "data strategy",
              "web app development",
            ],
          },
        ]}
      />
      <Navbar />
      <main>
        {isCinematic ? (
          // The hero is sticky, so it must be scoped to a stage that ends with
          // the panel. As a direct child of <main> its containing block is the
          // whole page, which leaves it pinned behind every later section.
          <div className="cinematic-hero-stage">
            <CinematicHero />
            <ServicesPanel />
          </div>
        ) : (
          <ScrollStoryHero />
        )}

        <section id="case-studies" className="bi-proof-grid overflow-hidden bg-black py-24 text-white scroll-mt-24">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <ScrollReveal className="mb-16 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                Selected case studies
              </p>
              <h2 className="mt-4 text-4xl md:text-5xl font-bold font-heading text-white">
                See the thinking, structure, and outputs behind the work.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-gray-400">
                These independent portfolio analyses use synthetic or
                representative demonstration data to show how complex reporting
                questions can become focused, usable Power BI experiences.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
              {caseStudies.map((caseStudy, index) => {
                const href = `/case-studies/${caseStudy.slug}`;

                return (
                  <ScrollReveal
                    key={caseStudy.slug}
                    delay={index * 0.1}
                    className={index === 1 ? "lg:mt-10" : index === 2 ? "lg:mt-20" : undefined}
                    width="100%"
                  >
                    <Link
                      href={href}
                      className="group block h-full"
                      onClick={() =>
                        trackEvent("case_study_open", {
                          case_study: caseStudy.slug,
                          placement: "homepage",
                          target: href,
                        })
                      }
                    >
                      <article className="flex h-full flex-col">
                        <div className="aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                          <img
                            src={caseStudy.image}
                            alt={caseStudy.imageAlt}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                          {caseStudy.relationship}
                        </p>
                        <h3 className="mt-3 text-2xl font-bold font-heading leading-tight text-white transition-colors group-hover:text-gray-300">
                          {caseStudy.cardTitle}
                        </h3>
                        <p className="mt-4 text-sm leading-relaxed text-gray-400">
                          {caseStudy.summary}
                        </p>
                        <div className="mt-5 border-t border-white/10 pt-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                            Delivered
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-gray-300">
                            {caseStudy.delivered[0]}
                          </p>
                        </div>
                        <div className="mt-auto flex items-center gap-2 pt-6 text-sm font-semibold text-white">
                          Read the case study
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </article>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        <ReviewsSection />

        {/* Opaque, not translucent: a see-through section over a sticky hero
            lets the hero bleed into the copy. */}
        <section className="bg-[#f5f3f0] py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <ScrollReveal className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between" width="100%">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Latest insight
                </p>
                <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
                  Practical thinking before the project starts.
                </h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-gray-950 underline decoration-gray-300 underline-offset-4"
              >
                Browse all insights
                <ArrowRight className="h-4 w-4" />
              </Link>
            </ScrollReveal>

            <ScrollReveal width="100%">
              <Link
                href={`/blog/${latestInsight.slug}`}
                className="group grid overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-xl shadow-black/[0.04] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
                onClick={() =>
                  trackEvent("insight_click", {
                    article: latestInsight.slug,
                    placement: "homepage",
                    target: `/blog/${latestInsight.slug}`,
                  })
                }
              >
                <div className="aspect-[16/10] overflow-hidden bg-gray-100 lg:aspect-auto">
                  <img
                    src={latestInsight.featuredImage}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    {latestInsight.category} · {latestInsight.date} · {latestInsight.readTime}
                  </p>
                  <h3 className="mt-5 text-3xl font-bold font-heading leading-tight text-gray-950 md:text-4xl">
                    {latestInsight.title}
                  </h3>
                  <p className="mt-5 text-base leading-relaxed text-gray-600">
                    {latestInsight.excerpt}
                  </p>
                  <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-gray-950">
                    Read the insight
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          </div>
        </section>

        <section className="bg-[#f6f3ef] py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <ScrollReveal width="100%">
              <div className="rounded-[2rem] bg-black px-7 py-12 text-white shadow-2xl shadow-black/[0.12] sm:px-10 md:px-14 md:py-16">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                  <div className="max-w-3xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Start a project
                    </p>
                    <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight md:text-5xl">
                      What are you trying to improve?
                    </h2>
                    <p className="mt-5 text-lg leading-relaxed text-gray-400">
                      Share the reporting problem, AI workflow, data foundation,
                      or digital product you need to move forward.
                    </p>
                  </div>
                  <Button
                    asChild
                    className="h-12 rounded-full bg-white px-7 text-base text-black hover:bg-gray-200"
                  >
                    <Link
                      href="/start-a-project"
                      onClick={() =>
                        trackEvent("contact_cta_click", {
                          placement: "homepage_final",
                          target: "/start-a-project",
                        })
                      }
                    >
                      Start a project
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
