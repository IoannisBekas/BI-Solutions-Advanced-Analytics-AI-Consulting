import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { useBrowserLocation } from "wouter/use-browser-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ScrollToTop from "@/utils/ScrollToTop";
import { CookieConsent } from "@/components/CookieConsent";
import { SITE_BASE_PATH } from "@/lib/site";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { localePrefix, splitLocaleFromPath, type Locale } from "@/i18n/config";
// Eagerly load the landing page for instant first paint
import Home from "@/pages/Home";

// Lazy-load all other pages only when navigated to.
const Services = lazy(() => import("@/pages/Services"));
const CaseStudyDetail = lazy(() => import("@/pages/CaseStudyDetail"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const About = lazy(() => import("@/pages/About"));
const StartProject = lazy(() => import("@/pages/StartProject"));
const PrivacyPolicy = lazy(() => import("@/pages/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/legal/TermsOfService"));
const NotFound = lazy(() => import("@/pages/NotFound"));

interface AppProps {
  /** Set only during build-time prerendering to render a fixed route. */
  ssrPath?: string;
}

/** Strips the deploy base so the locale prefix can be read from the route. */
function routePathname(ssrPath?: string) {
  const pathname =
    ssrPath ?? (typeof window === "undefined" ? "/" : window.location.pathname);

  if (SITE_BASE_PATH && pathname.startsWith(SITE_BASE_PATH)) {
    return pathname.slice(SITE_BASE_PATH.length) || "/";
  }

  return pathname;
}

function App({ ssrPath }: AppProps = {}) {
  // Switching language is a full page load, so reading the locale once here is
  // enough — every in-app link stays inside the router's locale-aware base.
  const { locale } = splitLocaleFromPath(routePathname(ssrPath));

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LocaleProvider locale={locale}>
          <TooltipProvider>
            <Toaster />
            <Router ssrPath={ssrPath} locale={locale} />
            <CookieConsent />
          </TooltipProvider>
        </LocaleProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
    </div>
  );
}

function RetiredServiceRoute({ slug }: { slug: string }) {
  useEffect(() => {
    const anchorAliases: Record<string, string> = {
      "ai-consulting-greece": "advanced-analytics-ai",
      "digital-transformation-cloud-migration": "data-strategy-governance",
      "ai-literacy-change-management": "ai-governance-literacy-adoption",
      "mlops-productionization": "mlops-model-monitoring",
      "website-web-app-development": "website-app-development",
    };
    const anchor = anchorAliases[slug] ?? slug;
    const servicesPath = window.location.pathname.replace(
      /\/services\/[^/]+\/?$/,
      "/services",
    );
    window.location.replace(`${servicesPath}#${anchor}`);
  }, [slug]);

  return <PageFallback />;
}

function Router({ ssrPath, locale }: { ssrPath?: string; locale: Locale }) {
  return (
    <WouterRouter
      hook={useBrowserLocation}
      base={`${SITE_BASE_PATH}${localePrefix(locale)}`}
      ssrPath={ssrPath}
    >
      {/* Uses wouter's useLocation, so it must live inside the router —
          outside it would fall back to a default router without ssrPath
          and crash build-time prerendering. */}
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/services" component={Services} />
          <Route path="/services/:slug">
            {(params) => <RetiredServiceRoute slug={params.slug} />}
          </Route>
          <Route path="/case-studies/:slug" component={CaseStudyDetail} />
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:slug" component={BlogPost} />
          <Route path="/about" component={About} />
          <Route path="/start-a-project" component={StartProject} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </WouterRouter>
  );
}

export default App;
