import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { ServicesSection } from "@/components/sections/Services";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import unicefDashboard from "@/assets/dashboards/unicef_dashboard.png";
import iaeaDashboard from "@/assets/dashboards/iaea_dashboard.png";
import ifcDashboard from "@/assets/dashboards/ifc_dashboard.png";
import { Link } from "wouter";

const latestInsights = [
  {
    slug: "website-web-app-development-greece-business-needs",
    title: "Website & Web App Development in Greece: What Businesses Actually Need",
    excerpt:
      "A practical view of modern website and web app development: positioning, speed, conversion paths, analytics, and maintainable delivery.",
    category: "Web Development",
  },
  {
    slug: "power-bi-consulting-dashboards-business-infrastructure",
    title: "BI Consulting: When Dashboards Become Business Infrastructure",
    excerpt:
      "Business intelligence becomes strategic when dashboards stop being isolated reports and start operating as trusted business infrastructure.",
    category: "BI & Analytics",
  },
  {
    slug: "ai-consulting-greek-businesses-practical-use-cases",
    title: "AI Consulting for Greek Businesses: Practical Use Cases Beyond Hype",
    excerpt:
      "Useful AI consulting starts with controlled workflows, practical use cases, data boundaries, and adoption habits.",
    category: "AI & Technology",
  },
  {
    slug: "data-strategy-before-ai-better-foundations",
    title: "Data Strategy Before AI: Why Companies Need Better Foundations First",
    excerpt:
      "AI projects depend on data foundations. Ownership, quality, access rules, and governance make AI easier to trust.",
    category: "Data Strategy",
  },
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
              "AI, business intelligence, data strategy, cloud migration, and web app development consultancy for businesses in Greece and Europe.",
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
              "cloud migration",
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
        <ServicesSection />
        <LatestInsightsSection />
        <ProductShowcase
          badge="Product Studio"
          id="products"
          heading="Four products, each purpose-built for a specific workflow."
          description="Quantus Investing, Power BI Solutions, Greek AI Professional Advisor, and Website & App Portfolio - ready to explore."
        />

        <section className="py-24 bg-black text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <ScrollReveal className="mb-16">
              <h2 className="text-4xl md:text-5xl font-bold font-heading text-white">Selected Works</h2>
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

        <ReviewsSection />
      </main>
      <Footer />
    </div>
  );
}

function LatestInsightsSection() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <ScrollReveal width="100%">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
              Latest insights
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-bold font-heading leading-tight md:text-5xl">
              Practical guides for AI, BI, data strategy, and web development.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              href="/blog"
              className="flex items-center gap-2 text-sm font-semibold text-black group hover:gap-3 transition-all"
            >
              View all articles
              <div className="h-[1px] w-8 bg-black transition-all group-hover:w-12" />
            </Link>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {latestInsights.map((post, index) => (
            <ScrollReveal key={post.slug} delay={index * 0.08} className="h-full">
              <Link href={`/blog/${post.slug}`} className="group block h-full">
                <article className="flex h-full flex-col rounded-[1.5rem] border border-gray-200 bg-white p-6 shadow-sm shadow-black/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.06]">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                    {post.category}
                  </p>
                  <h3 className="mt-4 text-xl font-bold font-heading text-gray-950 group-hover:text-blue-600">
                    {post.title}
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-500">
                    {post.excerpt}
                  </p>
                  <div className="mt-6 text-sm font-semibold text-gray-900">
                    Read article
                  </div>
                </article>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
