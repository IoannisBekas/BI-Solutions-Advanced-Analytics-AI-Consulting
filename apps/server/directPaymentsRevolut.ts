import { z } from "zod";

export type DirectPaymentEnvironment = "sandbox" | "production";
export type DirectPaymentProviderConfig = { environment: DirectPaymentEnvironment; apiKey: string };

export const DIRECT_ORDER_LIFETIME_MS = 30 * 60 * 1000;
const PURPOSE = "bi-solutions-direct-project-payment";
const API_HOST = {
  sandbox: "https://sandbox-merchant.revolut.com",
  production: "https://merchant.revolut.com",
};
const CHECKOUT_ORIGIN = {
  sandbox: "https://sandbox-checkout.revolut.com",
  production: "https://checkout.revolut.com",
};
const orderSchema = z.object({
  id: z.guid(),
  token: z.guid().optional(),
  type: z.literal("payment"),
  state: z.enum(["pending", "processing", "authorised", "completed", "cancelled", "failed"]),
  amount: z.number().int().positive(),
  currency: z.literal("EUR"),
  outstanding_amount: z.number().int().nonnegative().optional(),
  refunded_amount: z.number().int().nonnegative().optional(),
  merchant_order_data: z.object({ reference: z.string() }),
  metadata: z.object({ purpose: z.literal(PURPOSE) }),
  checkout_url: z.string().optional(),
});

export type DirectPaymentOrder = z.infer<typeof orderSchema>;

function reference(attemptId: string) {
  return `BI-DIRECT/${attemptId}`;
}

async function requestOrder(
  config: DirectPaymentProviderConfig,
  attemptId: string,
  amountMinor: number,
  orderId?: string,
) {
  const path = orderId ? `/api/orders/${encodeURIComponent(orderId)}` : "/api/orders";
  const response = await fetch(`${API_HOST[config.environment]}${path}`, {
    method: orderId ? "GET" : "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      "Revolut-Api-Version": "2026-08-17",
      ...(!orderId && { "Content-Type": "application/json" }),
    },
    body: orderId ? undefined : JSON.stringify({
      amount: amountMinor,
      currency: "EUR",
      capture_mode: "automatic",
      expire_pending_after: `PT${DIRECT_ORDER_LIFETIME_MS / 60_000}M`,
      description: "BI Solutions Group project payment",
      merchant_order_data: { reference: reference(attemptId) },
      metadata: { purpose: PURPOSE },
      line_items: [{
        name: "Project payment",
        type: "service",
        quantity: { value: 1 },
        unit_price_amount: amountMinor,
        total_amount: amountMinor,
      }],
    }),
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`Revolut Merchant API returned HTTP ${response.status}.`);
  }
  const order = orderSchema.safeParse(await response.json());
  if (!order.success || order.data.amount !== amountMinor ||
      order.data.merchant_order_data.reference !== reference(attemptId) ||
      (orderId && order.data.id !== orderId)) {
    throw new Error("Revolut returned a different direct payment order.");
  }
  return order.data;
}

export function createDirectPaymentOrder(config: DirectPaymentProviderConfig, attemptId: string, amountMinor: number) {
  return requestOrder(config, attemptId, amountMinor);
}

export function retrieveDirectPaymentOrder(
  config: DirectPaymentProviderConfig, attemptId: string, amountMinor: number, orderId: string,
) {
  return requestOrder(config, attemptId, amountMinor, orderId);
}

export function directPaymentStatus(order: DirectPaymentOrder, createdAt: number) {
  if (order.refunded_amount) return "closed";
  switch (order.state) {
    case "pending":
      return Date.now() - createdAt < DIRECT_ORDER_LIFETIME_MS &&
        (order.outstanding_amount ?? order.amount) === order.amount ? "payable" : "closed";
    case "processing":
    case "authorised":
      return "processing";
    case "completed":
      return (order.outstanding_amount ?? 0) === 0 ? "paid" : "closed";
    default:
      return "closed";
  }
}

export function directPaymentCheckoutUrl(order: DirectPaymentOrder, environment: DirectPaymentEnvironment) {
  if (!order.checkout_url) return undefined;
  try {
    const url = new URL(order.checkout_url);
    if (url.origin === CHECKOUT_ORIGIN[environment] && !url.username && !url.password &&
        url.pathname === `/payment-link/${order.token}`) return url.href;
  } catch {
    // A missing or malformed fallback URL does not invalidate the embedded checkout.
  }
  return undefined;
}
