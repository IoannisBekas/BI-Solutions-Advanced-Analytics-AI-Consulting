import { startTransition, useCallback, useDeferredValue, useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowRight, Bookmark, CheckCircle2, Clock3, Database, FileStack, Search, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { searchWorkspaceAssets } from '../services/workspace';
import type { AssetEntry, WorkspaceSummary } from '../types';

interface SearchHeroProps {
    onSearch: (ticker: string, assetEntry: AssetEntry) => void;
    lightMode?: boolean;
    workspaceSummary: WorkspaceSummary | null;
    recentAssets: AssetEntry[];
    pinnedAssets: AssetEntry[];
    onTogglePinned: (asset: AssetEntry) => void;
}

function formatPrice(value?: number) {
    if (value == null) return 'N/A';
    if (value >= 1000) return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
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

function StatusBadge({
    lightMode,
    label,
    tone,
}: {
    lightMode?: boolean;
    label: string;
    tone: 'neutral' | 'success' | 'caution';
}) {
    const toneColors = {
        neutral: {
            dot: '#64748B',
            fg: lightMode ? '#475569' : '#CBD5E1',
            bg: lightMode ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.12)',
            border: lightMode ? '#CBD5E1' : '#334155',
        },
        success: {
            dot: '#10B981',
            fg: lightMode ? '#047857' : '#6EE7B7',
            bg: lightMode ? 'rgba(16,185,129,0.10)' : 'rgba(16,185,129,0.12)',
            border: lightMode ? '#A7F3D0' : '#064E3B',
        },
        caution: {
            dot: '#D97706',
            fg: lightMode ? '#92400E' : '#FCD34D',
            bg: lightMode ? 'rgba(245,158,11,0.10)' : 'rgba(245,158,11,0.12)',
            border: lightMode ? '#FCD34D' : '#6B4A12',
        },
    }[tone];

    return (
        <div
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium shadow-sm"
            style={{
                background: toneColors.bg,
                borderColor: toneColors.border,
                color: toneColors.fg,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
            }}
        >
            <span className="h-2 w-2 rounded-full" style={{ background: toneColors.dot }} />
            {label}
        </div>
    );
}

function AutocompleteResult({
    asset,
    index,
    lightMode,
    onSelect,
    cardBorder,
    highlighted,
}: {
    asset: AssetEntry;
    index: number;
    lightMode?: boolean;
    onSelect: (asset: AssetEntry) => void;
    cardBorder: string;
    highlighted?: boolean;
}) {
    const positive = (asset.dayChangePct ?? 0) >= 0;
    const hasQuote = asset.currentPrice != null;

    return (
        <motion.button
            id={`search-option-${index}`}
            role="option"
            aria-selected={highlighted}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            onClick={() => onSelect(asset)}
            className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors duration-200"
            style={{
                borderTop: index === 0 ? 'none' : `1px solid ${lightMode ? 'rgba(229,231,235,0.6)' : cardBorder}`,
                background: highlighted
                    ? (lightMode ? 'rgba(249,250,251,0.9)' : 'rgba(255,255,255,0.06)')
                    : 'transparent',
            }}
            whileHover={{ background: lightMode ? 'rgba(249,250,251,0.8)' : 'rgba(255,255,255,0.03)' }}
            type="button"
        >
            <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm"
                style={{
                    background: lightMode ? 'linear-gradient(135deg, #09090B, #1a1a2e)' : 'rgba(255,255,255,0.08)',
                    color: lightMode ? '#FFFFFF' : '#D1D5DB',
                }}
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
                        <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium"
                            style={{ background: lightMode ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.12)', color: lightMode ? '#047857' : '#6EE7B7' }}
                        >
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
                {hasQuote ? (
                    <div className="text-sm font-semibold font-mono" style={{ color: lightMode ? '#111827' : '#F9FAFB' }}>
                        {formatPrice(asset.currentPrice)}
                    </div>
                ) : (
                    <div className="text-[11px] font-medium" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                        Quote in report
                    </div>
                )}
                {hasQuote && asset.dayChangePct != null && (
                    <div className="mt-1 text-xs font-medium" style={{ color: positive ? '#059669' : '#DC2626' }}>
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
    const hasQuote = asset.currentPrice != null;
    return (
        <motion.button
            whileHover={{ y: -6, boxShadow: lightMode ? '0 24px 56px rgba(15,23,42,0.10)' : '0 28px 64px rgba(0,0,0,0.35)' }}
            onClick={() => onSelect(asset)}
            className="group rounded-3xl border p-6 md:p-7 text-left transition-all duration-300 w-full h-full"
            style={{
                background: lightMode ? 'rgba(255,255,255,0.90)' : 'rgba(12,18,28,0.92)',
                borderColor: lightMode ? 'rgba(229,231,235,0.8)' : '#1A1A1A',
                boxShadow: lightMode ? '0 4px 24px rgba(15,23,42,0.04)' : '0 22px 56px rgba(0,0,0,0.24)',
                backdropFilter: lightMode ? 'blur(8px)' : undefined,
                WebkitBackdropFilter: lightMode ? 'blur(8px)' : undefined,
            }}
            type="button"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md"
                        style={{
                            background: lightMode ? 'linear-gradient(135deg, #09090B, #1a1a2e)' : 'rgba(255,255,255,0.08)',
                            color: lightMode ? '#FFFFFF' : '#D1D5DB',
                        }}
                    >
                        {asset.ticker.slice(0, 2)}
                    </div>
                    <div>
                        <div className="text-base font-bold tracking-tight" style={{ color: lightMode ? '#111827' : '#F9FAFB', fontFamily: 'var(--font-heading)' }}>
                            {asset.ticker}
                        </div>
                        <div className="mt-1 text-sm leading-snug" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                            {asset.name}
                        </div>
                        <div className="mt-1.5 text-xs font-mono" style={{ color: lightMode ? '#9CA3AF' : '#7B8CA4' }}>
                            {asset.exchange}
                        </div>
                    </div>
                </div>
                <AssetClassBadge cls={asset.assetClass} />
            </div>

            <div className="mt-6 flex items-end justify-between gap-4">
                <div>
                    {hasQuote ? (
                        <div className="text-2xl font-bold font-mono tracking-tight" style={{ color: lightMode ? '#09090B' : '#F9FAFB' }}>
                            {formatPrice(asset.currentPrice)}
                        </div>
                    ) : (
                        <div className="text-sm font-semibold tracking-tight" style={{ color: lightMode ? '#475569' : '#D1D5DB' }}>
                            Live quote in report
                        </div>
                    )}
                    <div className="mt-2 text-xs" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                        {asset.cachedReportAge ?? 'Starter shell'} · {asset.researcherCount ?? 0} researchers
                    </div>
                </div>
                <div
                    className="rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm"
                    style={{
                        background: asset.hasCachedReport
                            ? (lightMode ? 'rgba(16,185,129,0.10)' : 'rgba(16,185,129,0.12)')
                            : (lightMode ? 'rgba(245,158,11,0.10)' : 'rgba(245,158,11,0.12)'),
                        color: asset.hasCachedReport
                            ? (lightMode ? '#047857' : '#6EE7B7')
                            : (lightMode ? '#92400E' : '#FCD34D'),
                    }}
                >
                    {asset.hasCachedReport ? 'Cached' : 'Starter'}
                </div>
            </div>

            <div
                className="mt-6 pt-4 flex items-center justify-between gap-3 text-xs font-medium"
                style={{ borderTop: `1px solid ${lightMode ? 'rgba(229,231,235,0.6)' : '#1A1A1A'}`, color: lightMode ? '#6B7280' : '#9CA3AF' }}
            >
                <span>{asset.hasCachedReport ? 'Open report URL' : 'Open starter shell'}</span>
                <span className="inline-flex items-center gap-1 transition-transform group-hover:translate-x-1">
                    Open report <ArrowRight className="w-3.5 h-3.5" />
                </span>
            </div>
        </motion.button>
    );
}

export function SearchHero({ onSearch, lightMode, workspaceSummary, recentAssets, pinnedAssets, onTogglePinned }: SearchHeroProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<AssetEntry[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropRef = useRef<HTMLDivElement>(null);
    const deferredQuery = useDeferredValue(query);

    const status = workspaceSummary?.status ?? {
        mode: 'mixed',
        label: 'Loading workspace',
        description: 'Fetching coverage data for the Quantus workspace.',
        detail: 'Search results will show cached coverage and freshness.',
        badgeTone: 'neutral' as const,
    };
    const metrics = workspaceSummary?.metrics ?? [];
    const guides = workspaceSummary?.guides ?? [];
    const featuredAssets = workspaceSummary?.featuredAssets ?? [];
    const popularTickers = workspaceSummary?.popularTickers ?? [];

    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    // Reset highlighted index when results change
    useEffect(() => { setHighlightedIndex(-1); }, [results]);

    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            const tag = document.activeElement?.tagName ?? '';
            if (['INPUT', 'TEXTAREA'].includes(tag)) return;
            if (event.key === '/' || event.key === 't') {
                event.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    useEffect(() => {
        if (!deferredQuery.trim()) {
            setResults([]);
            setDropdownOpen(false);
            setSearchError(null);
            setIsSearching(false);
            return;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setIsSearching(true);
            setSearchError(null);

            try {
                const found = await searchWorkspaceAssets(deferredQuery, 6, controller.signal);
                if (controller.signal.aborted) return;

                startTransition(() => {
                    setResults(found);
                    setDropdownOpen(found.length > 0);
                });
            } catch (error) {
                if (controller.signal.aborted) return;
                setSearchError(error instanceof Error ? error.message : 'Search unavailable');
                setResults([]);
                setDropdownOpen(false);
            } finally {
                if (!controller.signal.aborted) {
                    setIsSearching(false);
                }
            }
        }, 120);

        return () => {
            controller.abort();
            window.clearTimeout(timer);
        };
    }, [deferredQuery]);

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

    const handleInputKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Escape') {
            if (dropdownOpen) {
                setDropdownOpen(false);
                setHighlightedIndex(-1);
            } else {
                inputRef.current?.blur();
            }
            return;
        }
        if (event.key === 'ArrowDown' && dropdownOpen && results.length > 0) {
            event.preventDefault();
            setHighlightedIndex((prev) => (prev + 1) % results.length);
            return;
        }
        if (event.key === 'ArrowUp' && dropdownOpen && results.length > 0) {
            event.preventDefault();
            setHighlightedIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
            return;
        }
        if (event.key === 'Enter' && highlightedIndex >= 0 && results[highlightedIndex]) {
            event.preventDefault();
            handleSelect(results[highlightedIndex]);
            return;
        }
    }, [dropdownOpen, results, highlightedIndex, handleSelect]);

    const handleSubmit = useCallback((event: React.FormEvent) => {
        event.preventDefault();

        if (highlightedIndex >= 0 && results[highlightedIndex]) {
            onSearch(results[highlightedIndex].ticker, results[highlightedIndex]);
            return;
        }

        if (results.length > 0) {
            onSearch(results[0].ticker, results[0]);
            return;
        }

        if (!query.trim()) {
            return;
        }

        const ticker = query.trim().toUpperCase();
        onSearch(ticker, {
            ticker,
            name: ticker,
            exchange: 'Manual input',
            assetClass: 'EQUITY',
            sector: 'Unclassified',
            hasCachedReport: false,
            researcherCount: 0,
        });
    }, [onSearch, query, results, highlightedIndex]);

    const cardBg = lightMode ? 'rgba(252,252,253,0.96)' : 'rgba(0,0,0,0.96)';
    const cardBorder = lightMode ? 'rgba(229,231,235,0.8)' : '#1A1A1A';
    const headline = workspaceSummary
        ? 'Search coverage first, then move into signal.'
        : 'Opening the Quantus workspace\u2026';
    const bodyCopy = workspaceSummary
        ? 'Every search now runs against the Quantus server. Cached reports open instantly, and uncached assets hand off into a clearly labeled starter shell.'
        : 'Fetching workspace status, cached coverage, and server-side search.';
    const helperText = results[0]?.hasCachedReport
        ? `Cached ${results[0].cachedReportAge} \u00B7 ${results[0].researcherCount ?? 0} researchers`
        : 'Press T to jump back into search at any time';
    const resumeAsset = recentAssets[0] ?? pinnedAssets[0] ?? null;

    return (
        <section className="relative space-y-16">
            {/* ── Main hero card ──────────────────────────────────────────────── */}
            <div
                className={lightMode ? 'bis-page-shell' : 'relative overflow-hidden rounded-[2.5rem] border'}
                style={lightMode ? undefined : {
                    background: 'linear-gradient(180deg, rgba(12,18,28,0.96) 0%, rgba(9,13,21,0.98) 100%)',
                    borderColor: cardBorder,
                    boxShadow: '0 28px 80px rgba(0,0,0,0.32)',
                }}
            >
                <div className="bis-wave-bg" />
                <div className="relative z-10 px-6 py-8 md:px-10 md:py-12">
                    <div className="grid gap-10 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] xl:items-start">
                        <div className="max-w-3xl">
                            {/* Label pill */}
                            <div
                                className={lightMode ? 'bis-eyebrow mb-6' : 'inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-medium shadow-sm mb-6'}
                                style={lightMode ? undefined : {
                                    background: 'rgba(255,255,255,0.05)',
                                    borderColor: '#1A1A1A',
                                    color: '#9CA3AF',
                                    backdropFilter: 'blur(8px)',
                                    WebkitBackdropFilter: 'blur(8px)',
                                }}
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                Quantus workspace on the BI Solutions platform
                            </div>

                            {/* Hero heading */}
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="font-bold tracking-tight leading-[1.02]"
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: 'clamp(2.2rem, 4.2vw, 3.8rem)',
                                    color: lightMode ? '#09090B' : '#F9FAFB',
                                }}
                            >
                                {headline}
                            </motion.h1>

                            {/* Body copy */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 }}
                                className="mt-6 max-w-2xl text-lg leading-relaxed"
                                style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}
                            >
                                {bodyCopy}
                            </motion.p>

                            {/* Status badges */}
                            <div className="mt-7 flex flex-wrap items-center gap-3">
                                <StatusBadge lightMode={lightMode} label={status.label} tone={status.badgeTone} />
                                <div
                                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium shadow-sm"
                                    style={{
                                        background: lightMode ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.05)',
                                        borderColor: lightMode ? '#E5E7EB' : '#1A1A1A',
                                        color: lightMode ? '#475569' : '#9CA3AF',
                                        backdropFilter: 'blur(8px)',
                                        WebkitBackdropFilter: 'blur(8px)',
                                    }}
                                >
                                    <Database className="w-3.5 h-3.5" />
                                    Server-backed search and report URLs
                                </div>
                            </div>

                            {/* ── Metrics cards grid ─────────────────────────────── */}
                            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {metrics.map((item) => (
                                    <div
                                        key={item.label}
                                        className={lightMode ? 'bis-section-card rounded-2xl px-5 py-4 shadow-none transition-all duration-300' : 'rounded-2xl border px-5 py-4 shadow-sm transition-all duration-300'}
                                        style={lightMode ? undefined : {
                                            background: 'rgba(255,255,255,0.03)',
                                            borderColor: cardBorder,
                                            backdropFilter: 'blur(8px)',
                                            WebkitBackdropFilter: 'blur(8px)',
                                        }}
                                    >
                                        <div className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: lightMode ? '#9CA3AF' : '#7B8CA4' }}>
                                            {item.label}
                                        </div>
                                        <div className="mt-2 text-2xl font-bold tracking-tight" style={{ color: lightMode ? '#09090B' : '#F9FAFB', fontFamily: 'var(--font-heading)' }}>
                                            {item.value}
                                        </div>
                                        {item.supportingText && (
                                            <div className="mt-2 text-xs leading-relaxed" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                                                {item.supportingText}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* ── Resume + Pinned cards ──────────────────────────── */}
                            {(resumeAsset || pinnedAssets.length > 0 || recentAssets.length > 0) && (
                                <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                                    {resumeAsset && (
                                        <motion.button
                                            type="button"
                                            whileHover={{ y: -2, boxShadow: lightMode ? '0 12px 32px rgba(15,23,42,0.08)' : '0 16px 40px rgba(0,0,0,0.3)' }}
                                            onClick={() => onSearch(resumeAsset.ticker, resumeAsset)}
                                            className={lightMode ? 'bis-section-card rounded-3xl px-5 py-5 text-left shadow-none transition-all duration-300' : 'rounded-3xl border px-5 py-5 text-left shadow-sm transition-all duration-300'}
                                            style={lightMode ? undefined : {
                                                background: 'rgba(255,255,255,0.03)',
                                                borderColor: cardBorder,
                                                backdropFilter: 'blur(8px)',
                                                WebkitBackdropFilter: 'blur(8px)',
                                            }}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: lightMode ? '#9CA3AF' : '#6B7280' }}>
                                                        Resume last report
                                                    </p>
                                                    <div className="mt-2 text-lg font-bold tracking-tight" style={{ color: lightMode ? '#09090B' : '#F9FAFB', fontFamily: 'var(--font-heading)' }}>
                                                        {resumeAsset.ticker} · {resumeAsset.name}
                                                    </div>
                                                    <p className="mt-2 text-sm leading-relaxed" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                                                        Jump back into the most recent Quantus route without typing again.
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            onTogglePinned(resumeAsset);
                                                        }}
                                                        className="rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm transition-colors"
                                                        style={{ background: lightMode ? 'rgba(9,9,11,0.04)' : 'rgba(255,255,255,0.06)', color: lightMode ? '#374151' : '#D1D5DB' }}
                                                    >
                                                        {pinnedAssets.some((asset) => asset.ticker === resumeAsset.ticker) ? 'Unpin' : 'Pin'}
                                                    </button>
                                                    <div className="rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm" style={{ background: lightMode ? 'rgba(9,9,11,0.04)' : 'rgba(255,255,255,0.06)', color: lightMode ? '#374151' : '#D1D5DB' }}>
                                                        {resumeAsset.hasCachedReport ? 'Cached' : 'Starter'}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    )}

                                    <div
                                        className={lightMode ? 'bis-section-card rounded-3xl px-5 py-5 shadow-none' : 'rounded-3xl border px-5 py-5 shadow-sm'}
                                        style={lightMode ? undefined : {
                                            background: 'rgba(255,255,255,0.03)',
                                            borderColor: cardBorder,
                                            backdropFilter: 'blur(8px)',
                                            WebkitBackdropFilter: 'blur(8px)',
                                        }}
                                    >
                                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: lightMode ? '#9CA3AF' : '#6B7280' }}>
                                            <Bookmark className="w-3.5 h-3.5" />
                                            Pinned tickers
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {pinnedAssets.length === 0 && (
                                                <span className="text-sm" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                                                    Pin high-priority names here for faster return visits.
                                                </span>
                                            )}
                                            {pinnedAssets.map((asset) => (
                                                <div
                                                    key={asset.ticker}
                                                    className="inline-flex items-center gap-1 rounded-full border px-1 py-1 shadow-sm transition-all duration-200"
                                                    style={{
                                                        background: lightMode ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.05)',
                                                        borderColor: lightMode ? '#E5E7EB' : '#1A1A1A',
                                                    }}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => onSearch(asset.ticker, asset)}
                                                        className="rounded-full px-2.5 py-1 text-xs font-medium"
                                                        style={{ color: lightMode ? '#374151' : '#D1D5DB' }}
                                                    >
                                                        {asset.ticker}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onTogglePinned(asset)}
                                                        className="rounded-full px-2 py-1 text-xs"
                                                        style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}
                                                        aria-label={`Unpin ${asset.ticker}`}
                                                    >
                                                        <Bookmark className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Search panel ───────────────────────────────────── */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="mt-8"
                                ref={dropRef}
                            >
                                <form onSubmit={handleSubmit}>
                                    <div
                                        className={lightMode ? 'bis-section-card rounded-[2rem] p-5 md:p-6' : 'rounded-[2rem] border p-5 md:p-6'}
                                        style={lightMode ? undefined : {
                                            background: 'rgba(255,255,255,0.03)',
                                            borderColor: cardBorder,
                                            boxShadow: '0 20px 56px rgba(0,0,0,0.25)',
                                        }}
                                    >
                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: lightMode ? '#9CA3AF' : '#6B7280' }}>
                                                    Coverage search
                                                </p>
                                                <p className="mt-1 text-sm leading-relaxed" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                                                    Search by ticker, company, crypto, or commodity and open the report route that Quantus knows about.
                                                </p>
                                            </div>
                                            <StatusBadge lightMode={lightMode} label={status.mode === 'mixed' ? 'Cached + starter handoff' : status.label} tone={status.badgeTone} />
                                        </div>

                                        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center">
                                            <div
                                                className="search-input-focus flex-1 rounded-2xl border px-4 py-3.5 flex items-center gap-3 transition-all duration-300"
                                                style={{
                                                    background: lightMode
                                                        ? 'linear-gradient(to right, rgba(249,250,251,1), rgba(255,255,255,1))'
                                                        : 'rgba(255,255,255,0.02)',
                                                    borderColor: cardBorder,
                                                }}
                                            >
                                                <Search className="w-5 h-5 flex-shrink-0" style={{ color: lightMode ? '#9CA3AF' : '#6B7280' }} />
                                                <input
                                                    id="ticker-input"
                                                    ref={inputRef}
                                                    type="text"
                                                    value={query}
                                                    onChange={(event) => setQuery(event.target.value)}
                                                    onKeyDown={handleInputKeyDown}
                                                    placeholder="Press / to search · NVDA, BTC-USD, gold, or a company name"
                                                    className="flex-1 bg-transparent text-base md:text-lg outline-none placeholder:text-gray-400"
                                                    style={{ color: lightMode ? '#09090B' : '#F9FAFB' }}
                                                    autoComplete="off"
                                                    role="combobox"
                                                    aria-expanded={dropdownOpen}
                                                    aria-haspopup="listbox"
                                                    aria-controls="search-autocomplete"
                                                    aria-activedescendant={highlightedIndex >= 0 ? `search-option-${highlightedIndex}` : undefined}
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
                                                        className="w-8 h-8 rounded-full inline-flex items-center justify-center transition-colors"
                                                        style={{
                                                            background: lightMode ? 'rgba(9,9,11,0.06)' : 'rgba(255,255,255,0.06)',
                                                            color: lightMode ? '#6B7280' : '#9CA3AF',
                                                        }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <motion.button
                                                type="submit"
                                                whileHover={{ y: -2 }}
                                                className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold transition-all duration-300"
                                                style={{
                                                    background: lightMode ? '#09090B' : '#FFFFFF',
                                                    color: lightMode ? '#FFFFFF' : '#09090B',
                                                    opacity: query.trim() ? 1 : 0.6,
                                                    boxShadow: lightMode
                                                        ? '0 4px 14px rgba(0,0,0,0.2)'
                                                        : '0 4px 14px rgba(255,255,255,0.1)',
                                                }}
                                            >
                                                {results[0]?.hasCachedReport ? 'Open cached report' : 'Open report route'}
                                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                            </motion.button>
                                        </div>

                                        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                            <div
                                                className="inline-flex max-w-xl items-start gap-3 rounded-2xl border px-4 py-3 text-xs text-left shadow-sm"
                                                style={{
                                                    background: lightMode ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.10)',
                                                    borderColor: lightMode ? 'rgba(252,211,77,0.5)' : '#6B4A12',
                                                    color: lightMode ? '#78350F' : '#FDE68A',
                                                }}
                                            >
                                                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                <span className="leading-relaxed">{status.description} {status.detail}</span>
                                            </div>

                                            {!dropdownOpen && popularTickers.length > 0 && (
                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                    <span className="font-medium" style={{ color: lightMode ? '#9CA3AF' : '#6B7280' }}>Popular</span>
                                                    {popularTickers.map((ticker) => (
                                                        <button
                                                            key={ticker}
                                                            type="button"
                                                            onClick={() => setQuery(ticker)}
                                                            className="rounded-full px-3 py-1.5 transition-all duration-200 border font-medium shadow-sm"
                                                            style={{
                                                                background: lightMode ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.05)',
                                                                borderColor: lightMode ? '#E5E7EB' : '#1A1A1A',
                                                                color: lightMode ? '#374151' : '#D1D5DB',
                                                            }}
                                                        >
                                                            {ticker}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Autocomplete dropdown */}
                                    <AnimatePresence>
                                        {dropdownOpen && (
                                            <motion.div
                                                id="search-autocomplete"
                                                role="listbox"
                                                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                                className="mt-3 rounded-3xl border overflow-hidden"
                                                style={{
                                                    background: cardBg,
                                                    borderColor: cardBorder,
                                                    boxShadow: lightMode
                                                        ? '0 24px 60px rgba(15,23,42,0.12), inset 0 0 0 1px rgba(255,255,255,0.5)'
                                                        : '0 24px 64px rgba(0,0,0,0.35)',
                                                    backdropFilter: 'blur(16px)',
                                                    WebkitBackdropFilter: 'blur(16px)',
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
                                                        highlighted={index === highlightedIndex}
                                                    />
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </form>

                                <div className="mt-4 text-sm flex flex-wrap items-center gap-3" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                                    <span>{helperText}</span>
                                    {isSearching && <span className="font-medium">Searching server coverage\u2026</span>}
                                    {searchError && <span className="text-red-500">{searchError}</span>}
                                </div>

                                {/* Recent assets */}
                                {recentAssets.length > 0 && (
                                    <div
                                        className="mt-4 rounded-2xl border px-4 py-3 shadow-sm"
                                        style={{
                                            background: lightMode ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.02)',
                                            borderColor: lightMode ? 'rgba(229,231,235,0.6)' : '#1A1A1A',
                                            backdropFilter: 'blur(8px)',
                                            WebkitBackdropFilter: 'blur(8px)',
                                        }}
                                    >
                                        <div className="flex flex-wrap items-center gap-2 text-xs">
                                            <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.18em]" style={{ color: lightMode ? '#9CA3AF' : '#6B7280' }}>
                                                <Clock3 className="w-3.5 h-3.5" />
                                                Recent
                                            </span>
                                            {recentAssets.slice(0, 5).map((asset) => (
                                                <div
                                                    key={asset.ticker}
                                                    className="inline-flex items-center gap-1 rounded-full border px-1 py-1 shadow-sm transition-all duration-200"
                                                    style={{
                                                        background: lightMode ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.05)',
                                                        borderColor: lightMode ? '#E5E7EB' : '#1A1A1A',
                                                    }}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => onSearch(asset.ticker, asset)}
                                                        className="rounded-full px-2.5 py-1 text-xs font-medium"
                                                        style={{ color: lightMode ? '#374151' : '#D1D5DB' }}
                                                    >
                                                        {asset.ticker}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onTogglePinned(asset)}
                                                        className="rounded-full px-2 py-1 text-xs"
                                                        style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}
                                                        aria-label={`Pin ${asset.ticker}`}
                                                    >
                                                        <Bookmark className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* ── Right column: Workspace handoff panel ───────────── */}
                        <div
                            className={lightMode ? 'bis-section-card rounded-[2rem] p-6 md:p-7' : 'rounded-[2rem] border p-6 md:p-7'}
                            style={lightMode ? undefined : {
                                background: 'rgba(0,0,0,0.86)',
                                borderColor: cardBorder,
                                boxShadow: '0 24px 72px rgba(0,0,0,0.30)',
                            }}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: lightMode ? '#9CA3AF' : '#6B7280' }}>
                                        Workspace handoff
                                    </p>
                                    <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight" style={{ color: lightMode ? '#09090B' : '#F9FAFB', fontFamily: 'var(--font-heading)' }}>
                                        Cleaner search, explicit coverage, deeper routes.
                                    </h2>
                                </div>
                                <div
                                    className="rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm"
                                    style={{
                                        background: lightMode ? 'linear-gradient(135deg, #1a1a2e, #16213e)' : 'rgba(255,255,255,0.06)',
                                        color: lightMode ? '#FFFFFF' : '#9CA3AF',
                                        letterSpacing: '0.05em',
                                    }}
                                >
                                    /workspace/*
                                </div>
                            </div>

                            {/* Guide items with numbered indicators */}
                            <div className="mt-6 grid gap-3">
                                {guides.map((guide, index) => (
                                    <div
                                        key={guide.title}
                                        className="rounded-3xl border px-5 py-5 shadow-sm transition-all duration-300"
                                        style={{
                                            background: lightMode
                                                ? 'linear-gradient(135deg, rgba(249,250,251,0.8), rgba(255,255,255,1))'
                                                : 'rgba(255,255,255,0.03)',
                                            borderColor: cardBorder,
                                        }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-md"
                                                style={{
                                                    background: lightMode ? '#09090B' : '#FFFFFF',
                                                    color: lightMode ? '#FFFFFF' : '#09090B',
                                                }}
                                            >
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold" style={{ color: lightMode ? '#111827' : '#F9FAFB' }}>
                                                    {guide.title}
                                                </div>
                                                <div className="mt-1.5 text-xs leading-relaxed" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                                                    {guide.description}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Coverage note */}
                            <div
                                className="mt-6 rounded-3xl border px-5 py-5 shadow-sm"
                                style={{
                                    background: lightMode ? 'rgba(249,250,251,0.96)' : 'rgba(255,255,255,0.03)',
                                    borderColor: cardBorder,
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm"
                                        style={{
                                            background: lightMode ? 'rgba(249,250,251,1)' : 'rgba(255,255,255,0.06)',
                                            border: `1px solid ${cardBorder}`,
                                        }}
                                    >
                                        <FileStack className="w-5 h-5" style={{ color: lightMode ? '#111827' : '#F9FAFB' }} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: lightMode ? '#9CA3AF' : '#6B7280' }}>
                                            Coverage note
                                        </p>
                                        <p className="mt-2 text-sm leading-relaxed" style={{ color: lightMode ? '#475569' : '#9CA3AF' }}>
                                            Cached assets open directly into shareable report URLs. Everything else opens a starter shell with conservative defaults instead of pretending live data exists.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Featured coverage section ───────────────────────────────────── */}
            <div className="mt-16">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: lightMode ? '#9CA3AF' : '#6B7280' }}>Featured coverage</p>
                        <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)', color: lightMode ? '#09090B' : '#F9FAFB' }}>
                            Cached reports available now
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed max-w-2xl" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                            Open tracked assets instantly, bookmark the report route, and move deeper into Quantus without leaving the BI Solutions shell.
                        </p>
                    </div>
                    <StatusBadge lightMode={lightMode} label={status.label} tone={status.badgeTone} />
                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {featuredAssets.map((asset) => (
                        <DiscoveryTile key={asset.ticker} asset={asset} onSelect={handleSelect} lightMode={lightMode} />
                    ))}
                </div>
            </div>
        </section>
    );
}
