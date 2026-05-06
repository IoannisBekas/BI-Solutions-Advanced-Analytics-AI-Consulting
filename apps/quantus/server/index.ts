import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import fs from 'fs';
import helmet from 'helmet';
import path from 'path';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';
import { getMockReport } from './data/mockReports.ts';
import { getAssetByTicker, getWorkspaceStatus, getWorkspaceSummary, listAssetsForSectorPack, searchAssets } from './data/assetUniverse.ts';
import type { AssetEntry, ReportData, ReportResponse, ReportSource } from '../src/types/index.ts';
import {
    QUANTUS_INTERNAL_HEADER,
    getQuantusAiMaxOutputTokensForTier,
    getQuantusMonthlyReportLimitForTier,
    readQuantusInternalKey,
    type QuantusAiUsageType,
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
const AI_STREAM_TIMEOUT_MS = Number.parseInt(process.env.QUANTUS_AI_STREAM_TIMEOUT_MS || '60000', 10);

if (isProduction && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET env var is required in production');
}
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-local-only-never-use-in-prod';
const TOKEN_COOKIE_NAME = 'auth_token';
const REQUEST_ID_HEADER = 'x-request-id';
const REQUEST_ID_RE = /^[A-Za-z0-9._:-]{1,128}$/;
const ALLOWED_ORIGINS = validateAllowedOrigins(
    (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5001,http://127.0.0.1:5001,http://127.0.0.1:3000')
        .split(','),
);

// ─── SECURITY MIDDLEWARE ────────────────────────────────────────────────────
app.disable('x-powered-by');

function readTrustProxyHops() {
    const rawValue = process.env.TRUST_PROXY_HOPS?.trim() || (isProduction ? '1' : '0');
    const hops = Number.parseInt(rawValue, 10);

    if (!Number.isInteger(hops) || hops < 0 || hops > 5) {
        throw new Error('TRUST_PROXY_HOPS must be an integer from 0 to 5');
    }

    return hops;
}

const trustProxyHops = readTrustProxyHops();
if (trustProxyHops > 0) {
    app.set('trust proxy', trustProxyHops);
}
app.use(
    helmet({
        contentSecurityPolicy: isProduction
            ? {
                useDefaults: true,
                directives: {
                    "img-src": ["'self'", 'data:', 'https:'],
                    "script-src": ["'self'", 'https://accounts.google.com'],
                    "style-src": ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
                    "font-src": ["'self'", 'data:', 'https://fonts.gstatic.com'],
                    "frame-src": ["'self'", 'https://accounts.google.com', 'https://sslecal2.investing.com', 'https://sslecal2.forexprostools.com'],
                    "child-src": ["'self'", 'https://accounts.google.com', 'https://sslecal2.investing.com', 'https://sslecal2.forexprostools.com'],
                    "connect-src": ["'self'", ...ALLOWED_ORIGINS],
                },
            }
            : false,
        crossOriginEmbedderPolicy: false,
    }),
);
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const stateChangingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const sameOriginAllowlist = new Set([
    ...ALLOWED_ORIGINS,
    process.env.APP_URL?.trim() || '',
].filter(Boolean));

function readRequestOrigin(req: express.Request) {
    const origin = req.header('origin')?.trim();
    if (origin) {
        return origin;
    }

    const referer = req.header('referer')?.trim();
    if (!referer) {
        return '';
    }

    try {
        return new URL(referer).origin;
    } catch {
        return '';
    }
}

app.use((req, res, next) => {
    if (!isProduction || !stateChangingMethods.has(req.method)) {
        next();
        return;
    }

    const requestOrigin = readRequestOrigin(req);
    if (!requestOrigin || !sameOriginAllowlist.has(requestOrigin)) {
        res.status(403).json({ error: 'Invalid request origin.' });
        return;
    }

    next();
});

const privateApiPrefixes = [
    `${API_PREFIX}/auth`,
    `${API_PREFIX}/watchlist`,
    `${API_PREFIX}/alerts`,
    `${API_PREFIX}/report`,
    `${API_PREFIX}/generate`,
    `${API_PREFIX}/insights`,
    `${API_PREFIX}/deepdive`,
    `${API_PREFIX}/v1/push`,
    `${API_PREFIX}/v1/track`,
];

app.use((req, res, next) => {
    if (privateApiPrefixes.some((prefix) => req.path.startsWith(prefix))) {
        res.setHeader('Cache-Control', 'no-store');
    }
    next();
});

app.use((req, res, next) => {
    const candidateRequestId = req.header(REQUEST_ID_HEADER)?.trim()
        || req.header('request-id')?.trim()
        || '';
    const requestId = REQUEST_ID_RE.test(candidateRequestId)
        ? candidateRequestId
        : crypto.randomUUID();

    req.requestId = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);

    const start = Date.now();
    res.on('finish', () => {
        process.stdout.write(`[${requestId}] ${req.method} ${req.path} ${res.statusCode} in ${Date.now() - start}ms\n`);
    });

    next();
});

const missingEnv = readMissingQuantusEnv();
if (missingEnv.length > 0) {
    console.warn(`Quantus optional env vars missing: ${missingEnv.join(', ')}`);
}

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

interface QuantusAiBudgetResponse extends RootJsonMap {
    usageType?: QuantusAiUsageType;
    dailyTokenBudget?: number;
    reservedTokens?: number;
    remainingTokens?: number;
    usageDate?: string;
    user?: QuantusSafeUser | null;
}

declare module 'express-serve-static-core' {
    interface Request {
        requestId?: string;
    }
}

interface RootAuthContext {
    authorization?: string;
    cookie?: string;
    requestId?: string;
}

interface RootJsonMap {
    [key: string]: unknown;
}

interface PersistedWatchlistSnapshot {
    priceAtGen?: number;
    signal?: string;
    confidence?: number;
    regime?: string;
    generatedAt?: string;
}

interface PersistedWatchlistEntry {
    ticker?: string;
    assetClass?: string;
    updatedAt?: string;
    latestSnapshot?: PersistedWatchlistSnapshot | null;
}

interface PythonReportPayload extends RootJsonMap {
    report?: ReportData;
    source?: unknown;
    warning?: string;
}

function getErrorMessage(error: unknown) {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

function extractQuantusSafeUser(value: unknown): QuantusSafeUser | null {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const candidate = value as Record<string, unknown>;
    if (
        typeof candidate.id !== 'string'
        || typeof candidate.email !== 'string'
        || typeof candidate.name !== 'string'
        || typeof candidate.tier !== 'string'
        || typeof candidate.credits !== 'number'
        || typeof candidate.reportsThisMonth !== 'number'
        || typeof candidate.jurisdiction !== 'string'
    ) {
        return null;
    }

    return {
        id: candidate.id,
        email: candidate.email,
        name: candidate.name,
        tier: candidate.tier,
        credits: candidate.credits,
        reportsThisMonth: candidate.reportsThisMonth,
        jurisdiction: candidate.jurisdiction as QuantusSafeUser['jurisdiction'],
    };
}

function getRequestId(req: express.Request) {
    return req.requestId || 'unknown';
}

function getRequestLogLabel(req: express.Request) {
    return `[${getRequestId(req)}] ${req.method} ${req.path}`;
}

function validateAllowedOrigins(rawOrigins: string[]) {
    const origins = rawOrigins.map((origin) => origin.trim()).filter(Boolean);

    if (isProduction && origins.length === 0) {
        throw new Error('ALLOWED_ORIGINS env var must be set in production');
    }

    for (const origin of origins) {
        if (origin === '*') {
            throw new Error("ALLOWED_ORIGINS must not contain wildcard '*' when credentials are enabled");
        }
        try {
            const parsed = new URL(origin);
            if (isProduction && parsed.protocol !== 'https:') {
                throw new Error(`ALLOWED_ORIGINS entry "${origin}" must use https:// in production`);
            }
            if (!parsed.hostname || parsed.hostname.includes('*')) {
                throw new Error(`ALLOWED_ORIGINS entry "${origin}" must be a concrete origin`);
            }
        } catch (error) {
            throw new Error(`Invalid ALLOWED_ORIGINS entry "${origin}": ${(error as Error).message}`);
        }
    }

    return origins;
}

function readMissingQuantusEnv() {
    const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY?.trim());
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY?.trim());
    const hasNewsKey = Boolean(process.env.FMP_API_KEY?.trim());
    const hasGoogleClientId = Boolean(process.env.GOOGLE_CLIENT_ID?.trim());
    const hasCustomEdgarUserAgent = Boolean(process.env.SEC_EDGAR_USER_AGENT?.trim());

    const missing: string[] = [];
    if (!hasAnthropicKey && !hasGeminiKey) {
        missing.push('ANTHROPIC_API_KEY or GEMINI_API_KEY');
    }
    if (!hasNewsKey) {
        missing.push('FMP_API_KEY');
    }
    if (!hasGoogleClientId) {
        missing.push('GOOGLE_CLIENT_ID');
    }
    if (!hasCustomEdgarUserAgent) {
        missing.push('SEC_EDGAR_USER_AGENT');
    }

    return missing;
}

