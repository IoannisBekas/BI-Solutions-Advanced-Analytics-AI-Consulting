// CEBE (Common Equity BNB Equivalent) Data Engine & Baseline Dataset
//
// All amounts are US dollars. Only balance-sheet inputs live here; senior claims,
// common equity BNB, EV / CEBE mNAV, leverage, wipe-out price and status are all
// derived in app.js (calculateCompanyMetrics).
//
// Market cap = marketCapShares x sharePrice. marketCapShares is basic shares plus
// pre-funded (or nominal-strike) warrants. sharePrice is the US close on priceDate;
// data/market.json (refreshed daily by GitHub Actions) supplies newer closes.
// Every company lists the as-of dates and sources behind its figures.

// Coinbase BNB-USD at the 4:00 pm ET close on BASELINE_DATE
export const BASELINE_BNB_PRICE = 766.30;
export const BASELINE_DATE = '2026-10-02';

// Nano Labs reports in renminbi; converted at the June 30, 2026 PBOC central parity rate used in its filing
const RMB_PER_USD_2026_06_30 = 6.8109;

export const CEBE_COMPANIES = [
  {
    id: "bnc",
    name: "BNB Standard",
    ticker: "BNC.US",
    symbol: "BNC",
    exchange: "Nasdaq",
    totalBnbHeld: 515544, // 471,346 unrestricted + 44,198 pledged as loan collateral, Jul 31, 2026
    debtUsd: 15000000 + 1798000, // USDC master loan facility + related-party notes from the Fat Panda acquisition
    preferredUsd: 0,
    cashUsd: 7084000 + 1691000 + 519000, // cash and USDC + 27 BTC + 519,520 USDT, Jul 31, 2026 fair value
    marketCapShares: 41173850 + 7750510 + 3564362, // common Sep 4, 2026 + pre-funded + strategic advisor warrants ($0.00001)
    sharePrice: 5.85,
    priceDate: '2026-10-02',
    asOf: { bnb: '2026-07-31', balanceSheet: '2026-07-31', shares: '2026-09-04' },
    notes: [
      "Formerly CEA Industries; renamed BNB Standard Corporation on Sep 29, 2026. Still trades as BNC.",
      "44,198 of the BNB is pledged as collateral for the $15.0M USDC loan; it is counted at full value.",
      "Market cap includes 7,750,510 pre-funded warrants and 3,564,362 strategic advisor warrants, both exercisable at $0.00001.",
      "Cash includes 27 BTC ($1.7M) and 519,520 USDT at July 31 fair value.",
      "Not counted: 49.5M stapled warrants at $15.15 (out of the money), and the 1.4% annual fee under the Asset Management Agreement, whose 20-year liquidated-damages clause the company is contesting in court."
    ],
    sources: [
      { label: "10-Q, July 31, 2026", url: "https://www.sec.gov/Archives/edgar/data/1482541/000148254126000051/bncww-20260731.htm" },
      { label: "Q1 fiscal 2027 results", url: "https://www.sec.gov/Archives/edgar/data/1482541/000148254126000053/bnc-2026x09x11xpr.htm" },
      { label: "Name change, Sep 29, 2026", url: "https://www.sec.gov/Archives/edgar/data/1482541/000148254126000056/bnc-2026x10x02xpr.htm" },
      { label: "Company treasury dashboard", url: "https://www.ceaindustries.com/dashboard.html" }
    ],
    takeaway: "The Clean Balance Sheet: 515,544 BNB against just $16.8M of debt, over half of it offset by $9.3M of cash and stablecoins, so net senior claims match about 2% of the treasury. Gross, EV and CEBE mNAV all sit near 0.79x, a discount of about a fifth. The cost that doesn't show up here is the Asset Management Agreement: 1.4% of treasury assets a year, roughly $5.5M or 7,200 BNB at today's prices.",
    profileUrl: "https://finance.yahoo.com/quote/BNC"
  },
  {
    id: "na",
    name: "Nano Labs",
    ticker: "NA.US",
    symbol: "NA",
    exchange: "Nasdaq",
    totalBnbHeld: 70000, // long-term reserve, Aug 28, 2026 (103,357 BNB at Jun 30, 2026)
    // RMB bank loans after the Jul-Sep 2026 repayments and draws, plus a 2,600,000 USDT loan
    debtUsd: Math.round((15000000 + 182629625 + 1100000) / RMB_PER_USD_2026_06_30) + 2600000,
    preferredUsd: 0,
    cashUsd: Math.round(8957513 / RMB_PER_USD_2026_06_30) + 8800000, // bank cash Jun 30 + USDT Sep 14, 2026
    marketCapShares: 19147732 - 183997 + 2858909, // Class A Jun 30 less buybacks to Sep 15 + Class B
    sharePrice: 2.20,
    priceDate: '2026-10-02',
    asOf: { bnb: '2026-08-28', balanceSheet: '2026-06-30', shares: '2026-09-15' },
    notes: [
      "Reports in renminbi; converted at the June 30, 2026 rate (US$1 = RMB 6.8109).",
      "BNB is the 70,000 long-term reserve reported on Aug 28. The company held 103,357 BNB at June 30 and reported nearly $54.0M of BNB on Sep 14 (about 75,000 BNB at that day's price), so a few thousand BNB may sit outside the reserve.",
      "Debt is mostly RMB bank loans secured by the company's plant and land (PP&E of $26.0M at June 30, which mNAV does not count), plus a 2.6M USDT loan. Balances are rolled forward for loans repaid and drawn through Sep 15.",
      "Cash is $1.3M of bank cash at June 30 plus $8.8M of USDT at Sep 14.",
      "Not counted: BNB decumulator contracts that commit the company to sell BNB at set prices over 12 months, and warrants at $10.00 (out of the money)."
    ],
    sources: [
      { label: "H1 2026 financial statements", url: "https://www.sec.gov/Archives/edgar/data/1872302/000121390026099913/ea030092401ex99-1.htm" },
      { label: "H1 2026 MD&A", url: "https://www.sec.gov/Archives/edgar/data/1872302/000121390026099913/ea030092401ex99-2.htm" },
      { label: "H1 2026 results", url: "https://www.sec.gov/Archives/edgar/data/1872302/000121390026095026/ea029780001ex99-1.htm" }
    ],
    takeaway: "The Illusion of Gross Holdings: at 0.90x gross mNAV Nano Labs looks cheap, but about $31.8M of bank and USDT loans, net of $10.1M of cash, match 40% of its 70,000 BNB. Priced on the whole balance sheet it trades at 1.30x EV mNAV, and 1.68x leverage lifts that to 1.50x CEBE mNAV. Equity NAV reaches zero near $309 BNB. The treasury is also shrinking: it held 103,357 BNB at June 30.",
    profileUrl: "https://finance.yahoo.com/quote/NA"
  }
];

