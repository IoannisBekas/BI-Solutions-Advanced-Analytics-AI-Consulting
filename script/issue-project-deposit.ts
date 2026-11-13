import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import {
  createProjectDepositToken,
  projectDepositAmountMinor,
  projectDepositLocale,
  projectDepositReference,
} from "../apps/server/projectDepositToken";
import {
  createProjectDepositOrder,
  findProjectDepositOrder,
  getProjectDepositRevolutConfig,
} from "../apps/server/projectDepositRevolut";

const usage = "npm run project-deposit:issue -- --reference BI-2026-042 --amount 250.00 [--days 7] [--locale el]";

function parseAmount(amount: string) {
  const match = /^(\d{1,6})(?:[.,](\d{1,2}))?$/.exec(amount);
  if (!match) throw new Error("Enter an exact EUR amount such as 250.00 or 250,00, without separators for thousands.");
  const parsed = projectDepositAmountMinor.safeParse(Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0")));
  if (!parsed.success) throw new Error("Enter a positive EUR amount.");
  return parsed.data;
}

async function issueDeposit() {
  const { values } = parseArgs({
    options: {
      reference: { type: "string" },
      amount: { type: "string" },
      days: { type: "string", default: "7" },
      locale: { type: "string", default: "el" },
      help: { type: "boolean" },
    },
  });
  if (values.help) {
    console.log(usage);
    return;
  }

  // References are canonicalized so case differences cannot issue two orders for one quote.
  const reference = projectDepositReference.safeParse(values.reference?.toUpperCase());
  if (!reference.success || !values.amount) throw new Error(`A quote reference and amount are required.\n${usage}`);
  const amountMinor = parseAmount(values.amount);
  const locale = projectDepositLocale.safeParse(values.locale);
  if (!locale.success) throw new Error("Choose el, en or de for the link language.");
  const days = Number(values.days);
  if (!/^\d{1,2}$/.test(values.days) || days < 1 || days > 30) throw new Error("Choose a link expiry of 1 to 30 days.");

  const secret = process.env.PROJECT_DEPOSIT_TOKEN_SECRET?.trim() ?? "";
  if (secret.length < 32) throw new Error("Set PROJECT_DEPOSIT_TOKEN_SECRET to a random value of at least 32 characters.");
  const config = getProjectDepositRevolutConfig();
  config.apiKey = process.env.PROJECT_DEPOSIT_REVOLUT_ISSUER_KEY?.trim() || config.apiKey;
  if (!config.apiKey) throw new Error("Set an Orders Write key in PROJECT_DEPOSIT_REVOLUT_ISSUER_KEY.");

  const origin = new URL(process.env.PROJECT_DEPOSIT_ORIGIN?.trim() || process.env.APP_URL?.trim() || "https://www.bisolutions.group");
  const localSandbox = config.environment === "sandbox" && origin.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
  if ((!localSandbox && origin.protocol !== "https:") || origin.username || origin.password ||
    origin.pathname !== "/" || origin.search || origin.hash) {
    throw new Error("PROJECT_DEPOSIT_ORIGIN must be an HTTPS origin, or a loopback HTTP origin for Sandbox.");
  }
  const link = new URL(locale.data === "en" ? "/pay-deposit" : `/${locale.data}/pay-deposit`, origin);
  const quote = {
    reference: reference.data,
    amountMinor,
    expiresAt: Math.floor(Date.now() / 1000) + days * 86_400,
  };

  let order = await findProjectDepositOrder(config, quote);
  if (!order) {
    const dataDir = process.env.DATA_DIR?.trim() || "data";
    const attemptsDir = path.join(dataDir, "project-deposit-issuance", config.environment);
    mkdirSync(attemptsDir, { recursive: true });
    const attemptFile = path.join(attemptsDir, `quote-${quote.reference}.json`);
    try {
      writeFileSync(attemptFile, JSON.stringify(quote), { flag: "wx" });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      throw new Error("This quote already has an issuance attempt. Check the Merchant dashboard before taking further action.");
    }

    try {
      order = await createProjectDepositOrder(config, quote);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`${reason}\nThe issuance attempt was recorded. Run the same command to look up the order before making any new attempt.`);
    }
  }

  if (order.state !== "pending" || !order.checkoutUrl || order.expiresAt <= Math.floor(Date.now() / 1000)) {
    throw new Error(`Revolut order ${order.id} is ${order.state} or expired. Review it in the Merchant dashboard.`);
  }
  link.hash = createProjectDepositToken({
    ...quote,
    expiresAt: order.expiresAt,
    orderId: order.id,
    locale: locale.data,
    environment: config.environment,
  }, secret);
  console.log(link.href);
}

issueDeposit().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Could not issue the payment link.");
  process.exitCode = 1;
});
