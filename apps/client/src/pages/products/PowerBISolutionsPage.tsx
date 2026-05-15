import {
  ArrowRight,
  Bot,
  ExternalLink,
  FileText,
  LineChart,
  MessageSquare,
  Search,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ProductPageHero } from "@/components/sections/ProductPageHero";
import { Seo } from "@/components/seo/Seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import { PRODUCT_ROUTE_ALIASES } from "@/lib/routes";
import { withPublicSiteOrigin, withSiteBase } from "@/lib/site";

const POWERBI_SOLUTIONS_APP_URL =
  import.meta.env.VITE_POWERBI_SOLUTIONS_URL ||
  withPublicSiteOrigin("/power-bi-solutions/workspace/");

const heroHighlights = [
  {
    label: "Primary input",
    value: "Upload TMDL model definitions for structured semantic-model review.",
    icon: FileText,
  },
  {
    label: "Guided workflow",
    value: "Run diagnostics, recommendations, and AI follow-up in one workspace.",
    icon: MessageSquare,
  },
  {
    label: "Access model",
    value: "Keep product-specific authentication inside the BI Solutions domain.",
    icon: Shield,
  },
];

const features = [
  {
    icon: FileText,
    title: "TMDL Upload & Parsing",
    description:
      "Upload tabular model definitions directly and inspect tables, measures, relationships, and metadata in one workspace.",
  },
  {
    icon: Search,
    title: "Semantic Model Review",
    description:
      "Surface modeling issues, naming inconsistencies, and structural optimization opportunities before they reach production.",
  },
  {
    icon: Bot,
    title: "AI-Powered Guidance",
    description:
      "Use a dedicated Anthropic-backed assistant for targeted DAX, model design, and optimization questions.",
  },
  {
    icon: MessageSquare,
    title: "Interactive Chat Workflow",
    description:
      "Ask follow-up questions about the uploaded model without leaving the analysis context or re-explaining the schema.",
  },
  {
    icon: LineChart,
    title: "Recommendation Engine",
    description:
      "Generate immediate improvement suggestions for readability, maintainability, and performance-sensitive areas.",
  },
  {
    icon: Shield,
    title: "Separate Product Auth",
    description:
      "Keep Power BI Solutions access and state isolated from Quantus while still living under the BI Solutions parent brand.",
  },
];

const launchChecklist = [
  "Open the Power BI Solutions workspace on the BI Solutions domain.",
  "Authenticate with the product-specific sign-in flow.",
  "Upload TMDL files, review model diagnostics, and continue with AI-assisted analysis.",
];

const powerBiFaqs = [
  {
    question: "Who is Power BI Solutions built for?",
    answer:
      "It is built for BI engineers, analytics teams, and Power BI owners who need faster semantic model diagnostics and clearer optimization decisions.",
  },
  {
    question: "What inputs does the workspace analyze?",
    answer:
      "It analyzes TMDL model definitions so teams can review tables, measures, relationships, naming quality, and structural risks in one place.",
  },
  {
    question: "Is this a generic chatbot for BI questions?",
    answer:
      "No. The assistant is embedded in the model review workflow so follow-up guidance stays tied to the uploaded semantic model context.",
  },
];

