import express, { type Express } from "express";
import fs from "fs";
import path from "path";

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

  serveProductSpa(app, "/quantus", path.resolve(distPath, "quantus"));
  serveProductSpa(
    app,
    "/power-bi-solutions",
    path.resolve(distPath, "power-bi-solutions"),
  );

  app.use(express.static(distPath, { index: false }));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
