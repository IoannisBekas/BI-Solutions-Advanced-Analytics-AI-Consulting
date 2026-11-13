import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { test } from "node:test";
import express from "express";
import { createProjectDepositOrder, findProjectDepositOrder } from "../projectDepositRevolut";
import { createProjectDepositToken, type ProjectDepositQuote } from "../projectDepositToken";
import { registerProjectDepositRoutes } from "./projectDeposits";

const secret = "testing-a-long-secret-for-project-deposits";
const checkoutUrl = "https://sandbox-checkout.revolut.com/payment-link/mock-order";
const quote: ProjectDepositQuote = {
  reference: "BI-042",
  amountMinor: 25000,
  environment: "sandbox",
  locale: "el",
  orderId: "6516e61c-d279-a454-a837-bc52ce55ed49",
  expiresAt: Math.floor(Date.now() / 1000) + 86_400,
};
const providerOrder = {
  id: quote.orderId,
  type: "payment",
  state: "pending",
  amount: quote.amountMinor,
  currency: "EUR",
  outstanding_amount: quote.amountMinor,
  merchant_order_data: { reference: "BI-DEPOSIT/BI-042" },
  metadata: { purpose: "bi-solutions-project-deposit", quote_expires_at: String(quote.expiresAt) },
  checkout_url: checkoutUrl,
};

test("deposit page uses one signed, amount-matched Revolut order", async (t) => {
  const settings = {
    PROJECT_DEPOSIT_TOKEN_SECRET: secret,
    PROJECT_DEPOSIT_REVOLUT_ENV: "sandbox",
    PROJECT_DEPOSIT_REVOLUT_API_KEY: "test-read-key",
  };
  for (const [name, value] of Object.entries(settings)) {
    const previous = process.env[name];
    process.env[name] = value;
    t.after(() => {
      if (previous === undefined) delete process.env[name];
      else process.env[name] = previous;
    });
  }
  const app = express();
  app.use(express.json());
  registerProjectDepositRoutes(app);
  const server = createServer(app).listen(0, "127.0.0.1");
  t.after(() => server.close());
  await once(server, "listening");
  const endpoint = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/project-deposits/status`;
  const localFetch = globalThis.fetch;
  let ordersRead = 0;
  let responseOrder = { ...providerOrder };
  t.mock.method(globalThis, "fetch", async (url: string, init?: RequestInit) => {
    assert.equal(url, `https://sandbox-merchant.revolut.com/api/orders/${quote.orderId}`);
    assert.equal(init?.method, "GET");
    assert.equal(new Headers(init.headers).get("Revolut-Api-Version"), "2026-08-17");
    ordersRead += 1;
    return Response.json(responseOrder);
  });
  const request = (token: string) => localFetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, amountMinor: 1 }),
  });
  const token = createProjectDepositToken(quote, secret);
  const tampered = createProjectDepositToken({ ...quote, amountMinor: 1 }, secret).split(".")[0] +
    "." + token.split(".")[1];
  assert.equal((await request(tampered)).status, 404);
  assert.equal((await request(createProjectDepositToken({ ...quote, expiresAt: 1 }, secret))).status, 410);
  assert.equal((await request(createProjectDepositToken({ ...quote, environment: "production" }, secret))).status, 404);
  assert.equal(ordersRead, 0);

  const payable = await request(token);
  assert.equal(payable.status, 200);
  assert.equal(payable.headers.get("Cache-Control"), "no-store");
  const details = { reference: quote.reference, amountMinor: quote.amountMinor, currency: "EUR", sandbox: true };
  assert.deepEqual(await payable.json(), { ...details, status: "payable", checkoutUrl });

  responseOrder = { ...providerOrder, state: "completed", outstanding_amount: 0, checkout_url: "" };
  assert.deepEqual(await (await request(token)).json(), { ...details, status: "paid" });

  responseOrder = { ...providerOrder, outstanding_amount: 10 };
  assert.deepEqual(await (await request(token)).json(), { ...details, status: "closed" });

  responseOrder = { ...providerOrder, checkout_url: "https://checkout.revolut.com/payment-link/wrong-environment" };
  assert.equal((await request(token)).status, 502);

  responseOrder = { ...providerOrder, amount: 1 };
  assert.equal((await request(token)).status, 502);
  assert.equal(ordersRead, 5);
});

