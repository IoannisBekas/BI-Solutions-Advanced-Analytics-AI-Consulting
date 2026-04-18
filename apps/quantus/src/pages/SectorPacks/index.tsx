import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, FileText, Download, AlertTriangle, ArrowUpDown, RefreshCw } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
interface SectorReport {
    ticker: string;
    company_name: string;
    overall_signal: 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL';
    confidence_score: number;
    regime: { label: string };
    executive_summary?: {
        narrative_plain?: string;
        narrative_technical?: string;
    };
}

interface SectorPackData {
    sector: string;
    tier_access: 'authorized' | 'unauthorized';
    generated_at: string;
    reports: SectorReport[];
}

type SortKey = 'confidence' | 'signal' | 'ticker';

const SIGNAL_ORDER: Record<string, number> = {
    'STRONG BUY': 5, 'BUY': 4, 'NEUTRAL': 3, 'SELL': 2, 'STRONG SELL': 1,
};

const SECTORS = [
    'Technology', 'Healthcare', 'Financials', 'Energy', 'Consumer',
    'Industrials', 'Materials', 'Utilities', 'Real Estate', 'Communications',
];

// ─── Theming helpers ────────────────────────────────────────────────────────
function useTheme(lightMode?: boolean) {
    return {
        textPrimary: lightMode ? '#0F172A' : '#F0F6FF',
        textSecondary: lightMode ? '#475569' : '#9CA3AF',
        textMuted: lightMode ? '#94A3B8' : '#6B7280',
        border: lightMode ? '#E2E8F0' : '#1A1A1A',
        borderSoft: lightMode ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.06)',
        cardBg: lightMode ? 'rgba(255,255,255,0.98)' : 'rgba(17,24,39,0.96)',
        dimBg: lightMode ? 'rgba(15,23,42,0.03)' : 'rgba(255,255,255,0.03)',
        pillBg: lightMode ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.55)',
        actionBg: lightMode ? 'rgba(37,99,235,0.10)' : 'rgba(96,165,250,0.16)',
        actionText: lightMode ? '#1D4ED8' : '#BFDBFE',
        actionBorder: lightMode ? 'rgba(37,99,235,0.18)' : 'rgba(147,197,253,0.24)',
        actionShadow: lightMode ? '0 12px 24px -16px rgba(37,99,235,0.35)' : '0 12px 24px -18px rgba(96,165,250,0.45)',
    };
}

function signalTone(signal: string) {
    if (signal === 'STRONG BUY') return { bg: 'rgba(16,185,129,0.12)', color: '#10B981', border: 'rgba(16,185,129,0.28)' };
    if (signal === 'BUY')        return { bg: 'rgba(52,211,153,0.10)', color: '#059669', border: 'rgba(52,211,153,0.24)' };
    if (signal === 'NEUTRAL')    return { bg: 'rgba(245,158,11,0.10)', color: '#D97706', border: 'rgba(245,158,11,0.24)' };
    if (signal === 'SELL')       return { bg: 'rgba(239,68,68,0.10)', color: '#DC2626', border: 'rgba(239,68,68,0.24)' };
    if (signal === 'STRONG SELL')return { bg: 'rgba(239,68,68,0.16)', color: '#DC2626', border: 'rgba(239,68,68,0.32)' };
    return { bg: 'rgba(107,114,128,0.10)', color: '#6B7280', border: 'rgba(107,114,128,0.24)' };
}

// ─── Skeleton card ──────────────────────────────────────────────────────────
function SkeletonCard({ lightMode }: { lightMode?: boolean }) {
    const { cardBg, border } = useTheme(lightMode);
    return (
        <div className="rounded-2xl p-4 h-44" style={{ background: cardBg, border: `1px solid ${border}` }}>
            <div className="h-4 rounded skeleton mb-3" style={{ width: '40%' }} />
            <div className="h-2.5 rounded skeleton mb-4" style={{ width: '70%' }} />
            <div className="h-2.5 rounded skeleton mb-2" style={{ width: '55%' }} />
            <div className="h-2.5 rounded skeleton" style={{ width: '35%' }} />
        </div>
    );
}

