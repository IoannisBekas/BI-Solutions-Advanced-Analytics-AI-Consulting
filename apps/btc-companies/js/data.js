// Common Equity BTC Equivalent (CEBTC): a dated, treasury-only analytical model.
// USD inputs come from June 30, 2026 filings. Basic economic common shares are
// used without assumed conversion of debt, preferred stock or out-of-money warrants.
// Debt is principal; preferred claims include declared unpaid dividends when reported.
// Cash means unrestricted cash and cash equivalents, excluding other investments.
// Operating assets, earnings, trade liabilities and leases are outside this model.
// Newer share closes are supplied by data/market.json; financial inputs are not live.

// Coinbase BTC-USD one-minute candle ending at the October 2 US stock close (4 pm ET).
export const BASELINE_BTC_PRICE = 84292.32;
export const BASELINE_DATE = '2026-10-02';

export const CEBTC_COMPANIES = [
  {
    id: 'mstr', name: 'Strategy', ticker: 'MSTR.US', symbol: 'MSTR', exchange: 'Nasdaq',
    totalBtcHeld: 846000,
    debtUsd: 6753703000,
    preferredUsd: 15462056000 + 155157000,
    cashUsd: 1711837000,
    marketCapShares: 351963000 + 19640000,
    sharePrice: 160.01, priceDate: BASELINE_DATE,
    asOf: { btc: '2026-06-30', balanceSheet: '2026-06-30', shares: '2026-06-30' },
    notes: [
      'BTC holdings and basic common shares are approximate. Shares include Class A and Class B; the filing reports both rounded to thousands. Potential conversions are excluded.',
      'Debt uses outstanding principal, including secured borrowing, rather than net accounting carrying value.',
      'Preferred claims include $15.462056B liquidation preference and $155.157M declared dividends payable. STRE uses the filing\'s USD equivalent.',
      'Cash excludes $736.145M short-term investments and $1.847M restricted cash.',
      'This June 30 snapshot excludes later purchases, sales, issuances and repurchases. Software operations are outside the treasury-only model.'
    ],
    sources: [{ label: 'Q2 2026 Form 10-Q — balances, debt and preferred claims', url: 'https://www.sec.gov/Archives/edgar/data/1050446/000105044626000044/mstr-20260630.htm' }],
    takeaway: 'Preferred liquidation claims and debt materially reduce the BTC-equivalent backing of common shares. This is a dated treasury calculation; preferred dividends, new financing and later BTC transactions can change it.',
    profileUrl: 'https://www.strategy.com/'
  },
  {
    id: 'asst', name: 'Strive', ticker: 'ASST.US', symbol: 'ASST', exchange: 'Nasdaq',
    totalBtcHeld: 19864,
    debtUsd: 0,
    preferredUsd: 782950200 + 8492000,
    cashUsd: 145466000,
    marketCapShares: 72164809 + 9780018,
    sharePrice: 30.03, priceDate: BASELINE_DATE,
    asOf: { btc: '2026-06-30', balanceSheet: '2026-06-30', shares: '2026-06-30' },
    notes: [
      'BTC holdings are approximate and include acquired Semler holdings. Semler is not counted separately.',
      'Common shares include 72,164,809 Class A and 9,780,018 Class B shares, without potential dilution.',
      'All borrowing debt had been retired by June 30. Preferred claims include 7,829,502 SATA shares at $100 liquidation preference plus $8.492M dividends payable; no compounded dividend arrears were reported.',
      'Cash excludes $42.854M Strategy STRC investments and operating assets.',
      'June 30 inputs omit later capital activity and BTC transactions.'
    ],
    sources: [{ label: 'Q2 2026 Form 10-Q — BTC, shares and SATA liquidation terms', url: 'https://www.sec.gov/Archives/edgar/data/1920406/000162828026054985/asst-20260630.htm' }],
    takeaway: 'Retiring borrowing debt does not remove preferred claims. SATA liquidation preference and declared unpaid dividends are deducted before calculating common-equity BTC backing.',
    profileUrl: 'https://investors.strive.com/'
  },
  {
    id: 'xxi', name: 'Twenty One', ticker: 'XXI.US', symbol: 'XXI', exchange: 'NYSE',
    totalBtcHeld: 43514,
    debtUsd: 486500000,
    preferredUsd: 0,
    cashUsd: 106132084,
    marketCapShares: 346807836,
    sharePrice: 6.6, priceDate: BASELINE_DATE,
    asOf: { btc: '2026-06-30', balanceSheet: '2026-06-30', shares: '2026-06-30' },
    notes: [
      'Market cap counts Class A shares only. Class B shares have no economic rights and are excluded.',
      'BTC includes 16,116 pledged as collateral; the model counts pledged tokens at full value and deducts borrowing principal separately.',
      'No preferred shares were outstanding at June 30.',
      'Treasury balances and economic share count are the June 30 snapshot; later financing, conversions and BTC purchases are excluded.'
    ],
    sources: [{ label: 'Q2 2026 Form 10-Q — economic share rights and BTC collateral', url: 'https://www.sec.gov/Archives/edgar/data/2070457/000121390026087471/ea0299640-10q_twentyone.htm' }],
    takeaway: 'Economic share rights matter: counting the non-economic Class B stock would overstate market cap. Pledged BTC remains in gross exposure, with the associated borrowing deducted as a senior claim.',
    profileUrl: 'https://xxi.money/'
  },
  {
    id: 'riot', name: 'Riot Platforms', ticker: 'RIOT.US', symbol: 'RIOT', exchange: 'Nasdaq',
    totalBtcHeld: 11380,
    debtUsd: 853700000,
    preferredUsd: 0,
    cashUsd: 471383000,
    marketCapShares: 378022964,
    sharePrice: 19.73, priceDate: BASELINE_DATE,
    asOf: { btc: '2026-06-30', balanceSheet: '2026-06-30', shares: '2026-06-30' },
    notes: [
      'BTC comprises 5,559 unrestricted and 5,821 restricted tokens. Restricted collateral is counted at full value.',
      'Borrowing principal is reported rounded to $853.7M. Cash excludes $77.485M restricted cash; no preferred shares were outstanding.',
      'Riot is an operating miner. Mining infrastructure, other operating assets and business earnings are excluded, so treasury mNAV is not whole-company fair value.',
      'Financial and share inputs are a June 30 snapshot; later financing and BTC activity are excluded.'
    ],
    sources: [{ label: 'Q2 2026 Form 10-Q — cash, restricted BTC and borrowing principal', url: 'https://www.sec.gov/Archives/edgar/data/1167419/000110465926093448/riot-20260630x10q.htm' }],
    takeaway: 'Cash offsets a significant portion of borrowing claims. The remaining BTC backing is only one part of Riot\'s business; this model omits mining infrastructure and operating earnings.',
    profileUrl: 'https://www.riotplatforms.com/'
  },
  {
    id: 'clsk', name: 'CleanSpark', ticker: 'CLSK.US', symbol: 'CLSK', exchange: 'Nasdaq',
    totalBtcHeld: 12205 + 1719,
    debtUsd: 1811559000,
    preferredUsd: 1750000 * 0.02,
    cashUsd: 202601000,
    marketCapShares: 256796280,
    sharePrice: 12.74, priceDate: BASELINE_DATE,
    asOf: { btc: '2026-06-30', balanceSheet: '2026-06-30', shares: '2026-06-30' },
    notes: [
      'BTC exposure includes 12,205 held and 1,719 BTC collateral receivable. Receivables carry counterparty and recoverability risk; this model assumes full recovery.',
      'Debt uses principal before financing-cost deductions. The Series A preferred liquidation claim is 1,750,000 shares at $0.02 each.',
      'Shares use 256,796,280 outstanding, excluding treasury shares. Cash excludes restricted cash.',
      'CleanSpark is an operating miner. Treasury NAV excludes mining assets and earnings; a negative treasury NAV does not establish company insolvency.',
      'Financial and share inputs are a June 30 snapshot; later financing and BTC activity are excluded.'
    ],
    sources: [
      { label: 'June 2026 Form 10-Q — outstanding shares, debt and collateral receivable', url: 'https://www.sec.gov/Archives/edgar/data/827876/000119312526338382/clsk-20260630.htm' },
      { label: 'Company June 2026 operational update', url: 'https://investors.cleanspark.com/news/news-details/2026/CleanSpark-Releases-June-2026-Operational-Update/default.aspx' }
    ],
    takeaway: 'The modeled BTC treasury can be smaller than net borrowing claims. That makes treasury-only common NAV non-positive, while mining assets and the operating business remain outside this calculation.',
    profileUrl: 'https://investors.cleanspark.com/'
  }
];

