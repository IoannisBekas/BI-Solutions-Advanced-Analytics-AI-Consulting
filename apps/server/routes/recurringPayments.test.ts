import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { once } from "node:events";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { test, type TestContext } from "node:test";
import Database from "better-sqlite3";
import express from "express";
import { registerRecurringPaymentRoutes } from "./recurringPayments";

const SECRET = "recurring-mock-secret-at-least-32-characters";

async function api(t: TestContext, environment: "sandbox" | "production", apiKey = environment === "sandbox"
  ? "r_test_mock_key" : "r_prod_mock_key") {
  const configuration = {
    RECURRING_PAYMENTS_ENABLED: "true",
    RECURRING_PAYMENTS_REVOLUT_ENV: environment,
    RECURRING_PAYMENTS_REVOLUT_API_KEY: apiKey,
    RECURRING_PAYMENTS_TOKEN_SECRET: SECRET,
    RECURRING_PAYMENTS_DATA_DIR: "sandbox-test-path",
    RECURRING_PAYMENTS_FROM_EMAIL: "Billing <billing@example.com>",
    RESEND_API_KEY: "re_recurring_mock",
  };
  for (const [name, value] of Object.entries(configuration)) {
    const previous = process.env[name];
    process.env[name] = value;
    t.after(() => {
      if (previous === undefined) delete process.env[name];
      else process.env[name] = previous;
    });
  }
  const database = new Database(":memory:");
  t.after(() => database.close());
  const app = express();
  app.use(express.json());
  registerRecurringPaymentRoutes(app, database);
  const server = createServer(app).listen(0, "127.0.0.1");
  t.after(() => server.close());
  await once(server, "listening");
  const endpoint = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/recurring-payments`;
  const localFetch = globalThis.fetch;
  return {
    database,
    config: () => localFetch(`${endpoint}/config`),
    post: (action: "checkout" | "status" | "cancel", payload: object) => localFetch(`${endpoint}/${action}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    }),
  };
}

test("recurring API rejects a Sandbox key in the Production environment", async (t) => {
  const { config, post } = await api(t, "production", "r_test_mock_key");
  assert.deepEqual(await (await config()).json(), { enabled: false });
  assert.equal((await post("checkout", {})).status, 503);
});

test("recurring checkout recovers only operations safe to retry", async (t) => {
  const { database, post } = await api(t, "sandbox");
  const input = { amount: "20.25", email: "buyer@example.com", consent: true, attemptId: randomUUID() };
  const variationId = randomUUID();
  const customerId = randomUUID();
  const subscriptionId = randomUUID();
  let planWrites = 0;
  let planReads = 0;
  let customerWrites = 0;
  let subscriptionWrites = 0;
  let plan: object;
  t.mock.method(globalThis, "fetch", async (url: string, init?: RequestInit) => {
    const target = new URL(url);
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    if (target.pathname === "/api/subscription-plans") {
      if (init?.method === "GET") {
        planReads++;
        assert.equal(target.searchParams.get("limit"), "50");
        return Response.json({ subscription_plans: [plan] });
      }
      planWrites++;
      if (planWrites === 1) return new Response(null, { status: 422 });
      plan = {
        name: body.name, state: "active", variations: [{ id: variationId, phases: body.variations[0].phases }],
      };
      throw new Error("Plan created but its response was lost.");
    }
    if (target.pathname === "/api/customers") {
      customerWrites++;
      assert.equal(body.email, input.email);
      if (customerWrites === 1) return new Response(null, { status: 429 });
      return Response.json({ id: customerId, email: input.email }, { status: 201 });
    }
    assert.equal(target.pathname, "/api/subscriptions");
    assert.equal(new Headers(init?.headers).get("Idempotency-Key"), input.attemptId);
    assert.equal(body.customer_id, customerId);
    assert.equal(body.plan_variation_id, variationId);
    subscriptionWrites++;
    if (subscriptionWrites === 1) throw new Error("Subscription created but its response was lost.");
    return Response.json({
      id: subscriptionId, state: "pending", customer_id: customerId, external_reference: body.external_reference,
      plan_variation_id: variationId, payment_method_type: "automatic",
    }, { status: 201 });
  });

  assert.equal((await post("checkout", input)).status, 502); // Known plan rejection releases the reservation.
  assert.equal((await post("checkout", input)).status, 502); // Ambiguous plan result leaves it reserved.
  assert.equal((await post("checkout", input)).status, 409); // No immediate second plan write.
  database.prepare("UPDATE monthly_sandbox_variations SET reserved_at = ? WHERE amount_minor = 2025").run(Date.now() - 60_000);
  assert.equal((await post("checkout", input)).status, 502); // Recovered plan; known customer rejection.
  assert.equal((await post("checkout", input)).status, 502); // Customer persisted; ambiguous subscription.
  const recovery = await post("checkout", input);
  assert.equal(recovery.status, 409); // Pending setup order on the same subscription.
  assert.match((await recovery.json()).statusToken, /^[0-9a-f-]{36}\.[A-Za-z0-9_-]{43}$/);
  assert.deepEqual([planWrites, planReads, customerWrites, subscriptionWrites], [2, 1, 2, 2]);
});

