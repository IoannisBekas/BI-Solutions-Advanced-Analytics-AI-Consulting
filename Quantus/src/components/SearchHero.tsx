import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ArrowRight,
    CheckCircle2,
    Search,
    Sparkles,
    TrendingDown,
    TrendingUp,
    X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DISCOVERY_FEED, resolveAsset, searchAssets } from '../constants/assetRegistry';
import type { AssetEntry } from '../types';

interface SearchHeroProps {
    onSearch: (ticker: string, assetEntry: AssetEntry) => void;
    lightMode?: boolean;
}

const LIVE_ACTIVITY_ITEMS = [
    'Meridian refreshed NVDA 2 hours ago',
    'BTC-USD has 89 active researchers today',
    'GC=F report updated for commodity flows',
    'Shared research is accelerating cross-asset coverage',
];

const SIGNAL_META: Record<string, { signal: string; confidence: number }> = {
    NVDA: { signal: 'STRONG BUY', confidence: 82 },
    AAPL: { signal: 'BUY', confidence: 69 },
    MSFT: { signal: 'BUY', confidence: 73 },
    TSLA: { signal: 'NEUTRAL', confidence: 54 },
    'BTC-USD': { signal: 'BUY', confidence: 74 },
    'ETH-USD': { signal: 'BUY', confidence: 66 },
    'GC=F': { signal: 'BUY', confidence: 71 },
    SPY: { signal: 'NEUTRAL', confidence: 61 },
};

const HERO_STATS = [
    { label: 'Tracked signals', value: '847' },
    { label: 'Asset classes', value: '4' },
    { label: 'Research engine', value: 'Meridian v2.4' },
];

const WORKSPACE_GUIDES = [
    {
        title: 'Search once',
        description: 'Start with a ticker, company, crypto pair, or commodity and jump straight into the report flow.',
    },
    {
        title: 'Open coverage fast',
        description: 'Load cached research instantly when Quantus already has community coverage on the asset.',
    },
    {
        title: 'Keep moving',
        description: 'Stay inside the same BI Solutions product shell as you move into deeper Quantus workflows.',
    },
];

function formatPrice(value?: number) {
    if (value == null) return 'N/A';
    if (value >= 1000) return `$${value.toLocaleString()}`;
    return `$${value.toFixed(2)}`;
}

function AssetClassBadge({ cls }: { cls: string }) {
    const styles: Record<string, string> = {
        EQUITY: 'badge badge-equity',
        CRYPTO: 'badge badge-crypto',
        COMMODITY: 'badge badge-commodity',
        ETF: 'badge badge-etf',
    };

    return <span className={styles[cls] ?? 'badge badge-equity'}>{cls}</span>;
}

function LiveActivityStrip({ lightMode }: { lightMode?: boolean }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setIndex((value) => (value + 1) % LIVE_ACTIVITY_ITEMS.length), 3200);
        return () => clearInterval(timer);
    }, []);

    return (
        <div
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs"
            style={{
                background: lightMode ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)',
                borderColor: lightMode ? '#E5E7EB' : '#1F2937',
                color: lightMode ? '#475569' : '#9CA3AF',
            }}
        >
            <span className="live-dot" />
            <span className="font-semibold" style={{ color: lightMode ? '#374151' : '#D1D5DB' }}>Live</span>
            <AnimatePresence mode="wait">
                <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.25 }}
                >
                    {LIVE_ACTIVITY_ITEMS[index]}
                </motion.span>
            </AnimatePresence>
        </div>
    );
}

