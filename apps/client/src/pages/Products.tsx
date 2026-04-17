import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PRODUCT_ROUTE_ALIASES } from "@/lib/routes";
import { withSiteBase } from "@/lib/site";

export default function Products() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Seo
        title="Products"
        description="Explore Quantus Investing, Power BI Solutions, the Greek AI Professional Advisor, and the Website & App Portfolio showcase from one searchable hub."
        path="/products"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "BI Solutions Products",
          url: "https://bisolutions.group/products",
          hasPart: [
            `https://bisolutions.group${PRODUCT_ROUTE_ALIASES.quantus}`,
            `https://bisolutions.group${PRODUCT_ROUTE_ALIASES.powerBiSolutions}`,
            `https://bisolutions.group${PRODUCT_ROUTE_ALIASES.aiAdvisor}`,
            `https://bisolutions.group${PRODUCT_ROUTE_ALIASES.websiteAppPortfolio}`,
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
                Purpose-built analytics products.
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-gray-600">
                Each product has its own workspace, tailored for the audience and workflow it
                serves. Pick the one that fits your problem.
              </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link href="/contact">
                    <Button className="rounded-full bg-black px-8 text-white hover:bg-gray-800">
                      Discuss a product rollout
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <a href={withSiteBase("/quantus/workspace/")}>
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
          heading="Choose the product that fits your workflow."
          description="Each product has a dedicated workspace designed around its core use case."
        />
      </main>

      <Footer />
    </div>
  );
}
