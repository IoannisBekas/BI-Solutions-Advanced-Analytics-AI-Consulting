import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Anchor, ArrowUpRight, Sparkles } from 'lucide-react';
import { WorkspaceError, WorkspaceSkeleton, WorkspaceEmpty } from '../components/workspace/WorkspaceStates';
import { WorkspacePaywall } from '../components/workspace/WorkspacePaywall';
import {
    fetchWhaleFunds,
    fetchWhaleHoldings,
    fetchNewWhalePositions,
    type WhaleFund,
    type PremiumError,
} from '../services/premiumFeatures';

interface Props {
    lightMode?: boolean;
    onUpgrade?: () => void;
    onSelectTicker?: (ticker: string) => void;
}

function palette(lightMode?: boolean) {
    return {
        textPrimary: lightMode ? '#0F172A' : '#F0F6FF',
        textSecondary: lightMode ? '#475569' : '#9CA3AF',
        textMuted: lightMode ? '#94A3B8' : '#6B7280',
        border: lightMode ? '#E2E8F0' : '#1A1A1A',
        surface: lightMode ? 'rgba(255,255,255,0.98)' : 'rgba(17,24,39,0.96)',
        dimBg: lightMode ? 'rgba(15,23,42,0.03)' : 'rgba(255,255,255,0.03)',
    };
}

function formatUsd(value: number) {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
}

