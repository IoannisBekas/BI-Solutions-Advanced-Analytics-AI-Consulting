import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

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

// ─── Prepared statements ─────────────────────────────────────────────────────

export interface DbUser {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  tier: string;
  credits: number;
  reports_this_month: number;
  jurisdiction: string;
  referral_token: string | null;
  created_at: string;
  updated_at: string;
}

/** Public-facing user (no password hash) */
export type SafeUser = Omit<DbUser, "password_hash">;

const stmts = {
  findByEmail: db.prepare<[string], DbUser>(
    "SELECT * FROM users WHERE email = ? COLLATE NOCASE"
  ),
  findById: db.prepare<[string], DbUser>(
    "SELECT * FROM users WHERE id = ?"
  ),
  findByReferral: db.prepare<[string], DbUser>(
    "SELECT * FROM users WHERE referral_token = ?"
  ),
  insert: db.prepare<[string, string, string, string, number, string]>(
    `INSERT INTO users (id, email, name, password_hash, credits, referral_token)
     VALUES (?, ?, ?, ?, ?, ?)`
  ),
  updateCredits: db.prepare<[number, string]>(
    "UPDATE users SET credits = ?, updated_at = datetime('now') WHERE id = ?"
  ),
  updateTier: db.prepare<[string, string]>(
    "UPDATE users SET tier = ?, updated_at = datetime('now') WHERE id = ?"
  ),
  incrementReports: db.prepare<[string]>(
    "UPDATE users SET reports_this_month = reports_this_month + 1, updated_at = datetime('now') WHERE id = ?"
  ),
  deductCredit: db.prepare<[number, string, number]>(
    "UPDATE users SET credits = credits - ?, updated_at = datetime('now') WHERE id = ? AND credits >= ?"
  ),
  deleteUser: db.prepare<[string]>(
    "DELETE FROM users WHERE id = ?"
  ),
  resetMonthlyReports: db.prepare(
    "UPDATE users SET reports_this_month = 0, updated_at = datetime('now') WHERE reports_this_month > 0"
  ),
};

// ─── Public API ──────────────────────────────────────────────────────────────

export function findUserByEmail(email: string): DbUser | undefined {
  return stmts.findByEmail.get(email);
}

export function findUserById(id: string): DbUser | undefined {
  return stmts.findById.get(id);
}

export function findUserByReferralToken(token: string): DbUser | undefined {
  return stmts.findByReferral.get(token);
}

export function createUser(params: {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  credits?: number;
  referralToken: string;
}): DbUser {
  stmts.insert.run(
    params.id,
    params.email,
    params.name,
    params.passwordHash,
    params.credits ?? 0,
    params.referralToken
  );
  return stmts.findById.get(params.id)!;
}

export function updateUserCredits(userId: string, credits: number): void {
  stmts.updateCredits.run(credits, userId);
}

export function updateUserTier(userId: string, tier: string): void {
  stmts.updateTier.run(tier, userId);
}

export function incrementReports(userId: string): void {
  stmts.incrementReports.run(userId);
}

export function deductCredit(userId: string, amount: number): boolean {
  const result = stmts.deductCredit.run(amount, userId, amount);
  return result.changes > 0;
}

/** GDPR Art. 17 — Right to erasure. Permanently deletes user and all data. */
export function deleteUser(userId: string): boolean {
  const result = stmts.deleteUser.run(userId);
  return result.changes > 0;
}

/**
 * Reset reports_this_month for all users.
 * Call once per month (e.g., on first request after month boundary).
 */
export function resetMonthlyReports(): number {
  const result = stmts.resetMonthlyReports.run();
  return result.changes;
}

/** Strip password_hash before sending to the client */
export function toSafeUser(user: DbUser): SafeUser {
  const { password_hash: _, ...safe } = user;
  return safe;
}

export { db };
