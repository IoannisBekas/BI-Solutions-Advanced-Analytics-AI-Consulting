// CESE (Common Equity Solana Equivalent) Data Engine & Baseline Dataset
//
// All amounts are US dollars. Only balance-sheet inputs live here; senior claims,
// common equity SOL, EV / CESE mNAV, leverage, wipe-out price and status are all
// derived in app.js (calculateCompanyMetrics).
//
// Market cap = marketCapShares x sharePrice. marketCapShares is basic shares plus
// pre-funded (or deep in-the-money) warrants. sharePrice is the Nasdaq close on
// priceDate; data/market.json (refreshed daily by GitHub Actions) supplies newer closes.
// Every company lists the as-of dates and sources behind its figures.

// Coinbase SOL-USD at the 4:00 pm ET close on BASELINE_DATE
export const BASELINE_SOL_PRICE = 117.98;
export const BASELINE_DATE = '2026-09-30';

// SOL Strategies reports in Canadian dollars; converted at the June 30, 2026 rate (ECB via frankfurter.app)
const CAD_TO_USD_2026_06_30 = 0.70247;

export const CESE_COMPANIES = [
  {
    id: "skya",
    name: "SkyAI",
    ticker: "SKYA.US",
    symbol: "SKYA",
    exchange: "Nasdaq",
    totalSolHeld: 2003676,
    debtUsd: 0,
    preferredUsd: 0,
    cashUsd: 12100000,
    marketCapShares: 42982506 + 27934230, // common + pre-funded warrants, Jun 30, 2026
    sharePrice: 1.95,
    priceDate: '2026-09-30',
    asOf: { sol: '2026-06-30', balanceSheet: '2026-06-30', shares: '2026-06-30' },
    notes: [
      "509,650 of the SOL is locked until the end of 2028; it is counted at full value.",
      "Market cap includes 27,934,230 pre-funded warrants."
    ],
    sources: [
      { label: "10-Q, June 30, 2026", url: "https://www.sec.gov/Archives/edgar/data/0001737995/000149315226036513/form10-q.htm" },
      { label: "Q2 2026 results", url: "https://www.stocktitan.net/news/SKYA/sky-ai-reports-second-quarter-2026-financial-xylkoepyf3so.html" }
    ],
    takeaway: "Pure Unencumbered Exposure: no debt and about $12.1M of cash, so common shareholders own all 2,003,676 SOL plus the cash. Still the cheapest name in the set at 0.53x EV mNAV and the most capital-efficient at 1.52 SOL-equivalent per $100. A quarter of the SOL stays locked until the end of 2028.",
    profileUrl: "https://finance.yahoo.com/quote/SKYA"
  },
  {
    id: "dfdv",
    name: "DeFi Dev. Corp",
    ticker: "DFDV.US",
    symbol: "DFDV",
    exchange: "Nasdaq",
    // From the company dashboard API (refreshed daily by scripts/update-market-data.mjs)
    totalSolHeld: 2538010,
    debtUsd: 11470982 + 114581000 + 23000000, // Apr 2025 + Jul 2025 convertible notes + DeFi loan (notional)
    solDebt: 75000 + 487000, // SOL loans repayable in SOL, valued at the live SOL price
    preferredUsd: 15812500, // CHAD Series C preferred notional ($10 stated amount), Sep 20, 2026
    cashUsd: 9978000,
    marketCapShares: 32620790, // no pre-funded warrants outstanding; other warrants are out of the money
    sharePrice: 5.37,
    priceDate: '2026-09-30',
    asOf: { sol: '2026-09-28', balanceSheet: '2026-10-01', shares: '2026-08-31' },
    notes: [
      "562,000 SOL of loans are repayable in SOL, so they are valued at the current SOL price rather than at the company dashboard's borrowing-time notional.",
      "The DeFi loan is counted at its $23.0M notional, as in the company's own net debt.",
      "CHAD preferred is counted at its $10 stated amount, using the notional on the company dashboard.",
      "No pre-funded warrants remain; the other warrants (strikes $17.14 to $22.50) are out of the money."
    ],
    sources: [
      { label: "Company dashboard", url: "https://defidevcorp.com/dashboard" },
      { label: "10-Q, June 30, 2026", url: "https://www.sec.gov/Archives/edgar/data/0001805526/000180552626000055/dfdv-20260630.htm" },
      { label: "CHAD offering", url: "https://www.stocktitan.net/news/DFDV/de-fi-development-corp-launches-chad-the-first-sol-backed-digital-4cfrorlno8g8.html" }
    ],
    takeaway: "Preferred Stock Counts Too: DFDV's headline SOL per share counts all 2,538,010 SOL, but $126.1M of convertible notes, a $23.0M DeFi loan, 562,000 SOL of SOL loans and $15.8M of CHAD preferred rank ahead of common shareholders, matching 74% of the treasury. That puts it at 1.32x EV mNAV (the company's own dashboard shows 1.27x) and 3.83x leverage, with equity NAV reaching zero near $78 SOL.",
    profileUrl: "https://finance.yahoo.com/quote/DFDV"
  },
  {
    id: "fwdi",
    name: "Forward Ind.",
    ticker: "FWDI.US",
    symbol: "FWDI",
    exchange: "Nasdaq",
    totalSolHeld: 8160000,
    debtUsd: 105000000, // Galaxy Digital facility, Jun 30, 2026
    preferredUsd: 0,
    cashUsd: 10965165 + 20013000 + 25000000, // cash + other digital assets (USDC, 2Z, ONYC) Jun 30, 2026 + Sep 2026 offering
    marketCapShares: 73846883 + 3125000 + 12264601, // common Jun 30 + Sep offering + pre-funded warrants
    sharePrice: 7.80,
    priceDate: '2026-09-30',
    asOf: { sol: '2026-09-21', balanceSheet: '2026-06-30', shares: '2026-09-24' },
    notes: [
      "Market cap includes 12,264,601 pre-funded warrants and the 3,125,000 shares sold in the September offering, whose $25M proceeds are counted as cash.",
      "Cash includes $20.0M of other digital assets (USDC, 2Z and ONYC) at June 30 fair value, as in the company's own NAV.",
      "Debt is the Galaxy facility balance at June 30; any draws after that date are not included. The company's dashboard is updated from filings (SOL as of Aug 3), so the Sep 21 press release is used for SOL."
    ],
    sources: [
      { label: "Company SOL treasury page", url: "https://forwardindustries.com/sol-treasury" },
      { label: "Fiscal Q3 2026 results", url: "https://www.sec.gov/Archives/edgar/data/0000038264/000168316826006277/forward_ex9901.htm" },
      { label: "SOL holdings, Sep 21, 2026", url: "https://www.nasdaq.com/press-release/forward-industries-sol-holdings-rise-approximately-816-million-sol-2026-09-21" },
      { label: "Sep 2026 offering prospectus", url: "https://www.sec.gov/Archives/edgar/data/0000038264/000168316826007369/forward_424b5.htm" }
    ],
    takeaway: "Leverage vs. Liquidity: Leads the sector with about 8.16M SOL. Net senior claims match just 5% of the treasury (1.05x leverage), so the measures barely diverge: 0.77x EV mNAV and 0.76x CESE mNAV.",
    profileUrl: "https://finance.yahoo.com/quote/FWDI"
  },
  {
    id: "hsdt",
    name: "Solana Company",
    ticker: "HSDT.US",
    symbol: "HSDT",
    exchange: "Nasdaq",
    totalSolHeld: 2300000,
    debtUsd: 4207000, // derivative liability on puttable shares, Jun 30, 2026; no borrowings
    preferredUsd: 0,
    cashUsd: 2300000, // cash and stablecoins, Sep 24, 2026
    marketCapShares: 85000000, // ~57.4M common + ~27.6M in-the-money warrants (company NAV-per-share basis)
    sharePrice: 2.62,
    priceDate: '2026-09-30',
    asOf: { sol: '2026-09-24', balanceSheet: '2026-09-24', shares: '2026-09-30' },
    notes: [
      "No borrowings. The $4.2M derivative liability on puttable shares (June 30) is counted as a senior claim.",
      "Market cap uses about 85M shares including in-the-money warrants, matching the company's own NAV-per-share basis.",
      "Excludes the $15M offering that closed on Oct 1, 2026."
    ],
    sources: [
      { label: "10-Q, June 30, 2026", url: "https://www.sec.gov/Archives/edgar/data/1610853/000161085326000007/hsdt-20260630.htm" },
      { label: "Offering and NAV, Sep 2026", url: "https://www.sec.gov/Archives/edgar/data/0001610853/000161085326000008/sep2026rdopressreleaseex991.htm" }
    ],
    takeaway: "Pure-Play Treasury Vehicle: about 2.3M SOL with no borrowings, so gross, EV and CESE mNAV all sit near 0.83x. About 1.03 SOL-equivalent per $100.",
    profileUrl: "https://finance.yahoo.com/quote/HSDT"
  },
  {
    id: "upxi",
    name: "Upexi",
    ticker: "UPXI.US",
    symbol: "UPXI",
    exchange: "Nasdaq",
    totalSolHeld: 2340000,
    debtUsd: 149996123 + 57295723 + 16400000, // Jul 2025 convertible notes + BitGo facility + Jan 2026 secured note
    preferredUsd: 0,
    cashUsd: 5800000,
    marketCapShares: 78702358 + 6992300, // common + pre-funded warrants, Jun 30, 2026
    sharePrice: 1.14,
    priceDate: '2026-09-30',
    asOf: { sol: '2026-06-30', balanceSheet: '2026-06-30', shares: '2026-06-30' },
    notes: [
      "The $150.0M of notes convert at $4.25, far above the share price, so they are counted as debt.",
      "Debt: $150.0M convertible notes, $57.3M BitGo credit facility and $16.4M secured convertible note.",
      "Market cap includes 6,992,300 pre-funded warrants."
    ],
    sources: [
      { label: "10-K, fiscal 2026", url: "https://www.sec.gov/Archives/edgar/data/0001775194/000147793226005668/upxi_10k.htm" },
      { label: "Fiscal 2026 results", url: "https://www.globenewswire.com/news-release/2026/09/17/3364395/0/en/upexi-reports-financial-results-for-fiscal-year-ended-june-30-2026.html" }
    ],
    takeaway: "Leverage, Not Just Premium: about 2.34M SOL makes Upexi the cheapest name on gross mNAV (0.35x), but $223.7M of debt matches 79% of the treasury. Priced on the whole balance sheet it trades at a modest 1.14x EV premium; 4.75x leverage stretches that to 1.68x CESE mNAV, and equity NAV reaches zero near $93 SOL.",
    profileUrl: "https://finance.yahoo.com/quote/UPXI"
  },
  {
    id: "stke",
    name: "SOL Strategies",
    ticker: "STKE.US",
    symbol: "STKE",
    exchange: "Nasdaq",
    totalSolHeld: 459792, // owned SOL, excluding SOL delegated by clients
    debtUsd: 7550000 + 27500000 + 2500000 + Math.round(13898442 * CAD_TO_USD_2026_06_30), // convertible notes (USD principal) + Kamino facility
    preferredUsd: 0,
    cashUsd: Math.round(1866732 * CAD_TO_USD_2026_06_30),
    marketCapShares: 39241299,
    sharePrice: 1.63,
    priceDate: '2026-09-30',
    asOf: { sol: '2026-06-30', balanceSheet: '2026-06-30', shares: '2026-06-30' },
    notes: [
      "Reports in Canadian dollars. Convertible notes use their US-dollar principal; the Kamino loan and cash are converted at the June 30, 2026 rate (1 CAD = 0.70247 USD).",
      "Excludes about 3.4M SOL delegated by clients to its validators.",
      "Much of its value sits in validator and swap businesses that mNAV does not capture."
    ],
    sources: [
      { label: "Interim statements, June 30, 2026", url: "https://www.sec.gov/Archives/edgar/data/0001846839/000110465926097779/tm2622851d1_ex99-1.htm" },
      { label: "Fiscal Q3 2026 results", url: "https://www.nasdaq.com/press-release/sol-strategies-reports-fiscal-third-quarter-financial-results-2026-08-17" }
    ],
    takeaway: "High Creditor Encumbrance: senior claims match 85% of a 459,792 SOL treasury. At 2.03x EV mNAV it is the most expensive name before leverage; 6.58x leverage lifts its CESE mNAV to 7.76x, and equity NAV reaches zero near $100 SOL. Much of its value is in validator and swap businesses that mNAV does not measure.",
    profileUrl: "https://finance.yahoo.com/quote/STKE"
  }
];

