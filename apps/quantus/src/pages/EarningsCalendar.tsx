import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarClock, Sparkles, Sun, Moon } from 'lucide-react';
import { WorkspaceError, WorkspaceSkeleton, WorkspaceEmpty } from '../components/workspace/WorkspaceStates';
import { WorkspacePaywall } from '../components/workspace/WorkspacePaywall';
import {
    fetchEarningsCalendar,
    fetchEarningsPreview,
    type EarningsEntry,
    type PremiumError,
} from '../services/premiumFeatures';

interface Props {
    lightMode?: boolean;
    onUpgrade?: () => void;
    onSelectTicker?: (ticker: string) => void;
}

function pal(lightMode?: boolean) {
    return {
        textPrimary: lightMode ? '#0F172A' : '#F0F6FF',
        textSecondary: lightMode ? '#475569' : '#9CA3AF',
        textMuted: lightMode ? '#94A3B8' : '#6B7280',
        border: lightMode ? '#E2E8F0' : '#1A1A1A',
        surface: lightMode ? 'rgba(255,255,255,0.98)' : 'rgba(17,24,39,0.96)',
        dimBg: lightMode ? 'rgba(15,23,42,0.03)' : 'rgba(255,255,255,0.03)',
        accentBg: lightMode ? 'rgba(37,99,235,0.10)' : 'rgba(96,165,250,0.16)',
        accentText: lightMode ? '#1D4ED8' : '#BFDBFE',
        accentBorder: lightMode ? 'rgba(37,99,235,0.18)' : 'rgba(147,197,253,0.24)',
    };
}

function signalColor(signal?: string) {
    switch (signal) {
        case 'STRONG BUY':
        case 'BUY':
            return '#10B981';
        case 'SELL':
        case 'STRONG SELL':
            return '#DC2626';
        case 'NEUTRAL':
            return '#D97706';
        default:
            return '#6B7280';
    }
}

