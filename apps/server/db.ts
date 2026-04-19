import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import {
  sanitizeQuantusAiUsageType,
  type QuantusAiUsageType,
} from "../../shared/quantus";

// ─── Database location ───────────────────────────────────────────────────────
// In production (Railway), use a volume-mounted path; otherwise use local ./data
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "bisolutions.db");
const db = new Database(DB_PATH);

// ─── Pragmas for performance & safety ────────────────────────────────────────
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");

// ─── Schema migrations ──────────────────────────────────────────────────────
// Simple version-tracked migrations. The schema_version table tracks which
// migrations have been applied so we never re-run them.

db.exec(`
  CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

function getSchemaVersion(): number {
  const row = db.prepare("SELECT MAX(version) as v FROM schema_version").get() as { v: number | null } | undefined;
  return row?.v ?? 0;
}

function setSchemaVersion(version: number): void {
  db.prepare("INSERT OR IGNORE INTO schema_version (version) VALUES (?)").run(version);
}

function hasTableColumn(tableName: "users" | "app_meta", columnName: string): boolean {
  const rows = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
  return rows.some((row) => row.name === columnName);
}

// Migration 1: Initial users table
if (getSchemaVersion() < 1) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name          TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      tier          TEXT NOT NULL DEFAULT 'FREE',
      credits       INTEGER NOT NULL DEFAULT 0,
      reports_this_month INTEGER NOT NULL DEFAULT 0,
      jurisdiction  TEXT NOT NULL DEFAULT 'US',
      referral_token TEXT UNIQUE,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_referral ON users(referral_token);
  `);
  // Round any existing REAL credits to INTEGER (safe for existing DBs)
  db.exec("UPDATE users SET credits = CAST(ROUND(credits) AS INTEGER) WHERE typeof(credits) = 'real'");
  setSchemaVersion(1);
  console.log("DB migration 1 applied: users table + credits → INTEGER");
}

