import crypto from "crypto";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import type { Express, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { Resend } from "resend";
import { z } from "zod";
import { composeAiLearningEmail } from "../emails/aiLearning";
import {
  aiLearningProducts,
  learningExperiences,
  learningLanguages,
  learningRoles,
  type LearningLanguage,
} from "../../../shared/aiLearningProducts";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const LINK_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const RECORD_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const EMAIL_COOLDOWN_MS = 60 * 1000;
const accessBodySchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  role: z.enum(learningRoles),
  experience: z.enum(learningExperiences),
  language: z.enum(learningLanguages),
  website: z.string().trim().max(0).optional(),
});

interface AccessRecord {
  token_hash: string;
  role: string;
  language: LearningLanguage;
  expires_at: number;
  delivered_at: number | null;
}

function tokenHash(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function httpOrigin(value: string | undefined) {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname || url.username || url.password) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

function deliveryConfiguration() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.AI_LEARNING_FROM_EMAIL?.trim() || process.env.CONTACT_FROM_EMAIL?.trim();
  const websiteOrigin = httpOrigin(process.env.APP_URL);
  const origin = httpOrigin(process.env.AI_LEARNING_API_URL?.trim() || process.env.APP_URL);
  return apiKey && from && websiteOrigin && origin ? { apiKey, from, websiteOrigin, origin } : null;
}

function learningFinderUrl(language: LearningLanguage, origin = httpOrigin(process.env.APP_URL)) {
  return origin ? new URL(`${language === "el" ? "/el" : ""}/resources/ai-prompt-packs`, origin).href : null;
}

function pdfPath(filename: string, language: LearningLanguage) {
  const root = process.env.AI_LEARNING_PDF_DIR?.trim() || path.join(DATA_DIR, "ai-learning-pdfs");
  return path.resolve(root, language === "en" ? "English" : "Greek", filename);
}

function isAvailablePdf(filePath: string) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

function downloadError(req: Request, res: Response, status: number, message: string, language: LearningLanguage = "en") {
  if (!/(?:^|,)\s*text\/html(?:\s*;|\s*,|\s*$)/i.test(req.get("accept") || "")) {
    res.status(status).json({ message });
    return;
  }

  const title = language === "el" ? "Το AI learning pack σου" : "Your AI learning pack";
  const action = language === "el" ? "Επιστροφή στην επιλογή AI learning pack" : "Return to the AI learning pack finder";
  const finder = learningFinderUrl(language);
  const recovery = finder ? `<p><a href="${escapeHtml(finder)}">${escapeHtml(action)}</a></p>` : "";
  res.status(status).type("html").send(`<!doctype html><html lang="${language}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title></head><body><main style="max-width:38rem;margin:12vh auto;padding:1.5rem;font-family:system-ui,sans-serif;line-height:1.6"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p>${recovery}</main></body></html>`);
}

