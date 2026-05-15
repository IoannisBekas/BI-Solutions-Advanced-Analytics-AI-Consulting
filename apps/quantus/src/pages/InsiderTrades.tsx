import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserCheck, TrendingUp, TrendingDown, ExternalLink, Users } from 'lucide-react';
import {
    WorkspaceError,
    WorkspaceSkeleton,
    WorkspaceEmpty,
} from '../components/workspace/WorkspaceStates';
import { WorkspacePaywall } from '../components/workspace/WorkspacePaywall';
import {
    fetchInsiderFeed,
    fetchInsiderClusters,
    type InsiderCard,
    type PremiumError,
} from '../services/premiumFeatures';

interface Props {
    lightMode?: boolean;
    onUpgrade?: () => void;
    onSelectTicker?: (ticker: string) => void;
}

function paletteFor(lightMode?: boolean) {
    return {
        textPrimary: lightMode ? '#0F172A' : '#F0F6FF',
        textSecondary: lightMode ? '#475569' : '#9CA3AF',
        textMuted: lightMode ? '#94A3B8' : '#6B7280',
        border: lightMode ? '#E2E8F0' : '#1A1A1A',
        surface: lightMode ? 'rgba(255,255,255,0.98)' : 'rgba(17,24,39,0.96)',
        dimBg: lightMode ? 'rgba(15,23,42,0.03)' : 'rgba(255,255,255,0.03)',
    };
}

function formatUsd(value: number | null | undefined) {
    if (value == null) return '—';
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
}

