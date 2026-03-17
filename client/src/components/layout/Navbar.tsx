import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [location] = useLocation();
  const productsCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const productLinks = [
    {
      name: "Quantus Investing",
      href: "/quantus",
      description: "AI-native quantitative research and institutional reporting",
    },
    {
      name: "Power BI Solutions",
      href: "/power-bi-solutions",
      description: "Semantic model analysis and AI-assisted optimization",
    },
    {
      name: "Greek AI Professional Advisor",
      href: "/ai-advisor",
      description: "AI-powered guidance for accounting, legal, and consulting",
    },
  ];

  const isProductsActive =
    location === "/products" ||
    location === "/quantus" ||
    location === "/power-bi-solutions" ||
    location === "/ai-advisor";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    return () => {
      if (productsCloseTimeoutRef.current) {
        clearTimeout(productsCloseTimeoutRef.current);
      }
    };
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Products", href: "/products" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
  ];

  const openProductsMenu = () => {
    if (productsCloseTimeoutRef.current) {
      clearTimeout(productsCloseTimeoutRef.current);
      productsCloseTimeoutRef.current = null;
    }
    setIsProductsOpen(true);
  };

  const closeProductsMenu = () => {
    if (productsCloseTimeoutRef.current) {
      clearTimeout(productsCloseTimeoutRef.current);
    }

    productsCloseTimeoutRef.current = setTimeout(() => {
      setIsProductsOpen(false);
    }, 120);
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 md:px-12",
          isScrolled
            ? "py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm"
            : "py-8 bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/bi-solutions-logo.png"
              alt="BI Solutions"
              className="w-10 h-10 group-hover:scale-110 transition-transform duration-300 mix-blend-multiply"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight font-heading group-hover:text-gray-700 transition-colors">BI Solutions Group</span>
              <span className="text-xs text-gray-500 font-medium">Advanced Analytics & AI Consulting</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) =>
              link.name === "Products" ? (
                <div
                  key={link.name}
                  className="relative pb-4 -mb-4"
                  onMouseEnter={openProductsMenu}
                  onMouseLeave={closeProductsMenu}
                  onFocus={openProductsMenu}
                  onBlur={(event) => {
                    if (
                      !event.currentTarget.contains(
                        event.relatedTarget as Node | null,
                      )
                    ) {
                      setIsProductsOpen(false);
                    }
                  }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium transition-colors hover:text-black relative group",
                      isProductsActive ? "text-black" : "text-gray-500"
                    )}
                  >
                    {link.name}
                    <ChevronDown className="h-4 w-4" />
                    <span
                      className={cn(
                        "absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full",
                        isProductsActive ? "w-full" : ""
                      )}
                    />
                  </Link>

                  <div
                    className={cn(
                      "absolute left-1/2 top-full z-50 w-96 -translate-x-1/2 pt-3 transition-all duration-200",
                      isProductsOpen
                        ? "visible translate-y-0 opacity-100 pointer-events-auto"
                        : "invisible -translate-y-1 opacity-0 pointer-events-none",
                    )}
                  >
                    <div className="rounded-3xl border border-gray-200 bg-white p-3 shadow-2xl shadow-black/10">
                      <Link
                        href="/products"
                        className="mb-2 block rounded-2xl px-4 py-3 transition-colors hover:bg-gray-50"
                        onClick={() => setIsProductsOpen(false)}
                      >
                        <div className="text-sm font-semibold text-gray-900">
                          All products
                        </div>
                        <div className="mt-1 text-sm leading-relaxed text-gray-500">
                          Explore the BI Solutions product portfolio.
                        </div>
                      </Link>
                      {productLinks.map((product) => (
                        <Link
                          key={product.name}
                          href={product.href}
                          className="block rounded-2xl px-4 py-3 transition-colors hover:bg-gray-50"
                          onClick={() => setIsProductsOpen(false)}
                        >
                          <div className="text-sm font-semibold text-gray-900">
                            {product.name}
                          </div>
                          <div className="mt-1 text-sm leading-relaxed text-gray-500">
                            {product.description}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-black relative group",
                    location === link.href ||
                      (link.href === "/blog" && location.startsWith("/blog/"))
                      ? "text-black"
                      : "text-gray-500"
                  )}
                >
                  {link.name}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full",
                      location === link.href ||
                        (link.href === "/blog" && location.startsWith("/blog/"))
                        ? "w-full"
                        : ""
                    )}
                  />
                </Link>
              )
            )}
            <Link href="/contact">
              <Button className="rounded-full px-6 bg-black text-white hover:bg-gray-800 transition-all hover:scale-105">
                Get Started
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay - Outside header for proper stacking */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-white z-[100] lg:hidden flex flex-col"
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <Link
                href="/"
                className="flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <img
                  src="/bi-solutions-logo.png"
                  alt="BI Solutions"
                  className="w-10 h-10"
                />
                <div className="flex flex-col">
                  <span className="text-lg font-bold tracking-tight font-heading">BI Solutions Group</span>
                  <span className="text-xs text-gray-500 font-medium">Advanced Analytics & AI Consulting</span>
                </div>
              </Link>
              <button
                className="p-2"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Mobile Menu Content */}
            <nav className="flex flex-col gap-6 px-8 py-8 text-2xl font-heading font-bold flex-1">
              {navLinks.map((link) =>
                link.name === "Products" ? (
                  <div key={link.name} className="space-y-3 py-2">
                    <Link
                      href={link.href}
                      className="block hover:text-gray-500 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                    <div className="ml-2 border-l border-gray-200 pl-4">
                      {productLinks.map((product) => (
                        <Link
                          key={product.name}
                          href={product.href}
                          className="block py-2 text-base font-sans font-medium text-gray-500 hover:text-black transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {product.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="hover:text-gray-500 transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                )
              )}
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full mt-8 rounded-full py-6 text-lg">
                  Get Started
                </Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
