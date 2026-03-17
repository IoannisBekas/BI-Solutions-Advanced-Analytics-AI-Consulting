import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Zap } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

// ─── PWA Install Banner ───────────────────────────────────────────────────────
// Subtle, appears after 3rd visit, one-time dismissible, never re-shown

interface PWAInstallBannerProps {
    lightMode?: boolean;
}

export function PWAInstallBanner({ lightMode }: PWAInstallBannerProps) {
    const { showInstallBanner, install, dismissBanner } = usePWA();

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
                        border: '1px solid rgba(59,130,246,0.3)',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                    }}
                >
                    <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
                            <Zap className="w-5 h-5 text-blue-400" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm mb-0.5"
                                style={{ color: lightMode ? '#0F172A' : '#F9FAFB' }}>
                                Add Quantus Investing to Home Screen
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
                            style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)', color: 'white' }}
                        >
                            <Download className="w-4 h-4" />
                            Install App
                        </motion.button>
                        <button
                            onClick={dismissBanner}
                            className="px-3 py-2 text-xs cursor-pointer transition-colors hover:text-blue-400"
                            style={{ color: '#6B7280' }}
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

export function SWUpdateBanner({ lightMode }: { lightMode?: boolean }) {
    const { needsRefresh, updateSW } = usePWA();

    return (
        <AnimatePresence>
            {needsRefresh && (
                <motion.div
                    initial={{ y: -56, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -56, opacity: 0 }}
                    className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl text-sm"
                    style={{
                        background: lightMode ? 'rgba(240,253,244,0.96)' : 'rgba(16,185,129,0.12)',
                        border: lightMode ? '1px solid rgba(16,185,129,0.22)' : '1px solid rgba(16,185,129,0.3)',
                        boxShadow: lightMode ? '0 8px 24px rgba(15,23,42,0.12)' : '0 8px 32px rgba(0,0,0,0.3)',
                        backdropFilter: 'blur(12px)',
                    }}
                >
                    <span style={{ color: lightMode ? '#047857' : '#10B981' }}>⚡ Quantus Investing update available</span>
                    <button
                        onClick={updateSW}
                        className="font-semibold text-xs px-3 py-1 rounded-lg cursor-pointer hover:scale-105 transition-all"
                        style={{
                            background: lightMode ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.2)',
                            color: lightMode ? '#047857' : '#10B981',
                        }}
                    >
                        Refresh
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
