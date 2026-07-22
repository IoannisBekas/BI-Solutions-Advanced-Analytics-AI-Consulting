import { ArrowRight, BadgeCheck, Github, Linkedin, ShieldCheck, Workflow } from "lucide-react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import founderPhoto from "@/assets/founder-photo-2.jpg";
import { withSiteBase } from "@/lib/site";

const deliveryPrinciples = [
  {
    title: "Senior involvement throughout",
    description:
      "The person shaping the solution stays involved in discovery, design, implementation, and handoff.",
    icon: BadgeCheck,
  },
  {
    title: "Systems your team can own",
    description:
      "Documentation, clear logic, and practical enablement are part of delivery—not an afterthought.",
    icon: Workflow,
  },
  {
    title: "Privacy and governance by design",
    description:
      "Data access, security, ownership, and responsible AI use are addressed as part of the working system.",
    icon: ShieldCheck,
  },
];

const deliverySteps = [
  {
    number: "01",
    title: "Diagnose",
    description:
      "Clarify the decision, users, data, constraints, and the outcome that would make the work valuable.",
  },
  {
    number: "02",
    title: "Build",
    description:
      "Design and validate the dashboard, workflow, data layer, or application with the people who will use it.",
  },
  {
    number: "03",
    title: "Enable",
    description:
      "Document the system, transfer knowledge, and agree on the right level of support after handoff.",
  },
];

const certifications = [
  "Data Science Professional Certificate — HarvardX",
  "Google Data Analytics Professional Certificate",
  "Financial Engineering and Risk Management — Columbia",
  "Financial Markets — Yale",
  "Python and Statistics for Financial Analysis — HKUST",
];

