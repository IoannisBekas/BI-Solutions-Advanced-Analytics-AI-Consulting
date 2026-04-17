/**
 * ScannerPage.tsx
 * ================
 * Market scanner — Argus-style real-time signal table.
 *
 * Route: /quantus/workspace/scanner
 *
 * Loads all cached reports from /quantus/api/v1/scanner, shows a
 * sortable + filterable table. Zero new Claude API calls — pure pipeline data.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
    ArrowDownUp,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    Filter,
    Newspaper,
    RefreshCw,
    ScanLine,
    ShieldAlert,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type SortField = 'ticker' | 'overall_signal' | 'confidence_score' | 'regime_label';
type SortDir = 'asc' | 'desc';

interface ScannerResult {
    ticker: string;
    company_name: string;
    asset_class: string;
    overall_signal: string;
    confidence_score: number;
    regime_label: string;
    regime_implication: string;
    early_insight: string;
    has_news?: boolean;
    has_filings?: boolean;
    report_url: string;
}

interface ScannerFilters {
    signal: string;
    assetClass: string;
    hasNews: boolean;
    hasFilings: boolean;
    query: string;
}

interface Props {
    onSelectTicker: (ticker: string) => void;
    lightMode?: boolean;
    apiBase?: string;
}

// ─── Signal config ────────────────────────────────────────────────────────────

const SIGNAL_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
    'STRONG BUY':  { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  icon: <TrendingUp className="h-3.5 w-3.5" /> },
    'BUY':         { color: '#34D399', bg: 'rgba(52,211,153,0.10)',  icon: <TrendingUp className="h-3.5 w-3.5" /> },
    'NEUTRAL':     { color: '#94A3B8', bg: 'rgba(148,163,184,0.10)', icon: <ArrowDownUp className="h-3.5 w-3.5" /> },
    'SELL':        { color: '#F87171', bg: 'rgba(248,113,113,0.10)', icon: <TrendingDown className="h-3.5 w-3.5" /> },
    'STRONG SELL': { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   icon: <TrendingDown className="h-3.5 w-3.5" /> },
};

const SIGNAL_RANK: Record<string, number> = {
    'STRONG BUY': 5, 'BUY': 4, 'NEUTRAL': 3, 'SELL': 2, 'STRONG SELL': 1,
};

function signalCfg(s: string) {
    return SIGNAL_CONFIG[s] ?? SIGNAL_CONFIG['NEUTRAL'];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SignalBadge({ signal }: { signal: string }) {
    const cfg = signalCfg(signal);
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{ color: cfg.color, background: cfg.bg }}>
            {cfg.icon}{signal}
        </span>
    );
}

function ConfidenceBar({ value }: { value: number }) {
    const color = value >= 70 ? '#10B981' : value >= 50 ? '#F59E0B' : '#EF4444';
    return (
        <div className="flex items-center gap-2 min-w-[80px]">
            <div className="flex-1 h-1.5 rounded-full bg-gray-800/60 overflow-hidden">
                <div className="h-1.5 rounded-full transition-all duration-500"
                     style={{ width: `${value}%`, background: color }} />
            </div>
            <span className="text-xs font-mono font-semibold w-7 text-right" style={{ color }}>{value}</span>
        </div>
    );
}

function SortIcon({ field, sort }: { field: SortField; sort: { field: SortField; dir: SortDir } }) {
    if (sort.field !== field) return <ArrowDownUp className="h-3 w-3 opacity-30" />;
    return sort.dir === 'asc'
        ? <ChevronUp className="h-3 w-3 text-blue-400" />
        : <ChevronDown className="h-3 w-3 text-blue-400" />;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ScannerPage({ onSelectTicker, lightMode, apiBase = '/quantus/api' }: Props) {
    const [results, setResults] = useState<ScannerResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState<string | null>(null);
    const [sort, setSort]     = useState<{ field: SortField; dir: SortDir }>({ field: 'confidence_score', dir: 'desc' });
    const [filters, setFilters] = useState<ScannerFilters>({
        signal: '', assetClass: '', hasNews: false, hasFilings: false, query: '',
    });

    // Text / bg colours depending on light mode
    const textPrimary   = lightMode ? '#0F172A' : '#F1F5F9';
    const textSecondary = lightMode ? '#64748B' : '#94A3B8';
    const cardBg        = lightMode ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.50)';
    const borderColor   = lightMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';
    const panelBg       = lightMode ? 'rgba(248,250,252,0.95)' : 'rgba(9,9,11,0.95)';

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ limit: '100', sort_by: 'confidence_score' });
            if (filters.signal)    params.set('signal', filters.signal);
            if (filters.assetClass) params.set('asset_class', filters.assetClass);
            if (filters.hasNews)   params.set('has_news', 'true');
            if (filters.hasFilings) params.set('has_filings', 'true');

            const res = await fetch(`${apiBase}/v1/scanner?${params}`);
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            const data = await res.json();
            setResults(data.results ?? []);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            setError(`Scanner unavailable: ${msg}`);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [apiBase, filters.signal, filters.assetClass, filters.hasNews, filters.hasFilings]);

    useEffect(() => { void load(); }, [load]);

    // Client-side sort + text filter
    const displayed = useMemo(() => {
        let list = results;

        if (filters.query) {
            const q = filters.query.toLowerCase();
            list = list.filter(r =>
                r.ticker.toLowerCase().includes(q) ||
                r.company_name.toLowerCase().includes(q),
            );
        }

        return [...list].sort((a, b) => {
            let cmp = 0;
            if (sort.field === 'confidence_score') cmp = a.confidence_score - b.confidence_score;
            else if (sort.field === 'overall_signal') cmp = (SIGNAL_RANK[a.overall_signal] ?? 3) - (SIGNAL_RANK[b.overall_signal] ?? 3);
            else if (sort.field === 'ticker') cmp = a.ticker.localeCompare(b.ticker);
            else if (sort.field === 'regime_label') cmp = a.regime_label.localeCompare(b.regime_label);
            return sort.dir === 'asc' ? cmp : -cmp;
        });
    }, [results, filters.query, sort]);

    function toggleSort(field: SortField) {
        setSort(prev =>
            prev.field === field
                ? { field, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
                : { field, dir: 'desc' },
        );
    }

    function setFilter<K extends keyof ScannerFilters>(key: K, value: ScannerFilters[K]) {
        setFilters(prev => ({ ...prev, [key]: value }));
    }

    const signalOptions = ['', 'STRONG BUY', 'BUY', 'NEUTRAL', 'SELL', 'STRONG SELL'];
    const assetOptions  = ['', 'EQUITY', 'CRYPTO', 'ETF', 'COMMODITY'];

    // Summary counts
    const bullishCount = results.filter(r => r.overall_signal === 'BUY' || r.overall_signal === 'STRONG BUY').length;
    const bearishCount = results.filter(r => r.overall_signal === 'SELL' || r.overall_signal === 'STRONG SELL').length;
    const newsCount    = results.filter(r => r.has_news).length;

    return (
        <div className="min-h-screen" style={{ background: panelBg }}>
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

                {/* ── Header ───────────────────────────────────────────── */}
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="h-9 w-9 rounded-xl flex items-center justify-center"
                                 style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                                <ScanLine className="h-5 w-5 text-blue-400" />
                            </div>
                            <h1 className="text-2xl font-bold font-heading" style={{ color: textPrimary }}>
                                Market Scanner
                            </h1>
                        </div>
                        <p className="text-sm" style={{ color: textSecondary }}>
                            Signal intelligence across all cached reports — zero new API calls
                        </p>
                    </div>
                    <button onClick={() => void load()} disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80 active:scale-95"
                            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', color: '#60A5FA' }}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* ── Summary strip ────────────────────────────────────── */}
                {!loading && results.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
                        {[
                            { label: 'Total', value: results.length, color: textPrimary },
                            { label: 'Bullish', value: bullishCount, color: '#10B981' },
                            { label: 'Bearish', value: bearishCount, color: '#EF4444' },
                            { label: 'With News', value: newsCount, color: '#3B82F6' },
                            { label: 'Avg Score', value: Math.round(results.reduce((s, r) => s + r.confidence_score, 0) / results.length), color: '#F59E0B' },
                        ].map(stat => (
                            <div key={stat.label} className="rounded-xl p-3 text-center"
                                 style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
                                <div className="text-xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</div>
                                <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: textSecondary }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Filter bar ───────────────────────────────────────── */}
                <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-2xl"
                     style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
                    <Filter className="h-4 w-4 flex-shrink-0" style={{ color: textSecondary }} />

                    {/* Text search */}
                    <input
                        type="text"
                        placeholder="Search ticker or name…"
                        value={filters.query}
                        onChange={e => setFilter('query', e.target.value)}
                        className="flex-1 min-w-[140px] bg-transparent text-sm outline-none placeholder:opacity-50"
                        style={{ color: textPrimary }}
                    />

                    {/* Signal chips */}
                    <div className="flex flex-wrap gap-1.5">
                        {signalOptions.map(s => {
                            const active = filters.signal === s;
                            const cfg = s ? signalCfg(s) : null;
                            return (
                                <button key={s || 'all'} onClick={() => setFilter('signal', s)}
                                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all"
                                        style={{
                                            background: active ? (cfg?.bg ?? 'rgba(148,163,184,0.15)') : 'transparent',
                                            color: active ? (cfg?.color ?? textPrimary) : textSecondary,
                                            border: `1px solid ${active ? (cfg?.color ?? borderColor) : borderColor}`,
                                        }}>
                                    {s || 'All signals'}
                                </button>
                            );
                        })}
                    </div>

                    {/* Asset class */}
                    <div className="flex gap-1.5">
                        {assetOptions.map(a => (
                            <button key={a || 'all'} onClick={() => setFilter('assetClass', a)}
                                    className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all"
                                    style={{
                                        background: filters.assetClass === a ? 'rgba(59,130,246,0.15)' : 'transparent',
                                        color: filters.assetClass === a ? '#60A5FA' : textSecondary,
                                        border: `1px solid ${filters.assetClass === a ? 'rgba(59,130,246,0.4)' : borderColor}`,
                                    }}>
                                {a || 'All classes'}
                            </button>
                        ))}
                    </div>

                    {/* Has news / filings toggles */}
                    {[
                        { key: 'hasNews'    as const, label: 'Has news',    icon: <Newspaper className="h-3 w-3" />,   color: '#3B82F6' },
                        { key: 'hasFilings' as const, label: 'Has filings', icon: <ShieldAlert className="h-3 w-3" />, color: '#8B5CF6' },
                    ].map(({ key, label, icon, color }) => (
                        <button key={key} onClick={() => setFilter(key, !filters[key])}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all"
                                style={{
                                    background: filters[key] ? `${color}18` : 'transparent',
                                    color: filters[key] ? color : textSecondary,
                                    border: `1px solid ${filters[key] ? `${color}50` : borderColor}`,
                                }}>
                            {icon}{label}
                        </button>
                    ))}
                </div>

                {/* ── Table ────────────────────────────────────────────── */}
                {error ? (
                    <div className="text-center py-16">
                        <ShieldAlert className="h-10 w-10 mx-auto mb-3 text-amber-400 opacity-50" />
                        <p className="text-sm font-semibold mb-1" style={{ color: textPrimary }}>Scanner unavailable</p>
                        <p className="text-xs" style={{ color: textSecondary }}>{error}</p>
                        <button onClick={() => void load()} className="mt-4 px-4 py-2 rounded-xl text-sm font-medium text-blue-400"
                                style={{ background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.2)' }}>
                            Try again
                        </button>
                    </div>
                ) : loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-16 rounded-xl animate-pulse"
                                 style={{ background: cardBg, border: `1px solid ${borderColor}` }} />
                        ))}
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="text-center py-16">
                        <ScanLine className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: textSecondary }} />
                        <p className="text-sm" style={{ color: textSecondary }}>
                            {results.length === 0
                                ? 'No cached reports yet — run a report to populate the scanner.'
                                : 'No results match the current filters.'}
                        </p>
                    </div>
                ) : (
                    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${borderColor}` }}>
                        {/* Table header */}
                        <div className="grid grid-cols-[2fr_1.5fr_1.2fr_1fr_auto] gap-4 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em]"
                             style={{ background: lightMode ? 'rgba(248,250,252,0.8)' : 'rgba(15,23,42,0.8)', color: textSecondary, borderBottom: `1px solid ${borderColor}` }}>
                            <button className="flex items-center gap-1 text-left" onClick={() => toggleSort('ticker')}>
                                Ticker <SortIcon field="ticker" sort={sort} />
                            </button>
                            <button className="flex items-center gap-1" onClick={() => toggleSort('overall_signal')}>
                                Signal <SortIcon field="overall_signal" sort={sort} />
                            </button>
                            <button className="flex items-center gap-1" onClick={() => toggleSort('confidence_score')}>
                                Confidence <SortIcon field="confidence_score" sort={sort} />
                            </button>
                            <button className="flex items-center gap-1" onClick={() => toggleSort('regime_label')}>
                                Regime <SortIcon field="regime_label" sort={sort} />
                            </button>
                            <span className="text-right">Action</span>
                        </div>

                        {/* Rows */}
                        <div className="divide-y" style={{ borderColor }}>
                            {displayed.map((result, i) => (
                                <motion.div
                                    key={result.ticker}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                                    className="grid grid-cols-[2fr_1.5fr_1.2fr_1fr_auto] gap-4 px-4 py-4 items-center cursor-pointer transition-all hover:opacity-90"
                                    style={{ background: cardBg }}
                                    onClick={() => onSelectTicker(result.ticker)}
                                >
                                    {/* Ticker + name */}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold font-mono text-sm" style={{ color: textPrimary }}>
                                                {result.ticker}
                                            </span>
                                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                                                  style={{ background: 'rgba(148,163,184,0.1)', color: textSecondary }}>
                                                {result.asset_class}
                                            </span>
                                            {result.has_news && (
                                                <Newspaper className="h-3 w-3 text-blue-400 flex-shrink-0" title="Has news" />
                                            )}
                                            {result.has_filings && (
                                                <ShieldAlert className="h-3 w-3 text-violet-400 flex-shrink-0" title="Has SEC filings" />
                                            )}
                                        </div>
                                        <p className="text-[11px] truncate mt-0.5" style={{ color: textSecondary }}>
                                            {result.company_name}
                                        </p>
                                    </div>

                                    {/* Signal */}
                                    <div>
                                        <SignalBadge signal={result.overall_signal} />
                                    </div>

                                    {/* Confidence */}
                                    <div>
                                        <ConfidenceBar value={result.confidence_score} />
                                    </div>

                                    {/* Regime */}
                                    <div className="truncate text-[11px]" style={{ color: textSecondary }}>
                                        {result.regime_label}
                                    </div>

                                    {/* CTA */}
                                    <button
                                        onClick={e => { e.stopPropagation(); onSelectTicker(result.ticker); }}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80 active:scale-95"
                                        style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', color: '#60A5FA' }}>
                                        Report <ArrowRight className="h-3 w-3" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && displayed.length > 0 && (
                    <p className="text-center text-[11px] mt-4" style={{ color: textSecondary }}>
                        Showing {displayed.length} of {results.length} cached reports · Zero new API calls
                    </p>
                )}
            </div>
        </div>
    );
}
