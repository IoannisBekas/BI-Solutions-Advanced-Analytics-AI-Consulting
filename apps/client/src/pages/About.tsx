import { Award, Github, GraduationCap, Linkedin, Mail, Sparkles } from "lucide-react";
import founderPhoto from "@/assets/founder-photo-2.jpg";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import { PublicPageHero } from "@/components/sections/PublicPageHero";

const profileHighlights = [
  { label: "Experience", value: "9+ years across analytics, AI, and decision support" },
  { label: "Operating contexts", value: "International organizations, consulting, and product delivery" },
  { label: "Core lens", value: "Useful systems, clear logic, and delivery that survives beyond launch" },
];

const educationItems = [
  {
    title: "M.Sc. in Operational Research, Analytics & Decision Making",
    institution: "Technical University of Crete & Hellenic Army Academy",
    detail: "GPA 9.3/10. Thesis focused on artificial intelligence touchpoints with multi-criteria decision analysis.",
  },
  {
    title: "B.Sc. in Mathematics with a Minor in Economics",
    institution: "University of Athens",
    detail: "Included exchange coursework in financial mathematics at Stockholm University.",
  },
];

const certificationItems = [
  "Data Science Professional Certificate - HarvardX",
  "Google Data Analytics Professional Certificate",
  "Financial Engineering and Risk Management - Columbia",
  "Financial Markets - Yale",
  "Python and Statistics for Financial Analysis - HKUST",
];

const workPrinciples = [
  {
    title: "Start from the operating problem",
    description:
      "The work begins with the reporting friction, decision bottleneck, or delivery gap that actually needs to change.",
  },
  {
    title: "Keep systems explainable",
    description:
      "Analytics and AI are more useful when the logic, tradeoffs, and maintenance burden remain clear to the team using them.",
  },
  {
    title: "Ship with handoff in mind",
    description:
      "Projects should not depend on permanent external babysitting. Documentation, structure, and usability matter.",
  },
];

const organizations = [
  "IAEA",
  "IOM",
  "UNDRR",
  "Fujitsu",
  "LG",
  "Nespresso",
  "Coca-Cola",
  "PepsiCo",
];

export default function About() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Seo
        title="About Ioannis Bekas and BI Solutions"
        description="Learn about Ioannis Bekas, BI Solutions Group, and the background behind the company's analytics, AI, and data strategy practice."
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

      <main className="pt-32 pb-20">
        <PublicPageHero
          icon={Sparkles}
          eyebrow="Founder and lead consultant"
          title="Ioannis Bekas"
          description="I work at the intersection of analytics, AI, business intelligence, and product delivery. The focus is consistently the same: build systems that make decisions clearer and execution easier for the teams using them."
          actions={
            <>
              <Button asChild className="rounded-full bg-black px-8 text-white hover:bg-gray-800">
                <a href="https://www.linkedin.com/in/ioannisbekas/" target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-gray-300 px-8">
                <a href="mailto:Bekas.Ioannis.1996@gmail.com">Get in touch</a>
              </Button>
            </>
          }
          aside={
            <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-gray-100 shadow-2xl shadow-black/[0.08]">
              <img
                src={founderPhoto}
                alt="Ioannis Bekas"
                className="h-full w-full object-cover grayscale"
              />
            </div>
          }
          footer={
            <div className="grid gap-4 md:grid-cols-3">
              {profileHighlights.map((item) => (
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
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <ScrollReveal width="100%">
              <div className="rounded-[2rem] border border-gray-200 bg-white px-6 py-7 shadow-xl shadow-black/[0.04] md:px-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Experience
                </p>
                <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950">
                  International analytics work, consulting, and product-focused delivery.
                </h2>
                <div className="mt-6 space-y-5 text-base leading-relaxed text-gray-600">
                  <p>
                    My background spans data management, statistical analysis,
                    artificial intelligence, and information visualization, with
                    a focus on tools that support data-driven decision-making and
                    workflow improvement.
                  </p>
                  <p>
                    Professionally, that work has included international
                    organizations such as the International Atomic Energy Agency,
                    the International Organization for Migration, and the United
                    Nations Office for Disaster Risk Reduction, alongside
                    private-sector analytics and consulting environments.
                  </p>
                  <p>
                    In parallel, I have supported professionals and teams across
                    Canada, the United States, and Europe, helping scope and
                    deliver analytics, reporting, and decision-support systems
                    for both large organizations and smaller operating teams.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.08} width="100%">
              <div className="rounded-[2rem] border border-gray-200 bg-gray-50 px-6 py-7">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Selected contexts
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {organizations.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-7xl px-6 md:px-12">
          <div className="grid gap-8 lg:grid-cols-2">
            <ScrollReveal width="100%">
              <div className="h-full rounded-[2rem] border border-gray-200 bg-white px-6 py-7 shadow-xl shadow-black/[0.04] md:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                      Education
                    </p>
                    <h2 className="text-3xl font-bold font-heading tracking-tight text-gray-950">
                      Formal analytical training
                    </h2>
                  </div>
                </div>
                <div className="mt-6 space-y-5">
                  {educationItems.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-5"
                    >
                      <h3 className="text-xl font-bold font-heading tracking-tight text-gray-950">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm font-medium text-gray-500">
                        {item.institution}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-gray-600">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.08} width="100%">
              <div className="h-full rounded-[2rem] border border-gray-200 bg-white px-6 py-7 shadow-xl shadow-black/[0.04] md:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                      Certifications
                    </p>
                    <h2 className="text-3xl font-bold font-heading tracking-tight text-gray-950">
                      Continued technical development
                    </h2>
                  </div>
                </div>
                <ul className="mt-6 space-y-4">
                  {certificationItems.map((item) => (
                    <li
                      key={item}
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm leading-relaxed text-gray-700"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-7xl px-6 md:px-12">
          <ScrollReveal className="max-w-3xl" width="100%">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
              Working style
            </p>
            <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
              A few principles that shape the work.
            </h2>
          </ScrollReveal>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {workPrinciples.map((item, index) => (
              <ScrollReveal key={item.title} delay={index * 0.08} width="100%">
                <div className="h-full rounded-[2rem] border border-gray-200 bg-gray-50 px-6 py-7">
                  <h3 className="text-2xl font-bold font-heading tracking-tight text-gray-950">
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
                Connect
              </p>
              <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <h2 className="text-3xl font-bold font-heading tracking-tight md:text-4xl">
                    Open to conversations about analytics strategy, AI delivery, and product-focused systems work.
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-gray-300">
                    The best starting point is usually a clear description of
                    the system, workflow, or decision process that needs to work
                    better.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://www.linkedin.com/in/ioannisbekas/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition-colors hover:bg-gray-100"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                  <a
                    href="https://github.com/IoannisBekas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-gray-500 px-5 py-3 text-sm font-medium text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                  <a
                    href="mailto:Bekas.Ioannis.1996@gmail.com"
                    className="inline-flex items-center gap-2 rounded-full border border-gray-500 px-5 py-3 text-sm font-medium text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
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
