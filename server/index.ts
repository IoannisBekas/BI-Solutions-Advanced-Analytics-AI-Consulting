import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

function loadLocalEnvFiles() {
  const mode = process.env.NODE_ENV || "development";
  const protectedKeys = new Set(Object.keys(process.env));
  const envFilePaths = [
    ".env",
    ".env.local",
    `.env.${mode}`,
    `.env.${mode}.local`,
  ].map((file) => path.resolve(process.cwd(), file));

  for (const filePath of envFilePaths) {
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) {
        continue;
      }

      const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!match) {
        continue;
      }

      const [, key, rawValue] = match;
      if (protectedKeys.has(key)) {
        continue;
      }

      let value = rawValue.trim();
      const wrappedInQuotes =
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"));

      if (wrappedInQuotes) {
        value = value.slice(1, -1);
      } else {
        const commentIndex = value.indexOf(" #");
        if (commentIndex >= 0) {
          value = value.slice(0, commentIndex).trimEnd();
        }
      }

      process.env[key] = value
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t");
    }
  }
}

loadLocalEnvFiles();

const app = express();
const httpServer = createServer(app);
const isProduction = process.env.NODE_ENV === "production";

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: isProduction
      ? {
          useDefaults: true,
          directives: {
            "img-src": ["'self'", "data:", "https:"],
            "script-src": [
              "'self'",
              "'unsafe-inline'",
              "https://www.googletagmanager.com",
              "https://www.google-analytics.com",
            ],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
            "connect-src": [
              "'self'",
              "https://api.anthropic.com",
              "https://generativelanguage.googleapis.com",
              "https://www.google-analytics.com",
              "https://region1.google-analytics.com",
            ],
          },
        }
      : false,
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  express.json({
    limit: "2mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: "2mb" }));

// ─── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: isProduction && allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  }),
);

// ─── Rate Limiting ─────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many requests — try again later." },
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Rate limit reached — try again in a few minutes." },
});

app.use("/api/", globalLimiter);
app.use("/api/contact", strictLimiter);
app.use("/api/auth", strictLimiter);

// ─── JWT Secret warning ─────────────────────────────────────────────────────
if (isProduction && !process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET env var is not set — auth endpoints will fail until it is configured");
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    const isApiRequest =
      path.startsWith("/api") ||
      path.startsWith("/quantus/api") ||
      path.startsWith("/power-bi-solutions/api");

    if (isApiRequest) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error(err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port ${port}`);
    },
  );

  // ─── Graceful shutdown (Railway / Docker SIGTERM) ─────────────────────────
  function shutdown(signal: string) {
    log(`${signal} received — shutting down gracefully`, "shutdown");
    httpServer.close(() => {
      log("HTTP server closed", "shutdown");
      process.exit(0);
    });
    // Force exit after 10s if connections don't drain
    setTimeout(() => {
      log("Forced shutdown after timeout", "shutdown");
      process.exit(1);
    }, 10_000).unref();
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // ─── Crash safety — log & exit instead of silent death ────────────────────
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Promise rejection:", reason);
  });
  process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
    process.exit(1);
  });
})();
