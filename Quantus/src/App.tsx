import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Layout } from './components/Layout';
import { SearchHero } from './components/SearchHero';
import { StickyReportStrip } from './components/StickyReportStrip';
import { WelcomeCard } from './components/WelcomeCard';
import { ProgressInsightFeed } from './components/IndustryIndicator';
import { NotFoundView } from './components/NotFoundView';
import { PWAInstallBanner, SWUpdateBanner } from './components/PWAInstallBanner';
import { AuthModal } from './auth/AuthModal';
import { useAuth } from './auth/AuthContext';
import { cacheReportForOffline } from './hooks/usePWA';
import { fetchWorkspaceAsset, fetchWorkspaceReport, fetchWorkspaceSummary } from './services/workspace';
import type { AssetEntry, InsightCard, ReportResponse, WorkspaceSummary, WorkspaceStatus } from './types';

const ReportDashboard = lazy(async () => {
    const module = await import('./components/Report');
    return { default: module.ReportDashboard };
});
const SectorPacksDashboard = lazy(() => import('./pages/SectorPacks'));
const Watchlist = lazy(async () => {
    const module = await import('./pages/Watchlist');
    return { default: module.Watchlist };
});
const Archive = lazy(async () => {
    const module = await import('./pages/Archive');
    return { default: module.Archive };
});
const AccuracyDashboard = lazy(async () => {
    const module = await import('./pages/AccuracyDashboard');
    return { default: module.AccuracyDashboard };
});
const Methodology = lazy(async () => {
    const module = await import('./pages/Methodology');
    return { default: module.Methodology };
});

type RouteView = 'hero' | 'report' | 'sectors' | 'watchlist' | 'archive' | 'accuracy' | 'methodology' | 'notFound';
type DisplayView = RouteView | 'generating';

interface RouteState {
    view: RouteView;
    path: string;
    ticker?: string;
}

const QUANTUS_WORKSPACE_ROUTE = '/quantus/workspace/';
const QUANTUS_REPORT_ROUTE_PREFIX = '/quantus/workspace/report';
const QUANTUS_SECTORS_ROUTE = '/quantus/workspace/sectors';
const QUANTUS_WATCHLIST_ROUTE = '/quantus/workspace/watchlist';
const QUANTUS_ARCHIVE_ROUTE = '/quantus/workspace/archive';
const QUANTUS_ACCURACY_ROUTE = '/quantus/workspace/accuracy';
const QUANTUS_METHODOLOGY_ROUTE = '/quantus/workspace/methodology';
const QUANTUS_LEGACY_WORKSPACE_ROUTE = '/quantus';
const RECENT_ASSETS_STORAGE_KEY = 'quantus-recent-assets';
const PINNED_ASSETS_STORAGE_KEY = 'quantus-pinned-assets';
const REPORT_CACHE_STORAGE_PREFIX = 'quantus-last-report:';

function getReportRoute(ticker: string) {
    return `${QUANTUS_REPORT_ROUTE_PREFIX}/${encodeURIComponent(ticker.trim().toUpperCase())}`;
}

function normalizeQuantusPath(pathname: string) {
    const trimmed = pathname.replace(/\/+$/, '');

    if (trimmed === '' || trimmed === QUANTUS_LEGACY_WORKSPACE_ROUTE || trimmed === '/quantus/workspace') {
        return QUANTUS_WORKSPACE_ROUTE;
    }

    if (trimmed === QUANTUS_REPORT_ROUTE_PREFIX || trimmed === '/quantus/report') {
        return QUANTUS_WORKSPACE_ROUTE;
    }

    if (trimmed.startsWith('/quantus/report/')) {
        return `${QUANTUS_REPORT_ROUTE_PREFIX}/${trimmed.slice('/quantus/report/'.length)}`;
    }

    if (trimmed.startsWith(`${QUANTUS_REPORT_ROUTE_PREFIX}/`)) {
        const reportTicker = decodeURIComponent(trimmed.slice(`${QUANTUS_REPORT_ROUTE_PREFIX}/`.length)).trim().toUpperCase();
        return reportTicker ? getReportRoute(reportTicker) : QUANTUS_WORKSPACE_ROUTE;
    }

    if (trimmed === QUANTUS_SECTORS_ROUTE) return QUANTUS_SECTORS_ROUTE;
    if (trimmed === QUANTUS_WATCHLIST_ROUTE) return QUANTUS_WATCHLIST_ROUTE;
    if (trimmed === QUANTUS_ARCHIVE_ROUTE) return QUANTUS_ARCHIVE_ROUTE;
    if (trimmed === QUANTUS_ACCURACY_ROUTE) return QUANTUS_ACCURACY_ROUTE;
    if (trimmed === QUANTUS_METHODOLOGY_ROUTE) return QUANTUS_METHODOLOGY_ROUTE;

    return trimmed;
}

