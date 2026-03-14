import {
  ArrowRight,
  BarChart3,
  Brain,
  Database,
  ExternalLink,
  Shield,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const products = [
  {
    name: "Quantus",
    href: "/quantus",
    appHref: "/quantus/",
    icon: Brain,
    accent: "bg-blue-100 text-blue-700",
    description:
      "AI-native quantitative research, signal generation, report automation, and institutional-style deep dives across multiple asset classes.",
    bullets: [
      "Separate product auth and premium workflows",
      "Native application hosted on the BI Solutions domain",
      "Built for reports, sector packs, and ongoing research operations",
    ],
  },
  {
    name: "Power BI Solutions",
    href: "/power-bi-solutions",
    appHref: "/power-bi-solutions/",
    icon: BarChart3,
    accent: "bg-emerald-100 text-emerald-700",
    description:
      "A dedicated Power BI workspace for TMDL analysis, semantic model review, AI-guided recommendations, and faster optimization cycles.",
    bullets: [
      "Separate auth flow tailored to the Power BI product",
      "Server-side Anthropic proxy on the BI Solutions domain",
      "Designed for model diagnostics, recommendations, and AI chat",
    ],
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
  heading = "Productized analytics, now inside the BI Solutions ecosystem.",
  description = "bisolutions.group now acts as the brand shell for advisory services and product entry points, with each application keeping its own authentication and runtime.",
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
            <span className="font-mono text-gray-800">bisolutions.group</span>{" "}
            {description}
          </p>
        </ScrollReveal>

        <div className="grid gap-8 lg:grid-cols-2">
          {products.map((product, index) => {
            const Icon = product.icon;

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
                      <div
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${product.accent}`}
                      >
                        <Icon className="h-4 w-4" />
                        {product.name}
                      </div>
                      <h3 className="mt-6 text-3xl font-bold font-heading tracking-tight">
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
                        View product page
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <a href={product.appHref}>
                      <Button
                        variant="outline"
                        className="rounded-full border-gray-300 px-6"
                      >
                        Open app
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