interface Props {
    onSelectTicker?: (ticker: string) => void;
    onUpgrade?: () => void;
    lightMode?: boolean;
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function SectorPacksDashboard({ onSelectTicker, onUpgrade, lightMode }: Props) {
    const [selectedSector, setSelectedSector] = useState('Technology');
    const [data, setData] = useState<SectorPackData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortKey>('confidence');
    const [retryKey, setRetryKey] = useState(0);

    const { textPrimary, textSecondary, textMuted, border, cardBg, dimBg, pillBg, actionBg, actionText, actionBorder, actionShadow } = useTheme(lightMode);

    const sortedReports = useMemo(() => {
        if (!data?.reports) return [];
        const sorted = [...data.reports];
        switch (sortBy) {
            case 'confidence': return sorted.sort((a, b) => b.confidence_score - a.confidence_score);
            case 'signal':     return sorted.sort((a, b) => (SIGNAL_ORDER[b.overall_signal] ?? 0) - (SIGNAL_ORDER[a.overall_signal] ?? 0));
            case 'ticker':     return sorted.sort((a, b) => a.ticker.localeCompare(b.ticker));
            default:           return sorted;
        }
    }, [data?.reports, sortBy]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchSectorData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/quantus/api/v1/sectors/${selectedSector}/reports`, {
                    signal: controller.signal,
                });
                if (!response.ok) {
                    let message = 'Failed to fetch sector data';
                    try {
                        const body = await response.json();
                        if (body?.error) message = body.error;
                    } catch { /* ignore */ }
                    throw new Error(message);
                }
                const result = await response.json();
                if (!result || typeof result.sector !== 'string' || !Array.isArray(result.reports)) {
                    throw new Error('Invalid sector pack payload');
                }
                setData(result as SectorPackData);
            } catch (err: unknown) {
                if (err instanceof DOMException && err.name === 'AbortError') return;
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchSectorData();
        return () => controller.abort();
    }, [selectedSector, retryKey]);

    return (
        <section className="bis-page-shell relative px-6 py-8 md:px-10 md:py-10">
            <div className="relative z-10 max-w-7xl mx-auto space-y-8">
                {/* ── Header ─────────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bis-eyebrow">
                                <Shield className="w-3.5 h-3.5" />
                                Institutional tier
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-heading font-semibold tracking-tight" style={{ color: textPrimary }}>
                            Sector Packs
                        </h1>
                        <p className="mt-3 text-sm md:text-base leading-relaxed max-w-2xl" style={{ color: textSecondary }}>
                            Pre-generated institutional teardowns for the top 20 tickers in each sector.
                            Refreshed every 96 hours via the Meridian v2.4 batch engine.
                        </p>
                    </div>

                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-[1.02]"
                        style={{
                            background: actionBg,
                            color: actionText,
                            border: `1px solid ${actionBorder}`,
                            boxShadow: actionShadow,
                        }}
                    >
                        <Download className="w-4 h-4" />
                        Download PDF Digest
                    </button>
                </div>

                {/* ── Sector selector ─────────────────────────────────── */}
                <div className="flex flex-wrap gap-2 pb-5" style={{ borderBottom: `1px solid ${border}` }}>
                    {SECTORS.map(sector => {
                        const active = selectedSector === sector;
                        return (
                            <button
                                key={sector}
                                onClick={() => setSelectedSector(sector)}
                                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                                style={{
                                    background: active
                                        ? (lightMode ? '#09090B' : '#F0F6FF')
                                        : pillBg,
                                    color: active
                                        ? (lightMode ? '#FFFFFF' : '#09090B')
                                        : textSecondary,
                                    border: `1px solid ${active ? 'transparent' : border}`,
                                }}
                            >
                                {sector}
                            </button>
                        );
                    })}
                </div>

                {/* ── Content ─────────────────────────────────────────── */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => <SkeletonCard key={i} lightMode={lightMode} />)}
                        </motion.div>
                    ) : error ? (
                        <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="rounded-2xl p-6 flex items-start gap-4"
                            style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.22)' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                 style={{ background: 'rgba(239,68,68,0.12)', color: '#DC2626' }}>
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm mb-1" style={{ color: textPrimary }}>
                                    Unable to load {selectedSector} sector pack
                                </div>
                                <p className="text-sm" style={{ color: textSecondary }}>
                                    {error}. The Meridian batch engine may still be warming up — this view will reappear once coverage
                                    is cached on the server.
                                </p>
                                <button
                                    onClick={() => setRetryKey(k => k + 1)}
                                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-80"
                                    style={{ background: dimBg, border: `1px solid ${border}`, color: textPrimary }}
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Try again
                                </button>
                            </div>
                        </motion.div>
                    ) : data && data.tier_access === 'authorized' ? (
                        <motion.div key="data" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            {/* Toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                                <h2 className="text-xl font-heading font-semibold tracking-tight" style={{ color: textPrimary }}>
                                    {selectedSector} · Top 20
                                </h2>
                                <div className="flex items-center gap-2">
                                    <ArrowUpDown className="w-3.5 h-3.5" style={{ color: textMuted }} />
                                    <span className="text-[11px] uppercase tracking-[0.18em] mr-1" style={{ color: textMuted }}>Sort</span>
                                    {(['confidence', 'signal', 'ticker'] as SortKey[]).map(key => {
                                        const active = sortBy === key;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setSortBy(key)}
                                                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                                                style={{
                                                    background: active ? (lightMode ? '#09090B' : '#F0F6FF') : pillBg,
                                                    color: active ? (lightMode ? '#FFFFFF' : '#09090B') : textSecondary,
                                                    border: `1px solid ${active ? 'transparent' : border}`,
                                                }}
                                            >
                                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                            </button>
                                        );
                                    })}
                                </div>
                                <span className="text-[11px] px-3 py-1 rounded-full uppercase tracking-[0.16em]"
                                      style={{ background: dimBg, border: `1px solid ${border}`, color: textMuted }}>
                                    Updated {new Date(data.generated_at).toLocaleString(undefined, {
                                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                                    })}
                                </span>
                            </div>

                            {/* Cards grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {sortedReports.map((report, idx) => {
                                    const tone = signalTone(report.overall_signal);
                                    const conf = Math.max(0, Math.min(100, report.confidence_score));
                                    return (
                                        <motion.button
                                            key={`${report.ticker}-${idx}`}
                                            type="button"
                                            onClick={() => onSelectTicker?.(report.ticker)}
                                            whileHover={{ y: -3 }}
                                            transition={{ duration: 0.2 }}
                                            className="group text-left rounded-2xl p-4 transition-all hover:shadow-lg"
                                            style={{
                                                background: cardBg,
                                                border: `1px solid ${border}`,
                                                boxShadow: lightMode
                                                    ? '0 1px 2px rgba(15,23,42,0.04)'
                                                    : '0 2px 8px rgba(0,0,0,0.25)',
                                            }}
                                        >
                                            {/* Ticker + signal badge */}
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 text-blue-500"
                                                              style={{ background: 'rgba(59,130,246,0.12)' }}>
                                                            {report.ticker.slice(0, 2)}
                                                        </span>
                                                        <div className="min-w-0">
                                                            <div className="font-heading font-bold text-base tracking-tight group-hover:text-blue-500 transition-colors truncate"
                                                                 style={{ color: textPrimary }}>
                                                                {report.ticker}
                                                            </div>
                                                            <div className="text-xs truncate" style={{ color: textSecondary }}
                                                                 title={report.company_name}>
                                                                {report.company_name || '—'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-md whitespace-nowrap flex-shrink-0"
                                                      style={{ background: tone.bg, color: tone.color, border: `1px solid ${tone.border}` }}>
                                                    {report.overall_signal}
                                                </span>
                                            </div>

                                            {/* Confidence bar */}
                                            <div className="mb-3">
                                                <div className="flex items-center justify-between text-[11px] mb-1.5" style={{ color: textMuted }}>
                                                    <span className="uppercase tracking-[0.16em]">Confidence</span>
                                                    <span className="font-mono font-semibold" style={{ color: textPrimary }}>{conf}%</span>
                                                </div>
                                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: dimBg }}>
                                                    <div className="h-full rounded-full transition-all"
                                                         style={{ width: `${conf}%`, background: tone.color, opacity: 0.8 }} />
                                                </div>
                                            </div>

                                            {/* Regime */}
                                            <div className="flex items-center justify-between text-xs pt-3"
                                                 style={{ borderTop: `1px solid ${border}`, color: textSecondary }}>
                                                <span>Regime</span>
                                                <span className="font-medium truncate ml-2" style={{ color: textPrimary }}>
                                                    {report.regime.label}
                                                </span>
                                            </div>

                                            {/* Hover hint */}
                                            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-500 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all">
                                                <FileText className="w-3 h-3" />
                                                Open full report
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="locked" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center text-center py-20 rounded-2xl"
                            style={{ background: dimBg, border: `1px dashed ${border}` }}>
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                                 style={{ background: lightMode ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.15)', color: '#6366F1' }}>
                                <Lock className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-heading font-semibold mb-2" style={{ color: textPrimary }}>Upgrade required</h3>
                            <p className="text-sm max-w-md" style={{ color: textSecondary }}>
                                Your current tier does not include the {selectedSector} Sector Pack. Institutional subscribers unlock
                                20 automated teardowns per sector, refreshed every 96 hours.
                            </p>
                            <button
                                onClick={onUpgrade}
                                className="mt-6 px-6 py-2 rounded-full text-sm font-semibold transition-all hover:scale-[1.02]"
                                style={{
                                    background: actionBg,
                                    color: actionText,
                                    border: `1px solid ${actionBorder}`,
                                    boxShadow: actionShadow,
                                }}
                            >
                                View pricing plans
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