function AutocompleteResult({
    asset,
    index,
    lightMode,
    onSelect,
    cardBorder,
}: {
    asset: AssetEntry;
    index: number;
    lightMode?: boolean;
    onSelect: (asset: AssetEntry) => void;
    cardBorder: string;
}) {
    const positive = (asset.dayChangePct ?? 0) >= 0;

    return (
        <motion.button
            role="option"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            onClick={() => onSelect(asset)}
            className="w-full flex items-center gap-4 px-5 py-4 text-left"
            style={{ borderTop: index === 0 ? 'none' : `1px solid ${cardBorder}` }}
            type="button"
        >
            <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: lightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)', color: lightMode ? '#374151' : '#D1D5DB' }}
            >
                {asset.ticker.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm truncate" style={{ color: lightMode ? '#111827' : '#F9FAFB' }}>
                        {asset.name}
                    </span>
                    <AssetClassBadge cls={asset.assetClass} />
                    {asset.hasCachedReport && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium" style={{ background: lightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)', color: lightMode ? '#4B5563' : '#9CA3AF' }}>
                            <CheckCircle2 className="w-3 h-3" />
                            Cached
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs flex-wrap" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                    <span className="font-mono">{asset.ticker} · {asset.exchange}</span>
                    {asset.cachedReportAge && <span>{asset.cachedReportAge}</span>}
                    {asset.researcherCount != null && <span>{asset.researcherCount} researchers</span>}
                </div>
            </div>
            <div className="text-right flex-shrink-0">
                <div className="text-sm font-semibold font-mono" style={{ color: lightMode ? '#111827' : '#F9FAFB' }}>
                    {formatPrice(asset.currentPrice)}
                </div>
                {asset.dayChangePct != null && (
                    <div className="mt-1 inline-flex items-center gap-1 text-xs" style={{ color: positive ? '#059669' : '#DC2626' }}>
                        {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {positive ? '+' : ''}{asset.dayChangePct.toFixed(2)}%
                    </div>
                )}
            </div>
        </motion.button>
    );
}

function DiscoveryTile({
    asset,
    onSelect,
    lightMode,
}: {
    asset: AssetEntry;
    onSelect: (asset: AssetEntry) => void;
    lightMode?: boolean;
}) {
    const positive = (asset.dayChangePct ?? 0) >= 0;
    const meta = SIGNAL_META[asset.ticker] ?? { signal: 'NEUTRAL', confidence: 60 };

    return (
        <motion.button
            whileHover={{ y: -3 }}
            onClick={() => onSelect(asset)}
            className="group rounded-[28px] border p-5 md:p-6 text-left transition-all w-full h-full"
            style={{
                background: lightMode ? 'rgba(255,255,255,0.94)' : 'rgba(12,18,28,0.92)',
                borderColor: lightMode ? '#E5E7EB' : '#223046',
                boxShadow: lightMode ? '0 18px 42px rgba(15,23,42,0.06)' : '0 22px 56px rgba(0,0,0,0.24)',
            }}
            type="button"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                    <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{
                            background: lightMode ? 'rgba(9,9,11,0.05)' : 'rgba(255,255,255,0.06)',
                            color: lightMode ? '#111827' : '#F9FAFB',
                        }}
                    >
                        {asset.ticker.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                        <div className="text-base font-semibold truncate" style={{ color: lightMode ? '#111827' : '#F9FAFB' }}>
                            {asset.ticker}
                        </div>
                        <div className="mt-1 text-sm leading-snug" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                            {asset.name}
                        </div>
                        <div className="mt-2 text-xs font-mono" style={{ color: lightMode ? '#9CA3AF' : '#7B8CA4' }}>
                            {asset.exchange}
                        </div>
                    </div>
                </div>
                <AssetClassBadge cls={asset.assetClass} />
            </div>

            <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                    <div className="text-xl font-semibold font-mono" style={{ color: lightMode ? '#09090B' : '#F9FAFB' }}>
                        {formatPrice(asset.currentPrice)}
                    </div>
                    {asset.dayChangePct != null && (
                        <div className="mt-1 inline-flex items-center gap-1 text-xs" style={{ color: positive ? '#059669' : '#DC2626' }}>
                            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {positive ? '+' : ''}{asset.dayChangePct.toFixed(2)}%
                        </div>
                    )}
                    <div className="mt-3 text-xs" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                        {asset.researcherCount ?? 0} researchers following
                    </div>
                </div>
                <div className="text-right">
                    <div className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: lightMode ? 'rgba(9,9,11,0.05)' : 'rgba(255,255,255,0.06)', color: lightMode ? '#374151' : '#D1D5DB' }}>
                        {meta.signal}
                    </div>
                    <div className="mt-2 text-xs" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                        {meta.confidence}% confidence
                    </div>
                </div>
            </div>

            <div
                className="mt-5 pt-4 flex items-center justify-between gap-3 text-xs"
                style={{ borderTop: `1px solid ${lightMode ? '#E5E7EB' : '#223046'}`, color: lightMode ? '#6B7280' : '#9CA3AF' }}
            >
                <span>{asset.cachedReportAge ?? 'Ready to generate'}</span>
                <span className="transition-transform group-hover:translate-x-0.5">Open report</span>
            </div>
        </motion.button>
    );
}

