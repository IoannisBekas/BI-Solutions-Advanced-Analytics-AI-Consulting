import { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus, BarChart3, Award, AlertTriangle, Filter } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Segment = 'signal' | 'engine' | 'regime' | 'sector' | 'market_cap';

interface AccuracyRow {
    label: string;
    count: number;
    avg_return_pct: number;
    avg_excess_pct: number;
    win_rate?: number;
}

interface AccuracyDashboardProps { lightMode?: boolean; }

// ─── Mock accuracy data ───────────────────────────────────────────────────────
const RESOLVED_COUNT = 80;
const ENGINE_INCEPTION = 'June 2024';
const LAST_UPDATED = 'Feb 24, 2026';
const UNLOCK_THRESHOLD = 50;

const MOCK_BY_SIGNAL: AccuracyRow[] = [
    { label: 'STRONG BUY', count: 17, avg_return_pct: 7.1, avg_excess_pct: 5.8, win_rate: 76 },
    { label: 'BUY', count: 18, avg_return_pct: 3.9, avg_excess_pct: 2.4, win_rate: 61 },
    { label: 'NEUTRAL', count: 14, avg_return_pct: 0.8, avg_excess_pct: 0.2, win_rate: 52 },
    { label: 'SELL', count: 16, avg_return_pct: -3.2, avg_excess_pct: -4.6, win_rate: 63 },
    { label: 'STRONG SELL', count: 15, avg_return_pct: -5.9, avg_excess_pct: -7.1, win_rate: 71 },
];
const MOCK_BY_ENGINE: AccuracyRow[] = [
    { label: 'Meridian v2.4', count: 30, avg_return_pct: 4.2, avg_excess_pct: 2.9, win_rate: 67 },
    { label: 'Meridian v2.3', count: 29, avg_return_pct: 3.1, avg_excess_pct: 1.8, win_rate: 61 },
    { label: 'Atlas', count: 21, avg_return_pct: 1.4, avg_excess_pct: 0.3, win_rate: 54 },
];
const MOCK_BY_REGIME: AccuracyRow[] = [
    { label: 'Strong Uptrend', count: 17, avg_return_pct: 8.3, avg_excess_pct: 6.1 },
    { label: 'Uptrend', count: 16, avg_return_pct: 4.1, avg_excess_pct: 2.6 },
    { label: 'Sideways', count: 15, avg_return_pct: 0.4, avg_excess_pct: -0.2 },
    { label: 'Downtrend', count: 15, avg_return_pct: -4.8, avg_excess_pct: -4.1 },
    { label: 'High Volatility', count: 17, avg_return_pct: -1.2, avg_excess_pct: -0.8 },
];
const MOCK_BY_SECTOR: AccuracyRow[] = [
    { label: 'Technology', count: 18, avg_return_pct: 5.2, avg_excess_pct: 3.8 },
    { label: 'Healthcare', count: 16, avg_return_pct: 3.1, avg_excess_pct: 1.7 },
    { label: 'Energy', count: 15, avg_return_pct: 2.8, avg_excess_pct: 1.2 },
    { label: 'Financials', count: 16, avg_return_pct: 1.9, avg_excess_pct: 0.8 },
    { label: 'Consumer', count: 15, avg_return_pct: 0.6, avg_excess_pct: -0.4 },
];
const MOCK_BY_CAP: AccuracyRow[] = [
    { label: 'LARGE', count: 28, avg_return_pct: 3.8, avg_excess_pct: 2.2 },
    { label: 'MID', count: 27, avg_return_pct: 4.6, avg_excess_pct: 2.9 },
    { label: 'SMALL', count: 25, avg_return_pct: 1.8, avg_excess_pct: 0.7 },
];

const SEGMENT_OPTIONS: { value: Segment; label: string }[] = [
    { value: 'signal', label: 'Signal Type' },
    { value: 'engine', label: 'Engine Version' },
    { value: 'regime', label: 'Regime' },
    { value: 'sector', label: 'Sector' },
    { value: 'market_cap', label: 'Market Cap' },
];

const DATA_MAP: Record<Segment, AccuracyRow[]> = {
    signal: MOCK_BY_SIGNAL,
    engine: MOCK_BY_ENGINE,
    regime: MOCK_BY_REGIME,
    sector: MOCK_BY_SECTOR,
    market_cap: MOCK_BY_CAP,
};

// ─── Return chip ──────────────────────────────────────────────────────────────
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

