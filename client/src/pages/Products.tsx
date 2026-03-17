import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function Products() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Seo
        title="Products"
        description="Explore Quantus Investing, Power BI Solutions, and Greek AI Professional Advisor — native products delivered under the bisolutions.group brand."
        path="/products"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "BI Solutions Products",
          url: "https://bisolutions.group/products",
          hasPart: [
            "https://bisolutions.group/quantus",
            "https://bisolutions.group/power-bi-solutions",
            "https://bisolutions.group/ai-advisor",
          ],
        }}
      />
      <Navbar />

      <main className="pt-32">
        <section className="px-6 pb-8 md:px-12">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal width="100%">
              <div className="rounded-[2rem] border border-gray-200 bg-white/90 px-8 py-12 shadow-xl shadow-black/5 md:px-12 md:py-16">
                <div className="inline-flex items-center gap-2 rounded-full bg-black/5 px-4 py-2 text-sm font-medium text-gray-600">
                  Products
                </div>
                <h1 className="mt-6 text-5xl md:text-6xl font-bold font-heading tracking-tight leading-tight">
                  Native product experiences inside the BI Solutions ecosystem.
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-relaxed text-gray-600">
                  Quantus Investing, Power BI Solutions, and the Greek AI Professional Advisor
                  now live under the same BI Solutions brand domain, each with
                  its own runtime while staying discoverable from one shared
                  site.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link href="/contact">
                    <Button className="rounded-full bg-black px-8 text-white hover:bg-gray-800">
                      Discuss a product rollout
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <a href="/quantus/workspace/">
                    <Button
                      variant="outline"
                      className="rounded-full border-gray-300 px-8"
                    >
                      Open Quantus Investing
                    </Button>
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <ProductShowcase
          heading="Choose the product experience that fits the workflow."
          description="hosts all three products as first-class BI Solutions experiences, keeping the public site, product discovery, and app entry points aligned."
        />
      </main>

      <Footer />
    </div>
  );
}
