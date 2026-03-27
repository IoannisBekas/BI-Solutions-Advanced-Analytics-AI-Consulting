/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import {
    CacheFirst, NetworkFirst, StaleWhileRevalidate,
} from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

// ─── Take control immediately ─────────────────────────────────────────────────
clientsClaim();
// Note: skipWaiting() is triggered via message handler below to respect controlled update flow

// ─── Precache all Vite build artifacts ────────────────────────────────────────
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// ─── Cache names ──────────────────────────────────────────────────────────────
const STATIC_CACHE = 'quantus-static-v1';
const API_CACHE = 'quantus-api-v1';
const REPORT_CACHE = 'quantus-reports-v1';
const FONT_CACHE = 'quantus-fonts-v1';

// ─── Strategy 1: Cache-first for static assets ───────────────────────────────
registerRoute(
    ({ request }) =>
        request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'image' ||
        request.destination === 'font',
    new CacheFirst({
        cacheName: STATIC_CACHE,
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }), // 30d
        ],
    }),
);

// ─── Strategy 2: Cache-first for Google Fonts ────────────────────────────────
registerRoute(
    ({ url }) => url.origin === 'https://fonts.gstatic.com',
    new CacheFirst({
        cacheName: FONT_CACHE,
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 }), // 1yr
        ],
    }),
);

// ─── Strategy 3: StaleWhileRevalidate for Google Fonts stylesheet ─────────────
registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com',
    new StaleWhileRevalidate({ cacheName: FONT_CACHE }),
);

// ─── Strategy 4: Network-first for report JSON specifically ───────────────────
// Register before the generic API handler so report requests get the
// longer timeout/cache policy instead of the 8s API default.
registerRoute(
    ({ url }) => url.pathname.startsWith('/quantus/api/report/'),
    new NetworkFirst({
        cacheName: REPORT_CACHE,
        networkTimeoutSeconds: 20,
        plugins: [
            new CacheableResponsePlugin({ statuses: [200] }),
            new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 96 * 60 * 60 }), // 96h — matches Redis TTL
        ],
    }),
);

// ─── Strategy 5: Network-first for other API calls, offline fallback to cache ─
registerRoute(
    ({ url }) => url.pathname.startsWith('/quantus/api/') && !url.pathname.startsWith('/quantus/api/report/'),
    new NetworkFirst({
        cacheName: API_CACHE,
        networkTimeoutSeconds: 8,
        plugins: [
            new CacheableResponsePlugin({ statuses: [200] }),
            new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 4 * 60 * 60 }), // 4h
        ],
    }),
);

// ─── Navigation fallback — serve index.html for SPA routes ───────────────────
registerRoute(
    new NavigationRoute(
        new NetworkFirst({
            cacheName: 'quantus-pages',
            plugins: [new CacheableResponsePlugin({ statuses: [200] })],
        }),
    ),
);

// ─── Push Notification handler ────────────────────────────────────────────────

self.addEventListener('push', (event: PushEvent) => {
    if (!event.data) return;

    let payload: { type: string; title: string; body: string; ticker?: string; reportId?: string; url?: string };
    try {
        payload = event.data.json();
    } catch {
        payload = { type: 'generic', title: 'Quantus Update', body: event.data.text() };
    }

    const icons: Record<string, string> = {
        SIGNAL_CHANGE: '/quantus/workspace/icons/icon-192x192.png',
        NEW_REPORT: '/quantus/workspace/icons/icon-192x192.png',
        MATERIAL_EVENT: '/quantus/workspace/icons/icon-192x192.png',
        EARNINGS_FLAG: '/quantus/workspace/icons/icon-192x192.png',
        CROSS_TICKER_ALERT: '/quantus/workspace/icons/icon-192x192.png',
    };

    const badgeColors: Record<string, string> = {
        SIGNAL_CHANGE: 'Quantus · Signal',
        NEW_REPORT: 'Quantus · Report',
        MATERIAL_EVENT: 'Quantus · Event',
        EARNINGS_FLAG: 'Quantus · Earnings',
        CROSS_TICKER_ALERT: 'Quantus · Alert',
    };

    const notifOptions: NotificationOptions = {
        body: payload.body,
        icon: icons[payload.type] ?? '/quantus/workspace/icons/icon-192x192.png',
        badge: '/quantus/workspace/icons/icon-72x72.png',
        tag: `quantus-${payload.type}-${payload.ticker ?? 'global'}`,
        silent: false,
        data: {
            url: payload.url ?? '/quantus/workspace/',
            type: payload.type,
            ticker: payload.ticker,
        },
    };

    event.waitUntil(
        self.registration.showNotification(
            badgeColors[payload.type] ?? 'Quantus Research Solutions',
            notifOptions,
        ),
    );
});

// ─── Notification click handler ───────────────────────────────────────────────

self.addEventListener('notificationclick', (event: NotificationEvent) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const targetUrl: string = event.notification.data?.url ?? '/quantus/workspace/';

    event.waitUntil(
        (self.clients as Clients).matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
            // Focus existing tab if already open
            for (const client of clients) {
                if (client.url.includes(targetUrl) && 'focus' in client) {
                    return (client as WindowClient).focus();
                }
            }
            // Otherwise open new tab
            return (self.clients as Clients).openWindow(targetUrl);
        }),
    );
});

// ─── Message handler (from app → SW) ─────────────────────────────────────────

self.addEventListener('message', (event: ExtendableMessageEvent) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    // Pre-cache a specific report on demand (called after report is viewed)
    if (event.data?.type === 'CACHE_REPORT' && event.data.ticker) {
        const url = `/quantus/api/report/${event.data.ticker}`;
        const fetchAndCache = async () => {
            const cache = await caches.open(REPORT_CACHE);
            const res = await fetch(url);
            if (res.ok) await cache.put(url, res);
        };
        event.waitUntil(fetchAndCache());
    }
});
