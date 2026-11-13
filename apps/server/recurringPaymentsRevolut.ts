import { z } from "zod";

const REVOLUT_HOSTS = {
  sandbox: { api: "https://sandbox-merchant.revolut.com", checkout: "https://sandbox-checkout.revolut.com" },
  production: { api: "https://merchant.revolut.com", checkout: "https://checkout.revolut.com" },
};
const API_VERSION = "2026-08-17";
export type RecurringEnvironment = keyof typeof REVOLUT_HOSTS;
export type RecurringRevolutConfig = { environment: RecurringEnvironment; apiKey: string };

const subscriptionSchema = z.object({
  id: z.guid(),
  external_reference: z.string(),
  state: z.enum(["pending", "active", "overdue", "paused", "cancelled", "finished"]),
  customer_id: z.guid(),
  plan_variation_id: z.guid(),
  payment_method_type: z.enum(["automatic", "manual"]),
  payment_method_id: z.guid().nullish(),
  setup_order_id: z.guid().nullish(),
});

const setupOrderSchema = z.object({
  id: z.guid(),
  type: z.literal("payment"),
  state: z.enum(["pending", "processing", "authorised", "completed", "cancelled", "failed"]),
  token: z.guid().nullish(),
  checkout_url: z.string().nullish(),
  amount: z.number().int(),
  currency: z.literal("EUR"),
  outstanding_amount: z.number().int().nonnegative().nullish(),
  refunded_amount: z.number().int().nonnegative().nullish(),
  customer: z.object({ id: z.guid() }).nullish(),
});

type RecurringProviderAttempt = {
  attemptId: string;
  amountMinor: number;
  variationId: string;
  customerId: string;
};

class RevolutApiError extends Error {
  constructor(readonly status: number) {
    super(`Revolut Merchant API returned HTTP ${status}.`);
  }
}

export function recurringCreateRejected(error: unknown) {
  return error instanceof RevolutApiError && [400, 401, 403, 404, 422, 429].includes(error.status);
}

