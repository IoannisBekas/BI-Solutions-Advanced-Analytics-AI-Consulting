import { describe, expect, it } from "vitest";
import {
  QUANTUS_CALENDAR_ROUTE,
  QUANTUS_WORKSPACE_ROUTE,
  getQuantusReportRoute,
  normalizeQuantusPath,
  resolveWorkspaceRoute,
} from "./workspaceRoutes";

describe("workspaceRoutes", () => {
  it("normalizes legacy workspace paths", () => {
    expect(normalizeQuantusPath("/quantus")).toBe(QUANTUS_WORKSPACE_ROUTE);
    expect(normalizeQuantusPath("/quantus/workspace")).toBe(
      QUANTUS_WORKSPACE_ROUTE,
    );
  });

  it("normalizes legacy report URLs into workspace URLs", () => {
    expect(normalizeQuantusPath("/quantus/report/nvda")).toBe(
      getQuantusReportRoute("NVDA"),
    );
  });

  it("resolves report routes with normalized tickers", () => {
    expect(resolveWorkspaceRoute("/quantus/workspace/report/msft")).toEqual({
      view: "report",
      path: getQuantusReportRoute("MSFT"),
      ticker: "MSFT",
    });
  });

  it("preserves specialized workspace views", () => {
    expect(resolveWorkspaceRoute("/quantus/workspace/accuracy").view).toBe(
      "accuracy",
    );
    expect(resolveWorkspaceRoute(QUANTUS_CALENDAR_ROUTE)).toEqual({
      view: "calendar",
      path: QUANTUS_CALENDAR_ROUTE,
    });
  });
});
