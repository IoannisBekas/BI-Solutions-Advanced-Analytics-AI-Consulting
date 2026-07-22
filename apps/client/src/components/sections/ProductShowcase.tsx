import {
  ArrowRight,
  Database,
  ExternalLink,
  FlaskConical,
  Shield,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { trackEvent } from "@/lib/analytics";
import { PRODUCT_ROUTE_ALIASES } from "@/lib/routes";
import { withPublicSiteOrigin } from "@/lib/site";

interface ProductItem {
  name: string;
  audience: string;
  href: string;
  appHref: string;
  description: string;
  bullets: string[];
  primaryLabel: string;
  secondaryLabel: string;
}

const products: ProductItem[] = [
  {
    name: "Quantus Investing",
    audience: "For investors, analysts, and research teams",
    href: PRODUCT_ROUTE_ALIASES.quantus,
    appHref: withPublicSiteOrigin("/quantus/workspace/"),
    description:
      "An AI-native research workspace for moving from market screening to structured reports and repeatable investment research.",
    bullets: [
      "Cross-asset screening and signal exploration",
      "Institutional-style reports and sector packs",
      "Repeatable workflows for ongoing research operations",
    ],
    primaryLabel: "Explore Quantus",
    secondaryLabel: "Open workspace",
  },
  {
    name: "Power BI Solutions",
    audience: "For Power BI developers, analysts, and reporting teams",
    href: PRODUCT_ROUTE_ALIASES.powerBiSolutions,
    appHref: withPublicSiteOrigin("/power-bi-solutions/workspace/"),
    description:
      "A focused review workspace for understanding semantic-model issues and moving through Power BI cleanup with guided analysis.",
    bullets: [
      "TMDL intake and immediate model diagnostics",
      "Review of measures, relationships, and report screenshots",
      "Interactive guidance for prioritizing improvements",
    ],
    primaryLabel: "Explore Power BI Solutions",
    secondaryLabel: "Open workspace",
  },
];

const pilots = [
  {
    name: "Bonusaki",
    category: "Hospitality loyalty pilot",
    description:
      "A QR-based loyalty experience showing how a simple customer interaction can connect rewards, operations, and measurable engagement.",
    href: PRODUCT_ROUTE_ALIASES.bonusaki,
  },
  {
    name: "Greek AI Professional Advisor",
    category: "AI advisory demonstration",
    description:
      "A focused demonstration of how an AI assistant can structure professional guidance and turn a broad question into a useful next step.",
    href: PRODUCT_ROUTE_ALIASES.aiAdvisor,
  },
];

interface ProductShowcaseProps {
  badge?: string;
  heading?: string;
  description?: string;
  className?: string;
  id?: string;
}

export function ProductShowcase({
  badge = "Products",
  heading = "Focused products for high-value analytics workflows.",
  description = "Use the two flagship workspaces directly, or explore smaller pilots that demonstrate how BI Solutions Group approaches product and AI delivery.",
  className = "",
  id,
}: ProductShowcaseProps) {
  return (
    <section
      id={id}
      className={`bg-gradient-to-b from-white via-gray-50 to-white py-24 ${className}`.trim()}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <ScrollReveal className="mb-14" width="100%">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600">
            <Database className="h-4 w-4" />
            {badge}
          </div>
          <h2 className="mt-6 max-w-4xl text-4xl font-bold font-heading tracking-tight md:text-5xl">
            {heading}
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-gray-600">
            {description}
          </p>
        </ScrollReveal>

        <div className="grid auto-rows-fr gap-8 lg:grid-cols-2">
          {products.map((product, index) => (
            <ScrollReveal
              key={product.name}
              delay={index * 0.1}
              width="100%"
              className="h-full"
            >
              <Card className="flex h-full flex-col rounded-3xl border-gray-200 bg-white/90 p-7 shadow-xl shadow-black/5 sm:p-8">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.17em] text-gray-400">
                      {product.audience}
                    </p>
                    <h3 className="mt-4 text-3xl font-bold font-heading tracking-tight">
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
                    <div key={bullet} className="flex gap-3 text-sm text-gray-600">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex flex-wrap gap-4 pt-8">
                  <Button
                    asChild
                    className="rounded-full bg-black px-6 text-white hover:bg-gray-800"
                  >
                    <Link
                      href={product.href}
                      onClick={() =>
                        trackEvent("product_card_click", {
                          product: product.name,
                          action: "view_product_page",
                          target: product.href,
                        })
                      }
                    >
                      {product.primaryLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-gray-300 px-6"
                  >
                    <a
                      href={product.appHref}
                      onClick={() =>
                        trackEvent("product_card_click", {
                          product: product.name,
                          action: "open_workspace",
                          target: product.appHref,
                        })
                      }
                    >
                      {product.secondaryLabel}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="mt-14" width="100%">
          <div className="mb-6 flex items-center gap-3">
            <FlaskConical className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Pilots & demos
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Smaller experiences that show the delivery approach in action.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {pilots.map((pilot) => (
              <Link
                key={pilot.name}
                href={pilot.href}
                className="group flex h-full items-start justify-between gap-6 rounded-[1.5rem] border border-gray-200 bg-white px-6 py-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/[0.04]"
                onClick={() =>
                  trackEvent("product_card_click", {
                    product: pilot.name,
                    action: "view_pilot",
                    target: pilot.href,
                  })
                }
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                    {pilot.category}
                  </p>
                  <h3 className="mt-3 text-xl font-bold font-heading text-gray-950">
                    {pilot.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {pilot.description}
                  </p>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
