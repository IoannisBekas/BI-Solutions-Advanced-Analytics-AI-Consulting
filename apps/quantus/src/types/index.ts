// ─── Asset Classes ───────────────────────────────────────────────────────────

export type AssetClass = 'EQUITY' | 'CRYPTO' | 'COMMODITY' | 'ETF';

export type SignalType = 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL';

export type RegimeLabel =
    | 'Strong Uptrend'
    | 'Uptrend'
    | 'Mean-Reverting'
    | 'High Volatility'
    | 'Downtrend'
    | 'Strong Downtrend'
    | 'Transitional';

// ─── Asset Registry ──────────────────────────────────────────────────────────

export interface AssetEntry {
    ticker: string;
    name: string;
    exchange: string;
    assetClass: AssetClass;
    sector?: string;
    logo?: string;
    hasCachedReport?: boolean;
    cachedReportAge?: string; // "4h ago"
    researcherCount?: number;
    currentPrice?: number;
    dayChange?: number;
    dayChangePct?: number;
}

export type WorkspaceMode = 'live' | 'mixed' | 'sandbox';

export interface WorkspaceStatus {
    mode: WorkspaceMode;
    label: string;
    description: string;
    detail: string;
    badgeTone: 'neutral' | 'success' | 'caution';
}

export interface WorkspaceMetric {
    label: string;
    value: string;
    supportingText?: string;
}

export interface WorkspaceGuide {
    title: string;
    description: string;
}

export interface WorkspaceSummary {
    status: WorkspaceStatus;
    metrics: WorkspaceMetric[];
    guides: WorkspaceGuide[];
    featuredAssets: AssetEntry[];
    popularTickers: string[];
}

export type ReportSource = 'live' | 'cached' | 'starter';

export interface ReportResponse {
    report: ReportData;
    source: ReportSource;
    ticker: string;
    message: string;
    detail: string;
    freshness?: string;
    status: WorkspaceStatus;
}

// ─── Insight Cards ───────────────────────────────────────────────────────────

export type InsightCategory = 'momentum' | 'ai' | 'risk' | 'sentiment' | 'model' | 'altdata' | 'institutional' | 'event' | 'knowledge';

export interface InsightCard {
    id: string;
    category: InsightCategory;
    text: string;
    timestamp?: number;
    isComplete?: boolean;
}

// ─── Confidence Breakdown ────────────────────────────────────────────────────

export interface ConfidenceBreakdown {
    momentum: number;
    sentiment: number;
    regime_alignment: number;
    model_ensemble_agreement: number;
    alternative_data: number;
    macro_context: number;
    data_quality: number;
}

// ─── Regime ──────────────────────────────────────────────────────────────────

export interface RegimeData {
    label: RegimeLabel;
    implication: string;
    active_strategies: string[];
    suppressed_strategies: string[];
}

// ─── Model Ensemble ──────────────────────────────────────────────────────────

export interface ModelResult {
    forecast: string;
    weight: string;
    accuracy: string;
}

export interface ModelEnsemble {
    lstm: ModelResult;
    prophet: ModelResult;
    arima: ModelResult;
    ensemble_forecast: string;
    confidence_band: { low: string; high: string };
    regime_accuracy_note: string;
}

// ─── Signal Card ─────────────────────────────────────────────────────────────

export interface SignalCard {
    label: string;
    value: string;
    trend: 'up' | 'down' | 'neutral';
    plain_note: string;
    data_source: string;
    freshness: string;
    quality_score: number;
    icon?: string;
}

// ─── Alternative Data ─────────────────────────────────────────────────────────

export interface GrokSentiment {
    score: number;
    volume: number;
    credibility_weighted: number;
    campaign_detected: boolean;
    freshness: string;
    top_posts?: string[];
}

export interface AlternativeData {
    grok_x_sentiment: GrokSentiment;
    reddit_score: number;
    news_score: number;
    composite_sentiment: number;
    institutional_flow: string;
    insider_activity: string;
    short_interest: string;
    iv_rank: string;
    implied_move: string;
    transcript_score: string;
    sec_language_trend: string;
}

// ─── Risk Metrics ─────────────────────────────────────────────────────────────

export interface StressTest {
    scenario: string;
    return: string;
    recovery: string;
}

export interface RiskData {
    var_dollar: string;
    expected_shortfall: string;
    max_drawdown: string;
    sharpe_ratio: number;
    peer_avg_sharpe?: string;
    volatility_vs_peers: string;
    implied_move: string;
    stress_tests: StressTest[];
    macro_context: {
        fed_rate: string;
        yield_curve: string;
        vix: string;
        credit_spreads: string;
    };
}

// ─── Momentum ───────────────────────────────────────────────────────────────

export interface MomentumData {
    rsi: number | null;
    rsi_note?: string;
    macd: number | null;
    macd_note?: string;
    bollinger_position: number | null;
    bollinger_note?: string;
    adx?: number | null;
    moving_avg_50?: number | null;
    moving_avg_200?: number | null;
}

