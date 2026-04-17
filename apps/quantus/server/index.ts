import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import helmet from 'helmet';
import path from 'path';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';
import { getMockReport } from './data/mockReports.ts';
import { getAssetByTicker, getWorkspaceStatus, getWorkspaceSummary, searchAssets } from './data/assetUniverse.ts';
import type { AssetEntry, ReportData, ReportResponse, ReportSource } from '../src/types/index.ts';
import {
    QUANTUS_INTERNAL_HEADER,
    getQuantusMonthlyReportLimitForTier,
    readQuantusInternalKey,
    sanitizeQuantusAssetClass,
    sanitizeQuantusTicker,
    sanitizeQuantusUserTier,
} from '../../../shared/quantus.ts';

dotenv.config({ path: '.env.local' });
dotenv.config();

// ─── ROOT API TARGET ────────────────────────────────────────────────────────
// Instead of opening the SQLite DB directly (dual-writer risk), proxy auth
// and Quantus persistence requests to the root BI Solutions server which owns
// the database.
const AUTH_API_TARGET = process.env.AUTH_API_TARGET || 'http://localhost:5001';
const QUANTUS_INTERNAL_KEY = readQuantusInternalKey();
if (process.env.NODE_ENV === 'production' && !QUANTUS_INTERNAL_KEY) {
    throw new Error('QUANTUS_INTERNAL_KEY env var (min 32 chars) is required in production');
}

const app = express();
const API_PREFIX = '/quantus/api';
const isProduction = process.env.NODE_ENV === 'production';
const ALLOW_DEMO_DATA = process.env.QUANTUS_ALLOW_DEMO_DATA === 'true' || !isProduction;
const ENABLE_PUSH_NOTIFICATIONS = process.env.QUANTUS_ENABLE_PUSH === 'true';
const SHOW_ENGINE_BANNER = process.env.QUANTUS_SHOW_ENGINE_BANNER === 'true' || !isProduction;
const PYTHON_PIPELINE_TIMEOUT_MS = Number.parseInt(process.env.QUANTUS_PYTHON_TIMEOUT_MS || '90000', 10);

if (isProduction && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET env var is required in production');
}
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-local-only-never-use-in-prod';
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
function parseBooleanQuery(raw: unknown): boolean {
    if (typeof raw === 'boolean') return raw;
    if (typeof raw !== 'string') return false;

    const normalized = raw.trim().toLowerCase();
    return normalized === 'true' || normalized === '1';
}

function sendFeatureUnavailable(res: express.Response, feature: string) {
    res.status(503).json({
        error: `${feature} is not enabled on this Quantus deployment.`,
        code: 'feature_unavailable',
    });
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

interface QuantusSafeUser {
    id: string;
    email: string;
    name: string;
    tier: string;
    credits: number;
    reportsThisMonth: number;
    jurisdiction: 'US' | 'UK' | 'EU' | 'GLOBAL';
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

function requireAuth(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required.' });
        return;
    }
    next();
}

app.use(optionalAuth);

// ─── AUTH ENDPOINTS (proxy to root server — single DB writer) ───────────────
// All auth mutations go through the root BI Solutions server at AUTH_API_TARGET
// so only one process ever writes to bisolutions.db.

async function proxyAuthRequest(
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
    req: express.Request,
    res: express.Response,
) {
    try {
        const headers: Record<string, string> = { 'content-type': 'application/json' };
        const authHeader = req.headers.authorization;
        if (authHeader) headers['authorization'] = authHeader;

        const upstream = await fetch(`${AUTH_API_TARGET}${path}`, {
            method,
            headers,
            body: method !== 'GET' ? JSON.stringify(req.body) : undefined,
            signal: AbortSignal.timeout(10_000),
        });

        const text = await upstream.text();
        res.status(upstream.status).setHeader('content-type', 'application/json').send(text);
    } catch (error) {
        console.error(`Auth proxy error (${path}):`, error);
        res.status(502).json({ error: 'Auth service temporarily unavailable.' });
    }
}

app.post(`${API_PREFIX}/auth/login`, (req, res) => {
    proxyAuthRequest('POST', '/api/auth/login', req, res);
});

app.post(`${API_PREFIX}/auth/register`, (req, res) => {
    proxyAuthRequest('POST', '/api/auth/register', req, res);
});

app.post(`${API_PREFIX}/auth/google`, (req, res) => {
    proxyAuthRequest('POST', '/api/auth/google', req, res);
});

app.get(`${API_PREFIX}/auth/google/config`, (req, res) => {
    proxyAuthRequest('GET', '/api/auth/google/config', req, res);
});

app.get(`${API_PREFIX}/auth/me`, (req, res) => {
    proxyAuthRequest('GET', '/api/auth/me', req, res);
});

app.delete(`${API_PREFIX}/auth/account`, (req, res) => {
    proxyAuthRequest('DELETE', '/api/auth/account', req, res);
});

async function fetchRootJson(
    path: string,
    init: RequestInit = {},
    authHeader?: string,
): Promise<{ ok: boolean; status: number; data: any; text: string }> {
    const headers = new Headers(init.headers);
    if (authHeader) {
        headers.set('authorization', authHeader);
    }
    if (init.body && !headers.has('content-type')) {
        headers.set('content-type', 'application/json');
    }

    const upstream = await fetch(`${AUTH_API_TARGET}${path}`, {
        ...init,
        headers,
        signal: init.signal ?? AbortSignal.timeout(10_000),
    });

    const text = await upstream.text();
    let data: any = {};

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { message: text };
        }
    }

    return {
        ok: upstream.ok,
        status: upstream.status,
        data,
        text,
    };
}

