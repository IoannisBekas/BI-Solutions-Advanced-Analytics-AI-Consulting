import { motion } from 'motion/react';
import { Bell, Link2, Users, Zap } from 'lucide-react';
import type { ReportData, ReportSource } from '../types';

// ─── Compact sticky strip that replaces the WelcomeCard once report scrolls ──

interface StickyReportStripProps {
    report: ReportData;
    visible: boolean;
    lightMode?: boolean;
    onSubscribe?: () => void;
    reportSource?: ReportSource;
    reportMessage?: string;
    shareUrl?: string;
}

function isFiniteNumber(value: number | undefined | null): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function fmtPrice(p: number | undefined | null): string {
    if (!isFiniteNumber(p) || p === 0) return '$—';
    if (p > 10_000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    return `$${p.toFixed(2)}`;
}

function fmtSignedPercent(value: number | undefined | null): string {
    if (!isFiniteNumber(value)) return '—';
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function StickyReportStrip({ report, visible, lightMode, onSubscribe, reportSource = 'cached', reportMessage, shareUrl }: StickyReportStripProps) {
    const dayChangePct = isFiniteNumber(report.day_change_pct) ? report.day_change_pct : null;
    const positive = (dayChangePct ?? 0) >= 0;
    const isStarter = reportSource === 'starter';
    const isLive = reportSource === 'live';
    const sourceLabel = isStarter ? 'Starter shell' : isLive ? 'Live pipeline' : 'Cached report';
    const sourceMessage = reportMessage ?? (isStarter
        ? 'No cached Quantus coverage yet.'
        : isLive
            ? 'Live Quantus coverage loaded.'
            : 'Shared Quantus coverage loaded.');
    const dayChangeColor = dayChangePct == null ? '#6B7280' : positive ? '#34D399' : '#F87171';
    const copyLink = async () => {
        const url = shareUrl ?? window.location.href;

        try {
            if (!navigator.clipboard?.writeText) {
                throw new Error('Clipboard unavailable');
            }

            await navigator.clipboard.writeText(url);
            window.alert('Report link copied to clipboard.');
        } catch {
            window.prompt('Copy this report link:', url);
        }
    };

    return (
        <motion.div
            initial={{ y: -56, opacity: 0 }}
            animate={{ y: visible ? 0 : -56, opacity: visible ? 1 : 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 right-0 z-50 flex items-center justify-between px-6 py-3 text-xs flex-wrap gap-y-2"
            style={{
                top: 78,
                background: lightMode ? 'rgba(255,255,255,0.94)' : 'rgba(13,18,30,0.96)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: `1px solid ${lightMode ? '#E2E8F0' : '#1F2937'}`,
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            }}
        >
            {/* Ticker + price */}
            <div className="flex items-center gap-3 flex-wrap">
                <span className="font-bold font-mono" style={{ color: lightMode ? '#0F172A' : '#F9FAFB' }}>
                    {report.ticker}
                </span>
                <span className="font-mono font-semibold" style={{ color: lightMode ? '#0F172A' : '#F9FAFB' }}>
                    {fmtPrice(report.current_price)}
                </span>
                <span className="font-semibold" style={{ color: dayChangeColor }}>
                    {fmtSignedPercent(dayChangePct)}
                </span>
                <span style={{ color: '#6B7280' }}>{report.exchange}</span>

                {/* Separator */}
                <span style={{ color: '#374151' }}>·</span>

                <span
                    className="rounded-full px-2.5 py-1 font-semibold"
                    style={{
                        background: isStarter
                            ? 'rgba(245,158,11,0.10)'
                            : isLive
                                ? 'rgba(59,130,246,0.10)'
                                : 'rgba(16,185,129,0.10)',
                        color: isStarter ? '#F59E0B' : isLive ? '#3B82F6' : '#10B981',
                    }}
                >
                    {sourceLabel}
                </span>
                <span style={{ color: '#6B7280' }}>{sourceMessage}</span>

                <span style={{ color: '#374151' }}>·</span>

                <span className="font-mono" style={{ color: '#6B7280' }}>{report.report_id}</span>
                <div className="flex items-center gap-1" style={{ color: '#6B7280' }}>
                    <Zap className="w-3 h-3 text-blue-400" />
                    {report.engine}
                </div>

                {/* Researchers */}
                <div className="flex items-center gap-1" style={{ color: '#6B7280' }}>
                    <Users className="w-3 h-3" />
                    {report.researcher_count} researchers
                </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
                {/* Shareable URL */}
                <button
                    type="button"
                    onClick={copyLink}
                    className="flex items-center gap-1 transition-colors hover:text-blue-400 cursor-pointer"
                    style={{ color: '#6B7280' }}
                >
                    <Link2 className="w-3 h-3" />
                    Copy link
                </button>

                {/* Subscribe */}
                <button
                    onClick={onSubscribe}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-all hover:scale-105"
                    style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#3B82F6' }}
                >
                    <Bell className="w-3 h-3" />
                    🔔 Subscribe
                </button>
            </div>
        </motion.div>
    );
}
