import { createHash } from "node:crypto";
import type Database from "better-sqlite3";
import { Resend } from "resend";
import { z } from "zod";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const POLL_INTERVAL = 5 * MINUTE;
const SEND_LEASE = MINUTE;
const RETRY_WINDOW = 23 * HOUR;
const MAX_SEND_ATTEMPTS = 8;
const BATCH_SIZE = 20;
const RECEIPT_LOOKBACK = 90 * DAY;
const TERMINAL_GRACE = DAY;
const RENEWAL_NOTICE_LEAD = 7 * DAY;
const POSTPONEMENT_BUFFER = HOUR;

export type RecurringNoticeAttempt = {
  attemptId: string;
  amountMinor: number;
  service: string;
  email: string;
  managementUrl: string;
  acceptedAt: number;
  locale?: "el" | "en" | "de";
  subscriptionId?: string | null;
  setupOrderId?: string | null;
  customerId?: string | null;
  variationId?: string | null;
};

type Options = {
  db: Database.Database;
  apiKey: string;
  emailApiKey: string;
  fromEmail: string;
  listAttempts: (now: number, limit: number) => Iterable<RecurringNoticeAttempt> | Promise<Iterable<RecurringNoticeAttempt>>;
};

type Email = { subject: string; text: string };
type NoticeKind = "acceptance" | "renewal" | "receipt";
type NoticeDetails = { date: number; renewalAt?: number; orderId?: string; firstPayment?: boolean };
type Delivery = {
  state: "pending" | "sent" | "failed";
  payload_hash: string | null;
  started_at: number;
  next_attempt_at: number;
  attempts: number;
  sent_at: number | null;
  notice_date: number;
  renewal_at: number | null;
  first_payment: number;
};

const guid = z.guid();
const dateSchema = z.iso.datetime({ offset: true }).transform(Date.parse);
const subscriptionSchema = z.object({
  id: guid,
  external_reference: z.string(),
  customer_id: guid,
  plan_variation_id: guid,
  state: z.enum(["pending", "active", "overdue", "paused", "cancelled", "finished"]),
  current_cycle_id: guid.nullish(),
  setup_order_id: guid.nullish(),
  payment_method_type: z.enum(["automatic", "manual"]),
  scheduled_action: z.object({ type: z.string().optional() }).passthrough().nullish(),
});
const cycleSchema = z.object({
  id: guid,
  subscription_id: guid,
  plan_variation_id: guid,
  state: z.enum(["pending", "active", "finished"]),
  start_date: dateSchema.nullish(),
  end_date: dateSchema.nullish(),
  order_id: guid.nullish(),
});
const orderSchema = z.object({
  id: guid,
  type: z.literal("payment"),
  state: z.enum(["pending", "processing", "authorised", "completed", "cancelled", "failed"]),
  amount: z.number().int().positive(),
  currency: z.literal("EUR"),
  updated_at: dateSchema.nullish(),
  outstanding_amount: z.number().int().nonnegative().nullish(),
  refunded_amount: z.number().int().nonnegative().nullish(),
  customer: z.object({ id: guid }).nullish(),
  payments: z.array(z.object({
    state: z.string(),
    updated_at: dateSchema.nullish(),
    amount: z.number().int().positive().nullish(),
    currency: z.string().nullish(),
  })).nullish(),
});

const localeTags = { el: "el-GR", en: "en-GB", de: "de-DE" };

function dateLabel(timestamp: number, locale: keyof typeof localeTags) {
  return new Intl.DateTimeFormat(localeTags[locale], {
    dateStyle: "long", timeStyle: "short", timeZone: "Europe/Athens",
  }).format(timestamp);
}

