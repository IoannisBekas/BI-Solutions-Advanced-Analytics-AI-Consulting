import crypto from "crypto";
import { db } from "./db";

const DEFAULT_MERCHANT_ID = "bonusaki-merchant-kafe-gonia";
const DEFAULT_CAMPAIGN_ID = "bonusaki-campaign-launch-pilot";
const DEFAULT_MERCHANT_SLUG = "kafe-gonia";
const DEFAULT_CAMPAIGN_SLUG = "launch-pilot";
const REWARD_TOKEN_TYPE = "bonusaki_reward_v1";
const TOKEN_TTL_DAYS = 30;

type BonusakiRedemptionStatus = "issued" | "redeemed" | "expired" | "void";

interface BonusakiMerchantRow {
  id: string;
  slug: string;
  name: string;
  status: string;
}

interface BonusakiCampaignRow {
  id: string;
  merchant_id: string;
  slug: string;
  name: string;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  daily_play_limit: number;
}

interface BonusakiRewardRow {
  id: string;
  campaign_id: string;
  label: string;
  description: string;
  emoji: string;
  weight: number;
  active: number;
  max_issued: number | null;
  issued_count: number;
  redeemed_count: number;
}

interface BonusakiRedemptionRow {
  id: string;
  public_code: string;
  token_hash: string;
  merchant_id: string;
  campaign_id: string;
  reward_id: string;
  customer_email_hash: string | null;
  status: BonusakiRedemptionStatus;
  issued_at: string;
  expires_at: string;
  redeemed_at: string | null;
  redeemed_by: string | null;
  metadata_json: string;
}

interface BonusakiTokenPayload {
  typ: typeof REWARD_TOKEN_TYPE;
  rid: string;
  code: string;
  exp: number;
}

export interface BonusakiIssueInput {
  merchantSlug?: string;
  campaignSlug?: string;
  customerEmail?: string | null;
  source?: string | null;
}