export function EarningsCalendar({ lightMode, onUpgrade, onSelectTicker }: Props) {
    const palette = pal(lightMode);
    const [days, setDays] = useState(7);
    const [buckets, setBuckets] = useState<Array<{ date: string; entries: EarningsEntry[] }> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const [previewTicker, setPreviewTicker] = useState<string | null>(null);
    const [previewText, setPreviewText] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<Error | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);
        (async () => {
            try {
                const data = await fetchEarningsCalendar(days, controller.signal);
                setBuckets(data.buckets);
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') return;
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        })();
        return () => controller.abort();
    }, [days]);

    async function runPreview(ticker: string) {
        setPreviewTicker(ticker);
        setPreviewText(null);
        setPreviewLoading(true);
        setPreviewError(null);
        try {
            const data = await fetchEarningsPreview(ticker);
            setPreviewText(data.narrative);
        } catch (err) {
            setPreviewError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setPreviewLoading(false);
        }
    }

    const paywall = (error as PremiumError | null)?.status === 402;
    const requiredTier = (error as PremiumError | null)?.requiredTier ?? 'UNLOCKED';
    const currentTier = (error as PremiumError | null)?.currentTier ?? 'FREE';

    return (
        <section className="bis-page-shell relative px-6 py-8 md:px-10 md:py-10">
            <div className="relative z-10 max-w-7xl mx-auto space-y-8">
                <div>
                    <span className="bis-eyebrow">
                        <CalendarClock className="w-3.5 h-3.5" />
                        Quantus Personal · $19/mo · AI preview is $100/mo
                    </span>
                    <h1 className="mt-3 text-3xl md:text-4xl font-heading font-semibold tracking-tight" style={{ color: palette.textPrimary }}>
                        Earnings Calendar
                    </h1>
                    <p className="mt-3 text-sm md:text-base leading-relaxed max-w-2xl" style={{ color: palette.textSecondary }}>
                        Every reporting company in the next week, ranked by Quantus signal confidence. One click summons a
                        Meridian-grade pre-earnings preview.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {[3, 7, 14, 30].map((d) => {
                        const active = days === d;
                        return (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                                style={{
                                    background: active ? (lightMode ? '#09090B' : '#F0F6FF') : palette.dimBg,
                                    color: active ? (lightMode ? '#FFFFFF' : '#09090B') : palette.textSecondary,
                                    border: `1px solid ${active ? 'transparent' : palette.border}`,
                                }}
                            >
                                Next {d}d
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <WorkspaceSkeleton rows={5} variant="list" lightMode={lightMode} />
                        </motion.div>
                    ) : paywall ? (
                        <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <WorkspacePaywall
                                requiredTier={requiredTier as 'UNLOCKED' | 'INSTITUTIONAL'}
                                currentTier={currentTier}
                                featureName="Earnings calendar"
                                bullets={[
                                    'Every company reporting in the next 3 to 30 days',
                                    'Quantus signal + confidence layered on each entry',
                                    'BMO / AMC tagging so you can plan around the print',
                                    'AI preview generation included on the Institutional tier',
                                ]}
                                onUpgrade={() => onUpgrade?.()}
                                lightMode={lightMode}
                            />
                        </motion.div>
                    ) : error ? (
                        <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <WorkspaceError title="Earnings calendar unavailable" message={error.message} onRetry={() => setDays(days)} lightMode={lightMode} />
                        </motion.div>
                    ) : !buckets || buckets.length === 0 ? (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <WorkspaceEmpty
                                icon={<CalendarClock className="w-6 h-6" />}
                                title="No earnings in this window"
                                message="No tickers in the FMP calendar match this date range. Try a wider window."
                                lightMode={lightMode}
                            />
                        </motion.div>
                    ) : (
                        <motion.div key="data" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                            {buckets.map((bucket) => (
                                <div key={bucket.date}>
                                    <div className="flex items-baseline gap-3 mb-3">
                                        <h2 className="font-heading font-semibold text-lg" style={{ color: palette.textPrimary }}>
                                            {new Date(bucket.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                        </h2>
                                        <span className="text-xs" style={{ color: palette.textMuted }}>
                                            {bucket.entries.length} reporting
                                        </span>
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                        {bucket.entries.map((entry, i) => (
                                            <div
                                                key={`${entry.ticker}-${i}`}
                                                className="rounded-xl border px-4 py-3"
                                                style={{ background: palette.surface, borderColor: palette.border }}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => onSelectTicker?.(entry.ticker)}
                                                        className="text-left min-w-0"
                                                    >
                                                        <div className="font-heading font-bold text-base hover:underline" style={{ color: palette.textPrimary }}>
                                                            {entry.ticker}
                                                        </div>
                                                        <div className="text-[11px] truncate" style={{ color: palette.textSecondary }}>
                                                            {entry.sector || '—'}
                                                        </div>
                                                    </button>
                                                    <span
                                                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold inline-flex items-center gap-1"
                                                        style={{
                                                            background: palette.dimBg,
                                                            color: palette.textMuted,
                                                            border: `1px solid ${palette.border}`,
                                                        }}
                                                    >
                                                        {entry.time === 'bmo' ? <Sun className="w-3 h-3" /> : entry.time === 'amc' ? <Moon className="w-3 h-3" /> : null}
                                                        {entry.time?.toUpperCase() || '—'}
                                                    </span>
                                                </div>

                                                {entry.has_coverage && entry.overall_signal && (
                                                    <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                                                        <span className="font-semibold" style={{ color: signalColor(entry.overall_signal) }}>
                                                            {entry.overall_signal}
                                                        </span>
                                                        <span style={{ color: palette.textMuted }}>{entry.confidence_score}% conf · {entry.regime_label}</span>
                                                    </div>
                                                )}

                                                <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]" style={{ color: palette.textSecondary }}>
                                                    <span>EPS est: {entry.eps_estimate ?? '—'}</span>
                                                    <span>Rev est: {entry.revenue_estimate ? `$${(entry.revenue_estimate / 1e9).toFixed(2)}B` : '—'}</span>
                                                </div>

                                                <button
                                                    onClick={() => runPreview(entry.ticker)}
                                                    className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
                                                    style={{
                                                        background: palette.accentBg,
                                                        color: palette.accentText,
                                                        border: `1px solid ${palette.accentBorder}`,
                                                    }}
                                                >
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    AI Preview
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {previewTicker && (
                    <div
                        className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-4"
                        onClick={() => setPreviewTicker(null)}
                    >
                        <div
                            className="w-full max-w-2xl rounded-3xl border p-6 md:p-8 max-h-[80vh] overflow-y-auto"
                            style={{ background: palette.surface, borderColor: palette.border }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-heading text-xl font-semibold tracking-tight" style={{ color: palette.textPrimary }}>
                                    AI preview · {previewTicker}
                                </h3>
                                <button
                                    onClick={() => setPreviewTicker(null)}
                                    className="text-sm"
                                    style={{ color: palette.textMuted }}
                                >
                                    Close
                                </button>
                            </div>

                            {previewLoading ? (
                                <WorkspaceSkeleton rows={2} variant="list" lightMode={lightMode} />
                            ) : (previewError as PremiumError | null)?.status === 402 ? (
                                <WorkspacePaywall
                                    requiredTier="INSTITUTIONAL"
                                    currentTier={(previewError as PremiumError | null)?.currentTier ?? 'FREE'}
                                    featureName="AI earnings previews"
                                    bullets={[
                                        'Meridian v2.4 grade pre-earnings briefings',
                                        'What to watch, setup risk, and Quantus stance per print',
                                        'Per-ticker post-earnings recaps included',
                                    ]}
                                    onUpgrade={() => onUpgrade?.()}
                                    lightMode={lightMode}
                                />
                            ) : previewError ? (
                                <WorkspaceError title="Preview failed" message={previewError.message} onRetry={() => runPreview(previewTicker)} lightMode={lightMode} />
                            ) : (
                                <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: palette.textPrimary }}>
                                    {previewText}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
