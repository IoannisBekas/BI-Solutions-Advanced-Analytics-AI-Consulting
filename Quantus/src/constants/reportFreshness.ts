import type { ReportData, ReportResponse } from '../types';

export type ReportFreshnessBucket = 'real_time' | 'daily' | 'cached' | 'archival';

export interface ReportFreshnessGroup {
    bucket: ReportFreshnessBucket;
    label: string;
    summary: string;
    fields: string[];
}

export const REPORT_FRESHNESS_MATRIX: ReportFreshnessGroup[] = [
    {
        bucket: 'real_time',
        label: 'Real Time',
        summary: 'Refresh on report open or explicit live refresh.',
        fields: [
            'current_price',
            'day_change',
            'day_change_pct',
            'generated_at',
            'regime',
            'overall_signal',
            'confidence_score',
            'confidence_breakdown',
            'model_ensemble',
            'signal_cards',
            'risk',
            'strategy',
            'data_sources',
        ],
    },
    {
        bucket: 'daily',
        label: 'Daily',
        summary: 'Refresh on pipeline rerun, not necessarily every render.',
        fields: [
            'market_cap',
            'market_cap_raw',
            'week_52_high',
            'week_52_low',
            'pe_ratio',
            'alternative_data',
            'vs_consensus',
            'earnings_flag',
            'cross_ticker_alerts',
            'peer_group',
            'metrics',
        ],
    },
    {
        bucket: 'cached',
        label: 'Cached Narrative',
        summary: 'Safe to keep cached for speed while quote-sensitive sections refresh.',
        fields: [
            'description',
            'narrative_executive_summary',
            'narrative_plain',
            'researcher_count',
            'community_interest_spike',
        ],
    },
    {
        bucket: 'archival',
        label: 'Archive / Long Horizon',
        summary: 'Refresh on slower schedules such as daily, weekly, or monthly research cycles.',
        fields: [
            'historical_signals',
            'deep_dive_modules',
            '3_month_reports',
            '6_month_reports',
            'archive_snapshots',
            'backtests',
            'factor_studies',
        ],
    },
];

export function shouldRefreshLiveSensitiveFields(response: ReportResponse | null) {
    return response?.source === 'cached';
}

export function mergeReportResponseWithLiveRefresh(
    baseResponse: ReportResponse,
    liveResponse: ReportResponse,
): ReportResponse {
    const base = baseResponse.report;
    const live = liveResponse.report;

    const mergedReport: ReportData = {
        ...base,
        company_name: live.company_name || base.company_name,
        exchange: live.exchange || base.exchange,
        sector: live.sector || base.sector,
        industry: live.industry || base.industry,
        market_cap: live.market_cap || base.market_cap,
        market_cap_raw: live.market_cap_raw ?? base.market_cap_raw,
        asset_class: live.asset_class || base.asset_class,
        logo: live.logo ?? base.logo,
        current_price: live.current_price,
        day_change: live.day_change,
        day_change_pct: live.day_change_pct,
        week_52_high: live.week_52_high,
        week_52_low: live.week_52_low,
        pe_ratio: live.pe_ratio ?? base.pe_ratio,
        suppliers: live.suppliers ?? base.suppliers,
        customers: live.customers ?? base.customers,
        competitors: live.competitors ?? base.competitors,
        regime: live.regime,
        overall_signal: live.overall_signal,
        confidence_score: live.confidence_score,
        confidence_breakdown: live.confidence_breakdown,
        vs_consensus: live.vs_consensus ?? base.vs_consensus,
        earnings_flag: live.earnings_flag ?? base.earnings_flag,
        cross_ticker_alerts: live.cross_ticker_alerts ?? base.cross_ticker_alerts,
        model_ensemble: live.model_ensemble,
        signal_cards: live.signal_cards,
        alternative_data: live.alternative_data,
        risk: live.risk,
        strategy: live.strategy,
        narrative_executive_summary: base.narrative_executive_summary || live.narrative_executive_summary,
        narrative_plain: base.narrative_plain || live.narrative_plain,
        researcher_count: live.researcher_count ?? base.researcher_count,
        community_interest_spike: live.community_interest_spike ?? base.community_interest_spike,
        generated_at: live.generated_at,
        cache_age: 'Hybrid refresh',
        historical_signals: base.historical_signals ?? live.historical_signals,
        data_sources: live.data_sources,
        peer_group: live.peer_group?.length ? live.peer_group : base.peer_group,
        metrics: live.metrics ?? base.metrics,
    };

    return {
        ...baseResponse,
        report: mergedReport,
        source: 'cached',
        message: 'Cached report loaded. Live-sensitive fields refreshed.',
        detail: 'Price, indicators, risk, regime, forecasts, and strategy fields were upgraded from a live pipeline run. Narrative sections remain cached for speed.',
        freshness: 'Hybrid',
        status: {
            mode: 'mixed',
            label: 'Hybrid freshness',
            description: 'Quote-sensitive sections are live. Longer-form narratives and deep research sections remain cached for speed.',
            detail: 'Real-time fields: price, indicators, risk, regime, forecast, strategy. Cached fields: narratives, archive snapshots, and long-form research.',
            badgeTone: 'caution',
        },
    };
}
