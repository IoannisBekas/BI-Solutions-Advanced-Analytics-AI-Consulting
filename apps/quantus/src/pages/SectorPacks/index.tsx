import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, FileText, Download, ArrowUpDown, RefreshCw } from 'lucide-react';
import {
    WorkspaceEmpty,
    WorkspaceError,
    WorkspaceSkeleton,
} from '../../components/workspace/WorkspaceStates';
import { WorkspacePaywall } from '../../components/workspace/WorkspacePaywall';
import {
    fetchSectorCatalog,
    fetchSectorDigest,
    type SectorCatalog,
    type SectorDigestEntry,
    type PremiumError,
} from '../../services/premiumFeatures';

type SortKey = 'confidence' | 'signal' | 'ticker';

const SIGNAL_ORDER: Record<string, number> = {
    'STRONG BUY': 5,
    BUY: 4,
    NEUTRAL: 3,
    SELL: 2,
    'STRONG SELL': 1,
};

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
        actionShadow: lightMode
            ? '0 12px 24px -16px rgba(37,99,235,0.35)'
            : '0 12px 24px -18px rgba(96,165,250,0.45)',
    };
}

function signalTone(signal: string) {
    if (signal === 'STRONG BUY') return { bg: 'rgba(16,185,129,0.12)', color: '#10B981', border: 'rgba(16,185,129,0.28)' };
    if (signal === 'BUY')        return { bg: 'rgba(52,211,153,0.10)', color: '#059669', border: 'rgba(52,211,153,0.24)' };
    if (signal === 'NEUTRAL')    return { bg: 'rgba(245,158,11,0.10)', color: '#D97706', border: 'rgba(245,158,11,0.24)' };
    if (signal === 'SELL')       return { bg: 'rgba(239,68,68,0.10)', color: '#DC2626', border: 'rgba(239,68,68,0.24)' };
    if (signal === 'STRONG SELL') return { bg: 'rgba(239,68,68,0.16)', color: '#DC2626', border: 'rgba(239,68,68,0.32)' };
    return { bg: 'rgba(107,114,128,0.10)', color: '#6B7280', border: 'rgba(107,114,128,0.24)' };
}

interface Props {
    onSelectTicker?: (ticker: string) => void;
    onUpgrade?: () => void;
    lightMode?: boolean;
}

