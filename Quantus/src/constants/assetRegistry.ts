import type { AssetEntry } from '../types';

export const ASSET_REGISTRY: AssetEntry[] = [
    // ── EQUITIES ────────────────────────────────────────────────────────────
    { ticker: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', assetClass: 'EQUITY', sector: 'Technology', hasCachedReport: true, cachedReportAge: '2h ago', researcherCount: 47, currentPrice: 875.20, dayChange: 20.15, dayChangePct: 2.35 },
    { ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', assetClass: 'EQUITY', sector: 'Technology', hasCachedReport: true, cachedReportAge: '5h ago', researcherCount: 31, currentPrice: 195.89, dayChange: -0.43, dayChangePct: -0.22 },
    { ticker: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', assetClass: 'EQUITY', sector: 'Technology', hasCachedReport: true, cachedReportAge: '8h ago', researcherCount: 28, currentPrice: 415.30, dayChange: 5.20, dayChangePct: 1.27 },
    { ticker: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', assetClass: 'EQUITY', sector: 'Consumer Cyclical', hasCachedReport: true, cachedReportAge: '3h ago', researcherCount: 62, currentPrice: 312.40, dayChange: -8.60, dayChangePct: -2.68 },
    { ticker: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', assetClass: 'EQUITY', sector: 'Communication Svcs', hasCachedReport: true, cachedReportAge: '11h ago', researcherCount: 19, currentPrice: 178.50, dayChange: 2.10, dayChangePct: 1.19 },
    { ticker: 'META', name: 'Meta Platforms, Inc.', exchange: 'NASDAQ', assetClass: 'EQUITY', sector: 'Communication Svcs', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 594.10, dayChange: 7.80, dayChangePct: 1.33 },
    { ticker: 'AMZN', name: 'Amazon.com, Inc.', exchange: 'NASDAQ', assetClass: 'EQUITY', sector: 'Consumer Cyclical', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 225.40, dayChange: 3.20, dayChangePct: 1.44 },
    { ticker: 'NFLX', name: 'Netflix, Inc.', exchange: 'NASDAQ', assetClass: 'EQUITY', sector: 'Communication Svcs', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 1008.50, dayChange: 12.30, dayChangePct: 1.24 },
    { ticker: 'AMD', name: 'Advanced Micro Devices', exchange: 'NASDAQ', assetClass: 'EQUITY', sector: 'Technology', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 118.70, dayChange: -1.50, dayChangePct: -1.25 },
    { ticker: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ', assetClass: 'EQUITY', sector: 'Technology', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 22.10, dayChange: -0.40, dayChangePct: -1.78 },
    { ticker: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', assetClass: 'EQUITY', sector: 'Financial Services', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 285.10, dayChange: 1.80, dayChangePct: 0.64 },
    { ticker: 'BAC', name: 'Bank of America Corp.', exchange: 'NYSE', assetClass: 'EQUITY', sector: 'Financial Services', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 44.20, dayChange: 0.30, dayChangePct: 0.68 },
    { ticker: 'GS', name: 'Goldman Sachs Group', exchange: 'NYSE', assetClass: 'EQUITY', sector: 'Financial Services', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 620.80, dayChange: 4.50, dayChangePct: 0.73 },
    { ticker: 'PFE', name: 'Pfizer Inc.', exchange: 'NYSE', assetClass: 'EQUITY', sector: 'Healthcare', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 27.30, dayChange: -0.20, dayChangePct: -0.73 },
    { ticker: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', assetClass: 'EQUITY', sector: 'Healthcare', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 158.40, dayChange: 1.20, dayChangePct: 0.77 },
    { ticker: 'UNH', name: 'UnitedHealth Group', exchange: 'NYSE', assetClass: 'EQUITY', sector: 'Healthcare', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 514.30, dayChange: 3.60, dayChangePct: 0.71 },
    { ticker: 'V', name: 'Visa Inc.', exchange: 'NYSE', assetClass: 'EQUITY', sector: 'Financial Services', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 334.50, dayChange: 2.10, dayChangePct: 0.63 },
    { ticker: 'MA', name: 'Mastercard Inc.', exchange: 'NYSE', assetClass: 'EQUITY', sector: 'Financial Services', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 545.80, dayChange: 3.40, dayChangePct: 0.63 },
    { ticker: 'AVGO', name: 'Broadcom Inc.', exchange: 'NASDAQ', assetClass: 'EQUITY', sector: 'Technology', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 241.30, dayChange: 4.10, dayChangePct: 1.73 },
    { ticker: 'TSM', name: 'Taiwan Semiconductor', exchange: 'NYSE', assetClass: 'EQUITY', sector: 'Technology', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 184.50, dayChange: -1.20, dayChangePct: -0.65 },
    { ticker: 'ORCL', name: 'Oracle Corporation', exchange: 'NYSE', assetClass: 'EQUITY', sector: 'Technology', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 188.70, dayChange: 2.80, dayChangePct: 1.51 },
    { ticker: 'CRM', name: 'Salesforce, Inc.', exchange: 'NYSE', assetClass: 'EQUITY', sector: 'Technology', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 327.40, dayChange: 1.60, dayChangePct: 0.49 },

    // ── CRYPTO ─────────────────────────────────────────────────────────────
    { ticker: 'BTC-USD', name: 'Bitcoin', exchange: 'Crypto', assetClass: 'CRYPTO', sector: 'Cryptocurrency', hasCachedReport: true, cachedReportAge: '1h ago', researcherCount: 89, currentPrice: 96800, dayChange: 1800, dayChangePct: 1.89 },
    { ticker: 'ETH-USD', name: 'Ethereum', exchange: 'Crypto', assetClass: 'CRYPTO', sector: 'Cryptocurrency', hasCachedReport: true, cachedReportAge: '4h ago', researcherCount: 54, currentPrice: 3240, dayChange: -45, dayChangePct: -1.37 },
    { ticker: 'SOL-USD', name: 'Solana', exchange: 'Crypto', assetClass: 'CRYPTO', sector: 'Cryptocurrency', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 182.4, dayChange: 5.2, dayChangePct: 2.93 },
    { ticker: 'BNB-USD', name: 'BNB', exchange: 'Crypto', assetClass: 'CRYPTO', sector: 'Cryptocurrency', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 618.3, dayChange: -3.1, dayChangePct: -0.5 },
    { ticker: 'XRP-USD', name: 'XRP', exchange: 'Crypto', assetClass: 'CRYPTO', sector: 'Cryptocurrency', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 2.48, dayChange: 0.04, dayChangePct: 1.64 },
    { ticker: 'ADA-USD', name: 'Cardano', exchange: 'Crypto', assetClass: 'CRYPTO', sector: 'Cryptocurrency', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 0.89, dayChange: 0.02, dayChangePct: 2.30 },
    { ticker: 'DOGE-USD', name: 'Dogecoin', exchange: 'Crypto', assetClass: 'CRYPTO', sector: 'Cryptocurrency', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 0.34, dayChange: 0.01, dayChangePct: 3.03 },
    { ticker: 'AVAX-USD', name: 'Avalanche', exchange: 'Crypto', assetClass: 'CRYPTO', sector: 'Cryptocurrency', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 41.2, dayChange: -0.8, dayChangePct: -1.91 },

    // ── COMMODITIES ─────────────────────────────────────────────────────────
    { ticker: 'GC=F', name: 'Gold Futures', exchange: 'COMEX', assetClass: 'COMMODITY', sector: 'Precious Metals', hasCachedReport: true, cachedReportAge: '6h ago', researcherCount: 22, currentPrice: 2948.40, dayChange: 12.60, dayChangePct: 0.43 },
    { ticker: 'CL=F', name: 'Crude Oil WTI', exchange: 'NYMEX', assetClass: 'COMMODITY', sector: 'Energy', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 71.40, dayChange: -0.80, dayChangePct: -1.11 },
    { ticker: 'SI=F', name: 'Silver Futures', exchange: 'COMEX', assetClass: 'COMMODITY', sector: 'Precious Metals', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 31.80, dayChange: 0.40, dayChangePct: 1.27 },
    { ticker: 'NG=F', name: 'Natural Gas Futures', exchange: 'NYMEX', assetClass: 'COMMODITY', sector: 'Energy', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 3.42, dayChange: 0.08, dayChangePct: 2.40 },
    { ticker: 'HG=F', name: 'Copper Futures', exchange: 'COMEX', assetClass: 'COMMODITY', sector: 'Base Metals', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 4.68, dayChange: -0.03, dayChangePct: -0.64 },

    // ── ETFs ─────────────────────────────────────────────────────────────────
    { ticker: 'SPY', name: 'SPDR S&P 500 ETF', exchange: 'NYSE Arca', assetClass: 'ETF', sector: 'Blend', hasCachedReport: true, cachedReportAge: '3h ago', researcherCount: 38, currentPrice: 598.10, dayChange: 4.20, dayChangePct: 0.71 },
    { ticker: 'QQQ', name: 'Invesco QQQ Trust', exchange: 'NASDAQ', assetClass: 'ETF', sector: 'Technology', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 521.30, dayChange: 7.10, dayChangePct: 1.38 },
    { ticker: 'IWM', name: 'iShares Russell 2000', exchange: 'NYSE Arca', assetClass: 'ETF', sector: 'Small Cap', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 215.80, dayChange: -1.30, dayChangePct: -0.60 },
    { ticker: 'GLD', name: 'SPDR Gold Shares', exchange: 'NYSE Arca', assetClass: 'ETF', sector: 'Precious Metals', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 269.40, dayChange: 1.10, dayChangePct: 0.41 },
    { ticker: 'ARKK', name: 'ARK Innovation ETF', exchange: 'NYSE Arca', assetClass: 'ETF', sector: 'Innovation', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 58.20, dayChange: -1.40, dayChangePct: -2.35 },
    { ticker: 'VTI', name: 'Vanguard Total Mkt ETF', exchange: 'NYSE Arca', assetClass: 'ETF', sector: 'Total Mkt', hasCachedReport: false, cachedReportAge: undefined, researcherCount: 0, currentPrice: 264.80, dayChange: 1.80, dayChangePct: 0.68 },
];

// ── Alias Map ─────────────────────────────────────────────────────────────────
export const ALIAS_MAP: Record<string, string> = {
    'bitcoin': 'BTC-USD',
    'btc': 'BTC-USD',
    'ethereum': 'ETH-USD',
    'eth': 'ETH-USD',
    'solana': 'SOL-USD',
    'sol': 'SOL-USD',
    'gold': 'GC=F',
    'xau': 'GC=F',
    'silver': 'SI=F',
    'oil': 'CL=F',
    'crude oil': 'CL=F',
    'crude': 'CL=F',
    'wti': 'CL=F',
    'natural gas': 'NG=F',
    'natgas': 'NG=F',
    'copper': 'HG=F',
    'tesla': 'TSLA',
    'apple': 'AAPL',
    'nvidia': 'NVDA',
    'microsoft': 'MSFT',
    'google': 'GOOGL',
    'alphabet': 'GOOGL',
    'amazon': 'AMZN',
    'meta': 'META',
    'facebook': 'META',
    's&p 500': 'SPY',
    'spx': 'SPY',
    's&p': 'SPY',
    'nasdaq': 'QQQ',
    'nasdaq 100': 'QQQ',
    'ndx': 'QQQ',
    'russell': 'IWM',
    'russell 2000': 'IWM',
    'dow jones': 'DIA',
    'dogecoin': 'DOGE-USD',
    'doge': 'DOGE-USD',
    'cardano': 'ADA-USD',
    'avalanche': 'AVAX-USD',
    'ripple': 'XRP-USD',
    'xrp': 'XRP-USD',
};

// ── Search Function ───────────────────────────────────────────────────────────
export function searchAssets(query: string, maxResults = 6): AssetEntry[] {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();

    // 1. Alias lookup
    const aliasedTicker = ALIAS_MAP[q];
    if (aliasedTicker) {
        const found = ASSET_REGISTRY.find(a => a.ticker === aliasedTicker);
        if (found) {
            const rest = ASSET_REGISTRY.filter(a => a.ticker !== aliasedTicker && (
                a.ticker.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
            )).slice(0, maxResults - 1);
            return [found, ...rest];
        }
    }

    // 2. Exact ticker match
    const exactTicker = ASSET_REGISTRY.find(a => a.ticker.toLowerCase() === q);

    // 3. Starts-with ticker
    const startsWithTicker = ASSET_REGISTRY.filter(a =>
        a.ticker.toLowerCase().startsWith(q) && a.ticker.toLowerCase() !== q
    );

    // 4. Name includes
    const nameMatch = ASSET_REGISTRY.filter(a =>
        a.name.toLowerCase().includes(q) &&
        !a.ticker.toLowerCase().startsWith(q) &&
        a.ticker.toLowerCase() !== q
    );

    const results: AssetEntry[] = [
        ...(exactTicker ? [exactTicker] : []),
        ...startsWithTicker,
        ...nameMatch,
    ];

    // Dedupe
    const seen = new Set<string>();
    return results.filter(a => {
        if (seen.has(a.ticker)) return false;
        seen.add(a.ticker);
        return true;
    }).slice(0, maxResults);
}

// ── Resolve to single asset ───────────────────────────────────────────────────
export function resolveAsset(query: string): AssetEntry | null {
    const results = searchAssets(query, 1);
    return results[0] ?? null;
}

// ── Discovery Feed ─────────────────────────────────────────────────────────────
export const DISCOVERY_FEED = ASSET_REGISTRY.filter(a => a.hasCachedReport);
