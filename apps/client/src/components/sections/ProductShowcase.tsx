import {
  ArrowRight,
  Database,
  ExternalLink,
  Shield,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PRODUCT_ROUTE_ALIASES } from "@/lib/routes";
import { withPublicSiteOrigin, withSiteBase } from "@/lib/site";

const products = [
  {
    name: "Quantus Investing",
    href: PRODUCT_ROUTE_ALIASES.quantus,
    appHref: withPublicSiteOrigin("/quantus/workspace/"),
    description:
      "AI-native quantitative research, signal generation, report automation, and institutional-style deep dives across multiple asset classes.",
    bullets: [
      "Premium workflows for institutional-grade research",
      "Reports, sector packs, and ongoing research operations",
      "Cross-asset coverage: equities, ETFs, crypto, commodities",
    ],
  },
  {
    name: "Power BI Solutions",
    href: PRODUCT_ROUTE_ALIASES.powerBiSolutions,
    appHref: withPublicSiteOrigin("/power-bi-solutions/"),
    description:
      "A dedicated Power BI workspace for TMDL analysis, semantic model review, AI-guided recommendations, and faster optimization cycles.",
    bullets: [
      "Upload TMDL files and get instant model diagnostics",
      "AI-powered recommendations to optimize your data architecture",
      "Interactive chat workflow for guided improvements",
    ],
  },
  {
    name: "Greek AI Professional Advisor",
    href: PRODUCT_ROUTE_ALIASES.aiAdvisor,
    appHref: withSiteBase(PRODUCT_ROUTE_ALIASES.aiAdvisor),
    description:
      "AI-powered professional guidance across accounting, legal, and consulting domains, trained on Greek law and business practices.",
    bullets: [
      "Role-based AI advisors: Accountant, Lawyer, and Consultant",
      "Powered by Claude with domain-specific Greek expertise",
      "Instant professional guidance for tax, legal, and strategic questions",
    ],
  },
  {
    name: "Website & App Portfolio",
    href: PRODUCT_ROUTE_ALIASES.websiteAppPortfolio,
    appHref: withSiteBase(
      `${PRODUCT_ROUTE_ALIASES.websiteAppPortfolio}#featured-sites`,
    ),
    description:
      "A curated showcase of BI Solutions web builds across personal branding, local organizations, and AI-native education products.",
    bullets: [
      "Live examples spanning portfolio sites, organizations, and education apps",
      "Designed to show visual range, brand adaptation, and responsive delivery",
      "Includes direct links to launched projects and a BI Solutions-led showcase page",
    ],
    primaryLabel: "View portfolio page",
    secondaryLabel: "Open showcase",
  },
];

interface ProductItem {
  name: string;
  href: string;
  appHref: string;
  description: string;
  bullets: string[];
  primaryLabel?: string;
  secondaryLabel?: string;
}

const typedProducts: ProductItem[] = products;

interface ProductShowcaseProps {
  badge?: string;
  heading?: string;
  description?: string;
  className?: string;
  id?: string;
}

export function ProductShowcase({
  badge = "Products",
  heading = "Analytics products from BI Solutions Group.",
  description = "delivers advisory services and dedicated product experiences across analytics, AI, and web development.",
  className = "",
  id,
}: ProductShowcaseProps) {
  return (
    <section
      id={id}
      className={`bg-gradient-to-b from-white via-gray-50 to-white py-24 ${className}`.trim()}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <ScrollReveal className="mb-14" width="100%">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600">
            <Database className="h-4 w-4" />
            {badge}
          </div>
          <h2 className="mt-6 text-4xl md:text-5xl font-bold font-heading tracking-tight">
            {heading}
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-gray-600 leading-relaxed">
            <span className="font-mono text-gray-800">www.bisolutions.group</span>{" "}
            {description}
          </p>
        </ScrollReveal>

        <div className="grid gap-8 lg:grid-cols-2">
          {typedProducts.map((product, index) => {
            return (
              <ScrollReveal
                key={product.name}
                delay={index * 0.1}
                width="100%"
                className="h-full"
              >
                <Card className="h-full rounded-3xl border-gray-200 bg-white/90 p-8 shadow-xl shadow-black/5">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <h3 className="text-3xl font-bold font-heading tracking-tight">
                        {product.name}
                      </h3>
                      <p className="mt-4 text-base leading-relaxed text-gray-600">
                        {product.description}
                      </p>
                    </div>
                    <div className="hidden rounded-2xl border border-gray-200 bg-gray-50 p-3 text-gray-500 sm:flex">
                      <Shield className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    {product.bullets.map((bullet) => (
                      <div
                        key={bullet}
                        className="flex gap-3 text-sm text-gray-600"
                      >
                        <Sparkles className="mt-0.5 h-4 w-4 text-gray-400" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link href={product.href}>
                      <Button className="rounded-full bg-black px-6 text-white hover:bg-gray-800">
                        {product.primaryLabel ?? "View product page"}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <a href={product.appHref}>
                      <Button
                        variant="outline"
                        className="rounded-full border-gray-300 px-6"
                      >
                        {product.secondaryLabel ?? "Open app"}
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
