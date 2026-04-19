import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Search, Clock, ChevronRight, ExternalLink, GitCompare,
    Flag, SlidersHorizontal,
} from 'lucide-react';
import { fetchArchiveSnapshots } from '../services/product';
import { WorkspaceEmpty, WorkspaceError, WorkspaceSkeleton } from '../components/workspace/WorkspaceStates';
import type { ArchiveSnapshot as Snapshot, SignalType } from '../types';

interface ArchiveProps { userTier?: 'FREE' | 'UNLOCKED' | 'INSTITUTIONAL'; lightMode?: boolean; onViewReport?(s: Snapshot): void; onUpgrade?: () => void; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sigColor: Record<SignalType, string> = {
    'STRONG BUY': '#10B981', 'BUY': '#34D399', 'NEUTRAL': '#F59E0B', 'SELL': '#EF4444', 'STRONG SELL': '#EF4444',
};
const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ─── Diff row ─────────────────────────────────────────────────────────────────
function DiffRow({
    label,
    oldVal,
    newVal,
    lightMode,
}: {
    label: string;
    oldVal: string | number;
    newVal: string | number;
    lightMode?: boolean;
}) {
    const changed = String(oldVal) !== String(newVal);
    const muted = lightMode ? '#64748B' : '#9CA3AF';
    const quiet = lightMode ? '#94A3B8' : '#6B7280';
    return (
        <div className="flex items-center gap-3 text-xs py-1">
            <span className="w-28 flex-shrink-0" style={{ color: muted }}>{label}</span>
            <span className="font-mono" style={{ color: changed ? '#EF4444' : quiet, textDecoration: changed ? 'line-through' : 'none' }}>
                {oldVal}
            </span>
            {changed && (
                <>
                    <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: muted }} />
                    <span className="font-mono font-semibold" style={{ color: '#10B981' }}>{newVal}</span>
                </>
            )}
        </div>
    );
}

// ─── Compare panel ────────────────────────────────────────────────────────────
function ComparePanel({
    old: o,
    cur: c,
    onClose,
    lightMode,
}: {
    old: Snapshot;
    cur: Snapshot;
    onClose(): void;
    lightMode?: boolean;
}) {
    const muted = lightMode ? '#64748B' : '#9CA3AF';
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            className="rounded-xl p-5 mb-6"
            style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-sm text-indigo-400">
                    Comparing {fmtDate(o.generatedAt)} → Current
                </span>
                <button onClick={onClose} className="text-xs cursor-pointer" style={{ color: muted }}>✕</button>
            </div>
            <DiffRow label="Signal" oldVal={o.signal} newVal={c.signal} lightMode={lightMode} />
            <DiffRow label="Confidence" oldVal={`${o.confidence}%`} newVal={`${c.confidence}%`} lightMode={lightMode} />
            <DiffRow label="Regime" oldVal={o.regime} newVal={c.regime} lightMode={lightMode} />
            <DiffRow label="Engine" oldVal={o.engineVersion} newVal={c.engineVersion} lightMode={lightMode} />
            <DiffRow label="Price" oldVal={`$${o.priceAtGen.toFixed(2)}`} newVal={`$${c.priceAtGen.toFixed(2)}`} lightMode={lightMode} />
        </motion.div>
    );
}

