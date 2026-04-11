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

/** Sanitise metric values — replace stubs/placeholders with em dash */
export function displayMetric(value: string | undefined | null): string {
    if (!value) return '\u2014';
    const lower = value.toLowerCase().trim();
    if (['stub', 'n/a', 'unavailable', '0%', ''].includes(lower)) return '\u2014';
    return value;
}

/** Format a number as a percentage with sign */
export function formatPercent(v: number | null | undefined): string {
    if (v == null) return '\u2014';
    return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
}

/** Format a number with fixed decimals */
export function formatRatio(v: number | null | undefined, decimals = 2): string {
    if (v == null) return '\u2014';
    return v.toFixed(decimals);
}

/** Split a long narrative into paragraphs of ~sentencesPerParagraph sentences */
export function splitNarrative(text: string, sentencesPerParagraph = 3): string[] {
    if (!text) return [];
    // Try double-newline splits first
    if (text.includes('\n\n')) return text.split(/\n\n+/).filter(Boolean);
    // Split on sentence boundaries (period + space + capital letter)
    const sentences = text.split(/(?<=\.)\s+(?=[A-Z])/).filter(Boolean);
    if (sentences.length <= sentencesPerParagraph) return [text];
    const paragraphs: string[] = [];
    for (let i = 0; i < sentences.length; i += sentencesPerParagraph) {
        paragraphs.push(sentences.slice(i, i + sentencesPerParagraph).join(' '));
    }
    return paragraphs;
}
