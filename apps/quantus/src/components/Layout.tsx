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
    ScanLine,
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
    minimalHeader?: boolean;
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
    minimalHeader = false,
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
        if (minimalHeader) {
            setMobileMenuOpen(false);
        }
    }, [minimalHeader]);

    useEffect(() => {
        if (lightMode) {
            document.body.classList.remove('dark-mode');
        } else {
            document.body.classList.add('dark-mode');
        }
    }, [lightMode]);

    useEffect(() => {
        const handleShortcut = (event: KeyboardEvent) => {
            const activeTag = document.activeElement?.tagName ?? '';
            if (['INPUT', 'TEXTAREA'].includes(activeTag)) {
                return;
            }

            if (event.key === '/' || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
                event.preventDefault();
                navInputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleShortcut);
        return () => window.removeEventListener('keydown', handleShortcut);
    }, []);

    const pageBg = lightMode ? '#FBFBF8' : '#05070B';
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
    const quantusOverviewUrl = 'https://www.bisolutions.group/quantus';
    const productsOverviewUrl = 'https://www.bisolutions.group/products';
    const contactUrl = 'https://www.bisolutions.group/contact';
    const bisolutionsHomeUrl = 'https://www.bisolutions.group/';
    const brandLogoSrc = `${import.meta.env.BASE_URL}bi-solutions-logo.png`;
    const showExpandedHeader = !minimalHeader;
    const isResourcesScope = currentView === 'methodology';
    const isWorkspaceScope = !isResourcesScope;
    const primaryLinks = [
        { label: 'Overview', icon: ArrowUpRight, kind: 'external' as const, href: quantusOverviewUrl },
        { label: 'Workspace', icon: Search, kind: 'scope' as const, scope: 'workspace' as const, action: () => onNavigate?.('hero') },
        { label: 'Resources', icon: BookOpen, kind: 'scope' as const, scope: 'resources' as const, action: () => onNavigate?.('methodology') },
    ];
    const workspaceLinks = [
        { label: 'Sector Packs', icon: Layers, action: () => onNavigate?.('sectors'), view: 'sectors' },
        { label: 'Watchlist', icon: List, action: () => onNavigate?.('watchlist'), view: 'watchlist' },
        { label: 'Scanner', icon: ScanLine, action: () => onNavigate?.('scanner'), view: 'scanner' },
        { label: 'Archive', icon: Archive, action: () => onNavigate?.('archive'), view: 'archive' },
        { label: 'Accuracy', icon: BarChart3, action: () => onNavigate?.('accuracy'), view: 'accuracy' },
    ];

    return (
        <div
            className="min-h-screen flex flex-col transition-colors duration-300"
            style={{ background: pageBg, color: textColor }}
        >
            <header
                className="nav-bar sticky top-0 z-50 transition-all duration-300"
                style={{
                    background: lightMode
                        ? scrolled ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.84)'
                        : scrolled ? 'rgba(5,7,11,0.96)' : 'rgba(5,7,11,0.84)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: `1px solid ${scrolled ? borderColor : 'transparent'}`,
                    boxShadow: scrolled
                        ? (lightMode
                            ? '0 16px 42px -34px rgba(15,23,42,0.22)'
                            : '0 16px 42px -32px rgba(0,0,0,0.45)')
                        : 'none',
                }}
            >
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-[82px] flex items-center justify-between gap-4">
                    <a
                        href={bisolutionsHomeUrl}
                        className="flex items-center gap-3 flex-shrink-0 text-left min-w-0"
                    >
                        <img
                            src={brandLogoSrc}
                            alt="BI Solutions"
                            className="w-10 h-10 flex-shrink-0 select-none"
                            style={{ filter: lightMode ? 'none' : 'brightness(0) invert(1)' }}
                        />
                        <div className="flex flex-col items-start select-none min-w-0">
                            <div
                                className="font-semibold tracking-tight"
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '17px',
                                    lineHeight: '1.1',
                                    color: textColor,
                                }}
                            >
                                BI Solutions Group
                            </div>
                            <div
                                className="hidden lg:block text-xs font-medium"
                                style={{
                                    color: muted,
                                }}
                            >
                                Advanced Analytics & AI Consulting
                            </div>
                        </div>
                        <div
                            className="hidden lg:inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold"
                            style={{
                                border: `1px solid ${borderColor}`,
                                background: lightMode ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.05)',
                                color: muted,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                            }}
                        >
                            Quantus
                        </div>
                    </a>

                    <nav className={showExpandedHeader ? 'hidden lg:flex items-center gap-6 xl:gap-8 flex-shrink-0' : 'hidden'}>
                        {primaryLinks.map((link) => {
                            const isActive = link.kind === 'scope'
                                ? (link.scope === 'workspace' ? isWorkspaceScope : isResourcesScope)
                                : false;

                            if (link.kind === 'external') {
                                return (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        className="relative py-2 text-sm font-medium transition-colors"
                                        style={{ color: muted }}
                                    >
                                        {link.label}
                                    </a>
                                );
                            }

                            return (
                                <button
                                    key={link.label}
                                    onClick={link.action}
                                    className="group relative py-2 text-sm font-medium transition-colors"
                                    style={{
                                        color: isActive ? textColor : muted,
                                        background: 'transparent',
                                        border: 'none',
                                        paddingLeft: 0,
                                        paddingRight: 0,
                                    }}
                                >
                                    {link.label}
                                    <span
                                        className="absolute inset-x-0 -bottom-2 h-0.5 rounded-full transition-opacity duration-200"
                                        style={{
                                            background: lightMode ? '#09090B' : '#FFFFFF',
                                            opacity: isActive ? 1 : 0,
                                        }}
                                    />
                                </button>
                            );
                        })}
                    </nav>

                    {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Compact nav search ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
                    <form
                        className="hidden"
                        style={{
                            background: lightMode ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${borderColor}`,
                            boxShadow: lightMode ? '0 10px 24px -22px rgba(15,23,42,0.22)' : 'none',
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
                            placeholder="Ticker..."
                            className="flex-1 bg-transparent text-xs outline-none placeholder:text-gray-500"
                            style={{ color: textColor, minWidth: 0 }}
                            autoComplete="off"
                            onKeyDown={(e) => { if (e.key === 'Escape') { setNavQuery(''); navInputRef.current?.blur(); } }}
                        />
                        {!navQuery && (
                            <span
                                className="hidden 2xl:inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold"
                                style={{
                                    background: lightMode ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.08)',
                                    color: muted,
                                }}
                                title="Press / to focus search"
                            >
                                /
                            </span>
                        )}
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
                            className={showExpandedHeader ? 'hidden 2xl:flex items-center gap-2 px-3 py-2 rounded-full text-xs' : 'hidden'}
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
                            className="hidden md:flex w-10 h-10 rounded-full items-center justify-center transition-all"
                            title={lightMode ? 'Switch to dark mode' : 'Switch to light mode'}
                            style={{
                                background: lightMode ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.05)',
                                color: muted,
                                border: `1px solid ${borderColor}`,
                            }}
                        >
                            {lightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        </button>

                        {userName ? (
                            <div className="hidden sm:flex items-center gap-2">
                                <div
                                    className="px-3 py-2 rounded-full text-xs font-medium"
                                    style={{
                                        background: lightMode ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.05)',
                                        color: muted,
                                        border: `1px solid ${borderColor}`,
                                    }}
                                >
                                    {userTier ?? 'FREE'} - {userName}
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
                                className="hidden sm:inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-all"
                                style={{
                                    background: lightMode ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.05)',
                                    color: textColor,
                                    borderColor,
                                    boxShadow: lightMode ? '0 10px 24px -22px rgba(15,23,42,0.22)' : 'none',
                                }}
                            >
                                Sign In
                            </button>
                        )}

                        <button
                            onClick={() => onNavigate?.('hero')}
                            className="btn-nav-cta"
                            style={{
                                background: lightMode ? '#09090B' : '#FFFFFF',
                                color: lightMode ? '#FFFFFF' : '#09090B',
                            }}
                        >
                            Get Started
                        </button>

                        {showExpandedHeader && (
                            <button
                                onClick={() => setMobileMenuOpen((value) => !value)}
                                className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center transition-all"
                                aria-label="Toggle navigation menu"
                                aria-expanded={mobileMenuOpen}
                                style={{
                                    background: lightMode ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.05)',
                                    color: muted,
                                    border: `1px solid ${borderColor}`,
                                }}
                            >
                                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                </div>

                {showExpandedHeader && (
                    <div
                        className="hidden lg:block"
                        style={{ borderTop: `1px solid ${scrolled ? borderColor : 'transparent'}` }}
                    >
                        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-6">
                            <nav className="flex items-center gap-2 xl:gap-3 flex-wrap">
                                {workspaceLinks.map((link) => {
                                    const isActive = currentView === link.view;

                                    return (
                                        <button
                                            key={link.view}
                                            onClick={link.action}
                                            className="rounded-full px-3.5 py-2 text-sm font-medium transition-all"
                                            style={{
                                                color: isActive ? textColor : muted,
                                                background: isActive
                                                    ? (lightMode ? 'rgba(9,9,11,0.06)' : 'rgba(255,255,255,0.06)')
                                                    : 'transparent',
                                                border: `1px solid ${isActive
                                                    ? (lightMode ? 'rgba(37,99,235,0.18)' : 'rgba(147,197,253,0.20)')
                                                    : 'transparent'}`,
                                                boxShadow: isActive && lightMode
                                                    ? '0 12px 24px -22px rgba(37,99,235,0.25)'
                                                    : 'none',
                                            }}
                                        >
                                            {link.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                )}

                <AnimatePresence>
                    {showExpandedHeader && mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden overflow-hidden"
                            style={{ borderTop: `1px solid ${borderColor}` }}
                        >
                            <div
                                className="px-4 py-4 flex flex-col gap-3"
                                style={{ background: lightMode ? '#FFFFFF' : '#000000' }}
                            >
                                <div className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: muted }}>
                                    Product
                                </div>
                                {primaryLinks.map((link) => {
                                    const isActive = link.kind === 'scope'
                                        ? (link.scope === 'workspace' ? isWorkspaceScope : isResourcesScope)
                                        : false;

                                    if (link.kind === 'external') {
                                        return (
                                            <a
                                                key={link.label}
                                                href={link.href}
                                                className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium"
                                                style={{
                                                    background: lightMode ? '#FFFFFF' : 'rgba(255,255,255,0.04)',
                                                    border: `1px solid ${borderColor}`,
                                                    color: textColor,
                                                }}
                                            >
                                                <span>{link.label}</span>
                                                <link.icon className="w-4 h-4" />
                                            </a>
                                        );
                                    }

                                    return (
                                        <button
                                            key={link.label}
                                            onClick={() => {
                                                link.action();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium text-left transition-all"
                                            style={{
                                                color: isActive ? textColor : muted,
                                                background: isActive
                                                    ? (lightMode ? 'rgba(9,9,11,0.05)' : 'rgba(255,255,255,0.05)')
                                                    : 'transparent',
                                            }}
                                        >
                                            <link.icon className="w-4 h-4" />
                                            {link.label}
                                        </button>
                                    );
                                })}

                                <div className="pt-2 text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: muted }}>
                                    Workspace
                                </div>
                                {workspaceLinks.map((link) => (
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
                                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm select-none"
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
                                <span>(c) 2026 BI Solutions Group - Quantus Investing - www.bisolutions.group</span>
                                <span>Research workspace under the BI Solutions product suite</span>
                            </div>
                        </div>
                    </div>
            </footer>
        </div>
    );
}
