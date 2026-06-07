#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const QRCode = require("qrcode");

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      continue;
    }
    const key = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
    } else {
      args[key] = next;
      index += 1;
    }
  }
  return args;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeCsv(value) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function timestamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "Z");
}

function loadConfig(args) {
  if (!args.config) {
    throw new Error("Provide --config docs/bonusaki/sample-cafe-pilot.json");
  }

  const configPath = path.resolve(process.cwd(), args.config);
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const merchantSlug = slugify(args.merchantSlug || config.merchantSlug);
  const campaignSlug = slugify(args.campaignSlug || config.campaignSlug);
  const count = Number.parseInt(args.count || config.count || "0", 10);
  const baseUrl = String(args.baseUrl || config.baseUrl || "https://www.bisolutions.group/bonusaki/demo/");

  if (!merchantSlug) {
    throw new Error("merchantSlug is required.");
  }
  if (!campaignSlug) {
    throw new Error("campaignSlug is required.");
  }
  if (!Number.isInteger(count) || count < 1 || count > 5000) {
    throw new Error("count must be an integer from 1 to 5000.");
  }

  return {
    merchantName: args.merchantName || config.merchantName || merchantSlug,
    merchantSlug,
    campaignSlug,
    batchPrefix: slugify(args.batchPrefix || config.batchPrefix || merchantSlug).toUpperCase(),
    count,
    baseUrl,
    placement: args.placement || config.placement || "",
    notes: args.notes || config.notes || "",
    qrSecret: args.qrSecret || process.env.BONUSAKI_QR_SECRET || "",
  };
}

function buildUrl(baseUrl, params) {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

function signQrCode(merchantSlug, campaignSlug, code, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(`${merchantSlug}:${campaignSlug}:${code}`)
    .digest("hex")
    .slice(0, 16);
}

function buildPrintSheet(config, rows) {
  const cards = rows
    .map((row) => `
      <section class="card">
        <img src="${escapeHtml(row.filename)}" alt="Bonusaki QR ${escapeHtml(row.code)}" />
        <div>
          <strong>${escapeHtml(config.merchantName)}</strong>
          <span>Bonusaki ${escapeHtml(config.campaignSlug)}</span>
          <code>${escapeHtml(row.code)}</code>
        </div>
      </section>`)
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Bonusaki QR Batch - ${escapeHtml(config.merchantName)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
    h1 { font-size: 22px; margin: 0 0 8px; }
    p { margin: 0 0 20px; color: #555; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .card { border: 1px solid #222; border-radius: 8px; padding: 12px; display: flex; gap: 10px; align-items: center; page-break-inside: avoid; }
    img { width: 88px; height: 88px; }
    strong, span, code { display: block; }
    strong { font-size: 14px; }
    span { font-size: 12px; color: #555; margin-top: 3px; }
    code { margin-top: 8px; font-size: 12px; }
    @media print { body { margin: 10mm; } .grid { gap: 8px; } }
  </style>
</head>
<body>
  <h1>Bonusaki QR Batch - ${escapeHtml(config.merchantName)}</h1>
  <p>Campaign: ${escapeHtml(config.campaignSlug)}. Placement: ${escapeHtml(config.placement || "not specified")}.</p>
  <main class="grid">
    ${cards}
  </main>
</body>
</html>
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = loadConfig(args);
  const outDir = path.resolve(
    process.cwd(),
    args.out ||
      path.join(
        "output",
        "bonusaki-qr",
        `${config.merchantSlug}-${config.campaignSlug}-${timestamp()}`,
      ),
  );
  fs.mkdirSync(outDir, { recursive: true });

  const rows = [];
  for (let index = 1; index <= config.count; index += 1) {
    const sequence = String(index).padStart(4, "0");
    const code = `${config.batchPrefix}-${sequence}`;
    const filename = `${code}.svg`;
    const url = buildUrl(config.baseUrl, {
      merchant: config.merchantSlug,
      campaign: config.campaignSlug,
      qr: code,
      ...(config.qrSecret
        ? { verify: signQrCode(config.merchantSlug, config.campaignSlug, code, config.qrSecret) }
        : {}),
    });
    const svg = await QRCode.toString(url, {
      type: "svg",
      errorCorrectionLevel: "H",
      margin: 1,
    });
    fs.writeFileSync(path.join(outDir, filename), svg);
    rows.push({
      code,
      url,
      filename,
      merchantSlug: config.merchantSlug,
      campaignSlug: config.campaignSlug,
      placement: config.placement,
    });
  }

  const csvHeader = ["code", "url", "filename", "merchantSlug", "campaignSlug", "placement"];
  const csv = [
    csvHeader.join(","),
    ...rows.map((row) => csvHeader.map((key) => escapeCsv(row[key])).join(",")),
  ].join("\n");
  const { qrSecret: _qrSecret, ...safeConfig } = config;
  fs.writeFileSync(path.join(outDir, "manifest.csv"), `${csv}\n`);
  fs.writeFileSync(path.join(outDir, "config.json"), `${JSON.stringify(safeConfig, null, 2)}\n`);
  fs.writeFileSync(path.join(outDir, "index.html"), buildPrintSheet(config, rows));

  console.log(`Generated ${rows.length} Bonusaki QR codes.`);
  console.log(outDir);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
