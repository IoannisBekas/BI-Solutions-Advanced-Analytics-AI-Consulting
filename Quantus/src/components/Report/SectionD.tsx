import React from 'react';
import type { ReportData } from '../../types';
import { signalClass, themeColors } from './helpers';
import { SectionCard, Feedback } from './SharedWidgets';

interface Props { report: ReportData; lightMode?: boolean; }

export function SectionD({ report, lightMode }: Props) {
    const { textPrimary, textSecondary, dimBg, borderColor } = themeColors(lightMode);

    return (
        <SectionCard title="D — Strategy Recommendation" id="section-4" lightMode={lightMode}>
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                    { label: 'Entry Zone', value: report.strategy.entry_zone },
                    { label: 'Price Target', value: report.strategy.target },
                    { label: 'Stop-Loss', value: report.strategy.stop_loss },
                    { label: 'Risk / Reward', value: report.strategy.risk_reward },
                ].map(item => (
                    <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                        <div className="text-xs mb-1 text-gray-500">{item.label}</div>
                        <div className="font-mono font-bold" style={{ color: textPrimary }}>{item.value}</div>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-3 text-xs mb-4">
                {[
                    { label: 'Position Size', value: report.strategy.position_size_pct },
                    { label: 'Kelly Max', value: report.strategy.kelly_derived_max },
                    ...(report.strategy.portfolio_sharpe_improvement ? [{ label: 'Portfolio Sharpe ΔΔ', value: report.strategy.portfolio_sharpe_improvement }] : []),
                ].map(item => (
                    <div key={item.label} className="rounded-lg px-3 py-2 flex items-center gap-2" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                        <span className="text-gray-500">{item.label}:</span>
                        <span className="font-semibold" style={{ color: textPrimary }}>{item.value}</span>
                    </div>
                ))}
            </div>

            {report.strategy.earnings_adjustment && (
                <div className="text-xs p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}>
                    <span className="text-amber-400 font-semibold">Earnings Adjustment: </span>
                    <span style={{ color: textSecondary }}>{report.strategy.earnings_adjustment}</span>
                </div>
            )}

            {report.strategy.pairs_trade && (
                <div className="mt-4 p-4 rounded-xl text-xs" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                    <div className="font-semibold mb-2 text-blue-400">Pairs Trade Opportunity</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                            { label: 'Long', value: report.strategy.pairs_trade.long },
                            { label: 'Short', value: report.strategy.pairs_trade.short },
                            { label: 'Z-Score', value: typeof report.strategy.pairs_trade?.current_zscore === 'number' ? report.strategy.pairs_trade.current_zscore.toFixed(1) : 'N/A' },
                            { label: 'Half-Life', value: `${report.strategy.pairs_trade.half_life_days}d` },
                        ].map(p => (
                            <div key={p.label}>
                                <span className="text-gray-500">{p.label}: </span>
                                <span className="font-semibold" style={{ color: textPrimary }}>{p.value}</span>
                            </div>
                        ))}
                    </div>
                    <p className="mt-2" style={{ color: textSecondary }}>{report.strategy.pairs_trade.signal}</p>
                </div>
            )}
        </SectionCard>
    );
}
