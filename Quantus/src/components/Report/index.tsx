import React from 'react';
import type { ReportData, ReportSource } from '../../types';
import { themeColors } from './helpers';
import { SkimSummary } from './SkimSummary';
import { ReportHeader } from './ReportHeader';
import { SectionA } from './SectionA';
import { SectionB } from './SectionB';
import { SectionC } from './SectionC';
import { SectionD } from './SectionD';
import { SectionE } from './SectionE';
import { JurisdictionDisclaimer, detectJurisdiction } from '../JurisdictionDisclaimer';

interface ReportDashboardProps {
    report: ReportData;
    lightMode?: boolean;
    onSubscribe?: () => void;
    onToggleWatchlist?: () => void;
    isWatchlisted?: boolean;
    isAuthenticated?: boolean;
    userTier?: 'FREE' | 'UNLOCKED' | 'INSTITUTIONAL';
    onUpgrade?: () => void;
    reportSource?: ReportSource;
    reportMessage?: string;
    reportDetail?: string;
}

export function ReportDashboard({
    report,
    lightMode,
    onSubscribe,
    onToggleWatchlist,
    isWatchlisted,
    isAuthenticated = false,
    userTier = 'FREE',
    onUpgrade,
    reportSource,
    reportMessage,
    reportDetail,
}: ReportDashboardProps) {
    const { borderColor, dimBg } = themeColors(lightMode);
    const jurisdiction = detectJurisdiction();

    return (
        <div className="space-y-6">
            <ReportHeader
                report={report}
                lightMode={lightMode}
                onSubscribe={onSubscribe}
                onToggleWatchlist={onToggleWatchlist}
                isWatchlisted={isWatchlisted}
                reportSource={reportSource}
                reportMessage={reportMessage}
                reportDetail={reportDetail}
            />
            <SkimSummary report={report} lightMode={lightMode} />
            <SectionA report={report} lightMode={lightMode} />
            <SectionB report={report} lightMode={lightMode} />
            <SectionC report={report} lightMode={lightMode} />
            <SectionD report={report} lightMode={lightMode} />
            <SectionE
                ticker={report.ticker}
                assetClass={report.asset_class}
                isAuthenticated={isAuthenticated}
                userTier={userTier}
                lightMode={lightMode}
                onUpgrade={onUpgrade}
            />

            {/* Data Sources footer */}
            <div className="bis-section-card p-5 text-xs text-gray-500" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                <div className="font-semibold mb-2 uppercase tracking-[0.18em]">Data Sources</div>
                <div className="flex flex-wrap gap-3">
                    {(report.data_sources ?? []).map(ds => (
                        <span key={ds.name} className="px-2 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${borderColor}` }}>
                            Tier {ds.tier} - {ds.name} - {ds.freshness}
                        </span>
                    ))}
                </div>
                <p className="mt-3 text-gray-500">
                    For educational research purposes only. Not financial advice. Quantus Research Solutions - {report.engine} - bisolutions.group
                </p>
            </div>
            <div className="mt-4">
                <JurisdictionDisclaimer
                    jurisdiction={jurisdiction}
                    assetClass={report.asset_class}
                    lightMode={lightMode}
                />
            </div>
        </div>
    );
}
