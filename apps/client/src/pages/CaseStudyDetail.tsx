import { ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import { Link, useParams } from "wouter";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getCaseStudyBySlug } from "@/data/caseStudies";
import { trackEvent } from "@/lib/analytics";
import { withSiteBase } from "@/lib/site";
import NotFound from "@/pages/NotFound";

export default function CaseStudyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const caseStudy = slug ? getCaseStudyBySlug(slug) : undefined;

  if (!caseStudy) {
    return <NotFound />;
  }

  const path = `/case-studies/${caseStudy.slug}`;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Seo
        title={caseStudy.seoTitle}
        description={caseStudy.seoDescription}
        path={path}
        image={caseStudy.image}
        keywords={[
          "Power BI case study",
          "business intelligence portfolio",
          "dashboard design",
          "Power BI consultant Greece",
          "BI Solutions Group",
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: caseStudy.title,
          description: caseStudy.seoDescription,
          url: `https://www.bisolutions.group${path}`,
          creator: {
            "@type": "Organization",
            name: "BI Solutions Group",
            url: "https://www.bisolutions.group/",
          },
          isBasedOn: caseStudy.evidenceHref,
          about: [
            "business intelligence",
            "Power BI",
            "dashboard design",
            "analytics",
          ],
        }}
      />
      <Navbar />

      <main className="pb-24 pt-32">
        <section className="mx-auto max-w-7xl px-6 md:px-12">
          <ScrollReveal width="100%">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-sm text-gray-500"
            >
              <Link href="/" className="transition-colors hover:text-gray-950">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <a
                href={withSiteBase("/#case-studies")}
                className="transition-colors hover:text-gray-950"
              >
                Case Studies
              </a>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-gray-800">
                {caseStudy.cardTitle}
              </span>
            </nav>

            <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.38fr)] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                  {caseStudy.relationship}
                </p>
                <h1 className="mt-5 max-w-5xl text-4xl font-bold font-heading leading-[1.08] tracking-tight text-gray-950 sm:text-5xl md:text-6xl lg:text-7xl">
                  {caseStudy.title}
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-relaxed text-gray-600 md:text-xl">
                  {caseStudy.summary}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button
                  asChild
                  className="h-12 rounded-full bg-black px-7 text-white hover:bg-gray-800"
                >
                  <Link
                    href="/start-a-project"
                    onClick={() =>
                      trackEvent("case_study_cta_click", {
                        case_study: caseStudy.slug,
                        action: "start_project",
                        target: "/start-a-project",
                      })
                    }
                  >
                    Discuss a similar project
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-full border-gray-300 px-7"
                >
                  <a
                    href={caseStudy.evidenceHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackEvent("proof_source_click", {
                        case_study: caseStudy.slug,
                        source: "github",
                        target: caseStudy.evidenceHref,
                      })
                    }
                  >
                    View technical source
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm leading-relaxed text-gray-600">
              <span className="font-semibold text-gray-900">Relationship note:</span>{" "}
              {caseStudy.relationshipNote}
            </div>
          </ScrollReveal>
        </section>

        <section className="mx-auto mt-14 max-w-7xl px-6 md:px-12">
          <ScrollReveal width="100%">
            <div className="grid gap-px overflow-hidden rounded-[2rem] border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-4">
              {caseStudy.snapshot.map((item) => (
                <div key={item.label} className="bg-white px-6 py-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.17em] text-gray-400">
                    {item.label}
                  </p>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-gray-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>

        <section className="mx-auto mt-14 max-w-7xl px-6 md:px-12">
          <ScrollReveal width="100%">
            <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-gray-100 shadow-2xl shadow-black/[0.08]">
              <img
                src={caseStudy.image}
                alt={caseStudy.imageAlt}
                className="h-auto w-full"
              />
            </div>
          </ScrollReveal>
        </section>

        <section className="mx-auto mt-24 grid max-w-7xl gap-8 px-6 md:px-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
          <ScrollReveal width="100%">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
              The problem
            </p>
            <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
              The reporting question behind the interface.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              {caseStudy.challenge}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.08} width="100%">
            <div className="h-full rounded-[2rem] border border-gray-200 bg-gray-50 p-7 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Constraints
              </p>
              <ul className="mt-6 space-y-5">
                {caseStudy.constraints.map((constraint) => (
                  <li
                    key={constraint}
                    className="flex gap-3 text-sm leading-relaxed text-gray-700"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    <span>{constraint}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </section>

        <section className="mx-auto mt-20 grid max-w-7xl gap-8 px-6 md:px-12 lg:grid-cols-2">
          <ScrollReveal width="100%">
            <div className="h-full rounded-[2rem] bg-gray-950 p-7 text-white sm:p-9">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                Approach
              </p>
              <h2 className="mt-4 text-3xl font-bold font-heading tracking-tight">
                How the analysis was structured
              </h2>
              <div className="mt-8 space-y-6">
                {caseStudy.approach.map((item, index) => (
                  <div key={item} className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-sm leading-relaxed text-gray-300">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.08} width="100%">
            <div className="h-full rounded-[2rem] border border-gray-200 bg-white p-7 shadow-xl shadow-black/[0.04] sm:p-9">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Delivered
              </p>
              <h2 className="mt-4 text-3xl font-bold font-heading tracking-tight text-gray-950">
                Concrete report outputs
              </h2>
              <ul className="mt-8 space-y-5">
                {caseStudy.delivered.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-relaxed text-gray-700"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </section>

        <section className="mx-auto mt-20 max-w-7xl px-6 md:px-12">
          <ScrollReveal className="max-w-3xl" width="100%">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
              Outcome
            </p>
            <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
              What the demonstration proves.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              Because this is an independent demonstration rather than a client
              engagement, outcomes are described as delivered capabilities—not
              invented performance metrics.
            </p>
          </ScrollReveal>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {caseStudy.outcomes.map((outcome, index) => (
              <ScrollReveal key={outcome} delay={index * 0.08} width="100%">
                <article className="h-full rounded-[1.75rem] border border-gray-200 bg-gray-50 p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Capability {index + 1}
                  </p>
                  <p className="mt-4 leading-relaxed text-gray-700">{outcome}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-20 grid max-w-7xl gap-6 px-6 md:px-12 lg:grid-cols-2">
          <ScrollReveal width="100%">
            <div className="h-full rounded-[2rem] border border-gray-200 bg-gray-50 p-7 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Public evidence
              </p>
              <h2 className="mt-4 text-2xl font-bold font-heading text-gray-950">
                Project notes and technical context
              </h2>
              <p className="mt-4 leading-relaxed text-gray-600">
                {caseStudy.evidenceDescription}
              </p>
              <a
                href={caseStudy.evidenceHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-950 underline decoration-gray-300 underline-offset-4"
                onClick={() =>
                  trackEvent("proof_source_click", {
                    case_study: caseStudy.slug,
                    source: "github",
                    target: caseStudy.evidenceHref,
                  })
                }
              >
                {caseStudy.evidenceLabel}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.08} width="100%">
            <div className="flex h-full flex-col rounded-[2rem] border border-gray-200 bg-white p-7 shadow-xl shadow-black/[0.04] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Related service
              </p>
              <h2 className="mt-4 text-2xl font-bold font-heading text-gray-950">
                {caseStudy.relatedService.label}
              </h2>
              <p className="mt-4 leading-relaxed text-gray-600">
                Explore the service behind dashboard strategy, semantic models,
                KPI definitions, access, governance, and Power BI delivery.
              </p>
              <Link
                href={caseStudy.relatedService.href}
                className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-gray-950 underline decoration-gray-300 underline-offset-4"
              >
                Explore the related service
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>
        </section>

        <section className="mx-auto mt-20 max-w-7xl px-6 md:px-12">
          <ScrollReveal width="100%">
            <div className="rounded-[2rem] bg-black px-7 py-12 text-white sm:px-10 md:px-14 md:py-14">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div className="max-w-3xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Your project
                  </p>
                  <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight md:text-5xl">
                    Need a reporting experience built around your decisions?
                  </h2>
                  <p className="mt-5 text-lg leading-relaxed text-gray-400">
                    Share the users, data, and reporting problem. The first step
                    is to define what a useful, maintainable result should be.
                  </p>
                </div>
                <Button
                  asChild
                  className="h-12 rounded-full bg-white px-7 text-black hover:bg-gray-200"
                >
                  <Link
                    href="/start-a-project"
                    onClick={() =>
                      trackEvent("case_study_cta_click", {
                        case_study: caseStudy.slug,
                        action: "start_project",
                        target: "/start-a-project",
                      })
                    }
                  >
                    Discuss a similar project
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