export function SearchHero({ onSearch, lightMode }: SearchHeroProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<AssetEntry[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (event.key === 't' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName ?? '')) {
                event.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setDropdownOpen(false);
            return;
        }

        const timer = setTimeout(() => {
            const found = searchAssets(query, 6);
            setResults(found);
            setDropdownOpen(found.length > 0);
        }, 120);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (dropRef.current && !dropRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = useCallback((asset: AssetEntry) => {
        setQuery(asset.name);
        setDropdownOpen(false);
        onSearch(asset.ticker, asset);
    }, [onSearch]);

    const handleSubmit = useCallback((event: React.FormEvent) => {
        event.preventDefault();
        if (query.trim() && results.length > 0) {
            onSearch(results[0].ticker, results[0]);
            return;
        }
        if (!query.trim()) return;
        const resolved = resolveAsset(query);
        if (resolved) {
            onSearch(resolved.ticker, resolved);
            return;
        }
        onSearch(query.toUpperCase(), {
            ticker: query.toUpperCase(),
            name: query.toUpperCase(),
            exchange: 'Unknown',
            assetClass: 'EQUITY',
            sector: 'Unknown',
        } as AssetEntry);
    }, [onSearch, query, results]);

    const cardBg = lightMode ? 'rgba(252,252,253,0.96)' : 'rgba(14,20,31,0.96)';
    const cardBorder = lightMode ? '#E5E7EB' : '#223046';
    const ctaLabel = results[0]?.hasCachedReport ? 'View current report' : 'Generate report';
    const ctaSubtext = results[0]?.hasCachedReport
        ? `Cached ${results[0].cachedReportAge} · ${results[0].researcherCount ?? 0} researchers`
        : 'Press T to jump back into search at any time';

    return (
        <section className="relative">
            <div
                className="relative overflow-hidden rounded-[36px] border"
                style={{
                    background: lightMode
                        ? 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(249,250,251,0.95) 100%)'
                        : 'linear-gradient(180deg, rgba(12,18,28,0.96) 0%, rgba(9,13,21,0.98) 100%)',
                    borderColor: cardBorder,
                    boxShadow: lightMode ? '0 28px 80px rgba(15,23,42,0.08)' : '0 28px 80px rgba(0,0,0,0.32)',
                }}
            >
                <div className="bis-wave-bg" />
                <div className="relative z-10 px-4 py-5 md:px-8 md:py-8">
                    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] xl:items-start">
                        <div className="max-w-3xl">
                            <div className="bis-label inline-flex mb-5">
                                <Sparkles className="w-3.5 h-3.5" />
                                Quantus workspace on the BI Solutions platform
                            </div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="font-bold leading-[0.98] tracking-[-0.05em]"
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: 'clamp(2.1rem, 4vw, 3.75rem)',
                                    color: lightMode ? '#09090B' : '#F9FAFB',
                                }}
                            >
                                Start your Quantus research workflow.
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 }}
                                className="mt-5 max-w-2xl text-base md:text-lg leading-relaxed"
                                style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}
                            >
                                Search a market, open the latest report, and move into deeper
                                research without leaving the BI Solutions product ecosystem.
                            </motion.p>
                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                {HERO_STATS.map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-[24px] border px-4 py-4"
                                        style={{
                                            background: lightMode ? 'rgba(255,255,255,0.84)' : 'rgba(255,255,255,0.03)',
                                            borderColor: cardBorder,
                                        }}
                                    >
                                        <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: lightMode ? '#9CA3AF' : '#7B8CA4' }}>
                                            {item.label}
                                        </div>
                                        <div className="mt-2 text-lg font-semibold" style={{ color: lightMode ? '#09090B' : '#F9FAFB' }}>
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="mt-6"
                                ref={dropRef}
                            >
                                <form onSubmit={handleSubmit}>
                                    <div
                                        className="rounded-[30px] border p-4 md:p-5"
                                        style={{
                                            background: lightMode ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.03)',
                                            borderColor: cardBorder,
                                            boxShadow: lightMode ? '0 18px 48px rgba(15,23,42,0.08)' : '0 20px 56px rgba(0,0,0,0.25)',
                                        }}
                                    >
                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.22em]" style={{ color: lightMode ? '#9CA3AF' : '#6B7280' }}>
                                                    Research workspace
                                                </p>
                                                <p className="mt-1 text-sm" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                                                    Search by ticker, company, crypto, or commodity and jump into the latest report flow.
                                                </p>
                                            </div>
                                            <LiveActivityStrip lightMode={lightMode} />
                                        </div>

                                        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center">
                                            <div
                                                className="flex-1 rounded-[24px] border px-4 py-4 flex items-center gap-3"
                                                style={{
                                                    background: lightMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)',
                                                    borderColor: cardBorder,
                                                }}
                                            >
                                                <Search className="w-5 h-5 flex-shrink-0" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }} />
                                                <input
                                                    ref={inputRef}
                                                    id="ticker-input"
                                                    type="text"
                                                    value={query}
                                                    onChange={(event) => setQuery(event.target.value)}
                                                    placeholder="Search a ticker, company, crypto, or commodity"
                                                    className="flex-1 bg-transparent text-base md:text-lg outline-none"
                                                    style={{ color: lightMode ? '#111827' : '#F9FAFB' }}
                                                    autoComplete="off"
                                                    role="combobox"
                                                    aria-expanded={dropdownOpen}
                                                    aria-haspopup="listbox"
                                                    aria-controls="search-autocomplete"
                                                    onFocus={() => {
                                                        const container = inputRef.current?.parentElement;
                                                        if (container) {
                                                            container.style.borderColor = lightMode ? '#9CA3AF' : '#374151';
                                                            container.style.boxShadow = `0 0 0 3px ${lightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`;
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        const container = inputRef.current?.parentElement;
                                                        if (container) {
                                                            container.style.borderColor = cardBorder;
                                                            container.style.boxShadow = 'none';
                                                        }
                                                    }}
                                                />
                                                {query && (
                                                    <button
                                                        type="button"
                                                        aria-label="Clear search"
                                                        title="Clear search"
                                                        onClick={() => {
                                                            setQuery('');
                                                            setResults([]);
                                                            setDropdownOpen(false);
                                                        }}
                                                        className="w-8 h-8 rounded-full inline-flex items-center justify-center"
                                                        style={{
                                                            background: lightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
                                                            color: lightMode ? '#6B7280' : '#9CA3AF',
                                                        }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <button
                                                type="submit"
                                                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold transition-all"
                                                style={{
                                                    background: lightMode ? '#09090B' : '#FFFFFF',
                                                    color: lightMode ? '#FFFFFF' : '#09090B',
                                                    opacity: query.trim() ? 1 : 0.7,
                                                }}
                                            >
                                                {ctaLabel}
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                            <div
                                                className="inline-flex max-w-xl items-start gap-3 rounded-2xl border px-3 py-2.5 text-xs text-left"
                                                style={{
                                                    background: lightMode ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.12)',
                                                    borderColor: lightMode ? '#FCD34D' : '#6B4A12',
                                                    color: lightMode ? '#78350F' : '#FDE68A',
                                                }}
                                            >
                                                <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: lightMode ? '#D97706' : '#FBBF24' }} />
                                                <span>
                                                    Demo data is active while live market-data services are being connected.
                                                </span>
                                            </div>
                                            {!dropdownOpen && (
                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                    <span style={{ color: lightMode ? '#9CA3AF' : '#6B7280' }}>Popular</span>
                                                    {['NVDA', 'AAPL', 'BTC-USD', 'GC=F', 'SPY', 'TSLA'].map((ticker) => (
                                                        <button
                                                            key={ticker}
                                                            type="button"
                                                            onClick={() => setQuery(ticker)}
                                                            className="rounded-full px-3 py-1.5 transition-all border"
                                                            style={{
                                                                background: lightMode ? 'rgba(9,9,11,0.04)' : 'rgba(255,255,255,0.05)',
                                                                borderColor: lightMode ? '#E5E7EB' : '#223046',
                                                                color: lightMode ? '#6B7280' : '#9CA3AF',
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = lightMode ? 'rgba(9,9,11,0.08)' : 'rgba(255,255,255,0.10)';
                                                                e.currentTarget.style.borderColor = lightMode ? '#D1D5DB' : '#31425B';
                                                                e.currentTarget.style.color = lightMode ? '#111827' : '#F9FAFB';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = lightMode ? 'rgba(9,9,11,0.04)' : 'rgba(255,255,255,0.05)';
                                                                e.currentTarget.style.borderColor = lightMode ? '#E5E7EB' : '#223046';
                                                                e.currentTarget.style.color = lightMode ? '#6B7280' : '#9CA3AF';
                                                            }}
                                                        >
                                                            {ticker}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {dropdownOpen && (
                                            <motion.div
                                                id="search-autocomplete"
                                                role="listbox"
                                                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                                className="mt-3 rounded-[28px] border overflow-hidden"
                                                style={{
                                                    background: cardBg,
                                                    borderColor: cardBorder,
                                                    boxShadow: lightMode ? '0 24px 60px rgba(15,23,42,0.12)' : '0 24px 64px rgba(0,0,0,0.35)',
                                                }}
                                            >
                                                {results.map((asset, index) => (
                                                    <AutocompleteResult
                                                        key={asset.ticker}
                                                        asset={asset}
                                                        index={index}
                                                        onSelect={handleSelect}
                                                        lightMode={lightMode}
                                                        cardBorder={cardBorder}
                                                    />
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </form>

                                <div className="mt-4 text-sm" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                                    {ctaSubtext}
                                </div>
                            </motion.div>
                        </div>

                        <div
                            className="rounded-[30px] border p-5 md:p-6"
                            style={{
                                background: lightMode ? 'rgba(255,255,255,0.90)' : 'rgba(14,20,31,0.86)',
                                borderColor: lightMode ? '#E5E7EB' : '#223046',
                                boxShadow: lightMode ? '0 24px 60px rgba(15,23,42,0.08)' : '0 24px 72px rgba(0,0,0,0.30)',
                            }}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.22em]" style={{ color: lightMode ? '#9CA3AF' : '#6B7280' }}>
                                        Workspace snapshot
                                    </p>
                                    <h2 className="mt-3 text-2xl font-bold leading-tight" style={{ color: lightMode ? '#09090B' : '#F9FAFB', fontFamily: 'var(--font-heading)' }}>
                                        Cleaner search, faster report handoff.
                                    </h2>
                                </div>
                                <div
                                    className="rounded-full px-3 py-1 text-xs font-medium"
                                    style={{
                                        background: lightMode ? 'rgba(9,9,11,0.04)' : 'rgba(255,255,255,0.06)',
                                        color: lightMode ? '#6B7280' : '#9CA3AF',
                                    }}
                                >
                                    Shared runtime
                                </div>
                            </div>
                            <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                                {WORKSPACE_GUIDES.map((guide) => (
                                    <div
                                        key={guide.title}
                                        className="rounded-[22px] border px-4 py-4"
                                        style={{
                                            background: lightMode ? '#FFFFFF' : 'rgba(255,255,255,0.03)',
                                            borderColor: lightMode ? '#E5E7EB' : '#223046',
                                        }}
                                    >
                                        <div className="text-sm font-semibold" style={{ color: lightMode ? '#111827' : '#F9FAFB' }}>
                                            {guide.title}
                                        </div>
                                        <div className="mt-2 text-xs leading-relaxed" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                                            {guide.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 space-y-3">
                                {DISCOVERY_FEED.slice(0, 3).map((asset) => (
                                    <button
                                        key={asset.ticker}
                                        onClick={() => handleSelect(asset)}
                                        className="w-full rounded-2xl border px-4 py-4 text-left transition-all"
                                        style={{
                                            background: lightMode ? '#FFFFFF' : 'rgba(255,255,255,0.03)',
                                            borderColor: lightMode ? '#E5E7EB' : '#223046',
                                        }}
                                        type="button"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-semibold" style={{ color: lightMode ? '#111827' : '#F9FAFB' }}>{asset.name}</div>
                                                <div className="mt-1 text-xs font-mono" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                                                    {asset.ticker} · {asset.cachedReportAge ?? 'Fresh'}
                                                </div>
                                                <div className="mt-2 text-xs" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                                                    {asset.researcherCount ?? 0} researchers following
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold font-mono" style={{ color: lightMode ? '#111827' : '#F9FAFB' }}>
                                                    {formatPrice(asset.currentPrice)}
                                                </div>
                                                <AssetClassBadge cls={asset.assetClass} />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <div
                                    className="rounded-[22px] border px-4 py-4"
                                    style={{
                                        background: lightMode ? 'rgba(249,250,251,0.96)' : 'rgba(255,255,255,0.02)',
                                        borderColor: lightMode ? '#E5E7EB' : '#223046',
                                    }}
                                >
                                    <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: lightMode ? '#9CA3AF' : '#6B7280' }}>
                                        Cached Reports
                                    </div>
                                    <div className="mt-2 text-2xl font-semibold" style={{ color: lightMode ? '#09090B' : '#F9FAFB' }}>
                                        128
                                    </div>
                                </div>
                                <div
                                    className="rounded-[22px] border px-4 py-4"
                                    style={{
                                        background: lightMode ? 'rgba(249,250,251,0.96)' : 'rgba(255,255,255,0.02)',
                                        borderColor: lightMode ? '#E5E7EB' : '#223046',
                                    }}
                                >
                                    <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: lightMode ? '#9CA3AF' : '#6B7280' }}>
                                        Active Researchers
                                    </div>
                                    <div className="mt-2 text-2xl font-semibold" style={{ color: lightMode ? '#09090B' : '#F9FAFB' }}>
                                        2.4k
                                    </div>
                                </div>
                            </div>

                            <div
                                className="mt-6 rounded-[26px] border px-5 py-4"
                                style={{
                                    background: lightMode ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.03)',
                                    borderColor: lightMode ? '#E5E7EB' : '#223046',
                                }}
                            >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: lightMode ? '#374151' : '#9CA3AF' }}>
                                            Quantus live signal performance
                                        </p>
                                        <p className="mt-2 text-sm leading-relaxed" style={{ color: lightMode ? '#475569' : '#9CA3AF' }}>
                                            Strong-buy signals have averaged <strong style={{ color: lightMode ? '#09090B' : '#F9FAFB' }}>+11.2% over 30 days</strong>, while shared research keeps refresh cadence moving faster.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:flex-wrap">
                                        {[
                                            { label: 'Signals tracked', value: '847' },
                                            { label: 'Directional accuracy', value: '67%' },
                                        ].map((metric) => (
                                            <div
                                                key={metric.label}
                                                className="rounded-[20px] border px-4 py-3 min-w-[150px]"
                                                style={{
                                                    background: lightMode ? 'rgba(249,250,251,0.96)' : 'rgba(255,255,255,0.02)',
                                                    borderColor: lightMode ? '#E5E7EB' : '#223046',
                                                }}
                                            >
                                                <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: lightMode ? '#9CA3AF' : '#6B7280' }}>
                                                    {metric.label}
                                                </div>
                                                <div className="mt-2 text-lg font-semibold" style={{ color: lightMode ? '#09090B' : '#F9FAFB' }}>
                                                    {metric.value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-10">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
                    <div>
                        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: lightMode ? '#9CA3AF' : '#6B7280' }}>Cached reports</p>
                        <h2 className="mt-2 text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: lightMode ? '#09090B' : '#F9FAFB' }}>
                            Reports available now
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed max-w-2xl" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                            Open the latest research snapshots directly from cache, then move into the full Quantus report when you need more context.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm" style={{ color: lightMode ? '#6B7280' : '#9CA3AF', borderColor: lightMode ? '#E5E7EB' : '#223046', background: lightMode ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.03)' }}>
                        <span className="live-dot" />
                        Shared intelligence model · refreshed continuously
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {DISCOVERY_FEED.slice(0, 6).map((asset) => (
                        <DiscoveryTile key={asset.ticker} asset={asset} onSelect={handleSelect} lightMode={lightMode} />
                    ))}
                </div>
            </div>
        </section>
    );
}
