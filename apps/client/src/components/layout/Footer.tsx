import { ArrowUp, Github, Instagram, Linkedin } from "lucide-react";
import { Link } from "wouter";
import { trackEvent, trackNavClick } from "@/lib/analytics";
import {
  CONTACT_EMAIL,
  CONTACT_MAILTO,
  START_PROJECT_PATH,
} from "@/lib/contact";
import { PRODUCT_ROUTE_ALIASES } from "@/lib/routes";
import { withAssetBase, withSiteBase } from "@/lib/site";

const serviceLinks = [
  { label: "Services overview", href: "/services" },
  {
    label: "Business Intelligence & Power BI",
    href: "/services/business-intelligence-semantic-modeling",
  },
  {
    label: "AI Consulting & Automation",
    href: "/services/advanced-analytics-ai",
  },
  {
    label: "Data Strategy & Cloud",
    href: "/services/data-strategy-governance",
  },
  {
    label: "Websites & Web Apps",
    href: "/services/website-app-development",
  },
] as const;

const productLinks = [
  { label: "Quantus Investing", href: PRODUCT_ROUTE_ALIASES.quantus },
  {
    label: "Power BI Solutions",
    href: PRODUCT_ROUTE_ALIASES.powerBiSolutions,
  },
] as const;

const pilotLinks = [
  { label: "Bonusaki", href: PRODUCT_ROUTE_ALIASES.bonusaki },
  {
    label: "Greek AI Professional Advisor",
    href: PRODUCT_ROUTE_ALIASES.aiAdvisor,
  },
] as const;

const resourceLinks = [
  { label: "Insights", href: "/blog" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
] as const;

export function Footer() {
  const scrollToTop = () => {
    trackEvent("back_to_top_click", { placement: "footer" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="overflow-hidden bg-black pb-10 pt-20 text-white">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-20 grid grid-cols-1 gap-12 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-12">
          <div className="space-y-6 sm:col-span-2 lg:col-span-4">
            <Link
              href="/"
              className="mb-4 flex items-center gap-3"
              onClick={() => trackNavClick("BI Solutions Group", "/", "footer")}
            >
              <img
                src={withAssetBase("bi-solutions-logo.png")}
                alt=""
                className="h-10 w-10 invert"
              />
              <div>
                <div className="text-xl font-bold tracking-tight font-heading">
                  BI Solutions Group
                </div>
                <div className="text-xs text-gray-400">
                  Advanced Analytics & AI Consulting
                </div>
              </div>
            </Link>
            <p className="max-w-sm leading-relaxed text-gray-400">
              Business intelligence, AI workflows, data strategy, and focused
              web apps for teams that need clearer decisions and maintainable
              systems.
            </p>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <h2 className="text-lg font-bold font-heading">Company</h2>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 transition-colors hover:text-white"
                  onClick={() => trackNavClick("About", "/about", "footer")}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href={START_PROJECT_PATH}
                  className="text-gray-400 transition-colors hover:text-white"
                  onClick={() =>
                    trackNavClick(
                      "Start a project",
                      START_PROJECT_PATH,
                      "footer",
                    )
                  }
                >
                  Start a project
                </Link>
              </li>
              <li>
                <a
                  href={CONTACT_MAILTO}
                  className="break-all text-gray-400 transition-colors hover:text-white"
                  onClick={() =>
                    trackEvent("contact_email_click", { placement: "footer" })
                  }
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <h2 className="text-lg font-bold font-heading">Services</h2>
            <ul className="space-y-4 text-sm">
              {serviceLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-400 transition-colors hover:text-white"
                    onClick={() =>
                      trackNavClick(item.label, item.href, "footer")
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <h2 className="text-lg font-bold font-heading">
              Products & demos
            </h2>
            <ul className="space-y-4 text-sm">
              {productLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-400 transition-colors hover:text-white"
                    onClick={() =>
                      trackNavClick(item.label, item.href, "footer")
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-600">
              Labs & pilots
            </div>
            <ul className="space-y-4 text-sm">
              {pilotLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-400 transition-colors hover:text-white"
                    onClick={() =>
                      trackNavClick(item.label, item.href, "footer")
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <h2 className="text-lg font-bold font-heading">Resources</h2>
            <ul className="space-y-4 text-sm">
              <li>
                <a
                  href={withSiteBase("/#case-studies")}
                  className="text-gray-400 transition-colors hover:text-white"
                  onClick={() =>
                    trackNavClick("Case Studies", "/#case-studies", "footer")
                  }
                >
                  Case Studies
                </a>
              </li>
              {resourceLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-400 transition-colors hover:text-white"
                    onClick={() =>
                      trackNavClick(item.label, item.href, "footer")
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex gap-3 pt-2">
              <a
                href="https://www.instagram.com/bisolutions.group/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BI Solutions Group on Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <Instagram aria-hidden="true" className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/bi-solutions-by-bekas-ioannis/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BI Solutions Group on LinkedIn"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <Linkedin aria-hidden="true" className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/IoannisBekas"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ioannis Bekas on GitHub"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <Github aria-hidden="true" className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between pt-8 text-sm text-gray-500 md:flex-row">
          <p>&copy; 2026 BI Solutions Group. All rights reserved.</p>
          <button
            type="button"
            onClick={scrollToTop}
            className="group mt-4 flex min-h-11 items-center gap-2 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black md:mt-0"
          >
            Back to top
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-700 transition-colors group-hover:border-white">
              <ArrowUp aria-hidden="true" className="h-4 w-4" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