async function fetchFreshAuthenticatedUser(authHeader?: string): Promise<{ ok: boolean; status: number; data: any; text: string; user: QuantusSafeUser | null }> {
    const upstream = await fetchRootJson('/api/auth/me', { method: 'GET' }, authHeader);
    return {
        ...upstream,
        user: upstream.ok ? upstream.data as QuantusSafeUser : null,
    };
}

async function consumeReportAllowance(authHeader: string) {
    return fetchRootJson(
        '/api/quantus/usage/report',
        {
            method: 'POST',
            body: JSON.stringify({}),
        },
        authHeader,
    );
}

async function assertDeepDiveAccess(authHeader: string, moduleIndex: number) {
    return fetchRootJson(
        '/api/quantus/usage/deep-dive-access',
        {
            method: 'POST',
            body: JSON.stringify({ module: moduleIndex }),
        },
        authHeader,
    );
}

async function proxyRootRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    req: express.Request,
    res: express.Response,
) {
    try {
        const headers: Record<string, string> = {};
        const authHeader = req.headers.authorization;
        if (authHeader) {
            headers.authorization = authHeader;
        }
        if (method !== 'GET') {
            headers['content-type'] = 'application/json';
        }

        const upstream = await fetch(`${AUTH_API_TARGET}${path}`, {
            method,
            headers,
            body: method === 'GET' ? undefined : JSON.stringify(req.body),
            signal: AbortSignal.timeout(10_000),
        });

        const text = await upstream.text();
        res.status(upstream.status).setHeader('content-type', 'application/json').send(text);
    } catch (error) {
        console.error(`Root proxy error (${path}):`, error);
        res.status(502).json({ error: 'Quantus persistence service temporarily unavailable.' });
    }
}

function formatRelativeAge(iso: string | undefined) {
    if (!iso) return 'Unknown';

    const deltaMs = Date.now() - new Date(iso).getTime();
    if (!Number.isFinite(deltaMs)) return 'Unknown';

    const minutes = Math.max(1, Math.round(deltaMs / 60_000));
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.round(minutes / 60);
    if (hours < 48) return `${hours}h ago`;

    const days = Math.round(hours / 24);
    return `${days}d ago`;
}

function deriveSentiment(signal: string) {
    switch (signal) {
        case 'STRONG BUY':
            return 0.8;
        case 'BUY':
            return 0.45;
        case 'SELL':
            return -0.45;
        case 'STRONG SELL':
            return -0.8;
        case 'NEUTRAL':
        default:
            return 0;
    }
}

function buildWatchlistBias(signal: string) {
    switch (signal) {
        case 'STRONG BUY':
            return 'Upside bias';
        case 'BUY':
            return 'Positive bias';
        case 'SELL':
            return 'Downside bias';
        case 'STRONG SELL':
            return 'High-risk downside';
        case 'NEUTRAL':
        default:
            return 'Balanced setup';
    }
}

