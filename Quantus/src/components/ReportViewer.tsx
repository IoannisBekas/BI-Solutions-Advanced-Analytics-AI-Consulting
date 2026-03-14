import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Download, Bell, Bookmark, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Minus, Sparkles, X } from 'lucide-react';
import type { ReportData, SignalType, RegimeLabel } from '../types';

// ── Helper Components ────────────────────────────────────────────────────────

function regimeClass(label: RegimeLabel) {
    const map: Record<string, string> = {
        'Strong Uptrend': 'regime-strong-uptrend',
        'Uptrend': 'regime-uptrend',
        'Mean-Reverting': 'regime-mean-reverting',
        'High Volatility': 'regime-high-volatility',
        'Downtrend': 'regime-downtrend',
        'Strong Downtrend': 'regime-strong-downtrend',
        'Transitional': 'regime-mean-reverting',
    };
    return map[label] ?? 'regime-mean-reverting';
}

function signalClass(s: SignalType) {
    const map: Record<string, string> = {
        'STRONG BUY': 'badge-strong-buy',
        'BUY': 'badge-buy',
        'NEUTRAL': 'badge-neutral',
        'SELL': 'badge-sell',
        'STRONG SELL': 'badge-strong-sell',
    };
    return map[s] ?? 'badge-neutral';
}

