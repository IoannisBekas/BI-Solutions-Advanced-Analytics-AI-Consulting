import { z } from "zod";

const API_VERSION = "2026-08-17";
const ORDER_PURPOSE = "bi-solutions-project-deposit";
const REVOLUT_HOSTS = {
  sandbox: {
    api: "https://sandbox-merchant.revolut.com",
    checkout: "sandbox-checkout.revolut.com",
  },
  production: {
    api: "https://merchant.revolut.com",
    checkout: "checkout.revolut.com",
  },
};

type RevolutConfig = {
  environment: keyof typeof REVOLUT_HOSTS;
  apiKey: string | null;
};
type Quote = { reference: string; amountMinor: number; expiresAt: number };

const orderSchema = z.object({
  id: z.guid(),
  type: z.literal("payment"),
  state: z.enum(["pending", "processing", "authorised", "completed", "cancelled", "failed"]),
  amount: z.number().int(),
  currency: z.literal("EUR"),
  outstanding_amount: z.number().int().nonnegative().optional(),
  refunded_amount: z.number().int().nonnegative().optional(),
  merchant_order_data: z.object({ reference: z.string() }),
  metadata: z.object({
    purpose: z.literal(ORDER_PURPOSE),
    quote_expires_at: z.string().regex(/^[1-9]\d{0,11}$/).transform(Number),
  }),
  checkout_url: z.string().optional(),
});

function providerReference(reference: string) {
  return `BI-DEPOSIT/${reference}`;
}

export function getProjectDepositRevolutConfig(): RevolutConfig {
  const environment = process.env.PROJECT_DEPOSIT_REVOLUT_ENV?.trim() || "sandbox";
  if (environment !== "sandbox" && environment !== "production") {
    throw new Error("PROJECT_DEPOSIT_REVOLUT_ENV must be sandbox or production.");
  }
  return { environment, apiKey: process.env.PROJECT_DEPOSIT_REVOLUT_API_KEY?.trim() || null };
}

async function requestRevolut(config: RevolutConfig, path: string, payload?: object): Promise<unknown> {
  if (!config.apiKey) {
    throw new Error("PROJECT_DEPOSIT_REVOLUT_API_KEY is required.");
  }
  const response = await fetch(`${REVOLUT_HOSTS[config.environment].api}${path}`, {
    method: payload ? "POST" : "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      "Revolut-Api-Version": API_VERSION,
      ...(payload ? { "Content-Type": "application/json" } : {}),
    },
    body: payload ? JSON.stringify(payload) : undefined,
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`Revolut Merchant API returned HTTP ${response.status}.`);
  }
  return response.json();
}

function validateOrder(config: RevolutConfig, data: unknown, quote: Omit<Quote, "expiresAt">) {
  const parsed = orderSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Revolut returned an invalid project deposit order.");
  }
  const order = parsed.data;
  if (order.amount !== quote.amountMinor || order.merchant_order_data.reference !== providerReference(quote.reference)) {
    throw new Error("Revolut order amount or reference does not match the quote.");
  }

  // A partial payment or refund needs to be reviewed in the Merchant dashboard.
  const closed = (order.refunded_amount ?? 0) > 0 ||
    (order.state === "completed" && (order.outstanding_amount ?? 0) !== 0) ||
    (order.state === "pending" && (order.outstanding_amount ?? order.amount) !== order.amount);
  let checkoutUrl: string | undefined;
  if (order.state === "pending" && !closed) {
    const url = order.checkout_url ? new URL(order.checkout_url) : null;
    if (!url || url.origin !== `https://${REVOLUT_HOSTS[config.environment].checkout}` ||
        url.username || url.password || !url.pathname.startsWith("/payment-link/")) {
      throw new Error("Revolut returned an invalid hosted checkout URL.");
    }
    checkoutUrl = url.href;
  }
  return {
    id: order.id,
    state: closed ? "closed" as const : order.state,
    checkoutUrl,
    expiresAt: order.metadata.quote_expires_at,
  };
}

export async function retrieveProjectDepositOrder(
  config: RevolutConfig,
  quote: Omit<Quote, "expiresAt"> & { orderId: string },
) {
  const order = validateOrder(config, await requestRevolut(config, `/api/orders/${encodeURIComponent(quote.orderId)}`), quote);
  if (order.id !== quote.orderId) {
    throw new Error("Revolut returned a different order ID.");
  }
  return order;
}

export async function findProjectDepositOrder(config: RevolutConfig, quote: Omit<Quote, "expiresAt">) {
  const params = new URLSearchParams({
    limit: "2",
    merchant_order_data_reference: providerReference(quote.reference),
  });
  const list = z.object({ orders: z.array(z.object({ id: z.guid() })) }).safeParse(
    await requestRevolut(config, `/api/orders?${params}`),
  );
  if (!list.success || list.data.orders.length > 1) {
    throw new Error("Revolut did not return a unique order for this quote reference.");
  }
  const [order] = list.data.orders;
  return order ? retrieveProjectDepositOrder(config, { ...quote, orderId: order.id }) : null;
}

export async function createProjectDepositOrder(config: RevolutConfig, quote: Quote) {
  const minutes = Math.floor((quote.expiresAt - Date.now() / 1000) / 60);
  if (minutes < 1 || minutes > 43_200) {
    throw new Error("A new deposit order must expire in one minute to 30 days.");
  }
  const data = await requestRevolut(config, "/api/orders", {
    amount: quote.amountMinor,
    currency: "EUR",
    capture_mode: "automatic",
    description: `BI Solutions Group project deposit — ${quote.reference}`,
    expire_pending_after: `PT${minutes}M`,
    merchant_order_data: { reference: providerReference(quote.reference) },
    metadata: { purpose: ORDER_PURPOSE, quote_expires_at: String(quote.expiresAt) },
    line_items: [{
      name: "Project deposit",
      type: "service",
      quantity: { value: 1 },
      unit_price_amount: quote.amountMinor,
      total_amount: quote.amountMinor,
    }],
  });
  const order = validateOrder(config, data, quote);
  if (order.expiresAt !== quote.expiresAt) {
    throw new Error("Revolut order expiry does not match the quote.");
  }
  return order;
}
