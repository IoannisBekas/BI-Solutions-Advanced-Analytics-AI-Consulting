import { Link } from "wouter";
import { ArrowDown, ArrowRight, Check, Globe2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import {
  aiCapabilityPages,
  servicePillarPages,
  type ServicePage,
} from "@/lib/servicePages";

const pillarCopy: Record<
  string,
  { number: string; eyebrow: string; promise: string }
> = {
  "business-intelligence-semantic-modeling": {
    number: "01",
    eyebrow: "Business intelligence",
    promise:
      "One governed view of the business—from source data to the decisions people make every day.",
  },
  "advanced-analytics-ai": {
    number: "02",
    eyebrow: "Applied AI",
    promise:
      "AI designed around real work, approved knowledge, measurable quality, and clear human control.",
  },
  "data-strategy-governance": {
    number: "03",
    eyebrow: "Data foundations",
    promise:
      "A reliable path from operational systems to trusted analytics, AI, and accountable ownership.",
  },
  "website-app-development": {
    number: "04",
    eyebrow: "Web applications",
    promise:
      "Fast, focused websites and applications that make an offer clearer or a workflow easier to run.",
  },
  "content-operations-automation": {
    number: "05",
    eyebrow: "Content systems",
    promise:
      "A repeatable operating system for turning expertise into coordinated content, useful assets, and measurable digital products.",
  },
  "data-career-enablement-mentorship": {
    number: "06",
    eyebrow: "Capability development",
    promise:
      "Practical enablement that helps individuals and teams build stronger skills, judgment, adoption, and evidence of progress.",
  },
};

const deliveryFlow = [
  {
    number: "01",
    title: "Diagnostic or roadmap sprint",
    description:
      "Clarify the current state, priority decisions, delivery risks, and the most valuable next move.",
    need: "advisory-sprint",
  },
  {
    number: "02",
    title: "Implementation project",
    description:
      "Design, build, validate, and hand over a complete solution around a defined operational outcome.",
    need: "project-implementation",
  },
  {
    number: "03",
    title: "Fractional data and AI leadership",
    description:
      "Add senior direction for roadmaps, architecture, vendors, governance, investment, and executive decisions.",
    need: "fractional-leadership",
  },
  {
    number: "04",
    title: "Managed operations and support",
    description:
      "Keep dashboards, data workflows, and AI systems reliable through monitoring, releases, support, and optimization.",
    need: "managed-operations",
  },
  {
    number: "05",
    title: "Team enablement or mentorship",
    description:
      "Build lasting capability through role-based workshops, office hours, practical training, or one-to-one guidance.",
    need: "team-enablement",
  },
];

const listedServices = [...servicePillarPages, ...aiCapabilityPages];

const servicesStructuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "BI Solutions Group services",
  itemListElement: listedServices.map((service, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Service",
      "@id": `https://www.bisolutions.group/services#${service.slug}`,
      name: service.title,
      url: `https://www.bisolutions.group/services#${service.slug}`,
      provider: {
        "@id": "https://www.bisolutions.group/#organization",
      },
    },
  })),
};

