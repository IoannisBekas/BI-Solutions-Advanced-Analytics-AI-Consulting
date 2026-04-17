import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// ─── Supported currencies ─────────────────────────────────────────────────────

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD';

export interface CurrencyMeta {
    code: CurrencyCode;
    symbol: string;
    name: string;
    flag: string;
}

export const CURRENCIES: CurrencyMeta[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
    { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦' },
];

// ─── Mock exchange rates (USD base) — production: FRED or exchangerate-api ───
// Cached 24h in Redis: GET /api/v1/fx/rates → { USD: 1, EUR: 0.921, ... }

const MOCK_RATES: Record<CurrencyCode, number> = {
    USD: 1.0000,
    EUR: 0.9218,
    GBP: 0.7891,
    JPY: 149.82,
    CAD: 1.3612,
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface CurrencyContextValue {
    currency: CurrencyMeta;
    setCurrency: (code: CurrencyCode) => void;
    convert: (usdAmount: number) => number;
    format: (usdAmount: number, options?: { compact?: boolean }) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = 'quantus_currency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const savedCode = (localStorage.getItem(STORAGE_KEY) ?? 'USD') as CurrencyCode;
    const [currency, setCurrencyMeta] = useState<CurrencyMeta>(
        CURRENCIES.find(c => c.code === savedCode) ?? CURRENCIES[0],
    );

    const setCurrency = useCallback((code: CurrencyCode) => {
        const meta = CURRENCIES.find(c => c.code === code) ?? CURRENCIES[0];
        setCurrencyMeta(meta);
        localStorage.setItem(STORAGE_KEY, code);
        // Production: also POST to /api/auth/preferences to save server-side
    }, []);

    const convert = useCallback((usdAmount: number): number => {
        return usdAmount * (MOCK_RATES[currency.code] ?? 1);
    }, [currency]);

    const format = useCallback((usdAmount: number, options?: { compact?: boolean }): string => {
        const converted = convert(usdAmount);
        const sym = currency.symbol;

        if (options?.compact) {
            if (Math.abs(converted) >= 1e12) return `${sym}${(converted / 1e12).toFixed(1)}T`;
            if (Math.abs(converted) >= 1e9) return `${sym}${(converted / 1e9).toFixed(1)}B`;
            if (Math.abs(converted) >= 1e6) return `${sym}${(converted / 1e6).toFixed(1)}M`;
        }

        if (currency.code === 'JPY') {
            return `${sym}${Math.round(converted).toLocaleString()}`;
        }
        if (converted > 10_000) {
            return `${sym}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
        }
        return `${sym}${converted.toFixed(2)}`;
    }, [convert, currency]);

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, convert, format }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency(): CurrencyContextValue {
    const ctx = useContext(CurrencyContext);
    if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
    return ctx;
}
