import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MethodologyProps {
    lightMode?: boolean;
}

interface Section {
    id: string;
    title: string;
    content: React.ReactNode;
}

// ─── Accordion section ────────────────────────────────────────────────────────

function AccordionSection({ section, lightMode }: { section: Section; lightMode?: boolean }) {
    const [open, setOpen] = useState(false);
    const tp = lightMode ? '#0F172A' : '#F9FAFB';
    const ts = lightMode ? '#475569' : '#9CA3AF';
    const bg = lightMode ? 'rgba(255,255,255,0.9)' : '#111827';
    const border = lightMode ? '#E2E8F0' : '#1F2937';

    return (
        <div className="rounded-xl overflow-hidden mb-3" style={{ background: bg, border: `1px solid ${border}` }}>
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
            >
                <span className="font-semibold text-sm" style={{ color: tp }}>{section.title}</span>
                {open ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: '#6B7280' }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#6B7280' }} />}
            </button>
            {open && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-5 text-sm leading-relaxed space-y-3"
                    style={{ color: ts, borderTop: `1px solid ${border}` }}
                >
                    <div className="pt-4">{section.content}</div>
                </motion.div>
            )}
        </div>
    );
}

// ─── Content blocks ───────────────────────────────────────────────────────────

const SECTIONS: Section[] = [
    {
        id: 'regime',
        title: '1. Regime Detection Methodology',
        content: (
            <div className="space-y-3">
                <p>Quantus classifies market conditions into five regimes before any signal is generated. Regime determines which models are active, which strategies are recommended, and how position sizing is calibrated.</p>
                <ul className="space-y-2 pl-4">
                    {[
                        ['Strong Uptrend (>15% 30d gain)', 'Momentum dominant. Mean reversion suppressed. Trend-following strategies active.'],
                        ['Uptrend (5–15% 30d gain)', 'Moderate momentum. Some reversion opportunity. Both momentum and value signals active.'],
                        ['Sideways (±5% 30d)', 'Range-bound. Mean reversion active. Options strategies gain priority.'],
                        ['Downtrend (<−15% 30d)', 'Bearish momentum. Defensive posture. Pairs trading and short considerations.'],
                        ['High Volatility (annualised vol >30%)', 'Regime-agnostic. Position sizing reduced by 40%. All risk metrics take precedence.'],
                    ].map(([label, desc]) => (
                        <li key={label}>
                            <span className="font-semibold text-blue-400">{label}:</span> {desc}
                        </li>
                    ))}
                </ul>
                <p className="text-xs opacity-60">Data: 30-day price return (Yahoo Finance, live), annualised volatility (60-day rolling standard deviation of daily returns). Regime is recalculated on every report generation.</p>
            </div>
        ),
    },
    {
        id: 'models',
        title: '2. The 12 Quantitative Models',
        content: (
            <div className="space-y-4">
                {[
                    { n: '1. ARIMA (AutoRegressive Integrated Moving Average)', d: 'Captures linear time-series dependencies. Weight: 20% in ensemble. Best suited for stable, mean-reverting price series. Limitation: assumes stationarity — degrades in trending regimes.', t: 'Time series analysis' },
                    { n: '2. Prophet (Facebook/Meta)', d: 'Handles seasonality and calendar effects automatically. Weight: 35%. Best suited for assets with strong weekly or annual seasonality (e.g. commodities, retail equities). Limitation: struggles with structural breaks.', t: 'Seasonality-aware forecasting' },
                    { n: '3. LSTM (Long Short-Term Memory)', d: 'Learns non-linear temporal relationships. Weight: 45% — highest due to superior regime adaptability. Trained on 10 years of daily OHLCV data. Limitation: computationally intensive; requires GPU inference for real-time use.', t: 'Deep learning' },
                    { n: '4. Mean Reversion (Ornstein-Uhlenbeck)', d: 'Models the speed and magnitude of reversion to a long-run mean. Outputs: half-life in days, Z-score, entry and exit levels. Calibrated on 252-day rolling window.', t: 'Statistical arbitrage' },
                    { n: '5. Sentiment Composite', d: 'Credibility-weighted combination of Grok/X firehose (50%), Reddit NLP (25%), NewsAPI (25%). Campaign detection algorithm down-weights coordinated inauthentic activity.', t: 'Alternative data' },
                    { n: '6. Portfolio Optimization (Mean-Variance)', d: 'Computes efficient frontier allocation given current holdings. Outputs: optimal weight, Sharpe improvement, correlation impact. Relies on 60-day covariance matrix.', t: 'Portfolio theory' },
                    { n: '7. SHAP Feature Importance', d: 'Explains which sub-signals contributed most to the final recommendation using SHapley Additive exPlanations. Presented as a ranked waterfall chart. Auditable by design.', t: 'Model explainability' },
                    { n: '8. High-Frequency Signal', d: 'Intraday momentum derived from VWAP deviation, bid-ask spread dynamics, and tick-level volume divergence. Useful for timing entry/exit within a day.', t: 'Microstructure' },
                    { n: '9. VaR & Risk Management', d: 'Historical Simulation VaR (99%, 1-day), Expected Shortfall, and three macro stress scenarios (2008 GFC −45%, COVID −30%, Inflation 2022 −35%). All figures beta-scaled to the specific ticker.', t: 'Risk management' },
                    { n: '10. Options Pricing & Greeks', d: 'Black-Scholes pricing, full Greeks surface (Delta, Gamma, Vega, Theta, Rho), IV Rank vs 52-week range, and implied 30-day move. Available for liquid equity options.', t: 'Derivatives' },
                    { n: '11. Reinforcement Learning Agent', d: 'PPO (Proximal Policy Optimisation) agent trained on 10 years of historical data with transaction cost simulation. Outputs current allocation recommendation. Not used as primary signal — advisory only.', t: 'AI agent' },
                    { n: '12. Factor Investing (Barra-style)', d: 'Decomposes returns into Value, Momentum, Quality, Low-Volatility, and Size factors. Shows which factors explain recent performance and whether the current regime favours each.', t: 'Factor analysis' },
                ].map(m => (
                    <div key={m.n} className="border-l-2 pl-3" style={{ borderColor: '#2D3748' }}>
                        <div className="font-semibold text-xs mb-0.5">{m.n}</div>
                        <div className="text-xs opacity-70 mb-1 uppercase tracking-wider">{m.t}</div>
                        <div>{m.d}</div>
                    </div>
                ))}
            </div>
        ),
    },
    {
        id: 'ensemble',
        title: '3. Model Ensemble Weighting',
        content: (
            <div className="space-y-3">
                <p>Meridian v2.4 weights the three core forecasting models as follows: LSTM 45%, Prophet 35%, ARIMA 20%. Weights were determined by walk-forward backtesting across 2018–2024 on 400+ equities, 15 crypto assets, and 8 commodity futures.</p>
                <p>When all three models agree directionally, the confidence score's "model ensemble agreement" sub-component receives its full 15 points. When two of three agree, it receives 10. Full disagreement contributes 5, and a data_caveat is appended noting the divergence.</p>
                <p>Regime context modulates weights in real time: LSTM weight increases to 55% in trending regimes (where non-linearity adds more signal); ARIMA weight increases to 30% in sideways regimes where linear AR structure is more appropriate.</p>
            </div>
        ),
    },
    {
        id: 'grok',
        title: '4. Grok API Privileged Firehose Access',
        content: (
            <div className="space-y-3">
                <p>Quantus Investing accesses the Grok API's full-fidelity X (Twitter) firehose — not the Standard API's filtered, sampled subset. This means every public post is processed in real time, including posts from verified institutional accounts that are most predictive of market direction.</p>
                <p><strong>Credibility weighting:</strong> Posts from accounts with "Verified Organisation" status contribute 3× the weight of unverified accounts. Accounts with a finance-industry bio verified by Grok contribute 2×. Anonymous accounts contribute 1×.</p>
                <p><strong>Campaign detection:</strong> Quantus Investing uses coordinated pattern detection (post timing, cross-account linguistic similarity) to identify and down-weight potential market manipulation campaigns. When detected, a data_caveat is appended.</p>
                <p className="text-xs opacity-60">Limitation: Grok API is a Tier C data source (medium credibility) for final signal construction. Sentiment is advisory — it cannot override Tier A sources (SEC EDGAR, FRED).</p>
            </div>
        ),
    },
    {
        id: 'altdata',
        title: '5. Alternative Data Sources & Credibility Tiers',
        content: (
            <div className="space-y-3">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="text-left border-b" style={{ borderColor: '#374151' }}>
                            <th className="pb-2 font-semibold">Tier</th>
                            <th className="pb-2 font-semibold">Sources</th>
                            <th className="pb-2 font-semibold">Credibility</th>
                            <th className="pb-2 font-semibold">Use</th>
                        </tr>
                    </thead>
                    <tbody className="space-y-2">
                        {[
                            ['A', 'SEC EDGAR, FRED, CBOE', 'Highest', 'Fundamental anchors — override lower tiers'],
                            ['B', 'Yahoo Finance / yfinance, Financial Modeling Prep', 'High', 'Price, earnings, fundamentals'],
                            ['C', 'Grok/X, Reddit, NewsAPI', 'Medium', 'Sentiment only — never standalone signal'],
                        ].map(([tier, sources, cred, use]) => (
                            <tr key={tier} className="border-b" style={{ borderColor: '#1F2937' }}>
                                <td className="py-2 font-bold" style={{ color: tier === 'A' ? '#10B981' : tier === 'B' ? '#3B82F6' : '#9CA3AF' }}>Tier {tier}</td>
                                <td className="py-2">{sources}</td>
                                <td className="py-2">{cred}</td>
                                <td className="py-2">{use}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p>No Tier C source can produce a BUY or STRONG BUY signal in isolation. All sentiment signals require corroboration from at least one Tier A or Tier B source to contribute to the final recommendation.</p>
            </div>
        ),
    },
    {
        id: 'confidence',
        title: '6. Confidence Score Composition',
        content: (
            <div className="space-y-3">
                <p>The confidence score (0–100) is a weighted composite of seven sub-signals, each calibrated to their maximum attainable value:</p>
                <div className="space-y-2">
                    {[
                        ['Momentum (RSI, MACD, regime alignment)', '20%'],
                        ['Sentiment (Grok/X, Reddit, News credibility-weighted)', '15%'],
                        ['Regime Alignment (signal consistent with current regime)', '15%'],
                        ['Model Ensemble Agreement (ARIMA + Prophet + LSTM)', '15%'],
                        ['Alternative Data (13F, insider, IV rank)', '15%'],
                        ['Macro Context (Fed rate, yield curve, VIX, credit spreads)', '10%'],
                        ['Data Quality (freshness, completeness, circuit breakers)', '10%'],
                    ].map(([label, weight]) => (
                        <div key={label} className="flex items-start justify-between gap-4">
                            <span className="flex-1">{label}</span>
                            <span className="font-mono font-bold flex-shrink-0" style={{ color: '#6366F1' }}>{weight}</span>
                        </div>
                    ))}
                </div>
                <p className="text-xs opacity-60">When a circuit breaker activates (data source unavailable), the corresponding sub-weight is reduced proportionally and a data_caveat is appended. A score of 60+ with a data quality score of 5/10 should be interpreted differently from 60+ with data quality 9/10.</p>
            </div>
        ),
    },
    {
        id: 'knowledge-graph',
        title: '7. Knowledge Graph & Cross-Ticker Intelligence',
        content: (
            <div className="space-y-3">
                <p>Quantus maintains a supply chain and competitive relationship graph across the equity universe. When a material event affects one node (e.g. a TSMC capacity constraint), all downstream nodes (NVIDIA, Apple, Qualcomm) receive a cross-ticker alert within the same report cycle.</p>
                <p>The graph is constructed from SEC EDGAR supplier disclosures, earnings call transcript NLP, and 13F institutional holding overlaps. Relationships are weighted by revenue exposure — a company where Supplier X represents 40% of COGS receives a higher-priority alert than one at 5%.</p>
                <p>Cross-ticker alerts appear as amber banners on the Welcome Card and are included in the daily digest email. They do not automatically change the primary signal — they are advisory context.</p>
            </div>
        ),
    },
    {
        id: 'shared',
        title: '8. Shared Report Model & Meridian Versioning',
        content: (
            <div className="space-y-3">
                <p>Every report generated by Quantus Investing is stored in Redis with a 96-hour TTL and immediately available to all researchers requesting the same ticker. This is the Shared Intelligence Model — one expensive computation, shared across the entire community.</p>
                <p><strong>Meridian v2.4</strong> is the current production prompt version. Meridian v2.3 is available in the Historical Archive for comparison. Earlier versions (Atlas) had lower directional accuracy (61% vs Meridian's 67%) and are marked in the archive. Version identifiers are immutable and cryptographically bound to each report_id.</p>
                <p><strong>Cache invalidation triggers:</strong> Equity price move {'>'}5%, crypto price move {'>'}8%, FRED macro data update, FMP earnings release, or Polygon options flow spike. Manual invalidation available to Institutional clients.</p>
            </div>
        ),
    },
    {
        id: 'feedback',
        title: '9. User Feedback & Signal Quality Improvement',
        content: (
            <div className="space-y-3">
                <p>Every Deep Dive module and narrative section includes 👍 / 👎 feedback buttons. Feedback is anonymised and aggregated — your individual rating is never exposed to other users.</p>
                <p>Feedback signals feed into two improvement loops: (1) prompt weighting — sections receiving systematic 👎 are flagged for human review and prompt refinement in the next Meridian version; (2) confidence calibration — when 👍/👎 patterns diverge from actual price outcomes, the corresponding sub-signal weights are adjusted in the next calibration cycle.</p>
                <p>Institutional clients can annotate reports with private notes. These annotations are never shared with other users or used in aggregate feedback loops.</p>
            </div>
        ),
    },
    {
        id: 'compliance',
        title: '10. Regulatory Compliance by Jurisdiction',
        content: (
            <div className="space-y-3">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="text-left border-b" style={{ borderColor: '#374151' }}>
                            <th className="pb-2 font-semibold">Jurisdiction</th>
                            <th className="pb-2 font-semibold">Disclaimer Standard</th>
                            <th className="pb-2 font-semibold">Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['United States', 'Not investment advice. Not a registered investment adviser.', 'SEC Rule 202(a)(11) research carve-out applies.'],
                            ['United Kingdom', 'Financial promotion approved for professional investors. FCA consideration.', 'FSMA 2000 s.21 applies. Retail distribution requires FCA authorisation.'],
                            ['European Union', 'MiFID II Article 24 disclosure. Not PRIIP-compliant for retail.', 'Available to elective professional clients under MiFID II.'],
                            ['Global / Other', 'For informational purposes only. Not investment advice.', 'Institutional use presumed outside above jurisdictions.'],
                        ].map(([j, d, n]) => (
                            <tr key={j} className="border-b" style={{ borderColor: '#1F2937' }}>
                                <td className="py-2 font-semibold">{j}</td>
                                <td className="py-2">{d}</td>
                                <td className="py-2 opacity-60">{n}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className="text-xs opacity-60">Disclaimer text is automatically selected based on the user's jurisdiction setting. Jurisdiction is set at account creation and can be updated in settings. All emails and PDF exports carry the appropriate jurisdiction-specific disclaimer.</p>
            </div>
        ),
    },
    {
        id: 'audit',
        title: '11. Audit Trail & Data Lineage',
        content: (
            <div className="space-y-3">
                <p>Every report carries a full audit object containing: prompt version (Meridian v2.4), Python model versions for each of the 12 modules, data quality scores per source, circuit breakers activated during generation, and fallbacks used.</p>
                <p>Data lineage is traceable from the final signal back to every raw data point used. The audit object is accessible via the API and displayed in the report footer. Report IDs are UUID4-based, globally unique, and bound to the specific payload that generated them — re-running with the same payload but a different Claude temperature would produce a new report_id.</p>
                <p>Historical audit records are retained for 7 years for Institutional clients in compliance with MiFID II record-keeping requirements.</p>
            </div>
        ),
    },
];

// ─── Main Methodology page ────────────────────────────────────────────────────

export function Methodology({ lightMode }: MethodologyProps) {
    const bg = lightMode ? '#F0F4FF' : '#0A0D14';
    const tp = lightMode ? '#0F172A' : '#F9FAFB';
    const ts = lightMode ? '#475569' : '#9CA3AF';

    return (
        <div style={{ background: bg, minHeight: '100vh', padding: '48px 24px' }}>
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
                        style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#3B82F6' }}>
                        Methodology Documentation · Meridian v2.4
                    </div>
                    <h1 className="text-4xl font-bold mb-4" style={{ color: tp }}>How Quantus Investing Works</h1>
                    <p className="text-lg leading-relaxed" style={{ color: ts }}>
                        Plain-English documentation of the models, data sources, and analytical framework behind every Quantus Investing report.
                        Written for portfolio managers and executives — no raw code, no jargon.
                    </p>
                    <div className="mt-4 p-4 rounded-xl text-sm" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}>
                        ⚠️ Quantus Investing reports are for informational purposes only and do not constitute investment advice.
                        Past signal performance does not guarantee future results.
                    </div>
                </motion.div>

                {/* Accordion sections */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                    {SECTIONS.map(section => (
                        <AccordionSection key={section.id} section={section} lightMode={lightMode} />
                    ))}
                </motion.div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t text-xs text-center" style={{ borderColor: '#1F2937', color: '#6B7280' }}>
                    <p>Quantus Research Solutions · BI Solutions Group (bisolutions.group)</p>
                    <p className="mt-1">Powered by Meridian v2.4 · Model accuracy audited quarterly · Last updated Feb 2026</p>
                </div>
            </div>
        </div>
    );
}
