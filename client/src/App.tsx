import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { useBrowserLocation } from "wouter/use-browser-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ScrollToTop from "@/utils/ScrollToTop";
import { CookieConsent } from "@/components/CookieConsent";
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
const AIAdvisorPage = lazy(() => import("@/pages/AIAdvisorPage"));
const QuantusPage = lazy(() => import("@/pages/QuantusPage"));
const PowerBISolutionsPage = lazy(() => import("@/pages/PowerBISolutionsPage"));
const WebsiteAppPortfolioPage = lazy(() => import("@/pages/WebsiteAppPortfolioPage"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const NotFound = lazy(() => import("@/pages/not-found"));

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

function useDecodedBrowserLocation() {
  const [location, navigate] = useBrowserLocation();
  return [decodeRoutePath(location), navigate] as [string, typeof navigate];
}

function Router() {
  return (
    <WouterRouter hook={useDecodedBrowserLocation}>
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
          <Route path={PRODUCT_ROUTES.aiAdvisor} component={AIAdvisorPage} />
          <Route path={PRODUCT_ROUTE_DISPLAY_PATHS.aiAdvisor} component={AIAdvisorPage} />
          <Route path={PRODUCT_ROUTE_ALIASES.aiAdvisor} component={AIAdvisorPage} />
          <Route path={PRODUCT_ROUTES.quantus} component={QuantusPage} />
          <Route path={PRODUCT_ROUTE_DISPLAY_PATHS.quantus} component={QuantusPage} />
          <Route path={PRODUCT_ROUTE_LEGACY_DISPLAY_PATHS.quantus} component={QuantusPage} />
          <Route path={PRODUCT_ROUTE_ALIASES.quantus} component={QuantusPage} />
          <Route path={PRODUCT_ROUTES.powerBiSolutions} component={PowerBISolutionsPage} />
          <Route path={PRODUCT_ROUTE_DISPLAY_PATHS.powerBiSolutions} component={PowerBISolutionsPage} />
          <Route path={PRODUCT_ROUTE_ALIASES.powerBiSolutions} component={PowerBISolutionsPage} />
          <Route path={PRODUCT_ROUTES.websiteAppPortfolio} component={WebsiteAppPortfolioPage} />
          <Route path={PRODUCT_ROUTE_DISPLAY_PATHS.websiteAppPortfolio} component={WebsiteAppPortfolioPage} />
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