// ─── Bar visual ───────────────────────────────────────────────────────────────
function ReturnBar({ pct, maxAbs }: { pct: number; maxAbs: number }) {
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
            <div className="w-px h-3" style={{ background: '#374151' }} />
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

// ─── Accuracy table ───────────────────────────────────────────────────────────
function AccuracyTable({ rows, showWinRate, lightMode }: { rows: AccuracyRow[]; showWinRate?: boolean; lightMode?: boolean }) {
    const maxAbs = Math.max(...rows.map(r => Math.abs(r.avg_excess_pct)));
    const tp = lightMode ? '#0F172A' : '#F9FAFB';
    const ts = lightMode ? '#475569' : '#9CA3AF';
    const bg = lightMode ? 'rgba(255,255,255,0.9)' : '#111827';
    const border = lightMode ? '#E2E8F0' : '#1F2937';

    return (
        <div className="rounded-xl overflow-hidden" style={{ background: bg, border: `1px solid ${border}` }}>
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
                        <ReturnBar pct={r.avg_excess_pct} maxAbs={maxAbs} />
                        <span className="font-semibold text-xs whitespace-nowrap" style={{ color: tp }}>{r.label}</span>
                    </div>
                    <span className="text-right text-xs font-mono" style={{ color: '#6B7280' }}>{r.count}</span>
                    <span className="text-right"><ReturnChip pct={r.avg_return_pct} /></span>
                    <span className="text-right"><ReturnChip pct={r.avg_excess_pct} /></span>
                    {showWinRate && r.win_rate !== undefined && (
                        <span className="text-right text-xs font-semibold"
                            style={{ color: r.win_rate >= 60 ? '#10B981' : '#F59E0B' }}>
                            {r.win_rate}%
                        </span>
                    )}
                </motion.div>
            ))}
        </div>
    );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export function AccuracyDashboard({ lightMode }: AccuracyDashboardProps) {
    const [segment, setSegment] = useState<Segment>('signal');

    const rows = DATA_MAP[segment];
    const showWinRate = segment === 'signal' || segment === 'engine';

    const bg = lightMode ? '#F0F4FF' : '#0A0D14';
    const tp = lightMode ? '#0F172A' : '#F9FAFB';
    const ts = lightMode ? '#475569' : '#9CA3AF';

    // Gate: hidden until ≥50 resolved signals
    if (RESOLVED_COUNT < UNLOCK_THRESHOLD) {
        return (
            <div style={{ background: bg, minHeight: '100vh', padding: '48px 24px' }} className="flex items-center justify-center">
                <div className="text-center max-w-sm">
                    <BarChart3 className="w-10 h-10 mx-auto mb-4 text-indigo-400" />
                    <h2 className="font-bold text-xl mb-2" style={{ color: tp }}>Track Record Accumulating</h2>
                    <p className="text-sm mb-4" style={{ color: ts }}>
                        Accuracy Dashboard opens when {UNLOCK_THRESHOLD} signals have 30-day outcomes measured.
                    </p>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full"
                            style={{ width: `${(RESOLVED_COUNT / UNLOCK_THRESHOLD) * 100}%`, background: 'linear-gradient(90deg,#6366F1,#8B5CF6)' }} />
                    </div>
                    <p className="text-xs mt-2" style={{ color: '#6B7280' }}>{RESOLVED_COUNT} / {UNLOCK_THRESHOLD}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: bg, minHeight: '100vh', padding: '48px 24px' }}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Award className="w-5 h-5 text-indigo-400" />
                                <span className="text-xs font-semibold px-2 py-1 rounded-full"
                                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818CF8' }}>
                                    Public Signal Track Record · Since {ENGINE_INCEPTION}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold mb-1" style={{ color: tp }}>Quantus Signal Performance</h1>
                            <p className="text-sm" style={{ color: ts }}>
                                {RESOLVED_COUNT} resolved signals · 30-calendar-day measurement · Updated daily · Last updated {LAST_UPDATED}
                            </p>
                        </div>
                        {/* Summary KPIs */}
                        <div className="flex gap-4 flex-wrap">
                            {[
                                { label: 'Avg Return (STRONG BUY)', val: '+7.1%', color: '#10B981' },
                                { label: 'Overall Win Rate', val: '63%', color: '#3B82F6' },
                                { label: 'Best Engine', val: 'Meridian v2.4', color: '#818CF8' },
                            ].map(k => (
                                <div key={k.label} className="text-center px-4 py-3 rounded-xl"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1F2937' }}>
                                    <div className="font-bold text-lg" style={{ color: k.color }}>{k.val}</div>
                                    <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{k.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Methodology note */}
                    <div className="flex items-start gap-2 text-xs p-3 rounded-xl mt-4"
                        style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span style={{ color: '#9CA3AF' }}>
                            Signal measured at report generation time. Outcome measured at 30 calendar days. Benchmark: S&P 500 for Equity/ETF, BTC for Crypto, Gold for Commodity.{' '}
                            <strong style={{ color: '#F59E0B' }}>Past performance does not guarantee future results.</strong>
                        </span>
                    </div>
                </motion.div>

                {/* Segment tabs */}
                <div className="flex items-center gap-2 mb-5 flex-wrap">
                    <Filter className="w-4 h-4" style={{ color: '#6B7280' }} />
                    {SEGMENT_OPTIONS.map(o => (
                        <button key={o.value} onClick={() => setSegment(o.value)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                            style={{
                                background: segment === o.value ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${segment === o.value ? 'rgba(99,102,241,0.4)' : '#1F2937'}`,
                                color: segment === o.value ? '#818CF8' : '#6B7280',
                            }}>
                            {o.label}
                        </button>
                    ))}
                </div>

                {/* Column headers legend */}
                <div className="flex items-center gap-2 text-xs mb-3" style={{ color: '#6B7280' }}>
                    <span>Avg Return = 30-day price change %</span>
                    <span>·</span>
                    <span>Excess = vs benchmark (%)</span>
                    {showWinRate && <><span>·</span><span>Win Rate = % of signals beating benchmark</span></>}
                </div>

                {/* Table */}
                <AccuracyTable rows={rows} showWinRate={showWinRate} lightMode={lightMode} />

                {/* Footer disclaimer */}
                <p className="text-xs text-center mt-8" style={{ color: '#6B7280' }}>
                    Quantus Research Solutions · Not investment advice · bisolutions.group/methodology for full model documentation
                </p>
            </div>
        </div>
    );
}

