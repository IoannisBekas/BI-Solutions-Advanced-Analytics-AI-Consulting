import { useEffect, useMemo, useState } from 'react';
import { Check, Crown, Sparkles, Zap, AlertCircle, ShieldCheck } from 'lucide-react';
import {
    fetchBillingCatalog,
    fetchMyBilling,
    startCheckout,
    cancelMySubscription,
    type BillingPlan,
    type BillingSubscription,
    type PremiumError,
} from '../services/premiumFeatures';

interface Props {
    lightMode?: boolean;
    currentTier?: 'FREE' | 'UNLOCKED' | 'INSTITUTIONAL';
    onRequireSignin?: () => void;
}

const FEATURES: Record<'FREE' | 'UNLOCKED' | 'INSTITUTIONAL', string[]> = {
    FREE: [
        '1 free workspace report per day',
        'Skim Summary cards on every report',
        'Macro calendar',
        'Methodology + accuracy overview',
    ],
    UNLOCKED: [
        'Unlimited workspace reports',
        'Persistent watchlist + email alerts',
        'Full archive history',
        'Earnings calendar with confidence overlay',
        'Per-ticker insider trade history',
        'Per-ticker institutional holders',
    ],
    INSTITUTIONAL: [
        'Sector Packs · Top-20 teardowns per sector',
        'Insider trades cross-ticker feed + cluster alerts',
        '13F whale tracking · 12 curated managers + new positions',
        'AI earnings previews + recaps on demand',
        'Weekly emailed digest PDFs',
        'Priority data refresh + Slack/Discord alerts (rolling out)',
    ],
};

function pal(lightMode?: boolean) {
    return {
        textPrimary: lightMode ? '#0F172A' : '#F0F6FF',
        textSecondary: lightMode ? '#475569' : '#9CA3AF',
        textMuted: lightMode ? '#94A3B8' : '#6B7280',
        border: lightMode ? '#E2E8F0' : '#1A1A1A',
        surface: lightMode ? 'rgba(255,255,255,0.98)' : 'rgba(17,24,39,0.96)',
        dimBg: lightMode ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.04)',
    };
}

function tierIcon(tier: string) {
    if (tier === 'INSTITUTIONAL') return <Crown className="w-5 h-5" />;
    if (tier === 'UNLOCKED') return <Zap className="w-5 h-5" />;
    return <Sparkles className="w-5 h-5" />;
}

function formatMoney(plan: BillingPlan): string {
    if (plan.price_minor === 0) return 'Free';
    const symbol = plan.currency === 'GBP' ? '£' : plan.currency === 'USD' ? '$' : '€';
    return `${symbol}${plan.price_major.toFixed(plan.price_major % 1 === 0 ? 0 : 2)}`;
}

function formatDate(iso?: string | null): string {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return iso;
    }
}