export const EXCLUDED_ENTITIES = [
  {
    id: "bnbx",
    name: "BNB Plus",
    ticker: "BNBX.US",
    symbol: "BNBX",
    exchange: "OTCQB",
    statusType: "excluded",
    exclusionLabel: "OTC, leaving treasury model",
    // 2,186 held + 6,077 lent under call options + 435,638 Osprey BNB Chain Trust units at 0.023796 BNB each, Jun 30, 2026
    totalBnbHeld: 2186 + 6077 + Math.round(435638 * 0.023796),
    marketCapShares: 6197223 + 4082795 + 1706278 + 2303620, // common + Series B-1 and B-2 preferred as converted (1:1)
    sharePrice: 0.1301,
    priceDate: '2026-10-02',
    notes: [
      "BNB counts 2,186 BNB held directly, 6,077 BNB lent to a custodian under call-option arrangements, and about 10,366 BNB inside 435,638 Osprey BNB Chain Trust units (0.023796 BNB per unit, Sep 8, 2026).",
      "Market cap counts the Series B-1 and B-2 preferred, including B-2 pre-funded warrants, as converted 1:1 into common. Any October 2025 pre-funded warrants still outstanding are not included.",
      "Trades on the OTCQB, so its close comes from Yahoo Finance."
    ],
    sources: [
      { label: "10-Q, June 30, 2026", url: "https://www.sec.gov/Archives/edgar/data/0000744452/000110465926095910/tmb-20260630x10q.htm" },
      { label: "Nasdaq delisting, Jul 10, 2026", url: "https://www.sec.gov/Archives/edgar/data/744452/000110465926082893/tm2620287d1_ex99-1.htm" },
      { label: "Strategy shift, Oct 2, 2026", url: "https://www.sec.gov/Archives/edgar/data/744452/000110465926113043/tm2626879d2_ex99-1.htm" }
    ],
    takeaway: "BNB Plus (formerly Applied DNA Sciences) held about 18,600 BNB at June 30, counting 6,077 BNB lent out under call options and the BNB inside its Osprey BNB Chain Trust units. Nasdaq delisted it on July 14, 2026 for its sub-$1 share price, and on October 2 it said it will move away from a pure treasury model. Its convertible Series B preferred can be redeemed for cash on events that include a delisting, and the filings don't give the amounts needed to separate that claim from common equity.",
    profileUrl: "https://finance.yahoo.com/quote/BNBX"
  },
  {
    id: "limn",
    name: "Liminatus Pharma",
    ticker: "LIMN.US",
    symbol: "LIMN",
    exchange: "Nasdaq",
    statusType: "excluded",
    exclusionLabel: "No BNB held",
    totalBnbHeld: 0,
    marketCapShares: 1343208, // after the 1-for-50 reverse split of Aug 20, 2026
    sharePrice: 3.90,
    priceDate: '2026-10-02',
    sources: [
      { label: "10-Q, June 30, 2026", url: "https://www.sec.gov/Archives/edgar/data/1971387/000110465926097304/limn-20260630x10q.htm" },
      { label: "Reverse split, Aug 2026", url: "https://www.sec.gov/Archives/edgar/data/1971387/000110465926098335/tm2623497d1_8k.htm" }
    ],
    takeaway: "Liminatus announced a BNB treasury of up to $500M through its American BNB Strategy subsidiary in July 2025, but its June 30, 2026 10-Q reports no digital assets. It stays out of the matrix until it reports BNB holdings.",
    profileUrl: "https://finance.yahoo.com/quote/LIMN"
  }
];