function getRequestCookieHeader(req: express.Request) {
    const rawCookie = req.headers.cookie;
    if (Array.isArray(rawCookie)) {
        return rawCookie.join('; ');
    }
    return typeof rawCookie === 'string' && rawCookie.trim() ? rawCookie : undefined;
}

function getCookieValue(cookieHeader: string | undefined, name: string) {
    if (!cookieHeader) {
        return undefined;
    }

    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${escapedName}=([^;]+)`));
    if (!match?.[1]) {
        return undefined;
    }

    try {
        return decodeURIComponent(match[1]);
    } catch {
        return match[1];
    }
}

function getRequestToken(req: express.Request) {
    const authHeader = req.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    return getCookieValue(getRequestCookieHeader(req), TOKEN_COOKIE_NAME);
}

function getRequestAuthContext(req: express.Request): RootAuthContext {
    return {
        authorization: typeof req.headers.authorization === 'string' ? req.headers.authorization : undefined,
        cookie: getRequestCookieHeader(req),
        requestId: getRequestId(req),
    };
}

function hasAuthContext(auth: RootAuthContext) {
    return Boolean(auth.authorization || auth.cookie);
}

function applyRootAuthHeaders(headers: Headers, auth: RootAuthContext) {
    if (auth.authorization) {
        headers.set('authorization', auth.authorization);
    }
    if (auth.cookie) {
        headers.set('cookie', auth.cookie);
    }
    if (auth.requestId) {
        headers.set(REQUEST_ID_HEADER, auth.requestId);
    }
}

function buildRootAuthHeaderRecord(auth: RootAuthContext, includeJsonContentType = false) {
    const headers: Record<string, string> = {};
    if (auth.authorization) {
        headers.authorization = auth.authorization;
    }
    if (auth.cookie) {
        headers.cookie = auth.cookie;
    }
    if (auth.requestId) {
        headers[REQUEST_ID_HEADER] = auth.requestId;
    }
    if (includeJsonContentType) {
        headers['content-type'] = 'application/json';
    }
    return headers;
}

function buildPythonHeaders(req: express.Request, baseHeaders?: Record<string, string>) {
    const headers: Record<string, string> = {
        ...(baseHeaders ?? {}),
        [REQUEST_ID_HEADER]: getRequestId(req),
    };

    if (QUANTUS_INTERNAL_KEY) {
        headers[QUANTUS_INTERNAL_HEADER] = QUANTUS_INTERNAL_KEY;
    }

    return headers;
}

function getUpstreamSetCookies(upstream: globalThis.Response) {
    const headersWithSetCookie = upstream.headers as Headers & { getSetCookie?: () => string[] };
    if (typeof headersWithSetCookie.getSetCookie === 'function') {
        return headersWithSetCookie.getSetCookie().filter(Boolean);
    }

    const header = upstream.headers.get('set-cookie');
    return header ? [header] : [];
}

function forwardUpstreamSetCookies(res: express.Response, upstream: globalThis.Response) {
    const cookies = getUpstreamSetCookies(upstream);
    if (cookies.length > 0) {
        res.setHeader('set-cookie', cookies);
    }
}

function optionalAuth(req: AuthenticatedRequest, _res: express.Response, next: express.NextFunction) {
    const token = getRequestToken(req);
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
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

function authenticatedRateLimitKey(req: express.Request) {
    const userId = (req as AuthenticatedRequest).user?.userId;
    return userId ? `user:${userId}` : ipKeyGenerator(req.ip || '');
}

const authenticatedAiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    keyGenerator: authenticatedRateLimitKey,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Account AI rate limit reached - try again in a few minutes.' },
});

const authenticatedReportLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 30,
    keyGenerator: authenticatedRateLimitKey,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Account report rate limit reached - try again later.' },
});

app.use(`${API_PREFIX}/generate`, authenticatedAiLimiter);
app.use(`${API_PREFIX}/insights`, authenticatedAiLimiter);
app.use(`${API_PREFIX}/deepdive`, authenticatedAiLimiter);
app.use(`${API_PREFIX}/report`, authenticatedReportLimiter);

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
        const headers = buildRootAuthHeaderRecord(getRequestAuthContext(req), method !== 'GET');

        const upstream = await fetch(`${AUTH_API_TARGET}${path}`, {
            method,
            headers,
            body: method !== 'GET' ? JSON.stringify(req.body) : undefined,
            signal: AbortSignal.timeout(10_000),
        });

        const text = await upstream.text();
        forwardUpstreamSetCookies(res, upstream);
        res
            .status(upstream.status)
            .setHeader('content-type', upstream.headers.get('content-type') || 'application/json')
            .send(text);
    } catch (error) {
        console.error(`${getRequestLogLabel(req)} auth proxy error (${path}):`, error);
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

app.post(`${API_PREFIX}/auth/logout`, (req, res) => {
    proxyAuthRequest('POST', '/api/auth/logout', req, res);
});

app.delete(`${API_PREFIX}/auth/account`, (req, res) => {
    proxyAuthRequest('DELETE', '/api/auth/account', req, res);
});

async function fetchRootJson(
    path: string,
    init: RequestInit = {},
    auth: RootAuthContext = {},
): Promise<{ ok: boolean; status: number; data: RootJsonMap; text: string }> {
    const headers = new Headers(init.headers);
    applyRootAuthHeaders(headers, auth);
    if (init.body && !headers.has('content-type')) {
        headers.set('content-type', 'application/json');
    }

    const upstream = await fetch(`${AUTH_API_TARGET}${path}`, {
        ...init,
        headers,
        signal: init.signal ?? AbortSignal.timeout(10_000),
    });

    const text = await upstream.text();
    let data: RootJsonMap = {};

    if (text) {
        try {
            const parsed = JSON.parse(text);
            data = typeof parsed === 'object' && parsed !== null ? parsed as RootJsonMap : { message: text };
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

async function fetchFreshAuthenticatedUser(auth: RootAuthContext = {}): Promise<{ ok: boolean; status: number; data: RootJsonMap; text: string; user: QuantusSafeUser | null }> {
    const upstream = await fetchRootJson('/api/auth/me', { method: 'GET' }, auth);
    return {
        ...upstream,
        user: upstream.ok ? upstream.data as unknown as QuantusSafeUser : null,
    };
}

async function consumeReportAllowance(auth: RootAuthContext) {
    return fetchRootJson(
        '/api/quantus/usage/report',
        {
            method: 'POST',
            body: JSON.stringify({}),
        },
        auth,
    );
}

async function consumeAiBudget(
    auth: RootAuthContext,
    usageType: QuantusAiUsageType,
    requestedTokens: number,
): Promise<{ ok: boolean; status: number; data: QuantusAiBudgetResponse; user: QuantusSafeUser | null }> {
    const upstream = await fetchRootJson(
        '/api/quantus/usage/ai-budget',
        {
            method: 'POST',
            body: JSON.stringify({ usageType, requestedTokens }),
        },
        auth,
    );

    return {
        ok: upstream.ok,
        status: upstream.status,
        data: upstream.data as QuantusAiBudgetResponse,
        user: extractQuantusSafeUser((upstream.data as QuantusAiBudgetResponse | undefined)?.user),
    };
}

async function assertDeepDiveAccess(auth: RootAuthContext, moduleIndex: number) {
    return fetchRootJson(
        '/api/quantus/usage/deep-dive-access',
        {
            method: 'POST',
            body: JSON.stringify({ module: moduleIndex }),
        },
        auth,
    );
}

function createRequestAbortBundle(req: express.Request, timeoutMs: number) {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
        controller.abort(new Error(`AI stream timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    const abortOnClose = () => {
        controller.abort(new Error('Client connection closed'));
    };

    req.on('close', abortOnClose);

    return {
        signal: controller.signal,
        cleanup() {
            clearTimeout(timeout);
            req.off('close', abortOnClose);
        },
    };
}

