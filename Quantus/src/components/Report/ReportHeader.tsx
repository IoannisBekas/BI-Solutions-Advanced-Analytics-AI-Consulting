import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Download, Bell, Bookmark, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import type { ReportData } from '../../types';
import { signalClass, regimeClass, themeColors } from './helpers';
import { Feedback } from './SharedWidgets';

interface Props { report: ReportData; lightMode?: boolean; }

export function ReportHeader({ report, lightMode }: Props) {
    const [showConfBreakdown, setShowConfBreakdown] = useState(false);
    const { textPrimary, textSecondary, dimBg, borderColor } = themeColors(lightMode);

    return (
        <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface-card p-5 mb-6 print-section"
            style={{ background: lightMode ? 'rgba(255,255,255,0.95)' : '#111827', borderColor }}
        >
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
                <div className="flex flex-col items-end gap-2">
                    <div className={`badge ${signalClass(report.overall_signal)} text-base px-4 py-2`} style={{ fontSize: '13px' }}>
                        {report.overall_signal}
                    </div>
                    <div style={{ color: textSecondary, fontSize: '12px' }}>Confidence: <span className="font-bold">{report.confidence_score}%</span></div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`regime-badge ${regimeClass(report.regime.label)}`}>{report.regime.label}</span>
                <span className="text-xs" style={{ color: textSecondary }}>{report.regime.implication}</span>
            </div>

            {report.cross_ticker_alerts?.map((alert, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg mb-3 text-xs"
                    style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)' }}>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="text-amber-400 font-semibold">{alert.related_ticker} — {alert.event}</span>
                    <span style={{ color: '#9CA3AF' }}>· {alert.impact}</span>
                </div>
            ))}

            <button onClick={() => setShowConfBreakdown(!showConfBreakdown)}
                className="flex items-center gap-2 text-xs cursor-pointer mb-2" style={{ color: '#6B7280' }}>
                {showConfBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                Confidence breakdown — {report.confidence_score}% overall
            </button>
            <AnimatePresence>
                {showConfBreakdown && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
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

            <div className="flex flex-wrap gap-2 mt-3 no-print">
                {[
                    { icon: Download, label: 'Print Report', action: () => window.print() },
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
    );
}
