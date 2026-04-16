import type { AssetEntry, ReportResponse } from "../types";
import { getStoredReportCacheKey } from "./sessionArtifacts";

export const RECENT_ASSETS_STORAGE_KEY = "quantus-recent-assets";
export const PINNED_ASSETS_STORAGE_KEY = "quantus-pinned-assets";
const LEGACY_THEME_STORAGE_KEY = "quantus-theme";
const THEME_STORAGE_KEY = "quantus-theme-v2";

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function readStoredLightMode() {
  const storage = getStorage();
  if (!storage) {
    return true;
  }

  const storedTheme = storage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light") return true;
  if (storedTheme === "dark") return false;

  const legacyTheme = storage.getItem(LEGACY_THEME_STORAGE_KEY);
  if (legacyTheme === "light") return true;
  return true;
}

export function persistLightMode(lightMode: boolean) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  const value = lightMode ? "light" : "dark";
  storage.setItem(THEME_STORAGE_KEY, value);
  storage.setItem(LEGACY_THEME_STORAGE_KEY, value);
}

function isStoredReportResponse(value: unknown): value is ReportResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ReportResponse).ticker === "string" &&
    typeof (value as ReportResponse).source === "string" &&
    typeof (value as ReportResponse).message === "string" &&
    typeof (value as ReportResponse).detail === "string" &&
    typeof (value as ReportResponse).report === "object" &&
    (value as ReportResponse).report !== null
  );
}

export function readStoredReportResponse(
  ticker: string,
  userId?: string | null,
): ReportResponse | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(getStoredReportCacheKey(ticker, userId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isStoredReportResponse(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeStoredReportResponse(
  response: ReportResponse,
  userId?: string | null,
) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    if (response.source === "starter") return;
    storage.setItem(
      getStoredReportCacheKey(response.ticker, userId),
      JSON.stringify(response),
    );
  } catch {
    // Ignore storage quota and serialization issues.
  }
}

function isStoredAssetEntry(value: unknown): value is AssetEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as AssetEntry).ticker === "string" &&
    typeof (value as AssetEntry).name === "string" &&
    typeof (value as AssetEntry).exchange === "string" &&
    typeof (value as AssetEntry).assetClass === "string"
  );
}

export function readStoredAssets(key: string) {
  const storage = getStorage();
  if (!storage) {
    return [] as AssetEntry[];
  }

  try {
    const raw = storage.getItem(key);
    if (!raw) return [] as AssetEntry[];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isStoredAssetEntry) : [];
  } catch {
    return [] as AssetEntry[];
  }
}

export function writeStoredAssets(key: string, assets: AssetEntry[]) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(key, JSON.stringify(assets));
  } catch {
    // Ignore storage quota and serialization issues.
  }
}

export function upsertAsset(list: AssetEntry[], asset: AssetEntry, maxItems = 6) {
  return [asset, ...list.filter((entry) => entry.ticker !== asset.ticker)].slice(
    0,
    maxItems,
  );
}

export function buildAssetEntryFromReport(
  report: ReportResponse["report"],
  source: ReportResponse["source"],
): AssetEntry {
  return {
    ticker: report.ticker,
    name: report.company_name,
    exchange: report.exchange,
    assetClass: report.asset_class,
    sector: report.sector,
    hasCachedReport: source === "cached",
    cachedReportAge: report.cache_age,
    researcherCount: report.researcher_count,
    currentPrice: report.current_price,
    dayChange: report.day_change,
    dayChangePct: report.day_change_pct,
  };
}

export function buildAssetEntryFromWatchlistItem(item: {
  ticker: string;
  name: string;
  exchange?: string;
  assetClass: AssetEntry["assetClass"];
  sector?: string;
  currentPrice?: number;
  dayChange?: number;
  dayChangePct?: number;
  hasCachedReport?: boolean;
  cachedReportAge?: string;
  researcherCount?: number;
}): AssetEntry {
  return {
    ticker: item.ticker,
    name: item.name,
    exchange: item.exchange ?? "Workspace",
    assetClass: item.assetClass,
    sector: item.sector,
    currentPrice: item.currentPrice,
    dayChange: item.dayChange,
    dayChangePct: item.dayChangePct,
    hasCachedReport: item.hasCachedReport,
    cachedReportAge: item.cachedReportAge,
    researcherCount: item.researcherCount,
  };
}
