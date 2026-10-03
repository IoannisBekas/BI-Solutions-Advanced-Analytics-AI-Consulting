# SOL CESE Terminal — Corporate Solana Treasury Monitor

> **Live Dashboard & Common Equity Solana Equivalent (CESE) Analytics for Public Companies**

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Deployable-success?style=flat&logo=github)](https://pages.github.com/)
[![Solana](https://img.shields.io/badge/Solana-Live%20Spot%20Feed-9945FF?style=flat&logo=solana)](https://solana.com)
[![WebSocket](https://img.shields.io/badge/Coinbase-SOL%2FUSD%20Live-14F195?style=flat)]()

All figures on the dashboard are in **US dollars**.

Hosted on the BI Solutions Group website at [www.bisolutions.group/sol-companies/](https://www.bisolutions.group/sol-companies/). This app's source lives in `apps/sol-companies` in the BI Solutions monorepo.

---

## ⚡ What is CESE?

Standard corporate treasury metrics calculate cryptocurrency exposure purely based on **total gross tokens held**, which artificially inflates exposure per share if a company is heavily leveraged with debt.

**Common Equity Solana Equivalent (CESE)** measures exactly what remains for **common shareholders** after subtracting all senior obligations (debt and preferred stock, net of cash). Net cash counts in shareholders' favor.

```
Net Senior Claims = USD Debt + SOL Owed * SOL Price + Preferred Stock - Cash    (negative = net cash)

                        max(Net Senior Claims, 0)
Senior Claims %    = --------------------------------
                      Total SOL Held * SOL Price

Common Equity SOL  = Total SOL Held - Net Senior Claims / SOL Price

                      Market Cap + Net Senior Claims
EV mNAV            = --------------------------------          (sets the valuation status)
                      Total SOL Held * SOL Price

                            Market Cap
CESE mNAV          = ----------------------------- = 1 + (EV mNAV - 1) * Leverage
                      Common Equity SOL * SOL Price

                              Total SOL Held * SOL Price
Leverage           = ---------------------------------------------
                      Total SOL Held * SOL Price - Net Senior Claims

                      USD Debt + Preferred Stock - Cash
Wipe-out SOL Price = -----------------------------------      (debt owed in SOL moves with SOL, so it only
                      Total SOL Held - SOL Owed                reduces the SOL that covers dollar claims)

                      Common Equity SOL * 100          100
SOL per $100 Stock = ------------------------ = -----------------
                      Market Capitalization     CESE mNAV * Price
```

**Why the status uses EV mNAV:** CESE mNAV is price-to-NAV for common shareholders, but leverage magnifies it. At 85% senior claims, a 15% premium on the whole balance sheet reads as a ~100% CESE premium. Status labels therefore use EV mNAV (≤ 0.45x Deep Discount, < 1.0x Discount, ≤ 1.4x Modest Premium, > 1.4x Severe Premium), and leverage and wipe-out price show the balance-sheet risk separately. A company whose senior claims exceed its SOL treasury is marked **Underwater**.

---

## 📊 CESE Matrix (Sep 30, 2026 close, SOL at $117.98)

On the dashboard this matrix is a calculation ledger: each company's column (or card, on phones and tablets) shows every step from SOL held to wipe-out price, with no horizontal scrolling. Ordered by EV mNAV. Market caps use basic shares plus pre-funded warrants at the Sep 30, 2026 Nasdaq close; balance sheets come from the latest filings (each company's as-of dates and sources are in `js/data.js` and in its drilldown on the dashboard).

| Entity | Ticker | Total SOL Held | Senior Claims % | Common Equity SOL | EV mNAV | Status | CESE mNAV | SOL per $100 | Leverage | Wipe-out SOL Price |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **SkyAI** | `SKYA.US` | 2,003,676 | **Net cash** | **2,106,236** | **0.53x** | Discount | 0.56x | **1.52 SOL** | 0.95x | None |
| **Forward Ind.** | `FWDI.US` | 8,160,000 | **5.1%** | **7,744,490** | **0.77x** | Discount | 0.76x | **1.11 SOL** | 1.05x | $6.01 |
| **Solana Company** | `HSDT.US` | 2,300,000 | **0.7%** | **2,283,836** | **0.83x** | Discount | 0.83x | **1.03 SOL** | 1.01x | $0.83 |
| **Upexi** | `UPXI.US` | 2,340,000 | **78.9%** | **493,146** | **1.14x** | Modest Premium | 1.68x | **0.50 SOL** | 4.75x | $93.12 |
| **DeFi Dev. Corp** | `DFDV.US` | 2,538,010 | **73.9%** | **663,190** | **1.32x** | Modest Premium | 2.24x | **0.38 SOL** | 3.83x | $78.38 |
| **SOL Strategies** | `STKE.US` | 459,792 | **84.8%** | **69,879** | **2.03x** | Severe Premium | 7.76x | **0.11 SOL** | 6.58x | $100.05 |

*Excluded: Galaxy Digital (`GLXY.US`) is a diversified financial firm whose filings don't break out SOL, so a single-asset deduction would misrepresent its capital structure. Yueda Digital (`YDKG.US`) announced 749,965 SOL in 2025, but its June 30, 2026 statements show no SOL.*

---

## 🎯 Key Strategic Takeaways

1. **The Illusion of Gross Holdings (Upexi):**
   Upexi holds about 2.34M SOL and is the cheapest name on gross mNAV (0.35x), but **$223.7M of debt** matches **79% of the treasury**. Priced on the whole balance sheet it trades at a modest **1.14x EV mNAV**. With **4.75x leverage** that becomes a **1.68x CESE mNAV**, and equity NAV is wiped out if SOL falls to **~$93**, about 21% below the Sep 30 price.
2. **Preferred Stock Counts Too (DeFi Development Corp):**
   DFDV's headline SOL per share counts all **2,538,010 SOL**. Its CHAD preferred lifts that figure because no common shares are issued, but **$15.8M of CHAD** ranks ahead of common shareholders, alongside **$126.1M of convertible notes**, a $23.0M DeFi loan and **562,000 SOL of SOL loans**. Together they match **74% of the treasury**: **1.32x EV mNAV** (DFDV's own dashboard shows 1.27x, valuing the SOL loans at their borrowing-time notional), 3.83x leverage and a wipe-out price near $78.
3. **Pure Unencumbered Exposure (SkyAI):**
   SkyAI holds **2,003,676 SOL** with no debt and **$12.1M of cash**. Even with 27.9M pre-funded warrants in the market cap, it is the cheapest name at **0.53x EV mNAV** and the most capital-efficient at **1.52 SOL-equivalent per $100 invested**. A quarter of its SOL is locked until the end of 2028.
4. **Leverage vs. Liquidity (Forward Industries):**
   Forward Industries leads all public corporations with about **8.16M SOL**. Net senior claims match just **5%** of the treasury (**1.05x leverage**), so gross (0.72x), EV (**0.77x**) and CESE (0.76x) mNAV barely diverge, all at a discount.

---

## 🗂️ Data Sources & Daily Refresh

- **Balance sheets** (`js/data.js`): SOL holdings, debt, preferred stock, cash and share counts from each company's most current public source, all in US dollars. Each company records its as-of dates, sources and caveats; the dashboard shows them in the company drilldown. Update this file when new filings or holdings announcements come out.
- **Company dashboard feeds**: DeFi Development Corp publishes its treasury, debt, CHAD and share data as JSON for [its dashboard](https://defidevcorp.com/dashboard); the daily job pulls it into `data/market.json`, and the page uses it whenever it is newer than `js/data.js`. Feeds that fail sanity checks are ignored. The other companies don't publish a machine-readable feed (Forward's [SOL treasury page](https://forwardindustries.com/sol-treasury) is updated from filings and lags its press releases), so their figures come from filings and press releases.
- **Market caps**: `marketCapShares` (basic shares plus pre-funded warrants) × the latest Nasdaq close in `data/market.json`. The root `Update Treasury Market Data` workflow (`.github/workflows/update-treasury-market-data.yml`) refreshes both the BNB and SOL dashboards at 22:00 UTC every weekday, after the US close. It commits only the two dashboard snapshots and explicitly dispatches the root deployment workflow when they change.
- **Stock prices**: the official regular-session close from the [Unusual Whales API](https://api.unusualwhales.com/docs) daily candles when an optional `UW_API_KEY` repository secret is set (Settings → Secrets and variables → Actions), with Yahoo Finance as the fallback. For local runs, set `UW_API_KEY` in the process environment or in an untracked `apps/sol-companies/.env.local` file. The key stays in the updater and is never copied to the published dashboard.
- **Currency**: only US-dollar quotes are accepted. SOL Strategies reports in Canadian dollars; its convertible notes use their US-dollar principal and its other balances are converted at the June 30, 2026 rate.

---

## 🚀 Deployment and Snapshot Updates

The root `npm run build` includes this dashboard at `dist/public/sol-companies/`. The monorepo's `.github/workflows/deploy.yml` publishes the built website through GitHub Pages on pushes to `main` or `master`, and supports manual dispatch. The full production service serves the same dashboard at `/sol-companies/`.

To refresh both treasury dashboards manually, open **Actions → Update Treasury Market Data → Run workflow**. Each app runs independently: missing quotes retain the previous values, and an app that cannot fetch any close reports a failure after any successful update from the other app has been saved and its deployment requested. The SOL update also refreshes supported company dashboard feeds; unavailable or invalid company feeds retain their previous values.

To refresh this app locally, run from the monorepo root with Node 22:

```powershell
node apps/sol-companies/scripts/update-market-data.mjs
```

This writes `apps/sol-companies/data/market.json` when the closes or company feeds change. Rebuild to publish the refreshed snapshot. The updater uses Node's built-in APIs and requires no separate dependencies. Balance-sheet filings in `js/data.js` still need editorial updates when companies release new disclosures.

---

## 💻 Running Locally

Start the BI Solutions development server from the monorepo root:

```powershell
npm run dev
```

Then open [localhost:5001/sol-companies/](http://localhost:5001/sol-companies/). Keep the trailing slash so the dashboard's relative CSS, JavaScript, and market-data paths resolve correctly.

---

## 🔌 Live Architecture & Price Feeds

- **Primary WebSocket**: Coinbase SOL-USD ticker (`wss://ws-feed.exchange.coinbase.com`), quoted in US dollars. The page repaints at most once a second.
- **Failover REST APIs**: Coinbase Exchange (`/products/SOL-USD/stats`), CoinGecko (`/api/v3/simple/price?vs_currencies=usd`) and Coinbase (`/v2/prices/SOL-USD/spot`), all in US dollars.
- **Dynamic Balance Sheet Recalculation**: As SOL spot price changes, the dashboard recalculates creditor claim ratios, common equity SOL balances, and real-time CESE multiples.
- **Interactive Sandbox**: Drag the SOL price slider ($20 to $400) to simulate price breakouts and stress tests. Market caps stay at the latest close, so scenarios show what happens if SOL moves and the stocks don't.
