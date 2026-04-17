import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Mail, Lock, User } from 'lucide-react';
import { useAuth } from './AuthContext';

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (options: {
                        client_id: string;
                        callback: (response: { credential?: string }) => void;
                        context?: 'signin' | 'signup';
                        ux_mode?: 'popup';
                    }) => void;
                    renderButton: (
                        element: HTMLElement,
                        options: {
                            type?: 'standard';
                            theme?: 'outline' | 'filled_black';
                            size?: 'large' | 'medium' | 'small';
                            text?: 'signin_with' | 'signup_with' | 'continue_with';
                            shape?: 'pill' | 'rectangular';
                            width?: string | number;
                            logo_alignment?: 'left' | 'center';
                        },
                    ) => void;
                    cancel?: () => void;
                };
            };
        };
    }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AuthModalProps {
    open: boolean;
    onClose: () => void;
    defaultMode?: 'signin' | 'signup';
    referralToken?: string;
    lightMode?: boolean;
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────

export function AuthModal({ open, onClose, defaultMode = 'signup', referralToken, lightMode }: AuthModalProps) {
    const { signIn, signUp, signInWithGoogle, googleClientId, googleEnabled, isLoading } = useAuth();
    const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPass] = useState('');
    const [error, setError] = useState('');
    const googleButtonRef = useRef<HTMLDivElement | null>(null);

    // Sync internal mode when parent changes defaultMode prop
    useEffect(() => { setMode(defaultMode); }, [defaultMode]);

    useEffect(() => {
        if (!open || !googleEnabled || !googleClientId || !googleButtonRef.current) return;

        let cancelled = false;

        const handleCredential = async (response: { credential?: string }) => {
            if (!response.credential) {
                setError('Google sign-in did not return a credential.');
                return;
            }
            setError('');
            const ok = await signInWithGoogle(
                response.credential,
                mode === 'signup' ? referralToken : undefined,
            );
            if (!ok) {
                setError('Google authentication failed. Please try again.');
                return;
            }
            onClose();
        };

        const renderButton = () => {
            if (cancelled || !googleButtonRef.current || !window.google?.accounts.id) return;
            googleButtonRef.current.innerHTML = '';
            window.google.accounts.id.initialize({
                client_id: googleClientId,
                callback: handleCredential,
                context: mode,
                ux_mode: 'popup',
            });
            window.google.accounts.id.renderButton(googleButtonRef.current, {
                type: 'standard',
                theme: lightMode ? 'outline' : 'filled_black',
                size: 'large',
                text: mode === 'signup' ? 'signup_with' : 'signin_with',
                shape: 'pill',
                width: '320',
                logo_alignment: 'left',
            });
        };

        if (window.google?.accounts.id) {
            renderButton();
        } else {
            const existing = document.querySelector('script[data-google-identity="true"]') as HTMLScriptElement | null;
            const script = existing ?? document.createElement('script');
            if (!existing) {
                script.src = 'https://accounts.google.com/gsi/client';
                script.async = true;
                script.defer = true;
                script.dataset.googleIdentity = 'true';
                document.head.appendChild(script);
            }
            script.onload = () => renderButton();
        }

        return () => {
            cancelled = true;
            window.google?.accounts.id.cancel?.();
            if (googleButtonRef.current) {
                googleButtonRef.current.innerHTML = '';
            }
        };
    }, [open, googleEnabled, googleClientId, mode, referralToken, lightMode, onClose, signInWithGoogle]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (mode === 'signup' && password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        const ok = mode === 'signin'
            ? await signIn(email, password)
            : await signUp(email, name, password, referralToken);
        if (!ok) setError('Authentication failed. Please try again.');
        else onClose();
    };

    const bg = lightMode ? 'rgba(255,255,255,0.97)' : '#0A0A0A';
    const border = lightMode ? '#E2E8F0' : '#1A1A1A';
    const tp = lightMode ? '#0F172A' : '#F9FAFB';
    const ts = lightMode ? '#475569' : '#9CA3AF';
    const inputBg = lightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)';

    if (!open) return null;

    return (
        <AnimatePresence>
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
                    transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.28 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-md rounded-2xl p-7"
                    style={{ background: bg, border: `1px solid ${border}`, boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-blue-400" />
                            <span className="font-bold" style={{ color: tp }}>Quantus Preview Access</span>
                        </div>
                        <button onClick={onClose} className="cursor-pointer opacity-50 hover:opacity-100">
                            <X className="w-4 h-4" style={{ color: ts }} />
                        </button>
                    </div>

                    {/* Referral notice */}
                    {referralToken && mode === 'signup' && (
                        <div className="flex items-center gap-2 text-xs p-3 rounded-xl mb-5"
                            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <span className="text-base">🎁</span>
                            <span style={{ color: '#10B981' }}>You were referred! Sign up to receive <strong>5 free credits</strong>.</span>
                        </div>
                    )}

                    <div
                        className="rounded-xl p-3 mb-5 text-xs leading-relaxed"
                        style={{ background: lightMode ? 'rgba(59,130,246,0.05)' : 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.18)', color: ts }}
                    >
                        Separate Quantus auth stays inside this product runtime. This preview sign-in is independent from Power BI Solutions and is intended for workspace access rehearsal before live billing and entitlement flows are connected.
                    </div>

                    {/* Mode tabs */}
                    <div className="flex mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${border}` }}>
                        {(['signup', 'signin'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className="flex-1 py-2 text-sm font-semibold rounded-lg cursor-pointer transition-all"
                                style={{
                                    background: mode === m ? (lightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)') : 'transparent',
                                    color: mode === m ? tp : ts,
                                    border: mode === m ? `1px solid ${lightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)'}` : '1px solid transparent',
                                }}
                            >
                                {m === 'signup' ? 'Create Preview Account' : 'Sign In'}
                            </button>
                        ))}
                    </div>

                    {googleEnabled && (
                        <>
                            <div className="mb-5">
                                <div ref={googleButtonRef} className="flex justify-center" />
                            </div>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="h-px flex-1" style={{ background: border }} />
                                <span className="text-[11px] uppercase tracking-[0.24em]" style={{ color: ts }}>or</span>
                                <div className="h-px flex-1" style={{ background: border }} />
                            </div>
                        </>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'signup' && (
                            <div>
                                <label className="block text-xs font-semibold mb-1.5" style={{ color: ts }}>Name</label>
                                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: inputBg, border: `1px solid ${border}` }}>
                                    <User className="w-4 h-4 flex-shrink-0" style={{ color: '#6B7280' }} />
                                    <input
                                        type="text" value={name} onChange={e => setName(e.target.value)}
                                        placeholder="Your name" required
                                        className="flex-1 bg-transparent text-sm focus:outline-none"
                                        style={{ color: tp }}
                                    />
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: ts }}>Email</label>
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: inputBg, border: `1px solid ${border}` }}>
                                <Mail className="w-4 h-4 flex-shrink-0" style={{ color: '#6B7280' }} />
                                <input
                                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com" required
                                    className="flex-1 bg-transparent text-sm focus:outline-none"
                                    style={{ color: tp }}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: ts }}>Password</label>
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: inputBg, border: `1px solid ${border}` }}>
                                <Lock className="w-4 h-4 flex-shrink-0" style={{ color: '#6B7280' }} />
                                <input
                                    type="password" value={password} onChange={e => setPass(e.target.value)}
                                    placeholder="••••••••" required
                                    className="flex-1 bg-transparent text-sm focus:outline-none"
                                    style={{ color: tp }}
                                />
                            </div>
                        </div>

                        {error && <p className="text-xs text-red-400">{error}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-60"
                            style={{ background: '#09090B', color: 'white' }}
                        >
                            {isLoading ? 'Please wait…' : mode === 'signup' ? 'Create Quantus Preview Account →' : 'Sign In to Quantus →'}
                        </button>
                    </form>

                    {/* Tier benefit summary (signup only) */}
                    {mode === 'signup' && (
                        <div className="mt-5 text-xs space-y-1.5" style={{ color: ts }}>
                            <div className="font-semibold mb-2" style={{ color: tp }}>Unlocked tier includes:</div>
                            {[
                                '10 reports / month + 15 credits / month',
                                'Full report + all 12 Deep Dive modules',
                                'Watchlist (5 tickers)',
                                'PDF export + email alerts',
                                'Screener (3 saved queries)',
                            ].map(b => (
                                <div key={b} className="flex items-center gap-2">
                                    <span className="text-emerald-400">✓</span>
                                    <span>{b}</span>
                                </div>
                            ))}
                            <p className="mt-3 opacity-60">No credit card required</p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