// ─── Fundamentals ───────────────────────────────────────────────────────────

export interface FundamentalsData {
    pe_ratio?: number | null;
    forward_pe?: number | null;
    peg_ratio?: number | null;
    ps_ratio?: number | null;
    pb_ratio?: number | null;
    ev_ebitda?: number | null;
    gross_margin?: number | null;
    operating_margin?: number | null;
    net_margin?: number | null;
    roe?: number | null;
    roa?: number | null;
    roic?: number | null;
    debt_to_equity?: number | null;
    current_ratio?: number | null;
    interest_coverage?: number | null;
    revenue_growth_yoy?: number | null;
    earnings_growth_yoy?: number | null;
    free_cash_flow_yield?: number | null;
    dividend_yield?: number | null;
    payout_ratio?: number | null;
    dcf_fair_value?: number | null;
    dcf_upside_pct?: number | null;
}

// ─── Analyst Consensus ──────────────────────────────────────────────────────

export interface AnalystConsensus {
    rating: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
    target_mean: number | null;
    target_high: number | null;
    target_low: number | null;
    num_analysts: number;
}

// ─── Scenario Targets ───────────────────────────────────────────────────────

export interface ScenarioTargets {
    bull: { price: number; label?: string };
    base: { price: number; label?: string };
    bear: { price: number; label?: string };
    conviction?: 'HIGH' | 'MEDIUM' | 'LOW';
    time_horizon?: string;
}

// ─── News ────────────────────────────────────────────────────────────────────

export type NewsImpactTag =
    | 'earnings-risk'
    | 'regulatory'
    | 'partnership'
    | 'product'
    | 'macro'
    | 'guidance'
    | 'insider'
    | 'merger'
    | 'general';

export interface NewsArticle {
    title: string;
    url: string;
    summary: string;
    sentiment: number;       // -1.0 (very bearish) to +1.0 (very bullish)
    published_at: string;    // ISO-8601
    source?: string;
    impact_tag?: NewsImpactTag;
}

// ─── SEC Filings ─────────────────────────────────────────────────────────────

export interface SecFiling {
    form_type: string;       // '8-K' | '10-K' | '10-Q' | 'S-1' | 'DEF 14A'
    title: string;
    filed_at: string;        // YYYY-MM-DD
    url: string;
}

export interface SecFilingsData {
    recent_filings: SecFiling[];
    form4_count: number;
    latest_form4_date: string | null;
    insider_activity: 'ACTIVE' | 'NEUTRAL';
    cik: string | null;
    edgar_url: string;
}

// ─── Strategy ────────────────────────────────────────────────────────────────

export interface PairsTrade {
    long: string;
    short: string;
    cointegration: number;
    half_life_days: number;
    current_zscore: number;
    entry_threshold: number;
    signal: string;
}

export interface StrategyData {
    action: SignalType;
    confidence: number;
    regime_context: string;
    entry_zone: string;
    target: string;
    stop_loss: string;
    risk_reward: string;
    position_size_pct: string;
    kelly_derived_max: string;
    earnings_adjustment?: string;
    pairs_trade?: PairsTrade;
    portfolio_sharpe_improvement?: string;
    scenario_targets?: ScenarioTargets;
}

// ─── Cross-Ticker Alert ──────────────────────────────────────────────────────

export interface CrossTickerAlert {
    related_ticker: string;
    relationship: string;
    event: string;
    impact: string;
}

// ─── Earnings Flag ───────────────────────────────────────────────────────────

export interface EarningsFlag {
    days_to_earnings: number;
    implied_move: string;
    strategy_adjustment: string;
}

// ─── Accuracy Tracker ────────────────────────────────────────────────────────

export interface HistoricalSignal {
    date: string;
    signal: SignalType;
    outcome: string;
    engine: string;
    correct: boolean;
}

// ─── Full Report ─────────────────────────────────────────────────────────────

export interface ReportData {
    engine: string;
    report_id: string;
    ticker: string;
    company_name: string;
    exchange: string;
    sector: string;
    industry: string;
    market_cap: string;
    asset_class: AssetClass;
    founded?: string;

    // Company info
    description: string;
    logo?: string;
    current_price: number;
    day_change: number;
    day_change_pct: number;
    week_52_high: number;
    week_52_low: number;
    pe_ratio?: number;
    market_cap_raw?: number;

    // Knowledge graph
    suppliers?: string[];
    customers?: string[];
    competitors?: string[];

    // Core report
    regime: RegimeData;
    overall_signal: SignalType;
    confidence_score: number;
    confidence_breakdown: ConfidenceBreakdown;

    vs_consensus?: {
        quantus: SignalType;
        consensus: string;
        divergence_explanation: string;
    };

    earnings_flag?: EarningsFlag;
    cross_ticker_alerts?: CrossTickerAlert[];

    // Section data
    model_ensemble: ModelEnsemble;
    signal_cards: SignalCard[];
    alternative_data: AlternativeData;
    risk: RiskData;
    strategy: StrategyData;
    momentum?: MomentumData;
    fundamentals?: FundamentalsData;
    analyst_consensus?: AnalystConsensus;
    news_articles?: NewsArticle[];
    sec_filings?: SecFilingsData;

