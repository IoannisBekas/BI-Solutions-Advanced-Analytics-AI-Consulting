import { motion } from 'motion/react';
import { Bell, Link2, Users, Zap } from 'lucide-react';
import type { ReportData } from '../types';

// ─── Compact sticky strip that replaces the WelcomeCard once report scrolls ──

interface StickyReportStripProps {
    report: ReportData;
    visible: boolean;
    lightMode?: boolean;
    onSubscribe?: () => void;
    reportSource?: 'cached' | 'starter';
    reportMessage?: string;
    shareUrl?: string;
}

function fmtPrice(p: number): string {
    if (p > 10_000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    return `$${p.toFixed(2)}`;
}

export function StickyReportStrip({ report, visible, lightMode, onSubscribe, reportSource = 'cached', reportMessage, shareUrl }: StickyReportStripProps) {
    const positive = report.day_change_pct >= 0;
    const isStarter = reportSource === 'starter';

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
                <span className={`font-semibold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {positive ? '+' : ''}{report.day_change_pct.toFixed(2)}%
                </span>
                <span style={{ color: '#6B7280' }}>{report.exchange}</span>

                {/* Separator */}
                <span style={{ color: '#374151' }}>·</span>

                <span
                    className="rounded-full px-2.5 py-1 font-semibold"
                    style={{
                        background: isStarter ? 'rgba(245,158,11,0.10)' : 'rgba(16,185,129,0.10)',
                        color: isStarter ? '#F59E0B' : '#10B981',
                    }}
                >
                    {isStarter ? 'Starter shell' : 'Cached report'}
                </span>
                <span style={{ color: '#6B7280' }}>{reportMessage ?? (isStarter ? 'No cached Quantus Investing coverage yet.' : 'Shared Quantus Investing coverage loaded.')}</span>

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
                    onClick={() => navigator.clipboard.writeText(shareUrl ?? window.location.href)}
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
