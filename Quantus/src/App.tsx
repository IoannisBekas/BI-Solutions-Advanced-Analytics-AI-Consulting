import { useState, useCallback, useRef, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SearchHero } from './components/SearchHero';
import { WelcomeCard } from './components/WelcomeCard';
import { ProgressInsightFeed } from './components/IndustryIndicator';
import { ReportDashboard } from './components/Report';
import { NotFoundView } from './components/NotFoundView';
import { PWAInstallBanner, SWUpdateBanner } from './components/PWAInstallBanner';
import SectorPacksDashboard from './pages/SectorPacks';
import { AuthModal } from './auth/AuthModal';
import { useAuth } from './auth/AuthContext';
import { cacheReportForOffline } from './hooks/usePWA';
import type { ReportData, InsightCard, AssetEntry } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

type View = 'hero' | 'generating' | 'report' | 'sectors' | 'notFound';

const QUANTUS_WORKSPACE_ROUTE = '/quantus/';
const QUANTUS_SECTORS_ROUTE = '/quantus/sectors';

function normalizeQuantusPath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '');

  if (trimmed === '/quantus' || trimmed === '') {
    return QUANTUS_WORKSPACE_ROUTE;
  }

  if (trimmed === QUANTUS_SECTORS_ROUTE) {
    return QUANTUS_SECTORS_ROUTE;
  }

  return trimmed || QUANTUS_WORKSPACE_ROUTE;
}

function resolveRouteView(pathname: string): View {
  const normalized = normalizeQuantusPath(pathname);

  if (normalized === QUANTUS_WORKSPACE_ROUTE) {
    return 'hero';
  }

  if (normalized === QUANTUS_SECTORS_ROUTE) {
    return 'sectors';
  }

  return 'notFound';
}

