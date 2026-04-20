import { type Express, type NextFunction, type Response } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import express from "express";
import viteConfig from "../../vite.config";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

const viteLogger = createLogger();
const NAMED_MARKETING_ROUTES = new Set([
  "/Quantus",
  "/Power BI Solutions",
  "/Greek AI Professional Advisor",
  "/Website & App Portfolio",
]);

function decodePathname(pathname: string) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export async function setupVite(server: Server, app: Express) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  const clientTemplate = path.resolve(
    import.meta.dirname,
    "..",
    "client",
    "index.html",
  );

  const renderClientApp = async (
    url: string,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  };

  app.use((req, res, next) => {
    if (req.method !== "GET") {
      next();
      return;
    }

    if (!NAMED_MARKETING_ROUTES.has(decodePathname(req.path))) {
      next();
      return;
    }

    void renderClientApp(req.originalUrl, res, next);
  });

  app.use(vite.middlewares);

  // Serve pre-built product SPAs (Quantus, Power BI Solutions) in dev mode
  // These must be mounted BEFORE the Vite catch-all so they take precedence
  const distPath = path.resolve(import.meta.dirname, "..", "..", "dist", "public");
  app.use((req, res, next) => {
    if (req.method === "GET" && req.originalUrl === "/quantus/sectors") {
      res.redirect(308, "/quantus/workspace/sectors");
      return;
    }

    next();
  });

  const productDirs: [string, string][] = [
    [
      "/quantus/workspace",
      fs.existsSync(path.resolve(distPath, "quantus", "workspace"))
        ? path.resolve(distPath, "quantus", "workspace")
        : fs.existsSync(path.resolve(distPath, "quantus"))
          ? path.resolve(distPath, "quantus")
          : "",
    ],
    [
      "/power-bi-solutions/workspace",
      fs.existsSync(path.resolve(distPath, "power-bi-solutions", "workspace"))
        ? path.resolve(distPath, "power-bi-solutions", "workspace")
        : "",
    ],
  ];
  for (const [mount, dir] of productDirs) {
    if (dir && fs.existsSync(dir)) {
      app.use(mount, express.static(dir));
      app.use(`${mount}/*`, (_req, res, next) => {
        const indexPath = path.resolve(dir, "index.html");
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          next();
        }
      });
    }
  }

  app.use("*", (req, res, next) => {
    void renderClientApp(req.originalUrl, res, next);
  });
}
