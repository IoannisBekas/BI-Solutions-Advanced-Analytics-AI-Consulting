import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus, BarChart3, Award, AlertTriangle, Filter } from 'lucide-react';
import { fetchAccuracySummary } from '../services/product';
import { WorkspaceError, WorkspaceSkeleton } from '../components/workspace/WorkspaceStates';
import type { AccuracyRow, AccuracySummary } from '../types';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type Segment = 'signal' | 'engine' | 'regime' | 'sector' | 'market_cap';

interface AccuracyDashboardProps { lightMode?: boolean; }

const SEGMENT_OPTIONS: { value: Segment; label: string }[] = [
    { value: 'signal', label: 'Signal Type' },
    { value: 'engine', label: 'Engine Version' },
    { value: 'regime', label: 'Regime' },
    { value: 'sector', label: 'Sector' },
    { value: 'market_cap', label: 'Market Cap' },
];

function formatDateLabel(value: string | null) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}


// â”€â”€â”€ Return chip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ReturnChip({ pct }: { pct: number }) {
    const pos = pct > 0;
    const neu = Math.abs(pct) < 0.5;
    return (
        <span className="inline-flex items-center gap-0.5 text-xs font-mono font-semibold"
            style={{ color: neu ? '#F59E0B' : pos ? '#10B981' : '#EF4444' }}>
            {neu ? <Minus className="w-3 h-3" /> : pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {pos && !neu ? '+' : ''}{pct.toFixed(1)}%
        </span>
    );
}

// â”€â”€â”€ Bar visual â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ReturnBar({ pct, maxAbs, lightMode }: { pct: number; maxAbs: number; lightMode?: boolean }) {
    const pctNorm = Math.abs(pct) / maxAbs;
    const pos = pct >= 0;
    return (
        <div className="flex items-center gap-2 flex-1">
            {/* negative side */}
            <div className="flex-1 h-1.5 flex justify-end rounded-l overflow-hidden"
                style={{ background: 'rgba(239,68,68,0.08)' }}>
                {!pos && (
                    <div className="h-full rounded-full"
                        style={{ width: `${pctNorm * 100}%`, background: '#EF4444' }} />
                )}
            </div>
            <div className="w-px h-3" style={{ background: lightMode ? '#CBD5E1' : '#374151' }} />
            {/* positive side */}
            <div className="flex-1 h-1.5 rounded-r overflow-hidden"
                style={{ background: 'rgba(16,185,129,0.08)' }}>
                {pos && (
                    <div className="h-full rounded-full"
                        style={{ width: `${pctNorm * 100}%`, background: '#10B981' }} />
                )}
            </div>
        </div>
    );
}

// â”€â”€â”€ Accuracy table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AccuracyTable({ rows, showWinRate, lightMode }: { rows: AccuracyRow[]; showWinRate?: boolean; lightMode?: boolean }) {
    const maxAbs = Math.max(1, ...rows.map((row) => Math.abs(row.avgExcessPct ?? row.avgReturnPct)));
    const tp = lightMode ? '#111827' : '#F9FAFB';
    const ts = lightMode ? '#6B7280' : '#9CA3AF';
    const border = lightMode ? '#E5E7EB' : '#1A1A1A';
    const muted = lightMode ? '#94A3B8' : '#6B7280';

    return (
        <div className="bis-section-card rounded-[24px] overflow-hidden" style={{ borderColor: border }}>
            {/* Header */}
            <div className="grid gap-2 px-4 py-3 text-xs font-semibold"
                style={{ gridTemplateColumns: showWinRate ? '1fr 48px 80px 80px 120px' : '1fr 48px 80px 80px', color: ts, borderBottom: `1px solid ${border}` }}>
                <span>Segment</span><span className="text-right">n</span>
                <span className="text-right">Avg Return</span>
                <span className="text-right">Excess</span>
                {showWinRate && <span className="text-right">Win Rate</span>}
            </div>
            {rows.map((r, i) => (
                <motion.div key={r.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="grid gap-2 px-4 py-3 items-center text-sm"
                    style={{ gridTemplateColumns: showWinRate ? '1fr 48px 80px 80px 120px' : '1fr 48px 80px 80px', borderBottom: i < rows.length - 1 ? `1px solid ${border}` : 'none' }}>
                    <div className="flex items-center gap-2">
                        <ReturnBar pct={r.avgExcessPct ?? r.avgReturnPct} maxAbs={maxAbs} lightMode={lightMode} />
                        <span className="font-semibold text-xs whitespace-nowrap" style={{ color: tp }}>{r.label}</span>
                    </div>
                    <span className="text-right text-xs font-mono" style={{ color: ts }}>{r.count}</span>
                    <span className="text-right"><ReturnChip pct={r.avgReturnPct} /></span>
                    <span className="text-right">
                        {r.avgExcessPct == null ? <span className="text-xs" style={{ color: muted }}>N/A</span> : <ReturnChip pct={r.avgExcessPct} />}
                    </span>
                    {showWinRate && r.winRate != null && (
                        <span className="text-right text-xs font-semibold"
                            style={{ color: r.winRate >= 60 ? '#10B981' : '#F59E0B' }}>
                            {r.winRate.toFixed(0)}%
                        </span>
                    )}
                </motion.div>
            ))}
        </div>
    );
}

