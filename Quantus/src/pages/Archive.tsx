import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Search, Clock, ChevronRight, ExternalLink, GitCompare,
    Flag, SlidersHorizontal,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type SignalType = 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL';
type AssetClass = 'EQUITY' | 'CRYPTO' | 'COMMODITY' | 'ETF';

interface Snapshot {
    reportId: string;
    ticker: string;
    company: string;
    assetClass: AssetClass;
    signal: SignalType;
    confidence: number;
    regime: string;
    sector: string;
    engineVersion: string;
    generatedAt: string;
    priceAtGen: number;
    url: string;
    hasRestatement?: boolean;
    restatementNote?: string;
}

interface ArchiveProps { userTier?: 'FREE' | 'UNLOCKED' | 'INSTITUTIONAL'; lightMode?: boolean; onViewReport?(s: Snapshot): void; }

// ─── Mock data ────────────────────────────────────────────────────────────────
function mockSnapshots(ticker: string): Snapshot[] {
    const sigs: SignalType[] = ['STRONG BUY', 'BUY', 'NEUTRAL', 'BUY', 'STRONG BUY', 'SELL', 'BUY', 'NEUTRAL'];
    const regimes = ['Strong Uptrend', 'Uptrend', 'Mean-Reverting', 'Uptrend', 'Strong Uptrend', 'Downtrend', 'Uptrend', 'Sideways'];
    return Array.from({ length: 8 }, (_, i) => ({
        reportId: `QRS-2026-${10000 + i * 112}`,
        ticker,
        company: ticker === 'NVDA' ? 'NVIDIA Corp' : ticker,
        assetClass: 'EQUITY' as AssetClass,
        signal: sigs[i % sigs.length],
        confidence: 60 + (i * 7) % 30,
        regime: regimes[i % regimes.length],
        sector: 'Technology',
        engineVersion: i < 2 ? 'Meridian v2.4' : i < 5 ? 'Meridian v2.3' : 'Atlas',
        generatedAt: new Date(Date.now() - i * 4 * 86_400_000).toISOString(),
        priceAtGen: 948.70 - i * 12.4,
        url: `https://bisolutions.group/report/QRS-2026-${10000 + i * 112}`,
        hasRestatement: i === 4,
        restatementNote: i === 4 ? 'EDGAR 10-K restated — historical comparables adjusted' : undefined,
    }));
}

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
    const cardBg = lightMode ? 'rgba(255,255,255,0.92)' : '#111827';
    const border = isSelected ? `${cFill}50` : lightMode ? '#E2E8F0' : '#1F2937';
    const ts = lightMode ? '#64748B' : '#9CA3AF';

    return (
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
            {/* Spine */}
            <div className="flex flex-col items-center flex-shrink-0 w-6">
                <div className="w-3 h-3 rounded-full flex-shrink-0 mt-3 ring-2 ring-[#0A0D14]"
                    style={{ background: cFill }} />
                <div className="flex-1 w-px mt-1" style={{ background: isLast ? 'transparent' : '#1F2937' }} />
            </div>
            {/* Card */}
            <div className="flex-1 rounded-xl p-4 mb-3 cursor-pointer hover:border-blue-500/30 transition-colors"
                style={{ background: cardBg, border: `1px solid ${border}` }}
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
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-all hover:scale-105"
                            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818CF8' }}>
                            <GitCompare className="w-3 h-3" />vs Current
                        </button>
                        <a href={snap.url} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-all hover:scale-105"
                            style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#3B82F6' }}>
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

    const all = useMemo(() => mockSnapshots(ticker), [ticker]);
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

    const bg = lightMode ? '#F0F4FF' : '#0A0D14';
    const tp = lightMode ? '#0F172A' : '#F9FAFB';
    const ts = lightMode ? '#475569' : '#9CA3AF';

    return (
        <div style={{ background: bg, minHeight: '100vh', padding: '48px 24px' }}>
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-1" style={{ color: tp }}>Historical Archive</h1>
                    <p className="text-sm" style={{ color: ts }}>
                        Read-only report snapshots · bisolutions.group/report/{'{report_id}'}
                    </p>
                </div>

                {/* Controls */}
                <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Ticker */}
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1F2937' }}>
                            <span className="text-xs font-bold text-blue-500">TICKER</span>
                            <input value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())}
                                className="bg-transparent text-sm font-mono w-20 focus:outline-none"
                                style={{ color: tp }} placeholder="NVDA" />
                        </div>
                        {/* Semantic search */}
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl flex-1 min-w-56"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1F2937' }}>
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

                {/* Compare panel */}
                <AnimatePresence>
                    {compare && <ComparePanel old={compare} cur={current} onClose={() => setCompare(null)} />}
                </AnimatePresence>

                {/* Timeline */}
                {filtered.map((snap, i) => (
                    <TimelineRow key={snap.reportId} snap={snap}
                        isLast={i === filtered.length - 1}
                        isSelected={snap.reportId === selectedId}
                        onView={() => { setSelected(snap.reportId); onViewReport?.(snap); }}
                        onCompare={() => setCompare(snap)}
                        lightMode={lightMode} />
                ))}

                {filtered.length === 0 && (
                    <div className="text-center py-12" style={{ color: ts }}>No snapshots match.</div>
                )}

                {/* FREE tier CTA */}
                {userTier === 'FREE' && (
                    <div className="mt-8 p-5 rounded-xl text-center"
                        style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}>
                        <p className="text-sm font-semibold mb-1" style={{ color: '#F9FAFB' }}>Full archive with Unlocked tier</p>
                        <p className="text-xs mb-3" style={{ color: ts }}>PDF export, unlimited history, compare any two snapshots.</p>
                        <button className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:scale-105 transition-all"
                            style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3B82F6' }}>
                            Create Free Account →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
