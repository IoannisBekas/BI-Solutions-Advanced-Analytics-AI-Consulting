import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    RefreshCw, Bell, TrendingUp, TrendingDown, AlertTriangle,
    Users, Clock, Filter, Calendar,
} from 'lucide-react';
import type { AssetClass, SignalType } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WatchlistItem {
    ticker: string;
    name: string;
    assetClass: AssetClass;
    signal: SignalType;
    confidence: number;
    regime: string;
    momentum: number;     // -1 to 1
    sentiment: number;    // -1 to 1
    currentPrice: number;
    dayChangePct: number;
    forecast30d: string;
    daysToEarnings?: number;
    lastUpdated: string;  // ISO
    nextRefresh: string;
    researcherCount: number;
    // Asset-class specific
    fearAndGreed?: number;        // CRYPTO
    cotSignal?: string;           // COMMODITY
    fundFlows?: string;           // ETF
    knowledgeGraphAlert?: string; // any
}

interface WatchlistProps {
    userTier?: 'FREE' | 'UNLOCKED' | 'INSTITUTIONAL';
    lightMode?: boolean;
    onSelectTicker?: (ticker: string) => void;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_WATCHLIST: WatchlistItem[] = [
    {
        ticker: 'NVDA', name: 'NVIDIA Corp', assetClass: 'EQUITY',
        signal: 'STRONG BUY', confidence: 82, regime: 'Strong Uptrend',
        momentum: 0.84, sentiment: 0.71, currentPrice: 948.70, dayChangePct: 4.21,
        forecast30d: '+12.4%', daysToEarnings: 28, lastUpdated: new Date(Date.now() - 3 * 3600_000).toISOString(),
        nextRefresh: '21h', researcherCount: 47,
        knowledgeGraphAlert: 'TSMC capacity constraint may impact H200 lead times',
    },
    {
        ticker: 'AAPL', name: 'Apple Inc', assetClass: 'EQUITY',
        signal: 'BUY', confidence: 69, regime: 'Uptrend',
        momentum: 0.51, sentiment: 0.38, currentPrice: 213.49, dayChangePct: 0.44,
        forecast30d: '+5.8%', lastUpdated: new Date(Date.now() - 5 * 3600_000).toISOString(),
        nextRefresh: '19h', researcherCount: 34,
    },
    {
        ticker: 'BTC-USD', name: 'Bitcoin', assetClass: 'CRYPTO',
        signal: 'BUY', confidence: 74, regime: 'Strong Uptrend',
        momentum: 0.76, sentiment: 0.62, currentPrice: 62480, dayChangePct: 2.87,
        forecast30d: '+18.3%', lastUpdated: new Date(Date.now() - 2 * 3600_000).toISOString(),
        nextRefresh: '22h', researcherCount: 89,
        fearAndGreed: 72,
    },
    {
        ticker: 'GC=F', name: 'Gold Futures', assetClass: 'COMMODITY',
        signal: 'BUY', confidence: 71, regime: 'Uptrend',
        momentum: 0.58, sentiment: 0.44, currentPrice: 2312, dayChangePct: 0.63,
        forecast30d: '+4.1%', lastUpdated: new Date(Date.now() - 6 * 3600_000).toISOString(),
        nextRefresh: '18h', researcherCount: 22,
        cotSignal: 'Managed money net long +12%',
    },
    {
        ticker: 'SPY', name: 'SPDR S&P 500 ETF', assetClass: 'ETF',
        signal: 'NEUTRAL', confidence: 61, regime: 'Mean-Reverting',
        momentum: 0.12, sentiment: 0.05, currentPrice: 539.24, dayChangePct: 0.21,
        forecast30d: '+1.9%', lastUpdated: new Date(Date.now() - 4 * 3600_000).toISOString(),
        nextRefresh: '20h', researcherCount: 53,
        fundFlows: '$2.1B inflows (7d)',
    },
];

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
        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        </div>
    );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <div className="rounded-xl p-4" style={{ background: '#111827', border: '1px solid #1F2937' }}>
            {[80, 60, 48, 36, 52].map((w, i) => (
                <div key={i} className={`h-${i === 0 ? 4 : 2.5} rounded skeleton mb-${i === 0 ? 3 : 2}`} style={{ width: `${w}%` }} />
            ))}
        </div>
    );
}

// ─── Watchlist ticker card ────────────────────────────────────────────────────

