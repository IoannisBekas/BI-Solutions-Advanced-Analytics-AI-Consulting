import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PublicPageHero } from "@/components/sections/PublicPageHero";
import { Button } from "@/components/ui/button";
import chaniaTax1 from "@/assets/partnerships/chania_tax_1.png";
import chaniaTax2 from "@/assets/partnerships/chania_tax_2.png";
import chaniaTax3 from "@/assets/partnerships/chania_tax_3.png";
import chaniaTax4 from "@/assets/partnerships/chania_tax_4.png";
import unicefDashboard from "@/assets/dashboards/unicef_dashboard.png";
import iaeaDashboard from "@/assets/dashboards/iaea_dashboard.png";
import ifcDashboard from "@/assets/dashboards/ifc_dashboard.png";

const portfolioHighlights = [
  {
    label: "Focus areas",
    value: "Dashboards, reporting systems, and transformation partnerships",
  },
  {
    label: "Delivery contexts",
    value: "International organizations, HR strategy, finance, and operations",
  },
  {
    label: "Outcome style",
    value: "Decision support, governance visibility, and clearer operating workflows",
  },
];

const projects = [
  {
    id: 4,
    title: "Chania Tax IKE",
    category: "Strategic partnership",
    images: [chaniaTax1, chaniaTax2, chaniaTax3, chaniaTax4],
    description:
      "A strategic partnership with the CEO of Chania Tax IKE, Mr Antonakakis, driving digital transformation in the financial sector. The work included secure cloud infrastructure, automated reporting systems, and analytics delivery to improve operational efficiency and decision-making.",
    link: "https://chaniatax.gr/",
  },
  {
    id: 1,
    title: "UNICEF Audit Reports Dashboard",
    category: "Risk management and strategy",
    images: [unicefDashboard],
    description:
      "A comprehensive oversight tool for Member States and senior management to track country-office audits and strengthen the visibility of audit activity across the organization.",
    link: "https://github.com/IoannisBekas/PowerBI-Dashboards/blob/main/UNICEF%20OIAI%20Country-Office%20Audit%20Reports.md",
  },
  {
    id: 2,
    title: "IAEA Scientific Analysis",
    category: "Data science and laboratory networks",
    images: [iaeaDashboard],
    description:
      "A global water analysis laboratory network dashboard tracking isotope types, measurement accuracy, and result quality for scientific monitoring and reporting.",
    link: "https://github.com/IoannisBekas/PowerBI-Dashboards/blob/main/IAEA%20-%20Global%20Water%20Analysis%20Laboratory%20Network.md",
  },
  {
    id: 3,
    title: "IFC Talent Strategy",
    category: "HR analytics and operations",
    images: [ifcDashboard],
    description:
      "A strategic HR dashboard analyzing global talent acquisition, application sources, and gender distribution to support workforce planning and leadership decisions.",
    link: "https://github.com/IoannisBekas/PowerBI-Dashboards/blob/main/World%20Bank%20HR%20Dashboard.md",
  },
] as const;

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Seo
        title="Portfolio and Selected Analytics Work"
        description="See BI Solutions portfolio work across UNICEF, IAEA, IFC, and strategic partnerships delivering analytics, dashboards, and digital transformation."
        path="/portfolio"
      />
      <Navbar />

      <main className="pt-32 pb-20">
        <PublicPageHero
          icon={BriefcaseBusiness}
          eyebrow="Selected BI Solutions work"
          title="Analytics systems, transformation partnerships, and reporting surfaces built for real operating use."
          description="This portfolio highlights a mix of strategic partnerships and decision-support work across finance, international organizations, scientific reporting, and HR analytics."
          actions={
            <>
              <Button asChild className="rounded-full bg-black px-8 text-white hover:bg-gray-800">
                <Link href="/contact">
                  Discuss a similar project
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-gray-300 px-8">
                <Link href="/services">View services</Link>
              </Button>
            </>
          }
          footer={
            <div className="grid gap-4 md:grid-cols-3">
              {portfolioHighlights.map((item) => (
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
              Portfolio selection
            </p>
            <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
              A mix of dashboard execution and broader transformation support.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              The work below ranges from live dashboard case material to a
              broader partnership where analytics, reporting, and digital
              operations had to move together.
            </p>
          </ScrollReveal>

          <div className="mt-10 space-y-8">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                reversed={index % 2 === 1}
              />
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-7xl px-6 md:px-12">
          <ScrollReveal width="100%">
            <div className="rounded-[2rem] bg-gray-950 px-8 py-10 text-white shadow-2xl shadow-black/[0.14] md:px-12">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Looking for something similar?
              </p>
              <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <h2 className="text-3xl font-bold font-heading tracking-tight md:text-4xl">
                    We can scope a dashboard, analytics workflow, or delivery system around your operating context.
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-gray-300">
                    The shape can be a one-off reporting surface, a model review,
                    or a broader build that connects architecture, analytics,
                    and decision support.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button asChild className="rounded-full bg-white px-8 text-black hover:bg-gray-100">
                    <Link href="/contact">
                      Start the conversation
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

function ProjectCard({
  project,
  index,
  reversed,
}: {
  project: (typeof projects)[number];
  index: number;
  reversed: boolean;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const hasMultipleImages = project.images.length > 1;

  return (
    <ScrollReveal delay={index * 0.08} width="100%">
      <article className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-2xl shadow-black/[0.06]">
        <div className={`flex flex-col ${reversed ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
          <div className="relative lg:w-[56%]">
            <div className="absolute left-5 top-5 z-10 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600 shadow-sm">
              {project.category}
            </div>
            <div className="overflow-hidden bg-gray-100" ref={emblaRef}>
              <div className="flex">
                {project.images.map((image, imageIndex) => (
                  <div
                    key={imageIndex}
                    className="relative min-w-0 flex-[0_0_100%] aspect-[16/10]"
                  >
                    <img
                      src={image}
                      alt={`${project.title} preview ${imageIndex + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {hasMultipleImages ? (
              <>
                <button
                  onClick={scrollPrev}
                  className="absolute left-5 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg transition-colors hover:bg-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={scrollNext}
                  className="absolute right-5 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg transition-colors hover:bg-white"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                  {project.images.map((_, imageIndex) => (
                    <button
                      key={imageIndex}
                      onClick={() => emblaApi?.scrollTo(imageIndex)}
                      className={`h-2 rounded-full transition-all ${
                        imageIndex === selectedIndex
                          ? "w-5 bg-white"
                          : "w-2 bg-white/60 hover:bg-white/90"
                      }`}
                      aria-label={`Go to slide ${imageIndex + 1}`}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>

          <div className="flex lg:w-[44%]">
            <div className="flex flex-1 flex-col justify-between px-6 py-8 md:px-8">
              <div>
                <h3 className="text-3xl font-bold font-heading tracking-tight text-gray-950 md:text-4xl">
                  {project.title}
                </h3>
                <p className="mt-5 text-base leading-relaxed text-gray-600">
                  {project.description}
                </p>
              </div>

              <div className="mt-8 border-t border-gray-100 pt-6">
                <p className="text-sm font-medium text-gray-500">
                  Reference material
                </p>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                  Open case
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </article>
    </ScrollReveal>
  );
}
