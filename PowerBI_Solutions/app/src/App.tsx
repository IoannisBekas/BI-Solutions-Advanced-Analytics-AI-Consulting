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
import { Database, CheckCircle, LogIn } from 'lucide-react';
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
  const { user, setAuthDialogOpen } = useAuth();

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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-black font-semibold">PowerBI Solutions</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {analysisResult && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs border border-green-200">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Model Analyzed</span>
                </div>
              )}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Demo auth</span>
              </div>
              {user ? (
                <UserMenu />
              ) : (
                <button
                  onClick={() => setAuthDialogOpen(true)}
                  className="btn-secondary text-sm py-2 px-4 min-h-[44px] flex items-center gap-2"
                  aria-label="Sign in"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
              <button
                onClick={scrollToInput}
                className="btn-primary text-sm py-2.5 px-5 min-h-[44px]"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <HeroSection onScrollToInput={scrollToInput} />

        <div className="section-divider mx-auto max-w-4xl" />

        <TMDLInputSection
          onAnalysisComplete={handleAnalysisComplete}
          inputRef={inputRef}
        />

        {analysisResult && (
          <>
            <div className="section-divider mx-auto max-w-4xl" />

            <LazySection>
              <AnalysisResultsSection
                result={analysisResult}
                resultsRef={resultsRef}
              />
            </LazySection>

            <div className="section-divider mx-auto max-w-4xl" />

            <LazySection>
              <RecommendationsSection
                result={analysisResult}
                recommendationsRef={recommendationsRef}
              />
            </LazySection>

            <div className="section-divider mx-auto max-w-4xl" />

            <LazySection>
              <ChatSection
                result={analysisResult}
                chatRef={chatRef}
              />
            </LazySection>

            <div className="section-divider mx-auto max-w-4xl" />

            <LazySection>
              <DashboardReviewSection
                result={analysisResult}
                onReviewComplete={handleDashboardReviewComplete}
                sectionRef={dashboardReviewRef}
              />
            </LazySection>

            {dashboardReview && (
              <>
                <div className="section-divider mx-auto max-w-4xl" />
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
