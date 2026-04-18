import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useBrowserLocation } from "wouter/use-browser-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ScrollToTop from "@/utils/ScrollToTop";
import { CookieConsent } from "@/components/CookieConsent";
import { SITE_BASE_PATH, withSiteBase } from "@/lib/site";
import {
  PRODUCT_ROUTES,
  PRODUCT_ROUTE_ALIASES,
  PRODUCT_ROUTE_DISPLAY_PATHS,
  PRODUCT_ROUTE_LEGACY_DISPLAY_PATHS,
  decodeRoutePath,
} from "@/lib/routes";
// Eagerly load the landing page for instant first paint
import Home from "@/pages/Home";

// Lazy-load all other pages — only fetched when navigated to
const Services = lazy(() => import("@/pages/Services"));
const Portfolio = lazy(() => import("@/pages/Portfolio"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const Contact = lazy(() => import("@/pages/Contact"));
const About = lazy(() => import("@/pages/About"));
const Products = lazy(() => import("@/pages/Products"));
const AIAdvisorPage = lazy(() => import("@/pages/products/AIAdvisorPage"));
const PowerBISolutionsPage = lazy(() => import("@/pages/products/PowerBISolutionsPage"));
const WebsiteAppPortfolioPage = lazy(() => import("@/pages/products/WebsiteAppPortfolioPage"));
const PrivacyPolicy = lazy(() => import("@/pages/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/legal/TermsOfService"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <ScrollToTop />
          <Router />
          <CookieConsent />
        </TooltipProvider>
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

/** Redirect to a canonical path using history.replaceState so the old URL is removed from history. */
function CanonicalRedirect({ to }: { to: string }) {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate(to, { replace: true });
  }, [navigate, to]);
  return null;
}

function FullPageRedirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return <PageFallback />;
}

function useDecodedBrowserLocation() {
  const [location, navigate] = useBrowserLocation();
  return [decodeRoutePath(location), navigate] as [string, typeof navigate];
}

function Router() {
  return (
    <WouterRouter hook={useDecodedBrowserLocation} base={SITE_BASE_PATH}>
      <Suspense fallback={<PageFallback />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/services" component={Services} />
          <Route path="/products" component={Products} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:slug" component={BlogPost} />
          <Route path="/contact" component={Contact} />
          <Route path="/about" component={About} />
          {/* Non-canonical product paths → 308 to the clean alias.
              The server handles direct navigation; these handle in-app SPA links. */}
          <Route path={PRODUCT_ROUTES.aiAdvisor}>
            {() => <CanonicalRedirect to={PRODUCT_ROUTE_ALIASES.aiAdvisor} />}
          </Route>
          <Route path={PRODUCT_ROUTE_DISPLAY_PATHS.aiAdvisor}>
            {() => <CanonicalRedirect to={PRODUCT_ROUTE_ALIASES.aiAdvisor} />}
          </Route>
          <Route path={PRODUCT_ROUTE_ALIASES.aiAdvisor} component={AIAdvisorPage} />

          <Route path={PRODUCT_ROUTES.quantus}>
            {() => <FullPageRedirect to={withSiteBase("/quantus/workspace/")} />}
          </Route>
          <Route path={PRODUCT_ROUTE_DISPLAY_PATHS.quantus}>
            {() => <FullPageRedirect to={withSiteBase("/quantus/workspace/")} />}
          </Route>
          <Route path={PRODUCT_ROUTE_LEGACY_DISPLAY_PATHS.quantus}>
            {() => <FullPageRedirect to={withSiteBase("/quantus/workspace/")} />}
          </Route>
          <Route path={PRODUCT_ROUTE_ALIASES.quantus}>
            {() => <FullPageRedirect to={withSiteBase("/quantus/workspace/")} />}
          </Route>

          <Route path={PRODUCT_ROUTES.powerBiSolutions}>
            {() => <CanonicalRedirect to={PRODUCT_ROUTE_ALIASES.powerBiSolutions} />}
          </Route>
          <Route path={PRODUCT_ROUTE_DISPLAY_PATHS.powerBiSolutions}>
            {() => <CanonicalRedirect to={PRODUCT_ROUTE_ALIASES.powerBiSolutions} />}
          </Route>
          <Route path={PRODUCT_ROUTE_ALIASES.powerBiSolutions} component={PowerBISolutionsPage} />

          <Route path={PRODUCT_ROUTES.websiteAppPortfolio}>
            {() => <CanonicalRedirect to={PRODUCT_ROUTE_ALIASES.websiteAppPortfolio} />}
          </Route>
          <Route path={PRODUCT_ROUTE_DISPLAY_PATHS.websiteAppPortfolio}>
            {() => <CanonicalRedirect to={PRODUCT_ROUTE_ALIASES.websiteAppPortfolio} />}
          </Route>
          <Route path={PRODUCT_ROUTE_ALIASES.websiteAppPortfolio} component={WebsiteAppPortfolioPage} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </WouterRouter>
  );
}

export default App;
