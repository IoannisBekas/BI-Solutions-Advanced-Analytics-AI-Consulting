import type { Express, Request, Response } from "express";
import { requireAuth, type AuthenticatedRequest } from "./auth";
import {
  deleteQuantusAlertSubscription,
  deleteQuantusWatchlistEntry,
  findUserById,
  findQuantusAlertSubscription,
  findQuantusWatchlistEntry,
  findQuantusReportSnapshot,
  getQuantusAccuracySummary,
  incrementReports,
  incrementReportsIfBelowLimit,
  listQuantusAlertSubscriptions,
  listQuantusReportSnapshots,
  listQuantusWatchlistEntries,
  toSafeUser,
  upsertQuantusAlertSubscription,
  upsertQuantusReportSnapshot,
  upsertQuantusWatchlistEntry,
  type DbQuantusAlertSubscription,
  type DbQuantusReportSnapshot,
  type DbQuantusSnapshotSummary,
  type DbQuantusWatchlistEntry,
  type QuantusAlertSubscriptionInput,
  type QuantusSnapshotInput,
} from "./db";
import {
  QUANTUS_INTERNAL_HEADER,
  getQuantusMonthlyReportLimitForTier,
  getQuantusWatchlistLimitForTier,
  getRequiredQuantusTierForDeepDiveModule,
  hasRequiredQuantusTier,
  readQuantusInternalKey,
  sanitizeQuantusAssetClass,
  sanitizeQuantusTicker,
} from "../../shared/quantus";

function sanitizeBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes") {
      return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no") {
      return false;
    }
  }

  return fallback;
}

function mapSnapshotSummary(snapshot: DbQuantusSnapshotSummary | null | undefined) {
  if (!snapshot) {
    return null;
  }

  return {
    reportId: snapshot.report_id,
    ticker: snapshot.ticker,
    assetClass: snapshot.asset_class,
    company: snapshot.company_name,
    sector: snapshot.sector,
    engineVersion: snapshot.engine_version,
    signal: snapshot.signal,
    confidence: snapshot.confidence_score,
    regime: snapshot.regime_label,
    marketCapBucket: snapshot.market_cap_bucket,
    benchmarkSymbol: snapshot.benchmark_symbol,
    benchmarkPriceAtGen: snapshot.benchmark_price_at_gen,
    generatedAt: snapshot.generated_at,
    priceAtGen: snapshot.price_at_gen,
    source: snapshot.source,
  };
}

function mapWatchlistEntry(entry: DbQuantusWatchlistEntry) {
  return {
    ticker: entry.ticker,
    assetClass: entry.asset_class,
    createdAt: entry.created_at,
    updatedAt: entry.updated_at,
    latestSnapshot: mapSnapshotSummary(entry.latest_snapshot),
  };
}

function mapAlertSubscription(entry: DbQuantusAlertSubscription) {
  return {
    ticker: entry.ticker,
    assetClass: entry.asset_class,
    emailEnabled: entry.email_enabled === 1,
    pushEnabled: entry.push_enabled === 1,
    signalChange: entry.signal_change === 1,
    priceBreakout: entry.price_breakout === 1,
    regimeShift: entry.regime_shift === 1,
    dailyDigest: entry.daily_digest === 1,
    createdAt: entry.created_at,
    updatedAt: entry.updated_at,
  };
}

function mapArchiveSnapshot(snapshot: DbQuantusReportSnapshot) {
  return {
    reportId: snapshot.report_id,
    ticker: snapshot.ticker,
    company: snapshot.company_name,
    assetClass: snapshot.asset_class,
    signal: snapshot.signal,
    confidence: snapshot.confidence_score,
    regime: snapshot.regime_label,
    sector: snapshot.sector,
    engineVersion: snapshot.engine_version,
    generatedAt: snapshot.generated_at,
    priceAtGen: snapshot.price_at_gen,
    source: snapshot.source,
    url: `/quantus/workspace/report/${encodeURIComponent(snapshot.ticker)}?snapshot=${encodeURIComponent(snapshot.report_id)}`,
  };
}

