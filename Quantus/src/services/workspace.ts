import type { AssetEntry, ReportResponse, WorkspaceSummary } from '../types';

async function readJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const response = await fetch(input, init);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Request failed with ${response.status}`);
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

export async function fetchWorkspaceReport(ticker: string, signal?: AbortSignal) {
    return readJson<ReportResponse>(`/quantus/api/report/${encodeURIComponent(ticker)}?user_tier=UNLOCKED`, { signal });
}
