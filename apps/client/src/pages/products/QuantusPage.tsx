import type { FormEvent } from "react";
import {
  ArrowRight,
  BarChart3,
  Brain,
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
import { PRODUCT_ROUTE_ALIASES } from "@/lib/routes";
import { withPublicSiteOrigin, withSiteBase } from "@/lib/site";
import heroBg from "@/assets/generated_images/hero_bg_3d.png";

const QUANTUS_APP_URL =
  import.meta.env.VITE_QUANTUS_URL || withPublicSiteOrigin("/quantus/workspace/");

const heroMetrics = [
  { label: "ML/Statistical models", value: "12", icon: Brain },
  { label: "Report sections", value: "7", icon: Layers3 },
  { label: "Backtested equities", value: "400+", icon: BarChart3 },
];

const proofPoints = [
  "Cached reports open instantly when coverage already exists.",
  "Every signal includes a 7-factor confidence breakdown.",
  "Accuracy is visible through public backtesting by regime, sector, and market cap.",
];

const marketCoverage = [
  {
    label: "Coverage",
    value:
      "Equities, ETFs, crypto, and commodities across 10 sector groupings.",
    icon: TrendingUp,
  },
  {
    label: "Data sources",
    value:
      "SEC EDGAR, FRED, and CBOE as primary sources, plus real-time sentiment from Grok/X, Reddit, and NewsAPI.",
    icon: Shield,
  },
  {
    label: "Validation",
    value:
      "Walk-forward backtesting since 2018 with a public accuracy dashboard segmented by signal, regime, sector, and market cap.",
    icon: Zap,
  },
];

const previewSignals = [
  { ticker: "NVDA", signal: "Strong Buy", change: "+4.2%" },
  { ticker: "MSFT", signal: "Buy", change: "+1.1%" },
  { ticker: "BTC-USD", signal: "Buy", change: "+2.8%" },
];

const confidenceFactors = [
  { label: "Momentum", value: "86", width: "w-[86%]" },
  { label: "Regime alignment", value: "78", width: "w-[78%]" },
  { label: "Model agreement", value: "91", width: "w-[91%]" },
];

const capabilities = [
  {
    icon: Brain,
    title: "12-Model Ensemble",
    description:
      "LSTM (45%), Prophet (35%), and ARIMA (20%) form the core forecasting stack, with additional models covering sentiment, risk, options, factor analysis, and reinforcement learning.",
  },
  {
    icon: Layers3,
    title: "7-Section Research Reports",
    description:
      "Each report combines executive summary, ensemble forecasts, regime detection, risk framing, strategy guidance, and on-demand deep dives in a single research workflow.",
  },
  {
    icon: TrendingUp,
    title: "Regime-Aware Signals",
    description:
      "Signals are generated after classifying the market into one of five regimes so model weighting, strategy framing, and position sizing change with conditions.",
  },
  {
    icon: LineChart,
    title: "Sector Packs",
    description:
      "Pre-generated teardowns for the top 20 tickers across 10 sectors let users move beyond one-off reports into grouped market context.",
  },
  {
    icon: Shield,
    title: "Accuracy Dashboard",
    description:
      "Backtested outcomes are segmented by signal type, engine version, regime, sector, and market cap so performance can be checked in context.",
  },
  {
    icon: Sparkles,
    title: "Confidence Scoring",
    description:
      "A 0-100 composite score combines Momentum, Sentiment, Regime Alignment, Model Ensemble Agreement, Alternative Data, Macro Context, and Data Quality.",
  },
];

const workflowStages = [
  {
    title: "Search any asset",
    description:
      "Enter a ticker, company, crypto pair, or commodity. Cached reports load instantly when coverage exists, or generate a fresh report in seconds.",
  },
  {
    title: "Read the full research report",
    description:
      "Review a 7-section report with executive summary, ensemble forecasts, regime classification, risk framing, strategy recommendations, and deep dives.",
  },
  {
    title: "Track, compare, and act",
    description:
      "Use watchlists, signal-change alerts, and archive comparisons to follow how a name changes over time.",
  },
];

const quantusFaqs = [
  {
    question: "What data sources does Quantus use?",
    answer:
      "Quantus uses a tiered data source system. Tier A includes SEC EDGAR filings, FRED economic data, and CBOE volatility indices. Tier B includes Yahoo Finance and Financial Modeling Prep for price data. Tier C includes Grok/X, Reddit, and NewsAPI for sentiment - these are advisory inputs and never override Tier A sources.",
  },
  {
    question: "How many models are in the ensemble?",
    answer:
      "Meridian v2.4 runs 12 ML and statistical models. The three core forecasting models are LSTM (45% weight), Prophet (35%), and ARIMA (20%). The remaining nine cover sentiment analysis, mean reversion, portfolio optimization, SHAP explainability, high-frequency signals, VaR risk, options pricing, reinforcement learning, and factor analysis.",
  },
  {
    question: "How is accuracy measured?",
    answer:
      "The Accuracy Dashboard tracks resolved outcomes from persisted report snapshots. Results are segmented by signal type, engine version, market regime, sector, and market cap so users can evaluate Quantus performance in conditions relevant to their strategy.",
  },
  {
    question: "What does the confidence score mean?",
    answer:
      "The confidence score (0-100) is a weighted composite of seven sub-signals: Momentum, Sentiment, Regime Alignment, Model Ensemble Agreement, Alternative Data, Macro Context, and Data Quality. A score with low data quality should be interpreted differently than the same score with high data quality.",
  },
  {
    question: "What asset classes are covered?",
    answer:
      "Equities, ETFs, cryptocurrencies, and commodities. Sector Packs provide pre-generated coverage for the top 20 tickers across 10 sectors, refreshed every 96 hours. Individual reports can be generated for any supported ticker on demand.",
  },
  {
    question: "Is this financial advice?",
    answer:
      "No. Quantus Investing is a research and analysis tool. It supports investment research workflows but does not provide financial advice, manage portfolios, or execute trades. All signals, scores, and recommendations are informational. Final interpretation and investment decisions remain with the user.",
  },
  {
    question: "Can I compare old reports to current ones?",
    answer:
      "Yes. The Archive stores every report snapshot with a unique report ID. You can load any historical snapshot and run a side-by-side diff against the current report to see how signals, regime classification, and confidence scores have changed over time.",
  },
];

function buildQuantusReportUrl(ticker: string) {
  const base = QUANTUS_APP_URL.endsWith("/")
    ? QUANTUS_APP_URL
    : `${QUANTUS_APP_URL}/`;

  return `${base}report/${encodeURIComponent(ticker)}`;
}

export default function QuantusPage() {
  const quantusWorkspaceDisplayUrl = new URL(
    QUANTUS_APP_URL,
    window.location.origin,
  ).toString();

  function openWorkspace() {
    window.location.href = QUANTUS_APP_URL;
  }

  function openReport(ticker: string) {
    window.location.href = buildQuantusReportUrl(ticker);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = (
      event.currentTarget.elements.namedItem("ticker") as HTMLInputElement | null
    )?.value
      ?.trim()
      .toUpperCase();

    if (input) openReport(input);
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Seo
        title="Quantus Investing | AI-Native Quantitative Research Platform"
        description="Quantus Investing delivers 7-section research reports powered by a 12-model ML ensemble, 5-regime market classification, and a public accuracy dashboard with backtested track records."
        path={PRODUCT_ROUTE_ALIASES.quantus}
        type="website"
        keywords={[
          "Quantus Investing",
          "ML ensemble forecasting",
          "backtested accuracy dashboard",
          "regime detection",
          "confidence scoring",
          "quantitative research platform",
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              name: "Quantus Investing",
              url: `https://www.bisolutions.group${PRODUCT_ROUTE_ALIASES.quantus}`,
              description:
                "7-section research reports powered by a 12-model ML ensemble with public backtested accuracy.",
            },
            {
              "@type": "SoftwareApplication",
              name: "Quantus Investing",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              url: `https://www.bisolutions.group${PRODUCT_ROUTE_ALIASES.quantus}`,
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              publisher: {
                "@type": "Organization",
                name: "BI Solutions Group",
              },
            },
            {
              "@type": "FAQPage",
              mainEntity: quantusFaqs.map((faq) => ({
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
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://www.bisolutions.group/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Products",
                  item: "https://www.bisolutions.group/products",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Quantus Investing",
                  item: `https://www.bisolutions.group${PRODUCT_ROUTE_ALIASES.quantus}`,
                },
              ],
            },
          ],
        }}
      />
      <Navbar />

      <main className="pb-20">
        <section className="relative isolate overflow-hidden px-0 pb-16 pt-32 sm:pt-36 md:pb-20">
          <div className="absolute inset-0 -z-10">
            <div
              className="absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${heroBg})` }}
            />
            <div className="absolute inset-0 bg-white/45" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white" />
          </div>

          <div className="mx-auto grid max-w-7xl gap-10 px-6 md:px-12 lg:min-h-[620px] lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.85fr)] lg:items-center">
            <ScrollReveal width="100%">
              <div className="max-w-4xl">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/75 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm shadow-black/[0.04] backdrop-blur">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-white shadow-lg shadow-black/10">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  Quantitative research workspace
                </div>

                <h1 className="mt-6 max-w-5xl text-5xl font-bold font-heading leading-[1.05] tracking-tight text-gray-950 sm:text-6xl lg:text-7xl">
                  Quantus Investing
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-relaxed text-gray-700 md:text-xl">
                  AI-native market research that turns a ticker into an
                  explainable signal, a 7-section report, and an accuracy trail
                  you can verify before acting.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Button
                    asChild
                    className="h-12 rounded-full bg-black px-7 text-base text-white hover:bg-gray-800 sm:h-14 sm:px-8 sm:text-lg"
                  >
                    <a href={QUANTUS_APP_URL}>
                      Open Quantus workspace
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-12 rounded-full border-gray-300 bg-white/70 px-7 text-base backdrop-blur hover:bg-white sm:h-14 sm:px-8 sm:text-lg"
                  >
                    <a href={withSiteBase("/contact")}>
                      Talk to BI Solutions
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>

                <div className="mt-8 grid max-w-3xl grid-cols-3 gap-2 sm:gap-3">
                  {heroMetrics.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-gray-200 bg-white/75 px-3 py-3 shadow-sm shadow-black/[0.03] backdrop-blur sm:px-4 sm:py-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="hidden h-9 w-9 items-center justify-center rounded-xl bg-black text-white sm:flex">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="text-xl font-bold font-heading tracking-tight text-gray-950 sm:text-2xl">
                            {item.value}
                          </span>
                        </div>
                        <p className="mt-2 text-[0.62rem] font-semibold uppercase leading-tight tracking-[0.08em] text-gray-500 sm:mt-3 sm:text-xs sm:tracking-[0.16em]">
                          {item.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 hidden max-w-3xl gap-3 2xl:grid 2xl:grid-cols-3">
                  {proofPoints.map((item, index) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/80 bg-white/60 px-4 py-4 text-sm leading-relaxed text-gray-700 shadow-sm shadow-black/[0.03] backdrop-blur"
                    >
                      <span className="mb-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.12} width="100%">
              <div className="relative overflow-hidden rounded-[2rem] border border-gray-200/80 bg-white/90 p-4 shadow-2xl shadow-black/[0.12] backdrop-blur-xl md:p-5 lg:max-w-[540px] lg:justify-self-end">
                <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-black/30 to-transparent" />

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                      Live research preview
                    </p>
                    <h2 className="mt-2 text-xl font-bold font-heading tracking-tight text-gray-950">
                      Search to signal in one place
                    </h2>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600">
                    <span className="inline-flex h-2 w-2 rounded-full bg-black" />
                    Meridian v2.4
                  </div>
                </div>

                <form
                  onSubmit={handleSearchSubmit}
                  className="mt-4 flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2.5 shadow-sm shadow-black/[0.03] transition-colors focus-within:border-gray-400"
                >
                  <Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <input
                    name="ticker"
                    type="text"
                    placeholder="Search NVDA, BTC-USD, SPY, gold, or sector themes"
                    className="min-w-0 flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-500"
                    autoComplete="off"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-black text-white hover:bg-gray-800"
                    aria-label="Search Quantus reports"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>

                <div className="mt-4 flex flex-wrap gap-2">
                  {["Equities", "Crypto", "Sector Packs", "Cached reports"].map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={openWorkspace}
                        className="cursor-pointer rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
                      >
                        {item}
                      </button>
                    ),
                  )}
                </div>

                <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
                  {previewSignals.map((item) => (
                    <button
                      key={item.ticker}
                      type="button"
                      onClick={() => openReport(item.ticker)}
                      className="w-full cursor-pointer rounded-2xl border border-gray-200 bg-white px-3.5 py-3 text-left shadow-sm shadow-black/[0.02] transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-950">
                            {item.ticker}
                          </p>
                          <p className="mt-1 hidden text-xs text-gray-500">
                            Research-ready market snapshot
                          </p>
                        </div>
                        <span className="text-sm font-medium text-emerald-700">
                          {item.change}
                        </span>
                      </div>
                      <span className="mt-2 inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                        {item.signal}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 hidden rounded-2xl bg-gray-950 p-4 text-white shadow-xl shadow-black/[0.12] sm:block">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                        Confidence mix
                      </p>
                      <h3 className="mt-2 text-xl font-bold font-heading">
                        NVDA signal quality
                      </h3>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-950">
                      91
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {confidenceFactors.map((factor) => (
                      <div key={factor.label}>
                        <div className="mb-2 flex items-center justify-between text-xs text-gray-300">
                          <span>{factor.label}</span>
                          <span>{factor.value}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`${factor.width} h-full rounded-full bg-white`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="mx-auto mb-20 max-w-7xl px-6">
          <div className="grid auto-rows-fr gap-6 md:grid-cols-3">
            {marketCoverage.map((item, index) => {
              const Icon = item.icon;

              return (
                <ScrollReveal
                  key={item.label}
                  delay={index * 0.08}
                  width="100%"
                >
                  <Card className="h-full rounded-2xl border-gray-100 bg-white/85 p-6 backdrop-blur-sm transition-all duration-300 hover:border-gray-200 hover:shadow-lg">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                      {item.label}
                    </p>
                    <p className="mt-4 text-base leading-relaxed text-gray-600">
                      {item.value}
                    </p>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mb-20 max-w-7xl px-6">
          <ScrollReveal className="mb-12" width="100%">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-black/5 px-4 py-2 text-sm font-medium text-gray-600">
                <Sparkles className="h-4 w-4" />
                Quantus Investing capabilities
              </div>
              <h2 className="text-4xl font-bold font-heading tracking-tight md:text-5xl">
                Built on 12 models, verified through public backtesting
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-gray-600">
                Every capability below is backed by documented methodology,
                tiered data sourcing, and walk-forward validation across 400+
                equities since 2018.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <ScrollReveal
                  key={feature.title}
                  delay={index * 0.08}
                  width="100%"
                >
                  <Card className="h-full rounded-2xl border-gray-100 bg-white/85 p-6 backdrop-blur-sm transition-all duration-300 hover:border-gray-200 hover:shadow-lg">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold font-heading">
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

        <section className="mx-auto mb-16 max-w-7xl px-6">
          <ScrollReveal width="100%">
            <Card className="rounded-3xl border-gray-200 bg-white p-8 shadow-2xl md:p-10">
              <div className="grid min-w-0 gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                <div className="min-w-0">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white">
                    <Shield className="h-4 w-4" />
                    Public methodology, clear launch path
                  </div>
                  <h2 className="text-3xl font-bold font-heading tracking-tight md:text-4xl">
                    Launch a Quantus workflow without leaving the BI Solutions
                    ecosystem
                  </h2>
                  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
                    The BI Solutions site acts as the product shell and discovery
                    layer, while the Quantus workspace handles report
                    generation, sector packs, archive comparisons, and deeper
                    signal review at `/quantus/workspace/`.
                  </p>

                  <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <p className="mb-2 text-sm font-semibold text-gray-900">
                      Workspace URL
                    </p>
                    <p className="break-all font-mono text-sm text-gray-500">
                      {quantusWorkspaceDisplayUrl}
                    </p>
                  </div>
                </div>

                <div className="min-w-0 space-y-4">
                  <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <p className="mb-3 text-sm font-semibold text-gray-900">
                      Suggested research flow
                    </p>
                    <ul className="space-y-4 text-sm text-gray-600">
                      {workflowStages.map((item, index) => (
                        <li key={item.title} className="flex gap-3">
                          <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black text-[11px] font-semibold text-white">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {item.title}
                            </p>
                            <p className="mt-1 leading-relaxed text-gray-600">
                              {item.description}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    asChild
                    className="w-full rounded-full bg-black py-6 text-lg text-white hover:bg-gray-800"
                  >
                    <a href={QUANTUS_APP_URL}>
                      Enter Quantus Investing workspace
                      <ArrowRight className="h-5 w-5" />
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          </ScrollReveal>
        </section>

        <section className="mx-auto mb-16 max-w-7xl px-6">
          <ScrollReveal width="100%">
            <Card className="rounded-3xl border-gray-200 bg-white p-8 shadow-xl shadow-black/[0.05] md:p-10">
              <h2 className="text-3xl font-bold font-heading tracking-tight md:text-4xl">
                Quantus Investing FAQ
              </h2>
              <div className="mt-6 space-y-4">
                {quantusFaqs.map((faq) => (
                  <div
                    key={faq.question}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      {faq.question}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {faq.answer}
                    </p>
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