function isAbortLikeError(error: unknown, signal?: AbortSignal) {
    return Boolean(
        signal?.aborted
        || (error instanceof Error && (error.name === 'AbortError' || /aborted|timeout|closed/i.test(error.message))),
    );
}

async function proxyRootRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    req: express.Request,
    res: express.Response,
) {
    try {
        const headers = buildRootAuthHeaderRecord(getRequestAuthContext(req), method !== 'GET');

        const upstream = await fetch(`${AUTH_API_TARGET}${path}`, {
            method,
            headers,
            body: method === 'GET' ? undefined : JSON.stringify(req.body),
            signal: AbortSignal.timeout(10_000),
        });

        const text = await upstream.text();
        forwardUpstreamSetCookies(res, upstream);
        res
            .status(upstream.status)
            .setHeader('content-type', upstream.headers.get('content-type') || 'application/json')
            .send(text);
    } catch (error) {
        console.error(`${getRequestLogLabel(req)} root proxy error (${path}):`, error);
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

function buildWatchlistItem(entry: PersistedWatchlistEntry) {
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

async function persistReportSnapshot(response: ReportResponse, requestId?: string) {
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
                ...(requestId ? { [REQUEST_ID_HEADER]: requestId } : {}),
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
        console.error(`[${requestId || 'unknown'}] Snapshot persistence failed for ${response.report.report_id}:`, error);
    }
}

app.get(`${API_PREFIX}/watchlist`, async (req, res) => {
    try {
        const upstream = await fetchRootJson('/api/quantus/watchlist', { method: 'GET' }, getRequestAuthContext(req));
        if (!upstream.ok) {
            res.status(upstream.status).json(upstream.data);
            return;
        }

        const items = Array.isArray(upstream.data?.items)
            ? upstream.data.items
                .filter((entry): entry is PersistedWatchlistEntry => typeof entry === 'object' && entry !== null)
                .map((entry) => buildWatchlistItem(entry))
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

async function callPythonPipeline(
    ticker: string,
    options: { forceRefresh?: boolean; userTier?: string; requestId?: string } = {},
): Promise<{ success: boolean; data?: PythonReportPayload; error?: string }> {
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
            headers: {
                Accept: 'application/json',
                ...(options.requestId ? { [REQUEST_ID_HEADER]: options.requestId } : {}),
                ...(QUANTUS_INTERNAL_KEY ? { [QUANTUS_INTERNAL_HEADER]: QUANTUS_INTERNAL_KEY } : {}),
            },
        });
        clearTimeout(timeout);

        if (!response.ok) {
            const errorBody = await response.text();
            return { success: false, error: `Python API returned ${response.status}: ${errorBody}` };
        }

        const data = await response.json() as PythonReportPayload;
        return { success: true, data };
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
            return { success: false, error: `Python pipeline timeout (${Math.round(PYTHON_PIPELINE_TIMEOUT_MS / 1000)}s)` };
        }
        return { success: false, error: `Python API unavailable: ${getErrorMessage(error)}` };
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

function getDeepDiveCacheKey(
    ticker: string,
    moduleIndex: number,
    assetClass: string,
    maxOutputTokens: number,
) {
    return `${ticker}:${assetClass}:${moduleIndex}:${maxOutputTokens}`;
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

async function generateDeepDiveText(
    ticker: string,
    moduleIndex: number,
    assetClass: string,
    maxOutputTokens: number,
) {
    const prompt = getDeepDivePrompt(ticker, moduleIndex, assetClass);
    const stream = await getAI().models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            maxOutputTokens,
            httpOptions: { timeout: AI_STREAM_TIMEOUT_MS },
        },
    });

    let text = '';
    for await (const chunk of stream) {
        if (chunk.text) {
            text += chunk.text;
        }
    }

    return text || 'Analysis complete.';
}

function getOrCreateDeepDiveJob(
    ticker: string,
    moduleIndex: number,
    assetClass: string,
    maxOutputTokens: number,
) {
    const cacheKey = getDeepDiveCacheKey(ticker, moduleIndex, assetClass, maxOutputTokens);
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
            const text = await generateDeepDiveText(ticker, moduleIndex, assetClass, maxOutputTokens);
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
    const authContext = getRequestAuthContext(req);
    if (!hasAuthContext(authContext)) {
        res.status(401).json({
            error: 'Sign in is required to generate a full Quantus report.',
            code: 'auth_required',
        });
        return;
    }

    const authState = await fetchFreshAuthenticatedUser(authContext);
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
            const usageResult = await consumeReportAllowance(authContext);
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
        requestId: getRequestId(req),
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
            void persistReportSnapshot(response, getRequestId(req));
        }
        await finalizeReportResponse(response);
        return;
    }

    // 2. Log the pipeline failure and fall back to mocks
    if (liveResult.error) {
        console.warn(`${getRequestLogLabel(req)} pipeline fallback for ${ticker}: ${liveResult.error}`);
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
    console.error(`${getRequestLogLabel(req)} report endpoint crash for ${req.params.ticker}:`, err);
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
                signal: AbortSignal.timeout(2000),
                headers: buildPythonHeaders(req),
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
app.post(`${API_PREFIX}/generate`, requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
        const ticker = sanitizeQuantusTicker(req.body.ticker);
        const assetClass = sanitizeQuantusAssetClass(req.body.assetClass);
        if (!ticker) {
            res.status(400).json({ error: 'Valid ticker is required (1-20 alphanumeric chars)' });
            return;
        }

        const authContext = getRequestAuthContext(req);
        const authState = await fetchFreshAuthenticatedUser(authContext);
        if (!authState.ok || !authState.user) {
            res.status(authState.status || 401).json(authState.data?.error ? authState.data : {
                error: 'Authentication is required to generate Quantus narrative sections.',
                code: 'auth_required',
            });
            return;
        }

        // Check for cached mock report
        const mockReport = getMockReport(ticker);

        if (mockReport) {
            // Return the full cached report immediately
            res.json({ cached: true, report: mockReport });
            return;
        }

        const userTier = sanitizeQuantusUserTier(authState.user.tier);
        const maxOutputTokens = getQuantusAiMaxOutputTokensForTier(userTier, 'report_generation');
        const budgetReservation = await consumeAiBudget(authContext, 'report_generation', maxOutputTokens);
        if (!budgetReservation.ok) {
            res.status(budgetReservation.status).json(budgetReservation.data);
            return;
        }

        // Generate narrative via Gemini for unknown tickers
        const section = typeof req.body.section === 'string' ? req.body.section.slice(0, 50) : 'executive_summary';
        const systemPrompt = getSystemPromptForClass(assetClass);
        const sectionPrompt = getSectionPrompt(ticker, section);
        const abortBundle = createRequestAbortBundle(req, AI_STREAM_TIMEOUT_MS);

        try {
            const stream = await getAI().models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: `${systemPrompt}\n\n${sectionPrompt}`,
                config: {
                    maxOutputTokens,
                    abortSignal: abortBundle.signal,
                    httpOptions: { timeout: AI_STREAM_TIMEOUT_MS },
                },
            });

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            for await (const chunk of stream) {
                if (abortBundle.signal.aborted) {
                    break;
                }

                if (chunk.text) {
                    res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
                }
            }

            if (!abortBundle.signal.aborted) {
                res.write('data: [DONE]\n\n');
                res.end();
            }
        } catch (error) {
            if (isAbortLikeError(error, abortBundle.signal)) {
                const reason = abortBundle.signal.reason instanceof Error
                    ? abortBundle.signal.reason.message
                    : String(abortBundle.signal.reason ?? 'Request aborted');
                if (!res.headersSent && !res.destroyed) {
                    res.status(/timeout/i.test(reason) ? 408 : 499).json({
                        error: /timeout/i.test(reason)
                            ? 'Quantus generation timed out.'
                            : 'Client closed the generation request.',
                    });
                } else if (!res.writableEnded) {
                    res.end();
                }
                return;
            }

            throw error;
        } finally {
            abortBundle.cleanup();
        }
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
app.post(`${API_PREFIX}/deepdive/prefetch`, async (req: AuthenticatedRequest, res) => {
    try {
        const authContext = getRequestAuthContext(req);
        if (!hasAuthContext(authContext)) {
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
            .filter((value): value is number => Number.isFinite(value) && value >= 0 && value < DEEP_DIVE_MODULE_COUNT);
        const uniqueModules = Array.from(new Set<number>(modules));

        if (!ticker || uniqueModules.length === 0) {
            res.status(400).json({ error: 'Valid ticker and at least one module index required' });
            return;
        }

        const reservedModules: Array<{ moduleIndex: number; maxOutputTokens: number }> = [];
        for (const moduleIndex of uniqueModules) {
            const access = await assertDeepDiveAccess(authContext, moduleIndex);
            if (!access.ok) {
                res.status(access.status).json(access.data);
                return;
            }

            const user = extractQuantusSafeUser(access.data?.user);
            const userTier = sanitizeQuantusUserTier(user?.tier ?? req.user?.tier);
            const maxOutputTokens = getQuantusAiMaxOutputTokensForTier(userTier, 'deep_dive');
            const budgetReservation = await consumeAiBudget(authContext, 'deep_dive', maxOutputTokens);
            if (!budgetReservation.ok) {
                res.status(budgetReservation.status).json(budgetReservation.data);
                return;
            }

            reservedModules.push({ moduleIndex, maxOutputTokens });
        }

        res.status(202).json({
            status: 'warming',
            ticker,
            queuedModules: reservedModules.length,
        });

        void (async () => {
            for (const module of reservedModules) {
                try {
                    await getOrCreateDeepDiveJob(
                        ticker,
                        module.moduleIndex,
                        assetClass,
                        module.maxOutputTokens,
                    );
                } catch (error) {
                    console.error(`Deep dive prefetch failed for ${ticker} module ${module.moduleIndex}:`, error);
                }
            }
        })();
    } catch (error) {
        console.error('Error scheduling deep dive prefetch:', error);
        res.status(500).json({ error: 'Failed to schedule deep dive prefetch' });
    }
});

app.post(`${API_PREFIX}/deepdive`, async (req: AuthenticatedRequest, res) => {
    try {
        const authContext = getRequestAuthContext(req);
        if (!hasAuthContext(authContext)) {
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

        const access = await assertDeepDiveAccess(authContext, moduleIndex);
        if (!access.ok) {
            res.status(access.status).json(access.data);
            return;
        }

        const user = extractQuantusSafeUser(access.data?.user);
        const userTier = sanitizeQuantusUserTier(user?.tier ?? req.user?.tier);
        const maxOutputTokens = getQuantusAiMaxOutputTokensForTier(userTier, 'deep_dive');
        const budgetReservation = await consumeAiBudget(authContext, 'deep_dive', maxOutputTokens);
        if (!budgetReservation.ok) {
            res.status(budgetReservation.status).json(budgetReservation.data);
            return;
        }

        let clientClosed = false;
        const markClosed = () => {
            clientClosed = true;
        };
        req.on('close', markClosed);

        try {
            const text = await getOrCreateDeepDiveJob(ticker, moduleIndex, assetClass, maxOutputTokens);
            if (clientClosed || res.destroyed) {
                return;
            }
            writeDeepDiveSse(res, text);
        } finally {
            req.off('close', markClosed);
        }
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
        const response = await fetch(
            `${PYTHON_API_URL}/api/v1/sec-edgar/${encodeURIComponent(ticker)}`,
            { headers: buildPythonHeaders(req) },
        );
        if (!response.ok) {
            res.status(response.status).json({ error: `SEC EDGAR API error: ${response.statusText}` });
            return;
        }
        const data = await response.json();
        res.json(data);
    } catch (error: unknown) {
        res.status(503).json({ error: `SEC EDGAR service unavailable: ${getErrorMessage(error)}` });
    }
});

// ─── NEWS PROXY ──────────────────────────────────────────────────────────────
app.get(`${API_PREFIX}/v1/news/:ticker`, async (req, res) => {
    const ticker = sanitizeQuantusTicker(req.params.ticker);
    if (!ticker) { res.status(400).json({ error: 'Invalid ticker' }); return; }

    const limit = Math.min(Number(req.query.limit) || 20, 50);
    try {
        const response = await fetch(
            `${PYTHON_API_URL}/api/v1/news/${encodeURIComponent(ticker)}?limit=${limit}`,
            {
                signal: AbortSignal.timeout(15_000),
                headers: buildPythonHeaders(req),
            },
        );
        if (!response.ok) {
            // Graceful: return empty if Python API unavailable
            res.json({ ticker, articles: [], avg_sentiment: 0, count: 0 });
            return;
        }
        const data = await response.json();
        res.json(data);
    } catch {
        res.json({ ticker, articles: [], avg_sentiment: 0, count: 0 });
    }
});

// ─── SCANNER ─────────────────────────────────────────────────────────────────
app.get(`${API_PREFIX}/v1/scanner`, async (req, res) => {
    const signal      = typeof req.query.signal === 'string'      ? req.query.signal      : undefined;
    const assetClass  = typeof req.query.asset_class === 'string' ? req.query.asset_class : undefined;
    const hasNews     = req.query.has_news === 'true';
    const hasFilings  = req.query.has_filings === 'true';
    const sortBy      = typeof req.query.sort_by === 'string'     ? req.query.sort_by     : 'confidence_score';
    const limit       = Math.min(Number(req.query.limit) || 50, 100);

    try {
        const pyRes = await fetch(
            `${PYTHON_API_URL}/api/v1/screener?limit=${limit}&sort_by=${sortBy}` +
            (signal     ? `&signal=${encodeURIComponent(signal)}` : '') +
            (assetClass ? `&asset_class=${encodeURIComponent(assetClass)}` : ''),
            {
                signal: AbortSignal.timeout(10_000),
                headers: buildPythonHeaders(req),
            },
        );
        if (!pyRes.ok) { res.status(502).json({ error: 'Scanner unavailable' }); return; }
        const data = await pyRes.json();
        let results = (data.results || []) as Record<string, unknown>[];

        // Post-filter by news/filings flags using report cache metadata
        if (hasNews || hasFilings) {
            results = results.filter((r) => {
                if (hasNews    && !r.has_news)    return false;
                if (hasFilings && !r.has_filings) return false;
                return true;
            });
        }
        res.json({ results, total: results.length });
    } catch (error: unknown) {
        res.status(503).json({ error: `Scanner unavailable: ${getErrorMessage(error)}` });
    }
});

// ─── PYTHON HEALTH CHECK ─────────────────────────────────────────────────────
app.get(`${API_PREFIX}/v1/python/health`, async (req, res) => {
    try {
        const response = await fetch(`${PYTHON_API_URL}/health`, {
            headers: buildPythonHeaders(req),
        });
        if (!response.ok) {
            res.status(503).json({ status: 'down', requestId: getRequestId(req) });
            return;
        }
        const data = await response.json();
        res.json({
            status: 'up',
            timestamp: typeof data?.timestamp === 'string' ? data.timestamp : new Date().toISOString(),
            requestId: getRequestId(req),
        });
    } catch {
        res.status(503).json({ status: 'down', requestId: getRequestId(req) });
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

function buildSectorPackPreview(asset: AssetEntry) {
    const report = getMockReport(asset.ticker) ?? buildStarterReport(asset);

    return {
        ticker: report.ticker,
        company_name: report.company_name,
        overall_signal: report.overall_signal,
        confidence_score: report.confidence_score,
        regime: report.regime,
        executive_summary: {
            narrative_plain: report.narrative_plain,
            narrative_technical: report.narrative_executive_summary ?? report.narrative_plain,
        },
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
    const { sector } = req.params;
    const reports = listAssetsForSectorPack(sector, 20).map(buildSectorPackPreview);

    if (reports.length === 0) {
        res.status(404).json({
            error: `No sector starter coverage is configured yet for ${sector}.`,
            code: 'sector_not_seeded',
        });
        return;
    }

    res.json({
        sector,
        tier_access: 'authorized',
        generated_at: new Date().toISOString(),
        reports,
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
    console.error(`[${getRequestId(req)}] Express error ${req.method} ${req.url}:`, err);
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
