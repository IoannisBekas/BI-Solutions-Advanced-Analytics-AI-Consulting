import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { trackEvent } from "@/lib/analytics";

const services = [
  {
    need: "Build trusted reporting",
    title: "Business Intelligence & Power BI",
    description:
      "Create a reporting layer leaders and teams can use without debating definitions or rebuilding the same logic.",
    deliverables: ["Dashboards and KPI systems", "Semantic models and reporting governance"],
    bestFor: "Teams replacing spreadsheet-heavy or inconsistent reporting",
    path: "/services/business-intelligence-semantic-modeling",
    action: "Explore BI & Power BI",
  },
  {
    need: "Automate repetitive work",
    title: "AI Consulting & Automation",
    description:
      "Choose practical AI use cases, build reliable workflows, and put the right controls around day-to-day adoption.",
    deliverables: ["AI strategy and workflow design", "Automation, assistants, and production operations"],
    bestFor: "Teams moving from AI ideas to a dependable operating workflow",
    path: "/services/advanced-analytics-ai",
    action: "Explore AI consulting",
  },
  {
    need: "Fix the data foundation",
    title: "Data Strategy & Cloud",
    description:
      "Design the architecture, governance, and migration sequence behind trustworthy analytics and future AI work.",
    deliverables: ["Data roadmaps and cloud architecture", "Quality, access, and governance rules"],
    bestFor: "Organizations whose reporting is limited by fragmented or unreliable data",
    path: "/services/data-strategy-governance",
    action: "Explore data strategy",
  },
  {
    need: "Build a focused digital product",
    title: "Websites & Web Apps",
    description:
      "Ship a fast, measurable digital experience that connects positioning, workflows, analytics, and lead quality.",
    deliverables: ["Conversion-focused websites", "Portals, internal tools, and web applications"],
    bestFor: "Teams that need more than a static brochure or generic template",
    path: "/services/website-app-development",
    action: "Explore web delivery",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-14 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.55fr)] lg:items-end">
          <ScrollReveal width="100%">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
              Start with the need
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-bold font-heading leading-tight md:text-5xl">
              What are you trying to improve?
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1} width="100%">
            <p className="text-lg leading-relaxed text-gray-600">
              Choose the business problem first. Each path explains the scope,
              delivery approach, and the type of result to expect.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2">
          {services.map((service, index) => (
            <ScrollReveal
              key={service.path}
              delay={index * 0.08}
              className="h-full"
              width="100%"
            >
              <Link
                href={service.path}
                className="block h-full"
                onClick={() =>
                  trackEvent("need_selector_click", {
                    need: service.need,
                    service: service.title,
                    target: service.path,
                  })
                }
              >
                <Card className="group flex h-full flex-col rounded-[2rem] border-gray-200 bg-gray-50/70 p-7 shadow-none transition-all duration-500 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-black/[0.05] sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    {service.need}
                  </p>
                  <h3 className="mt-4 text-2xl font-bold font-heading tracking-tight text-gray-950 md:text-3xl">
                    {service.title}
                  </h3>
                  <p className="mt-4 leading-relaxed text-gray-600">
                    {service.description}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {service.deliverables.map((deliverable) => (
                      <li
                        key={deliverable}
                        className="flex gap-3 text-sm leading-relaxed text-gray-700"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                        <span>{deliverable}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7 border-t border-gray-200 pt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                      Best for
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {service.bestFor}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center gap-3 pt-7 text-sm font-semibold text-gray-950">
                    {service.action}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="mt-10 text-center" width="100%">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-gray-600"
          >
            Compare all services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
