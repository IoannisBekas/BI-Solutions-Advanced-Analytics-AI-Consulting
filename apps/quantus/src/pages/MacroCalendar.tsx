import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CalendarDays, ExternalLink, Globe2 } from 'lucide-react';

interface MacroCalendarProps {
    lightMode?: boolean;
}

function buildInvestingCalendarUrl(lightMode?: boolean) {
    const params = new URLSearchParams({
        columns: 'exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous',
        importance: '2,3',
        features: 'datepicker,timezone,timeselector,filters',
        countries: '25,6,37,72,22,17,35,43,11,12,4,5',
        calType: 'week',
        timeZone: '58',
        lang: '1',
        ecoDayBackground: lightMode ? '#FFFFFF' : '#0F172A',
        defaultFont: lightMode ? '#111827' : '#F8FAFC',
        innerBorderColor: lightMode ? '#E5E7EB' : '#1E293B',
        borderColor: lightMode ? '#E5E7EB' : '#1E293B',
        ecoDayFontColor: lightMode ? '#111827' : '#F8FAFC',
    });

    return `https://sslecal2.investing.com?${params.toString()}`;
}

export function MacroCalendar({ lightMode }: MacroCalendarProps) {
    const [frameBlocked, setFrameBlocked] = useState(false);
    const calendarUrl = useMemo(() => buildInvestingCalendarUrl(lightMode), [lightMode]);
    const textPrimary = lightMode ? '#111827' : '#F9FAFB';
    const textSecondary = lightMode ? '#6B7280' : '#9CA3AF';
    const border = lightMode ? '#E5E7EB' : '#1A1A1A';
    const panelBackground = lightMode ? 'rgba(255,255,255,0.92)' : 'rgba(15,23,42,0.55)';
    const badgeBackground = lightMode ? 'rgba(37,99,235,0.08)' : 'rgba(96,165,250,0.14)';

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
                            High and medium impact macro events from the official Investing.com economic calendar widget.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {['Weekly view', 'Impact 2-3', 'Official widget'].map((label) => (
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

                <div
                    className="relative overflow-hidden rounded-2xl"
                    style={{
                        background: panelBackground,
                        border: `1px solid ${border}`,
                        boxShadow: lightMode
                            ? '0 18px 48px -36px rgba(15,23,42,0.22)'
                            : '0 18px 48px -36px rgba(0,0,0,0.55)',
                    }}
                >
                    <iframe
                        title="Investing.com economic calendar"
                        src={calendarUrl}
                        className="block h-[720px] min-h-[640px] w-full bg-white"
                        loading="lazy"
                        onError={() => setFrameBlocked(true)}
                        style={{ border: 0 }}
                    />
                    {frameBlocked && (
                        <div
                            className="absolute inset-0 flex items-center justify-center px-6 text-center"
                            style={{
                                background: lightMode ? 'rgba(255,255,255,0.96)' : 'rgba(15,23,42,0.96)',
                                color: textPrimary,
                            }}
                        >
                            <div className="max-w-md">
                                <CalendarDays className="mx-auto mb-4 h-10 w-10" style={{ color: lightMode ? '#1D4ED8' : '#BFDBFE' }} />
                                <h2 className="text-xl font-bold">Calendar frame blocked</h2>
                                <p className="mt-2 text-sm leading-relaxed" style={{ color: textSecondary }}>
                                    Investing.com blocked the embedded widget in this browser session. Open the official calendar directly for the live data.
                                </p>
                                <a
                                    href="https://www.investing.com/economic-calendar/"
                                    target="_blank"
                                    rel="nofollow noopener noreferrer"
                                    className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
                                    style={{
                                        background: lightMode ? '#09090B' : '#FFFFFF',
                                        color: lightMode ? '#FFFFFF' : '#09090B',
                                    }}
                                >
                                    Open official calendar
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className="mt-4 flex flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between"
                    style={{ color: textSecondary }}
                >
                    <span className="inline-flex items-center gap-1.5">
                        <Globe2 className="h-3.5 w-3.5" />
                        Calendar data is supplied by Investing.com and remains outside the Quantus scoring pipeline. If the embed is blocked, use the official calendar link.
                    </span>
                    <a
                        href="https://www.investing.com/economic-calendar/"
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
