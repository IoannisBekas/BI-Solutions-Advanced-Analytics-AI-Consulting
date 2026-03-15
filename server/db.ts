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
db.exec(`
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
  deductCredit: db.prepare<[number, string]>(
    "UPDATE users SET credits = credits - ?, updated_at = datetime('now') WHERE id = ? AND credits >= ?"
  ),
};

// Overload deductCredit to also check balance
const deductCreditStmt = db.prepare<[number, string, number]>(
  "UPDATE users SET credits = credits - ?, updated_at = datetime('now') WHERE id = ? AND credits >= ?"
);

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
  const result = deductCreditStmt.run(amount, userId, amount);
  return result.changes > 0;
}

/** Strip password_hash before sending to the client */
export function toSafeUser(user: DbUser): SafeUser {
  const { password_hash: _, ...safe } = user;
  return safe;
}

export { db };
