# BNB CEBE Terminal — Corporate BNB Treasury Monitor

> **Live Dashboard & Common Equity BNB Equivalent (CEBE) Analytics for Public Companies**

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Deployable-success?style=flat&logo=github)](https://pages.github.com/)
[![BNB](https://img.shields.io/badge/BNB-Live%20Spot%20Feed-F0B90B?style=flat&logo=binance)](https://www.bnbchain.org)
[![WebSocket](https://img.shields.io/badge/Coinbase-BNB%2FUSD%20Live-0052FF?style=flat)]()

All figures on the dashboard are in **US dollars**.

Hosted on the BI Solutions Group website at [www.bisolutions.group/bnb-companies/](https://www.bisolutions.group/bnb-companies/). This app's source lives in `apps/bnb-companies` in the BI Solutions monorepo.

---

## ⚡ What is CEBE?

Standard corporate treasury metrics calculate cryptocurrency exposure purely based on **total gross tokens held**, which artificially inflates exposure per share if a company is heavily leveraged with debt.

**Common Equity BNB Equivalent (CEBE)** measures exactly what remains for **common shareholders** after subtracting all senior obligations (debt and preferred stock, net of cash). Net cash counts in shareholders' favor.

```
Net Senior Claims = Debt + Preferred Stock - Cash               (negative = net cash)

                        max(Net Senior Claims, 0)
Senior Claims %    = --------------------------------
                      Total BNB Held * BNB Price

Common Equity BNB  = Total BNB Held - Net Senior Claims / BNB Price

                      Market Cap + Net Senior Claims
EV mNAV            = --------------------------------          (sets the valuation status)
                      Total BNB Held * BNB Price

                            Market Cap
CEBE mNAV          = ----------------------------- = 1 + (EV mNAV - 1) * Leverage
                      Common Equity BNB * BNB Price

                              Total BNB Held * BNB Price
Leverage           = ---------------------------------------------
                      Total BNB Held * BNB Price - Net Senior Claims

                      Net Senior Claims
Wipe-out BNB Price = -------------------
                       Total BNB Held

                       Common Equity BNB * 1,000          1,000
BNB per $1,000 Stock = -------------------------- = -----------------
                       Market Capitalization        CEBE mNAV * Price
```

**Why the status uses EV mNAV:** CEBE mNAV is price-to-NAV for common shareholders, but leverage magnifies it. At 85% senior claims, a 15% premium on the whole balance sheet reads as a ~100% CEBE premium. Status labels therefore use EV mNAV (≤ 0.45x Deep Discount, < 1.0x Discount, ≤ 1.4x Modest Premium, > 1.4x Severe Premium), and leverage and wipe-out price show the balance-sheet risk separately. A company whose senior claims exceed its BNB treasury is marked **Underwater**.

**Why per $1,000:** at BNB prices in the hundreds of dollars, $100 of stock is backed by a fraction of a BNB. Per $1,000 keeps the figures readable. Buying BNB outright gets you 1,000 ÷ BNB price, so a stock above that line gives you more BNB-equivalent value than spot.

---

## 📊 CEBE Matrix (Oct 2, 2026 close, BNB at $766.30)

On the dashboard this matrix is a calculation ledger: each company's column (or card, on phones and tablets) shows every step from BNB held to wipe-out price, with no horizontal scrolling. Ordered by EV mNAV. Market caps use basic shares plus pre-funded warrants at the Oct 2, 2026 Nasdaq close; balance sheets come from the latest filings (each company's as-of dates and sources are in `js/data.js` and in its drilldown on the dashboard).

| Entity | Ticker | Total BNB Held | Senior Claims % | Common Equity BNB | EV mNAV | Status | CEBE mNAV | BNB per $1,000 | Leverage | Wipe-out BNB Price |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **BNB Standard** | `BNC.US` | 515,544 | **1.9%** | **505,751** | **0.80x** | Discount | 0.79x | **1.65 BNB** | 1.02x | $14.56 |
| **Nano Labs** | `NA.US` | 70,000 | **40.4%** | **41,730** | **1.30x** | Modest Premium | 1.50x | **0.87 BNB** | 1.68x | $309.47 |

*Buying BNB outright at $766.30 gets 1.30 BNB per $1,000.*

*Excluded: BNB Plus (`BNBX`, about 18,600 BNB) was delisted to the OTCQB in July 2026 and said on Oct 2 that it is leaving the pure treasury model; its convertible preferred can be redeemed for cash on events that include a delisting, so common equity can't be separated cleanly. Liminatus Pharma (`LIMN`) announced a BNB treasury of up to $500M in 2025, but its June 30, 2026 10-Q reports no digital assets. Both appear under "Show excluded" with gross figures only. Windtree Therapeutics (`WINT`) was delisted from Nasdaq in August 2025 and hasn't filed its 2025 annual report. The Brooker Group trades in Thailand in baht, holds BNB alongside BTC, ETH and SOL, and last disclosed holdings for June 30, 2025.*

---

## 🎯 Key Strategic Takeaways

1. **The Illusion of Gross Holdings (Nano Labs):**
   At **0.90x gross mNAV**, Nano Labs looks like it trades below its BNB. But **$31.8M of bank and USDT loans**, net of $10.1M of cash, match **40%** of its 70,000 BNB reserve. Priced on the whole balance sheet it trades at **1.30x EV mNAV**, and 1.68x leverage lifts that to **1.50x CEBE mNAV**. Equity NAV reaches zero near **$309 BNB**. Most of the debt is RMB bank loans secured by its plant and land, which mNAV doesn't count, and the reserve is shrinking: it held 103,357 BNB at June 30.
2. **A Discount on a Clean Balance Sheet (BNB Standard):**
   The former CEA Industries, renamed BNB Standard Corporation on Sep 29, 2026, holds the largest corporate treasury at **515,544 BNB**. Its $16.8M of debt is more than half covered by cash and stablecoins, so net claims match just **2%** of the treasury and gross (0.78x), EV (**0.80x**) and CEBE (0.79x) mNAV barely diverge. $1,000 of stock carries **1.65 BNB** of equity against 1.30 BNB bought outright.
3. **The Cost Below the Line (BNB Standard):**
   BNB Standard pays its external asset manager **1.4% of treasury assets a year** under a 20-year agreement, about **$5.5M or 7,200 BNB a year** at the Oct 2 price. Terminating early triggers liquidated damages of nearly 20 years of fees; the company sued in May 2026 to void the agreement. CEBE doesn't count this fee, but it compounds against shareholders every year.
4. **Commitments Are Not Holdings (Liminatus, Windtree, BNB Plus):**
   The 2025 announcements promised up to $500M (Liminatus) and up to $700M (Windtree) of BNB. Liminatus reports no digital assets; Windtree left Nasdaq and hasn't filed its 2025 annual report; BNB Plus built about 18,600 BNB and is now pivoting away. Of the US-listed companies tracked here, two still run a BNB treasury on Nasdaq.

---

## 🗂️ Data Sources & Daily Refresh

- **Balance sheets** (`js/data.js`): BNB holdings, debt, preferred stock, cash and share counts from each company's most current public source, all in US dollars. Each company records its as-of dates, sources and caveats; the dashboard shows them in the company drilldown. Update this file when new filings or holdings announcements come out.
- **No company feeds**: none of these companies publish a dated, machine-readable balance-sheet feed. BNB Standard's [treasury dashboard](https://www.ceaindustries.com/dashboard.html) reads a `metrics.txt` file that has BNB holdings and shares but no debt or as-of date, so figures come from filings and press releases.
- **Market caps**: `marketCapShares` (basic shares plus pre-funded warrants) × the latest close in `data/market.json`. The root `Update Treasury Market Data` workflow (`.github/workflows/update-treasury-market-data.yml`) refreshes both the BNB and SOL dashboards at 22:00 UTC every weekday, after the US close. It commits only the two dashboard snapshots and explicitly dispatches the root deployment workflow when they change.
- **Stock prices**: the official regular-session close from the [Unusual Whales API](https://api.unusualwhales.com/docs) daily candles when an optional `UW_API_KEY` repository secret is set (Settings → Secrets and variables → Actions), with Yahoo Finance as the fallback. Unusual Whales keeps a delisted stock's last exchange close, so when its close is more than a week old the script also asks Yahoo and keeps the newer one (this is how OTC-traded BNBX gets its price). For local runs, set `UW_API_KEY` in the process environment or in an untracked `apps/bnb-companies/.env.local` file. The key stays in the updater and is never copied to the published dashboard.
- **Currency**: only US-dollar quotes are accepted. Nano Labs reports in renminbi; its balances are converted at the June 30, 2026 rate used in its filing (US$1 = RMB 6.8109).

---

## 🚀 Deployment and Snapshot Updates

The root `npm run build` includes this dashboard at `dist/public/bnb-companies/`. The monorepo's `.github/workflows/deploy.yml` publishes the built website through GitHub Pages on pushes to `main` or `master`, and supports manual dispatch. The full production service serves the same dashboard at `/bnb-companies/`.

To refresh both treasury dashboards manually, open **Actions → Update Treasury Market Data → Run workflow**. Each app runs independently: missing quotes retain the previous values, and an app that cannot fetch any close reports a failure after any successful update from the other app has been saved and its deployment requested.

To refresh this app locally, run from the monorepo root with Node 22:

```powershell
node apps/bnb-companies/scripts/update-market-data.mjs
```

This writes `apps/bnb-companies/data/market.json` when the closes change. Rebuild to publish the refreshed snapshot. The updater uses Node's built-in APIs and requires no separate dependencies. Balance-sheet filings in `js/data.js` still need editorial updates when companies release new disclosures.

---

## 💻 Running Locally

Start the BI Solutions development server from the monorepo root:

```powershell
npm run dev
```

Then open [localhost:5001/bnb-companies/](http://localhost:5001/bnb-companies/). Keep the trailing slash so the dashboard's relative CSS, JavaScript, and market-data paths resolve correctly.

---

## 🔌 Live Architecture & Price Feeds

- **Primary WebSocket**: Coinbase BNB-USD ticker (`wss://ws-feed.exchange.coinbase.com`), quoted in US dollars (Binance's own BNBUSDT pair is quoted in Tether, so it isn't used). The page repaints at most once a second.
- **Failover REST APIs**: Coinbase Exchange (`/products/BNB-USD/stats`), Kraken (`/0/public/Ticker?pair=BNBUSD`), CoinGecko (`/api/v3/simple/price?ids=binancecoin&vs_currencies=usd`) and Coinbase (`/v2/prices/BNB-USD/spot`), all in US dollars.
- **Dynamic Balance Sheet Recalculation**: As the BNB spot price changes, the dashboard recalculates creditor claim ratios, common equity BNB balances, and real-time CEBE multiples.
- **Interactive Sandbox**: Drag the BNB price slider ($100 to $2,000) to simulate price breakouts and stress tests, or jump to the $1,370 all-time high (Oct 13, 2025). Market caps stay at the latest close, so scenarios show what happens if BNB moves and the stocks don't.
