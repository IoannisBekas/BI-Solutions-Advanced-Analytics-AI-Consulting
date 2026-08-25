import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "wouter";
import { ChevronDown, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useLocale } from "@/i18n/LocaleProvider";
import { trackNavClick } from "@/lib/analytics";
import { START_PROJECT_PATH } from "@/lib/contact";
import { withAssetBase } from "@/lib/site";
import { cn } from "@/lib/utils";

type DropdownName = "services";

const serviceLinks = [
  {
    name: "All services",
    href: "/services",
    description: "See every capability on one page.",
  },
  {
    name: "Business Intelligence & Power BI",
    href: "/services#business-intelligence-semantic-modeling",
    description: "Trusted reporting, semantic models, and decision systems.",
  },
  {
    name: "AI Consulting & Automation",
    href: "/services#advanced-analytics-ai",
    description: "Practical AI workflows, strategy, and adoption.",
  },
  {
    name: "Data Strategy & Cloud",
    href: "/services#data-strategy-governance",
    description: "Reliable foundations, governance, and cloud delivery.",
  },
  {
    name: "Websites & Web Apps",
    href: "/services#website-app-development",
    description: "Focused digital products built around real workflows.",
  },
  {
    name: "Content Operations & Digital Products",
    href: "/services#content-operations-automation",
    description: "Repurposing systems, distribution workflows, and digital assets.",
  },
  {
    name: "Enablement & Mentorship",
    href: "/services#data-career-enablement-mentorship",
    description: "Team training, adoption support, and career development.",
  },
] as const;

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDesktopMenu, setOpenDesktopMenu] = useState<DropdownName | null>(
    null,
  );
  const [openMobileSection, setOpenMobileSection] =
    useState<DropdownName | null>(null);
  const [location] = useLocation();
  const { t } = useLocale();
  const desktopNavRef = useRef<HTMLElement>(null);
  const mobileDialogRef = useRef<HTMLDivElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const isServicesActive =
    location === "/services" || location.startsWith("/services/");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setOpenDesktopMenu(null);
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (!openDesktopMenu) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!desktopNavRef.current?.contains(event.target as Node)) {
        setOpenDesktopMenu(null);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const menuName = openDesktopMenu;
      setOpenDesktopMenu(null);
      desktopNavRef.current
        ?.querySelector<HTMLButtonElement>(`[data-dropdown-trigger="${menuName}"]`)
        ?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openDesktopMenu]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const root = document.getElementById("root");
    const rootWasInert = root?.hasAttribute("inert") ?? false;
    const rootAriaHidden = root?.getAttribute("aria-hidden");
    const previousOverflow = document.body.style.overflow;

    mobileCloseRef.current?.focus();
    root?.setAttribute("inert", "");
    root?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsMobileMenuOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(
        mobileDialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ??
          [],
      ).filter((element) => element.getAttribute("aria-hidden") !== "true");
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (!rootWasInert) root?.removeAttribute("inert");
      if (rootAriaHidden == null) {
        root?.removeAttribute("aria-hidden");
      } else {
        root?.setAttribute("aria-hidden", rootAriaHidden);
      }
      previouslyFocusedRef.current?.focus();
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenMobileSection(null);
  };

  const handleNavClick = (
    label: string,
    destination: string,
    placement: "header" | "mobile_menu",
  ) => {
    trackNavClick(label, destination, placement);
    setOpenDesktopMenu(null);
    if (placement === "mobile_menu") closeMobileMenu();
  };

  const dropdownTriggerClass = (isActive: boolean) =>
    cn(
      "group relative flex min-h-11 items-center gap-1 text-sm font-medium transition-colors hover:text-black",
      isActive ? "text-black" : "text-gray-500",
    );

  const mobileMenu =
    typeof document === "undefined"
      ? null
      : createPortal(
          <AnimatePresence>
            {isMobileMenuOpen ? (
              <motion.div
                id="mobile-site-menu"
                ref={mobileDialogRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[150] flex flex-col bg-white xl:hidden"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobile-menu-title"
              >
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <Link
                    href="/"
                    className="flex min-w-0 items-center gap-3"
                    onClick={() => handleNavClick("BI Solutions Group", "/", "mobile_menu")}
                  >
                    <img
                      src={withAssetBase("bi-solutions-logo.png")}
                      alt=""
                      className="h-10 w-10 shrink-0 object-contain"
                    />
                    <div className="min-w-0">
                      <div
                        id="mobile-menu-title"
                        className="truncate text-lg font-bold tracking-tight font-heading"
                      >
                        BI Solutions Group
                      </div>
                      <div className="truncate text-xs font-medium text-gray-500">
                        Advanced Analytics & AI Consulting
                      </div>
                    </div>
                  </Link>
                  <button
                    ref={mobileCloseRef}
                    type="button"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                    onClick={closeMobileMenu}
                    aria-label="Close navigation menu"
                  >
                    <X aria-hidden="true" className="h-6 w-6" />
                  </button>
                </div>

                <nav
                  className="flex-1 overflow-y-auto px-6 py-6"
                  aria-label="Mobile navigation"
                >
                  <div className="mx-auto max-w-xl divide-y divide-gray-100">
                    <div className="py-2">
                      <button
                        type="button"
                        className="flex min-h-14 w-full items-center justify-between py-2 text-left text-2xl font-bold font-heading"
                        onClick={() =>
                          setOpenMobileSection((current) =>
                            current === "services" ? null : "services",
                          )
                        }
                        aria-expanded={openMobileSection === "services"}
                        aria-controls="mobile-services-links"
                      >
                        {t.nav.services}
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "h-5 w-5 transition-transform",
                            openMobileSection === "services" && "rotate-180",
                          )}
                        />
                      </button>
                      <div
                        id="mobile-services-links"
                        hidden={openMobileSection !== "services"}
                        className="border-l border-gray-200 pb-3 pl-4"
                      >
                        {serviceLinks.map((item) => (
                          <a
                            key={item.href}
                            href={item.href}
                            className="block min-h-11 py-2.5 text-base font-medium text-gray-600 transition-colors hover:text-black"
                            onClick={() =>
                              handleNavClick(item.name, item.href, "mobile_menu")
                            }
                          >
                            {item.name}
                          </a>
                        ))}
                        <Link
                          href={START_PROJECT_PATH}
                          className="block min-h-11 py-2.5 text-base font-semibold text-black"
                          onClick={() =>
                            handleNavClick(
                              "Not sure what you need?",
                              START_PROJECT_PATH,
                              "mobile_menu",
                            )
                          }
                        >
                          Not sure what you need?
                        </Link>
                      </div>
                    </div>

                    {[
                      { name: "Insights", href: "/blog" },
                      { name: "About", href: "/about" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block min-h-14 py-4 text-2xl font-bold font-heading"
                        onClick={() =>
                          handleNavClick(item.name, item.href, "mobile_menu")
                        }
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </nav>

                <div className="border-t border-gray-100 bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
                  <LanguageSwitcher className="mb-4 justify-center" />
                  <Button asChild className="h-12 w-full rounded-full text-base">
                    <Link
                      href={START_PROJECT_PATH}
                      onClick={() =>
                        handleNavClick(
                          "Start a project",
                          START_PROJECT_PATH,
                          "mobile_menu",
                        )
                      }
                    >
                      Start a project
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        );

  return (
    <>
      <header
        data-site-header
        data-transparent={isScrolled ? "false" : "true"}
        className={cn(
          "fixed left-0 right-0 top-0 z-50 px-6 transition-all duration-300 ease-in-out md:px-12",
          isScrolled
            ? "border-b border-gray-100 bg-white/90 py-3 shadow-sm backdrop-blur-md"
            : "bg-transparent py-6",
        )}
      >
        <div className="site-container flex items-center justify-between">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-3"
            onClick={() => trackNavClick("BI Solutions Group", "/", "header")}
          >
            <img
              src={withAssetBase("bi-solutions-logo.png")}
              alt=""
              className="h-10 w-10 shrink-0 object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <div className="min-w-0">
              <div className="truncate text-base font-bold tracking-tight transition-colors font-heading group-hover:text-gray-700 sm:text-lg">
                BI Solutions Group
              </div>
              <div className="hidden truncate text-xs font-medium text-gray-500 sm:block">
                Advanced Analytics & AI Consulting
              </div>
            </div>
          </Link>

          <nav
            ref={desktopNavRef}
            className="hidden items-center gap-5 xl:flex"
            aria-label="Primary navigation"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setOpenDesktopMenu(null);
              }
            }}
          >
            <div className="relative">
              <button
                type="button"
                data-dropdown-trigger="services"
                className={dropdownTriggerClass(isServicesActive)}
                onClick={() =>
                  setOpenDesktopMenu((current) =>
                    current === "services" ? null : "services",
                  )
                }
                aria-expanded={openDesktopMenu === "services"}
                aria-controls="desktop-services-panel"
              >
                {t.nav.services}
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "h-4 w-4 transition-transform",
                    openDesktopMenu === "services" && "rotate-180",
                  )}
                />
                <span
                  className={cn(
                    "absolute -bottom-0.5 left-0 h-0.5 w-0 bg-black transition-all duration-300 group-hover:w-full",
                    isServicesActive && "w-full",
                  )}
                />
              </button>
              <div
                id="desktop-services-panel"
                hidden={openDesktopMenu !== "services"}
                className="absolute left-1/2 top-full z-50 w-[26rem] -translate-x-1/2 pt-3"
              >
                <div className="rounded-3xl border border-gray-200 bg-white p-3 shadow-2xl shadow-black/10">
                  {serviceLinks.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="block rounded-2xl px-4 py-3 transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                      onClick={() => handleNavClick(item.name, item.href, "header")}
                    >
                      <div className="text-sm font-semibold text-gray-900">
                        {item.name}
                      </div>
                      <div className="mt-1 text-xs leading-relaxed text-gray-500">
                        {item.description}
                      </div>
                    </a>
                  ))}
                  <div className="mt-1 border-t border-gray-100 px-1 pt-2">
                    <Link
                      href={START_PROJECT_PATH}
                      className="block rounded-2xl px-3 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                      onClick={() =>
                        handleNavClick(
                          "Not sure what you need?",
                          START_PROJECT_PATH,
                          "header",
                        )
                      }
                    >
                      Not sure what you need? Start here →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {[
              { name: t.nav.insights, href: "/blog" },
              { name: t.nav.about, href: "/about" },
            ].map((item) => {
              const isActive =
                location === item.href ||
                (item.href === "/blog" && location.startsWith("/blog/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex min-h-11 items-center text-sm font-medium transition-colors hover:text-black",
                    isActive ? "text-black" : "text-gray-500",
                  )}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() =>
                    handleNavClick(item.name, item.href, "header")
                  }
                >
                  {item.name}
                  <span
                    className={cn(
                      "absolute -bottom-0.5 left-0 h-0.5 w-0 bg-black transition-all duration-300 group-hover:w-full",
                      isActive && "w-full",
                    )}
                  />
                </Link>
              );
            })}

            <LanguageSwitcher />

            <Button
              asChild
              className="h-11 rounded-full bg-black px-5 text-white transition-all hover:scale-[1.02] hover:bg-gray-800"
            >
              <Link
                href={START_PROJECT_PATH}
                onClick={() =>
                  handleNavClick(
                    "Start a project",
                    START_PROJECT_PATH,
                    "header",
                  )
                }
              >
                {t.nav.startProject}
              </Link>
            </Button>
          </nav>

          <button
            ref={mobileTriggerRef}
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 xl:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-site-menu"
          >
            <Menu aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
      </header>
      {mobileMenu}
    </>
  );
}
