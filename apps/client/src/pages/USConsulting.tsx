import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { Seo } from "@/components/seo/Seo";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/LocaleProvider";
import { withAssetBase } from "@/lib/site";
import { trackEvent } from "@/lib/analytics";
import { usInquiryHref } from "@/lib/leadAttribution";
import founderPhoto from "@/assets/founder-photo-2.jpg";
import dashboard from "@/assets/dashboards/unicef_dashboard.webp";
import NotFound from "@/pages/NotFound";

const offers = {
  "power-bi": {
    path: "/us/power-bi-consulting",
    title: "Power BI Consulting for US Teams",
    description: "Remote Power BI consulting for US teams: dashboards, DAX, data modeling and reporting fixes. Share your requirements for a scoped project or ongoing support.",
    eyebrow: "Power BI · US teams · Remote delivery",
    headline: "Power BI consulting for US teams.",
    promise: "Make reporting reliable. Give your team time back.",
    introduction: "Slow reports, conflicting KPIs, and spreadsheets that need rebuilding every month? Work directly with BI Solutions Group to build or improve the Power BI system your team depends on.",
    cta: "Discuss my Power BI project",
    scope: "A reporting fix, a new dashboard, or ongoing support.",
    deliverables: [
      ["Reports built around decisions", "Executive and operational dashboards with agreed KPIs, clear filters, and the detail people need to act."],
      ["Models your team can trust", "Power Query, SQL, DAX, relationships, and access rules organized into a documented semantic model."],
      ["A practical handoff", "Refresh setup, performance checks, documentation, and walkthroughs so your team can maintain the work."],
    ],
    startingPoints: ["Fix slow reports or unreliable refreshes", "Replace a recurring spreadsheet reporting process", "Build a dashboard or extend your existing model"],
    brief: "Tell us who uses the reports, where the data lives, what is failing, and when you need progress. A finished specification is not required.",
    faqs: [
      ["Can you improve an existing Power BI setup?", "Yes. We can scope a review of your model, DAX measures, refresh process, or report performance before deciding what needs to change."],
      ["Can we start with a small project?", "Yes. Start with a defined reporting problem or diagnostic. We agree the deliverables and fees before implementation; ongoing support can be discussed separately."],
      ["What access do you need?", "We first discuss the data sources and security requirements. Any access, sample data, or workspace permissions are agreed as part of the scope. Do not send confidential data in the initial inquiry."],
    ],
  },
  "ai-automation": {
    path: "/us/ai-automation",
    title: "AI Automation Consulting for US Teams",
    description: "AI automation consulting for US teams. Scope document workflows, internal assistants and RAG search with human review, evaluation and a practical handoff.",
    eyebrow: "AI automation · US teams · Remote delivery",
    headline: "AI automation for work that repeats.",
    promise: "Start with one useful workflow. Build from evidence.",
    introduction: "If your team spends hours finding information, processing documents, or moving data between tools, we can help you scope and build an AI workflow around the systems you already use.",
    cta: "Discuss my AI workflow",
    scope: "A focused workflow, an internal assistant, or an AI integration.",
    deliverables: [
      ["A defined first use case", "Map the inputs, systems, exceptions, and people involved. Agree what a useful result looks like before implementation."],
      ["An integrated workflow", "Document intake, classification, extraction, internal search, or an assistant grounded in approved company knowledge."],
      ["Evaluation and ownership", "Test representative cases, define human review and escalation, and document operation, limitations, and ongoing responsibilities."],
    ],
    startingPoints: ["Route and review incoming documents", "Find answers in approved company knowledge", "Connect an AI step to an existing business process"],
    brief: "Describe the repeated task, the tools involved, the volume of work, and what a good outcome would look like. We assess feasibility before recommending a build.",
    faqs: [
      ["Do we need to choose an AI model first?", "No. Start with the workflow and its requirements. Model choice, integrations, evaluation, and operating costs follow from the problem we agree to solve."],
      ["Will the workflow need human review?", "We define review and escalation points around the consequences of errors. Sensitive decisions and exceptions should have clear human ownership."],
      ["Can you work with our existing systems?", "We assess available APIs, data access, security requirements, and operational constraints during scoping. Integrations and any third-party costs are agreed before implementation."],
    ],
  },
} as const;