export default function SectorPacksDashboard({ onSelectTicker, onUpgrade, lightMode }: Props) {
    const [catalog, setCatalog] = useState<SectorCatalog | null>(null);
    const [catalogError, setCatalogError] = useState<string | null>(null);
    const [selectedSector, setSelectedSector] = useState<string | null>(null);

    const [digest, setDigest] = useState<{
        sector: string;
        generated_at: string;
        results: SectorDigestEntry[];
    } | null>(null);
    const [digestLoading, setDigestLoading] = useState(false);
    const [digestError, setDigestError] = useState<PremiumError | Error | null>(null);

    const [sortBy, setSortBy] = useState<SortKey>('confidence');
    const [retryKey, setRetryKey] = useState(0);

    const palette = useTheme(lightMode);
    const { textPrimary, textSecondary, textMuted, border, cardBg, dimBg, pillBg, actionBg, actionText, actionBorder, actionShadow } = palette;

    // Initial: load catalog
    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            try {
                const data = await fetchSectorCatalog(controller.signal);
                setCatalog(data);
                if (!selectedSector && data.sectors.length > 0) {
                    setSelectedSector(data.sectors[0]!.sector);
                }
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') return;
                setCatalogError(err instanceof Error ? err.message : 'Unknown error');
            }
        })();
        return () => controller.abort();
    }, [retryKey]);

    // Fetch the digest whenever the selected sector changes
    useEffect(() => {
        if (!selectedSector) return;
        const controller = new AbortController();
        setDigestLoading(true);
        setDigestError(null);
        (async () => {
            try {
                const data = await fetchSectorDigest(selectedSector, controller.signal);
                setDigest({ sector: data.sector, generated_at: data.generated_at, results: data.results });
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') return;
                setDigestError(err instanceof Error ? err : new Error('Unknown error'));
                setDigest(null);
            } finally {
                if (!controller.signal.aborted) setDigestLoading(false);
            }
        })();
        return () => controller.abort();
    }, [selectedSector, retryKey]);

    const sortedReports = useMemo(() => {
        if (!digest?.results) return [];
        const sorted = [...digest.results];
        switch (sortBy) {
            case 'confidence':
                return sorted.sort((a, b) => b.confidence_score - a.confidence_score);
            case 'signal':
                return sorted.sort((a, b) => (SIGNAL_ORDER[b.overall_signal] ?? 0) - (SIGNAL_ORDER[a.overall_signal] ?? 0));
            case 'ticker':
                return sorted.sort((a, b) => a.ticker.localeCompare(b.ticker));
            default:
                return sorted;
        }
    }, [digest, sortBy]);

    const handleUpgrade = useCallback(() => {
        if (onUpgrade) onUpgrade();
    }, [onUpgrade]);

    const paywallTier = (digestError as PremiumError | null)?.requiredTier ?? 'INSTITUTIONAL';
    const paywallCurrent = (digestError as PremiumError | null)?.currentTier ?? catalog?.user_tier ?? 'FREE';
    const isPaywalled = (digestError as PremiumError | null)?.status === 402;

    return (
        <section className="bis-page-shell relative px-6 py-8 md:px-10 md:py-10">
            <div className="relative z-10 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                    <div className="flex-1 min-w-0">
                        <span className="bis-eyebrow">
                            <Shield className="w-3.5 h-3.5" />
                            Institutional tier · $100/mo
                        </span>
                        <h1 className="mt-3 text-3xl md:text-4xl font-heading font-semibold tracking-tight" style={{ color: textPrimary }}>
                            Sector Packs
                        </h1>
                        <p className="mt-3 text-sm md:text-base leading-relaxed max-w-2xl" style={{ color: textSecondary }}>
                            Top-20 institutional teardowns per sector, ranked by Meridian v2.4 confidence. Sector-level
                            briefings refreshed continuously off the live workspace cache.
                        </p>
                    </div>
                    <button
                        onClick={() => window.print()}
                        aria-label="Download digest"
                        className="inline-flex items-center gap-2 self-start px-4 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-[1.02]"
                        style={{ background: actionBg, color: actionText, border: `1px solid ${actionBorder}`, boxShadow: actionShadow }}
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden md:inline">Save / print digest</span>
                    </button>
                </div>

                {/* Sector selector */}
                {catalogError ? (
                    <WorkspaceError
                        title="Unable to load sector catalog"
                        message={catalogError}
                        onRetry={() => setRetryKey((k) => k + 1)}
                        lightMode={lightMode}
                    />
                ) : !catalog ? (
                    <WorkspaceSkeleton rows={6} lightMode={lightMode} />
                ) : (
                    <>
                        <div className="overflow-x-auto pb-5 scrollbar-none" style={{ borderBottom: `1px solid ${border}` }}>
                            <div className="flex w-max flex-nowrap gap-2">
                                {catalog.sectors.map((entry) => {
                                    const active = selectedSector === entry.sector;
                                    return (
                                        <button
                                            key={entry.sector}
                                            onClick={() => setSelectedSector(entry.sector)}
                                            className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                                            style={{
                                                background: active ? (lightMode ? '#09090B' : '#F0F6FF') : pillBg,
                                                color: active ? (lightMode ? '#FFFFFF' : '#09090B') : textSecondary,
                                                border: `1px solid ${active ? 'transparent' : border}`,
                                            }}
                                        >
                                            {entry.sector}
                                            <span className="ml-2 text-[10px] opacity-70">{entry.ticker_count}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {digestLoading ? (
                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <WorkspaceSkeleton rows={8} lightMode={lightMode} />
                                </motion.div>
                            ) : isPaywalled ? (
                                <motion.div key="paywall" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <WorkspacePaywall
                                        requiredTier={paywallTier as 'UNLOCKED' | 'INSTITUTIONAL'}
                                        currentTier={paywallCurrent}
                                        featureName="Sector Packs digests"
                                        bullets={[
                                            'Top-20 ranked teardowns for every GICS sector',
                                            'Weekly emailed PDFs delivered to your inbox',
                                            'Insider, 13F, and earnings AI briefings included',
                                            'Cancel anytime — usage stays in your archive',
                                        ]}
                                        onUpgrade={handleUpgrade}
                                        lightMode={lightMode}
                                    />
                                </motion.div>
                            ) : digestError ? (
                                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <WorkspaceError
                                        title="Digest unavailable"
                                        message={digestError.message || 'The sector digest could not be loaded.'}
                                        onRetry={() => setRetryKey((k) => k + 1)}
                                        lightMode={lightMode}
                                    />
                                </motion.div>
                            ) : digest && digest.results.length > 0 ? (
                                <motion.div key="data" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                                        <h2 className="text-xl font-heading font-semibold tracking-tight" style={{ color: textPrimary }}>
                                            {digest.sector} · Top {digest.results.length}
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <ArrowUpDown className="w-3.5 h-3.5" style={{ color: textMuted }} />
                                            <span className="text-[11px] uppercase tracking-[0.18em] mr-1" style={{ color: textMuted }}>Sort</span>
                                            {(['confidence', 'signal', 'ticker'] as SortKey[]).map((key) => {
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
                                        <span
                                            className="text-[11px] px-3 py-1 rounded-full uppercase tracking-[0.16em]"
                                            style={{ background: dimBg, border: `1px solid ${border}`, color: textMuted }}
                                        >
                                            Updated {new Date(digest.generated_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                        </span>
                                    </div>

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
                                                        boxShadow: lightMode ? '0 1px 2px rgba(15,23,42,0.04)' : '0 2px 8px rgba(0,0,0,0.25)',
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between gap-3 mb-3">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0"
                                                                    style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6' }}
                                                                >
                                                                    {report.ticker.slice(0, 2)}
                                                                </span>
                                                                <div className="min-w-0">
                                                                    <div className="font-heading font-bold text-base tracking-tight truncate" style={{ color: textPrimary }}>
                                                                        {report.ticker}
                                                                    </div>
                                                                    <div className="text-xs truncate" style={{ color: textSecondary }} title={report.company_name}>
                                                                        {report.company_name || '—'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span
                                                            className="text-[10px] uppercase font-bold px-2 py-1 rounded-md whitespace-nowrap flex-shrink-0"
                                                            style={{ background: tone.bg, color: tone.color, border: `1px solid ${tone.border}` }}
                                                        >
                                                            {report.overall_signal}
                                                        </span>
                                                    </div>

                                                    <div className="mb-3">
                                                        <div className="flex items-center justify-between text-[11px] mb-1.5" style={{ color: textMuted }}>
                                                            <span className="uppercase tracking-[0.16em]">Confidence</span>
                                                            <span className="font-mono font-semibold" style={{ color: textPrimary }}>{conf}%</span>
                                                        </div>
                                                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: dimBg }}>
                                                            <div className="h-full rounded-full transition-all" style={{ width: `${conf}%`, background: tone.color, opacity: 0.8 }} />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between text-xs pt-3" style={{ borderTop: `1px solid ${border}`, color: textSecondary }}>
                                                        <span>Regime</span>
                                                        <span className="font-medium truncate ml-2" style={{ color: textPrimary }}>
                                                            {report.regime_label}
                                                        </span>
                                                    </div>

                                                    {report.early_insight && (
                                                        <p className="mt-3 text-xs leading-relaxed line-clamp-3" style={{ color: textSecondary }}>
                                                            {report.early_insight}
                                                        </p>
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <WorkspaceEmpty
                                        icon={<FileText className="w-6 h-6" />}
                                        title={`${selectedSector ?? 'This sector'} has no live coverage yet`}
                                        message="The Meridian batch hasn’t cached any reports for this sector. Try another sector or check back after the next refresh."
                                        cta={{ label: 'Try again', onClick: () => setRetryKey((k) => k + 1) }}
                                        lightMode={lightMode}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}

                {/* Footer note */}
                <div className="text-[11px] uppercase tracking-[0.16em] text-center" style={{ color: textMuted }}>
                    <RefreshCw className="inline w-3 h-3 mr-1.5 -translate-y-0.5" />
                    Backed by the live Quantus cache · {catalog?.user_tier ?? 'FREE'} tier
                </div>
            </div>
        </section>
    );
}
