import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import Database from "better-sqlite3";
import express from "express";
import { aiLearningProducts } from "../../../shared/aiLearningProducts";

const testDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "bisolutions-ai-learning-"));
const originalEnvironment = { ...process.env };
process.env.DATA_DIR = testDirectory;
const { registerAiLearningRoutes } = await import("./aiLearning");
const product = aiLearningProducts[0];
const englishPdf = Buffer.from("%PDF-1.4\nEnglish full learning pack fixture\n%%EOF");
const greekPdf = Buffer.from("%PDF-1.4\nGreek full learning pack fixture\n%%EOF");
for (const [folder, filename, bytes] of [
  ["English", product.filenames.en, englishPdf],
  ["Greek", product.filenames.el, greekPdf],
] as const) {
  fs.mkdirSync(path.join(testDirectory, folder));
  fs.writeFileSync(path.join(testDirectory, folder, filename), bytes);
}

interface SentEmail { to: string; subject: string; text: string; html: string }
const originalFetch = globalThis.fetch;
let sent: SentEmail[] = [];
let rejectEmail = false;
let idempotencyKey: string | null = null;
globalThis.fetch = async (input, init) => {
  assert.equal(String(input), "https://api.resend.com/emails", "Only stubbed Resend requests are allowed");
  sent.push(JSON.parse(String(init?.body)));
  idempotencyKey = new Headers(init?.headers).get("Idempotency-Key");
  return new Response(JSON.stringify(rejectEmail
    ? { name: "validation_error", message: "Rejected by provider" }
    : { id: "stubbed-email-id" }), { status: rejectEmail ? 400 : 200 });
};