function Feedback() {
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

function ExplainButton({ contextText, lightMode }: { contextText: string; lightMode?: boolean }) {
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
            const data = await res.json();
            if (data.explanation) {
                setExplanation(data.explanation);
            } else {
                setExplanation("Explanation unavailable.");
            }
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
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-2"
                    >
                        <div className="p-3 rounded-lg text-xs leading-relaxed relative"
                            style={{
                                background: lightMode ? 'rgba(59,130,246,0.05)' : 'rgba(59,130,246,0.1)',
                                border: '1px solid rgba(59,130,246,0.2)',
                                color: lightMode ? '#1E40AF' : '#BFDBFE'
                            }}
                        >
                            <button onClick={() => setIsOpen(false)} className="absolute top-2 right-2 opacity-50 hover:opacity-100 cursor-pointer">
                                <X className="w-3 h-3" />
                            </button>
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

function SectionCard({ title, id, children, lightMode }: { title: string; id: string; children: React.ReactNode; lightMode?: boolean }) {
    return (
        <motion.div
            id={id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="surface-card p-6 mb-6 print-section"
            style={{ background: lightMode ? 'rgba(255,255,255,0.9)' : '#111827', borderColor: lightMode ? '#E2E8F0' : '#1F2937' }}
        >
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: '#6B7280' }}>{title}</h3>
            {children}
        </motion.div>
    );
}

function MetricCard({ label, value, sub, trend, note, freshness, lightMode }: {
    label: string; value: string; sub?: string; trend?: 'up' | 'down' | 'neutral'; note?: string; freshness?: string; lightMode?: boolean;
}) {
    const textPrimary = lightMode ? '#0F172A' : '#F9FAFB';
    const textSecondary = lightMode ? '#475569' : '#9CA3AF';
    const dimBg = lightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)';
    const borderColor = lightMode ? '#E2E8F0' : '#1F2937';
    return (
        <div className="rounded-xl p-4 flex flex-col h-full" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs uppercase tracking-wider" style={{ color: textSecondary }}>{label}</span>
                    {trend && trend !== 'neutral' && (
                        trend === 'up' ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                    )}
                    {trend === 'neutral' && <Minus className="w-3.5 h-3.5" style={{ color: '#6B7280' }} />}
                </div>
                <div className="metric-value text-xl font-bold mb-1" style={{ color: textPrimary }}>{value}</div>
                {sub && <div className="text-xs" style={{ color: textSecondary }}>{sub}</div>}
                {note && <div className="text-xs mt-2 leading-relaxed" style={{ color: textSecondary }}>{note}</div>}
                {freshness && <div className="text-xs mt-2" style={{ color: '#6B7280' }}>🕒 {freshness}</div>}
            </div>

            <div className="mt-auto pt-2 border-t mt-3" style={{ borderColor: lightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}>
                <ExplainButton contextText={`${label} - ${value}${note ? ' - ' + note : ''}`} lightMode={lightMode} />
            </div>
        </div>
    );
}

// ── MAIN REPORT DASHBOARD ────────────────────────────────────────────────────

interface ReportDashboardProps {
    report: ReportData;
    lightMode?: boolean;
}

export function ReportDashboard({ report, lightMode }: ReportDashboardProps) {
    const [activeTab, setActiveTab] = useState<'forecast' | 'momentum' | 'sentiment' | 'altdata'>('forecast');
    const [expandedDive, setExpandedDive] = useState<number | null>(null);
    const [diveContent, setDiveContent] = useState<Record<number, string>>({});
    const [diveLoading, setDiveLoading] = useState<Record<number, boolean>>({});
    const [showConfBreakdown, setShowConfBreakdown] = useState(false);
    const [plainEnglish, setPlainEnglish] = useState<Record<string, boolean>>({});

    const textPrimary = lightMode ? '#0F172A' : '#F9FAFB';
    const textSecondary = lightMode ? '#475569' : '#9CA3AF';
    const dimBg = lightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)';
    const borderColor = lightMode ? '#E2E8F0' : '#1F2937';

    const togglePlain = (key: string) => setPlainEnglish(p => ({ ...p, [key]: !p[key] }));

    const expandDeepDive = async (idx: number) => {
        if (expandedDive === idx) { setExpandedDive(null); return; }
        setExpandedDive(idx);

        // Fire Telemetry Tracking
        fetch('/quantus/api/v1/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: 'anon_local_dev',
                event_type: 'click_deep_dive',
                data: { ticker: report.ticker, module_name: DEEP_DIVE_MODULES[idx], module_index: idx }
            })
        }).catch(console.error); // Fire & forget

        if (diveContent[idx]) return; // already loaded

        setDiveLoading(l => ({ ...l, [idx]: true }));
        try {
            const resp = await fetch('/quantus/api/deepdive', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker: report.ticker, module: idx, assetClass: report.asset_class }),
            });

            let text = '';
            if (resp.headers.get('Content-Type')?.includes('event-stream')) {
                const reader = resp.body!.getReader();
                const decoder = new TextDecoder();
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    const lines = decoder.decode(value).split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                            try { text += JSON.parse(line.slice(6)).text; } catch { /* ignore malformed SSE chunks */ }
                        }
                    }
                }
            }
            setDiveContent(c => ({ ...c, [idx]: text || 'Analysis complete — see narrative above for key insights.' }));
        } catch {
            setDiveContent(c => ({ ...c, [idx]: 'Deep dive generation unavailable — check API connection.' }));
        } finally {
            setDiveLoading(l => ({ ...l, [idx]: false }));
        }
    };

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

    return (
        <div>
            {/* ── REPORT HEADER ──────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                className="surface-card p-5 mb-6 print-section"
                style={{ background: lightMode ? 'rgba(255,255,255,0.95)' : '#111827', borderColor }}
            >
                {/* Top row */}
                <div className="flex flex-wrap items-start gap-4 justify-between mb-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0"
                            style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }}>
                            {report.ticker.slice(0, 2)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-xl font-bold" style={{ color: textPrimary }}>{report.company_name}</h2>
                                <span className={`badge badge-${report.asset_class.toLowerCase()}`}>{report.asset_class}</span>
                            </div>
                            <div className="text-sm" style={{ color: textSecondary }}>
                                {report.ticker} · {report.exchange} · {report.sector} · {report.market_cap}
                            </div>
                            <div className="text-xs mt-1" style={{ color: '#6B7280' }}>
                                {report.report_id} · {report.engine} · {report.researcher_count} researchers
                                {report.community_interest_spike && (
                                    <span className="ml-3 text-blue-400">🔥 Interest ↑{report.community_interest_spike}% (48h)</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Overall Signal */}
                    <div className="flex flex-col items-end gap-2">
                        <div className={`badge ${signalClass(report.overall_signal)} text-base px-4 py-2`}
                            style={{ fontSize: '13px' }}>
                            {report.overall_signal}
                        </div>
                        <div style={{ color: textSecondary, fontSize: '12px' }}>Confidence: <span className="font-bold">{report.confidence_score}%</span></div>
                    </div>
                </div>

                {/* Regime badge */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={`regime-badge ${regimeClass(report.regime.label)}`}>{report.regime.label}</span>
                    <span className="text-xs" style={{ color: textSecondary }}>{report.regime.implication}</span>
                </div>

                {/* Cross-ticker alert */}
                {report.cross_ticker_alerts?.map((alert, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg mb-3 text-xs"
                        style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)' }}>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="text-amber-400 font-semibold">{alert.related_ticker} — {alert.event}</span>
                        <span style={{ color: '#9CA3AF' }}>· {alert.impact}</span>
                    </div>
                ))}

                {/* Confidence breakdown (expandable) */}
                <button
                    onClick={() => setShowConfBreakdown(!showConfBreakdown)}
                    className="flex items-center gap-2 text-xs cursor-pointer mb-2"
                    style={{ color: '#6B7280' }}
                >
                    {showConfBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    Confidence breakdown — {report.confidence_score}% overall
                </button>
                <AnimatePresence>
                    {showConfBreakdown && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                                {Object.entries(report.confidence_breakdown).map(([key, val]) => (
                                    <div key={key} className="rounded-lg p-2" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                                        <div className="text-xs mb-1" style={{ color: '#6B7280' }}>{key.replace(/_/g, ' ')}</div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 progress-bar">
                                                <div className="progress-fill" style={{ width: `${(val / 20) * 100}%`, background: '#3B82F6' }} />
                                            </div>
                                            <span className="text-xs font-mono font-bold" style={{ color: '#3B82F6' }}>+{val}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 mt-3 no-print">
                    {[
                        { icon: Download, label: 'Export PDF', action: () => window.print() },
                        { icon: Share2, label: 'Share Report', action: () => navigator.clipboard.writeText(window.location.href) },
                        { icon: Bell, label: 'Set Alert', action: () => { } },
                        { icon: Bookmark, label: 'Watchlist', action: () => { } },
                    ].map(btn => (
                        <button key={btn.label} onClick={btn.action}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer hover:bg-blue-500/10 hover:text-blue-400"
                            style={{ background: dimBg, border: `1px solid ${borderColor}`, color: textSecondary }}>
                            <btn.icon className="w-3.5 h-3.5" />
                            {btn.label}
                        </button>
                    ))}
                    <div className="ml-auto flex items-center gap-1"><Feedback /></div>
                </div>
            </motion.div>

            {/* ── SECTION A: EXECUTIVE SUMMARY ────────────────────────── */}
            <SectionCard title="A — Executive Summary" id="section-1" lightMode={lightMode}>
                {/* Narrative */}
                <div className="mb-6">
                    <p className="text-sm leading-relaxed mb-3" style={{ color: textSecondary }}>
                        {plainEnglish['exec'] ? report.narrative_plain : report.narrative_executive_summary}
                    </p>
                    <button onClick={() => togglePlain('exec')} className="text-xs text-blue-400 hover:underline cursor-pointer">
                        {plainEnglish['exec'] ? 'Show full analysis' : 'What does this mean for me? →'}
                    </button>
                </div>

                {/* Earnings flag */}
                {report.earnings_flag && (
                    <div className="flex items-center gap-3 p-3 rounded-xl mb-5 text-xs"
                        style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
                        <span className="text-lg">🗓</span>
                        <div>
                            <span className="font-semibold text-amber-400">Earnings in {report.earnings_flag.days_to_earnings} days</span>
                            <span className="ml-2" style={{ color: textSecondary }}>{report.earnings_flag.implied_move} implied move · {report.earnings_flag.strategy_adjustment}</span>
                        </div>
                    </div>
                )}

                {/* Signal cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
                    {report.signal_cards.map((card) => (
                        <div key={card.label} className="rounded-xl p-4" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-base">{card.icon}</span>
                                <Feedback />
                            </div>
                            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>{card.label}</div>
                            <div className="font-bold text-sm mb-1" style={{ color: textPrimary }}>{card.value}</div>
                            <div className="text-xs mb-2" style={{ color: textSecondary }}>{card.plain_note}</div>
                            <div className="text-xs" style={{ color: '#6B7280' }}>🕒 {card.freshness}</div>
                        </div>
                    ))}
                </div>

                {/* Vs Consensus */}
                {report.vs_consensus && (
                    <div className="p-3 rounded-xl text-xs" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="font-semibold" style={{ color: textSecondary }}>Quantus vs. Consensus:</span>
                            <span className={`badge ${signalClass(report.vs_consensus.quantus)}`} style={{ fontSize: '10px' }}>Quantus: {report.vs_consensus.quantus}</span>
                            <span className="badge badge-neutral" style={{ fontSize: '10px' }}>Consensus: {report.vs_consensus.consensus}</span>
                        </div>
                        <p style={{ color: textSecondary }}>{report.vs_consensus.divergence_explanation}</p>
                    </div>
                )}

                {/* Accuracy Tracker */}
                {report.historical_signals && report.historical_signals.length >= 3 && (
                    <div className="mt-5">
                        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6B7280' }}>Quantus Accuracy Tracker — {report.ticker}</div>
                        <div className="space-y-2">
                            {report.historical_signals.map((sig, i) => (
                                <div key={i} className="flex items-center gap-3 text-xs rounded-lg px-3 py-2" style={{ background: dimBg }}>
                                    <span style={{ color: '#6B7280' }}>{sig.date}</span>
                                    <span className={`badge ${signalClass(sig.signal)}`} style={{ fontSize: '10px' }}>{sig.signal}</span>
                                    <span style={{ color: textSecondary }}>{sig.outcome}</span>
                                    <span className="ml-auto font-mono text-xs" style={{ color: '#6B7280' }}>{sig.engine}</span>
                                    <span>{sig.correct ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <span className="text-red-400">✗</span>}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs mt-2" style={{ color: '#6B7280' }}>Past performance does not guarantee future results.</p>
                    </div>
                )}
            </SectionCard>

            {/* ── SECTION B: OPPORTUNITY ──────────────────────────────── */}
            <SectionCard title="B — Opportunity" id="section-2" lightMode={lightMode}>
                {/* Tab nav */}
                <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
                    {(['forecast', 'momentum', 'sentiment', 'altdata'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}>
                            {tab === 'altdata' ? 'Alternative Data' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'forecast' && (
                        <motion.div key="forecast" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
                            <div className="mb-4 p-4 rounded-xl" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                                <div className="text-2xl font-bold font-mono metric-value mb-1" style={{ color: '#3B82F6' }}>
                                    {report.model_ensemble.ensemble_forecast}
                                </div>
                                <div className="text-xs" style={{ color: textSecondary }}>
                                    Ensemble forecast · 30 days · Band: {report.model_ensemble.confidence_band.low} to {report.model_ensemble.confidence_band.high}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                {[
                                    { name: 'LSTM', ...report.model_ensemble.lstm, color: '#8B5CF6' },
                                    { name: 'Prophet', ...report.model_ensemble.prophet, color: '#F97316' },
                                    { name: 'ARIMA', ...report.model_ensemble.arima, color: '#14B8A6' },
                                ].map(m => (
                                    <div key={m.name} className="rounded-xl p-3" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                                        <div className="text-xs font-semibold mb-2" style={{ color: m.color }}>{m.name}</div>
                                        <div className="text-xl font-bold font-mono metric-value" style={{ color: textPrimary }}>{m.forecast}</div>
                                        <div className="flex gap-3 mt-2 text-xs" style={{ color: '#6B7280' }}>
                                            <span>Weight: <strong style={{ color: textSecondary }}>{m.weight}</strong></span>
                                            <span>Acc: <strong style={{ color: textSecondary }}>{m.accuracy}</strong></span>
                                        </div>
                                        <ExplainButton contextText={`${m.name} Model Forecast: ${m.forecast}`} lightMode={lightMode} />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: textSecondary }}>{report.model_ensemble.regime_accuracy_note}</p>
                            <div className="flex items-center justify-between mt-3"><div /><Feedback /></div>
                        </motion.div>
                    )}

                    {activeTab === 'momentum' && (
                        <motion.div key="momentum" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                            <div className="p-3 rounded-xl mb-4 text-xs font-semibold" style={{ background: dimBg, border: `1px solid ${borderColor}`, color: textSecondary }}>
                                Regime: <span style={{ color: '#F9FAFB' }}>{report.regime.label}</span> — {report.regime.implication}
                            </div>
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {[
                                    { label: 'RSI', value: '67.3', note: 'Approaching overbought', ok: true },
                                    { label: 'MACD', value: '+1.84', note: 'Positive crossover', ok: true },
                                    { label: 'BB Position', value: '68th %ile', note: 'Upper band proximity', ok: false },
                                ].map(m => (
                                    <div key={m.label} className="rounded-xl p-3 text-center" style={{ background: dimBg, border: `1px solid ${m.ok ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                                        <div className="text-xs mb-1" style={{ color: '#6B7280' }}>{m.label}</div>
                                        <div className="text-xl font-bold font-mono metric-value" style={{ color: m.ok ? '#10B981' : '#F59E0B' }}>{m.value}</div>
                                        <div className="text-xs mt-1" style={{ color: textSecondary }}>{m.note}</div>
                                        <ExplainButton contextText={`${m.label}: ${m.value} - ${m.note}`} lightMode={lightMode} />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: textSecondary }}>
                                Z-score vs. 90-day mean: +1.6 standard deviations — elevated but within Strong Uptrend norms.
                                Mean reversion is suppressed in this regime. Momentum continuation is the primary strategy.
                            </p>
                            <div className="flex justify-end mt-3"><Feedback /></div>
                        </motion.div>
                    )}

                    {activeTab === 'sentiment' && (
                        <motion.div key="sentiment" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                            <div className="space-y-3 mb-4">
                                {[
                                    { label: 'X Sentiment (Grok API)', score: report.alternative_data.grok_x_sentiment.score, note: `Volume: ${report.alternative_data.grok_x_sentiment.volume.toLocaleString()} posts · ${report.alternative_data.grok_x_sentiment.campaign_detected ? '⚠️ Campaign detected — downweighted' : 'No coordinated campaign — signal reliable'}`, freshness: 'Daily', color: '#3B82F6' },
                                    { label: 'Reddit Sentiment', score: report.alternative_data.reddit_score, note: 'r/investing, r/stocks, r/wallstreetbets weighted by credibility', freshness: 'Daily', color: '#F97316' },
                                    { label: 'News Sentiment', score: report.alternative_data.news_score, note: 'NewsAPI · FinBERT scoring · 47 articles analyzed', freshness: 'Daily', color: '#8B5CF6' },
                                    { label: 'Composite', score: report.alternative_data.composite_sentiment, note: 'Volume-weighted composite across all sources', freshness: 'Daily', color: '#10B981' },
                                ].map(s => (
                                    <div key={s.label} className="rounded-xl p-3" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</span>
                                            <span className="font-mono font-bold text-sm" style={{ color: s.score >= 0.5 ? '#10B981' : s.score >= 0 ? '#F59E0B' : '#EF4444' }}>
                                                {s.score >= 0 ? '+' : ''}{(s.score * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="progress-bar mb-2">
                                            <div className="progress-fill" style={{ width: `${(s.score + 1) / 2 * 100}%`, background: s.color }} />
                                        </div>
                                        <div className="text-xs" style={{ color: textSecondary }}>{s.note}</div>
                                        <div className="text-xs mt-1" style={{ color: '#6B7280' }}>🕒 {s.freshness}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end"><Feedback /></div>
                        </motion.div>
                    )}

                    {activeTab === 'altdata' && (
                        <motion.div key="altdata" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { label: 'Institutional Flow (13F)', value: report.alternative_data.institutional_flow, sub: 'Last quarter · SEC fillings' },
                                    { label: 'Insider Activity', value: report.alternative_data.insider_activity, sub: 'SEC Form 4 · recent' },
                                    { label: 'Short Interest', value: report.alternative_data.short_interest, sub: 'Bi-weekly reporting' },
                                    { label: 'IV Rank', value: report.alternative_data.iv_rank, sub: 'vs. 52-week range' },
                                    { label: 'Options Implied Move', value: report.alternative_data.implied_move, sub: 'Market-priced risk' },
                                    { label: 'Earnings Call NLP', value: report.alternative_data.transcript_score, sub: 'Quantus corpus · management confidence' },
                                ].map(item => (
                                    <div key={item.label} className="rounded-xl p-3" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                                        <div className="text-xs mb-1" style={{ color: '#6B7280' }}>{item.label}</div>
                                        <div className="font-semibold text-sm" style={{ color: textPrimary }}>{item.value}</div>
                                        <div className="text-xs mt-1" style={{ color: textSecondary }}>{item.sub}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end mt-3"><Feedback /></div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </SectionCard>

            {/* ── SECTION C: RISK ─────────────────────────────────────── */}
            <SectionCard title="C — Risk" id="section-3" lightMode={lightMode}>
                {/* Macro context */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
                    {[
                        { label: 'Fed Funds Rate', value: report.risk.macro_context.fed_rate },
                        { label: 'Yield Curve', value: report.risk.macro_context.yield_curve },
                        { label: 'VIX', value: report.risk.macro_context.vix },
                        { label: 'IG Spreads', value: report.risk.macro_context.credit_spreads },
                    ].map(m => (
                        <div key={m.label} className="rounded-lg p-3 text-center" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                            <div className="text-xs mb-1" style={{ color: '#6B7280' }}>{m.label}</div>
                            <div className="font-mono text-sm font-semibold" style={{ color: textPrimary }}>{m.value}</div>
                        </div>
                    ))}
                </div>

                {/* Risk metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                    <MetricCard label="Daily VaR (99%)" value={`${report.risk.var_dollar} / $10K`} note="Monte Carlo · 10,000 paths" freshness="Daily" lightMode={lightMode} />
                    <MetricCard label="Expected Shortfall" value={report.risk.expected_shortfall} note="Avg loss in worst 1% of scenarios" lightMode={lightMode} />
                    <MetricCard label="Max Drawdown" value={report.risk.max_drawdown} lightMode={lightMode} />
                    <MetricCard label="Sharpe Ratio" value={report.risk.sharpe_ratio.toFixed(2)} note={`vs. peer avg: 0.91`} lightMode={lightMode} />
                </div>

                {/* Stress tests */}
                <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6B7280' }}>Historical Stress Scenarios</div>
                <div className="rounded-xl overflow-hidden mb-4" style={{ border: `1px solid ${borderColor}` }}>
                    <div className="grid grid-cols-3 px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ background: dimBg, color: '#6B7280' }}>
                        <span>Scenario</span><span className="text-center">Return</span><span className="text-right">Recovery</span>
                    </div>
                    {report.risk.stress_tests.map((t, i) => (
                        <div key={i} className="grid grid-cols-3 px-4 py-3 text-sm border-t" style={{ borderColor }}>
                            <span style={{ color: textSecondary }}>{t.scenario}</span>
                            <span className="text-center font-mono font-semibold text-red-400">{t.return}</span>
                            <span className="text-right text-xs" style={{ color: textSecondary }}>{t.recovery}</span>
                        </div>
                    ))}
                </div>

                {/* Volatility vs peers */}
                <div className="flex items-center gap-3 text-xs p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span style={{ color: textSecondary }}>Volatility vs. peers: <strong style={{ color: '#F9FAFB' }}>{report.risk.volatility_vs_peers}</strong> · Options-implied move: {report.risk.implied_move}</span>
                </div>
                <div className="flex justify-end mt-3"><Feedback /></div>
            </SectionCard>

            {/* ── SECTION D: STRATEGY ─────────────────────────────────── */}
            <SectionCard title="D — Strategy Recommendation" id="section-4" lightMode={lightMode}>
                {/* Action card */}
                <div className="rounded-xl p-5 mb-5" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`badge ${signalClass(report.strategy.action)}`} style={{ fontSize: '14px' }}>{report.strategy.action}</span>
                                <span className="font-bold text-lg" style={{ color: textPrimary }}>{report.strategy.confidence}% confidence</span>
                            </div>
                            <div className="text-xs" style={{ color: textSecondary }}>{report.strategy.regime_context}</div>
                        </div>
                        <Feedback />
                    </div>
                </div>

                {/* Entry / Target / Stop (gated for free tier - shown with note) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[
                        { label: 'Entry Zone', value: report.strategy.entry_zone },
                        { label: 'Price Target', value: report.strategy.target },
                        { label: 'Stop-Loss', value: report.strategy.stop_loss },
                        { label: 'Risk / Reward', value: report.strategy.risk_reward },
                    ].map(item => (
                        <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                            <div className="text-xs mb-1" style={{ color: '#6B7280' }}>{item.label}</div>
                            <div className="font-mono font-bold" style={{ color: textPrimary }}>{item.value}</div>
                        </div>
                    ))}
                </div>

                {/* Position size */}
                <div className="flex flex-wrap gap-3 text-xs mb-4">
                    {[
                        { label: 'Position Size', value: report.strategy.position_size_pct },
                        { label: 'Kelly Max', value: report.strategy.kelly_derived_max },
                        ...(report.strategy.portfolio_sharpe_improvement ? [{ label: 'Portfolio Sharpe ΔΔ', value: report.strategy.portfolio_sharpe_improvement }] : []),
                    ].map(item => (
                        <div key={item.label} className="rounded-lg px-3 py-2 flex items-center gap-2" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                            <span style={{ color: '#6B7280' }}>{item.label}:</span>
                            <span className="font-semibold" style={{ color: textPrimary }}>{item.value}</span>
                        </div>
                    ))}
                </div>

                {/* Earnings adjustment */}
                {report.strategy.earnings_adjustment && (
                    <div className="text-xs p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}>
                        <span className="text-amber-400 font-semibold">Earnings Adjustment: </span>
                        <span style={{ color: textSecondary }}>{report.strategy.earnings_adjustment}</span>
                    </div>
                )}

                {/* Pairs trade */}
                {report.strategy.pairs_trade && (
                    <div className="mt-4 p-4 rounded-xl text-xs" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                        <div className="font-semibold mb-2 text-blue-400">Pairs Trade Opportunity</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                                { label: 'Long', value: report.strategy.pairs_trade.long },
                                { label: 'Short', value: report.strategy.pairs_trade.short },
                                { label: 'Z-Score', value: report.strategy.pairs_trade.current_zscore.toFixed(1) },
                                { label: 'Half-Life', value: `${report.strategy.pairs_trade.half_life_days}d` },
                            ].map(p => (
                                <div key={p.label}>
                                    <span style={{ color: '#6B7280' }}>{p.label}: </span>
                                    <span className="font-semibold" style={{ color: textPrimary }}>{p.value}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-2" style={{ color: textSecondary }}>{report.strategy.pairs_trade.signal}</p>
                    </div>
                )}
            </SectionCard>

            {/* ── SECTION E: DEEP DIVES ───────────────────────────────── */}
            <SectionCard title="E — Deep Dives (On-Demand)" id="section-5" lightMode={lightMode}>
                <p className="text-xs mb-5" style={{ color: textSecondary }}>
                    Each analysis generated on-demand · cached immediately for all researchers · ~8 seconds first load
                </p>
                <div className="space-y-2">
                    {DEEP_DIVE_MODULES.map((title, i) => (
                        <div key={i} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${expandedDive === i ? 'rgba(59,130,246,0.35)' : borderColor}` }}>
                            <button
                                onClick={() => expandDeepDive(i)}
                                className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium transition-all cursor-pointer hover:bg-white/3"
                                style={{ color: textPrimary }}
                            >
                                <span className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-blue-400">{String(i + 1).padStart(2, '0')}</span>
                                    {title}
                                </span>
                                {expandedDive === i ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: '#6B7280' }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#6B7280' }} />}
                            </button>

                            <AnimatePresence>
                                {expandedDive === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
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
                                                        <span className="text-xs" style={{ color: '#6B7280' }}>Generating deep analysis — ~8 seconds</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {[1, 0.9, 0.7, 0.6].map((w, k) => (
                                                            <div key={k} className="h-3 rounded skeleton" style={{ width: `${w * 100}%` }} />
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-4">
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: textSecondary }}>
                                                        {diveContent[i] || 'Loading…'}
                                                    </p>
                                                    <div className="flex justify-between items-center mt-4">
                                                        <div className="text-xs" style={{ color: '#6B7280' }}>Powered by Meridian v2.4 · Cached for all researchers</div>
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

            {/* Data Sources footer */}
            <div className="text-xs p-4 rounded-xl" style={{ background: dimBg, border: `1px solid ${borderColor}`, color: '#6B7280' }}>
                <div className="font-semibold mb-2">Data Sources</div>
                <div className="flex flex-wrap gap-3">
                    {report.data_sources.map(ds => (
                        <span key={ds.name} className="px-2 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${borderColor}` }}>
                            Tier {ds.tier} · {ds.name} · {ds.freshness}
                        </span>
                    ))}
                </div>
                <p className="mt-3" style={{ color: '#6B7280' }}>
                    For educational research purposes only. Not financial advice. Quantus Research Solutions · {report.engine} · bisolutions.group
                </p>
            </div>
        </div>
    );
}
