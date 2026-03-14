import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { Readable } from "stream";

const QUANTUS_API_PREFIX = "/quantus/api";
const POWERBI_SOLUTIONS_API_PREFIX = "/power-bi-solutions/api";
const DEFAULT_ANTHROPIC_VERSION = "2023-06-01";
const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_QUANTUS_API_TARGET = "http://127.0.0.1:3001";

function getAnthropicApiKey() {
  return (
    process.env.POWERBI_SOLUTIONS_ANTHROPIC_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    ""
  ).trim();
}

function getQuantusApiTarget() {
  return (
    process.env.QUANTUS_API_TARGET ||
    DEFAULT_QUANTUS_API_TARGET
  ).replace(/\/$/, "");
}

function applyUpstreamHeaders(req: Request, res: Response, upstream: globalThis.Response) {
  const contentType = upstream.headers.get("content-type");
  if (contentType) {
    res.setHeader("content-type", contentType);
  }

  const requestId = upstream.headers.get("request-id");
  if (requestId) {
    res.setHeader("request-id", requestId);
  }

  const retryAfter = upstream.headers.get("retry-after");
  if (retryAfter) {
    res.setHeader("retry-after", retryAfter);
  }

  const anthropicVersion =
    req.header("anthropic-version") || DEFAULT_ANTHROPIC_VERSION;
  res.setHeader("anthropic-version", anthropicVersion);
}

function forwardRequestHeader(req: Request, headers: Headers, name: string) {
  const value = req.header(name);
  if (value) {
    headers.set(name, value);
  }
}

function copyProxyResponseHeaders(res: Response, upstream: globalThis.Response) {
  const blockedHeaders = new Set([
    "connection",
    "content-length",
    "keep-alive",
    "transfer-encoding",
  ]);

  upstream.headers.forEach((value, key) => {
    if (!blockedHeaders.has(key)) {
      res.setHeader(key, value);
    }
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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
      res.status(502).json({
        message:
          "Unable to reach the Quantus API target from the BI Solutions server.",
      });
    }
  });

  app.get(`${POWERBI_SOLUTIONS_API_PREFIX}/health`, (_req, res) => {
    res.json({ ok: true });
  });

  app.post(`${POWERBI_SOLUTIONS_API_PREFIX}/anthropic/v1/messages`, async (req, res) => {
    const apiKey = getAnthropicApiKey();

    if (!apiKey) {
      res.status(500).json({
        message:
          "Anthropic API key is not configured on the BI Solutions server.",
      });
      return;
    }

    try {
      const anthropicVersion =
        req.header("anthropic-version") || DEFAULT_ANTHROPIC_VERSION;

      const headers = new Headers({
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": anthropicVersion,
      });

      const betaHeader = req.header("anthropic-beta");
      if (betaHeader) {
        headers.set("anthropic-beta", betaHeader);
      }

      const upstream = await fetch(ANTHROPIC_MESSAGES_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(req.body),
        signal: AbortSignal.timeout(30_000),
      });

      const responseText = await upstream.text();
      applyUpstreamHeaders(req, res, upstream);
      res.status(upstream.status).send(responseText);
    } catch (error) {
      console.error("Power BI Solutions Anthropic proxy failed:", error);
      res.status(502).json({
        message:
          "Unable to reach Anthropic from the BI Solutions server. Please try again.",
      });
    }
  });

  return httpServer;
}
