import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { ArrowUp, ArrowUpRight, Database } from 'lucide-react';

const workspaceLinks = [
  { label: 'Overview', href: '#overview' },
  { label: 'Workspace', href: '#workspace' },
  { label: 'Resources', href: '#resources' },
];

const resourceLinks = [
  { label: 'Power BI docs', href: 'https://learn.microsoft.com/en-us/power-bi/' },
  { label: 'TMDL reference', href: 'https://learn.microsoft.com/en-us/analysis-services/tmdl/tmdl-overview' },
  { label: 'DAX guidance', href: 'https://dax.guide/' },
];

const ecosystemLinks = [
  { label: 'Products overview', href: 'https://www.bisolutions.group/products' },
  { label: 'Contact BI Solutions', href: 'https://www.bisolutions.group/contact' },
  { label: 'BI Solutions Group', href: 'https://www.bisolutions.group/' },
];

export function FooterSection() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="resources"
      ref={ref}
      className={`scroll-hidden ${isVisible ? 'scroll-visible' : ''} px-4 py-12 sm:px-6 lg:px-8`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="powerbi-shell px-6 py-8 md:px-8 md:py-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-heading text-xl font-bold tracking-tight text-black">
                    Power BI Solutions
                  </div>
                  <p className="text-xs font-medium text-gray-500">
                    BI Solutions semantic model workspace
                  </p>
                </div>
              </div>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-gray-600">
                Power BI Solutions keeps TMDL review, model diagnostics, and
                AI-assisted follow-up inside the broader BI Solutions product
                family instead of looking like a separate brand.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
                Workspace
              </h4>
              <div className="mt-4 flex flex-col gap-3 text-sm text-gray-600">
                {workspaceLinks.map((link) => (
                  <a key={link.label} href={link.href} className="transition-colors hover:text-black">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
                Resources
              </h4>
              <div className="mt-4 flex flex-col gap-3 text-sm text-gray-600">
                {resourceLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 transition-colors hover:text-black"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
                Ecosystem
              </h4>
              <div className="mt-4 flex flex-col gap-3 text-sm text-gray-600">
                {ecosystemLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="transition-colors hover:text-black"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-black/8 pt-6 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-gray-500">
              Â© {new Date().getFullYear()} BI Solutions Group. Power BI Solutions is part of the BI Solutions product suite.
            </p>
            <button
              onClick={scrollToTop}
              aria-label="Scroll to top"
              title="Scroll to top"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-gray-800"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
