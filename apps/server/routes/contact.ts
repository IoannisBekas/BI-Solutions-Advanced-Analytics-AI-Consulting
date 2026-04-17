import type { Express } from "express";
import { z } from "zod";

function getResendApiKey() {
  return (process.env.RESEND_API_KEY || "").trim();
}

function getContactRecipient() {
  return (process.env.CONTACT_RECIPIENT_EMAIL || "ibekas@ihu.gr").trim();
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
});

export function registerContactRoute(app: Express) {
  app.post("/api/contact", async (req, res) => {
    const apiKey = getResendApiKey();
    const recipient = getContactRecipient();

    if (!apiKey) {
      res.status(500).json({ message: "Contact form is not configured on the server." });
      return;
    }

    const parsed = contactBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid contact submission." });
      return;
    }
    const { name, email, subject, message } = parsed.data;

    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);

      const { error } = await resend.emails.send({
        from: "BI Solutions Contact <onboarding@resend.dev>",
        to: recipient,
        replyTo: email,
        subject: `[Contact] ${subject}`,
        html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><p><strong>Subject:</strong> ${escapeHtml(subject)}</p><hr/><p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
      });

      if (error) {
        console.error("Resend error:", error);
        res.status(502).json({ message: "Failed to deliver message. Please try again." });
      } else {
        res.json({ success: true });
      }
    } catch (error) {
      console.error("Contact form proxy failed:", error);
      res.status(502).json({ message: "Failed to deliver message. Please try again." });
    }
  });
}