function request(server: http.Server, method: string, requestPath: string, body?: unknown, requestHeaders: Record<string, string> = {}) {
  return new Promise<{ status: number; headers: http.IncomingHttpHeaders; body: Buffer }>((resolve, reject) => {
    const address = server.address() as { port: number };
    const req = http.request({
      hostname: "127.0.0.1", port: address.port, method, path: requestPath,
      headers: { "Content-Type": "application/json", Host: "untrusted.example", ...requestHeaders },
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve({ status: res.statusCode!, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on("error", reject);
    req.end(body === undefined ? undefined : JSON.stringify(body));
  });
}

const validBody = { email: "learner@example.com", role: product.role, experience: "novice", language: "en", website: "" };
function downloadPath() {
  return new URL(sent.at(-1)!.text.match(/https?:\/\/\S+\/api\/ai-learning\/download\/[a-f0-9]{64}/)![0]).pathname;
}

test("AI learning email access and private full PDF delivery", async (t) => {
  let server: http.Server;
  let db: Database.Database;
  async function startServer() {
    const app = express();
    app.use(express.json());
    db = registerAiLearningRoutes(app);
    server = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server.once("listening", resolve));
  }
  async function stopServer() {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    db.close();
  }
  t.beforeEach(async () => {
    process.env.RESEND_API_KEY = "re_test_stubbed";
    process.env.AI_LEARNING_FROM_EMAIL = "AI Learning <learning@example.com>";
    process.env.CONTACT_FROM_EMAIL = "";
    process.env.APP_URL = "https://www.example.com";
    process.env.AI_LEARNING_API_URL = "";
    delete process.env.AI_LEARNING_DATA_DIR;
    process.env.AI_LEARNING_PDF_DIR = testDirectory;
    sent = [];
    rejectEmail = false;
    await startServer();
    db.prepare("DELETE FROM ai_learning_access").run();
  });
  t.afterEach(async () => {
    await stopServer();
  });
  t.after(() => {
    globalThis.fetch = originalFetch;
    for (const key of Object.keys(process.env)) if (!(key in originalEnvironment)) delete process.env[key];
    Object.assign(process.env, originalEnvironment);
    assert.equal(path.dirname(testDirectory), path.resolve(os.tmpdir()));
    assert.ok(path.basename(testDirectory).startsWith("bisolutions-ai-learning-"));
    fs.rmSync(testDirectory, { recursive: true });
  });

  await t.test("rejects invalid email, catalog role, experience, language and honeypot", async () => {
    for (const invalid of [
      { email: "invalid" }, { role: "../secrets" }, { experience: "unknown" },
      { language: "de" }, { website: "spam.example" },
    ]) {
      const result = await request(server, "POST", "/api/ai-learning/access", { ...validBody, ...invalid });
      assert.equal(result.status, 400);
    }
    assert.equal(sent.length, 0);
  });

  await t.test("uses a dedicated SQLite file and preserves tokens when the configured store is reopened", async () => {
    assert.equal(fs.existsSync(path.join(testDirectory, "ai-learning.db")), true);
    assert.equal(fs.existsSync(path.join(testDirectory, "bisolutions.db")), false);
    await stopServer();
    const featureDirectory = path.join(testDirectory, "feature-volume", "learning");
    process.env.AI_LEARNING_DATA_DIR = featureDirectory;
    await startServer();
    assert.equal(fs.existsSync(path.join(featureDirectory, "ai-learning.db")), true);
    assert.equal((await request(server, "POST", "/api/ai-learning/access", validBody)).status, 200);
    const requestPath = downloadPath();
    const defaultStore = new Database(path.join(testDirectory, "ai-learning.db"), { readonly: true });
    assert.equal(defaultStore.prepare("SELECT COUNT(*) AS count FROM ai_learning_access").get().count, 0);
    defaultStore.close();
    assert.equal(db.pragma("journal_mode", { simple: true }), "wal");
    await stopServer();
    await startServer();
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM ai_learning_access").get().count, 1);
    const download = await request(server, "GET", requestPath);
    assert.equal(download.status, 200);
    assert.deepEqual(download.body, englishPdf);
    assert.equal(fs.existsSync(path.join(testDirectory, "bisolutions.db")), false);
  });

  await t.test("fails honestly when delivery configuration or the full PDF is absent", async () => {
    for (const [key, value] of [
      ["RESEND_API_KEY", ""], ["AI_LEARNING_FROM_EMAIL", ""], ["APP_URL", ""],
      ["APP_URL", "javascript:alert(1)"], ["AI_LEARNING_PDF_DIR", path.join(testDirectory, "missing")],
    ]) {
      const previous = process.env[key];
      process.env[key] = value;
      const result = await request(server, "POST", "/api/ai-learning/access", validBody);
      assert.equal(result.status, 503);
      process.env[key] = previous;
    }
    assert.equal(sent.length, 0);
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM ai_learning_access").get().count, 0);
  });

  await t.test("accepts delivery, stores only a token hash and streams the selected full PDF", async () => {
    const result = await request(server, "POST", "/api/ai-learning/access", { ...validBody, email: " Learner@Example.com " });
    assert.equal(result.status, 200);
    assert.deepEqual(JSON.parse(result.body.toString()), { success: true });
    assert.equal(sent.length, 1);
    assert.equal(sent[0].to, "learner@example.com");
    assert.ok(sent[0].text.includes("100 prompts"));
    assert.ok(sent[0].text.includes("7 days"));
    assert.ok(sent[0].text.includes("https://www.example.com/api/ai-learning/download/"));
    assert.ok(sent[0].text.includes("https://www.example.com/resources/ai-prompt-packs"));
    assert.ok(sent[0].html.includes('href="https://www.example.com/resources/ai-prompt-packs"'));
    assert.ok(!sent[0].text.includes("untrusted.example"));
    const requestPath = downloadPath();
    const token = requestPath.split("/").at(-1)!;
    const row = db.prepare("SELECT * FROM ai_learning_access").get();
    assert.equal(row.token_hash, crypto.createHash("sha256").update(token).digest("hex"));
    assert.equal(idempotencyKey, row.token_hash);
    assert.ok(!JSON.stringify(row).includes(token));
    assert.equal(row.role, product.role);
    assert.equal(row.experience, "novice");
    assert.equal(row.language, "en");
    assert.equal(row.expires_at - row.requested_at, 7 * 24 * 60 * 60 * 1000);
    assert.ok(row.delivered_at);
    const download = await request(server, "GET", requestPath);
    assert.equal(download.status, 200);
    assert.deepEqual(download.body, englishPdf);
    assert.equal(download.headers["content-type"], "application/pdf");
    assert.match(download.headers["content-disposition"]!, /attachment/);
    assert.match(download.headers["cache-control"]!, /no-store/);
    assert.equal(download.headers["referrer-policy"], "no-referrer");
    assert.match(download.headers["x-robots-tag"]!, /noindex/);
    await new Promise((resolve) => setImmediate(resolve));
    const downloaded = db.prepare("SELECT verified_at, downloaded_at FROM ai_learning_access").get();
    assert.ok(downloaded.verified_at);
    assert.ok(downloaded.downloaded_at);
  });

  await t.test("uses Greek PDF and an explicitly configured API origin", async () => {
    process.env.AI_LEARNING_API_URL = "https://api.example.com";
    assert.equal((await request(server, "POST", "/api/ai-learning/access", { ...validBody, language: "el" })).status, 200);
    assert.match(sent[0].text, /https:\/\/api\.example\.com\/api\/ai-learning\/download\//);
    assert.match(sent[0].text, /7 ημέρες/);
    assert.ok(sent[0].subject.includes(product.nameEl));
    assert.ok(sent[0].text.includes("https://www.example.com/el/resources/ai-prompt-packs"));
    assert.ok(sent[0].html.includes('href="https://www.example.com/el/resources/ai-prompt-packs"'));
    assert.deepEqual((await request(server, "GET", downloadPath())).body, greekPdf);
  });

  await t.test("returns provider failures and removes the reservation so a retry can succeed", async () => {
    rejectEmail = true;
    assert.equal((await request(server, "POST", "/api/ai-learning/access", validBody)).status, 502);
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM ai_learning_access").get().count, 0);
    rejectEmail = false;
    assert.equal((await request(server, "POST", "/api/ai-learning/access", validBody)).status, 200);
  });

  await t.test("throttles the same normalized email until the cooldown has elapsed", async () => {
    assert.equal((await request(server, "POST", "/api/ai-learning/access", validBody)).status, 200);
    const duplicate = await request(server, "POST", "/api/ai-learning/access", { ...validBody, email: "LEARNER@EXAMPLE.COM" });
    assert.equal(duplicate.status, 429);
    assert.equal(duplicate.headers["retry-after"], "60");
    assert.equal(sent.length, 1);
    db.prepare("UPDATE ai_learning_access SET requested_at = ?").run(Date.now() - 61_000);
    assert.equal((await request(server, "POST", "/api/ai-learning/access", validBody)).status, 200);
  });

  await t.test("rejects unknown, pending and expired links without revealing private paths", async () => {
    assert.equal((await request(server, "GET", "/api/ai-learning/download/bad")).status, 404);
    assert.equal((await request(server, "GET", `/api/ai-learning/download/${"0".repeat(64)}`)).status, 404);
    await request(server, "POST", "/api/ai-learning/access", validBody);
    const requestPath = downloadPath();
    db.prepare("UPDATE ai_learning_access SET delivered_at = NULL").run();
    assert.equal((await request(server, "GET", requestPath)).status, 404);
    db.prepare("UPDATE ai_learning_access SET delivered_at = ?, expires_at = ?").run(Date.now(), Date.now() - 1);
    const expired = await request(server, "GET", requestPath);
    assert.equal(expired.status, 410);
    assert.ok(!expired.body.toString().includes(testDirectory));
  });

  await t.test("gives browsers clickable recovery for invalid, expired and unavailable downloads, preserving JSON for APIs", async () => {
    const browserHeaders = { Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" };
    const invalid = await request(server, "GET", "/api/ai-learning/download/bad", undefined, browserHeaders);
    assert.equal(invalid.status, 404);
    assert.match(invalid.headers["content-type"]!, /text\/html/);
    assert.ok(invalid.body.toString().includes('href="https://www.example.com/resources/ai-prompt-packs"'));
    assert.ok(!invalid.body.toString().includes("untrusted.example"));

    process.env.AI_LEARNING_API_URL = "https://api.example.com";
    await request(server, "POST", "/api/ai-learning/access", { ...validBody, language: "el" });
    const requestPath = downloadPath();
    db.prepare("UPDATE ai_learning_access SET expires_at = ?").run(Date.now() - 1);
    const expired = await request(server, "GET", requestPath, undefined, browserHeaders);
    assert.equal(expired.status, 410);
    assert.match(expired.headers["content-type"]!, /text\/html/);
    assert.ok(expired.body.toString().includes('href="https://www.example.com/el/resources/ai-prompt-packs"'));
    assert.ok(!expired.body.toString().includes(requestPath));

    db.prepare("UPDATE ai_learning_access SET expires_at = ?").run(Date.now() + 60_000);
    process.env.AI_LEARNING_PDF_DIR = path.join(testDirectory, "missing");
    const unavailable = await request(server, "GET", requestPath, undefined, browserHeaders);
    assert.equal(unavailable.status, 503);
    assert.match(unavailable.headers["content-type"]!, /text\/html/);
    assert.ok(unavailable.body.toString().includes('href="https://www.example.com/el/resources/ai-prompt-packs"'));
    assert.ok(!unavailable.body.toString().includes(testDirectory));
    const apiFailure = await request(server, "GET", requestPath, undefined, { Accept: "application/json" });
    assert.equal(apiFailure.status, 503);
    assert.match(apiFailure.headers["content-type"]!, /application\/json/);
    assert.equal(typeof JSON.parse(apiFailure.body.toString()).message, "string");
  });

  await t.test("never turns untrusted website configuration into an unsafe recovery link", async () => {
    process.env.APP_URL = "javascript:alert(1)";
    const invalid = await request(server, "GET", "/api/ai-learning/download/bad", undefined, { Accept: "text/html" });
    assert.equal(invalid.status, 404);
    assert.ok(!invalid.body.toString().includes("javascript:"));
    assert.ok(!invalid.body.toString().includes("href="));
  });

  await t.test("limits each IP and prunes delivery records older than 30 days", async () => {
    for (let index = 0; index < 5; index++) {
      assert.equal((await request(server, "POST", "/api/ai-learning/access", { ...validBody, email: "invalid" })).status, 400);
    }
    assert.equal((await request(server, "POST", "/api/ai-learning/access", validBody)).status, 429);
    db.prepare(`INSERT INTO ai_learning_access (token_hash, email, role, experience, language, requested_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).run("old", "old@example.com", product.role, "novice", "en", Date.now() - 31 * 86400_000, 0);
    await request(server, "GET", "/api/ai-learning/download/bad");
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM ai_learning_access").get().count, 0);
    assert.equal(sent.length, 0);
  });
});
