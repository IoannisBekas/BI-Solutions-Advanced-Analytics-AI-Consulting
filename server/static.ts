import express, { type Express } from "express";
import fs from "fs";
import path from "path";

function redirectLegacyProductPath(app: Express, fromPath: string, toPath: string) {
  app.use((req, res, next) => {
    if (req.method === "GET" && req.originalUrl === fromPath) {
      res.redirect(308, toPath);
      return;
    }

    next();
  });
}

function serveProductSpa(app: Express, mountPath: string, productDistPath: string) {
  if (!fs.existsSync(productDistPath)) {
    return;
  }

  app.use(mountPath, express.static(productDistPath));
  app.use(`${mountPath}/*`, (_req, res) => {
    res.sendFile(path.resolve(productDistPath, "index.html"));
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  redirectLegacyProductPath(app, "/quantus/", "/quantus/workspace/");
  redirectLegacyProductPath(app, "/quantus/sectors", "/quantus/workspace/sectors");
  serveProductSpa(app, "/quantus/workspace", path.resolve(distPath, "quantus"));
  serveProductSpa(
    app,
    "/power-bi-solutions",
    path.resolve(distPath, "power-bi-solutions"),
  );

  app.use(express.static(distPath, { index: false, redirect: false }));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
