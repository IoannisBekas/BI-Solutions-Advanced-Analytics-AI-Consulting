import { Link } from "wouter";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import { PublicPageHero } from "@/components/sections/PublicPageHero";
import {
  aiCapabilityPages,
  aiLocationPages,
  servicePillarPages,
} from "@/lib/servicePages";

const serviceHighlights = [
  {
    label: "A useful starting point",
    value: "A reporting problem, repeated workflow, data gap, or product idea",
  },
  {
    label: "Ways to work together",
    value: "A diagnostic, focused build, or broader delivery engagement",
  },
  {
    label: "What you keep",
    value: "A working system, clear documentation, and a practical handoff",
  },
];

const serviceNeedContent: Record<
  string,
  {
    need: string;
    heading: string;
    description: string;
    cta: string;
  }
> = {
  "business-intelligence-semantic-modeling": {
    need: "Build trusted reporting",
    heading: "Business intelligence & Power BI",
    description:
      "Bring dashboards, KPIs, and reporting models into one maintainable decision system.",
    cta: "Explore BI & Power BI",
  },
  "advanced-analytics-ai": {
    need: "Automate or improve a workflow",
    heading: "AI consulting & automation",
    description:
      "Choose a valuable use case, build the workflow, and put the right review and operating controls around it.",
    cta: "Explore AI consulting",
  },
  "data-strategy-governance": {
    need: "Fix the data foundation",
    heading: "Data strategy & cloud",
    description:
      "Clarify architecture, quality, ownership, access, and governance before reporting or AI scales further.",
    cta: "Explore data strategy",
  },
  "website-app-development": {
    need: "Build a focused digital product",
    heading: "Websites & web apps",
    description:
      "Turn an offer or workflow into a responsive website, internal tool, or measurable web application.",
    cta: "Explore websites & web apps",
  },
};

const aiLifecycleGroups = [
  {
    stage: "Plan",
    description: "Choose feasible use cases and define the roadmap.",
    slugs: ["ai-strategy-readiness"],
  },
  {
    stage: "Build",
    description: "Create the workflow, assistant, or analytical model.",
    slugs: [
      "ai-automation-consulting",
      "generative-ai-llm-consulting",
      "predictive-analytics-machine-learning",
    ],
  },
  {
    stage: "Control",
    description: "Set ownership, review rules, and adoption guidance.",
    slugs: ["ai-governance-literacy-adoption"],
  },
  {
    stage: "Operate",
    description: "Monitor performance, changes, and production reliability.",
    slugs: ["mlops-model-monitoring"],
  },
  {
    stage: "Connect to BI",
    description: "Ground AI assistance in governed metrics and reporting.",
    slugs: ["ai-business-intelligence"],
  },
];

const proofItems = [
  {
    title: "UNICEF audit compliance analysis",
    description:
      "A dashboard concept that organizes audit themes, risk signals, and country-level detail for structured review.",
    path: "/case-studies/unicef-audit-compliance",
    service: "Business intelligence & data",
  },
  {
    title: "IAEA scientific analysis",
    description:
      "An analytical experience for exploring a complex international laboratory network and its operating context.",
    path: "/case-studies/iaea-scientific-analysis",
    service: "Business intelligence & analytics",
  },
  {
    title: "IFC talent strategy analysis",
    description:
      "A people-analytics dashboard concept that turns workforce information into a clearer management view.",
    path: "/case-studies/ifc-talent-strategy",
    service: "Business intelligence",
  },
];

const deliveryFlow = [
  {
    step: "01",
    title: "Diagnose",
    description:
      "Clarify the business decision, users, data, constraints, and what a useful result needs to change.",
  },
  {
    step: "02",
    title: "Build",
    description:
      "Design, test, and deliver the dashboard, workflow, data system, or application with the people who will use it.",
  },
  {
    step: "03",
    title: "Enable",
    description:
      "Document the result, transfer knowledge, and agree on the support needed after launch.",
  },
];

const engagementOptions = [
  {
    title: "Diagnostic & roadmap",
    description:
      "Best when the problem is clear but priorities, architecture, or the next investment decision are not.",
  },
  {
    title: "Focused build or pilot",
    description:
      "Best for a defined dashboard, automation, data improvement, website, or web-app workflow.",
  },
  {
    title: "Delivery & enablement",
    description:
      "Best when the work needs implementation, stakeholder adoption, documentation, and a dependable handoff.",
  },
];

const faqItems = [
  {
    question: "What if we are not sure which service fits?",
    answer:
      "Start with the business bottleneck rather than a technical label. The first conversation can identify whether the next useful step is a diagnostic, a focused build, or a broader delivery plan.",
  },
  {
    question: "Can you work with our current tools and data?",
    answer:
      "Yes. The existing stack, data quality, access constraints, and team capacity are assessed before recommending replacement or new technology.",
  },
  {
    question: "Do engagements include handoff and documentation?",
    answer:
      "Yes. The delivery plan defines ownership, documentation, user guidance, and any ongoing support needed to keep the result usable after launch.",
  },
];

