import type { Express } from "express";
import { getProjectDepositRevolutConfig, retrieveProjectDepositOrder } from "../projectDepositRevolut";
import { readProjectDepositToken } from "../projectDepositToken";

export function registerProjectDepositRoutes(app: Express) {
  app.post("/api/project-deposits/status", async (req, res) => {
    res.set("Cache-Control", "no-store");
    const secret = process.env.PROJECT_DEPOSIT_TOKEN_SECRET?.trim();
    if (!secret || secret.length < 32) {
      res.status(503).json({ code: "unavailable" });
      return;
    }

    const token = req.body?.token;
    const quote = typeof token === "string" ? readProjectDepositToken(token, secret) : null;
    if (!quote) {
      res.status(404).json({ code: "invalid" });
      return;
    }
    if (quote.expiresAt <= Date.now() / 1000) {
      res.status(410).json({ code: "expired" });
      return;
    }

    try {
      const config = getProjectDepositRevolutConfig();
      if (quote.environment !== config.environment) {
        res.status(404).json({ code: "invalid" });
        return;
      }
      const details = {
        reference: quote.reference,
        amountMinor: quote.amountMinor,
        currency: "EUR",
        sandbox: config.environment === "sandbox",
      };
      if (!config.apiKey) {
        res.json({ ...details, status: "unavailable" });
        return;
      }

      const order = await retrieveProjectDepositOrder(config, quote);
      if (quote.expiresAt <= Date.now() / 1000) {
        res.status(410).json({ code: "expired" });
        return;
      }
      if (order.expiresAt !== quote.expiresAt) {
        res.status(404).json({ code: "invalid" });
        return;
      }
      switch (order.state) {
        case "pending":
          res.json({ ...details, status: "payable", checkoutUrl: order.checkoutUrl });
          break;
        case "processing":
        case "authorised":
          res.json({ ...details, status: "processing" });
          break;
        case "completed":
          res.json({ ...details, status: "paid" });
          break;
        default:
          res.json({ ...details, status: "closed" });
      }
    } catch (error) {
      console.error("Project deposit checkout lookup failed:", error instanceof Error ? error.name : "unknown error");
      res.status(502).json({ code: "unavailable" });
    }
  });
}
