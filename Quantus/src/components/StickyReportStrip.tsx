import { motion } from 'motion/react';
import { Bell, Users, Zap, ExternalLink } from 'lucide-react';
import type { ReportData } from '../types';

// ─── Compact sticky strip that replaces the WelcomeCard once report scrolls ──

interface StickyReportStripProps {
    report: ReportData;
    visible: boolean;
    lightMode?: boolean;
    onSubscribe?: () => void;
}

function fmtPrice(p: number): string {
    if (p > 10_000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    return `$${p.toFixed(2)}`;
}

function fmtDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function StickyReportStrip({ report, visible, lightMode, onSubscribe }: StickyReportStripProps) {
    const positive = report.day_change_pct >= 0;

    return (
        <motion.div
            initial={{ y: -56, opacity: 0 }}
            animate={{ y: visible ? 0 : -56, opacity: visible ? 1 : 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 text-xs flex-wrap gap-y-2"
            style={{
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

                {/* Report ID + Engine */}
                <span className="font-mono" style={{ color: '#6B7280' }}>{report.report_id}</span>
                <div className="flex items-center gap-1" style={{ color: '#6B7280' }}>
                    <Zap className="w-3 h-3 text-blue-400" />
                    {report.engine}
                </div>

                {/* Date */}
                <span style={{ color: '#6B7280' }}>{fmtDate(report.generated_at)}</span>

                {/* Researchers */}
                <div className="flex items-center gap-1" style={{ color: '#6B7280' }}>
                    <Users className="w-3 h-3" />
                    {report.researcher_count} researchers
                </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
                {/* Shareable URL */}
                <a
                    href={`https://bisolutions.group/report/${report.report_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 transition-colors hover:text-blue-400 cursor-pointer"
                    style={{ color: '#6B7280' }}
                >
                    <ExternalLink className="w-3 h-3" />
                    Share
                </a>

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
