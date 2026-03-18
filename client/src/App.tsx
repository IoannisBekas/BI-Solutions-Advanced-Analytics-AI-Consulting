import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import Portfolio from "@/pages/Portfolio";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Contact from "@/pages/Contact";
import About from "@/pages/About";
import Products from "@/pages/Products";
import ScrollToTop from "@/utils/ScrollToTop";
import AIAdvisorPage from "@/pages/AIAdvisorPage";
import QuantusPage from "@/pages/QuantusPage";
import PowerBISolutionsPage from "@/pages/PowerBISolutionsPage";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import CookiePolicy from "@/pages/CookiePolicy";
import { CookieConsent } from "@/components/CookieConsent";

declare global {
  interface Window {
    enableAnalytics?: () => void;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <ScrollToTop />
          <Router />
          <CookieConsent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function Router() {
  return (
    <WouterRouter>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={Services} />
        <Route path="/products" component={Products} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/contact" component={Contact} />
        <Route path="/about" component={About} />
        <Route path="/ai-advisor" component={AIAdvisorPage} />
        <Route path="/quantus" component={QuantusPage} />
        <Route path="/power-bi-solutions" component={PowerBISolutionsPage} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/cookies" component={CookiePolicy} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

export default App;
