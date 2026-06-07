import type { Express } from "express";
import { z } from "zod";
import {
  findBonusakiRedemption,
  getBonusakiAdminSummary,
  getBonusakiPilotStatus,
  getBonusakiPublicCampaign,
  isValidBonusakiAdminKey,
  issueBonusakiReward,
  recordBonusakiEvent,
  redeemBonusakiReward,
} from "../bonusakiStore";

const campaignParamsSchema = z.object({
  merchantSlug: z.string().trim().min(1).max(80).optional(),
  campaignSlug: z.string().trim().min(1).max(80).optional(),
});

const eventBodySchema = z.object({
  eventName: z.string().trim().min(1).max(80),
  surface: z.string().trim().max(80).optional(),
  path: z.string().trim().max(300).optional(),
  sessionId: z.string().trim().max(160).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const issueBodySchema = z.object({
  merchantSlug: z.string().trim().min(1).max(80).optional(),
  campaignSlug: z.string().trim().min(1).max(80).optional(),
  customerEmail: z.string().trim().email().max(254).optional(),
  source: z.string().trim().max(80).optional(),
});

const credentialBodySchema = z.object({
  token: z.string().trim().min(12).max(2000).optional(),
  publicCode: z.string().trim().min(4).max(80).optional(),
});

const redeemBodySchema = credentialBodySchema.extend({
  cashierPin: z.string().trim().max(128).optional(),
  cashierId: z.string().trim().max(120).optional(),
});

function readAdminKey(headerValue: string | string[] | undefined) {
  if (Array.isArray(headerValue)) {
    return headerValue[0];
  }
  return headerValue;
}

export function registerBonusakiRoutes(app: Express) {
  app.get("/api/bonusaki/health", (_req, res) => {
    res.json({
      status: "ok",
      product: "bonusaki",
      pilot: getBonusakiPilotStatus(),
    });
  });

  app.get("/api/bonusaki/campaign", (req, res) => {
    const parsed = campaignParamsSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid campaign query." });
      return;
    }

    const campaign = getBonusakiPublicCampaign(
      parsed.data.merchantSlug,
      parsed.data.campaignSlug,
    );
    if (!campaign) {
      res.status(404).json({ message: "Bonusaki campaign not found." });
      return;
    }

    res.json(campaign);
  });

  app.post("/api/bonusaki/events", (req, res) => {
    const parsed = eventBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid Bonusaki event." });
      return;
    }

    const result = recordBonusakiEvent(parsed.data);
    res.json({ success: Boolean(result) });
  });

  app.post("/api/bonusaki/rewards/issue", (req, res) => {
    const parsed = issueBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid reward issue request." });
      return;
    }

    const result = issueBonusakiReward(parsed.data);
    if (!result.ok) {
      const status = result.code === "daily_limit_reached" ? 429 : 503;
      res.status(status).json({
        message: "Bonusaki pilot reward issuing is not available.",
        code: result.code,
        pilot: getBonusakiPilotStatus(),
      });
      return;
    }

    res.json({
      success: true,
      token: result.token,
      publicCode: result.publicCode,
      expiresAt: result.expiresAt,
      reward: result.reward,
    });
  });

  app.post("/api/bonusaki/rewards/validate", (req, res) => {
    const parsed = credentialBodySchema.safeParse(req.body);
    if (!parsed.success || (!parsed.data.token && !parsed.data.publicCode)) {
      res.status(400).json({ message: "Provide a Bonusaki token or public code." });
      return;
    }

    const result = findBonusakiRedemption(parsed.data);
    if (!result.ok) {
      res.status(404).json({ valid: false, code: result.code });
      return;
    }

    res.json({ valid: true, redemption: result.response });
  });

  app.post("/api/bonusaki/rewards/redeem", (req, res) => {
    const parsed = redeemBodySchema.safeParse(req.body);
    if (!parsed.success || (!parsed.data.token && !parsed.data.publicCode)) {
      res.status(400).json({ message: "Provide a Bonusaki token or public code." });
      return;
    }

    const result = redeemBonusakiReward(parsed.data);
    if (!result.ok) {
      const status =
        result.code === "invalid_cashier_pin"
          ? 401
          : result.code === "already_redeemed"
            ? 409
            : result.code === "cashier_validation_disabled"
              ? 503
              : 400;
      res.status(status).json({
        success: false,
        code: result.code,
        redemption: "redemption" in result ? result.redemption : undefined,
      });
      return;
    }

    res.json({ success: true, redemption: result.redemption });
  });

  app.get("/api/bonusaki/admin/summary", (req, res) => {
    if (!getBonusakiPilotStatus().adminConfigured) {
      res.status(503).json({ message: "Bonusaki admin API is not configured." });
      return;
    }

    const candidateKey = readAdminKey(req.headers["x-bonusaki-admin-key"]);
    if (!isValidBonusakiAdminKey(candidateKey)) {
      res.status(401).json({ message: "Invalid Bonusaki admin key." });
      return;
    }

    res.json(getBonusakiAdminSummary());
  });
}
