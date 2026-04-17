import type { ElementType } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
    BarChart2,
    BarChart3,
    Bot,
    Brain,
    ChevronDown,
    ChevronUp,
    DollarSign,
    GitMerge,
    Layers,
    LoaderCircle,
    RefreshCw,
    Shield,
    Target,
    TestTube,
    TrendingUp,
    Zap,
} from 'lucide-react';
import { isWorkspaceRequestError, fetchWorkspaceDeepDive } from '../../services/workspace';
import type { AssetClass } from '../../types';

interface DeepDiveModule {
    apiIndex: number;
    id: number;
    title: string;
    icon: ElementType;
    description: string;
    requiresTier?: 'UNLOCKED' | 'INSTITUTIONAL';
}

interface SectionEProps {
    ticker: string;
    assetClass: AssetClass;
    isAuthenticated: boolean;
    userTier?: 'FREE' | 'UNLOCKED' | 'INSTITUTIONAL';
    lightMode?: boolean;
    onUpgrade?: () => void;
}

const MODULES: DeepDiveModule[] = [
    { apiIndex: 0, id: 1, title: 'Time Series Forecasting', icon: TrendingUp, description: 'ARIMA, Prophet, and LSTM context with confidence bands.' },
    { apiIndex: 1, id: 2, title: 'Mean Reversion Analysis', icon: RefreshCw, description: 'Half-life, z-score, and entry discipline for reversal setups.' },
    { apiIndex: 2, id: 3, title: 'Sentiment Analysis', icon: Brain, description: 'News, social, and narrative pressure mapped into a single read.' },
    { apiIndex: 3, id: 4, title: 'Portfolio Optimization', icon: Target, description: 'Risk-adjusted allocation context and efficient frontier framing.' },
    { apiIndex: 4, id: 5, title: 'ML Feature Importance (SHAP)', icon: Layers, description: 'Which signals mattered most inside the recommendation stack.' },
    { apiIndex: 5, id: 6, title: 'High-Frequency Signal', icon: Zap, description: 'Intraday momentum and execution pressure around the current move.' },
    { apiIndex: 6, id: 7, title: 'Risk Management & VaR', icon: Shield, description: 'Stress, tail risk, and scenario discipline for the setup.' },
    { apiIndex: 7, id: 8, title: 'Options Pricing & Greeks', icon: DollarSign, description: 'Volatility surface and implied move context for the ticker.', requiresTier: 'UNLOCKED' },
    { apiIndex: 8, id: 9, title: 'Pairs Trading', icon: GitMerge, description: 'Cointegration and spread behavior against related names.', requiresTier: 'UNLOCKED' },
    { apiIndex: 9, id: 10, title: 'ML Backtesting', icon: TestTube, description: 'Walk-forward validation and signal accuracy under replay.', requiresTier: 'UNLOCKED' },
    { apiIndex: 10, id: 11, title: 'Reinforcement Learning Agent', icon: Bot, description: 'Allocation suggestions from the long-horizon RL policy.', requiresTier: 'INSTITUTIONAL' },
    { apiIndex: 11, id: 12, title: 'Factor Investing', icon: BarChart3, description: 'Value, momentum, quality, size, and low-vol decomposition.', requiresTier: 'UNLOCKED' },
];

const TIER_RANK = {
    FREE: 0,
    UNLOCKED: 1,
    INSTITUTIONAL: 2,
} as const;

function tierLabel(tier?: DeepDiveModule['requiresTier']) {
    if (!tier) return null;
    return tier === 'INSTITUTIONAL' ? 'Institutional tier' : 'Unlocked tier';
}

function hasTierAccess(
    userTier: SectionEProps['userTier'],
    requiredTier?: DeepDiveModule['requiresTier'],
) {
    if (!requiredTier) {
        return true;
    }

    return TIER_RANK[userTier ?? 'FREE'] >= TIER_RANK[requiredTier];
}

function splitDeepDiveParagraphs(text: string) {
    return text
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
}

