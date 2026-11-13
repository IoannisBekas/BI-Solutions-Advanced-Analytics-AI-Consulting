import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const projectDepositReference = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/);
export const projectDepositAmountMinor = z.number().int().positive().max(99_999_999);
export const projectDepositLocale = z.enum(["el", "en", "de"]);

const projectDepositQuote = z.object({
  reference: projectDepositReference,
  amountMinor: projectDepositAmountMinor,
  expiresAt: z.number().int().positive(),
  locale: projectDepositLocale,
  orderId: z.guid(),
  environment: z.enum(["sandbox", "production"]),
}).strict();

export type ProjectDepositQuote = z.infer<typeof projectDepositQuote>;

function signature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(`bi-project-deposit:v1:${payload}`).digest();
}

export function createProjectDepositToken(quote: ProjectDepositQuote, secret: string) {
  if (secret.length < 32) throw new Error("PROJECT_DEPOSIT_TOKEN_SECRET must be at least 32 characters.");
  const payload = Buffer.from(JSON.stringify(projectDepositQuote.parse(quote))).toString("base64url");
  return `${payload}.${signature(payload, secret).toString("base64url")}`;
}

export function readProjectDepositToken(token: string, secret: string): ProjectDepositQuote | null {
  if (secret.length < 32 || token.length > 1024 || !/^[\w-]+\.[\w-]{43}$/.test(token)) return null;

  const [payload, signed] = token.split(".");
  const expected = signature(payload, secret);
  const received = Buffer.from(signed, "base64url");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;

  try {
    const quote = projectDepositQuote.safeParse(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
    return quote.success ? quote.data : null;
  } catch {
    return null;
  }
}
