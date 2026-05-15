import { Lock, Sparkles, Check } from 'lucide-react';

interface WorkspacePaywallProps {
    requiredTier: 'UNLOCKED' | 'INSTITUTIONAL';
    currentTier?: 'FREE' | 'UNLOCKED' | 'INSTITUTIONAL';
    featureName: string;
    bullets: string[];
    onUpgrade: () => void;
    lightMode?: boolean;
}

const TIER_LABELS: Record<'UNLOCKED' | 'INSTITUTIONAL', { label: string; price: string }> = {
    UNLOCKED: { label: 'Quantus Personal', price: '$19/mo' },
    INSTITUTIONAL: { label: 'Quantus Institutional', price: '$100/mo' },
};

export function WorkspacePaywall({
    requiredTier,
    currentTier,
    featureName,
    bullets,
    onUpgrade,
    lightMode,
}: WorkspacePaywallProps) {
    const tierInfo = TIER_LABELS[requiredTier];
    const palette = {
        textPrimary: lightMode ? '#0F172A' : '#F8FAFC',
        textSecondary: lightMode ? '#475569' : '#94A3B8',
        border: lightMode ? '#E2E8F0' : '#1F2937',
        surface: lightMode ? 'rgba(255,255,255,0.98)' : 'rgba(15,23,42,0.55)',
        accent: lightMode ? '#1D4ED8' : '#93C5FD',
        accentSurface: lightMode ? 'rgba(37,99,235,0.10)' : 'rgba(96,165,250,0.14)',
        accentBorder: lightMode ? 'rgba(37,99,235,0.22)' : 'rgba(147,197,253,0.24)',
        accentShadow: lightMode ? '0 18px 36px -22px rgba(37,99,235,0.40)' : '0 18px 36px -22px rgba(96,165,250,0.55)',
    };

    return (
        <div
            className="rounded-[32px] border px-6 py-10 text-center md:px-10 md:py-14"
            style={{
                background: palette.surface,
                borderColor: palette.border,
            }}
        >
            <div
                className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                    background: palette.accentSurface,
                    color: palette.accent,
                }}
            >
                <Lock className="h-6 w-6" />
            </div>

            <div
                className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{
                    background: palette.accentSurface,
                    color: palette.accent,
                    border: `1px solid ${palette.accentBorder}`,
                }}
            >
                <Sparkles className="h-3 w-3" />
                {tierInfo.label} · {tierInfo.price}
            </div>

            <h2 className="text-2xl font-semibold tracking-tight" style={{ color: palette.textPrimary }}>
                {featureName} is part of {tierInfo.label}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: palette.textSecondary }}>
                {currentTier === 'FREE'
                    ? 'You’re on the free tier. Upgrade to unlock the institutional Quantus stack.'
                    : `Your current tier (${currentTier ?? 'FREE'}) doesn’t include this feature.`}
            </p>

            <ul className="mx-auto mt-6 grid max-w-xl gap-3 text-left">
                {bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm" style={{ color: palette.textSecondary }}>
                        <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: palette.accent }} />
                        <span>{b}</span>
                    </li>
                ))}
            </ul>

            <button
                type="button"
                onClick={onUpgrade}
                className="mt-7 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5"
                style={{
                    background: palette.accentSurface,
                    border: `1px solid ${palette.accentBorder}`,
                    color: palette.accent,
                    boxShadow: palette.accentShadow,
                }}
            >
                Upgrade to {tierInfo.label}
            </button>
        </div>
    );
}
