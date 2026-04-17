import type { Express } from "express";
import { Readable } from "stream";
import { copyProxyResponseHeaders, forwardRequestHeader } from "./_shared";

const QUANTUS_API_PREFIX = "/quantus/api";
const DEFAULT_QUANTUS_API_TARGET = "http://127.0.0.1:3001";

const PRIVATE_HOST_RE =
  /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.|::1$|fc|fd|fe80)/i;

function parseQuantusApiTarget() {
  const raw = (process.env.QUANTUS_API_TARGET || DEFAULT_QUANTUS_API_TARGET).replace(/\/$/, "");
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`QUANTUS_API_TARGET is not a valid URL: ${raw}`);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`QUANTUS_API_TARGET must be http(s): ${raw}`);
  }
  return { raw, parsed };
}

const quantusTargetCache = parseQuantusApiTarget();
const isSameOriginAsMain =
  quantusTargetCache.parsed.hostname === "127.0.0.1" ||
  quantusTargetCache.parsed.hostname === "localhost" ||
  PRIVATE_HOST_RE.test(quantusTargetCache.parsed.hostname);

// In production, refuse non-private targets unless QUANTUS_ALLOW_REMOTE is set.
if (
  process.env.NODE_ENV === "production" &&
  !isSameOriginAsMain &&
  process.env.QUANTUS_ALLOW_REMOTE !== "true"
) {
  throw new Error(
    `QUANTUS_API_TARGET must point at a loopback/private host in production (got ${quantusTargetCache.parsed.hostname}). Set QUANTUS_ALLOW_REMOTE=true to override.`,
  );
}

function getQuantusApiTarget() {
  return quantusTargetCache.raw;
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
      forwardRequestHeader(req, headers, "last-event-id");
      // Forward cookies only when the upstream is loopback/private to avoid
      // leaking session cookies to a remote host if env is misconfigured.
      if (isSameOriginAsMain) {
        forwardRequestHeader(req, headers, "cookie");
      }

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
      res.status(502).json({
        message:
          "Unable to reach the Quantus API target from the BI Solutions server.",
        code: "quantus_api_proxy_unavailable",
      });
    }
  });
}
