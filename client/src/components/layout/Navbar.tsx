import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  return (
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
              <span className="text-lg font-bold tracking-tight font-heading group-hover:text-gray-700 transition-colors">BI Solutions</span>
              <span className="text-xs text-gray-500 font-medium">Advanced Analytics & AI Consulting</span>
            </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-black relative group",
                location === link.href ? "text-black" : "text-gray-500"
              )}
            >
                {link.name}
                <span 
                  className={cn(
                    "absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full",
                    location === link.href ? "w-full" : ""
                  )} 
                />
            </Link>
          ))}
          <Button className="rounded-full px-6 bg-black text-white hover:bg-gray-800 transition-all hover:scale-105">
            Get Started
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-40 pt-24 px-8 md:hidden"
          >
            <nav className="flex flex-col gap-8 text-2xl font-heading font-bold">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="hover:text-gray-500 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                    {link.name}
                </Link>
              ))}
              <Button className="w-full mt-8 rounded-full py-6 text-lg">
                Get Started
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
