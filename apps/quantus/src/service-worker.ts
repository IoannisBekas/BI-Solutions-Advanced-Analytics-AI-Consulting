/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

const isLocalQuantusHost = ['localhost', '127.0.0.1', '[::1]'].includes(self.location.hostname);

if (isLocalQuantusHost) {
    self.addEventListener('install', (event: ExtendableEvent) => {
        event.waitUntil(self.skipWaiting());
    });

    self.addEventListener('activate', (event: ExtendableEvent) => {
        event.waitUntil((async () => {
            const cacheKeys = await caches.keys();
            const quantusCaches = cacheKeys.filter((key) => key.startsWith('quantus-') || key.startsWith('workbox'));
            await Promise.all(quantusCaches.map((key) => caches.delete(key)));
            await self.registration.unregister();

            const openClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
            await Promise.all(
                openClients.map((client) => ('navigate' in client ? client.navigate(client.url) : Promise.resolve(undefined))),
            );
        })());
    });
} else {
    clientsClaim();
    cleanupOutdatedCaches();
    precacheAndRoute(self.__WB_MANIFEST);

    const STATIC_CACHE = 'quantus-static-v4';
    const FONT_CACHE = 'quantus-fonts-v3';
    const PAGE_CACHE = 'quantus-pages-v4';

    self.addEventListener('activate', (event: ExtendableEvent) => {
        event.waitUntil((async () => {
            const cacheKeys = await caches.keys();
            const activeCaches = new Set([
                STATIC_CACHE,
                FONT_CACHE,
                PAGE_CACHE,
            ]);
            const staleQuantusCaches = cacheKeys.filter((key) => (
                (key.startsWith('quantus-') || key.startsWith('workbox'))
                && !activeCaches.has(key)
            ));

            await Promise.all(staleQuantusCaches.map((key) => caches.delete(key)));
        })());
    });

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
                new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
            ],
        }),
    );

    registerRoute(
        ({ url }) => url.origin === 'https://fonts.gstatic.com',
        new CacheFirst({
            cacheName: FONT_CACHE,
            plugins: [
                new CacheableResponsePlugin({ statuses: [0, 200] }),
                new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 }),
            ],
        }),
    );

    registerRoute(
        ({ url }) => url.origin === 'https://fonts.googleapis.com',
        new StaleWhileRevalidate({ cacheName: FONT_CACHE }),
    );

    registerRoute(
        new NavigationRoute(
            new NetworkFirst({
                cacheName: PAGE_CACHE,
                plugins: [new CacheableResponsePlugin({ statuses: [200] })],
            }),
        ),
    );

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

        const badgeLabels: Record<string, string> = {
            SIGNAL_CHANGE: 'Quantus · Signal',
            NEW_REPORT: 'Quantus · Report',
            MATERIAL_EVENT: 'Quantus · Event',
            EARNINGS_FLAG: 'Quantus · Earnings',
            CROSS_TICKER_ALERT: 'Quantus · Alert',
        };

        const notificationOptions: NotificationOptions = {
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
                badgeLabels[payload.type] ?? 'Quantus Research Solutions',
                notificationOptions,
            ),
        );
    });

    self.addEventListener('notificationclick', (event: NotificationEvent) => {
        event.notification.close();

        if (event.action === 'dismiss') return;

        const targetUrl: string = event.notification.data?.url ?? '/quantus/workspace/';

        event.waitUntil(
            self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
                for (const client of clients) {
                    if (client.url.includes(targetUrl) && 'focus' in client) {
                        return (client as WindowClient).focus();
                    }
                }

                return self.clients.openWindow(targetUrl);
            }),
        );
    });

    self.addEventListener('message', (event: ExtendableMessageEvent) => {
        if (event.data?.type === 'SKIP_WAITING') {
            self.skipWaiting();
        }

        if (event.data?.type === 'CACHE_REPORT' && event.data.ticker) {
            event.waitUntil(Promise.resolve());
        }
    });
}
