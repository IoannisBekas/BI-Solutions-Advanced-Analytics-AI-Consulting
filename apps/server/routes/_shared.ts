import type { Request, Response } from "express";

export const DEFAULT_ANTHROPIC_VERSION = "2023-06-01";
export const DEFAULT_ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
export const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";

export function readEnv(key: string) {
  return (process.env[key] || "").trim();
}

export function getAnthropicModel() {
  return (
    process.env.ANTHROPIC_MODEL ||
    DEFAULT_ANTHROPIC_MODEL
  ).trim() || DEFAULT_ANTHROPIC_MODEL;
}

export function applyUpstreamHeaders(req: Request, res: Response, upstream: globalThis.Response) {
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

export function forwardRequestHeader(req: Request, headers: Headers, name: string) {
  const value = req.header(name);
  if (value) {
    headers.set(name, value);
  }
}

export function copyProxyResponseHeaders(res: Response, upstream: globalThis.Response) {
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