// â”€â”€â”€ Main dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function AccuracyDashboard({ lightMode }: AccuracyDashboardProps) {
    const [segment, setSegment] = useState<Segment>('signal');
    const [summary, setSummary] = useState<AccuracySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        void fetchAccuracySummary(controller.signal)
            .then((data) => {
                if (controller.signal.aborted) return;
                setSummary(data);
            })
            .catch((loadError) => {
                if (controller.signal.aborted) return;
                setError(loadError instanceof Error ? loadError.message : 'Unable to load Quantus accuracy metrics');
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [retryKey]);

    const rows = useMemo(() => {
        if (!summary) return [] as AccuracyRow[];
        return ({
            signal: summary.bySignal,
            engine: summary.byEngine,
            regime: summary.byRegime,
            sector: summary.bySector,
            market_cap: summary.byMarketCap,
        }[segment] ?? []) as AccuracyRow[];
    }, [segment, summary]);
    const showWinRate = segment === 'signal' || segment === 'engine';

    const tp = lightMode ? '#111827' : '#F9FAFB';
    const ts = lightMode ? '#6B7280' : '#9CA3AF';
    const muted = lightMode ? '#94A3B8' : '#6B7280';

    if (loading) {
        return (
            <div className="mx-auto max-w-5xl">
                <div className="bis-page-shell px-6 py-8 md:px-10 md:py-10">
                    <div className="mb-6 space-y-3">
                        <div className="h-4 w-36 skeleton" />
                        <h1 className="sr-only">Quantus Signal Performance</h1>
                        <div className="h-8 w-72 skeleton" />
                        <div className="h-3 w-full max-w-xl skeleton" />
                    </div>
                    <WorkspaceSkeleton rows={3} lightMode={lightMode} />
                </div>
            </div>
        );
    }

    if (error || !summary) {
        return (
            <div className="mx-auto max-w-5xl">
                <div className="bis-page-shell px-6 py-8 md:px-10 md:py-10">
                    <div className="mb-6">
                        <div className="bis-eyebrow mb-4">
                            <Award className="w-3.5 h-3.5" />
                            Accuracy
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ color: tp }}>
                            Quantus Signal Performance
                        </h1>
                    </div>
                    <WorkspaceError
                        title="Accuracy dashboard unavailable"
                        message={error ?? 'Quantus accuracy metrics are unavailable right now.'}
                        onRetry={() => setRetryKey((value) => value + 1)}
                        lightMode={lightMode}
                    />
                </div>
            </div>
        );
    }

    // Gate: hidden until the persisted outcome table has enough resolved rows
    if (summary.resolvedCount < summary.unlockThreshold) {
        return (
            <div className="mx-auto max-w-5xl">
                <div className="bis-page-shell flex items-center justify-center px-6 py-16 text-center">
                    <div className="max-w-sm">
                    <BarChart3 className="w-10 h-10 mx-auto mb-4 text-indigo-400" />
                    <h1 className="font-bold text-xl mb-2" style={{ color: tp }}>Track Record Accumulating</h1>
                    <p className="text-sm mb-4" style={{ color: ts }}>
                        Accuracy Dashboard opens when {summary.unlockThreshold} persisted Quantus snapshots have resolved outcomes.
                    </p>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: lightMode ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full"
                            style={{ width: `${Math.min(100, (summary.resolvedCount / Math.max(1, summary.unlockThreshold)) * 100)}%`, background: 'linear-gradient(90deg,#2563EB,#60A5FA)' }} />
                    </div>
                    <p className="text-xs mt-2" style={{ color: ts }}>{summary.resolvedCount} / {summary.unlockThreshold} resolved - {summary.pendingCount} pending</p>
                    <div
                        className="mt-5 rounded-[24px] border px-4 py-4 text-left"
                        style={{
                            background: lightMode ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.03)',
                            borderColor: lightMode ? '#E2E8F0' : '#1A1A1A',
                        }}
                    >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: muted }}>
                            Preview
                        </p>
                        <div className="mt-3 space-y-2">
                            {[
                                { ticker: 'N***', outcome: '+6.8%', verdict: 'Resolved buy' },
                                { ticker: 'T***', outcome: '-4.1%', verdict: 'Resolved sell' },
                            ].map((row) => (
                                <div
                                    key={row.ticker}
                                    className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2"
                                    style={{ background: lightMode ? 'rgba(248,250,252,0.9)' : 'rgba(255,255,255,0.04)' }}
                                >
                                    <div>
                                        <div className="font-semibold" style={{ color: tp }}>{row.ticker}</div>
                                        <div className="text-xs" style={{ color: ts }}>{row.verdict}</div>
                                    </div>
                                    <div className="font-mono font-semibold" style={{ color: '#10B981' }}>{row.outcome}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl">
            <section className="bis-page-shell px-6 py-8 md:px-10 md:py-10">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <div className="bis-eyebrow mb-4">
                                <Award className="w-3.5 h-3.5" />
                                <span>
                                    Public Signal Track Record - Since {formatDateLabel(summary.engineInception) ?? 'first stored snapshot'}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ color: tp }}>Quantus Signal Performance</h1>
                            <p className="mt-2 text-sm md:text-base" style={{ color: ts }}>
                                {summary.resolvedCount} resolved outcomes - {summary.pendingCount} pending - Last updated {formatDateLabel(summary.lastUpdated) ?? 'not yet available'}
                            </p>
                        </div>
                        {/* Summary KPIs */}
                        <div className="grid gap-3 sm:grid-cols-3">
                            {[
                                {
                                    label: 'Avg Return',
                                    val: summary.overallAvgReturnPct != null ? `${summary.overallAvgReturnPct > 0 ? '+' : ''}${summary.overallAvgReturnPct.toFixed(1)}%` : 'N/A',
                                    color: '#10B981',
                                },
                                {
                                    label: 'Overall Win Rate',
                                    val: summary.overallWinRate != null ? `${summary.overallWinRate.toFixed(0)}%` : 'N/A',
                                    color: '#3B82F6',
                                },
                                { label: 'Best Engine', val: summary.bestEngine ?? 'Accumulating', color: '#818CF8' },
                            ].map(k => (
                                <div key={k.label} className="bis-section-card min-w-[140px] px-5 py-4 text-center">
                                    <div className="font-bold text-lg" style={{ color: k.color }}>{k.val}</div>
                                    <div className="mt-1 text-xs" style={{ color: ts }}>{k.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Methodology note */}
                    <div className="bis-note mt-5 flex items-start gap-2 p-4 text-xs text-amber-700">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span style={{ color: ts }}>
                            {summary.methodologyNote}{' '}
                            <strong style={{ color: '#F59E0B' }}>Past performance does not guarantee future results.</strong>
                        </span>
                    </div>
                </motion.div>

                {/* Segment tabs */}
                <div className="flex items-center gap-2 mb-5 flex-wrap">
                    <Filter className="w-4 h-4" style={{ color: muted }} />
                    {SEGMENT_OPTIONS.map(o => (
                        <button key={o.value} onClick={() => setSegment(o.value)}
                            className={`tab-btn rounded-full border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${segment === o.value ? 'active' : ''}`}>
                            {o.label}
                        </button>
                    ))}
                </div>

                {/* Column headers legend */}
                <div className="flex items-center gap-2 text-xs mb-3" style={{ color: ts }}>
                    <span>Avg Return = 30-day price change %</span>
                    <span>-</span>
                    <span>Excess = vs benchmark (%)</span>
                    {showWinRate && <><span>-</span><span>Win Rate = % of signals beating benchmark</span></>}
                </div>

                {/* Table */}
                <AccuracyTable rows={rows} showWinRate={showWinRate} lightMode={lightMode} />

                {/* Footer disclaimer */}
                <p className="mt-8 text-center text-xs" style={{ color: ts }}>
                    Quantus Research Solutions - Not investment advice - www.bisolutions.group/methodology for full model documentation
                </p>
            </section>
        </div>
    );
}
