import { ReactNode, useEffect, useState } from 'react';
import {
    Archive,
    ArrowUpRight,
    BarChart3,
    BookOpen,
    Layers,
    List,
    Menu,
    Moon,
    Search,
    Sun,
    X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { WorkspaceStatus } from '../types';

interface LayoutProps {
    children: ReactNode;
    onNavigate?: (view: string) => void;
    currentView?: string;
    lightMode?: boolean;
    onToggleLight?: () => void;
    onOpenAuth?: (mode?: 'signin' | 'signup') => void;
    onSignOut?: () => void;
    userName?: string | null;
    userTier?: string | null;
    workspaceStatus?: WorkspaceStatus | null;
}

export function Layout({
    children,
    onNavigate,
    currentView,
    lightMode,
    onToggleLight,
    onOpenAuth,
    onSignOut,
    userName,
    userTier,
    workspaceStatus,
}: LayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 16);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (lightMode) {
            document.body.classList.remove('dark-mode');
        } else {
            document.body.classList.add('dark-mode');
        }
    }, [lightMode]);

    const navLinks = [
        { label: 'Workspace', icon: Search, action: () => onNavigate?.('hero'), view: 'hero' },
        { label: 'Sector Packs', icon: Layers, action: () => onNavigate?.('sectors'), view: 'sectors' },
        { label: 'Watchlist', icon: List, action: () => onNavigate?.('watchlist'), view: 'watchlist' },
        { label: 'Archive', icon: Archive, action: () => onNavigate?.('archive'), view: 'archive' },
        { label: 'Accuracy', icon: BarChart3, action: () => onNavigate?.('accuracy'), view: 'accuracy' },
        { label: 'Methodology', icon: BookOpen, action: () => onNavigate?.('methodology'), view: 'methodology' },
    ];

    const pageBg = lightMode ? '#FCFCFD' : '#060810';
    const textColor = lightMode ? '#09090B' : '#F0F6FF';
    const borderColor = lightMode ? '#E5E7EB' : '#1A2235';
    const muted = lightMode ? '#6B7280' : '#8B9DB5';

    const statusTone = workspaceStatus?.badgeTone ?? 'neutral';
    const statusColors = {
        neutral: {
            bg: lightMode ? 'rgba(148,163,184,0.10)' : 'rgba(148,163,184,0.10)',
            border: borderColor,
            fg: muted,
            dot: '#64748B',
        },
        success: {
            bg: lightMode ? 'rgba(16,185,129,0.10)' : 'rgba(16,185,129,0.12)',
            border: lightMode ? '#A7F3D0' : '#064E3B',
            fg: lightMode ? '#047857' : '#6EE7B7',
            dot: '#10B981',
        },
        caution: {
            bg: lightMode ? 'rgba(245,158,11,0.10)' : 'rgba(245,158,11,0.12)',
            border: lightMode ? '#FCD34D' : '#6B4A12',
            fg: lightMode ? '#92400E' : '#FCD34D',
            dot: '#D97706',
        },
    }[statusTone];
    const footerLinkButtonStyle = {
        background: 'transparent',
        border: 'none',
        padding: 0,
        margin: 0,
        color: 'inherit',
        font: 'inherit',
        textAlign: 'left' as const,
        appearance: 'none' as const,
        WebkitAppearance: 'none' as const,
    };

    return (
        <div
            className="min-h-screen flex flex-col transition-colors duration-300"
            style={{ background: pageBg, color: textColor }}
        >
            <header
                className="nav-bar sticky top-0 z-50 transition-all duration-300"
                style={{
                    background: lightMode
                        ? scrolled ? 'rgba(252,252,253,0.96)' : 'rgba(252,252,253,0.88)'
                        : scrolled ? 'rgba(6,8,16,0.97)' : 'rgba(6,8,16,0.82)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: `1px solid ${scrolled ? borderColor : 'transparent'}`,
                }}
            >
                <div className="max-w-[1320px] mx-auto px-4 md:px-8 h-[78px] flex items-center justify-between gap-4">
                    <button
                        onClick={() => onNavigate?.('hero')}
                        className="flex items-center gap-3 group flex-shrink-0 cursor-pointer text-left"
                    >
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 select-none"
                            style={{
                                background: lightMode ? '#09090B' : '#FFFFFF',
                                color: lightMode ? '#FFFFFF' : '#09090B',
                                fontFamily: 'var(--font-heading)',
                                letterSpacing: '0.08em',
                            }}
                        >
                            BI
                        </div>
                        <div className="flex flex-col items-start select-none">
                            <div
                                className="font-semibold tracking-tight"
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '16px',
                                    lineHeight: '1.1',
                                    color: textColor,
                                }}
                            >
                                BI Solutions Group
                            </div>
                            <div
                                className="uppercase tracking-[0.22em]"
                                style={{
                                    fontSize: '10px',
                                    color: muted,
                                }}
                            >
                                Quantus Investing Research Platform
                            </div>
                        </div>
                    </button>

                    <nav className="hidden lg:flex items-center gap-2">
                        {navLinks.map((link) => {
                            const isActive = currentView === link.view;

                            return (
                                <button
                                    key={link.view}
                                    onClick={link.action}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
                                    style={{
                                        color: isActive ? textColor : muted,
                                        background: isActive
                                            ? (lightMode ? 'rgba(9,9,11,0.06)' : 'rgba(255,255,255,0.08)')
                                            : 'transparent',
                                        border: `1px solid ${isActive ? borderColor : 'transparent'}`,
                                    }}
                                >
                                    <link.icon className="w-4 h-4" />
                                    {link.label}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-2">
                        <div
                            className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-full text-xs"
                            style={{
                                background: statusColors.bg,
                                border: `1px solid ${statusColors.border}`,
                                color: statusColors.fg,
                            }}
                            title={workspaceStatus?.description}
                        >
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: statusColors.dot }} />
                            <span className="font-medium">{workspaceStatus?.label ?? 'Loading workspace'}</span>
                        </div>

                        <button
                            onClick={onToggleLight}
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                            title={lightMode ? 'Switch to dark mode' : 'Switch to light mode'}
                            style={{
                                background: lightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
                                color: muted,
                            }}
                        >
                            {lightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        </button>

                        <a
                            href="/quantus"
                            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
                            style={{
                                background: lightMode ? '#FFFFFF' : 'rgba(255,255,255,0.06)',
                                color: textColor,
                                border: `1px solid ${borderColor}`,
                            }}
                        >
                            Product page
                            <ArrowUpRight className="w-4 h-4" />
                        </a>

                        {userName ? (
                            <div className="hidden sm:flex items-center gap-2">
                                <div
                                    className="px-3 py-2 rounded-full text-xs font-medium"
                                    style={{
                                        background: lightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
                                        color: muted,
                                        border: `1px solid ${borderColor}`,
                                    }}
                                >
                                    {userTier ?? 'FREE'} · {userName}
                                </div>
                                <button
                                    onClick={onSignOut}
                                    className="px-3 py-2 rounded-full text-sm font-medium"
                                    style={{
                                        background: lightMode ? '#09090B' : '#FFFFFF',
                                        color: lightMode ? '#FFFFFF' : '#09090B',
                                    }}
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => onOpenAuth?.('signin')}
                                className="hidden sm:inline-flex btn-nav-cta"
                                style={{
                                    background: lightMode ? '#09090B' : '#FFFFFF',
                                    color: lightMode ? '#FFFFFF' : '#09090B',
                                }}
                            >
                                Sign In
                            </button>
                        )}

                        <button
                            onClick={() => setMobileMenuOpen((value) => !value)}
                            className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center transition-all"
                            aria-label="Toggle navigation menu"
                            aria-expanded={mobileMenuOpen}
                            style={{
                                background: lightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
                                color: muted,
                            }}
                        >
                            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden overflow-hidden"
                            style={{ borderTop: `1px solid ${borderColor}` }}
                        >
                            <div
                                className="px-4 py-4 flex flex-col gap-2"
                                style={{ background: lightMode ? '#FCFCFD' : '#060810' }}
                            >
                                {navLinks.map((link) => (
                                    <button
                                        key={link.view}
                                        onClick={() => {
                                            link.action();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium text-left transition-all"
                                        style={{
                                            color: currentView === link.view ? textColor : muted,
                                            background: currentView === link.view
                                                ? (lightMode ? 'rgba(9,9,11,0.05)' : 'rgba(255,255,255,0.05)')
                                                : 'transparent',
                                        }}
                                    >
                                        <link.icon className="w-4 h-4" />
                                        {link.label}
                                    </button>
                                ))}
                                <a
                                    href="/quantus"
                                    className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium"
                                    style={{
                                        background: lightMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)',
                                        border: `1px solid ${borderColor}`,
                                        color: textColor,
                                    }}
                                >
                                    Product page
                                    <ArrowUpRight className="w-4 h-4" />
                                </a>
                                {userName ? (
                                    <button
                                        onClick={() => {
                                            onSignOut?.();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium"
                                        style={{
                                            background: lightMode ? '#09090B' : '#FFFFFF',
                                            color: lightMode ? '#FFFFFF' : '#09090B',
                                        }}
                                    >
                                        Sign Out
                                        <span className="text-xs opacity-80">{userTier ?? 'FREE'}</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            onOpenAuth?.('signin');
                                            setMobileMenuOpen(false);
                                        }}
                                        className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium"
                                        style={{
                                            background: lightMode ? '#09090B' : '#FFFFFF',
                                            color: lightMode ? '#FFFFFF' : '#09090B',
                                        }}
                                    >
                                        Sign In
                                        <span className="text-xs opacity-80">Separate auth</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <main className="flex-1 max-w-[1320px] mx-auto w-full px-4 md:px-8 py-6 md:py-8">
                {children}
            </main>

            <footer
                style={{
                    background: lightMode ? '#F8FAFC' : '#09090B',
                    color: lightMode ? '#111827' : '#FFFFFF',
                    borderTop: `1px solid ${lightMode ? '#E5E7EB' : '#1F2937'}`,
                }}
            >
                <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-6 md:py-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                                    style={{
                                        background: lightMode ? '#09090B' : '#FFFFFF',
                                        color: lightMode ? '#FFFFFF' : '#09090B',
                                        fontFamily: 'var(--font-heading)',
                                    }}
                                >
                                    BI
                                </div>
                                <div>
                                    <div
                                        className="font-semibold tracking-tight"
                                        style={{ fontFamily: 'var(--font-heading)', fontSize: '20px' }}
                                    >
                                        Quantus Investing
                                    </div>
                                    <div
                                        className="uppercase tracking-[0.24em]"
                                        style={{ fontSize: '10px', color: lightMode ? '#6B7280' : '#9CA3AF' }}
                                    >
                                        Native BI Solutions product
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed max-w-xl" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                                Institutional-grade quantitative research with a cleaner BI Solutions shell,
                                fast search-to-report flow, and a dedicated workspace under the same domain.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:min-w-[360px]">
                            <div>
                                <h4 className="font-semibold text-xs uppercase tracking-[0.22em] mb-3" style={{ color: lightMode ? '#6B7280' : '#6B7280' }}>
                                    Product
                                </h4>
                                <div className="flex flex-col gap-2.5 text-sm" style={{ color: lightMode ? '#374151' : '#D1D5DB' }}>
                                    <button
                                        type="button"
                                        className="w-fit text-left transition-colors duration-200 hover:underline hover:underline-offset-4"
                                        style={footerLinkButtonStyle}
                                        onClick={() => onNavigate?.('hero')}
                                    >
                                        Workspace
                                    </button>
                                    <button
                                        type="button"
                                        className="w-fit text-left transition-colors duration-200 hover:underline hover:underline-offset-4"
                                        style={footerLinkButtonStyle}
                                        onClick={() => onNavigate?.('sectors')}
                                    >
                                        Sector Packs
                                    </button>
                                    <button
                                        type="button"
                                        className="w-fit text-left transition-colors duration-200 hover:underline hover:underline-offset-4"
                                        style={footerLinkButtonStyle}
                                        onClick={() => onNavigate?.('watchlist')}
                                    >
                                        Watchlist
                                    </button>
                                    <button
                                        type="button"
                                        className="w-fit text-left transition-colors duration-200 hover:underline hover:underline-offset-4"
                                        style={footerLinkButtonStyle}
                                        onClick={() => onNavigate?.('archive')}
                                    >
                                        Archive
                                    </button>
                                    <button
                                        type="button"
                                        className="w-fit text-left transition-colors duration-200 hover:underline hover:underline-offset-4"
                                        style={footerLinkButtonStyle}
                                        onClick={() => onNavigate?.('accuracy')}
                                    >
                                        Accuracy
                                    </button>
                                    <button
                                        type="button"
                                        className="w-fit text-left transition-colors duration-200 hover:underline hover:underline-offset-4"
                                        style={footerLinkButtonStyle}
                                        onClick={() => onNavigate?.('methodology')}
                                    >
                                        Methodology
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-xs uppercase tracking-[0.22em] mb-3" style={{ color: lightMode ? '#6B7280' : '#6B7280' }}>
                                    Ecosystem
                                </h4>
                                <div className="flex flex-col gap-2.5 text-sm" style={{ color: lightMode ? '#374151' : '#D1D5DB' }}>
                                    <a href="/products" className="transition-colors hover:underline" style={{ color: 'inherit' }}>
                                        Products overview
                                    </a>
                                    <a href="/contact" className="transition-colors hover:underline" style={{ color: 'inherit' }}>
                                        Contact BI Solutions
                                    </a>
                                    <a href="/" className="transition-colors hover:underline" style={{ color: 'inherit' }}>
                                        BI Solutions Group
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="border-t mt-6 pt-4 text-xs leading-relaxed"
                        style={{
                            borderColor: lightMode ? '#E5E7EB' : '#1F2937',
                            color: lightMode ? '#6B7280' : '#6B7280',
                        }}
                    >
                        <p className="max-w-5xl">
                            For educational and research purposes only. Not financial, investment, or legal advice.
                            Past performance does not guarantee future results, and all investments involve risk.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4">
                            <span>© 2026 BI Solutions Group · Quantus Investing · bisolutions.group</span>
                            <span>Meridian v2.4 · Separate product runtime</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
