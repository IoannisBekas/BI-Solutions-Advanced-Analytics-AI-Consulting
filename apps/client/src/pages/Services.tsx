import { Link } from "wouter";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Cloud,
  GitBranch,
  GraduationCap,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import { PublicPageHero } from "@/components/sections/PublicPageHero";

const serviceHighlights = [
  {
    label: "Delivery modes",
    value: "Advisory, build, and retained support",
  },
  {
    label: "Core coverage",
    value: "Cloud, BI, AI, analytics, and product delivery",
  },
  {
    label: "Working style",
    value: "Strategy, implementation, and enablement in one team",
  },
];

const servicesList = [
  {
    icon: Cloud,
    title: "Digital transformation and cloud migration",
    description:
      "Modernize data foundations, migrate reporting stacks, and design cloud-native architecture that can scale beyond one-off dashboard work.",
    items: [
      "Azure, AWS, and GCP migration planning",
      "Snowflake, BigQuery, and Databricks delivery",
      "Data platform architecture and environment design",
      "Operational reporting modernization",
    ],
  },
  {
    icon: BrainCircuit,
    title: "Advanced analytics and AI",
    description:
      "Build predictive, analytical, and AI-assisted workflows that move from exploration into repeatable operating tools.",
    items: [
      "Predictive modeling and statistical analysis",
      "Python, R, and SQL analytical delivery",
      "AI use-case framing and prompt workflow design",
      "Decision-support models for business teams",
    ],
  },
  {
    icon: GitBranch,
    title: "MLOps and productionization",
    description:
      "Turn models, pipelines, and AI experiments into maintainable systems with versioning, orchestration, and delivery controls.",
    items: [
      "Feature stores and model registries",
      "CI/CD for analytics and ML workflows",
      "Airflow and dbt orchestration patterns",
      "Production-readiness and handoff design",
    ],
  },
  {
    icon: BarChart3,
    title: "Business intelligence and semantic modeling",
    description:
      "Design reporting layers, semantic models, and governance structures that make dashboards easier to trust and maintain.",
    items: [
      "Power BI, Tableau, and Looker delivery",
      "Semantic model review and optimization",
      "Metric design and KPI structure",
      "Governance for reporting consistency",
    ],
  },
  {
    icon: MonitorSmartphone,
    title: "Website and app development",
    description:
      "Ship modern marketing sites and focused web apps that connect positioning, workflow, and analytics into one product surface.",
    items: [
      "Corporate websites and launch pages",
      "Web applications and internal tools",
      "Product landing pages with shared brand systems",
      "Frontend implementation with analytics-aware UX",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Data strategy and governance",
    description:
      "Set the operating rules around quality, access, and compliance so teams can scale analytics without losing control.",
    items: [
      "Data quality and lineage design",
      "Access controls and governance workflows",
      "GDPR-aware process design",
      "Documentation and stewardship frameworks",
    ],
  },
  {
    icon: GraduationCap,
    title: "AI literacy and change management",
    description:
      "Help teams adopt AI and analytics responsibly with practical enablement, not abstract transformation language.",
    items: [
      "Executive briefings and AI rollout support",
      "Company-wide training and team workshops",
      "Responsible AI playbooks",
      "Operating guidance for new delivery habits",
    ],
  },
] as const;

const deliveryFlow = [
  {
    step: "01",
    title: "Frame the operating problem",
    description:
      "We start with the business bottleneck, reporting friction, or product gap that actually needs to change.",
  },
  {
    step: "02",
    title: "Design the working system",
    description:
      "Architecture, semantic structure, workflows, and interfaces are shaped around how the team will use them in practice.",
  },
  {
    step: "03",
    title: "Ship and transfer capability",
    description:
      "Delivery includes implementation, refinement, and the guidance needed so the system remains usable after launch.",
  },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Seo
        title="Analytics, AI, and Data Services"
        description="Explore BI Solutions services across cloud migration, advanced analytics, AI delivery, website and app development, Power BI, MLOps, and data strategy."
        path="/services"
      />
      <Navbar />

      <main className="pt-32 pb-20">
        <PublicPageHero
          icon={Sparkles}
          eyebrow="Consulting, delivery, and enablement"
          title="End-to-end analytics and AI services built to move from strategy into production."
          description="BI Solutions works across cloud, business intelligence, analytics, AI, and product delivery. The goal is not to add another slide deck to the process - it is to ship systems your team can actually use and maintain."
          actions={
            <>
              <Button asChild className="rounded-full bg-black px-8 text-white hover:bg-gray-800">
                <Link href="/contact">
                  Start a conversation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-gray-300 px-8">
                <Link href="/portfolio">See selected work</Link>
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
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
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

        <section className="mx-auto max-w-7xl px-6 md:px-12">
          <ScrollReveal className="max-w-3xl" width="100%">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
              Service areas
            </p>
            <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
              Built to cover the full operating surface, not a single tool.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              Each engagement can stay narrow and practical, but the delivery
              model is broad enough to connect data foundations, reporting,
              AI workflows, and user-facing products when the problem requires
              it.
            </p>
          </ScrollReveal>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {servicesList.map((service, index) => {
              const Icon = service.icon;

              return (
                <ScrollReveal key={service.title} delay={index * 0.06} width="100%">
                  <article className="h-full rounded-[2rem] border border-gray-200 bg-white p-6 shadow-xl shadow-black/[0.04]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white shadow-lg shadow-black/10">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-2xl font-bold font-heading tracking-tight text-gray-950">
                      {service.title}
                    </h3>
                    <p className="mt-4 text-base leading-relaxed text-gray-600">
                      {service.description}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {service.items.map((item) => (
                        <li key={item} className="flex gap-3 text-sm leading-relaxed text-gray-600">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-7xl px-6 md:px-12">
          <ScrollReveal className="max-w-3xl" width="100%">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
              Engagement flow
            </p>
            <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
              How BI Solutions typically moves from request to shipped outcome.
            </h2>
          </ScrollReveal>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {deliveryFlow.map((item, index) => (
              <ScrollReveal key={item.step} delay={index * 0.08} width="100%">
                <div className="h-full rounded-[2rem] border border-gray-200 bg-gray-50 px-6 py-7">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
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

        <section className="mx-auto mt-16 max-w-7xl px-6 md:px-12">
          <ScrollReveal width="100%">
            <div className="rounded-[2rem] bg-gray-950 px-8 py-10 text-white shadow-2xl shadow-black/[0.14] md:px-12">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Need a scoped engagement?
              </p>
              <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <h2 className="text-3xl font-bold font-heading tracking-tight md:text-4xl">
                    Bring the problem, the bottleneck, or the product idea.
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-gray-300">
                    We can scope a focused dashboard build, a semantic-model
                    review, an AI workflow, or a broader transformation effort
                    without forcing everything into the same engagement shape.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button asChild className="rounded-full bg-white px-8 text-black hover:bg-gray-100">
                    <Link href="/contact">
                      Discuss your project
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-gray-500 px-8 text-gray-200 hover:bg-white/10 hover:text-white"
                  >
                    <Link href="/products">View product ecosystem</Link>
                  </Button>
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
