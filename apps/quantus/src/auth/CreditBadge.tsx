import { motion, AnimatePresence } from 'motion/react';
import { Coins, AlertTriangle, ShoppingCart } from 'lucide-react';
import { useCredits, useAuth } from '../auth/AuthContext';

// ─── Credit Balance Badge — shown in navbar ───────────────────────────────────

interface CreditBadgeProps {
    onPurchase?: () => void;
}

export function CreditBadge({ onPurchase }: CreditBadgeProps) {
    const { user } = useAuth();
    const { balance, isLow } = useCredits();

    if (!user || user.tier === 'INSTITUTIONAL') return null;

    return (
        <div className="flex items-center gap-2">
            {/* Low balance warning */}
            <AnimatePresence>
                {isLow && (
                    <motion.div
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B' }}
                    >
                        <AlertTriangle className="w-3 h-3" />
                        Low credits
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Balance pill */}
            <motion.button
                whileHover={{ scale: 1.04 }}
                onClick={onPurchase}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                style={{
                    background: isLow ? 'rgba(245,158,11,0.1)' : 'rgba(9,9,11,0.06)',
                    border: `1px solid ${isLow ? 'rgba(245,158,11,0.3)' : 'rgba(209,213,219,0.95)'}`,
                    color: isLow ? '#F59E0B' : '#09090B',
                }}
                title="Purchase more credits"
            >
                <Coins className="w-3.5 h-3.5" />
                <AnimatePresence mode="wait">
                    <motion.span
                        key={balance}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.2 }}
                    >
                        {balance === Infinity ? '∞' : balance.toFixed(1)}
                    </motion.span>
                </AnimatePresence>
                <span className="opacity-60">cr</span>
            </motion.button>
        </div>
    );
}

// ─── Credit purchase modal (Stripe placeholder) ────────────────────────────────

import { useState } from 'react';
import { CREDIT_BUNDLES } from '../auth/AuthContext';
import type { CreditBundle } from '../auth/AuthContext';

interface PurchaseModalProps {
    open: boolean;
    onClose: () => void;
    lightMode?: boolean;
}

export function CreditPurchaseModal({ open, onClose, lightMode }: PurchaseModalProps) {
    const [selected, setSelected] = useState<string>('Standard');
    const [loading, setLoading] = useState(false);

    const BUNDLES: CreditBundle[] = CREDIT_BUNDLES;

    const handlePurchase = async () => {
        setLoading(true);
        // Production: POST /api/payments/checkout → redirect to Stripe Checkout
        await new Promise(r => setTimeout(r, 1000));
        setLoading(false);
        alert('Stripe integration placeholder — payments not live yet.');
        onClose();
    };

    if (!open) return null;

    const bg = lightMode ? 'rgba(255,255,255,0.97)' : '#0A0A0A';
    const border = lightMode ? '#E2E8F0' : '#1A1A1A';
    const tp = lightMode ? '#0F172A' : '#F9FAFB';
    const ts = lightMode ? '#64748B' : '#9CA3AF';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 16 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-lg rounded-2xl p-6"
                style={{ background: bg, border: `1px solid ${border}`, boxShadow: '0 24px 72px rgba(0,0,0,0.4)' }}
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="font-bold text-xl" style={{ color: tp }}>Purchase Credits</h2>
                        <p className="text-sm mt-0.5" style={{ color: ts }}>Credits never expire · Secure via Stripe</p>
                    </div>
                    <button onClick={onClose} className="cursor-pointer" style={{ color: ts }}>✕</button>
                </div>

                {/* Bundle grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {BUNDLES.map(b => (
                        <button
                            key={b.name}
                            onClick={() => setSelected(b.name)}
                            className="p-4 rounded-xl text-left transition-all cursor-pointer"
                            style={{
                                background: selected === b.name ? (lightMode ? 'rgba(9,9,11,0.06)' : 'rgba(255,255,255,0.08)') : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${selected === b.name ? (lightMode ? 'rgba(9,9,11,0.18)' : 'rgba(255,255,255,0.2)') : border}`,
                            }}
                        >
                            <div className="font-bold text-sm mb-0.5" style={{ color: tp }}>{b.name}</div>
                            <div className="text-2xl font-bold font-mono" style={{ color: tp }}>{b.credits}cr</div>
                            <div className="text-xs mt-1" style={{ color: ts }}>
                                ${b.priceUsd}
                                {' · '}${(b.priceUsd / b.credits).toFixed(2)}/credit
                            </div>
                        </button>
                    ))}
                </div>

                {/* Credit cost reference */}
                <div className="rounded-xl p-3 mb-5 text-xs space-y-1"
                    style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${border}` }}>
                    <div className="font-semibold mb-1.5" style={{ color: ts }}>Credit costs</div>
                    {[
                        ['Standard report', '1.0 cr'],
                        ['Comparison report', '1.5 cr'],
                        ['Deep Dive module', '0.5 cr'],
                        ['Portfolio analyzer', '2.0 cr'],
                        ['Screener query', '0.5 cr'],
                    ].map(([label, cost]) => (
                        <div key={label} className="flex justify-between">
                            <span style={{ color: ts }}>{label}</span>
                            <span className="font-mono font-semibold" style={{ color: tp }}>{cost}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handlePurchase}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-60"
                    style={{ background: '#09090B', color: 'white' }}
                >
                    <ShoppingCart className="w-4 h-4" />
                    {loading ? 'Redirecting to Stripe…' : `Buy ${selected} — $${BUNDLES.find(b => b.name === selected)?.priceUsd ?? 0}`}
                </button>
                <p className="text-center text-xs mt-3" style={{ color: '#6B7280' }}>
                    Stripe integration placeholder — UI demo only. Payments not live.
                </p>
            </motion.div>
        </motion.div>
    );
}