function ServiceChapter({ service }: { service: ServicePage }) {
  const copy = pillarCopy[service.slug];
  const Icon = service.icon;

  return (
    <section
      id={service.slug}
      className="scroll-mt-28 border-t border-gray-950/15 py-20 md:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:px-12 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-20">
        <ScrollReveal width="100%">
          <div className="lg:sticky lg:top-32">
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs tracking-[0.2em] text-gray-500">
                {copy.number} / 06
              </span>
              <span className="h-px flex-1 bg-gray-950/15" />
            </div>
            <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-full border border-gray-950/20">
              <Icon aria-hidden="true" className="h-5 w-5" />
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
              {copy.eyebrow}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal width="100%">
          <div>
            <h2 className="max-w-4xl text-4xl font-bold font-heading tracking-[-0.045em] text-gray-950 sm:text-5xl md:text-6xl">
              {service.title}
            </h2>
            <p className="mt-7 max-w-4xl text-2xl leading-snug tracking-tight text-gray-800 md:text-3xl">
              {copy.promise}
            </p>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-gray-600">
              {service.description}
            </p>

            <div className="mt-12 grid gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  What we can deliver
                </p>
                <ol className="mt-5 divide-y divide-gray-950/15 border-y border-gray-950/15">
                  {service.items.map((item, index) => (
                    <li
                      key={item}
                      className="grid grid-cols-[2.25rem_1fr] gap-4 py-5 text-base leading-relaxed text-gray-700"
                    >
                      <span className="font-mono text-xs text-gray-400">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="border-l border-gray-950/15 pl-6 md:pl-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  What should improve
                </p>
                <ul className="mt-5 space-y-5">
                  {service.outcomes.slice(0, 3).map((outcome) => (
                    <li
                      key={outcome}
                      className="flex gap-3 text-sm leading-relaxed text-gray-700"
                    >
                      <Check
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0"
                      />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>

                {service.techStack && (
                  <div className="mt-9">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Typical stack
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {service.techStack.map((technology) => (
                        <li
                          key={technology}
                          className="rounded-full border border-gray-950/15 px-3 py-1.5 text-xs font-medium text-gray-700"
                        >
                          {technology}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link
                  href={`/start-a-project?source=services&service=${service.slug}`}
                  className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-gray-950 underline decoration-gray-400 underline-offset-4"
                >
                  {service.slug === "data-career-enablement-mentorship"
                    ? "Discuss mentorship"
                    : "Discuss this service"}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function AiChapter({ service }: { service: ServicePage }) {
  const Icon = service.icon;

  return (
    <section
      id={service.slug}
      className="scroll-mt-28 border-t border-gray-950/15 py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <ScrollReveal width="100%">
          <div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-20">
            <div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs tracking-[0.2em] text-gray-500">
                  02 / 06
                </span>
                <span className="h-px flex-1 bg-gray-950/15" />
              </div>
              <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-full border border-gray-950/20">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                Applied AI
              </p>
            </div>

            <div>
              <h2 className="max-w-4xl text-4xl font-bold font-heading tracking-[-0.045em] text-gray-950 sm:text-5xl md:text-6xl">
                {service.title}
              </h2>
              <p className="mt-7 max-w-4xl text-2xl leading-snug tracking-tight text-gray-800 md:text-3xl">
                {pillarCopy[service.slug].promise}
              </p>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-gray-600">
                {service.description}
              </p>
            </div>
          </div>
        </ScrollReveal>

        <div className="mt-16 border-y border-gray-950/15">
          {aiCapabilityPages.map((capability, index) => {
            const CapabilityIcon = capability.icon;

            return (
              <ScrollReveal key={capability.slug} width="100%">
                <article
                  id={capability.slug}
                  className="scroll-mt-28 grid gap-5 border-b border-gray-950/15 py-7 last:border-b-0 md:grid-cols-[3rem_3rem_minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-start md:gap-7"
                >
                  <span className="font-mono text-xs text-gray-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <CapabilityIcon
                    aria-hidden="true"
                    className="h-5 w-5 text-gray-500"
                  />
                  <h3 className="text-xl font-bold font-heading tracking-tight text-gray-950 md:text-2xl">
                    {capability.navLabel}
                  </h3>
                  <div>
                    <p className="text-base leading-relaxed text-gray-600">
                      {capability.description}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-700">
                      {capability.items.slice(0, 2).map((item) => (
                        <li key={item} className="flex gap-2">
                          <span aria-hidden="true" className="text-gray-400">
                            —
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal width="100%">
          <div className="mt-12 grid gap-8 border border-gray-950/15 p-6 md:grid-cols-[1fr_auto] md:items-end md:p-8">
            <div>
              <div className="flex items-center gap-3 text-gray-500">
                <Globe2 aria-hidden="true" className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                  International delivery
                </p>
              </div>
              <h3 className="mt-4 text-2xl font-bold font-heading tracking-tight text-gray-950">
                AI consulting for organizations worldwide
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600">
                Senior-led delivery for international organizations, adapted to
                their operating environment, governance requirements, and
                adoption realities.
              </p>
            </div>
            <Button
              asChild
              className="rounded-full bg-gray-950 px-6 text-white hover:bg-gray-800"
            >
              <Link href="/start-a-project?source=services&service=advanced-analytics-ai">
                Discuss an AI project
                <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default function Services() {
  const [
    businessIntelligence,
    ai,
    dataStrategy,
    webDevelopment,
    contentOperations,
    careerMentorship,
  ] = servicePillarPages;

  return (
    <div className="min-h-screen bg-[#f3f0ea] font-sans text-foreground">
      <Seo
        title="Analytics, AI, Data, Digital Products & Enablement Services"
        description="Explore BI Solutions Group services for business intelligence, Power BI, AI, data and cloud foundations, web applications, content operations, digital products, managed support, fractional leadership, training, and mentorship."
        path="/services"
        structuredData={servicesStructuredData}
      />
      <Navbar />

      <main className="pt-28">
        <section className="mx-auto max-w-[96rem] px-4 md:px-8">
          <div className="overflow-hidden rounded-[2rem] bg-[#0a0b0d] px-6 pb-8 pt-14 text-white md:rounded-[3rem] md:px-12 md:pb-12 md:pt-20 lg:px-16">
            <ScrollReveal width="100%">
              <div className="grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)] lg:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
                    The complete service atlas
                  </p>
                  <h1 className="mt-6 max-w-5xl text-5xl font-bold font-heading leading-[0.92] tracking-[-0.055em] sm:text-6xl md:text-7xl lg:text-[6.5rem]">
                    One partner for better data systems, decisions, and careers.
                  </h1>
                </div>
                <div className="max-w-xl lg:pb-2">
                  <p className="text-lg leading-relaxed text-white/65 md:text-xl">
                    Business intelligence, applied AI, data foundations, web
                    applications, content operations, digital products, and
                    enablement—presented in one place and shaped around
                    practical progress.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Button
                      asChild
                      className="rounded-full bg-white px-7 text-black hover:bg-white/90"
                    >
                      <Link href="/start-a-project?source=services">
                        Start a project
                        <ArrowRight
                          aria-hidden="true"
                          className="ml-2 h-4 w-4"
                        />
                      </Link>
                    </Button>
                    <a
                      href="#service-index"
                      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                    >
                      See every service
                      <ArrowDown aria-hidden="true" className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <nav
              id="service-index"
              aria-label="Services on this page"
              className="mt-16 grid scroll-mt-28 border-t border-white/15 sm:grid-cols-2 xl:grid-cols-6"
            >
              {servicePillarPages.map((service, index) => (
                <a
                  key={service.slug}
                  href={`#${service.slug}`}
                  className="group flex items-center justify-between gap-5 border-b border-white/15 py-5 text-sm font-semibold text-white/75 transition-colors hover:text-white sm:px-5 sm:first:pl-0 xl:border-b-0 xl:border-r xl:last:border-r-0"
                >
                  <span>
                    <span className="mr-3 font-mono text-xs text-white/30">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {service.shortTitle}
                  </span>
                  <ArrowDown
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform group-hover:translate-y-1"
                  />
                </a>
              ))}
            </nav>
          </div>
        </section>

        <div className="mt-16 md:mt-24">
          {businessIntelligence && (
            <ServiceChapter service={businessIntelligence} />
          )}
          {ai && <AiChapter service={ai} />}
          {dataStrategy && <ServiceChapter service={dataStrategy} />}
          {webDevelopment && <ServiceChapter service={webDevelopment} />}
          {contentOperations && <ServiceChapter service={contentOperations} />}
          {careerMentorship && <ServiceChapter service={careerMentorship} />}
        </div>

        <section
          id="ways-to-work-together"
          className="scroll-mt-24 bg-[#f3f0ea] py-20 md:py-28"
        >
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <ScrollReveal width="100%">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                Ways to work together
              </p>
              <h2 className="mt-5 max-w-4xl text-4xl font-bold font-heading tracking-[-0.045em] text-gray-950 md:text-6xl">
                Choose the level of support the work actually needs.
              </h2>
            </ScrollReveal>
            <div className="mt-12 grid border-y border-gray-950/15 md:grid-cols-2 xl:grid-cols-5">
              {deliveryFlow.map((item) => (
                <ScrollReveal key={item.number} width="100%">
                  <article className="flex h-full flex-col border-b border-gray-950/15 py-8 md:px-6 xl:min-h-80 xl:border-b-0 xl:border-r xl:first:pl-0 xl:last:border-r-0">
                    <p className="font-mono text-xs text-gray-400">
                      {item.number}
                    </p>
                    <h3 className="mt-8 text-2xl font-bold font-heading tracking-tight text-gray-950">
                      {item.title}
                    </h3>
                    <p className="mt-4 max-w-sm text-base leading-relaxed text-gray-600">
                      {item.description}
                    </p>
                    <Link
                      href={`/start-a-project?source=services-engagement&need=${item.need}`}
                      className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-950 underline decoration-gray-400 underline-offset-4 xl:mt-auto"
                    >
                      Discuss this option
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#0a0b0d] py-20 text-white md:py-24">
          <ScrollReveal width="100%">
            <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 md:px-12 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-4xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                  Not sure where your need belongs?
                </p>
                <h2 className="mt-5 text-4xl font-bold font-heading tracking-[-0.045em] text-white md:text-6xl">
                  Tell us what should become clearer, faster, stronger, or
                  easier to use.
                </h2>
              </div>
              <Button
                asChild
                className="shrink-0 rounded-full bg-white px-8 text-black hover:bg-white/90"
              >
                <Link href="/start-a-project?source=services-final">
                  Start a project
                  <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </section>
      </main>
      <Footer />
    </div>
  );
}