function noticeEmail(
  attempt: RecurringNoticeAttempt,
  kind: NoticeKind,
  details: NoticeDetails,
): Email {
  const locale = attempt.locale ?? "el";
  const amount = new Intl.NumberFormat(localeTags[locale], { style: "currency", currency: "EUR" }).format(attempt.amountMinor / 100);
  const date = dateLabel(details.date, locale);
  const renewal = details.renewalAt ? dateLabel(details.renewalAt, locale) : "";
  const service = attempt.service;
  const text: Record<typeof locale, Record<NoticeKind, [string, string[]]>> = {
    el: {
      acceptance: ["Οι όροι της μηνιαίας πληρωμής σου", [
        `Υπηρεσία: ${service}`,
        `Αποδέχθηκες στις ${date} αυτόματη χρέωση ${amount} κάθε μήνα μέχρι να ακυρώσεις.`,
        `Η πρώτη μηνιαία περίοδος ξεκινά με την ολοκληρωμένη πληρωμή των ${amount} μέσω Revolut και λήγει την ημερομηνία της επόμενης χρέωσης. Η συνδρομή ανανεώνεται αυτόματα κάθε μήνα για ${amount} και δεν έχει προκαθορισμένη λήξη.`,
        "Μπορείς να ακυρώσεις οποτεδήποτε από τον ιδιωτικό σύνδεσμο παρακάτω. Για να αποφύγεις την επόμενη χρέωση, ακύρωσε πριν από την προγραμματισμένη ημερομηνία και ώρα της.",
      ]],
      renewal: ["Υπενθύμιση μηνιαίας πληρωμής", [
        `Η επόμενη αυτόματη χρέωση για την υπηρεσία «${service}» είναι ${amount} στις ${date} (ώρα Ελλάδας).`,
        "Μπορείς να ακυρώσεις πριν από την προγραμματισμένη χρέωση από τον ιδιωτικό σύνδεσμο παρακάτω.",
      ]],
      receipt: ["Επιβεβαίωση μηνιαίας πληρωμής", [
        `Η πληρωμή ${amount} για την υπηρεσία «${service}» ολοκληρώθηκε στις ${date} (ώρα Ελλάδας).`,
        ...(details.firstPayment ? [`Η πρώτη μηνιαία περίοδος ξεκίνησε στις ${date}${renewal ? ` και λήγει στις ${renewal} (ώρα Ελλάδας)` : ""}. Η συνδρομή ανανεώνεται αυτόματα για ${amount} κάθε μήνα μέχρι την ακύρωση.`] : []),
        ...(renewal ? [`Η επόμενη χρέωση ${amount} έχει προγραμματιστεί για τις ${renewal} (ώρα Ελλάδας).`] : []),
        `Αναφορά πληρωμής Revolut: ${details.orderId}`,
      ]],
    },
    en: {
      acceptance: ["Your monthly payment terms", [
        `Service: ${service}`,
        `On ${date} you agreed to an automatic charge of ${amount} each month until you cancel.`,
        `Your first monthly term starts when you complete the first ${amount} payment through Revolut and ends at the next billing date. It renews automatically at ${amount} each month with no fixed end date.`,
        "You can cancel at any time using the private link below. Cancel before the scheduled date and time to avoid the next charge.",
      ]],
      renewal: ["Monthly payment reminder", [
        `Your next automatic payment for ${service} is ${amount} on ${date} (Athens time).`,
        "Use the private link below to cancel before the scheduled charge.",
      ]],
      receipt: ["Monthly payment confirmation", [
        `Your ${amount} payment for ${service} completed on ${date} (Athens time).`,
        ...(details.firstPayment ? [`Your first monthly term started on ${date}${renewal ? ` and ends on ${renewal} (Athens time)` : ""}. It renews automatically at ${amount} each month until you cancel.`] : []),
        ...(renewal ? [`The next ${amount} charge is scheduled for ${renewal} (Athens time).`] : []),
        `Revolut payment reference: ${details.orderId}`,
      ]],
    },
    de: {
      acceptance: ["Deine Bedingungen für monatliche Zahlungen", [
        `Leistung: ${service}`,
        `Am ${date} hast du einer automatischen Zahlung von ${amount} pro Monat bis zur Kündigung zugestimmt.`,
        `Dein erster Monatszeitraum beginnt mit der abgeschlossenen Zahlung von ${amount} über Revolut und endet am nächsten Abrechnungsdatum. Das Abonnement verlängert sich ohne festes Enddatum automatisch für ${amount} pro Monat.`,
        "Über den privaten Link unten kannst du jederzeit kündigen. Kündige vor dem geplanten Zeitpunkt, um die nächste Abbuchung zu vermeiden.",
      ]],
      renewal: ["Erinnerung an deine monatliche Zahlung", [
        `Die nächste automatische Zahlung für ${service} beträgt ${amount} und ist für den ${date} geplant (Ortszeit Athen).`,
        "Über den privaten Link unten kannst du vor der nächsten Abbuchung kündigen.",
      ]],
      receipt: ["Bestätigung deiner monatlichen Zahlung", [
        `Deine Zahlung von ${amount} für ${service} wurde am ${date} abgeschlossen (Ortszeit Athen).`,
        ...(details.firstPayment ? [`Dein erster Monatszeitraum begann am ${date}${renewal ? ` und endet am ${renewal} (Ortszeit Athen)` : ""}. Bis zur Kündigung verlängert sich das Abonnement automatisch für ${amount} pro Monat.`] : []),
        ...(renewal ? [`Die nächste Abbuchung von ${amount} ist für den ${renewal} geplant (Ortszeit Athen).`] : []),
        `Revolut-Zahlungsreferenz: ${details.orderId}`,
      ]],
    },
  };
  const [subject, body] = text[locale][kind];
  const manage = { el: "Διαχείριση ή ακύρωση", en: "Manage or cancel", de: "Verwalten oder kündigen" }[locale];
  return { subject, text: ["BI Solutions Group", ...body, `${manage}: ${attempt.managementUrl}`].join("\n\n") };
}

