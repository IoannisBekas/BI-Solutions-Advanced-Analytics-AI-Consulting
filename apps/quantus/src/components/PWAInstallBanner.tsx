import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Zap } from 'lucide-react';

// ─── PWA Install Banner ───────────────────────────────────────────────────────
// Subtle, appears after 3rd visit, one-time dismissible, never re-shown

interface PWAInstallBannerProps {
    lightMode?: boolean;
    showInstallBanner: boolean;
    install: () => Promise<void>;
    dismissBanner: () => void;
}

export function PWAInstallBanner({ lightMode, showInstallBanner, install, dismissBanner }: PWAInstallBannerProps) {
    return (
        <AnimatePresence>
            {showInstallBanner && (
                <motion.div
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 rounded-2xl p-4"
                    style={{
                        background: lightMode ? 'rgba(255,255,255,0.97)' : 'rgba(17,24,39,0.98)',
                        border: lightMode ? '1px solid rgba(209,213,219,0.95)' : '1px solid rgba(255,255,255,0.12)',
                        boxShadow: '0 18px 54px rgba(0,0,0,0.24)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                    }}
                >
                    <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: lightMode ? 'rgba(9,9,11,0.06)' : 'rgba(255,255,255,0.08)', border: lightMode ? '1px solid rgba(209,213,219,0.95)' : '1px solid rgba(255,255,255,0.12)' }}>
                            <Zap className="w-5 h-5" style={{ color: lightMode ? '#09090B' : '#F9FAFB' }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm mb-0.5"
                                style={{ color: lightMode ? '#0F172A' : '#F9FAFB' }}>
                                Add Quantus to Home Screen
                            </div>
                            <div className="text-xs" style={{ color: '#9CA3AF' }}>
                                Instant access, offline cached reports, and push alerts.
                            </div>
                        </div>

                        {/* Dismiss */}
                        <button
                            onClick={dismissBanner}
                            className="flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            <X className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                        </button>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-2 mt-3">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={install}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold cursor-pointer"
                            style={{ background: '#09090B', color: 'white' }}
                        >
                            <Download className="w-4 h-4" />
                            Install App
                        </motion.button>
                        <button
                            onClick={dismissBanner}
                            className="px-3 py-2 text-xs text-gray-500 cursor-pointer transition-colors hover:text-black"
                        >
                            Maybe later
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─── SW Update Ready Banner ───────────────────────────────────────────────────

interface SWUpdateBannerProps {
    lightMode?: boolean;
    needsRefresh: boolean;
    updateSW: () => void;
    dismiss: () => void;
}

export function SWUpdateBanner({ lightMode, needsRefresh, updateSW, dismiss }: SWUpdateBannerProps) {
    return (
        <AnimatePresence>
            {needsRefresh && (
                <motion.div
                    initial={{ y: -56, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -56, opacity: 0 }}
                    className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl text-sm"
                    style={{
                        background: lightMode ? 'rgba(255,255,255,0.96)' : 'rgba(17,24,39,0.98)',
                        border: lightMode ? '1px solid rgba(209,213,219,0.95)' : '1px solid rgba(255,255,255,0.12)',
                        boxShadow: lightMode ? '0 8px 24px rgba(15,23,42,0.12)' : '0 8px 32px rgba(0,0,0,0.3)',
                        backdropFilter: 'blur(12px)',
                    }}
                >
                    <span style={{ color: lightMode ? '#111827' : '#F9FAFB' }}>Quantus update available</span>
                    <button
                        onClick={updateSW}
                        className="font-semibold text-xs px-3 py-1 rounded-lg cursor-pointer hover:scale-105 transition-all"
                        style={{
                            background: lightMode ? '#09090B' : '#F9FAFB',
                            color: lightMode ? '#FFFFFF' : '#09090B',
                        }}
                    >
                        Refresh
                    </button>
                    <button
                        onClick={dismiss}
                        className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                        aria-label="Dismiss update banner"
                    >
                        <X className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
