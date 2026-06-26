import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { Button } from "@/components/ui/button";
import { PRODUCT_ROUTE_ALIASES } from "@/lib/routes";
import { CONTACT_MAILTO } from "@/lib/contact";

export default function Products() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Seo
        title="Products"
        description="Explore the two flagship BI Solutions product workspaces: Quantus Investing and Power BI Solutions."
        path="/products"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "BI Solutions Products",
          url: "https://www.bisolutions.group/products",
          hasPart: [
            `https://www.bisolutions.group${PRODUCT_ROUTE_ALIASES.quantus}`,
            `https://www.bisolutions.group${PRODUCT_ROUTE_ALIASES.powerBiSolutions}`,
          ],
        }}
      />
      <Navbar />

      <main className="pt-32">
        <section className="max-w-full overflow-hidden px-4 pb-8 sm:px-6 md:px-12">
          <div className="mx-auto w-full max-w-7xl min-w-0">
            <div className="w-full min-w-0 rounded-[2rem] border border-gray-200 bg-white/90 px-6 py-10 shadow-xl shadow-black/5 sm:px-8 sm:py-12 md:px-12 md:py-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-black/5 px-4 py-2 text-sm font-medium text-gray-600">
                Products
              </div>
              <h1 className="mt-6 max-w-full break-words text-[2.55rem] sm:text-5xl md:text-6xl font-bold font-heading tracking-tight leading-[1.05] sm:leading-tight">
                Focused analytics products.
              </h1>
              <p className="mt-5 max-w-full break-words text-lg leading-relaxed text-gray-600 sm:max-w-3xl">
                Two public workspaces carry the product side of BI Solutions:
                Quantus Investing for research workflows and Power BI Solutions
                for semantic model review.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild className="rounded-full bg-black px-8 text-white hover:bg-gray-800">
                  <a href={CONTACT_MAILTO}>
                    Discuss a product rollout
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-gray-300 px-8"
                >
                  <a href="#product-workspaces">
                    Compare products
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <ProductShowcase
          id="product-workspaces"
          heading="Choose the workspace that fits your workflow."
          description="The rest of the site stays focused on services, proof, and resources instead of presenting every demo as a product."
        />
      </main>

      <Footer />
    </div>
  );
}
