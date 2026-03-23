import React from 'react';
import type { ReportData } from '../../types';
import { themeColors } from './helpers';
import { SkimSummary } from './SkimSummary';
import { ReportHeader } from './ReportHeader';
import { SectionA } from './SectionA';
import { SectionB } from './SectionB';
import { SectionC } from './SectionC';
import { SectionD } from './SectionD';
import { SectionDeepDives } from './SectionDeepDives';
import { JurisdictionDisclaimer, detectJurisdiction } from '../JurisdictionDisclaimer';

interface ReportDashboardProps {
    report: ReportData;
    lightMode?: boolean;
    onSubscribe?: () => void;
    onToggleWatchlist?: () => void;
    isWatchlisted?: boolean;
}

export function ReportDashboard({ report, lightMode, onSubscribe, onToggleWatchlist, isWatchlisted }: ReportDashboardProps) {
    const { borderColor, dimBg } = themeColors(lightMode);
    const jurisdiction = detectJurisdiction();

    return (
        <div>
            <SkimSummary report={report} lightMode={lightMode} />
            <ReportHeader
                report={report}
                lightMode={lightMode}
                onSubscribe={onSubscribe}
                onToggleWatchlist={onToggleWatchlist}
                isWatchlisted={isWatchlisted}
            />
            <SectionA report={report} lightMode={lightMode} />
            <SectionB report={report} lightMode={lightMode} />
            <SectionC report={report} lightMode={lightMode} />
            <SectionD report={report} lightMode={lightMode} />
            <SectionDeepDives report={report} lightMode={lightMode} />

            {/* Data Sources footer */}
            <div className="text-xs p-4 rounded-xl text-gray-500" style={{ background: dimBg, border: `1px solid ${borderColor}` }}>
                <div className="font-semibold mb-2">Data Sources</div>
                <div className="flex flex-wrap gap-3">
                    {(report.data_sources ?? []).map(ds => (
                        <span key={ds.name} className="px-2 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${borderColor}` }}>
                            Tier {ds.tier} · {ds.name} · {ds.freshness}
                        </span>
                    ))}
                </div>
                <p className="mt-3 text-gray-500">
                    For educational research purposes only. Not financial advice. Quantus Research Solutions · {report.engine} · bisolutions.group
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