function buildWatchlistItem(entry: any) {
    const latestSnapshot = entry?.latestSnapshot ?? null;
    const ticker = sanitizeQuantusTicker(entry?.ticker) ?? 'UNKNOWN';
    const assetClass = sanitizeQuantusAssetClass(entry?.assetClass) as AssetEntry['assetClass'];
    const fallbackAsset: AssetEntry = {
        ticker,
        name: ticker,
        exchange: 'Manual input',
        assetClass,
        sector: 'Unclassified',
        hasCachedReport: false,
        researcherCount: 0,
        currentPrice: 0,
        dayChange: 0,
        dayChangePct: 0,
        cachedReportAge: 'Starter shell',
    };
    const asset: AssetEntry = getAssetByTicker(ticker) ?? fallbackAsset;

    const currentPrice = typeof asset.currentPrice === 'number'
        ? asset.currentPrice
        : typeof latestSnapshot?.priceAtGen === 'number'
            ? latestSnapshot.priceAtGen
            : 0;
    const dayChangePct = typeof asset.dayChangePct === 'number' ? asset.dayChangePct : 0;
    const snapshotSignal = typeof latestSnapshot?.signal === 'string' ? latestSnapshot.signal : 'NEUTRAL';
    const snapshotConfidence = typeof latestSnapshot?.confidence === 'number' ? latestSnapshot.confidence : (asset.hasCachedReport ? 60 : 20);
    const snapshotRegime = typeof latestSnapshot?.regime === 'string' ? latestSnapshot.regime : (asset.hasCachedReport ? 'Uptrend' : 'Transitional');
    const lastUpdated = typeof latestSnapshot?.generatedAt === 'string' ? latestSnapshot.generatedAt : entry?.updatedAt ?? new Date().toISOString();

    return {
        ticker,
        name: asset.name,
        exchange: asset.exchange,
        assetClass,
        sector: asset.sector,
        hasCachedReport: Boolean(latestSnapshot || asset.hasCachedReport),
        cachedReportAge: latestSnapshot ? formatRelativeAge(latestSnapshot.generatedAt) : asset.cachedReportAge,
        currentPrice,
        dayChange: typeof asset.dayChange === 'number' ? asset.dayChange : 0,
        dayChangePct,
        signal: snapshotSignal,
        confidence: snapshotConfidence,
        regime: snapshotRegime,
        momentum: Math.max(-1, Math.min(1, dayChangePct / 5)),
        sentiment: deriveSentiment(snapshotSignal),
        forecast30d: buildWatchlistBias(snapshotSignal),
        lastUpdated,
        nextRefresh: latestSnapshot ? 'On demand' : 'Starter shell',
        researcherCount: asset.researcherCount ?? 0,
        knowledgeGraphAlert: asset.sector ? `${asset.sector} coverage persisted in Quantus.` : 'Persisted Quantus watchlist item',
    };
}

function getBenchmarkTicker(assetClass: ReportData['asset_class']) {
    switch (assetClass) {
        case 'CRYPTO':
            return 'BTC-USD';
        case 'COMMODITY':
            return 'GC=F';
        case 'ETF':
        case 'EQUITY':
        default:
            return 'SPY';
    }
}

function getMarketCapBucket(report: ReportData) {
    const marketCapRaw = typeof report.market_cap_raw === 'number' ? report.market_cap_raw : null;
    if (!marketCapRaw || !Number.isFinite(marketCapRaw)) {
        return null;
    }
    if (marketCapRaw >= 10_000_000_000) return 'LARGE';
    if (marketCapRaw >= 2_000_000_000) return 'MID';
    return 'SMALL';
}

async function persistReportSnapshot(response: ReportResponse) {
    if (response.source !== 'live') {
        return;
    }

    const benchmarkTicker = getBenchmarkTicker(response.report.asset_class);
    const benchmarkAsset = getAssetByTicker(benchmarkTicker);

    if (!QUANTUS_INTERNAL_KEY) {
        console.warn('Skipping snapshot persistence: QUANTUS_INTERNAL_KEY not set.');
    } else try {
        await fetch(`${AUTH_API_TARGET}/api/quantus/internal/snapshots`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                [QUANTUS_INTERNAL_HEADER]: QUANTUS_INTERNAL_KEY,
            },
            body: JSON.stringify({
                snapshot: {
                    reportId: response.report.report_id,
                    ticker: response.report.ticker,
                    assetClass: response.report.asset_class,
                    companyName: response.report.company_name,
                    sector: response.report.sector,
                    engineVersion: response.report.engine,
                    signal: response.report.overall_signal,
                    confidenceScore: response.report.confidence_score,
                    regimeLabel: response.report.regime.label,
                    marketCapBucket: getMarketCapBucket(response.report),
                    benchmarkSymbol: benchmarkTicker,
                    benchmarkPriceAtGen: benchmarkAsset?.currentPrice ?? null,
                    generatedAt: response.report.generated_at,
                    priceAtGen: response.report.current_price,
                    source: 'live',
                    reportJson: response.report,
                },
            }),
            signal: AbortSignal.timeout(5_000),
        });
    } catch (error) {
        console.error(`Snapshot persistence failed for ${response.report.report_id}:`, error);
    }
}

app.get(`${API_PREFIX}/watchlist`, async (req, res) => {
    try {
        const upstream = await fetchRootJson('/api/quantus/watchlist', { method: 'GET' }, req.headers.authorization);
        if (!upstream.ok) {
            res.status(upstream.status).json(upstream.data);
            return;
        }

        const items = Array.isArray(upstream.data?.items)
            ? upstream.data.items.map((entry: any) => buildWatchlistItem(entry))
            : [];

        res.json({
            items,
            activeAlertCount: Number(upstream.data?.activeAlertCount ?? 0),
            status: getWorkspaceStatus(),
        });
    } catch (error) {
        console.error('Quantus watchlist proxy error:', error);
        res.status(502).json({ error: 'Unable to load the persisted Quantus watchlist.' });
    }
});