async function revolutGet<T>(apiKey: string, resource: string, schema: z.ZodType<T>, missingOkay = false): Promise<T | null> {
  const response = await fetch(`https://merchant.revolut.com/api${resource}`, {
    headers: { Authorization: `Bearer ${apiKey}`, "Revolut-Api-Version": "2026-08-17", Accept: "application/json" },
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (missingOkay && response.status === 404) return null;
  if (!response.ok) throw new Error("Revolut recurring notice lookup failed.");
  return schema.parse(await response.json());
}

async function changeRenewalDate(apiKey: string, subscriptionId: string, renewalAt: number) {
  const response = await fetch(`https://merchant.revolut.com/api/subscriptions/${subscriptionId}/change-renewal-date`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`, "Revolut-Api-Version": "2026-08-17", "Content-Type": "application/json",
    },
    body: JSON.stringify({ renewal_date: new Date(renewalAt).toISOString() }),
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (response.status !== 204) throw new Error("Revolut did not confirm recurring renewal postponement.");
}

export function registerRecurringPaymentNotices({ db, apiKey, emailApiKey, fromEmail, listAttempts }: Options) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS recurring_notice_delivery (
      notice_id TEXT PRIMARY KEY,
      state TEXT NOT NULL,
      payload_hash TEXT,
      started_at INTEGER NOT NULL,
      next_attempt_at INTEGER NOT NULL,
      attempts INTEGER NOT NULL,
      notice_date INTEGER NOT NULL,
      renewal_at INTEGER,
      first_payment INTEGER NOT NULL,
      sent_at INTEGER,
      provider_id TEXT
    );
    CREATE TABLE IF NOT EXISTS recurring_notice_poll (
      attempt_id TEXT PRIMARY KEY,
      next_poll_at INTEGER NOT NULL,
      terminal_since INTEGER,
      terminal INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS recurring_renewal_postponement (
      cycle_id TEXT NOT NULL,
      previous_end_at INTEGER NOT NULL,
      target_end_at INTEGER NOT NULL,
      confirmed_end_at INTEGER,
      started_at INTEGER NOT NULL,
      PRIMARY KEY (cycle_id, previous_end_at)
    );
  `);
  const resend = new Resend(emailApiKey, { baseUrl: "https://api.resend.com" });
  const getDelivery = db.prepare<[string], Delivery>("SELECT * FROM recurring_notice_delivery WHERE notice_id = ?");
  const createDelivery = db.prepare(`
    INSERT OR IGNORE INTO recurring_notice_delivery
      (notice_id, state, started_at, next_attempt_at, attempts, notice_date, renewal_at, first_payment)
    VALUES (?, 'pending', ?, 0, 0, ?, ?, ?)
  `);
  const claimDelivery = db.prepare(`
    UPDATE recurring_notice_delivery SET payload_hash = ?, next_attempt_at = ?, attempts = attempts + 1
    WHERE notice_id = ? AND state = 'pending' AND next_attempt_at <= ?
  `);
  const markSent = db.prepare("UPDATE recurring_notice_delivery SET state = 'sent', provider_id = ?, sent_at = ? WHERE notice_id = ?");
  const deferDelivery = db.prepare("UPDATE recurring_notice_delivery SET next_attempt_at = ? WHERE notice_id = ? AND state = 'pending'");
  const failDelivery = db.prepare("UPDATE recurring_notice_delivery SET state = 'failed' WHERE notice_id = ? AND state = 'pending'");
  const pollState = db.prepare<[string], { terminal_since: number | null }>("SELECT terminal_since FROM recurring_notice_poll WHERE attempt_id = ?");
  const schedule = db.prepare(`
    INSERT INTO recurring_notice_poll (attempt_id, next_poll_at, terminal_since, terminal) VALUES (?, ?, ?, ?)
    ON CONFLICT(attempt_id) DO UPDATE SET
      next_poll_at = excluded.next_poll_at, terminal_since = excluded.terminal_since, terminal = excluded.terminal
  `);
  const reservePoll = db.prepare(`
    INSERT INTO recurring_notice_poll (attempt_id, next_poll_at) VALUES (?, ?)
    ON CONFLICT(attempt_id) DO UPDATE SET next_poll_at = excluded.next_poll_at
    WHERE recurring_notice_poll.terminal = 0 AND recurring_notice_poll.next_poll_at <= ?
  `);
  const reservePostponement = db.prepare(`
    INSERT OR IGNORE INTO recurring_renewal_postponement (cycle_id, previous_end_at, target_end_at, started_at)
    VALUES (?, ?, ?, ?)
  `);
  const getPostponement = db.prepare<[string, number], { target_end_at: number; started_at: number; confirmed_end_at: number | null }>(`
    SELECT target_end_at, started_at, confirmed_end_at FROM recurring_renewal_postponement
    WHERE cycle_id = ? AND previous_end_at = ?
  `);
  const recoverPostponement = db.prepare(`
    UPDATE recurring_renewal_postponement SET confirmed_end_at = ?
    WHERE cycle_id = ? AND previous_end_at < ? AND target_end_at <= ? AND confirmed_end_at IS NULL
  `);
  const hasPostponement = db.prepare<[string, number], { found: number }>(`
    SELECT 1 AS found FROM recurring_renewal_postponement
    WHERE cycle_id = ? AND confirmed_end_at = ? LIMIT 1
  `);
  const confirmPostponement = db.prepare(`
    UPDATE recurring_renewal_postponement SET confirmed_end_at = ?
    WHERE cycle_id = ? AND previous_end_at = ? AND confirmed_end_at IS NULL
  `);
  const recordTerminalGrace = db.prepare(`
    UPDATE recurring_notice_poll SET terminal_since = COALESCE(terminal_since, ?) WHERE attempt_id = ?
  `);
  const claimNotice = db.transaction((
    attempt: RecurringNoticeAttempt, kind: NoticeKind, entityId: string, details: NoticeDetails, deadline: number,
  ) => {
    const now = Date.now();
    const noticeId = `recurring/${kind}/${attempt.attemptId}/${entityId}`;
    createDelivery.run(noticeId, now, details.date, details.renewalAt ?? null, details.firstPayment ? 1 : 0);
    const row = getDelivery.get(noticeId)!;
    if (row.state === "sent") return "sent";
    if (row.state === "failed") return "failed";
    // Preserve non-sensitive message dates across retries without saving addresses or management links.
    const message = noticeEmail(attempt, kind, {
      date: row.notice_date,
      renewalAt: row.renewal_at ?? undefined,
      orderId: details.orderId,
      firstPayment: Boolean(row.first_payment),
    });
    const payload = { from: fromEmail, to: [attempt.email], ...message };
    const hash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    if ((row.payload_hash && row.payload_hash !== hash) ||
        (kind === "renewal" && row.notice_date !== details.date) ||
        now >= Math.min(row.started_at + RETRY_WINDOW, deadline) ||
        row.attempts >= MAX_SEND_ATTEMPTS) {
      if (failDelivery.run(noticeId).changes) console.error("Recurring payment notice needs manual review.", noticeId);
      return "failed";
    }
    if (!claimDelivery.run(hash, now + SEND_LEASE, noticeId, now).changes) return "pending";
    return { noticeId, payload, attemptCount: row.attempts + 1 };
  });

  function stopDelivery(noticeId: string, reason: string) {
    if (failDelivery.run(noticeId).changes) console.error(reason, noticeId);
    return "failed" as const;
  }

  async function send(attempt: RecurringNoticeAttempt, kind: NoticeKind, entityId: string, details: NoticeDetails, deadline = Infinity) {
    const claim = claimNotice.immediate(attempt, kind, entityId, details, deadline);
    if (typeof claim === "string") return claim;
    const { noticeId } = claim;
    const requestOptions = {
      idempotencyKey: noticeId,
      signal: AbortSignal.timeout(15_000),
    };
    const { data, error } = await resend.emails.send(claim.payload, requestOptions);
    if (data?.id && !error) {
      markSent.run(data.id, Date.now(), noticeId);
      return "sent";
    }
    const status = error?.statusCode;
    if (status && status >= 400 && status < 500 && ![408, 409, 425, 429].includes(status)) {
      return stopDelivery(noticeId, "Recurring payment email was rejected.");
    }
    const retryAt = Date.now() + Math.min(5 * MINUTE * 2 ** (claim.attemptCount - 1), 2 * HOUR);
    deferDelivery.run(retryAt, noticeId);
    return "pending";
  }

  async function queueAcceptance(attempt: RecurringNoticeAttempt) {
    if (await send(attempt, "acceptance", attempt.attemptId, { date: attempt.acceptedAt }) !== "sent") {
      throw new Error("Recurring payment terms email could not be confirmed.");
    }
  }

  async function poll(attempt: RecurringNoticeAttempt) {
    const now = Date.now();
    if (!reservePoll.run(attempt.attemptId, now + 10 * MINUTE, now).changes) return;
    const previousTerminal = pollState.get(attempt.attemptId)?.terminal_since ?? null;
    try {
      const subscriptionId = guid.parse(attempt.subscriptionId);
      const base = `/subscriptions/${subscriptionId}`;
      const subscription = await revolutGet(apiKey, base, subscriptionSchema);
      if (!subscription || subscription.id !== subscriptionId ||
          subscription.external_reference !== `BI-RECURRING/${attempt.attemptId}` ||
          subscription.customer_id !== attempt.customerId || subscription.plan_variation_id !== attempt.variationId ||
          (attempt.setupOrderId && subscription.setup_order_id && attempt.setupOrderId !== subscription.setup_order_id)) {
        throw new Error("Recurring notice lookup returned a different subscription.");
      }
      const terminal = subscription.state === "cancelled" || subscription.state === "finished";
      const terminalSince = terminal ? previousTerminal ?? now : null;
      if (terminalSince !== null) recordTerminalGrace.run(terminalSince, attempt.attemptId);
      const setupOrderId = subscription.setup_order_id ?? attempt.setupOrderId;
      const orders = new Map<string, number | undefined>();
      let renewalPending = false;

      const checkCycle = (cycle: z.infer<typeof cycleSchema>) => {
        if (cycle.subscription_id !== subscriptionId || cycle.plan_variation_id !== attempt.variationId) {
          throw new Error("Recurring notice lookup returned a different billing cycle.");
        }
      };

      if (subscription.state === "active" && subscription.payment_method_type === "automatic" && subscription.current_cycle_id) {
        const cycle = await revolutGet(apiKey, `${base}/cycles/${subscription.current_cycle_id}`, cycleSchema);
        if (cycle) {
          checkCycle(cycle);
          if (cycle.id !== subscription.current_cycle_id) throw new Error("Unexpected current recurring cycle.");
          const scheduled = subscription.scheduled_action;
          const scheduledChange = scheduled && Object.keys(scheduled).length > 0;
          if (cycle.state === "active" && cycle.end_date && !scheduledChange) {
            try {
              renewalPending = await checkRenewal(attempt, base, cycle, checkCycle);
            } catch {
              renewalPending = true;
              console.error("Recurring payment renewal notice or postponement needs review.", attempt.attemptId, cycle.id);
            }
          } else if (cycle.end_date && scheduledChange && scheduled.type !== "cancel" && now >= cycle.end_date - 8 * DAY) {
            console.error("Recurring payment renewal has a scheduled change that needs review.", attempt.attemptId, cycle.id);
          }
        }
      }

      const from = new Date(Math.max(attempt.acceptedAt, now - RECEIPT_LOOKBACK) - DAY).toISOString();
      const params = new URLSearchParams({ limit: "10", from });
      const list = await revolutGet(apiKey, `${base}/cycles?${params}`, z.object({ cycles: z.array(cycleSchema) }), true);
      for (const cycle of list?.cycles ?? []) {
        checkCycle(cycle);
        if (!cycle.order_id) continue;
        if (cycle.end_date && !terminal) orders.set(cycle.order_id, cycle.end_date);
        else orders.set(cycle.order_id, undefined);
      }
      if (setupOrderId && !orders.has(setupOrderId)) orders.set(guid.parse(setupOrderId), undefined);
      let receiptPending = false;
      for (const [orderId, renewalAt] of Array.from(orders)) {
        const noticeId = `recurring/receipt/${attempt.attemptId}/${orderId}`;
        const prior = getDelivery.get(noticeId);
        if (prior?.state === "sent" || prior?.state === "failed") continue;
        const order = await revolutGet(apiKey, `/orders/${orderId}`, orderSchema, true);
        if (!order) continue;
        if (order.id !== orderId || order.amount !== attempt.amountMinor ||
            (order.customer && order.customer.id !== attempt.customerId)) {
          throw new Error("Recurring notice lookup returned a different order.");
        }
        if (order.state !== "completed" || order.outstanding_amount || order.refunded_amount) continue;
        const payment = order.payments?.find((p) => ["captured", "completed"].includes(p.state) &&
          (p.amount ?? order.amount) === order.amount && (p.currency ?? "EUR") === "EUR");
        const date = payment?.updated_at ?? order.updated_at;
        if (!date || date > Date.now()) throw new Error("The payment date could not be confirmed.");
        const details = { date, renewalAt, orderId, firstPayment: orderId === setupOrderId };
        if (await send(attempt, "receipt", orderId, details) === "pending") receiptPending = true;
      }

      const settledTerminal = terminalSince !== null && now - terminalSince >= TERMINAL_GRACE && !receiptPending;
      const recentPending = subscription.state === "pending" && now - attempt.acceptedAt < DAY;
      const quickPoll = recentPending || renewalPending || receiptPending;
      const delay = quickPoll ? POLL_INTERVAL : subscription.state === "pending" ? 6 * HOUR : HOUR;
      schedule.run(attempt.attemptId, now + delay, terminalSince, settledTerminal ? 1 : 0);
    } catch {
      console.error("Recurring payment notice poll failed.", attempt.attemptId);
      const failedTerminalSince = pollState.get(attempt.attemptId)?.terminal_since ?? previousTerminal;
      const exhausted = failedTerminalSince !== null && now - failedTerminalSince >= TERMINAL_GRACE;
      schedule.run(attempt.attemptId, now + 15 * MINUTE, failedTerminalSince, exhausted ? 1 : 0);
    }
  }

  async function checkRenewal(
    attempt: RecurringNoticeAttempt,
    base: string,
    cycle: z.infer<typeof cycleSchema>,
    verifyCycle: (cycle: z.infer<typeof cycleSchema>) => void,
  ) {
    const end = cycle.end_date!;
    const entityId = `${cycle.id}-${end}`;
    const deadline = end - RENEWAL_NOTICE_LEAD;
    const noticeId = `recurring/renewal/${attempt.attemptId}/${entityId}`;
    recoverPostponement.run(end, cycle.id, end, end + MINUTE);
    const postponed = Boolean(hasPostponement.get(cycle.id, end));
    const prior = getDelivery.get(noticeId);
    if (prior?.state === "sent" && (prior.sent_at ?? Infinity) <= deadline) return false;

    const now = Date.now();
    if (!postponed && now < end - 8 * DAY) return false;
    if (now < deadline - POSTPONEMENT_BUFFER) {
      return await send(attempt, "renewal", entityId, { date: end }, deadline) !== "sent";
    }
    if (now >= end) {
      console.error("Recurring payment renewal notice deadline passed and billing may have started.", attempt.attemptId, cycle.id);
      return false;
    }
    const target = now + 9 * DAY;
    const isNew = reservePostponement.run(cycle.id, end, target, now).changes === 1;
    const pending = getPostponement.get(cycle.id, end)!;
    if (pending.confirmed_end_at) return true;
    let providerFailed = false;
    if (isNew) {
      try {
        await changeRenewalDate(apiKey, guid.parse(attempt.subscriptionId), pending.target_end_at);
      } catch {
        // A timed-out response can still represent an accepted change. The cycle is authoritative.
        providerFailed = true;
      }
    }
    const updated = await revolutGet(apiKey, `${base}/cycles/${cycle.id}`, cycleSchema);
    if (updated) verifyCycle(updated);
    if (!updated || updated.id !== cycle.id || updated.state !== "active" ||
        !updated.end_date || updated.end_date < pending.target_end_at - MINUTE) {
      if (isNew || now - pending.started_at < 2 * POLL_INTERVAL) {
        console.error("Recurring payment renewal postponement needs manual review.", attempt.attemptId, cycle.id,
          providerFailed ? "provider request failed" : "new cycle date could not be confirmed");
      }
      return true;
    }
    confirmPostponement.run(updated.end_date, cycle.id, end);
    return await send(attempt, "renewal", `${cycle.id}-${updated.end_date}`,
      { date: updated.end_date }, updated.end_date - RENEWAL_NOTICE_LEAD) !== "sent";
  }

  let running = false;
  async function runOnce() {
    if (running) return;
    running = true;
    try {
      const due = Array.from(await listAttempts(Date.now(), BATCH_SIZE)).slice(0, BATCH_SIZE);
      for (let offset = 0; offset < due.length; offset += 4) {
        await Promise.all(due.slice(offset, offset + 4).map(poll));
      }
    } catch {
      console.error("Recurring payment notice scheduler could not load pending work.");
    } finally {
      running = false;
    }
  }

  function start() {
    const timer = setInterval(() => void runOnce(), POLL_INTERVAL);
    timer.unref();
    return () => clearInterval(timer);
  }

  return { queueAcceptance, runOnce, start };
}
