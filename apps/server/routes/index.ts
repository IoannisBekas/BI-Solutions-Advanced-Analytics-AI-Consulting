import type { Express } from "express";
import type { Server } from "http";
import { authRouter, checkMonthlyReset } from "../auth";
import { registerQuantusPersistenceRoutes } from "../quantusRoutes";
import { registerBonusakiRoutes } from "./bonusaki";
import { registerContactRoute } from "./contact";
import { registerAiLearningRoutes } from "./aiLearning";
import { registerPowerBiProxyRoutes } from "./powerbi-proxy";
import { registerQuantusProxyRoute } from "./quantus-proxy";
import { registerProjectDepositRoutes } from "./projectDeposits";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Monthly reports reset (lazy, on first request per month)
  checkMonthlyReset();

  app.get("/api/health", (_req, res) => {
    checkMonthlyReset();
    res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
  });

  app.use("/api/auth", authRouter);
  registerQuantusPersistenceRoutes(app);

  registerContactRoute(app);
  registerProjectDepositRoutes(app);
  registerAiLearningRoutes(app);
  registerBonusakiRoutes(app);
  registerQuantusProxyRoute(app);
  registerPowerBiProxyRoutes(app);

  return httpServer;
}