app.post(`${API_PREFIX}/watchlist`, (req, res) => {
    proxyRootRequest('POST', '/api/quantus/watchlist', req, res);
});

app.delete(`${API_PREFIX}/watchlist/:ticker`, (req, res) => {
    proxyRootRequest('DELETE', `/api/quantus/watchlist/${encodeURIComponent(req.params.ticker)}`, req, res);
});

app.get(`${API_PREFIX}/alerts`, (req, res) => {
    proxyRootRequest('GET', '/api/quantus/alerts', req, res);
});

app.put(`${API_PREFIX}/alerts/:ticker`, (req, res) => {
    proxyRootRequest('PUT', `/api/quantus/alerts/${encodeURIComponent(req.params.ticker)}`, req, res);
});

app.delete(`${API_PREFIX}/alerts/:ticker`, (req, res) => {
    proxyRootRequest('DELETE', `/api/quantus/alerts/${encodeURIComponent(req.params.ticker)}`, req, res);
});

app.get(`${API_PREFIX}/archive`, async (req, res) => {
    const ticker = sanitizeQuantusTicker(req.query.ticker);
    if (!ticker) {
        res.status(400).json({ error: 'Ticker query param is required.' });
        return;
    }

    const params = new URLSearchParams({
        ticker,
        limit: String(req.query.limit ?? '20'),
    });

    try {
        const upstream = await fetchRootJson(`/api/quantus/archive?${params.toString()}`, { method: 'GET' });
        res.status(upstream.status).json(upstream.data);
    } catch (error) {
        console.error('Quantus archive proxy error:', error);
        res.status(502).json({ error: 'Unable to load the Quantus archive.' });
    }
});

app.get(`${API_PREFIX}/archive/:reportId`, async (req, res) => {
    try {
        const upstream = await fetchRootJson(`/api/quantus/archive/${encodeURIComponent(req.params.reportId)}`, { method: 'GET' });
        if (!upstream.ok) {
            res.status(upstream.status).json(upstream.data);
            return;
        }

        const report = upstream.data?.report as ReportData | undefined;
        if (!report) {
            res.status(502).json({ error: 'Quantus archive returned an invalid report payload.' });
            return;
        }

        const response: ReportResponse = {
            report,
            source: 'cached',
            ticker: report.ticker,
            message: 'Historical Quantus snapshot loaded.',
            detail: `Snapshot ${report.report_id} captured ${report.generated_at}.`,
            freshness: 'Archived snapshot',
            status: getWorkspaceStatus(),
        };

        res.json(response);
    } catch (error) {
        console.error('Quantus archived report proxy error:', error);
        res.status(502).json({ error: 'Unable to load the Quantus archive snapshot.' });
    }
});

app.get(`${API_PREFIX}/accuracy`, async (_req, res) => {
    try {
        const upstream = await fetchRootJson('/api/quantus/accuracy', { method: 'GET' });
        res.status(upstream.status).json(upstream.data);
    } catch (error) {
        console.error('Quantus accuracy proxy error:', error);
        res.status(502).json({ error: 'Unable to load Quantus accuracy metrics.' });
    }
});

// Lazy AI client — don't throw at startup if key not set yet
function getAI() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY not set — set it in .env.local to enable AI generation');
    return new GoogleGenAI({ apiKey: key });
}

// ─── PYTHON PIPELINE PROXY ──────────────────────────────────────────────────
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