export interface BonusakiEventInput {
  eventName: string;
  surface?: string | null;
  path?: string | null;
  sessionId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface BonusakiCredentialInput {
  token?: string | null;
  publicCode?: string | null;
}

db.exec(`
  CREATE TABLE IF NOT EXISTS bonusaki_merchants (
    id          TEXT PRIMARY KEY,
    slug        TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pilot',
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bonusaki_campaigns (
    id               TEXT PRIMARY KEY,
    merchant_id      TEXT NOT NULL,
    slug             TEXT NOT NULL,
    name             TEXT NOT NULL,
    status           TEXT NOT NULL DEFAULT 'pilot',
    starts_at        TEXT,
    ends_at          TEXT,
    daily_play_limit INTEGER NOT NULL DEFAULT 100,
    created_at       TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at       TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (merchant_id, slug),
    FOREIGN KEY (merchant_id) REFERENCES bonusaki_merchants(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bonusaki_rewards (
    id             TEXT PRIMARY KEY,
    campaign_id    TEXT NOT NULL,
    label          TEXT NOT NULL,
    description    TEXT NOT NULL DEFAULT '',
    emoji          TEXT NOT NULL DEFAULT '',
    weight         INTEGER NOT NULL DEFAULT 1,
    active         INTEGER NOT NULL DEFAULT 1,
    max_issued     INTEGER,
    issued_count   INTEGER NOT NULL DEFAULT 0,
    redeemed_count INTEGER NOT NULL DEFAULT 0,
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (campaign_id) REFERENCES bonusaki_campaigns(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bonusaki_redemptions (
    id                  TEXT PRIMARY KEY,
    public_code         TEXT NOT NULL UNIQUE,
    token_hash          TEXT NOT NULL UNIQUE,
    merchant_id         TEXT NOT NULL,
    campaign_id         TEXT NOT NULL,
    reward_id           TEXT NOT NULL,
    customer_email_hash TEXT,
    status              TEXT NOT NULL DEFAULT 'issued',
    issued_at           TEXT NOT NULL,
    expires_at          TEXT NOT NULL,
    redeemed_at         TEXT,
    redeemed_by         TEXT,
    metadata_json       TEXT NOT NULL DEFAULT '{}',
    FOREIGN KEY (merchant_id) REFERENCES bonusaki_merchants(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES bonusaki_campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (reward_id) REFERENCES bonusaki_rewards(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_bonusaki_redemptions_status
    ON bonusaki_redemptions(status, expires_at);
  CREATE INDEX IF NOT EXISTS idx_bonusaki_redemptions_campaign_issued
    ON bonusaki_redemptions(campaign_id, issued_at);

  CREATE TABLE IF NOT EXISTS bonusaki_event_log (
    id            TEXT PRIMARY KEY,
    event_name    TEXT NOT NULL,
    surface       TEXT NOT NULL DEFAULT 'demo',
    path          TEXT NOT NULL DEFAULT '',
    session_hash  TEXT,
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_bonusaki_event_log_created
    ON bonusaki_event_log(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_bonusaki_event_log_name_created
    ON bonusaki_event_log(event_name, created_at DESC);
`);

const seedPilotDefaults = db.transaction(() => {
  db.prepare(
    `INSERT OR IGNORE INTO bonusaki_merchants (id, slug, name, status)
     VALUES (?, ?, ?, 'pilot')`,
  ).run(DEFAULT_MERCHANT_ID, DEFAULT_MERCHANT_SLUG, "Kafe Gonia");

  db.prepare(
    `INSERT OR IGNORE INTO bonusaki_campaigns (
      id, merchant_id, slug, name, status, daily_play_limit
     ) VALUES (?, ?, ?, ?, 'pilot', 100)`,
  ).run(
    DEFAULT_CAMPAIGN_ID,
    DEFAULT_MERCHANT_ID,
    DEFAULT_CAMPAIGN_SLUG,
    "Bonusaki launch pilot",
  );

  const rewards = [
    ["burger", "Free burger", "Customer receives a free burger.", "burger", 25],
    ["fries", "Free fries", "Customer receives a free fries side.", "fries", 20],
    ["pizza", "Pizza slice", "Customer receives a pizza slice.", "pizza", 15],
    ["dessert", "Free dessert", "Customer receives a free dessert.", "dessert", 15],
    ["soft-drink", "Free soft drink", "Customer receives a free soft drink.", "drink", 15],
    ["coffee", "Free coffee", "Customer receives a free coffee.", "coffee", 10],
  ] as const;

  const insertReward = db.prepare(
    `INSERT OR IGNORE INTO bonusaki_rewards (
      id, campaign_id, label, description, emoji, weight, active
     ) VALUES (?, ?, ?, ?, ?, ?, 1)`,
  );

  for (const [slug, label, description, emoji, weight] of rewards) {
    insertReward.run(
      `bonusaki-reward-${slug}`,
      DEFAULT_CAMPAIGN_ID,
      label,
      description,
      emoji,
      weight,
    );
  }
});

seedPilotDefaults();

const stmts = {
  findCampaign: db.prepare(
    `SELECT c.*
     FROM bonusaki_campaigns c
     INNER JOIN bonusaki_merchants m ON m.id = c.merchant_id
     WHERE m.slug = ? AND c.slug = ?`,
  ),
  findMerchantById: db.prepare("SELECT * FROM bonusaki_merchants WHERE id = ?"),
  listRewardsByCampaign: db.prepare(
    `SELECT * FROM bonusaki_rewards
     WHERE campaign_id = ?
     ORDER BY weight DESC, label ASC`,
  ),
  listIssueableRewardsByCampaign: db.prepare(
    `SELECT * FROM bonusaki_rewards
     WHERE campaign_id = ?
       AND active = 1
       AND weight > 0
       AND (max_issued IS NULL OR issued_count < max_issued)
     ORDER BY weight DESC, label ASC`,
  ),
  countCampaignIssuesToday: db.prepare(
    `SELECT COUNT(*) AS count
     FROM bonusaki_redemptions
     WHERE campaign_id = ?
       AND issued_at >= datetime('now', 'start of day')`,
  ),
  insertRedemption: db.prepare(
    `INSERT INTO bonusaki_redemptions (
      id, public_code, token_hash, merchant_id, campaign_id, reward_id,
      customer_email_hash, status, issued_at, expires_at, metadata_json
     ) VALUES (?, ?, ?, ?, ?, ?, ?, 'issued', ?, ?, ?)`,
  ),
  incrementRewardIssued: db.prepare(
    `UPDATE bonusaki_rewards
     SET issued_count = issued_count + 1, updated_at = datetime('now')
     WHERE id = ?`,
  ),
  incrementRewardRedeemed: db.prepare(
    `UPDATE bonusaki_rewards
     SET redeemed_count = redeemed_count + 1, updated_at = datetime('now')
     WHERE id = ?`,
  ),
  findRedemptionByTokenHash: db.prepare(
    "SELECT * FROM bonusaki_redemptions WHERE token_hash = ?",
  ),
  findRedemptionByPublicCode: db.prepare(
    "SELECT * FROM bonusaki_redemptions WHERE public_code = ?",
  ),
  findRewardById: db.prepare("SELECT * FROM bonusaki_rewards WHERE id = ?"),
  updateRedemptionStatus: db.prepare(
    `UPDATE bonusaki_redemptions
     SET status = ?, metadata_json = ?, redeemed_at = ?, redeemed_by = ?
     WHERE id = ? AND status = ?`,
  ),
  insertEvent: db.prepare(
    `INSERT INTO bonusaki_event_log (
      id, event_name, surface, path, session_hash, metadata_json
     ) VALUES (?, ?, ?, ?, ?, ?)`,
  ),
  eventCounts: db.prepare(
    `SELECT event_name, COUNT(*) AS count
     FROM bonusaki_event_log
     WHERE created_at >= datetime('now', ?)
     GROUP BY event_name
     ORDER BY count DESC, event_name ASC`,
  ),
  campaignCounts: db.prepare(
    `SELECT
       COUNT(*) AS issued_count,
       SUM(CASE WHEN status = 'redeemed' THEN 1 ELSE 0 END) AS redeemed_count,
       SUM(CASE WHEN status = 'issued' THEN 1 ELSE 0 END) AS open_count,
       SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) AS expired_count
     FROM bonusaki_redemptions
     WHERE campaign_id = ?`,
  ),
};

function isTruthy(value: string | undefined) {
  return /^(1|true|yes|on)$/i.test((value || "").trim());
}

function getTokenSecret() {
  const dedicatedSecret = (process.env.BONUSAKI_TOKEN_SECRET || "").trim();
  if (dedicatedSecret.length >= 32) {
    return dedicatedSecret;
  }

  const fallbackSecret = (process.env.JWT_SECRET || "").trim();
  return fallbackSecret.length >= 32 ? fallbackSecret : "";
}

function getCashierPin() {
  return (process.env.BONUSAKI_CASHIER_PIN || "").trim();
}

function getAdminKey() {
  return (process.env.BONUSAKI_ADMIN_KEY || "").trim();
}

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hmacSha256(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function safeJsonStringify(value: unknown) {
  try {
    return JSON.stringify(value ?? {});
  } catch {
    return "{}";
  }
}

function safeJsonParse(value: string | null | undefined) {
  try {
    const parsed = JSON.parse(value || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function randomId(prefix: string) {
  return `${prefix}_${crypto.randomBytes(12).toString("hex")}`;
}

function randomPublicCode() {
  const raw = crypto.randomBytes(8).toString("base64url").toUpperCase();
  return `BA-${raw.replace(/[^A-Z0-9]/g, "").slice(0, 10)}`;
}

function base64UrlJson(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signPayload(payload: BonusakiTokenPayload, secret: string) {
  const encodedPayload = base64UrlJson(payload);
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function verifyToken(token: string, secret: string) {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as BonusakiTokenPayload;
    if (payload.typ !== REWARD_TOKEN_TYPE || !payload.rid || !payload.code || !payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function isCampaignLive(campaign: BonusakiCampaignRow) {
  const now = Date.now();
  const startsAt = campaign.starts_at ? Date.parse(campaign.starts_at) : null;
  const endsAt = campaign.ends_at ? Date.parse(campaign.ends_at) : null;
  return (
    campaign.status !== "disabled" &&
    (startsAt == null || Number.isNaN(startsAt) || startsAt <= now) &&
    (endsAt == null || Number.isNaN(endsAt) || endsAt >= now)
  );
}

function serializeReward(row: BonusakiRewardRow) {
  return {
    id: row.id,
    label: row.label,
    description: row.description,
    emoji: row.emoji,
    weight: row.weight,
    active: row.active === 1,
    issuedCount: row.issued_count,
    redeemedCount: row.redeemed_count,
  };
}

function buildRedemptionResponse(redemption: BonusakiRedemptionRow, reward: BonusakiRewardRow | undefined) {
  const isExpired =
    redemption.status === "issued" && Date.parse(redemption.expires_at) < Date.now();
  const status = isExpired ? "expired" : redemption.status;
  return {
    id: redemption.id,
    publicCode: redemption.public_code,
    status,
    issuedAt: redemption.issued_at,
    expiresAt: redemption.expires_at,
    redeemedAt: redemption.redeemed_at,
    reward: reward ? serializeReward(reward) : null,
  };
}

function findCampaign(merchantSlug = DEFAULT_MERCHANT_SLUG, campaignSlug = DEFAULT_CAMPAIGN_SLUG) {
  return stmts.findCampaign.get(merchantSlug, campaignSlug) as BonusakiCampaignRow | undefined;
}

function chooseReward(campaignId: string) {
  const rewards = stmts.listIssueableRewardsByCampaign.all(campaignId) as BonusakiRewardRow[];
  const totalWeight = rewards.reduce((sum, reward) => sum + Math.max(0, reward.weight), 0);
  if (rewards.length === 0 || totalWeight <= 0) {
    return null;
  }

  let roll = crypto.randomInt(1, totalWeight + 1);
  for (const reward of rewards) {
    roll -= Math.max(0, reward.weight);
    if (roll <= 0) {
      return reward;
    }
  }

  return rewards[rewards.length - 1];
}

export function getBonusakiPilotStatus() {
  const tokenSecret = getTokenSecret();
  const cashierPin = getCashierPin();
  return {
    pilotEnabled: isTruthy(process.env.BONUSAKI_PILOT_ENABLED),
    tokenSigningConfigured: tokenSecret.length >= 32,
    cashierValidationConfigured: cashierPin.length > 0,
    adminConfigured: getAdminKey().length >= 24,
    defaultMerchantSlug: DEFAULT_MERCHANT_SLUG,
    defaultCampaignSlug: DEFAULT_CAMPAIGN_SLUG,
  };
}

export function getBonusakiPublicCampaign(
  merchantSlug = DEFAULT_MERCHANT_SLUG,
  campaignSlug = DEFAULT_CAMPAIGN_SLUG,
) {
  const campaign = findCampaign(merchantSlug, campaignSlug);
  if (!campaign) {
    return null;
  }

  const merchant = stmts.findMerchantById.get(campaign.merchant_id) as BonusakiMerchantRow | undefined;
  const rewards = stmts.listRewardsByCampaign.all(campaign.id) as BonusakiRewardRow[];
  const status = getBonusakiPilotStatus();
  return {
    merchant: merchant
      ? { id: merchant.id, slug: merchant.slug, name: merchant.name, status: merchant.status }
      : null,
    campaign: {
      id: campaign.id,
      slug: campaign.slug,
      name: campaign.name,
      status: campaign.status,
      live: isCampaignLive(campaign),
      startsAt: campaign.starts_at,
      endsAt: campaign.ends_at,
      dailyPlayLimit: campaign.daily_play_limit,
    },
    rewards: rewards.map(serializeReward),
    pilot: status,
  };
}

export function recordBonusakiEvent(input: BonusakiEventInput) {
  const eventName = input.eventName.trim().replace(/[^A-Za-z0-9_.:-]/g, "_").slice(0, 80);
  if (!eventName) {
    return null;
  }

  const secret = getTokenSecret() || "bonusaki-public-event";
  const sessionHash = input.sessionId
    ? hmacSha256(input.sessionId.slice(0, 160), secret)
    : null;
  const metadataJson = safeJsonStringify(input.metadata ?? {});
  const cappedMetadataJson = metadataJson.length > 2000 ? "{}" : metadataJson;

  const id = randomId("evt");
  stmts.insertEvent.run(
    id,
    eventName,
    (input.surface || "demo").slice(0, 80),
    (input.path || "").slice(0, 300),
    sessionHash,
    cappedMetadataJson,
  );
  return { id };
}

export function issueBonusakiReward(input: BonusakiIssueInput) {
  const pilotStatus = getBonusakiPilotStatus();
  const tokenSecret = getTokenSecret();
  if (!pilotStatus.pilotEnabled || tokenSecret.length < 32) {
    return { ok: false as const, code: "pilot_disabled" };
  }

  const campaign = findCampaign(input.merchantSlug, input.campaignSlug);
  if (!campaign || !isCampaignLive(campaign)) {
    return { ok: false as const, code: "campaign_unavailable" };
  }

  const issueCountRow = stmts.countCampaignIssuesToday.get(campaign.id) as { count: number };
  if (issueCountRow.count >= campaign.daily_play_limit) {
    return { ok: false as const, code: "daily_limit_reached" };
  }

  const reward = chooseReward(campaign.id);
  if (!reward) {
    return { ok: false as const, code: "reward_unavailable" };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  const redemptionId = randomId("redemption");
  const publicCode = randomPublicCode();
  const payload: BonusakiTokenPayload = {
    typ: REWARD_TOKEN_TYPE,
    rid: redemptionId,
    code: publicCode,
    exp: Math.floor(expiresAt.getTime() / 1000),
  };
  const token = signPayload(payload, tokenSecret);
  const tokenHash = sha256(token);
  const customerEmailHash = input.customerEmail
    ? hmacSha256(input.customerEmail.trim().toLowerCase().slice(0, 254), tokenSecret)
    : null;

  const transaction = db.transaction(() => {
    stmts.insertRedemption.run(
      redemptionId,
      publicCode,
      tokenHash,
      campaign.merchant_id,
      campaign.id,
      reward.id,
      customerEmailHash,
      now.toISOString(),
      expiresAt.toISOString(),
      safeJsonStringify({ source: input.source || "api" }),
    );
    stmts.incrementRewardIssued.run(reward.id);
  });

  transaction();

  return {
    ok: true as const,
    token,
    publicCode,
    expiresAt: expiresAt.toISOString(),
    reward: serializeReward(reward),
  };
}

export function findBonusakiRedemption(input: BonusakiCredentialInput) {
  const tokenSecret = getTokenSecret();
  let redemption: BonusakiRedemptionRow | undefined;
  let verifiedPayload: BonusakiTokenPayload | null = null;

  if (input.token) {
    if (tokenSecret.length < 32) {
      return { ok: false as const, code: "token_signing_unconfigured" };
    }
    verifiedPayload = verifyToken(input.token, tokenSecret);
    if (!verifiedPayload || verifiedPayload.exp * 1000 < Date.now()) {
      return { ok: false as const, code: "invalid_or_expired_token" };
    }
    redemption = stmts.findRedemptionByTokenHash.get(sha256(input.token)) as BonusakiRedemptionRow | undefined;
    if (
      redemption &&
      (redemption.id !== verifiedPayload.rid || redemption.public_code !== verifiedPayload.code)
    ) {
      return { ok: false as const, code: "token_mismatch" };
    }
  } else if (input.publicCode) {
    redemption = stmts.findRedemptionByPublicCode.get(input.publicCode.trim().toUpperCase()) as
      | BonusakiRedemptionRow
      | undefined;
  }

  if (!redemption) {
    return { ok: false as const, code: "not_found" };
  }

  const reward = stmts.findRewardById.get(redemption.reward_id) as BonusakiRewardRow | undefined;
  return {
    ok: true as const,
    redemption,
    reward,
    response: buildRedemptionResponse(redemption, reward),
  };
}

export function redeemBonusakiReward(input: BonusakiCredentialInput & {
  cashierPin?: string | null;
  cashierId?: string | null;
}) {
  const pilotStatus = getBonusakiPilotStatus();
  const cashierPin = getCashierPin();
  if (!pilotStatus.pilotEnabled || !cashierPin) {
    return { ok: false as const, code: "cashier_validation_disabled" };
  }
  if (input.cashierPin !== cashierPin) {
    return { ok: false as const, code: "invalid_cashier_pin" };
  }

  const found = findBonusakiRedemption(input);
  if (!found.ok) {
    return found;
  }

  const { redemption, reward } = found;
  if (redemption.status === "redeemed") {
    return { ok: false as const, code: "already_redeemed", redemption: found.response };
  }
  if (redemption.status !== "issued" || Date.parse(redemption.expires_at) < Date.now()) {
    const metadata = safeJsonStringify({ ...safeJsonParse(redemption.metadata_json), expiredCheckedAt: new Date().toISOString() });
    stmts.updateRedemptionStatus.run("expired", metadata, null, null, redemption.id, redemption.status);
    return { ok: false as const, code: "not_redeemable", redemption: { ...found.response, status: "expired" } };
  }

  const redeemedAt = new Date().toISOString();
  const redeemedBy = (input.cashierId || "cashier").slice(0, 120);
  const transaction = db.transaction(() => {
    const result = stmts.updateRedemptionStatus.run(
      "redeemed",
      safeJsonStringify({ ...safeJsonParse(redemption.metadata_json), redeemedVia: "api" }),
      redeemedAt,
      redeemedBy,
      redemption.id,
      "issued",
    ) as { changes: number };

    if (result.changes !== 1) {
      return false;
    }

    stmts.incrementRewardRedeemed.run(redemption.reward_id);
    return true;
  });

  if (!transaction()) {
    return { ok: false as const, code: "already_redeemed", redemption: found.response };
  }

  return {
    ok: true as const,
    redemption: {
      ...buildRedemptionResponse(
        { ...redemption, status: "redeemed", redeemed_at: redeemedAt, redeemed_by: redeemedBy },
        reward,
      ),
    },
  };
}

export function getBonusakiAdminSummary() {
  const campaign = findCampaign();
  if (!campaign) {
    return null;
  }
  const publicCampaign = getBonusakiPublicCampaign();
  const counts = stmts.campaignCounts.get(campaign.id) as {
    issued_count: number;
    redeemed_count: number | null;
    open_count: number | null;
    expired_count: number | null;
  };
  const events = stmts.eventCounts.all("-7 days") as Array<{ event_name: string; count: number }>;
  return {
    ...publicCampaign,
    redemptions: {
      issuedCount: counts.issued_count || 0,
      redeemedCount: counts.redeemed_count || 0,
      openCount: counts.open_count || 0,
      expiredCount: counts.expired_count || 0,
    },
    eventsLast7Days: events.map((row) => ({
      eventName: row.event_name,
      count: row.count,
    })),
  };
}

export function isValidBonusakiAdminKey(candidate: string | undefined) {
  const adminKey = getAdminKey();
  if (adminKey.length < 24 || !candidate) {
    return false;
  }

  const expectedBuffer = Buffer.from(adminKey);
  const candidateBuffer = Buffer.from(candidate);
  return (
    expectedBuffer.length === candidateBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, candidateBuffer)
  );
}
