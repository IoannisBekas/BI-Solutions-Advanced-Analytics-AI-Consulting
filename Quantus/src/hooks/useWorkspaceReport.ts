import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { mergeReportResponseWithLiveRefresh, shouldRefreshLiveSensitiveFields } from '../constants/reportFreshness';
import {
    getQuantusReportRoute,
    getWorkspaceRouteForView,
    type DisplayView,
    type RouteState,
} from '../lib/workspaceRoutes';
import {
    buildArchivedSnapshotErrorInsight,
    buildArchivedSnapshotReadyInsight,
    buildBlockedReportInsight,
    buildCompletionInsight,
    buildEmergencyStarterReport,
    buildLiveRefreshInsight,
    describeWorkspaceReportFetchFailure,
    trackWorkspaceTickerSearch,
} from '../lib/workspaceReportState';
import { fetchArchivedReport } from '../services/product';
import {
    fetchWorkspaceAsset,
    fetchWorkspaceReport,
    isWorkspaceRequestError,
} from '../services/workspace';
import type { AssetEntry, InsightCard, ReportResponse } from '../types';
import {
    buildAssetEntryFromReport,
    readStoredReportResponse,
    writeStoredReportResponse,
} from '../utils/workspaceState';
import { cacheReportForOffline } from './usePWA';

interface UseWorkspaceReportOptions {
    currentPath: string;
    currentSearch: string;
    isLoading: boolean;
    openAuthModal: (mode?: 'signin' | 'signup') => void;
    rememberRecentAsset: (asset: AssetEntry) => void;
    reportCacheUserId?: string | null;
    route: RouteState;
    syncBrowserRoute: (nextPath: string, replace?: boolean, search?: string) => void;
}

function readSnapshotId(currentSearch: string) {
    const value = new URLSearchParams(currentSearch).get('snapshot');
    return value?.trim() ? value.trim() : null;
}