async function callPythonPipeline(ticker: string, options: { forceRefresh?: boolean; userTier?: string } = {}): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const params = new URLSearchParams({
            force_refresh: String(options.forceRefresh ?? false),
            user_tier: options.userTier ?? 'FREE',
        });
        const url = `${PYTHON_API_URL}/api/v1/report/${encodeURIComponent(ticker)}?${params}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), PYTHON_PIPELINE_TIMEOUT_MS);

        const response = await fetch(url, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' },
        });
        clearTimeout(timeout);

        if (!response.ok) {
            const errorBody = await response.text();
            return { success: false, error: `Python API returned ${response.status}: ${errorBody}` };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (err: any) {
        if (err.name === 'AbortError') {
            return { success: false, error: `Python pipeline timeout (${Math.round(PYTHON_PIPELINE_TIMEOUT_MS / 1000)}s)` };
        }
        return { success: false, error: `Python API unavailable: ${err.message}` };
    }
}

async function callPythonDeepDive(ticker: string, moduleIndex: number, assetClass: string): Promise<{ success: boolean; text?: string; error?: string }> {
    try {
        const url = `${PYTHON_API_URL}/api/v1/report/${encodeURIComponent(ticker)}/deepdive`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);

        const response = await fetch(url, {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ module: moduleIndex, assetClass }),
        });
        clearTimeout(timeout);

        if (!response.ok) {
            return { success: false, error: `Python API returned ${response.status}` };
        }

        const data = await response.json();
        return { success: true, text: data.text };
    } catch (err: any) {
        return { success: false, error: `Python API unavailable: ${err.message}` };
    }
}

function normalizeReportSource(source: unknown): ReportSource {
    if (source === 'cached' || source === 'starter' || source === 'live') {
        return source;
    }
    return 'live';
}

function getPipelineUnavailableStatus(detail: string) {
    return {
        mode: 'sandbox' as const,
        label: 'Live pipeline unavailable',
        description: 'Quantus could not complete a live research request, so starter coverage is being shown instead.',
        detail,
        badgeTone: 'caution' as const,
    };
}

const DEEP_DIVE_MODULE_COUNT = 12;
const DEEP_DIVE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

interface DeepDiveCacheEntry {
    text: string;
    updatedAt: number;
}

const deepDiveCache = new Map<string, DeepDiveCacheEntry>();
const deepDiveInFlight = new Map<string, Promise<string>>();

function getDeepDiveCacheKey(ticker: string, moduleIndex: number, assetClass: string) {
    return `${ticker}:${assetClass}:${moduleIndex}`;
}

function getCachedDeepDive(key: string) {
    const entry = deepDiveCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.updatedAt > DEEP_DIVE_CACHE_TTL_MS) {
        deepDiveCache.delete(key);
        return null;
    }
    return entry;
}

function writeDeepDiveSse(res: express.Response, text: string) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write(`data: ${JSON.stringify({ text })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
}

async function generateDeepDiveText(ticker: string, moduleIndex: number, assetClass: string) {
    const prompt = getDeepDivePrompt(ticker, moduleIndex, assetClass);
    const stream = await getAI().models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    let text = '';
    for await (const chunk of stream) {
        if (chunk.text) {
            text += chunk.text;
        }
    }

    return text || 'Analysis complete.';
}

function getOrCreateDeepDiveJob(ticker: string, moduleIndex: number, assetClass: string) {
    const cacheKey = getDeepDiveCacheKey(ticker, moduleIndex, assetClass);
    const cached = getCachedDeepDive(cacheKey);
    if (cached) {
        return Promise.resolve(cached.text);
    }

    const existing = deepDiveInFlight.get(cacheKey);
    if (existing) {
        return existing;
    }

    const job = (async () => {
        try {
            const text = await generateDeepDiveText(ticker, moduleIndex, assetClass);
            deepDiveCache.set(cacheKey, { text, updatedAt: Date.now() });
            return text;
        } finally {
            deepDiveInFlight.delete(cacheKey);
        }
    })();

    deepDiveInFlight.set(cacheKey, job);
    return job;
}