function WatchlistCard({
    item, lightMode, onSelect,
}: {
    item: WatchlistItem; lightMode?: boolean; onSelect: () => void;
}) {
    const positive = item.dayChangePct >= 0;
    const sig = signalStyle(item.signal);
    const fresh = freshnessLabel(item.lastUpdated);
    const cardBg = lightMode ? 'rgba(255,255,255,0.95)' : '#111827';
    const border = lightMode ? '#E2E8F0' : '#1F2937';
    const tp = lightMode ? '#0F172A' : '#F9FAFB';
    const ts = lightMode ? '#475569' : '#9CA3AF';

    const assetBadgeCls: Record<AssetClass, string> = {
        EQUITY: 'badge badge-equity', CRYPTO: 'badge badge-crypto',
        COMMODITY: 'badge badge-commodity', ETF: 'badge badge-etf',
    };

    return (
        <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            onClick={onSelect}
            className="rounded-xl p-4 cursor-pointer transition-colors relative"
            style={{ background: cardBg, border: `1px solid ${border}` }}
        >
            {/* Knowledge graph alert banner */}
            {item.knowledgeGraphAlert && (
                <div className="flex items-start gap-1.5 text-xs p-2 rounded-lg mb-3"
                    style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span style={{ color: '#9CA3AF' }}>{item.knowledgeGraphAlert}</span>
                </div>
            )}

            {/* Header row */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ background: 'rgba(59,130,246,0.14)', color: '#3B82F6' }}>
                        {item.ticker.slice(0, 2)}
                    </div>
                    <div>
                        <div className="font-semibold text-sm" style={{ color: tp }}>{item.name}</div>
                        <div className="text-xs font-mono mt-0.5" style={{ color: ts }}>{item.ticker}</div>
                    </div>
                </div>
                <span className={assetBadgeCls[item.assetClass]}>{item.assetClass}</span>
            </div>

            {/* Signal + Regime */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: sig.bg, color: sig.color, border: `1px solid ${sig.color}30` }}>
                    {item.signal}
                </span>
                <span className="text-xs" style={{ color: ts }}>{item.confidence}%</span>
                <span className="text-xs ml-auto" style={{ color: '#6B7280' }}>{item.regime}</span>
            </div>

            {/* Momentum + Sentiment pills */}
            <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs" style={{ color: '#6B7280' }}>Mom</span>
                    <MiniBar value={item.momentum} color={item.momentum >= 0 ? '#10B981' : '#EF4444'} />
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs" style={{ color: '#6B7280' }}>Sent</span>
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
                <span className="text-xs" style={{ color: '#6B7280' }}>30d: {item.forecast30d}</span>
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
                <div className="flex items-center gap-3" style={{ color: '#6B7280' }}>
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

export function Watchlist({ userTier = 'FREE', lightMode, onSelectTicker }: WatchlistProps) {
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<string>('ALL');

    const handleRefreshAll = useCallback(async () => {
        if (userTier === 'FREE') return;
        setRefreshing(true);
        await new Promise(r => setTimeout(r, 2000));
        setRefreshing(false);
    }, [userTier]);

    const filtered = useMemo(() =>
        filter === 'ALL' ? MOCK_WATCHLIST : MOCK_WATCHLIST.filter(i => i.assetClass === filter),
        [filter],
    );

    const bg = lightMode ? '#F0F4FF' : '#0A0D14';
    const tp = lightMode ? '#0F172A' : '#F9FAFB';
    const ts = lightMode ? '#475569' : '#9CA3AF';

    return (
        <div style={{ background: bg, minHeight: '100vh', padding: '32px 24px' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: tp }}>Watchlist</h1>
                    <p className="text-sm mt-0.5" style={{ color: ts }}>
                        {MOCK_WATCHLIST.length} tickers · Real-time signal monitoring
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Refresh all */}
                    <button
                        onClick={handleRefreshAll}
                        disabled={userTier === 'FREE' || refreshing}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 hover:scale-105"
                        style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#3B82F6' }}
                        title={userTier === 'FREE' ? 'Unlock tier required' : ''}
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh All
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm cursor-pointer transition-all hover:scale-105"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: ts }}>
                        <Bell className="w-4 h-4" />
                        Alerts
                    </button>
                </div>
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
                <Filter className="w-4 h-4" style={{ color: '#6B7280' }} />
                {['ALL', 'EQUITY', 'CRYPTO', 'COMMODITY', 'ETF'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer tab-btn ${filter === f ? 'active' : ''}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                    {refreshing
                        ? Array.from({ length: 5 }, (_, i) => <SkeletonCard key={i} />)
                        : filtered.map((item, i) => (
                            <motion.div
                                key={item.ticker}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.06 }}
                            >
                                <WatchlistCard
                                    item={item}
                                    lightMode={lightMode}
                                    onSelect={() => onSelectTicker?.(item.ticker)}
                                />
                            </motion.div>
                        ))
                    }
                </AnimatePresence>
            </div>

            {/* FREE tier cap notice */}
            {userTier === 'FREE' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center mt-8 p-4 rounded-xl"
                    style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}
                >
                    <p className="text-sm" style={{ color: '#818CF8' }}>
                        Watchlist limited to 5 tickers on Free tier. Upgrade to Unlocked for up to 25.
                    </p>
                </motion.div>
            )}
        </div>
    );
}
