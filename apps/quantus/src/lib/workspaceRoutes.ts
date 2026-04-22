export type RouteView =
  | "hero"
  | "report"
  | "sectors"
  | "watchlist"
  | "scanner"
  | "calendar"
  | "archive"
  | "accuracy"
  | "methodology"
  | "notFound";

export type DisplayView = RouteView | "generating";

export interface RouteState {
  view: RouteView;
  path: string;
  ticker?: string;
}

export type WorkspaceNavigationView = Exclude<RouteView, "report" | "notFound">;

export const QUANTUS_WORKSPACE_ROUTE = "/quantus/workspace/";
export const QUANTUS_REPORT_ROUTE_PREFIX = "/quantus/workspace/report";
export const QUANTUS_SECTORS_ROUTE = "/quantus/workspace/sectors";
export const QUANTUS_WATCHLIST_ROUTE = "/quantus/workspace/watchlist";
export const QUANTUS_SCANNER_ROUTE = "/quantus/workspace/scanner";
export const QUANTUS_CALENDAR_ROUTE = "/quantus/workspace/calendar";
export const QUANTUS_ARCHIVE_ROUTE = "/quantus/workspace/archive";
export const QUANTUS_ACCURACY_ROUTE = "/quantus/workspace/accuracy";
export const QUANTUS_METHODOLOGY_ROUTE = "/quantus/workspace/methodology";
export const QUANTUS_LEGACY_WORKSPACE_ROUTE = "/quantus";

const WORKSPACE_VIEW_ROUTES: Record<WorkspaceNavigationView, string> = {
  hero: QUANTUS_WORKSPACE_ROUTE,
  sectors: QUANTUS_SECTORS_ROUTE,
  watchlist: QUANTUS_WATCHLIST_ROUTE,
  scanner: QUANTUS_SCANNER_ROUTE,
  calendar: QUANTUS_CALENDAR_ROUTE,
  archive: QUANTUS_ARCHIVE_ROUTE,
  accuracy: QUANTUS_ACCURACY_ROUTE,
  methodology: QUANTUS_METHODOLOGY_ROUTE,
};

export function isWorkspaceNavigationView(
  value: string,
): value is WorkspaceNavigationView {
  return value in WORKSPACE_VIEW_ROUTES;
}

export function getWorkspaceRouteForView(view: WorkspaceNavigationView) {
  return WORKSPACE_VIEW_ROUTES[view];
}

export function getQuantusReportRoute(ticker: string) {
  return `${QUANTUS_REPORT_ROUTE_PREFIX}/${encodeURIComponent(
    ticker.trim().toUpperCase(),
  )}`;
}

export function normalizeQuantusPath(pathname: string) {
  const trimmed = pathname.replace(/\/+$/, "");

  if (
    trimmed === "" ||
    trimmed === QUANTUS_LEGACY_WORKSPACE_ROUTE ||
    trimmed === "/quantus/workspace"
  ) {
    return QUANTUS_WORKSPACE_ROUTE;
  }

  if (trimmed === QUANTUS_REPORT_ROUTE_PREFIX || trimmed === "/quantus/report") {
    return QUANTUS_WORKSPACE_ROUTE;
  }

  if (trimmed.startsWith("/quantus/report/")) {
    const reportTicker = decodeURIComponent(trimmed.slice("/quantus/report/".length))
      .trim()
      .toUpperCase();

    return reportTicker
      ? getQuantusReportRoute(reportTicker)
      : QUANTUS_WORKSPACE_ROUTE;
  }

  if (trimmed.startsWith(`${QUANTUS_REPORT_ROUTE_PREFIX}/`)) {
    const reportTicker = decodeURIComponent(
      trimmed.slice(`${QUANTUS_REPORT_ROUTE_PREFIX}/`.length),
    )
      .trim()
      .toUpperCase();

    return reportTicker
      ? getQuantusReportRoute(reportTicker)
      : QUANTUS_WORKSPACE_ROUTE;
  }

  if (trimmed === QUANTUS_SECTORS_ROUTE) return QUANTUS_SECTORS_ROUTE;
  if (trimmed === QUANTUS_WATCHLIST_ROUTE) return QUANTUS_WATCHLIST_ROUTE;
  if (trimmed === QUANTUS_SCANNER_ROUTE) return QUANTUS_SCANNER_ROUTE;
  if (trimmed === QUANTUS_CALENDAR_ROUTE) return QUANTUS_CALENDAR_ROUTE;
  if (trimmed === QUANTUS_ARCHIVE_ROUTE) return QUANTUS_ARCHIVE_ROUTE;
  if (trimmed === QUANTUS_ACCURACY_ROUTE) return QUANTUS_ACCURACY_ROUTE;
  if (trimmed === QUANTUS_METHODOLOGY_ROUTE) return QUANTUS_METHODOLOGY_ROUTE;

  return trimmed;
}

export function resolveWorkspaceRoute(pathname: string): RouteState {
  const normalized = normalizeQuantusPath(pathname);

  if (normalized === QUANTUS_WORKSPACE_ROUTE) {
    return { view: "hero", path: QUANTUS_WORKSPACE_ROUTE };
  }

  if (normalized === QUANTUS_SECTORS_ROUTE) {
    return { view: "sectors", path: QUANTUS_SECTORS_ROUTE };
  }

  if (normalized === QUANTUS_WATCHLIST_ROUTE) {
    return { view: "watchlist", path: QUANTUS_WATCHLIST_ROUTE };
  }

  if (normalized === QUANTUS_SCANNER_ROUTE) {
    return { view: "scanner", path: QUANTUS_SCANNER_ROUTE };
  }

  if (normalized === QUANTUS_CALENDAR_ROUTE) {
    return { view: "calendar", path: QUANTUS_CALENDAR_ROUTE };
  }

  if (normalized === QUANTUS_ARCHIVE_ROUTE) {
    return { view: "archive", path: QUANTUS_ARCHIVE_ROUTE };
  }

  if (normalized === QUANTUS_ACCURACY_ROUTE) {
    return { view: "accuracy", path: QUANTUS_ACCURACY_ROUTE };
  }

  if (normalized === QUANTUS_METHODOLOGY_ROUTE) {
    return { view: "methodology", path: QUANTUS_METHODOLOGY_ROUTE };
  }

  if (normalized.startsWith(`${QUANTUS_REPORT_ROUTE_PREFIX}/`)) {
    const ticker = decodeURIComponent(
      normalized.slice(`${QUANTUS_REPORT_ROUTE_PREFIX}/`.length),
    )
      .trim()
      .toUpperCase();

    if (ticker) {
      return { view: "report", path: getQuantusReportRoute(ticker), ticker };
    }
  }

  return { view: "notFound", path: normalized };
}