// ─── GET REPORT (LIVE PIPELINE → MOCK FALLBACK) ─────────────────────────────
app.get(`${API_PREFIX}/report/:ticker`, async (req: AuthenticatedRequest, res) => {
  try {
    const ticker = sanitizeQuantusTicker(req.params.ticker);
    if (!ticker) { res.status(400).json({ error: 'Invalid ticker format' }); return; }
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({
            error: 'Sign in is required to generate a full Quantus report.',
            code: 'auth_required',
        });
        return;
    }

    const authState = await fetchFreshAuthenticatedUser(authHeader);
    if (!authState.ok || !authState.user) {
        res.status(authState.status || 401).json(authState.data?.error ? authState.data : {
            error: 'Authentication is required to generate a full Quantus report.',
            code: 'auth_required',
        });
        return;
    }

    const userTier = sanitizeQuantusUserTier(authState.user.tier);
    const monthlyReportLimit = getQuantusMonthlyReportLimitForTier(userTier);
    if (
        monthlyReportLimit >= 0
        && Number.isFinite(authState.user.reportsThisMonth)
        && authState.user.reportsThisMonth >= monthlyReportLimit
    ) {
        res.status(403).json({
            error: `Your ${userTier} tier allows up to ${monthlyReportLimit} full Quantus reports per month.`,
            code: 'report_limit_reached',
            tier: userTier,
            reportLimit: monthlyReportLimit,
        });
        return;
    }

    const forceRefresh = parseBooleanQuery(req.query.force_refresh ?? req.query.forceRefresh);

    const asset = getAssetByTicker(ticker) ?? {
        ticker,
        name: ticker,
        exchange: 'Manual input',
        assetClass: 'EQUITY',
        sector: 'Unclassified',
        hasCachedReport: false,
        researcherCount: 0,
    } satisfies AssetEntry;

    const finalizeReportResponse = async (response: ReportResponse) => {
        if (response.source !== 'starter') {
            const usageResult = await consumeReportAllowance(authHeader);
            if (!usageResult.ok) {
                res.status(usageResult.status).json(usageResult.data);
                return;
            }
        }

        res.json(response);
    };

    // 1. Try live Python pipeline first
    const liveResult = await callPythonPipeline(ticker, {
        forceRefresh,
        userTier,
    });
    if (liveResult.success && liveResult.data?.report) {
        const source = normalizeReportSource(liveResult.data.source);
        const response: ReportResponse = {
            report: liveResult.data.report as ReportData,
            source,
            ticker,
            message: source === 'cached'
                ? 'Cached live Quantus report.'
                : source === 'starter'
                    ? 'Python pipeline returned starter coverage.'
                    : 'Live Quantus pipeline report generated.',
            detail: liveResult.data.warning || (source === 'cached'
                ? `Cached quantitative pipeline report loaded for ${ticker}.`
                : source === 'starter'
                    ? `Python pipeline returned starter coverage for ${ticker}.`
                    : `Live quantitative pipeline executed for ${ticker}.`),
            freshness: source === 'cached'
                ? liveResult.data.report?.cache_age || 'Cached'
                : source === 'starter'
                    ? 'On demand'
                    : 'Live',
            status: source === 'cached'
                ? {
                    mode: 'mixed',
                    label: 'Cached pipeline snapshot',
                    description: 'Quantus loaded an existing trusted pipeline snapshot for this ticker.',
                    detail: `Cached quantitative pipeline coverage loaded for ${ticker}.`,
                    badgeTone: 'neutral',
                }
                : getWorkspaceStatus(),
        };
        if (source === 'live') {
            void persistReportSnapshot(response);
        }
        await finalizeReportResponse(response);
        return;
    }

    // 2. Log the pipeline failure and fall back to mocks
    if (liveResult.error) {
        console.warn(`[Pipeline fallback] ${ticker}: ${liveResult.error}`);
    }

    if (isProduction && !ALLOW_DEMO_DATA) {
        const detail = liveResult.error || 'The Python research pipeline did not return a report.';
        const response: ReportResponse = {
            report: buildStarterReport(asset),
            source: 'starter',
            ticker,
            message: 'Live Quantus research is temporarily unavailable.',
            detail,
            freshness: 'On demand',
            status: getPipelineUnavailableStatus('The report route remains available, but live quantitative sections will stay conservative until the pipeline recovers.'),
        };
        await finalizeReportResponse(response);
        return;
    }

    // 3. Check for a cached mock report
    const report = getMockReport(ticker);
    if (report) {
        const response: ReportResponse = {
            report,
            source: 'cached',
            ticker,
            message: 'Cached Quantus coverage loaded (mock).',
            detail: `Live pipeline unavailable — serving cached mock data for ${ticker}.`,
            freshness: report.cache_age,
            status: getPipelineUnavailableStatus('Quantus is showing mock fallback coverage until the live pipeline recovers. Historical accuracy and archive persistence stay disabled for this response.'),
        };
        await finalizeReportResponse(response);
        return;
    }

    // 4. Last resort: starter shell
    const response: ReportResponse = {
        report: buildStarterReport(asset),
        source: 'starter',
        ticker,
        message: 'No cached Quantus coverage yet.',
        detail: 'You are viewing a starter shell. Start the Python pipeline server for live data.',
        freshness: 'On demand',
        status: getWorkspaceStatus(),
    };
    await finalizeReportResponse(response);
  } catch (err) {
    console.error(`[Report endpoint crash] ${req.params.ticker}:`, err);
    res.status(500).json({ error: 'Internal server error generating report' });
  }
});

app.get(`${API_PREFIX}/workspace/summary`, (_req, res) => {
    res.json(getWorkspaceSummary());
});

