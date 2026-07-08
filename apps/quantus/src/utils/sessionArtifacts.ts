const LEGACY_REPORT_CACHE_STORAGE_PREFIXES = [
    'quantus-last-report:',
    'quantus-last-report:v2:',
];
export const REPORT_CACHE_STORAGE_PREFIX = 'quantus-last-report:v3:';
const LEGACY_TOKEN_STORAGE_KEY = 'quantus-token';
export const USER_STORAGE_KEY = 'quantus-user';
const USER_STORAGE_TTL_MS = 12 * 60 * 60 * 1000;

const AUTH_SENSITIVE_CACHE_PREFIXES = [
    'quantus-api-',
    'quantus-reports-',
];

function getLocalStorageSafe() {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

function getSessionStorageSafe() {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        return window.sessionStorage;
    } catch {
        return null;
    }
}

function isExpiringUserEnvelope(value: unknown): value is { expiresAt: number; user: unknown } {
    return (
        typeof value === 'object'
        && value !== null
        && typeof (value as { expiresAt?: unknown }).expiresAt === 'number'
        && 'user' in value
    );
}

export function getReportCacheScope(userId?: string | null) {
    const normalizedUserId = typeof userId === 'string' ? userId.trim() : '';
    return normalizedUserId ? `user:${normalizedUserId}` : 'guest';
}

export function getStoredReportCacheKey(ticker: string, userId?: string | null) {
    return `${REPORT_CACHE_STORAGE_PREFIX}${getReportCacheScope(userId)}:${ticker.trim().toUpperCase()}`;
}

export function clearStoredReportCacheEntries() {
    const storage = getLocalStorageSafe();
    if (!storage) {
        return;
    }

    const keysToDelete: string[] = [];
    for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (!key) {
            continue;
        }

        if (
            key.startsWith(REPORT_CACHE_STORAGE_PREFIX)
            || LEGACY_REPORT_CACHE_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))
        ) {
            keysToDelete.push(key);
        }
    }

    keysToDelete.forEach((key) => storage.removeItem(key));
}

export function readStoredQuantusUser<T>(
    isValidUser: (value: unknown) => value is T,
): T | null {
    const sessionStorage = getSessionStorageSafe();
    const localStorage = getLocalStorageSafe();
    const raw = sessionStorage?.getItem(USER_STORAGE_KEY)
        ?? localStorage?.getItem(USER_STORAGE_KEY)
        ?? null;

    if (!raw) {
        return null;
    }

    try {
        const parsed: unknown = JSON.parse(raw);
        if (isExpiringUserEnvelope(parsed)) {
            if (parsed.expiresAt > Date.now() && isValidUser(parsed.user)) {
                return parsed.user;
            }
            clearStoredQuantusUser();
            return null;
        }

        if (isValidUser(parsed)) {
            writeStoredQuantusUser(parsed);
            localStorage?.removeItem(USER_STORAGE_KEY);
            return parsed;
        }
    } catch {
        // Fall through to cleanup.
    }

    clearStoredQuantusUser();
    return null;
}

export function writeStoredQuantusUser<T>(user: T) {
    const storage = getSessionStorageSafe();
    if (!storage) {
        return;
    }

    storage.setItem(USER_STORAGE_KEY, JSON.stringify({
        version: 1,
        expiresAt: Date.now() + USER_STORAGE_TTL_MS,
        user,
    }));
    getLocalStorageSafe()?.removeItem(USER_STORAGE_KEY);
}

export function clearStoredQuantusUser() {
    getSessionStorageSafe()?.removeItem(USER_STORAGE_KEY);
    getLocalStorageSafe()?.removeItem(USER_STORAGE_KEY);
}

export function hasStoredQuantusUser() {
    return Boolean(
        getSessionStorageSafe()?.getItem(USER_STORAGE_KEY)
        || getLocalStorageSafe()?.getItem(USER_STORAGE_KEY),
    );
}

export async function clearAuthSensitiveBrowserCaches() {
    if (typeof window === 'undefined' || !('caches' in window)) {
        return;
    }

    const cacheKeys = await caches.keys();
    const keysToDelete = cacheKeys.filter((key) => (
        AUTH_SENSITIVE_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix))
    ));

    await Promise.all(keysToDelete.map((key) => caches.delete(key)));
}

export async function clearQuantusSessionArtifacts() {
    const storage = getLocalStorageSafe();
    if (storage) {
        storage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
    }
    clearStoredQuantusUser();

    clearStoredReportCacheEntries();
    await clearAuthSensitiveBrowserCaches();
}
