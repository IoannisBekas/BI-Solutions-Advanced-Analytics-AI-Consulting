import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Search, Clock, ChevronRight, ExternalLink, GitCompare,
    Flag, SlidersHorizontal,
} from 'lucide-react';
import { fetchArchiveSnapshots } from '../services/product';
import type { ArchiveSnapshot as Snapshot, SignalType } from '../types';

interface ArchiveProps { userTier?: 'FREE' | 'UNLOCKED' | 'INSTITUTIONAL'; lightMode?: boolean; onViewReport?(s: Snapshot): void; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sigColor: Record<SignalType, string> = {
    'STRONG BUY': '#10B981', 'BUY': '#34D399', 'NEUTRAL': '#F59E0B', 'SELL': '#EF4444', 'STRONG SELL': '#EF4444',
};
const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ─── Diff row ─────────────────────────────────────────────────────────────────
function DiffRow({ label, oldVal, newVal }: { label: string; oldVal: string | number; newVal: string | number }) {
    const changed = String(oldVal) !== String(newVal);
    return (
        <div className="flex items-center gap-3 text-xs py-1">
            <span className="w-28 flex-shrink-0 text-gray-500">{label}</span>
            <span className="font-mono" style={{ color: changed ? '#EF4444' : '#9CA3AF', textDecoration: changed ? 'line-through' : 'none' }}>
                {oldVal}
            </span>
            {changed && (
                <>
                    <ChevronRight className="w-3 h-3 flex-shrink-0 text-gray-600" />
                    <span className="font-mono font-semibold" style={{ color: '#10B981' }}>{newVal}</span>
                </>
            )}
        </div>
    );
}

// ─── Compare panel ────────────────────────────────────────────────────────────
function ComparePanel({ old: o, cur: c, onClose }: { old: Snapshot; cur: Snapshot; onClose(): void }) {
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            className="rounded-xl p-5 mb-6"
            style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-sm text-indigo-400">
                    Comparing {fmtDate(o.generatedAt)} → Current
                </span>
                <button onClick={onClose} className="text-xs cursor-pointer text-gray-500">✕</button>
            </div>
            <DiffRow label="Signal" oldVal={o.signal} newVal={c.signal} />
            <DiffRow label="Confidence" oldVal={`${o.confidence}%`} newVal={`${c.confidence}%`} />
            <DiffRow label="Regime" oldVal={o.regime} newVal={c.regime} />
            <DiffRow label="Engine" oldVal={o.engineVersion} newVal={c.engineVersion} />
            <DiffRow label="Price" oldVal={`$${o.priceAtGen.toFixed(2)}`} newVal={`$${c.priceAtGen.toFixed(2)}`} />
        </motion.div>
    );
}

// ─── Timeline item ────────────────────────────────────────────────────────────
function TimelineRow({ snap, isLast, isSelected, onView, onCompare, lightMode }: {
    snap: Snapshot; isLast: boolean; isSelected: boolean;
    onView(): void; onCompare(): void; lightMode?: boolean;
}) {
    const cFill = sigColor[snap.signal];
    const border = isSelected ? `${cFill}50` : lightMode ? '#E5E7EB' : '#1F2937';
    const ts = lightMode ? '#6B7280' : '#9CA3AF';

    return (
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
            {/* Spine */}
            <div className="flex flex-col items-center flex-shrink-0 w-6">
                <div className="w-3 h-3 rounded-full flex-shrink-0 mt-3 ring-2"
                    style={{ boxShadow: `0 0 0 2px ${lightMode ? '#FFFFFF' : '#0A0D14'}`, background: cFill }}
                />
                <div className="flex-1 w-px mt-1" style={{ background: isLast ? 'transparent' : lightMode ? '#D1D5DB' : '#1F2937' }} />
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
                            <span className="text-xs text-gray-500">{snap.regime}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded font-mono"
                                style={{ background: 'rgba(59,130,246,0.08)', color: '#60A5FA' }}>
                                {snap.engineVersion}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {fmtDate(snap.generatedAt)} · {snap.reportId} · ${snap.priceAtGen.toFixed(2)}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={e => { e.stopPropagation(); onCompare(); }}
                            className="flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                            style={lightMode ? undefined : { background: 'rgba(255,255,255,0.04)', border: '1px solid #1F2937', color: '#D1D5DB' }}>
                            <GitCompare className="w-3 h-3" />vs Current
                        </button>
                        <a href={snap.url} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                            style={lightMode ? undefined : { background: 'rgba(255,255,255,0.04)', border: '1px solid #1F2937', color: '#D1D5DB' }}>
                            <ExternalLink className="w-3 h-3" />Share
                        </a>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Slider ───────────────────────────────────────────────────────────────────
function TimelineSlider({ total, value, onChange }: { total: number; value: number; onChange(v: number): void }) {
    if (total <= 0) {
        return (
            <div className="flex items-center gap-3 text-xs text-gray-500">
                <SlidersHorizontal className="w-4 h-4 flex-shrink-0 text-gray-500" />
                No snapshots available yet
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-4 h-4 flex-shrink-0 text-gray-500" />
            <input type="range" min={0} max={total - 1} value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full accent-indigo-500" />
            <span className="text-xs w-20 text-right font-mono text-gray-500">
                Showing {total - value} of {total}
            </span>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function Archive({ userTier = 'FREE', lightMode, onViewReport }: ArchiveProps) {
    const [ticker, setTicker] = useState('NVDA');
    const [query, setQuery] = useState('');
    const [compare, setCompare] = useState<Snapshot | null>(null);
    const [selectedId, setSelected] = useState<string | null>(null);
    const [sliderVal, setSlider] = useState(0);
    const [all, setAll] = useState<Snapshot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
    }, [ticker]);

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
                            <Search className="w-4 h-4 flex-shrink-0 text-gray-400" />
                            <input value={query} onChange={e => setQuery(e.target.value)}
                                placeholder='"regime change from uptrend…" or "Meridian v2.4"'
                                className="flex-1 bg-transparent text-sm focus:outline-none"
                                style={{ color: tp }} />
                        </div>
                    </div>
                    {/* Timeline slider */}
                    <TimelineSlider total={all.length} value={sliderVal} onChange={setSlider} />
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </div>
                )}

                {/* Compare panel */}
                <AnimatePresence>
                    {compare && current && <ComparePanel old={compare} cur={current} onClose={() => setCompare(null)} />}
                </AnimatePresence>

                {/* Timeline */}
                {loading ? Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="mb-3 h-28 rounded-[24px] border border-gray-200 bg-white/70 animate-pulse" />
                )) : filtered.map((snap, i) => (
                    <TimelineRow key={snap.reportId} snap={snap}
                        isLast={i === filtered.length - 1}
                        isSelected={snap.reportId === selectedId}
                        onView={() => { setSelected(snap.reportId); onViewReport?.(snap); }}
                        onCompare={() => setCompare(snap)}
                        lightMode={lightMode} />
                ))}

                {!loading && filtered.length === 0 && (
                    <div className="text-center py-12" style={{ color: ts }}>No snapshots match.</div>
                )}

                {/* FREE tier CTA */}
                {userTier === 'FREE' && (
                    <div className="bis-section-card mt-8 p-5 text-center">
                        <p className="text-sm font-semibold mb-1" style={{ color: tp }}>Full archive with Unlocked tier</p>
                        <p className="text-xs mb-3" style={{ color: ts }}>PDF export, unlimited history, compare any two snapshots.</p>
                        <button className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800">
                            Create Free Account →
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
