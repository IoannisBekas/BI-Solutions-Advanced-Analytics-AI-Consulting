import { Navbar } from "@/components/layout/Navbar";
import { CinematicHero } from "@/components/sections/CinematicHero";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { aiCapabilityPages } from "@/lib/servicePages";
import { blogPosts } from "@/data/blogData";
import { caseStudies } from "@/data/caseStudies";
import { trackEvent } from "@/lib/analytics";
import { withAssetBase } from "@/lib/site";
import { useLocale } from "@/i18n/LocaleProvider";

const latestInsight = blogPosts[0];
const moreInsights = blogPosts.slice(1, 4);

export default function Home() {
  const { t } = useLocale();

  return (
    <div
      className="min-h-screen bg-background font-sans text-foreground"
      data-hero-overlay="true"
    >
      <Seo
        title={t.home.seoTitle}
        description={t.home.seoDescription}
        path="/"
        keywords={[
          "international AI consulting",
          "AI consulting services",
          "generative AI consulting",
          "predictive analytics consulting",
          "BI consultant",
          "business intelligence consultant",
          "Power BI Tableau Looker consulting",
          "international web app development",
          "content operations consulting",
          "content repurposing systems",
          "digital product development",
          "fractional data leadership",
          "managed analytics support",
          "corporate AI training",
          "data strategy consulting",
          "business intelligence consulting",
          "data career mentorship",
          "data analyst mentor",
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
              "content operations",
              "digital products",
              "fractional data and AI leadership",
              "managed analytics operations",
              "team enablement",
              "data strategy",
              "business intelligence",
              "data career mentorship",
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
              "AI, business intelligence, data strategy, cloud foundations, web applications, digital products, content operations, managed support, enablement, and mentorship for organizations and professionals worldwide.",
            areaServed: "Worldwide",
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
              "content operations",
              "digital products",
              "fractional data and AI leadership",
              "managed BI and AI operations",
              "corporate AI training",
              "analytics engineering",
              "data career mentorship",
              "professional upskilling",
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
                  url: "https://www.bisolutions.group/services#business-intelligence-semantic-modeling",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "AI consulting services and implementation",
                  url: "https://www.bisolutions.group/services#advanced-analytics-ai",
                },
              },
              ...aiCapabilityPages.map((service) => ({
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
                  url: "https://www.bisolutions.group/services#data-strategy-governance",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Website and web app development",
                  url: "https://www.bisolutions.group/services#website-app-development",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Digital products and content operations",
                  url: "https://www.bisolutions.group/services#content-operations-automation",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Data and AI enablement and mentorship",
                  url: "https://www.bisolutions.group/services#data-career-enablement-mentorship",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Fractional data and AI leadership",
                  url: "https://www.bisolutions.group/services#ways-to-work-together",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Managed BI, data, and AI operations",
                  url: "https://www.bisolutions.group/services#ways-to-work-together",
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
              "data career mentorship",
            ],
          },
        ]}
      />
      <Navbar />
      <main>
        {/* Keep the sticky hero scoped to its own stage so it releases before
            the rest of the homepage content. */}
        <div className="cinematic-hero-stage">
          <CinematicHero />
        </div>

        <section id="case-studies" className="bi-proof-grid overflow-hidden bg-black py-24 text-white scroll-mt-24">
          <div className="site-container px-6 md:px-12">
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
          <div className="site-container px-6 md:px-12">
            <ScrollReveal className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between" width="100%">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Latest insights
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
                    src={withAssetBase(latestInsight.featuredImage)}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
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

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {moreInsights.map((insight, index) => (
                <ScrollReveal
                  key={insight.slug}
                  delay={index * 0.06}
                  width="100%"
                >
                  <Link
                    href={`/blog/${insight.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.04]"
                    onClick={() =>
                      trackEvent("insight_click", {
                        article: insight.slug,
                        placement: "homepage_more_insights",
                        target: `/blog/${insight.slug}`,
                      })
                    }
                  >
                    <div className="aspect-video overflow-hidden border-b border-gray-100 bg-gray-100">
                      <img
                        src={withAssetBase(insight.featuredImage)}
                        alt=""
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </div>
                    <article className="flex flex-1 flex-col p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-600">
                        {insight.category} · {insight.readTime}
                      </p>
                      <h3 className="mt-4 text-xl font-bold font-heading leading-tight text-gray-950 md:text-2xl">
                        {insight.title}
                      </h3>
                      <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-600">
                        {insight.excerpt}
                      </p>
                      <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-gray-950">
                        Read article
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </article>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f6f3ef] py-24">
          <div className="site-container px-6 md:px-12">
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
