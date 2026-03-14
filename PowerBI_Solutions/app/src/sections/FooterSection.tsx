import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Database, Github, Twitter, Linkedin, Heart, ArrowUp } from 'lucide-react';

const quickLinks = [
  { label: 'Documentation', href: 'https://learn.microsoft.com/en-us/analysis-services/tmdl/tmdl-overview' },
  { label: 'API Reference', href: 'https://learn.microsoft.com/en-us/rest/api/power-bi/' },
  { label: 'Examples', href: 'https://learn.microsoft.com/en-us/analysis-services/tmdl/tmdl-how-to' },
  { label: 'Changelog', href: '#changelog' },
];

const resources = [
  { label: 'Power BI Docs', href: 'https://learn.microsoft.com/en-us/power-bi/' },
  { label: 'TMDL Reference', href: 'https://learn.microsoft.com/en-us/analysis-services/tmdl/tmdl-overview' },
  { label: 'DAX Guide', href: 'https://dax.guide/' },
  { label: 'Best Practices', href: 'https://learn.microsoft.com/en-us/power-bi/guidance/' },
];

export function FooterSection() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      ref={ref}
      className={`scroll-hidden ${isVisible ? 'scroll-visible' : ''} relative py-16 px-4 sm:px-6 lg:px-8 border-t border-border`}
    >
      {/* Background Shape */}
      <div className="abstract-bg">
        <div className="abstract-shape shape-1" style={{ opacity: 0.15, bottom: '-200px', top: 'auto' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-12 mb-6 md:mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-semibold text-black">TMDL Analyzer</span>
                <p className="text-xs text-muted-foreground">Power BI Model Analysis</p>
              </div>
            </div>
            <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">
              Analyze your Power BI Tabular Model Definition Language (TMDL) files
              and get intelligent recommendations to optimize your data models.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-black hover:bg-gray-200 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-black hover:bg-gray-200 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-black hover:bg-gray-200 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-black font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-muted-foreground hover:text-black transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-black font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-black transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PowerBI Solutions. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for Power BI developers
            </p>
            <button
              onClick={scrollToTop}
              aria-label="Scroll to top"
              title="Scroll to top"
              className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
