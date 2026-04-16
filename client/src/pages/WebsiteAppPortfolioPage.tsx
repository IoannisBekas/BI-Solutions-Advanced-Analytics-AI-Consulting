import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ExternalLink,
  Globe,
  MonitorSmartphone,
  Play,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Seo } from "@/components/seo/Seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PRODUCT_ROUTE_ALIASES } from "@/lib/routes";
import { withSiteBase } from "@/lib/site";
import michailKarnasPreview from "@/assets/portfolio/michail-karnas-preview.svg";
import rythmikiDrapetsonaPreview from "@/assets/portfolio/rythmiki-drapetsona-preview.jpg";
import mathimatikosIcon from "@/assets/portfolio/mathimatikos-icon.png";
import barberPreview from "@/assets/portfolio/barber-preview.png";
import karnasShowcase from "@/assets/portfolio/karnas-showcase.mp4";
import mathShowcase from "@/assets/portfolio/math-showcase.mp4";
import rythdrapShowcase from "@/assets/portfolio/rythdrap-showcase.mp4";
import barberShowcase from "@/assets/portfolio/barber-showcase.mp4";

const portfolioMetrics = [
  { label: "Live launches", value: "4" },
  { label: "Delivery formats", value: "Websites + web apps" },
  { label: "Audience range", value: "Personal, local, service, and education" },
];

const showcaseProjects = [
  {
    name: "Michail Karnas",
    subtitle: "Senior Analytics Engineer portfolio",
    category: "Personal portfolio",
    url: "https://ioannisbekas.github.io/michail-karnas-portfolio/",
    description:
      "A polished personal portfolio for an analytics engineer, built to frame experience, selected work, and contact pathways in a stronger narrative.",
    highlights: [
      "Editorial hero and tailored personal branding",
      "Portfolio storytelling around analytics and BI work",
      "Career-focused structure with clear navigation",
    ],
    techStack: ["React", "Tailwind CSS", "Vite", "GitHub Pages"],
    results: ["Lighthouse 95+", "Sub-2s load time", "Mobile-first responsive"],
    previewVideo: karnasShowcase,
    posterImage: michailKarnasPreview,
    videoClassName: "object-cover object-center",
    accentClassName: "from-sky-50 via-white to-stone-100",
  },
  {
    name: "Ρυθμική Δραπετσώνας",
    subtitle: "Club website for rhythmic gymnastics",
    category: "Organization website",
    url: "https://ioannisbekas.github.io/Rythm-Drap/",
    description:
      "A Greek-language website for a rhythmic gymnastics club, organized around programs, schedule information, parent communication, and local trust-building.",
    highlights: [
      "Greek-first copy and audience-specific structure",
      "Program, timetable, testimonial, and contact sections",
      "Community-oriented design for a local organization",
    ],
    techStack: ["React", "Tailwind CSS", "Vite", "GitHub Pages"],
    results: ["Local SEO optimized", "Bilingual support", "Mobile-first"],
    previewVideo: rythdrapShowcase,
    posterImage: rythmikiDrapetsonaPreview,
    videoClassName: "object-cover object-center",
    accentClassName: "from-rose-50 via-white to-amber-50",
  },
  {
    name: "Blade & Comb",
    subtitle: "Barbershop website and booking flow",
    category: "Service business website",
    url: "https://ioannisbekas.github.io/Barber/",
    description:
      "A barbershop landing page built around service discovery, bilingual navigation, and a fast appointment-booking flow tailored for both walk-ins and scheduled visits.",
    highlights: [
      "Editorial service list with hover-driven video previews",
      "Booking modal with service, barber, date, and time selection",
      "English and Greek language toggle for local-market accessibility",
    ],
    techStack: ["HTML", "CSS", "JavaScript", "GSAP"],
    results: ["Booking-first UX", "Bilingual toggle", "Mobile responsive"],
    previewVideo: barberShowcase,
    posterImage: barberPreview,
    videoClassName: "object-cover object-center",
    accentClassName: "from-stone-100 via-white to-zinc-200",
  },
  {
    name: "Mathimatikos.xyz",
    subtitle: "AI math learning platform",
    category: "Education web app",
    url: "https://mathimatikos.xyz/",
    description:
      "An AI-powered math learning product with step-by-step solving, practice generation, and a more app-like learning flow than a conventional marketing site.",
    highlights: [
      "AI-powered math learning workflow",
      "Step-by-step solutions and custom problem generation",
      "Product-style surface tuned for repeat use",
    ],
    techStack: ["React", "TypeScript", "Tailwind CSS", "Claude API"],
    results: ["AI-native UX", "Real-time problem solving", "Repeat engagement"],
    previewVideo: mathShowcase,
    posterImage: mathimatikosIcon,
    videoClassName: "object-cover object-center",
    accentClassName: "from-slate-950 via-slate-900 to-violet-950",
  },
] as const;

