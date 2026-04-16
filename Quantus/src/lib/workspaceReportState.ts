import { isWorkspaceRequestError } from '../services/workspace';
import type {
    AssetClass,
    AssetEntry,
    InsightCard,
    ReportResponse,
    WorkspaceStatus,
} from '../types';

export function buildEmergencyStarterReport(asset: AssetEntry, status: WorkspaceStatus): ReportResponse {
    return {
        report: {
            engine: 'Meridian v2.4',
            report_id: `QRS-2026-${String(Math.floor(Math.random() * 90000 + 10000))}`,
            ticker: asset.ticker,
            company_name: asset.name,
            exchange: asset.exchange,
            sector: asset.sector ?? 'Unclassified',
            industry: asset.sector ?? 'Unclassified',
            market_cap: 'Unavailable',
            asset_class: asset.assetClass,
            description: `${asset.name} is visible in the Quantus workspace, but the report service was unavailable during load. This emergency starter shell keeps the URL and workflow intact until the API is reachable again.`,
            current_price: 0,
            day_change: 0,
            day_change_pct: 0,
            week_52_high: 0,
            week_52_low: 0,
            regime: {
                label: 'Transitional',
                implication: 'Quantus could not complete the report handoff because the API request failed.',
                active_strategies: ['Manual review'],
                suppressed_strategies: ['Automated conviction signals'],
            },
            overall_signal: 'NEUTRAL',
            confidence_score: 20,
            confidence_breakdown: {
                momentum: 3,
                sentiment: 3,
                regime_alignment: 3,
                model_ensemble_agreement: 3,
                alternative_data: 3,
                macro_context: 3,
                data_quality: 2,
            },
            model_ensemble: {
                lstm: { forecast: 'Unavailable', weight: 'N/A', accuracy: 'N/A' },
                prophet: { forecast: 'Unavailable', weight: 'N/A', accuracy: 'N/A' },
                arima: { forecast: 'Unavailable', weight: 'N/A', accuracy: 'N/A' },
                ensemble_forecast: 'Unavailable',
                confidence_band: { low: 'N/A', high: 'N/A' },
                regime_accuracy_note: 'The Quantus API request failed before a model run could be loaded.',
            },
            signal_cards: [
                {
                    label: 'Workspace state',
                    value: 'API unavailable',
                    trend: 'neutral',
                    plain_note: 'This page is an emergency fallback generated in the browser because the Quantus API could not be reached.',
                    data_source: 'Client fallback',
                    freshness: 'Unavailable',
                    quality_score: 15,
                },
            ],
            alternative_data: {
                grok_x_sentiment: { score: 0.5, volume: 0, credibility_weighted: 0.5, campaign_detected: false, freshness: 'Unavailable' },
                reddit_score: 0.5,
                news_score: 0.5,
                composite_sentiment: 0.5,
                institutional_flow: 'Unavailable',
                insider_activity: 'Unavailable',
                short_interest: 'Unavailable',
                iv_rank: 'Unavailable',
                implied_move: 'Unavailable',
                transcript_score: 'Unavailable',
                sec_language_trend: 'Unavailable',
            },
            risk: {
                var_dollar: 'Unavailable',
                expected_shortfall: 'Unavailable',
                max_drawdown: 'Unavailable',
                sharpe_ratio: 0,
                volatility_vs_peers: 'Unavailable',
                implied_move: 'Unavailable',
                stress_tests: [{ scenario: 'API unavailable', return: 'Unavailable', recovery: 'Unavailable' }],
                macro_context: {
                    fed_rate: 'Unavailable',
                    yield_curve: 'Unavailable',
                    vix: 'Unavailable',
                    credit_spreads: 'Unavailable',
                },
            },
            strategy: {
                action: 'NEUTRAL',
                confidence: 20,
                regime_context: 'The Quantus API request failed, so this report should not be treated as a signal.',
                entry_zone: 'Unavailable',
                target: 'Unavailable',
                stop_loss: 'Unavailable',
                risk_reward: 'Unavailable',
                position_size_pct: 'Manual only',
                kelly_derived_max: 'Unavailable',
            },
            narrative_executive_summary: 'Quantus could not load the report service for this ticker. The route remains available, but this page is only an emergency fallback.',
            narrative_plain: 'Refresh once the Quantus API is reachable again.',
            researcher_count: 0,
            generated_at: new Date().toISOString(),
            cache_age: 'Unavailable',
            data_sources: [{ name: 'Client emergency fallback', tier: 4, freshness: 'Unavailable' }],
            peer_group: [],
        },
        source: 'starter',
        ticker: asset.ticker,
        message: 'Quantus report service unavailable.',
        detail: 'The API request failed, so an emergency starter shell was opened locally.',
        freshness: 'Unavailable',
        status,
    };
}

