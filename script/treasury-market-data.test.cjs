const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");

const savedQuote = { close: 10, date: "2020-10-02", source: "Unusual Whales" };
const olderQuote = { close: 5, date: "2020-10-01" };
const sameDayCorrection = { close: 12, date: "2020-10-02" };
const newerQuote = { close: 13, date: "2020-10-05" };

function runUpdater(t, app, quotes, providerQuotes) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "treasury-market-test-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  for (const folder of ["scripts", "js", "data"]) {
    fs.mkdirSync(path.join(directory, folder));
  }
  const script = path.join(directory, "scripts", "update-market-data.mjs");
  fs.copyFileSync(path.join(__dirname, "..", "apps", app, "scripts", "update-market-data.mjs"), script);
  fs.writeFileSync(path.join(directory, "package.json"), '{"type":"module"}');
  const symbols = JSON.stringify(Object.keys(providerQuotes).map((symbol) => ({ symbol })));
  fs.writeFileSync(path.join(directory, "js", "data.js"), `
    export const CEBTC_COMPANIES = ${symbols};
    export const CEBE_COMPANIES = ${symbols};
    export const CESE_COMPANIES = ${symbols};
    export const EXCLUDED_ENTITIES = [];
  `);

  const snapshot = path.join(directory, "data", "market.json");
  const initialSnapshot = JSON.stringify({ quotes });
  fs.writeFileSync(snapshot, initialSnapshot);

  const preload = `
    const providerQuotes = ${JSON.stringify(providerQuotes)};
    globalThis.fetch = async (url) => {
      const symbol = new URL(url).pathname.split('/')[3];
      const quote = url.startsWith('https://api.unusualwhales.com/') && providerQuotes[symbol];
      if (!quote) return { ok: false, status: 503 };
      return {
        ok: true,
        json: async () => ({ data: [{ ...quote, market_time: 'r' }] }),
      };
    };
  `;
  const result = spawnSync(process.execPath, [`--import=data:text/javascript,${encodeURIComponent(preload)}`, script], {
    env: { ...process.env, UW_API_KEY: "mock-market-data-key" },
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr || String(result.error));
  return { initialSnapshot, updatedSnapshot: fs.readFileSync(snapshot, "utf8") };
}

for (const app of ["bnb-companies", "sol-companies", "btc-companies"]) {
  test(`${app} preserves a newer close and accepts corrections and new closes`, (t) => {
    const { updatedSnapshot } = runUpdater(t, app, {
      OLD: savedQuote,
      SAME: savedQuote,
      NEW: savedQuote,
    }, {
      OLD: olderQuote,
      SAME: sameDayCorrection,
      NEW: newerQuote,
      FIRST: newerQuote,
    });

    assert.deepEqual(JSON.parse(updatedSnapshot).quotes, {
      OLD: savedQuote,
      SAME: { ...sameDayCorrection, source: "Unusual Whales" },
      NEW: { ...newerQuote, source: "Unusual Whales" },
      FIRST: { ...newerQuote, source: "Unusual Whales" },
    });
  });

  test(`${app} leaves the snapshot untouched when the only close is older`, (t) => {
    const { initialSnapshot, updatedSnapshot } = runUpdater(t, app, { OLD: savedQuote }, { OLD: olderQuote });
    assert.equal(updatedSnapshot, initialSnapshot);
  });
}
