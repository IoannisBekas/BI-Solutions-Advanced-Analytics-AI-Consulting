import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    ChevronDown, ChevronUp, TrendingUp, BarChart2, Brain,
    Target, Layers, Zap, Shield, DollarSign, GitMerge,
    TestTube, Bot, BarChart3, ThumbsUp, ThumbsDown,
    Bookmark, RefreshCw, Clock,
} from 'lucide-react';

// ─── Module definitions ───────────────────────────────────────────────────────

interface DeepDiveModule {
    id: number;
    title: string;
    icon: React.ElementType;
    color: string;
    description: string;
    estimatedSeconds: number;
    requiresTier?: 'UNLOCKED' | 'INSTITUTIONAL';
}

const MODULES: DeepDiveModule[] = [
    { id: 1, title: 'Time Series Forecasting', icon: TrendingUp, color: '#3B82F6', description: 'ARIMA + Prophet + LSTM ensemble with confidence bands', estimatedSeconds: 8 },
    { id: 2, title: 'Mean Reversion Analysis', icon: RefreshCw, color: '#10B981', description: 'Ornstein-Uhlenbeck half-life, Z-score, entry/exit levels', estimatedSeconds: 6 },
    { id: 3, title: 'Sentiment Analysis', icon: Brain, color: '#8B5CF6', description: 'Grok/X, Reddit, News — credibility-weighted composite', estimatedSeconds: 7 },
    { id: 4, title: 'Portfolio Optimization', icon: Target, color: '#F59E0B', description: 'Mean-variance + risk parity, Sharpe optimization, efficient frontier', estimatedSeconds: 10 },
    { id: 5, title: 'ML Feature Importance (SHAP)', icon: Layers, color: '#14B8A6', description: 'SHAP waterfall chart — which signals drove the recommendation', estimatedSeconds: 9 },
    { id: 6, title: 'High-Frequency Signal', icon: Zap, color: '#F97316', description: 'Intraday momentum, VWAP deviation, tick-level divergence', estimatedSeconds: 7 },
    { id: 7, title: 'Risk Management & VaR', icon: Shield, color: '#EF4444', description: 'Monte Carlo VaR, ES, tail risk, 2008/COVID/2022 stress tests', estimatedSeconds: 8 },
    { id: 8, title: 'Options Pricing & Greeks', icon: DollarSign, color: '#6366F1', description: 'Black-Scholes, Greeks surface, IV rank, implied move vs historical', estimatedSeconds: 9, requiresTier: 'UNLOCKED' },
    { id: 9, title: 'Pairs Trading', icon: GitMerge, color: '#EC4899', description: 'Cointegration test, spread Z-score, entry/exit signal', estimatedSeconds: 8, requiresTier: 'UNLOCKED' },
    { id: 10, title: 'ML Backtesting', icon: TestTube, color: '#84CC16', description: 'Walk-forward backtest, Sharpe, max DD, Calmar, signal accuracy', estimatedSeconds: 12, requiresTier: 'UNLOCKED' },
    { id: 11, title: 'Reinforcement Learning Agent', icon: Bot, color: '#F43F5E', description: 'PPO/SAC trained on 10yr data — current allocation recommendation', estimatedSeconds: 14, requiresTier: 'INSTITUTIONAL' },
    { id: 12, title: 'Factor Investing', icon: BarChart3, color: '#0EA5E9', description: 'Barra factors: value, momentum, quality, low-vol, size decomposition', estimatedSeconds: 8, requiresTier: 'UNLOCKED' },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface SectionEProps {
    ticker: string;
    reportId: string;
    userTier?: 'FREE' | 'UNLOCKED' | 'INSTITUTIONAL';
    lightMode?: boolean;
    onUpgrade?: () => void;
}

// ─── Tier gate overlay ────────────────────────────────────────────────────────

function TierGate({ tier, onUpgrade }: { tier: string; onUpgrade?: () => void }) {
    return (
        <div
            className="absolute inset-0 rounded-xl flex flex-col items-center justify-center text-center p-4 z-10"
            style={{ backdropFilter: 'blur(8px)', background: 'rgba(10,13,20,0.7)' }}
        >
            <div className="text-2xl mb-2">🔒</div>
            <div className="text-sm font-semibold mb-1" style={{ color: '#F9FAFB' }}>
                {tier === 'INSTITUTIONAL' ? 'Institutional tier required' : 'Unlock tier required'}
            </div>
            <div className="text-xs mb-3 text-gray-400">
                {tier === 'INSTITUTIONAL'
                    ? 'Available for institutional subscribers'
                    : 'Sign up to access all 12 deep dive modules'}
            </div>
            <button
                onClick={onUpgrade}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:scale-105"
                style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#818CF8' }}
            >
                Upgrade →
            </button>
        </div>
    );
}

// ─── Mock result renderer ─────────────────────────────────────────────────────

function MockModuleResult({ module, ticker }: { module: DeepDiveModule; ticker: string }) {
    const [showTechnical, setShowTechnical] = useState(false);
    const [thumbs, setThumbs] = useState<'up' | 'down' | null>(null);

    // Memoize random values so they don't change on every re-render
    const stableRandom = useMemo(() => ({
        forecast: (Math.random() * 100 + 850).toFixed(2),
        var: (Math.random() * 200 + 280).toFixed(0),
        es: (Math.random() * 100 + 380).toFixed(0),
        confidence: (Math.random() * 20 + 65).toFixed(0),
        signalStrength: (Math.random() * 1.5 + 0.5).toFixed(2),
        dataPoints: (Math.random() * 500 + 200).toFixed(0),
    }), []);

    const plainText = (() => {
        switch (module.id) {
            case 1: return `ARIMA 30d forecast: $${stableRandom.forecast} ±$28. Prophet and LSTM agree on upside with 72% directional confidence. Ensemble consensus: BULLISH biased — favour long exposure.`;
            case 2: return `90-day Z-score: −0.83. Half-life: 14.2 days. Current level is 0.83σ below mean — statistically attractive for mean-reversion entry. Exit target: mean + 0.3σ.`;
            case 3: return `Composite sentiment: +0.24 (mildly bullish). Grok/X volume 23% above 90d avg — organic signal. Reddit neutral. News: −0.15 on margin guidance. Net: cautiously positive.`;
            case 4: return `Efficient frontier allocation: ${ticker} at 8.2% weight maximises risk-adjusted return for a balanced portfolio. Sharpe improvement: +0.14 vs equal weight.`;
            case 5: return `Top SHAP drivers: RSI (23%), MACD crossover (18%), sentiment composite (15%), institutional flow (12%), macro regime (11%). Momentum factors dominate.`;
            case 6: return `Intraday VWAP deviation: +0.4%. HF momentum signal: positive. No unusual tick-level divergence detected. Signal adds 0.06 to confidence score.`;
            case 7: return `VaR (99%, 1d): $${stableRandom.var} per $10,000. Expected shortfall: $${stableRandom.es}. 2008 stress test: −38%. COVID: −24%. 2022: −29%.`;
            case 8: return `IV Rank: 42. Implied 30d move: ±6.2%. ATM IV above historical norm — options are moderately expensive. Theta decay unfavourable for outright long calls.`;
            case 9: return `Cointegration p-value vs RIVN: 0.03 (significant). Current spread Z-score: 2.1σ — approaching entry threshold. Long ${ticker} / Short RIVN suggested if Z > 2.5.`;
            case 10: return `Walk-forward backtest (2020–2024): Sharpe 1.42, max DD −18.3%, Calmar 0.78, signal accuracy 61%. Strategy outperforms buy-and-hold on a risk-adjusted basis.`;
            case 11: return `RL agent (PPO, 10yr training): current allocation recommendation 6.5% long ${ticker}. Agent entered similar regime 14× historically — avg +9.2% 30d forward.`;
            case 12: return `Factor decomposition: Quality +0.42σ, Momentum +0.38σ, Value −0.11σ, Low-Vol −0.22σ, Size +0.09σ. Quality and momentum factors support the BUY thesis.`;
            default: return 'Analysis complete.';
        }
    })();

    const technicalText = `${plainText} [Technical detail: p<0.05, n=252, bootstrap CI 95%, model v2.4-${module.id}]`;

    return (
        <div className="space-y-4">
            {/* Mock Plotly chart placeholder (dark themed) */}
            <div
                className="w-full h-36 rounded-xl flex items-center justify-center relative overflow-hidden"
                style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)' }}
            >
                {/* Simple SVG chart placeholder */}
                <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id={`cg${module.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={module.color} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={module.color} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M 0 90 Q 40 70 80 60 Q 120 50 160 55 Q 200 60 240 40 Q 280 20 320 30 Q 360 40 400 25"
                        fill={`url(#cg${module.id})`}
                    />
                    <path
                        d="M 0 90 Q 40 70 80 60 Q 120 50 160 55 Q 200 60 240 40 Q 280 20 320 30 Q 360 40 400 25"
                        fill="none"
                        stroke={module.color}
                        strokeWidth="2"
                    />
                </svg>
                <div className="absolute top-2 right-3 text-xs font-mono text-gray-500">
                    Module {module.id} · Plotly dark theme
                </div>
            </div>

            {/* Key stat cards */}
            <div className="grid grid-cols-3 gap-2">
                {[
                    { l: 'Confidence', v: `${stableRandom.confidence}%` },
                    { l: 'Signal Strength', v: ['+', '−'][module.id % 2] + stableRandom.signalStrength + 'σ' },
                    { l: 'Data Points', v: stableRandom.dataPoints },
                ].map(s => (
                    <div key={s.l} className="rounded-lg p-2 text-center text-xs"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="text-gray-500">{s.l}</div>
                        <div className="font-mono font-semibold mt-0.5" style={{ color: module.color }}>{s.v}</div>
                    </div>
                ))}
            </div>

            {/* Narrative */}
            <div className="text-sm leading-relaxed text-gray-400">
                {showTechnical ? technicalText : plainText}
            </div>

            {/* Peer benchmark */}
            <div className="text-xs p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-gray-500">Peer benchmark:</span>
                <span className="ml-2 text-gray-400">
                    {ticker} scores in top {(Math.random() * 20 + 20).toFixed(0)}th percentile for this metric vs sector peers.
                </span>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-gray-800">
                <div className="flex items-center gap-3">
                    {/* Technical toggle */}
                    <button
                        onClick={() => setShowTechnical(t => !t)}
                        className="text-xs cursor-pointer transition-colors hover:text-blue-400 text-gray-500"
                    >
                        {showTechnical ? 'Plain English' : 'Technical Detail'}
                    </button>
                    {/* Feedback */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setThumbs('up')}
                            className="p-1 rounded cursor-pointer transition-all hover:scale-110"
                            style={{ color: thumbs === 'up' ? '#10B981' : '#6B7280' }}
                        >
                            <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setThumbs('down')}
                            className="p-1 rounded cursor-pointer transition-all hover:scale-110"
                            style={{ color: thumbs === 'down' ? '#EF4444' : '#6B7280' }}
                        >
                            <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <button className="p-1 rounded cursor-pointer transition-colors hover:text-blue-400 text-gray-500">
                        <Bookmark className="w-3.5 h-3.5" />
                    </button>
                </div>
                {/* Data freshness */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Generated just now · Cached in Redis</span>
                </div>
            </div>
        </div>
    );
}

// ─── Single module card ───────────────────────────────────────────────────────

function ModuleCard({
    module, ticker, userTier, lightMode, onUpgrade,
}: {
    module: DeepDiveModule;
    ticker: string;
    userTier: 'FREE' | 'UNLOCKED' | 'INSTITUTIONAL';
    lightMode?: boolean;
    onUpgrade?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
    const [progress, setProgress] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const tierLocked =
        (module.requiresTier === 'UNLOCKED' && userTier === 'FREE') ||
        (module.requiresTier === 'INSTITUTIONAL' && userTier !== 'INSTITUTIONAL');

    const handleToggle = useCallback(() => {
        if (tierLocked) { onUpgrade?.(); return; }
        if (!open) {
            setOpen(true);
            if (state === 'idle') {
                setState('loading');
                setProgress(0);
                const step = 100 / (module.estimatedSeconds * 10);
                timerRef.current = setInterval(() => {
                    setProgress(p => {
                        if (p >= 100) {
                            clearInterval(timerRef.current!);
                            setState('done');
                            return 100;
                        }
                        return p + step;
                    });
                }, 100);
            }
        } else {
            setOpen(false);
        }
    }, [open, state, tierLocked, module.estimatedSeconds, onUpgrade]);

    useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

    const Icon = module.icon;

    return (
        <div
            className="rounded-xl overflow-hidden relative transition-all"
            style={{
                background: lightMode ? 'rgba(255,255,255,0.9)' : '#111827',
                border: `1px solid ${open ? module.color + '40' : lightMode ? '#E2E8F0' : '#1F2937'}`,
                boxShadow: open ? `0 0 24px ${module.color}12` : 'none',
            }}
        >
            {/* Tier lock overlay */}
            {tierLocked && open && (
                <TierGate
                    tier={module.requiresTier === 'INSTITUTIONAL' ? 'INSTITUTIONAL' : 'UNLOCKED'}
                    onUpgrade={onUpgrade}
                />
            )}

            {/* Header (always visible) */}
            <button
                onClick={handleToggle}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer transition-colors hover:bg-white/[0.03]"
            >
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${module.color}18`, border: `1px solid ${module.color}30` }}
                >
                    <Icon className="w-4 h-4" style={{ color: module.color }} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm" style={{ color: lightMode ? '#0F172A' : '#F9FAFB' }}>
                            {module.id}. {module.title}
                        </span>
                        {module.requiresTier && (
                            <span
                                className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                                style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.25)' }}
                            >
                                {module.requiresTier}
                            </span>
                        )}
                        {state === 'done' && <span className="text-emerald-400 text-xs">✓ Cached</span>}
                    </div>
                    <div className="text-xs mt-0.5 text-gray-500">{module.description}</div>
                </div>
                <div className="flex-shrink-0 text-gray-500">
                    {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>

            {/* Expanded content */}
            <AnimatePresence>
                {open && !tierLocked && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className="px-4 pb-4">
                            {/* Progress bar while loading */}
                            {state === 'loading' && (
                                <div className="mb-3">
                                    <div className="flex items-center justify-between text-xs mb-1.5 text-gray-500">
                                        <span>Generating deep analysis…</span>
                                        <span>~{Math.ceil(module.estimatedSeconds * (1 - progress / 100))}s</span>
                                    </div>
                                    <div className="progress-bar">
                                        <motion.div
                                            className="progress-fill"
                                            style={{ background: module.color }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.1 }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Result */}
                            {state === 'done' && (
                                <MockModuleResult module={module} ticker={ticker} />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── SectionE ────────────────────────────────────────────────────────────────

export function SectionE({ ticker, reportId, userTier = 'FREE', lightMode, onUpgrade }: SectionEProps) {
    void reportId;
    return (
        <section className="py-8">
            <div className="flex items-center gap-3 mb-2">
                <BarChart2 className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold" style={{ color: lightMode ? '#0F172A' : '#F9FAFB' }}>
                    Section E — Deep Dive Modules
                </h2>
            </div>
            <p className="text-sm mb-6 text-gray-500">
                12 on-demand quantitative modules · Click to expand · Results cached after first generation
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MODULES.map(module => (
                    <ModuleCard
                        key={module.id}
                        module={module}
                        ticker={ticker}
                        userTier={userTier}
                        lightMode={lightMode}
                        onUpgrade={onUpgrade}
                    />
                ))}
            </div>
        </section>
    );
}