export function buildPipelineUnavailableStatus(detail?: string): WorkspaceStatus {
    return {
        mode: 'sandbox',
        label: 'Live pipeline unavailable',
        description: 'Quantus could not reach the report service for this request, so starter coverage is being shown instead.',
        detail: detail ?? 'The report URL remains available while the research pipeline recovers.',
        badgeTone: 'caution',
    };
}

export function describeWorkspaceReportFetchFailure(error: unknown, ticker: string) {
    if (isWorkspaceRequestError(error)) {
        const detail = error.detail ?? `${error.message} (HTTP ${error.status})`;

        return {
            detail,
            message: error.status >= 500
                ? 'Quantus report service unavailable.'
                : `Quantus could not load ${ticker}.`,
            status: buildPipelineUnavailableStatus(detail),
        };
    }

    if (error instanceof Error && error.message.trim()) {
        const detail = error.message.trim();
        return {
            detail,
            message: 'Quantus report service unavailable.',
            status: buildPipelineUnavailableStatus(detail),
        };
    }

    const detail = 'The report API request failed before Quantus could load live or cached coverage.';
    return {
        detail,
        message: 'Quantus report service unavailable.',
        status: buildPipelineUnavailableStatus(detail),
    };
}

export function trackWorkspaceTickerSearch(ticker: string, assetClass: AssetClass) {
    return fetch('/quantus/api/v1/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: 'anon_local_dev',
            event_type: 'search_ticker',
            data: { ticker, asset_class: assetClass },
        }),
    }).catch(() => undefined);
}

export function buildArchivedSnapshotReadyInsight(response: ReportResponse): InsightCard {
    return {
        id: `${response.report.report_id}-archive`,
        category: 'model',
        text: `Historical snapshot ready. ${response.report.ticker} - ${response.report.report_id}`,
        isComplete: true,
    };
}

export function buildArchivedSnapshotErrorInsight(reportId: string, error: unknown): InsightCard {
    return {
        id: `${reportId}-archive-error`,
        category: 'risk',
        text: error instanceof Error ? error.message : 'Unable to load the Quantus archive snapshot.',
        isComplete: true,
    };
}

export function buildBlockedReportInsight(ticker: string, message: string): InsightCard {
    return {
        id: `${ticker}-blocked`,
        category: 'risk',
        text: message,
    };
}

export function buildLiveRefreshInsight(ticker: string): InsightCard {
    return {
        id: `${ticker}-live-refresh`,
        category: 'model',
        text: 'Live-sensitive fields refreshed; price, regime, risk, forecast, and strategy are now current.',
        isComplete: true,
    };
}

export function buildCompletionInsight(
    ticker: string,
    source: ReportResponse['source'] | undefined,
): InsightCard {
    return {
        id: `${ticker}-complete`,
        category: 'model',
        text: source === 'cached'
            ? 'Cached Quantus coverage is ready. Live-sensitive fields are refreshing.'
            : source === 'live'
                ? 'Live Quantus pipeline report is ready.'
                : 'Starter shell ready; no cached Quantus coverage exists yet.',
        isComplete: true,
    };
}