export function WhaleTracking({ lightMode, onUpgrade, onSelectTicker }: Props) {
    const p = palette(lightMode);

    const [tab, setTab] = useState<'funds' | 'new'>('funds');
    const [funds, setFunds] = useState<WhaleFund[] | null>(null);
    const [selectedFund, setSelectedFund] = useState<WhaleFund | null>(null);
    const [holdings, setHoldings] = useState<Awaited<ReturnType<typeof fetchWhaleHoldings>> | null>(null);
    const [newPositions, setNewPositions] = useState<Awaited<ReturnType<typeof fetchNewWhalePositions>>['results'] | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Load fund list once
    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            try {
                const data = await fetchWhaleFunds(controller.signal);
                setFunds(data.funds);
                if (!selectedFund && data.funds.length > 0) setSelectedFund(data.funds[0]!);
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') return;
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        })();
        return () => controller.abort();
    }, []);

    // Load holdings when fund changes
    useEffect(() => {
        if (tab !== 'funds' || !selectedFund) return;
        const controller = new AbortController();
        setLoading(true);
        setError(null);
        (async () => {
            try {
                const data = await fetchWhaleHoldings(selectedFund.cik, controller.signal);
                setHoldings(data);
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') return;
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        })();
        return () => controller.abort();
    }, [selectedFund, tab]);

    // Load new positions
    useEffect(() => {
        if (tab !== 'new') return;
        const controller = new AbortController();
        setLoading(true);
        setError(null);
        (async () => {
            try {
                const data = await fetchNewWhalePositions(40, controller.signal);
                setNewPositions(data.results);
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
                        <Anchor className="w-3.5 h-3.5" />
                        Institutional tier · $100/mo
                    </span>
                    <h1 className="mt-3 text-3xl md:text-4xl font-heading font-semibold tracking-tight" style={{ color: p.textPrimary }}>
                        13F Whale Tracking
                    </h1>
                    <p className="mt-3 text-sm md:text-base leading-relaxed max-w-2xl" style={{ color: p.textSecondary }}>
                        See what Berkshire, Pershing, Renaissance, Burry, Pelosi, and 10+ other institutional managers
                        bought, sold, and initiated in their most recent 13F filing.
                    </p>
                </div>

                <div className="flex gap-2">
                    {(['funds', 'new'] as const).map((key) => {
                        const active = tab === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                                style={{
                                    background: active ? (lightMode ? '#09090B' : '#F0F6FF') : p.dimBg,
                                    color: active ? (lightMode ? '#FFFFFF' : '#09090B') : p.textSecondary,
                                    border: `1px solid ${active ? 'transparent' : p.border}`,
                                }}
                            >
                                {key === 'funds' ? 'Fund holdings' : 'New initiations'}
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <WorkspaceSkeleton rows={6} lightMode={lightMode} />
                        </motion.div>
                    ) : paywall ? (
                        <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <WorkspacePaywall
                                requiredTier={requiredTier as 'UNLOCKED' | 'INSTITUTIONAL'}
                                currentTier={currentTier}
                                featureName="13F whale tracking"
                                bullets={[
                                    'Curated registry of the 12 most-watched institutional managers',
                                    'Top-50 holdings + portfolio weights from the latest 13F',
                                    'New-position alerts across all curated whales',
                                    'Drill into any ticker for a Quantus report',
                                ]}
                                onUpgrade={() => onUpgrade?.()}
                                lightMode={lightMode}
                            />
                        </motion.div>
                    ) : error ? (
                        <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <WorkspaceError title="13F data unavailable" message={error.message} onRetry={() => setTab(tab)} lightMode={lightMode} />
                        </motion.div>
                    ) : tab === 'funds' ? (
                        <motion.div
                            key="funds"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4"
                        >
                            <div className="space-y-2">
                                {funds?.map((f) => {
                                    const active = selectedFund?.cik === f.cik;
                                    return (
                                        <button
                                            key={f.cik}
                                            onClick={() => setSelectedFund(f)}
                                            className="w-full text-left rounded-xl px-4 py-3 transition-all"
                                            style={{
                                                background: active ? (lightMode ? '#09090B' : '#F0F6FF') : p.surface,
                                                color: active ? (lightMode ? '#FFFFFF' : '#09090B') : p.textPrimary,
                                                border: `1px solid ${active ? 'transparent' : p.border}`,
                                            }}
                                        >
                                            <div className="font-heading font-semibold text-sm">{f.name}</div>
                                            <div className="text-[11px] mt-0.5 opacity-80">{f.manager} · {f.style}</div>
                                            <div className="text-[10px] mt-0.5 opacity-60">${f.aum_usd_b.toFixed(0)}B AUM</div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="space-y-3">
                                {!holdings || holdings.count === 0 ? (
                                    <WorkspaceEmpty
                                        icon={<Anchor className="w-6 h-6" />}
                                        title="No holdings retrieved"
                                        message={holdings?.note ?? 'No 13F data returned. Try another fund.'}
                                        lightMode={lightMode}
                                    />
                                ) : (
                                    <>
                                        <div className="flex items-baseline justify-between flex-wrap gap-2">
                                            <h2 className="font-heading font-semibold text-lg" style={{ color: p.textPrimary }}>
                                                {holdings.fund?.name ?? selectedFund?.name} · top {holdings.holdings.length}
                                            </h2>
                                            <span className="text-xs" style={{ color: p.textMuted }}>
                                                Filing date: {holdings.filing_date ?? '—'} · Reported AUM {formatUsd(holdings.total_aum_usd)}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {holdings.holdings.map((h, i) => (
                                                <button
                                                    key={`${h.ticker}-${i}`}
                                                    type="button"
                                                    onClick={() => onSelectTicker?.(h.ticker)}
                                                    className="text-left rounded-xl border px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
                                                    style={{ background: p.surface, borderColor: p.border }}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-heading font-bold" style={{ color: p.textPrimary }}>
                                                                {h.ticker || '—'}
                                                            </div>
                                                            <div className="text-xs truncate" style={{ color: p.textSecondary }}>
                                                                {h.company}
                                                            </div>
                                                        </div>
                                                        <div className="text-right text-xs">
                                                            <div className="font-mono font-semibold" style={{ color: p.textPrimary }}>
                                                                {formatUsd(h.value_usd)}
                                                            </div>
                                                            <div style={{ color: p.textMuted }}>{h.weight_pct}% wt</div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="new" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                            {!newPositions || newPositions.length === 0 ? (
                                <WorkspaceEmpty
                                    icon={<Sparkles className="w-6 h-6" />}
                                    title="No new whale positions detected"
                                    message="Either FMP didn't return new initiations, or the latest 13F window hasn't refreshed yet."
                                    lightMode={lightMode}
                                />
                            ) : (
                                newPositions.map((n, i) => (
                                    <button
                                        key={`${n.whale}-${n.ticker}-${i}`}
                                        onClick={() => onSelectTicker?.(n.ticker)}
                                        className="w-full text-left rounded-2xl border px-5 py-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                                        style={{ background: p.surface, borderColor: p.border }}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="font-heading font-bold text-base" style={{ color: p.textPrimary }}>
                                                    {n.ticker}{' '}
                                                    <span className="text-xs font-normal" style={{ color: p.textSecondary }}>
                                                        {n.company}
                                                    </span>
                                                </div>
                                                <div className="mt-1 text-xs" style={{ color: p.textSecondary }}>
                                                    New position from <span className="font-semibold">{n.whale}</span> ({n.manager}) · {n.style}
                                                </div>
                                                <div className="mt-0.5 text-[11px]" style={{ color: p.textMuted }}>
                                                    Filed: {n.filing_date} · {n.shares.toLocaleString()} shares
                                                </div>
                                            </div>
                                            <div className="rounded-full px-3 py-1 text-xs font-semibold inline-flex items-center gap-1"
                                                 style={{ background: 'rgba(99,102,241,0.10)', color: '#6366F1' }}>
                                                <ArrowUpRight className="w-3 h-3" />
                                                {formatUsd(n.value_usd)}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