export function useWorkspaceReport({
    currentPath,
    currentSearch,
    isLoading,
    openAuthModal,
    rememberRecentAsset,
    reportCacheUserId,
    route,
    syncBrowserRoute,
}: UseWorkspaceReportOptions) {
    const [reportResponse, setReportResponse] = useState<ReportResponse | null>(null);
    const [insights, setInsights] = useState<InsightCard[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentTicker, setCurrentTicker] = useState('');
    const [loadedSnapshotId, setLoadedSnapshotId] = useState<string | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);
    const searchAbortRef = useRef<AbortController | null>(null);
    const insightAbortRef = useRef<AbortController | null>(null);
    const liveRefreshAbortRef = useRef<AbortController | null>(null);
    const inflightTickerRef = useRef<string | null>(null);
    const pendingAssetRef = useRef<AssetEntry | null>(null);
    const currentReportResponseRef = useRef<ReportResponse | null>(null);
    const previousReportCacheUserIdRef = useRef(reportCacheUserId ?? null);

    const activeSnapshotId = useMemo(() => readSnapshotId(currentSearch), [currentSearch]);
    const report = reportResponse?.report ?? null;
    const displayView: DisplayView = route.view === 'report'
        ? (reportResponse?.ticker === route.ticker ? 'report' : 'generating')
        : route.view;

    const abortCurrentRequests = useCallback(() => {
        searchAbortRef.current?.abort();
        insightAbortRef.current?.abort();
        liveRefreshAbortRef.current?.abort();
        searchAbortRef.current = null;
        insightAbortRef.current = null;
        liveRefreshAbortRef.current = null;
    }, []);

    const resetReportSession = useCallback(() => {
        abortCurrentRequests();
        inflightTickerRef.current = null;
        currentReportResponseRef.current = null;
        setInsights([]);
        setReportResponse(null);
        setCurrentTicker('');
        setLoadedSnapshotId(null);
        setIsGenerating(false);
    }, [abortCurrentRequests]);

    useEffect(() => {
        return () => {
            abortCurrentRequests();
        };
    }, [abortCurrentRequests]);

    useEffect(() => {
        if (!report?.ticker) {
            return;
        }

        cacheReportForOffline(report.ticker);
    }, [report?.ticker]);

    useEffect(() => {
        currentReportResponseRef.current = reportResponse;
    }, [reportResponse]);

    useEffect(() => {
        const nextUserId = reportCacheUserId ?? null;
        if (previousReportCacheUserIdRef.current === nextUserId) {
            return;
        }

        previousReportCacheUserIdRef.current = nextUserId;
        resetReportSession();
    }, [reportCacheUserId, resetReportSession]);

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

            if (!response.ok || !response.body) {
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            try {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) {
                        break;
                    }

                    const lines = decoder.decode(value).split('\n');
                    for (const line of lines) {
                        if (!line.startsWith('data: ') || line.includes('[DONE]')) {
                            continue;
                        }

                        try {
                            const card = JSON.parse(line.slice(6)) as InsightCard;
                            if (card.id) {
                                setInsights((previous) => (
                                    previous.some((item) => item.id === card.id) ? previous : [...previous, card]
                                ));
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
            if (error instanceof DOMException && error.name === 'AbortError') {
                return;
            }

            console.error('Insight stream error:', error);
        }
    }, []);

    const refreshLiveSensitiveFields = useCallback(async (ticker: string) => {
        liveRefreshAbortRef.current?.abort();
        const controller = new AbortController();
        liveRefreshAbortRef.current = controller;

        try {
            const liveResponse = await fetchWorkspaceReport(ticker, controller.signal, { forceRefresh: true });
            if (controller.signal.aborted || liveResponse.source !== 'live') {
                return;
            }

            if (inflightTickerRef.current !== ticker) {
                return;
            }

            const currentResponse = currentReportResponseRef.current;
            if (!currentResponse || currentResponse.ticker !== ticker) {
                return;
            }

            const mergedResponse = mergeReportResponseWithLiveRefresh(currentResponse, liveResponse);
            writeStoredReportResponse(mergedResponse, reportCacheUserId);
            setReportResponse(mergedResponse);
            setInsights((previous) => (
                previous.some((item) => item.id === `${ticker}-live-refresh`)
                    ? previous
                    : [...previous, buildLiveRefreshInsight(ticker)]
            ));
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return;
            }

            console.error('Live-sensitive refresh error:', error);
        }
    }, [reportCacheUserId]);

    const loadArchivedReport = useCallback(async (reportId: string) => {
        abortCurrentRequests();
        const controller = new AbortController();
        searchAbortRef.current = controller;
        inflightTickerRef.current = null;

        setInsights([]);
        setReportResponse(null);
        setLoadedSnapshotId(reportId);
        setIsGenerating(true);

        try {
            const archivedResponse = await fetchArchivedReport(reportId, controller.signal);
            if (controller.signal.aborted) {
                return;
            }

            currentReportResponseRef.current = archivedResponse;
            setCurrentTicker(archivedResponse.ticker);
            setReportResponse(archivedResponse);
            setLoadedSnapshotId(reportId);
            setInsights([buildArchivedSnapshotReadyInsight(archivedResponse)]);
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return;
            }

            console.error('Archived report fetch error:', error);
            setInsights([buildArchivedSnapshotErrorInsight(reportId, error)]);
        } finally {
            if (!controller.signal.aborted) {
                setIsGenerating(false);
            }
        }
    }, [abortCurrentRequests]);

    const loadReport = useCallback(async (ticker: string, assetHint?: AssetEntry | null) => {
        const normalizedTicker = ticker.trim().toUpperCase();
        if (!normalizedTicker) {
            return;
        }

        abortCurrentRequests();
        const controller = new AbortController();
        searchAbortRef.current = controller;
        inflightTickerRef.current = normalizedTicker;

        setCurrentTicker(normalizedTicker);
        setInsights([]);

        const cachedResponse = readStoredReportResponse(normalizedTicker, reportCacheUserId);
        if (cachedResponse) {
            currentReportResponseRef.current = cachedResponse;
            setReportResponse(cachedResponse);
        } else {
            setReportResponse(null);
        }

        setLoadedSnapshotId(null);
        setIsGenerating(true);

        let responsePayload: ReportResponse | null = null;
        let asset = assetHint ?? null;
        let blockedRequestMessage: string | null = null;

        if (!asset) {
            try {
                asset = await fetchWorkspaceAsset(normalizedTicker, controller.signal);
            } catch {
                asset = null;
            }
        }

        void trackWorkspaceTickerSearch(normalizedTicker, asset?.assetClass ?? 'EQUITY');
        void streamInsights(normalizedTicker, asset?.assetClass ?? 'EQUITY');

        try {
            responsePayload = await fetchWorkspaceReport(normalizedTicker, controller.signal);
            if (!controller.signal.aborted) {
                writeStoredReportResponse(responsePayload, reportCacheUserId);
                currentReportResponseRef.current = responsePayload;
                setReportResponse(responsePayload);

                if (shouldRefreshLiveSensitiveFields(responsePayload)) {
                    void refreshLiveSensitiveFields(normalizedTicker);
                }
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return;
            }

            console.error('Report fetch error:', error);

            if (isWorkspaceRequestError(error)) {
                if (error.status === 401 || error.code === 'auth_required') {
                    blockedRequestMessage = error.detail
                        ?? 'Sign in to open a full Quantus report for this ticker.';
                    openAuthModal('signin');
                } else if (error.code === 'report_limit_reached') {
                    blockedRequestMessage = error.detail ?? error.message;
                }
            }

            if (blockedRequestMessage) {
                if (!controller.signal.aborted) {
                    currentReportResponseRef.current = null;
                    setReportResponse(null);
                    setInsights([buildBlockedReportInsight(normalizedTicker, blockedRequestMessage)]);
                }
                return;
            }

            const failureState = describeWorkspaceReportFetchFailure(error, normalizedTicker);
            const lastKnownReport = readStoredReportResponse(normalizedTicker, reportCacheUserId);

            if (lastKnownReport) {
                responsePayload = {
                    ...lastKnownReport,
                    source: 'cached',
                    message: 'Last known Quantus report loaded.',
                    detail: `${failureState.detail} Quantus loaded the most recent cached report for ${normalizedTicker}. Market-sensitive fields may be stale until the API responds again.`,
                    status: {
                        mode: 'mixed',
                        label: 'Cached report fallback',
                        description: 'Live refresh failed. Quantus is showing the most recent cached research report.',
                        detail: `${failureState.detail} Stable report sections remain available, but quote-sensitive values may be stale.`,
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
                    failureState.status,
                );
                responsePayload.message = failureState.message;
                responsePayload.detail = failureState.detail;
                responsePayload.status = failureState.status;
            }

            if (!controller.signal.aborted) {
                currentReportResponseRef.current = responsePayload;
                setReportResponse(responsePayload);
            }
        } finally {
            if (!controller.signal.aborted) {
                if (!blockedRequestMessage) {
                    const rememberedAsset = responsePayload
                        ? buildAssetEntryFromReport(responsePayload.report, responsePayload.source)
                        : asset;

                    if (rememberedAsset) {
                        rememberRecentAsset(rememberedAsset);
                    }

                    setInsights((previous) => [
                        ...previous,
                        buildCompletionInsight(normalizedTicker, responsePayload?.source),
                    ]);
                }

                setIsGenerating(false);
            }
        }
    }, [
        abortCurrentRequests,
        openAuthModal,
        refreshLiveSensitiveFields,
        rememberRecentAsset,
        reportCacheUserId,
        streamInsights,
    ]);

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (route.view !== 'report' || !route.ticker) {
            inflightTickerRef.current = null;
            return;
        }

        if (activeSnapshotId) {
            if (activeSnapshotId === loadedSnapshotId && !isGenerating) {
                return;
            }

            void loadArchivedReport(activeSnapshotId);
            return;
        }

        if (route.ticker === inflightTickerRef.current && isGenerating) {
            return;
        }

        if (route.ticker === reportResponse?.ticker && !isGenerating && loadedSnapshotId === null) {
            return;
        }

        const assetHint = pendingAssetRef.current;
        pendingAssetRef.current = null;
        void loadReport(route.ticker, assetHint);
    }, [
        activeSnapshotId,
        isGenerating,
        isLoading,
        loadArchivedReport,
        loadReport,
        loadedSnapshotId,
        reportResponse?.ticker,
        route,
    ]);

    const openReportRoute = useCallback((ticker: string, asset?: AssetEntry, snapshotId?: string) => {
        const normalizedTicker = ticker.trim().toUpperCase();
        pendingAssetRef.current = asset ?? null;

        const nextRoute = getQuantusReportRoute(normalizedTicker);
        const search = snapshotId ? `snapshot=${encodeURIComponent(snapshotId)}` : '';
        const normalizedSearch = search ? `?${search}` : '';

        if (currentPath === nextRoute && currentSearch === normalizedSearch) {
            if (snapshotId) {
                void loadArchivedReport(snapshotId);
            } else {
                void loadReport(normalizedTicker, asset ?? null);
            }
            return;
        }

        syncBrowserRoute(nextRoute, false, search);
    }, [currentPath, currentSearch, loadArchivedReport, loadReport, syncBrowserRoute]);

    const goBackToSearch = useCallback(() => {
        resetReportSession();
        syncBrowserRoute(getWorkspaceRouteForView('hero'), false, '');
    }, [resetReportSession, syncBrowserRoute]);

    const viewCurrentReport = useCallback(() => {
        window.setTimeout(() => {
            reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
    }, []);

    const prependInsight = useCallback((insight: InsightCard) => {
        setInsights((previous) => [insight, ...previous]);
    }, []);

    return {
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
    };
}
