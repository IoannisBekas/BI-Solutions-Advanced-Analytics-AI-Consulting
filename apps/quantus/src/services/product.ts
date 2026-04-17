import type {
    AccuracySummary,
    AlertSubscription,
    ArchiveSnapshot,
    AssetClass,
    QuantusWatchlistItem,
    ReportResponse,
} from '../types';

interface ProductRequestError extends Error {
    status: number;
    code?: string;
    detail?: string;
}

async function readJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const response = await fetch(input, init);

    if (!response.ok) {
        const errorText = await response.text();
        let message = errorText;
        let detail = '';
        let code = '';

        if (errorText) {
            try {
                const parsed = JSON.parse(errorText) as {
                    message?: unknown;
                    error?: unknown;
                    detail?: unknown;
                    code?: unknown;
                };
                if (typeof parsed.message === 'string' && parsed.message.trim()) {
                    message = parsed.message;
                } else if (typeof parsed.error === 'string' && parsed.error.trim()) {
                    message = parsed.error;
                }
                if (typeof parsed.detail === 'string' && parsed.detail.trim()) {
                    detail = parsed.detail;
                }
                if (typeof parsed.code === 'string' && parsed.code.trim()) {
                    code = parsed.code;
                }
            } catch {
                // Keep the raw text when the response is not JSON.
            }
        }

        const requestError = new Error(message || `Request failed with ${response.status}`) as ProductRequestError;
        requestError.status = response.status;
        requestError.code = code || undefined;
        requestError.detail = detail || undefined;
        throw requestError;
    }

    return response.json() as Promise<T>;
}

export async function fetchUserWatchlist(signal?: AbortSignal) {
    return readJson<{ items: QuantusWatchlistItem[]; activeAlertCount: number }>(
        '/quantus/api/watchlist',
        {
            signal,
        },
    );
}

export async function addWatchlistAsset(ticker: string, assetClass: AssetClass, signal?: AbortSignal) {
    return readJson<{ item: unknown }>(
        '/quantus/api/watchlist',
        {
            method: 'POST',
            signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticker, assetClass }),
        },
    );
}

export async function removeWatchlistAsset(ticker: string, signal?: AbortSignal) {
    return readJson<{ success: boolean }>(
        `/quantus/api/watchlist/${encodeURIComponent(ticker)}`,
        {
            method: 'DELETE',
            signal,
        },
    );
}

export async function fetchAlertSubscriptions(signal?: AbortSignal) {
    const data = await readJson<{ items: AlertSubscription[] }>(
        '/quantus/api/alerts',
        {
            signal,
        },
    );
    return data.items ?? [];
}

export async function upsertAlertSubscription(
    ticker: string,
    assetClass: AssetClass,
    signal?: AbortSignal,
) {
    const data = await readJson<{ item: AlertSubscription }>(
        `/quantus/api/alerts/${encodeURIComponent(ticker)}`,
        {
            method: 'PUT',
            signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assetClass }),
        },
    );
    return data.item;
}

export async function deleteAlertSubscription(ticker: string, signal?: AbortSignal) {
    return readJson<{ success: boolean }>(
        `/quantus/api/alerts/${encodeURIComponent(ticker)}`,
        {
            method: 'DELETE',
            signal,
        },
    );
}

export async function fetchArchiveSnapshots(ticker: string, limit = 20, signal?: AbortSignal) {
    const params = new URLSearchParams({
        ticker: ticker.trim().toUpperCase(),
        limit: String(limit),
    });

    const data = await readJson<{ snapshots: ArchiveSnapshot[] }>(
        `/quantus/api/archive?${params.toString()}`,
        { signal },
    );
    return data.snapshots ?? [];
}

export async function fetchArchivedReport(reportId: string, signal?: AbortSignal) {
    return readJson<ReportResponse>(
        `/quantus/api/archive/${encodeURIComponent(reportId)}`,
        { signal },
    );
}

export async function fetchAccuracySummary(signal?: AbortSignal): Promise<AccuracySummary> {
    const data = await readJson<{
        resolved_count: number;
        pending_count: number;
        unlock_threshold: number;
        engine_inception: string | null;
        last_updated: string | null;
        methodology_note: string;
        overall_avg_return_pct: number | null;
        overall_win_rate: number | null;
        best_engine: string | null;
        by_signal: Array<{ label: string; count: number; avg_return_pct: number; avg_excess_pct: number | null; win_rate: number | null }>;
        by_engine: Array<{ label: string; count: number; avg_return_pct: number; avg_excess_pct: number | null; win_rate: number | null }>;
        by_regime: Array<{ label: string; count: number; avg_return_pct: number; avg_excess_pct: number | null; win_rate: number | null }>;
        by_sector: Array<{ label: string; count: number; avg_return_pct: number; avg_excess_pct: number | null; win_rate: number | null }>;
        by_market_cap: Array<{ label: string; count: number; avg_return_pct: number; avg_excess_pct: number | null; win_rate: number | null }>;
    }>(
        '/quantus/api/accuracy',
        { signal },
    );

    const mapRows = (rows: Array<{ label: string; count: number; avg_return_pct: number; avg_excess_pct: number | null; win_rate: number | null }>) =>
        rows.map((row) => ({
            label: row.label,
            count: row.count,
            avgReturnPct: row.avg_return_pct,
            avgExcessPct: row.avg_excess_pct,
            winRate: row.win_rate,
        }));

    return {
        resolvedCount: data.resolved_count,
        pendingCount: data.pending_count,
        unlockThreshold: data.unlock_threshold,
        engineInception: data.engine_inception,
        lastUpdated: data.last_updated,
        methodologyNote: data.methodology_note,
        overallAvgReturnPct: data.overall_avg_return_pct,
        overallWinRate: data.overall_win_rate,
        bestEngine: data.best_engine,
        bySignal: mapRows(data.by_signal),
        byEngine: mapRows(data.by_engine),
        byRegime: mapRows(data.by_regime),
        bySector: mapRows(data.by_sector),
        byMarketCap: mapRows(data.by_market_cap),
    };
}
