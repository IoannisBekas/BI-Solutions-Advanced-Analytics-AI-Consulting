import { useState, useCallback } from 'react';

// ─── Push notification types ──────────────────────────────────────────────────

export type PushAlertType =
    | 'SIGNAL_CHANGE'
    | 'NEW_REPORT'
    | 'MATERIAL_EVENT'
    | 'EARNINGS_FLAG'
    | 'CROSS_TICKER_ALERT';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? 'PLACEHOLDER_VAPID_KEY';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(base64);
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UsePushNotificationsReturn {
    permission: NotificationPermission;
    isSubscribed: boolean;
    subscribe: (alertTypes?: PushAlertType[]) => Promise<boolean>;
    unsubscribe: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
    const [permission, setPermission] = useState<NotificationPermission>(
        typeof Notification !== 'undefined' ? Notification.permission : 'default',
    );
    const [isSubscribed, setIsSubscribed] = useState(false);

    // Called ONLY after user explicitly sets their first alert — never on page load
    const subscribe = useCallback(async (alertTypes: PushAlertType[] = ['SIGNAL_CHANGE', 'NEW_REPORT']): Promise<boolean> => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;

        const granted = await Notification.requestPermission();
        setPermission(granted);
        if (granted !== 'granted') return false;

        const sw = await navigator.serviceWorker.ready;
        const existing = await sw.pushManager.getSubscription();
        if (existing) { setIsSubscribed(true); return true; }

        try {
            const sub = await sw.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            // POST subscription to backend
            const response = await fetch('/quantus/api/v1/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription: sub.toJSON(), alertTypes }),
            });
            if (!response.ok) {
                await sub.unsubscribe();
                return false;
            }

            setIsSubscribed(true);
            return true;
        } catch {
            return false;
        }
    }, []);

    const unsubscribe = useCallback(async () => {
        const sw = await navigator.serviceWorker.ready;
        const sub = await sw.pushManager.getSubscription();
        if (sub) {
            await sub.unsubscribe();
            await fetch('/quantus/api/v1/push/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint: sub.endpoint }),
            });
        }
        setIsSubscribed(false);
    }, []);

    return { permission, isSubscribed, subscribe, unsubscribe };
}