const listedServicePages = [
  ...servicePillarPages,
  ...aiCapabilityPages,
  ...aiLocationPages,
];

const servicesStructuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "BI Solutions Group services",
  itemListElement: listedServicePages.map((service, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Service",
      "@id": `https://www.bisolutions.group${service.path}#service`,
      name: service.title,
      url: `https://www.bisolutions.group${service.path}`,
      provider: {
        "@id": "https://www.bisolutions.group/#organization",
      },
    },
  })),
};

export default function Services() {
  const aiLocationPage = aiLocationPages[0];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Seo
        title="Analytics, AI, and Data Services"
        description="Explore BI Solutions services across AI strategy, automation, generative AI, predictive analytics, governance, business intelligence, data strategy, and web apps."
        path="/services"
        structuredData={servicesStructuredData}
      />
      <Navbar />

      <main className="pt-32 pb-20">
        <PublicPageHero
          icon={Sparkles}
          eyebrow="Business intelligence, AI, data, and web delivery"
          title="Turn reporting friction, manual work, and product ideas into systems your team can use."
          description="BI Solutions Group helps businesses in Greece and Europe move from a specific operating problem to a working dashboard, AI workflow, data foundation, website, or web application—then documents and hands it over clearly."
          actions={
            <>
              <Button asChild className="rounded-full bg-black px-8 text-white hover:bg-gray-800">
                <Link href="/start-a-project?source=services">
                  Start a project
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-gray-300 px-8">
                <a href="#choose-a-service">Choose a service</a>
              </Button>
            </>
          }
          footer={
            <div className="grid gap-4 md:grid-cols-3">
              {serviceHighlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    {item.label}
                  </p>
                  <p className="mt-3 text-base font-medium leading-relaxed text-gray-800">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          }
        />

        <section id="choose-a-service" className="scroll-mt-28 mx-auto max-w-7xl px-6 md:px-12">
          <ScrollReveal className="max-w-3xl" width="100%">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Choose by need
            </p>
            <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
              What are you trying to improve?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              You do not need to diagnose the technology first. Start with the
              business outcome or operating problem that needs attention.
            </p>
          </ScrollReveal>

          <div className="mt-10 grid auto-rows-fr gap-5 md:grid-cols-2 xl:grid-cols-4">
            {servicePillarPages.map((service, index) => {
              const content = serviceNeedContent[service.slug];

              return (
                <ScrollReveal key={service.slug} delay={index * 0.05} width="100%">
                  <Link href={service.path} className="group block h-full">
                    <article className="flex h-full flex-col rounded-[1.5rem] border border-gray-200 bg-gray-50 px-6 py-6 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-black/[0.04]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                        {content.need}
                      </p>
                      <h3 className="mt-4 text-xl font-bold font-heading tracking-tight text-gray-950">
                        {content.heading}
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">
                        {content.description}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-black">
                        {content.cta}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </article>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-7xl px-6 md:px-12">
          <ScrollReveal className="max-w-3xl" width="100%">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Four service areas
            </p>
            <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
              Focused engagements that can connect when the work requires it.
            </h2>
          </ScrollReveal>

          <div className="mt-10 grid auto-rows-fr gap-6 md:grid-cols-2">
            {servicePillarPages.map((service, index) => {
              const Icon = service.icon;
              const content = serviceNeedContent[service.slug];

              return (
                <ScrollReveal key={service.slug} delay={index * 0.06} width="100%">
                  <article className="flex h-full flex-col rounded-[2rem] border border-gray-200 bg-white p-6 shadow-xl shadow-black/[0.04]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white shadow-lg shadow-black/10">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-2xl font-bold font-heading tracking-tight text-gray-950">
                      {content.heading}
                    </h3>
                    <p className="mt-4 text-base leading-relaxed text-gray-600">
                      {service.description}
                    </p>
                    <ul className="mt-6 flex-1 space-y-3">
                      {service.items.slice(0, 4).map((item) => (
                        <li key={item} className="flex gap-3 text-sm leading-relaxed text-gray-600">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      variant="outline"
                      className="mt-7 rounded-full border-gray-300 px-5"
                    >
                      <Link href={service.path}>
                        {content.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-7xl px-6 md:px-12">
          <ScrollReveal className="max-w-3xl" width="100%">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              AI consulting lifecycle
            </p>
            <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
              Find the right AI entry point for the stage you are in.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              Start with the broader AI consulting service when the scope is
              still forming, or use the lifecycle below when the immediate need
              is already clear.
            </p>
            <Link
              href="/services/advanced-analytics-ai"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-black"
            >
              Explore AI consulting & automation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </ScrollReveal>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {aiLifecycleGroups.map((group, index) => {
              const services = group.slugs
                .map((slug) => aiCapabilityPages.find((service) => service.slug === slug))
                .filter((service) => Boolean(service));

              return (
                <ScrollReveal key={group.stage} delay={index * 0.05} width="100%">
                  <article className="h-full rounded-[1.5rem] border border-gray-200 bg-gray-50 px-5 py-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-3 text-xl font-bold font-heading text-gray-950">
                      {group.stage}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">
                      {group.description}
                    </p>
                    <div className="mt-5 space-y-3">
                      {services.map((service) => service && (
                        <Link
                          key={service.slug}
                          href={service.path}
                          className="group/link flex items-start justify-between gap-3 border-t border-gray-200 pt-3 text-sm font-medium leading-snug text-gray-800 hover:text-black"
                        >
                          <span>{service.navLabel}</span>
                          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 transition-transform group-hover/link:translate-x-1" />
                        </Link>
                      ))}
                    </div>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>

          {aiLocationPage && (
            <p className="mt-6 text-sm leading-relaxed text-gray-600">
              Working in the Greek market? See the context-specific guidance on{" "}
              <Link
                href={aiLocationPage.path}
                className="font-semibold text-gray-950 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-950"
              >
                AI consulting for organizations in Greece
              </Link>
              .
            </p>
          )}
        </section>

        <section className="mt-20 bg-gray-950 py-20 text-white">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <ScrollReveal className="max-w-3xl" width="100%">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Relevant evidence
              </p>
              <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight md:text-5xl">
                See how complex information can become a clearer decision surface.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-gray-300">
                These are independent portfolio analyses using synthetic or
                representative demonstration data. Each case explains the
                context, approach, and delivered analytical experience without
                implying a client relationship.
              </p>
            </ScrollReveal>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {proofItems.map((item, index) => (
                <ScrollReveal key={item.path} delay={index * 0.06} width="100%">
                  <Link href={item.path} className="group block h-full">
                    <article className="flex h-full flex-col rounded-[1.5rem] border border-white/10 bg-white/5 px-6 py-7 transition-colors hover:bg-white hover:text-gray-950">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 group-hover:text-gray-500">
                        Independent portfolio analysis
                      </p>
                      <h3 className="mt-4 text-xl font-bold font-heading">
                        {item.title}
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-300 group-hover:text-gray-600">
                        {item.description}
                      </p>
                      <div className="mt-5 flex items-center justify-between gap-4 text-sm font-semibold">
                        <span>{item.service}</span>
                        <span className="inline-flex items-center gap-2">
                          Read the case study
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </article>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-7xl px-6 md:px-12">
          <ScrollReveal className="max-w-3xl" width="100%">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              How engagements work
            </p>
            <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
              From a specific problem to a usable, maintainable result.
            </h2>
          </ScrollReveal>

          <div className="mt-10 grid auto-rows-fr gap-6 lg:grid-cols-3">
            {deliveryFlow.map((item, index) => (
              <ScrollReveal key={item.step} delay={index * 0.08} width="100%">
                <div className="h-full rounded-[2rem] border border-gray-200 bg-gray-50 px-6 py-7">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-500">
                    {item.step}
                  </p>
                  <h3 className="mt-4 text-2xl font-bold font-heading tracking-tight text-gray-950">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-gray-600">
                    {item.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-20 grid max-w-7xl gap-8 px-6 md:px-12 lg:grid-cols-2">
          <ScrollReveal width="100%">
            <div className="h-full rounded-[2rem] border border-gray-200 bg-white p-7 shadow-xl shadow-black/[0.04] md:p-9">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                Engagement options
              </p>
              <h2 className="mt-4 text-3xl font-bold font-heading tracking-tight text-gray-950">
                Choose the smallest useful shape of work.
              </h2>
              <div className="mt-7 space-y-6">
                {engagementOptions.map((option) => (
                  <div key={option.title} className="border-t border-gray-200 pt-5 first:border-0 first:pt-0">
                    <h3 className="text-lg font-bold text-gray-950">{option.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {option.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal width="100%" delay={0.08}>
            <div className="h-full rounded-[2rem] border border-gray-200 bg-gray-50 p-7 md:p-9">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                Before you enquire
              </p>
              <h2 className="mt-4 text-3xl font-bold font-heading tracking-tight text-gray-950">
                Common questions
              </h2>
              <div className="mt-7 space-y-6">
                {faqItems.map((item) => (
                  <div key={item.question} className="border-t border-gray-200 pt-5 first:border-0 first:pt-0">
                    <h3 className="text-base font-bold text-gray-950">{item.question}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>

        <section className="mx-auto mt-20 max-w-7xl px-6 md:px-12">
          <ScrollReveal width="100%">
            <div className="rounded-[2rem] bg-gray-950 px-8 py-10 text-white shadow-2xl shadow-black/[0.14] md:px-12">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Start with the problem
              </p>
              <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <h2 className="text-3xl font-bold font-heading tracking-tight md:text-4xl">
                    Tell us what needs to become clearer, faster, or easier to use.
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-gray-300">
                    Share the reporting bottleneck, repeated workflow, data
                    challenge, or digital product idea. The enquiry form will
                    help route it to the right service.
                  </p>
                </div>
                <Button asChild className="rounded-full bg-white px-8 text-black hover:bg-gray-100">
                  <Link href="/start-a-project?source=services">
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