export const EXCLUDED_ENTITIES = [
  {
    id: "glxy",
    name: "Galaxy Digital",
    ticker: "GLXY.US",
    symbol: "GLXY",
    exchange: "Nasdaq",
    statusType: "excluded",
    exclusionLabel: "Diversified",
    totalSolHeld: 775289, // CoinGecko treasury tracker; not broken out in Galaxy's filings
    marketCapShares: 390890000,
    sharePrice: 22.74,
    priceDate: '2026-09-30',
    sources: [
      { label: "10-Q, June 30, 2026", url: "https://www.sec.gov/Archives/edgar/data/0001859392/000185939226000091/glxy-20260630.htm" },
      { label: "CoinGecko treasury tracker", url: "https://www.coingecko.com/en/treasuries/companies/galaxy-digital-holdings-ltd" }
    ],
    takeaway: "Galaxy Digital holds about 775,289 SOL (per CoinGecko; its filings do not break out SOL), but as a diversified financial services firm with billions in complex assets and liabilities, a single-asset treasury deduction would misrepresent its capital structure.",
    profileUrl: "https://finance.yahoo.com/quote/GLXY"
  },
  {
    id: "ydkg",
    name: "Yueda Digital",
    ticker: "YDKG.US",
    symbol: "YDKG",
    exchange: "Nasdaq",
    statusType: "excluded",
    exclusionLabel: "No SOL held",
    totalSolHeld: 0,
    marketCapShares: 5529189, // after the 1-for-100 consolidation of Nov 2025
    sharePrice: 1.00,
    priceDate: '2026-09-30',
    sources: [
      { label: "Interim statements, June 30, 2026", url: "https://www.sec.gov/Archives/edgar/data/0001413745/000121390026095864/ea030373501ex99-1.htm" }
    ],
    takeaway: "Yueda announced 749,965 SOL in September 2025, but its June 30, 2026 statements show no SOL: $0.1M of cash, about $6K of stablecoins, and assets that are mostly refund receivables from mining suppliers. It stays out of the matrix until it reports SOL holdings again.",
    profileUrl: "https://finance.yahoo.com/quote/YDKG"
  }
];

