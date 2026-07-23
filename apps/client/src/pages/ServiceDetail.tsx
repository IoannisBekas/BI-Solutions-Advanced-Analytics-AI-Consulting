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
  "business-intelligence-semantic-modeling": [
    {
      title: "Why dashboards are business infrastructure",
      path: "/blog/power-bi-consulting-dashboards-business-infrastructure",
    },
    {
      title: "What to define before a Power BI build",
      path: "/blog/dashboard-requirements-before-power-bi-build",
    },
  ],
  "data-strategy-governance": [
    {
      title: "Why data strategy should come before AI",
      path: "/blog/data-strategy-before-ai-better-foundations",
    },
    {
      title: "A data quality checklist for analytics projects",
      path: "/blog/data-quality-checklist-analytics-projects",
    },
  ],
  "website-app-development": [
    {
      title: "What a business website needs to do",
      path: "/blog/website-web-app-development-greece-business-needs",
    },
    {
      title: "How modern websites track business outcomes",
      path: "/blog/modern-websites-track-business-outcomes",
    },
  ],
};

interface ProofItem {
  label: string;
  title: string;
  description: string;
  path: string;
}

const proofItems = {
  unicef: {
    label: "Independent portfolio analysis · synthetic demonstration data",
    title: "UNICEF audit compliance analysis",
    description:
      "See how audit themes, risk signals, and country-level detail can be organized into a structured analytical review.",
    path: "/case-studies/unicef-audit-compliance",
  },
} satisfies Record<string, ProofItem>;

const relatedProofMap: Record<string, ProofItem> = {
  "business-intelligence-semantic-modeling": proofItems.unicef,
};

interface FaqItem {
  question: string;
  answer: string;
}

const generalFaqs: FaqItem[] = [
  {
    question: "What does the first step involve?",
    answer:
      "The first step clarifies the business decision, users, current systems, available data, constraints, and what a useful result needs to change.",
  },
  {
    question: "Can this start as a focused engagement?",
    answer:
      "Yes. The work can begin with a diagnostic, review, roadmap, or limited build before expanding into a broader delivery engagement.",
  },
  {
    question: "Will our team receive documentation and handoff support?",
    answer:
      "Yes. Documentation, ownership, user guidance, and any ongoing support are agreed as part of the delivery scope.",
  },
];

const aiFaqs: FaqItem[] = [
  {
    question: "Do we need a fully defined AI use case before we start?",
    answer:
      "No. A short discovery can compare candidate workflows by business value, feasibility, data readiness, risk, and the effort required to operate them well.",
  },
  {
    question: "Can an engagement begin with one controlled pilot?",
    answer:
      "Yes. A focused pilot can validate the users, data boundary, output quality, review steps, and operating ownership before a wider rollout.",
  },
  {
    question: "How are privacy, review, and governance handled?",
    answer:
      "Controls are shaped around the workflow and its risk. That can include approved data boundaries, access rules, human review, evaluation, logs, documentation, and clear ownership.",
  },
];

