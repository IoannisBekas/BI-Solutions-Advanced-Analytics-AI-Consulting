import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { getMockReport } from './data/mockReports.js';
import { getAssetByTicker, getWorkspaceStatus, getWorkspaceSummary, searchAssets } from './data/assetUniverse.js';
import type { AssetEntry, ReportData, ReportResponse } from '../src/types/index.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

// ─── SHARED SQLITE DATABASE ─────────────────────────────────────────────────
// Re-use the same database file the main server creates
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), '..', 'data');
if (!fs.existsSync(DATA_DIR)) { fs.mkdirSync(DATA_DIR, { recursive: true }); }
const qdb = new Database(path.join(DATA_DIR, 'bisolutions.db'));
qdb.pragma('journal_mode = WAL');
qdb.pragma('foreign_keys = ON');
qdb.pragma('busy_timeout = 5000');

// Ensure users table exists (idempotent — same schema as server/db.ts)
qdb.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    tier          TEXT NOT NULL DEFAULT 'FREE',
    credits       REAL NOT NULL DEFAULT 0,
    reports_this_month INTEGER NOT NULL DEFAULT 0,
    jurisdiction  TEXT NOT NULL DEFAULT 'US',
    referral_token TEXT UNIQUE,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_referral ON users(referral_token);