export function registerAiLearningRoutes(app: Express) {
  const dataDirectory = process.env.AI_LEARNING_DATA_DIR?.trim() || DATA_DIR;
  fs.mkdirSync(dataDirectory, { recursive: true });
  const db = new Database(path.join(dataDirectory, "ai-learning.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_learning_access (
      token_hash TEXT PRIMARY KEY,
      email TEXT NOT NULL COLLATE NOCASE,
      role TEXT NOT NULL,
      experience TEXT NOT NULL,
      language TEXT NOT NULL,
      requested_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      delivered_at INTEGER,
      verified_at INTEGER,
      downloaded_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_ai_learning_email_requested
      ON ai_learning_access(email, requested_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ai_learning_requested
      ON ai_learning_access(requested_at);
  `);

  const cleanup = db.prepare("DELETE FROM ai_learning_access WHERE requested_at < ?");
  const latestRequest = db.prepare("SELECT requested_at FROM ai_learning_access WHERE email = ? ORDER BY requested_at DESC LIMIT 1");
  const insert = db.prepare(`
    INSERT INTO ai_learning_access (token_hash, email, role, experience, language, requested_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const remove = db.prepare("DELETE FROM ai_learning_access WHERE token_hash = ? AND delivered_at IS NULL");
  const markDelivered = db.prepare("UPDATE ai_learning_access SET delivered_at = ? WHERE token_hash = ?");
  const findAccess = db.prepare("SELECT token_hash, role, language, expires_at, delivered_at FROM ai_learning_access WHERE token_hash = ?");
  const markDownloaded = db.prepare(`
    UPDATE ai_learning_access
    SET verified_at = COALESCE(verified_at, ?), downloaded_at = ?
    WHERE token_hash = ?
  `);

  app.use("/api/ai-learning", (_req, res, next) => {
    res.set({
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    });
    cleanup.run(Date.now() - RECORD_RETENTION_MS);
    next();
  });

  const accessLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many access requests. Please try again later." },
  });

  app.post("/api/ai-learning/access", accessLimiter, async (req, res) => {
    const parsed = accessBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Please provide a valid email, role, AI experience and PDF language." });
      return;
    }

    const { email, role, experience, language } = parsed.data;
    const product = aiLearningProducts.find((item) => item.role === role)!;
    const configuration = deliveryConfiguration();
    if (!configuration || !isAvailablePdf(pdfPath(product.filenames[language], language))) {
      res.status(503).json({ message: "PDF delivery is not available yet. Please try again later." });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const hash = tokenHash(token);
    const requestedAt = Date.now();
    const reserve = db.transaction(() => {
      const latest = latestRequest.get(email) as { requested_at: number } | undefined;
      if (latest && requestedAt - latest.requested_at < EMAIL_COOLDOWN_MS) return false;
      insert.run(hash, email, role, experience, language, requestedAt, requestedAt + LINK_LIFETIME_MS);
      return true;
    });

    let providerAccepted = false;
    try {
      if (!reserve()) {
        res.setHeader("Retry-After", "60");
        res.status(429).json({ message: "Please wait a minute before requesting another email." });
        return;
      }

      const url = new URL(`/api/ai-learning/download/${token}`, configuration.origin).href;
      const finder = learningFinderUrl(language, configuration.websiteOrigin)!;
      const title = language === "el" ? product.nameEl : product.name;
      const message = composeAiLearningEmail({
        language,
        title,
        downloadUrl: url,
        finderUrl: finder,
        websiteOrigin: configuration.websiteOrigin,
      });

      const { data, error } = await new Resend(configuration.apiKey).emails.send({
        from: configuration.from,
        to: email,
        ...message,
      }, { idempotencyKey: hash });

      if (error || !data?.id) {
        remove.run(hash);
        res.status(502).json({ message: "We could not send your access email. Please try again." });
        return;
      }

      providerAccepted = true;
      markDelivered.run(Date.now(), hash);
      res.json({ success: true });
    } catch {
      // Provider payloads and errors may contain private addresses or access URLs.
      console.error("AI learning email delivery failed.");
      if (!providerAccepted) {
        try {
          remove.run(hash);
        } catch {
          console.error("AI learning reservation cleanup failed.");
        }
      }
      res.status(502).json({ message: "We could not send your access email. Please try again." });
    }
  });

  app.get("/api/ai-learning/download/:token", (req, res) => {
    const token = req.params.token;
    if (!/^[a-f0-9]{64}$/.test(token)) {
      downloadError(req, res, 404, "This access link is not valid. Please request a new email.");
      return;
    }

    const access = findAccess.get(tokenHash(token)) as AccessRecord | undefined;
    if (!access?.delivered_at) {
      downloadError(req, res, 404, "This access link is not valid. Please request a new email.");
      return;
    }
    if (access.expires_at <= Date.now()) {
      downloadError(req, res, 410, access.language === "el"
        ? "Ο σύνδεσμος πρόσβασης έληξε. Ζήτησε νέο email από τη σελίδα επιλογής."
        : "This access link has expired. Please request a new email.", access.language);
      return;
    }

    const product = aiLearningProducts.find((item) => item.role === access.role);
    if (!product || !learningLanguages.includes(access.language)) {
      downloadError(req, res, 404, "This access link is not valid. Please request a new email.");
      return;
    }
    const filename = product.filenames[access.language];
    const filePath = pdfPath(filename, access.language);
    if (!isAvailablePdf(filePath)) {
      downloadError(req, res, 503, access.language === "el"
        ? "Το PDF δεν είναι διαθέσιμο προσωρινά. Δοκίμασε ξανά αργότερα."
        : "This PDF is temporarily unavailable. Please try again later.", access.language);
      return;
    }

    res.download(filePath, filename, { headers: { "Content-Type": "application/pdf" } }, (error) => {
      if (error) {
        if (!res.headersSent) {
          res.removeHeader("Content-Disposition");
          downloadError(req, res, 503, "This PDF is temporarily unavailable. Please try again later.", access.language);
        }
        else res.destroy();
        return;
      }
      if (req.method === "GET") markDownloaded.run(Date.now(), Date.now(), access.token_hash);
    });
  });

  return db;
}
