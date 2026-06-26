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
import { SITE_BASE_PATH } from "@/lib/site";
import { captureAiSearchReferral } from "@/lib/referralTracking";
import {
  PRODUCT_ROUTES,
  PRODUCT_ROUTE_ALIASES,
  PRODUCT_ROUTE_DISPLAY_PATHS,
  PRODUCT_ROUTE_LEGACY_DISPLAY_PATHS,
  decodeRoutePath,
} from "@/lib/routes";
// Eagerly load the landing page for instant first paint
import Home from "@/pages/Home";

// Lazy-load all other pages only when navigated to.
const Services = lazy(() => import("@/pages/Services"));
const ServiceDetail = lazy(() => import("@/pages/ServiceDetail"));
const Portfolio = lazy(() => import("@/pages/Portfolio"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const About = lazy(() => import("@/pages/About"));
const Products = lazy(() => import("@/pages/Products"));
const AIAdvisorPage = lazy(() => import("@/pages/products/AIAdvisorPage"));
const QuantusPage = lazy(() => import("@/pages/products/QuantusPage"));
const PowerBISolutionsPage = lazy(() => import("@/pages/products/PowerBISolutionsPage"));
const BonusakiPage = lazy(() => import("@/pages/products/BonusakiPage"));
const PrivacyPolicy = lazy(() => import("@/pages/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/legal/TermsOfService"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function App() {
  useEffect(() => {
    captureAiSearchReferral();
  }, []);

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

function useDecodedBrowserLocation() {
  const [location, navigate] = useBrowserLocation();
  return [decodeRoutePath(location), navigate] as [string, typeof navigate];
}

const canonicalPathRedirects: Record<string, string> = {
  [PRODUCT_ROUTE_LEGACY_DISPLAY_PATHS.quantus]: PRODUCT_ROUTE_ALIASES.quantus,
};

function CanonicalPathRedirects() {
  const [location, navigate] = useLocation();
  const redirectTo = canonicalPathRedirects[location];

  useEffect(() => {
    if (redirectTo && redirectTo !== location) {
      navigate(redirectTo, { replace: true });
    }
  }, [location, navigate, redirectTo]);

  return null;
}

function Router() {
  return (
    <WouterRouter hook={useDecodedBrowserLocation} base={SITE_BASE_PATH}>
      <CanonicalPathRedirects />
      <Suspense fallback={<PageFallback />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/services" component={Services} />
          <Route path="/services/:slug" component={ServiceDetail} />
          <Route path="/products" component={Products} />
          <Route path="/all-products">
            {() => <CanonicalRedirect to="/products" />}
          </Route>
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:slug" component={BlogPost} />
          <Route path="/about" component={About} />
          {/* Product aliases and retired product routes are normalized in-app. */}
          <Route path={PRODUCT_ROUTES.aiAdvisor}>
            {() => <CanonicalRedirect to={PRODUCT_ROUTE_ALIASES.aiAdvisor} />}
          </Route>
          <Route path={PRODUCT_ROUTE_DISPLAY_PATHS.aiAdvisor}>
            {() => <CanonicalRedirect to={PRODUCT_ROUTE_ALIASES.aiAdvisor} />}
          </Route>
          <Route path={PRODUCT_ROUTE_ALIASES.aiAdvisor} component={AIAdvisorPage} />

          <Route path={PRODUCT_ROUTE_ALIASES.quantus} component={QuantusPage} />
          <Route path={PRODUCT_ROUTES.quantus}>
            {() => <CanonicalRedirect to={PRODUCT_ROUTE_ALIASES.quantus} />}
          </Route>
          <Route path={PRODUCT_ROUTE_DISPLAY_PATHS.quantus}>
            {() => <CanonicalRedirect to={PRODUCT_ROUTE_ALIASES.quantus} />}
          </Route>
          <Route path={PRODUCT_ROUTE_LEGACY_DISPLAY_PATHS.quantus}>
            {() => <CanonicalRedirect to={PRODUCT_ROUTE_ALIASES.quantus} />}
          </Route>

          <Route path={PRODUCT_ROUTES.powerBiSolutions}>
            {() => <CanonicalRedirect to={PRODUCT_ROUTE_ALIASES.powerBiSolutions} />}
          </Route>
          <Route path={PRODUCT_ROUTE_DISPLAY_PATHS.powerBiSolutions}>
            {() => <CanonicalRedirect to={PRODUCT_ROUTE_ALIASES.powerBiSolutions} />}
          </Route>
          <Route path={PRODUCT_ROUTE_ALIASES.powerBiSolutions} component={PowerBISolutionsPage} />

          <Route path={PRODUCT_ROUTE_ALIASES.bonusaki} component={BonusakiPage} />
          <Route path={PRODUCT_ROUTES.bonusaki}>
            {() => <CanonicalRedirect to={PRODUCT_ROUTE_ALIASES.bonusaki} />}
          </Route>
          <Route path={PRODUCT_ROUTE_DISPLAY_PATHS.bonusaki}>
            {() => <CanonicalRedirect to={PRODUCT_ROUTE_ALIASES.bonusaki} />}
          </Route>

          <Route path={PRODUCT_ROUTES.websiteAppPortfolio}>
            {() => <CanonicalRedirect to="/portfolio#web-apps" />}
          </Route>
          <Route path={PRODUCT_ROUTE_DISPLAY_PATHS.websiteAppPortfolio}>
            {() => <CanonicalRedirect to="/portfolio#web-apps" />}
          </Route>
          <Route path={PRODUCT_ROUTE_ALIASES.websiteAppPortfolio}>
            {() => <CanonicalRedirect to="/portfolio#web-apps" />}
          </Route>
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </WouterRouter>
  );
}

export default App;