export const EXCLUDED_ENTITIES = [
  {
    id: 'mara', name: 'MARA Holdings', ticker: 'MARA.US', symbol: 'MARA', exchange: 'Nasdaq',
    statusType: 'excluded', exclusionLabel: 'Common-equity attribution incomplete',
    totalBtcHeld: 35577,
    marketCapShares: 381888004,
    sharePrice: 11.23, priceDate: BASELINE_DATE,
    asOf: { btc: '2026-06-30', balanceSheet: '2026-06-30', shares: '2026-06-30' },
    notes: [
      'June 30, 2026 gross holdings include 4,742 loaned and 4,528 pledged BTC, counted at full value.',
      'The consolidated balance sheet includes $82.461M redeemable noncontrolling interest, which cannot be allocated to the parent BTC backing cleanly in this simplified model.',
      'About 30% of reported cash is contractually designated for foreign subsidiary operations. Subsequent substantial financing is outside this snapshot.',
      'Gross holdings and gross mNAV are shown for reference. Common-equity, EV, leverage and wipe-out metrics are not calculated.'
    ],
    sources: [{ label: 'Q2 2026 company-filed Form 10-Q — subsidiary claims and treasury', url: 'https://ir.mara.com/sec-filings/all-sec-filings/content/0001507605-26-000022/mara-20260630.htm' }],
    takeaway: 'Consolidated subsidiary claims and cash restrictions need additional attribution before common shareholders\' BTC backing can be modeled consistently. Only dated gross exposure is displayed.',
    profileUrl: 'https://ir.mara.com/'
  }
];
