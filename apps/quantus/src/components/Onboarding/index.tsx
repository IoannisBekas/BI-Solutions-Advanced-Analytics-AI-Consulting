import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';

// ─── Tour steps ───────────────────────────────────────────────────────────────

interface TourStep {
    id: string;
    title: string;
    body: string;
    targetId?: string;   // element ID to highlight (optional)
    placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
    priority?: 'value' | 'volatile' | 'any';  // adaptive routing
}

const ALL_STEPS: TourStep[] = [
    {
        id: 'regime',
        title: 'Regime Badge — Why it comes first',
        body: 'Markets cycle through distinct regimes: uptrend, downtrend, mean-reverting, high-volatility. Quantus leads with regime because the same signal (RSI 67) means opposite things in a Strong Uptrend vs a High-Volatility regime. Regime determines which strategies to activate — and which to suppress.',
        targetId: 'regime-badge',
        placement: 'bottom',
        priority: 'any',
    },
    {
        id: 'risk',
        title: 'Risk First — For volatile assets',
        body: 'VaR, Expected Shortfall, and stress tests are shown at the top of your report. For high-volatility assets, understanding the downside (-38% in 2008, -24% in COVID) before the upside is non-negotiable. All figures are dollar-denominated — "$310 per $10,000" is more actionable than "3.1%".',
        targetId: 'risk-section',
        placement: 'top',
        priority: 'volatile',
    },
    {
        id: 'fundamentals',
        title: 'Fundamentals — Anchoring value stocks',
        body: 'For value-oriented equities, the P/E, market cap, 52-week range, and insider trend are your anchors. Quantus combines these with the Kelly criterion for position sizing — so you see both the opportunity and the appropriate stake simultaneously.',
        targetId: 'metrics-panel',
        placement: 'bottom',
        priority: 'value',
    },
    {
        id: 'ensemble',
        title: 'Model Ensemble — Why three beats one',
        body: 'Meridian v2.4 combines ARIMA (20% weight), Prophet (35%), and LSTM (45%). No single model is right in all regimes. When all three agree, confidence rises. When they diverge, the ensemble weight reflects uncertainty — which you see in the confidence breakdown sub-scores.',
        targetId: 'ensemble-section',
        placement: 'top',
        priority: 'any',
    },
    {
        id: 'confidence',
        title: 'Confidence Score — Reading the breakdown',
        body: 'The score is composited from 7 sub-signals: momentum (20%), sentiment (15%), regime alignment (15%), model ensemble agreement (15%), alternative data (15%), macro context (10%), data quality (10%). A score of 75 with a low data-quality sub-score tells you more than 75 alone.',
        targetId: 'confidence-section',
        placement: 'left',
        priority: 'any',
    },
    {
        id: 'sentiment',
        title: 'Grok/X Sentiment — Privileged firehose',
        body: 'Quantus uses the Grok API\'s privileged X (Twitter) firehose — not the public filtered feed. This means real-time, unsampled sentiment across all posts. We also apply campaign detection to down-weight coordinated manipulation. Credibility-weighted compositing means a verified fund manager\'s post weighs more than an anonymous account.',
        targetId: 'sentiment-section',
        placement: 'right',
        priority: 'any',
    },
    {
        id: 'shared',
        title: 'Shared Report — One analysis, 23 researchers',
        body: 'Generated once, shared immediately with every researcher who requests the same ticker. Your report is the same as theirs — with full transparency on generation timestamp, data freshness, and engine version. This is Meridian v2.4\'s shared intelligence model.',
        targetId: 'cache-status',
        placement: 'bottom',
        priority: 'any',
    },
];

const STORAGE_KEY = 'quantus_tour_done';

type TourWindow = Window & {
    __quantusRestartTour?: () => void;
};

// ─── Tooltip bubble ───────────────────────────────────────────────────────────

interface TooltipProps {
    step: TourStep;
    stepIndex: number;
    totalSteps: number;
    onNext: () => void;
    onPrev: () => void;
    onDismiss: () => void;
}

