const LEGACY_REPORT_CACHE_STORAGE_PREFIX = 'quantus-last-report:';
export const REPORT_CACHE_STORAGE_PREFIX = 'quantus-last-report:v2:';
export const TOKEN_STORAGE_KEY = 'quantus-token';
export const USER_STORAGE_KEY = 'quantus-user';

const AUTH_SENSITIVE_CACHE_PREFIXES = [
    'quantus-api-',
    'quantus-reports-',
];

function getStorageSafe() {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.localStorage;
}

export function getReportCacheScope(userId?: string | null) {
    const normalizedUserId = typeof userId === 'string' ? userId.trim() : '';
    return normalizedUserId ? `user:${normalizedUserId}` : 'guest';
}

export function getStoredReportCacheKey(ticker: string, userId?: string | null) {
    return `${REPORT_CACHE_STORAGE_PREFIX}${getReportCacheScope(userId)}:${ticker.trim().toUpperCase()}`;
}

export function clearStoredReportCacheEntries() {
    const storage = getStorageSafe();
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
            || key.startsWith(LEGACY_REPORT_CACHE_STORAGE_PREFIX)
        ) {
            keysToDelete.push(key);
        }
    }

    keysToDelete.forEach((key) => storage.removeItem(key));
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
    const storage = getStorageSafe();
    if (storage) {
        storage.removeItem(TOKEN_STORAGE_KEY);
        storage.removeItem(USER_STORAGE_KEY);
    }

    clearStoredReportCacheEntries();
    await clearAuthSensitiveBrowserCaches();
}
