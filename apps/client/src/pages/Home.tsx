import { ArrowRight, Gauge, Workflow } from "lucide-react";
import { Link } from "wouter";

import founderPhoto from "@/assets/founder-photo-2.jpg";
import { IntroCallLink } from "@/components/contact/DirectContact";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CinematicHero } from "@/components/sections/CinematicHero";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { useLocale, useLocalizedHref } from "@/i18n/LocaleProvider";
import { LOCALE_TAGS } from "@/i18n/config";
import { homeGrowthCopy } from "@/i18n/homeGrowth";
import { withAssetBase, withSiteBase } from "@/lib/site";

const organizationId = "https://www.bisolutions.group/#organization";
const founderId = "https://www.bisolutions.group/about#ioannis-bekas";
const companyLinkedIn = "https://www.linkedin.com/company/bi-solutions-group-bekas/";
const caseStudyPath = "/case-studies/risenfire-workforce-reporting";
const companyExperience = ["IAEA", "IOM", "UNDRR", "UN Women"];

export default function Home() {
  const { t, locale } = useLocale();
  const copy = homeGrowthCopy[locale];
  const localizedHref = useLocalizedHref();
  const offers = [
    {
      title: copy.powerBiTitle,
      body: copy.powerBiBody,
      scope: copy.powerBiScope,
      link: copy.powerBiLink,
      href: locale === "de" ? "/services#business-intelligence-semantic-modeling" : "/services/power-bi-consulting",
      usLink: "Power BI consulting for US teams",
      usHref: "/us/power-bi-consulting",
      Icon: Gauge,
    },
    {
      title: copy.aiTitle,
      body: copy.aiBody,
      scope: copy.aiScope,
      link: copy.aiLink,
      href: locale === "de" ? "/services#advanced-analytics-ai" : "/services/ai-automation",
      usLink: "AI automation for US teams",
      usHref: "/us/ai-automation",
      Icon: Workflow,
    },
  ];

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
        <div className="cinematic-hero-stage">
          <CinematicHero />
        </div>

        <section
          aria-labelledby="homepage-credentials"
          className="border-b border-black/10 bg-[var(--surface-paper)] py-7 sm:py-10"
        >
          <div className="site-container grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-12">
            <div className="max-w-xl">
              <h2 id="homepage-credentials" className="font-semibold">
                {copy.credentials}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {copy.credentialsSummary}
              </p>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold md:justify-end" translate="no">
              {companyExperience.map((name) => <li key={name}>{name}</li>)}
            </ul>
          </div>
        </section>

        <section aria-labelledby="homepage-offers" className="section-space bg-background">
          <div className="site-container">
            <h2 id="homepage-offers" className="section-title mb-8">
              {copy.offersTitle}
            </h2>
            <div className="grid gap-5 md:grid-cols-2 md:gap-7">
              {offers.map(({ Icon, title, body, scope, link, href, usLink, usHref }) => (
                <article key={href} className="content-panel flex flex-col items-start bg-[var(--surface-paper)]">
                  <div className="mb-5 flex size-11 items-center justify-center rounded-full border border-black/10 bg-background">
                    <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h3>
                  <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">{body}</p>
                  <p className="mt-4 pb-7 text-sm font-medium">{scope}</p>
                  <Link href={href} className="mt-auto inline-flex min-h-11 items-center gap-2 font-semibold underline-offset-4 hover:underline">
                    {link}
                    <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
                  </Link>
                  {locale === "en" && (
                    <Link href={usHref} className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
                      {usLink}
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="homepage-case-study" className="section-space bg-[var(--surface-paper)]">
          <div className="site-container grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">{copy.caseLabel}</p>
              <h2 id="homepage-case-study" className="section-title mt-3 text-balance">
                {copy.caseTitle}
              </h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">{copy.caseBody}</p>
              <a
                href={withSiteBase(caseStudyPath)}
                hrefLang="en"
                className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold underline-offset-4 hover:underline"
              >
                {copy.caseLink}
                <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
              </a>
            </div>
            <figure className="overflow-hidden rounded-2xl border border-black/10 bg-white">
              <img
                src={withAssetBase("assets/case-studies/risenfire-workflow.svg")}
                alt={copy.caseImageAlt}
                className="h-auto w-full"
                width={1200}
                height={675}
                loading="lazy"
              />
              <figcaption className="border-t border-black/10 px-4 py-3 text-xs text-muted-foreground sm:px-5">
                {copy.caseImageCaption}
              </figcaption>
            </figure>
          </div>
        </section>

        <ReviewsSection />

        <section aria-labelledby="homepage-founder" className="section-space bg-[var(--surface-paper)]">
          <div className="site-container">
            <div className="content-panel grid items-center gap-7 border-black bg-black text-white sm:grid-cols-[8rem_minmax(0,1fr)] lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-10">
              <img
                src={founderPhoto}
                alt={copy.founderPhotoAlt}
                width={700}
                height={800}
                loading="lazy"
                className="aspect-square w-32 rounded-2xl object-cover object-top sm:w-full"
              />
              <div>
                <h2 id="homepage-founder" className="section-title text-balance">{copy.founderTitle}</h2>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-300">{copy.founderBody}</p>
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <Button asChild className="h-auto min-h-11 rounded-full bg-white px-5 py-2.5 text-black hover:bg-gray-200">
                    <IntroCallLink
                      placement="homepage"
                      projectHref={localizedHref("/start-a-project?source=homepage&context=founder")}
                    />
                  </Button>
                  <Link href="/about" className="inline-flex min-h-11 items-center gap-2 font-semibold text-white underline-offset-4 hover:underline">
                    {copy.founderLink}
                    <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
