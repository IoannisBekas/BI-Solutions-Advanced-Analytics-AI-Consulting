import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import unicefDashboard from "@/assets/dashboards/unicef_dashboard.png";
import iaeaDashboard from "@/assets/dashboards/iaea_dashboard.png";
import ifcDashboard from "@/assets/dashboards/ifc_dashboard.png";
import chaniaTaxImage from "@/assets/partnerships/chania_tax_office.png";
import chaniaTax1 from "@/assets/partnerships/chania_tax_1.png";
import chaniaTax2 from "@/assets/partnerships/chania_tax_2.png";
import chaniaTax3 from "@/assets/partnerships/chania_tax_3.png";
import chaniaTax4 from "@/assets/partnerships/chania_tax_4.png";

const projects = [
  {
    id: 1,
    title: "UNICEF Audit Reports Dashboard",
    category: "Risk Management / Strategy",
    images: [unicefDashboard],
    description: "A comprehensive oversight tool for Member States and senior management to track country-office audits.",
    link: "https://github.com/IoannisBekas/PowerBI-Dashboards/blob/main/UNICEF%20OIAI%20Country-Office%20Audit%20Reports.md"
  },
  {
    id: 2,
    title: "IAEA Scientific Analysis",
    category: "Data Science / Laboratory Network",
    images: [iaeaDashboard],
    description: "Global Water Analysis Laboratory Network dashboard tracking isotope types, measurement accuracy, and result quality.",
    link: "https://github.com/IoannisBekas/PowerBI-Dashboards/blob/main/IAEA%20-%20Global%20Water%20Analysis%20Laboratory%20Network.md"
  },
  {
    id: 3,
    title: "IFC Talent Strategy",
    category: "HR Analytics / Operations",
    images: [ifcDashboard],
    description: "Strategic HR dashboard analyzing global talent acquisition, application sources, and gender distribution.",
    link: "https://github.com/IoannisBekas/PowerBI-Dashboards/blob/main/World%20Bank%20HR%20Dashboard.md"
  },
  {
    id: 4,
    title: "Chania Tax IKE",
    category: "Strategic Partnership",
    images: [chaniaTaxImage, chaniaTax1, chaniaTax2, chaniaTax3, chaniaTax4],
    description: "A strategic partnership driving digital transformation in the financial sector. We implemented secure cloud infrastructure, automated reporting systems, and advanced analytics to optimize operational efficiency and decision-making for Chania's leading tax consultancy.",
    link: "https://chaniatax.gr/"
  }
];

function ProjectCard({ project, index }: { project: typeof projects[0], index: number }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

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
    <ScrollReveal delay={index * 0.1} className="w-full">
      <div className="group block mb-12">
        {/* Carousel Container */}
        <div className="relative overflow-hidden rounded-2xl mb-8 bg-gray-100 border border-gray-200">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {project.images.map((img, i) => (
                <div key={i} className="flex-[0_0_100%] min-w-0 aspect-[16/9] relative">
                  <img
                    src={img}
                    alt={`${project.title} - Image ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay for single image usage (hover effect) */}
                  {!hasMultipleImages && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          {hasMultipleImages && (
            <>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); scrollPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white z-10"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); scrollNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white z-10"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>

              {/* Dots Pagination */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {project.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); emblaApi?.scrollTo(i); }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i === selectedIndex ? "bg-white w-4" : "bg-white/50 hover:bg-white/80"
                      }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Project Info */}
        <a
          href={project.link}
          target={project.link !== "#" ? "_blank" : undefined}
          rel={project.link !== "#" ? "noopener noreferrer" : undefined}
          className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 cursor-pointer"
          onClick={(e) => project.link === "#" && e.preventDefault()}
        >
          <div>
            <h3 className={`text-3xl font-bold mb-2 ${project.link !== "#" ? "hover:underline decoration-2 underline-offset-4" : ""}`}>
              {project.title}
            </h3>
            <p className="text-lg text-gray-500 font-medium mb-4">{project.category}</p>
            <p className="text-gray-600 max-w-2xl leading-relaxed">
              {project.description}
            </p>
          </div>
          {project.link !== "#" && (
            <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all flex-shrink-0">
              <ExternalLink size={20} />
            </div>
          )}
        </a>
      </div>
    </ScrollReveal>
  );
}

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <ScrollReveal>
            <h1 className="text-5xl md:text-7xl font-bold font-heading mb-8">Selected Work</h1>
            <p className="text-xl text-gray-600 max-w-2xl mb-20">
              Transforming complex data into clear, actionable insights through advanced analytics and intuitive design.
            </p>
          </ScrollReveal>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 gap-20">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