function relativeTime(ts: number): string {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
}

function ModuleDetail({
    content,
    error,
    loading,
    loadedAt,
    lightMode,
}: {
    content: string | null;
    error: string | null;
    loading: boolean;
    loadedAt: number | null;
    lightMode?: boolean;
}) {
    const textPrimary = lightMode ? '#0F172A' : '#F9FAFB';
    const textSecondary = lightMode ? '#475569' : '#9CA3AF';
    const borderColor = lightMode ? '#E2E8F0' : '#1A1A1A';
    const dimBg = lightMode ? 'rgba(15,23,42,0.03)' : 'rgba(255,255,255,0.03)';
    const paragraphs = useMemo(() => splitDeepDiveParagraphs(content ?? ''), [content]);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (!loadedAt) return;
        const id = setInterval(() => setTick(t => t + 1), 60_000);
        return () => clearInterval(id);
    }, [loadedAt]);

    void tick; // consumed only to trigger re-render

    return (
        <div className="border-t px-5 py-4" style={{ borderColor }}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
                    style={{ background: dimBg, border: `1px solid ${borderColor}`, color: textSecondary }}
                >
                    Live module
                </span>
                {loadedAt ? (
                    <span
                        className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
                        style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }}
                    >
                        Updated {relativeTime(loadedAt)}
                    </span>
                ) : (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: textSecondary }}>
                        Generated on demand
                    </span>
                )}
            </div>

            {loading && (
                <div className="flex items-center gap-2 rounded-xl p-3 text-sm" style={{ background: dimBg, border: `1px solid ${borderColor}`, color: textSecondary }}>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Quantus is generating the live deep-dive module.
                </div>
            )}

            {!loading && error && (
                <div className="rounded-xl p-3 text-sm leading-relaxed" style={{ background: dimBg, border: `1px solid ${borderColor}`, color: textPrimary }}>
                    {error}
                </div>
            )}

            {!loading && !error && paragraphs.length > 0 && (
                <div className="space-y-3">
                    {paragraphs.map((paragraph, index) => (
                        <p key={`${index}-${paragraph.slice(0, 24)}`} className="text-sm leading-relaxed" style={{ color: index === 0 ? textPrimary : textSecondary }}>
                            {paragraph}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}

function ModuleRow({
    module,
    ticker,
    assetClass,
    isAuthenticated,
    userTier,
    lightMode,
    onUpgrade,
}: {
    module: DeepDiveModule;
    ticker: string;
    assetClass: AssetClass;
    isAuthenticated: boolean;
    userTier: 'FREE' | 'UNLOCKED' | 'INSTITUTIONAL';
    lightMode?: boolean;
    onUpgrade?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadedAt, setLoadedAt] = useState<number | null>(null);
    const Icon = module.icon;
    const textPrimary = lightMode ? '#0F172A' : '#F9FAFB';
    const textSecondary = lightMode ? '#475569' : '#9CA3AF';
    const borderColor = lightMode ? '#E2E8F0' : '#1A1A1A';
    const dimBg = lightMode ? 'rgba(15,23,42,0.03)' : 'rgba(255,255,255,0.03)';
    const lockedByTier = !hasTierAccess(userTier, module.requiresTier);
    const requiresSignIn = !isAuthenticated;
    const blocked = requiresSignIn || lockedByTier;

    useEffect(() => {
        if (!open || blocked || content || loading) {
            return undefined;
        }

        const controller = new AbortController();
        setLoading(true);
        setError(null);

        void fetchWorkspaceDeepDive(ticker, module.apiIndex, assetClass, controller.signal)
            .then((text) => {
                if (!controller.signal.aborted) {
                    setContent(text);
                    setLoadedAt(Date.now());
                }
            })
            .catch((fetchError: unknown) => {
                if (controller.signal.aborted) {
                    return;
                }

                if (isWorkspaceRequestError(fetchError)) {
                    if (fetchError.status === 401 || fetchError.code === 'auth_required') {
                        setError(fetchError.detail ?? 'Sign in to generate this live deep-dive module.');
                        onUpgrade?.();
                        return;
                    }

                    if (fetchError.code === 'deep_dive_tier_required') {
                        setError(fetchError.detail ?? fetchError.message);
                        onUpgrade?.();
                        return;
                    }
                }

                setError(fetchError instanceof Error ? fetchError.message : 'Deep-dive generation is unavailable right now.');
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [assetClass, blocked, content, loading, module.apiIndex, onUpgrade, open, ticker]);

    const handleToggle = () => {
        if (blocked) {
            onUpgrade?.();
            return;
        }

        setOpen((value) => !value);
    };

    const actionLabel = requiresSignIn
        ? 'Sign in to open'
        : lockedByTier
            ? 'Upgrade to open'
            : open
                ? 'Hide module'
                : 'Open module';

    return (
        <div className="overflow-hidden rounded-2xl" style={{ background: lightMode ? '#FFFFFF' : 'rgba(17,24,39,0.96)', border: `1px solid ${borderColor}` }}>
            <button
                type="button"
                onClick={handleToggle}
                className="flex w-full items-start gap-4 px-5 py-4 text-left"
            >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                    <Icon className="h-4 w-4" style={{ color: textPrimary }} />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: textSecondary }}>
                            {String(module.id).padStart(2, '0')}
                        </span>
                        <h3 className="text-base font-semibold tracking-tight" style={{ color: textPrimary }}>
                            {module.title}
                        </h3>
                        {module.requiresTier && (
                            <span
                                className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
                                style={{ background: dimBg, border: `1px solid ${borderColor}`, color: textSecondary }}
                            >
                                {tierLabel(module.requiresTier)}
                            </span>
                        )}
                    </div>

                    <p className="mt-2 text-sm leading-relaxed" style={{ color: textSecondary }}>
                        {module.description}
                    </p>
                </div>

                <div className="flex flex-shrink-0 items-center gap-3">
                    <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] sm:inline" style={{ color: textSecondary }}>
                        {actionLabel}
                    </span>
                    {blocked ? (
                        <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ background: dimBg, border: `1px solid ${borderColor}`, color: textSecondary }}>
                            {requiresSignIn ? 'Auth required' : 'Locked'}
                        </span>
                    ) : open ? (
                        <ChevronUp className="h-4 w-4" style={{ color: textSecondary }} />
                    ) : (
                        <ChevronDown className="h-4 w-4" style={{ color: textSecondary }} />
                    )}
                </div>
            </button>

            <AnimatePresence initial={false}>
                {open && !blocked && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: 'hidden' }}
                    >
                        <ModuleDetail content={content} error={error} loading={loading} loadedAt={loadedAt} lightMode={lightMode} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function SectionE({
    ticker,
    assetClass,
    isAuthenticated,
    userTier = 'FREE',
    lightMode,
    onUpgrade,
}: SectionEProps) {
    return (
        <section id="section-5" className="py-8">
            <div className="max-w-3xl">
                <div className="mb-2 flex items-center gap-3">
                    <BarChart2 className="h-5 w-5" style={{ color: lightMode ? '#111827' : '#F9FAFB' }} />
                    <h2 className="text-xl font-bold" style={{ color: lightMode ? '#0F172A' : '#F9FAFB' }}>
                        Section E - Deep Dive Modules
                    </h2>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                    Follow-up modules are generated live when opened. Quantus keeps the base report compact, then expands into
                    on-demand research only when you ask for a deeper read.
                </p>
            </div>

            <div className="mt-6 space-y-4">
                {MODULES.map((module) => (
                    <ModuleRow
                        key={module.id}
                        module={module}
                        ticker={ticker}
                        assetClass={assetClass}
                        isAuthenticated={isAuthenticated}
                        userTier={userTier}
                        lightMode={lightMode}
                        onUpgrade={onUpgrade}
                    />
                ))}
            </div>
        </section>
    );
}
