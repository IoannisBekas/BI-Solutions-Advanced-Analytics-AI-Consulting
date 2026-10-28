import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import express from "express";

function request(server: http.Server, method: string, requestPath: string, body?: unknown) {
  return new Promise<{ status: number; headers: http.IncomingHttpHeaders; body: Buffer }>((resolve, reject) => {
    const address = server.address() as { port: number };
    const req = http.request({
      hostname: "127.0.0.1", port: address.port, method, path: requestPath,
      headers: { "Content-Type": "application/json" },
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve({ status: res.statusCode!, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on("error", reject);
    req.setTimeout(10_000, () => req.destroy(new Error("Local validation request timed out")));
    req.end(body === undefined ? undefined : JSON.stringify(body));
  });
}

test("Zod migration preserves validation before authentication, persistence and provider calls", async (t) => {
  const originalEnvironment = { ...process.env };
  const originalFetch = globalThis.fetch;
  const testDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "bisolutions-validation-"));
  let server: http.Server | undefined;
  let closeDatabase = () => {};
  let sent: Record<string, unknown>[] = [];
  const unexpectedRequests: string[] = [];

  t.after(async () => {
    try {
      if (server) await new Promise<void>((resolve, reject) => server!.close((error) => error ? reject(error) : resolve()));
    } finally {
      closeDatabase();
      globalThis.fetch = originalFetch;
      for (const key of Object.keys(process.env)) if (!(key in originalEnvironment)) delete process.env[key];
      Object.assign(process.env, originalEnvironment);
      assert.equal(path.dirname(path.resolve(testDirectory)), path.resolve(os.tmpdir()));
      assert.ok(path.basename(testDirectory).startsWith("bisolutions-validation-"));
      fs.rmSync(testDirectory, { recursive: true });
    }
    assert.deepEqual(unexpectedRequests, [], "Tests must not make unexpected network requests");
  });

  Object.assign(process.env, {
    DATA_DIR: testDirectory,
    NODE_ENV: "test",
    JWT_SECRET: "validation-test-secret-not-used-outside-this-process",
    RESEND_API_KEY: "re_validation_test_stub",
    CONTACT_RECIPIENT_EMAIL: "owner@example.com",
    CONTACT_FROM_EMAIL: "Validation <contact@example.com>",
    ANTHROPIC_API_KEY: "validation-test-provider-stub",
    POWERBI_SOLUTIONS_ANTHROPIC_API_KEY: "",
    GEMINI_API_KEY: "",
  });
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url !== "https://api.resend.com/emails") {
      unexpectedRequests.push(url);
      throw new Error("Unexpected network request in validation regression test");
    }
    sent.push(JSON.parse(String(init?.body)));
    return new Response(JSON.stringify({ id: "validation-stubbed-email" }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  };

  const { db } = await import("./db");
  closeDatabase = () => db.close();
  const [{ authRouter }, { registerContactRoute }, { registerBonusakiRoutes }, { registerAdvisorRoutes }] = await Promise.all([
    import("./auth"), import("./routes/contact"), import("./routes/bonusaki"), import("./routes/advisor"),
  ]);
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRouter);
  registerContactRoute(app);
  registerBonusakiRoutes(app);
  registerAdvisorRoutes(app);
  server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server!.once("listening", resolve));
  const runningServer = server;
  t.beforeEach(() => { sent = []; });

  const registration = { email: "learner+tag@example.com", name: "Migration Learner", password: "A migration password 2026!" };
  await t.test("registers and signs in with the same trimmed, normalized email", async () => {
    const registered = await request(runningServer, "POST", "/api/auth/register", {
      ...registration, email: "  Learner+Tag@Example.COM  ", name: "  Migration Learner  ", credits: 999_999,
    });
    assert.equal(registered.status, 201);
    const account = JSON.parse(registered.body.toString()).user;
    assert.equal(account.email, registration.email);
    assert.equal(account.name, registration.name);
    assert.equal(account.credits, 0, "Unknown request fields cannot assign signup credits");
    assert.ok(registered.headers["set-cookie"]?.some((cookie) => cookie.startsWith("auth_token=")));

    const loggedIn = await request(runningServer, "POST", "/api/auth/login", {
      email: " LEARNER+TAG@EXAMPLE.COM ", password: registration.password,
    });
    assert.equal(loggedIn.status, 200);
    assert.equal(JSON.parse(loggedIn.body.toString()).user.email, registration.email);
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM users").get().count, 1);
    assert.equal(sent.length, 0);
  });

  await t.test("rejects malformed auth fields and length violations without creating users", async () => {
    for (const invalid of [
      { email: 123 }, { email: null }, { email: "invalid" }, { name: "   " },
      { name: "n".repeat(121) }, { password: "p".repeat(11) }, { password: "p".repeat(129) },
    ]) {
      assert.equal((await request(runningServer, "POST", "/api/auth/register", { ...registration, ...invalid })).status, 400);
    }
    for (const invalid of [{ password: 123 }, { password: "p".repeat(129) }, { email: [registration.email] }]) {
      assert.equal((await request(runningServer, "POST", "/api/auth/login", { ...registration, ...invalid })).status, 400);
    }
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM users").get().count, 1);
    assert.equal(sent.length, 0);
  });

  const contact = { name: "Learner", email: "learner@example.com", subject: "Learning pack", message: "Please help with the pack." };
  await t.test("rejects invalid contact submissions before calling the email provider", async () => {
    for (const invalid of [
      { name: "   " }, { name: "n".repeat(201) }, { subject: "s".repeat(201) },
      { message: "m".repeat(5001) }, { message: ["not a string"] }, { email: 123 }, { email: "invalid" },
      { inquiryId: "not-a-uuid" }, { inquiryId: "6c12dfbe-687f-4d54-032d-5a76170a0411" },
    ]) {
      assert.equal((await request(runningServer, "POST", "/api/contact", { ...contact, ...invalid })).status, 400);
    }
    assert.equal((await request(runningServer, "POST", "/api/contact", [])).status, 400);
    assert.equal(sent.length, 0);
  });

  await t.test("accepts contact fields at their limits after trimming and preserves the reply address", async () => {
    const inquiryId = "6c12dfbe-687f-4d54-a32d-5a76170a0411";
    const result = await request(runningServer, "POST", "/api/contact", {
      name: ` ${"n".repeat(200)} `, email: " Contact+Tag@Example.COM ",
      subject: ` ${"s".repeat(200)} `, message: ` ${"m".repeat(5000)} `, inquiryId,
    });
    assert.equal(result.status, 200);
    assert.deepEqual(JSON.parse(result.body.toString()), { success: true, inquiryId });
    assert.equal(sent.length, 1);
    assert.equal(sent[0].reply_to, "Contact+Tag@Example.COM");
    assert.equal(sent[0].subject, `[Contact ${inquiryId.slice(0, 8)}] ${"s".repeat(200)}`);
    assert.ok(String(sent[0].html).includes("m".repeat(5000)));
  });

  await t.test("rejects structured query parameters instead of treating them as campaign slugs", async () => {
    for (const query of ["merchantSlug=one&merchantSlug=two", "campaignSlug[nested]=value"]) {
      assert.equal((await request(runningServer, "GET", `/api/bonusaki/campaign?${query}`)).status, 400);
    }
    assert.equal(sent.length, 0);
  });

  await t.test("preserves nested Bonusaki metadata and rejects invalid records without storing events", async () => {
    const metadata = { workflow: { steps: ["collect", { reviewed: true }], score: 0.8 }, empty: null };
    const accepted = await request(runningServer, "POST", "/api/bonusaki/events", {
      eventName: " migration.check ", surface: " test ", metadata,
    });
    assert.equal(accepted.status, 200);
    assert.deepEqual(JSON.parse(accepted.body.toString()), { success: true });
    const row = db.prepare("SELECT event_name, surface, metadata_json FROM bonusaki_event_log ORDER BY rowid DESC LIMIT 1").get();
    assert.equal(row.event_name, "migration.check");
    assert.equal(row.surface, "test");
    assert.deepEqual(JSON.parse(row.metadata_json), metadata);

    for (const invalid of [{ metadata: [] }, { metadata: null }, { metadata: 123 }, { eventName: "e".repeat(81) }, { sessionId: 123 }]) {
      assert.equal((await request(runningServer, "POST", "/api/bonusaki/events", { eventName: "invalid.event", ...invalid })).status, 400);
    }
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM bonusaki_event_log").get().count, 1);
    assert.equal(sent.length, 0);
  });

  await t.test("enforces Bonusaki email and credential limits before reward processing", async () => {
    for (const customerEmail of [123, "invalid"]) {
      assert.equal((await request(runningServer, "POST", "/api/bonusaki/rewards/issue", { customerEmail })).status, 400);
    }
    for (const credentials of [{}, { token: "t".repeat(11) }, { token: "t".repeat(2001) }, { publicCode: "abc" }, { publicCode: 123 }]) {
      assert.equal((await request(runningServer, "POST", "/api/bonusaki/rewards/validate", credentials)).status, 400);
    }
    assert.equal((await request(runningServer, "POST", "/api/bonusaki/rewards/validate", { publicCode: "ABCD" })).status, 404);
    assert.equal(sent.length, 0);
  });

  await t.test("rejects invalid advisor inputs with a configured provider before making upstream calls", async () => {
    const advisor = { role: "consultant", question: "How can I prioritize my tasks?", language: "english" };
    for (const invalid of [{ role: "unknown" }, { question: "" }, { question: "q".repeat(2001) }, { question: 123 }, { language: 123 }]) {
      assert.equal((await request(runningServer, "POST", "/api/ai-advisor", { ...advisor, ...invalid })).status, 400);
    }
    assert.equal(sent.length, 0);
    assert.deepEqual(unexpectedRequests, []);
  });
});
