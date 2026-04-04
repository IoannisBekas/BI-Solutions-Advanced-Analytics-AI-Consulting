import { ReactNode, useEffect, useRef, useState } from 'react';
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
    onQuickSearch?: (ticker: string) => void;
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
    onQuickSearch,
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
    const [navQuery, setNavQuery] = useState('');
    const navInputRef = useRef<HTMLInputElement>(null);

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

    const pageBg = lightMode ? '#FAFAFA' : '#000000';
    const textColor = lightMode ? '#09090B' : '#F0F6FF';
    const borderColor = lightMode ? '#E5E7EB' : '#1A1A1A';
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
    const quantusOverviewUrl = 'https://bisolutions.group/quantus';
    const productsOverviewUrl = 'https://bisolutions.group/products';
    const contactUrl = 'https://bisolutions.group/contact';
    const bisolutionsHomeUrl = 'https://bisolutions.group/';

    return (
        <div
            className="min-h-screen flex flex-col transition-colors duration-300"
            style={{ background: pageBg, color: textColor }}
        >
            <header
                className="nav-bar sticky top-0 z-50 transition-all duration-300"
                style={{
                    background: lightMode
                        ? scrolled ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.9)'
                        : scrolled ? 'rgba(0,0,0,0.97)' : 'rgba(0,0,0,0.82)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: `1px solid ${scrolled ? borderColor : 'transparent'}`,
                }}
            >
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-[78px] flex items-center justify-between gap-3 overflow-x-auto overflow-y-hidden scrollbar-none">
                    <button
                        onClick={() => onNavigate?.('hero')}
                        className="flex items-center gap-3 group flex-shrink-0 cursor-pointer text-left"
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 select-none"
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
                                className="hidden xl:block text-xs font-medium"
                                style={{
                                    color: muted,
                                }}
                            >
                                Advanced Analytics & AI Consulting
                            </div>
                        </div>
                        <div
                            className="hidden xl:inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold"
                            style={{
                                border: `1px solid ${borderColor}`,
                                background: lightMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)',
                                color: muted,
                            }}
                        >
                            Quantus
                        </div>
                    </button>

                    <nav className="hidden lg:flex items-center gap-4 xl:gap-6 flex-shrink-0">
                        {navLinks.map((link) => {
                            const isActive = currentView === link.view;

                            return (
                                <button
                                    key={link.view}
                                    onClick={link.action}
                                    className={`group relative pb-1 text-sm font-medium transition-colors after:absolute after:left-0 after:-bottom-2 after:h-px after:w-full after:origin-left after:transition-transform after:duration-200 after:content-[''] ${
                                        lightMode
                                            ? isActive
                                                ? 'text-black after:bg-black after:scale-x-100'
                                                : 'text-gray-500 hover:text-black after:bg-black after:scale-x-0 hover:after:scale-x-100'
                                            : isActive
                                                ? 'text-white after:bg-white after:scale-x-100'
                                                : 'text-slate-400 hover:text-white after:bg-white after:scale-x-0 hover:after:scale-x-100'
                                    }`}
                                >
                                    {link.label}
                                </button>
                            );
                        })}
                    </nav>

                    {/* ── Compact nav search ──────────────────────────── */}
                    <form
                        className="hidden md:flex items-center gap-2 flex-1 max-w-[220px] xl:max-w-[260px] rounded-full px-3 py-1.5 transition-all duration-200"
                        style={{
                            background: lightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
                            border: `1px solid ${borderColor}`,
                        }}
                        onSubmit={(e) => {
                            e.preventDefault();
                            const ticker = navQuery.trim().toUpperCase();
                            if (ticker && onQuickSearch) {
                                onQuickSearch(ticker);
                                setNavQuery('');
                                navInputRef.current?.blur();
                            }
                        }}
                    >
                        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: muted }} />
                        <input
                            ref={navInputRef}
                            type="text"
                            value={navQuery}
                            onChange={(e) => setNavQuery(e.target.value)}
                            placeholder="Ticker…"
                            className="flex-1 bg-transparent text-xs outline-none placeholder:text-gray-500"
                            style={{ color: textColor, minWidth: 0 }}
                            autoComplete="off"
                            onKeyDown={(e) => { if (e.key === 'Escape') { setNavQuery(''); navInputRef.current?.blur(); } }}
                        />
                        {navQuery && (
                            <button
                                type="button"
                                onClick={() => { setNavQuery(''); navInputRef.current?.focus(); }}
                                className="text-xs"
                                style={{ color: muted }}
                                aria-label="Clear"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </form>

                    <div className="flex items-center gap-2 flex-shrink-0">
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
                            <span className="font-medium">{workspaceStatus?.label ?? 'Research runtime'}</span>
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
                            href={quantusOverviewUrl}
                            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
                            style={{
                                background: lightMode ? '#FFFFFF' : 'rgba(255,255,255,0.06)',
                                color: textColor,
                                border: `1px solid ${borderColor}`,
                            }}
                        >
                            Overview
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
                                style={{ background: lightMode ? '#FFFFFF' : '#000000' }}
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
                                    href={quantusOverviewUrl}
                                    className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium"
                                    style={{
                                        background: lightMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)',
                                        border: `1px solid ${borderColor}`,
                                        color: textColor,
                                    }}
                                >
                                    Overview
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

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-10">
                {children}
            </main>

            <footer
                style={{
                    background: lightMode ? '#FFFFFF' : '#09090B',
                    color: lightMode ? '#111827' : '#FFFFFF',
                    borderTop: `1px solid ${lightMode ? '#E5E7EB' : '#1A1A1A'}`,
                }}
            >
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm select-none"
                                    style={{
                                        background: lightMode ? '#09090B' : '#FFFFFF',
                                        color: lightMode ? '#FFFFFF' : '#09090B',
                                        fontFamily: 'var(--font-heading)',
                                        letterSpacing: '0.08em',
                                    }}
                                >
                                    BI
                                </div>
                                <div>
                                    <div
                                        className="font-semibold tracking-tight"
                                        style={{ fontFamily: 'var(--font-heading)', fontSize: '20px' }}
                                    >
                                        BI Solutions Group
                                    </div>
                                    <div
                                        className="text-xs font-medium"
                                        style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}
                                    >
                                        Quantus Investing workspace
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed max-w-xl" style={{ color: lightMode ? '#6B7280' : '#9CA3AF' }}>
                                Quantus is the research product inside the BI Solutions ecosystem, with a dedicated
                                workspace for signal review, archive access, methodology, and sector workflows.
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
                                    <a href={productsOverviewUrl} className="transition-colors hover:underline" style={{ color: 'inherit' }}>
                                        Products overview
                                    </a>
                                    <a href={contactUrl} className="transition-colors hover:underline" style={{ color: 'inherit' }}>
                                        Contact BI Solutions
                                    </a>
                                    <a href={bisolutionsHomeUrl} className="transition-colors hover:underline" style={{ color: 'inherit' }}>
                                        BI Solutions Group
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                        <div
                            className="border-t mt-6 pt-4 text-xs leading-relaxed"
                            style={{
                                borderColor: lightMode ? '#E5E7EB' : '#1A1A1A',
                            color: lightMode ? '#6B7280' : '#6B7280',
                        }}
                        >
                            <p className="max-w-5xl">
                                For educational and research purposes only. Not financial, investment, or legal advice.
                                Past performance does not guarantee future results, and all investments involve risk.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4">
                                <span>© 2026 BI Solutions Group · Quantus Investing · bisolutions.group</span>
                                <span>Research workspace under the BI Solutions product suite</span>
                            </div>
                        </div>
                    </div>
            </footer>
        </div>
    );
}
