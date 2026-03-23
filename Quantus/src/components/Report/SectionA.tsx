import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import type { ReportData } from '../../types';
import { signalClass, themeColors } from './helpers';
import { SectionCard, Feedback } from './SharedWidgets';

interface Props { report: ReportData; lightMode?: boolean; }

export function SectionA({ report, lightMode }: Props) {
    const [plainEnglish, setPlainEnglish] = useState(false);
    const { textPrimary, textSecondary, dimBg, borderColor } = themeColors(lightMode);

    return (
        <SectionCard title="A — Executive Summary" id="section-1" lightMode={lightMode}>
            <div className="mb-6">
                <p className="text-sm leading-relaxed mb-3" style={{ color: textSecondary }}>
                    {plainEnglish ? report.narrative_plain : report.narrative_executive_summary}
                </p>
                <button onClick={() => setPlainEnglish(p => !p)} className="text-xs text-blue-400 hover:underline cursor-pointer">
                    {plainEnglish ? 'Show full analysis' : 'What does this mean for me? →'}
                </button>
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
                {(report.signal_cards ?? []).map((card) => (
                    <div key={card.label} className="rounded-xl p-4" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-base">{card.icon}</span>
                            <Feedback />
                        </div>
                        <div className="text-xs uppercase tracking-wider mb-1 text-gray-500">{card.label}</div>
                        <div className="font-bold text-sm mb-1" style={{ color: textPrimary }}>{card.value}</div>
                        <div className="text-xs mb-2" style={{ color: textSecondary }}>{card.plain_note}</div>
                        <div className="text-xs text-gray-500">🕒 {card.freshness}</div>
                    </div>
                ))}
            </div>

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

            {report.historical_signals && report.historical_signals.length >= 3 && (
                <div className="mt-5">
                    <div className="text-xs font-semibold uppercase tracking-wider mb-3 text-gray-500">Quantus Accuracy Tracker — {report.ticker}</div>
                    <div className="space-y-2">
                        {report.historical_signals.map((sig, i) => (
                            <div key={i} className="flex items-center gap-3 text-xs rounded-lg px-3 py-2" style={{ background: dimBg }}>
                                <span className="text-gray-500">{sig.date}</span>
                                <span className={`badge ${signalClass(sig.signal)}`} style={{ fontSize: '10px' }}>{sig.signal}</span>
                                <span style={{ color: textSecondary }}>{sig.outcome}</span>
                                <span className="ml-auto font-mono text-xs text-gray-500">{sig.engine}</span>
                                <span>{sig.correct ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <span className="text-red-400">✗</span>}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs mt-2 text-gray-500">Past performance does not guarantee future results.</p>
                </div>
            )}
        </SectionCard>
    );
}
