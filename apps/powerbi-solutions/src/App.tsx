import { useRef, useState, lazy, Suspense, type ReactNode } from 'react';
import { HeroSection } from '@/sections/HeroSection';
import { TMDLInputSection } from '@/sections/TMDLInputSection';
import { FooterSection } from '@/sections/FooterSection';

const AnalysisResultsSection = lazy(() =>
  import('@/sections/AnalysisResultsSection').then(m => ({ default: m.AnalysisResultsSection }))
);
const RecommendationsSection = lazy(() =>
  import('@/sections/RecommendationsSection').then(m => ({ default: m.RecommendationsSection }))
);
const ChatSection = lazy(() =>
  import('@/sections/ChatSection').then(m => ({ default: m.ChatSection }))
);
const DashboardReviewSection = lazy(() =>
  import('@/sections/DashboardReviewSection').then(m => ({ default: m.DashboardReviewSection }))
);
const VisualRecommendationsSection = lazy(() =>
  import('@/sections/VisualRecommendationsSection').then(m => ({ default: m.VisualRecommendationsSection }))
);
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthDialog } from '@/components/AuthDialog';
import { UserMenu } from '@/components/UserMenu';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { CheckCircle, LogIn } from 'lucide-react';
import type { AnalysisResult, DashboardReviewResult } from '@/types';
import './App.css';

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
    </div>
  );
}

function LazySection({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary variant="section">
      <Suspense fallback={<SectionLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

function AppContent() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [dashboardReview, setDashboardReview] = useState<DashboardReviewResult | null>(null);
  const { user, isLoading, setAuthDialogOpen } = useAuth();
  const brandLogoSrc = `${import.meta.env.BASE_URL}bi-solutions-logo.png`;
  const navigationLinks = [
    { label: 'Overview', href: '#overview' },
    { label: 'Workspace', href: '#workspace' },
    { label: 'Resources', href: '#resources' },
  ];

  const inputRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const recommendationsRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const dashboardReviewRef = useRef<HTMLDivElement>(null);
  const visualRecsRef = useRef<HTMLDivElement>(null);

  const scrollToInput = () => {
    inputRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setDashboardReview(null); // Reset visual review when new TMDL is analyzed

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  const handleDashboardReviewComplete = (review: DashboardReviewResult) => {
    setDashboardReview(review);
    setTimeout(() => {
      visualRecsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  return (
    <div className="powerbi-page min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-black/5 bg-white/86 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-2 px-3 sm:h-[82px] sm:gap-4 sm:px-6 lg:px-8">
          <a
            href="https://www.bisolutions.group/"
            className="flex min-w-0 max-w-[12rem] items-center gap-2 text-left sm:max-w-none sm:gap-3"
          >
            <img
              src={brandLogoSrc}
              alt="BI Solutions"
              className="h-9 w-9 shrink-0 mix-blend-multiply sm:h-10 sm:w-10"
            />
            <div className="min-w-0">
              <div className="truncate font-heading text-[0.95rem] font-bold tracking-tight text-black sm:text-[1.05rem]">
                BI Solutions Group
              </div>
              <div className="hidden text-xs font-medium text-gray-500 md:block">
                Advanced Analytics &amp; AI Consulting
              </div>
            </div>
            <span className="powerbi-brand-pill hidden lg:inline-flex">
              Power BI Solutions
            </span>
          </a>

          <div className="hidden items-center gap-6 lg:flex">
            {navigationLinks.map((link) => (
              <a key={link.href} href={link.href} className="powerbi-nav-link">
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
              {analysisResult && (
                <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 md:flex">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Model analyzed</span>
                </div>
              )}
              {isLoading && (
                <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 xl:flex">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  <span>Checking session</span>
                </div>
              )}
              {user ? (
                <UserMenu />
              ) : (
                <button
                  onClick={() => setAuthDialogOpen(true)}
                  disabled={isLoading}
                  className="btn-secondary flex h-11 w-11 min-h-[44px] items-center justify-center gap-2 px-0 py-2 text-sm sm:w-auto sm:px-4"
                  aria-label="Sign in"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
              <button
                onClick={scrollToInput}
                className="btn-primary min-h-[44px] px-4 py-2.5 text-sm sm:px-5"
              >
                Get Started
              </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-[7.5rem] sm:pt-24 md:pt-28">
        <HeroSection onScrollToInput={scrollToInput} />

        <div className="section-divider mx-auto max-w-6xl" />

        <TMDLInputSection
          onAnalysisComplete={handleAnalysisComplete}
          inputRef={inputRef}
        />

        {analysisResult && (
          <>
            <div className="section-divider mx-auto max-w-6xl" />

            <LazySection>
              <AnalysisResultsSection
                result={analysisResult}
                resultsRef={resultsRef}
              />
            </LazySection>

            <div className="section-divider mx-auto max-w-6xl" />

            <LazySection>
              <RecommendationsSection
                result={analysisResult}
                recommendationsRef={recommendationsRef}
              />
            </LazySection>

            <div className="section-divider mx-auto max-w-6xl" />

            <LazySection>
              <ChatSection
                result={analysisResult}
                chatRef={chatRef}
              />
            </LazySection>

            <div className="section-divider mx-auto max-w-6xl" />

            <LazySection>
              <DashboardReviewSection
                result={analysisResult}
                onReviewComplete={handleDashboardReviewComplete}
                sectionRef={dashboardReviewRef}
              />
            </LazySection>

            {dashboardReview && (
              <>
                <div className="section-divider mx-auto max-w-6xl" />
                <LazySection>
                  <VisualRecommendationsSection
                    review={dashboardReview}
                    sectionRef={visualRecsRef}
                  />
                </LazySection>
              </>
            )}
          </>
        )}

        <FooterSection />
      </main>

      <AuthDialog />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
