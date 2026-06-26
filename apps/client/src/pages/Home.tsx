import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { ServicesSection } from "@/components/sections/Services";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Link } from "wouter";
import unicefDashboard from "@/assets/dashboards/unicef_dashboard.png";
import iaeaDashboard from "@/assets/dashboards/iaea_dashboard.png";
import ifcDashboard from "@/assets/dashboards/ifc_dashboard.png";

const trustSignals = [
  { label: "Buyer focus", value: "BI, AI, analytics, and web app delivery" },
  { label: "Proof", value: "International dashboards and 5-star reviews" },
  { label: "Delivery style", value: "Strategy, implementation, and handoff" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Seo
        title="AI, BI & Web App Development"
        description="BI Solutions Group helps companies in Greece and Europe build BI dashboards, analytics systems, AI workflows, data strategies, and modern web applications connected to measurable business outcomes."
        path="/"
        keywords={[
          "AI consulting Greece",
          "BI consultant Greece",
          "business intelligence consultant Greece",
          "Power BI Tableau Looker consulting",
          "web app development Greece",
          "data strategy consulting",
          "business intelligence consulting",
          "BI Solutions Group",
        ]}
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": "https://www.bisolutions.group/#website",
            name: "BI Solutions Group",
            url: "https://www.bisolutions.group/",
            inLanguage: "en",
            publisher: {
              "@id": "https://www.bisolutions.group/#organization",
            },
            about: [
              "business intelligence consulting",
              "AI consulting",
              "website and web app development",
              "data strategy",
              "business intelligence",
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "@id": "https://www.bisolutions.group/#organization",
            name: "BI Solutions Group",
            alternateName: "BI Solutions",
            url: "https://www.bisolutions.group/",
            logo: "https://www.bisolutions.group/bi-solutions-logo.png",
            image: "https://www.bisolutions.group/bi-solutions-logo.png",
            description:
              "AI, business intelligence, data strategy, cloud foundations, and web app development consultancy for businesses in Greece and Europe.",
            areaServed: ["Greece", "Europe"],
            founder: {
              "@id": "https://www.bisolutions.group/about#ioannis-bekas",
            },
            knowsAbout: [
              "Power BI",
              "Tableau",
              "Looker",
              "semantic modeling",
              "AI workflows",
              "data strategy",
              "cloud foundations",
              "web app development",
              "analytics engineering",
            ],
            sameAs: [
              "https://www.linkedin.com/company/bi-solutions-by-bekas-ioannis/",
              "https://github.com/IoannisBekas",
              "https://www.instagram.com/bisolutions.group/",
            ],
            makesOffer: [
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Business intelligence consulting and semantic modeling",
                  url: "https://www.bisolutions.group/services/business-intelligence-semantic-modeling",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Advanced analytics and AI consulting",
                  url: "https://www.bisolutions.group/services/advanced-analytics-ai",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Data strategy and cloud foundations",
                  url: "https://www.bisolutions.group/services/data-strategy-governance",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Website and web app development",
                  url: "https://www.bisolutions.group/services/website-app-development",
                },
              },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "Person",
            "@id": "https://www.bisolutions.group/about#ioannis-bekas",
            name: "Ioannis Bekas",
            jobTitle: "Data Scientist & AI Developer",
            url: "https://www.bisolutions.group/about",
            worksFor: {
              "@id": "https://www.bisolutions.group/#organization",
            },
            sameAs: [
              "https://linkedin.com/in/ioannisbekas",
              "https://github.com/IoannisBekas",
              "https://www.linkedin.com/company/bi-solutions-by-bekas-ioannis/",
            ],
            knowsAbout: [
              "business intelligence",
              "Power BI",
              "Tableau",
              "Looker",
              "semantic modeling",
              "AI consulting",
              "advanced analytics",
              "data strategy",
              "web app development",
            ],
          },
        ]}
      />
      <Navbar />
      <main>
        <Hero />

        <section className="border-y border-gray-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-0 px-6 md:grid-cols-3 md:px-12">
            {trustSignals.map((item) => (
              <div
                key={item.label}
                className="border-b border-gray-200 py-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 md:px-8 md:first:pl-0 md:last:pr-0"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  {item.label}
                </p>
                <p className="mt-2 text-base font-medium leading-relaxed text-gray-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <ServicesSection />

        <section className="py-24 bg-black text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <ScrollReveal className="mb-16 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                Proof
              </p>
              <h2 className="mt-4 text-4xl md:text-5xl font-bold font-heading text-white">
                Selected analytics work with serious operating contexts.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-gray-400">
                Lead with the work that proves BI, analytics, and decision-support depth.
                Lighter web launches stay in the portfolio as supporting evidence.
              </p>
              <Link
                href="/portfolio"
                className="mt-6 inline-flex text-sm font-semibold text-white underline underline-offset-4 transition-colors hover:text-gray-300"
              >
                View full work archive
              </Link>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <ScrollReveal delay={0.1}>
                <a
                  href="https://github.com/IoannisBekas/PowerBI-Dashboards/blob/main/UNICEF%20OIAI%20Country-Office%20Audit%20Reports.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block cursor-pointer"
                >
                  <div className="aspect-[16/9] overflow-hidden rounded-2xl mb-6 border border-white/10">
                    <img
                      src={unicefDashboard}
                      alt="UNICEF Audit Reports Dashboard"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-gray-300 transition-colors">UNICEF Audit Compliance</h3>
                  <p className="text-gray-400 text-sm">Risk Management / Strategy</p>
                </a>
              </ScrollReveal>

              <ScrollReveal delay={0.2} className="lg:mt-12">
                <a
                  href="https://github.com/IoannisBekas/PowerBI-Dashboards/blob/main/IAEA%20-%20Global%20Water%20Analysis%20Laboratory%20Network.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block cursor-pointer"
                >
                  <div className="aspect-[16/9] overflow-hidden rounded-2xl mb-6 border border-white/10">
                    <img
                      src={iaeaDashboard}
                      alt="IAEA Water Analysis Dashboard"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-gray-300 transition-colors">IAEA Scientific Analysis</h3>
                  <p className="text-gray-400 text-sm">Data Science / Laboratory Network</p>
                </a>
              </ScrollReveal>

              <ScrollReveal delay={0.3} className="lg:mt-24">
                <a
                  href="https://github.com/IoannisBekas/PowerBI-Dashboards/blob/main/World%20Bank%20HR%20Dashboard.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block cursor-pointer"
                >
                  <div className="aspect-[16/9] overflow-hidden rounded-2xl mb-6 border border-white/10">
                    <img
                      src={ifcDashboard}
                      alt="IFC HR Analyst Dashboard"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-gray-300 transition-colors">IFC Talent Strategy</h3>
                  <p className="text-gray-400 text-sm">HR Analytics / Operations</p>
                </a>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <ProductShowcase
          badge="Flagship products"
          id="products"
          heading="Two product workspaces for high-value analytics workflows."
          description="Quantus Investing and Power BI Solutions are the only public product workspaces. Demos and broader web work are proof points, not competing products."
        />

        <ReviewsSection />
      </main>
      <Footer />
    </div>
  );
}