function resolveRoute(pathname: string): RouteState {
    const normalized = normalizeQuantusPath(pathname);

    if (normalized === QUANTUS_WORKSPACE_ROUTE) {
        return { view: 'hero', path: QUANTUS_WORKSPACE_ROUTE };
    }

    if (normalized === QUANTUS_SECTORS_ROUTE) {
        return { view: 'sectors', path: QUANTUS_SECTORS_ROUTE };
    }

    if (normalized === QUANTUS_WATCHLIST_ROUTE) {
        return { view: 'watchlist', path: QUANTUS_WATCHLIST_ROUTE };
    }

    if (normalized === QUANTUS_ARCHIVE_ROUTE) {
        return { view: 'archive', path: QUANTUS_ARCHIVE_ROUTE };
    }

    if (normalized === QUANTUS_ACCURACY_ROUTE) {
        return { view: 'accuracy', path: QUANTUS_ACCURACY_ROUTE };
    }

    if (normalized === QUANTUS_METHODOLOGY_ROUTE) {
        return { view: 'methodology', path: QUANTUS_METHODOLOGY_ROUTE };
    }

    if (normalized.startsWith(`${QUANTUS_REPORT_ROUTE_PREFIX}/`)) {
        const ticker = decodeURIComponent(normalized.slice(`${QUANTUS_REPORT_ROUTE_PREFIX}/`.length)).trim().toUpperCase();
        if (ticker) {
            return { view: 'report', path: getReportRoute(ticker), ticker };
        }
    }

    return { view: 'notFound', path: normalized };
}