async function verifyRecurringLifecycle(t: TestContext, environment: "sandbox" | "production") {
  const { config, post, database } = await api(t, environment);
  const sandbox = environment === "sandbox";
  const checkoutOrigin = sandbox ? "https://sandbox-checkout.revolut.com" : "https://checkout.revolut.com";
  const first = {
    amount: "17,53", email: " Buyer@Example.com ", consent: true, attemptId: randomUUID(),
    ...(sandbox ? {} : { service: "Project maintenance", locale: "en" }),
  };
  let noticeRequests = 0;
  const variationId = randomUUID();
  let plans = 0;
  let customers = 0;
  let subscriptions = 0;
  let cancels = 0;
  let revealOrder = false;
  let orderReady = false;
  let orderState = "pending";
  let subscriptionState = "pending";
  type Subscription = { id: string; orderId: string; token: string; customerId: string; reference: string };
  const byId = new Map<string, Subscription>();
  const byOrder = new Map<string, Subscription>();

  t.mock.method(globalThis, "fetch", async (url: string, init?: RequestInit) => {
    const target = new URL(url);
    if (target.origin === "https://api.resend.com") {
      assert.equal(sandbox, false);
      assert.equal(target.pathname, "/emails");
      const notice = JSON.parse(String(init?.body));
      assert.match(notice.text, /Project maintenance/);
      assert.match(notice.text, /#monthly-live=/);
      noticeRequests++;
      return Response.json({ id: "mock-notice" });
    }
    assert.equal(target.origin, sandbox ? "https://sandbox-merchant.revolut.com" : "https://merchant.revolut.com");
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("Revolut-Api-Version"), "2026-08-17");
    assert.equal(headers.get("Authorization"), sandbox ? "Bearer r_test_mock_key" : "Bearer r_prod_mock_key");
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    switch (target.pathname) {
      case "/api/subscription-plans":
        plans++;
        assert.deepEqual(body.variations, [{
          phases: [{ ordinal: 1, cycle_duration: "P1M", amount: 1753, currency: "EUR" }],
        }]);
        return Response.json({
          name: body.name, state: "active",
          variations: [{ id: variationId, phases: body.variations[0].phases }],
        }, { status: 201 });
      case "/api/customers":
        customers++;
        assert.deepEqual(body, { email: customers === 1 ? "buyer@example.com" : "other@example.com" });
        return Response.json({ id: randomUUID(), email: body.email }, { status: 201 });
      case "/api/subscriptions": {
        subscriptions++;
        assert.equal(headers.get("Idempotency-Key"), body.external_reference.slice("BI-RECURRING/".length));
        assert.equal(body.plan_variation_id, variationId);
        const item = {
          id: randomUUID(), orderId: randomUUID(), token: randomUUID(),
          customerId: body.customer_id, reference: body.external_reference,
        };
        byId.set(item.id, item);
        byOrder.set(item.orderId, item);
        return Response.json({
          id: item.id, state: "pending", customer_id: item.customerId,
          external_reference: item.reference, plan_variation_id: variationId, payment_method_type: "automatic",
          ...(revealOrder ? { setup_order_id: item.orderId } : {}),
        }, { status: 201 });
      }
      default: {
        const [, , resource, id, action] = target.pathname.split("/");
        if (resource === "subscriptions") {
          const item = byId.get(id)!;
          if (action === "cancel") {
            cancels++;
            subscriptionState = "cancelled";
            return new Response(null, { status: 204 });
          }
          return Response.json({
            id: item.id, state: subscriptionState, customer_id: item.customerId, external_reference: item.reference,
            plan_variation_id: variationId, payment_method_type: "automatic",
            payment_method_id: subscriptionState === "active" ? randomUUID() : null,
            ...(revealOrder ? { setup_order_id: item.orderId } : {}),
          });
        }
        assert.equal(resource, "orders");
        if (!orderReady) return new Response(null, { status: 404 });
        const item = byOrder.get(id)!;
        return Response.json({
          id, token: item.token, type: "payment", state: orderState, amount: 1753, currency: "EUR",
          outstanding_amount: orderState === "completed" ? 0 : 1753, customer: { id: item.customerId },
          checkout_url: `${checkoutOrigin}/payment-link/${item.token}`,
        });
      }
    }
  });

  const availability = await config();
  assert.equal(availability.headers.get("Cache-Control"), "private, no-store");
  assert.deepEqual(await availability.json(), { enabled: true, sandbox });
  assert.equal((await post("checkout", { ...first, consent: false })).status, 400);
  assert.equal((await post("checkout", { ...first, amount: "1000.01" })).status, 400);
  assert.deepEqual([plans, customers, subscriptions], [0, 0, 0]);

  const initial = await post("checkout", first);
  assert.equal(initial.status, 409);
  const { statusToken } = await initial.json();
  assert.match(statusToken, /^[0-9a-f-]{36}\.[A-Za-z0-9_-]{43}$/);
  const oppositeEnvironment = sandbox ? "production" : "sandbox";
  const oppositeSignature = createHmac("sha256", SECRET).update(`bi-recurring-${oppositeEnvironment}:v1:${first.attemptId}`).digest("base64url");
  assert.equal((await post("status", { token: `${first.attemptId}.${oppositeSignature}` })).status, 404);
  const persisted = database.prepare(`
    SELECT amount_minor, email_hash, created_at, consent_version, email_ciphertext
    FROM recurring_${environment}_attempts WHERE attempt_id = ?
  `).get(first.attemptId) as { amount_minor: number; email_hash: string; created_at: number; consent_version: string; email_ciphertext: string | null };
  assert.equal(persisted.amount_minor, 1753);
  assert.equal(persisted.consent_version, sandbox ? "monthly-until-cancelled-v1" : "rolling-monthly-v2");
  if (sandbox) assert.equal(persisted.email_ciphertext, null);
  else {
    assert.ok(persisted.email_ciphertext);
    assert.doesNotMatch(persisted.email_ciphertext, /buyer@example.com/);
  }
  assert.match(persisted.email_hash, /^[0-9a-f]{64}$/);
  assert.ok(persisted.created_at > 0);
  revealOrder = true;
  const waitingOrder = await post("checkout", first);
  assert.equal(waitingOrder.status, 409);
  assert.deepEqual(await waitingOrder.json(), { code: "conflict", statusToken });
  orderReady = true;
  const recovered = await (await post("checkout", first)).json();
  assert.equal(recovered.statusToken, statusToken);
  assert.equal(recovered.amountMinor, 1753);
  assert.equal(recovered.checkoutUrl, `${checkoutOrigin}/payment-link/${recovered.token}`);
  assert.equal(recovered.sandbox, sandbox);
  assert.equal(noticeRequests, sandbox ? 0 : 1);
  assert.equal((await post("checkout", { ...first, amount: "17.54" })).status, 409);
  assert.equal((await post("checkout", { ...first, email: "other@example.com" })).status, 409);
  const second = await post("checkout", { ...first, email: "other@example.com", attemptId: randomUUID() });
  assert.equal(second.status, 200);
  assert.deepEqual([plans, customers, subscriptions], [1, 2, 2]);

  assert.equal((await post("cancel", { token: `${randomUUID()}.${statusToken.split(".")[1]}` })).status, 404);
  assert.deepEqual(await (await post("status", { token: statusToken })).json(), { status: "pending", amountMinor: 1753, ...(!sandbox ? { service: "Project maintenance" } : {}) });
  subscriptionState = "active";
  assert.equal((await post("status", { token: statusToken })).status, 502);
  orderState = "completed";
  assert.deepEqual(await (await post("status", { token: statusToken })).json(), { status: "active", amountMinor: 1753, ...(!sandbox ? { service: "Project maintenance" } : {}) });
  const cancelled = { status: "cancelled", amountMinor: 1753, ...(!sandbox ? { service: "Project maintenance" } : {}) };
  assert.deepEqual(await (await post("cancel", { token: statusToken })).json(), cancelled);
  assert.deepEqual(await (await post("cancel", { token: statusToken })).json(), cancelled);
  assert.equal(cancels, 1);
}

test("recurring sandbox resumes setup, reuses the monthly price and verifies cancellation",
  (t) => verifyRecurringLifecycle(t, "sandbox"));
test("recurring production resumes setup, reuses the monthly price and verifies cancellation",
  (t) => verifyRecurringLifecycle(t, "production"));