// Migration 2: Quantus persistence tables
if (getSchemaVersion() < 2) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS quantus_watchlists (
      user_id      TEXT NOT NULL,
      ticker       TEXT NOT NULL,
      asset_class  TEXT NOT NULL DEFAULT 'EQUITY',
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, ticker),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_quantus_watchlists_user ON quantus_watchlists(user_id);

    CREATE TABLE IF NOT EXISTS quantus_alert_subscriptions (
      user_id         TEXT NOT NULL,
      ticker          TEXT NOT NULL,
      asset_class     TEXT NOT NULL DEFAULT 'EQUITY',
      email_enabled   INTEGER NOT NULL DEFAULT 1,
      push_enabled    INTEGER NOT NULL DEFAULT 0,
      signal_change   INTEGER NOT NULL DEFAULT 1,
      price_breakout  INTEGER NOT NULL DEFAULT 1,
      regime_shift    INTEGER NOT NULL DEFAULT 1,
      daily_digest    INTEGER NOT NULL DEFAULT 0,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, ticker),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_quantus_alerts_user ON quantus_alert_subscriptions(user_id);

    CREATE TABLE IF NOT EXISTS quantus_report_snapshots (
      report_id               TEXT PRIMARY KEY,
      ticker                  TEXT NOT NULL,
      asset_class             TEXT NOT NULL DEFAULT 'EQUITY',
      company_name            TEXT NOT NULL,
      sector                  TEXT NOT NULL DEFAULT '',
      engine_version          TEXT NOT NULL,
      signal                  TEXT NOT NULL,
      confidence_score        INTEGER NOT NULL DEFAULT 0,
      regime_label            TEXT NOT NULL DEFAULT '',
      market_cap_bucket       TEXT,
      benchmark_symbol        TEXT,
      benchmark_price_at_gen  REAL,
      generated_at            TEXT NOT NULL,
      price_at_gen            REAL NOT NULL DEFAULT 0,
      source                  TEXT NOT NULL DEFAULT 'live',
      report_json             TEXT NOT NULL,
      created_at              TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_quantus_snapshots_ticker_generated
      ON quantus_report_snapshots(ticker, generated_at DESC);

    CREATE TABLE IF NOT EXISTS quantus_signal_outcomes (
      report_id               TEXT PRIMARY KEY,
      ticker                  TEXT NOT NULL,
      asset_class             TEXT NOT NULL DEFAULT 'EQUITY',
      sector                  TEXT NOT NULL DEFAULT '',
      signal                  TEXT NOT NULL,
      engine_version          TEXT NOT NULL,
      regime_label            TEXT NOT NULL DEFAULT '',
      market_cap_bucket       TEXT,
      price_at_gen            REAL NOT NULL DEFAULT 0,
      benchmark_symbol        TEXT,
      benchmark_price_at_gen  REAL,
      generated_at            TEXT NOT NULL,
      resolved_at             TEXT,
      price_at_30d            REAL,
      benchmark_price_at_30d  REAL,
      return_pct              REAL,
      excess_pct              REAL,
      win_rate_flag           INTEGER,
      created_at              TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at              TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_quantus_outcomes_ticker_generated
      ON quantus_signal_outcomes(ticker, generated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_quantus_outcomes_resolved
      ON quantus_signal_outcomes(return_pct, resolved_at DESC);
  `);
  setSchemaVersion(2);
  console.log("DB migration 2 applied: Quantus watchlists, alerts, snapshots, outcomes");
}

// Migration 3: persistent app metadata + auth provider tracking
if (getSchemaVersion() < 3) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key         TEXT PRIMARY KEY,
      value       TEXT NOT NULL,
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  if (!hasTableColumn("users", "auth_provider")) {
    db.exec("ALTER TABLE users ADD COLUMN auth_provider TEXT NOT NULL DEFAULT 'password'");
  }

  setSchemaVersion(3);
  console.log("DB migration 3 applied: app_meta + auth_provider");
}

// Migration 4: persistent Quantus AI daily budget accounting
if (getSchemaVersion() < 4) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS quantus_ai_daily_usage (
      user_id         TEXT NOT NULL,
      usage_date      TEXT NOT NULL,
      usage_type      TEXT NOT NULL,
      reserved_tokens INTEGER NOT NULL DEFAULT 0,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, usage_date, usage_type),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_quantus_ai_daily_usage_user_date
      ON quantus_ai_daily_usage(user_id, usage_date);
  `);
  setSchemaVersion(4);
  console.log("DB migration 4 applied: Quantus AI daily usage");
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DbUser {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  auth_provider: string;
  tier: string;
  credits: number;
  reports_this_month: number;
  jurisdiction: string;
  referral_token: string | null;
  created_at: string;
  updated_at: string;
}

/** Public-facing user (no password hash) */
export interface SafeUser {
  id: string;
  email: string;
  name: string;
  authProvider: string;
  tier: string;
  credits: number;
  reportsThisMonth: number;
  jurisdiction: string;
  referralToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbQuantusSnapshotSummary {
  report_id: string;
  ticker: string;
  asset_class: string;
  company_name: string;
  sector: string;
  engine_version: string;
  signal: string;
  confidence_score: number;
  regime_label: string;
  market_cap_bucket: string | null;
  benchmark_symbol: string | null;
  benchmark_price_at_gen: number | null;
  generated_at: string;
  price_at_gen: number;
  source: string;
}

export interface DbQuantusWatchlistEntry {
  user_id: string;
  ticker: string;
  asset_class: string;
  created_at: string;
  updated_at: string;
  latest_snapshot?: DbQuantusSnapshotSummary | null;
}

export interface DbQuantusAlertSubscription {
  user_id: string;
  ticker: string;
  asset_class: string;
  email_enabled: number;
  push_enabled: number;
  signal_change: number;
  price_breakout: number;
  regime_shift: number;
  daily_digest: number;
  created_at: string;
  updated_at: string;
}

export interface DbQuantusReportSnapshot extends DbQuantusSnapshotSummary {
  report_json: string;
  created_at: string;
}

export interface DbQuantusAccuracyOutcome {
  report_id: string;
  ticker: string;
  asset_class: string;
  sector: string;
  signal: string;
  engine_version: string;
  regime_label: string;
  market_cap_bucket: string | null;
  price_at_gen: number;
  benchmark_symbol: string | null;
  benchmark_price_at_gen: number | null;
  generated_at: string;
  resolved_at: string | null;
  price_at_30d: number | null;
  benchmark_price_at_30d: number | null;
  return_pct: number | null;
  excess_pct: number | null;
  win_rate_flag: number | null;
  created_at: string;
  updated_at: string;
}

export interface QuantusAlertSubscriptionInput {
  ticker: string;
  assetClass: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  signalChange: boolean;
  priceBreakout: boolean;
  regimeShift: boolean;
  dailyDigest: boolean;
}

export interface QuantusSnapshotInput {
  reportId: string;
  ticker: string;
  assetClass: string;
  companyName: string;
  sector: string;
  engineVersion: string;
  signal: string;
  confidenceScore: number;
  regimeLabel: string;
  marketCapBucket?: string | null;
  benchmarkSymbol?: string | null;
  benchmarkPriceAtGen?: number | null;
  generatedAt: string;
  priceAtGen: number;
  source: string;
  reportJson: string;
}

export interface QuantusAiBudgetResult {
  ok: boolean;
  dailyLimit: number;
  remainingTokens: number;
  reservedTokens: number;
  usageDate: string;
  usageType: QuantusAiUsageType;
}

export interface QuantusAccuracyRow {
  label: string;
  count: number;
  avg_return_pct: number;
  avg_excess_pct: number | null;
  win_rate: number | null;
}

export interface QuantusAccuracySummary {
  resolved_count: number;
  pending_count: number;
  unlock_threshold: number;
  engine_inception: string | null;
  last_updated: string | null;
  methodology_note: string;
  overall_avg_return_pct: number | null;
  overall_win_rate: number | null;
  best_engine: string | null;
  by_signal: QuantusAccuracyRow[];
  by_engine: QuantusAccuracyRow[];
  by_regime: QuantusAccuracyRow[];
  by_sector: QuantusAccuracyRow[];
  by_market_cap: QuantusAccuracyRow[];
}

// ─── Prepared statements ─────────────────────────────────────────────────────

const stmts = {
  findByEmail: db.prepare(
    "SELECT * FROM users WHERE email = ? COLLATE NOCASE"
  ),
  findById: db.prepare(
    "SELECT * FROM users WHERE id = ?"
  ),
  findByReferral: db.prepare(
    "SELECT * FROM users WHERE referral_token = ?"
  ),
  insert: db.prepare(
    `INSERT INTO users (id, email, name, password_hash, credits, referral_token, auth_provider)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ),
  updateCredits: db.prepare(
    "UPDATE users SET credits = ?, updated_at = datetime('now') WHERE id = ?"
  ),
  incrementCreditsBy: db.prepare(
    "UPDATE users SET credits = credits + ?, updated_at = datetime('now') WHERE id = ?"
  ),
  updateAuthProvider: db.prepare(
    "UPDATE users SET auth_provider = ?, updated_at = datetime('now') WHERE id = ?"
  ),
  updateTier: db.prepare(
    "UPDATE users SET tier = ?, updated_at = datetime('now') WHERE id = ?"
  ),
  incrementReports: db.prepare(
    "UPDATE users SET reports_this_month = reports_this_month + 1, updated_at = datetime('now') WHERE id = ?"
  ),
  incrementReportsIfBelowLimit: db.prepare(
    "UPDATE users SET reports_this_month = reports_this_month + 1, updated_at = datetime('now') WHERE id = ? AND reports_this_month < ?"
  ),
  deductCredit: db.prepare(
    "UPDATE users SET credits = credits - ?, updated_at = datetime('now') WHERE id = ? AND credits >= ?"
  ),
  deleteUser: db.prepare(
    "DELETE FROM users WHERE id = ?"
  ),
  resetMonthlyReports: db.prepare(
    "UPDATE users SET reports_this_month = 0, updated_at = datetime('now') WHERE reports_this_month > 0"
  ),
  getAppMeta: db.prepare(
    "SELECT value FROM app_meta WHERE key = ?"
  ),
  upsertAppMeta: db.prepare(
    `INSERT INTO app_meta (key, value, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET
       value = excluded.value,
        updated_at = datetime('now')`
  ),
  getQuantusAiReservedTokensForDay: db.prepare(
    `SELECT COALESCE(SUM(reserved_tokens), 0) AS reserved_tokens
     FROM quantus_ai_daily_usage
     WHERE user_id = ? AND usage_date = ?`
  ),
  upsertQuantusAiDailyUsage: db.prepare(
    `INSERT INTO quantus_ai_daily_usage (user_id, usage_date, usage_type, reserved_tokens)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, usage_date, usage_type) DO UPDATE SET
       reserved_tokens = quantus_ai_daily_usage.reserved_tokens + excluded.reserved_tokens,
       updated_at = datetime('now')`
  ),

  listQuantusWatchlistByUser: db.prepare(
    "SELECT * FROM quantus_watchlists WHERE user_id = ? ORDER BY updated_at DESC, ticker ASC"
  ),
  findQuantusWatchlistEntry: db.prepare(
    "SELECT * FROM quantus_watchlists WHERE user_id = ? AND ticker = ?"
  ),
  upsertQuantusWatchlist: db.prepare(
    `INSERT INTO quantus_watchlists (user_id, ticker, asset_class)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id, ticker) DO UPDATE SET
       asset_class = excluded.asset_class,
       updated_at = datetime('now')`
  ),
  deleteQuantusWatchlist: db.prepare(
    "DELETE FROM quantus_watchlists WHERE user_id = ? AND ticker = ?"
  ),

  listQuantusAlertsByUser: db.prepare(
    "SELECT * FROM quantus_alert_subscriptions WHERE user_id = ? ORDER BY updated_at DESC, ticker ASC"
  ),
  findQuantusAlertByUserAndTicker: db.prepare(
    "SELECT * FROM quantus_alert_subscriptions WHERE user_id = ? AND ticker = ?"
  ),
  upsertQuantusAlert: db.prepare(
    `INSERT INTO quantus_alert_subscriptions (
      user_id, ticker, asset_class, email_enabled, push_enabled,
      signal_change, price_breakout, regime_shift, daily_digest
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, ticker) DO UPDATE SET
      asset_class = excluded.asset_class,
      email_enabled = excluded.email_enabled,
      push_enabled = excluded.push_enabled,
      signal_change = excluded.signal_change,
      price_breakout = excluded.price_breakout,
      regime_shift = excluded.regime_shift,
      daily_digest = excluded.daily_digest,
      updated_at = datetime('now')`
  ),
  deleteQuantusAlert: db.prepare(
    "DELETE FROM quantus_alert_subscriptions WHERE user_id = ? AND ticker = ?"
  ),

  upsertQuantusSnapshot: db.prepare(
    `INSERT INTO quantus_report_snapshots (
      report_id, ticker, asset_class, company_name, sector, engine_version, signal,
      confidence_score, regime_label, market_cap_bucket, benchmark_symbol,
      benchmark_price_at_gen, generated_at, price_at_gen, source, report_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(report_id) DO UPDATE SET
      ticker = excluded.ticker,
      asset_class = excluded.asset_class,
      company_name = excluded.company_name,
      sector = excluded.sector,
      engine_version = excluded.engine_version,
      signal = excluded.signal,
      confidence_score = excluded.confidence_score,
      regime_label = excluded.regime_label,
      market_cap_bucket = excluded.market_cap_bucket,
      benchmark_symbol = excluded.benchmark_symbol,
      benchmark_price_at_gen = excluded.benchmark_price_at_gen,
      generated_at = excluded.generated_at,
      price_at_gen = excluded.price_at_gen,
      source = CASE
        WHEN excluded.source = 'live' THEN excluded.source
        ELSE quantus_report_snapshots.source
      END,
      report_json = excluded.report_json`
  ),
  findQuantusSnapshotByReportId: db.prepare(
    "SELECT * FROM quantus_report_snapshots WHERE report_id = ?"
  ),
  listQuantusSnapshotsByTicker: db.prepare(
    "SELECT * FROM quantus_report_snapshots WHERE ticker = ? ORDER BY generated_at DESC LIMIT ?"
  ),
  findLatestQuantusSnapshotByTicker: db.prepare(
    "SELECT * FROM quantus_report_snapshots WHERE ticker = ? ORDER BY generated_at DESC LIMIT 1"
  ),

  upsertQuantusOutcomeSeed: db.prepare(
    `INSERT INTO quantus_signal_outcomes (
      report_id, ticker, asset_class, sector, signal, engine_version, regime_label,
      market_cap_bucket, price_at_gen, benchmark_symbol, benchmark_price_at_gen, generated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(report_id) DO UPDATE SET
      ticker = excluded.ticker,
      asset_class = excluded.asset_class,
      sector = excluded.sector,
      signal = excluded.signal,
      engine_version = excluded.engine_version,
      regime_label = excluded.regime_label,
      market_cap_bucket = excluded.market_cap_bucket,
      price_at_gen = excluded.price_at_gen,
      benchmark_symbol = COALESCE(excluded.benchmark_symbol, quantus_signal_outcomes.benchmark_symbol),
      benchmark_price_at_gen = COALESCE(excluded.benchmark_price_at_gen, quantus_signal_outcomes.benchmark_price_at_gen),
      generated_at = excluded.generated_at,
      updated_at = datetime('now')`
  ),
  listResolvableQuantusOutcomesByTicker: db.prepare(
    `SELECT o.*
     FROM quantus_signal_outcomes o
     INNER JOIN quantus_report_snapshots s ON s.report_id = o.report_id
     WHERE o.ticker = ?
       AND o.return_pct IS NULL
       AND o.generated_at <= ?
       AND s.source = 'live'
     ORDER BY o.generated_at ASC`
  ),
  listResolvedQuantusOutcomes: db.prepare(
    `SELECT o.*
     FROM quantus_signal_outcomes o
     INNER JOIN quantus_report_snapshots s ON s.report_id = o.report_id
     WHERE o.return_pct IS NOT NULL
       AND s.source = 'live'
     ORDER BY COALESCE(o.resolved_at, o.updated_at, o.generated_at) DESC`
  ),
  listPendingQuantusOutcomes: db.prepare(
    `SELECT o.*
     FROM quantus_signal_outcomes o
     INNER JOIN quantus_report_snapshots s ON s.report_id = o.report_id
     WHERE o.return_pct IS NULL
       AND s.source = 'live'
     ORDER BY o.generated_at DESC`
  ),
  resolveQuantusOutcome: db.prepare(
    `UPDATE quantus_signal_outcomes
     SET resolved_at = ?,
         price_at_30d = ?,
         benchmark_price_at_30d = ?,
         return_pct = ?,
         excess_pct = ?,
         win_rate_flag = ?,
         updated_at = datetime('now')
     WHERE report_id = ?`
  ),
};

// ─── Internal helpers ────────────────────────────────────────────────────────

function computeReturnPct(base: number | null | undefined, observed: number | null | undefined) {
  if (
    typeof base !== "number" ||
    typeof observed !== "number" ||
    !Number.isFinite(base) ||
    !Number.isFinite(observed) ||
    base <= 0
  ) {
    return null;
  }

  return ((observed - base) / base) * 100;
}

function computeWinRateFlag(signal: string, returnPct: number | null, excessPct: number | null) {
  if (returnPct == null) {
    return null;
  }

  const reference = excessPct ?? returnPct;
  switch (signal) {
    case "STRONG BUY":
    case "BUY":
      return reference > 0 ? 1 : 0;
    case "SELL":
    case "STRONG SELL":
      return reference < 0 ? 1 : 0;
    case "NEUTRAL":
    default:
      return Math.abs(reference) <= 3 ? 1 : 0;
  }
}

function groupAccuracyRows(
  rows: DbQuantusAccuracyOutcome[],
  getLabel: (row: DbQuantusAccuracyOutcome) => string | null,
): QuantusAccuracyRow[] {
  const groups = new Map<string, DbQuantusAccuracyOutcome[]>();

  for (const row of rows) {
    const label = getLabel(row);
    if (!label) {
      continue;
    }

    const existing = groups.get(label);
    if (existing) {
      existing.push(row);
    } else {
      groups.set(label, [row]);
    }
  }

  return Array.from(groups.entries())
    .map(([label, groupRows]) => {
      const returnValues = groupRows
        .map((row) => row.return_pct)
        .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
      const excessValues = groupRows
        .map((row) => row.excess_pct)
        .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
      const winValues = groupRows
        .map((row) => row.win_rate_flag)
        .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

      return {
        label,
        count: groupRows.length,
        avg_return_pct: returnValues.length
          ? returnValues.reduce((sum, value) => sum + value, 0) / returnValues.length
          : 0,
        avg_excess_pct: excessValues.length
          ? excessValues.reduce((sum, value) => sum + value, 0) / excessValues.length
          : null,
        win_rate: winValues.length
          ? (winValues.reduce((sum, value) => sum + value, 0) / winValues.length) * 100
          : null,
      };
    })
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function resolveQuantusOutcomesFromObservation(observation: QuantusSnapshotInput) {
  const thirtyDaysEarlier = new Date(new Date(observation.generatedAt).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const candidates = stmts.listResolvableQuantusOutcomesByTicker.all(observation.ticker, thirtyDaysEarlier) as DbQuantusAccuracyOutcome[];

  for (const candidate of candidates) {
    const returnPct = computeReturnPct(candidate.price_at_gen, observation.priceAtGen);
    if (returnPct == null) {
      continue;
    }

    const benchmarkReturnPct = computeReturnPct(candidate.benchmark_price_at_gen, observation.benchmarkPriceAtGen);
    const excessPct = benchmarkReturnPct == null ? null : returnPct - benchmarkReturnPct;
    const winRateFlag = computeWinRateFlag(candidate.signal, returnPct, excessPct);

    stmts.resolveQuantusOutcome.run(
      observation.generatedAt,
      observation.priceAtGen,
      observation.benchmarkPriceAtGen ?? null,
      returnPct,
      excessPct,
      winRateFlag,
      candidate.report_id,
    );
  }
}

function getLatestSnapshotForTicker(ticker: string) {
  return stmts.findLatestQuantusSnapshotByTicker.get(ticker) as DbQuantusSnapshotSummary | undefined;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function findUserByEmail(email: string): DbUser | undefined {
  return stmts.findByEmail.get(email) as DbUser | undefined;
}

export function findUserById(id: string): DbUser | undefined {
  return stmts.findById.get(id) as DbUser | undefined;
}

export function findUserByReferralToken(token: string): DbUser | undefined {
  return stmts.findByReferral.get(token) as DbUser | undefined;
}

export function createUser(params: {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  credits?: number;
  referralToken: string;
  authProvider?: string;
}): DbUser {
  stmts.insert.run(
    params.id,
    params.email,
    params.name,
    params.passwordHash,
    params.credits ?? 0,
    params.referralToken,
    params.authProvider ?? "password",
  );
  return stmts.findById.get(params.id) as DbUser;
}

export function createUserWithReferralCredits(params: {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  referralToken: string;
  authProvider?: string;
  signupCredits?: number;
  referrerId?: string | null;
  referrerCreditDelta?: number;
}): DbUser {
  const transaction = db.transaction((input: typeof params) => {
    const signupCredits = Number.isFinite(input.signupCredits ?? 0)
      ? Math.max(0, Math.floor(input.signupCredits ?? 0))
      : 0;
    const referrerCreditDelta = Number.isFinite(input.referrerCreditDelta ?? 0)
      ? Math.max(0, Math.floor(input.referrerCreditDelta ?? 0))
      : 0;

    stmts.insert.run(
      input.id,
      input.email,
      input.name,
      input.passwordHash,
      signupCredits,
      input.referralToken,
      input.authProvider ?? "password",
    );

    if (input.referrerId && referrerCreditDelta > 0) {
      stmts.incrementCreditsBy.run(referrerCreditDelta, input.referrerId);
    }

    return stmts.findById.get(input.id) as DbUser;
  });

  return transaction(params);
}

export function updateUserCredits(userId: string, credits: number): void {
  stmts.updateCredits.run(credits, userId);
}

export function updateUserAuthProvider(userId: string, authProvider: string): void {
  stmts.updateAuthProvider.run(authProvider, userId);
}

export function incrementReports(userId: string): void {
  stmts.incrementReports.run(userId);
}

export function incrementReportsIfBelowLimit(userId: string, limit: number): boolean {
  const result = stmts.incrementReportsIfBelowLimit.run(userId, limit) as { changes: number };
  return result.changes > 0;
}

export function deductCredit(userId: string, amount: number): boolean {
  const result = stmts.deductCredit.run(amount, userId, amount) as { changes: number };
  return result.changes > 0;
}

/** GDPR Art. 17 — Right to erasure. Permanently deletes user and all data. */
export function deleteUser(userId: string): boolean {
  const result = stmts.deleteUser.run(userId) as { changes: number };
  return result.changes > 0;
}

/**
 * Reset reports_this_month for all users.
 * Call once per month (e.g., on first request after month boundary).
 */
export function resetMonthlyReports(): number {
  const result = stmts.resetMonthlyReports.run() as { changes: number };
  return result.changes;
}

export function getAppMeta(key: string): string | undefined {
  const row = stmts.getAppMeta.get(key) as { value: string } | undefined;
  return row?.value;
}

export function setAppMeta(key: string, value: string): void {
  stmts.upsertAppMeta.run(key, value);
}

export function consumeQuantusAiDailyBudget(params: {
  userId: string;
  usageType: QuantusAiUsageType;
  requestedTokens: number;
  dailyLimit: number;
  usageDate?: string;
}): QuantusAiBudgetResult {
  const usageType = sanitizeQuantusAiUsageType(params.usageType);
  if (!usageType) {
    throw new Error("Invalid Quantus AI usage type");
  }

  const requestedTokens = Number.isFinite(params.requestedTokens)
    ? Math.max(0, Math.floor(params.requestedTokens))
    : 0;
  const dailyLimit = Number.isFinite(params.dailyLimit)
    ? Math.max(0, Math.floor(params.dailyLimit))
    : 0;
  const usageDate = params.usageDate?.trim() || new Date().toISOString().slice(0, 10);

  if (requestedTokens <= 0) {
    const row = stmts.getQuantusAiReservedTokensForDay.get(params.userId, usageDate) as
      | { reserved_tokens?: number | null }
      | undefined;
    const reservedTokens = Number(row?.reserved_tokens ?? 0);
    return {
      ok: true,
      dailyLimit,
      reservedTokens,
      remainingTokens: Math.max(0, dailyLimit - reservedTokens),
      usageDate,
      usageType,
    };
  }

  const transaction = db.transaction(() => {
    const row = stmts.getQuantusAiReservedTokensForDay.get(params.userId, usageDate) as
      | { reserved_tokens?: number | null }
      | undefined;
    const reservedTokens = Number(row?.reserved_tokens ?? 0);
    const nextReservedTokens = reservedTokens + requestedTokens;

    if (nextReservedTokens > dailyLimit) {
      return {
        ok: false,
        dailyLimit,
        reservedTokens,
        remainingTokens: Math.max(0, dailyLimit - reservedTokens),
        usageDate,
        usageType,
      } satisfies QuantusAiBudgetResult;
    }

    stmts.upsertQuantusAiDailyUsage.run(
      params.userId,
      usageDate,
      usageType,
      requestedTokens,
    );

    return {
      ok: true,
      dailyLimit,
      reservedTokens: nextReservedTokens,
      remainingTokens: Math.max(0, dailyLimit - nextReservedTokens),
      usageDate,
      usageType,
    } satisfies QuantusAiBudgetResult;
  });

  return transaction();
}

/** Strip password_hash before sending to the client */
export function toSafeUser(user: DbUser): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    authProvider: user.auth_provider,
    tier: user.tier,
    credits: user.credits,
    reportsThisMonth: user.reports_this_month,
    jurisdiction: user.jurisdiction,
    referralToken: user.referral_token,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export function listQuantusWatchlistEntries(userId: string): DbQuantusWatchlistEntry[] {
  const rows = stmts.listQuantusWatchlistByUser.all(userId) as DbQuantusWatchlistEntry[];
  return rows.map((row) => ({
    ...row,
    latest_snapshot: getLatestSnapshotForTicker(row.ticker) ?? null,
  }));
}

export function findQuantusWatchlistEntry(userId: string, ticker: string) {
  return stmts.findQuantusWatchlistEntry.get(userId, ticker) as DbQuantusWatchlistEntry | undefined;
}

export function upsertQuantusWatchlistEntry(userId: string, ticker: string, assetClass: string) {
  stmts.upsertQuantusWatchlist.run(userId, ticker, assetClass);
  return findQuantusWatchlistEntry(userId, ticker);
}

export function deleteQuantusWatchlistEntry(userId: string, ticker: string) {
  const result = stmts.deleteQuantusWatchlist.run(userId, ticker) as { changes: number };
  return result.changes > 0;
}

export function listQuantusAlertSubscriptions(userId: string): DbQuantusAlertSubscription[] {
  return stmts.listQuantusAlertsByUser.all(userId) as DbQuantusAlertSubscription[];
}

export function findQuantusAlertSubscription(userId: string, ticker: string) {
  return stmts.findQuantusAlertByUserAndTicker.get(userId, ticker) as DbQuantusAlertSubscription | undefined;
}

export function upsertQuantusAlertSubscription(userId: string, input: QuantusAlertSubscriptionInput) {
  stmts.upsertQuantusAlert.run(
    userId,
    input.ticker,
    input.assetClass,
    input.emailEnabled ? 1 : 0,
    input.pushEnabled ? 1 : 0,
    input.signalChange ? 1 : 0,
    input.priceBreakout ? 1 : 0,
    input.regimeShift ? 1 : 0,
    input.dailyDigest ? 1 : 0,
  );
  return findQuantusAlertSubscription(userId, input.ticker);
}

export function deleteQuantusAlertSubscription(userId: string, ticker: string) {
  const result = stmts.deleteQuantusAlert.run(userId, ticker) as { changes: number };
  return result.changes > 0;
}

export function upsertQuantusReportSnapshot(input: QuantusSnapshotInput) {
  stmts.upsertQuantusSnapshot.run(
    input.reportId,
    input.ticker,
    input.assetClass,
    input.companyName,
    input.sector,
    input.engineVersion,
    input.signal,
    input.confidenceScore,
    input.regimeLabel,
    input.marketCapBucket ?? null,
    input.benchmarkSymbol ?? null,
    input.benchmarkPriceAtGen ?? null,
    input.generatedAt,
    input.priceAtGen,
    input.source,
    input.reportJson,
  );

  stmts.upsertQuantusOutcomeSeed.run(
    input.reportId,
    input.ticker,
    input.assetClass,
    input.sector,
    input.signal,
    input.engineVersion,
    input.regimeLabel,
    input.marketCapBucket ?? null,
    input.priceAtGen,
    input.benchmarkSymbol ?? null,
    input.benchmarkPriceAtGen ?? null,
    input.generatedAt,
  );

  resolveQuantusOutcomesFromObservation(input);
  return stmts.findQuantusSnapshotByReportId.get(input.reportId) as DbQuantusReportSnapshot | undefined;
}

export function findQuantusReportSnapshot(reportId: string) {
  return stmts.findQuantusSnapshotByReportId.get(reportId) as DbQuantusReportSnapshot | undefined;
}

export function listQuantusReportSnapshots(ticker: string, limit = 20) {
  return stmts.listQuantusSnapshotsByTicker.all(ticker, limit) as DbQuantusReportSnapshot[];
}

export function getQuantusAccuracySummary(unlockThreshold = 50): QuantusAccuracySummary {
  const resolved = stmts.listResolvedQuantusOutcomes.all() as DbQuantusAccuracyOutcome[];
  const pending = stmts.listPendingQuantusOutcomes.all() as DbQuantusAccuracyOutcome[];
  const allRows = [...resolved, ...pending];

  const returnValues = resolved
    .map((row) => row.return_pct)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const winValues = resolved
    .map((row) => row.win_rate_flag)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  const bestEngineRow = groupAccuracyRows(resolved, (row) => row.engine_version)
    .sort((a, b) => {
      const aScore = a.avg_excess_pct ?? a.avg_return_pct;
      const bScore = b.avg_excess_pct ?? b.avg_return_pct;
      return bScore - aScore || b.count - a.count;
    })[0];

  const engineInception = allRows.length
    ? allRows
      .map((row) => row.generated_at)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))[0]
    : null;

  const lastUpdated = allRows.length
    ? allRows
      .map((row) => row.updated_at || row.resolved_at || row.generated_at)
      .filter(Boolean)
      .sort((a, b) => b.localeCompare(a))[0]
    : null;

  return {
    resolved_count: resolved.length,
    pending_count: pending.length,
    unlock_threshold: unlockThreshold,
    engine_inception: engineInception,
    last_updated: lastUpdated,
    methodology_note: "Outcomes resolve when Quantus observes a market price 30 days or later after the original snapshot. Benchmark comparisons use the same observed resolution point.",
    overall_avg_return_pct: returnValues.length
      ? returnValues.reduce((sum, value) => sum + value, 0) / returnValues.length
      : null,
    overall_win_rate: winValues.length
      ? (winValues.reduce((sum, value) => sum + value, 0) / winValues.length) * 100
      : null,
    best_engine: bestEngineRow?.label ?? null,
    by_signal: groupAccuracyRows(resolved, (row) => row.signal),
    by_engine: groupAccuracyRows(resolved, (row) => row.engine_version),
    by_regime: groupAccuracyRows(resolved, (row) => row.regime_label),
    by_sector: groupAccuracyRows(resolved, (row) => row.sector || null),
    by_market_cap: groupAccuracyRows(resolved, (row) => row.market_cap_bucket),
  };
}

export { db, DATA_DIR };
