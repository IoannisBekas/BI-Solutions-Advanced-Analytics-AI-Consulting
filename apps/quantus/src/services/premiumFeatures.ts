/**
 * services/premiumFeatures.ts
 * Client-side fetch wrappers for the Quantus premium feature stack:
 *   - Sector Packs
 *   - Insider Trades
 *   - 13F Whale Tracking
 *   - Earnings Calendar + AI Preview/Recap
 *   - Billing catalog + tier
 *
 * Server returns 402 with shape:
 *     { code: "SUBSCRIPTION_REQUIRED", required_tier, current_tier, message }
 * Pages can catch `error.status === 402` and render the paywall UX.
 */

export interface PremiumError extends Error {
    status: number;
    code?: string;
    requiredTier?: 'UNLOCKED' | 'INSTITUTIONAL';
    currentTier?: 'FREE' | 'UNLOCKED' | 'INSTITUTIONAL';
}

async function readJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const response = await fetch(input, { credentials: 'include', ...init });

    if (!response.ok) {
        const errorText = await response.text();
        let message = errorText || `Request failed with ${response.status}`;
        let code: string | undefined;
        let requiredTier: PremiumError['requiredTier'];
        let currentTier: PremiumError['currentTier'];

        if (errorText) {
            try {
                const parsed = JSON.parse(errorText) as {
                    message?: string;
                    error?: string;
                    detail?:
                        | string
                        | {
                              message?: string;
                              code?: string;
                              required_tier?: string;
                              current_tier?: string;
                          };
                    code?: string;
                };
                if (typeof parsed.detail === 'object' && parsed.detail !== null) {
                    message = parsed.detail.message ?? message;
                    code = parsed.detail.code;
                    requiredTier = parsed.detail.required_tier as PremiumError['requiredTier'];
                    currentTier = parsed.detail.current_tier as PremiumError['currentTier'];
                } else if (typeof parsed.detail === 'string' && parsed.detail) {
                    message = parsed.detail;
                } else if (typeof parsed.message === 'string') {
                    message = parsed.message;
                } else if (typeof parsed.error === 'string') {
                    message = parsed.error;
                }
                code = code ?? parsed.code;
            } catch {
                /* keep raw text */
            }
        }

        const err = new Error(message) as PremiumError;
        err.status = response.status;
        err.code = code;
        err.requiredTier = requiredTier;
        err.currentTier = currentTier;
        throw err;
    }

    return response.json() as Promise<T>;
}

// ─── Sector Packs ────────────────────────────────────────────────────────────

export interface SectorCatalogEntry {
    sector: string;
    ticker_count: number;
    top_preview: Array<{
        ticker: string;
        company_name: string;
        overall_signal: string;
        confidence_score: number;
    }>;
    subscribed: boolean;
}

export interface SectorCatalog {
    sectors: SectorCatalogEntry[];
    user_tier: 'FREE' | 'UNLOCKED' | 'INSTITUTIONAL';
    required_tier_for_digest: 'INSTITUTIONAL';
}

export function fetchSectorCatalog(signal?: AbortSignal) {
    return readJson<SectorCatalog>('/quantus/api/v1/sector-packs/catalog', { signal });
}

export function fetchSectorSubscriptions(signal?: AbortSignal) {
    return readJson<{ user_id: string; tier: string; sectors: string[] }>(
        '/quantus/api/v1/sector-packs/subscriptions',
        { signal },
    );
}

export function setSectorSubscriptions(sectors: string[], signal?: AbortSignal) {
    return readJson<{ sectors: string[] }>('/quantus/api/v1/sector-packs/subscriptions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sectors }),
        signal,
    });
}

export interface SectorDigestEntry {
    ticker: string;
    company_name: string;
    overall_signal: string;
    confidence_score: number;
    regime_label: string;
    regime_implication: string;
    early_insight: string;
    key_metrics: Array<{ label: string; value: string; note?: string }>;
    report_id: string;
    asset_class: string;
    report_url: string;
}

export function fetchSectorDigest(sector: string, signal?: AbortSignal) {
    return readJson<{
        sector: string;
        generated_at: string;
        ticker_count: number;
        top_count: number;
        results: SectorDigestEntry[];
    }>(`/quantus/api/v1/sector-packs/${encodeURIComponent(sector)}/digest`, { signal });
}

// ─── Insider Trades ──────────────────────────────────────────────────────────

export interface InsiderCard {
    ticker: string;
    company: string;
    name: string;
    title: string;
    txn_type: string;
    txn_date: string;
    filing_date: string;
    shares: number;
    price: number | null;
    value_usd: number | null;
    post_holdings: number;
    source_url: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
}