const portfolioFaqs = [
  {
    question: "What technologies do you use to build websites and apps?",
    answer:
      "We primarily build with React, TypeScript, and Tailwind CSS, deployed on fast platforms like Vercel and GitHub Pages. For AI-powered features we integrate the Claude API and other modern tooling depending on the project's needs.",
  },
  {
    question: "How long does a typical website or app project take?",
    answer:
      "A focused portfolio or organization website typically ships in 2\u20134 weeks. Product-style web applications with AI features or complex workflows take 4\u20138 weeks depending on scope. We scope every project with a clear timeline before starting.",
  },
  {
    question: "Do you offer ongoing maintenance and support?",
    answer:
      "Yes. Every project includes a post-launch support window. We also offer ongoing retainers for content updates, performance monitoring, analytics review, and feature additions.",
  },
  {
    question: "Can you build something similar for my business or project?",
    answer:
      "Absolutely. Each build shown here solved a different communication problem \u2014 personal positioning, local organization visibility, service-business bookings, or product-led learning. We adapt the same delivery discipline to your specific context and audience.",
  },
];

function LazyPreviewVideo({
  src,
  poster,
  label,
  className,
}: {
  src: string;
  poster: string;
  label: string;
  className: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;

    const element = containerRef.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setShouldLoad(true);
        observer.disconnect();
      },
      {
        rootMargin: "240px 0px",
        threshold: 0.15,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [shouldLoad]);

  useEffect(() => {
    if (!shouldLoad || !videoRef.current) return;

    const video = videoRef.current;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [shouldLoad]);

  const handlePlayClick = () => {
    if (!videoRef.current) return;
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {shouldLoad ? (
        <>
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="metadata"
            poster={poster}
            className={`h-full w-full ${className}`}
            aria-label={label}
          >
            <source src={src} type="video/mp4" />
          </video>
          {!isPlaying && (
            <button
              onClick={handlePlayClick}
              className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors hover:bg-black/20"
              aria-label={`Play ${label}`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                <Play className="h-5 w-5 fill-gray-900 text-gray-900" />
              </div>
            </button>
          )}
        </>
      ) : (
        <img
          src={poster}
          alt={label}
          loading="lazy"
          className={`h-full w-full ${className}`}
        />
      )}
    </div>
  );
}

function PortfolioMetricCard({
  label,
  value,
  delay,
}: {
  label: string;
  value: string;
  delay: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/80 px-5 py-5"
    >
      <motion.div
        initial={{ scaleX: 0, opacity: 0.55 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.65, delay: delay + 0.12, ease: "easeOut" }}
        className="absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-black via-gray-500 to-transparent"
      />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
        {label}
      </p>
      <p className="mt-3 text-lg font-semibold text-gray-900">
        {value}
      </p>
    </motion.div>
  );
}

function PortfolioProjectCard({
  project,
  reversed,
}: {
  project: (typeof showcaseProjects)[number];
  reversed?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.09,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
      },
    },
  };

  const mediaVariants = shouldReduceMotion
    ? {
        hidden: { opacity: 0.001 },
        visible: {
          opacity: 1,
          transition: { duration: 0.35 },
        },
      }
    : {
        hidden: {
          opacity: 0,
          y: 28,
          scale: 0.96,
          clipPath: "inset(14% 10% 14% 10% round 1.3rem)",
        },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          clipPath: "inset(0% 0% 0% 0% round 1.3rem)",
          transition: {
            duration: 0.85,
          },
        },
      };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-90px" }}
    >
      <Card className="overflow-hidden rounded-[2rem] border-gray-200/80 bg-white shadow-xl shadow-black/[0.08]">
        <div
          className={`flex flex-col ${reversed ? "lg:flex-row-reverse" : "lg:flex-row"}`}
        >
          {/* Media side */}
          <motion.div variants={itemVariants} className="lg:w-[55%]">
            <div
              className={`h-full rounded-[2rem] bg-gradient-to-br ${project.accentClassName}`}
            >
              <div className="flex items-center justify-between px-5 pt-5">
                <motion.span
                  variants={itemVariants}
                  className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600 shadow-sm"
                >
                  {project.category}
                </motion.span>
                <motion.a
                  variants={itemVariants}
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/85 text-gray-700 shadow-sm transition-colors hover:text-black"
                  aria-label={`Open ${project.name}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </motion.a>
              </div>

              <div className="aspect-[16/10] overflow-hidden px-5 pb-5 pt-4">
                <motion.div
                  variants={mediaVariants}
                  className="h-full overflow-hidden rounded-[1.3rem] border border-white/80 bg-white/70 shadow-lg shadow-black/5"
                >
                  <LazyPreviewVideo
                    src={project.previewVideo}
                    poster={project.posterImage}
                    label={`${project.name} showcase video`}
                    className={project.videoClassName}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Content side */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col justify-center px-6 py-8 lg:w-[45%] lg:px-10 lg:py-10"
          >
            <p className="text-sm font-medium text-gray-500">
              {project.subtitle}
            </p>
            <h3 className="mt-2 text-3xl font-bold font-heading tracking-tight text-gray-950 lg:text-4xl">
              {project.name}
            </h3>
            <motion.div
              variants={itemVariants}
              className="mt-4 h-px w-16 origin-left bg-gradient-to-r from-black to-transparent"
            />
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              {project.description}
            </p>

            <div className="mt-6 space-y-3">
              {project.highlights.map((highlight) => (
                <motion.div
                  key={highlight}
                  variants={itemVariants}
                  className="flex gap-3 text-sm leading-relaxed text-gray-600"
                >
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <span>{highlight}</span>
                </motion.div>
              ))}
            </div>

            {/* Tech stack badges */}
            <motion.div variants={itemVariants} className="mt-6 flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600"
                >
                  {tech}
                </span>
              ))}
            </motion.div>

            {/* Results */}
            <motion.div
              variants={itemVariants}
              className="mt-5 flex flex-wrap gap-3"
            >
              {project.results.map((result) => (
                <span
                  key={result}
                  className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                >
                  {result}
                </span>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8">
              <a href={project.url} target="_blank" rel="noreferrer">
                <Button className="rounded-full bg-black px-6 text-white hover:bg-gray-800">
                  Visit live site
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function WebsiteAppPortfolioPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Seo
        title="Website & App Portfolio | BI Dashboards, Websites, and Web Apps"
        description="Explore BI Solutions delivery work across portfolio websites, organization sites, and AI-powered app experiences."
        path={PRODUCT_ROUTE_ALIASES.websiteAppPortfolio}
        keywords={[
          "website app portfolio",
          "BI dashboard portfolio",
          "web app delivery portfolio",
          "organization website development",
          "BI Solutions case studies",
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              name: "BI Solutions Website & App Portfolio",
              url: `https://bisolutions.group${PRODUCT_ROUTE_ALIASES.websiteAppPortfolio}`,
              hasPart: showcaseProjects.map((project) => project.url),
            },
            {
              "@type": "FAQPage",
              mainEntity: portfolioFaqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://bisolutions.group/" },
                { "@type": "ListItem", position: 2, name: "Products", item: "https://bisolutions.group/products" },
                { "@type": "ListItem", position: 3, name: "Website & App Portfolio", item: `https://bisolutions.group${PRODUCT_ROUTE_ALIASES.websiteAppPortfolio}` },
              ],
            },
          ],
        }}
      />
      <Navbar />

      <main className="pt-32 pb-20">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pb-10 md:px-12">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-20 top-12 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
            <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-sky-200/20 blur-3xl" />
            <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-rose-200/15 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl">
            <ScrollReveal width="100%">
              <div className="rounded-[2rem] border border-gray-200 bg-white/90 px-8 py-12 shadow-xl shadow-black/5 md:px-12 md:py-16">
                <div className="inline-flex items-center gap-2 rounded-full bg-black/5 px-4 py-2 text-sm font-medium text-gray-600">
                  <MonitorSmartphone className="h-4 w-4" />
                  Website & App Portfolio
                </div>
                <h1 className="mt-6 max-w-5xl text-5xl font-bold font-heading leading-tight tracking-tight md:text-6xl">
                  Selected web experiences designed and shipped by BI Solutions.
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-relaxed text-gray-600">
                  This portfolio page groups live BI Solutions website and app
                  work into one place, spanning personal branding, service
                  businesses, organization websites, and AI-native education
                  product experiences.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a href="#featured-sites">
                    <Button className="rounded-full bg-black px-8 text-white hover:bg-gray-800">
                      View featured sites
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                  <a href={withSiteBase("/contact")}>
                    <Button
                      variant="outline"
                      className="rounded-full border-gray-300 px-8"
                    >
                      Discuss a website or app build
                    </Button>
                  </a>
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-3">
                  {portfolioMetrics.map((item, index) => (
                    <PortfolioMetricCard
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      delay={index * 0.08}
                    />
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Featured projects — stacked layout */}
        <section
          id="featured-sites"
          className="mx-auto mb-16 max-w-7xl px-6 md:px-12"
        >
          <ScrollReveal className="mb-10" width="100%">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600">
                <Globe className="h-4 w-4" />
                Featured launches
              </div>
              <h2 className="mt-5 text-4xl font-bold font-heading tracking-tight md:text-5xl">
                Four live builds, each tuned to a different audience and workflow.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-gray-600">
                The same delivery discipline adapts to different contexts:
                personal positioning, local organization visibility,
                appointment-led service businesses, and a product-led learning
                application.
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-10">
            {showcaseProjects.map((project, index) => (
              <ScrollReveal
                key={project.name}
                delay={index * 0.08}
                width="100%"
              >
                <PortfolioProjectCard
                  project={project}
                  reversed={index % 2 === 1}
                />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Mid-page CTA */}
        <section className="mx-auto mb-16 max-w-7xl px-6 md:px-12">
          <ScrollReveal width="100%">
            <Card className="rounded-3xl border-gray-200 bg-gradient-to-br from-gray-950 to-gray-800 p-10 text-center shadow-2xl md:p-14">
              <h2 className="text-3xl font-bold font-heading tracking-tight text-white md:text-4xl">
                Have a similar project in mind?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-300">
                Whether you need a personal portfolio, an organization website,
                or a product-style web application, we can scope and deliver it.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a href={withSiteBase("/contact")}>
                  <Button className="rounded-full bg-white px-8 text-gray-900 hover:bg-gray-100">
                    Start a conversation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <a href={withSiteBase("/services")}>
                  <Button
                    variant="outline"
                    className="rounded-full border-gray-500 px-8 text-gray-300 hover:bg-white/10 hover:text-white"
                  >
                    View all services
                  </Button>
                </a>
              </div>
            </Card>
          </ScrollReveal>
        </section>

        {/* FAQ */}
        <section className="mx-auto mb-20 max-w-7xl px-6 md:px-12">
          <ScrollReveal width="100%">
            <Card className="rounded-3xl border-gray-200 bg-white p-8 shadow-xl shadow-black/[0.08] md:p-10">
              <h2 className="text-3xl font-bold font-heading tracking-tight md:text-4xl">
                Website & App Portfolio FAQ
              </h2>
              <div className="mt-6 space-y-4">
                {portfolioFaqs.map((faq) => (
                  <div key={faq.question} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </Card>
          </ScrollReveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
