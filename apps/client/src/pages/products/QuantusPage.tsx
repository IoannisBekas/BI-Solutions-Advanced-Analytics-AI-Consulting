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
import { ProductPageHero } from "@/components/sections/ProductPageHero";
import { Seo } from "@/components/seo/Seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PRODUCT_ROUTE_ALIASES } from "@/lib/routes";
import { withPublicSiteOrigin, withSiteBase } from "@/lib/site";

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

      <main className="pt-32 pb-20">
        <section className="relative overflow-hidden">
          <ScrollReveal width="100%">
            <ProductPageHero
              icon={Sparkles}
              eyebrow="Quantitative research workspace"
              title="Quantus Investing"
              description="Quantus runs each ticker through regime detection, a 12-model ensemble, tiered data validation, and a 7-part confidence score. The result is research that stays explainable, backtested, and usable inside one BI Solutions workflow."
              actions={(
                <>
                  <Button
                    asChild
                    className="rounded-full bg-black px-8 text-white hover:bg-gray-800"
                  >
                    <a href={QUANTUS_APP_URL}>
                      Open Quantus workspace
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-gray-300 px-8"
                  >
                    <a href={withSiteBase("/contact")}>
                      Talk to BI Solutions
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </>
              )}
              footer={(
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {heroMetrics.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-gray-200 bg-gray-50/80 px-5 py-5"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                          {item.label}
                        </p>
                        <p className="mt-3 text-2xl font-bold font-heading tracking-tight text-gray-900">
                          {item.value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            />
          </ScrollReveal>
        </section>

        <section className="mx-auto mb-20 max-w-7xl px-6">
          <ScrollReveal width="100%">
            <Card className="rounded-3xl border-gray-200 bg-white p-8 shadow-2xl shadow-black/[0.05] md:p-10">
              <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
                <div>
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white">
                    <Brain className="h-4 w-4" />
                    Research workflow
                  </div>
                  <h2 className="text-3xl font-bold font-heading tracking-tight md:text-4xl">
                    From first search to a research trail you can verify
                  </h2>
                  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
                    Quantus combines regime detection, a 12-model ensemble,
                    tiered data validation, and a 7-part confidence score in one
                    workflow. It pairs the signal with the accuracy context so
                    the product still feels accountable inside the BI Solutions
                    ecosystem.
                  </p>

                  <div className="mt-8 space-y-4">
                    {proofPoints.map((item, index) => (
                      <div
                        key={item}
                        className="flex gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4"
                      >
                        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                          {index + 1}
                        </span>
                        <p className="text-sm leading-relaxed text-gray-600">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                        Quantus Investing workspace preview
                      </p>
                      <h3 className="mt-2 text-2xl font-bold font-heading tracking-tight text-gray-900">
                        From search to signal in one place
                      </h3>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600">
                      <span className="inline-flex h-2 w-2 rounded-full bg-black" />
                      Meridian v2.4
                    </div>
                  </div>

                  <form
                    onSubmit={handleSearchSubmit}
                    className="mt-5 flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-3 transition-colors focus-within:border-gray-400"
                  >
                    <Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <input
                      name="ticker"
                      type="text"
                      placeholder="Search NVDA, BTC-USD, SPY, gold, or sector themes"
                      className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-500"
                      autoComplete="off"
                    />
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

                  <div className="mt-6 space-y-3">
                    {previewSignals.map((item) => (
                      <button
                        key={item.ticker}
                        type="button"
                        onClick={() => openReport(item.ticker)}
                        className="w-full cursor-pointer rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left transition-colors hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {item.ticker}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Research-ready market snapshot
                            </p>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {item.change}
                          </span>
                        </div>
                        <span className="mt-3 inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                          {item.signal}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                        Confidence scoring
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-gray-600">
                        Each report exposes the 7-factor confidence mix behind
                        the signal, not just the headline output.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                        Sector packs
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-gray-600">
                        Grouped market coverage is refreshed every 96 hours for
                        users who want more than a single ticker view.
                      </p>
                    </div>
                  </div>

                  <Button
                    asChild
                    className="mt-6 w-full rounded-full bg-black py-6 text-lg text-white hover:bg-gray-800"
                  >
                    <a href={QUANTUS_APP_URL}>
                      Open Quantus Investing
                      <ArrowRight className="h-5 w-5" />
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          </ScrollReveal>
        </section>

        <section className="mx-auto mb-20 max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-3">
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                <div>
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

                <div className="space-y-4">
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
