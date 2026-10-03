// Fetches the latest completed Nasdaq close (USD) for every company in js/data.js, plus
// balance-sheet data from company dashboards that publish a machine-readable feed,
// and writes data/market.json, which the dashboard reads on load.
// Run daily after the US close by .github/workflows/update-market-data.yml.
//
// Closes come from Unusual Whales when UW_API_KEY is set (a GitHub Actions secret, or an
// untracked .env.local file for local runs), with Yahoo Finance as the fallback.
// The key is only used here, server-side; it never reaches the published page.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { CESE_COMPANIES, EXCLUDED_ENTITIES } from '../js/data.js';

const OUTPUT = new URL('../data/market.json', import.meta.url);
const HOSTS = ['query1.finance.yahoo.com', 'query2.finance.yahoo.com'];

const envBytes = await readFile(new URL('../.env.local', import.meta.url)).catch(() => null);
// PowerShell's `echo ... > file` writes UTF-16LE with a byte-order mark
const localEnv = !envBytes ? '' : envBytes[0] === 0xff && envBytes[1] === 0xfe ? envBytes.toString('utf16le') : envBytes.toString('utf8');
for (const line of localEnv.replace(/^﻿/, '').split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
}
const UW_API_KEY = process.env.UW_API_KEY;

const toNewYorkDate = (timestamp) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date(timestamp));

function isRegularSessionOpen(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
  }).formatToParts(now).map(p => [p.type, p.value]));
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  return !['Sat', 'Sun'].includes(parts.weekday) && minutes >= 9 * 60 + 30 && minutes < 16 * 60;
}

// Unusual Whales daily candles come one per session (pr, r, po); the regular-session ("r") close is the official close
async function fetchUwClose(symbol) {
  if (!UW_API_KEY) return null;
  try {
    const res = await fetch(`https://api.unusualwhales.com/api/stock/${symbol}/ohlc/1d?limit=10`, {
      headers: { Authorization: `Bearer ${UW_API_KEY}`, Accept: 'application/json' }
    });
    if (!res.ok) {
      console.warn(`Unusual Whales ${symbol}: HTTP ${res.status}`);
      return null;
    }
    const candles = (await res.json()).data ?? [];
    const today = toNewYorkDate(Date.now());
    const sessionOpen = isRegularSessionOpen();
    const latest = candles
      .filter(c => c.market_time === 'r' && parseFloat(c.close) > 0)
      // Today's regular candle is still forming until the 4:00 pm ET close
      .filter(c => !(sessionOpen && c.date === today))
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!latest) return null;
    return { close: Math.round(parseFloat(latest.close) * 10000) / 10000, date: latest.date, source: 'Unusual Whales' };
  } catch (e) {
    console.warn(`Unusual Whales ${symbol}: ${e.message}`);
    return null;
  }
}

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

// DeFi Development Corp's dashboard (defidevcorp.com/dashboard) reads these JSON endpoints
async function fetchDfdvFeed() {
  const base = 'https://defidevcorp.com/api/dashboard';
  const get = async (path) => {
    const body = await getJson(`${base}/${path}`);
    if (!body.success) throw new Error(`${path}: unsuccessful response`);
    return body.data;
  };
  const [sol, history, debt, chad, nav, shares, warrants] = await Promise.all(
    ['sol', 'history', 'debt', 'chad/notional', 'nav', 'shares', 'warrants'].map(get)
  );

  // The SOL count only changes on announcements; date it from when it last changed
  const days = [...history].sort((a, b) => b.date.localeCompare(a.date));
  let solAsOf = days[0]?.date ?? sol.date;
  for (const day of days) {
    if (day.total_sol_holdings !== sol.sol_count) break;
    solAsOf = day.date;
  }

  const latestShares = [...shares].sort((a, b) => b.date.localeCompare(a.date))[0];
  const prefunded = warrants.filter(w => w.exercise_price <= 0.01).reduce((sum, w) => sum + w.number_of_shares, 0);

  return {
    totalSolHeld: sol.sol_count,
    debtUsd: debt.filter(d => !d.sol_amount).reduce((sum, d) => sum + d.notional_amount, 0),
    solDebt: debt.reduce((sum, d) => sum + (d.sol_amount ?? 0), 0),
    preferredUsd: chad.notional_usd,
    cashUsd: nav.total_cash_including_eloc,
    marketCapShares: latestShares.shares_outstanding + prefunded,
    asOf: { sol: solAsOf, balanceSheet: sol.date, shares: latestShares.date }
  };
}