function parseSnapshotPayload(body: Record<string, unknown> | undefined): QuantusSnapshotInput | null {
  const rawSnapshot = body?.snapshot;
  if (typeof rawSnapshot !== "object" || rawSnapshot === null) {
    return null;
  }

  const snapshot = rawSnapshot as Record<string, unknown>;
  const reportIdValue = snapshot.reportId;
  const companyNameValue = snapshot.companyName;
  const engineVersionValue = snapshot.engineVersion;
  const signalValue = snapshot.signal;
  const regimeLabelValue = snapshot.regimeLabel;
  const sourceValue = snapshot.source;
  const generatedAtValue = snapshot.generatedAt;
  const ticker = sanitizeQuantusTicker(snapshot.ticker);
  const reportId = typeof reportIdValue === "string"
    ? reportIdValue.trim()
    : "";
  const companyName = typeof companyNameValue === "string"
    ? companyNameValue.trim()
    : "";
  const engineVersion = typeof engineVersionValue === "string"
    ? engineVersionValue.trim()
    : "";
  const signal = typeof signalValue === "string"
    ? signalValue.trim()
    : "";
  const regimeLabel = typeof regimeLabelValue === "string"
    ? regimeLabelValue.trim()
    : "";
  const source = typeof sourceValue === "string"
    ? sourceValue.trim()
    : "live";
  const generatedAt = typeof generatedAtValue === "string"
    ? generatedAtValue.trim()
    : "";
  const priceAtGen = Number(snapshot.priceAtGen);
  const confidenceScore = Number(snapshot.confidenceScore);
  const benchmarkPriceAtGenRaw = snapshot.benchmarkPriceAtGen;
  const reportJsonValue = snapshot.reportJson;

  if (
    !ticker ||
    !reportId ||
    !companyName ||
    !engineVersion ||
    !signal ||
    !regimeLabel ||
    !generatedAt ||
    !Number.isFinite(priceAtGen) ||
    !Number.isFinite(confidenceScore) ||
    typeof reportJsonValue === "undefined"
  ) {
    return null;
  }

  return {
    reportId,
    ticker,
    assetClass: sanitizeQuantusAssetClass(snapshot.assetClass),
    companyName,
    sector: typeof snapshot.sector === "string"
      ? snapshot.sector.trim()
      : "",
    engineVersion,
    signal,
    confidenceScore,
    regimeLabel,
    marketCapBucket: typeof snapshot.marketCapBucket === "string"
      ? snapshot.marketCapBucket.trim()
      : null,
    benchmarkSymbol: sanitizeQuantusTicker(snapshot.benchmarkSymbol),
    benchmarkPriceAtGen: benchmarkPriceAtGenRaw == null
      ? null
      : Number.isFinite(Number(benchmarkPriceAtGenRaw))
        ? Number(benchmarkPriceAtGenRaw)
        : null,
    generatedAt,
    priceAtGen,
    source,
    reportJson: typeof reportJsonValue === "string"
      ? reportJsonValue
      : JSON.stringify(reportJsonValue),
  };
}

function buildAlertInput(
  ticker: string,
  body: Record<string, unknown> | undefined,
  existing?: DbQuantusAlertSubscription,
): QuantusAlertSubscriptionInput {
  return {
    ticker,
    assetClass: sanitizeQuantusAssetClass(body?.assetClass ?? existing?.asset_class),
    emailEnabled: sanitizeBoolean(body?.emailEnabled, existing ? existing.email_enabled === 1 : true),
    pushEnabled: sanitizeBoolean(body?.pushEnabled, existing ? existing.push_enabled === 1 : false),
    signalChange: sanitizeBoolean(body?.signalChange, existing ? existing.signal_change === 1 : true),
    priceBreakout: sanitizeBoolean(body?.priceBreakout, existing ? existing.price_breakout === 1 : true),
    regimeShift: sanitizeBoolean(body?.regimeShift, existing ? existing.regime_shift === 1 : true),
    dailyDigest: sanitizeBoolean(body?.dailyDigest, existing ? existing.daily_digest === 1 : false),
  };
}

