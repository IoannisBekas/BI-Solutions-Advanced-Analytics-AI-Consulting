import type { SignalType, RegimeLabel } from '../../types';

export function regimeClass(label: RegimeLabel) {
    const map: Record<string, string> = {
        'Strong Uptrend': 'regime-strong-uptrend',
        'Uptrend': 'regime-uptrend',
        'Mean-Reverting': 'regime-mean-reverting',
        'High Volatility': 'regime-high-volatility',
        'Downtrend': 'regime-downtrend',
        'Strong Downtrend': 'regime-strong-downtrend',
        'Transitional': 'regime-mean-reverting',
    };
    return map[label] ?? 'regime-mean-reverting';
}

export function signalClass(s: SignalType) {
    const map: Record<string, string> = {
        'STRONG BUY': 'badge-strong-buy',
        'BUY': 'badge-buy',
        'NEUTRAL': 'badge-neutral',
        'SELL': 'badge-sell',
        'STRONG SELL': 'badge-strong-sell',
    };
    return map[s] ?? 'badge-neutral';
}

export function themeColors(lightMode?: boolean) {
    return {
        textPrimary: lightMode ? '#0F172A' : '#F9FAFB',
        textSecondary: lightMode ? '#475569' : '#9CA3AF',
        dimBg: lightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
        borderColor: lightMode ? '#E2E8F0' : '#1A1A1A',
    };
}
