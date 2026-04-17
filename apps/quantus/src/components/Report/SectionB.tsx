import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ReportData } from '../../types';
import { themeColors, displayMetric, formatPercent, formatRatio } from './helpers';
import { SectionCard, ExplainButton, Feedback } from './SharedWidgets';

interface Props { report: ReportData; lightMode?: boolean; }

export function SectionB({ report, lightMode }: Props) {
    const [activeTab, setActiveTab] = useState<'forecast' | 'momentum' | 'sentiment' | 'altdata' | 'fundamentals'>('forecast');
    const { textPrimary, textSecondary, dimBg, borderColor } = themeColors(lightMode);

    const tabLabels: Record<typeof activeTab, string> = {
        forecast: 'Forecast', momentum: 'Momentum', sentiment: 'Sentiment',
        altdata: 'Alternative Data', fundamentals: 'Fundamentals',
    };

    return (
        <SectionCard title="B — Opportunity" id="section-2" lightMode={lightMode}>
            <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
                {(['forecast', 'momentum', 'sentiment', 'altdata', 'fundamentals'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-btn ${activeTab === tab ? 'active' : ''}`}>
                        {tabLabels[tab]}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'forecast' && (
                    <motion.div key="forecast" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
                        <div className="mb-4 p-4 rounded-xl" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                            <div className="text-2xl font-bold font-mono metric-value mb-1 text-blue-500">{report.model_ensemble?.ensemble_forecast ?? 'N/A'}</div>
                            <div className="text-xs" style={{ color: textSecondary }}>
                                Ensemble forecast · 30 days · Band: {report.model_ensemble?.confidence_band?.low ?? 'N/A'} to {report.model_ensemble?.confidence_band?.high ?? 'N/A'}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                            {[
                                { name: 'LSTM', ...(report.model_ensemble?.lstm ?? {}), color: '#8B5CF6' },
                                { name: 'Prophet', ...(report.model_ensemble?.prophet ?? {}), color: '#F97316' },
                                { name: 'ARIMA', ...(report.model_ensemble?.arima ?? {}), color: '#14B8A6' },
                            ].map(m => (
                                <div key={m.name} className="rounded-xl p-3" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                                    <div className="text-xs font-semibold mb-2" style={{ color: m.color }}>{m.name}</div>
                                    <div className="text-xl font-bold font-mono metric-value" style={{ color: textPrimary }}>{m.forecast}</div>
                                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                        <span>Weight: <strong style={{ color: textSecondary }}>{displayMetric(m.weight)}</strong></span>
                                        <span>Acc: <strong style={{ color: textSecondary }}>{displayMetric(m.accuracy)}</strong></span>
                                    </div>
                                    <ExplainButton contextText={`${m.name} Model Forecast: ${m.forecast}`} lightMode={lightMode} />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: textSecondary }}>{report.model_ensemble?.regime_accuracy_note ?? ''}</p>
                        <div className="flex items-center justify-between mt-3"><div /><Feedback /></div>
                    </motion.div>
                )}

                {activeTab === 'momentum' && (
                    <motion.div key="momentum" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        <div className="p-3 rounded-xl mb-4 text-xs font-semibold" style={{ background: dimBg, border: `1px solid ${borderColor}`, color: textSecondary }}>
                            Regime: <span style={{ color: textPrimary }}>{report.regime?.label ?? 'Unknown'}</span> — {report.regime?.implication ?? ''}
                        </div>
                        {report.momentum ? (
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {[
                                    { label: 'RSI', value: report.momentum.rsi != null ? report.momentum.rsi.toFixed(1) : '\u2014', note: report.momentum.rsi_note ?? '', ok: report.momentum.rsi != null && report.momentum.rsi < 70 },
                                    { label: 'MACD', value: report.momentum.macd != null ? `${report.momentum.macd >= 0 ? '+' : ''}${report.momentum.macd.toFixed(2)}` : '\u2014', note: report.momentum.macd_note ?? '', ok: report.momentum.macd != null && report.momentum.macd > 0 },
                                    { label: 'BB Position', value: report.momentum.bollinger_position != null ? `${report.momentum.bollinger_position.toFixed(0)}th %ile` : '\u2014', note: report.momentum.bollinger_note ?? '', ok: report.momentum.bollinger_position != null && report.momentum.bollinger_position < 80 },
                                ].map(m => (
                                    <div key={m.label} className="rounded-xl p-3 text-center" style={{ background: dimBg, border: `1px solid ${m.ok ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                                        <div className="text-xs mb-1 text-gray-500">{m.label}</div>
                                        <div className="text-xl font-bold font-mono metric-value" style={{ color: m.ok ? '#10B981' : '#F59E0B' }}>{m.value}</div>
                                        <div className="text-xs mt-1" style={{ color: textSecondary }}>{m.note}</div>
                                        <ExplainButton contextText={`${m.label}: ${m.value} - ${m.note}`} lightMode={lightMode} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-sm" style={{ color: textSecondary }}>No momentum data available for this report.</div>
                        )}
                        <div className="flex justify-end mt-3"><Feedback /></div>
                    </motion.div>
                )}

                {activeTab === 'sentiment' && (
                    <motion.div key="sentiment" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        <div className="space-y-3 mb-4">
                            {[
                                { label: 'X Sentiment (Grok API)', score: report.alternative_data?.grok_x_sentiment?.score ?? 0, color: '#3B82F6' },
                                { label: 'Reddit Sentiment', score: report.alternative_data?.reddit_score ?? 0, color: '#F97316' },
                                { label: 'News Sentiment', score: report.alternative_data?.news_score ?? 0, color: '#8B5CF6' },
                                { label: 'Composite', score: report.alternative_data?.composite_sentiment ?? 0, color: '#10B981' },
                            ].map(s => (
                                <div key={s.label} className="rounded-xl p-3" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</span>
                                        <span className="font-mono font-bold text-sm" style={{ color: (s.score ?? 0) >= 0.5 ? '#10B981' : (s.score ?? 0) >= 0 ? '#F59E0B' : '#EF4444' }}>
                                            {(s.score ?? 0) >= 0 ? '+' : ''}{((s.score ?? 0) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="progress-bar mb-2">
                                        <div className="progress-fill" style={{ width: `${((s.score ?? 0) + 1) / 2 * 100}%`, background: s.color }} />
                                    </div>
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
                                { label: 'Institutional Flow (13F)', value: report.alternative_data?.institutional_flow ?? 'N/A' },
                                { label: 'Insider Activity', value: report.alternative_data?.insider_activity ?? 'N/A' },
                                { label: 'Short Interest', value: report.alternative_data?.short_interest ?? 'N/A' },
                                { label: 'IV Rank', value: report.alternative_data?.iv_rank ?? 'N/A' },
                                { label: 'Options Implied Move', value: report.alternative_data?.implied_move ?? 'N/A' },
                                { label: 'Earnings Call NLP', value: report.alternative_data?.transcript_score ?? 'N/A' },
                            ].map(item => (
                                <div key={item.label} className="rounded-xl p-3" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                                    <div className="text-xs mb-1 text-gray-500">{item.label}</div>
                                    <div className="font-semibold text-sm" style={{ color: textPrimary }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end mt-3"><Feedback /></div>
                    </motion.div>
                )}

                {activeTab === 'fundamentals' && (
                    <motion.div key="fundamentals" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        {report.fundamentals ? (() => {
                            const f = report.fundamentals;
                            const sections = [
                                { title: 'Valuation', items: [
                                    { label: 'P/E', value: formatRatio(f.pe_ratio) },
                                    { label: 'Forward P/E', value: formatRatio(f.forward_pe) },
                                    { label: 'PEG', value: formatRatio(f.peg_ratio) },
                                    { label: 'P/S', value: formatRatio(f.ps_ratio) },
                                    { label: 'P/B', value: formatRatio(f.pb_ratio) },
                                    { label: 'EV/EBITDA', value: formatRatio(f.ev_ebitda) },
                                ]},
                                { title: 'Profitability', items: [
                                    { label: 'Gross Margin', value: formatPercent(f.gross_margin) },
                                    { label: 'Operating Margin', value: formatPercent(f.operating_margin) },
                                    { label: 'Net Margin', value: formatPercent(f.net_margin) },
                                    { label: 'ROE', value: formatPercent(f.roe) },
                                    { label: 'ROA', value: formatPercent(f.roa) },
                                    { label: 'ROIC', value: formatPercent(f.roic) },
                                ]},
                                { title: 'Balance Sheet', items: [
                                    { label: 'Debt/Equity', value: formatRatio(f.debt_to_equity) },
                                    { label: 'Current Ratio', value: formatRatio(f.current_ratio) },
                                    { label: 'Interest Coverage', value: formatRatio(f.interest_coverage, 1) },
                                    { label: 'FCF Yield', value: formatPercent(f.free_cash_flow_yield) },
                                    { label: 'Dividend Yield', value: formatPercent(f.dividend_yield) },
                                    { label: 'Payout Ratio', value: formatPercent(f.payout_ratio) },
                                ]},
                                { title: 'Growth', items: [
                                    { label: 'Revenue Growth (YoY)', value: formatPercent(f.revenue_growth_yoy) },
                                    { label: 'Earnings Growth (YoY)', value: formatPercent(f.earnings_growth_yoy) },
                                ]},
                            ];
                            return (
                                <div className="space-y-5">
                                    {sections.map(section => (
                                        <div key={section.title}>
                                            <div className="text-xs font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: textSecondary }}>{section.title}</div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {section.items.map(item => (
                                                    <div key={item.label} className="rounded-xl p-3" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                                                        <div className="text-xs mb-1 text-gray-500">{item.label}</div>
                                                        <div className="font-bold font-mono text-sm metric-value" style={{ color: textPrimary }}>{item.value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {f.dcf_fair_value != null && (
                                        <div className="p-4 rounded-xl" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                                            <div className="text-xs font-semibold uppercase tracking-[0.18em] mb-2 text-blue-500">DCF Fair Value</div>
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-2xl font-bold font-mono metric-value text-blue-500">${f.dcf_fair_value.toFixed(2)}</span>
                                                {f.dcf_upside_pct != null && (
                                                    <span className="text-sm font-semibold" style={{ color: f.dcf_upside_pct >= 0 ? '#10B981' : '#EF4444' }}>
                                                        {f.dcf_upside_pct >= 0 ? '+' : ''}{f.dcf_upside_pct.toFixed(1)}% upside
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {report.peer_group?.length > 0 && (
                                        <div>
                                            <div className="text-xs font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: textSecondary }}>Peer Group</div>
                                            <div className="flex flex-wrap gap-2">
                                                {report.peer_group.map(peer => (
                                                    <span key={peer} className="px-2.5 py-1 rounded-full text-xs font-mono font-medium" style={{ background: dimBg, border: `1px solid ${borderColor}`, color: textPrimary }}>
                                                        {peer}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-end mt-3"><Feedback /></div>
                                </div>
                            );
                        })() : (
                            <div className="text-center py-8 text-sm" style={{ color: textSecondary }}>No fundamentals data available for this report.</div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </SectionCard>
    );
}
