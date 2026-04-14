import type { AssetClass, AssetEntry, ReportResponse, WorkspaceSummary } from '../types';

const TOKEN_STORAGE_KEY = 'quantus-token';

export interface WorkspaceRequestError extends Error {
    status: number;
    code?: string;
    detail?: string;
    requestUrl?: string;
}

export function isWorkspaceRequestError(error: unknown): error is WorkspaceRequestError {
    return error instanceof Error && typeof (error as Partial<WorkspaceRequestError>).status === 'number';
}

function buildAuthHeaders() {
    if (typeof window === 'undefined') {
        return {};
    }

    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function buildRequestError(response: Response, input: RequestInfo | URL) {
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
    return requestError;
}

async function readJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const response = await fetch(input, init);

    if (!response.ok) {
        throw await buildRequestError(response, input);
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
    const params = new URLSearchParams();

    if (options?.forceRefresh) {
        params.set('force_refresh', 'true');
    }

    const suffix = params.toString() ? `?${params.toString()}` : '';
    return readJson<ReportResponse>(`/quantus/api/report/${encodeURIComponent(ticker)}${suffix}`, {
        signal,
        headers: buildAuthHeaders(),
    });
}

export async function fetchWorkspaceDeepDive(
    ticker: string,
    moduleIndex: number,
    assetClass: AssetClass,
    signal?: AbortSignal,
) {
    const requestUrl = '/quantus/api/deepdive';
    const response = await fetch(requestUrl, {
        method: 'POST',
        signal,
        headers: {
            'Content-Type': 'application/json',
            ...buildAuthHeaders(),
        },
        body: JSON.stringify({
            ticker,
            module: moduleIndex,
            assetClass,
        }),
    });

    if (!response.ok) {
        throw await buildRequestError(response, requestUrl);
    }

    if (!response.body) {
        return 'Analysis complete.';
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let text = '';

    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            break;
        }

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const event of events) {
            const dataLine = event
                .split('\n')
                .find((line) => line.startsWith('data: '));

            if (!dataLine) {
                continue;
            }

            const payload = dataLine.slice(6).trim();
            if (!payload || payload === '[DONE]') {
                continue;
            }

            try {
                const parsed = JSON.parse(payload) as { text?: unknown };
                if (typeof parsed.text === 'string') {
                    text += parsed.text;
                }
            } catch {
                // Ignore malformed SSE chunks and keep reading.
            }
        }
    }

    return text.trim() || 'Analysis complete.';
}
