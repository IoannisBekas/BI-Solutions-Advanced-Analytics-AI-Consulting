import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ExternalLink,
  Layers3,
  LineChart,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Seo } from "@/components/seo/Seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PRODUCT_ROUTES } from "@/lib/routes";

const QUANTUS_APP_URL = import.meta.env.VITE_QUANTUS_URL || "/quantus/workspace/";

const heroMetrics = [
  { label: "Tracked signals", value: "847", icon: BarChart3 },
  { label: "Asset classes", value: "4", icon: Layers3 },
  { label: "Core model", value: "Meridian v2.4", icon: Brain },
];

const marketCoverage = [
  { label: "Coverage", value: "Equities, ETFs, crypto, and commodities", icon: TrendingUp },
  { label: "Flow", value: "Search, cached reports, deep dives, and sector packs", icon: Zap },
  { label: "Positioning", value: "Native BI Solutions product with a dedicated research workspace", icon: Shield },
];

const previewSignals = [
  { ticker: "NVDA", signal: "Strong Buy", change: "+4.2%" },
  { ticker: "MSFT", signal: "Buy", change: "+1.1%" },
  { ticker: "BTC-USD", signal: "Buy", change: "+2.8%" },
];

const capabilities = [
  {
    icon: Brain,
    title: "Signal Engine",
    description:
      "Combine regime detection, narrative synthesis, and model reasoning inside a single research motion.",
  },
  {
    icon: TrendingUp,
    title: "Cross-Asset Coverage",
    description:
      "Move across equities, ETFs, crypto, and commodities without switching tools or losing context.",
  },
  {
    icon: Shield,
    title: "Risk Framing",
    description:
      "See direction, downside, and volatility framing early so reports feel decision-oriented, not generic.",
  },
  {
    icon: Layers3,
    title: "Sector Packs",
    description:
      "Go beyond a single ticker and step into grouped market views when you need broader thematic context.",
  },
  {
    icon: LineChart,
    title: "Research Continuity",
    description:
      "Start with a cached report, then move deeper into product workflows instead of restarting the analysis elsewhere.",
  },
  {
    icon: Sparkles,
    title: "Premium Surface",
    description:
      "Quantus Investing now lives inside the BI Solutions ecosystem with a cleaner entry point and stronger product identity.",
  },
];

const workflowStages = [
  {
    title: "Start from a market idea",
    description:
      "Search a ticker, company, crypto pair, or commodity and open the workspace from a single entry point.",
  },
  {
    title: "Open a report fast",
    description:
      "Use cached coverage where available or generate a fresh report with signal, regime, and narrative context.",
  },
  {
    title: "Continue deeper",
    description:
      "Move into deep dives, sector packs, and more advanced Quantus Investing workflows without leaving the product shell.",
  },
];

/* ── tiny floating particle ── */
function FloatingOrb({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      style={{ animation: "float 8s ease-in-out infinite" }}
    />
  );
}

/* ── animated counter ── */
function AnimatedCounter({ value }: { value: string }) {
  const isNumber = /^\d+$/.test(value);
  const [displayed, setDisplayed] = useState(isNumber ? "0" : value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isNumber) return;
    const target = parseInt(value, 10);
    let frame: number;
    const duration = 1400;
    const start = performance.now();

    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * target).toString());
      if (progress < 1) frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, isNumber]);

  return <span ref={ref}>{displayed}</span>;
}

