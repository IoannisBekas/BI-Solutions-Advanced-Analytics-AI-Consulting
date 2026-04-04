import { describe, it, expect } from 'vitest';
import { regimeClass, signalClass, themeColors } from './helpers';

const asUnknownRegime = (value: string) => value as Parameters<typeof regimeClass>[0];
const asUnknownSignal = (value: string) => value as Parameters<typeof signalClass>[0];

describe('regimeClass', () => {
  it('returns correct class for known regimes', () => {
    expect(regimeClass('Strong Uptrend')).toBe('regime-strong-uptrend');
    expect(regimeClass('Uptrend')).toBe('regime-uptrend');
    expect(regimeClass('Mean-Reverting')).toBe('regime-mean-reverting');
    expect(regimeClass('High Volatility')).toBe('regime-high-volatility');
    expect(regimeClass('Downtrend')).toBe('regime-downtrend');
  });

  it('falls back to mean-reverting for unknown labels', () => {
    expect(regimeClass(asUnknownRegime('Unknown'))).toBe('regime-mean-reverting');
  });
});

describe('signalClass', () => {
  it('returns correct badge class', () => {
    expect(signalClass('STRONG BUY')).toBe('badge-strong-buy');
    expect(signalClass('BUY')).toBe('badge-buy');
    expect(signalClass('NEUTRAL')).toBe('badge-neutral');
    expect(signalClass('SELL')).toBe('badge-sell');
    expect(signalClass('STRONG SELL')).toBe('badge-strong-sell');
  });

  it('falls back to neutral for unknown signals', () => {
    expect(signalClass(asUnknownSignal('UNKNOWN'))).toBe('badge-neutral');
  });
});

describe('themeColors', () => {
  it('returns light mode colors', () => {
    const colors = themeColors(true);
    expect(colors.textPrimary).toBe('#0F172A');
    expect(colors.borderColor).toBe('#E2E8F0');
  });

  it('returns dark mode colors', () => {
    const colors = themeColors(false);
    expect(colors.textPrimary).toBe('#F9FAFB');
    expect(colors.borderColor).toBe('#1A1A1A');
  });
});