function TourTooltip({ step, stepIndex, totalSteps, onNext, onPrev, onDismiss }: TooltipProps) {
    return (
        <motion.div
            key={step.id}
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[100] max-w-sm rounded-2xl p-5 shadow-2xl"
            style={{
                background: '#0A0A0A',
                border: '1px solid rgba(99,102,241,0.4)',
                boxShadow: '0 24px 72px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.2)',
                // Simple center positioning — production: compute from targetId bounds
                bottom: step.placement === 'top' ? 'auto' : '5rem',
                top: step.placement === 'top' ? '6rem' : 'auto',
                left: '50%',
                transform: 'translateX(-50%)',
            }}
        >
            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mb-3">
                {Array.from({ length: totalSteps }, (_, i) => (
                    <div
                        key={i}
                        className="rounded-full transition-all"
                        style={{
                            width: i === stepIndex ? '20px' : '6px',
                            height: '6px',
                            background: i === stepIndex ? '#6366F1' : '#374151',
                        }}
                    />
                ))}
                <button onClick={onDismiss} className="ml-auto cursor-pointer opacity-50 hover:opacity-100">
                    <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
            </div>

            {/* Content */}
            <h4 className="font-bold text-sm mb-2" style={{ color: '#F9FAFB' }}>{step.title}</h4>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#9CA3AF' }}>{step.body}</p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onPrev}
                    disabled={stepIndex === 0}
                    className="flex items-center gap-1 text-xs cursor-pointer disabled:opacity-30 transition-colors hover:text-indigo-400"
                    style={{ color: '#6B7280' }}
                >
                    <ChevronLeft className="w-3.5 h-3.5" />Back
                </button>
                <span className="text-xs" style={{ color: '#6B7280' }}>{stepIndex + 1} / {totalSteps}</span>
                <button
                    onClick={onNext}
                    className="flex items-center gap-1 text-xs font-semibold cursor-pointer transition-all hover:scale-105"
                    style={{ color: '#818CF8' }}
                >
                    {stepIndex === totalSteps - 1 ? 'Finish' : 'Next'}
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </motion.div>
    );
}

// ─── Metric help tooltip ("?" icon) ───────────────────────────────────────────

interface MetricTooltipProps {
    explanation: string;
    lightMode?: boolean;
}

export function MetricTooltip({ explanation, lightMode }: MetricTooltipProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div className="relative inline-block" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className="ml-1 cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
                aria-label="Explain this metric"
            >
                <HelpCircle className="w-3 h-3 inline" style={{ color: '#9CA3AF' }} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-xl p-3 text-xs"
                        style={{
                            background: lightMode ? '#F9FAFB' : '#1A1A1A',
                            border: `1px solid ${lightMode ? '#E2E8F0' : '#374151'}`,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                            color: lightMode ? '#374151' : '#D1D5DB',
                        }}
                    >
                        {explanation}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Main tour hook + component ───────────────────────────────────────────────

interface OnboardingTourProps {
    /** Pass 'volatile' for high-beta / crypto / >30% ann vol assets, 'value' for low P/E stocks */
    assetProfile?: 'volatile' | 'value' | 'any';
}

function selectSteps(profile: 'volatile' | 'value' | 'any'): TourStep[] {
    // Filter and reorder based on asset profile
    const priorityFirst = ALL_STEPS.filter(s => s.priority === profile);
    const rest = ALL_STEPS.filter(s => s.priority !== profile && s.priority !== 'any' || s.priority === 'any');
    const combined = [...priorityFirst, ...rest.filter(s => !priorityFirst.includes(s))];
    return combined.slice(0, 5);  // max 5 callouts
}

export function OnboardingTour({ assetProfile = 'any' }: OnboardingTourProps) {
    const [dismissed, setDismissed] = useState(() => {
        try { return sessionStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
    });
    const [stepIndex, setStepIndex] = useState(0);
    const steps = selectSteps(assetProfile);

    const dismiss = useCallback(() => {
        setDismissed(true);
        try { sessionStorage.setItem(STORAGE_KEY, 'true'); } catch { /* */ }
    }, []);

    const next = useCallback(() => {
        if (stepIndex >= steps.length - 1) { dismiss(); return; }
        setStepIndex(i => i + 1);
    }, [stepIndex, steps.length, dismiss]);

    const prev = useCallback(() => {
        setStepIndex(i => Math.max(0, i - 1));
    }, []);

    // "Take the tour again" — exported so settings page can call it
    // Expose via window for simplicity; production: use context or event bus
    useEffect(() => {
        const tourWindow = window as TourWindow;
        tourWindow.__quantusRestartTour = () => {
            setDismissed(false);
            setStepIndex(0);
        };
        return () => { delete tourWindow.__quantusRestartTour; };
    }, []);

    if (dismissed) return null;

    const currentStep = steps[stepIndex];
    if (!currentStep) return null;

    return (
        <AnimatePresence>
            {/* Subtle scrim — never fully blocking */}
            <motion.div
                key="tour-scrim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99] pointer-events-none"
                style={{ background: 'rgba(0,0,0,0.15)' }}
            />
            <TourTooltip
                key={currentStep.id}
                step={currentStep}
                stepIndex={stepIndex}
                totalSteps={steps.length}
                onNext={next}
                onPrev={prev}
                onDismiss={dismiss}
            />
        </AnimatePresence>
    );
}

// ─── "Take the tour again" button (for settings page) ─────────────────────────

export function RestartTourButton() {
    return (
        <button
            onClick={() => (window as TourWindow).__quantusRestartTour?.()}
            className="flex items-center gap-2 text-sm cursor-pointer transition-colors hover:text-indigo-400"
            style={{ color: '#6B7280' }}
        >
            <HelpCircle className="w-4 h-4" />
            Take the tour again
        </button>
    );
}
