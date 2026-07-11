import { useEffect } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { PublicPageHero } from "@/components/sections/PublicPageHero";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import {
  aiCapabilityPages,
  aiLocationPages,
  getServicePageBySlug,
  legacyServiceRedirects,
  servicePillarPages,
  type ServicePage,
} from "@/lib/servicePages";
import { CONTACT_MAILTO } from "@/lib/contact";

const AI_HUB_SLUG = "advanced-analytics-ai";

const aiRelatedServiceSlugs: Record<string, string[]> = {
  [AI_HUB_SLUG]: [
    "ai-strategy-readiness",
    "ai-automation-consulting",
    "generative-ai-llm-consulting",
    "predictive-analytics-machine-learning",
    "ai-governance-literacy-adoption",
    "mlops-model-monitoring",
    "ai-business-intelligence",
    "ai-consulting-greece",
  ],
  "ai-strategy-readiness": [
    AI_HUB_SLUG,
    "ai-automation-consulting",
    "ai-governance-literacy-adoption",
    "ai-consulting-greece",
  ],
  "ai-automation-consulting": [
    AI_HUB_SLUG,
    "generative-ai-llm-consulting",
    "ai-governance-literacy-adoption",
    "mlops-model-monitoring",
  ],
  "generative-ai-llm-consulting": [
    AI_HUB_SLUG,
    "ai-automation-consulting",
    "ai-governance-literacy-adoption",
    "mlops-model-monitoring",
  ],
  "predictive-analytics-machine-learning": [
    AI_HUB_SLUG,
    "mlops-model-monitoring",
    "ai-business-intelligence",
    "business-intelligence-semantic-modeling",
  ],
  "ai-governance-literacy-adoption": [
    AI_HUB_SLUG,
    "ai-strategy-readiness",
    "mlops-model-monitoring",
    "ai-consulting-greece",
  ],
  "mlops-model-monitoring": [
    AI_HUB_SLUG,
    "predictive-analytics-machine-learning",
    "generative-ai-llm-consulting",
    "ai-governance-literacy-adoption",
  ],
  "ai-business-intelligence": [
    AI_HUB_SLUG,
    "business-intelligence-semantic-modeling",
    "ai-automation-consulting",
    "predictive-analytics-machine-learning",
  ],
  "ai-consulting-greece": [
    AI_HUB_SLUG,
    "ai-strategy-readiness",
    "ai-automation-consulting",
    "ai-governance-literacy-adoption",
  ],
};

const relatedResourceMap: Record<string, Array<{ title: string; path: string }>> = {
  [AI_HUB_SLUG]: [
    {
      title: "AI consulting for Greek businesses: practical use cases",
      path: "/blog/ai-consulting-greek-businesses-practical-use-cases",
    },
    {
      title: "AI document workflows for professional services",
      path: "/blog/ai-document-workflows-professional-services",
    },
    {
      title: "Why data strategy should come before AI",
      path: "/blog/data-strategy-before-ai-better-foundations",
    },
  ],
  "ai-strategy-readiness": [
    {
      title: "Why data strategy should come before AI",
      path: "/blog/data-strategy-before-ai-better-foundations",
    },
    {
      title: "An analytics roadmap for the first 90 days",
      path: "/blog/analytics-roadmap-first-90-days",
    },
  ],
  "ai-automation-consulting": [
    {
      title: "AI document workflows for professional services",
      path: "/blog/ai-document-workflows-professional-services",
    },
    {
      title: "Turning prompts into repeatable business workflows",
      path: "/blog/prompt-workflow-design-business-teams",
    },
  ],
  "generative-ai-llm-consulting": [
    {
      title: "Turning prompts into repeatable business workflows",
      path: "/blog/prompt-workflow-design-business-teams",
    },
    {
      title: "What an AI assistant policy should cover",
      path: "/blog/ai-assistant-governance-company-policy",
    },
    {
      title: "AI document workflows for professional services",
      path: "/blog/ai-document-workflows-professional-services",
    },
  ],
  "predictive-analytics-machine-learning": [
    {
      title: "Common forecasting mistakes business teams make",
      path: "/blog/predictive-analytics-forecasting-mistakes",
    },
    {
      title: "What to monitor after an AI workflow launches",
      path: "/blog/model-monitoring-ai-workflows",
    },
  ],
  "ai-governance-literacy-adoption": [
    {
      title: "What an AI assistant policy should cover",
      path: "/blog/ai-assistant-governance-company-policy",
    },
    {
      title: "How teams can adopt AI without operational risk",
      path: "/blog/ai-literacy-teams-adopt-ai-without-operational-risk",
    },
    {
      title: "How to scale analytics governance without losing control",
      path: "/blog/data-governance-gdpr-scale-analytics-control",
    },
  ],
  "mlops-model-monitoring": [
    {
      title: "How small and mid-sized teams can productionize AI",
      path: "/blog/mlops-small-mid-sized-teams-productionize-ai",
    },
    {
      title: "What to monitor after an AI workflow launches",
      path: "/blog/model-monitoring-ai-workflows",
    },
  ],
  "ai-business-intelligence": [
    {
      title: "Why dashboards are business infrastructure",
      path: "/blog/power-bi-consulting-dashboards-business-infrastructure",
    },
    {
      title: "Why clean semantic models matter in Power BI",
      path: "/blog/semantic-modeling-power-bi-clean-models",
    },
    {
      title: "What to define before a Power BI build",
      path: "/blog/dashboard-requirements-before-power-bi-build",
    },
  ],
  "ai-consulting-greece": [
    {
      title: "AI consulting for Greek businesses: practical use cases",
      path: "/blog/ai-consulting-greek-businesses-practical-use-cases",
    },
    {
      title: "Why data strategy should come before AI",
      path: "/blog/data-strategy-before-ai-better-foundations",
    },
    {
      title: "How teams can adopt AI without operational risk",
      path: "/blog/ai-literacy-teams-adopt-ai-without-operational-risk",
    },
  ],
};

