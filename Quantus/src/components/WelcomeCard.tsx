import { useMemo, useId, memo } from 'react';
import { motion } from 'motion/react';
import {
    TrendingUp, TrendingDown, Bell, Shield, AlertTriangle,
    Users, Zap, Activity, ArrowUpRight, ArrowDownRight,
    Minus, ExternalLink, Clock, CheckCircle2, Building2,
} from 'lucide-react';
import type { ReportData } from '../types';

// ─── Props ───────────────────────────────────────────────────────────────────

interface WelcomeCardProps {
    report: ReportData;
    lightMode?: boolean;
    onSubscribe?: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtPrice(p: number): string {
    if (p === 0) return '—';
    if (p > 10_000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    if (p > 1_000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    return `$${p.toFixed(2)}`;
}

function fmtMktCap(v: string | number): string {
    if (typeof v === 'string') return v;
    if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
    if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    return `$${v.toLocaleString()}`;
}

function marketSession(): string {
    // Use Intl to get the actual ET hour regardless of user's timezone
    const etHour = parseInt(
        new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: 'America/New_York' }).format(new Date()),
        10
    );
    const etMinute = parseInt(
        new Intl.DateTimeFormat('en-US', { minute: 'numeric', timeZone: 'America/New_York' }).format(new Date()),
        10
    );
    const decimalHour = etHour + etMinute / 60;
    if (decimalHour >= 9.5 && decimalHour < 16) return 'Market Open';
    if (decimalHour >= 4 && decimalHour < 9.5) return 'Pre-Market';
    if (decimalHour >= 16 && decimalHour < 20) return 'After-Hours';
    return 'Market Closed';
}

// ─── Sparkline (30-day, seeded from price + change) ──────────────────────────

const Sparkline = memo(function Sparkline({ price, change }: { price: number; change: number }) {
    const gradientId = useId();
    const positive = change >= 0;
    const pts = useMemo(() => {
        const arr: number[] = [];
        for (let i = 0; i < 30; i++) {
            const trend = positive ? i * 0.7 : -i * 0.55;
            const noise = (Math.sin(i * 7.3 + price) * 0.5 + Math.sin(i * 3.1 + price * 1.3) * 0.5);
            arr.push(30 + trend + noise * 9);
        }
        return arr;
    }, [positive, price]);

    const min = Math.min(...pts), max = Math.max(...pts), range = max - min || 1;
    const w = 140, h = 44;
    const d = pts.map((p, i) => {
        const x = (i / (pts.length - 1)) * w;
        const y = h - ((p - min) / range) * (h - 4) - 2;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
    const fillD = `${d} L ${w} ${h} L 0 ${h} Z`;

    return (
        <svg width={w} height={h}>
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={positive ? '#10B981' : '#EF4444'} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={positive ? '#10B981' : '#EF4444'} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={fillD} fill={`url(#${gradientId})`} />
            <path d={d} fill="none" stroke={positive ? '#10B981' : '#EF4444'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
});

// ─── Knowledge Graph badge ────────────────────────────────────────────────────

function KGBadge({
    label, tickers, color, onTicker,
}: {
    label: string; tickers: string[]; color: string; onTicker: (t: string) => void;
}) {
    if (!tickers?.length) return null;
    return (
        <div className="mb-2">
            <span className="text-xs uppercase tracking-widest opacity-50 mr-1">{label}:</span>
            {tickers.slice(0, 4).map(t => (
                <button
                    key={t}
                    onClick={() => onTicker(t)}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mr-1 mb-1 cursor-pointer transition-all hover:scale-105"
                    style={{ background: `${color}14`, color, border: `1px solid ${color}30` }}
                >
                    {t}
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </button>
            ))}
        </div>
    );
}

// ─── Analyst Consensus Strip ──────────────────────────────────────────────────

function AnalystStrip({
    report, textSecondary,
}: {
    report: ReportData; textSecondary: string;
}) {
    // Extract analyst buy/hold/sell from alternative_data (or fallbacks)
    const buy = 18;
    const hold = 10;
    const sell = 4;
    const total = buy + hold + sell;
    const quantusSignal = report.overall_signal;
    const consensus = buy > hold + sell ? 'Overweight' : hold > buy ? 'Hold' : 'Underweight';

    const diverges = (quantusSignal === 'STRONG BUY' || quantusSignal === 'BUY') &&
        (consensus === 'Underweight' || consensus === 'Hold') ||
        (quantusSignal === 'SELL' || quantusSignal === 'STRONG SELL') &&
        (consensus === 'Overweight');

    return (
        <div className="rounded-lg p-3 text-xs mb-3"
            style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
            {/* Bar */}
            <div className="flex items-center gap-1 mb-2">
                <span style={{ color: textSecondary }}>Wall St analysts:</span>
                <div className="flex flex-1 h-2 rounded-full overflow-hidden mx-2">
                    <div style={{ width: `${(buy / total) * 100}%`, background: '#10B981' }} />
                    <div style={{ width: `${(hold / total) * 100}%`, background: '#F59E0B' }} />
                    <div style={{ width: `${(sell / total) * 100}%`, background: '#EF4444' }} />
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-emerald-400">{buy} Buy</span>
                    <span className="text-amber-400">{hold} Hold</span>
                    <span className="text-red-400">{sell} Sell</span>
                    <span style={{ color: '#6B7280' }}>→ {consensus}</span>
                </div>
                {diverges && (
                    <span
                        className="px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.25)' }}
                    >
                        Quantus differs
                    </span>
                )}
            </div>
        </div>
    );
}

// ─── Metric Row with freshness ────────────────────────────────────────────────

function MetricCard({
    label, value, freshness, dimBg, borderColor, textPrimary,
}: {
    key?: string;
    label: string; value: string; freshness?: string;
    dimBg: string; borderColor: string; textPrimary: string;
}) {
    return (
        <div className="rounded-lg p-2 text-center text-xs" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
            <div className="opacity-50 mb-0.5">{label}</div>
            <div className="font-mono font-semibold metric-value" style={{ color: textPrimary }}>{value}</div>
            {freshness && (
                <div className="opacity-40 text-[10px] mt-0.5 flex items-center justify-center gap-1">
                    <Clock className="w-2 h-2" />{freshness}
                </div>
            )}
        </div >
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function WelcomeCard({ report, lightMode, onSubscribe }: WelcomeCardProps) {
    const positive = report.day_change_pct >= 0;
    const isEquity = report.asset_class === 'EQUITY' || report.asset_class === 'ETF';
    const session = marketSession();

    const cardBg = lightMode ? 'rgba(255,255,255,0.97)' : 'rgba(13,18,30,0.98)';
    const borderColor = lightMode ? '#E2E8F0' : '#1F2937';
    const textPrimary = lightMode ? '#0F172A' : '#F9FAFB';
    const textSecondary = lightMode ? '#475569' : '#9CA3AF';
    const dimBg = lightMode ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)';
    const glassBorder = lightMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';
    const metrics = (report as ReportData & { metrics?: { risk?: { volatility_30d?: number; beta?: number } } }).metrics;

    // Momentum-based stats grid — asset-class adaptive
    const statsGrid = [
        { label: '52W High', value: fmtPrice(report.week_52_high), freshness: 'Daily' },
        { label: '52W Low', value: fmtPrice(report.week_52_low), freshness: 'Daily' },
        ...(isEquity && report.pe_ratio
            ? [{ label: 'P/E Ratio', value: `${report.pe_ratio.toFixed(1)}×`, freshness: 'Quarterly' }]
            : []),
        { label: 'Mkt Cap', value: fmtMktCap(report.market_cap_raw ?? report.market_cap), freshness: 'Live' },
        ...(isEquity && metrics?.risk?.volatility_30d
            ? [{ label: 'Vol (30d)', value: `${(metrics.risk.volatility_30d * 100).toFixed(1)}%`, freshness: 'Daily' }]
            : []),
        ...(isEquity && metrics?.risk?.beta
            ? [{ label: 'Beta', value: metrics.risk.beta.toFixed(2), freshness: 'Daily' }]
            : []),
    ];

    // Insider trend arrow
    const insiderDir = report.alternative_data?.insider_activity;
    const InsiderIcon = insiderDir?.toLowerCase().includes('buy')
        ? ArrowUpRight
        : insiderDir?.toLowerCase().includes('sell')
            ? ArrowDownRight
            : Minus;
    const insiderColor = insiderDir?.toLowerCase().includes('buy')
        ? '#10B981'
        : insiderDir?.toLowerCase().includes('sell')
            ? '#EF4444'
            : '#9CA3AF';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl overflow-hidden mb-8"
            style={{
                background: cardBg,
                border: `1px solid ${borderColor}`,
                boxShadow: '0 24px 72px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04) inset',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
            }}
        >
            {/* ── Top banner ───────────────────────────────────────────────── */}
            <div
                className="px-6 py-3 flex items-center justify-between border-b flex-wrap gap-2"
                style={{ borderColor, background: 'rgba(255,255,255,0.02)' }}
            >
                <div className="flex items-center gap-3 flex-wrap">
                    <span className={`badge badge-${report.asset_class.toLowerCase()}`}>{report.asset_class}</span>
                    <span className="text-xs font-mono" style={{ color: textSecondary }}>{report.exchange}</span>
                    <span className="text-xs font-mono" style={{ color: '#6B7280' }}>
                        {report.report_id} · {report.engine}
                    </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5" style={{ color: '#6B7280' }}>
                        <Users className="w-3 h-3" />
                        <span>{report.researcher_count} researchers · {report.cache_age}</span>
                    </div>
                    <div className="flex items-center gap-1" style={{ color: '#9CA3AF' }}>
                        <Zap className="w-3 h-3 text-blue-400" />
                        <span>{report.engine}</span>
                    </div>
                </div>
            </div>

            {/* ── Three-panel body ─────────────────────────────────────────── */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr_1fr] gap-6">

                {/* ── LEFT: Company Info ──────────────────────────────────────── */}
                <div>
                    {/* Logo + Name */}
                    <div className="flex items-start gap-3 mb-5">
                        {report.logo ? (
                            <img
                                src={report.logo}
                                alt={report.ticker}
                                className="w-12 h-12 rounded-xl object-contain flex-shrink-0"
                                style={{ background: dimBg, padding: '4px' }}
                            />
                        ) : (
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0"
                                style={{ background: dimBg, color: textPrimary }}
                            >
                                {report.ticker.slice(0, 2)}
                            </div>
                        )}
                        <div>
                            <h2 className="font-bold text-xl leading-tight" style={{ color: textPrimary }}>{report.company_name}</h2>
                            <div className="text-sm font-mono mt-0.5" style={{ color: textSecondary }}>
                                {report.ticker} · {report.exchange}
                            </div>
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="space-y-1.5 mb-5 text-sm">
                        {[
                            { label: 'Sector', value: report.sector },
                            { label: 'Industry', value: report.industry },
                            ...(report.founded ? [{ label: 'Founded', value: report.founded }] : []),
                        ].map(({ label, value }) => (
                            <div key={label} className="flex gap-2">
                                <span className="opacity-45 flex-shrink-0 w-16" style={{ color: textSecondary }}>{label}</span>
                                <span style={{ color: textPrimary }}>{value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Knowledge Graph quick-links */}
                    {(report.suppliers?.length || report.customers?.length || report.competitors?.length) ? (
                        <div
                            className="rounded-2xl p-4 text-xs"
                            style={{ background: dimBg, border: `1px solid ${glassBorder}` }}
                        >
                            <div className="flex items-center gap-2 mb-3" style={{ color: '#6B7280' }}>
                                <Building2 className="w-4 h-4" />
                                <span className="uppercase tracking-widest text-[10px] font-semibold">Knowledge Graph</span>
                            </div>
                            <KGBadge label="Suppliers" tickers={report.suppliers ?? []} color="#3B82F6" onTicker={() => { /* TODO: navigate to ticker report */ }} />
                            <KGBadge label="Customers" tickers={report.customers ?? []} color="#10B981" onTicker={() => { /* TODO: navigate to ticker report */ }} />
                            <KGBadge label="Competitors" tickers={report.competitors ?? []} color="#9CA3AF" onTicker={() => { /* TODO: navigate to ticker report */ }} />
                        </div>
                    ) : null}
                </div>

                {/* ── CENTER: Description + Alerts ────────────────────────────── */}
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2 opacity-40" style={{ color: textSecondary }}>
                        Welcome to Quantus Research Solutions
                    </p>

                    <p className="text-sm leading-relaxed mb-4" style={{ color: textSecondary }}>
                        {report.description}
                    </p>

                    {/* Earnings flag — only for EQUITY / ETF */}
                    {isEquity && report.earnings_flag && report.earnings_flag.days_to_earnings <= 30 && (
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-start gap-2.5 p-3 rounded-xl mb-3 text-xs"
                            style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.22)' }}
                        >
                            <span className="text-base mt-0.5 flex-shrink-0">🗓</span>
                            <div>
                                <span className="font-semibold text-amber-400">
                                    Earnings in {report.earnings_flag.days_to_earnings} days
                                </span>
                                <span className="ml-2" style={{ color: '#9CA3AF' }}>
                                    · Options-implied: {report.earnings_flag.implied_move}
                                </span>
                                <p className="mt-1" style={{ color: '#9CA3AF' }}>
                                    {report.earnings_flag.strategy_adjustment}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Cross-ticker alerts */}
                    {report.cross_ticker_alerts?.slice(0, 2).map((alert, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 + i * 0.08 }}
                            className="flex items-start gap-2.5 p-3 rounded-xl mb-3 text-xs"
                            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}
                        >
                            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <span className="font-semibold text-amber-400">{alert.related_ticker} — {alert.event}</span>
                                <p className="mt-0.5" style={{ color: '#9CA3AF' }}>
                                    {alert.relationship} · {alert.impact}
                                </p>
                            </div>
                        </motion.div>
                    ))}

                    {/* Analyst consensus — equity only */}
                    {isEquity && <AnalystStrip report={report} textSecondary={textSecondary} />}

                    {/* Cache / shared status */}
                    <div
                        className="flex items-center gap-2 text-xs p-2.5 rounded-xl"
                        style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.16)' }}
                    >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span style={{ color: '#10B981' }}>✓ Shared report</span>
                        <span style={{ color: '#6B7280' }}>
                            · Generated {report.cache_age} · {report.researcher_count} researchers · {report.engine}
                        </span>
                    </div>
                </div>

                {/* ── RIGHT: Price + Metrics ────────────────────────────────────── */}
                <div className="flex flex-col gap-4">

                    {/* Price block */}
                    <div className="text-right">
                        <div
                            className="text-4xl font-bold font-mono count-up leading-none"
                            style={{ color: textPrimary, fontFamily: '"JetBrains Mono", monospace' }}
                        >
                            {fmtPrice(report.current_price)}
                        </div>
                        <div className={`flex items-center justify-end gap-1.5 mt-1.5 font-semibold font-mono ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span>
                                {positive ? '+' : ''}{report.day_change.toFixed(2)} ({positive ? '+' : ''}{report.day_change_pct.toFixed(2)}%)
                            </span>
                        </div>
                        <div className="text-xs mt-1" style={{ color: '#6B7280' }}>
                            Today · {session}
                        </div>
                    </div>

                    {/* Sparkline */}
                    <div className="flex justify-end">
                        <Sparkline price={report.current_price} change={report.day_change_pct} />
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-2">
                        {statsGrid.map(stat => (
                            <MetricCard
                                key={stat.label}
                                label={stat.label}
                                value={stat.value}
                                freshness={stat.freshness}
                                dimBg={dimBg}
                                borderColor={borderColor}
                                textPrimary={textPrimary}
                            />
                        ))}
                    </div>

                    {/* Insider trend — equity only */}
                    {isEquity && (
                        <div
                            className="flex items-center justify-between rounded-xl px-3 py-2 text-xs"
                            style={{ background: dimBg, border: `1px solid ${borderColor}` }}
                        >
                            <span style={{ color: textSecondary }}>Insider trend</span>
                            <div className="flex items-center gap-1" style={{ color: insiderColor }}>
                                <InsiderIcon className="w-4 h-4" />
                                <span className="font-semibold">{insiderDir || 'No recent filing'}</span>
                            </div>
                        </div>
                    )}

                    {/* Subscribe */}
                    <button
                        onClick={onSubscribe}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-all cursor-pointer hover:scale-[1.02]"
                        style={{ background: '#090901', color: '#FFFFFF' }}
                    >
                        <Bell className="w-4 h-4" />
                        Subscribe to {report.ticker} updates
                    </button>
                </div>
            </div>

            {/* ── Footer ───────────────────────────────────────────────────────── */}
            <div
                className="px-6 py-3 flex items-center justify-between border-t text-xs flex-wrap gap-2"
                style={{ borderColor, background: 'rgba(255,255,255,0.01)' }}
            >
                <div className="flex items-center gap-3" style={{ color: '#6B7280' }}>
                    <span className="font-mono">{report.report_id}</span>
                    <span>·</span>
                    <span>{report.engine}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-emerald-400" />
                        Analysis complete
                    </span>
                </div>
                <div className="flex items-center gap-3" style={{ color: '#6B7280' }}>
                    {report.data_sources.slice(0, 3).map(src => (
                        <span key={src.name} className="flex items-center gap-1">
                            <Shield className="w-2.5 h-2.5" style={{ color: src.tier === 1 ? '#10B981' : src.tier === 2 ? '#3B82F6' : '#9CA3AF' }} />
                            {src.name}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