export const METHODOLOGY_INFO = {
  title: "Common Equity Solana Equivalent (CESE) Framework",
  subtitle: "Stripping Away the Illusion of Gross Corporate Crypto Holdings",
  description: "Standard financial metrics calculate treasury exposure purely based on total tokens held. This artificially inflates shareholder exposure for heavily indebted corporations. CESE deducts debt and preferred stock (net of cash) to reveal the Solana-equivalent value left for common shareholders. Status labels use EV mNAV, which is not distorted by leverage. All figures are in US dollars.",
  formulas: [
    {
      name: "Net Senior Claims",
      math: "USD Debt + SOL Owed * SOL Price + Preferred Stock - Cash",
      meaning: "Everything that ranks ahead of common shareholders. Debt owed in SOL is valued at the SOL price. Negative means net cash, which adds to common equity."
    },
    {
      name: "Senior Claims %",
      math: "max(Net Senior Claims, 0) / (Total SOL Held * SOL Spot Price)",
      meaning: "The fraction of the company's Solana treasury matched by senior claims."
    },
    {
      name: "Common Equity SOL (CESE)",
      math: "Total SOL Held - (Net Senior Claims / SOL Price)",
      meaning: "The Solana-equivalent value that belongs to common shareholders after senior claims."
    },
    {
      name: "EV mNAV",
      math: "(Market Capitalization + Net Senior Claims) / (Total SOL Held * SOL Spot Price)",
      meaning: "What the whole capital structure pays per $1 of SOL. Sets the discount / premium status."
    },
    {
      name: "CESE mNAV",
      math: "Market Capitalization / (Common Equity SOL * SOL Spot Price) = 1 + (EV mNAV - 1) * Leverage",
      meaning: "Price paid per $1 of common equity value. Magnifies the EV premium or discount by leverage."
    },
    {
      name: "SOL per $100 Invested",
      math: "(Common Equity SOL * 100) / Market Capitalization = 100 / (CESE mNAV * SOL Spot Price)",
      meaning: "The Solana-equivalent value behind every $100 invested in the stock."
    },
    {
      name: "Leverage & Wipe-out Price",
      math: "Leverage = SOL Value / (SOL Value - Net Senior Claims); Wipe-out = (USD Debt + Preferred Stock - Cash) / (Total SOL Held - SOL Owed)",
      meaning: "How much harder equity value moves than SOL, and the SOL price at which it reaches zero."
    }
  ]
};