    // Narrative
    narrative_executive_summary: string;
    narrative_plain: string;

    // Meta
    researcher_count: number;
    community_interest_spike?: number;
    generated_at: string;
    cache_age?: string;
    historical_signals?: HistoricalSignal[];
    data_sources: DataSource[];
    peer_group: string[];

    // Optional extended metrics (populated by some report sources)
    metrics?: {
        risk?: {
            volatility_30d?: number;
            beta?: number;
        };
    };
}

// ─── Data Sources ────────────────────────────────────────────────────────────

export interface DataSource {
    name: string;
    tier: 1 | 2 | 3 | 4;
    freshness: string;
}

// ─── Watchlist ───────────────────────────────────────────────────────────────

export interface WatchlistItem {
    ticker: string;
    name: string;
    assetClass: AssetClass;
    signal: SignalType;
    confidence: number;
    regime: RegimeLabel;
    forecast: string;
    currentPrice: number;
    dayChangePct: number;
    daysToEarnings?: number;
    lastUpdated: string;
    nextRefresh: string;
    researcherCount: number;
}

export interface QuantusWatchlistItem extends AssetEntry {
    signal: SignalType;
    confidence: number;
    regime: string;
    momentum: number;
    sentiment: number;
    forecast30d: string;
    daysToEarnings?: number;
    lastUpdated: string;
    nextRefresh: string;
    researcherCount: number;
    fearAndGreed?: number;
    cotSignal?: string;
    fundFlows?: string;
    knowledgeGraphAlert?: string;
}

export interface AlertSubscription {
    ticker: string;
    assetClass: AssetClass;
    emailEnabled: boolean;
    pushEnabled: boolean;
    signalChange: boolean;
    priceBreakout: boolean;
    regimeShift: boolean;
    dailyDigest: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ArchiveSnapshot {
    reportId: string;
    ticker: string;
    company: string;
    assetClass: AssetClass;
    signal: SignalType;
    confidence: number;
    regime: string;
    sector: string;
    engineVersion: string;
    generatedAt: string;
    priceAtGen: number;
    source?: string;
    url: string;
    hasRestatement?: boolean;
    restatementNote?: string;
}

export interface AccuracyRow {
    label: string;
    count: number;
    avgReturnPct: number;
    avgExcessPct: number | null;
    winRate: number | null;
}

export interface AccuracySummary {
    resolvedCount: number;
    pendingCount: number;
    unlockThreshold: number;
    engineInception: string | null;
    lastUpdated: string | null;
    methodologyNote: string;
    overallAvgReturnPct: number | null;
    overallWinRate: number | null;
    bestEngine: string | null;
    bySignal: AccuracyRow[];
    byEngine: AccuracyRow[];
    byRegime: AccuracyRow[];
    bySector: AccuracyRow[];
    byMarketCap: AccuracyRow[];
}

// ─── Screener ────────────────────────────────────────────────────────────────

export interface ScreenerFilters {
    signal?: SignalType[];
    minConfidence?: number;
    regime?: RegimeLabel[];
    sector?: string[];
    minMarketCap?: number;
    maxMarketCap?: number;
    minEarningsDays?: number;
    minFactorScore?: number;
    minMomentum?: number;
    maxVar?: number;
    assetClass?: AssetClass[];
}

export interface ScreenerResult {
    ticker: string;
    name: string;
    assetClass: AssetClass;
    signal: SignalType;
    confidence: number;
    regime: RegimeLabel;
    forecast: string;
    sector?: string;
}

// ─── Portfolio ───────────────────────────────────────────────────────────────

export interface PortfolioHolding {
    ticker: string;
    weight: number; // 0-100
}

export interface PortfolioAnalysis {
    total_regime_exposure: Record<string, number>;
    aggregate_signal: SignalType;
    aggregate_confidence: number;
    portfolio_var: string;
    sharpe_ratio: number;
    diversification_score: number;
    top_risks: string[];
    knowledge_graph_risks: string[];
    earnings_calendar: Array<{ ticker: string; days: number }>;
    holdings_analysis: Array<{
        ticker: string;
        signal: SignalType;
        confidence: number;
        regime: RegimeLabel;
        var_contribution: string;
    }>;
}

// ─── Deep Dive ───────────────────────────────────────────────────────────────

export interface DeepDiveModule {
    id: number;
    title: string;
    status: 'idle' | 'loading' | 'ready';
    content?: string;
}

// ─── App State ───────────────────────────────────────────────────────────────

export type AppView = 'hero' | 'report' | 'watchlist' | 'screener' | 'portfolio' | 'comparison';

export interface AppState {
    view: AppView;
    ticker: string;
    secondTicker?: string;
    assetClass?: AssetClass;
    report?: ReportData;
    insights: InsightCard[];
    isGenerating: boolean;
    showWelcomeCard: boolean;
    error?: string;
    lightMode: boolean;
}
