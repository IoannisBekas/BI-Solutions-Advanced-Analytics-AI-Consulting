export const QUANTUS_INTERNAL_HEADER = "x-quantus-internal-key";
const QUANTUS_DEFAULT_INTERNAL_KEY = "quantus-dev-secret";
const QUANTUS_TICKER_RE = /^[A-Z0-9.=^_-]{1,20}$/;

export const QUANTUS_ASSET_CLASSES = [
  "EQUITY",
  "CRYPTO",
  "COMMODITY",
  "ETF",
] as const;

export const QUANTUS_TIERS = [
  "FREE",
  "UNLOCKED",
  "INSTITUTIONAL",
] as const;

export type QuantusAssetClass = typeof QUANTUS_ASSET_CLASSES[number];
export type QuantusTier = typeof QUANTUS_TIERS[number];

const assetClassSet = new Set<string>(QUANTUS_ASSET_CLASSES);
const tierSet = new Set<string>(QUANTUS_TIERS);

export const QUANTUS_TIER_RANK: Record<QuantusTier, number> = {
  FREE: 0,
  UNLOCKED: 1,
  INSTITUTIONAL: 2,
};

export function readQuantusInternalKey(
  env: Record<string, string | undefined> = process.env,
) {
  return (
    env.QUANTUS_INTERNAL_KEY?.trim() ||
    env.JWT_SECRET?.trim() ||
    QUANTUS_DEFAULT_INTERNAL_KEY
  );
}

export function sanitizeQuantusTicker(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const ticker = value.trim().toUpperCase();
  return QUANTUS_TICKER_RE.test(ticker) ? ticker : null;
}

export function sanitizeQuantusAssetClass(value: unknown): QuantusAssetClass {
  if (typeof value !== "string") {
    return "EQUITY";
  }

  const assetClass = value.trim().toUpperCase();
  return assetClassSet.has(assetClass)
    ? (assetClass as QuantusAssetClass)
    : "EQUITY";
}

export function sanitizeQuantusUserTier(value: unknown): QuantusTier {
  if (typeof value !== "string") {
    return "FREE";
  }

  const tier = value.trim().toUpperCase();
  return tierSet.has(tier) ? (tier as QuantusTier) : "FREE";
}

export function getQuantusWatchlistLimitForTier(tier: string) {
  switch (sanitizeQuantusUserTier(tier)) {
    case "INSTITUTIONAL":
      return -1;
    case "UNLOCKED":
      return 25;
    case "FREE":
    default:
      return 5;
  }
}

export function getQuantusMonthlyReportLimitForTier(tier: string) {
  switch (sanitizeQuantusUserTier(tier)) {
    case "INSTITUTIONAL":
      return -1;
    case "UNLOCKED":
      return 10;
    case "FREE":
    default:
      return 3;
  }
}

export function getRequiredQuantusTierForDeepDiveModule(
  moduleIndex: number,
): QuantusTier {
  if (moduleIndex === 10) {
    return "INSTITUTIONAL";
  }

  if ([7, 8, 9, 11].includes(moduleIndex)) {
    return "UNLOCKED";
  }

  return "FREE";
}

export function hasRequiredQuantusTier(
  currentTier: string,
  requiredTier: string,
) {
  return (
    (QUANTUS_TIER_RANK[sanitizeQuantusUserTier(currentTier)] ?? 0) >=
    (QUANTUS_TIER_RANK[sanitizeQuantusUserTier(requiredTier)] ?? 0)
  );
}
