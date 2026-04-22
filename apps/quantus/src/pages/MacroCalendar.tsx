import { motion } from 'motion/react';
import { CalendarDays, ExternalLink, Globe2 } from 'lucide-react';

interface MacroCalendarProps {
    lightMode?: boolean;
}

const INVESTING_CALENDAR_URL = 'https://www.investing.com/economic-calendar/';

export function MacroCalendar({ lightMode }: MacroCalendarProps) {
    const textPrimary = lightMode ? '#111827' : '#F9FAFB';
    const textSecondary = lightMode ? '#6B7280' : '#9CA3AF';
    const border = lightMode ? '#E5E7EB' : '#1A1A1A';
    const panelBackground = lightMode ? 'rgba(255,255,255,0.92)' : 'rgba(15,23,42,0.55)';
    const badgeBackground = lightMode ? 'rgba(37,99,235,0.08)' : 'rgba(96,165,250,0.14)';
    const mutedPanel = lightMode ? 'rgba(248,250,252,0.9)' : 'rgba(255,255,255,0.04)';

    return (
        <div className="mx-auto max-w-7xl">
            <section className="bis-page-shell px-6 py-8 md:px-10 md:py-10">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
                >
                    <div>
                        <div className="bis-eyebrow mb-4">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Macro Calendar
                        </div>
                        <h1 className="text-3xl font-bold md:text-4xl" style={{ color: textPrimary }}>
                            Economic Calendar
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm leading-relaxed md:text-base" style={{ color: textSecondary }}>
                            High and medium impact macro events from the official Investing.com economic calendar.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {['Weekly view', 'Impact 2-3', 'Official source'].map((label) => (
                            <span
                                key={label}
                                className="inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold"
                                style={{
                                    background: badgeBackground,
                                    borderColor: lightMode ? 'rgba(37,99,235,0.14)' : 'rgba(147,197,253,0.22)',
                                    color: lightMode ? '#1D4ED8' : '#BFDBFE',
                                }}
                            >
                                {label}
                            </span>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="relative overflow-hidden rounded-2xl p-6 md:p-8"
                    style={{
                        background: panelBackground,
                        border: `1px solid ${border}`,
                        boxShadow: lightMode
                            ? '0 18px 48px -36px rgba(15,23,42,0.22)'
                            : '0 18px 48px -36px rgba(0,0,0,0.55)',
                    }}
                >
                    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
                        <div className="flex min-h-[320px] flex-col justify-between rounded-2xl p-6" style={{ background: mutedPanel }}>
                            <div>
                                <CalendarDays className="mb-5 h-10 w-10" style={{ color: lightMode ? '#1D4ED8' : '#BFDBFE' }} />
                                <h2 className="text-2xl font-bold" style={{ color: textPrimary }}>
                                    Open the live macro calendar
                                </h2>
                                <p className="mt-3 max-w-xl text-sm leading-relaxed md:text-base" style={{ color: textSecondary }}>
                                    The Investing.com widget blocks embedded frames in this browser, so Quantus now opens the official calendar directly instead of showing an empty panel.
                                </p>
                            </div>
                            <a
                                href={INVESTING_CALENDAR_URL}
                                target="_blank"
                                rel="nofollow noopener noreferrer"
                                className="mt-6 inline-flex w-fit items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
                                style={{
                                    background: lightMode ? '#09090B' : '#FFFFFF',
                                    color: lightMode ? '#FFFFFF' : '#09090B',
                                }}
                            >
                                Open official calendar
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>

                        <div className="rounded-2xl border p-6" style={{ borderColor: border, background: lightMode ? '#FFFFFF' : 'rgba(15,23,42,0.55)' }}>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: textSecondary }}>
                                How to use with Quantus
                            </p>
                            <ul className="mt-5 space-y-4 text-sm leading-relaxed" style={{ color: textSecondary }}>
                                {[
                                    'Check high-impact USD, EUR, GBP, JPY, and CNY events before reading short-term signal changes.',
                                    'Use event timing as context; macro calendar data does not alter the Quantus confidence score by itself.',
                                    'Return to Scanner or Watchlist after reviewing the external calendar for the latest cached signals.',
                                ].map((item, index) => (
                                    <li key={item} className="flex gap-3">
                                        <span
                                            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                                            style={{
                                                background: badgeBackground,
                                                color: lightMode ? '#1D4ED8' : '#BFDBFE',
                                            }}
                                        >
                                            {index + 1}
                                        </span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>

                <div
                    className="mt-4 flex flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between"
                    style={{ color: textSecondary }}
                >
                    <span className="inline-flex items-center gap-1.5">
                        <Globe2 className="h-3.5 w-3.5" />
                        Calendar data is supplied by Investing.com and remains outside the Quantus scoring pipeline.
                    </span>
                    <a
                        href={INVESTING_CALENDAR_URL}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="inline-flex w-fit items-center gap-1.5 font-semibold hover:underline"
                        style={{ color: lightMode ? '#1D4ED8' : '#BFDBFE' }}
                    >
                        Open on Investing.com
                        <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                </div>
            </section>
        </div>
    );
}