export const METHODOLOGY_INFO = {
  title: "Common Equity BNB Equivalent (CEBE) Framework",
  subtitle: "Stripping Away the Illusion of Gross Corporate Crypto Holdings",
  description: "Standard financial metrics calculate treasury exposure purely based on total tokens held. This artificially inflates shareholder exposure for heavily indebted corporations. CEBE deducts debt and preferred stock (net of cash) to reveal the BNB-equivalent value left for common shareholders. Status labels use EV mNAV, which is not distorted by leverage. All figures are in US dollars.",
  formulas: [
    {
      name: "Net Senior Claims",
      math: "Debt + Preferred Stock - Cash",
      meaning: "Everything that ranks ahead of common shareholders. Negative means net cash, which adds to common equity."
    },
    {
      name: "Senior Claims %",
      math: "max(Net Senior Claims, 0) / (Total BNB Held * BNB Spot Price)",
      meaning: "The fraction of the company's BNB treasury matched by senior claims."
    },
    {
      name: "Common Equity BNB (CEBE)",
      math: "Total BNB Held - (Net Senior Claims / BNB Price)",
      meaning: "The BNB-equivalent value that belongs to common shareholders after senior claims."
    },
    {
      name: "EV mNAV",
      math: "(Market Capitalization + Net Senior Claims) / (Total BNB Held * BNB Spot Price)",
      meaning: "What the whole capital structure pays per $1 of BNB. Sets the discount / premium status."
    },
    {
      name: "CEBE mNAV",
      math: "Market Capitalization / (Common Equity BNB * BNB Spot Price) = 1 + (EV mNAV - 1) * Leverage",
      meaning: "Price paid per $1 of common equity value. Magnifies the EV premium or discount by leverage."
    },
    {
      name: "BNB per $1,000 Invested",
      math: "(Common Equity BNB * 1000) / Market Capitalization = 1000 / (CEBE mNAV * BNB Spot Price)",
      meaning: "The BNB-equivalent value behind every $1,000 invested in the stock."
    },
    {
      name: "Leverage & Wipe-out Price",
      math: "Leverage = BNB Value / (BNB Value - Net Senior Claims); Wipe-out = Net Senior Claims / Total BNB Held",
      meaning: "How much harder equity value moves than BNB, and the BNB price at which it reaches zero."
    }
  ]
};