function buildEmergencyStarterReport(asset: AssetEntry, status: WorkspaceStatus): ReportResponse {
    return {
        report: {
            engine: 'Meridian v2.4',
            report_id: `QRS-2026-${String(Math.floor(Math.random() * 90000 + 10000))}`,
            ticker: asset.ticker,
            company_name: asset.name,
            exchange: asset.exchange,
            sector: asset.sector ?? 'Unclassified',
            industry: asset.sector ?? 'Unclassified',
            market_cap: 'Unavailable',
            asset_class: asset.assetClass,
            description: `${asset.name} is visible in the Quantus workspace, but the report service was unavailable during load. This emergency starter shell keeps the URL and workflow intact until the API is reachable again.`,
            // Never display stale registry prices as if they were live market data.
            current_price: 0,
            day_change: 0,
            day_change_pct: 0,
            week_52_high: 0,
            week_52_low: 0,
            regime: {
                label: 'Transitional',
                implication: 'Quantus could not complete the report handoff because the API request failed.',
                active_strategies: ['Manual review'],
                suppressed_strategies: ['Automated conviction signals'],
            },
            overall_signal: 'NEUTRAL',
            confidence_score: 20,
            confidence_breakdown: {
                momentum: 3,
                sentiment: 3,
                regime_alignment: 3,
                model_ensemble_agreement: 3,
                alternative_data: 3,
                macro_context: 3,
                data_quality: 2,
            },
            model_ensemble: {
                lstm: { forecast: 'Unavailable', weight: 'N/A', accuracy: 'N/A' },
                prophet: { forecast: 'Unavailable', weight: 'N/A', accuracy: 'N/A' },
                arima: { forecast: 'Unavailable', weight: 'N/A', accuracy: 'N/A' },
                ensemble_forecast: 'Unavailable',
                confidence_band: { low: 'N/A', high: 'N/A' },
                regime_accuracy_note: 'The Quantus API request failed before a model run could be loaded.',
            },
            signal_cards: [
                {
                    label: 'Workspace state',
                    value: 'API unavailable',
                    trend: 'neutral',
                    plain_note: 'This page is an emergency fallback generated in the browser because the Quantus API could not be reached.',
                    data_source: 'Client fallback',
                    freshness: 'Unavailable',
                    quality_score: 15,
                },
            ],
            alternative_data: {
                grok_x_sentiment: { score: 0.5, volume: 0, credibility_weighted: 0.5, campaign_detected: false, freshness: 'Unavailable' },
                reddit_score: 0.5,
                news_score: 0.5,
                composite_sentiment: 0.5,
                institutional_flow: 'Unavailable',
                insider_activity: 'Unavailable',
                short_interest: 'Unavailable',
                iv_rank: 'Unavailable',
                implied_move: 'Unavailable',
                transcript_score: 'Unavailable',
                sec_language_trend: 'Unavailable',
            },
            risk: {
                var_dollar: 'Unavailable',
                expected_shortfall: 'Unavailable',
                max_drawdown: 'Unavailable',
                sharpe_ratio: 0,
                volatility_vs_peers: 'Unavailable',
                implied_move: 'Unavailable',
                stress_tests: [{ scenario: 'API unavailable', return: 'Unavailable', recovery: 'Unavailable' }],
                macro_context: { fed_rate: 'Unavailable', yield_curve: 'Unavailable', vix: 'Unavailable', credit_spreads: 'Unavailable' },
            },
            strategy: {
                action: 'NEUTRAL',
                confidence: 20,
                regime_context: 'The Quantus API request failed, so this report should not be treated as a signal.',
                entry_zone: 'Unavailable',
                target: 'Unavailable',
                stop_loss: 'Unavailable',
                risk_reward: 'Unavailable',
                position_size_pct: 'Manual only',
                kelly_derived_max: 'Unavailable',
            },
            narrative_executive_summary: 'Quantus could not load the report service for this ticker. The route remains available, but this page is only an emergency fallback.',
            narrative_plain: 'Refresh once the Quantus API is reachable again.',
            researcher_count: 0,
            generated_at: new Date().toISOString(),
            cache_age: 'Unavailable',
            data_sources: [{ name: 'Client emergency fallback', tier: 4, freshness: 'Unavailable' }],
            peer_group: [],
        },
        source: 'starter',
        ticker: asset.ticker,
        message: 'Quantus report service unavailable.',
        detail: 'The API request failed, so an emergency starter shell was opened locally.',
        freshness: 'Unavailable',
        status,
    };
}

function isStoredReportResponse(value: unknown): value is ReportResponse {
    return typeof value === 'object'
        && value !== null
        && typeof (value as ReportResponse).ticker === 'string'
        && typeof (value as ReportResponse).source === 'string'
        && typeof (value as ReportResponse).message === 'string'
        && typeof (value as ReportResponse).detail === 'string'
        && typeof (value as ReportResponse).report === 'object'
        && (value as ReportResponse).report !== null;
}