test("issuance sends the agreed cents and reconciliation recovers the original order", async (t) => {
  const config = { environment: "sandbox", apiKey: "test-issuer-key" } as const;
  const requests: string[] = [];
  t.mock.method(globalThis, "fetch", async (url: string, init?: RequestInit) => {
    const target = new URL(url);
    assert.equal(target.origin, "https://sandbox-merchant.revolut.com");
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer test-issuer-key");
    requests.push(`${init?.method} ${target.pathname}`);
    if (init?.method === "POST") {
      const order = JSON.parse(String(init.body));
      assert.equal(order.amount, 25000);
      assert.equal(order.currency, "EUR");
      assert.equal(order.capture_mode, "automatic");
      assert.match(order.expire_pending_after, /^PT\d+M$/);
      assert.deepEqual(order.merchant_order_data, providerOrder.merchant_order_data);
      assert.deepEqual(order.metadata, providerOrder.metadata);
      assert.deepEqual(order.line_items, [{
        name: "Project deposit",
        type: "service",
        quantity: { value: 1 },
        unit_price_amount: 25000,
        total_amount: 25000,
      }]);
    }
    if (target.search) {
      assert.equal(target.searchParams.get("merchant_order_data_reference"), "BI-DEPOSIT/BI-042");
      return Response.json({ orders: [{ id: quote.orderId }] });
    }
    return Response.json(providerOrder);
  });

  const created = await createProjectDepositOrder(config, quote);
  const recovered = await findProjectDepositOrder(config, quote);
  assert.deepEqual(created, { id: quote.orderId, state: "pending", checkoutUrl, expiresAt: quote.expiresAt });
  assert.deepEqual(recovered, created);
  assert.deepEqual(requests, ["POST /api/orders", "GET /api/orders", `GET /api/orders/${quote.orderId}`]);
});

test("monthly subscriptions expose only signed terms and a Revolut signup URL", async (t) => {
  const settings = {
    PROJECT_DEPOSIT_TOKEN_SECRET: secret,
    PROJECT_DEPOSIT_REVOLUT_ENV: "production",
  };
  for (const [name, value] of Object.entries(settings)) {
    const previous = process.env[name];
    process.env[name] = value;
    t.after(() => {
      if (previous === undefined) delete process.env[name];
      else process.env[name] = previous;
    });
  }
  const app = express();
  app.use(express.json());
  registerProjectDepositRoutes(app);
  const server = createServer(app).listen(0, "127.0.0.1");
  t.after(() => server.close());
  await once(server, "listening");
  const endpoint = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/project-deposits/status`;
  const localFetch = globalThis.fetch;
  const providerFetch = t.mock.method(globalThis, "fetch", async () => {
    assert.fail("Opening a monthly subscription link must not call Revolut's API");
  });
  const monthly = {
    billing: "monthly",
    environment: "production",
    reference: "BI-MONTHLY-042",
    amountMinor: 17500,
    expiresAt: quote.expiresAt,
    locale: "el",
    service: "Monthly reporting support",
    cycles: 6,
    checkoutUrl: "https://checkout.revolut.com/subscription/6516e61c-d279-a454-a837-bc52ce55ed49",
  } as const;
  const sign = (details: ProjectDepositQuote) => createProjectDepositToken(details, secret);
  const request = (token: string) => localFetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, amountMinor: 1, cycles: 2, checkoutUrl: "https://example.com/checkout" }),
  });
  const token = sign(monthly);
  const payable = await request(token);
  assert.equal(payable.status, 200);
  assert.equal(payable.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(await payable.json(), {
    reference: monthly.reference,
    amountMinor: monthly.amountMinor,
    currency: "EUR",
    sandbox: false,
    billing: monthly.billing,
    service: monthly.service,
    cycles: monthly.cycles,
    status: "payable",
    checkoutUrl: monthly.checkoutUrl,
  });

  const [changedPayload] = sign({ ...monthly, cycles: 2 }).split(".");
  assert.equal((await request(`${changedPayload}.${token.split(".")[1]}`)).status, 404);
  assert.equal((await request(sign({ ...monthly, expiresAt: 1 }))).status, 410);
  process.env.PROJECT_DEPOSIT_REVOLUT_ENV = "sandbox";
  assert.equal((await request(token)).status, 404);
  for (const checkoutUrl of [
    monthly.checkoutUrl.replace("checkout.revolut.com", "checkout.revolut.com.example.com"),
    monthly.checkoutUrl.replace("/subscription/", "/payment-link/"),
    `${monthly.checkoutUrl}?next=https://example.com/`,
  ]) {
    assert.throws(() => sign({ ...monthly, checkoutUrl }));
  }
  assert.equal(providerFetch.mock.callCount(), 0);
});