export default function USConsulting({ service }: { service: keyof typeof offers }) {
  const { locale } = useLocale();
  const offer = offers[service];
  const [inquiryHref, setInquiryHref] = useState(usInquiryHref(service));
  useEffect(() => {
    setInquiryHref(usInquiryHref(service, window.location.search));
  }, [service]);
  if (locale !== "en") return <NotFound />;

  const inquiryClick = () => trackEvent("us_service_inquiry_click", { service, market: "US" });
  return (
    <div className="min-h-screen bg-[#faf9f6] text-gray-950">
      <Seo title={offer.title} description={offer.description} path={offer.path} structuredData={{
        "@context": "https://schema.org", "@type": "Service", name: offer.title,
        description: offer.description, url: `https://www.bisolutions.group${offer.path}`,
        areaServed: { "@type": "Country", name: "United States" },
        provider: { "@type": "Organization", name: "BI Solutions Group", url: "https://www.bisolutions.group/" },
      }} />
      <header className="border-b border-gray-200 bg-white">
        <div className="site-container flex items-center justify-between gap-4 px-6 py-5 md:px-12">
          <Link href="/" aria-label="BI Solutions Group home" className="flex items-center gap-3 font-semibold">
            <img src={withAssetBase("bi-solutions-logo.png")} alt="" width={42} height={42} />
            <span className="text-sm sm:text-base">BI Solutions Group</span>
          </Link>
          <Link href="/about" className="text-sm font-medium underline underline-offset-4">Meet Ioannis</Link>
        </div>
      </header>
      <main>
        <section className="site-container grid items-center gap-12 px-6 py-14 md:px-12 md:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.17em] text-gray-600">{offer.eyebrow}</p>
            <h1 className="mt-6 max-w-3xl text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">{offer.headline}</h1>
            <p className="mt-6 max-w-xl text-xl font-medium leading-relaxed">{offer.promise}</p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">{offer.introduction}</p>
            <Button asChild className="mt-8 h-auto min-h-12 w-full whitespace-normal rounded-full px-6 py-3 text-base sm:w-auto">
              <Link href={inquiryHref} onClick={inquiryClick}>{offer.cta}<ArrowRight className="ml-2 h-4 w-4 shrink-0" /></Link>
            </Button>
            <p className="mt-4 text-sm text-gray-600">{offer.scope}</p>
          </div>
          <aside className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
            <img src={founderPhoto} alt="Ioannis Bekas, founder of BI Solutions Group" width={700} height={800} className="aspect-[5/4] w-full object-cover object-top" fetchPriority="high" />
            <div className="p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Your consulting partner</p>
              <h2 className="mt-3 text-2xl">Ioannis Bekas</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">Founder of BI Solutions Group. Data, analytics, and AI consulting with a clear scope, direct communication, and documented delivery.</p>
              <Link href="/about" className="mt-5 inline-flex items-center text-sm font-semibold underline underline-offset-4">Read experience and background<ChevronRight className="ml-1 h-4 w-4" /></Link>
            </div>
          </aside>
        </section>

        <section className="border-y border-gray-200 bg-white">
          <div className="site-container px-6 py-14 md:px-12 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">A clear scope, from the start</p>
            <h2 className="mt-4 text-3xl sm:text-4xl">What we can deliver.</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {offer.deliverables.map(([title, description], index) => <article key={title} className="border-t border-gray-300 pt-6">
                <span className="text-sm font-semibold text-gray-500">0{index + 1}</span>
                <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-base leading-relaxed text-gray-600">{description}</p>
              </article>)}
            </div>
          </div>
        </section>

        <section className="site-container grid gap-10 px-6 py-14 md:px-12 md:py-20 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Start with a real business problem</p>
            <h2 className="mt-4 text-3xl sm:text-4xl">Where should we begin?</h2>
            <p className="mt-5 max-w-xl leading-relaxed text-gray-600">{offer.brief}</p>
          </div>
          <ul className="space-y-4">
            {offer.startingPoints.map(point => <li key={point} className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-5"><Check className="mt-0.5 h-5 w-5 shrink-0" /><span>{point}</span></li>)}
          </ul>
        </section>

        {service === "power-bi" && <section className="site-container px-6 pb-14 md:px-12 md:pb-20" aria-labelledby="portfolio-title">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
            <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Independent portfolio demonstration</p>
                <h2 id="portfolio-title" className="mt-4 text-3xl">See a reporting problem made explorable.</h2>
                <p className="mt-5 leading-relaxed text-gray-600">Explore an audit-compliance dashboard covering risk, expenditure, and recommendation progress. This uses mock data and was not commissioned by or endorsed by UNICEF.</p>
                <Link href="/case-studies/unicef-audit-compliance" className="mt-6 inline-flex items-center font-semibold underline underline-offset-4">Explore the Power BI demo<ArrowRight className="ml-2 h-4 w-4" /></Link>
              </div>
              <img src={dashboard} alt="Independent Power BI audit-compliance demonstration using mock data" width={1200} height={675} loading="lazy" className="h-auto w-full rounded-xl border border-gray-200" />
            </div>
          </div>
        </section>}

        <section id="remote-delivery" className="bg-[#102033] text-white">
          <div className="site-container px-6 py-14 md:px-12 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Working together from the US</p>
            <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl">Remote delivery, with the details agreed upfront.</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {[
                ["01 / Share the essentials", "Send your problem, current tools, and preferred timing. You can express your planning budget in US dollars or euros."],
                ["02 / Agree the scope", "We discuss feasibility, deliverables, access, fees, and responsibilities. Share your time zone so meeting times can be agreed before kickoff."],
                ["03 / Build and hand off", "Work follows agreed milestones, with written updates, review points, and a documented handoff. Ongoing support can be scoped separately."],
              ].map(([title, body]) => <div key={title}><h3 className="text-lg font-semibold">{title}</h3><p className="mt-3 leading-relaxed text-white/75">{body}</p></div>)}
            </div>
          </div>
        </section>

        <section className="site-container px-6 py-14 md:px-12 md:py-20">
          <h2 className="text-3xl sm:text-4xl">Before we start.</h2>
          <div className="mt-8 max-w-4xl divide-y divide-gray-200 border-y border-gray-200">
            {offer.faqs.map(([question, answer]) => <details key={question} className="group py-5">
              <summary className="cursor-pointer text-lg font-semibold focus-visible:outline-offset-4">{question}</summary>
              <p className="mt-4 max-w-3xl leading-relaxed text-gray-600">{answer}</p>
            </details>)}
          </div>
        </section>
        <section className="site-container px-6 pb-16 md:px-12 md:pb-24">
          <div className="rounded-3xl border border-gray-200 bg-white p-7 sm:p-12">
            <h2 className="max-w-2xl text-3xl sm:text-4xl">Tell us what needs to work better.</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-gray-600">A short brief is enough to start. We review the context and suggest the next step before you commit to a project.</p>
            <Button asChild className="mt-7 h-auto min-h-12 w-full whitespace-normal rounded-full px-6 py-3 sm:w-auto"><Link href={inquiryHref} onClick={inquiryClick}>{offer.cta}<ArrowRight className="ml-2 h-4 w-4 shrink-0" /></Link></Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
