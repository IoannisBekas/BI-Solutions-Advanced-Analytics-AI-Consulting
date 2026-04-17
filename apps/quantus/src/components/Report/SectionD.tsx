import React from 'react';
import { motion } from 'motion/react';
import { Activity, ArrowRight, BarChart3, ShieldAlert, Target, Waves } from 'lucide-react';
import type { ReportData } from '../../types';
import { signalClass, themeColors } from './helpers';
import { SectionCard, Feedback } from './SharedWidgets';

interface Props { report: ReportData; lightMode?: boolean; }

function parseCurrency(value?: string | number | null) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (!value) return null;
    const match = String(value).replace(/,/g, '').match(/-?\d+(\.\d+)?/);
    return match ? Number(match[0]) : null;
}

function parseRange(value?: string | null) {
    if (!value) return null;
    const matches = String(value).replace(/,/g, '').match(/-?\d+(\.\d+)?/g);
    if (!matches || matches.length === 0) return null;
    if (matches.length === 1) {
        const parsed = Number(matches[0]);
        return Number.isFinite(parsed) ? { min: parsed, max: parsed } : null;
    }

    const [first, second] = matches.map(Number);
    if (!Number.isFinite(first) || !Number.isFinite(second)) return null;
    return {
        min: Math.min(first, second),
        max: Math.max(first, second),
    };
}

function parseRiskReward(value?: string | null) {
    if (!value) return null;
    const matches = String(value).match(/\d+(\.\d+)?/g);
    if (!matches || matches.length < 2) return null;
    const reward = Number(matches[matches.length - 1]);
    return Number.isFinite(reward) ? reward : null;
}

function clampPercent(value: number) {
    return Math.max(0, Math.min(100, value));
}

function formatPrice(value: number | null) {
    return value == null ? 'N/A' : `$${value.toFixed(2)}`;
}

function isShortAction(action: ReportData['strategy']['action']) {
    return action === 'SELL' || action === 'STRONG SELL';
}

function describePriceState(
    current: number | null,
    entry: { min: number; max: number } | null,
    target: number | null,
    stop: number | null,
    isShortSetup: boolean,
) {
    if (current == null || !entry) return 'Live setup map unavailable.';

    if (isShortSetup) {
        if (stop != null && current >= stop) return 'Price is testing or above the short invalidation line.';
        if (target != null && current <= target) return 'Price has already reached or exceeded the downside target.';
        if (current > entry.max) return 'Price is above the preferred short-entry band.';
        if (current < entry.min) return 'Price is below the preferred short-entry band. Wait for rebound discipline.';
        return 'Price is trading inside the preferred short-entry band.';
    }

    if (stop != null && current <= stop) return 'Price is testing or below the invalidation line.';
    if (target != null && current >= target) return 'Price has already reached or exceeded the upside target.';
    if (current < entry.min) return 'Price is below the preferred entry band.';
    if (current > entry.max) {
        return 'Price is above the preferred entry band. Wait for retrace discipline.';
    }
    return 'Price is trading inside the preferred entry band.';
}

function describeSpreadState(zScore: number | null, threshold: number | null) {
    if (zScore == null || threshold == null || threshold <= 0) return 'Spread trigger unavailable.';
    const abs = Math.abs(zScore);
    if (abs >= threshold) return 'Spread is at or beyond the entry threshold.';
    if (abs >= threshold * 0.75) return 'Spread is approaching the entry threshold.';
    return 'Spread is still inside the neutral band.';
}