function formatInlineServiceName(value: string) {
  if (/^(AI|MLOps)\b/.test(value)) {
    return value;
  }

  return `${value.charAt(0).toLowerCase()}${value.slice(1)}`;
}

function ServiceNotFound() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar />
      <main className="pt-32 pb-20">
        <PublicPageHero
          icon={Sparkles}
          eyebrow="Services"
          title="Service page not found."
          description="The service page you are looking for is not available at this route."
          actions={
            <Button asChild className="rounded-full bg-black px-8 text-white hover:bg-gray-800">
              <Link href="/services">
                Back to services
                <ArrowLeft className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          }
        />
      </main>
      <Footer />
    </div>
  );
}

function buildStructuredData(service: ServicePage) {
  const url = `https://www.bisolutions.group${service.path}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: service.title,
        serviceType: service.title,
        description: service.seoDescription,
        url,
        areaServed: service.slug === "ai-consulting-greece"
          ? {
              "@type": "Country",
              name: "Greece",
            }
          : [
              {
                "@type": "Country",
                name: "Greece",
              },
              {
                "@type": "Place",
                name: "Europe",
              },
            ],
        provider: {
          "@id": "https://www.bisolutions.group/#organization",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.bisolutions.group/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Services",
            item: "https://www.bisolutions.group/services",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: service.title,
            item: url,
          },
        ],
      },
    ],
  };
}

export default function ServiceDetail() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/services/:slug");
  const slug = params?.slug || "";
  const legacyRedirect = legacyServiceRedirects[slug];
  const service = getServicePageBySlug(slug);

  useEffect(() => {
    if (legacyRedirect) {
      navigate(legacyRedirect, { replace: true });
    }
  }, [legacyRedirect, navigate]);

  if (legacyRedirect) {
    return null;
  }

  if (!service) {
    return <ServiceNotFound />;
  }

  const Icon = service.icon;
  const isAiHub = service.slug === AI_HUB_SLUG;
  const isAiCapability = aiCapabilityPages.some((item) => item.slug === service.slug);
  const isAiLocation = aiLocationPages.some((item) => item.slug === service.slug);
  const isAiService = isAiHub || isAiCapability || isAiLocation;
  const relatedServices = aiRelatedServiceSlugs[service.slug]
    ? aiRelatedServiceSlugs[service.slug]
        .map((relatedSlug) => getServicePageBySlug(relatedSlug))
        .filter((item): item is ServicePage => Boolean(item))
    : servicePillarPages
        .filter((item) => item.slug !== service.slug)
        .slice(0, 3);
  const relatedResources = relatedResourceMap[service.slug] || [];
  const relatedLabel = isAiService
    ? "Related AI consulting services"
    : "Related services";
  const relatedTitle = isAiHub
    ? "Choose the AI consulting path that matches the work."
    : isAiLocation
      ? "Connect the Greece-focused service to the wider AI consulting offer."
      : isAiService
      ? "Connect this capability to the wider AI consulting offer."
      : "Keep the broad BI Solutions offer, with sharper entry points.";
  const relatedDescription = isAiService
    ? "Each page covers a distinct delivery need while connecting strategy, implementation, governance, and ongoing operations."
    : "Each service can stand alone for client clarity, while still connecting back to the wider analytics, AI, BI, and digital delivery offer.";

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Seo
        title={service.seoTitle}
        description={service.seoDescription}
        path={service.path}
        keywords={service.keywords}
        structuredData={buildStructuredData(service)}
      />
      <Navbar />

      <main className="pt-32 pb-20">
        <PublicPageHero
          icon={Icon}
          eyebrow={service.heroEyebrow}
          title={service.heroTitle}
          description={service.heroDescription}
          actions={
            <>
              <Button asChild className="rounded-full bg-black px-8 text-white hover:bg-gray-800">
                <a href={CONTACT_MAILTO}>
                  Discuss this service
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-gray-300 px-8">
                <Link href="/services">Back to all services</Link>
              </Button>
            </>
          }
          footer={
            <div className="grid gap-4 md:grid-cols-3">
              {service.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    {metric.label}
                  </p>
                  <p className="mt-3 text-base font-medium leading-relaxed text-gray-800">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          }
        />

        <section className="mx-auto max-w-7xl px-6 md:px-12">
          <ScrollReveal className="max-w-3xl" width="100%">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
              What this service covers
            </p>
            <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
              What {formatInlineServiceName(service.shortTitle)} includes.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              Each engagement is scoped around the business decision, current
              systems, delivery constraints, and an operating result the
              internal team can maintain.
            </p>
          </ScrollReveal>

          <div className="mt-10 grid auto-rows-fr gap-6 md:grid-cols-2">
            {service.outcomes.map((outcome, index) => (
              <ScrollReveal key={outcome} delay={index * 0.06} width="100%">
                <article className="h-full rounded-[2rem] border border-gray-200 bg-white p-6 shadow-xl shadow-black/[0.04]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-lg shadow-black/10">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="mt-5 text-base leading-relaxed text-gray-700">
                    {outcome}
                  </p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 grid max-w-7xl gap-8 px-6 md:px-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <ScrollReveal width="100%">
            <div className="h-full rounded-[2rem] border border-gray-200 bg-gray-50 p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Typical scope
              </p>
              <h2 className="mt-4 text-3xl font-bold font-heading tracking-tight text-gray-950">
                Service components
              </h2>
              <ul className="mt-6 space-y-4">
                {service.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-gray-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal width="100%" delay={0.08}>
            <div className="h-full rounded-[2rem] border border-gray-200 bg-white p-8 shadow-xl shadow-black/[0.04]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Delivery approach
              </p>
              <h2 className="mt-4 text-3xl font-bold font-heading tracking-tight text-gray-950">
                How the work usually moves
              </h2>
              <div className="mt-6 space-y-5">
                {service.delivery.map((item, index) => (
                  <div key={item} className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-950 text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-sm leading-relaxed text-gray-700">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>

        {relatedResources.length > 0 && (
          <section className="mx-auto mt-16 max-w-7xl px-6 md:px-12">
            <ScrollReveal className="max-w-3xl" width="100%">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Supporting insights
              </p>
              <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
                Practical guides related to this service.
              </h2>
            </ScrollReveal>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {relatedResources.map((resource) => (
                <ScrollReveal key={resource.path} width="100%">
                  <Link
                    href={resource.path}
                    className="group flex h-full items-center justify-between gap-5 rounded-[1.5rem] border border-gray-200 bg-gray-50 px-6 py-6 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:shadow-black/[0.04]"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                        Guide
                      </p>
                      <h3 className="mt-3 text-lg font-bold leading-snug text-gray-950">
                        {resource.title}
                      </h3>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        <section className="mx-auto mt-16 max-w-7xl px-6 md:px-12">
          <ScrollReveal className="max-w-3xl" width="100%">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
              Good fit
            </p>
            <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
              When to use this service.
            </h2>
          </ScrollReveal>

          <div className="mt-10 grid auto-rows-fr gap-6 lg:grid-cols-3">
            {service.useCases.map((useCase, index) => (
              <ScrollReveal key={useCase} delay={index * 0.08} width="100%">
                <div className="h-full rounded-[2rem] border border-gray-200 bg-gray-50 px-6 py-7">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
                    Use case {index + 1}
                  </p>
                  <p className="mt-4 text-base leading-relaxed text-gray-700">
                    {useCase}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-7xl px-6 md:px-12">
          <ScrollReveal width="100%">
            <div className="rounded-[2rem] bg-gray-950 px-8 py-10 text-white shadow-2xl shadow-black/[0.14] md:px-12">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                {relatedLabel}
              </p>
              <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
                <div>
                  <h2 className="text-3xl font-bold font-heading tracking-tight md:text-4xl">
                    {relatedTitle}
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-gray-300">
                    {relatedDescription}
                  </p>
                </div>
                <div className="grid gap-3">
                  {relatedServices.map((related) => (
                    <Link
                      key={related.slug}
                      href={related.path}
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-gray-200 transition-colors hover:bg-white hover:text-gray-950"
                    >
                      <span className="font-medium">{related.navLabel}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>
      <Footer />
    </div>
  );
}
