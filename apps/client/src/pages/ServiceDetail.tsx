import { Link, useRoute } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { PublicPageHero } from "@/components/sections/PublicPageHero";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";
import {
  getServicePageBySlug,
  servicePages,
  type ServicePage,
} from "@/lib/servicePages";

function ServiceNotFound() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar />
      <main className="pt-32 pb-20">
        <PublicPageHero
          icon={Sparkles}
          eyebrow="Services"
          title="Service page not found."
          description="The service room you are looking for is not available at this route."
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
        name: service.title,
        serviceType: service.title,
        description: service.seoDescription,
        url,
        areaServed: ["Greece", "Europe"],
        provider: {
          "@type": "ProfessionalService",
          name: "BI Solutions Group",
          url: "https://www.bisolutions.group/",
          address: {
            "@type": "PostalAddress",
            addressCountry: "GR",
          },
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
  const [, params] = useRoute("/services/:slug");
  const slug = params?.slug || "";
  const service = getServicePageBySlug(slug);

  if (!service) {
    return <ServiceNotFound />;
  }

  const Icon = service.icon;
  const relatedServices = servicePages
    .filter((item) => item.slug !== service.slug)
    .slice(0, 3);

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
        <PublicPageHero
          icon={Icon}
          eyebrow={service.heroEyebrow}
          title={service.heroTitle}
          description={service.heroDescription}
          actions={
            <>
              <Button asChild className="rounded-full bg-black px-8 text-white hover:bg-gray-800">
                <Link href="/contact">
                  Discuss this service
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-gray-300 px-8">
                <Link href="/services">Back to all services</Link>
              </Button>
            </>
          }
          footer={
            <div className="grid gap-4 md:grid-cols-3">
              {service.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    {metric.label}
                  </p>
                  <p className="mt-3 text-base font-medium leading-relaxed text-gray-800">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          }
        />

        <section className="mx-auto max-w-7xl px-6 md:px-12">
          <ScrollReveal className="max-w-3xl" width="100%">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
              What this room covers
            </p>
            <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
              A focused service page for {service.shortTitle.toLowerCase()}.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              This page separates the service from the broader BI Solutions
              ecosystem, so clients and search engines can understand the exact
              problem area, delivery scope, and expected outcomes.
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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Typical scope
              </p>
              <h2 className="mt-4 text-3xl font-bold font-heading tracking-tight text-gray-950">
                Service components
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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
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
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
              Good fit
            </p>
            <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
              When to use this service.
            </h2>
          </ScrollReveal>

          <div className="mt-10 grid auto-rows-fr gap-6 lg:grid-cols-3">
            {service.useCases.map((useCase, index) => (
              <ScrollReveal key={useCase} delay={index * 0.08} width="100%">
                <div className="h-full rounded-[2rem] border border-gray-200 bg-gray-50 px-6 py-7">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
                    Use case {index + 1}
                  </p>
                  <p className="mt-4 text-base leading-relaxed text-gray-700">
                    {useCase}
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
                Connected service rooms
              </p>
              <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
                <div>
                  <h2 className="text-3xl font-bold font-heading tracking-tight md:text-4xl">
                    Keep the broad BI Solutions offer, with sharper entry points.
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-gray-300">
                    Each service room can stand alone for search and client
                    clarity, while still connecting back to the wider analytics,
                    AI, BI, and digital delivery ecosystem.
                  </p>
                </div>
                <div className="grid gap-3">
                  {relatedServices.map((related) => (
                    <Link
                      key={related.slug}
                      href={related.path}
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-gray-200 transition-colors hover:bg-white hover:text-gray-950"
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
      </main>
      <Footer />
    </div>
  );
}
