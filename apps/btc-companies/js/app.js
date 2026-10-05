import { CEBTC_COMPANIES, EXCLUDED_ENTITIES, BASELINE_BTC_PRICE, BASELINE_DATE } from './data.js';

const formatDate = (isoDate) => new Date(`${isoDate}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const formatUsdCompact = (v) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : `$${v.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
const formatSpotPrice = (v) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// Sub-dollar stocks need more than cents to price their market cap
const formatSharePrice = (v) => v.toFixed(v < 1 ? 4 : 2);

class CebtcDashboard {
  constructor() {
    this.companies = JSON.parse(JSON.stringify(CEBTC_COMPANIES));
    this.excludedEntities = JSON.parse(JSON.stringify(EXCLUDED_ENTITIES));
    this.includeExcluded = false;

    // Pricing & State
    this.liveBtcPrice = BASELINE_BTC_PRICE;
    this.previousBtcPrice = BASELINE_BTC_PRICE;
    this.price24hChange = 0.0;
    this.price24hHigh = BASELINE_BTC_PRICE;
    this.price24hLow = BASELINE_BTC_PRICE;
    this.lastTickTime = new Date();

    // Mode
    this.isLive = true;
    this.simulatedPrice = BASELINE_BTC_PRICE;
    this.calculationMode = 'dynamic'; // 'dynamic' (debt fixed in USD) or 'fixed_ratio' (claims % static)

    // Table Sorting & Filtering
    this.sortField = 'evMNav';
    this.sortDirection = 'asc'; // 'asc' or 'desc'
    this.filterCategory = 'all'; // 'all', 'discounts', 'premiums'
    this.searchQuery = '';

    // Networking
    this.ws = null;
    this.wsReconnectTimer = null;
    this.pollInterval = null;
    this.refreshRateMs = 3000;
    this.activeFeed = 'Coinbase WebSocket';
    this.renderTimer = null;
    this.lastRenderAt = 0;

    // Charts
    this.stackChart = null;
    this.mnavChart = null;
    this.btcPer1000Chart = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderStaticLabels();
    this.initWebSocket();
    this.startRestPolling();
    this.render();
    this.initCharts();
    this.loadMarketData();
  }

  // Daily US closes written by .github/workflows/update-treasury-market-data.yml; data.js values are the fallback
  async loadMarketData() {
    try {
      const res = await fetch('data/market.json', { cache: 'no-store' });
      if (!res.ok) return;
      const { quotes = {} } = await res.json();
      for (const entity of [...this.companies, ...this.excludedEntities]) {
        const quote = quotes[entity.symbol];
        if (quote && quote.close > 0 && quote.date >= entity.priceDate) {
          entity.sharePrice = quote.close;
          entity.priceDate = quote.date;
        }
      }
      this.render();
      this.updateCharts();
    } catch (e) {
      console.warn('Market data unavailable, using baseline closes.', e);
    }
  }

  renderStaticLabels() {
    const allBtn = document.querySelector('[data-filter="all"]');
    if (allBtn) allBtn.textContent = `All (${this.companies.length})`;
    const excludedLabel = document.getElementById('excludedToggleLabel');
    if (excludedLabel && this.excludedEntities.length === 0) excludedLabel.closest('label').hidden = true;
    if (excludedLabel) excludedLabel.textContent = `Show excluded (${this.excludedEntities.map(e => e.symbol).join(', ')})`;
  }

  get currentPrice() {
    return this.isLive ? this.liveBtcPrice : this.simulatedPrice;
  }

  // --- NETWORKING & WEBSOCKET ENGINE ---
  initWebSocket() {
    if (!window.WebSocket) {
      this.updateConnectionStatus('WebSocket not supported', false);
      return;
    }

    try {
      this.updateConnectionStatus('Connecting...', false);
      // Coinbase BTC-USD is quoted in US dollars
      this.ws = new WebSocket('wss://ws-feed.exchange.coinbase.com');

      this.ws.onopen = () => {
        this.ws.send(JSON.stringify({ type: 'subscribe', product_ids: ['BTC-USD'], channels: ['ticker'] }));
        this.updateConnectionStatus('LIVE (Coinbase BTC/USD)', true);
        this.activeFeed = 'Coinbase WebSocket';
      };

      this.ws.onmessage = (event) => {
        if (!this.isLive) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ticker' && data.price) {
            const newPrice = parseFloat(data.price);
            const open24h = parseFloat(data.open_24h);
            const changePct = open24h > 0 ? ((newPrice - open24h) / open24h) * 100 : NaN;
            this.handlePriceUpdate(newPrice, changePct, parseFloat(data.high_24h), parseFloat(data.low_24h), 'Coinbase WebSocket');
          }
        } catch (e) {
          console.warn('WS parse error:', e);
        }
      };

      this.ws.onerror = () => {
        this.updateConnectionStatus('WS Reconnecting...', false);
      };

      this.ws.onclose = () => {
        this.updateConnectionStatus('WS Disconnected (Polling REST)', false);
        if (this.wsReconnectTimer) clearTimeout(this.wsReconnectTimer);
        this.wsReconnectTimer = setTimeout(() => {
          if (this.isLive) this.initWebSocket();
        }, 5000);
      };
    } catch (e) {
      console.warn('WebSocket init exception:', e);
      this.updateConnectionStatus('REST Polling Active', true);
    }
  }

  async fetchRestPrice() {
    // Tried in order; every source quotes BTC in US dollars
    const sources = [
      {
        name: 'Coinbase REST',
        url: 'https://api.exchange.coinbase.com/products/BTC-USD/stats',
        parse: (d) => {
          const last = parseFloat(d.last);
          const open = parseFloat(d.open);
          return { price: last, changePct: open > 0 ? ((last - open) / open) * 100 : NaN, high: parseFloat(d.high), low: parseFloat(d.low) };
        }
      },
      {
        // Kraken's open is the UTC-midnight open, not 24h ago, so it doesn't set the 24h change
        name: 'Kraken REST',
        url: 'https://api.kraken.com/0/public/Ticker?pair=XBTUSD',
        parse: (d) => {
          const t = d.result?.XXBTZUSD;
          return { price: parseFloat(t?.c?.[0]), changePct: NaN, high: parseFloat(t?.h?.[1]), low: parseFloat(t?.l?.[1]) };
        }
      },
      {
        name: 'CoinGecko API',
        url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
        parse: (d) => ({ price: parseFloat(d.bitcoin?.usd), changePct: parseFloat(d.bitcoin?.usd_24h_change) })
      },
      {
        name: 'Coinbase Spot API',
        url: 'https://api.coinbase.com/v2/prices/BTC-USD/spot',
        parse: (d) => ({ price: parseFloat(d.data?.amount) })
      }
    ];

    for (const source of sources) {
      try {
        const res = await fetch(source.url, { cache: 'no-store' });
        if (!res.ok) continue;
        const quote = source.parse(await res.json());
        if (quote.price > 0) {
          this.handlePriceUpdate(quote.price, quote.changePct, quote.high, quote.low, source.name);
          return;
        }
      } catch (e) {
        // fall through to the next source
      }
    }
    console.warn('All price endpoints failed, keeping last known price.');
  }

  startRestPolling() {
    this.fetchRestPrice();
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      if (this.isLive && (!this.ws || this.ws.readyState !== WebSocket.OPEN)) {
        this.fetchRestPrice();
      }
    }, this.refreshRateMs);
  }

  handlePriceUpdate(newPrice, changePct, high, low, source = 'Feed') {
    if (!newPrice || isNaN(newPrice) || newPrice <= 0) return;

    this.liveBtcPrice = newPrice;
    if (!isNaN(changePct)) this.price24hChange = changePct;
    if (high && !isNaN(high) && high > 0) this.price24hHigh = high;
    if (low && !isNaN(low) && low > 0) this.price24hLow = low;
    this.lastTickTime = new Date();
    this.activeFeed = source;

    if (this.isLive) this.scheduleLiveRender();
  }

  // Coinbase sends a ticker message per trade; repaint at most once a second
  scheduleLiveRender() {
    if (this.renderTimer) return;
    const wait = Math.max(0, 1000 - (Date.now() - this.lastRenderAt));
    this.renderTimer = setTimeout(() => {
      this.renderTimer = null;
      if (!this.isLive) return;
      this.lastRenderAt = Date.now();
      if (this.liveBtcPrice !== this.previousBtcPrice) {
        this.triggerPriceAnimation(this.liveBtcPrice > this.previousBtcPrice);
        this.previousBtcPrice = this.liveBtcPrice;
      }
      this.render();
      this.updateCharts();
    }, wait);
  }

  triggerPriceAnimation(isUp) {
    const el = document.getElementById('liveBtcPriceDisplay');
    if (!el) return;
    el.classList.remove('tick-flash-up', 'tick-flash-down');
    void el.offsetWidth; // trigger reflow
    el.classList.add(isUp ? 'tick-flash-up' : 'tick-flash-down');
  }

  updateConnectionStatus(text, isLive) {
    const label = document.getElementById('connectionStatusText');
    const dot = document.getElementById('connectionStatusDot');
    if (label) label.textContent = text;
    if (dot) {
      dot.className = `w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 pulse-indicator' : 'bg-amber-400'}`;
    }
  }

  // --- CEBTC MATHEMATICAL RE-CALCULATION ENGINE ---
  calculateCompanyMetrics(company, btcPrice) {
    const grossBtc = company.totalBtcHeld;
    const marketCap = company.marketCapShares * company.sharePrice;
    const totalTreasuryValue = grossBtc * btcPrice;

    // Net senior claims = debt + preferred - cash. Negative means net cash, which accrues to common.
    const usdClaims = company.debtUsd + company.preferredUsd - company.cashUsd;
    let netClaimsUsd = usdClaims;
    if (this.calculationMode === 'fixed_ratio') {
      // Claims held at their baseline share of the treasury, i.e. they move with BTC
      netClaimsUsd = usdClaims * (btcPrice / BASELINE_BTC_PRICE);
    }

    const equityNavUsd = totalTreasuryValue - netClaimsUsd;
    const isUnderwater = equityNavUsd <= 0;
    const seniorClaimsPct = Math.max(netClaimsUsd, 0) / totalTreasuryValue;
    // BTC-equivalent of common equity NAV (includes net cash)
    const commonEquityBtc = Math.round(Math.max(equityNavUsd, 0) / btcPrice * 1e8) / 1e8;

    const grossMNav = marketCap / totalTreasuryValue;
    // EV mNAV isn't distorted by leverage, so it drives the status label
    const evMNav = (marketCap + netClaimsUsd) / totalTreasuryValue;
    // CEBTC mNAV = 1 + (EV mNAV - 1) * leverage; undefined once equity NAV is gone
    const cebtcMNav = isUnderwater ? null : marketCap / equityNavUsd;
    const leverage = isUnderwater ? null : totalTreasuryValue / equityNavUsd;
    // BTC price at which net senior claims consume the whole treasury
    const wipeoutPrice = this.calculationMode === 'dynamic' && usdClaims > 0 ? usdClaims / grossBtc : null;
    // BTC per $1,000 = (Common Equity BTC * 1000) / Market Cap = 1000 / (CEBTC mNAV * BTC Price)
    const btcPer1000 = (commonEquityBtc * 1000) / marketCap;

    let status, statusClass;
    if (isUnderwater) {
      status = 'Treasury NAV ≤ 0';
      statusClass = 'badge-underwater';
    } else if (evMNav <= 0.45) {
      status = 'Deep Discount';
      statusClass = 'badge-discount-deep';
    } else if (evMNav < 1.0) {
      status = 'Discount';
      statusClass = 'badge-discount';
    } else if (evMNav <= 1.4) {
      status = 'Modest Premium';
      statusClass = 'badge-premium';
    } else {
      status = 'Severe Premium';
      statusClass = 'badge-severe-premium';
    }

    return {
      ...company,
      totalTreasuryValue,
      calculatedMarketCap: marketCap,
      calculatedNetClaimsUsd: netClaimsUsd,
      calculatedEquityNavUsd: equityNavUsd,
      calculatedClaimsPct: seniorClaimsPct,
      calculatedClaimsDisplay: (seniorClaimsPct * 100).toFixed(1) + '%',
      calculatedCommonBtc: commonEquityBtc,
      calculatedGrossMNav: grossMNav,
      calculatedEvMNav: evMNav,
      calculatedCebtcMNav: cebtcMNav,
      calculatedLeverage: leverage,
      calculatedWipeoutPrice: wipeoutPrice,
      calculatedBtcPer1000: btcPer1000,
      isUnderwater,
      status,
      statusClass
    };
  }

  // Excluded entities: only gross holdings are shown, no balance-sheet deduction
  calculateExcludedMetrics(entity, btcPrice) {
    const marketCap = entity.marketCapShares * entity.sharePrice;
    const totalTreasuryValue = entity.totalBtcHeld * btcPrice;
    return {
      ...entity,
      totalTreasuryValue,
      calculatedMarketCap: marketCap,
      calculatedNetClaimsUsd: null,
      calculatedEquityNavUsd: null,
      calculatedClaimsPct: null,
      calculatedClaimsDisplay: `N/A (${entity.exclusionLabel})`,
      calculatedCommonBtc: null,
      calculatedGrossMNav: totalTreasuryValue > 0 ? marketCap / totalTreasuryValue : null,
      calculatedEvMNav: null,
      calculatedCebtcMNav: null,
      calculatedLeverage: null,
      calculatedWipeoutPrice: null,
      calculatedBtcPer1000: null,
      isUnderwater: false,
      status: 'Excluded',
      statusClass: 'badge-excluded'
    };
  }

  getProcessedData() {
    const currentPrice = this.currentPrice;
    let list = this.companies.map(c => this.calculateCompanyMetrics(c, currentPrice));

    if (this.includeExcluded) {
      list = [...list, ...this.excludedEntities.map(e => this.calculateExcludedMetrics(e, currentPrice))];
    }

    // Search query filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.ticker.toLowerCase().includes(q)
      );
    }

    // Category filter (EV mNAV, same basis as the status label)
    if (this.filterCategory === 'discounts') {
      list = list.filter(item => item.calculatedEvMNav !== null && item.calculatedEvMNav < 1.0);
    } else if (this.filterCategory === 'premiums') {
      list = list.filter(item => item.calculatedEvMNav !== null && item.calculatedEvMNav >= 1.0);
    }

    // Sorting: excluded entities (null values) always go last
    const isExcluded = (d) => d.statusType === 'excluded';
    const sortValue = {
      name: d => d.name.toLowerCase(),
      totalBtcHeld: d => d.totalBtcHeld,
      btcValue: d => d.totalTreasuryValue,
      netClaims: d => d.calculatedNetClaimsUsd,
      seniorClaimsPct: d => d.calculatedClaimsPct,
      commonEquityBtc: d => d.calculatedCommonBtc,
      marketCap: d => d.calculatedMarketCap,
      grossMNav: d => d.calculatedGrossMNav,
      evMNav: d => d.calculatedEvMNav,
      cebtcMNav: d => isExcluded(d) ? null : (d.isUnderwater ? Infinity : d.calculatedCebtcMNav),
      btcPer1000: d => d.calculatedBtcPer1000,
      leverage: d => isExcluded(d) ? null : (d.isUnderwater ? Infinity : d.calculatedLeverage),
      // No wipe-out price (net cash) is the safest position
      wipeoutPrice: d => isExcluded(d) ? null : (d.calculatedWipeoutPrice ?? 0)
    }[this.sortField] ?? (d => d.calculatedEvMNav);

    list.sort((a, b) => {
      const valA = sortValue(a);
      const valB = sortValue(b);
      if (valA === null && valB === null) return 0;
      if (valA === null) return 1;
      if (valB === null) return -1;

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }

  // --- RENDERING ENGINE ---
  render() {
    this.renderHeaderAndTickers();
    this.renderKpiSummary();
    this.renderTable();
    this.renderSimulatorControls();
    this.renderDataNote();
  }

  renderDataNote() {
    const note = document.getElementById('dataAsOfNote');
    if (!note) return;
    const latestClose = this.companies.map(c => c.priceDate).sort().at(-1);
    note.textContent = `USD. Stock prices: US close ${formatDate(latestClose)}. Financial inputs and shares: Jun 30, 2026 snapshot. BTC price: ${this.isLive ? 'live' : 'scenario'}. See each company for assumptions and sources.`;
  }

  renderHeaderAndTickers() {
    const priceDisplay = document.getElementById('liveBtcPriceDisplay');
    const priceChangeDisplay = document.getElementById('liveBtcPriceChange');
    const highLowDisplay = document.getElementById('liveBtcHighLow');
    const feedSourceDisplay = document.getElementById('feedSourceBadge');
    const simBanner = document.getElementById('simulatorActiveBanner');

    const price = this.currentPrice;
    if (priceDisplay) priceDisplay.textContent = `$${formatSpotPrice(price)}`;

    if (this.isLive) {
      if (simBanner) simBanner.classList.add('hidden');
      if (priceChangeDisplay) {
        const sign = this.price24hChange >= 0 ? '+' : '';
        const color = this.price24hChange >= 0 ? 'text-emerald-400' : 'text-rose-400';
        priceChangeDisplay.className = `num text-sm font-medium pb-2 ${color}`;
        priceChangeDisplay.textContent = `${sign}${this.price24hChange.toFixed(2)}% (24h)`;
      }
      if (highLowDisplay && this.price24hHigh > 0) {
        highLowDisplay.textContent = `24h H: $${formatSpotPrice(this.price24hHigh)} | L: $${formatSpotPrice(this.price24hLow)}`;
      }
      if (feedSourceDisplay) feedSourceDisplay.textContent = this.activeFeed;
    } else {
      if (simBanner) {
        simBanner.classList.remove('hidden');
        document.getElementById('simulatedBannerPrice').textContent = `$${formatSpotPrice(this.simulatedPrice)}`;
      }
      if (feedSourceDisplay) feedSourceDisplay.textContent = 'Scenario Simulation Mode';
    }
  }

  renderKpiSummary() {
    const list = this.companies.map(c => this.calculateCompanyMetrics(c, this.currentPrice));

    const totalGrossBtc = list.reduce((acc, c) => acc + c.totalBtcHeld, 0);
    const totalCommonBtc = list.reduce((acc, c) => acc + c.calculatedCommonBtc, 0);
    // Net cash at one company doesn't offset claims at another
    const totalClaimsUsd = list.reduce((acc, c) => acc + Math.max(c.calculatedNetClaimsUsd, 0), 0);
    const totalTreasuryValue = totalGrossBtc * this.currentPrice;
    const commonRetentionPct = (totalCommonBtc / totalGrossBtc) * 100;

    // Best discount (CEBTC, i.e. most BTC per $1,000) & highest premium (EV, same basis as status)
    const validCebtc = list.filter(c => c.calculatedCebtcMNav !== null);
    const bestDiscount = [...validCebtc].sort((a,b) => a.calculatedCebtcMNav - b.calculatedCebtcMNav)[0];
    const highestPremium = [...list].sort((a,b) => b.calculatedEvMNav - a.calculatedEvMNav)[0];

    const elGross = document.getElementById('kpiGrossBtc');
    const elGrossVal = document.getElementById('kpiGrossValue');
    const elCommon = document.getElementById('kpiCommonBtc');
    const elCommonPct = document.getElementById('kpiCommonPct');
    const elDebt = document.getElementById('kpiTotalDebt');
    const elDebtBtc = document.getElementById('kpiTotalDebtBtc');
    const elBestDiscount = document.getElementById('kpiBestDiscount');
    const elBestDiscountSub = document.getElementById('kpiBestDiscountSub');
    const elHighestPremium = document.getElementById('kpiHighestPremium');
    const elHighestPremiumSub = document.getElementById('kpiHighestPremiumSub');

    if (elGross) elGross.textContent = `${Math.round(totalGrossBtc).toLocaleString()} BTC`;
    if (elGrossVal) elGrossVal.textContent = `${formatUsdCompact(totalTreasuryValue)} USD treasury`;

    if (elCommon) elCommon.textContent = `${Math.round(totalCommonBtc).toLocaleString()} BTC`;
    if (elCommonPct) elCommonPct.textContent = `${commonRetentionPct.toFixed(1)}% of gross holdings`;

    if (elDebt) elDebt.textContent = formatUsdCompact(totalClaimsUsd);
    if (elDebtBtc) elDebtBtc.textContent = `~${Math.round(totalClaimsUsd / this.currentPrice).toLocaleString()} BTC matched by debt & preferred`;

    if (elBestDiscount) {
      elBestDiscount.textContent = bestDiscount ? `${bestDiscount.name} (${bestDiscount.calculatedCebtcMNav.toFixed(2)}x CEBTC)` : '—';
      if (elBestDiscountSub) elBestDiscountSub.textContent = bestDiscount ? `${bestDiscount.calculatedBtcPer1000.toFixed(6)} BTC per $1,000` : 'All equity underwater';
    }

    if (elHighestPremium && highestPremium) {
      elHighestPremium.textContent = `${highestPremium.name} (${highestPremium.calculatedEvMNav.toFixed(2)}x EV)`;
      if (elHighestPremiumSub) {
        elHighestPremiumSub.textContent = highestPremium.isUnderwater
          ? 'Equity NAV underwater'
          : `${highestPremium.calculatedCebtcMNav.toFixed(2)}x CEBTC · ${highestPremium.calculatedLeverage.toFixed(2)}x leverage`;
      }
    }
  }

  // Calculation ledger: each company's math reads top to bottom so readers can check every step
  getLedgerRows() {
    const p = this.currentPrice;
    const na = '<span class="text-ink/35">N/A</span>';
    const nm = '<span class="text-rose-700" title="Not meaningful: senior claims exceed the BTC treasury">n/m</span>';
    const dash = '<span class="text-ink/35">—</span>';
    const usd = (v) => `${v < 0 ? '−' : ''}${formatUsdCompact(Math.abs(v))}`;
    const ex = (d) => d.statusType === 'excluded';
    const valueColor = (d) => d.calculatedEvMNav < 1 ? 'text-emerald-700' : 'text-rose-700';
    const claimsColor = (d) => d.calculatedClaimsPct > 0.5 ? 'text-rose-700' : d.calculatedClaimsPct > 0.15 ? 'text-amber-700' : 'text-emerald-700';

    return [
      { section: 'BTC treasury' },
      { label: 'BTC exposure', hint: 'Held, pledged and disclosed BTC receivables', sort: 'totalBtcHeld', ex: true, value: d => d.totalBtcHeld.toLocaleString() },
      { op: '×', label: 'BTC price', hint: this.isLive ? 'Live BTC/USD' : 'Scenario price', ex: true, value: () => `$${p.toFixed(2)}` },
      { op: '=', label: 'BTC value', sort: 'btcValue', total: true, ex: true, value: d => usd(d.totalTreasuryValue) },

      { section: 'Senior claims' },
      { label: 'Debt', value: d => ex(d) ? na : d.debtUsd ? usd(d.debtUsd) : dash },
      { op: '+', label: 'Preferred stock', value: d => ex(d) ? na : d.preferredUsd ? usd(d.preferredUsd) : dash },
      { op: '−', label: 'Cash', value: d => ex(d) ? na : usd(d.cashUsd) },
      ...(this.calculationMode === 'fixed_ratio' ? [{
        op: '×', label: 'Scenario claims factor', hint: 'BTC price ÷ baseline price; scales net claims',
        value: d => ex(d) ? na : `${(p / BASELINE_BTC_PRICE).toFixed(4)}×`
      }] : []),
      { op: '=', label: 'Net senior claims', sort: 'netClaims', total: true, value: d => ex(d) ? na : usd(d.calculatedNetClaimsUsd) },
      { label: 'Senior claims %', hint: 'Net senior claims ÷ BTC value', sort: 'seniorClaimsPct',
        value: d => ex(d) ? na : d.calculatedNetClaimsUsd < 0 ? '<span class="text-emerald-700">Net cash</span>' : `<span class="${claimsColor(d)}">${d.calculatedClaimsDisplay}</span>` },

      { section: 'Common equity' },
      { label: 'Equity NAV', hint: 'BTC value − Net senior claims', total: true,
        value: d => ex(d) ? na : `<span class="${d.isUnderwater ? 'text-rose-700' : ''}">${usd(d.calculatedEquityNavUsd)}</span>` },
      { label: 'Common equity BTC', hint: 'Equity NAV ÷ BTC price', sort: 'commonEquityBtc', value: d => ex(d) ? na : d.calculatedCommonBtc.toLocaleString('en-US', { maximumFractionDigits: 8 }) },

      { section: 'Market value' },
      { label: 'Shares', hint: 'Basic economic common shares (see detail)', ex: true, value: d => d.marketCapShares.toLocaleString() },
      { op: '×', label: 'Share price', hint: 'Latest US close', ex: true, value: d => `$${formatSharePrice(d.sharePrice)}` },
      { op: '=', label: 'Market cap', sort: 'marketCap', total: true, ex: true, value: d => usd(d.calculatedMarketCap) },
      { label: 'Enterprise value', hint: 'Market cap + Net senior claims', total: true,
        value: d => ex(d) ? na : usd(d.calculatedMarketCap + d.calculatedNetClaimsUsd) },

      { section: 'Valuation' },
      { label: 'Gross mNAV', hint: 'Market cap ÷ BTC value', sort: 'grossMNav', ex: true,
        value: d => d.calculatedGrossMNav === null ? dash : `${d.calculatedGrossMNav.toFixed(2)}x` },
      { label: 'EV mNAV', hint: 'Enterprise value ÷ BTC value · sets the status', sort: 'evMNav', key: true,
        value: d => ex(d) ? na : `<span class="font-semibold ${valueColor(d)}">${d.calculatedEvMNav.toFixed(2)}x</span>` },
      { label: 'CEBTC mNAV', hint: 'Market cap ÷ Equity NAV', sort: 'cebtcMNav',
        value: d => ex(d) ? na : d.isUnderwater ? nm : `<span class="${valueColor(d)}">${d.calculatedCebtcMNav.toFixed(2)}x</span>` },
      { label: 'BTC per $1,000', hint: 'Common equity BTC × 1,000 ÷ Market cap', sort: 'btcPer1000',
        value: d => ex(d) ? na : d.calculatedBtcPer1000.toFixed(6) },

      { section: 'Risk' },
      { label: 'Leverage', hint: 'BTC value ÷ Equity NAV', sort: 'leverage',
        value: d => ex(d) ? na : d.isUnderwater ? nm : `<span class="${d.calculatedNetClaimsUsd > 0 ? claimsColor(d) : ''}">${d.calculatedLeverage.toFixed(2)}x</span>` },
      { label: 'Wipe-out BTC price', hint: 'Net senior claims ÷ BTC held', sort: 'wipeoutPrice',
        value: d => {
          if (ex(d)) return na;
          if (d.calculatedWipeoutPrice !== null) {
            const distancePct = (1 - d.calculatedWipeoutPrice / p) * 100;
            const distanceColor = distancePct < 25 ? 'text-rose-700' : distancePct < 50 ? 'text-amber-700' : 'text-ink/45';
            return `$${d.calculatedWipeoutPrice.toFixed(2)}<div class="text-[11px] font-normal ${distanceColor}">${d.isUnderwater ? 'breached' : `BTC −${distancePct.toFixed(1)}%`}</div>`;
          }
          return d.calculatedNetClaimsUsd < 0 ? '<span class="text-ink/45">None (net cash)</span>' : dash;
        } }
    ];
  }

  renderTable() {
    const container = document.getElementById('cebtcMatrix');
    if (!container) return;
    this.renderSortControls();

    const items = this.getProcessedData();
    if (items.length === 0) {
      container.innerHTML = '<p class="py-12 text-center text-sm text-ink/50">No companies match your search or filter.</p>';
      return;
    }

    const rows = this.getLedgerRows();
    const sortMark = (row) => {
      if (!row.sort) return '';
      if (row.sort !== this.sortField) return '<span class="ledger-sort">↕</span>';
      return `<span class="ledger-sort ledger-sort-active">${this.sortDirection === 'asc' ? '↑' : '↓'}</span>`;
    };
    const rowLabel = (row) => {
      const text = `<span class="ledger-op">${row.op ?? ''}</span>${row.label}${sortMark(row)}`;
      const label = row.sort
        ? `<button type="button" data-sort="${row.sort}" class="ledger-label-btn" title="Order companies by ${row.label}">${text}</button>`
        : `<span>${text}</span>`;
      return label + (row.hint ? `<div class="ledger-hint">${row.hint}</div>` : '');
    };
    const badge = (d, extra = '') => `<span class="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium leading-tight ${d.statusClass} ${extra}">${d.status}</span>`;

    // Wide screens: one column per company
    const table = `
      <table class="ledger hidden lg:table w-full table-fixed text-[13px]">
        <colgroup><col class="w-[210px] xl:w-[250px]">${items.map(() => '<col>').join('')}</colgroup>
        <thead>
          <tr>
            <th class="ledger-corner">
              <div class="text-ink font-semibold normal-case tracking-normal text-[13px]">Each column is one company's calculation</div>
              <div class="mt-1">Read top to bottom. Select a company for its sources.</div>
            </th>
            ${items.map((d, i) => `
            <th class="ledger-head" data-company="${d.id}" title="Open ${d.name}'s balance sheet detail and sources">
              <div class="text-[11px] text-ink/40 font-medium">#${i + 1}</div>
              <div class="ledger-name">${d.name}</div>
              <div class="text-[11px] text-ink/45 font-normal mb-1.5">${d.symbol}${d.exclusionLabel ? ` · ${d.exclusionLabel}` : ''}</div>
              ${badge(d)}
            </th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => row.section
            ? `<tr class="ledger-section"><th colspan="${items.length + 1}">${row.section}</th></tr>`
            : `<tr class="${row.total ? 'ledger-total' : ''} ${row.key ? 'ledger-key' : ''}">
                <th scope="row" class="ledger-label">${rowLabel(row)}</th>
                ${items.map(d => `<td>${row.value(d)}</td>`).join('')}
              </tr>`).join('')}
        </tbody>
      </table>`;

    // Narrower screens: the same ledger as one card per company, so nothing scrolls sideways
    const cards = `
      <div class="lg:hidden grid md:grid-cols-2 gap-4 p-4 sm:p-5">
        ${items.map((d, i) => {
          const isExcluded = d.statusType === 'excluded';
          const cardRows = isExcluded ? rows.filter(r => r.ex) : rows;
          return `
          <article class="ledger-card">
            <button type="button" data-company="${d.id}" class="w-full text-left px-4 py-3 bg-paper flex items-start justify-between gap-3">
              <div>
                <div class="text-[11px] text-ink/40 font-medium">#${i + 1}</div>
                <div class="font-display font-bold tracking-tight">${d.name}</div>
                <div class="text-xs text-ink/50">${d.ticker} · ${d.exchange}</div>
              </div>
              ${badge(d, 'shrink-0')}
            </button>
            <dl class="px-4 pb-3 text-sm">
              ${cardRows.map(row => row.section
                ? `<div class="ledger-card-section">${row.section}</div>`
                : `<div class="ledger-card-row ${row.total ? 'ledger-card-total' : ''} ${row.key ? 'ledger-card-key' : ''}">
                    <dt>${rowLabel(row)}</dt>
                    <dd class="num">${row.value(d)}</dd>
                  </div>`).join('')}
              ${isExcluded ? `<p class="text-xs text-ink/55 leading-relaxed pt-3">${d.takeaway}</p>` : ''}
            </dl>
          </article>`;
        }).join('')}
      </div>`;

    container.innerHTML = table + cards;
  }

  renderSortControls() {
    const select = document.getElementById('sortSelect');
    if (select && [...select.options].some(o => o.value === this.sortField)) select.value = this.sortField;
    const directionBtn = document.getElementById('sortDirectionBtn');
    if (directionBtn) {
      const asc = this.sortDirection === 'asc';
      directionBtn.textContent = this.sortField === 'name' ? (asc ? 'A → Z' : 'Z → A') : (asc ? 'Low → high' : 'High → low');
    }
  }

  setSort(field, toggleIfSame = false) {
    if (toggleIfSame && this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      // Bigger is better for these, so show the largest first
      this.sortDirection = ['totalBtcHeld', 'btcValue', 'commonEquityBtc', 'marketCap', 'btcPer1000'].includes(field) ? 'desc' : 'asc';
    }
    this.renderTable();
  }

  renderSimulatorControls() {
    const slider = document.getElementById('simPriceSlider');
    const input = document.getElementById('simPriceInput');
    const toggleLiveBtn = document.getElementById('toggleLiveFeedBtn');

    if (slider) slider.value = this.currentPrice;
    if (input) input.value = this.currentPrice.toFixed(2);

    if (toggleLiveBtn) {
      toggleLiveBtn.className = 'btn-light !py-2 !px-4 !text-xs';
      toggleLiveBtn.innerHTML = this.isLive
        ? `<span class="w-2 h-2 rounded-full bg-emerald-500 pulse-indicator"></span><span>Live stream on</span>`
        : `<span class="w-2 h-2 rounded-full bg-amber-500"></span><span>Switch to live</span>`;
    }
  }

  // --- CHART VISUALIZATION ENGINE ---
  initCharts() {
    if (!window.Chart) return;

    // Chart Defaults
    Chart.defaults.color = 'rgba(255, 255, 255, 0.6)';
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';
    // Charts are rebuilt on every price tick; animating each rebuild keeps the bars perpetually re-growing
    Chart.defaults.animation = false;

    this.renderStackChart();
    this.renderMNavChart();
    this.renderBtcPer1000Chart();
  }

  updateCharts() {
    if (!window.Chart) return;
    this.renderStackChart();
    this.renderMNavChart();
    this.renderBtcPer1000Chart();
  }

  renderStackChart() {
    const ctx = document.getElementById('stackBreakdownChart');
    if (!ctx) return;

    const data = this.companies.map(c => this.calculateCompanyMetrics(c, this.currentPrice));
    const labels = data.map(d => d.name);
    // Model the claims/value split, not pledged/unpledged custody. Net cash does not extend a BTC bar.
    const creditorBtc = data.map(d => Math.min(d.totalBtcHeld, Math.max(0, d.calculatedNetClaimsUsd) / this.currentPrice));
    const commonBtc = data.map((d, i) => d.totalBtcHeld - creditorBtc[i]);
    // Treasuries differ by an order of magnitude, so bars show each one's split as a share of its own BTC
    const pct = (part, i) => (part / data[i].totalBtcHeld) * 100;
    const btcCounts = [commonBtc, creditorBtc];

    if (this.stackChart) {
      this.stackChart.destroy();
    }

    this.stackChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Unmatched by net claims',
            data: commonBtc.map(pct),
            backgroundColor: 'rgba(52, 211, 153, 0.85)',
            borderColor: '#34d399',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Matched by net claims',
            data: creditorBtc.map(pct),
            backgroundColor: 'rgba(251, 113, 133, 0.8)',
            borderColor: '#fb7185',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 14, font: { size: 11, weight: '500' } }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const count = btcCounts[context.datasetIndex][context.dataIndex];
                return ` ${context.dataset.label}: ${count.toLocaleString('en-US', { maximumFractionDigits: 8 })} BTC (${context.raw.toFixed(1)}%)`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false }
          },
          y: {
            stacked: true,
            max: 100,
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            ticks: {
              callback: (val) => `${val}%`
            }
          }
        }
      }
    });
  }

  renderMNavChart() {
    const ctx = document.getElementById('mnavDistortionChart');
    if (!ctx) return;

    const data = this.companies.map(c => this.calculateCompanyMetrics(c, this.currentPrice));
    const labels = data.map(d => d.name);
    const grossMnav = data.map(d => d.calculatedGrossMNav);
    const evMnav = data.map(d => d.calculatedEvMNav);
    const cebtcMnav = data.map(d => d.calculatedCebtcMNav);
    // CEBTC explodes as equity NAV approaches zero; cap the axis so other bars stay readable
    const maxMultiple = Math.max(...grossMnav, ...evMnav, ...cebtcMnav.filter(v => v !== null));

    if (this.mnavChart) {
      this.mnavChart.destroy();
    }

    this.mnavChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Gross mNAV (ignores debt)',
            data: grossMnav,
            backgroundColor: 'rgba(255, 255, 255, 0.22)',
            borderColor: 'rgba(255, 255, 255, 0.45)',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'EV mNAV (status basis)',
            data: evMnav,
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            borderColor: '#ffffff',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'CEBTC mNAV (common equity)',
            data: cebtcMnav,
            backgroundColor: data.map(d => d.calculatedEvMNav < 1.0 ? 'rgba(52, 211, 153, 0.85)' : 'rgba(251, 113, 133, 0.8)'),
            borderColor: data.map(d => d.calculatedEvMNav < 1.0 ? '#34d399' : '#fb7185'),
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 14, font: { size: 11, weight: '500' } }
          },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.dataset.label}: ${context.raw === null ? 'n/m (equity underwater)' : context.raw.toFixed(2) + 'x'}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false }
          },
          y: {
            max: maxMultiple > 4 ? 4 : undefined,
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            ticks: {
              callback: (val) => `${val}x`
            }
          }
        }
      }
    });
  }

  renderBtcPer1000Chart() {
    const ctx = document.getElementById('btcPer1000Chart');
    if (!ctx) return;

    const data = [...this.companies]
      .map(c => this.calculateCompanyMetrics(c, this.currentPrice))
      .sort((a,b) => b.calculatedBtcPer1000 - a.calculatedBtcPer1000);

    const labels = data.map(d => d.name);
    const btcVals = data.map(d => d.calculatedBtcPer1000);
    // At or above par (CEBTC mNAV of 1x or less), $1,000 of stock is backed by at least $1,000 of BTC
    const atPar = (d) => d.calculatedBtcPer1000 >= 1000 / this.currentPrice;

    if (this.btcPer1000Chart) {
      this.btcPer1000Chart.destroy();
    }

    this.btcPer1000Chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'BTC Acquired per $1,000 Invested',
            data: btcVals,
            backgroundColor: data.map(d => atPar(d) ? 'rgba(52, 211, 153, 0.85)' : 'rgba(255, 255, 255, 0.55)'),
            borderColor: data.map(d => atPar(d) ? '#34d399' : 'rgba(255, 255, 255, 0.7)'),
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.raw.toFixed(6)} BTC per $1,000 invested`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            ticks: {
              callback: (val) => `${val} BTC`
            }
          },
          y: {
            grid: { display: false }
          }
        }
      }
    });
  }

  // --- INTERACTION & EVENT LISTENERS ---
  setupEventListeners() {
    const modal = document.getElementById('entityDetailModal');
    modal?.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('[data-close-entity-modal]')) {
        this.closeEntityModal();
      }
    });

    // Ledger clicks (re-rendered on every tick, so delegate): row labels sort, company headers open the detail
    const matrix = document.getElementById('cebtcMatrix');
    if (matrix) {
      matrix.addEventListener('click', (e) => {
        const sortTarget = e.target.closest('[data-sort]');
        if (sortTarget) {
          this.setSort(sortTarget.getAttribute('data-sort'), true);
          return;
        }
        const companyTarget = e.target.closest('[data-company]');
        if (companyTarget) this.openEntityModal(companyTarget.getAttribute('data-company'));
      });
    }

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.addEventListener('change', (e) => this.setSort(e.target.value));

    const sortDirectionBtn = document.getElementById('sortDirectionBtn');
    if (sortDirectionBtn) sortDirectionBtn.addEventListener('click', () => this.setSort(this.sortField, true));

    // Category Filter Buttons
    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('seg-active'));
        btn.classList.add('seg-active');
        this.filterCategory = btn.getAttribute('data-filter');
        this.renderTable();
      });
    });

    // Search Input
    const searchInput = document.getElementById('tableSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderTable();
      });
    }

    // Excluded Entities Toggle
    const excludedToggle = document.getElementById('toggleExcludedEntities');
    if (excludedToggle) {
      excludedToggle.addEventListener('change', (e) => {
        this.includeExcluded = e.target.checked;
        this.renderTable();
      });
    }

    // Calculation Mode Selector (Dynamic Debt vs Fixed Claims %)
    const calcModeSelect = document.getElementById('calculationModeSelect');
    if (calcModeSelect) {
      calcModeSelect.addEventListener('change', (e) => {
        this.calculationMode = e.target.value;
        this.render();
        this.updateCharts();
      });
    }

    // Toggle Live Stream vs Simulator Button
    const toggleLiveBtn = document.getElementById('toggleLiveFeedBtn');
    if (toggleLiveBtn) {
      toggleLiveBtn.addEventListener('click', () => {
        this.isLive = !this.isLive;
        if (this.isLive) {
          this.simulatedPrice = this.liveBtcPrice;
        }
        this.render();
        this.updateCharts();
      });
    }

    // Scenario Price Slider
    const simSlider = document.getElementById('simPriceSlider');
    if (simSlider) {
      simSlider.addEventListener('input', (e) => {
        this.isLive = false;
        this.simulatedPrice = parseFloat(e.target.value);
        this.render();
        this.updateCharts();
      });
    }

    // Scenario Price Input
    const simInput = document.getElementById('simPriceInput');
    if (simInput) {
      simInput.addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val) && val > 0) {
          this.isLive = false;
          this.simulatedPrice = val;
          this.render();
          this.updateCharts();
        }
      });
    }

    // Quick BTC scenarios (baseline, stress, recovery, rally)
    document.querySelectorAll('[data-scenario-price]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = parseFloat(btn.getAttribute('data-scenario-price'));
        this.isLive = false;
        this.simulatedPrice = p;
        this.render();
        this.updateCharts();
      });
    });

    // Reset to Live Button
    const resetLiveBtn = document.getElementById('resetToLiveBtn');
    if (resetLiveBtn) {
      resetLiveBtn.addEventListener('click', () => {
        this.isLive = true;
        this.simulatedPrice = this.liveBtcPrice;
        this.render();
        this.updateCharts();
      });
    }

    // Export Buttons
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', () => this.exportCsv());

    const exportJsonBtn = document.getElementById('exportJsonBtn');
    if (exportJsonBtn) exportJsonBtn.addEventListener('click', () => this.exportJson());

    const copyMarkdownBtn = document.getElementById('copyMarkdownBtn');
    if (copyMarkdownBtn) copyMarkdownBtn.addEventListener('click', () => this.copyMarkdownTable());
  }

  // --- ENTITY DETAIL MODAL ---
  openEntityModal(companyId) {
    const company = this.companies.find(c => c.id === companyId);
    const excluded = this.excludedEntities.find(e => e.id === companyId);
    if (!company && !excluded) return;

    const price = this.currentPrice;
    const data = company ? this.calculateCompanyMetrics(company, price) : this.calculateExcludedMetrics(excluded, price);
    const modal = document.getElementById('entityDetailModal');
    const content = document.getElementById('entityModalContent');
    if (!modal || !content) return;

    const usdM = (v) => `${v < 0 ? '−' : ''}${formatUsdCompact(Math.abs(v))}`;
    const tile = (label, value, sub, valueClass = '') => `
          <div class="bg-white p-4">
            <div class="kpi-label">${label}</div>
            <div class="kpi-value !text-lg ${valueClass}">${value}</div>
            <div class="kpi-sub">${sub}</div>
          </div>`;

    let tiles;
    if (!company) {
      tiles = tile('Total BTC held', data.totalBtcHeld.toLocaleString(), `${usdM(data.totalTreasuryValue)} at $${price.toFixed(2)}`)
        + tile('Gross mNAV', data.calculatedGrossMNav === null ? 'n/m' : `${data.calculatedGrossMNav.toFixed(2)}x`, `Market cap ${formatUsdCompact(data.calculatedMarketCap)}`);
    } else {
      const hasNetCash = data.calculatedNetClaimsUsd < 0;
      const valueColor = data.calculatedEvMNav < 1 ? 'text-emerald-700' : 'text-rose-700';

      let wipeoutValue = 'None';
      let wipeoutSub = 'Net cash, no senior claims';
      if (data.calculatedWipeoutPrice !== null) {
        const distancePct = (1 - data.calculatedWipeoutPrice / price) * 100;
        wipeoutValue = `$${data.calculatedWipeoutPrice.toFixed(2)}`;
        wipeoutSub = data.isUnderwater ? 'Already breached' : `BTC −${distancePct.toFixed(1)}% from here`;
      } else if (!hasNetCash) {
        wipeoutValue = '—';
        wipeoutSub = 'Not defined when all claims move with BTC';
      }

      tiles = tile('Total BTC held', data.totalBtcHeld.toLocaleString(), `${usdM(data.totalTreasuryValue)} at $${price.toFixed(2)}`)
        + tile('Senior claims', hasNetCash ? 'Net cash' : data.calculatedClaimsDisplay,
            hasNetCash ? `${usdM(-data.calculatedNetClaimsUsd)} net cash` : `${usdM(data.calculatedNetClaimsUsd)} net claims`,
            hasNetCash ? 'text-emerald-700' : 'text-amber-700')
        + tile('Common equity BTC', data.calculatedCommonBtc.toLocaleString('en-US', { maximumFractionDigits: 8 }), data.isUnderwater ? 'Equity underwater' : 'BTC-equivalent', data.isUnderwater ? 'text-rose-700' : 'text-emerald-700')
        + tile('BTC per $1,000', `${data.calculatedBtcPer1000.toFixed(6)} BTC`, `Market cap ${formatUsdCompact(data.calculatedMarketCap)}`)
        + tile('EV mNAV', `${data.calculatedEvMNav.toFixed(2)}x`, `Gross ${data.calculatedGrossMNav.toFixed(2)}x · sets status`, valueColor)
        + tile('CEBTC mNAV', data.isUnderwater ? 'n/m' : `${data.calculatedCebtcMNav.toFixed(2)}x`, 'Per $1 of equity NAV', valueColor)
        + tile('Leverage', data.isUnderwater ? 'n/m' : `${data.calculatedLeverage.toFixed(2)}x`, 'BTC value ÷ equity NAV')
        + tile('Wipe-out BTC price', wipeoutValue, wipeoutSub, data.isUnderwater ? 'text-rose-700' : '');
    }

    content.innerHTML = `
      <div class="p-6 sm:p-7">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-paper border border-gray-200 flex items-center justify-center font-display font-bold text-sm">
              ${data.symbol.substring(0,2)}
            </div>
            <div>
              <h3 class="font-display text-xl font-bold tracking-tight">${data.name}</h3>
              <p class="text-sm text-ink/50">${data.ticker} · ${data.exchange}</p>
            </div>
          </div>
          <button data-close-entity-modal class="text-ink/40 hover:text-ink p-1.5 rounded-full hover:bg-paper" aria-label="Close">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <span class="inline-flex mt-4 px-2.5 py-1 rounded-full text-xs font-medium ${data.statusClass}">${data.status}</span>

        <div class="grid grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded-2xl overflow-hidden mt-5">
          ${tiles}
        </div>
        <div class="text-xs text-ink/55 leading-relaxed mt-3 space-y-1">
          ${company ? `
          <p>Inputs (USD): debt ${usdM(data.debtUsd)} · preferred ${usdM(data.preferredUsd)} · cash ${usdM(data.cashUsd)} · ${data.marketCapShares.toLocaleString()} shares × $${formatSharePrice(data.sharePrice)}</p>
          <p>As of: BTC ${formatDate(data.asOf.btc)} · balance sheet ${formatDate(data.asOf.balanceSheet)} · shares ${formatDate(data.asOf.shares)} · price ${formatDate(data.priceDate)} close</p>` : `
          <p>${data.marketCapShares.toLocaleString()} shares × $${formatSharePrice(data.sharePrice)} (${formatDate(data.priceDate)} close)</p>`}
          <p>Sources: ${data.sources.map(s => `<a href="${s.url}" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 hover:text-ink">${s.label}</a>`).join(' · ')}</p>
        </div>
        ${data.notes?.length ? `
        <ul class="list-disc pl-4 text-xs text-ink/60 leading-relaxed mt-3 space-y-1">
          ${data.notes.map(n => `<li>${n}</li>`).join('')}
        </ul>` : ''}

        <div class="bg-paper rounded-2xl p-5 mt-4">
          <p class="eyebrow text-ink/50">${company ? `Takeaway at $${BASELINE_BTC_PRICE.toFixed(2)} BTC (${formatDate(BASELINE_DATE)})` : 'Why it is excluded'}</p>
          <p class="text-sm text-ink/75 leading-relaxed mt-2">${data.takeaway}</p>
        </div>

        <div class="flex items-center justify-between gap-4 mt-6">
          <a href="${data.profileUrl}" target="_blank" rel="noopener noreferrer" class="link-ink text-sm">View quote on Yahoo Finance →</a>
          <button data-close-entity-modal class="btn-dark">Close</button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeEntityModal() {
    const modal = document.getElementById('entityDetailModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  // --- EXPORT TOOLS ---
  exportCsv() {
    const data = this.getProcessedData();
    const fx = (v, digits = 2) => (v === null || v === undefined) ? 'N/A' : v.toFixed(digits);
    const raw = (v) => (v === null || v === undefined) ? 'N/A' : Math.round(v);
    const btc = (v) => (v === null || v === undefined) ? 'N/A' : v.toFixed(8);
    let csv = `BTC Price USD,${this.currentPrice.toFixed(2)}\nCalculation Mode,${this.calculationMode}\n`;
    csv += "Entity,Ticker,Total BTC Exposure,Debt USD,Preferred USD,Cash USD,Net Senior Claims USD,Senior Claims %,Common Equity BTC,Gross mNAV,EV mNAV,CEBTC mNAV,BTC per $1000,Leverage,Wipe-out BTC Price USD,Status,Market Cap USD,Market Cap Shares,Share Price USD,Price Date,BTC Input Date,Balance Sheet Date,Shares Input Date\n";
    data.forEach(d => {
      csv += `"${d.name}","${d.ticker}",${d.totalBtcHeld},${raw(d.debtUsd)},${raw(d.preferredUsd)},${raw(d.cashUsd)},${raw(d.calculatedNetClaimsUsd)},"${d.calculatedClaimsDisplay}",${btc(d.calculatedCommonBtc)},${fx(d.calculatedGrossMNav)},${fx(d.calculatedEvMNav)},${fx(d.calculatedCebtcMNav)},${fx(d.calculatedBtcPer1000, 8)},${fx(d.calculatedLeverage)},${fx(d.calculatedWipeoutPrice)},"${d.status}",${Math.round(d.calculatedMarketCap)},${d.marketCapShares},${formatSharePrice(d.sharePrice)},${d.priceDate},${d.asOf?.btc ?? 'N/A'},${d.asOf?.balanceSheet ?? 'N/A'},${d.asOf?.shares ?? 'N/A'}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `BTC_CEBTC_Matrix_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportJson() {
    const data = this.getProcessedData();
    const payload = {
      timestamp: new Date().toISOString(),
      btcSpotPrice: this.currentPrice,
      isLivePrice: this.isLive,
      calculationMode: this.calculationMode,
      matrix: data
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `BTC_CEBTC_Matrix_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  copyMarkdownTable() {
    const data = this.getProcessedData();
    const isExcluded = (d) => d.statusType === 'excluded';
    const multiple = (d, v) => isExcluded(d) ? 'N/A' : v === null ? 'n/m' : `${v.toFixed(2)}x`;
    let md = `Treasury-only BTC model; financial inputs and shares: June 30, 2026. BTC spot: $${this.currentPrice.toFixed(2)}; ${this.isLive ? 'live' : 'scenario'}, ${this.calculationMode} mode.\n\n| Entity | Total BTC Exposure | Senior Claims % | Common Equity BTC | EV mNAV (Status) | CEBTC mNAV | BTC per $1,000 | Leverage | Wipe-out BTC Price |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    data.forEach(d => {
      const ev = isExcluded(d) ? 'N/A' : `${d.calculatedEvMNav.toFixed(2)}x (${d.status})`;
      const btc1000 = isExcluded(d) ? 'N/A' : `${d.calculatedBtcPer1000.toFixed(6)} BTC`;
      const common = isExcluded(d) ? 'N/A' : d.calculatedCommonBtc.toLocaleString('en-US', { maximumFractionDigits: 8 });
      const wipeout = isExcluded(d) ? 'N/A' : d.calculatedWipeoutPrice !== null ? `$${d.calculatedWipeoutPrice.toFixed(2)}` : d.calculatedNetClaimsUsd < 0 ? 'None (net cash)' : '—';
      md += `| ${d.name} (${d.ticker}) | ${d.totalBtcHeld.toLocaleString()} | ${d.calculatedClaimsDisplay} | ${common} | ${ev} | ${multiple(d, d.calculatedCebtcMNav)} | ${btc1000} | ${multiple(d, d.calculatedLeverage)} | ${wipeout} |\n`;
    });

    navigator.clipboard.writeText(md).then(() => {
      const btn = document.getElementById('copyMarkdownBtn');
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = `<span>Copied to Clipboard!</span>`;
        setTimeout(() => { btn.innerHTML = orig; }, 2000);
      }
    });
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.cebtcApp = new CebtcDashboard();
});
