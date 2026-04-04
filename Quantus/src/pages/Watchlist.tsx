import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    RefreshCw, Bell, TrendingUp, TrendingDown, AlertTriangle,
    Users, Clock, Filter, Calendar, X, Search, ArrowUpDown,
} from 'lucide-react';
import { fetchUserWatchlist } from '../services/product';
import type { AssetClass, AssetEntry, QuantusWatchlistItem as WatchlistItem, SignalType } from '../types';

type WatchlistSortKey = 'name' | 'signal' | 'confidence' | 'change';

const SIGNAL_RANK: Record<string, number> = {
    'STRONG BUY': 5, 'BUY': 4, 'NEUTRAL': 3, 'SELL': 2, 'STRONG SELL': 1,
};

interface WatchlistProps {
    userTier?: 'FREE' | 'UNLOCKED' | 'INSTITUTIONAL';
    lightMode?: boolean;
    onSelectTicker?: (ticker: string) => void;
    onOpenAlerts?: () => void;
    onRemove?: (ticker: string) => void;
    savedAssets?: AssetEntry[];
    isAuthenticated?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function signalStyle(s: SignalType): { bg: string; color: string } {
    return {
        'STRONG BUY': { bg: 'rgba(16,185,129,0.14)', color: '#10B981' },
        'BUY': { bg: 'rgba(52,211,153,0.1)', color: '#34D399' },
        'NEUTRAL': { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' },
        'SELL': { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' },
        'STRONG SELL': { bg: 'rgba(239,68,68,0.2)', color: '#EF4444' },
    }[s] ?? { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' };
}

function freshnessLabel(iso: string): { label: string; color: string } {
    const h = (Date.now() - new Date(iso).getTime()) / 3_600_000;
    if (h < 24) return { label: 'Fresh', color: '#10B981' };
    if (h < 48) return { label: 'Aging', color: '#F59E0B' };
    return { label: 'Stale', color: '#EF4444' };
}

function MiniBar({ value, color }: { value: number; color: string }) {
    const pct = Math.round((value + 1) * 50);
    return (
        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(15,23,42,0.08)' }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        </div>
    );
}

function savedAssetToWatchlistItem(asset: AssetEntry): WatchlistItem {
    return {
        ticker: asset.ticker,
        name: asset.name,
        exchange: asset.exchange,
        assetClass: asset.assetClass,
        sector: asset.sector,
        signal: 'NEUTRAL',
        confidence: asset.hasCachedReport ? 60 : 20,
        regime: asset.hasCachedReport ? 'Tracked' : 'Starter',
        momentum: 0,
        sentiment: 0,
        currentPrice: asset.currentPrice ?? 0,
        dayChangePct: asset.dayChangePct ?? 0,
        forecast30d: asset.hasCachedReport ? 'Cached route' : 'Starter shell',
        lastUpdated: new Date().toISOString(),
        nextRefresh: asset.cachedReportAge ?? 'Pinned',
        researcherCount: asset.researcherCount ?? 0,
        knowledgeGraphAlert: asset.sector ? `${asset.sector} · saved from workspace` : 'Saved from workspace',
    };
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <div className="bis-section-card rounded-[24px] p-4">
            {[80, 60, 48, 36, 52].map((w, i) => (
                <div key={i} className={`h-${i === 0 ? 4 : 2.5} rounded skeleton mb-${i === 0 ? 3 : 2}`} style={{ width: `${w}%` }} />
            ))}
        </div>
    );
}

// ─── Watchlist ticker card ────────────────────────────────────────────────────

function WatchlistCard({
    item, lightMode, onSelect, onRemove,
}: {
    item: WatchlistItem; lightMode?: boolean; onSelect: () => void; onRemove?: () => void;
}) {
    const positive = item.dayChangePct >= 0;
    const sig = signalStyle(item.signal);
    const fresh = freshnessLabel(item.lastUpdated);
    const border = lightMode ? '#E5E7EB' : '#1A1A1A';
    const tp = lightMode ? '#111827' : '#F9FAFB';
    const ts = lightMode ? '#6B7280' : '#9CA3AF';

    const assetBadgeCls: Record<AssetClass, string> = {
        EQUITY: 'badge badge-equity', CRYPTO: 'badge badge-crypto',
        COMMODITY: 'badge badge-commodity', ETF: 'badge badge-etf',
    };

    return (
        <motion.div
            whileHover={{ y: -3 }}
            onClick={onSelect}
            className="bis-section-card rounded-[24px] p-4 cursor-pointer transition-colors relative"
        >
            {/* Knowledge graph alert banner */}
            {item.knowledgeGraphAlert && (
                <div className="flex items-start gap-1.5 text-xs p-2 rounded-lg mb-3"
                    style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span style={{ color: ts }}>{item.knowledgeGraphAlert}</span>
                </div>
            )}

            {/* Header row */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 text-blue-500"
                        style={{ background: 'rgba(59,130,246,0.14)' }}>
                        {item.ticker.slice(0, 2)}
                    </div>
                    <div>
                        <div className="font-semibold text-sm" style={{ color: tp }}>{item.name}</div>
                        <div className="text-xs font-mono mt-0.5" style={{ color: ts }}>{item.ticker}</div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className={assetBadgeCls[item.assetClass]}>{item.assetClass}</span>
                    {onRemove && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onRemove(); }}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            title="Remove from watchlist"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Signal + Regime */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: sig.bg, color: sig.color, border: `1px solid ${sig.color}30` }}>
                    {item.signal}
                </span>
                    <span className="text-xs" style={{ color: ts }}>{item.confidence}%</span>
                <span className="text-xs ml-auto" style={{ color: ts }}>{item.regime}</span>
            </div>

            {/* Momentum + Sentiment pills */}
            <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs" style={{ color: ts }}>Mom</span>
                    <MiniBar value={item.momentum} color={item.momentum >= 0 ? '#10B981' : '#EF4444'} />
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs" style={{ color: ts }}>Sent</span>
                    <MiniBar value={item.sentiment} color={item.sentiment >= 0 ? '#3B82F6' : '#F97316'} />
                </div>
            </div>

            {/* Asset-class pill */}
            {item.fearAndGreed !== undefined && (
                <div className="text-xs px-2 py-1 rounded-lg mb-2"
                    style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#A78BFA' }}>
                    Fear &amp; Greed: {item.fearAndGreed} ({item.fearAndGreed > 60 ? 'Greed' : item.fearAndGreed < 40 ? 'Fear' : 'Neutral'})
                </div>
            )}
            {item.cotSignal && (
                <div className="text-xs px-2 py-1 rounded-lg mb-2"
                    style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#FBBF24' }}>
                    COT: {item.cotSignal}
                </div>
            )}
            {item.fundFlows && (
                <div className="text-xs px-2 py-1 rounded-lg mb-2"
                    style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)', color: '#2DD4BF' }}>
                    Fund flows: {item.fundFlows}
                </div>
            )}

            {/* Price row */}
            <div className="flex items-center justify-between mb-3">
                <span className="font-mono font-semibold text-sm" style={{ color: tp }}>
                    {item.currentPrice > 1000 ? `$${item.currentPrice.toLocaleString()}` : `$${item.currentPrice.toFixed(2)}`}
                </span>
                <span className={`text-xs flex items-center gap-0.5 font-semibold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {positive ? '+' : ''}{item.dayChangePct.toFixed(2)}%
                </span>
                <span className="text-xs" style={{ color: ts }}>Setup: {item.forecast30d}</span>
            </div>

            {/* Earnings flag — equity / ETF only */}
            {item.daysToEarnings !== undefined && (
                <div className="flex items-center gap-1.5 text-xs mb-2"
                    style={{ color: item.daysToEarnings <= 7 ? '#F59E0B' : '#6B7280' }}>
                    <Calendar className="w-3 h-3" />
                    Earnings in {item.daysToEarnings}d
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t text-xs flex-wrap gap-1" style={{ borderColor: border }}>
                <div className="flex items-center gap-3" style={{ color: ts }}>
                    <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {item.researcherCount}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.nextRefresh} refresh
                    </span>
                </div>
                <span className="font-semibold" style={{ color: fresh.color }}>{fresh.label}</span>
            </div>
        </motion.div>
    );
}

// ─── Main Watchlist ───────────────────────────────────────────────────────────

export function Watchlist({
    userTier = 'FREE',
    lightMode,
    onSelectTicker,
    onOpenAlerts,
    onRemove,
    savedAssets = [],
    isAuthenticated = false,
}: WatchlistProps) {
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<string>('ALL');
    const [sortBy, setSortBy] = useState<WatchlistSortKey>('name');
    const [searchQuery, setSearchQuery] = useState('');
    const [serverItems, setServerItems] = useState<WatchlistItem[]>([]);
    const [activeAlertCount, setActiveAlertCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(isAuthenticated);

    const loadWatchlist = useCallback(async (signal?: AbortSignal) => {
        if (!isAuthenticated) {
            setServerItems([]);
            setActiveAlertCount(0);
            setError(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        const data = await fetchUserWatchlist(signal);
        setServerItems(data.items ?? []);
        setActiveAlertCount(Number(data.activeAlertCount ?? 0));
        setError(null);
        setLoading(false);
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) {
            setServerItems([]);
            setActiveAlertCount(0);
            setError(null);
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        void loadWatchlist(controller.signal).catch((loadError) => {
            if (controller.signal.aborted) return;
            setError(loadError instanceof Error ? loadError.message : 'Unable to load watchlist');
            setLoading(false);
        });

        return () => controller.abort();
    }, [isAuthenticated, loadWatchlist]);

    const handleRefreshAll = useCallback(async () => {
        if (!isAuthenticated) return;
        setRefreshing(true);
        try {
            await loadWatchlist();
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Unable to refresh watchlist');
        } finally {
            setRefreshing(false);
        }
    }, [isAuthenticated, loadWatchlist]);

    const allItems = useMemo(() => {
        if (isAuthenticated) {
            return serverItems;
        }

        const merged = new Map<string, WatchlistItem>();
        for (const asset of savedAssets) {
            if (!merged.has(asset.ticker)) {
                merged.set(asset.ticker, savedAssetToWatchlistItem(asset));
            }
        }

        return Array.from(merged.values());
    }, [isAuthenticated, savedAssets, serverItems]);

    const filtered = useMemo(() => {
        let items = filter === 'ALL' ? allItems : allItems.filter(i => i.assetClass === filter);

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            items = items.filter(i => i.ticker.toLowerCase().includes(q) || i.name.toLowerCase().includes(q));
        }

        // Sort
        const sorted = [...items];
        switch (sortBy) {
            case 'confidence': sorted.sort((a, b) => b.confidence - a.confidence); break;
            case 'signal': sorted.sort((a, b) => (SIGNAL_RANK[b.signal] ?? 0) - (SIGNAL_RANK[a.signal] ?? 0)); break;
            case 'change': sorted.sort((a, b) => b.dayChangePct - a.dayChangePct); break;
            case 'name': default: sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
        }
        return sorted;
    }, [allItems, filter, searchQuery, sortBy]);

    const tp = lightMode ? '#111827' : '#F9FAFB';
    const ts = lightMode ? '#6B7280' : '#9CA3AF';

    return (
        <div className="mx-auto max-w-7xl">
            <section className="bis-page-shell px-6 py-8 md:px-8 md:py-9">
                {/* Header */}
                <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <div className="bis-eyebrow mb-4">
                            <Bell className="h-3.5 w-3.5" />
                            Quantus Watchlist
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ color: tp }}>Watchlist</h1>
                        <p className="text-sm mt-2 md:text-base" style={{ color: ts }}>
                            {isAuthenticated
                                ? `${allItems.length} persisted Quantus watchlist assets with live signal context, refresh cadence, and server-side alert subscriptions.`
                                : `${allItems.length} locally saved assets. Sign in to persist your watchlist and alerts across devices.`}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefreshAll}
                            disabled={!isAuthenticated || refreshing}
                            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-sm disabled:opacity-40"
                            title={isAuthenticated ? '' : 'Sign in to refresh the persisted watchlist'}
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh Watchlist
                        </button>
                        <button
                            type="button"
                            onClick={onOpenAlerts}
                            className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800"
                        >
                            <Bell className="w-4 h-4" />
                            Alerts{activeAlertCount > 0 ? ` (${activeAlertCount})` : ''}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        {error}
                    </div>
                )}

                {/* Search + Filter + Sort bar */}
                <div className="mb-8 space-y-3">
                    {/* Search input */}
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by ticker or name..."
                            className="w-full pl-9 pr-8 py-2 rounded-full text-sm border bg-transparent outline-none transition-colors"
                            style={{
                                borderColor: lightMode ? '#E5E7EB' : '#1A1A1A',
                                color: lightMode ? '#111827' : '#F9FAFB',
                            }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="w-4 h-4 text-gray-400" />
                        {['ALL', 'EQUITY', 'CRYPTO', 'COMMODITY', 'ETF'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`tab-btn rounded-full border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${filter === f ? 'active' : ''}`}
                            >
                                {f}
                            </button>
                        ))}

                        <div className="w-px h-5 bg-slate-700 mx-1" />

                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                        {(['name', 'signal', 'confidence', 'change'] as WatchlistSortKey[]).map(key => (
                            <button
                                key={key}
                                onClick={() => setSortBy(key)}
                                className={`tab-btn rounded-full border border-transparent px-3 py-1.5 text-xs font-semibold capitalize tracking-[0.06em] ${sortBy === key ? 'active' : ''}`}
                            >
                                {key === 'change' ? '% Change' : key}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <AnimatePresence mode="popLayout">
                        {refreshing || loading
                            ? Array.from({ length: 5 }, (_, i) => <SkeletonCard key={i} />)
                            : filtered.map((item, i) => (
                                <motion.div
                                    key={item.ticker}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <WatchlistCard
                                        item={item}
                                        lightMode={lightMode}
                                        onSelect={() => onSelectTicker?.(item.ticker)}
                                        onRemove={onRemove ? () => onRemove(item.ticker) : undefined}
                                    />
                                </motion.div>
                            ))
                        }
                    </AnimatePresence>
                </div>

                {!refreshing && !loading && filtered.length === 0 && (
                    <div className="mt-6 rounded-[24px] border border-dashed border-gray-300 bg-white px-5 py-6 text-sm text-gray-600">
                        {isAuthenticated
                            ? 'No persisted watchlist assets yet. Save a ticker from the workspace or subscribe from a report to start building the list.'
                            : 'No local watchlist assets yet. Save a ticker from search or sign in to persist your watchlist.'}
                    </div>
                )}

                {/* FREE tier cap notice */}
                {userTier === 'FREE' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-8 rounded-[24px] border border-gray-200 bg-white px-5 py-4 text-center"
                    >
                        <p className="text-sm font-medium text-gray-600">
                            Watchlist is limited to 5 tickers on Free tier. Upgrade to Unlocked for up to 25.
                        </p>
                    </motion.div>
                )}
            </section>
        </div>
    );
}