`);

interface DbUser {
  id: string; email: string; name: string; password_hash: string;
  tier: string; credits: number; reports_this_month: number;
  jurisdiction: string; referral_token: string | null;
  created_at: string; updated_at: string;
}

const dbStmts = {
  findByEmail: qdb.prepare<[string], DbUser>('SELECT * FROM users WHERE email = ? COLLATE NOCASE'),
  findById: qdb.prepare<[string], DbUser>('SELECT * FROM users WHERE id = ?'),
  findByReferral: qdb.prepare<[string], DbUser>('SELECT * FROM users WHERE referral_token = ?'),
  insert: qdb.prepare<[string, string, string, string, number, string]>(
    `INSERT INTO users (id, email, name, password_hash, credits, referral_token) VALUES (?, ?, ?, ?, ?, ?)`
  ),
  updateCredits: qdb.prepare<[number, string]>('UPDATE users SET credits = ?, updated_at = datetime(\'now\') WHERE id = ?'),
};

function stripPasswordHash(u: DbUser) {
  const { password_hash: _, ...safe } = u;
  return safe;
}

const SALT_ROUNDS = 12;

const app = express();
const API_PREFIX = '/quantus/api';
const isProduction = process.env.NODE_ENV === 'production';

const JWT_SECRET = process.env.JWT_SECRET || (isProduction ? '' : 'quantus-dev-secret');
if (isProduction && !JWT_SECRET) {
  console.error('FATAL: JWT_SECRET env var is required in production');
  process.exit(1);
}
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');

// ─── SECURITY MIDDLEWARE ────────────────────────────────────────────────────
app.disable('x-powered-by');
app.use(
    helmet({
        contentSecurityPolicy: isProduction
            ? {
                useDefaults: true,
                directives: {
                    "img-src": ["'self'", 'data:', 'https:'],
                    "script-src": ["'self'", "'unsafe-inline'"],
                    "style-src": ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
                    "font-src": ["'self'", 'data:', 'https://fonts.gstatic.com'],
                    "connect-src": ["'self'", ...ALLOWED_ORIGINS],
                },
            }
            : false,
        crossOriginEmbedderPolicy: false,
    }),
);
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// ─── RATE LIMITING ──────────────────────────────────────────────────────────
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Too many requests — try again later.' } });
const generateLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Generation rate limit reached — try again in a few minutes.' } });
app.use(`${API_PREFIX}/`, generalLimiter);
app.use(`${API_PREFIX}/generate`, generateLimiter);
app.use(`${API_PREFIX}/deepdive`, generateLimiter);

// ─── INPUT SANITIZATION ─────────────────────────────────────────────────────
const TICKER_REGEX = /^[A-Za-z0-9.=^_-]{1,20}$/;
const ASSET_CLASSES = ['EQUITY', 'CRYPTO', 'COMMODITY', 'ETF'];

function sanitizeTicker(raw: unknown): string | null {
    if (typeof raw !== 'string') return null;
    const trimmed = raw.trim().toUpperCase();
    return TICKER_REGEX.test(trimmed) ? trimmed : null;
}

function sanitizeAssetClass(raw: unknown): string {
    if (typeof raw !== 'string') return 'EQUITY';
    const upper = raw.trim().toUpperCase();
    return ASSET_CLASSES.includes(upper) ? upper : 'EQUITY';
}

// ─── AUTH MIDDLEWARE (JWT) ───────────────────────────────────────────────────
interface JWTPayload {
    userId: string;
    email: string;
    tier: string;
    name?: string;
    credits?: number;
    reportsThisMonth?: number;
    jurisdiction?: 'US' | 'UK' | 'EU' | 'GLOBAL';
}

interface AuthenticatedRequest extends express.Request {
    user?: JWTPayload;
}

function optionalAuth(req: AuthenticatedRequest, _res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        try {
            const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET) as JWTPayload;
            req.user = decoded;
        } catch { /* invalid token — proceed as anonymous */ }
    }
    next();
}

app.use(optionalAuth);

// ─── AUTH ENDPOINTS (real SQLite-backed) ────────────────────────────────────
app.post(`${API_PREFIX}/auth/login`, async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) { res.status(400).json({ error: 'Email and password required' }); return; }

        const user = dbStmts.findByEmail.get(email);
        if (!user) { res.status(401).json({ error: 'Invalid email or password' }); return; }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) { res.status(401).json({ error: 'Invalid email or password' }); return; }

        const token = jwt.sign({
            userId: user.id,
            email: user.email,
            name: user.name,
            tier: user.tier,
            credits: user.credits,
            reportsThisMonth: user.reports_this_month,
            jurisdiction: user.jurisdiction,
        }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: stripPasswordHash(user) });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post(`${API_PREFIX}/auth/register`, async (req, res) => {
    try {
        const { email, name, password, referralToken } = req.body;
        if (!email || !name || !password) { res.status(400).json({ error: 'Email, name, and password required' }); return; }
        if (typeof password !== 'string' || password.length < 8) { res.status(400).json({ error: 'Password must be at least 8 characters' }); return; }

        const existing = dbStmts.findByEmail.get(email);
        if (existing) { res.status(409).json({ error: 'An account with this email already exists' }); return; }

        // Handle referral bonus
        let bonusCredits = 0;
        if (referralToken && typeof referralToken === 'string') {
            const referrer = dbStmts.findByReferral.get(referralToken);
            if (referrer) {
                bonusCredits = 5;
                dbStmts.updateCredits.run(referrer.credits + 3, referrer.id);
            }
        }

        const userId = `usr_${crypto.randomBytes(6).toString('hex')}`;
        const myReferralToken = `ref_${crypto.randomBytes(8).toString('hex')}`;
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        dbStmts.insert.run(userId, email, name, passwordHash, bonusCredits, myReferralToken);
        const user = dbStmts.findById.get(userId)!;

        const token = jwt.sign({
            userId: user.id,
            email: user.email,
            name: user.name,
            tier: user.tier,
            credits: user.credits,
            reportsThisMonth: user.reports_this_month,
            jurisdiction: user.jurisdiction,
        }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token, user: stripPasswordHash(user) });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.get(`${API_PREFIX}/auth/me`, (req: AuthenticatedRequest, res) => {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    // Re-fetch from DB for fresh data
    const user = dbStmts.findById.get(req.user.userId);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(stripPasswordHash(user));
});

// Lazy AI client — don't throw at startup if key not set yet
function getAI() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY not set — set it in .env.local to enable AI generation');
    return new GoogleGenAI({ apiKey: key });
}


// ─── GET CACHED MOCK REPORT ──────────────────────────────────────────────────
app.get(`${API_PREFIX}/report/:ticker`, (req, res) => {
    const ticker = sanitizeTicker(req.params.ticker);
    if (!ticker) { res.status(400).json({ error: 'Invalid ticker format' }); return; }

    const asset = getAssetByTicker(ticker) ?? {
        ticker,
        name: ticker,
        exchange: 'Manual input',
        assetClass: 'EQUITY',
        sector: 'Unclassified',
        hasCachedReport: false,
        researcherCount: 0,
    } satisfies AssetEntry;

    const report = getMockReport(ticker);
    if (report) {
        const response: ReportResponse = {
            report,
            source: 'cached',
            ticker,
            message: 'Cached Quantus coverage loaded.',
            detail: `Shared Quantus coverage is available for ${ticker} and can be bookmarked or shared directly.`,
            freshness: report.cache_age,
            status: getWorkspaceStatus(),
        };

        res.json(response);
        return;
    }

    const response: ReportResponse = {
        report: buildStarterReport(asset),
        source: 'starter',
        ticker,
        message: 'No cached Quantus coverage yet.',
        detail: 'You are viewing a starter shell seeded from directory metadata only. Quantitative sections stay conservative until live services are connected.',
        freshness: 'On demand',
        status: getWorkspaceStatus(),
    };

    res.json(response);
});

app.get(`${API_PREFIX}/workspace/summary`, (_req, res) => {
    res.json(getWorkspaceSummary());
});

app.get(`${API_PREFIX}/assets/search`, (req, res) => {
    const query = typeof req.query.q === 'string' ? req.query.q.slice(0, 60) : '';
    const requestedLimit = Number.parseInt(String(req.query.limit ?? '6'), 10);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 12) : 6;

    res.json({
        query,
        results: searchAssets(query, limit),
        status: getWorkspaceStatus(),
    });
});

app.get(`${API_PREFIX}/assets/:ticker`, (req, res) => {
    const ticker = typeof req.params.ticker === 'string' ? req.params.ticker.slice(0, 30) : '';
    const asset = getAssetByTicker(ticker);

    if (!asset) {
        res.status(404).json({ error: 'Asset not found' });
        return;
    }

    res.json({
        asset,
        status: getWorkspaceStatus(),
    });
});

// ─── GENERATE REPORT (STREAMING NARRATIVE) ──────────────────────────────────
app.post(`${API_PREFIX}/generate`, async (req, res) => {
    try {
        const ticker = sanitizeTicker(req.body.ticker);
        const assetClass = sanitizeAssetClass(req.body.assetClass);
        if (!ticker) {
            res.status(400).json({ error: 'Valid ticker is required (1-20 alphanumeric chars)' });
            return;
        }

        // Check for cached mock report
        const mockReport = getMockReport(ticker);

        if (mockReport) {
            // Return the full cached report immediately
            res.json({ cached: true, report: mockReport });
            return;
        }

        // Generate narrative via Gemini for unknown tickers
        const section = typeof req.body.section === 'string' ? req.body.section.slice(0, 50) : 'executive_summary';
        const systemPrompt = getSystemPromptForClass(assetClass);
        const sectionPrompt = getSectionPrompt(ticker, section);

        const stream = await getAI().models.generateContentStream({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: `${systemPrompt}\n\n${sectionPrompt}`,
        });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of stream) {
            if (chunk.text) {
                res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// ─── STREAMING INSIGHT FEED ───────────────────────────────────────────────────
app.post(`${API_PREFIX}/insights`, async (req, res) => {
    try {
        const ticker = sanitizeTicker(req.body.ticker);
        const assetClass = sanitizeAssetClass(req.body.assetClass);
        if (!ticker) {
            res.status(400).json({ error: 'Valid ticker is required' });
            return;
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Generate synthetic insight cards for the progressive feed
        const insights = getInsightCards(ticker, assetClass);

        for (const insight of insights) {
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
            res.write(`data: ${JSON.stringify(insight)}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('Error streaming insights:', error);
        res.status(500).end();
    }
});

