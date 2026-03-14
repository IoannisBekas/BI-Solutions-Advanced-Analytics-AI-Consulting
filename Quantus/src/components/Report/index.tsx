import React from 'react';
import type { ReportData } from '../../types';
import { themeColors } from './helpers';
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
}

export function ReportDashboard({ report, lightMode }: ReportDashboardProps) {
    const { borderColor, dimBg } = themeColors(lightMode);
    const jurisdiction = detectJurisdiction();

    return (
        <div>
            <ReportHeader report={report} lightMode={lightMode} />
            <SectionA report={report} lightMode={lightMode} />
            <SectionB report={report} lightMode={lightMode} />
            <SectionC report={report} lightMode={lightMode} />
            <SectionD report={report} lightMode={lightMode} />
            <SectionDeepDives report={report} lightMode={lightMode} />

            {/* Data Sources footer */}
            <div className="text-xs p-4 rounded-xl" style={{ background: dimBg, border: `1px solid ${borderColor}`, color: '#6B7280' }}>
                <div className="font-semibold mb-2">Data Sources</div>
                <div className="flex flex-wrap gap-3">
                    {report.data_sources.map(ds => (
                        <span key={ds.name} className="px-2 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${borderColor}` }}>
                            Tier {ds.tier} · {ds.name} · {ds.freshness}
                        </span>
                    ))}
                </div>
                <p className="mt-3" style={{ color: '#6B7280' }}>
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