const COMPANY_FEEDS = { dfdv: fetchDfdvFeed };

// Reject a feed that looks broken rather than publishing it
function validateFeed(feed, baseline) {
  const nonNegative = ['debtUsd', 'solDebt', 'preferredUsd', 'cashUsd'].every(k => Number.isFinite(feed[k]) && feed[k] >= 0);
  const near = (value, reference) => Number.isFinite(value) && value >= reference * 0.5 && value <= reference * 2;
  return nonNegative
    && near(feed.totalSolHeld, baseline.totalSolHeld)
    && near(feed.marketCapShares, baseline.marketCapShares)
    && feed.solDebt < feed.totalSolHeld;
}

async function fetchClose(symbol) {
  for (const host of HOSTS) {
    try {
      const res = await fetch(`https://${host}/v8/finance/chart/${symbol}?range=5d&interval=1d`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (!res.ok) continue;
      const result = (await res.json()).chart?.result?.[0];
      // The dashboard is USD-only; never accept a quote in another currency
      if (!result || result.meta?.currency !== 'USD') continue;

      const timestamps = result.timestamp ?? [];
      const closes = result.indicators?.quote?.[0]?.close ?? [];
      const session = result.meta.currentTradingPeriod?.regular;
      const sessionOpen = session && Date.now() / 1000 >= session.start && Date.now() / 1000 < session.end;

      for (let i = timestamps.length - 1; i >= 0; i--) {
        if (closes[i] == null) continue;
        // Today's bar is still moving while the regular session is open
        if (sessionOpen && timestamps[i] >= session.start) continue;
        return {
          close: Math.round(closes[i] * 10000) / 10000,
          date: new Date(timestamps[i] * 1000).toISOString().slice(0, 10),
          source: 'Yahoo Finance'
        };
      }
    } catch (e) {
      // try the next host
    }
  }
  return null;
}

const previous = JSON.parse(await readFile(OUTPUT, 'utf8').catch(() => '{}'));
const quotes = { ...(previous.quotes ?? {}) };
const symbols = [...CESE_COMPANIES, ...EXCLUDED_ENTITIES].map(c => c.symbol);
let fetched = 0;

for (const symbol of symbols) {
  const quote = (await fetchUwClose(symbol)) ?? (await fetchClose(symbol));
  if (quote) {
    quotes[symbol] = quote;
    fetched++;
  } else {
    console.warn(`No USD close for ${symbol}; keeping the previous value`);
  }
}

if (fetched === 0) {
  console.error('No quotes fetched');
  process.exit(1);
}

const companies = { ...(previous.companies ?? {}) };
for (const [id, fetchFeed] of Object.entries(COMPANY_FEEDS)) {
  const baseline = CESE_COMPANIES.find(c => c.id === id);
  try {
    const feed = await fetchFeed();
    if (validateFeed(feed, baseline)) {
      companies[id] = feed;
    } else {
      console.warn(`Feed for ${id} failed validation; keeping the previous value`, feed);
    }
  } catch (e) {
    console.warn(`Feed for ${id} unavailable (${e.message}); keeping the previous value`);
  }
}

if (JSON.stringify({ quotes, companies }) === JSON.stringify({ quotes: previous.quotes, companies: previous.companies ?? {} })) {
  console.log('Closes and company feeds unchanged; data/market.json left as is');
} else {
  await mkdir(new URL('../data/', import.meta.url), { recursive: true });
  const quoteSources = [...new Set(Object.values(quotes).map(q => q.source ?? 'Yahoo Finance'))].join(', ');
  const market = {
    currency: 'USD',
    source: `Daily closes from ${quoteSources}; company dashboard feeds`,
    updatedAt: new Date().toISOString(),
    quotes,
    companies
  };
  await writeFile(OUTPUT, JSON.stringify(market, null, 2) + '\n');
  console.log(`Wrote ${fetched} of ${symbols.length} closes and ${Object.keys(companies).length} company feed(s) to data/market.json`);
}
