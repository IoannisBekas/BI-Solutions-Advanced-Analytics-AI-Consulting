import { Suspense, lazy, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Layout } from './components/Layout';
import { SearchHero } from './components/SearchHero';
import { ProgressInsightFeed } from './components/IndustryIndicator';
import { NotFoundView } from './components/NotFoundView';
import { PWAInstallBanner, SWUpdateBanner } from './components/PWAInstallBanner';
import { WorkspaceSkeleton } from './components/workspace/WorkspaceStates';
import { AuthModal } from './auth/AuthModal';
import { useAuth } from './auth/AuthContext';
import { useAuthModal } from './hooks/useAuthModal';
import { useWorkspaceAssets } from './hooks/useWorkspaceAssets';
import { useWorkspaceLocation } from './hooks/useWorkspaceLocation';
import { useWorkspacePageTracking } from './hooks/useWorkspacePageTracking';
import { useWorkspacePwa } from './hooks/useWorkspacePwa';
import { useWorkspaceReport } from './hooks/useWorkspaceReport';
import { useWorkspaceSummary } from './hooks/useWorkspaceSummary';
import { useWorkspaceTheme } from './hooks/useWorkspaceTheme';
import {
    getWorkspaceRouteForView,
    isWorkspaceNavigationView,
} from './lib/workspaceRoutes';
import {
    fetchAlertSubscriptions,
    upsertAlertSubscription,
} from './services/product';
import { buildAssetEntryFromReport } from './utils/workspaceState';

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
const ScannerPage = lazy(async () => {
    const module = await import('./pages/ScannerPage');
    return { default: module.ScannerPage };
});
const MacroCalendar = lazy(async () => {
    const module = await import('./pages/MacroCalendar');
    return { default: module.MacroCalendar };
});
const InsiderTrades = lazy(async () => {
    const module = await import('./pages/InsiderTrades');
    return { default: module.InsiderTrades };
});
const WhaleTracking = lazy(async () => {
    const module = await import('./pages/WhaleTracking');
    return { default: module.WhaleTracking };
});
const EarningsCalendar = lazy(async () => {
    const module = await import('./pages/EarningsCalendar');
    return { default: module.EarningsCalendar };
});
const UpgradePage = lazy(async () => {
    const module = await import('./pages/UpgradePage');
    return { default: module.UpgradePage };
});

function WorkspacePanelFallback({ lightMode }: { lightMode?: boolean }) {
    return (
        <section className="bis-page-shell px-6 py-8 md:px-10 md:py-10">
            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="h-4 w-32 skeleton" />
                    <div className="h-8 w-72 skeleton" />
                    <div className="h-3 w-full max-w-2xl skeleton" />
                </div>
                <WorkspaceSkeleton rows={3} lightMode={lightMode} />
            </div>
        </section>
    );
}