export function InsiderTrades({ lightMode, onUpgrade, onSelectTicker }: Props) {
    const palette = paletteFor(lightMode);
    const [tab, setTab] = useState<'feed' | 'clusters'>('feed');
    const [feed, setFeed] = useState<InsiderCard[] | null>(null);
    const [clusters, setClusters] = useState<Awaited<ReturnType<typeof fetchInsiderClusters>>['results'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);
        (async () => {
            try {
                if (tab === 'feed') {
                    const data = await fetchInsiderFeed(50, controller.signal);
                    setFeed(data.results);
                } else {
                    const data = await fetchInsiderClusters(30, controller.signal);
                    setClusters(data.results);
                }
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') return;
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        })();
        return () => controller.abort();
    }, [tab]);

    const paywall = (error as PremiumError | null)?.status === 402;
    const requiredTier = (error as PremiumError | null)?.requiredTier ?? 'INSTITUTIONAL';
    const currentTier = (error as PremiumError | null)?.currentTier ?? 'FREE';

    return (
        <section className="bis-page-shell relative px-6 py-8 md:px-10 md:py-10">
            <div className="relative z-10 max-w-7xl mx-auto space-y-8">
                <div>
                    <span className="bis-eyebrow">
                        <UserCheck className="w-3.5 h-3.5" />
                        Institutional tier · $100/mo
                    </span>
                    <h1 className="mt-3 text-3xl md:text-4xl font-heading font-semibold tracking-tight" style={{ color: palette.textPrimary }}>
                        Insider Trades
                    </h1>
                    <p className="mt-3 text-sm md:text-base leading-relaxed max-w-2xl" style={{ color: palette.textSecondary }}>
                        Form 4 transactions normalized, ranked by $-value, and clustered when multiple insiders move in the same
                        direction. Backed by SEC filings via FMP.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {(['feed', 'clusters'] as const).map((key) => {
                        const active = tab === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                                style={{
                                    background: active ? (lightMode ? '#09090B' : '#F0F6FF') : palette.dimBg,
                                    color: active ? (lightMode ? '#FFFFFF' : '#09090B') : palette.textSecondary,
                                    border: `1px solid ${active ? 'transparent' : palette.border}`,
                                }}
                            >
                                {key === 'feed' ? 'Latest filings' : 'Cluster buying (30d)'}
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <WorkspaceSkeleton rows={6} variant="list" lightMode={lightMode} />
                        </motion.div>
                    ) : paywall ? (
                        <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <WorkspacePaywall
                                requiredTier={requiredTier as 'UNLOCKED' | 'INSTITUTIONAL'}
                                currentTier={currentTier}
                                featureName="Insider trade feed"
                                bullets={[
                                    'Real-time Form 4 filings across the entire market',
                                    'Cluster-buying alerts when 3+ insiders move together',
                                    'Per-ticker history with 90-day buy/sell ratio',
                                    'Drill into each filing on EDGAR with one click',
                                ]}
                                onUpgrade={() => onUpgrade?.()}
                                lightMode={lightMode}
                            />
                        </motion.div>
                    ) : error ? (
                        <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <WorkspaceError
                                title="Insider data unavailable"
                                message={error.message || 'Could not load insider data.'}
                                onRetry={() => setTab(tab)}
                                lightMode={lightMode}
                            />
                        </motion.div>
                    ) : tab === 'feed' ? (
                        <motion.div key="feed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                            {!feed || feed.length === 0 ? (
                                <WorkspaceEmpty
                                    icon={<UserCheck className="w-6 h-6" />}
                                    title="No insider filings in the feed"
                                    message="FMP returned zero meaningful (>$10k) filings. Try again in a minute."
                                    lightMode={lightMode}
                                />
                            ) : (
                                feed.map((card, i) => (
                                    <button
                                        key={`${card.ticker}-${card.filing_date}-${i}`}
                                        type="button"
                                        onClick={() => onSelectTicker?.(card.ticker)}
                                        className="w-full text-left rounded-2xl border px-5 py-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                                        style={{ background: palette.surface, borderColor: palette.border }}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-heading font-bold text-base" style={{ color: palette.textPrimary }}>
                                                        {card.ticker}
                                                    </span>
                                                    <span className="text-xs truncate" style={{ color: palette.textSecondary }}>
                                                        {card.company}
                                                    </span>
                                                </div>
                                                <div className="mt-1 text-sm" style={{ color: palette.textPrimary }}>
                                                    <span className="font-medium">{card.name}</span>
                                                    <span style={{ color: palette.textSecondary }}> · {card.title}</span>
                                                </div>
                                                <div className="mt-1 text-xs" style={{ color: palette.textMuted }}>
                                                    {card.txn_date} · {card.shares.toLocaleString()} shares @ ${card.price?.toFixed(2) ?? '—'}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span
                                                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                                                    style={{
                                                        background:
                                                            card.sentiment === 'bullish'
                                                                ? 'rgba(16,185,129,0.12)'
                                                                : card.sentiment === 'bearish'
                                                                ? 'rgba(239,68,68,0.10)'
                                                                : 'rgba(107,114,128,0.10)',
                                                        color:
                                                            card.sentiment === 'bullish' ? '#10B981' : card.sentiment === 'bearish' ? '#DC2626' : '#6B7280',
                                                    }}
                                                >
                                                    {card.sentiment === 'bullish' ? (
                                                        <TrendingUp className="w-3 h-3" />
                                                    ) : card.sentiment === 'bearish' ? (
                                                        <TrendingDown className="w-3 h-3" />
                                                    ) : null}
                                                    {formatUsd(card.value_usd)}
                                                </span>
                                                {card.source_url && (
                                                    <a
                                                        href={card.source_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-[11px] inline-flex items-center gap-1"
                                                        style={{ color: palette.textMuted }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        Filing <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="clusters" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            {!clusters || clusters.length === 0 ? (
                                <WorkspaceEmpty
                                    icon={<Users className="w-6 h-6" />}
                                    title="No cluster buying detected"
                                    message="No tickers have 3+ insiders buying in the last 30 days. Try widening the window."
                                    lightMode={lightMode}
                                />
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {clusters.map((c) => (
                                        <button
                                            key={c.ticker}
                                            type="button"
                                            onClick={() => onSelectTicker?.(c.ticker)}
                                            className="text-left rounded-2xl border px-5 py-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                                            style={{ background: palette.surface, borderColor: palette.border }}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="font-heading font-bold text-lg" style={{ color: palette.textPrimary }}>
                                                        {c.ticker}
                                                    </div>
                                                    <div className="text-xs truncate" style={{ color: palette.textSecondary }}>
                                                        {c.company}
                                                    </div>
                                                </div>
                                                <span
                                                    className="rounded-full px-3 py-1 text-xs font-semibold"
                                                    style={{
                                                        background: 'rgba(16,185,129,0.12)',
                                                        color: '#10B981',
                                                    }}
                                                >
                                                    {c.insider_count} insiders · {formatUsd(c.total_value_usd)}
                                                </span>
                                            </div>
                                            <div className="mt-3 text-xs" style={{ color: palette.textSecondary }}>
                                                Window: {c.first_date} → {c.last_date}
                                            </div>
                                            <div className="mt-2 text-xs" style={{ color: palette.textMuted }}>
                                                {c.insider_names.slice(0, 4).join(', ')}
                                                {c.insider_names.length > 4 ? ` +${c.insider_names.length - 4} more` : ''}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