// ─── DEEP DIVE ────────────────────────────────────────────────────────────────
app.post(`${API_PREFIX}/deepdive`, async (req, res) => {
    try {
        const ticker = sanitizeTicker(req.body.ticker);
        const moduleIndex = typeof req.body.module === 'number' ? Math.min(Math.max(Math.floor(req.body.module), 0), 11) : null;
        const assetClass = sanitizeAssetClass(req.body.assetClass);
        if (!ticker || moduleIndex === null) {
            res.status(400).json({ error: 'Valid ticker and module index (0-11) required' });
            return;
        }

        const prompt = getDeepDivePrompt(ticker, moduleIndex, assetClass);

        const stream = await getAI().models.generateContentStream({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: prompt,
        });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of stream) {
            if (chunk.text) {
                res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('Error generating deep dive:', error);
        res.status(500).json({ error: 'Failed to generate deep dive' });
    }
});

// ─── SCREENER ────────────────────────────────────────────────────────────────
app.post(`${API_PREFIX}/screener`, (req, res) => {
    const { filters } = req.body;
    // Return mock screener results
    const results = getMockScreenerResults(filters || {});
    res.json({ results });
});

// ─── PORTFOLIO ───────────────────────────────────────────────────────────────
app.post(`${API_PREFIX}/portfolio`, (req, res) => {
    const { holdings } = req.body;
    if (!holdings || !Array.isArray(holdings)) {
        res.status(400).json({ error: 'Holdings array required' });
        return;
    }
    const analysis = getMockPortfolioAnalysis(holdings);
    res.json(analysis);
});

// ─── IDENTIFY (legacy endpoint — kept for compat) ────────────────────────────
app.post(`${API_PREFIX}/identify`, async (req, res) => {
    const ticker = sanitizeTicker(req.body.ticker);
    if (!ticker) { res.status(400).json({ error: 'Valid ticker required' }); return; }
    const CRYPTO_TICKERS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX'];
    const COMMODITY_TICKERS = ['GC=F', 'CL=F', 'SI=F', 'NG=F', 'HG=F'];
    const ETF_TICKERS = ['SPY', 'QQQ', 'IWM', 'GLD', 'ARKK', 'VTI', 'VOO'];
    const t = ticker;
    if (CRYPTO_TICKERS.some(c => t.startsWith(c))) { res.json({ industry: 'Crypto', assetClass: 'CRYPTO' }); return; }
    if (COMMODITY_TICKERS.includes(t)) { res.json({ industry: 'Commodity', assetClass: 'COMMODITY' }); return; }
    if (ETF_TICKERS.includes(t)) { res.json({ industry: 'ETF', assetClass: 'ETF' }); return; }
    res.json({ industry: 'Tech', assetClass: 'EQUITY' });
});


app.post(`${API_PREFIX}/v1/push/subscribe`, (_req, res) => {
    res.json({ ok: true });
});

app.post(`${API_PREFIX}/v1/push/unsubscribe`, (_req, res) => {
    res.json({ ok: true });
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getSystemPromptForClass(assetClass: string): string {
    return `You are Quantus Engine Meridian v2.4 — a world-class quantitative trading analyst.
Generate concise, authoritative institutional research narrative. House style rules:
- Zero filler phrases. Every sentence earns its place.
- BANNED VOCABULARY: Do NOT use the phrases "it's worth noting", "it is important to remember", "needless to say", "as we can see", or "it should be noted".
- Lead with the metric, follow with its implication.
- Express risk in dollars per $10,000 invested.
- No false precision — max 2 decimal places.
- Answer "so what?" for every data point. Ensure the output is immediately actionable.
- Asset class: ${assetClass}
- Audience: Portfolio managers and institutional analysts. No code, ever.`;
}

function getSectionPrompt(ticker: string, section: string): string {
    return `Generate a ${section} research narrative for ${ticker}.
Write 3–4 concise paragraphs covering the market regime, key signals, risks, and strategic implication.
Be specific with data references. Do not include code or tables — prose narrative only.
End with a clear directional signal and confidence level.`;
}

function getDeepDivePrompt(ticker: string, moduleIndex: number, assetClass: string): string {
    const modules = [
        'Time Series Forecasting — compare LSTM, Prophet, and ARIMA model approaches, their weights, and what regime conditions each model excels in',
        'Mean Reversion Strategy — Z-score bands, entry/exit thresholds, half-life analysis, and regime-gating rationale',
        'Sentiment Analysis — decompose Grok/X, Reddit, and news sentiment signals, lag analysis, and credibility weighting methodology',
        'Portfolio Optimization — efficient frontier positioning, Sharpe improvement from this asset, correlation matrix implications',
        'ML Feature Importance — which signals drive the model (SHAP-equivalent verbal analysis), feature stability across regimes',
        'High-Frequency Signal Detection — order flow, bid-ask dynamics, and intraday momentum signals',
        'Risk Management & VaR — expanded Monte Carlo methodology, macro overlay, stress test interpretation, and tail risk analysis',
        'Options Pricing & Greeks — implied volatility surface, delta hedging rationale, gamma exposure, and earnings vol implications',
        'Pairs Trading Cointegration — identify the best pairs, cointegration rationale, spread dynamics, and entry/exit mechanics',
        'ML Backtesting Framework — regime-segmented performance, overfitting safeguards, and walk-forward validation results',
        'Reinforcement Learning Agent — training approach, reward function design, and regime-segmented performance breakdown',
        'Factor Investing Model — factor attribution, peer-relative quintile scores, and factor timing considerations',
    ];

    const moduleName = modules[moduleIndex] || modules[0];
    return `You are Quantus Engine Meridian v2.4. Generate a Deep Dive analysis for ${ticker} (${assetClass}).
Topic: ${moduleName}
Write 4–6 paragraphs of expert-level analysis. Include specific metrics, model behavior, risk implications, and actionable takeaways.
Reference regime context throughout. No code, no tables — institutional prose narrative only.
Conclude with a 1-sentence "Bottom line for portfolio managers:" statement.`;
}

function getInsightCards(ticker: string, assetClass: string) {
    const isEquity = assetClass === 'EQUITY';
    const isCrypto = assetClass === 'CRYPTO';
    const isCommodity = assetClass === 'COMMODITY';

    const cards = [
        { id: '1', category: 'momentum', text: `${ticker}: Fetching OHLCV data — 180 trading days loaded. Technical indicators computing.` },
        { id: '2', category: 'model', text: `Regime detection running — HMM analysis on daily returns. Volatility clustering in progress.` },
        { id: '3', category: 'sentiment', text: `X sentiment via Grok API: query dispatched. Credibility weighting and bot filter active.` },
        { id: '4', category: 'risk', text: `Monte Carlo VaR: 10,000 simulation paths generated. 99% confidence interval computing.` },
        { id: '5', category: 'model', text: `LSTM, Prophet, ARIMA ensemble running. Regime-adjusted weights calculating.` },
        ...(isEquity ? [
            { id: '6', category: 'institutional', text: `13F institutional holdings: latest quarter loaded. Net flow delta computing.` },
            { id: '7', category: 'altdata', text: `Earnings call NLP: transcript scoring against Quantus corpus of 8,400+ calls.` },
            { id: '8', category: 'event', text: `Earnings calendar: checking options-implied move for upcoming event risk.` },
        ] : []),
        ...(isCrypto ? [
            { id: '6', category: 'altdata', text: `On-chain data: exchange net flows and MVRV Z-score loading from Glassnode.` },
            { id: '7', category: 'altdata', text: `Fear & Greed Index: ${Math.floor(55 + Math.random() * 30)} — Greed territory. Funding rate: checking perpetuals.` },
            { id: '8', category: 'risk', text: `Liquidation clusters: Coinglass data loaded. Major levels identified.` },
        ] : []),
        ...(isCommodity ? [
            { id: '6', category: 'altdata', text: `CFTC COT Report: commercial vs speculative positioning loaded. Weekly release.` },
            { id: '7', category: 'momentum', text: `Futures curve structure: contango/backwardation analysis. Front-month spread computing.` },
            { id: '8', category: 'altdata', text: `Seasonal pattern overlay: historical Q1 performance and supply/demand cycle loading.` },
        ] : []),
        { id: '9', category: 'knowledge', text: `Knowledge graph: cross-ticker relationships mapped. Supply chain alerts checked.` },
        { id: '10', category: 'model', text: `Data quality scoring: all inputs validated. Confidence score compositing.` },
        { id: '11', category: 'model', text: `Coverage check complete — preparing the workspace handoff for ${ticker}.` },
    ];

    return cards;
}

function buildStarterReport(asset: AssetEntry): ReportData {
    const ticker = asset.ticker;

    return {
        engine: 'Meridian v2.4',
        report_id: `QRS-2026-${String(Math.floor(Math.random() * 90000 + 10000))}`,
        ticker,
        company_name: asset.name,
        exchange: asset.exchange,
        sector: asset.sector ?? 'Unknown',
        industry: asset.sector ?? 'Unknown',
        market_cap: 'Not connected',
        asset_class: asset.assetClass,
        description: `${asset.name} is available in the Quantus workspace, but this ticker does not yet have cached Quantus coverage. This starter shell uses directory metadata only while live data services are being connected.`,
        current_price: asset.currentPrice ?? 0,
        day_change: asset.dayChange ?? 0,
        day_change_pct: asset.dayChangePct ?? 0,
        week_52_high: (asset.currentPrice ?? 0) * 1.08,
        week_52_low: (asset.currentPrice ?? 0) * 0.92,
        regime: {
            label: 'Transitional',
            implication: 'This is a starter shell. Regime analysis will upgrade automatically once live market data is connected.',
            active_strategies: ['Manual review'],
            suppressed_strategies: ['Automated conviction signals'],
        },
        overall_signal: 'NEUTRAL',
        confidence_score: 34,
        confidence_breakdown: {
            momentum: 4,
            sentiment: 4,
            regime_alignment: 5,
            model_ensemble_agreement: 4,
            alternative_data: 4,
            macro_context: 8,
            data_quality: 5,
        },
        model_ensemble: {
            lstm: { forecast: 'Pending', weight: 'N/A', accuracy: 'N/A' },
            prophet: { forecast: 'Pending', weight: 'N/A', accuracy: 'N/A' },
            arima: { forecast: 'Pending', weight: 'N/A', accuracy: 'N/A' },
            ensemble_forecast: 'Pending live data',
            confidence_band: { low: 'N/A', high: 'N/A' },
            regime_accuracy_note: 'No cached Quantus model run exists for this ticker yet.',
        },
        signal_cards: [
            {
                label: 'Coverage status',
                value: 'Starter shell',
                trend: 'neutral',
                plain_note: 'No cached report exists yet. Quantitative signals remain conservative until a live model run is available.',
                data_source: 'Workspace directory',
                freshness: 'On demand',
                quality_score: 42,
                icon: '🧭',
            },
        ],
        alternative_data: {
            grok_x_sentiment: { score: 0.5, volume: 0, credibility_weighted: 0.5, campaign_detected: false, freshness: 'Unavailable' },
            reddit_score: 0.5,
            news_score: 0.5,
            composite_sentiment: 0.5,
            institutional_flow: 'Unavailable until live integrations are connected',
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
            stress_tests: [{ scenario: 'Starter shell', return: 'Unavailable', recovery: 'Unavailable' }],
            macro_context: { fed_rate: '4.25%', yield_curve: 'Checking', vix: '16.4', credit_spreads: 'Checking' },
        },
        strategy: {
            action: 'NEUTRAL',
            confidence: 34,
            regime_context: 'No cached Quantus coverage. Use this page as a starting point, not a trading signal.',
            entry_zone: 'Pending live data',
            target: 'Pending live data',
            stop_loss: 'Pending live data',
            risk_reward: 'Pending live data',
            position_size_pct: 'Manual only',
            kelly_derived_max: 'Pending live data',
        },
        narrative_executive_summary: `${ticker} does not yet have cached Quantus coverage. This page is a starter shell that preserves the workspace handoff, but it should not be treated as a completed quantitative report until a live model run exists.`,
        narrative_plain: `${asset.name} is searchable in Quantus, but the full report has not been generated yet. Treat this as a placeholder workspace, not a production signal.`,
        researcher_count: asset.researcherCount ?? 0,
        generated_at: new Date().toISOString(),
        cache_age: 'Starter shell',
        data_sources: [{ name: 'Quantus workspace directory', tier: 3, freshness: 'On demand' }],
        peer_group: [],
    };
}

function getMockScreenerResults(filters: Record<string, unknown>) {
    return [
        { ticker: 'NVDA', name: 'NVIDIA Corporation', assetClass: 'EQUITY', signal: 'STRONG BUY', confidence: 82, regime: 'Strong Uptrend', forecast: '+8.3%', sector: 'Technology' },
        { ticker: 'AAPL', name: 'Apple Inc.', assetClass: 'EQUITY', signal: 'BUY', confidence: 69, regime: 'Uptrend', forecast: '+5.9%', sector: 'Technology' },
        { ticker: 'GC=F', name: 'Gold Futures', assetClass: 'COMMODITY', signal: 'BUY', confidence: 71, regime: 'Uptrend', forecast: '+5.0%', sector: 'Precious Metals' },
        { ticker: 'BTC-USD', name: 'Bitcoin', assetClass: 'CRYPTO', signal: 'BUY', confidence: 74, regime: 'Strong Uptrend', forecast: '+9.8%', sector: 'Cryptocurrency' },
    ].filter(r => {
        if (filters.signal && Array.isArray(filters.signal) && !filters.signal.includes(r.signal)) return false;
        if (filters.minConfidence && r.confidence < (filters.minConfidence as number)) return false;
        return true;
    });
}

// ─── KNOWLEDGE GRAPH ─────────────────────────────────────────────────────────
app.get(`${API_PREFIX}/v1/knowledge-graph/:ticker`, async (req, res) => {
    try {
        const ticker = sanitizeTicker(req.params.ticker);
        if (!ticker) { res.status(400).json({ error: 'Invalid ticker' }); return; }
        // In full production, this would make an internal RPC/HTTP call to a running Python API server.
        // For MVP, if a Python backend is not running, we provide graceful degradation mimicking the Python return.

        // Mocking the result of `api/archive.py`'s `KnowledgeGraphAPI.get_related(ticker)`
        const relationships: Record<string, Array<{ ticker: string; metadata: Record<string, unknown> }>> = {};

        const mockRelations = [
            { source: 'AAPL', target: 'TSMC', type: 'Supplier', metadata: { tier: 1 } },
            { source: 'TSLA', target: 'PANW', type: 'Competitor', metadata: { competitor_type: 'indirect' } },
            { source: 'NVDA', target: 'TSMC', type: 'Customer', metadata: { dependency_weight: 0.8 } },
            { source: 'AAPL', target: 'QQQ', type: 'ETF constituent', metadata: { weight: 0.11 } },
        ];

        const filtered = mockRelations.filter(r => r.source === ticker);
        filtered.forEach(r => {
            if (!relationships[r.type]) relationships[r.type] = [];
            relationships[r.type].push({ ticker: r.target, metadata: r.metadata });
        });

        res.json({
            ticker,
            relationships
        });
    } catch (error) {
        console.error('Error fetching knowledge graph:', error);
        res.status(500).json({ error: 'Failed to access Knowledge Graph' });
    }
});

// ─── SEC EDGAR & FinBERT NLP ─────────────────────────────────────────────────
app.get(`${API_PREFIX}/v1/sec-edgar/:ticker`, async (req, res) => {
    try {
        const ticker = sanitizeTicker(req.params.ticker);
        if (!ticker) { res.status(400).json({ error: 'Invalid ticker' }); return; }
        // In full production, this would make an internal RPC/HTTP call to a running Python API server 
        // running `services/sec_edgar.py`. 
        // For MVP graceful degradation logic, returning the expected schema:

        // Simulate a slight delay to mock NLP runtime
        await new Promise(resolve => setTimeout(resolve, 600));

        // Generate a random mocked delta score between -0.4 and 0.4
        const delta = Number((Math.random() * 0.8 - 0.4).toFixed(3));
        let summaryText = "Management tone remains neutral and consistent with the prior quarter.";
        if (delta < -0.3) {
            summaryText = "Management language has shifted significantly more cautious vs Q3 — forward guidance hedging increased dramatically.";
        } else if (delta < -0.1) {
            summaryText = "Management language exhibits a slight negative shift, citing emerging headwinds.";
        } else if (delta > 0.3) {
            summaryText = "Management tone has shifted extremely positive, characterized by upgraded forward guidance.";
        } else if (delta > 0.1) {
            summaryText = "Management tone is incrementally more optimistic regarding margin expansion.";
        }

        res.json({
            ticker,
            form_type: "10-Q",
            filing_date: new Date().toISOString().split('T')[0], // Simulate recent
            prior_filing_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            delta_score: delta,
            summary_plain: summaryText,
            is_cached_fallback: true
        });
    } catch (error) {
        console.error('Error fetching SEC Edgar NLP data:', error);
        res.status(500).json({ error: 'Failed to fetch SEC Edgar filing' });
    }
});

// ─── ENGINE VERSION STATUS ───────────────────────────────────────────────────
app.get(`${API_PREFIX}/v1/engine/status`, (req, res) => {
    // In full prod, this hits PostgreSQL `user_engine_preferences` to see 
    // if the banner should show for this specific user.
    // Simulating true so you can build the UI component.
    res.json({
        show_banner: true,
        version: "Meridian v2.4",
        release_notes: "Upgraded LSTM lookback windows and enhanced FinBERT risk detection.",
        message: "Quantus Engine updated to Meridian v2.4 — Upgraded LSTM lookback windows and enhanced FinBERT risk detection."
    });
});

app.post(`${API_PREFIX}/v1/engine/dismiss-banner`, (req, res) => {
    // Flags that this user has seen the v2.4 banner and hides it.
    res.json({ success: true, message: "Banner dismissed for current user." });
});

// ─── UI GATING & APP STATUS ──────────────────────────────────────────────────
import fs from 'fs';
import path from 'path';

app.get(`${API_PREFIX}/v1/app-status`, (req, res) => {
    try {
        const statePath = path.join(process.cwd(), 'server', 'data', 'app_state.json');
        if (fs.existsSync(statePath)) {
            const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
            res.json(state);
        } else {
            // Safe fallback if Cold Start script hasn't run
            res.json({
                discovery_visibility_threshold: 5,
                accuracy_show_public: false,
                community_open: false
            });
        }
    } catch {
        res.status(500).json({ error: "Failed to read app state" });
    }
});

// ─── SECTOR PACKS ────────────────────────────────────────────────────────────
app.get(`${API_PREFIX}/v1/sectors/:sector/reports`, (req, res) => {
    // In production, user auth middleware determines if they have a subscription
    // to `req.params.sector` via PostgreSQL `user_sector_subscriptions`.
    const { sector } = req.params;

    // Simulate Top 20 tickers for that sector, grabbing mock reports
    const mockTickers = ['AAPL', 'MSFT', 'NVDA', 'AVGO', 'ORCL', 'ADBE', 'CRM', 'AMD', 'INTC', 'QCOM',
        'TXN', 'IBM', 'NOW', 'AMAT', 'UBER', 'PANW', 'MU', 'LRCX', 'SNPS', 'KLAC'];
    // Convert them using our random report generator
    const reports = mockTickers.map(t => getMockReport(t));

    res.json({
        sector,
        tier_access: "authorized",
        generated_at: new Date().toISOString(),
        reports
    });
});

// ─── RESEARCH BLOG (SEO) ─────────────────────────────────────────────────────
// Mocking the bridge to `services/research_blog.py`
const MOCK_BLOG_POSTS = [
    {
        id: "1",
        slug: "q1-2026-macro-regime-shift",
        title: "Q1 2026: Navigating the High-Volatility Mean-Reverting Regime",
        content_md: "## The Shift from Trend to Chop\n\nOver the past 14 trading days, the Quantus ensemble models have detected a decisive shift out of the prolonged *Trend-Following* regime into a *Mean-Reverting (High Volatility)* state. Historical tracking indicates that momentum factors degrade rapidly in this environment, while RSI divergence paired with Bollinger Band mean reversion significantly outperforms.\n\n### Sector Positioning\nIn this regime, Technology (XLK) models are flashing elevated risk (VaR +15% WoW). Conversely, Defensive sectors like Utilities and Healthcare show expanding margins of safety.\n\n*Generated automatically by Meridian v2.4 analysis of 8,500 active endpoints.*",
        tags: ["Macro", "Regime Detection", "Q1 2026"],
        author: "Meridian v2.4 (AI)",
        published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "2",
        slug: "ai-semiconductors-language-delta",
        title: "SEC NLP Insights: The Semantic Cooling of Semiconductor Guidance",
        content_md: "## FinBERT Identifies Hedging in 10-Q Sandbagging\n\nOur nightly SEC Edgar ingest engine ran Delta Analysis across 42 recent semiconductor filings. While underlying revenue numbers remain robust, management *tone*—specifically forward-guidance verbosity—has cooled.\n\n### The Delta\nThe average `sec_language_delta` for the SMH ETF constituents sits at **-0.24** (out of -1.0 to +1.0). This indicates that while executives are hitting targets, they are deploying significantly more 'defensive' terms (e.g., 'supply chain headwinds', 'macroeconomic uncertainty') than in Q4.\n\nExpect short-term multiple compression.",
        tags: ["Equities", "NLP", "Semiconductors"],
        author: "Meridian v2.4 (AI)",
        published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
];

app.get(`${API_PREFIX}/v1/blog`, (req, res) => {
    // In production, execute Python `blog_service.get_all_posts()` 
    // Strip content for list view payload size reduction
    const list = MOCK_BLOG_POSTS.map(({ id, slug, title, tags, author, published_at }) => ({
        id,
        slug,
        title,
        tags,
        author,
        published_at,
    }));
    res.json(list);
});

app.get(`${API_PREFIX}/v1/blog/:slug`, (req, res) => {
    // In production, execute Python `blog_service.get_post_by_slug(req.params.slug)`
    const post = MOCK_BLOG_POSTS.find(p => p.slug === req.params.slug);
    if (post) {
        res.json(post);
    } else {
        res.status(404).json({ error: "Post not found" });
    }
});

// ─── EXPLAINABILITY (ELI5) ───────────────────────────────────────────────────
app.post(`${API_PREFIX}/v1/explain`, async (req, res) => {
    // In production, this proxies to `services/explainability.py` via HTTP/RPC
    try {
        const context_string = typeof req.body.context_string === 'string' ? req.body.context_string.slice(0, 500) : '';
        const target_audience = typeof req.body.target_audience === 'string' ? req.body.target_audience.slice(0, 30) : 'retail_beginner';

        if (!context_string) {
            return res.status(400).json({ error: "context_string is required" });
        }

        // Simulate Python LLM latency
        await new Promise(resolve => setTimeout(resolve, 600));

        let explanation = "This metric tracks the mathematical patterns of how buyers and sellers are behaving right now.";
        const ctx = context_string.toLowerCase();

        if (ctx.includes("regime") || ctx.includes("reverting")) {
            explanation = "The stock price has dropped or surged faster than usual, and models think it's about to bounce back to its average.";
        } else if (ctx.includes("macd") || ctx.includes("divergence")) {
            explanation = "The stock's momentum is slowing down even as the price edges higher, which often signals a trend reversal is coming.";
        } else if (ctx.includes("var") || ctx.includes("value at risk")) {
            explanation = "This asset is currently very volatile. In a worst-case scenario, our models estimate it could drop significantly more than an average stock.";
        } else if (ctx.includes("lstm") || ctx.includes("confidence")) {
            explanation = "Our AI prediction model is highly uncertain right now because recent market movements have been chaotic. Expect wild price swings.";
        }

        res.json({
            original: context_string,
            target_audience,
            explanation,
            provider: "Meridian v2.4 (Mock)"
        });

    } catch {
        res.status(500).json({ error: "Failed to generate explanation" });
    }
});

// ─── USER BEHAVIOR PERSONALIZATION ───────────────────────────────────────────
app.post(`${API_PREFIX}/v1/track`, async (req, res) => {
    // In production, this drops a message onto an SQS queue or directly to 
    // `services/personalization.py` to ensure fast flush.
    try {
        const user_id = typeof req.body.user_id === 'string' ? req.body.user_id.slice(0, 50) : '';
        const event_type = typeof req.body.event_type === 'string' ? req.body.event_type.slice(0, 50) : '';
        if (!user_id || !event_type) {
            return res.status(400).json({ error: "user_id and event_type required" });
        }

        // Mock logging for development visibility — truncated for safety
        console.warn(`[TELEMETRY] User ${user_id.slice(0, 8)} -> ${event_type}`);

        // Return 202 Accepted instantly so frontend is never blocked
        res.status(202).json({ status: "tracked" });
    } catch {
        res.status(500).json({ error: "Tracking failed" });
    }
});

function getMockPortfolioAnalysis(holdings: Array<{ ticker: string; weight: number }>) {
    const signals = holdings.map(h => {
        const mock = getMockReport(h.ticker);
        return {
            ticker: h.ticker,
            signal: mock?.overall_signal ?? 'NEUTRAL',
            confidence: mock?.confidence_score ?? 50,
            regime: mock?.regime.label ?? 'Mean-Reverting',
            var_contribution: `${(h.weight * 0.042).toFixed(1)}%`,
        };
    });

    return {
        total_regime_exposure: { 'Uptrend': 42, 'Strong Uptrend': 28, 'Mean-Reverting': 20, 'High Volatility': 10 },
        aggregate_signal: 'BUY',
        aggregate_confidence: 68,
        portfolio_var: '-$310 per $10,000 (99% daily)',
        sharpe_ratio: 0.94,
        diversification_score: 72,
        top_risks: ['Concentration in Technology (54% weight)', 'TSMC supply chain exposure (NVDA/AAPL)', 'Rate sensitivity in growth positions'],
        knowledge_graph_risks: ['NVDA and AAPL share TSMC as primary supplier — correlated supply risk'],
        earnings_calendar: holdings
            .map(h => ({ ticker: h.ticker, days: Math.floor(15 + Math.random() * 75) }))
            .sort((a, b) => a.days - b.days),
        holdings_analysis: signals,
    };
}

// ─── GLOBAL ERROR HANDLER ────────────────────────────────────────────────────
app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(`[Express Error] ${req.method} ${req.url}:`, err);
    res.status(500).json({
        error: true,
        message: "Quantus Engine encountered an unexpected error.",
        context: process.env.NODE_ENV === 'development' && err instanceof Error ? err.message : undefined
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.warn(`Quantus Research Solutions API — http://localhost:${PORT}`);
    console.warn(`Engine: Meridian v2.4`);
});
