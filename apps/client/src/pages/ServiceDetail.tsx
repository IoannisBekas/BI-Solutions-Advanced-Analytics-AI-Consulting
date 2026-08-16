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
  const techStack = service.techStack ?? [];
  const fitLabels = ["Decision friction", "Operating constraint", "Scale blocker"];

  return (
    <div data-hero-overlay className="min-h-screen bg-[#f3f0ea] font-sans text-foreground">
      <Seo
        title={service.seoTitle}
        description={service.seoDescription}
        path={service.path}
        keywords={service.keywords}
        structuredData={buildStructuredData(service)}
      />
      <Navbar />

      <main className="pb-20">
        <section className="relative isolate overflow-hidden bg-[#050609] pt-28 text-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
              maskImage: "linear-gradient(to bottom, black, transparent 85%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute -right-32 top-20 h-[32rem] w-[32rem] rounded-full bg-white/[0.08] blur-[120px]"
          />

          <div className="relative mx-auto max-w-7xl px-6 md:px-12">
            <nav aria-label="Breadcrumb" className="border-b border-white/10 py-6 text-sm text-white/55">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="transition-colors hover:text-white">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true" className="text-white/25">/</li>
                <li>
                  <Link href="/services" className="transition-colors hover:text-white">
                    Services
                  </Link>
                </li>
                <li aria-hidden="true" className="text-white/25">/</li>
                <li aria-current="page" className="font-medium text-white">
                  {service.shortTitle}
                </li>
              </ol>
            </nav>

            <div className="grid gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:items-end">
              <ScrollReveal width="100%">
                <div>
                  <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    {service.heroEyebrow}
                  </div>
                  <h1 className="mt-7 max-w-5xl font-heading text-[clamp(3.2rem,7vw,6.8rem)] font-bold leading-[0.91] tracking-[-0.055em] text-[#f4f1eb]">
                    {service.heroTitle}
                  </h1>
                  <p className="mt-8 max-w-3xl text-lg leading-relaxed text-white/65 md:text-xl">
                    {service.heroDescription}
                  </p>

                  {techStack.length > 0 && (
                    <div className="mt-8 flex flex-wrap gap-2" aria-label="Technology stack">
                      {techStack.map((technology) => (
                        <span
                          key={technology}
                          className="rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white/75 backdrop-blur-sm"
                        >
                          {technology}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button asChild className="h-12 rounded-full bg-[#f4f1eb] px-7 text-black hover:bg-white">
                      <Link href={startProjectPath}>
                        Discuss this service
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    {proof ? (
                      <Button
                        asChild
                        variant="outline"
                        className="h-12 rounded-full border-white/20 bg-transparent px-7 text-white hover:bg-white/10 hover:text-white"
                      >
                        <Link href={proof.path}>See a relevant result</Link>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant="outline"
                        className="h-12 rounded-full border-white/20 bg-transparent px-7 text-white hover:bg-white/10 hover:text-white"
                      >
                        <a href="#service-fit">See when this service fits</a>
                      </Button>
                    )}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal width="100%" delay={0.08}>
                <div className="grid overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] backdrop-blur-md">
                  {service.metrics.map((metric, index) => (
                    <div
                      key={metric.label}
                      className={`px-6 py-6 ${index > 0 ? "border-t border-white/10" : ""}`}
                    >
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/40">
                        {metric.label}
                      </p>
                      <p className="mt-2 text-base font-medium leading-relaxed text-white/85">
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section id="service-fit" className="scroll-mt-28 bg-[#f3f0ea] py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <ScrollReveal className="max-w-3xl" width="100%">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                Where the pressure appears
              </p>
              <h2 className="mt-4 font-heading text-4xl font-bold tracking-[-0.04em] text-gray-950 md:text-6xl">
                Start where the operating friction is real.
              </h2>
            </ScrollReveal>

            <div className="mt-12 grid auto-rows-fr gap-5 lg:grid-cols-3">
              {service.useCases.map((useCase, index) => (
                <ScrollReveal key={useCase} delay={index * 0.08} width="100%">
                  <article
                    className={`flex h-full min-h-72 flex-col justify-between rounded-[2rem] border p-7 md:p-8 ${
                      index === 0
                        ? "border-black bg-[#090b0f] text-white shadow-2xl shadow-black/10"
                        : "border-black/10 bg-[#faf9f6] text-gray-950"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${index === 0 ? "text-white/45" : "text-gray-500"}`}>
                        {fitLabels[index] ?? "Delivery barrier"}
                      </p>
                      <span className={`font-mono text-xs ${index === 0 ? "text-white/40" : "text-gray-400"}`}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p className={`mt-12 text-xl font-medium leading-snug ${index === 0 ? "text-white/90" : "text-gray-800"}`}>
                      {useCase}
                    </p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {proof && (
          <section className="mx-auto mt-20 max-w-7xl px-6 md:px-12">
            <ScrollReveal width="100%">
              <Link href={proof.path} className="group block">
                <article className="grid gap-7 overflow-hidden rounded-[2rem] border border-black/10 bg-[#d9d5cc] px-7 py-9 text-gray-950 transition-transform hover:-translate-y-1 md:px-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_auto] lg:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                      Relevant case study
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-gray-600">
                      {proof.label}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-heading tracking-tight md:text-3xl">
                      {proof.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-700">
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

        <section className="mt-24 bg-[#07090d] py-20 text-white md:py-28">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-20">
              <ScrollReveal width="100%">
                <div className="lg:sticky lg:top-32">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
                    Expected outcomes
                  </p>
                  <h2 className="mt-4 font-heading text-4xl font-bold tracking-[-0.04em] text-[#f4f1eb] md:text-6xl">
                    Make the system easier to trust, use, and improve.
                  </h2>
                  <p className="mt-5 text-base leading-relaxed text-white/55">
                    Success measures are agreed against the current system, users, and business decision before delivery begins.
                  </p>
                </div>
              </ScrollReveal>

              <div className="grid auto-rows-fr gap-4 md:grid-cols-2">
                {service.outcomes.map((outcome, index) => (
                  <ScrollReveal key={outcome} delay={index * 0.06} width="100%">
                    <article className="h-full rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <CheckCircle2 className="h-5 w-5 text-white/70" aria-hidden="true" />
                        <span className="font-mono text-xs text-white/25">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="mt-8 text-base leading-relaxed text-white/75">
                        {outcome}
                      </p>
                    </article>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {techStack.length > 0 && (
          <section className="mx-auto mt-20 max-w-7xl px-6 md:px-12">
            <ScrollReveal width="100%">
              <div className="grid gap-8 rounded-[2rem] border border-black/10 bg-[#e5e1d9] p-8 md:p-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                    Technology choices
                  </p>
                  <h2 className="mt-3 font-heading text-3xl font-bold tracking-[-0.035em] text-gray-950 md:text-4xl">
                    The stack follows the operating problem.
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {techStack.map((technology) => (
                    <span
                      key={technology}
                      className="rounded-full border border-black/10 bg-[#faf9f6] px-4 py-2 text-sm font-semibold text-gray-800"
                    >
                      {technology}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </section>
        )}

        <section className="mx-auto mt-20 grid max-w-7xl gap-6 px-6 md:px-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <ScrollReveal width="100%">
            <div className="h-full rounded-[2rem] border border-black/10 bg-[#faf9f6] p-8 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                Concrete deliverables
              </p>
              <h2 className="mt-4 font-heading text-3xl font-bold tracking-[-0.035em] text-gray-950 md:text-4xl">
                What moves from idea to delivered system
              </h2>
              <ul className="mt-6 space-y-4">
                {service.items.map((item) => (
                  <li key={item} className="flex gap-3 border-t border-black/10 pt-4 text-sm leading-relaxed text-gray-700 first:border-t-0 first:pt-0">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal width="100%" delay={0.08}>
            <div className="h-full rounded-[2rem] bg-[#0a0c10] p-8 text-white shadow-2xl shadow-black/10 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
                Delivery approach
              </p>
              <h2 className="mt-4 font-heading text-3xl font-bold tracking-[-0.035em] text-[#f4f1eb] md:text-4xl">
                A controlled route from diagnosis to handoff
              </h2>
              <div className="mt-6 space-y-5">
                {service.delivery.map((item, index) => (
                  <div key={item} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-white/10 pt-5 first:border-t-0 first:pt-0">
                    <div className="font-mono text-sm font-semibold text-white/40">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <p className="text-sm leading-relaxed text-white/70">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>

        <section className="mx-auto mt-24 max-w-7xl px-6 md:px-12">
          <ScrollReveal className="max-w-3xl" width="100%">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
              Frequently asked questions
            </p>
            <h2 className="mt-4 font-heading text-4xl font-bold tracking-[-0.04em] text-gray-950 md:text-6xl">
              Clear answers before the work begins.
            </h2>
          </ScrollReveal>

          <div className="mt-10 grid auto-rows-fr gap-4 lg:grid-cols-3">
            {faqItems.map((item, index) => (
              <ScrollReveal key={item.question} delay={index * 0.06} width="100%">
                <article className="h-full rounded-[1.75rem] border border-black/10 bg-[#faf9f6] px-6 py-7">
                  <p className="font-mono text-xs text-gray-400">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-6 text-lg font-bold leading-snug text-gray-950">
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
          <section className="mx-auto mt-20 max-w-7xl px-6 md:px-12">
            <ScrollReveal className="max-w-3xl" width="100%">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                See the work in context
              </p>
              <h2 className="mt-4 font-heading text-4xl font-bold tracking-[-0.04em] text-gray-950 md:text-5xl">
                Explore a related practical guide.
              </h2>
            </ScrollReveal>

            <div className="mt-8 grid auto-rows-fr gap-5 md:grid-cols-2 lg:grid-cols-3">
              {relatedResources.map((resource, index) => (
                <ScrollReveal key={resource.path} delay={index * 0.05} width="100%">
                  <Link
                    href={resource.path}
                    className="group flex h-full flex-col rounded-[1.5rem] border border-black/10 bg-[#faf9f6] px-6 py-7 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:shadow-black/[0.04]"
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

        <section className="mx-auto mt-20 max-w-7xl px-6 md:px-12">
          <ScrollReveal width="100%">
            <div className="rounded-[2rem] border border-black/10 bg-[#faf9f6] px-8 py-10 md:px-12">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
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

        <section className="mx-auto mt-20 max-w-7xl px-6 md:px-12">
          <ScrollReveal width="100%">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#07090d] px-8 py-12 text-white shadow-2xl shadow-black/[0.14] md:px-12">
              <div aria-hidden="true" className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-white/[0.08] blur-3xl" />
              <p className="relative text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
                Start with your current situation
              </p>
              <div className="relative mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <h2 className="font-heading text-3xl font-bold tracking-[-0.035em] md:text-5xl">
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
                    Discuss your project
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
