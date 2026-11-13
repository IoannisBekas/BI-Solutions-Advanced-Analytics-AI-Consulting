import { createHmac, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import type { Express, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import {
  cancelRecurringSubscription,
  createMonthlyVariation,
  createRecurringCustomer,
  createRecurringSubscription,
  findMonthlyVariation,
  recurringCreateRejected,
  recurringCheckoutUrl,
  retrieveRecurringSetupOrder,
  retrieveRecurringSubscription,
  type RecurringEnvironment,
} from "../recurringPaymentsRevolut";

const API_PATH = "/api/recurring-payments";
const WINDOW_MS = 10 * 60 * 1000;
const CHECKOUT_LIMIT = 30;
const PLAN_RECONCILE_DELAY_MS = 15_000;
const CONSENT_VERSION = "monthly-until-cancelled-v1";
const attemptIdSchema = z.uuidv4().toLowerCase();
const checkoutBody = z.object({
  amount: z.string().trim().regex(/^\d{1,4}(?:[.,]\d{1,2})?$/),
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  consent: z.literal(true),
  attemptId: attemptIdSchema,
}).strict();

function configuration() {
  if (process.env.RECURRING_PAYMENTS_ENABLED?.trim() !== "true") return null;
  const environment = process.env.RECURRING_PAYMENTS_REVOLUT_ENV?.trim();
  const apiKey = process.env.RECURRING_PAYMENTS_REVOLUT_API_KEY?.trim();
  const secret = process.env.RECURRING_PAYMENTS_TOKEN_SECRET?.trim();
  const dataDirectory = process.env.RECURRING_PAYMENTS_DATA_DIR?.trim() ||
    process.env.RAILWAY_VOLUME_MOUNT_PATH?.trim() || process.env.DATA_DIR?.trim();
  if ((environment !== "sandbox" && environment !== "production") || !apiKey ||
      !secret || secret.length < 32 ||
      (!dataDirectory && (environment === "production" || process.env.NODE_ENV === "production"))) {
    console.error("Recurring payment configuration is incomplete.");
    return null;
  }
  const keyPrefix = environment === "sandbox" ? "r_test_" : "r_prod_";
  if (!new RegExp(`^(?:${keyPrefix}|sk_)[A-Za-z0-9_-]+$`).test(apiKey)) {
    console.error("The recurring payment Merchant key does not match its environment.");
    return null;
  }
  return { environment: environment as RecurringEnvironment, apiKey, secret, dataDirectory: dataDirectory || "data" };
}

type Attempt = {
  attemptId: string;
  amountMinor: number;
  emailHash: string;
  createdAt: number;
  variationId: string | null;
  customerId: string | null;
  subscriptionId: string | null;
  setupOrderId: string | null;
};

function openStore(dataDirectory: string, environment: RecurringEnvironment) {
  mkdirSync(dataDirectory, { recursive: true });
  return new Database(path.join(dataDirectory, `recurring-payments-${environment}.db`));
}

function createStore(db: Database.Database, environment: RecurringEnvironment) {
  const planTable = `monthly_${environment}_variations`;
  const attemptsTable = `recurring_${environment}_attempts`;
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = FULL");
  db.pragma("busy_timeout = 5000");
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${planTable} (
      amount_minor INTEGER PRIMARY KEY,
      variation_id TEXT UNIQUE,
      reserved_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ${attemptsTable} (
      attempt_id TEXT PRIMARY KEY,
      amount_minor INTEGER NOT NULL,
      email_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      consent_version TEXT,
      variation_id TEXT,
      customer_id TEXT,
      customer_started INTEGER NOT NULL DEFAULT 0,
      subscription_id TEXT UNIQUE,
      setup_order_id TEXT UNIQUE
    );
    CREATE INDEX IF NOT EXISTS ${attemptsTable}_window
      ON ${attemptsTable} (created_at);
  `);
  const columns = db.prepare(`PRAGMA table_info(${attemptsTable})`).all() as { name: string }[];
  if (!columns.some((column) => column.name === "consent_version")) {
    db.exec(`ALTER TABLE ${attemptsTable} ADD COLUMN consent_version TEXT`);
  }
  const get = db.prepare<[string], Attempt>(`
    SELECT attempt_id AS attemptId, amount_minor AS amountMinor, email_hash AS emailHash, created_at AS createdAt,
      variation_id AS variationId, customer_id AS customerId,
      subscription_id AS subscriptionId, setup_order_id AS setupOrderId
    FROM ${attemptsTable} WHERE attempt_id = ?
  `);
  const plan = db.prepare<[number], { variationId: string | null; reservedAt: number }>(
    `SELECT variation_id AS variationId, reserved_at AS reservedAt FROM ${planTable} WHERE amount_minor = ?`,
  );
  const count = db.prepare<[number], { total: number }>(
    `SELECT COUNT(*) AS total FROM ${attemptsTable} WHERE created_at > ?`,
  );
  const insertPlan = db.prepare(`INSERT INTO ${planTable} (amount_minor, reserved_at) VALUES (?, ?)`);
  const finishPlan = db.prepare(`UPDATE ${planTable} SET variation_id = ? WHERE amount_minor = ? AND variation_id IS NULL`);
  const releasePlan = db.prepare(`DELETE FROM ${planTable} WHERE amount_minor = ? AND variation_id IS NULL`);
  const insertAttempt = db.prepare(`
    INSERT INTO ${attemptsTable} (attempt_id, amount_minor, email_hash, created_at, consent_version)
    VALUES (?, ?, ?, ?, ?)
  `);
  const claimCustomer = db.prepare(`
    UPDATE ${attemptsTable} SET customer_started = 1
    WHERE attempt_id = ? AND customer_id IS NULL AND customer_started = 0
  `);
  const releaseCustomer = db.prepare(`
    UPDATE ${attemptsTable} SET customer_started = 0
    WHERE attempt_id = ? AND customer_id IS NULL
  `);
  const customer = db.prepare(
    `UPDATE ${attemptsTable} SET customer_id = ?, variation_id = ? WHERE attempt_id = ?`,
  );
  const subscription = db.prepare(
    `UPDATE ${attemptsTable} SET subscription_id = ?, setup_order_id = ? WHERE attempt_id = ? AND subscription_id IS NULL`,
  );
  const rememberSetup = db.prepare(`
    UPDATE ${attemptsTable} SET setup_order_id = ?
    WHERE attempt_id = ? AND setup_order_id IS NULL
  `);
  const reserve = db.transaction((attemptId: string, amountMinor: number, emailHash: string) => {
    const existing = get.get(attemptId);
    if (existing) return existing;
    const now = Date.now();
    if (count.get(now - WINDOW_MS)!.total >= CHECKOUT_LIMIT) return null;
    insertAttempt.run(attemptId, amountMinor, emailHash, now, CONSENT_VERSION);
    return get.get(attemptId)!;
  });
  const claimPlan = db.transaction((amountMinor: number) => {
    const existingPlan = plan.get(amountMinor);
    if (existingPlan) return { created: false, ...existingPlan };
    const reservedAt = Date.now();
    insertPlan.run(amountMinor, reservedAt);
    return { created: true, variationId: null, reservedAt };
  });
  return {
    get, plan, reserve, claimPlan, finishPlan, releasePlan, claimCustomer, releaseCustomer, customer, subscription, rememberSetup,
  };
}

function signedStatus(attemptId: string, secret: string, environment: RecurringEnvironment) {
  const signature = createHmac("sha256", secret).update(`bi-recurring-${environment}:v1:${attemptId}`).digest("base64url");
  return `${attemptId}.${signature}`;
}

function attemptFromToken(token: unknown, secret: string, environment: RecurringEnvironment) {
  if (typeof token !== "string" || !/^[0-9a-f-]{36}\.[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const attempt = attemptIdSchema.safeParse(token.slice(0, 36));
  if (!attempt.success) return null;
  return timingSafeEqual(Buffer.from(token), Buffer.from(signedStatus(attempt.data, secret, environment))) ? attempt.data : null;
}

export function registerRecurringPaymentRoutes(app: Express, database?: Database.Database) {
  const config = configuration();
  let attempts: ReturnType<typeof createStore> | undefined;
  if (config) {
    try {
      attempts = createStore(database ?? openStore(config.dataDirectory, config.environment), config.environment);
    } catch {
      console.error("Could not open the recurring payment attempt store.");
    }
  }
  app.use(API_PATH, (_req, res, next) => {
    res.set("Cache-Control", "private, no-store");
    next();
  });
  if (!config || !attempts) {
    app.get(`${API_PATH}/config`, (_req, res) => res.json({ enabled: false }));
    app.post(["checkout", "status", "cancel"].map((route) => `${API_PATH}/${route}`),
      (_req, res) => res.status(503).json({ code: "unavailable" }));
    return;
  }

  const store = attempts;
  const { environment, apiKey, secret } = config;
  const revolutConfig = { environment, apiKey };
  const sandbox = environment === "sandbox";
  const limiter = rateLimit({
    windowMs: WINDOW_MS, limit: 8, standardHeaders: "draft-8", legacyHeaders: false,
    message: { code: "rate_limited" },
  });
  app.get(`${API_PATH}/config`, (_req, res) => res.json({ enabled: true, sandbox }));

  app.post(`${API_PATH}/checkout`, limiter, async (req, res) => {
    const input = checkoutBody.safeParse(req.body);
    if (!input.success) {
      res.status(400).json({ code: "invalid" });
      return;
    }
    const { amount, email, attemptId } = input.data;
    const [whole, fraction = ""] = amount.split(/[.,]/);
    const amountMinor = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
    if (amountMinor < 100 || amountMinor > 100_000) {
      res.status(400).json({ code: "invalid" });
      return;
    }

    try {
      // Reserve before provider writes. Customer and plan creation have no documented idempotency.
      const emailHash = createHmac("sha256", secret).update(`bi-recurring-${environment}-email:v1:${email}`).digest("hex");
      const attempt = store.reserve.immediate(attemptId, amountMinor, emailHash);
      if (!attempt) {
        res.status(429).json({ code: "rate_limited" });
        return;
      }
      if (attempt.amountMinor !== amountMinor || attempt.emailHash !== emailHash ||
          (!attempt.subscriptionId && Date.now() - attempt.createdAt > WINDOW_MS)) {
        res.status(409).json({ code: "conflict" });
        return;
      }

      let variationId = attempt.variationId;
      if (!variationId) {
        const claim = store.claimPlan.immediate(amountMinor);
        if (!claim.created && !claim.variationId && Date.now() - claim.reservedAt < PLAN_RECONCILE_DELAY_MS) {
          res.status(409).json({ code: "conflict" });
          return;
        }
        try {
          variationId = claim.variationId ?? (claim.created
            ? await createMonthlyVariation(revolutConfig, amountMinor)
            : await findMonthlyVariation(revolutConfig, amountMinor));
        } catch (error) {
          if (claim.created && recurringCreateRejected(error)) store.releasePlan.run(amountMinor);
          throw error;
        }
        if (!variationId) {
          res.status(409).json({ code: "conflict" });
          return;
        }
        if (!claim.variationId) {
          store.finishPlan.run(variationId, amountMinor);
          if (store.plan.get(amountMinor)?.variationId !== variationId) {
            throw new Error("A different plan variation is already recorded for this monthly price.");
          }
        }
      }

      let customerId = attempt.customerId;
      if (!customerId) {
        if (store.claimCustomer.run(attemptId).changes !== 1) {
          res.status(409).json({ code: "conflict" });
          return;
        }
        try {
          customerId = await createRecurringCustomer(revolutConfig, email);
        } catch (error) {
          if (recurringCreateRejected(error)) store.releaseCustomer.run(attemptId);
          throw error;
        }
        store.customer.run(customerId, variationId, attemptId);
      }

      const providerAttempt = { attemptId, amountMinor, customerId, variationId };
      const subscription = attempt.subscriptionId
        ? await retrieveRecurringSubscription(revolutConfig, { ...providerAttempt, subscriptionId: attempt.subscriptionId })
        : await createRecurringSubscription(revolutConfig, providerAttempt);
      if (!attempt.subscriptionId) {
        store.subscription.run(subscription.id, subscription.setup_order_id ?? null, attemptId);
      }
      const stored = store.get.get(attemptId);
      let setupOrderId = stored?.setupOrderId;
      if (stored?.subscriptionId !== subscription.id ||
          (setupOrderId && subscription.setup_order_id && setupOrderId !== subscription.setup_order_id)) {
        throw new Error("Revolut returned a different subscription or setup order ID.");
      }

      const statusToken = signedStatus(attemptId, secret, environment);
      if (subscription.state !== "pending") {
        res.status(409).json({ code: "closed", statusToken });
        return;
      }
      if (!setupOrderId && subscription.setup_order_id) {
        setupOrderId = subscription.setup_order_id;
        store.rememberSetup.run(setupOrderId, attemptId);
      }
      if (!setupOrderId) {
        res.status(409).json({ code: "conflict", statusToken });
        return;
      }

      const order = await retrieveRecurringSetupOrder(revolutConfig, providerAttempt, setupOrderId);
      if (!order) {
        res.status(409).json({ code: "conflict", statusToken });
        return;
      }
      if (order.state !== "pending" || !order.token || order.refunded_amount ||
          (order.outstanding_amount ?? order.amount) !== amountMinor) {
        res.status(409).json({ code: "closed", statusToken });
        return;
      }
      res.json({
        token: order.token, statusToken, amountMinor, sandbox, checkoutUrl: recurringCheckoutUrl(order, environment),
      });
    } catch (error) {
      console.error("Recurring checkout failed:", error instanceof Error ? error.name : "unknown error");
      res.status(502).json({ code: "unavailable" });
    }
  });

  async function statusOrCancel(req: Request, res: Response, cancel: boolean) {
    const attemptId = attemptFromToken(req.body?.token, secret, environment);
    if (!attemptId) {
      res.status(404).json({ code: "invalid" });
      return;
    }
    try {
      const attempt = store.get.get(attemptId);
      if (!attempt?.subscriptionId || !attempt.customerId || !attempt.variationId) {
        res.status(404).json({ code: "invalid" });
        return;
      }
      const providerAttempt = {
        attemptId, amountMinor: attempt.amountMinor, subscriptionId: attempt.subscriptionId,
        customerId: attempt.customerId, variationId: attempt.variationId,
      };
      let subscription = await retrieveRecurringSubscription(revolutConfig, providerAttempt);
      if (cancel && subscription.state !== "cancelled" && subscription.state !== "finished") {
        await cancelRecurringSubscription(revolutConfig, subscription.id);
        subscription = await retrieveRecurringSubscription(revolutConfig, providerAttempt);
        if (subscription.state !== "cancelled") throw new Error("Revolut has not confirmed cancellation.");
      }
      if (subscription.state === "active") {
        const setupId = attempt.setupOrderId || subscription.setup_order_id;
        if (!setupId || (subscription.setup_order_id && setupId !== subscription.setup_order_id) ||
            subscription.payment_method_type !== "automatic" || !subscription.payment_method_id) {
          throw new Error("Revolut has not confirmed the automatic subscription.");
        }
        const setup = await retrieveRecurringSetupOrder(revolutConfig, providerAttempt, setupId);
        if (setup?.state !== "completed" || setup.outstanding_amount || setup.refunded_amount) {
          throw new Error("Revolut has not confirmed the subscription's first payment.");
        }
      }
      res.json({ status: subscription.state, amountMinor: attempt.amountMinor });
    } catch (error) {
      console.error("Recurring status failed:", error instanceof Error ? error.name : "unknown error");
      res.status(502).json({ code: "unavailable" });
    }
  }

  app.post(`${API_PATH}/status`, (req, res) => statusOrCancel(req, res, false));
  app.post(`${API_PATH}/cancel`, (req, res) => statusOrCancel(req, res, true));
}
