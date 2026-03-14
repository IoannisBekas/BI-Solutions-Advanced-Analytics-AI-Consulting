import { useState, useEffect, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const VISIT_KEY = 'quantus_visit_count';
const DISMISS_KEY = 'quantus_pwa_dismissed';

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

    // Track visit count — show banner after 3rd visit
    useEffect(() => {
        const dismissed = localStorage.getItem(DISMISS_KEY) === 'true';
        if (dismissed) return;

        const raw = parseInt(localStorage.getItem(VISIT_KEY) ?? '0', 10);
        const count = raw + 1;
        localStorage.setItem(VISIT_KEY, String(count));

        if (count >= 3 && deferredPrompt) setShowBanner(true);
    }, [deferredPrompt]);

    // Capture beforeinstallprompt
    useEffect(() => {
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
    }, []);

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

    // SW update handling from vite-plugin-pwa
    const { needRefresh: [needsRefresh], updateServiceWorker } = useRegisterSW({
        onRegisteredSW(_swUrl, r) {
            // Poll for updates every hour in production
            // This interval lives for the page lifetime (SPA), which is acceptable
            if (r) setInterval(() => r.update(), 60 * 60 * 1000);
        },
    });

    return {
        canInstall, showInstallBanner: showBanner,
        install, dismissBanner,
        needsRefresh: needsRefresh ?? false,
        updateSW: () => updateServiceWorker(true),
    };
}

// ─── Pre-cache a viewed report for offline access ────────────────────────────

export function cacheReportForOffline(ticker: string): void {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CACHE_REPORT', ticker });
    }
}
