import type { Express } from "express";
import { Readable } from "stream";
import { copyProxyResponseHeaders, forwardRequestHeader } from "./_shared";

const QUANTUS_API_PREFIX = "/quantus/api";
const DEFAULT_QUANTUS_API_TARGET = "http://127.0.0.1:3001";

function getQuantusApiTarget() {
  return (
    process.env.QUANTUS_API_TARGET ||
    DEFAULT_QUANTUS_API_TARGET
  ).replace(/\/$/, "");
}

export function registerQuantusProxyRoute(app: Express) {
  app.all(`${QUANTUS_API_PREFIX}/*`, async (req, res) => {
    try {
      const upstreamUrl = new URL(req.originalUrl, `${getQuantusApiTarget()}/`);
      const headers = new Headers();

      forwardRequestHeader(req, headers, "accept");
      forwardRequestHeader(req, headers, "authorization");
      forwardRequestHeader(req, headers, "cache-control");
      forwardRequestHeader(req, headers, "content-type");
      forwardRequestHeader(req, headers, "cookie");
      forwardRequestHeader(req, headers, "last-event-id");

      const hasBody = req.method !== "GET" && req.method !== "HEAD";
      const body =
        hasBody && req.rawBody instanceof Buffer
          ? req.rawBody
          : hasBody && req.body
            ? JSON.stringify(req.body)
            : undefined;

      if (body && !headers.has("content-type")) {
        headers.set("content-type", "application/json");
      }

      const upstream = await fetch(upstreamUrl, {
        method: req.method,
        headers,
        body,
        signal: AbortSignal.timeout(180_000),
      });

      copyProxyResponseHeaders(res, upstream);
      res.status(upstream.status);

      if (!upstream.body) {
        res.end();
        return;
      }

      Readable.fromWeb(upstream.body as never).pipe(res);
    } catch (error) {
      console.error("Quantus API proxy failed:", error);
      const detail = error instanceof Error ? error.message : String(error);
      res.status(502).json({
        message:
          "Unable to reach the Quantus API target from the BI Solutions server.",
        detail,
        code: "quantus_api_proxy_unavailable",
      });
    }
  });
}