export function fetchInsiderFeed(limit = 50, signal?: AbortSignal) {
    return readJson<{ count: number; results: InsiderCard[]; generated_at: string }>(
        `/quantus/api/v1/insider/feed?limit=${limit}`,
        { signal },
    );
}

export function fetchInsiderClusters(days = 30, signal?: AbortSignal) {
    return readJson<{
        window_days: number;
        count: number;
        results: Array<{
            ticker: string;
            company: string;
            insider_count: number;
            insider_names: string[];
            total_value_usd: number;
            first_date: string;
            last_date: string;
        }>;
    }>(`/quantus/api/v1/insider/cluster?days=${days}`, { signal });
}

// ─── 13F Whales ──────────────────────────────────────────────────────────────

export interface WhaleFund {
    cik: string;
    name: string;
    manager: string;
    style: string;
    aum_usd_b: number;
}

export function fetchWhaleFunds(signal?: AbortSignal) {
    return readJson<{ count: number; funds: WhaleFund[] }>(
        '/quantus/api/v1/whales/funds',
        { signal },
    );
}

export function fetchWhaleHoldings(cik: string, signal?: AbortSignal) {
    return readJson<{
        cik: string;
        fund: WhaleFund | null;
        filing_date: string | null;
        count: number;
        total_aum_usd: number;
        holdings: Array<{
            ticker: string;
            company: string;
            value_usd: number;
            shares: number;
            weight_pct: number;
        }>;
        note?: string;
    }>(`/quantus/api/v1/whales/holdings/${encodeURIComponent(cik)}`, { signal });
}

export function fetchNewWhalePositions(limit = 40, signal?: AbortSignal) {
    return readJson<{
        count: number;
        results: Array<{
            whale: string;
            manager: string;
            style: string;
            ticker: string;
            company: string;
            value_usd: number;
            shares: number;
            filing_date: string;
        }>;
    }>(`/quantus/api/v1/whales/new-positions?limit=${limit}`, { signal });
}

// ─── Earnings ────────────────────────────────────────────────────────────────

export interface EarningsEntry {
    ticker: string;
    date: string;
    time: string;
    eps_estimate: number | null;
    eps_actual: number | null;
    revenue_estimate: number | null;
    revenue_actual: number | null;
    fiscal_period: string;
    has_coverage: boolean;
    overall_signal?: string;
    confidence_score?: number;
    regime_label?: string;
    sector?: string;
}

export function fetchEarningsCalendar(days = 7, signal?: AbortSignal) {
    return readJson<{
        from: string;
        to: string;
        days: number;
        count: number;
        buckets: Array<{ date: string; entries: EarningsEntry[] }>;
    }>(`/quantus/api/v1/earnings/calendar?days=${days}`, { signal });
}

export function fetchEarningsPreview(ticker: string, signal?: AbortSignal) {
    return readJson<{
        ticker: string;
        mode: 'preview';
        narrative: string;
        has_coverage: boolean;
        generated_at: string;
    }>(`/quantus/api/v1/earnings/preview/${encodeURIComponent(ticker)}`, { signal });
}

// ─── Billing (Revolut Merchant) ──────────────────────────────────────────────

export interface BillingPlan {
    tier: 'FREE' | 'UNLOCKED' | 'INSTITUTIONAL';
    label: string;
    tagline: string;
    price_minor: number; // pence / cents
    price_major: number; // currency major units
    currency: string;    // GBP | EUR | USD
    configured: boolean;
}

export interface BillingSubscription {
    user_id: string;
    tier: 'UNLOCKED' | 'INSTITUTIONAL';
    status: 'active' | 'past_due' | 'cancelled' | 'incomplete';
    currency: string;
    amount_minor: number;
    current_period_start?: string;
    current_period_end?: string;
    next_renewal_at?: string;
    latest_order_id?: string;
    cancelled_at?: number;
}

export function fetchBillingCatalog(signal?: AbortSignal) {
    return readJson<{ plans: BillingPlan[] }>('/quantus/api/v1/billing/catalog', { signal });
}

export function fetchMyBilling(signal?: AbortSignal) {
    return readJson<{
        user_id: string;
        tier: 'FREE' | 'UNLOCKED' | 'INSTITUTIONAL';
        subscription: BillingSubscription | null;
    }>('/quantus/api/v1/billing/me', { signal });
}

export function startCheckout(payload: { tier: 'UNLOCKED' | 'INSTITUTIONAL'; email?: string; name?: string }) {
    return readJson<{
        order_id: string;
        checkout_url: string;
        public_id: string;
        tier: 'UNLOCKED' | 'INSTITUTIONAL';
        amount_minor: number;
        currency: string;
    }>('/quantus/api/v1/billing/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
    });
}

export function cancelMySubscription() {
    return readJson<{ ok: boolean; subscription: BillingSubscription }>('/quantus/api/v1/billing/cancel', {
        method: 'POST',
    });
}
