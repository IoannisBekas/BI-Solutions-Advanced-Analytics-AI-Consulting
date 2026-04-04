// Legacy: retained for future backend SSE integration. Currently replaced by SectionE in Report/index.tsx.
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { ReportData } from '../../types';
import { themeColors } from './helpers';
import { SectionCard, Feedback } from './SharedWidgets';

const DEEP_DIVE_MODULES = [
    'Time Series Forecasting — Model Ensemble',
    'Mean Reversion Strategy',
    'Sentiment Analysis',
    'Portfolio Optimization & Efficient Frontier',
    'ML Feature Importance (SHAP)',
    'High-Frequency Signal Detection',
    'Risk Management & VaR (Expanded)',
    'Options Pricing & Greeks',
    'Pairs Trading Cointegration',
    'ML Backtesting Framework',
    'Reinforcement Learning Agent',
    'Factor Investing Model',
];

interface Props { report: ReportData; lightMode?: boolean; }

export function SectionDeepDives({ report, lightMode }: Props) {
    const [expandedDive, setExpandedDive] = useState<number | null>(null);
    const [diveContent, setDiveContent] = useState<Record<number, string>>({});
    const [diveLoading, setDiveLoading] = useState<Record<number, boolean>>({});
    const [warmupState, setWarmupState] = useState<'idle' | 'warming' | 'failed'>('idle');
    const abortRef = useRef<AbortController | null>(null);
    const { textPrimary, textSecondary, borderColor } = themeColors(lightMode);

    useEffect(() => {
        abortRef.current?.abort();
        setExpandedDive(null);
        setDiveContent({});
        setDiveLoading({});
        setWarmupState('warming');

        let cancelled = false;

        void fetch('/quantus/api/deepdive/prefetch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ticker: report.ticker,
                assetClass: report.asset_class,
                modules: DEEP_DIVE_MODULES.map((_, index) => index),
            }),
        })
            .then((resp) => {
                if (!resp.ok) {
                    throw new Error('Deep dive warmup request failed');
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setWarmupState('failed');
                }
            });

        return () => {
            cancelled = true;
            abortRef.current?.abort();
        };
    }, [report.asset_class, report.ticker]);

    const expandDeepDive = async (idx: number) => {
        if (expandedDive === idx) { setExpandedDive(null); return; }
        setExpandedDive(idx);
        if (diveContent[idx]) return;

        // Abort any previous deep dive stream
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setDiveLoading(l => ({ ...l, [idx]: true }));
        try {
            const resp = await fetch('/quantus/api/deepdive', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker: report.ticker, module: idx, assetClass: report.asset_class }),
                signal: controller.signal,
            });
            let text = '';
            if (resp.headers.get('Content-Type')?.includes('event-stream')) {
                if (!resp.body) throw new Error('Empty response body');
                const reader = resp.body.getReader();
                const decoder = new TextDecoder();
                const STREAM_TIMEOUT = 30_000;
                let lastChunk = Date.now();
                try {
                    while (true) {
                        const readPromise = reader.read();
                        const timeoutPromise = new Promise<never>((_, reject) => {
                            const check = () => {
                                if (Date.now() - lastChunk > STREAM_TIMEOUT) {
                                    reader.cancel();
                                    reject(new Error('Stream timeout'));
                                }
                            };
                            setTimeout(check, STREAM_TIMEOUT);
                        });
                        const { value, done } = await Promise.race([readPromise, timeoutPromise]);
                        if (done) break;
                        lastChunk = Date.now();
                        const lines = decoder.decode(value).split('\n');
                        for (const line of lines) {
                            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                                try { text += JSON.parse(line.slice(6)).text; } catch { /* skip malformed chunk */ }
                            }
                        }
                    }
                } finally {
                    reader.releaseLock();
                }
            }
            if (!controller.signal.aborted) {
                setDiveContent(c => ({ ...c, [idx]: text || 'Analysis complete.' }));
            }
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') return;
            setDiveContent(c => ({ ...c, [idx]: 'Deep dive generation unavailable — check API connection.' }));
        } finally {
            if (!controller.signal.aborted) {
                setDiveLoading(l => ({ ...l, [idx]: false }));
            }
        }
    };

    return (
        <SectionCard title="E — Deep Dives (On-Demand)" id="section-5" lightMode={lightMode}>
            <p className="text-xs mb-5" style={{ color: textSecondary }}>
                Each analysis generated on-demand · cached immediately for all researchers · ~8 seconds first load
            </p>
            {warmupState === 'warming' && (
                <p className="text-xs mb-5" style={{ color: textSecondary }}>
                    Background warmup active: deep dives are being cached while the reader reviews the report.
                </p>
            )}
            {warmupState === 'failed' && (
                <p className="text-xs mb-5 text-amber-500">
                    Background warmup is unavailable right now. Deep dives will still generate when opened.
                </p>
            )}
            <div className="space-y-2">
                {DEEP_DIVE_MODULES.map((title, i) => (
                    <div key={i} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${expandedDive === i ? 'rgba(59,130,246,0.35)' : borderColor}` }}>
                        <button onClick={() => expandDeepDive(i)}
                            className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium transition-all cursor-pointer hover:bg-white/3"
                            style={{ color: textPrimary }}>
                            <span className="flex items-center gap-2">
                                <span className="text-xs font-mono text-blue-400">{String(i + 1).padStart(2, '0')}</span>
                                {title}
                            </span>
                            {expandedDive === i ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-gray-500" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-500" />}
                        </button>
                        <AnimatePresence>
                            {expandedDive === i && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                                    <div className="px-4 pb-4 border-t" style={{ borderColor }}>
                                        {diveLoading[i] ? (
                                            <div className="py-4">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="flex gap-1">
                                                        {[0, 1, 2].map(j => (
                                                            <motion.div key={j} className="w-1.5 h-1.5 rounded-full bg-blue-400"
                                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                                transition={{ duration: 1.2, repeat: Infinity, delay: j * 0.2 }} />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-gray-500">Generating deep analysis — ~8 seconds</span>
                                                </div>
                                                <div className="space-y-2">{[1, 0.9, 0.7, 0.6].map((w, k) => <div key={k} className="h-3 rounded skeleton" style={{ width: `${w * 100}%` }} />)}</div>
                                            </div>
                                        ) : (
                                            <div className="py-4">
                                                <div className="text-sm leading-relaxed prose prose-invert max-w-none" style={{ color: textSecondary }}>
                                                    <ReactMarkdown>{diveContent[i] || 'Loading…'}</ReactMarkdown>
                                                </div>
                                                <div className="flex justify-between items-center mt-4">
                                                    <div className="text-xs text-gray-500">Powered by Meridian v2.4 · Cached for all researchers</div>
                                                    <Feedback />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </SectionCard>
    );
}
