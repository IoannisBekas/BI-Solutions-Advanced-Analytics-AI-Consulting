import type { Express, Request } from "express";
import {
  ANTHROPIC_MESSAGES_URL,
  DEFAULT_ANTHROPIC_VERSION,
  applyUpstreamHeaders,
  getAnthropicModel,
  readEnv,
} from "./_shared";

const POWERBI_SOLUTIONS_API_PREFIX = "/power-bi-solutions/api";

const POWERBI_PROXY_MAX_TOKENS = 2048;
const POWERBI_PROXY_MAX_MESSAGES = 12;
const POWERBI_PROXY_MAX_TEXT_CHARS = 8_000;
const POWERBI_PROXY_MAX_SYSTEM_CHARS = 12_000;
const POWERBI_PROXY_MAX_IMAGE_BLOCKS = 4;
const POWERBI_PROXY_MAX_IMAGE_BASE64_CHARS = 1_600_000;
const POWERBI_PROXY_ALLOWED_IMAGE_MEDIA_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

type PowerBiAnthropicMessage = {
  role: "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | {
            type: "image";
            source: {
              type: "base64";
              media_type: "image/png" | "image/jpeg" | "image/webp";
              data: string;
            };
          }
      >;
};

type PowerBiAnthropicContentBlock = Exclude<
  PowerBiAnthropicMessage["content"],
  string
>[number];

function getPowerBiAnthropicApiKey() {
  return (
    readEnv("POWERBI_SOLUTIONS_ANTHROPIC_API_KEY") ||
    readEnv("ANTHROPIC_API_KEY")
  );
}

function isPowerBiAnthropicProxyEnabled() {
  return process.env.NODE_ENV !== "production" || readEnv("POWERBI_SOLUTIONS_ENABLE_ANTHROPIC_PROXY") === "true";
}

function getTrustedBrowserOrigins() {
  const configuredOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  return [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
  ];
}

function readRequestOrigin(req: Request) {
  const originHeader = req.header("origin");
  if (originHeader) {
    return originHeader.trim();
  }

  const refererHeader = req.header("referer");
  if (!refererHeader) {
    return "";
  }

  try {
    return new URL(refererHeader).origin;
  } catch {
    return "";
  }
}

function isTrustedPowerBiOrigin(req: Request) {
  const requestOrigin = readRequestOrigin(req);
  return requestOrigin ? getTrustedBrowserOrigins().includes(requestOrigin) : false;
}

function sanitizePowerBiText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function sanitizePowerBiMessageContent(
  value: unknown,
): PowerBiAnthropicMessage["content"] | null {
  if (typeof value === "string") {
    const text = sanitizePowerBiText(value, POWERBI_PROXY_MAX_TEXT_CHARS);
    return text ? text : null;
  }

  if (!Array.isArray(value)) {
    return null;
  }

  let imageCount = 0;
  const blocks: PowerBiAnthropicContentBlock[] = [];

  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) {
      continue;
    }

    const type = (entry as { type?: unknown }).type;
    if (type === "text") {
      const text = sanitizePowerBiText((entry as { text?: unknown }).text, POWERBI_PROXY_MAX_TEXT_CHARS);
      if (text) {
        blocks.push({ type: "text", text });
      }
      continue;
    }

    if (type !== "image" || imageCount >= POWERBI_PROXY_MAX_IMAGE_BLOCKS) {
      continue;
    }

    const source = (entry as {
      source?: {
        type?: unknown;
        media_type?: unknown;
        data?: unknown;
      };
    }).source;

    if (
      !source
      || source.type !== "base64"
      || typeof source.data !== "string"
      || typeof source.media_type !== "string"
      || !POWERBI_PROXY_ALLOWED_IMAGE_MEDIA_TYPES.has(source.media_type)
    ) {
      continue;
    }

    const data = source.data.trim();
    if (!data || data.length > POWERBI_PROXY_MAX_IMAGE_BASE64_CHARS) {
      continue;
    }

    imageCount += 1;
    blocks.push({
      type: "image",
      source: {
        type: "base64",
        media_type: source.media_type as "image/png" | "image/jpeg" | "image/webp",
        data,
      },
    });
  }

  return blocks.length > 0 ? blocks : null;
}

function sanitizePowerBiMessages(value: unknown): PowerBiAnthropicMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > POWERBI_PROXY_MAX_MESSAGES) {
    return null;
  }

  const messages: PowerBiAnthropicMessage[] = [];

  for (const entry of value) {
    if (
      typeof entry !== "object" ||
      entry === null ||
      !["user", "assistant"].includes(String((entry as { role?: unknown }).role))
    ) {
      continue;
    }

    const content = sanitizePowerBiMessageContent((entry as { content?: unknown }).content);
    if (!content) {
      continue;
    }

    messages.push({
      role: (entry as { role: "user" | "assistant" }).role,
      content,
    });
  }

  return messages.length > 0 ? messages : null;
}

function buildPowerBiAnthropicPayload(body: Record<string, unknown> | undefined) {
  const messages = sanitizePowerBiMessages(body?.messages);
  if (!messages) {
    return null;
  }

  const maxTokensValue = Number(body?.max_tokens);
  const maxTokens = Number.isFinite(maxTokensValue)
    ? Math.min(Math.max(Math.trunc(maxTokensValue), 1), POWERBI_PROXY_MAX_TOKENS)
    : POWERBI_PROXY_MAX_TOKENS;

  const payload: Record<string, unknown> = {
    model: getAnthropicModel(),
    max_tokens: maxTokens,
    messages,
  };

  const system = sanitizePowerBiText(body?.system, POWERBI_PROXY_MAX_SYSTEM_CHARS);
  if (system) {
    payload.system = system;
  }

  const temperatureValue = Number(body?.temperature);
  if (Number.isFinite(temperatureValue)) {
    payload.temperature = Math.min(Math.max(temperatureValue, 0), 1);
  }

  return payload;
}

export function registerPowerBiProxyRoutes(app: Express) {
  app.get(`${POWERBI_SOLUTIONS_API_PREFIX}/health`, (_req, res) => {
    res.json({ ok: true, enabled: isPowerBiAnthropicProxyEnabled() });
  });

  app.post(`${POWERBI_SOLUTIONS_API_PREFIX}/anthropic/v1/messages`, async (req, res) => {
    if (!isPowerBiAnthropicProxyEnabled()) {
      res.status(503).json({
        message:
          "The preview Anthropic proxy is disabled until server-side access control is configured.",
      });
      return;
    }

    if (!isTrustedPowerBiOrigin(req)) {
      res.status(403).json({
        message:
          "The preview Anthropic proxy only accepts requests from trusted browser origins.",
      });
      return;
    }

    const apiKey = getPowerBiAnthropicApiKey();

    if (!apiKey) {
      res.status(500).json({
        message:
          "Anthropic API key is not configured on the BI Solutions server.",
      });
      return;
    }

    const payload = buildPowerBiAnthropicPayload(req.body as Record<string, unknown> | undefined);
    if (!payload) {
      res.status(400).json({
        message: "Invalid Anthropic request payload.",
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
        body: JSON.stringify(payload),
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
}
