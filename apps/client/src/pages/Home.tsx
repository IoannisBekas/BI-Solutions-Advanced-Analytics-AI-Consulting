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
import { trackEvent } from "@/lib/analytics";
import { useLocale } from "@/i18n/LocaleProvider";

export default function Home() {
  const { t, locale } = useLocale();
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
              "AI, business intelligence, data strategy, cloud foundations, web applications, technical search visibility, digital products, content operations, managed support, enablement, and mentorship for organizations and professionals worldwide.",
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
              "https://www.linkedin.com/company/bi-solutions-group-bekas/",
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
                  name: "Web development and search visibility",
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
              "https://www.linkedin.com/company/bi-solutions-group-bekas/",
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

        {locale === "en" && (
          <section className="border-y border-gray-200 bg-white py-8">
            <div className="site-container flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <p className="text-lg font-semibold">Remote consulting for US teams</p>
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                <Link href="/us/power-bi-consulting" className="inline-flex items-center gap-2 font-medium underline underline-offset-4">Power BI consulting <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/us/ai-automation" className="inline-flex items-center gap-2 font-medium underline underline-offset-4">AI automation <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
          </section>
        )}

        <ReviewsSection />

        <section className="section-space bg-[var(--surface-paper)]">
          <div className="site-container">
            <ScrollReveal width="100%">
              <div className="content-panel border-black bg-black text-white">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                  <div className="max-w-3xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Start a project
                    </p>
                    <h2 className="section-title mt-4">
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