const serviceSpecificFaqs: Partial<Record<string, FaqItem[]>> = {
  "business-intelligence-semantic-modeling": [
    {
      question: "Can you improve existing Power BI reports rather than rebuild them?",
      answer:
        "Yes. The engagement can begin with an audit of the current model, measures, performance, navigation, and governance before deciding what should be retained, corrected, or rebuilt.",
    },
    {
      question: "Do you work only with Power BI?",
      answer:
        "No. Power BI is a core focus, but the service can also cover Tableau, Looker, semantic modeling, KPI design, and the data and governance around reporting.",
    },
    generalFaqs[2],
  ],
  "data-strategy-governance": [
    {
      question: "Does a data strategy engagement require a cloud migration?",
      answer:
        "No. The current architecture and operating risks are assessed first. The recommendation may improve ownership, quality, and access without requiring an immediate platform change.",
    },
    {
      question: "Can the work focus on one reporting or AI programme?",
      answer:
        "Yes. Governance and architecture can be scoped around the datasets, metrics, access rules, and workflows that matter to a specific initiative.",
    },
    generalFaqs[2],
  ],
  "website-app-development": [
    {
      question: "Do you build both marketing websites and working web applications?",
      answer:
        "Yes. The scope can cover a clear service website, a conversion-focused landing experience, an internal tool, or an application connected to analytics and AI workflows.",
    },
    {
      question: "Can measurement and enquiry flows be included?",
      answer:
        "Yes. Forms, conversion paths, privacy-aware analytics, and the events needed to evaluate performance can be planned as part of the build.",
    },
    generalFaqs[2],
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
        .slice(0, 3)
    : servicePillarPages
        .filter((item) => item.slug !== service.slug)
        .slice(0, 3);
  const relatedResources = (relatedResourceMap[service.slug] || []).slice(0, 2);
  const proof = relatedProofMap[service.slug];
  const faqItems = serviceSpecificFaqs[service.slug] || (isAiService ? aiFaqs : generalFaqs);
  const startProjectPath = `/start-a-project?service=${encodeURIComponent(service.slug)}`;

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
        <nav
          aria-label="Breadcrumb"
          className="mx-auto mb-8 max-w-7xl px-6 text-sm text-gray-600 md:px-12"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-black hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-gray-400">/</li>
            <li>
              <Link href="/services" className="hover:text-black hover:underline">
                Services
              </Link>
            </li>
            <li aria-hidden="true" className="text-gray-400">/</li>
            <li aria-current="page" className="font-medium text-gray-950">
              {service.shortTitle}
            </li>
          </ol>
        </nav>

        <PublicPageHero
          icon={Icon}
          eyebrow={service.heroEyebrow}
          title={service.heroTitle}
          description={service.heroDescription}
          actions={
            <>
              <Button asChild className="rounded-full bg-black px-8 text-white hover:bg-gray-800">
                <Link href={startProjectPath}>
                  Ask about {service.shortTitle}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {proof ? (
                <Button asChild variant="outline" className="rounded-full border-gray-300 px-8">
                  <Link href={proof.path}>See a relevant result</Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="rounded-full border-gray-300 px-8">
                  <a href="#service-fit">See when this service fits</a>
                </Button>
              )}
            </>
          }
          footer={
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Engagement fit
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                {service.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                      {metric.label}
                    </p>
                    <p className="mt-3 text-base font-medium leading-relaxed text-gray-800">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          }
        />

        <section id="service-fit" className="scroll-mt-28 mx-auto max-w-7xl px-6 md:px-12">
          <ScrollReveal className="max-w-3xl" width="100%">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              When this service fits
            </p>
            <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
              Start here when these problems look familiar.
            </h2>
          </ScrollReveal>

          <div className="mt-10 grid auto-rows-fr gap-6 lg:grid-cols-3">
            {service.useCases.map((useCase, index) => (
              <ScrollReveal key={useCase} delay={index * 0.08} width="100%">
                <article className="h-full rounded-[2rem] border border-gray-200 bg-gray-50 px-6 py-7">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Signal {index + 1}
                  </p>
                  <p className="mt-4 text-base leading-relaxed text-gray-700">
                    {useCase}
                  </p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {proof && (
          <section className="mx-auto mt-16 max-w-7xl px-6 md:px-12">
            <ScrollReveal width="100%">
              <Link href={proof.path} className="group block">
                <article className="grid gap-7 rounded-[2rem] bg-gray-950 px-7 py-9 text-white transition-transform hover:-translate-y-1 md:px-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] lg:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                      Relevant case study
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-gray-400">
                      {proof.label}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-heading tracking-tight md:text-3xl">
                      {proof.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-300">
                      {proof.description}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    Read the case study
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </article>
              </Link>
            </ScrollReveal>
          </section>
        )}

        <section className="mx-auto mt-16 max-w-7xl px-6 md:px-12">
          <ScrollReveal className="max-w-3xl" width="100%">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Expected outcomes
            </p>
            <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
              What {formatInlineServiceName(service.shortTitle)} is designed to improve.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              These are intended engagement outcomes, not performance claims.
              The exact success measures are agreed against the current system,
              users, and business decision before delivery begins.
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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                Concrete deliverables
              </p>
              <h2 className="mt-4 text-3xl font-bold font-heading tracking-tight text-gray-950">
                What the engagement can include
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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
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

        <section className="mx-auto mt-16 max-w-7xl px-6 md:px-12">
          <ScrollReveal className="max-w-3xl" width="100%">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Frequently asked questions
            </p>
            <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
              What teams usually need to know before starting.
            </h2>
          </ScrollReveal>

          <div className="mt-10 grid auto-rows-fr gap-5 lg:grid-cols-3">
            {faqItems.map((item, index) => (
              <ScrollReveal key={item.question} delay={index * 0.06} width="100%">
                <article className="h-full rounded-[2rem] border border-gray-200 bg-gray-50 px-6 py-7">
                  <h3 className="text-lg font-bold leading-snug text-gray-950">
                    {item.question}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-gray-600">
                    {item.answer}
                  </p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {relatedResources.length > 0 && (
          <section className="mx-auto mt-16 max-w-7xl px-6 md:px-12">
            <ScrollReveal className="max-w-3xl" width="100%">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                See the work in context
              </p>
              <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
                Explore a related practical guide.
              </h2>
            </ScrollReveal>

            <div className="mt-8 grid auto-rows-fr gap-5 md:grid-cols-2 lg:grid-cols-3">
              {relatedResources.map((resource, index) => (
                <ScrollReveal key={resource.path} delay={index * 0.05} width="100%">
                  <Link
                    href={resource.path}
                    className="group flex h-full flex-col rounded-[1.5rem] border border-gray-200 bg-gray-50 px-6 py-7 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:shadow-black/[0.04]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                      Practical guide
                    </p>
                    <h3 className="mt-4 flex-1 text-lg font-bold leading-snug text-gray-950">
                      {resource.title}
                    </h3>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-black">
                      Read this guide
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        <section className="mx-auto mt-16 max-w-7xl px-6 md:px-12">
          <ScrollReveal width="100%">
            <div className="rounded-[2rem] border border-gray-200 bg-white px-8 py-10 shadow-xl shadow-black/[0.04] md:px-12">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                Related services
              </p>
              <div className="mt-4 grid gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
                <div>
                  <h2 className="text-3xl font-bold font-heading tracking-tight text-gray-950 md:text-4xl">
                    {isAiService
                      ? "Connect this need to the rest of the AI delivery lifecycle."
                      : "See the adjacent services that may support the same outcome."}
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-gray-600">
                    Each link is a distinct entry point. You do not need to
                    combine services unless the work genuinely crosses those boundaries.
                  </p>
                </div>
                <div className="grid gap-3">
                  {relatedServices.map((related) => (
                    <Link
                      key={related.slug}
                      href={related.path}
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-gray-800 transition-colors hover:border-gray-950 hover:bg-white hover:text-black"
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

        <section className="mx-auto mt-16 max-w-7xl px-6 md:px-12">
          <ScrollReveal width="100%">
            <div className="rounded-[2rem] bg-gray-950 px-8 py-10 text-white shadow-2xl shadow-black/[0.14] md:px-12">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Start with your current situation
              </p>
              <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <h2 className="text-3xl font-bold font-heading tracking-tight md:text-4xl">
                    Tell us what you need {formatInlineServiceName(service.shortTitle)} to improve.
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-gray-300">
                    Share the current workflow, users, available data, and the
                    decision or result that needs to become clearer. The service
                    will be preselected in the enquiry form.
                  </p>
                </div>
                <Button asChild className="rounded-full bg-white px-8 text-black hover:bg-gray-100">
                  <Link href={startProjectPath}>
                    Start a project
                    <ArrowRight className="ml-2 h-4 w-4" />
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
