import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ReportData } from '../../types';
import { themeColors } from './helpers';
import { SectionCard, ExplainButton, Feedback } from './SharedWidgets';

interface Props { report: ReportData; lightMode?: boolean; }

export function SectionB({ report, lightMode }: Props) {
    const [activeTab, setActiveTab] = useState<'forecast' | 'momentum' | 'sentiment' | 'altdata'>('forecast');
    const { textPrimary, textSecondary, dimBg, borderColor } = themeColors(lightMode);

    return (
        <SectionCard title="B — Opportunity" id="section-2" lightMode={lightMode}>
            <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
                {(['forecast', 'momentum', 'sentiment', 'altdata'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-btn ${activeTab === tab ? 'active' : ''}`}>
                        {tab === 'altdata' ? 'Alternative Data' : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                                        <span>Weight: <strong style={{ color: textSecondary }}>{m.weight}</strong></span>
                                        <span>Acc: <strong style={{ color: textSecondary }}>{m.accuracy}</strong></span>
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
                            Regime: <span style={{ color: '#F9FAFB' }}>{report.regime?.label ?? 'Unknown'}</span> — {report.regime?.implication ?? ''}
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {[
                                { label: 'RSI', value: '67.3', note: 'Approaching overbought', ok: true },
                                { label: 'MACD', value: '+1.84', note: 'Positive crossover', ok: true },
                                { label: 'BB Position', value: '68th %ile', note: 'Upper band proximity', ok: false },
                            ].map(m => (
                                <div key={m.label} className="rounded-xl p-3 text-center" style={{ background: dimBg, border: `1px solid ${m.ok ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                                    <div className="text-xs mb-1 text-gray-500">{m.label}</div>
                                    <div className="text-xl font-bold font-mono metric-value" style={{ color: m.ok ? '#10B981' : '#F59E0B' }}>{m.value}</div>
                                    <div className="text-xs mt-1" style={{ color: textSecondary }}>{m.note}</div>
                                    <ExplainButton contextText={`${m.label}: ${m.value} - ${m.note}`} lightMode={lightMode} />
                                </div>
                            ))}
                        </div>
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
            </AnimatePresence>
        </SectionCard>
    );
}
