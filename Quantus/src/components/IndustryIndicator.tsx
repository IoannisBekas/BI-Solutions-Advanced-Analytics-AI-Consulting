import { useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Activity } from 'lucide-react';
import type { InsightCard } from '../types';

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { icon: string; color: string; label: string }> = {
    momentum: { icon: '📈', color: '#3B82F6', label: 'Momentum' },
    ai: { icon: '🧠', color: '#8B5CF6', label: 'AI Signal' },
    risk: { icon: '⚠️', color: '#F59E0B', label: 'Risk' },
    sentiment: { icon: '💬', color: '#10B981', label: 'Sentiment' },
    model: { icon: '🔬', color: '#14B8A6', label: 'Model' },
    altdata: { icon: '📊', color: '#F97316', label: 'Alt Data' },
    institutional: { icon: '🏛', color: '#6366F1', label: 'Institutional' },
    event: { icon: '🗓', color: '#F59E0B', label: 'Event' },
    knowledge: { icon: '🌐', color: '#6B7280', label: 'Knowledge' },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProgressInsightFeedProps {
    insights: InsightCard[];
    isGenerating: boolean;
    ticker: string;
    reportId?: string;
    onViewReport?: () => void;
    lightMode?: boolean;
}

// ─── Single insight card ──────────────────────────────────────────────────────

interface InsightCardItemProps {
    card: InsightCard;
    index: number;
    isLatest: boolean;
    isGenerating: boolean;
    lightMode?: boolean;
}

function InsightCardItem({ card, index, isLatest, isGenerating, lightMode }: InsightCardItemProps) {
    const meta = CATEGORY_META[card.category] ?? CATEGORY_META.model;
    const cardBg = lightMode ? 'rgba(255,255,255,0.82)' : '#111827';
    const borderColor = lightMode ? '#E2E8F0' : '#1F2937';
    const textSecondary = lightMode ? '#475569' : '#9CA3AF';

    return (
        <motion.div
            initial={{ opacity: 0, x: -14, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            // 80ms stagger per card
            transition={{ duration: 0.28, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-start gap-3 rounded-xl px-4 py-3 relative"
            style={{ background: cardBg, border: `1px solid ${borderColor}` }}
        >
            {/* Category icon */}
            <span className="text-base flex-shrink-0 mt-0.5 leading-none">{meta.icon}</span>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div
                    className="text-[10px] font-bold uppercase tracking-[0.08em] mb-0.5"
                    style={{ color: meta.color }}
                >
                    {meta.label}
                </div>
                {/* Bloomberg terminal style: metric first, implication second */}
                <div className="text-sm font-mono leading-relaxed" style={{ color: textSecondary }}>
                    {card.text}
                </div>
            </div>

            {/* "Processing" micro-animation on the latest arriving card */}
            {isGenerating && isLatest && (
                <div className="flex items-center gap-0.5 flex-shrink-0 mt-1">
                    {[0, 1, 2].map(i => (
                        <motion.div
                            key={i}
                            className="w-1 h-1 rounded-full"
                            style={{ background: meta.color }}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                        />
                    ))}
                </div>
            )}

            {/* Left accent line */}
            <div
                className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
                style={{ background: meta.color, opacity: 0.5 }}
            />
        </motion.div>
    );
}

// ─── Final "complete" card ────────────────────────────────────────────────────

function CompletionCard({
    ticker, reportId, onViewReport,
}: {
    ticker: string; reportId: string; onViewReport?: () => void;
}) {
    const date = useMemo(
        () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        [],
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl p-4 mt-2"
            style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.28)' }}
        >
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-start gap-3">
                    <span className="text-xl leading-none mt-0.5 flex-shrink-0">✅</span>
                    <div>
                        <div className="font-semibold text-sm text-emerald-400">
                            Report complete — shared with research community
                        </div>
                        <div className="text-xs mt-1 font-mono" style={{ color: '#6B7280' }}>
                            {reportId} · Meridian v2.4 · {ticker} · {date}
                        </div>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onViewReport}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all flex-shrink-0"
                    style={{ background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.32)', color: '#10B981' }}
                >
                    View Full Report ↓
                    <ChevronRight className="w-4 h-4" />
                </motion.button>
            </div>
        </motion.div>
    );
}

// ─── Skeleton placeholder ──────────────────────────────────────────────────────

function SkeletonCard({ lightMode }: { lightMode?: boolean }) {
    const cardBg = lightMode ? 'rgba(255,255,255,0.82)' : '#111827';
    const borderColor = lightMode ? '#E2E8F0' : '#1F2937';
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{ background: cardBg, border: `1px solid ${borderColor}` }}
        >
            <div className="w-5 h-5 rounded-full skeleton flex-shrink-0 mt-0.5" />
            <div className="flex-1">
                <div className="w-16 h-2 rounded skeleton mb-2.5" />
                <div className="w-56 h-2.5 rounded skeleton" />
            </div>
        </motion.div>
    );
}

// ─── Main ProgressInsightFeed ─────────────────────────────────────────────────

export function ProgressInsightFeed({
    insights, isGenerating, ticker, reportId, onViewReport, lightMode,
}: ProgressInsightFeedProps) {
    const endRef = useRef<HTMLDivElement>(null);
    const isDone = !isGenerating && insights.length > 0;
    const stableRid = useMemo(() => `QRS-2026-${String(Math.floor(Math.random() * 90000) + 10000)}`, []);
    const rid = reportId ?? stableRid;

    // Filter out completion cards — check `isComplete` flag first, fall back to text matching
    const regularCards = insights.filter(
        c => !c.isComplete && !c.text.includes('Report complete') && !c.text.includes('Analysis complete'),
    );
    const hasFinalCard = insights.length > regularCards.length;

    // Auto-scroll to latest card as they arrive, respecting reduced motion
    useEffect(() => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        endRef.current?.scrollIntoView({ behavior: prefersReduced ? 'instant' : 'smooth', block: 'nearest' });
    }, [insights.length]);

    // Don't render if no content yet and not generating
    if (insights.length === 0 && !isGenerating) return null;

    return (
        <section className="mb-8" aria-label="Progressive insight feed">
            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                    {isGenerating && (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                            <Activity className="w-4 h-4 text-blue-400" />
                        </motion.div>
                    )}
                    <h3
                        className="font-semibold text-sm"
                        style={{ color: lightMode ? '#0F172A' : '#F9FAFB' }}
                    >
                        {isGenerating ? `Analyzing ${ticker}…` : 'Analysis Complete'}
                    </h3>
                </div>
                <div className="flex-1 h-px" style={{ background: lightMode ? '#E2E8F0' : '#1F2937' }} />
                {isDone && (
                    <span className="text-xs font-medium text-emerald-400">
                        ✓ {regularCards.length} signals processed
                    </span>
                )}
            </div>

            {/* ── Cards — accumulate, NEVER replace ─────────────────────────────── */}
            <div className="space-y-2">
                {regularCards.map((card, i) => (
                    <InsightCardItem
                        key={card.id}
                        card={card}
                        index={i}
                        isLatest={isGenerating && i === regularCards.length - 1}
                        isGenerating={isGenerating}
                        lightMode={lightMode}
                    />
                ))}

                {/* Skeleton — next card incoming */}
                {isGenerating && <SkeletonCard lightMode={lightMode} />}

                {/* Final completion card */}
                {(hasFinalCard || isDone) && (
                    <CompletionCard
                        ticker={ticker}
                        reportId={rid}
                        onViewReport={onViewReport}
                    />
                )}

                <div ref={endRef} />
            </div>
        </section>
    );
}
