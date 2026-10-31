import { ArrowDown, ArrowRight, Check, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { getServiceDetailBySlug } from "@/data/serviceDetails";
import { campaignAttribution } from "@/lib/leadAttribution";
import NotFound from "@/pages/NotFound";

const pageSections = [
  { id: "fit", label: "When to bring us in" },
  { id: "deliverables", label: "Deliverables" },
  { id: "process", label: "How we work" },
  { id: "scope", label: "Scope & support" },
  { id: "questions", label: "Questions" },
];

export default function ServiceDetail({ slug: providedSlug }: { slug?: string }) {
  const params = useParams<{ slug: string }>();
  const slug = providedSlug ?? params.slug;
  const service = slug ? getServiceDetailBySlug(slug) : undefined;
  const [campaignSearch, setCampaignSearch] = useState("");
  useEffect(() => {
    setCampaignSearch(window.location.search);
  }, [slug]);

  if (!service) return <NotFound />;

  const url = `https://www.bisolutions.group${service.path}`;
  const projectParams = new URLSearchParams(campaignAttribution(campaignSearch));
  projectParams.set("source", "service-detail");
  projectParams.set("service", service.slug);
  projectParams.set("need", service.need);
  const projectHref = `/start-a-project?${projectParams}`;

  return (
    <div className="min-h-screen bg-[var(--surface-paper)] font-sans text-gray-950">
      <Seo
        title={service.seoTitle}
        description={service.description}
        path={service.path}
        translatedLocales={["en"]}
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "@id": `${url}#service`,
            name: service.title,
            serviceType: service.title,
            description: service.description,
            url,
            provider: {
              "@type": "Organization",
              "@id": "https://www.bisolutions.group/#organization",
              name: "BI Solutions Group",
              url: "https://www.bisolutions.group/",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://www.bisolutions.group/" },
              { "@type": "ListItem", position: 2, name: "Services", item: "https://www.bisolutions.group/services" },
              { "@type": "ListItem", position: 3, name: service.title, item: url },
            ],
          },
        ]}
      />
      <Navbar />

      <main>
        <section className="site-container page-top pb-12 md:pb-16">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="underline-offset-4 hover:underline">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/services" className="underline-offset-4 hover:underline">Services</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-gray-950">{service.title}</span>
          </nav>

          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-end lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">{service.eyebrow}</p>
              <h1 className="page-title mt-5">{service.title}</h1>
              <p className="body-lead reading-width mt-7 text-gray-700">{service.introduction}</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Button asChild className="min-h-12 rounded-full bg-black px-6 text-white hover:bg-gray-800">
                  <Link href={projectHref}>Discuss your project <ArrowRight aria-hidden="true" /></Link>
                </Button>
                <Link href="/about" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline decoration-gray-400 underline-offset-4">
                  Meet Ioannis <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <aside className="content-panel border-gray-950 bg-gray-950 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">A useful starting point</p>
              <p className="mt-6 text-xl leading-relaxed tracking-tight">{service.startingPoint}</p>
              <p className="mt-7 border-t border-white/20 pt-5 text-sm leading-relaxed text-white/70">Clear scope, agreed fees, review points, and a documented handoff.</p>
            </aside>
          </div>

          <nav aria-label="On this page" className="mt-14 flex flex-wrap gap-x-7 gap-y-1 border-y border-gray-950/20 py-3">
            {pageSections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-gray-700 underline-offset-4 hover:underline">
                {section.label}<ArrowDown aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
            ))}
          </nav>
        </section>

        <div className="site-container">
          <section id="fit" className="grid scroll-mt-28 gap-8 pb-14 pt-3 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)] lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">When to bring us in</p>
              <h2 className="section-title mt-4">Start with a problem your team recognizes.</h2>
            </div>
            <ul className="divide-y divide-gray-950/15 border-y border-gray-950/15">
              {service.fit.map((item) => (
                <li key={item} className="flex gap-4 py-5 text-base leading-relaxed text-gray-700">
                  <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-gray-950" /><span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="deliverables" className="scroll-mt-28 border-t border-gray-950/20 py-14 md:py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">Deliverables</p>
            <h2 className="section-title mt-4">What the engagement can include.</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-700">Select the work that addresses your requirement. The agreed scope defines which deliverables are included.</p>
            <div className="mt-9 grid gap-x-12 md:grid-cols-2">
              {service.deliverables.map((item, index) => (
                <article key={item.title} className="border-t border-gray-950/15 py-7">
                  <p className="font-mono text-xs text-gray-600">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="card-title mt-4">{item.title}</h3>
                  <p className="mt-3 max-w-xl text-base leading-relaxed text-gray-700">{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="process" className="scroll-mt-28 border-t border-gray-950/20 py-14 md:py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">How we work</p>
            <h2 className="section-title mt-4">From the first question to a usable handoff.</h2>
            <ol className="mt-9 grid gap-x-8 sm:grid-cols-2 xl:grid-cols-4">
              {service.stages.map((stage, index) => (
                <li key={stage.title} className="border-t border-gray-950/20 py-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-950/30 font-mono text-xs">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-5 font-heading text-lg font-bold tracking-tight">{stage.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-700">{stage.description}</p>
                </li>
              ))}
            </ol>
          </section>

          <section id="scope" className="scroll-mt-28 border-t border-gray-950/20 py-14 md:py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">Scope & support</p>
            <h2 className="section-title mt-4">Make the dependencies clear before the build.</h2>
            <div className="mt-9 grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <h3 className="card-title">What to prepare</h3>
                <ul className="mt-5 space-y-4">
                  {service.prerequisites.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-gray-700"><Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" /><span>{item}</span></li>
                  ))}
                </ul>
                <p className="mt-6 text-sm leading-relaxed text-gray-600">A short description is enough for the initial enquiry. Share sensitive files only after access and data-handling arrangements are agreed.</p>
              </div>
              <div>
                <h3 className="card-title">What determines scope and fees</h3>
                <ul className="mt-5 divide-y divide-gray-950/15 border-y border-gray-950/15">
                  {service.scopeDrivers.map((item) => <li key={item} className="py-3 text-sm leading-relaxed text-gray-700">{item}</li>)}
                </ul>
              </div>
            </div>
            <div className="mt-10 grid gap-4 border-l-2 border-gray-950 pl-5 md:grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)] md:gap-8 md:pl-7">
              <h3 className="card-title">After the handoff</h3>
              <p className="text-sm leading-relaxed text-gray-700">{service.maintenance}</p>
            </div>
          </section>

          {service.demonstration && (
            <section className="mb-14 rounded-2xl border border-gray-950/20 bg-white/45 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">Independent portfolio demonstration</p>
              <h2 className="section-title mt-4">{service.demonstration.title}</h2>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-700">{service.demonstration.description}</p>
              <Link href={service.demonstration.href} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline decoration-gray-400 underline-offset-4">Explore the demonstration <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
            </section>
          )}

          <section id="questions" className="grid scroll-mt-28 gap-8 border-t border-gray-950/20 py-14 md:py-16 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1fr)] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">Questions before we start</p>
              <h2 className="section-title mt-4">The practical details.</h2>
            </div>
            <div className="divide-y divide-gray-950/20 border-y border-gray-950/20">
              {service.questions.map((item) => (
                <details key={item.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-5 text-base font-semibold leading-relaxed marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden">
                    {item.question}<Plus aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-700">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="border-t border-gray-950/20 py-14 md:py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">Further reading</p>
            <h2 className="section-title mt-4">Useful context for the next conversation.</h2>
            <div className="mt-9 grid gap-x-8 md:grid-cols-3">
              {service.resources.map((resource) => (
                <Link key={resource.href} href={resource.href} className="group border-t border-gray-950/20 py-6">
                  <h3 className="flex items-start justify-between gap-4 font-heading text-lg font-bold tracking-tight underline-offset-4 group-hover:underline">{resource.label}<ArrowRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" /></h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-700">{resource.description}</p>
                </Link>
              ))}
            </div>
            <Link href={service.relatedService.href} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline decoration-gray-400 underline-offset-4">Related service: {service.relatedService.label}<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </section>
        </div>

        <section className="bg-[#0a0b0d] py-14 text-white md:py-20">
          <div className="site-container grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Start with your requirement</p>
              <h2 className="section-title mt-4 max-w-3xl">Tell us what needs to work better.</h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70">Describe the process, current tools, and the result your team needs. We review the context and agree the next step with you.</p>
            </div>
            <Button asChild className="min-h-12 w-fit rounded-full bg-white px-6 text-black hover:bg-gray-200">
              <Link href={projectHref}>Discuss your project<ArrowRight aria-hidden="true" /></Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
