import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThumbsUp, ThumbsDown, Sparkles, X } from 'lucide-react';

export function Feedback() {
    const [v, setV] = useState<null | 'up' | 'down'>(null);
    return (
        <div className="flex gap-1">
            <button onClick={() => setV(v === 'up' ? null : 'up')} className={`p-1 rounded cursor-pointer transition-all ${v === 'up' ? 'text-emerald-400' : 'hover:text-emerald-400'}`} style={{ color: v === 'up' ? '#10B981' : '#6B7280' }}>
                <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setV(v === 'down' ? null : 'down')} className={`p-1 rounded cursor-pointer transition-all ${v === 'down' ? 'text-red-400' : 'hover:text-red-400'}`} style={{ color: v === 'down' ? '#EF4444' : '#6B7280' }}>
                <ThumbsDown className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

export function ExplainButton({ contextText, lightMode }: { contextText: string; lightMode?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [explanation, setExplanation] = useState<string | null>(null);

    const handleExplain = async () => {
        setIsOpen(true);
        if (explanation) return;
        setLoading(true);
        try {
            const res = await fetch('/quantus/api/v1/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context_string: contextText })
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setExplanation(data.explanation || "Explanation unavailable.");
        } catch {
            setExplanation("Explanation unavailable.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative inline-block mt-2 w-full">
            <button
                onClick={() => isOpen ? setIsOpen(false) : handleExplain()}
                className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                style={{ color: isOpen ? (lightMode ? '#3B82F6' : '#60A5FA') : '#6B7280' }}
            >
                <Sparkles className="w-3 h-3" />
                {isOpen ? 'Close Explanation' : 'Explain This'}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-2">
                        <div className="p-3 rounded-lg text-xs leading-relaxed relative"
                            style={{ background: lightMode ? 'rgba(59,130,246,0.05)' : 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: lightMode ? '#1E40AF' : '#BFDBFE' }}>
                            <button onClick={() => setIsOpen(false)} className="absolute top-2 right-2 opacity-50 hover:opacity-100 cursor-pointer"><X className="w-3 h-3" /></button>
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                    Translating to plain English...
                                </div>
                            ) : (
                                <div>
                                    <span className="font-semibold block mb-1" style={{ color: lightMode ? '#2563EB' : '#60A5FA' }}>ELIF (Explain Like I'm Five):</span>
                                    {explanation}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function SectionCard({ title, id, children, lightMode }: { title: string; id: string; children: React.ReactNode; lightMode?: boolean }) {
    return (
        <motion.div
            id={id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="surface-card p-6 mb-6 print-section"
            style={{ background: lightMode ? 'rgba(255,255,255,0.9)' : '#0A0A0A', borderColor: lightMode ? '#E2E8F0' : '#1A1A1A' }}
        >
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-5 text-gray-500">{title}</h3>
            {children}
        </motion.div>
    );
}

export function MetricCard({ label, value, sub, trend, note, freshness, lightMode }: {
    label: string; value: string; sub?: string; trend?: 'up' | 'down' | 'neutral'; note?: string; freshness?: string; lightMode?: boolean;
}) {
    void trend;
    const [copied, setCopied] = useState(false);
    const { textPrimary, textSecondary, dimBg, borderColor } = (() => ({
        textPrimary: lightMode ? '#0F172A' : '#F9FAFB',
        textSecondary: lightMode ? '#475569' : '#9CA3AF',
        dimBg: lightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
        borderColor: lightMode ? '#E2E8F0' : '#1A1A1A',
    }))();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(`${label}: ${value}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch { /* clipboard unavailable */ }
    };

    return (
        <div className="rounded-xl p-4 flex flex-col h-full cursor-pointer group" style={{ background: dimBg, border: `1px solid ${borderColor}` }} onClick={handleCopy}>
            <div className="flex-1 relative">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs uppercase tracking-wider" style={{ color: textSecondary }}>{label}</span>
                    {copied && <span className="text-[10px] text-emerald-400 font-medium">Copied!</span>}
                </div>
                <div className="metric-value text-xl font-bold mb-1" style={{ color: textPrimary }}>{value}</div>
                {sub && <div className="text-xs" style={{ color: textSecondary }}>{sub}</div>}
                {note && <div className="text-xs mt-2 leading-relaxed" style={{ color: textSecondary }}>{note}</div>}
                {freshness && <div className="text-xs mt-2 text-gray-500">🕒 {freshness}</div>}
            </div>
            <div className="mt-auto pt-2 border-t mt-3" style={{ borderColor: lightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}>
                <ExplainButton contextText={`${label} - ${value}${note ? ' - ' + note : ''}`} lightMode={lightMode} />
            </div>
        </div>
    );
}