export default function PowerBISolutionsPage() {
  const powerBiWorkspaceDisplayUrl = new URL(
    POWERBI_SOLUTIONS_APP_URL,
    window.location.origin,
  ).toString();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Seo
        title="Power BI Solutions | Semantic Model Audit and Optimization"
        description="Power BI Solutions provides TMDL analysis, semantic model diagnostics, and AI-assisted optimization workflows for Power BI teams."
        path={PRODUCT_ROUTE_ALIASES.powerBiSolutions}
        keywords={[
          "Power BI Solutions",
          "semantic model audit",
          "TMDL analysis",
          "Power BI optimization service",
          "DAX model review",
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              name: "Power BI Solutions",
              url: `https://www.bisolutions.group${PRODUCT_ROUTE_ALIASES.powerBiSolutions}`,
              description:
                "Semantic model analysis and AI-assisted optimization workflows for Power BI.",
            },
            {
              "@type": "SoftwareApplication",
              name: "Power BI Solutions",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              url: `https://www.bisolutions.group${PRODUCT_ROUTE_ALIASES.powerBiSolutions}`,
              publisher: {
                "@type": "Organization",
                name: "BI Solutions Group",
              },
            },
            {
              "@type": "FAQPage",
              mainEntity: powerBiFaqs.map((faq) => ({
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
                { "@type": "ListItem", position: 1, name: "Home", item: "https://www.bisolutions.group/" },
                { "@type": "ListItem", position: 2, name: "Products", item: "https://www.bisolutions.group/products" },
                { "@type": "ListItem", position: 3, name: "Power BI Solutions", item: `https://www.bisolutions.group${PRODUCT_ROUTE_ALIASES.powerBiSolutions}` },
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
              icon={Bot}
              eyebrow="Semantic model review workspace"
              title="Power BI Solutions"
              description="Bring TMDL review, semantic-model diagnostics, recommendation workflows, and AI-guided follow-up into a dedicated Power BI workspace on the BI Solutions domain."
              actions={(
                <>
                  <Button
                    asChild
                    className="rounded-full bg-black px-8 text-white hover:bg-gray-800"
                  >
                    <a href={POWERBI_SOLUTIONS_APP_URL}>
                      Open Power BI workspace
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
                  {heroHighlights.map((item) => {
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
                        <p className="mt-3 text-sm leading-relaxed text-gray-700">
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

        <section className="mx-auto mb-20 max-w-6xl px-6">
          <div className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <ScrollReveal
                  key={feature.title}
                  delay={index * 0.08}
                  width="100%"
                >
                  <Card className="h-full rounded-2xl border-gray-100 bg-white/85 p-6 backdrop-blur-sm transition-all duration-300 hover:border-gray-200 hover:shadow-lg">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
                      <Icon className="h-6 w-6" />
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

        <section className="mx-auto mb-20 max-w-7xl px-6">
          <ScrollReveal width="100%">
            <Card className="rounded-3xl border-gray-200 bg-white p-8 shadow-2xl md:p-10">
              <div className="grid min-w-0 gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
                <div className="min-w-0">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white">
                    <Shield className="h-4 w-4" />
                    Separate auth, shared domain
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold font-heading tracking-tight">
                    Launch a dedicated Power BI workflow without leaving the BI Solutions ecosystem
                  </h2>
                  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
                    The BI Solutions site becomes the product shell and discovery layer, while the native Power BI Solutions app handles uploads, analysis, recommendations, chat, and product-specific sessions at `/power-bi-solutions/workspace/`.
                  </p>
                </div>

                <div className="min-w-0 space-y-4">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <p className="mb-2 text-sm font-semibold text-gray-900">
                      Workspace URL
                    </p>
                    <p className="break-all font-mono text-sm text-gray-500">
                      {powerBiWorkspaceDisplayUrl}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <p className="mb-3 text-sm font-semibold text-gray-900">
                      Suggested launch flow
                    </p>
                    <ul className="space-y-3 text-sm text-gray-600">
                      {launchChecklist.map((step, index) => (
                        <li key={step} className="flex gap-3">
                          <span
                            className={cn(
                              "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black text-[11px] font-semibold text-white",
                            )}
                          >
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    asChild
                    className="w-full rounded-full bg-black py-6 text-lg text-white hover:bg-gray-800"
                  >
                    <a href={POWERBI_SOLUTIONS_APP_URL}>
                      Enter Power BI Solutions workspace
                      <ArrowRight className="ml-2 h-5 w-5" />
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
                Power BI Solutions FAQ
              </h2>
              <div className="mt-6 space-y-4">
                {powerBiFaqs.map((faq) => (
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
