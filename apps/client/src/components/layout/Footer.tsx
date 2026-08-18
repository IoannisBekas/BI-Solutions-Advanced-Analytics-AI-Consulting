import { ArrowUp, Github, Instagram, Linkedin } from "lucide-react";
import { Link } from "wouter";
import { trackEvent, trackNavClick } from "@/lib/analytics";
import {
  CONTACT_EMAIL,
  CONTACT_MAILTO,
  START_PROJECT_PATH,
} from "@/lib/contact";
import { withAssetBase } from "@/lib/site";
import { useLocale } from "@/i18n/LocaleProvider";

/** Service slugs whose footer labels come from the locale catalogue. */
const serviceSlugs = [
  "business-intelligence-semantic-modeling",
  "advanced-analytics-ai",
  "data-strategy-governance",
  "website-app-development",
] as const;

const serviceFallbackLabels: Record<string, string> = {
  "business-intelligence-semantic-modeling": "Business Intelligence & Power BI",
  "advanced-analytics-ai": "AI Consulting & Automation",
  "data-strategy-governance": "Data Strategy & Cloud",
  "website-app-development": "Websites & Web Apps",
};

export function Footer() {
  const { t } = useLocale();

  const serviceLinks = [
    { label: t.footer.servicesOverview, href: "/services" },
    ...serviceSlugs.map((slug) => ({
      label: t.services.items[slug]?.title ?? serviceFallbackLabels[slug],
      href: `/services#${slug}`,
    })),
  ];

  const resourceLinks = [
    { label: t.footer.insights, href: "/blog" },
    { label: t.footer.privacy, href: "/privacy-policy" },
    { label: t.footer.terms, href: "/terms-of-service" },
  ];

  const scrollToTop = () => {
    trackEvent("back_to_top_click", { placement: "footer" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="overflow-hidden bg-black pb-10 pt-20 text-white">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-20 grid grid-cols-1 gap-12 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-10">
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
              {t.footer.tagline}
            </p>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <h2 className="text-lg font-bold font-heading">{t.footer.company}</h2>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 transition-colors hover:text-white"
                  onClick={() => trackNavClick("About", "/about", "footer")}
                >
                  {t.nav.about}
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
                  {t.nav.startProject}
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
            <h2 className="text-lg font-bold font-heading">{t.footer.services}</h2>
            <ul className="space-y-4 text-sm">
              {serviceLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-gray-400 transition-colors hover:text-white"
                    onClick={() =>
                      trackNavClick(item.label, item.href, "footer")
                    }
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <h2 className="text-lg font-bold font-heading">{t.footer.resources}</h2>
            <ul className="space-y-4 text-sm">
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
          <p>&copy; 2026 BI Solutions Group. {t.footer.rights}</p>
          <button
            type="button"
            onClick={scrollToTop}
            className="group mt-4 flex min-h-11 items-center gap-2 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black md:mt-0"
          >
            {t.footer.backToTop}
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-700 transition-colors group-hover:border-white">
              <ArrowUp aria-hidden="true" className="h-4 w-4" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
