import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { clearQuantusSessionArtifacts, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../utils/sessionArtifacts';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Tier = 'FREE' | 'UNLOCKED' | 'INSTITUTIONAL';

export interface User {
    id: string;
    email: string;
    name: string;
    tier: Tier;
    credits: number;
    reportsThisMonth: number;
    referralToken: string;
    jurisdiction: 'US' | 'UK' | 'EU' | 'GLOBAL';
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<boolean>;
    signUp: (email: string, name: string, password: string, referralToken?: string) => Promise<boolean>;
    signInWithGoogle: (credential: string, referralToken?: string) => Promise<boolean>;
    signOut: () => void;
    deductCredit: (cost: number) => boolean;
    refreshCredits: () => Promise<void>;
    googleClientId: string | null;
    googleEnabled: boolean;
}

// ─── Monthly report limits per tier ──────────────────────────────────────────

export const TIER_LIMITS: Record<Tier, { reports: number; credits: number; watchlist: number; holdings: number; screenerQueries: number }> = {
    FREE: { reports: 3, credits: 0, watchlist: 5, holdings: 0, screenerQueries: 0 },
    UNLOCKED: { reports: 10, credits: 15, watchlist: 5, holdings: 10, screenerQueries: 3 },
    INSTITUTIONAL: { reports: -1, credits: -1, watchlist: -1, holdings: -1, screenerQueries: -1 }, // unlimited
};

// ─── Credit costs ─────────────────────────────────────────────────────────────

export const CREDIT_COSTS = {
    standardReport: 1.0,
    comparisonReport: 1.5,
    deepDiveModule: 0.5,
    portfolioAnalyzer: 2.0,
    screenerQuery: 0.5,
} as const;

export interface CreditBundle {
    id: string;
    name: string;
    credits: number;
    priceUsd: number;
    popular?: boolean;
    stripePriceId: string;
}

export const CREDIT_BUNDLES: CreditBundle[] = [
    { id: 'b_start', name: 'Starter', credits: 10, priceUsd: 49, stripePriceId: 'price_starter' },
    { id: 'b_std', name: 'Standard', credits: 25, priceUsd: 99, popular: true, stripePriceId: 'price_standard' },
    { id: 'b_pro', name: 'Pro', credits: 100, priceUsd: 299, stripePriceId: 'price_pro' },
    { id: 'b_inst', name: 'Institutional', credits: 500, priceUsd: 999, stripePriceId: 'price_inst' },
];

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthState | null>(null);

function isValidStoredUser(value: unknown): value is User {
    return typeof value === 'object'
        && value !== null
        && typeof (value as User).id === 'string'
        && typeof (value as User).email === 'string'
        && typeof (value as User).name === 'string'
        && typeof (value as User).tier === 'string'
        && typeof (value as User).credits === 'number'
        && typeof (value as User).reportsThisMonth === 'number'
        && typeof (value as User).referralToken === 'string'
        && typeof (value as User).jurisdiction === 'string';
}

function buildUserFromPayload(data: {
    id?: string;
    userId?: string;
    email?: string;
    name?: string;
    tier?: string;
    credits?: number;
    reportsThisMonth?: number;
    reports_this_month?: number;
    jurisdiction?: User['jurisdiction'];
    referralToken?: string | null;
    referral_token?: string | null;
}, fallback?: User | null): User {
    const email = data.email ?? fallback?.email ?? 'researcher@quantus.local';
    return {
        id: data.id ?? data.userId ?? fallback?.id ?? `usr_${Math.random().toString(36).slice(2, 10)}`,
        email,
        name: data.name ?? fallback?.name ?? email.split('@')[0],
        tier: (data.tier as Tier | undefined) ?? fallback?.tier ?? 'FREE',
        credits: data.credits ?? fallback?.credits ?? 0,
        reportsThisMonth: data.reportsThisMonth ?? data.reports_this_month ?? fallback?.reportsThisMonth ?? 0,
        referralToken: data.referralToken ?? data.referral_token ?? fallback?.referralToken ?? `ref_${Math.random().toString(36).slice(2, 10)}`,
        jurisdiction: data.jurisdiction ?? fallback?.jurisdiction ?? 'US',
    };
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const raw = localStorage.getItem(USER_STORAGE_KEY);
            if (!raw) return null;
            const parsed: unknown = JSON.parse(raw);
            return isValidStoredUser(parsed) ? parsed : null;
        } catch {
            return null;
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [googleClientId, setGoogleClientId] = useState<string | null>(null);
    const clearSession = useCallback(() => {
        void clearQuantusSessionArtifacts().catch(() => undefined);
        setUser(null);
    }, []);

    useEffect(() => {
        if (user) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(USER_STORAGE_KEY);
        }
    }, [user]);

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (!token) return;

        let cancelled = false;
        setIsLoading(true);

        void fetch('/quantus/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (res) => {
                if (!res.ok) {
                    const error = new Error('Unable to restore Quantus session') as Error & { status?: number };
                    error.status = res.status;
                    throw error;
                }
                const data = await res.json();
                if (!cancelled) {
                    setUser((current) => buildUserFromPayload(data, current));
                }
            })
            .catch((error: Error & { status?: number }) => {
                if (!cancelled && (error.status === 401 || error.status === 403)) {
                    clearSession();
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [clearSession]);

    useEffect(() => {
        let cancelled = false;

        void fetch('/quantus/api/auth/google/config')
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error('Unable to load Google sign-in config');
                }
                const data = await res.json() as { enabled?: boolean; clientId?: string };
                if (!cancelled) {
                    setGoogleClientId(data.enabled && typeof data.clientId === 'string' ? data.clientId : null);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setGoogleClientId(null);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const res = await fetch('/quantus/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) { setIsLoading(false); return false; }
            const data = await res.json();
            localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
            setUser(buildUserFromPayload(data.user, user));
            return true;
        } catch { return false; }
        finally { setIsLoading(false); }
    }, [user]);

    const signUp = useCallback(async (email: string, name: string, password: string, referralToken?: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const res = await fetch('/quantus/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, password, referralToken }),
            });
            if (!res.ok) { setIsLoading(false); return false; }
            const data = await res.json();
            localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
            setUser(buildUserFromPayload(data.user, user));
            return true;
        } catch { return false; }
        finally { setIsLoading(false); }
    }, [user]);

    const signInWithGoogle = useCallback(async (credential: string, referralToken?: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const res = await fetch('/quantus/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential, referralToken }),
            });
            if (!res.ok) { setIsLoading(false); return false; }
            const data = await res.json();
            localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
            setUser(buildUserFromPayload(data.user, user));
            return true;
        } catch { return false; }
        finally { setIsLoading(false); }
    }, [user]);

    const signOut = useCallback(() => {
        clearSession();
    }, [clearSession]);

    const deductCredit = useCallback((cost: number): boolean => {
        // Read latest user via ref-like pattern to avoid stale closures
        let result = false;
        setUser(u => {
            if (!u) return u;
            if (u.tier === 'INSTITUTIONAL') { result = true; return u; }
            if (u.credits < cost) return u;
            result = true;
            return { ...u, credits: Math.max(0, u.credits - cost) };
        });
        return result;
    }, []);

    const refreshCredits = useCallback(async () => {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (!token) return;
        try {
            const res = await fetch('/quantus/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setUser((current) => current ? buildUserFromPayload(data, current) : current);
            } else if (res.status === 401 || res.status === 403) {
                clearSession();
            }
        } catch { /* silent */ }
    }, [clearSession]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                signIn,
                signUp,
                signInWithGoogle,
                signOut,
                deductCredit,
                refreshCredits,
                googleClientId,
                googleEnabled: Boolean(googleClientId),
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthState {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export function useTier(): Tier {
    const { user } = useAuth();
    return user?.tier ?? 'FREE';
}

export function useCredits(): { balance: number; isLow: boolean } {
    const { user } = useAuth();
    const balance = user?.credits ?? 0;
    return { balance, isLow: balance <= 2 && user?.tier !== 'INSTITUTIONAL' };
}
