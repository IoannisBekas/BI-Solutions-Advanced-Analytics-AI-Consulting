import { AlertTriangle, ArrowRight, Gauge, Sparkles } from 'lucide-react';
import type { ReportData } from '../../types';
import { themeColors } from './helpers';

interface SkimSummaryProps {
    report: ReportData;
    lightMode?: boolean;
}

function firstSentence(text: string) {
    const sentence = text.split(/(?<=[.!?])\s+/u)[0]?.trim();
    return sentence || text;
}

function buildKeyRisk(report: ReportData) {
    if (report.earnings_flag) {
        return `Earnings in ${report.earnings_flag.days_to_earnings} days with ${report.earnings_flag.implied_move} implied move.`;
    }

    if (report.cross_ticker_alerts?.[0]) {
        return `${report.cross_ticker_alerts[0].related_ticker}: ${report.cross_ticker_alerts[0].impact}`;
    }

    return `Expected shortfall ${report.risk?.expected_shortfall ?? 'N/A'} and implied move ${report.risk?.implied_move ?? 'N/A'}.`;
}

function buildSuggestedAction(report: ReportData) {
    return `${report.strategy.action} with ${report.strategy.confidence}% confidence. ${report.strategy.regime_context}`;
}

function buildWhatChanged(report: ReportData) {
    return report.signal_cards?.[0]?.plain_note ?? report.regime?.implication ?? 'No data available';
}

export function SkimSummary({ report, lightMode }: SkimSummaryProps) {
    const { textPrimary, textSecondary, dimBg, borderColor } = themeColors(lightMode);
    const cards = [
        {
            title: 'Why it matters',
            text: firstSentence(report.narrative_plain || report.narrative_executive_summary),
            icon: Sparkles,
        },
        {
            title: 'What changed',
            text: buildWhatChanged(report),
            icon: Gauge,
        },
        {
            title: 'Key risk',
            text: buildKeyRisk(report),
            icon: AlertTriangle,
        },
        {
            title: 'Suggested action',
            text: buildSuggestedAction(report),
            icon: ArrowRight,
        },
    ];

    return (
        <div
            className="surface-card p-5 mb-6"
            style={{ background: lightMode ? 'rgba(255,255,255,0.95)' : '#111827', borderColor }}
        >
            <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
                <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-gray-500">
                        Skim First
                    </div>
                    <h2 className="mt-2 text-xl font-bold" style={{ color: textPrimary }}>
                        Decision summary before the full report
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed max-w-3xl" style={{ color: textSecondary }}>
                        Use this block to decide whether the ticker deserves a full read, a quick follow-up, or no action at all.
                    </p>
                </div>
                <div
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ background: dimBg, border: `1px solid ${borderColor}`, color: textSecondary }}
                >
                    {report.overall_signal} · {report.confidence_score}% confidence
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                    <div
                        key={card.title}
                        className="rounded-xl p-4"
                        style={{ background: dimBg, border: `1px solid ${borderColor}` }}
                    >
                        <div className="flex items-center gap-2 mb-3" style={{ color: textPrimary }}>
                            <card.icon className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-[0.18em]">{card.title}</span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>
                            {card.text}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