function App() {
  const { user, signOut } = useAuth();
  const [view, setView] = useState<View>(() => resolveRouteView(window.location.pathname));
  const [lightMode, setLightMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('quantus-theme');
    return saved !== null ? saved === 'light' : true;
  });
  const [report, setReport] = useState<ReportData | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTicker, setCurrentTicker] = useState('');
  const [currentPath, setCurrentPath] = useState(() => normalizeQuantusPath(window.location.pathname));
  const [, setCurrentAsset] = useState<AssetEntry | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // AbortController refs for cancelling in-flight requests
  const searchAbortRef = useRef<AbortController | null>(null);
  const insightAbortRef = useRef<AbortController | null>(null);

  // Use refs for keyboard handler to avoid stale closures
  const viewRef = useRef(view);
  viewRef.current = view;

  const syncBrowserRoute = useCallback((nextPath: string, replace = false) => {
    const normalized = normalizeQuantusPath(nextPath);

    if (window.location.pathname !== normalized) {
      window.history[replace ? 'replaceState' : 'pushState'](window.history.state, '', normalized);
    }

    setCurrentPath(normalized);
  }, []);

  // Keyboard Navigation — uses refs to avoid stale closures
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 't': {
          e.preventDefault();
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          if (searchInput) searchInput.focus();
          break;
        }
        case 'g':
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          e.preventDefault();
          document.querySelectorAll('.report-section')[parseInt(e.key) - 1]?.scrollIntoView({ behavior: 'smooth' });
          break;
        case 'e': {
          e.preventDefault();
          const firstDeepDive = document.querySelector('.deep-dive-trigger') as HTMLButtonElement;
          if (firstDeepDive) firstDeepDive.click();
          break;
        }
        case 'w':
          e.preventDefault();
          break;
        case 'p':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            window.print();
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cleanup AbortControllers on unmount
  useEffect(() => {
    return () => {
      searchAbortRef.current?.abort();
      insightAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const normalized = normalizeQuantusPath(window.location.pathname);

    if (normalized !== window.location.pathname) {
      window.history.replaceState(window.history.state, '', normalized);
    }

    setCurrentPath(normalized);
    setView(resolveRouteView(normalized));

    const handlePopState = () => {
      const nextPath = normalizeQuantusPath(window.location.pathname);
      setCurrentPath(nextPath);
      setView(resolveRouteView(nextPath));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!report?.ticker) return;
    cacheReportForOffline(report.ticker);
  }, [report?.ticker]);

  useEffect(() => {
    const pagePath = view === 'sectors'
      ? QUANTUS_SECTORS_ROUTE
      : view === 'notFound'
        ? currentPath
        : QUANTUS_WORKSPACE_ROUTE;

    const pageTitle = view === 'sectors'
      ? 'Quantus Sector Packs | BI Solutions Group'
      : view === 'report'
        ? `${report?.ticker ?? currentTicker ?? 'Quantus'} Research Report | BI Solutions Group`
        : view === 'generating'
          ? `Generating ${currentTicker || 'Quantus'} Research | BI Solutions Group`
          : view === 'notFound'
            ? 'Quantus Not Found | BI Solutions Group'
            : 'Quantus Workspace | BI Solutions Group';

    document.title = pageTitle;

    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-M1276CBX6M', {
        page_path: pagePath,
        page_title: pageTitle,
      });
    }
  }, [currentPath, currentTicker, report?.ticker, view]);

  const handleSearch = useCallback(async (ticker: string, asset: AssetEntry) => {
    // Abort any previous in-flight search and insight stream
    searchAbortRef.current?.abort();
    insightAbortRef.current?.abort();
    const searchController = new AbortController();
    searchAbortRef.current = searchController;

    setCurrentTicker(ticker);
    setCurrentAsset(asset);
    setInsights([]);
    setReport(null);
    setIsGenerating(true);
    setView('generating');
    syncBrowserRoute(QUANTUS_WORKSPACE_ROUTE);

    // Fire Telemetry Tracking (non-critical, no abort needed)
    fetch('/quantus/api/v1/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'anon_local_dev',
          event_type: 'search_ticker',
          data: { ticker, asset_class: asset.assetClass },
        })
    }).catch(() => { /* telemetry is non-critical, silently ignore */ });

    // Start streaming insights
    streamInsights(ticker, asset.assetClass);

    try {
      const resp = await fetch(`/quantus/api/report/${encodeURIComponent(ticker)}?user_tier=UNLOCKED`, {
        signal: searchController.signal,
      });
      if (resp.ok) {
        const data = await resp.json();
        const reportPayload = data.report ?? data;
        if (reportPayload?.ticker && reportPayload?.company_name) {
          setReport(reportPayload);
        } else {
          setReport(buildShellReport(ticker, asset));
        }
      } else {
        setReport(buildShellReport(ticker, asset));
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return; // cancelled, ignore
      console.error('Report fetch error:', err);
      setReport(buildShellReport(ticker, asset));
    } finally {
      if (!searchController.signal.aborted) {
        setInsights(prev => [...prev, {
          id: String(prev.length + 1),
          category: 'model',
          text: `Report complete — shared with research community. Quantus Engine: Meridian v2.4`,
        }]);
        setIsGenerating(false);
      }
    }
  }, [syncBrowserRoute]);

  const streamInsights = useCallback(async (ticker: string, assetClass: string) => {
    // Abort any previous insight stream
    insightAbortRef.current?.abort();
    const controller = new AbortController();
    insightAbortRef.current = controller;

    try {
      const resp = await fetch('/quantus/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, assetClass }),
        signal: controller.signal,
      });
      if (!resp.ok || !resp.body) return;

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value).split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const card = JSON.parse(line.slice(6));
                if (card.id) {
                  setInsights(prev => {
                    if (prev.some(p => p.id === card.id)) return prev;
                    return [...prev, card];
                  });
                }
              } catch {
                // Ignore malformed SSE chunks
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('Insight stream error:', err);
    }
  }, []);

  const handleViewReport = useCallback(() => {
    syncBrowserRoute(QUANTUS_WORKSPACE_ROUTE);
    setView('report');
    setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }, [syncBrowserRoute]);

  const handleBack = useCallback(() => {
    syncBrowserRoute(QUANTUS_WORKSPACE_ROUTE);
    setView('hero');
    setReport(null);
    setInsights([]);
    setCurrentTicker('');
  }, [syncBrowserRoute]);

  const handleOpenSectors = useCallback(() => {
    syncBrowserRoute(QUANTUS_SECTORS_ROUTE);
    setView('sectors');
  }, [syncBrowserRoute]);

  const handleOpenWorkspace = useCallback(() => {
    handleBack();
  }, [handleBack]);

  return (
    <Layout
      currentView={view === 'report' || view === 'generating' ? 'hero' : view}
      lightMode={lightMode}
      userName={user?.name ?? null}
      userTier={user?.tier ?? null}
      onToggleLight={() => setLightMode(l => {
        const next = !l;
        localStorage.setItem('quantus-theme', next ? 'light' : 'dark');
        return next;
      })}
      onOpenAuth={() => setAuthModalOpen(true)}
      onSignOut={signOut}
      onNavigate={v => {
        if (v === 'hero') {
          handleOpenWorkspace();
        } else if (v === 'sectors') {
          handleOpenSectors();
        }
      }}
    >
      <AnimatePresence mode="wait">
        {view === 'hero' && (
          <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SearchHero onSearch={handleSearch} lightMode={lightMode} />
          </motion.div>
        )}

        {(view === 'generating' || view === 'report') && (
          <motion.div key="report-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Back button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 mb-6 text-sm cursor-pointer transition-colors hover:text-blue-400"
              style={{ color: '#9CA3AF' }}
            >
              <ArrowLeft className="w-4 h-4" />
              New Search
            </button>

            {/* WelcomeCard (shown while generating and after report loads) */}
            {report && (
              <WelcomeCard
                report={report}
                lightMode={lightMode}
                onSubscribe={() => undefined}
              />
            )}

            {/* Progress insight feed — shown while generating */}
            {view === 'generating' && (
              <ProgressInsightFeed
                insights={insights}
                isGenerating={isGenerating}
                ticker={currentTicker}
                onViewReport={handleViewReport}
                lightMode={lightMode}
              />
            )}

            {/* Full report */}
            {view === 'report' && report && (
              <div ref={reportRef}>
                <ReportDashboard report={report} lightMode={lightMode} />
              </div>
            )}

            {/* If generating is done and no button clicked, auto-show report once insights complete */}
            {view === 'generating' && !isGenerating && report && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8"
              >
                <ReportDashboard report={report} lightMode={lightMode} />
              </motion.div>
            )}
          </motion.div>
        )}

        {view === 'sectors' && (
          <motion.div key="sectors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SectorPacksDashboard />
          </motion.div>
        )}

        {view === 'notFound' && (
          <motion.div key="not-found" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <NotFoundView
              path={currentPath}
              onGoWorkspace={handleOpenWorkspace}
              onGoSectors={handleOpenSectors}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <PWAInstallBanner lightMode={lightMode} />
      <SWUpdateBanner lightMode={lightMode} />
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="signin"
        lightMode={lightMode}
      />
    </Layout>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildShellReport(ticker: string, asset: AssetEntry): ReportData {
  return {
    engine: 'Meridian v2.4',
    report_id: `QRS-2026-${String(Math.floor(Math.random() * 90000 + 10000))}`,
    ticker,
    company_name: asset.name,
    exchange: asset.exchange,
    sector: asset.sector ?? 'Unknown',
    industry: asset.sector ?? 'Unknown',
    market_cap: 'N/A',
    asset_class: asset.assetClass,
    description: `${asset.name} is a ${asset.assetClass.toLowerCase()} asset traded on ${asset.exchange}. This is a live report generated by Meridian v2.4. Full quantitative analysis requires live data API connections.`,
    current_price: asset.currentPrice ?? 0,
    day_change: asset.dayChange ?? 0,
    day_change_pct: asset.dayChangePct ?? 0,
    week_52_high: (asset.currentPrice ?? 0) * 1.3,
    week_52_low: (asset.currentPrice ?? 0) * 0.7,
    regime: {
      label: 'Mean-Reverting',
      implication: 'Live regime detection requires market data API. Defaulting to Mean-Reverting.',
      active_strategies: ['Balanced'],
      suppressed_strategies: [],
    },
    overall_signal: 'NEUTRAL',
    confidence_score: 50,
    confidence_breakdown: {
      momentum: 8, sentiment: 7, regime_alignment: 8, model_ensemble_agreement: 7,
      alternative_data: 7, macro_context: 8, data_quality: 5,
    },
    model_ensemble: {
      lstm: { forecast: 'N/A', weight: '45%', accuracy: 'N/A' },
      prophet: { forecast: 'N/A', weight: '35%', accuracy: 'N/A' },
      arima: { forecast: 'N/A', weight: '20%', accuracy: 'N/A' },
      ensemble_forecast: 'N/A',
      confidence_band: { low: 'N/A', high: 'N/A' },
      regime_accuracy_note: 'Connect to live data APIs for model ensemble.',
    },
    signal_cards: [
      { label: 'Status', value: 'Live report', trend: 'neutral', plain_note: 'This asset does not yet have pre-computed data. Quantitative signals require live market data integration.', data_source: 'Meridian v2.4', freshness: 'Now', quality_score: 50, icon: '🔬' },
    ],
    alternative_data: {
      grok_x_sentiment: { score: 0.5, volume: 0, credibility_weighted: 0.5, campaign_detected: false, freshness: 'N/A' },
      reddit_score: 0.5,
      news_score: 0.5,
      composite_sentiment: 0.5,
      institutional_flow: 'N/A — live data required',
      insider_activity: 'N/A',
      short_interest: 'N/A',
      iv_rank: 'N/A',
      implied_move: 'N/A',
      transcript_score: 'N/A',
      sec_language_trend: 'N/A',
    },
    risk: {
      var_dollar: 'N/A',
      expected_shortfall: 'N/A',
      max_drawdown: 'N/A',
      sharpe_ratio: 0,
      volatility_vs_peers: 'N/A',
      implied_move: 'N/A',
      stress_tests: [{ scenario: 'Live data required', return: 'N/A', recovery: 'N/A' }],
      macro_context: { fed_rate: '4.25%', yield_curve: 'Slightly inverted', vix: '16.4', credit_spreads: '98bps' },
    },
    strategy: {
      action: 'NEUTRAL',
      confidence: 50,
      regime_context: 'Connect to live APIs for strategy recommendation',
      entry_zone: 'N/A',
      target: 'N/A',
      stop_loss: 'N/A',
      risk_reward: 'N/A',
      position_size_pct: 'N/A',
      kelly_derived_max: 'N/A',
    },
    narrative_executive_summary: `This is a live Quantus report for ${ticker} (${asset.name}). Complete quantitative signals require connections to live market data APIs (Yahoo Finance, Grok API, CBOE options, SEC EDGAR, etc.). The deep dive modules above are powered by Gemini AI and are fully functional — click any to generate institutional narrative analysis.`,
    narrative_plain: `${asset.name} doesn't yet have pre-computed signals. The AI-powered deep dives below are live — click any module to generate expert analysis.`,
    researcher_count: 1,
    generated_at: new Date().toISOString(),
    cache_age: 'Just now',
    data_sources: [{ name: 'Gemini AI (Narrative)', tier: 2, freshness: 'Live' }],
    peer_group: [],
  };
}

export default App;
