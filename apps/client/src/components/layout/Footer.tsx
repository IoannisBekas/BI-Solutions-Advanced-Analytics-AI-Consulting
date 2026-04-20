import { Link } from "wouter";
import { Instagram, Linkedin, ArrowUp, Github } from "lucide-react";
import { PRODUCT_ROUTE_ALIASES } from "@/lib/routes";
import { withAssetBase } from "@/lib/site";

const PRIVACY_LABEL =
  "\u03a0\u03bf\u03bb\u03b9\u03c4\u03b9\u03ba\u03ae \u0391\u03c0\u03bf\u03c1\u03c1\u03ae\u03c4\u03bf\u03c5";
const TERMS_LABEL =
  "\u038c\u03c1\u03bf\u03b9 \u03a7\u03c1\u03ae\u03c3\u03b7\u03c2";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sitemapLinks = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Products", href: "/products" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  const productLinks = [
    { label: "Quantus Investing", href: PRODUCT_ROUTE_ALIASES.quantus },
    {
      label: "Power BI Solutions",
      href: PRODUCT_ROUTE_ALIASES.powerBiSolutions,
    },
    {
      label: "Greek AI Professional Advisor",
      href: PRODUCT_ROUTE_ALIASES.aiAdvisor,
    },
    {
      label: "Website & App Portfolio",
      href: PRODUCT_ROUTE_ALIASES.websiteAppPortfolio,
    },
  ];

  return (
    <footer className="overflow-hidden bg-black pb-10 pt-20 text-white">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-20 grid grid-cols-1 gap-12 border-b border-white/10 pb-12 md:grid-cols-12">
          <div className="space-y-6 md:col-span-4">
            <Link href="/" className="mb-4 flex items-center gap-3">
              <img
                src={withAssetBase("bi-solutions-logo.png")}
                alt="BI Solutions"
                className="h-10 w-10 invert"
              />
              <div>
                <div className="text-xl font-bold font-heading tracking-tight">
                  BI Solutions Group
                </div>
                <div className="text-xs text-gray-400">
                  Advanced Analytics & AI Consulting
                </div>
              </div>
            </Link>
            <p className="max-w-sm leading-relaxed text-gray-400">
              Enterprise analytics, AI, and digital transformation. Turning
              data into competitive advantage through cutting-edge technology
              and strategic consulting.
            </p>
          </div>

          <div className="space-y-6 md:col-span-2">
            <h4 className="text-lg font-bold font-heading">Sitemap</h4>
            <ul className="space-y-4">
              {sitemapLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6 md:col-span-2">
            <h4 className="text-lg font-bold font-heading">Products</h4>
            <ul className="space-y-4">
              {productLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6 md:col-span-2">
            <h4 className="text-lg font-bold font-heading">Capabilities</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>Cloud Migration</li>
              <li>Advanced Analytics</li>
              <li>Business Intelligence</li>
              <li>MLOps & AI</li>
              <li>Data Governance</li>
            </ul>
          </div>

          <div className="space-y-6 md:col-span-2">
            <h4 className="text-lg font-bold font-heading">Social</h4>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/bisolutions.group/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-white hover:text-black"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/bi-solutions-by-bekas-ioannis/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-white hover:text-black"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/IoannisBekas"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-white hover:text-black"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between pt-8 text-sm text-gray-500 md:flex-row">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
            <p>&copy; 2026 BI Solutions Group. All rights reserved.</p>
            <div className="flex gap-4">
              <Link
                href="/privacy-policy"
                className="transition-colors hover:text-white"
              >
                {PRIVACY_LABEL}
              </Link>
              <Link
                href="/terms-of-service"
                className="transition-colors hover:text-white"
              >
                {TERMS_LABEL}
              </Link>
            </div>
          </div>

          <button
            onClick={scrollToTop}
            className="group mt-4 flex items-center gap-2 transition-colors hover:text-white md:mt-0"
          >
            Back to Top
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-700 transition-colors group-hover:border-white">
              <ArrowUp className="h-4 w-4" />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
}