async function revolut(config: RecurringRevolutConfig, path: string, post?: { body?: object; idempotencyKey?: string }) {
  const response = await fetch(`${REVOLUT_HOSTS[config.environment].api}${path}`, {
    method: post ? "POST" : "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      "Revolut-Api-Version": API_VERSION,
      ...(post?.body ? { "Content-Type": "application/json" } : {}),
      ...(post?.idempotencyKey ? { "Idempotency-Key": post.idempotencyKey } : {}),
    },
    body: post?.body ? JSON.stringify(post.body) : undefined,
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new RevolutApiError(response.status);
  if (response.status === 204) return null;
  return response.json() as Promise<unknown>;
}

function monthlyPlanName(amountMinor: number) {
  return `BI Solutions monthly project payment EUR ${(amountMinor / 100).toFixed(2)}`;
}

function monthlyVariationId(result: unknown, amountMinor: number) {
  const monthlyPhase = z.object({
    ordinal: z.literal(1),
    cycle_duration: z.literal("P1M"),
    amount: z.literal(amountMinor),
    currency: z.literal("EUR"),
    cycle_count: z.null().optional(),
    subscription_items: z.array(z.never()).nullish(),
  });
  const plan = z.object({
    name: z.literal(monthlyPlanName(amountMinor)),
    state: z.literal("active"),
    trial_duration: z.literal("P0D").nullish(),
    variations: z.tuple([z.object({ id: z.guid(), phases: z.tuple([monthlyPhase]) })]),
  }).parse(result);
  return plan.variations[0].id;
}

export async function createMonthlyVariation(config: RecurringRevolutConfig, amountMinor: number) {
  const phase = { ordinal: 1, cycle_duration: "P1M", amount: amountMinor, currency: "EUR" };
  const result = await revolut(config, "/api/subscription-plans", {
    body: { name: monthlyPlanName(amountMinor), variations: [{ phases: [phase] }] },
  });
  return monthlyVariationId(result, amountMinor);
}

export async function findMonthlyVariation(config: RecurringRevolutConfig, amountMinor: number) {
  const name = monthlyPlanName(amountMinor);
  const listSchema = z.object({
    subscription_plans: z.array(z.object({ name: z.string() }).passthrough()),
    next_page_token: z.string().nullish(),
  });
  const params = new URLSearchParams({ limit: "50" });
  let match: string | null = null;
  for (let page = 0; page < 4; page++) {
    const list = listSchema.parse(await revolut(config, `/api/subscription-plans?${params}`));
    for (const candidate of list.subscription_plans) {
      if (candidate.name !== name) continue;
      if (match) throw new Error("Multiple Revolut plans matched this monthly price.");
      match = monthlyVariationId(candidate, amountMinor);
    }
    if (!list.next_page_token) return match;
    params.set("page_token", list.next_page_token);
  }
  throw new Error("Could not verify a unique monthly price in Revolut.");
}
export async function createRecurringCustomer(config: RecurringRevolutConfig, email: string) {
  const result = await revolut(config, "/api/customers", { body: { email } });
  const customer = z.object({ id: z.guid(), email: z.email() }).parse(result);
  if (customer.email.toLowerCase() !== email) throw new Error("Revolut returned a different customer.");
  return customer.id;
}

function parseSubscription(data: unknown, attempt: RecurringProviderAttempt) {
  const subscription = subscriptionSchema.parse(data);
  if (subscription.external_reference !== `BI-RECURRING/${attempt.attemptId}` ||
      subscription.customer_id !== attempt.customerId || subscription.plan_variation_id !== attempt.variationId) {
    throw new Error("Revolut returned a different subscription.");
  }
  return subscription;
}

export async function createRecurringSubscription(config: RecurringRevolutConfig, attempt: RecurringProviderAttempt) {
  const result = await revolut(config, "/api/subscriptions", {
    idempotencyKey: attempt.attemptId,
    body: {
      customer_id: attempt.customerId,
      plan_variation_id: attempt.variationId,
      external_reference: `BI-RECURRING/${attempt.attemptId}`,
    },
  });
  return parseSubscription(result, attempt);
}

export async function retrieveRecurringSubscription(
  config: RecurringRevolutConfig, attempt: RecurringProviderAttempt & { subscriptionId: string },
) {
  const result = await revolut(config, `/api/subscriptions/${attempt.subscriptionId}`);
  const subscription = parseSubscription(result, attempt);
  if (subscription.id !== attempt.subscriptionId) throw new Error("Revolut returned a different subscription ID.");
  return subscription;
}

export async function retrieveRecurringSetupOrder(config: RecurringRevolutConfig, attempt: RecurringProviderAttempt, orderId: string) {
  let result;
  try {
    result = await revolut(config, `/api/orders/${orderId}`);
  } catch (error) {
    if (error instanceof RevolutApiError && error.status === 404) return null;
    throw error;
  }
  const order = setupOrderSchema.parse(result);
  if (order.id !== orderId || order.amount !== attempt.amountMinor ||
      (order.customer && order.customer.id !== attempt.customerId)) {
    throw new Error("Revolut returned a different subscription setup order.");
  }
  return order;
}

export function recurringCheckoutUrl(order: z.infer<typeof setupOrderSchema>, environment: RecurringEnvironment) {
  if (!order.checkout_url || !order.token) return undefined;
  try {
    const url = new URL(order.checkout_url);
    if (url.origin === REVOLUT_HOSTS[environment].checkout && !url.username && !url.password &&
        url.pathname === `/payment-link/${order.token}`) return url.href;
  } catch {
    // The SDK token remains available even if Revolut omits a valid hosted fallback.
  }
  return undefined;
}

export async function cancelRecurringSubscription(config: RecurringRevolutConfig, subscriptionId: string) {
  await revolut(config, `/api/subscriptions/${subscriptionId}/cancel`, {});
}
