import type { Express } from "express";
import type { Server } from "node:http";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { openContactInquiryStore, type ContactInquiry } from "../contactInquiryStore";

function getNotificationConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const recipient = process.env.CONTACT_RECIPIENT_EMAIL?.trim();
  const sender = process.env.CONTACT_FROM_EMAIL?.trim();
  return apiKey && recipient && sender ? { apiKey, recipient, sender } : null;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const contactBodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
  inquiryId: z.string().uuid().optional(),
});

const resendResponse = z.object({ id: z.string().min(1) });
const POLL_INTERVAL = 60_000;

async function sendContactNotification(
  { id, name, email, subject, message }: ContactInquiry,
  { apiKey, recipient, sender }: NonNullable<ReturnType<typeof getNotificationConfig>>,
): Promise<{ providerId: string } | { error: string }> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `contact/${id}`,
      },
      body: JSON.stringify({
        from: sender,
        to: recipient,
        reply_to: email,
        subject: `[Contact ${id.slice(0, 8)}] ${subject}`,
        html: `<p><strong>Reference:</strong> ${id}</p><p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><p><strong>Subject:</strong> ${escapeHtml(subject)}</p><hr/><p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
      }),
      signal: AbortSignal.timeout(5000),
      redirect: "error",
    });

    if (!response.ok) {
      await response.body?.cancel();
      return { error: `resend_http_${response.status}` };
    }
    const parsed = resendResponse.safeParse(await response.json().catch(() => null));
    return parsed.success ? { providerId: parsed.data.id } : { error: "resend_invalid_response" };
  } catch {
    return { error: "resend_unreachable" };
  }
}

export function registerContactRoute(app: Express, server?: Server) {
  let store: ReturnType<typeof openContactInquiryStore> | undefined;
  const getStore = () => store ??= openContactInquiryStore();

  async function alertFailure(id: string, reason: string) {
    const webhook = process.env.CONTACT_ALERT_WEBHOOK_URL?.trim();
    if (!webhook) return;

    try {
      const url = new URL(webhook);
      if (url.protocol !== "https:" || url.username || url.password) {
        console.warn("Contact alert webhook must use HTTPS without credentials");
        return;
      }
      if (!getStore().reserveAlert(id)) return;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `Contact notification pending for ${id} (${reason}).` }),
        signal: AbortSignal.timeout(2000),
        redirect: "error",
      });
      if (!response.ok) console.warn("Contact fallback alert failed", id, response.status);
      await response.body?.cancel();
    } catch {
      console.warn("Contact fallback alert failed", id);
    }
  }

  async function notify(id: string) {
    const inquiries = getStore();
    const config = getNotificationConfig();
    if (!config) {
      const reason = "notification_not_configured";
      if (inquiries.recordMissingConfig(id)) console.warn("Contact notification pending", id, reason);
      await alertFailure(id, reason);
      return false;
    }

    const inquiry = inquiries.reserve(id, Date.now());
    if (!inquiry) return false;
    const result = await sendContactNotification(inquiry, config);
    const recorded = inquiries.recordAttempt(inquiry, result);
    if (recorded && "error" in result) {
      console.warn("Contact notification pending", id, result.error);
      await alertFailure(id, result.error);
    }
    return recorded && "providerId" in result;
  }

  let retrying = false;
  async function retryPending() {
    if (retrying) return;
    retrying = true;
    try {
      const inquiries = getStore();
      for (const { id } of inquiries.expireRetries(Date.now())) {
        console.error("Contact notification needs review", id);
      }
      if (!getNotificationConfig()) return;
      for (const { id } of inquiries.due(Date.now())) await notify(id);
    } catch {
      console.error("Contact notification retry could not access storage");
    } finally {
      retrying = false;
    }
  }

  let timer: NodeJS.Timeout | undefined;
  function close() {
    if (timer) clearInterval(timer);
    store?.close();
    store = undefined;
  }
  server?.once("listening", () => {
    void retryPending();
    timer = setInterval(() => void retryPending(), POLL_INTERVAL);
    timer.unref();
  });
  server?.once("close", close);

  app.post("/api/contact", async (req, res) => {
    const parsed = contactBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid contact submission." });
      return;
    }
    const { name, email, subject, message } = parsed.data;
    const inquiryId = parsed.data.inquiryId ?? randomUUID();
    const id = inquiryId.toLowerCase();
    let inquiry;
    try {
      inquiry = getStore().capture({ id, name, email, subject, message });
    } catch {
      console.error("Contact inquiry could not be recorded");
      res.status(503).json({ message: "Could not record your inquiry. Please try again." });
      return;
    }
    if (inquiry.name !== name || inquiry.email !== email || inquiry.subject !== subject || inquiry.message !== message) {
      res.status(409).json({ message: "This inquiry reference is already in use." });
      return;
    }

    let accepted = inquiry.delivery_status === "accepted";
    if (inquiry.delivery_status === "pending") {
      try {
        accepted = await notify(id);
      } catch {
        console.error("Contact notification status could not be recorded", id);
      }
    }
    res.status(accepted ? 200 : 202).json({ success: true, inquiryId });
  });

  return { retryPending, close };
}
