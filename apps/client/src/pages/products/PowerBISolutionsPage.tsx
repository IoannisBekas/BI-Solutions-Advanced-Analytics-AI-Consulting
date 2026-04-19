import {
  ArrowRight,
  Bot,
  ExternalLink,
  FileText,
  LineChart,
  MessageSquare,
  Search,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Seo } from "@/components/seo/Seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import { PRODUCT_ROUTE_ALIASES } from "@/lib/routes";
import { withSiteBase } from "@/lib/site";

const POWERBI_SOLUTIONS_APP_URL =
  import.meta.env.VITE_POWERBI_SOLUTIONS_URL ||
  withSiteBase("/power-bi-solutions/");

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
  "Open the native Power BI Solutions app on the BI Solutions domain.",
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
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-16 top-20 h-96 w-96 rounded-full bg-emerald-200/25 blur-3xl" />
            <div className="absolute -left-10 bottom-10 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-200/20 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-6">
            <ScrollReveal className="mb-16 text-center" width="100%">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-black/5 px-4 py-2 text-sm font-medium text-gray-600">
                <Sparkles className="h-4 w-4" />
                Native product on www.bisolutions.group
              </div>
              <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tight">
                Power BI Solutions
                <span className="mt-2 block text-3xl md:text-4xl font-normal text-gray-400">
                  Semantic model analysis and AI-assisted optimization
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-600">
                Bring TMDL review, model diagnostics, AI guidance, and product-specific authentication into a dedicated workspace hosted under the BI Solutions domain.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <a href={POWERBI_SOLUTIONS_APP_URL}>
                  <Button className="rounded-full bg-black px-8 py-6 text-lg text-white hover:bg-gray-800">
                    Open Power BI Solutions
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a href={withSiteBase("/contact")}>
                  <Button
                    variant="outline"
                    className="rounded-full border-gray-300 px-8 py-6 text-lg"
                  >
                    Talk to BI Solutions
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="mx-auto mb-20 max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
                <div>
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white">
                    <Shield className="h-4 w-4" />
                    Separate auth, shared domain
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold font-heading tracking-tight">
                    Launch a dedicated Power BI workflow without leaving the BI Solutions ecosystem
                  </h2>
                  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
                    The BI Solutions site becomes the product shell and discovery layer, while the native Power BI Solutions app handles uploads, analysis, recommendations, chat, and product-specific sessions at `/power-bi-solutions/`.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <p className="mb-2 text-sm font-semibold text-gray-900">
                      Recommended product URL
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

                  <a href={POWERBI_SOLUTIONS_APP_URL} className="block">
                    <Button className="w-full rounded-full bg-black py-6 text-lg text-white hover:bg-gray-800">
                      Enter Power BI Solutions
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
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