export function registerQuantusPersistenceRoutes(app: Express) {
  app.get("/api/quantus/watchlist", requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const items = listQuantusWatchlistEntries(userId).map(mapWatchlistEntry);
    const activeAlertCount = listQuantusAlertSubscriptions(userId).length;
    res.json({ items, activeAlertCount });
  });

  app.post("/api/quantus/watchlist", requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const body = req.body as Record<string, unknown> | undefined;
    const ticker = sanitizeQuantusTicker(body?.ticker);
    if (!ticker) {
      res.status(400).json({ error: "Valid ticker is required." });
      return;
    }

    const userId = req.user!.userId;
    const existing = findQuantusWatchlistEntry(userId, ticker);
    const limit = getQuantusWatchlistLimitForTier(req.user!.tier);
    const currentItems = listQuantusWatchlistEntries(userId);

    if (!existing && limit >= 0 && currentItems.length >= limit) {
      res.status(403).json({
        error: `Your ${req.user!.tier} tier allows up to ${limit} watchlist tickers.`,
        code: "watchlist_limit_reached",
      });
      return;
    }

    const entry = upsertQuantusWatchlistEntry(
      userId,
      ticker,
      sanitizeQuantusAssetClass((req.body as Record<string, unknown> | undefined)?.assetClass),
    );

    res.status(existing ? 200 : 201).json({
      item: entry ? mapWatchlistEntry(entry) : null,
    });
  });

  app.delete("/api/quantus/watchlist/:ticker", requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const ticker = sanitizeQuantusTicker(req.params.ticker);
    if (!ticker) {
      res.status(400).json({ error: "Valid ticker is required." });
      return;
    }

    res.json({
      success: deleteQuantusWatchlistEntry(req.user!.userId, ticker),
    });
  });

  app.get("/api/quantus/alerts", requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const items = listQuantusAlertSubscriptions(req.user!.userId).map(mapAlertSubscription);
    res.json({ items });
  });

  app.put("/api/quantus/alerts/:ticker", requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const ticker = sanitizeQuantusTicker(req.params.ticker);
    if (!ticker) {
      res.status(400).json({ error: "Valid ticker is required." });
      return;
    }

    const userId = req.user!.userId;
    const existing = findQuantusAlertSubscription(userId, ticker);
    const input = buildAlertInput(ticker, req.body as Record<string, unknown> | undefined, existing);

    // Keep alert subscriptions discoverable in the persisted watchlist.
    upsertQuantusWatchlistEntry(userId, ticker, input.assetClass);
    const item = upsertQuantusAlertSubscription(userId, input);

    res.status(existing ? 200 : 201).json({
      item: item ? mapAlertSubscription(item) : null,
    });
  });

  app.delete("/api/quantus/alerts/:ticker", requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const ticker = sanitizeQuantusTicker(req.params.ticker);
    if (!ticker) {
      res.status(400).json({ error: "Valid ticker is required." });
      return;
    }

    res.json({
      success: deleteQuantusAlertSubscription(req.user!.userId, ticker),
    });
  });

  app.get("/api/quantus/archive", (req: Request, res: Response) => {
    const ticker = sanitizeQuantusTicker(req.query.ticker);
    if (!ticker) {
      res.status(400).json({ error: "Ticker query param is required." });
      return;
    }

    const requestedLimit = Number.parseInt(String(req.query.limit ?? "20"), 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 50)
      : 20;

    res.json({
      ticker,
      snapshots: listQuantusReportSnapshots(ticker, limit).map(mapArchiveSnapshot),
    });
  });

  app.get("/api/quantus/archive/:reportId", (req: Request, res: Response) => {
    const reportId = typeof req.params.reportId === "string" ? req.params.reportId.trim() : "";
    if (!reportId) {
      res.status(400).json({ error: "Report ID is required." });
      return;
    }

    const snapshot = findQuantusReportSnapshot(reportId);
    if (!snapshot) {
      res.status(404).json({ error: "Snapshot not found." });
      return;
    }

    try {
      res.json({
        snapshot: mapArchiveSnapshot(snapshot),
        report: JSON.parse(snapshot.report_json),
      });
    } catch (error) {
      console.error("Failed to parse Quantus snapshot JSON:", error);
      res.status(500).json({ error: "Snapshot payload is corrupted." });
    }
  });

  app.get("/api/quantus/accuracy", (_req: Request, res: Response) => {
    res.json(getQuantusAccuracySummary());
  });

  app.post("/api/quantus/usage/report", requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = findUserById(req.user!.userId);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const limit = getQuantusMonthlyReportLimitForTier(user.tier);
    if (limit >= 0) {
      const incremented = incrementReportsIfBelowLimit(user.id, limit);
      if (!incremented) {
        res.status(403).json({
          error: `Your ${user.tier} tier allows up to ${limit} full Quantus reports per month.`,
          code: "report_limit_reached",
          tier: user.tier,
          reportLimit: limit,
        });
        return;
      }
    } else {
      incrementReports(user.id);
    }

    const updatedUser = findUserById(user.id);
    res.json({
      ok: true,
      user: updatedUser ? toSafeUser(updatedUser) : null,
      reportLimit: limit,
      remainingReports: updatedUser && limit >= 0
        ? Math.max(0, limit - updatedUser.reports_this_month)
        : null,
    });
  });

  app.post("/api/quantus/usage/deep-dive-access", requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = findUserById(req.user!.userId);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const rawModule = req.body?.module;
    const moduleIndex = typeof rawModule === "number"
      ? Math.floor(rawModule)
      : Number.parseInt(String(rawModule), 10);
    if (!Number.isFinite(moduleIndex) || moduleIndex < 0 || moduleIndex > 11) {
      res.status(400).json({ error: "Valid Deep Dive module index (0-11) is required." });
      return;
    }

    const requiredTier = getRequiredQuantusTierForDeepDiveModule(moduleIndex);
    if (!hasRequiredQuantusTier(user.tier, requiredTier)) {
      res.status(403).json({
        error: requiredTier === "INSTITUTIONAL"
          ? "Institutional tier required for this Deep Dive module."
          : "Unlocked tier required for this Deep Dive module.",
        code: "deep_dive_tier_required",
        requiredTier,
        module: moduleIndex,
      });
      return;
    }

    res.json({
      ok: true,
      requiredTier,
      user: toSafeUser(user),
    });
  });

  app.post("/api/quantus/internal/snapshots", (req: Request, res: Response) => {
    if (req.header(QUANTUS_INTERNAL_HEADER) !== readQuantusInternalKey()) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const snapshot = parseSnapshotPayload(req.body as Record<string, unknown> | undefined);
    if (!snapshot) {
      res.status(400).json({ error: "Invalid snapshot payload." });
      return;
    }

    if (snapshot.source !== "live") {
      res.status(400).json({ error: "Only live Quantus snapshots may be persisted." });
      return;
    }

    const stored = upsertQuantusReportSnapshot(snapshot);
    res.status(201).json({
      ok: true,
      snapshot: stored ? mapArchiveSnapshot(stored) : null,
    });
  });
}