app.get(`${API_PREFIX}/assets/search`, async (req, res) => {
    const query = typeof req.query.q === 'string' ? req.query.q.slice(0, 60) : '';
    const requestedLimit = Number.parseInt(String(req.query.limit ?? '6'), 10);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 12) : 6;

    let expandedResults = searchAssets(query, limit);

    // Concurrently fetch python search
    if (query.trim().length > 0) {
        try {
            const pyRes = await fetch(`${PYTHON_API_URL}/api/v1/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
                signal: AbortSignal.timeout(2000)
            });
            if (pyRes.ok) {
                const pyAssets = await pyRes.json();
                if (Array.isArray(pyAssets)) {
                    const seen = new Set(expandedResults.map(a => a.ticker));
                    for (const pa of pyAssets) {
                        if (!seen.has(pa.ticker)) {
                            seen.add(pa.ticker);
                            expandedResults.push(pa);
                        }
                    }
                    expandedResults = expandedResults.slice(0, limit);
                }
            }
        } catch (err) {
            console.error('Python search failed to respond:', err);
        }
    }

    res.json({
        query,
        results: expandedResults,
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
app.post(`${API_PREFIX}/generate`, requireAuth, async (req, res) => {
    try {
        const ticker = sanitizeQuantusTicker(req.body.ticker);
        const assetClass = sanitizeQuantusAssetClass(req.body.assetClass);
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
            model: 'gemini-2.5-flash',
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
app.post(`${API_PREFIX}/insights`, requireAuth, async (req, res) => {
    try {
        const ticker = sanitizeQuantusTicker(req.body.ticker);
        const assetClass = sanitizeQuantusAssetClass(req.body.assetClass);
        if (!ticker) {
            res.status(400).json({ error: 'Valid ticker is required' });
            return;
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Stream an honest orchestration feed for the workspace UI.
        const insights = getHonestInsightCards(ticker, assetClass);

        for (const [index, insight] of insights.entries()) {
            await new Promise(resolve => setTimeout(resolve, 550 + (index * 90)));
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
app.post(`${API_PREFIX}/deepdive/prefetch`, requireAuth, async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                error: 'Sign in is required to prefetch Quantus Deep Dive modules.',
                code: 'auth_required',
            });
            return;
        }

        const ticker = sanitizeQuantusTicker(req.body.ticker);
        const assetClass = sanitizeQuantusAssetClass(req.body.assetClass);
        const requestedModules = Array.isArray(req.body.modules) ? req.body.modules : null;
        const modules = (requestedModules ?? Array.from({ length: DEEP_DIVE_MODULE_COUNT }, (_, index) => index))
            .map((value) => typeof value === 'number' ? Math.floor(value) : Number.parseInt(String(value), 10))
            .filter((value) => Number.isFinite(value) && value >= 0 && value < DEEP_DIVE_MODULE_COUNT);

        if (!ticker || modules.length === 0) {
            res.status(400).json({ error: 'Valid ticker and at least one module index required' });
            return;
        }

        for (const moduleIndex of modules) {
            const access = await assertDeepDiveAccess(authHeader, moduleIndex);
            if (!access.ok) {
                res.status(access.status).json(access.data);
                return;
            }
        }

        res.status(202).json({
            status: 'warming',
            ticker,
            queuedModules: modules.length,
        });

        void (async () => {
            for (const moduleIndex of modules) {
                try {
                    await getOrCreateDeepDiveJob(ticker, moduleIndex, assetClass);
                } catch (error) {
                    console.error(`Deep dive prefetch failed for ${ticker} module ${moduleIndex}:`, error);
                }
            }
        })();
    } catch (error) {
        console.error('Error scheduling deep dive prefetch:', error);
        res.status(500).json({ error: 'Failed to schedule deep dive prefetch' });
    }
});

app.post(`${API_PREFIX}/deepdive`, requireAuth, async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                error: 'Sign in is required to open Quantus Deep Dive modules.',
                code: 'auth_required',
            });
            return;
        }

        const ticker = sanitizeQuantusTicker(req.body.ticker);
        const moduleIndex = typeof req.body.module === 'number' ? Math.min(Math.max(Math.floor(req.body.module), 0), 11) : null;
        const assetClass = sanitizeQuantusAssetClass(req.body.assetClass);
        if (!ticker || moduleIndex === null) {
            res.status(400).json({ error: 'Valid ticker and module index (0-11) required' });
            return;
        }

        const access = await assertDeepDiveAccess(authHeader, moduleIndex);
        if (!access.ok) {
            res.status(access.status).json(access.data);
            return;
        }

        const text = await getOrCreateDeepDiveJob(ticker, moduleIndex, assetClass);
        writeDeepDiveSse(res, text);
    } catch (error) {
        console.error('Error generating deep dive:', error);
        res.status(500).json({ error: 'Failed to generate deep dive' });
    }
});

// ─── SCREENER ────────────────────────────────────────────────────────────────
app.post(`${API_PREFIX}/screener`, (req, res) => {
    if (isProduction && !ALLOW_DEMO_DATA) {
        sendFeatureUnavailable(res, 'Quantus screener');
        return;
    }
    const { filters } = req.body;
    // Return mock screener results
    const results = getMockScreenerResults(filters || {});
    res.json({ results });
});

// ─── PORTFOLIO ───────────────────────────────────────────────────────────────
app.post(`${API_PREFIX}/portfolio`, (req, res) => {
    if (isProduction && !ALLOW_DEMO_DATA) {
        sendFeatureUnavailable(res, 'Quantus portfolio analysis');
        return;
    }
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
    const ticker = sanitizeQuantusTicker(req.body.ticker);
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
    if (!ENABLE_PUSH_NOTIFICATIONS) {
        sendFeatureUnavailable(res, 'Push notifications');
        return;
    }
    res.json({ ok: true });
});

app.post(`${API_PREFIX}/v1/push/unsubscribe`, (_req, res) => {
    if (!ENABLE_PUSH_NOTIFICATIONS) {
        sendFeatureUnavailable(res, 'Push notifications');
        return;
    }
    res.json({ ok: true });
});

// ─── SEC EDGAR PROXY ─────────────────────────────────────────────────────────
app.get(`${API_PREFIX}/v1/sec-edgar/:ticker`, async (req, res) => {
    const ticker = sanitizeQuantusTicker(req.params.ticker);
    if (!ticker) { res.status(400).json({ error: 'Invalid ticker' }); return; }

    try {
        const response = await fetch(`${PYTHON_API_URL}/api/v1/sec-edgar/${encodeURIComponent(ticker)}`);
        if (!response.ok) {
            res.status(response.status).json({ error: `SEC EDGAR API error: ${response.statusText}` });
            return;
        }
        const data = await response.json();
        res.json(data);
    } catch (err: any) {
        res.status(503).json({ error: `SEC EDGAR service unavailable: ${err.message}` });
    }
});

// ─── PYTHON HEALTH CHECK ─────────────────────────────────────────────────────
app.get(`${API_PREFIX}/v1/python/health`, async (_req, res) => {
    try {
        const response = await fetch(`${PYTHON_API_URL}/health`);
        if (!response.ok) {
            res.status(503).json({ status: 'down', error: response.statusText });
            return;
        }
        const data = await response.json();
        res.json({ status: 'up', ...data });
    } catch (err: any) {
        res.json({ status: 'down', error: err.message });
    }
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

function getHonestInsightCards(ticker: string, assetClass: string) {
    const assetClassNote = assetClass === 'CRYPTO'
        ? 'Routing the request through the crypto research profile.'
        : assetClass === 'COMMODITY'
            ? 'Routing the request through the commodity research profile.'
            : assetClass === 'ETF'
                ? 'Routing the request through the ETF research profile.'
                : 'Routing the request through the equity research profile.';

    return [
        { id: '1', category: 'model', text: `${ticker}: request accepted. Validating ticker format, route context, and report permissions.` },
        { id: '2', category: 'knowledge', text: `${ticker}: checking Quantus registry coverage and workspace metadata.` },
        { id: '3', category: 'momentum', text: `${ticker}: inspecting cached report availability before any live fallback is needed.` },
        { id: '4', category: 'model', text: `${ticker}: dispatching the live research request to the Quantus pipeline service.` },
        { id: '5', category: 'risk', text: `${ticker}: waiting for the pipeline to return report sections, risk framing, and regime context.` },
        { id: '6', category: 'altdata', text: `${ticker}: ${assetClassNote}` },
        { id: '7', category: 'model', text: `${ticker}: normalizing the response into the workspace report schema.` },
        { id: '8', category: 'sentiment', text: `${ticker}: assembling narrative sections for the research dashboard.` },
        { id: '9', category: 'institutional', text: `${ticker}: checking whether snapshot persistence and archive handoff are eligible for this result.` },
        { id: '10', category: 'event', text: `${ticker}: validating response freshness, source labels, and fallback messaging.` },
        { id: '11', category: 'knowledge', text: `${ticker}: preparing watchlist, archive, and related-workspace hooks for the UI.` },
        { id: '12', category: 'model', text: `${ticker}: final workspace handoff in progress. If live research is unavailable, Quantus will surface cached or starter coverage explicitly.` },
    ];
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
        const ticker = sanitizeQuantusTicker(req.params.ticker);
        if (!ticker) { res.status(400).json({ error: 'Invalid ticker' }); return; }
        if (isProduction && !ALLOW_DEMO_DATA) {
            sendFeatureUnavailable(res, 'Knowledge graph');
            return;
        }
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

// ─── ENGINE VERSION STATUS ───────────────────────────────────────────────────
app.get(`${API_PREFIX}/v1/engine/status`, (req, res) => {
    // In full prod, this hits PostgreSQL `user_engine_preferences` to see 
    // if the banner should show for this specific user.
    // Simulating true so you can build the UI component.
    res.json({
        show_banner: SHOW_ENGINE_BANNER,
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
    if (isProduction && !ALLOW_DEMO_DATA) {
        sendFeatureUnavailable(res, 'Sector packs');
        return;
    }
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
    if (isProduction && !ALLOW_DEMO_DATA) {
        sendFeatureUnavailable(res, 'Explainability');
        return;
    }
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
const server = app.listen(PORT, () => {
    console.warn(`Quantus Research Solutions API — http://localhost:${PORT}`);
    console.warn(`Engine: Meridian v2.4`);
});

// ─── Graceful shutdown (Railway / Docker SIGTERM) ───────────────────────────
function shutdown(signal: string) {
    console.warn(`${signal} received — shutting down Quantus server`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => console.error('Unhandled rejection:', reason));
process.on('uncaughtException', (err) => { console.error('Uncaught exception:', err); process.exit(1); });
