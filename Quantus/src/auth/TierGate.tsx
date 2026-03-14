import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Lock, Zap } from 'lucide-react';
import { useTier, type Tier } from '../auth/AuthContext';

// ─── Paywall overlay — frosted glass with upgrade CTA ────────────────────────

interface PaywallOverlayProps {
    requiredTier: Tier;
    sectionLabel: string;    // "Section B", "Section E", etc.
    onUpgrade?: () => void;
    lightMode?: boolean;
}

export function PaywallOverlay({ requiredTier, sectionLabel, onUpgrade, lightMode }: PaywallOverlayProps) {
    return (
        <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center text-center p-8 z-20"
            style={{
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                background: lightMode ? 'rgba(240,244,255,0.82)' : 'rgba(10,13,20,0.78)',
            }}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(99,102,241,0.14)', border: '1px solid rgba(99,102,241,0.3)' }}>
                    <Lock className="w-6 h-6" style={{ color: '#818CF8' }} />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: lightMode ? '#0F172A' : '#F9FAFB' }}>
                    Unlock {sectionLabel}
                </h3>
                <p className="text-sm mb-5 max-w-xs mx-auto" style={{ color: lightMode ? '#64748B' : '#9CA3AF' }}>
                    {requiredTier === 'UNLOCKED'
                        ? 'Create a free account to access full reports, Deep Dives, and your watchlist.'
                        : 'Institutional tier required for this module. Contact us for a demo.'}
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onUpgrade}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white' }}
                    >
                        <Zap className="w-4 h-4" />
                        {requiredTier === 'UNLOCKED' ? 'Sign Up Free →' : 'Contact Sales →'}
                    </motion.button>
                    <div className="text-xs" style={{ color: '#6B7280' }}>
                        No credit card required for Unlocked tier
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Section gate wrapper — adds relative + overlay if tier insufficient ──────

interface SectionGateProps {
    children: ReactNode;
    requiredTier: Tier;
    sectionLabel: string;
    lightMode?: boolean;
    onUpgrade?: () => void;
}

export function SectionGate({ children, requiredTier, sectionLabel, lightMode, onUpgrade }: SectionGateProps) {
    const userTier = useTier();
    const tierRank: Record<Tier, number> = { FREE: 0, UNLOCKED: 1, INSTITUTIONAL: 2 };
    const hasAccess = tierRank[userTier] >= tierRank[requiredTier];

    if (hasAccess) return <>{children}</>;

    return (
        <div className="relative">
            {/* Blurred content (sections still render, just obscured) */}
            <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' }} aria-hidden>
                {children}
            </div>
            <PaywallOverlay
                requiredTier={requiredTier}
                sectionLabel={sectionLabel}
                lightMode={lightMode}
                onUpgrade={onUpgrade}
            />
        </div>
    );
}