function readStoredReportResponse(ticker: string): ReportResponse | null {
    try {
        const raw = localStorage.getItem(`${REPORT_CACHE_STORAGE_PREFIX}${ticker.trim().toUpperCase()}`);
        if (!raw) return null;
        const parsed: unknown = JSON.parse(raw);
        return isStoredReportResponse(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

function writeStoredReportResponse(response: ReportResponse) {
    try {
        if (response.source === 'starter') return;
        localStorage.setItem(
            `${REPORT_CACHE_STORAGE_PREFIX}${response.ticker.trim().toUpperCase()}`,
            JSON.stringify(response),
        );
    } catch {
        // Ignore storage quota / serialization issues.
    }
}

function isStoredAssetEntry(value: unknown): value is AssetEntry {
    return typeof value === 'object'
        && value !== null
        && typeof (value as AssetEntry).ticker === 'string'
        && typeof (value as AssetEntry).name === 'string'
        && typeof (value as AssetEntry).exchange === 'string'
        && typeof (value as AssetEntry).assetClass === 'string';
}

function readStoredAssets(key: string) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [] as AssetEntry[];
        const parsed: unknown = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(isStoredAssetEntry) : [];
    } catch {
        return [] as AssetEntry[];
    }
}

function upsertAsset(list: AssetEntry[], asset: AssetEntry, maxItems = 6) {
    return [asset, ...list.filter((entry) => entry.ticker !== asset.ticker)].slice(0, maxItems);
}

function buildAssetEntryFromReport(report: ReportResponse['report'], source: ReportResponse['source']): AssetEntry {
    return {
        ticker: report.ticker,
        name: report.company_name,
        exchange: report.exchange,
        assetClass: report.asset_class,
        sector: report.sector,
        hasCachedReport: source === 'cached',
        cachedReportAge: report.cache_age,
        researcherCount: report.researcher_count,
        currentPrice: report.current_price,
        dayChange: report.day_change,
        dayChangePct: report.day_change_pct,
    };
}

function WorkspacePanelFallback({ lightMode }: { lightMode?: boolean }) {
    return (
        <div
            className="rounded-3xl border px-6 py-8 text-sm"
            style={{
                background: lightMode ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.03)',
                borderColor: lightMode ? '#E5E7EB' : '#223046',
                color: lightMode ? '#6B7280' : '#9CA3AF',
            }}
        >
            Loading Quantus workspace panel...
        </div>
    );
}