export function UpgradePage({ lightMode, currentTier = 'FREE', onRequireSignin }: Props) {
    const palette = pal(lightMode);
    const [plans, setPlans] = useState<BillingPlan[] | null>(null);
    const [subscription, setSubscription] = useState<BillingSubscription | null>(null);
    const [catalogError, setCatalogError] = useState<string | null>(null);

    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelNotice, setCancelNotice] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            try {
                const [catalog, me] = await Promise.all([
                    fetchBillingCatalog(controller.signal),
                    fetchMyBilling(controller.signal).catch(() => null),
                ]);
                setPlans(catalog.plans);
                setSubscription(me?.subscription ?? null);
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') return;
                setCatalogError(err instanceof Error ? err.message : 'Catalog unavailable');
            }
        })();
        return () => controller.abort();
    }, []);

    const fallbackPlans = useMemo<BillingPlan[]>(
        () => [
            { tier: 'FREE', label: 'Quantus Free', tagline: '', price_minor: 0, price_major: 0, currency: 'EUR', configured: true },
            { tier: 'UNLOCKED', label: 'Quantus Personal', tagline: '', price_minor: 1900, price_major: 19, currency: 'EUR', configured: false },
            { tier: 'INSTITUTIONAL', label: 'Quantus Institutional', tagline: '', price_minor: 10000, price_major: 100, currency: 'EUR', configured: false },
        ],
        [],
    );

    const handleCheckout = async (plan: BillingPlan) => {
        if (plan.tier === 'FREE') return;
        setCheckoutError(null);
        setCheckoutLoading(plan.tier);
        try {
            const session = await startCheckout({ tier: plan.tier });
            if (session.checkout_url) {
                window.location.href = session.checkout_url;
                return;
            }
            setCheckoutError('Checkout URL was not returned by the billing service.');
        } catch (err) {
            const status = (err as PremiumError | null)?.status;
            if (status === 401) {
                onRequireSignin?.();
            } else {
                setCheckoutError(err instanceof Error ? err.message : 'Checkout failed.');
            }
        } finally {
            setCheckoutLoading(null);
        }
    };

    const handleCancel = async () => {
        setCancelLoading(true);
        setCancelNotice(null);
        try {
            const data = await cancelMySubscription();
            setSubscription(data.subscription);
            setCancelNotice('Subscription cancelled. You will keep access until the end of the period.');
        } catch (err) {
            setCancelNotice(err instanceof Error ? err.message : 'Cancellation failed.');
        } finally {
            setCancelLoading(false);
        }
    };

    const renderedPlans = plans ?? fallbackPlans;

    return (
        <section className="bis-page-shell relative px-6 py-8 md:px-10 md:py-10">
            <div className="relative z-10 max-w-6xl mx-auto space-y-8">
                <div className="text-center">
                    <span className="bis-eyebrow">
                        <Crown className="w-3.5 h-3.5" />
                        Pricing
                    </span>
                    <h1 className="mt-3 text-3xl md:text-4xl font-heading font-semibold tracking-tight" style={{ color: palette.textPrimary }}>
                        Choose your Quantus tier
                    </h1>
                    <p className="mt-3 text-sm md:text-base leading-relaxed mx-auto max-w-2xl" style={{ color: palette.textSecondary }}>
                        Three tiers. Cancel anytime. Payments handled by Revolut Merchant — money lands directly in our Revolut
                        Business account, no third-party processor.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: palette.textMuted }}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Hosted checkout · 3-D Secure · PCI-DSS Level 1
                    </div>
                </div>

                {catalogError && (
                    <div className="text-center text-sm" style={{ color: palette.textMuted }}>
                        {catalogError}
                    </div>
                )}

                {/* Active subscription panel */}
                {subscription && subscription.status !== 'cancelled' && (
                    <div
                        className="rounded-2xl border px-5 py-4 flex items-start justify-between gap-4 flex-wrap"
                        style={{ background: palette.dimBg, borderColor: palette.border }}
                    >
                        <div>
                            <div className="text-xs uppercase tracking-[0.18em]" style={{ color: palette.textMuted }}>
                                Active subscription
                            </div>
                            <div className="font-heading font-semibold mt-1" style={{ color: palette.textPrimary }}>
                                {subscription.tier} · {subscription.currency} {(subscription.amount_minor / 100).toFixed(2)}/mo
                            </div>
                            <div className="text-xs mt-1" style={{ color: palette.textSecondary }}>
                                Status: <span className="font-medium">{subscription.status.toUpperCase()}</span>
                                {' · '}
                                Renews {formatDate(subscription.next_renewal_at)}
                            </div>
                            {cancelNotice && (
                                <div className="mt-2 text-xs" style={{ color: palette.textMuted }}>
                                    {cancelNotice}
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={cancelLoading}
                            className="rounded-full px-4 py-2 text-xs font-semibold transition-all disabled:opacity-50"
                            style={{
                                background: palette.surface,
                                color: palette.textPrimary,
                                border: `1px solid ${palette.border}`,
                            }}
                        >
                            {cancelLoading ? 'Cancelling…' : 'Cancel subscription'}
                        </button>
                    </div>
                )}

                {checkoutError && (
                    <div
                        className="rounded-xl border px-4 py-3 text-sm flex items-start gap-3"
                        style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.24)', color: '#DC2626' }}
                    >
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{checkoutError}</span>
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-3">
                    {renderedPlans.map((plan) => {
                        const isCurrent = plan.tier === currentTier;
                        const isInstitutional = plan.tier === 'INSTITUTIONAL';
                        const isFree = plan.tier === 'FREE';
                        const loading = checkoutLoading === plan.tier;
                        return (
                            <div
                                key={plan.tier}
                                className="rounded-3xl border px-6 py-7 flex flex-col"
                                style={{
                                    background: palette.surface,
                                    borderColor: isInstitutional ? '#6366F1' : palette.border,
                                    boxShadow: isInstitutional ? '0 24px 48px -32px rgba(99,102,241,0.45)' : 'none',
                                }}
                            >
                                <div className="flex items-center gap-2 mb-3" style={{ color: palette.textPrimary }}>
                                    {tierIcon(plan.tier)}
                                    <h2 className="font-heading font-semibold">{plan.label}</h2>
                                </div>
                                <div className="font-heading font-bold text-3xl tracking-tight" style={{ color: palette.textPrimary }}>
                                    {formatMoney(plan)}
                                    {!isFree && (
                                        <span className="text-sm font-normal" style={{ color: palette.textMuted }}>
                                            {' '}
                                            / month
                                        </span>
                                    )}
                                </div>
                                <p className="mt-2 text-sm leading-relaxed" style={{ color: palette.textSecondary }}>
                                    {plan.tagline ||
                                        (plan.tier === 'FREE'
                                            ? '1 free report / day, skim summaries only.'
                                            : plan.tier === 'UNLOCKED'
                                            ? 'Full reports, watchlist alerts, archive history.'
                                            : 'Sector packs, insider feed, 13F, earnings AI.')}
                                </p>

                                <ul className="mt-5 space-y-2.5 flex-1">
                                    {FEATURES[plan.tier].map((f) => (
                                        <li key={f} className="flex items-start gap-2 text-sm" style={{ color: palette.textSecondary }}>
                                            <Check className="mt-0.5 w-4 h-4 shrink-0 text-emerald-500" />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    disabled={isCurrent || isFree || loading || !plan.configured}
                                    onClick={() => handleCheckout(plan)}
                                    className="mt-6 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 hover:-translate-y-0.5"
                                    style={{
                                        background: isInstitutional ? '#6366F1' : palette.surface,
                                        color: isInstitutional ? '#FFFFFF' : palette.textPrimary,
                                        border: `1px solid ${isInstitutional ? 'transparent' : palette.border}`,
                                    }}
                                >
                                    {loading
                                        ? 'Opening Revolut…'
                                        : isCurrent
                                        ? 'Current plan'
                                        : isFree
                                        ? 'Free forever'
                                        : `Subscribe · ${formatMoney(plan)}/mo`}
                                </button>

                                {!plan.configured && !isFree && (
                                    <p className="mt-3 text-[11px] text-center" style={{ color: palette.textMuted }}>
                                        Revolut price not configured yet · contact sales
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="text-center text-xs" style={{ color: palette.textMuted }}>
                    Payments processed by Revolut Merchant · GBP / EUR / USD · cancel anytime.
                </div>
            </div>
        </section>
    );
}
