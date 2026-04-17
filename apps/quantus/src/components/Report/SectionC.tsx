import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { ReportData } from '../../types';
import { themeColors } from './helpers';
import { SectionCard, MetricCard, Feedback } from './SharedWidgets';

interface Props { report: ReportData; lightMode?: boolean; }

export function SectionC({ report, lightMode }: Props) {
    const { textPrimary, textSecondary, dimBg, borderColor } = themeColors(lightMode);

    return (
        <SectionCard title="C — Risk" id="section-3" lightMode={lightMode}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                    { label: 'Fed Funds Rate', value: report.risk?.macro_context?.fed_rate ?? 'N/A' },
                    { label: 'Yield Curve', value: report.risk?.macro_context?.yield_curve ?? 'N/A' },
                    { label: 'VIX', value: report.risk?.macro_context?.vix ?? 'N/A' },
                    { label: 'IG Spreads', value: report.risk?.macro_context?.credit_spreads ?? 'N/A' },
                ].map(m => (
                    <div key={m.label} className="rounded-lg p-4 text-center" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                        <div className="text-xs mb-1 text-gray-500">{m.label}</div>
                        <div className="font-mono text-sm font-semibold" style={{ color: textPrimary }}>{m.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <MetricCard label="Daily VaR (99%)" value={`${report.risk?.var_dollar ?? 'N/A'} / $10K`} note="Monte Carlo · 10,000 paths" freshness="Daily" lightMode={lightMode} />
                <MetricCard label="Expected Shortfall" value={report.risk?.expected_shortfall ?? 'N/A'} lightMode={lightMode} />
                <MetricCard label="Max Drawdown" value={report.risk?.max_drawdown ?? 'N/A'} lightMode={lightMode} />
                <MetricCard label="Sharpe Ratio" value={typeof report.risk?.sharpe_ratio === 'number' ? report.risk.sharpe_ratio.toFixed(2) : String(report.risk?.sharpe_ratio ?? 'N/A')} note={report.risk?.peer_avg_sharpe ? `vs. peer avg: ${report.risk.peer_avg_sharpe}` : undefined} lightMode={lightMode} />
            </div>

            <div className="text-xs font-semibold uppercase tracking-wider mb-3 text-gray-500">Historical Stress Scenarios</div>
            <div className="rounded-xl overflow-hidden mb-4" style={{ border: `1px solid ${borderColor}` }}>
                <div className="grid grid-cols-3 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500" style={{ background: dimBg }}>
                    <span>Scenario</span><span className="text-center">Return</span><span className="text-right">Recovery</span>
                </div>
                {(report.risk?.stress_tests ?? []).map((t, i) => (
                    <div key={i} className="grid grid-cols-3 px-4 py-3 text-sm border-t" style={{ borderColor }}>
                        <span style={{ color: textSecondary }}>{t.scenario}</span>
                        <span className="text-center font-mono font-semibold text-red-400">{t.return}</span>
                        <span className="text-right text-xs" style={{ color: textSecondary }}>{t.recovery}</span>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-3 text-xs p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span style={{ color: textSecondary }}>Volatility vs. peers: <strong style={{ color: '#F9FAFB' }}>{report.risk?.volatility_vs_peers ?? 'N/A'}</strong> · Options-implied move: {report.risk?.implied_move ?? 'N/A'}</span>
            </div>
            <div className="flex justify-end mt-3"><Feedback /></div>
        </SectionCard>
    );
}