export function SectionD({ report, lightMode }: Props) {
    const { textPrimary, textSecondary, dimBg, borderColor } = themeColors(lightMode);
    const isShortSetup = isShortAction(report.strategy.action);
    const confidenceWidth = clampPercent(report.strategy.confidence);
    const entryRange = parseRange(report.strategy.entry_zone);
    const currentPrice = parseCurrency(report.current_price);
    const stopPrice = parseCurrency(report.strategy.stop_loss);
    const targetPrice = parseCurrency(report.strategy.target);
    const riskReward = parseRiskReward(report.strategy.risk_reward);
    const pairsZScore = typeof report.strategy.pairs_trade?.current_zscore === 'number'
        ? report.strategy.pairs_trade.current_zscore
        : null;
    const pairsThreshold = typeof report.strategy.pairs_trade?.entry_threshold === 'number'
        ? report.strategy.pairs_trade.entry_threshold
        : null;

    const pathFloorCandidates = [stopPrice, entryRange?.min, entryRange?.max, currentPrice, targetPrice].filter((value): value is number => value != null);
    const pathFloor = pathFloorCandidates.length ? Math.min(...pathFloorCandidates) : null;
    const pathCeiling = pathFloorCandidates.length ? Math.max(...pathFloorCandidates) : null;
    const pathSpan = pathFloor != null && pathCeiling != null ? Math.max(pathCeiling - pathFloor, 0.01) : null;
    const priceToPercent = (value: number | null) => {
        if (value == null || pathFloor == null || pathSpan == null) return 0;
        return clampPercent(((value - pathFloor) / pathSpan) * 100);
    };
    const alignMarker = (value: number | null) => {
        const percent = priceToPercent(value);
        if (percent <= 12) return 'left' as const;
        if (percent >= 88) return 'right' as const;
        return 'center' as const;
    };

    const entryMid = entryRange ? (entryRange.min + entryRange.max) / 2 : null;
    const priceState = describePriceState(currentPrice, entryRange, targetPrice, stopPrice, isShortSetup);
    const spreadState = describeSpreadState(pairsZScore, pairsThreshold);
    const regimeTags = [
        ...report.regime.active_strategies.map((item) => ({ label: item, tone: 'active' as const })),
        ...report.regime.suppressed_strategies.map((item) => ({ label: item, tone: 'suppressed' as const })),
    ];
    const targetLabel = isShortSetup ? 'Downside objective' : 'Upside objective';
    const entrySubLabel = isShortSetup ? 'Preferred short-entry area' : 'Preferred execution area';
    const invalidationSubLabel = isShortSetup ? 'Exit if short thesis breaks' : 'Exit if setup breaks';
    const targetSubLabel = riskReward != null ? `${riskReward.toFixed(1)}x risk / reward` : report.strategy.risk_reward;

    return (
        <SectionCard title="D — Strategy Recommendation" id="section-4" lightMode={lightMode}>
            <div
                className="rounded-2xl p-5 mb-5 overflow-hidden"
                style={{
                    background: lightMode
                        ? 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(16,185,129,0.04))'
                        : 'linear-gradient(135deg, rgba(37,99,235,0.18), rgba(15,118,110,0.12))',
                    border: '1px solid rgba(59,130,246,0.22)',
                }}
            >
                <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className={`badge ${signalClass(report.strategy.action)}`} style={{ fontSize: '14px' }}>{report.strategy.action}</span>
                            <span className="font-bold text-2xl tracking-tight" style={{ color: textPrimary }}>{report.strategy.confidence}% confidence</span>
                            <span
                                className="text-[11px] uppercase tracking-[0.24em] px-2.5 py-1 rounded-full"
                                style={{
                                    color: lightMode ? '#1D4ED8' : '#93C5FD',
                                    background: lightMode ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.45)',
                                    border: `1px solid ${lightMode ? 'rgba(59,130,246,0.18)' : 'rgba(148,163,184,0.18)'}`,
                                }}
                            >
                                Live playbook
                            </span>
                        </div>
                        <div className="text-sm leading-relaxed mb-4 max-w-3xl" style={{ color: textSecondary }}>{report.strategy.regime_context}</div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em]" style={{ color: textSecondary }}>
                                <span>Execution conviction</span>
                                <span>{confidenceWidth}%</span>
                            </div>
                            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: lightMode ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.5)' }}>
                                <motion.div
                                    className="h-full rounded-full"
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${confidenceWidth}%` }}
                                    viewport={{ once: true, margin: '-80px' }}
                                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                    style={{
                                        background: 'linear-gradient(90deg, #60A5FA 0%, #22C55E 55%, #F59E0B 100%)',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <Feedback />
                </div>

                {regimeTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {regimeTags.map((tag) => (
                            <span
                                key={`${tag.tone}-${tag.label}`}
                                className="px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.18em]"
                                style={{
                                    color: tag.tone === 'active'
                                        ? (lightMode ? '#166534' : '#86EFAC')
                                        : (lightMode ? '#9A3412' : '#FDBA74'),
                                    background: tag.tone === 'active'
                                        ? (lightMode ? 'rgba(34,197,94,0.1)' : 'rgba(22,163,74,0.18)')
                                        : (lightMode ? 'rgba(249,115,22,0.1)' : 'rgba(234,88,12,0.16)'),
                                    border: `1px solid ${tag.tone === 'active'
                                        ? (lightMode ? 'rgba(34,197,94,0.2)' : 'rgba(134,239,172,0.2)')
                                        : (lightMode ? 'rgba(249,115,22,0.2)' : 'rgba(253,186,116,0.2)')}`,
                                }}
                            >
                                {tag.tone === 'active' ? 'Active' : 'Suppressed'} · {tag.label}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid lg:grid-cols-[1.45fr_0.95fr] gap-4 mb-5">
                <div className="rounded-2xl p-5" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                    <div className="flex items-center gap-2 mb-2" style={{ color: textPrimary }}>
                        <Activity className="w-4 h-4" />
                        <div className="text-sm font-semibold">Execution Map</div>
                    </div>
                    <div className="text-xs mb-5" style={{ color: textSecondary }}>{priceState}</div>

                    <div className="relative h-26">
                        <div
                            className="absolute left-0 right-0 top-8 h-3 rounded-full"
                            style={{ background: lightMode ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.06)' }}
                        />

                        {entryRange && pathFloor != null && pathSpan != null && (
                            <div
                                className="absolute top-[27px] h-5 rounded-full"
                                style={{
                                    left: `${priceToPercent(entryRange.min)}%`,
                                    width: `${Math.max(priceToPercent(entryRange.max) - priceToPercent(entryRange.min), 4)}%`,
                                    background: lightMode ? 'rgba(37,99,235,0.14)' : 'rgba(96,165,250,0.2)',
                                    border: `1px solid ${lightMode ? 'rgba(37,99,235,0.22)' : 'rgba(147,197,253,0.24)'}`,
                                }}
                            />
                        )}

                        {[
                            {
                                label: 'Stop',
                                value: stopPrice,
                                tone: '#F97316',
                            },
                            {
                                label: 'Entry',
                                value: entryMid,
                                tone: '#3B82F6',
                            },
                            {
                                label: 'Live',
                                value: currentPrice,
                                tone: '#22C55E',
                            },
                            {
                                label: 'Target',
                                value: targetPrice,
                                tone: '#A855F7',
                            },
                        ].filter((item) => item.value != null).map((marker) => (
                            <div
                                key={marker.label}
                                className="absolute top-0"
                                style={{
                                    left: `${priceToPercent(marker.value)}%`,
                                    transform: alignMarker(marker.value) === 'left'
                                        ? 'translateX(0)'
                                        : alignMarker(marker.value) === 'right'
                                            ? 'translateX(-100%)'
                                            : 'translateX(-50%)',
                                }}
                            >
                                <motion.div
                                    initial={{ scale: 0.85, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ once: true, margin: '-60px' }}
                                    transition={{ duration: 0.35 }}
                                    className="flex flex-col items-center gap-2"
                                >
                                    <div className="px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ background: `${marker.tone}14`, color: marker.tone, border: `1px solid ${marker.tone}33` }}>
                                        {marker.label}
                                    </div>
                                    <div className="w-0.5 h-8" style={{ background: `${marker.tone}66` }} />
                                    <div className="w-3 h-3 rounded-full border-2 shadow-sm" style={{ background: lightMode ? '#FFFFFF' : '#0F172A', borderColor: marker.tone }} />
                                    <div className="text-xs font-mono font-semibold whitespace-nowrap" style={{ color: textPrimary }}>
                                        {formatPrice(marker.value)}
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl p-5" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                    <div className="flex items-center gap-2 mb-3" style={{ color: textPrimary }}>
                        <Target className="w-4 h-4" />
                        <div className="text-sm font-semibold">Execution Snapshot</div>
                    </div>
                    <div className="space-y-3">
                        {[
                            {
                                icon: <ArrowRight className="w-3.5 h-3.5" />,
                                label: 'Entry band',
                                value: report.strategy.entry_zone,
                                sub: entrySubLabel,
                                tone: '#3B82F6',
                            },
                            {
                                icon: <Target className="w-3.5 h-3.5" />,
                                label: targetLabel,
                                value: report.strategy.target,
                                sub: targetSubLabel,
                                tone: '#8B5CF6',
                            },
                            {
                                icon: <ShieldAlert className="w-3.5 h-3.5" />,
                                label: 'Invalidation',
                                value: report.strategy.stop_loss,
                                sub: invalidationSubLabel,
                                tone: '#F97316',
                            },
                            {
                                icon: <Waves className="w-3.5 h-3.5" />,
                                label: 'Sizing discipline',
                                value: report.strategy.position_size_pct,
                                sub: `Kelly max ${report.strategy.kelly_derived_max}`,
                                tone: '#10B981',
                            },
                            ...(report.strategy.portfolio_sharpe_improvement ? [
                                {
                                    icon: <BarChart3 className="w-3.5 h-3.5" />,
                                    label: 'Portfolio Sharpe lift',
                                    value: report.strategy.portfolio_sharpe_improvement,
                                    sub: 'Estimated improvement versus current mix',
                                    tone: '#14B8A6',
                                },
                            ] : []),
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="rounded-xl p-3.5"
                                style={{ background: lightMode ? 'rgba(255,255,255,0.78)' : 'rgba(15,23,42,0.38)', border: `1px solid ${borderColor}` }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${item.tone}14`, color: item.tone }}>
                                        {item.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[11px] uppercase tracking-[0.2em] mb-1" style={{ color: textSecondary }}>{item.label}</div>
                                        <div className="font-mono font-bold text-lg leading-none mb-1" style={{ color: textPrimary }}>{item.value}</div>
                                        <div className="text-xs leading-relaxed" style={{ color: textSecondary }}>{item.sub}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {report.strategy.scenario_targets && (
                <div className="mt-4 p-5 rounded-2xl" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <div className="font-semibold" style={{ color: textPrimary }}>Scenario Targets</div>
                        <div className="flex items-center gap-2">
                            {report.strategy.scenario_targets.conviction && (
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full" style={{
                                    color: report.strategy.scenario_targets.conviction === 'HIGH' ? '#10B981' : report.strategy.scenario_targets.conviction === 'LOW' ? '#F59E0B' : textSecondary,
                                    background: report.strategy.scenario_targets.conviction === 'HIGH' ? 'rgba(16,185,129,0.1)' : report.strategy.scenario_targets.conviction === 'LOW' ? 'rgba(245,158,11,0.1)' : dimBg,
                                    border: `1px solid ${borderColor}`,
                                }}>
                                    {report.strategy.scenario_targets.conviction} conviction
                                </span>
                            )}
                            {report.strategy.scenario_targets.time_horizon && (
                                <span className="text-xs" style={{ color: textSecondary }}>{report.strategy.scenario_targets.time_horizon}</span>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { key: 'bear' as const, label: 'Bear Case', color: '#EF4444', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.18)' },
                            { key: 'base' as const, label: 'Base Case', color: textSecondary, bg: dimBg, border: borderColor },
                            { key: 'bull' as const, label: 'Bull Case', color: '#10B981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.18)' },
                        ].map(scenario => {
                            const data = report.strategy.scenario_targets![scenario.key];
                            return (
                                <div key={scenario.key} className="rounded-xl p-4 text-center" style={{ background: scenario.bg, border: `1px solid ${scenario.border}` }}>
                                    <div className="text-[10px] uppercase tracking-[0.18em] mb-2" style={{ color: scenario.color }}>{scenario.label}</div>
                                    <div className="text-xl font-bold font-mono metric-value" style={{ color: scenario.color }}>${data.price.toFixed(2)}</div>
                                    {data.label && <div className="text-xs mt-1.5" style={{ color: textSecondary }}>{data.label}</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {report.strategy.earnings_adjustment && (
                <div className="text-xs p-3.5 rounded-2xl mb-4 mt-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}>
                    <span className="font-semibold" style={{ color: lightMode ? '#B45309' : '#FCD34D' }}>Earnings Adjustment: </span>
                    <span style={{ color: textSecondary }}>{report.strategy.earnings_adjustment}</span>
                </div>
            )}

            {report.strategy.pairs_trade && (
                <div className="mt-4 p-5 rounded-2xl" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                        <div>
                            <div className="font-semibold mb-1" style={{ color: lightMode ? '#2563EB' : '#60A5FA' }}>Pairs Trade Opportunity</div>
                            <p className="text-xs max-w-2xl" style={{ color: textSecondary }}>{spreadState}</p>
                        </div>
                        <div className="text-[11px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full" style={{ color: textPrimary, background: lightMode ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.45)', border: `1px solid ${borderColor}` }}>
                            Mean reversion map
                        </div>
                    </div>

                    <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-4">
                        <div className="rounded-xl p-4" style={{ background: lightMode ? 'rgba(255,255,255,0.78)' : 'rgba(15,23,42,0.38)', border: `1px solid ${borderColor}` }}>
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: textSecondary }}>Spread trigger</div>
                                    <div className="text-lg font-semibold" style={{ color: textPrimary }}>
                                        Z-score {pairsZScore != null ? pairsZScore.toFixed(1) : 'N/A'}
                                    </div>
                                </div>
                                <div className="text-xs" style={{ color: textSecondary }}>
                                    Trigger at {pairsThreshold != null ? `±${pairsThreshold.toFixed(1)}` : 'N/A'}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: lightMode ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.06)' }}>
                                    <motion.div
                                        className="h-full rounded-full"
                                        initial={{ width: 0 }}
                                        whileInView={{
                                            width: `${clampPercent(
                                                pairsZScore != null && pairsThreshold != null && pairsThreshold > 0
                                                    ? (Math.abs(pairsZScore) / pairsThreshold) * 100
                                                    : 0,
                                            )}%`,
                                        }}
                                        viewport={{ once: true, margin: '-60px' }}
                                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                        style={{ background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 55%, #F97316 100%)' }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[11px]" style={{ color: textSecondary }}>
                                    <span>Neutral spread</span>
                                    <span>Entry threshold</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Long', value: report.strategy.pairs_trade.long },
                                { label: 'Short', value: report.strategy.pairs_trade.short },
                                { label: 'Half-life', value: `${report.strategy.pairs_trade.half_life_days}d` },
                                { label: 'Cointegration', value: report.strategy.pairs_trade.cointegration ? report.strategy.pairs_trade.cointegration.toFixed(2) : 'N/A' },
                            ].map((item) => (
                                <div key={item.label} className="rounded-xl p-3" style={{ background: lightMode ? 'rgba(255,255,255,0.78)' : 'rgba(15,23,42,0.38)', border: `1px solid ${borderColor}` }}>
                                    <div className="text-[11px] uppercase tracking-[0.2em] mb-1" style={{ color: textSecondary }}>{item.label}</div>
                                    <div className="font-semibold" style={{ color: textPrimary }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="mt-4 text-xs leading-relaxed" style={{ color: textSecondary }}>{report.strategy.pairs_trade.signal}</p>
                </div>
            )}
        </SectionCard>
    );
}
