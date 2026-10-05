// Fetches the latest completed US close (USD) for every company in js/data.js and writes
// data/market.json, which the dashboard reads on load.
// Run daily after the US close by .github/workflows/update-treasury-market-data.yml.
//
// Closes come from Unusual Whales when UW_API_KEY is set (a GitHub Actions secret, or an
// untracked .env.local file for local runs), with Yahoo Finance as the fallback. Unusual Whales
// only covers exchange-listed shares; Yahoo is the fallback when a current USD close is unavailable.
// The key is only used here, server-side; it never reaches the published page.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { CEBTC_COMPANIES, EXCLUDED_ENTITIES } from '../js/data.js';

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
const symbols = [...CEBTC_COMPANIES, ...EXCLUDED_ENTITIES].map(c => c.symbol);
// A close older than this means the listing moved (Unusual Whales keeps the last exchange close of a delisted stock)
const staleBefore = toNewYorkDate(Date.now() - 7 * 24 * 60 * 60 * 1000);
let fetched = 0;

for (const symbol of symbols) {
  const uwQuote = await fetchUwClose(symbol);
  const yahooQuote = !uwQuote || uwQuote.date < staleBefore ? await fetchClose(symbol) : null;
  const quote = [uwQuote, yahooQuote].filter(Boolean).sort((a, b) => b.date.localeCompare(a.date))[0];
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

if (JSON.stringify(quotes) === JSON.stringify(previous.quotes)) {
  console.log('Closes unchanged; data/market.json left as is');
} else {
  await mkdir(new URL('../data/', import.meta.url), { recursive: true });
  const quoteSources = [...new Set(Object.values(quotes).map(q => q.source ?? 'Yahoo Finance'))].join(', ');
  const market = {
    currency: 'USD',
    source: `Daily closes from ${quoteSources}`,
    updatedAt: new Date().toISOString(),
    quotes
  };
  await writeFile(OUTPUT, JSON.stringify(market, null, 2) + '\n');
  console.log(`Wrote ${fetched} of ${symbols.length} closes to data/market.json`);
}
