import { createHmac, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import type { Express } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import {
  createDirectPaymentOrder,
  directPaymentCheckoutUrl,
  directPaymentStatus,
  retrieveDirectPaymentOrder,
  type DirectPaymentEnvironment,
} from "../directPaymentsRevolut";

const API_PATH = "/api/direct-payments";
const STATUS_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const CHECKOUT_WINDOW_MS = 10 * 60 * 1000;
const CHECKOUT_LIMIT = 60;
const attemptIdSchema = z.uuidv4().toLowerCase();
const checkoutBody = z.object({
  amount: z.string().trim().regex(/^\d{1,4}(?:[.,]\d{1,2})?$/),
  attemptId: attemptIdSchema,
}).strict();

function configuration() {
  if (process.env.DIRECT_PAYMENTS_ENABLED?.trim() !== "true") return null;
  const environment = process.env.DIRECT_PAYMENTS_REVOLUT_ENV?.trim();
  const apiKey = process.env.DIRECT_PAYMENTS_REVOLUT_API_KEY?.trim();
  const publicKey = process.env.DIRECT_PAYMENTS_REVOLUT_PUBLIC_KEY?.trim();
  const secret = process.env.DIRECT_PAYMENTS_TOKEN_SECRET?.trim();
  const dataDirectory = process.env.DIRECT_PAYMENTS_DATA_DIR?.trim() ||
    process.env.RAILWAY_VOLUME_MOUNT_PATH?.trim() || process.env.DATA_DIR?.trim();
  if ((environment !== "sandbox" && environment !== "production") ||
      !apiKey || !publicKey?.startsWith("pk_") || !secret || secret.length < 32 ||
      (!dataDirectory && (environment === "production" || process.env.NODE_ENV === "production"))) {
    console.error("Direct payments configuration is incomplete.");
    return null;
  }
  return { environment: environment as DirectPaymentEnvironment, apiKey, publicKey, secret, dataDirectory: dataDirectory || "data" };
}

interface Attempt {
  attemptId: string;
  amountMinor: number;
  createdAt: number;
  orderId: string | null;
}

function openAttempts(dataDirectory: string) {
  mkdirSync(dataDirectory, { recursive: true });
  return new Database(path.join(dataDirectory, "direct-payments.db"));
}

function storeAttempts(db: Database.Database, environment: DirectPaymentEnvironment) {
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = FULL");
  db.pragma("busy_timeout = 5000");
  db.exec(`
    CREATE TABLE IF NOT EXISTS direct_payment_attempts (
      environment TEXT NOT NULL,
      attempt_id TEXT NOT NULL,
      amount_minor INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      order_id TEXT,
      PRIMARY KEY (environment, attempt_id)
    );
    CREATE INDEX IF NOT EXISTS direct_payment_attempts_window
      ON direct_payment_attempts (environment, created_at);
  `);
  const get = db.prepare<[DirectPaymentEnvironment, string], Attempt>(`
    SELECT attempt_id AS attemptId, amount_minor AS amountMinor, created_at AS createdAt, order_id AS orderId
    FROM direct_payment_attempts WHERE environment = ? AND attempt_id = ?
  `);
  const count = db.prepare<[DirectPaymentEnvironment, number], { total: number }>(`
    SELECT COUNT(*) AS total FROM direct_payment_attempts WHERE environment = ? AND created_at > ?
  `);
  const insert = db.prepare(`
    INSERT INTO direct_payment_attempts (environment, attempt_id, amount_minor, created_at) VALUES (?, ?, ?, ?)
  `);
  const associate = db.prepare(`
    UPDATE direct_payment_attempts SET order_id = ? WHERE environment = ? AND attempt_id = ? AND order_id IS NULL
  `);
  const reserve = db.transaction((attemptId: string, amountMinor: number) => {
    const existing = get.get(environment, attemptId);
    if (existing) return { attempt: existing, inserted: false } as const;
    const createdAt = Date.now();
    if (count.get(environment, createdAt - CHECKOUT_WINDOW_MS)!.total >= CHECKOUT_LIMIT) return null;
    insert.run(environment, attemptId, amountMinor, createdAt);
    return { attempt: { attemptId, amountMinor, createdAt, orderId: null }, inserted: true } as const;
  });
  return {
    get: (attemptId: string) => get.get(environment, attemptId),
    reserve: (attemptId: string, amountMinor: number) => reserve.immediate(attemptId, amountMinor),
    associate: (attemptId: string, orderId: string) => associate.run(orderId, environment, attemptId).changes === 1,
  };
}

function signStatus(attemptId: string, environment: DirectPaymentEnvironment, secret: string) {
  const signature = createHmac("sha256", secret).update(`bi-direct-payment:v1:${environment}:${attemptId}`).digest("base64url");
  return `${attemptId}.${signature}`;
}

function readStatus(token: unknown, environment: DirectPaymentEnvironment, secret: string) {
  if (typeof token !== "string" || token.length !== 80) return null;
  const attempt = attemptIdSchema.safeParse(token.slice(0, 36));
  if (!attempt.success) return null;
  const signed = signStatus(attempt.data, environment, secret);
  const input = Buffer.from(token);
  const expected = Buffer.from(signed);
  return input.length === expected.length && timingSafeEqual(input, expected) ? attempt.data : null;
}

export function registerDirectPaymentRoutes(app: Express, database?: Database.Database) {
  const config = configuration();
  let attempts: ReturnType<typeof storeAttempts> | undefined;
  if (config) {
    try {
      attempts = storeAttempts(database ?? openAttempts(config.dataDirectory), config.environment);
    } catch {
      console.error("Could not open the direct payment attempt store.");
    }
  }
  app.use(API_PATH, (_req, res, next) => {
    res.set("Cache-Control", "private, no-store");
    next();
  });
  if (!config || !attempts) {
    app.get(`${API_PATH}/config`, (_req, res) => res.json({ enabled: false }));
    app.post([`${API_PATH}/checkout`, `${API_PATH}/status`], (_req, res) => res.status(503).json({ code: "unavailable" }));
    return;
  }

  const store = attempts;
  const sandbox = config.environment === "sandbox";
  const checkoutLimiter = rateLimit({
    windowMs: CHECKOUT_WINDOW_MS,
    limit: 8,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { code: "rate_limited" },
  });
  app.get(`${API_PATH}/config`, (_req, res) => {
    res.json({ enabled: true, sandbox, publicKey: config.publicKey, environment: config.environment });
  });

  app.post(`${API_PATH}/checkout`, checkoutLimiter, async (req, res) => {
    const input = checkoutBody.safeParse(req.body);
    if (!input.success) {
      res.status(400).json({ code: "invalid" });
      return;
    }
    const { attemptId, amount } = input.data;
    const [whole, fraction = ""] = amount.split(/[.,]/);
    const amountMinor = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
    if (amountMinor < 100 || amountMinor > 100_000) {
      res.status(400).json({ code: "invalid" });
      return;
    }
    try {
      // Keep the reservation even if Revolut times out. Creating again could produce two orders.
      const reservation = store.reserve(attemptId, amountMinor);
      if (!reservation) {
        res.status(429).json({ code: "rate_limited" });
        return;
      }
      const { attempt, inserted } = reservation;
      if (attempt.amountMinor !== amountMinor) {
        res.status(409).json({ code: "conflict" });
        return;
      }
      if (!inserted && !attempt.orderId) {
        res.status(409).json({ code: "conflict" });
        return;
      }
      const order = attempt.orderId
        ? await retrieveDirectPaymentOrder(config, attemptId, amountMinor, attempt.orderId)
        : await createDirectPaymentOrder(config, attemptId, amountMinor);
      if (inserted && !store.associate(attemptId, order.id)) {
        throw new Error("Could not store the direct payment order.");
      }
      const statusToken = signStatus(attemptId, config.environment, config.secret);
      if (directPaymentStatus(order, attempt.createdAt) !== "payable" || !order.token) {
        res.status(409).json({ code: "closed", statusToken });
        return;
      }
      res.json({
        token: order.token,
        statusToken,
        amountMinor,
        environment: config.environment,
        sandbox,
        checkoutUrl: directPaymentCheckoutUrl(order, config.environment),
      });
    } catch (error) {
      console.error("Direct payment checkout failed:", error instanceof Error ? error.name : "unknown error");
      res.status(502).json({ code: "unavailable" });
    }
  });

  app.post(`${API_PATH}/status`, async (req, res) => {
    const attemptId = readStatus(req.body?.token, config.environment, config.secret);
    if (!attemptId) {
      res.status(404).json({ code: "invalid" });
      return;
    }
    try {
      const attempt = store.get(attemptId);
      if (!attempt?.orderId || Date.now() - attempt.createdAt > STATUS_LIFETIME_MS) {
        res.status(404).json({ code: "invalid" });
        return;
      }
      const order = await retrieveDirectPaymentOrder(config, attemptId, attempt.amountMinor, attempt.orderId);
      res.json({ status: directPaymentStatus(order, attempt.createdAt), amountMinor: attempt.amountMinor });
    } catch (error) {
      console.error("Direct payment status failed:", error instanceof Error ? error.name : "unknown error");
      res.status(502).json({ code: "unavailable" });
    }
  });
}
