import { useState, useEffect, useCallback, useRef } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { TOKEN_STORAGE_KEY } from '../utils/sessionArtifacts';

const VISIT_KEY = 'quantus_visit_count';
const DISMISS_KEY = 'quantus_pwa_dismissed';
const LOCAL_PWA_DISABLED_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// ─── PWA install prompt hook ──────────────────────────────────────────────────

interface UsePWAReturn {
    canInstall: boolean;
    showInstallBanner: boolean;
    install: () => Promise<void>;
    dismissBanner: () => void;
    needsRefresh: boolean;
    updateSW: () => void;
}

export function usePWA(): UsePWAReturn {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [canInstall, setCanInstall] = useState(false);
    const [showBanner, setShowBanner] = useState(false);
    const [needsRefresh, setNeedsRefresh] = useState(false);
    const updateServiceWorkerRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);
    const disablePWA = typeof window !== 'undefined' && LOCAL_PWA_DISABLED_HOSTS.has(window.location.hostname);

    // Track visit count — show banner after 3rd visit
    useEffect(() => {
        if (disablePWA) return;
        const dismissed = localStorage.getItem(DISMISS_KEY) === 'true';
        if (dismissed) return;

        const raw = parseInt(localStorage.getItem(VISIT_KEY) ?? '0', 10);
        const count = raw + 1;
        localStorage.setItem(VISIT_KEY, String(count));

        if (count >= 3 && deferredPrompt) setShowBanner(true);
    }, [deferredPrompt, disablePWA]);

    // Capture beforeinstallprompt
    useEffect(() => {
        if (disablePWA) return;
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setCanInstall(true);

            // If ≥3 visits already and not dismissed, show
            const dismissed = localStorage.getItem(DISMISS_KEY) === 'true';
            const count = parseInt(localStorage.getItem(VISIT_KEY) ?? '0', 10);
            if (count >= 3 && !dismissed) setShowBanner(true);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, [disablePWA]);

    const install = useCallback(async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setCanInstall(false);
            setShowBanner(false);
        }
    }, [deferredPrompt]);

    const dismissBanner = useCallback(() => {
        setShowBanner(false);
        localStorage.setItem(DISMISS_KEY, 'true');
    }, []);

    useEffect(() => {
        if (disablePWA) {
            updateServiceWorkerRef.current = null;
            setNeedsRefresh(false);
            return;
        }

        updateServiceWorkerRef.current = registerSW({
            onNeedRefresh: () => setNeedsRefresh(true),
            onOfflineReady: () => setNeedsRefresh(false),
            onRegisterError: () => setNeedsRefresh(false),
        });

        return () => {
            updateServiceWorkerRef.current = null;
        };
    }, [disablePWA]);

    return {
        canInstall: disablePWA ? false : canInstall,
        showInstallBanner: disablePWA ? false : showBanner,
        install, dismissBanner,
        needsRefresh: disablePWA ? false : needsRefresh,
        updateSW: () => updateServiceWorkerRef.current?.(true) ?? Promise.resolve(),
    };
}

// ─── Pre-cache a viewed report for offline access ────────────────────────────

export function cacheReportForOffline(ticker: string): void {
    if (typeof window === 'undefined') {
        return;
    }

    // Protected reports are account-scoped and should not be written into a shared offline cache.
    if (localStorage.getItem(TOKEN_STORAGE_KEY)) {
        return;
    }

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CACHE_REPORT', ticker });
    }
}
