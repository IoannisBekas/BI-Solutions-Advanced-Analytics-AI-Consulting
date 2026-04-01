import type { AssetEntry, ReportResponse, WorkspaceSummary } from '../types';

export interface WorkspaceRequestError extends Error {
    status: number;
    code?: string;
    detail?: string;
    requestUrl?: string;
}

export function isWorkspaceRequestError(error: unknown): error is WorkspaceRequestError {
    return error instanceof Error && typeof (error as Partial<WorkspaceRequestError>).status === 'number';
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

        const requestError = new Error(message || `Request failed with ${response.status}`) as WorkspaceRequestError;
        requestError.status = response.status;
        requestError.code = code || undefined;
        requestError.detail = detail || undefined;
        requestError.requestUrl = typeof input === 'string' ? input : input.toString();
        throw requestError;
    }

    return response.json() as Promise<T>;
}

export async function fetchWorkspaceSummary(signal?: AbortSignal) {
    return readJson<WorkspaceSummary>('/quantus/api/workspace/summary', { signal });
}

export async function searchWorkspaceAssets(query: string, limit = 6, signal?: AbortSignal) {
    if (!query.trim()) {
        return [] as AssetEntry[];
    }

    const params = new URLSearchParams({
        q: query.trim(),
        limit: String(limit),
    });

    const data = await readJson<{ results: AssetEntry[] }>(`/quantus/api/assets/search?${params.toString()}`, { signal });
    return data.results ?? [];
}

export async function fetchWorkspaceAsset(ticker: string, signal?: AbortSignal) {
    const data = await readJson<{ asset: AssetEntry }>(`/quantus/api/assets/${encodeURIComponent(ticker)}`, { signal });
    return data.asset ?? null;
}

export async function fetchWorkspaceReport(
    ticker: string,
    signal?: AbortSignal,
    options?: {
        forceRefresh?: boolean;
    },
) {
    const params = new URLSearchParams({
        user_tier: 'UNLOCKED',
    });

    if (options?.forceRefresh) {
        params.set('force_refresh', 'true');
    }

    return readJson<ReportResponse>(`/quantus/api/report/${encodeURIComponent(ticker)}?${params.toString()}`, { signal });
}
