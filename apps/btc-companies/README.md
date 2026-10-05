# Bitcoin Treasury Tracker

Hosted at [bisolutions.group/btc-companies/](https://www.bisolutions.group/btc-companies/), alongside the BNB and SOL trackers.

The initial matrix contains Strategy, Strive, Twenty One, Riot Platforms and CleanSpark. MARA appears under **Show excluded** with gross exposure and the attribution reason. All financial inputs and shares are June 30, 2026 filing snapshots. Source URLs, assumptions and dates appear in each company's drilldown and `js/data.js`.

## Model

Common Equity BTC Equivalent (CEBTC) describes treasury-only backing, including the USD-equivalent of net cash. It excludes operating assets, earnings, trade liabilities and leases; it does not value the entire business. A non-positive BTC treasury NAV does not establish company insolvency.

- Treasury value = disclosed BTC exposure × BTC/USD spot.
- Net senior claims = debt principal + preferred liquidation claims and declared unpaid dividends − unrestricted cash and cash equivalents.
- Equity NAV = treasury value − net senior claims.
- Common-equity BTC = max(equity NAV, 0) ÷ BTC price, rounded to eight decimal places.
- Senior claims % = 100 × max(net senior claims, 0) ÷ treasury value.
- EV mNAV = (basic economic market cap + net senior claims) ÷ treasury value.
- CEBTC mNAV = market cap ÷ positive equity NAV = 1 + (EV mNAV − 1) × leverage.
- Leverage = treasury value ÷ positive equity NAV.
- BTC per $1,000 = common-equity BTC × 1,000 ÷ market cap; the mNAV identity is approximate after satoshi rounding.
- Wipe-out BTC price = positive net senior claims ÷ BTC exposure, shown only in dynamic mode.

Preferred shares and debt are not assumed converted to common stock. Strategy shares are approximate because the filing reports them rounded to thousands. Twenty One's non-economic Class B shares are excluded. Pledged BTC and disclosed BTC collateral receivables are counted at full value, with counterparty and collateral risks noted. Fixed-ratio scenarios scale claims with BTC price; dynamic scenarios keep USD claims fixed. Stock market caps remain fixed while simulating BTC.

## Prices and publishing

The baseline BTC price is **$84,292.32**, the Coinbase BTC-USD one-minute candle ending at 4 pm ET on October 2, 2026. Spot streams from Coinbase with Coinbase REST, Kraken XBT/USD and CoinGecko fallbacks. Definitions render as native MathML without another dependency.

`data/market.json` supplies the latest completed USD stock closes from Unusual Whales when the optional repository secret `UW_API_KEY` is configured, otherwise Yahoo Finance. The root weekday **Update Treasury Market Data** workflow updates all three trackers independently. It does not update financial filings or share counts.

From the monorepo root:

```powershell
node apps/btc-companies/scripts/update-market-data.mjs
npm run build
```

The build copies only `index.html`, `css`, `js` and `data` to `dist/public/btc-companies`. Updater scripts and local environment files are not published. To preview, run `npm run dev` and open [localhost:5001/btc-companies/](http://localhost:5001/btc-companies/). Keep the trailing slash for relative assets.
