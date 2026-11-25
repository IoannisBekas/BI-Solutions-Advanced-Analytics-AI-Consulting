import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CinematicHero } from "@/components/sections/CinematicHero";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/LocaleProvider";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { trackEvent } from "@/lib/analytics";
import { LOCALE_TAGS } from "@/i18n/config";

const organizationId = "https://www.bisolutions.group/#organization";
const founderId = "https://www.bisolutions.group/about#ioannis-bekas";
const companyLinkedIn = "https://www.linkedin.com/company/bi-solutions-group-bekas/";

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
        keywords={["Power BI consulting", "Power BI performance review", "BI Solutions Group", "AI workflow automation"]}
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": "https://www.bisolutions.group/#website",
            name: "BI Solutions Group",
            url: "https://www.bisolutions.group/",
            inLanguage: LOCALE_TAGS[locale],
            publisher: { "@id": organizationId },
            about: ["Power BI consulting", "semantic modeling", "AI workflow automation"],
          },
          {
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "@id": organizationId,
            name: "BI Solutions Group",
            alternateName: "BI Solutions",
            url: "https://www.bisolutions.group/",
            logo: "https://www.bisolutions.group/bi-solutions-logo.png",
            image: "https://www.bisolutions.group/bi-solutions-logo.png",
            description:
              "Founder-led Power BI model and performance reviews, reporting design, and AI workflow automation for teams worldwide.",
            areaServed: "Worldwide",
            founder: { "@id": founderId },
            knowsAbout: ["Power BI", "DAX", "semantic modeling", "data engineering", "AI workflow automation"],
            sameAs: [
              companyLinkedIn,
              "https://github.com/IoannisBekas",
              "https://www.instagram.com/bisolutions.group/",
            ],
            makesOffer: [
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Power BI model and performance review",
                  url: "https://www.bisolutions.group/services/power-bi-consulting",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "AI workflow automation",
                  url: "https://www.bisolutions.group/services/ai-automation",
                },
              },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "Person",
            "@id": founderId,
            name: "Ioannis Bekas",
            jobTitle: "Data Scientist & AI Developer",
            url: "https://www.bisolutions.group/about",
            worksFor: { "@id": organizationId },
            sameAs: [
              "https://linkedin.com/in/ioannisbekas",
              "https://github.com/IoannisBekas",
              companyLinkedIn,
            ],
            knowsAbout: ["Power BI", "semantic modeling", "data governance", "AI consulting", "advanced analytics"],
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