function App() {
    const { user, signOut, isLoading } = useAuth();
    const { lightMode, toggleLightMode } = useWorkspaceTheme();
    const { currentPath, currentSearch, route, syncBrowserRoute } = useWorkspaceLocation();
    const { workspaceSummary } = useWorkspaceSummary();
    const {
        authModalMode,
        authModalOpen,
        closeAuthModal,
        openAuthModal,
    } = useAuthModal();
    const {
        dismissBanner,
        dismissUpdateBanner,
        install,
        needsRefresh,
        showInstallBanner,
        updateSW,
    } = useWorkspacePwa();
    const {
        isPinnedAsset,
        pinnedAssets,
        recentAssets,
        rememberRecentAsset,
        togglePinnedAsset,
    } = useWorkspaceAssets({ userId: user?.id ?? null });
    const {
        currentTicker,
        displayView,
        goBackToSearch,
        insights,
        isGenerating,
        openReportRoute,
        prependInsight,
        report,
        reportRef,
        reportResponse,
        viewCurrentReport,
    } = useWorkspaceReport({
        currentPath,
        currentSearch,
        isLoading,
        openAuthModal,
        rememberRecentAsset,
        reportCacheUserId: user?.id ?? null,
        route,
        syncBrowserRoute,
    });
    const headerWorkspaceStatus = route.view === 'hero'
        ? (workspaceSummary?.status ?? null)
        : null;
    const userTier = (user?.tier as 'FREE' | 'UNLOCKED' | 'INSTITUTIONAL' | undefined) ?? 'FREE';
    const currentReportAsset = useMemo(() => {
        if (!report || !reportResponse) {
            return null;
        }

        return buildAssetEntryFromReport(report, reportResponse.source);
    }, [report, reportResponse]);
    const isCurrentReportPinned = currentReportAsset
        ? isPinnedAsset(currentReportAsset.ticker)
        : false;

    useWorkspacePageTracking(route);

    const handleNavigate = useCallback((view: string) => {
        if (!isWorkspaceNavigationView(view)) {
            return;
        }

        syncBrowserRoute(getWorkspaceRouteForView(view));
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [syncBrowserRoute]);

    const handleToggleCurrentReportPinned = useCallback(() => {
        if (!currentReportAsset) {
            return;
        }

        void togglePinnedAsset(currentReportAsset);
    }, [currentReportAsset, togglePinnedAsset]);

    const handleSubscribe = useCallback(async () => {
        if (!currentReportAsset) {
            return;
        }

        if (!user) {
            openAuthModal('signup');
            return;
        }

        const wasPinned = isPinnedAsset(currentReportAsset.ticker);
        if (!wasPinned) {
            await togglePinnedAsset(currentReportAsset);
        }

        try {
            await upsertAlertSubscription(currentReportAsset.ticker, currentReportAsset.assetClass);
            prependInsight({
                id: `${currentReportAsset.ticker}-alert-subscription`,
                category: 'event',
                text: `Server-side alerts enabled for ${currentReportAsset.ticker}. ${wasPinned ? 'Watchlist already synced.' : 'The ticker was added to your persisted watchlist.'}`,
                isComplete: true,
            });
        } catch (error) {
            console.error('Alert subscription error:', error);
            prependInsight({
                id: `${currentReportAsset.ticker}-alert-error`,
                category: 'risk',
                text: error instanceof Error ? error.message : `Unable to enable alerts for ${currentReportAsset.ticker}.`,
                isComplete: true,
            });
        }
    }, [currentReportAsset, isPinnedAsset, openAuthModal, prependInsight, togglePinnedAsset, user]);

    const handleManageAlerts = useCallback(async () => {
        if (!user) {
            openAuthModal('signup');
            return;
        }

        try {
            const alerts = await fetchAlertSubscriptions();
            window.alert(
                alerts.length === 0
                    ? 'No persisted Quantus alert subscriptions yet. Subscribe from a report to create one.'
                    : `${alerts.length} persisted Quantus alert subscription${alerts.length === 1 ? '' : 's'} active.`,
            );
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Unable to load persisted alert subscriptions.');
        }
    }, [openAuthModal, user]);

    const handleRemovePinnedAsset = useCallback((ticker: string) => {
        const asset = pinnedAssets.find((entry) => entry.ticker === ticker);
        if (!asset) {
            return;
        }

        void togglePinnedAsset(asset);
    }, [pinnedAssets, togglePinnedAsset]);

    return (
        <Layout
            currentView={route.view === 'report' ? 'hero' : route.view}
            minimalHeader={route.view === 'report'}
            lightMode={lightMode}
            onQuickSearch={openReportRoute}
            userName={user?.name ?? null}
            userTier={user?.tier ?? null}
            workspaceStatus={headerWorkspaceStatus}
            onToggleLight={toggleLightMode}
            onOpenAuth={(mode) => openAuthModal(mode ?? 'signin')}
            onSignOut={signOut}
            onNavigate={handleNavigate}
        >
            <AnimatePresence mode="wait">
                {route.view === 'hero' && (
                    <motion.div key="hero" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
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
                    <motion.div key={route.path} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                        <button
                            onClick={goBackToSearch}
                            className="mb-6 flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-gray-900"
                            style={{ color: '#9CA3AF' }}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            New Search
                        </button>

                        {(displayView !== 'report' || isGenerating) && (
                            <ProgressInsightFeed
                                insights={insights}
                                isGenerating={isGenerating}
                                ticker={currentTicker || route.ticker || ''}
                                reportId={report?.report_id}
                                onViewReport={viewCurrentReport}
                                lightMode={lightMode}
                                completionTitle={reportResponse?.source === 'starter'
                                    ? 'Starter shell ready'
                                    : reportResponse?.source === 'live'
                                        ? 'Live report ready'
                                        : 'Cached report ready'}
                                completionDetail={reportResponse ? `${reportResponse.ticker} - ${reportResponse.message}` : undefined}
                                showCompletionCard={Boolean(reportResponse)}
                            />
                        )}

                        {displayView === 'report' && report && (
                            <motion.div
                                key={reportResponse?.ticker}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <Suspense fallback={<WorkspacePanelFallback lightMode={lightMode} />}>
                                    <section className="bis-page-shell px-6 py-8 md:px-10 md:py-10">
                                        <div ref={reportRef}>
                                            <ReportDashboard
                                                report={report}
                                                lightMode={lightMode}
                                                onSubscribe={handleSubscribe}
                                                onToggleWatchlist={handleToggleCurrentReportPinned}
                                                isWatchlisted={isCurrentReportPinned}
                                                isAuthenticated={Boolean(user)}
                                                userTier={userTier}
                                                onUpgrade={() => openAuthModal('signup')}
                                                reportSource={reportResponse?.source}
                                                reportMessage={reportResponse?.message}
                                                reportDetail={reportResponse?.detail}
                                            />
                                        </div>
                                    </section>
                                </Suspense>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {route.view === 'sectors' && (
                    <motion.div key="sectors" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                        <Suspense fallback={<WorkspacePanelFallback lightMode={lightMode} />}>
                            <SectorPacksDashboard
                                lightMode={lightMode}
                                onSelectTicker={(ticker: string) => openReportRoute(ticker)}
                                onUpgrade={() => openAuthModal('signup')}
                            />
                        </Suspense>
                    </motion.div>
                )}

                {route.view === 'watchlist' && (
                    <motion.div key="watchlist" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                        <Suspense fallback={<WorkspacePanelFallback lightMode={lightMode} />}>
                            <Watchlist
                                userTier={userTier}
                                lightMode={lightMode}
                                savedAssets={pinnedAssets}
                                isAuthenticated={Boolean(user)}
                                onOpenAlerts={handleManageAlerts}
                                onSelectTicker={(ticker) => openReportRoute(ticker)}
                                onRemove={handleRemovePinnedAsset}
                            />
                        </Suspense>
                    </motion.div>
                )}

                {route.view === 'scanner' && (
                    <motion.div key="scanner" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                        <Suspense fallback={<WorkspacePanelFallback lightMode={lightMode} />}>
                            <ScannerPage
                                lightMode={lightMode}
                                onSelectTicker={(ticker: string) => openReportRoute(ticker)}
                            />
                        </Suspense>
                    </motion.div>
                )}

                {route.view === 'calendar' && (
                    <motion.div key="calendar" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                        <Suspense fallback={<WorkspacePanelFallback lightMode={lightMode} />}>
                            <MacroCalendar lightMode={lightMode} />
                        </Suspense>
                    </motion.div>
                )}

                {route.view === 'archive' && (
                    <motion.div key="archive" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                        <Suspense fallback={<WorkspacePanelFallback lightMode={lightMode} />}>
                            <Archive
                                userTier={userTier}
                                lightMode={lightMode}
                                onViewReport={(snapshot: { ticker: string; reportId: string }) => openReportRoute(snapshot.ticker, undefined, snapshot.reportId)}
                                onUpgrade={() => openAuthModal('signup')}
                            />
                        </Suspense>
                    </motion.div>
                )}

                {route.view === 'accuracy' && (
                    <motion.div key="accuracy" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                        <Suspense fallback={<WorkspacePanelFallback lightMode={lightMode} />}>
                            <AccuracyDashboard lightMode={lightMode} />
                        </Suspense>
                    </motion.div>
                )}

                {route.view === 'methodology' && (
                    <motion.div key="methodology" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                        <Suspense fallback={<WorkspacePanelFallback lightMode={lightMode} />}>
                            <Methodology lightMode={lightMode} />
                        </Suspense>
                    </motion.div>
                )}

                {route.view === 'insider' && (
                    <motion.div key="insider" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                        <Suspense fallback={<WorkspacePanelFallback lightMode={lightMode} />}>
                            <InsiderTrades
                                lightMode={lightMode}
                                onUpgrade={() => syncBrowserRoute(getWorkspaceRouteForView('upgrade'))}
                                onSelectTicker={(ticker: string) => openReportRoute(ticker)}
                            />
                        </Suspense>
                    </motion.div>
                )}

                {route.view === 'whales' && (
                    <motion.div key="whales" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                        <Suspense fallback={<WorkspacePanelFallback lightMode={lightMode} />}>
                            <WhaleTracking
                                lightMode={lightMode}
                                onUpgrade={() => syncBrowserRoute(getWorkspaceRouteForView('upgrade'))}
                                onSelectTicker={(ticker: string) => openReportRoute(ticker)}
                            />
                        </Suspense>
                    </motion.div>
                )}

                {route.view === 'earnings' && (
                    <motion.div key="earnings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                        <Suspense fallback={<WorkspacePanelFallback lightMode={lightMode} />}>
                            <EarningsCalendar
                                lightMode={lightMode}
                                onUpgrade={() => syncBrowserRoute(getWorkspaceRouteForView('upgrade'))}
                                onSelectTicker={(ticker: string) => openReportRoute(ticker)}
                            />
                        </Suspense>
                    </motion.div>
                )}

                {route.view === 'upgrade' && (
                    <motion.div key="upgrade" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                        <Suspense fallback={<WorkspacePanelFallback lightMode={lightMode} />}>
                            <UpgradePage
                                lightMode={lightMode}
                                currentTier={userTier}
                                onRequireSignin={() => openAuthModal('signin')}
                            />
                        </Suspense>
                    </motion.div>
                )}

                {route.view === 'notFound' && (
                    <motion.div key="not-found" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <NotFoundView
                            path={route.path}
                            onGoWorkspace={() => syncBrowserRoute(getWorkspaceRouteForView('hero'))}
                            onGoSectors={() => syncBrowserRoute(getWorkspaceRouteForView('sectors'))}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <PWAInstallBanner
                lightMode={lightMode}
                showInstallBanner={showInstallBanner}
                install={install}
                dismissBanner={dismissBanner}
            />
            <SWUpdateBanner
                lightMode={lightMode}
                needsRefresh={needsRefresh}
                updateSW={updateSW}
                dismiss={dismissUpdateBanner}
            />
            <AuthModal
                open={authModalOpen}
                onClose={closeAuthModal}
                defaultMode={authModalMode}
                lightMode={lightMode}
            />
        </Layout>
    );
}

export default App;