export default function About() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-black/10">
      <Seo
        title="About Ioannis Bekas and BI Solutions Group"
        description="Meet Ioannis Bekas and learn how BI Solutions Group delivers business intelligence, AI, data strategy, and focused web applications for teams in Greece and Europe."
        path="/about"
        image={founderPhoto}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Ioannis Bekas",
          jobTitle: "Data Scientist & AI Developer",
          worksFor: {
            "@type": "Organization",
            name: "BI Solutions Group",
          },
          sameAs: [
            "https://linkedin.com/in/ioannisbekas",
            "https://github.com/IoannisBekas",
          ],
        }}
      />
      <Navbar />

      <main>
        <section className="px-6 pb-24 pt-36 md:px-12 md:pb-32 md:pt-44">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-center">
            <ScrollReveal width="100%">
              <div className="max-w-4xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Founder-led BI, AI, and web delivery
                </p>
                <h1 className="mt-6 text-5xl font-bold font-heading leading-[1.03] tracking-tight text-gray-950 sm:text-6xl lg:text-7xl">
                  Senior technical delivery without layers of handoff.
                </h1>
                <p className="mt-7 max-w-3xl text-lg leading-relaxed text-gray-600 md:text-xl">
                  I’m Ioannis Bekas, founder of BI Solutions Group. I work directly
                  with teams to turn reporting problems, AI opportunities, weak data
                  foundations, and digital-product ideas into systems people can use
                  and maintain.
                </p>

                <div className="mt-9 flex flex-wrap gap-4">
                  <Button asChild className="h-12 rounded-full bg-black px-8 text-white hover:bg-gray-800">
                    <Link href="/start-a-project?source=about">
                      Start a project
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-12 rounded-full border-gray-300 px-8">
                    <Link href="/services">Explore services</Link>
                  </Button>
                </div>

                <dl className="mt-12 grid gap-5 border-t border-gray-200 pt-8 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Experience</dt>
                    <dd className="mt-2 text-lg font-semibold text-gray-950">9+ years</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Delivery</dt>
                    <dd className="mt-2 text-lg font-semibold text-gray-950">Strategy through handoff</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Coverage</dt>
                    <dd className="mt-2 text-lg font-semibold text-gray-950">Greece and Europe</dd>
                  </div>
                </dl>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.08} width="100%">
              <div className="relative mx-auto aspect-[3/4] w-full max-w-[390px] overflow-hidden rounded-[2rem] bg-gray-100 shadow-2xl shadow-black/[0.12]">
                <img
                  src={founderPhoto}
                  alt="Ioannis Bekas, founder of BI Solutions Group"
                  className="h-full w-full object-cover grayscale"
                />
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="bg-gray-950 px-6 py-24 text-white md:px-12 md:py-28">
          <div className="mx-auto max-w-7xl">
            <ScrollReveal width="100%" className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                What clients can expect
              </p>
              <h2 className="mt-5 text-4xl font-bold font-heading tracking-tight md:text-5xl">
                Practical systems, clear decisions, and a responsible handoff.
              </h2>
            </ScrollReveal>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {deliveryPrinciples.map((item, index) => {
                const Icon = item.icon;
                return (
                  <ScrollReveal key={item.title} delay={index * 0.06} width="100%">
                    <article className="h-full rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-7">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-6 text-2xl font-bold font-heading tracking-tight">{item.title}</h3>
                      <p className="mt-4 leading-relaxed text-gray-300">{item.description}</p>
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-6 py-24 md:px-12 md:py-28">
          <div className="mx-auto max-w-7xl">
            <ScrollReveal width="100%" className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">How I work</p>
              <h2 className="mt-5 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
                From a real operating problem to a working system.
              </h2>
            </ScrollReveal>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {deliverySteps.map((step, index) => (
                <ScrollReveal key={step.number} delay={index * 0.06} width="100%">
                  <article className="h-full rounded-[1.75rem] border border-gray-200 bg-white p-7 shadow-xl shadow-black/[0.04]">
                    <p className="text-sm font-semibold tracking-[0.16em] text-gray-400">{step.number}</p>
                    <h3 className="mt-5 text-2xl font-bold font-heading tracking-tight text-gray-950">{step.title}</h3>
                    <p className="mt-4 leading-relaxed text-gray-600">{step.description}</p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-gray-200 bg-gray-50 px-6 py-24 md:px-12 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <ScrollReveal width="100%">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Experience</p>
                <h2 className="mt-5 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
                  Analytical depth shaped by demanding operating contexts.
                </h2>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.06} width="100%">
              <div className="space-y-6 text-lg leading-relaxed text-gray-600">
                <p>
                  My work spans data management, statistical analysis, artificial
                  intelligence, information visualisation, business intelligence,
                  and the development of focused analytical products.
                </p>
                <p>
                  My professional background includes international-organisation
                  environments such as the International Atomic Energy Agency,
                  the International Organization for Migration, and the United
                  Nations Office for Disaster Risk Reduction, alongside private-sector
                  and SME delivery across Europe and North America.
                </p>
                <p>
                  BI Solutions Group brings that experience into focused engagements:
                  defining the decision, building the working system, and leaving the
                  client with clearer logic, documentation, and ownership.
                </p>
                <Button asChild variant="outline" className="mt-2 h-12 rounded-full border-gray-300 px-7">
                  <a href={withSiteBase("/#case-studies")}>See case studies</a>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="px-6 py-24 md:px-12 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
            <ScrollReveal width="100%">
              <article className="h-full rounded-[2rem] border border-gray-200 bg-white p-8 shadow-xl shadow-black/[0.04] md:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Education</p>
                <div className="mt-7 space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold font-heading tracking-tight text-gray-950">
                      M.Sc. in Operational Research, Analytics & Decision Making
                    </h2>
                    <p className="mt-2 text-gray-600">Technical University of Crete & Hellenic Army Academy</p>
                    <p className="mt-3 text-sm leading-relaxed text-gray-500">GPA 9.3/10 · Thesis on AI touchpoints with multi-criteria decision analysis</p>
                  </div>
                  <div className="border-t border-gray-200 pt-7">
                    <h2 className="text-2xl font-bold font-heading tracking-tight text-gray-950">
                      B.Sc. in Mathematics & Minor in Economics
                    </h2>
                    <p className="mt-2 text-gray-600">University of Athens</p>
                    <p className="mt-3 text-sm text-gray-500">Exchange in Financial Mathematics, Stockholm University</p>
                  </div>
                </div>
              </article>
            </ScrollReveal>

            <ScrollReveal delay={0.06} width="100%">
              <article className="h-full rounded-[2rem] border border-gray-200 bg-gray-50 p-8 md:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Selected credentials</p>
                <ul className="mt-7 space-y-4">
                  {certifications.map((certification) => (
                    <li key={certification} className="flex items-start gap-3 text-base leading-relaxed text-gray-700">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                      {certification}
                    </li>
                  ))}
                </ul>
              </article>
            </ScrollReveal>
          </div>
        </section>

        <section className="px-6 pb-24 md:px-12 md:pb-32">
          <ScrollReveal width="100%" className="mx-auto max-w-7xl">
            <div className="rounded-[2rem] bg-gray-950 px-8 py-12 text-white shadow-2xl shadow-black/[0.14] md:px-12 md:py-14">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">Start with the problem</p>
                  <h2 className="mt-4 text-3xl font-bold font-heading tracking-tight md:text-5xl">
                    What are you trying to improve?
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-gray-300">
                    Share the reporting issue, AI workflow, data challenge, or digital product you need to move forward.
                  </p>
                </div>
                <Button asChild className="h-12 rounded-full bg-white px-8 text-black hover:bg-gray-100">
                  <Link href="/start-a-project?source=about-footer">
                    Start a project
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap gap-5 border-t border-white/10 pt-7 text-sm text-gray-300">
                <a
                  href="https://linkedin.com/in/ioannisbekas"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 hover:text-white"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
                <a
                  href="https://github.com/IoannisBekas"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 hover:text-white"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
