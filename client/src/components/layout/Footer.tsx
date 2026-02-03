import { Link } from "wouter";
import { Facebook, Instagram, Linkedin, Twitter, ArrowUp, Github } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-black text-white pt-20 pb-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20 border-b border-white/10 pb-12">

          {/* Brand */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="flex items-center gap-3 block mb-4">
              <img
                src="/BI-Solutions-Advanced-Analytics-AI-Consulting/bi-solutions-logo.png"
                alt="BI Solutions"
                className="w-10 h-10 invert"
              />
              <div>
                <div className="text-xl font-bold font-heading tracking-tight">BI Solutions</div>
                <div className="text-xs text-gray-400">Analytics & AI</div>
              </div>
            </Link>
            <p className="text-gray-400 max-w-sm leading-relaxed">
              Enterprise analytics, AI, and digital transformation. Turning data into competitive advantage through cutting-edge technology and strategic consulting.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-2 space-y-6">
            <h4 className="text-lg font-bold font-heading">Sitemap</h4>
            <ul className="space-y-4">
              {["Home", "Services", "Portfolio", "Blog", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase() === "home" ? "" : item.toLowerCase()}`}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="md:col-span-3 space-y-6">
            <h4 className="text-lg font-bold font-heading">Capabilities</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li>Cloud Migration</li>
              <li>Advanced Analytics</li>
              <li>Business Intelligence</li>
              <li>MLOps & AI</li>
              <li>Data Governance</li>
            </ul>
          </div>

          {/* Social */}
          <div className="md:col-span-2 space-y-6">
            <h4 className="text-lg font-bold font-heading">Social</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/bi-solutions-by-bekas-ioannis/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://github.com/IoannisBekas" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 text-sm text-gray-500">
          <p>&copy; 2025 BI Solutions. All rights reserved.</p>

          <button
            onClick={scrollToTop}
            className="mt-4 md:mt-0 flex items-center gap-2 hover:text-white transition-colors group"
          >
            Back to Top
            <div className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center group-hover:border-white transition-colors">
              <ArrowUp className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
}
