import type { ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface WorkspaceErrorProps {
    title: string;
    message: string;
    onRetry?: () => void;
    lightMode?: boolean;
}

interface WorkspaceSkeletonProps {
    rows?: number;
    lightMode?: boolean;
    variant?: 'grid' | 'list';
}

interface WorkspaceEmptyProps {
    icon?: ReactNode;
    title: string;
    message: string;
    cta?: {
        label: string;
        onClick?: () => void;
    };
    lightMode?: boolean;
}

function getWorkspacePalette(lightMode?: boolean) {
    return {
        textPrimary: lightMode ? '#0F172A' : '#F8FAFC',
        textSecondary: lightMode ? '#475569' : '#94A3B8',
        textMuted: lightMode ? '#94A3B8' : '#64748B',
        border: lightMode ? '#E2E8F0' : '#1E293B',
        surface: lightMode ? 'rgba(255,255,255,0.98)' : 'rgba(15,23,42,0.52)',
        surfaceSoft: lightMode ? 'rgba(248,250,252,0.92)' : 'rgba(255,255,255,0.03)',
        dangerSurface: lightMode ? 'rgba(254,242,242,0.98)' : 'rgba(127,29,29,0.18)',
        dangerBorder: lightMode ? 'rgba(248,113,113,0.32)' : 'rgba(248,113,113,0.28)',
        dangerText: lightMode ? '#B91C1C' : '#FCA5A5',
        actionBg: lightMode ? 'rgba(37,99,235,0.10)' : 'rgba(96,165,250,0.16)',
        actionText: lightMode ? '#1D4ED8' : '#BFDBFE',
        actionBorder: lightMode ? 'rgba(37,99,235,0.18)' : 'rgba(147,197,253,0.24)',
        actionShadow: lightMode ? '0 12px 24px -16px rgba(37,99,235,0.35)' : '0 12px 24px -18px rgba(96,165,250,0.45)',
    };
}

export function WorkspaceError({ title, message, onRetry, lightMode }: WorkspaceErrorProps) {
    const palette = getWorkspacePalette(lightMode);

    return (
        <div
            className="rounded-[28px] border px-5 py-5 md:px-6 md:py-6"
            style={{
                background: palette.dangerSurface,
                borderColor: palette.dangerBorder,
                boxShadow: lightMode ? '0 18px 48px -38px rgba(248,113,113,0.35)' : 'none',
            }}
        >
            <div className="flex items-start gap-4">
                <div
                    className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                    style={{
                        background: lightMode ? 'rgba(254,226,226,0.88)' : 'rgba(248,113,113,0.12)',
                        color: palette.dangerText,
                    }}
                >
                    <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold" style={{ color: palette.textPrimary }}>
                        {title}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed" style={{ color: palette.textSecondary }}>
                        {message}
                    </p>
                    {onRetry && (
                        <button
                            type="button"
                            onClick={onRetry}
                            className="mt-4 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-all hover:-translate-y-0.5"
                            style={{
                                background: palette.actionBg,
                                border: `1px solid ${palette.actionBorder}`,
                                color: palette.actionText,
                                boxShadow: palette.actionShadow,
                            }}
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Try again
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function SkeletonCard({ variant, lightMode }: { variant: 'grid' | 'list'; lightMode?: boolean }) {
    const palette = getWorkspacePalette(lightMode);

    if (variant === 'list') {
        return (
            <div
                className="rounded-[28px] border px-5 py-5"
                style={{
                    background: palette.surface,
                    borderColor: palette.border,
                }}
            >
                <div className="mb-4 h-3 w-24 skeleton" />
                <div className="mb-3 h-4 w-56 skeleton" />
                <div className="mb-6 h-2.5 w-36 skeleton" />
                <div className="grid gap-2 md:grid-cols-[1fr_120px_120px]">
                    <div className="h-2.5 w-full skeleton" />
                    <div className="h-2.5 w-full skeleton" />
                    <div className="h-2.5 w-full skeleton" />
                </div>
            </div>
        );
    }

    return (
        <div
            className="rounded-[28px] border px-5 py-5"
            style={{
                background: palette.surface,
                borderColor: palette.border,
            }}
        >
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="h-4 w-24 skeleton" />
                <div className="h-7 w-20 rounded-full skeleton" />
            </div>
            <div className="mb-3 h-4 w-3/4 skeleton" />
            <div className="mb-2 h-2.5 w-full skeleton" />
            <div className="mb-2 h-2.5 w-5/6 skeleton" />
            <div className="mt-5 h-2.5 w-2/5 skeleton" />
        </div>
    );
}

export function WorkspaceSkeleton({
    rows = 3,
    lightMode,
    variant = 'grid',
}: WorkspaceSkeletonProps) {
    return (
        <div className={variant === 'list' ? 'space-y-4' : 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'}>
            {Array.from({ length: rows }, (_, index) => (
                <SkeletonCard key={`workspace-skeleton-${variant}-${index}`} variant={variant} lightMode={lightMode} />
            ))}
        </div>
    );
}

export function WorkspaceEmpty({ icon, title, message, cta, lightMode }: WorkspaceEmptyProps) {
    const palette = getWorkspacePalette(lightMode);

    return (
        <div
            className="rounded-[32px] border border-dashed px-6 py-10 text-center md:px-8 md:py-12"
            style={{
                background: palette.surfaceSoft,
                borderColor: palette.border,
            }}
        >
            {icon && (
                <div
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{
                        background: lightMode ? 'rgba(37,99,235,0.08)' : 'rgba(96,165,250,0.10)',
                        color: lightMode ? '#2563EB' : '#93C5FD',
                    }}
                >
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold tracking-tight" style={{ color: palette.textPrimary }}>
                {title}
            </h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: palette.textSecondary }}>
                {message}
            </p>
            {cta && (
                <button
                    type="button"
                    onClick={cta.onClick}
                    className="mt-5 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5"
                    style={{
                        background: palette.actionBg,
                        border: `1px solid ${palette.actionBorder}`,
                        color: palette.actionText,
                        boxShadow: palette.actionShadow,
                    }}
                >
                    {cta.label}
                </button>
            )}
        </div>
    );
}
