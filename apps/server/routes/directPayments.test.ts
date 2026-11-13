import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { test, type TestContext } from "node:test";
import Database from "better-sqlite3";
import express from "express";
import { registerDirectPaymentRoutes } from "./directPayments";

const orderId = "6516e61c-d279-a454-a837-bc52ce55ed49";
const orderToken = "0adc0e3c-ab44-4f33-bcc0-534ded7354ce";
const checkoutUrl = `https://sandbox-checkout.revolut.com/payment-link/${orderToken}`;
const options = {
  DIRECT_PAYMENTS_ENABLED: "true",
  DIRECT_PAYMENTS_REVOLUT_ENV: "sandbox",
  DIRECT_PAYMENTS_REVOLUT_API_KEY: "test-write-key",
  DIRECT_PAYMENTS_REVOLUT_PUBLIC_KEY: "pk_test",
  DIRECT_PAYMENTS_TOKEN_SECRET: "test-secret-with-at-least-32-characters",
};

async function api(t: TestContext, enabled = true) {
  for (const [key, value] of Object.entries({ ...options, DIRECT_PAYMENTS_ENABLED: String(enabled) })) {
    const previous = process.env[key];
    process.env[key] = value;
    t.after(() => {
      if (previous === undefined) delete process.env[key];
      else process.env[key] = previous;
    });
  }
  const app = express();
  const database = new Database(":memory:");
  t.after(() => database.close());
  app.use(express.json());
  registerDirectPaymentRoutes(app, database);
  const server = createServer(app).listen(0, "127.0.0.1");
  t.after(() => server.close());
  await once(server, "listening");
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/direct-payments`;
  const localFetch = globalThis.fetch;
  return {
    getConfig: () => localFetch(`${origin}/config`),
    post: (route: "checkout" | "status", data: object) => localFetch(`${origin}/${route}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    }),
  };
}

test("direct payments remain disabled until configured", async (t) => {
  const { getConfig, post } = await api(t, false);
  assert.deepEqual(await (await getConfig()).json(), { enabled: false });
  assert.equal((await post("checkout", { amount: "123.45", attemptId: randomUUID() })).status, 503);
});

test("direct payments use one Revolut order per attempt and verify signed status", async (t) => {
  const { getConfig, post } = await api(t);
  const attemptId = randomUUID();
  const checkout = { amount: "123,45", attemptId };
  const order = {
    id: orderId,
    token: orderToken,
    type: "payment",
    amount: 12345,
    currency: "EUR",
    state: "pending",
    outstanding_amount: 12345,
    merchant_order_data: { reference: `BI-DIRECT/${attemptId}` },
    metadata: { purpose: "bi-solutions-direct-project-payment" },
    checkout_url: checkoutUrl,
  };
  let creates = 0;
  let reads = 0;
  let releaseCreate!: () => void;
  let notifyCreate!: () => void;
  const canCreate = new Promise<void>((resolve) => { releaseCreate = resolve; });
  const sawCreate = new Promise<void>((resolve) => { notifyCreate = resolve; });
  t.mock.method(globalThis, "fetch", async (url: string, init?: RequestInit) => {
    const target = new URL(url);
    assert.equal(target.origin, "https://sandbox-merchant.revolut.com");
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("Authorization"), "Bearer test-write-key");
    assert.equal(headers.get("Revolut-Api-Version"), "2026-08-17");
    if (init?.method === "POST") {
      creates += 1;
      assert.equal(target.pathname, "/api/orders");
      const payload = JSON.parse(String(init.body));
      assert.equal(payload.amount, 12345);
      assert.equal(payload.currency, "EUR");
      assert.equal(payload.capture_mode, "automatic");
      assert.equal(payload.expire_pending_after, "PT30M");
      assert.deepEqual(payload.merchant_order_data, order.merchant_order_data);
      notifyCreate();
      await canCreate;
    } else {
      reads += 1;
      assert.equal(target.pathname, `/api/orders/${orderId}`);
    }
    return Response.json(order);
  });
  const config = await getConfig();
  assert.equal(config.headers.get("Cache-Control"), "private, no-store");
  assert.deepEqual(await config.json(), { enabled: true, sandbox: true, publicKey: "pk_test", environment: "sandbox" });
  for (const amount of ["0.99", "1000.01", "1.001"]) {
    assert.equal((await post("checkout", { ...checkout, amount })).status, 400);
  }
  assert.equal(creates, 0);

  const pending = post("checkout", checkout);
  await sawCreate;
  assert.equal((await post("checkout", checkout)).status, 409);
  releaseCreate();
  const response = await pending;
  assert.equal(response.status, 200);
  const details = await response.json();
  assert.equal(details.token, orderToken);
  assert.equal(details.amountMinor, 12345);
  assert.equal(details.checkoutUrl, checkoutUrl);
  assert.equal((await post("checkout", { ...checkout, amount: "124" })).status, 409);
  assert.deepEqual(await (await post("checkout", checkout)).json(), details);
  assert.equal(creates, 1);
  assert.equal(reads, 1);

  const forged = details.statusToken.replace(attemptId, randomUUID());
  assert.equal((await post("status", { token: forged })).status, 404);
  assert.equal(reads, 1);

  order.state = "completed";
  order.outstanding_amount = 0;
  const closed = await post("checkout", checkout);
  assert.equal(closed.status, 409);
  assert.deepEqual(await closed.json(), { code: "closed", statusToken: details.statusToken });
  assert.deepEqual(await (await post("status", { token: details.statusToken })).json(), { status: "paid", amountMinor: 12345 });
  order.currency = "GBP";
  assert.equal((await post("status", { token: details.statusToken })).status, 502);
});

test("an ambiguous provider failure cannot create another order for the same attempt", async (t) => {
  const { post } = await api(t);
  let creates = 0;
  t.mock.method(globalThis, "fetch", async () => {
    creates += 1;
    throw new Error("Request timed out after provider might have created the order");
  });
  const checkout = { amount: "1.00", attemptId: randomUUID() };
  assert.equal((await post("checkout", checkout)).status, 502);
  assert.equal((await post("checkout", checkout)).status, 409);
  assert.equal(creates, 1);
});