export default function QuantusPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 font-sans text-foreground">
      <Seo
        title="Quantus Investing"
        description="Quantus Investing is BI Solutions Group's AI-native quantitative research platform for signals, reports, sector packs, and institutional-style analysis."
        path={PRODUCT_ROUTES.quantus}
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Quantus Investing",
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web",
          url: `https://bisolutions.group${PRODUCT_ROUTES.quantus}`,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          publisher: {
            "@type": "Organization",
            name: "BI Solutions Group",
          },
        }}
      />

      {/* Global keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-24px) scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.6; }
          70% { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(1.15); opacity: 0; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      <Navbar />

      <main className="pt-32 pb-20">
        {/* ─── HERO ─── */}
        <section className="relative overflow-hidden px-6 pb-16 md:px-12">
          {/* Ambient background orbs */}
          <FloatingOrb className="left-[-5%] top-0 h-[420px] w-[420px] bg-gray-200/25" />
          <FloatingOrb className="right-[-8%] top-20 h-[500px] w-[500px] bg-gray-200/30" />
          <FloatingOrb className="bottom-[-10%] left-[40%] h-[400px] w-[400px] bg-gray-100/25" />
          <FloatingOrb className="right-[20%] top-[60%] h-[300px] w-[300px] bg-gray-100/20" />

          {/* Subtle grid pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative z-10 mx-auto grid max-w-7xl gap-12 xl:grid-cols-[0.92fr_1.08fr] xl:items-center">
            {/* Left column */}
            <ScrollReveal width="100%">
              <div className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm backdrop-blur-sm transition-all hover:border-gray-300 hover:shadow-md">
                <span className="relative flex h-2 w-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-black" />
                </span>
                Quantus Investing · Native product on bisolutions.group
              </div>

              <h1 className="mt-7 max-w-4xl text-4xl font-bold font-heading tracking-tight leading-[1.02] md:text-6xl xl:text-[4.7rem]">
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: "linear-gradient(135deg, rgb(10 10 10) 0%, rgb(26 26 46) 50%, rgb(22 33 62) 100%)",
                    backgroundSize: "200% 200%",
                    animation: "gradient-shift 6s ease infinite",
                  }}
                >
                  Institutional-grade
                </span>
                <span className="block bg-gradient-to-r from-gray-400 via-gray-350 to-gray-300 bg-clip-text text-transparent">
                  quantitative research, built for execution.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl">
                Quantus Investing helps teams search markets quickly, load research faster,
                and move into deeper signal workflows without the usual sprawl of
                disconnected tools and scattered analysis.
              </p>

              <div className="mt-8 space-y-3.5">
                {[
                  "Open cached reports instantly when coverage already exists.",
                  "Move from signal to narrative and sector context in one workspace.",
                  "Stay inside the BI Solutions ecosystem while using a dedicated product runtime.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-gray-700 md:text-base">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-white shadow-sm">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-9 flex flex-wrap gap-4">
                <a href={QUANTUS_APP_URL}>
                  <Button className="group/btn relative overflow-hidden rounded-full bg-black px-8 py-6 text-lg text-white shadow-lg shadow-black/20 transition-all duration-300 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5">
                    <span className="relative z-10 flex items-center gap-2">
                      Open Quantus Investing
                      <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black opacity-0 transition-opacity group-hover/btn:opacity-100" />
                  </Button>
                </a>
                <a href="/contact">
                  <Button
                    variant="outline"
                    className="rounded-full border-gray-300 bg-white/60 px-8 py-6 text-lg backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-0.5"
                  >
                    Talk to BI Solutions
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>

              {/* Metrics strip */}
              <div className="mt-11 grid gap-3 sm:grid-cols-3">
                {heroMetrics.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="group/metric rounded-2xl border border-gray-200/80 bg-white/70 px-5 py-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-gray-300 hover:bg-white hover:shadow-md"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-gray-400 transition-colors group-hover/metric:text-gray-600" />
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                          {item.label}
                        </p>
                      </div>
                      <p className="mt-2 text-2xl font-bold font-heading tracking-tight text-black">
                        <AnimatedCounter value={item.value} />
                      </p>
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>

            {/* Right column - Workspace preview */}
            <ScrollReveal width="100%" delay={0.12}>
              <div className="relative">
                {/* Glow behind card */}
                <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-gray-200/30 via-transparent to-gray-200/30 blur-2xl" />

                <Card className="relative rounded-[2rem] border-gray-200/80 bg-white/95 p-4 shadow-2xl shadow-black/10 backdrop-blur-sm">
                  <div className="rounded-[1.7rem] border border-gray-200/60 bg-gradient-to-b from-gray-50 to-gray-100 p-5 md:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                          Quantus Investing workspace preview
                        </p>
                        <h2 className="mt-2 text-2xl font-bold font-heading tracking-tight text-black md:text-[2rem]">
                          From search to signal in one place.
                        </h2>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 shadow-sm">
                        <span className="relative flex h-2 w-2">
                          <span className="inline-flex h-2 w-2 rounded-full bg-black" />
                        </span>
                        Live on the BI Solutions domain
                      </div>
                    </div>

                    <div className="mt-5 rounded-[1.4rem] border border-gray-200/60 bg-white p-4 shadow-inner shadow-gray-100/50">
                      {/* Search bar */}
                      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-50/50 px-4 py-3 transition-all duration-300 hover:border-gray-300 hover:shadow-sm">
                        <Search className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Search NVDA, BTC-USD, SPY, gold, or sector themes</span>
                      </div>

                      {/* Filter chips */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {["Equities", "Crypto", "Sector Packs", "Cached reports"].map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
                          >
                            {item}
                          </span>
                        ))}
                      </div>

                      {/* Preview content */}
                      <div className="mt-5 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                        {/* NVDA report snapshot */}
                        <div className="rounded-[1.4rem] border border-gray-200/80 bg-gradient-to-br from-gray-50 to-white p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                                Live report snapshot
                              </p>
                              <div className="mt-3 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-900 to-black text-white shadow-md">
                                  <Brain className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-lg font-bold font-heading text-black">NVDA</p>
                                  <p className="text-sm text-gray-500">Institutional research profile</p>
                                </div>
                              </div>
                            </div>
                            <div
                              className="rounded-full bg-gradient-to-br from-gray-900 to-gray-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm"
                            >
                              Meridian v2.4
                            </div>
                          </div>

                          <div className="mt-5 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-500">Confidence score</span>
                              <span className="font-semibold text-gray-900">82 / 100</span>
                            </div>
                            <div className="mt-3 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-2.5 rounded-full bg-gradient-to-r from-gray-900 to-gray-700 shadow-sm"
                                style={{ width: "82%" }}
                              />
                            </div>
                            <p className="mt-4 text-sm leading-relaxed text-gray-600">
                              Cached research gives teams a fast starting point before they
                              move into deeper signal interpretation and product workflows.
                            </p>
                          </div>
                        </div>

                        {/* Signal cards column */}
                        <div className="space-y-3">
                          {previewSignals.map((item) => (
                            <div
                              key={item.ticker}
                              className="group/sig rounded-[1.35rem] border border-gray-200/80 bg-white px-4 py-4 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{item.ticker}</p>
                                  <p className="mt-1 text-xs text-gray-500">Research-ready market snapshot</p>
                                </div>
                                <span className="text-sm font-mono font-medium text-gray-900">{item.change}</span>
                              </div>
                              <div className="mt-3">
                                <span
                                  className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm"
                                >
                                  {item.signal}
                                </span>
                              </div>
                            </div>
                          ))}

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[1.35rem] border border-gray-800 bg-gradient-to-br from-gray-900 to-black px-4 py-4 text-white shadow-lg shadow-black/20">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                                Sector packs
                              </p>
                              <p className="mt-3 text-sm leading-relaxed text-gray-300">
                                Step from a single ticker into grouped market context.
                              </p>
                            </div>
                            <div className="rounded-[1.35rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-4 py-4 shadow-sm">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                                Deep dives
                              </p>
                              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                                Technical, macro, and narrative follow-through in the same flow.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ─── MARKET COVERAGE STRIP ─── */}
        <section className="mx-auto mb-24 max-w-7xl px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {marketCoverage.map((item) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={item.label} width="100%">
                  <div className="group relative overflow-hidden rounded-3xl border border-gray-200/80 bg-gray-50/50 p-6 shadow-sm transition-all duration-300 hover:border-gray-300 hover:bg-white hover:shadow-md">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                        <Icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                        {item.label}
                      </p>
                    </div>
                    <p className="text-base leading-relaxed text-gray-700">
                      {item.value}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        {/* ─── CAPABILITIES ─── */}
        <section className="mx-auto mb-24 max-w-7xl px-6">
          <ScrollReveal className="mb-12" width="100%">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-sm font-medium text-gray-500 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Quantus Investing capabilities
              </div>
              <h2 className="mt-1 text-4xl font-bold font-heading tracking-tight md:text-5xl">
                A research product, not just a{" "}
                <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent">
                  report generator.
                </span>
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-gray-600">
                Quantus Investing is designed to help users move faster from idea to context,
                then from context into a deeper market workflow.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <ScrollReveal
                  key={feature.title}
                  delay={index * 0.08}
                  width="100%"
                >
                  <Card className="group h-full rounded-3xl border-gray-200/80 bg-white/90 p-7 shadow-lg shadow-black/[0.04] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/[0.08]">
                    <div className="relative mb-5">
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold font-heading tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">
                      {feature.description}
                    </p>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        {/* ─── WORKFLOW CTA ─── */}
        <section className="mx-auto mb-20 max-w-7xl px-6">
          <ScrollReveal width="100%">
            <div className="relative overflow-hidden rounded-[2rem] border border-gray-200/80 bg-white p-8 shadow-2xl shadow-black/[0.06] md:p-10">
              {/* Subtle gradient overlay in corner */}
              <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-gradient-to-bl from-gray-100/40 to-transparent blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-gradient-to-tr from-gray-100/30 to-transparent blur-3xl" />

              <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                <div>
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gray-900 to-black px-4 py-2 text-sm font-medium text-white shadow-md">
                    <Shield className="h-4 w-4" />
                    Research workflow
                  </div>
                  <h2 className="text-3xl font-bold font-heading tracking-tight md:text-4xl">
                    Quantus Investing should feel native to BI Solutions and still behave like a{" "}
                    <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent">
                      serious product.
                    </span>
                  </h2>
                  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
                    The public page should establish trust quickly, then hand users
                    into the dedicated Quantus Investing workspace for the actual research flow.
                  </p>

                  <div className="mt-8 rounded-3xl border border-gray-200/80 bg-gradient-to-br from-gray-50 to-white px-5 py-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-900">
                      Workspace URL
                    </p>
                    <p className="mt-2 break-all font-mono text-sm text-gray-500">
                      https://bisolutions.group/quantus/workspace/
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {workflowStages.map((item, index) => (
                    <div
                      key={item.title}
                      className="group rounded-3xl border border-gray-200/80 bg-gradient-to-br from-gray-50/80 to-white px-5 py-5 shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-md"
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {item.title}
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-gray-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <a href={QUANTUS_APP_URL} className="block">
                    <Button className="group/cta relative w-full overflow-hidden rounded-full bg-black py-6 text-lg text-white shadow-lg shadow-black/20 transition-all duration-300 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5">
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Enter Quantus Investing workspace
                        <ArrowRight className="h-5 w-5 transition-transform group-hover/cta:translate-x-1" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black opacity-0 transition-opacity group-hover/cta:opacity-100" />
                    </Button>
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