// ─── Timeline item ────────────────────────────────────────────────────────────
function TimelineRow({ snap, isLast, isSelected, onView, onCompare, lightMode }: {
    snap: Snapshot; isLast: boolean; isSelected: boolean;
    onView(): void; onCompare(): void; lightMode?: boolean;
}) {
    const cFill = sigColor[snap.signal];
    const border = isSelected ? `${cFill}50` : lightMode ? '#E5E7EB' : '#1A1A1A';
    const ts = lightMode ? '#6B7280' : '#9CA3AF';
    const iconMuted = lightMode ? '#94A3B8' : '#6B7280';
    const actionStyles = lightMode
        ? {
            background: '#FFFFFF',
            border: '1px solid #D1D5DB',
            color: '#374151',
        }
        : {
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid #1F2937',
            color: '#D1D5DB',
        };

    return (
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
            {/* Spine */}
            <div className="flex flex-col items-center flex-shrink-0 w-6">
                <div className="w-3 h-3 rounded-full flex-shrink-0 mt-3 ring-2"
                    style={{ boxShadow: `0 0 0 2px ${lightMode ? '#FFFFFF' : '#000000'}`, background: cFill }}
                />
                <div className="flex-1 w-px mt-1" style={{ background: isLast ? 'transparent' : lightMode ? '#D1D5DB' : '#1A1A1A' }} />
            </div>
            {/* Card */}
            <div className="bis-section-card flex-1 mb-3 cursor-pointer rounded-[24px] p-4 transition-colors"
                style={{ borderColor: border }}
                onClick={onView}>
                {snap.hasRestatement && (
                    <div className="flex items-center gap-1.5 text-xs p-2 rounded-lg mb-3"
                        style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <Flag className="w-3 h-3 text-red-400" />
                        <span style={{ color: '#FCA5A5' }}>{snap.restatementNote}</span>
                    </div>
                )}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-bold text-xs font-mono" style={{ color: cFill }}>{snap.signal}</span>
                            <span className="text-xs" style={{ color: ts }}>{snap.confidence}% conf</span>
                            <span className="text-xs" style={{ color: ts }}>{snap.regime}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded font-mono"
                                style={{ background: 'rgba(59,130,246,0.08)', color: '#60A5FA' }}>
                                {snap.engineVersion}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs" style={{ color: ts }}>
                            <Clock className="w-3 h-3" />
                            {fmtDate(snap.generatedAt)} · {snap.reportId} · ${snap.priceAtGen.toFixed(2)}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={e => { e.stopPropagation(); onCompare(); }}
                            className="flex items-center gap-1 rounded-full px-3 py-2 text-xs font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm"
                            style={actionStyles}>
                            <GitCompare className="w-3 h-3" />vs Current
                        </button>
                        <a href={snap.url} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 rounded-full px-3 py-2 text-xs font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm"
                            style={actionStyles}>
                            <ExternalLink className="w-3 h-3" />Share
                        </a>
                        <ChevronRight className="w-4 h-4" style={{ color: iconMuted }} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Slider ───────────────────────────────────────────────────────────────────
function TimelineSlider({
    total,
    value,
    onChange,
    lightMode,
}: {
    total: number;
    value: number;
    onChange(v: number): void;
    lightMode?: boolean;
}) {
    const muted = lightMode ? '#64748B' : '#9CA3AF';
    if (total <= 0) {
        return (
            <div className="flex items-center gap-3 text-xs" style={{ color: muted }}>
                <SlidersHorizontal className="w-4 h-4 flex-shrink-0" style={{ color: muted }} />
                No snapshots available yet
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-4 h-4 flex-shrink-0" style={{ color: muted }} />
            <input type="range" min={0} max={total - 1} value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full accent-indigo-500" />
            <span className="text-xs w-20 text-right font-mono" style={{ color: muted }}>
                Showing {total - value} of {total}
            </span>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function Archive({ userTier = 'FREE', lightMode, onViewReport, onUpgrade }: ArchiveProps) {
    const [ticker, setTicker] = useState('NVDA');
    const [query, setQuery] = useState('');
    const [compare, setCompare] = useState<Snapshot | null>(null);
    const [selectedId, setSelected] = useState<string | null>(null);
    const [sliderVal, setSlider] = useState(0);
    const [all, setAll] = useState<Snapshot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        void fetchArchiveSnapshots(ticker, 20, controller.signal)
            .then((snapshots) => {
                if (controller.signal.aborted) return;
                setAll(snapshots);
                setSlider(0);
                setCompare(null);
                setSelected(null);
            })
            .catch((loadError) => {
                if (controller.signal.aborted) return;
                setAll([]);
                setError(loadError instanceof Error ? loadError.message : 'Unable to load Quantus archive');
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [ticker, retryKey]);

    const current = all[0];

    const filtered = useMemo(() => {
        const sliced = all.slice(0, all.length - sliderVal);
        if (!query.trim()) return sliced;
        const q = query.toLowerCase();
        return sliced.filter(s =>
            s.signal.toLowerCase().includes(q) ||
            s.regime.toLowerCase().includes(q) ||
            s.engineVersion.toLowerCase().includes(q) ||
            s.sector.toLowerCase().includes(q)
        );
    }, [all, sliderVal, query]);

    const tp = lightMode ? '#111827' : '#F9FAFB';
    const ts = lightMode ? '#6B7280' : '#9CA3AF';
    const iconMuted = lightMode ? '#94A3B8' : '#9CA3AF';
    const primaryActionStyles = {
        background: lightMode ? 'rgba(37,99,235,0.10)' : 'rgba(96,165,250,0.16)',
        border: `1px solid ${lightMode ? 'rgba(37,99,235,0.18)' : 'rgba(147,197,253,0.24)'}`,
        color: lightMode ? '#1D4ED8' : '#BFDBFE',
        boxShadow: lightMode ? '0 12px 24px -16px rgba(37,99,235,0.35)' : '0 12px 24px -18px rgba(96,165,250,0.45)',
    };

    return (
        <div className="mx-auto max-w-5xl">
            <section className="bis-page-shell px-6 py-8 md:px-10 md:py-10">
                {/* Header */}
                <div className="mb-8">
                    <div className="bis-eyebrow mb-4">
                        <Clock className="w-3.5 h-3.5" />
                        Historical Snapshots
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1 md:text-4xl" style={{ color: tp }}>Historical Archive</h1>
                    <p className="mt-2 text-sm md:text-base" style={{ color: ts }}>
                        Read-only Quantus snapshots with real report IDs and replayable archive routes
                    </p>
                </div>

                {/* Controls */}
                <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Ticker */}
                        <div className="bis-input flex items-center gap-2 px-4 py-3">
                            <span className="text-xs font-bold text-blue-500">TICKER</span>
                            <input value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())}
                                className="bg-transparent text-sm font-mono w-20 focus:outline-none"
                                style={{ color: tp }} placeholder="NVDA" />
                        </div>
                        {/* Semantic search */}
                        <div className="bis-input flex items-center gap-2 px-4 py-3 flex-1 min-w-56">
                            <Search className="w-4 h-4 flex-shrink-0" style={{ color: iconMuted }} />
                            <input value={query} onChange={e => setQuery(e.target.value)}
                                placeholder='"regime change from uptrend…" or "Meridian v2.4"'
                                className="flex-1 bg-transparent text-sm focus:outline-none"
                                style={{ color: tp }} />
                        </div>
                    </div>
                    {/* Timeline slider */}
                    <TimelineSlider total={all.length} value={sliderVal} onChange={setSlider} lightMode={lightMode} />
                </div>

                {error && (
                    <div className="mb-6">
                        <WorkspaceError
                            title="Archive unavailable"
                            message={error}
                            onRetry={() => setRetryKey((value) => value + 1)}
                            lightMode={lightMode}
                        />
                    </div>
                )}

                {/* Compare panel */}
                <AnimatePresence>
                    {compare && current && <ComparePanel old={compare} cur={current} onClose={() => setCompare(null)} lightMode={lightMode} />}
                </AnimatePresence>

                {/* Timeline */}
                {loading ? (
                    <WorkspaceSkeleton rows={4} lightMode={lightMode} variant="list" />
                ) : filtered.map((snap, i) => (
                    <TimelineRow key={snap.reportId} snap={snap}
                        isLast={i === filtered.length - 1}
                        isSelected={snap.reportId === selectedId}
                        onView={() => { setSelected(snap.reportId); onViewReport?.(snap); }}
                        onCompare={() => setCompare(snap)}
                        lightMode={lightMode} />
                ))}

                {!loading && !error && filtered.length === 0 && (
                    <WorkspaceEmpty
                        icon={<Clock className="w-6 h-6" />}
                        title="No archive snapshots match"
                        message="Try a different ticker or search phrase. Archive results populate as Quantus report snapshots are persisted."
                        lightMode={lightMode}
                    />
                )}

                {/* FREE tier CTA */}
                {userTier === 'FREE' && (
                    <div className="bis-section-card mt-8 p-5 text-center">
                        <p className="text-sm font-semibold mb-1" style={{ color: tp }}>Full archive with Unlocked tier</p>
                        <p className="text-xs mb-3" style={{ color: ts }}>PDF export, unlimited history, compare any two snapshots.</p>
                        <button
                            type="button"
                            onClick={onUpgrade}
                            className="rounded-full px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5"
                            style={primaryActionStyles}
                        >
                            Create Free Account →
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