function App() {
    const { user, signOut } = useAuth();
    const [lightMode, setLightMode] = useState<boolean>(() => {
        const saved = localStorage.getItem('quantus-theme');
        return saved !== null ? saved === 'light' : true;
    });
    const [workspaceSummary, setWorkspaceSummary] = useState<WorkspaceSummary | null>(null);
    const [reportResponse, setReportResponse] = useState<ReportResponse | null>(null);
    const [insights, setInsights] = useState<InsightCard[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentTicker, setCurrentTicker] = useState('');
    const [recentAssets, setRecentAssets] = useState<AssetEntry[]>(() => readStoredAssets(RECENT_ASSETS_STORAGE_KEY));
    const [pinnedAssets, setPinnedAssets] = useState<AssetEntry[]>(() => readStoredAssets(PINNED_ASSETS_STORAGE_KEY));
    const [showStickyStrip, setShowStickyStrip] = useState(false);
    const [currentPath, setCurrentPath] = useState(() => normalizeQuantusPath(window.location.pathname));
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
    const reportRef = useRef<HTMLDivElement>(null);
    const searchAbortRef = useRef<AbortController | null>(null);
    const insightAbortRef = useRef<AbortController | null>(null);
    const inflightTickerRef = useRef<string | null>(null);
    const pendingAssetRef = useRef<AssetEntry | null>(null);

    const route = useMemo(() => resolveRoute(currentPath), [currentPath]);
    const report = reportResponse?.report ?? null;
    const currentReportAsset = useMemo(() => {
        if (!report || !reportResponse) return null;
        return buildAssetEntryFromReport(report, reportResponse.source);
    }, [report, reportResponse]);
    const isCurrentReportPinned = useMemo(() => (
        currentReportAsset != null && pinnedAssets.some((entry) => entry.ticker === currentReportAsset.ticker)
    ), [currentReportAsset, pinnedAssets]);
    const displayView: DisplayView = route.view === 'report'
        ? (isGenerating || reportResponse?.ticker !== route.ticker ? 'generating' : 'report')
        : route.view;

    const syncBrowserRoute = useCallback((nextPath: string, replace = false) => {
        const normalized = normalizeQuantusPath(nextPath);

        if (window.location.pathname !== normalized) {
            window.history[replace ? 'replaceState' : 'pushState'](window.history.state, '', normalized);
        }

        setCurrentPath(normalized);
    }, []);

    const openAuthModal = useCallback((mode: 'signin' | 'signup' = 'signin') => {
        setAuthModalMode(mode);
        setAuthModalOpen(true);
    }, []);

    useEffect(() => {
        const normalized = normalizeQuantusPath(window.location.pathname);

        if (normalized !== window.location.pathname) {
            window.history.replaceState(window.history.state, '', normalized);
        }

        setCurrentPath(normalized);

        const handlePopState = () => {
            setCurrentPath(normalizeQuantusPath(window.location.pathname));
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
        void fetchWorkspaceSummary().then(setWorkspaceSummary).catch((error) => {
            console.error('Workspace summary error:', error);
        });
    }, []);

    useEffect(() => {
        localStorage.setItem(RECENT_ASSETS_STORAGE_KEY, JSON.stringify(recentAssets));
    }, [recentAssets]);

    useEffect(() => {
        localStorage.setItem(PINNED_ASSETS_STORAGE_KEY, JSON.stringify(pinnedAssets));
    }, [pinnedAssets]);

    useEffect(() => {
        return () => {
            searchAbortRef.current?.abort();
            insightAbortRef.current?.abort();
        };
    }, []);

    useEffect(() => {
        if (!report?.ticker) return;
        cacheReportForOffline(report.ticker);
    }, [report?.ticker]);

    useEffect(() => {
        if (route.view !== 'report') {
            setShowStickyStrip(false);
            return;
        }

        const handleScroll = () => {
            setShowStickyStrip(window.scrollY > 360);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [route.path, route.view]);

    useEffect(() => {
        const pageTitle = route.view === 'report'
            ? `${route.ticker ?? 'Quantus'} Research Report | BI Solutions Group`
            : route.view === 'sectors'
                ? 'Quantus Sector Packs | BI Solutions Group'
                : route.view === 'watchlist'
                    ? 'Quantus Watchlist | BI Solutions Group'
                    : route.view === 'archive'
                        ? 'Quantus Archive | BI Solutions Group'
                        : route.view === 'accuracy'
                            ? 'Quantus Accuracy | BI Solutions Group'
                            : route.view === 'methodology'
                                ? 'Quantus Methodology | BI Solutions Group'
                                : route.view === 'notFound'
                                    ? 'Quantus Not Found | BI Solutions Group'
                                    : 'Quantus Workspace | BI Solutions Group';

        document.title = pageTitle;

        if (typeof window.gtag === 'function') {
            window.gtag('config', 'G-M1276CBX6M', {
                page_path: route.path,
                page_title: pageTitle,
            });
        }
    }, [route.path, route.ticker, route.view]);

    const streamInsights = useCallback(async (ticker: string, assetClass: string) => {
        insightAbortRef.current?.abort();
        const controller = new AbortController();
        insightAbortRef.current = controller;

        try {
            const response = await fetch('/quantus/api/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker, assetClass }),
                signal: controller.signal,
            });

            if (!response.ok || !response.body) return;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            try {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const lines = decoder.decode(value).split('\n');
                    for (const line of lines) {
                        if (!line.startsWith('data: ') || line.includes('[DONE]')) continue;

                        try {
                            const card = JSON.parse(line.slice(6));
                            if (card.id) {
                                setInsights((previous) => (previous.some((item) => item.id === card.id) ? previous : [...previous, card]));
                            }
                        } catch {
                            // Ignore malformed SSE chunks.
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return;
            console.error('Insight stream error:', error);
        }
    }, []);

    const loadReport = useCallback(async (ticker: string, assetHint?: AssetEntry | null) => {
        const normalizedTicker = ticker.trim().toUpperCase();
        if (!normalizedTicker) return;

        searchAbortRef.current?.abort();
        insightAbortRef.current?.abort();
        const controller = new AbortController();
        searchAbortRef.current = controller;
        inflightTickerRef.current = normalizedTicker;

        setCurrentTicker(normalizedTicker);
        setInsights([]);
        setReportResponse(null);
        setIsGenerating(true);

        let responsePayload: ReportResponse | null = null;
        let asset = assetHint ?? null;

        if (!asset) {
            try {
                asset = await fetchWorkspaceAsset(normalizedTicker, controller.signal);
            } catch {
                asset = null;
            }
        }

        fetch('/quantus/api/v1/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: 'anon_local_dev',
                event_type: 'search_ticker',
                data: { ticker: normalizedTicker, asset_class: asset?.assetClass ?? 'EQUITY' },
            }),
        }).catch(() => undefined);

        void streamInsights(normalizedTicker, asset?.assetClass ?? 'EQUITY');

        try {
            responsePayload = await fetchWorkspaceReport(normalizedTicker, controller.signal);
            if (!controller.signal.aborted) {
                writeStoredReportResponse(responsePayload);
                setReportResponse(responsePayload);
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return;
            console.error('Report fetch error:', error);

            const fallbackStatus = workspaceSummary?.status ?? {
                mode: 'sandbox',
                label: 'Service unavailable',
                description: 'Quantus could not reach the report API.',
                detail: 'A local fallback shell was opened instead.',
                badgeTone: 'caution',
            };

            const lastKnownReport = readStoredReportResponse(normalizedTicker);
            if (lastKnownReport) {
                responsePayload = {
                    ...lastKnownReport,
                    source: 'cached',
                    message: 'Last known Quantus report loaded.',
                    detail: `Live refresh failed, so Quantus loaded the most recent cached report for ${normalizedTicker}. Market-sensitive fields may be stale until the API responds again.`,
                    status: {
                        mode: 'mixed',
                        label: 'Cached report fallback',
                        description: 'Live refresh failed. Quantus is showing the most recent cached research report.',
                        detail: 'Stable report sections remain available, but quote-sensitive values may be stale.',
                        badgeTone: 'caution',
                    },
                };
            } else {
                responsePayload = buildEmergencyStarterReport(
                    asset ?? {
                        ticker: normalizedTicker,
                        name: normalizedTicker,
                        exchange: 'Manual input',
                        assetClass: 'EQUITY',
                        sector: 'Unclassified',
                    },
                    fallbackStatus,
                );
            }

            if (!controller.signal.aborted) {
                setReportResponse(responsePayload);
            }
        } finally {
            if (!controller.signal.aborted) {
                const rememberedAsset = responsePayload
                    ? buildAssetEntryFromReport(responsePayload.report, responsePayload.source)
                    : asset;

                if (rememberedAsset) {
                    setRecentAssets((previous) => upsertAsset(previous, rememberedAsset, 6));
                }

                const completionText = responsePayload?.source === 'cached'
                    ? 'Cached Quantus coverage is ready.'
                    : responsePayload?.source === 'live'
                        ? 'Live Quantus pipeline report is ready.'
                        : 'Starter shell ready — no cached Quantus coverage exists yet.';

                setInsights((previous) => [
                    ...previous,
                    {
                        id: `${normalizedTicker}-complete`,
                        category: 'model',
                        text: completionText,
                        isComplete: true,
                    },
                ]);
                setIsGenerating(false);
            }
        }
    }, [streamInsights, workspaceSummary?.status]);

    useEffect(() => {
        if (route.view !== 'report' || !route.ticker) {
            inflightTickerRef.current = null;
            return;
        }

        if (route.ticker === inflightTickerRef.current && isGenerating) {
            return;
        }

        if (route.ticker === reportResponse?.ticker && !isGenerating) {
            return;
        }

        const assetHint = pendingAssetRef.current;
        pendingAssetRef.current = null;
        void loadReport(route.ticker, assetHint);
    }, [route.ticker, route.view, isGenerating, loadReport, reportResponse?.ticker]);

    const openReportRoute = useCallback((ticker: string, asset?: AssetEntry) => {
        const normalizedTicker = ticker.trim().toUpperCase();
        pendingAssetRef.current = asset ?? null;

        const nextRoute = getReportRoute(normalizedTicker);
        if (currentPath === nextRoute) {
            void loadReport(normalizedTicker, asset ?? null);
            return;
        }

        syncBrowserRoute(nextRoute);
    }, [currentPath, loadReport, syncBrowserRoute]);

    const handleBack = useCallback(() => {
        searchAbortRef.current?.abort();
        insightAbortRef.current?.abort();
        inflightTickerRef.current = null;
        setInsights([]);
        setReportResponse(null);
        setCurrentTicker('');
        setIsGenerating(false);
        syncBrowserRoute(QUANTUS_WORKSPACE_ROUTE);
    }, [syncBrowserRoute]);

    const handleNavigate = useCallback((view: string) => {
        if (view === 'hero') syncBrowserRoute(QUANTUS_WORKSPACE_ROUTE);
        if (view === 'sectors') syncBrowserRoute(QUANTUS_SECTORS_ROUTE);
        if (view === 'watchlist') syncBrowserRoute(QUANTUS_WATCHLIST_ROUTE);
        if (view === 'archive') syncBrowserRoute(QUANTUS_ARCHIVE_ROUTE);
        if (view === 'accuracy') syncBrowserRoute(QUANTUS_ACCURACY_ROUTE);
        if (view === 'methodology') syncBrowserRoute(QUANTUS_METHODOLOGY_ROUTE);
    }, [syncBrowserRoute]);

    const handleViewReport = useCallback(() => {
        window.setTimeout(() => {
            reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
    }, []);

    const togglePinnedAsset = useCallback((asset: AssetEntry) => {
        setPinnedAssets((previous) => {
            if (previous.some((entry) => entry.ticker === asset.ticker)) {
                return previous.filter((entry) => entry.ticker !== asset.ticker);
            }

            return upsertAsset(previous, asset, 8);
        });
    }, []);

    const handleToggleCurrentReportPinned = useCallback(() => {
        if (!currentReportAsset) return;
        togglePinnedAsset(currentReportAsset);
    }, [currentReportAsset, togglePinnedAsset]);

    const handleSubscribe = useCallback(() => {
        if (!currentReportAsset) return;

        if (!user) {
            openAuthModal('signup');
            return;
        }

        const wasPinned = pinnedAssets.some((entry) => entry.ticker === currentReportAsset.ticker);

        if (!wasPinned) {
            togglePinnedAsset(currentReportAsset);
        }

        window.alert(
            `Alerts for ${currentReportAsset.ticker} are not connected yet in this preview. `
            + `${wasPinned ? 'It is already in your local watchlist.' : 'It was added to your local watchlist.'}`,
        );
    }, [currentReportAsset, openAuthModal, pinnedAssets, togglePinnedAsset, user]);

    const handleManageAlerts = useCallback(() => {
        if (!user) {
            openAuthModal('signup');
            return;
        }

        window.alert('Custom watchlist alerts are not connected yet in this preview. Sign-in works; alert delivery is the next integration.');
    }, [openAuthModal, user]);

    const handleOpenRelatedTicker = useCallback((ticker: string) => {
        openReportRoute(ticker);
    }, [openReportRoute]);

    return (
        <Layout
            currentView={route.view === 'report' ? 'hero' : route.view}
            lightMode={lightMode}
            userName={user?.name ?? null}
            userTier={user?.tier ?? null}
            workspaceStatus={workspaceSummary?.status ?? reportResponse?.status ?? null}
            onToggleLight={() => setLightMode((value) => {
                const next = !value;
                localStorage.setItem('quantus-theme', next ? 'light' : 'dark');
                return next;
            })}
            onOpenAuth={(mode) => openAuthModal(mode ?? 'signin')}
            onSignOut={signOut}
            onNavigate={handleNavigate}
        >
            <AnimatePresence mode="wait">
                {route.view === 'hero' && (
                    <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <SearchHero
                            onSearch={openReportRoute}
                            lightMode={lightMode}
                            workspaceSummary={workspaceSummary}
                            recentAssets={recentAssets}
                            pinnedAssets={pinnedAssets}
                            onTogglePinned={togglePinnedAsset}
                        />
                    </motion.div>
                )}

                {route.view === 'report' && (
                    <motion.div key={route.path} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {report && (
                            <StickyReportStrip
                                report={report}
                                visible={showStickyStrip}
                                lightMode={lightMode}
                                reportSource={reportResponse?.source}
                                reportMessage={reportResponse?.message}
                                shareUrl={window.location.href}
                                onSubscribe={handleSubscribe}
                            />
                        )}

                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 mb-6 text-sm cursor-pointer transition-colors hover:text-blue-400"
                            style={{ color: '#9CA3AF' }}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            New Search
                        </button>

                        {report && (
                            <WelcomeCard
                                report={report}
                                lightMode={lightMode}
                                onSubscribe={handleSubscribe}
                                onOpenTicker={handleOpenRelatedTicker}
                                reportSource={reportResponse?.source}
                                reportMessage={reportResponse?.message}
                                reportDetail={reportResponse?.detail}
                            />
                        )}

                        <ProgressInsightFeed
                            insights={insights}
                            isGenerating={isGenerating}
                            ticker={currentTicker || route.ticker || ''}
                            reportId={report?.report_id}
                            onViewReport={handleViewReport}
                            lightMode={lightMode}
                            completionTitle={reportResponse?.source === 'starter'
                                ? 'Starter shell ready'
                                : reportResponse?.source === 'live'
                                    ? 'Live report ready'
                                    : 'Cached report ready'}
                            completionDetail={reportResponse ? `${reportResponse.ticker} · ${reportResponse.message}` : undefined}
                        />

                        {displayView === 'report' && report && (
                            <Suspense fallback={<WorkspacePanelFallback lightMode={lightMode} />}>
                                <div ref={reportRef}>
                                    <ReportDashboard
                                        report={report}
                                        lightMode={lightMode}
                                        onSubscribe={handleSubscribe}
                                        onToggleWatchlist={handleToggleCurrentReportPinned}
                                        isWatchlisted={isCurrentReportPinned}
                                    />
                                </div>
                            </Suspense>
                        )}

                        {displayView === 'generating' && !isGenerating && report && (
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-8"
                            >
                                <Suspense fallback={<WorkspacePanelFallback lightMode={lightMode} />}>
                                    <div ref={reportRef}>
                                        <ReportDashboard
                                            report={report}
                                            lightMode={lightMode}
                                            onSubscribe={handleSubscribe}
                                            onToggleWatchlist={handleToggleCurrentReportPinned}
                                            isWatchlisted={isCurrentReportPinned}
                                        />
                                    </div>
                                </Suspense>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {route.view === 'sectors' && (
                    <motion.div key="sectors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Suspense fallback={<WorkspacePanelFallback lightMode={lightMode} />}>
                            <SectorPacksDashboard />
                        </Suspense>
                    </motion.div>
                )}

                {route.view === 'watchlist' && (
                    <motion.div key="watchlist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Suspense fallback={<WorkspacePanelFallback lightMode={lightMode} />}>
                            <Watchlist
                                userTier={(user?.tier as 'FREE' | 'UNLOCKED' | 'INSTITUTIONAL' | undefined) ?? 'FREE'}
                                lightMode={lightMode}
                                savedAssets={pinnedAssets}
                                onOpenAlerts={handleManageAlerts}
                                onSelectTicker={(ticker) => openReportRoute(ticker)}
                            />
                        </Suspense>
                    </motion.div>
                )}

                {route.view === 'archive' && (
                    <motion.div key="archive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Suspense fallback={<WorkspacePanelFallback lightMode={lightMode} />}>
                            <Archive
                                userTier={(user?.tier as 'FREE' | 'UNLOCKED' | 'INSTITUTIONAL' | undefined) ?? 'FREE'}
                                lightMode={lightMode}
                                onViewReport={(snapshot: { ticker: string }) => openReportRoute(snapshot.ticker)}
                            />
                        </Suspense>
                    </motion.div>
                )}

                {route.view === 'accuracy' && (
                    <motion.div key="accuracy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Suspense fallback={<WorkspacePanelFallback lightMode={lightMode} />}>
                            <AccuracyDashboard lightMode={lightMode} />
                        </Suspense>
                    </motion.div>
                )}

                {route.view === 'methodology' && (
                    <motion.div key="methodology" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Suspense fallback={<WorkspacePanelFallback lightMode={lightMode} />}>
                            <Methodology lightMode={lightMode} />
                        </Suspense>
                    </motion.div>
                )}

                {route.view === 'notFound' && (
                    <motion.div key="not-found" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <NotFoundView
                            path={route.path}
                            onGoWorkspace={() => syncBrowserRoute(QUANTUS_WORKSPACE_ROUTE)}
                            onGoSectors={() => syncBrowserRoute(QUANTUS_SECTORS_ROUTE)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <PWAInstallBanner lightMode={lightMode} />
            <SWUpdateBanner lightMode={lightMode} />
            <AuthModal
                open={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                defaultMode={authModalMode}
                lightMode={lightMode}
            />
        </Layout>
    );
}

export default App;
