const ASSET_VERSION = "2026-05-11-findings";

(async function init() {
  const [data, world, product, validation] = await Promise.all([
    d3.json("./data/processed/dashboard-data.json"),
    d3.json("./data/processed/world.geojson"),
    d3.json(`./data/product-plans.json?v=${ASSET_VERSION}`).catch(() => null),
    d3.json("./data/processed/validation-report.json").catch(() => null),
  ]);

  const selectedIso = initialCountryIso(data);
  const comparisonIso = data.countries.find((country) => country.iso3 !== selectedIso)?.iso3 || selectedIso;
  const state = {
    data,
    world,
    product: product || fallbackProductConfig(),
    validation,
    entitlement: null,
    selectedIso,
    compareIsoA: selectedIso,
    compareIsoB: comparisonIso,
  };
  state.entitlement = await loadEntitlement(state.product);

  populateCountrySelect(state);
  renderAll(state);
  attachDashboardActions(state);
  attachQuestionBar(state);
  restoreInitialHashScroll();
  window.addEventListener("resize", debounce(() => renderCharts(state), 150));
  window.addEventListener("scroll", hideTooltip, { passive: true });
})();

const CONTINENT_LABELS = {
  A: "Africa",
  E: "Europe",
  M: "Americas",
  O: "Oceania",
  S: "Asia",
};
const CONTINENT_ORDER = ["Africa", "Asia", "Europe", "Americas", "Oceania"];
const SOURCE_LINKS = {
  inform: { label: "INFORM", url: "https://drmkc.jrc.ec.europa.eu/inform-index" },
  thinkHazard: { label: "ThinkHazard", url: "https://thinkhazard.org/" },
  owidUndrr: { label: "UNDRR / OWID", url: "https://ourworldindata.org/grapher/direct-disaster-economic-loss" },
  worldBankDisplacement: { label: "WB / IDMC", url: "https://data.worldbank.org/indicator/VC.IDP.NWDS" },
  oecdCrs: { label: "OECD CRS", url: "https://data-explorer.oecd.org/" },
  worldRiskIndex: { label: "WorldRiskIndex", url: "https://weltrisikobericht.de/worldriskreport/" },
  ndGain: { label: "ND-GAIN", url: "https://gain-new.crc.nd.edu/about/download" },
  aqueduct: { label: "WRI Aqueduct", url: "https://www.wri.org/data/aqueduct-40-country-rankings" },
  worldBankProjects: { label: "World Bank", url: "https://projects.worldbank.org/" },
  gcf: { label: "GCF", url: "https://data.greenclimate.fund/" },
  ocha: { label: "OCHA FTS", url: "https://fts.unocha.org/" },
};
const THEME = {
  ink: "#111111",
  muted: "#4d4d4d",
  panel: "#fffaf7",
  hairline: "#d7c5ba",
  greenDark: "#06402B",
  redDark: "#400606",
  greenLight: "#71BFA2",
  warm: "#BF8D71",
  mapNoData: "#efe4de",
  riskScale: ["#f8fbf8", "#dcefe6", "#71BFA2", "#BF8D71", "#400606", "#111111"],
};

function renderAll(state) {
  renderHeader(state.data);
  renderKpis(state.data);
  renderTimeframeNotes(state.data);
  renderTrustStatus(state);
  renderCoverageStatus(state);
  renderCountryProfile(state);
  renderFinanceProfile(state);
  renderCompareView(state);
  renderPremiumAccess(state);
  renderSources(state.data.sources);
  renderCharts(state);
  renderDataTables(state);
}

function renderCharts(state) {
  drawRiskMap("#risk-map", state);
  drawHazardSummary("#hazard-summary-chart", state.data.series.thinkHazardSummary);
  drawTopRisk("#top-risk-chart", state.data.countries);
  drawEvents("#events-chart", state.data.series.disasterEvents);
  drawDamage("#damage-chart", state.data.series.economicDamage);
  drawScatter("#scatter-chart", state.data.countries, state.selectedIso);
  drawFinanceGap("#finance-gap-chart", state.data.countries);
}

function renderDataTables(state) {
  const countries = state.data.countries;
  const highest = countries[0];
  setPlainText(
    "#risk-map-summary",
    `INFORM country risk map. Highest risk country is ${highest?.name || "not available"} with score ${fmtFixed(highest?.risk, 1)}. Median country risk is ${fmtFixed(state.data.summary?.medianRisk, 1)}.`,
  );
  renderTable("#risk-map-table", "inform-risk-by-country.csv", countries, [
    column("iso3", "ISO3"),
    column("name", "Country"),
    column("continent", "Continent", (row) => countryContinent(row)),
    column("risk", "INFORM risk", (row) => fmtFixed(row.risk, 1)),
    column("hazardExposure", "Hazard/exposure", (row) => fmtFixed(row.hazardExposure, 1)),
    column("vulnerability", "Vulnerability", (row) => fmtFixed(row.vulnerability, 1)),
    column("lackCopingCapacity", "Lack of coping", (row) => fmtFixed(row.lackCopingCapacity, 1)),
  ]);

  const hazards = state.data.series.thinkHazardSummary || [];
  const topHazard = hazards[0];
  setPlainText(
    "#hazard-summary-summary",
    `ThinkHazard summary. ${topHazard?.name || "The leading hazard"} has ${fmtNumber(topHazard?.high)} countries classified high.`,
  );
  renderTable("#hazard-summary-table", "thinkhazard-country-counts.csv", hazards, [
    column("name", "Hazard"),
    column("high", "High countries", (row) => fmtNumber(row.high)),
    column("medium", "Medium countries", (row) => fmtNumber(row.medium)),
    column("low", "Low countries", (row) => fmtNumber(row.low)),
    column("total", "Countries with record", (row) => fmtNumber(row.total)),
  ]);

  const topRisk = countries.slice(0, 15);
  setPlainText(
    "#top-risk-summary",
    `Top risk ranking. ${topRisk.slice(0, 3).map((country) => `${country.name} ${fmtFixed(country.risk, 1)}`).join(", ")} are the three highest-scoring countries.`,
  );
  renderTable("#top-risk-table", "top-inform-risk-countries.csv", topRisk, [
    column("rank", "Rank", (_, index) => index + 1),
    column("iso3", "ISO3"),
    column("name", "Country"),
    column("risk", "INFORM risk", (row) => fmtFixed(row.risk, 1)),
  ]);

  const financeGap = financeGapRows(countries);
  setPlainText(
    "#finance-gap-summary",
    `Finance gap screen. The table lists high-risk countries with the lowest reported DRR-related ODA disbursement per INFORM risk point.`,
  );
  renderTable("#finance-gap-table", "drr-finance-per-risk-point.csv", financeGap, [
    column("iso3", "ISO3"),
    column("name", "Country"),
    column("risk", "INFORM risk", (row) => fmtFixed(row.risk, 1)),
    column("drrOdaDisbursementUsd", "DRR ODA disb.", (row) => fmtMoney(row.drrOdaDisbursementUsd, row.drrOdaYear)),
    column("financePerRisk", "USD per risk point", (row) => fmtMoney(row.financePerRisk)),
  ]);

  const latestEventYear = d3.max(state.data.series.disasterEvents, (row) => row.year);
  const latestEvents = state.data.series.disasterEvents
    .filter((row) => row.year === latestEventYear)
    .sort((a, b) => b.value - a.value);
  setPlainText("#events-summary", `Reported disaster event counts by hazard type. Latest table year is ${latestEventYear}.`);
  renderTable("#events-table", "reported-disasters-latest-year.csv", latestEvents, [
    column("year", "Year"),
    column("type", "Hazard type"),
    column("value", "Reported events", (row) => fmtNumber(row.value)),
  ]);

  const damageRows = state.data.series.economicDamage
    .filter((row) => row.type === "All disasters")
    .sort((a, b) => b.year - a.year)
    .slice(0, 15);
  setPlainText("#damage-summary", `Economic damage table. Latest all-disaster damage year is ${damageRows[0]?.year || "not available"}.`);
  renderTable("#damage-table", "economic-damage-latest-years.csv", damageRows, [
    column("year", "Year"),
    column("type", "Type"),
    column("value", "Damage", (row) => fmtMoney(row.value)),
  ]);

  const scatterRows = countries
    .filter((country) => Number.isFinite(country.risk) && Number.isFinite(country.worldRiskIndexValue))
    .slice(0, 25);
  setPlainText("#scatter-summary", "INFORM risk compared with WorldRiskIndex for countries where both measures are available.");
  renderTable("#scatter-table", "inform-versus-worldriskindex.csv", scatterRows, [
    column("iso3", "ISO3"),
    column("name", "Country"),
    column("risk", "INFORM risk", (row) => fmtFixed(row.risk, 1)),
    column("worldRiskIndexValue", "WorldRiskIndex", (row) => fmtYearValue(row.worldRiskIndexValue, row.worldRiskIndexYear, 2)),
    column("disasterDisplacementValue", "Disaster displacement", (row) => fmtYearValue(row.disasterDisplacementValue, row.disasterDisplacementYear)),
  ]);
}

function column(key, label, format = null) {
  return { key, label, format };
}

function renderTable(selector, filename, rows, columns) {
  const node = document.querySelector(selector);
  if (!node) return;
  const csvRows = rows.map((row, index) =>
    Object.fromEntries(columns.map((item) => [item.label, item.format ? item.format(row, index) : row[item.key]])),
  );
  const csv = toCsv(csvRows, columns.map((item) => item.label));
  node.innerHTML = `
    <a class="table-download" href="data:text/csv;charset=utf-8,${encodeURIComponent(csv)}" download="${escapeHtml(filename)}">Download this table CSV</a>
    <table class="data-table">
      <thead>
        <tr>${columns.map((item) => `<th scope="col">${escapeHtml(item.label)}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row, index) => `
              <tr>
                ${columns
                  .map((item) => `<td>${escapeHtml(item.format ? item.format(row, index) : row[item.key])}</td>`)
                  .join("")}
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function setPlainText(selector, text) {
  const node = document.querySelector(selector);
  if (node) node.textContent = text;
}

function financeGapRows(countries) {
  return countries
    .filter(
      (country) =>
        Number.isFinite(country.risk) &&
        country.risk >= 5 &&
        Number.isFinite(country.drrOdaDisbursementUsd),
    )
    .map((country) => ({
      ...country,
      financePerRisk: country.drrOdaDisbursementUsd / Math.max(country.risk, 0.1),
    }))
    .sort((a, b) => a.financePerRisk - b.financePerRisk || b.risk - a.risk)
    .slice(0, 14);
}

function renderHeader(data) {
  const published = data.informWorkflow.publishedAt
    ? formatDate(data.informWorkflow.publishedAt)
    : "latest available";
  document.querySelector("#data-edition").textContent = `${data.informWorkflow.name}`;
  document.querySelector("#data-note").textContent =
    `INFORM published ${published}. Dashboard generated ${formatDate(data.generatedAt)}.`;
}

function renderKpis(data) {
  document.querySelector("#kpi-countries").textContent = fmtNumber(data.summary.countryCount);
  document.querySelector("#kpi-median-risk").textContent = fmtFixed(data.summary.medianRisk, 1);
  document.querySelector("#kpi-highest-risk").textContent =
    `${data.summary.highestRiskCountry.name} ${fmtFixed(data.summary.highestRiskCountry.risk, 1)}`;
  document.querySelector("#kpi-events").textContent =
    `${fmtNumber(data.summary.latestGlobalDisasterEvents.value)} in ${data.summary.latestGlobalDisasterEvents.year}`;
  document.querySelector("#kpi-finance").textContent = fmtMoney(
    data.summary.latestDrrFinance?.disbursementUsd,
    data.summary.latestDrrFinance?.year,
  );
}

function renderTimeframeNotes(data) {
  const informEdition = data.informWorkflow?.name || "latest INFORM Risk edition";
  const informPublished = data.informWorkflow?.publishedAt
    ? `, published ${formatDate(data.informWorkflow.publishedAt)}`
    : "";
  const generatedDate = formatDate(data.generatedAt);
  const disasterExtent = yearExtent(data.series?.disasterEvents);
  const damageExtent = yearExtent(data.series?.economicDamage);
  const disasterRange = formatYearRange(disasterExtent);
  const damageRange = formatYearRange(damageExtent);
  const latestDisasterYear = data.summary?.latestGlobalDisasterEvents?.year || disasterExtent.max || "latest available";
  const financeYear =
    data.summary?.latestDrrFinance?.year || mostCommonYear(data.countries, "drrOdaYear") || "latest available";
  const worldRiskYear = mostCommonYear(data.countries, "worldRiskIndexYear") || "latest available";
  const ochaYear = mostCommonYear(data.countries, "ochaHumanitarianYear") || "latest available";

  const inform = escapeHtml(informEdition);
  const published = escapeHtml(informPublished);
  const latestEvents = escapeHtml(latestDisasterYear);
  const crsYear = escapeHtml(financeYear);
  const wriYear = escapeHtml(worldRiskYear);
  const responseYear = escapeHtml(ochaYear);

  setInfoNote(
    "#kpi-timeframe-note",
    `<strong>What timeframe is this?</strong> Risk scores use ${inform}; the disaster count is ${latestEvents}; DRR-related ODA uses OECD CRS ${crsYear}. Other country metrics show their own year in parentheses where available. Dashboard generated ${escapeHtml(generatedDate)}.`,
  );
  setInfoNote(
    "#risk-map-note",
    `<strong>Timeframe:</strong> ${inform}${published}. <strong>How to read it:</strong> this is a current 0-10 risk index, not a count of disasters in ${latestEvents}. Darker countries have higher combined hazard, exposure, vulnerability, and coping-capacity risk.`,
  );
  setInfoNote(
    "#hazard-summary-note",
    `<strong>Timeframe:</strong> latest ThinkHazard country classifications included in this build. <strong>How to read it:</strong> bars count countries rated high or medium for each hazard. These are screening categories, not annual event totals.`,
  );
  setInfoNote(
    "#top-risk-note",
    `<strong>Timeframe:</strong> ${inform}. <strong>How to read it:</strong> longer bars mean higher current risk on the INFORM 0-10 scale. Labels show each country's score in this edition.`,
  );
  setInfoNote(
    "#country-profile-note",
    `<strong>Timeframe:</strong> mixed-source snapshot. INFORM uses ${inform}; ODA uses CRS ${crsYear}; WorldRiskIndex uses ${wriYear}; OCHA response funding uses ${responseYear}.`,
  );
  setInfoNote(
    "#finance-profile-note",
    `<strong>Timeframe:</strong> OECD CRS disbursements and commitments are ${crsYear}; World Bank and GCF records are cumulative project signals in the downloaded data; OCHA FTS is ${responseYear} response-funding context. This is international DRR-related finance, not total country DRR spending.`,
  );
  setInfoNote(
    "#finance-gap-note",
    `<strong>Timeframe:</strong> CRS ${crsYear} divided by ${inform}. <strong>How to read it:</strong> lower bars flag high-risk countries receiving less reported international DRR-related ODA per point of current risk, before domestic budgets, private finance, and mainstreamed project components are added.`,
  );
  setInfoNote(
    "#events-note",
    `<strong>Timeframe:</strong> annual EM-DAT-derived event counts for ${escapeHtml(disasterRange)}; the headline KPI uses ${latestEvents}. <strong>How to read it:</strong> stacked areas show reported disaster counts by hazard type, so a taller year means more recorded events, not necessarily larger losses.`,
  );
  setInfoNote(
    "#damage-note",
    `<strong>Timeframe:</strong> annual reported direct economic damage for ${escapeHtml(damageRange)}, shown in current US dollars. <strong>How to read it:</strong> spikes identify years with large reported losses; values are not inflation-adjusted and reporting practices change over time.`,
  );
  setInfoNote(
    "#scatter-note",
    `<strong>Timeframe:</strong> ${inform} versus WorldRiskIndex ${wriYear}. <strong>How to read it:</strong> countries higher and farther right are high-risk in both models; larger dots indicate more recent disaster displacement where available.`,
  );
}

function initialCountryIso(data) {
  const countries = Array.isArray(data?.countries) ? data.countries : [];
  const params = new URLSearchParams(window.location.search);
  const requested = normalizeSearch(params.get("country") || "");
  const requestedCountry = requested
    ? countries.find(
        (country) =>
          normalizeSearch(country.iso3) === requested ||
          normalizeSearch(country.name) === requested,
      )
    : null;
  if (requestedCountry) return requestedCountry.iso3;
  if (countries.some((country) => country.iso3 === "PHL")) return "PHL";
  return countries[0]?.iso3 || "";
}

function populateCountrySelect(state) {
  const countries = [...state.data.countries].sort((a, b) => a.name.localeCompare(b.name));
  const continentSelect = document.querySelector("#continent-select");
  const selectedCountry = state.data.countries.find((country) => country.iso3 === state.selectedIso);
  const initialContinent = "";

  if (continentSelect) {
    const continents = orderedContinents(state.data.countries);
    continentSelect.innerHTML = [
      `<option value="">All continents</option>`,
      ...continents.map((continent) => `<option value="${escapeHtml(continent)}">${escapeHtml(continent)}</option>`),
    ].join("");
    continentSelect.value = initialContinent;
    continentSelect.addEventListener("change", () => {
      updateCountryDatalist(state, continentSelect.value);
      const current = state.data.countries.find((country) => country.iso3 === state.selectedIso);
      if (continentSelect.value && current && countryContinent(current) !== continentSelect.value) {
        const nextCountry = countries
          .filter((country) => countryContinent(country) === continentSelect.value)
          .sort((a, b) => b.risk - a.risk || a.name.localeCompare(b.name))[0];
        if (nextCountry) setSelectedCountry(state, nextCountry.iso3, { preserveContinent: true });
      }
    });
  }

  populateMainCountryFilter(state, selectedCountry);

  updateCountryDatalist(state, initialContinent);
  populateCompareControls(state);
}

function populateMainCountryFilter(state, selectedCountry) {
  const filter = document.querySelector("#country-filter");
  const toggle = document.querySelector("#country-filter-toggle");
  const panel = document.querySelector("#country-filter-panel");
  const input = document.querySelector("#quick-country-input");
  if (!filter || !toggle || !panel || !input) return;

  input.value = selectedCountry?.name || "";
  syncCountryFilterLabel(selectedCountry?.name || "");

  const openPanel = () => {
    panel.hidden = false;
    filter.classList.add("country-filter-open");
    toggle.setAttribute("aria-expanded", "true");
    input.value = countryByIso(state, state.selectedIso)?.name || "";
    window.requestAnimationFrame(() => {
      input.focus();
      input.select();
    });
  };

  const closePanel = (options = {}) => {
    panel.hidden = true;
    filter.classList.remove("country-filter-open");
    toggle.setAttribute("aria-expanded", "false");
    if (options.restore !== false) input.value = countryByIso(state, state.selectedIso)?.name || "";
    if (options.focusToggle) toggle.focus();
  };

  toggle.addEventListener("click", () => {
    if (panel.hidden) openPanel();
    else closePanel({ focusToggle: true });
  });

  document.addEventListener("click", (event) => {
    if (!filter.contains(event.target)) closePanel();
  });

  filter.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    closePanel({ focusToggle: true });
  });

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const country = countryFromSearchValue(state, input.value, { allowPartial: true });
    if (!country) return;
    event.preventDefault();
    setSelectedCountry(state, country.iso3, { scrollToCountry: true });
    closePanel({ focusToggle: true });
  });

  input.addEventListener("blur", () => {
    window.setTimeout(() => {
      if (filter.contains(document.activeElement)) return;
      const country = countryFromSearchValue(state, input.value, { allowPartial: true });
      if (country) setSelectedCountry(state, country.iso3);
      else syncCountryControls(state, { preserveContinent: true });
      closePanel();
    }, 0);
  });
}

function setSelectedCountry(state, iso3, options = {}) {
  if (!state.data.countries.some((country) => country.iso3 === iso3)) return;
  state.selectedIso = iso3;
  state.compareIsoA = iso3;
  syncCountryControls(state, { preserveContinent: Boolean(options.preserveContinent) });
  renderCountryProfile(state);
  renderFinanceProfile(state);
  renderCompareView(state);
  renderPremiumAccess(state);
  drawRiskMap("#risk-map", state);
  hideTooltip();

  if (options.scrollToCountry) {
    document.querySelector("#country-view")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function populateCompareControls(state) {
  const inputA = document.querySelector("#compare-country-a");
  const inputB = document.querySelector("#compare-country-b");
  const swap = document.querySelector("#swap-compare");
  if (!inputA || !inputB) return;

  inputA.value = countryByIso(state, state.compareIsoA)?.name || "";
  inputB.value = countryByIso(state, state.compareIsoB)?.name || "";

  [
    [inputA, "compareIsoA"],
    [inputB, "compareIsoB"],
  ].forEach(([input, field]) => {
    input.addEventListener("input", () => {
      const country = countryFromSearchValue(state, input.value, { ignoreContinent: true });
      if (!country) return;
      state[field] = country.iso3;
      renderCompareView(state);
    });
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      const country = countryFromSearchValue(state, input.value, {
        allowPartial: true,
        ignoreContinent: true,
      });
      if (!country) return;
      event.preventDefault();
      state[field] = country.iso3;
      input.value = country.name;
      renderCompareView(state);
    });
    input.addEventListener("blur", () => {
      const country = countryFromSearchValue(state, input.value, {
        allowPartial: true,
        ignoreContinent: true,
      });
      if (country) state[field] = country.iso3;
      input.value = countryByIso(state, state[field])?.name || "";
      renderCompareView(state);
    });
  });

  swap?.addEventListener("click", () => {
    [state.compareIsoA, state.compareIsoB] = [state.compareIsoB, state.compareIsoA];
    inputA.value = countryByIso(state, state.compareIsoA)?.name || "";
    inputB.value = countryByIso(state, state.compareIsoB)?.name || "";
    renderCompareView(state);
  });
}

function syncCountryControls(state, options = {}) {
  const country = state.data.countries.find((item) => item.iso3 === state.selectedIso);
  if (!country) return;

  const continentSelect = document.querySelector("#continent-select");
  if (continentSelect && !options.preserveContinent) {
    continentSelect.value = countryContinent(country);
  }
  updateCountryDatalist(state, continentSelect?.value || "");

  document.querySelectorAll("#quick-country-input").forEach((input) => {
    input.value = country.name;
  });
  syncCountryFilterLabel(country.name);
  const compareA = document.querySelector("#compare-country-a");
  if (compareA) compareA.value = country.name;
}

function syncCountryFilterLabel(label) {
  const current = document.querySelector("#country-filter-current");
  if (current) current.textContent = label || "Choose country";
}

function updateCountryDatalist(state, continent = "") {
  const datalist = document.querySelector("#country-options");
  if (!datalist) return;
  const countries = countriesForContinent(state.data.countries, continent);
  datalist.innerHTML = countries
    .map(
      (country) =>
        `<option value="${escapeHtml(country.name)}" label="${escapeHtml(`${countryContinent(country)} - ${country.iso3}`)}"></option>`,
    )
    .join("");
}

function countryFromSearchValue(state, value, options = {}) {
  const query = normalizeSearch(value);
  if (!query) return null;

  const continent = options.ignoreContinent ? "" : document.querySelector("#continent-select")?.value || "";
  const filtered = countriesForContinent(state.data.countries, continent);
  return (
    countryMatch(filtered, query, options) ||
    countryMatch(state.data.countries, query, options)
  );
}

function countryMatch(countries, query, options = {}) {
  const exact = countries.find(
    (country) =>
      normalizeSearch(country.name) === query ||
      normalizeSearch(country.iso3) === query ||
      normalizeSearch(`${country.name} ${country.iso3}`) === query,
  );
  if (exact || !options.allowPartial) return exact || null;

  const matches = countries
    .filter(
      (country) =>
        normalizeSearch(country.name).includes(query) ||
        normalizeSearch(country.iso3).startsWith(query),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  return matches.length === 1 ? matches[0] : null;
}

function countriesForContinent(countries, continent = "") {
  return [...countries]
    .filter((country) => !continent || countryContinent(country) === continent)
    .sort(compareCountryForSearch);
}

function orderedContinents(countries) {
  const available = new Set(countries.map(countryContinent));
  return CONTINENT_ORDER.filter((continent) => available.has(continent));
}

function compareCountryForSearch(a, b) {
  const continentCompare = CONTINENT_ORDER.indexOf(countryContinent(a)) - CONTINENT_ORDER.indexOf(countryContinent(b));
  return continentCompare || a.name.localeCompare(b.name);
}

function countryContinent(country) {
  return CONTINENT_LABELS[String(country?.group || "").slice(0, 1)] || "Other";
}

function countryByIso(state, iso3) {
  return state.data.countries.find((country) => country.iso3 === iso3) || null;
}

function normalizeSearch(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function restoreInitialHashScroll() {
  scrollToInitialHash();
  requestAnimationFrame(() => requestAnimationFrame(scrollToInitialHash));
  window.setTimeout(scrollToInitialHash, 120);
}

function scrollToInitialHash() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  const previousScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  target.scrollIntoView({ block: "start" });
  document.documentElement.style.scrollBehavior = previousScrollBehavior;
}

function renderTrustStatus(state) {
  const panel = document.querySelector("#trust-status");
  if (!panel) return;
  const data = state.data;
  const validation = state.validation;
  const generated = formatDate(data.generatedAt);
  const sourceCount = Array.isArray(data.sources) ? data.sources.length : 0;
  const validationStatus = validation?.status || "not bundled";
  const warningCount = validation?.warnings?.length || 0;
  const nextRefresh = nextWeeklyRefreshLabel(data.generatedAt);

  panel.innerHTML = `
    <article>
      <span>Last refreshed</span>
      <strong>${escapeHtml(generated)}</strong>
      <p>Generated from the public download workflow.</p>
    </article>
    <article>
      <span>Source coverage</span>
      <strong>${fmtNumber(sourceCount)} sources</strong>
      <p>${fmtNumber(data.summary?.countryCount)} scored countries in the current build.</p>
    </article>
    <article>
      <span>Validation</span>
      <strong>${escapeHtml(validationStatus)}</strong>
      <p>${warningCount ? `${fmtNumber(warningCount)} warning(s) require review.` : "Automated checks run before refresh commits."}</p>
    </article>
    <article>
      <span>Next scheduled refresh</span>
      <strong>${escapeHtml(nextRefresh)}</strong>
      <p>GitHub Actions is configured for weekly public-data refreshes.</p>
    </article>
  `;
}

function renderCoverageStatus(state) {
  const panel = document.querySelector("#coverage-status");
  if (!panel) return;
  const rows = metricCoverageRows(state.data.countries);
  panel.innerHTML = `
    <div class="coverage-copy">
      <span>Coverage and caveats</span>
      <strong>Know where the public data is strong, and where it is thin</strong>
      <p>Coverage means the current public build contains a usable value or signal for the metric. Project-signal rows count countries with at least one linked public project record.</p>
    </div>
    <div class="coverage-grid">
      ${rows
        .map(
          (row) => `
            <article>
              <span>${escapeHtml(row.label)}</span>
              <strong>${fmtNumber(row.covered)}/${fmtNumber(row.total)}</strong>
              <p>${fmtNumber(Math.round(row.ratio * 100))}% ${escapeHtml(row.note)}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function metricCoverageRows(countries) {
  const total = Array.isArray(countries) ? countries.length : 0;
  const rows = [
    {
      label: "INFORM risk",
      note: "country risk scores",
      covered: countries.filter((country) => Number.isFinite(country.risk)).length,
    },
    {
      label: "DRR ODA",
      note: "countries with reported CRS DRR-related disbursements",
      covered: countries.filter((country) => Number.isFinite(country.drrOdaDisbursementUsd)).length,
    },
    {
      label: "Direct economic loss",
      note: "countries with latest UNDRR/OWID loss records",
      covered: countries.filter((country) => Number.isFinite(country.lossUsdValue)).length,
    },
    {
      label: "National DRR strategy",
      note: "countries with Sendai/SDG strategy indicators",
      covered: countries.filter((country) => Number.isFinite(country.nationalStrategyValue)).length,
    },
    {
      label: "World Bank signals",
      note: "countries with at least one DRM-tagged project",
      covered: countries.filter((country) => (country.worldBankDrmProjectCount || 0) > 0).length,
    },
    {
      label: "GCF signals",
      note: "countries with at least one DRR/resilience-linked GCF project",
      covered: countries.filter((country) => (country.gcfDrrProjectCount || 0) > 0).length,
    },
  ];
  return rows.map((row) => ({
    ...row,
    total,
    ratio: total ? row.covered / total : 0,
  }));
}

function nextWeeklyRefreshLabel(generatedAt) {
  const base = generatedAt ? new Date(generatedAt) : new Date();
  if (Number.isNaN(base.getTime())) return "weekly";
  const next = new Date(base);
  next.setUTCDate(next.getUTCDate() + ((8 - next.getUTCDay()) % 7 || 7));
  next.setUTCHours(4, 17, 0, 0);
  return formatDate(next.toISOString());
}

function renderCountryProfile(state) {
  const country = state.data.countries.find((item) => item.iso3 === state.selectedIso);
  const profile = document.querySelector("#country-profile");
  if (!country) return;

  const highHazards = fmtHazardList(country.thinkHazard?.highHazards);
  const highlightMetrics = [
    metric("Hazard and exposure", fmtFixed(country.hazardExposure, 1), false, "inform"),
    metric("Vulnerability", fmtFixed(country.vulnerability, 1), false, "inform"),
    metric("Lack of coping capacity", fmtFixed(country.lackCopingCapacity, 1), false, "inform"),
    metric(
      "Disaster displacement",
      fmtYearValue(country.disasterDisplacementValue, country.disasterDisplacementYear),
      false,
      "worldBankDisplacement",
    ),
    metric("Direct economic loss", fmtMoney(country.lossUsdValue, country.lossUsdYear), false, "owidUndrr"),
    metric("DRR ODA disb.", fmtMoney(country.drrOdaDisbursementUsd, country.drrOdaYear), false, "oecdCrs"),
  ].join("");
  const detailMetrics = [
    metric("Natural hazards", fmtFixed(country.naturalHazards, 1), false, "inform"),
    metric("Human hazards", fmtFixed(country.humanHazards, 1), false, "inform"),
    metric("Direct loss / GDP", fmtPct(country.lossGdpValue, country.lossGdpYear), false, "owidUndrr"),
    metric("National DRR strategy", fmtStrategy(country.nationalStrategyValue, country.nationalStrategyYear), false, "owidUndrr"),
    metric("Local DRR coverage", fmtPct(country.localStrategyValue, country.localStrategyYear), false, "owidUndrr"),
    metric("Natural disaster deaths", fmtYearValue(country.deathsValue, country.deathsYear), false, "owidUndrr"),
    metric("DRR ODA commit.", fmtMoney(country.drrOdaCommitmentUsd, country.drrOdaYear), false, "oecdCrs"),
    metric("GCF DRR/resilience", fmtNumber(country.gcfDrrProjectCount), false, "gcf"),
    metric("GCF linked budget", fmtMoney(country.gcfDrrLinkedTotalBudgetUsd), false, "gcf"),
    metric("OCHA response funding", fmtMoney(country.ochaHumanitarianFundingUsd, country.ochaHumanitarianYear), false, "ocha"),
    metric("WorldRiskIndex", fmtYearValue(country.worldRiskIndexValue, country.worldRiskIndexYear, 2), false, "worldRiskIndex"),
    metric("WRI exposure", fmtFixed(country.worldRiskExposureValue, 1), false, "worldRiskIndex"),
    metric("WRI vulnerability", fmtFixed(country.worldRiskVulnerabilityValue, 1), false, "worldRiskIndex"),
    metric("WRI susceptibility", fmtFixed(country.worldRiskSusceptibilityValue, 1), false, "worldRiskIndex"),
    metric("WRI lack of coping", fmtFixed(country.worldRiskLackCopingValue, 1), false, "worldRiskIndex"),
    metric("WRI lack of adaptation", fmtFixed(country.worldRiskLackAdaptationValue, 1), false, "worldRiskIndex"),
    metric("ND-GAIN score", fmtYearValue(country.ndGainValue, country.ndGainYear, 1), false, "ndGain"),
    metric("ND-GAIN vulnerability", fmtFixed(country.ndGainVulnerabilityValue, 3), false, "ndGain"),
    metric("ND-GAIN readiness", fmtFixed(country.ndGainReadinessValue, 3), false, "ndGain"),
    metric("Water stress", fmtAqueduct(country.waterStressScore, country.waterStressLabel), false, "aqueduct"),
    metric("Water stress 2050", fmtAqueduct(country.waterStress2050Score, country.waterStress2050Label), false, "aqueduct"),
    metric("River flood risk", fmtAqueduct(country.riverFloodRiskScore, country.riverFloodRiskLabel), false, "aqueduct"),
    metric("Drought risk", fmtAqueduct(country.droughtRiskScore, country.droughtRiskLabel), false, "aqueduct"),
    metric("WB DRM projects", fmtNumber(country.worldBankDrmProjectCount), false, "worldBankProjects"),
  ].join("");

  profile.innerHTML = `
    <div class="profile-summary">
      <div class="profile-main">
        <span>${country.iso3}</span>
        <strong>${fmtFixed(country.risk, 1)}</strong>
        <span>INFORM risk score</span>
      </div>
      <div class="profile-continent">
        <span>Continent</span>
        <strong>${escapeHtml(countryContinent(country))}</strong>
      </div>
      <div class="profile-hazards">
        <span>High hazards</span>
        <strong>${escapeHtml(highHazards)}</strong>
        ${sourceLink("thinkHazard")}
      </div>
    </div>
    <div class="metric-grid metric-grid-highlight">
      ${highlightMetrics}
    </div>
    <details class="metric-details">
      <summary>Show all country indicators</summary>
      <div class="metric-grid metric-grid-compact">
        ${detailMetrics}
      </div>
    </details>
  `;
  profile.querySelector(".metric-details")?.removeAttribute("open");
}

function metric(label, value, wide = false, sourceId = "") {
  return `
    <div class="metric${wide ? " metric-wide" : ""}">
      <span>${escapeHtml(label)}</span>
      <strong>${value}</strong>
      ${sourceLink(sourceId)}
    </div>
  `;
}

function sourceLink(sourceId) {
  const source = SOURCE_LINKS[sourceId];
  if (!source) return "";
  return `<a class="metric-source" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">Source: ${escapeHtml(source.label)}</a>`;
}

function renderFinanceProfile(state) {
  const country = state.data.countries.find((item) => item.iso3 === state.selectedIso);
  const panel = document.querySelector("#finance-profile");
  if (!country || !panel) return;

  const donors = Array.isArray(country.drrOdaTopDonors) ? country.drrOdaTopDonors : [];
  const sectors = Array.isArray(country.drrOdaSectors) ? country.drrOdaSectors : [];
  const projects = Array.isArray(country.worldBankDrmProjects) ? country.worldBankDrmProjects : [];
  const gcfProjects = Array.isArray(country.gcfDrrProjects) ? country.gcfDrrProjects : [];
  const financeTiers = Array.isArray(state.data.summary.financeTiers) ? state.data.summary.financeTiers : [];
  const topDonor = donors[0];

  panel.innerHTML = `
    <div class="finance-cards">
      <article>
        <span>DRR-related ODA disbursements</span>
        ${confidenceBadge("High confidence")}
        <strong>${fmtMoney(country.drrOdaDisbursementUsd, country.drrOdaYear)}</strong>
        <p>OECD CRS purpose codes 74010, 41050, and 41010.</p>
        ${sourceLink("oecdCrs")}
      </article>
      <article>
        <span>Top reported donor</span>
        ${confidenceBadge("High confidence")}
        <strong>${topDonor ? escapeHtml(topDonor.name) : "n/a"}</strong>
        <p>${topDonor ? fmtMoney(topDonor.disbursementUsd, country.drrOdaYear) : "No donor breakdown in latest CRS year."}</p>
        ${sourceLink("oecdCrs")}
      </article>
      <article>
        <span>World Bank DRM-tagged projects</span>
        ${confidenceBadge("Project signal")}
        <strong>${fmtNumber(country.worldBankDrmProjectCount)}</strong>
        <p>${fmtNumber(country.worldBankDrmActiveProjectCount)} active; ${fmtMoney(country.worldBankDrmCommitmentUsd)} full project commitments.</p>
        ${sourceLink("worldBankProjects")}
      </article>
      <article>
        <span>GCF DRR/resilience project signals</span>
        ${confidenceBadge("Project signal")}
        <strong>${fmtNumber(country.gcfDrrProjectCount)}</strong>
        <p>${fmtMoney(country.gcfDrrLinkedGcfBudgetUsd)} GCF funding; ${fmtMoney(country.gcfDrrLinkedCoFinancingUsd)} co-finance.</p>
        ${sourceLink("gcf")}
      </article>
      <article>
        <span>OCHA humanitarian response context</span>
        ${confidenceBadge("Response funding")}
        <strong>${fmtMoney(country.ochaHumanitarianFundingUsd, country.ochaHumanitarianYear)}</strong>
        <p>Response funding tracked by FTS, not counted as prevention or preparedness spending.</p>
        ${sourceLink("ocha")}
      </article>
    </div>
    ${renderFinanceTiers(financeTiers)}
    <div class="finance-columns">
      <article>
        <h3>Top donors to ${escapeHtml(shortCountryName(country.name))}</h3>
        <div class="donor-list">
          ${
            donors.length
              ? donors
                  .map(
                    (donor) => `
                      <div class="donor-row">
                        <span>${escapeHtml(donor.name)} <small>${escapeHtml(donor.code || "")}</small></span>
                        <strong>${fmtMoney(donor.disbursementUsd)}</strong>
                      </div>
                    `,
                  )
                  .join("")
              : `<p class="empty-note">No OECD CRS donor records in the latest finance year.</p>`
          }
        </div>
        <h4>ODA sector split</h4>
        <div class="donor-list">
          ${
            sectors.length
              ? sectors
                  .map(
                    (sector) => `
                      <div class="donor-row">
                        <span>${escapeHtml(sector.name || sector.code)}</span>
                        <strong>${fmtMoney(sector.disbursementUsd)}</strong>
                      </div>
                    `,
                  )
                  .join("")
              : `<p class="empty-note">No sector split available for the selected country.</p>`
          }
        </div>
      </article>
      <article>
        <h3>World Bank project examples</h3>
        <div class="project-list">
          ${
            projects.length
              ? projects
                  .map(
                    (project) => `
                      <a class="project-row" href="${escapeHtml(project.url)}" target="_blank" rel="noreferrer">
                        <span>${escapeHtml(project.name)}</span>
                        <strong>${escapeHtml(project.status || "Unknown")} - ${projectYear(project.approvedAt)} - ${fmtMoney(project.commitmentUsd)}</strong>
                      </a>
                    `,
                  )
                  .join("")
              : `<p class="empty-note">No matching World Bank DRM project records found.</p>`
          }
        </div>
      </article>
      <article>
        <h3>GCF project examples</h3>
        <div class="project-list">
          ${
            gcfProjects.length
              ? gcfProjects
                  .map(
                    (project) => `
                      <a class="project-row" href="${escapeHtml(project.url)}" target="_blank" rel="noreferrer">
                        <span>${escapeHtml(project.name)}</span>
                        <strong>${escapeHtml(project.sector || "Unknown")} - ${projectYear(project.approvedAt)} - ${fmtMoney(project.gcfBudgetUsd)} GCF</strong>
                      </a>
                    `,
                  )
                  .join("")
              : `<p class="empty-note">No GCF projects matched the DRR/resilience keyword screen.</p>`
          }
        </div>
      </article>
    </div>
  `;
}

function confidenceBadge(label) {
  return `<b class="confidence-badge">${escapeHtml(label)}</b>`;
}

function renderFinanceTiers(tiers) {
  if (!tiers.length) return "";
  return `
    <div class="finance-tiers">
      ${tiers
        .map(
          (tier) => `
            <article>
              <span>${escapeHtml(tier.confidence)} confidence</span>
              <strong>${escapeHtml(tier.label)}</strong>
              <p>${escapeHtml(tier.coverage)}</p>
              <em>${escapeHtml(tier.caveat)}</em>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderCompareView(state) {
  const output = document.querySelector("#compare-output");
  if (!output) return;
  const a = countryByIso(state, state.compareIsoA) || countryByIso(state, state.selectedIso);
  const b = countryByIso(state, state.compareIsoB) || state.data.countries.find((country) => country.iso3 !== a?.iso3);
  if (!a || !b) {
    output.innerHTML = `<p class="empty-note">Choose two countries to compare.</p>`;
    return;
  }

  const rows = [
    ["INFORM risk", fmtFixed(a.risk, 1), fmtFixed(b.risk, 1), "INFORM"],
    ["Continent", countryContinent(a), countryContinent(b), "INFORM"],
    ["High hazards", fmtHazardList(a.thinkHazard?.highHazards), fmtHazardList(b.thinkHazard?.highHazards), "ThinkHazard"],
    ["Hazard and exposure", fmtFixed(a.hazardExposure, 1), fmtFixed(b.hazardExposure, 1), "INFORM"],
    ["Vulnerability", fmtFixed(a.vulnerability, 1), fmtFixed(b.vulnerability, 1), "INFORM"],
    ["Lack of coping capacity", fmtFixed(a.lackCopingCapacity, 1), fmtFixed(b.lackCopingCapacity, 1), "INFORM"],
    ["DRR-related ODA disbursements", fmtMoney(a.drrOdaDisbursementUsd, a.drrOdaYear), fmtMoney(b.drrOdaDisbursementUsd, b.drrOdaYear), "OECD CRS"],
    ["Top reported donor", topDonorLabel(a), topDonorLabel(b), "OECD CRS"],
    ["World Bank DRM projects", fmtNumber(a.worldBankDrmProjectCount), fmtNumber(b.worldBankDrmProjectCount), "World Bank"],
    ["GCF DRR/resilience projects", fmtNumber(a.gcfDrrProjectCount), fmtNumber(b.gcfDrrProjectCount), "GCF"],
    ["OCHA response funding", fmtMoney(a.ochaHumanitarianFundingUsd, a.ochaHumanitarianYear), fmtMoney(b.ochaHumanitarianFundingUsd, b.ochaHumanitarianYear), "OCHA FTS"],
    ["WorldRiskIndex", fmtYearValue(a.worldRiskIndexValue, a.worldRiskIndexYear, 2), fmtYearValue(b.worldRiskIndexValue, b.worldRiskIndexYear, 2), "WorldRiskIndex"],
    ["ND-GAIN score", fmtYearValue(a.ndGainValue, a.ndGainYear, 1), fmtYearValue(b.ndGainValue, b.ndGainYear, 1), "ND-GAIN"],
    ["Water stress", fmtAqueduct(a.waterStressScore, a.waterStressLabel), fmtAqueduct(b.waterStressScore, b.waterStressLabel), "WRI Aqueduct"],
  ];

  output.innerHTML = `
    <table>
      <caption class="sr-only">Comparison between ${escapeHtml(a.name)} and ${escapeHtml(b.name)}</caption>
      <thead>
        <tr>
          <th scope="col">Metric</th>
          <th scope="col">${escapeHtml(a.name)}</th>
          <th scope="col">${escapeHtml(b.name)}</th>
          <th scope="col">Source</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
                <th scope="row">${escapeHtml(row[0])}</th>
                <td>${escapeHtml(row[1])}</td>
                <td>${escapeHtml(row[2])}</td>
                <td>${escapeHtml(row[3])}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function topDonorLabel(country) {
  const donor = Array.isArray(country.drrOdaTopDonors) ? country.drrOdaTopDonors[0] : null;
  return donor ? `${donor.name} (${fmtMoney(donor.disbursementUsd, country.drrOdaYear)})` : "n/a";
}

function renderPremiumAccess(state) {
  const panel = document.querySelector("#premium-access");
  if (!panel) return;

  const product = state.product || fallbackProductConfig();
  const country = state.data.countries.find((item) => item.iso3 === state.selectedIso);
  const plans = Array.isArray(product.plans) ? product.plans : [];
  const modules = Array.isArray(product.premiumModules) ? product.premiumModules : [];
  const entitlement = state.entitlement || { plan: "free", premiumAccess: false };
  const billing = product.billing || {};
  const billingReady = Boolean(billing.checkoutEndpoint || plans.some((plan) => plan.checkoutUrl));
  const countryLabel = country ? shortCountryName(country.name) : "selected country";

  panel.innerHTML = `
    <div class="premium-status">
      <article>
        <span>Current access</span>
        <strong>${escapeHtml(entitlement.planName || entitlement.plan || "Free")}</strong>
        <p>${entitlement.premiumAccess ? "Premium API access is active for this browser session." : "Public edition. Premium records remain locked until billing and entitlement checks are configured."}</p>
      </article>
      <article>
        <span>Billing status</span>
        <strong>${billingReady ? "Checkout ready" : "Waitlist mode"}</strong>
        <p>${billingReady ? "Plan buttons can send users through a configured checkout flow." : "No payment collection is active. Paid plans are shown for product direction and access requests only."}</p>
      </article>
      <article>
        <span>Data security</span>
        <strong>API gated</strong>
        <p>${escapeHtml(billing.securityNote || "Restricted data is fetched only from an authenticated backend.")}</p>
      </article>
    </div>
    <div class="pricing-grid">
      ${plans.map((plan) => renderPlanCard(plan, entitlement, billingReady)).join("")}
    </div>
    <div class="premium-modules">
      ${modules.map((module) => renderPremiumModule(module, entitlement, countryLabel)).join("")}
    </div>
    ${renderPremiumPreview(countryLabel)}
    <p id="billing-status" class="billing-status" role="status" aria-live="polite"></p>
  `;

  panel.querySelectorAll("[data-checkout-plan]").forEach((button) => {
    button.addEventListener("click", () => startCheckout(button.dataset.checkoutPlan, state));
  });
  panel.querySelectorAll("[data-request-plan]").forEach((button) => {
    button.addEventListener("click", () => requestAccess(button.dataset.requestPlan, state));
  });
}

function renderPlanCard(plan, entitlement, billingReady) {
  const isCurrent = (entitlement.plan || "free") === plan.id;
  const features = Array.isArray(plan.features) ? plan.features : [];
  const buttonLabel = isCurrent ? "Current plan" : plan.cta || "Choose plan";
  const button = plan.id === "free"
    ? `<a class="plan-button" href="#risk-map">${escapeHtml(buttonLabel)}</a>`
    : billingReady
      ? plan.checkoutUrl
        ? `<a class="plan-button plan-button-primary" href="${escapeHtml(plan.checkoutUrl)}" target="_blank" rel="noreferrer">${escapeHtml(buttonLabel)}</a>`
        : `<button class="plan-button plan-button-primary" type="button" data-checkout-plan="${escapeHtml(plan.id)}">${escapeHtml(buttonLabel)}</button>`
      : `<button class="plan-button plan-button-primary" type="button" data-request-plan="${escapeHtml(plan.id)}">${escapeHtml(buttonLabel)}</button>`;

  return `
    <article class="pricing-card${isCurrent ? " pricing-card-current" : ""}">
      <span>${escapeHtml(plan.label || plan.name)}</span>
      <h3>${escapeHtml(plan.name)}</h3>
      <div class="price-line">
        <strong>${escapeHtml(plan.price)}</strong>
        <em>${escapeHtml(plan.period || "")}</em>
      </div>
      <ul>
        ${features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}
      </ul>
      ${button}
    </article>
  `;
}

function renderPremiumPreview(countryLabel) {
  const rows = [
    ["IATI activity", "Donor, implementer, sector, transaction type", "Amount and DRR evidence", "Pro"],
    ["Domestic budget", "Budget line, disaster fund, climate tag", "Document link and confidence score", "Pro"],
    ["Private/co-finance", "Sponsor, fund, project document", "Public/private signal and caveat", "Pro"],
  ];

  return `
    <div class="premium-preview">
      <div class="preview-copy">
        <p class="kicker">Locked preview</p>
        <h3>What paid users would see for ${escapeHtml(countryLabel)}</h3>
        <p>Premium rows stay behind an authenticated API. This public preview shows the structure, not restricted records.</p>
      </div>
      <div class="preview-table" role="table" aria-label="Premium data preview">
        <div class="preview-row preview-header" role="row">
          <span role="columnheader">Module</span>
          <span role="columnheader">Fields</span>
          <span role="columnheader">Value</span>
          <span role="columnheader">Tier</span>
        </div>
        ${rows
          .map(
            (row) => `
              <div class="preview-row" role="row">
                <span role="cell">${escapeHtml(row[0])}</span>
                <span role="cell">${escapeHtml(row[1])}</span>
                <span role="cell">${escapeHtml(row[2])}</span>
                <strong role="cell">${escapeHtml(row[3])} locked</strong>
              </div>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderPremiumModule(module, entitlement, countryLabel) {
  const unlocked = Boolean(entitlement.premiumAccess);
  return `
    <article>
      <div>
        <span class="module-tier">${escapeHtml(module.tier || "Premium")}</span>
        <strong>${escapeHtml(module.title)}</strong>
      </div>
      <p>${escapeHtml(module.description)}</p>
      <em>${escapeHtml(module.caveat)}</em>
      <small class="${unlocked ? "module-unlocked" : "module-locked"}">
        ${unlocked ? `Available for ${escapeHtml(countryLabel)}` : "Locked until entitlement is verified"}
      </small>
    </article>
  `;
}

async function requestAccess(planId, state) {
  const product = state.product || {};
  const plans = Array.isArray(product.plans) ? product.plans : [];
  const plan = plans.find((item) => item.id === planId);
  const billing = product.billing || {};
  const status = document.querySelector("#billing-status");
  if (!plan || !status) return;
  const country = state.data.countries.find((item) => item.iso3 === state.selectedIso);
  const countryName = country ? country.name : "the selected country";
  if (billing.requestAccessEndpoint) {
    status.textContent = "Sending access request...";
    try {
      const response = await fetch(billing.requestAccessEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: plan.id,
          country: country?.iso3 || "",
          pageUrl: country ? countryShareUrl(country.iso3) : window.location.href,
        }),
      });
      if (!response.ok) throw new Error("Request endpoint returned an error.");
      status.textContent = `${plan.name} access request sent for ${countryName}.`;
      return;
    } catch (error) {
      status.textContent = `Access request failed: ${error.message}`;
      return;
    }
  }
  const email = billing.contactEmail || "contact@bisolutions.group";
  const subject = encodeURIComponent(`DRR dashboard ${plan.name} access`);
  const body = encodeURIComponent(`Plan: ${plan.name}\nCountry: ${countryName}\nPage: ${country ? countryShareUrl(country.iso3) : window.location.href}`);
  status.innerHTML =
    `${escapeHtml(plan.name)} access is in waitlist mode. No payment has been collected. ` +
    `<a class="text-link" href="mailto:${escapeHtml(email)}?subject=${subject}&body=${body}">Email ${escapeHtml(email)}</a> to request access for ${escapeHtml(countryName)}.`;
}

function attachQuestionBar(state) {
  const form = document.querySelector("#dashboard-question-form");
  const input = document.querySelector("#dashboard-question");
  const answer = document.querySelector("#dashboard-answer");
  if (!form || !input || !answer) return;

  const ask = (question) => {
    const clean = String(question || "").trim();
    input.value = clean;
    answer.innerHTML = answerDashboardQuestion(state, clean);
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    ask(input.value);
  });

  document.querySelectorAll("[data-question]").forEach((button) => {
    button.addEventListener("click", () => ask(button.dataset.question));
  });
}

function answerDashboardQuestion(state, question) {
  const query = normalizeSearch(question);
  const countries = state.data.countries || [];
  if (!query) {
    return answerBlock(
      "Ask a dashboard question",
      "Try asking about top risk countries, donors to a country, finance gaps, hazards, missing data, sources, or a country profile.",
      [],
    );
  }

  const mentionedCountries = countriesMentionedInQuestion(countries, query);
  if (query.includes("source") || query.includes("method")) return answerSources(state);
  if (query.includes("missing") || query.includes("no data") || query.includes("coverage")) {
    return answerMissingData(countries, query);
  }
  if (query.includes("compare") && mentionedCountries.length >= 2) {
    return answerCompareCountries(mentionedCountries[0], mentionedCountries[1]);
  }
  if (query.includes("donor")) {
    return answerDonors(mentionedCountries[0] || countryByIso(state, state.selectedIso));
  }
  if (query.includes("finance") || query.includes("funding") || query.includes("oda")) {
    if (query.includes("gap") || query.includes("low") || query.includes("thin") || query.includes("least")) {
      return answerFinanceGaps(countries);
    }
    return answerCountryFinance(mentionedCountries[0] || countryByIso(state, state.selectedIso));
  }
  const hazardAnswer = answerHazardQuery(countries, query);
  if (hazardAnswer) return hazardAnswer;
  if (query.includes("highest risk") || query.includes("top risk") || query.includes("high risk")) {
    return answerTopRisk(countries);
  }
  if (mentionedCountries.length) return answerCountrySnapshot(mentionedCountries[0]);

  return answerBlock(
    "Question not recognized",
    "This public assistant answers only from the dashboard dataset. Try: top donors to Philippines, highest risk countries, high flood risk, missing ODA data, or compare Greece and Philippines.",
    [{ label: "Open methodology", href: "#methodology" }],
  );
}

function countriesMentionedInQuestion(countries, query) {
  const tokens = new Set(query.split(/[^a-z0-9]+/).filter(Boolean));
  const commonWords = new Set(["and", "are", "can", "for", "how", "low", "new", "not", "the", "top", "who", "why"]);
  return [...countries]
    .sort((a, b) => b.name.length - a.name.length)
    .filter((country) => {
      const name = normalizeSearch(country.name);
      const iso3 = normalizeSearch(country.iso3);
      return query.includes(name) || (tokens.has(iso3) && !commonWords.has(iso3));
    });
}

function answerTopRisk(countries) {
  const top = [...countries].sort((a, b) => b.risk - a.risk).slice(0, 5);
  return answerBlock(
    "Highest current INFORM risk",
    top.map((country, index) => `${index + 1}. ${escapeHtml(country.name)}: ${fmtFixed(country.risk, 1)}`).join("<br>"),
    [{ label: "Open risk ranking", href: "#country-view" }],
  );
}

function answerFinanceGaps(countries) {
  const rows = financeGapRows(countries).slice(0, 5);
  return answerBlock(
    "High-risk countries with thin reported DRR ODA",
    rows
      .map((country, index) => `${index + 1}. ${escapeHtml(country.name)}: ${fmtMoney(country.financePerRisk)} per risk point`)
      .join("<br>"),
    [{ label: "Open finance view", href: "#finance-view" }],
  );
}

function answerDonors(country) {
  if (!country) return answerBlock("No country selected", "Select or name a country first.", []);
  const donors = Array.isArray(country.drrOdaTopDonors) ? country.drrOdaTopDonors.slice(0, 5) : [];
  const body = donors.length
    ? donors.map((donor, index) => `${index + 1}. ${escapeHtml(donor.name)}: ${fmtMoney(donor.disbursementUsd, country.drrOdaYear)}`).join("<br>")
    : `No OECD CRS donor records are available for ${escapeHtml(country.name)} in the latest finance year.`;
  return answerBlock(`Top reported DRR-related ODA donors to ${country.name}`, body, [
    { label: "Open finance view", href: "#finance-view" },
  ]);
}

function answerCountryFinance(country) {
  if (!country) return answerBlock("No country selected", "Select or name a country first.", []);
  return answerBlock(
    `Finance snapshot for ${country.name}`,
    [
      `DRR-related ODA disbursements: ${fmtMoney(country.drrOdaDisbursementUsd, country.drrOdaYear)}`,
      `Top donor: ${escapeHtml(topDonorLabel(country))}`,
      `World Bank DRM project signals: ${fmtNumber(country.worldBankDrmProjectCount)}`,
      `GCF DRR/resilience project signals: ${fmtNumber(country.gcfDrrProjectCount)}`,
      `OCHA response funding: ${fmtMoney(country.ochaHumanitarianFundingUsd, country.ochaHumanitarianYear)}`,
    ].join("<br>"),
    [{ label: "Open finance view", href: "#finance-view" }],
  );
}

function answerHazardQuery(countries, query) {
  const hazards = [
    ["flood", "flood"],
    ["earthquake", "earthquake"],
    ["wildfire", "wildfire"],
    ["drought", "drought"],
    ["water scarcity", "water scarcity"],
    ["heat", "extreme heat"],
    ["cyclone", "cyclone"],
    ["tsunami", "tsunami"],
    ["landslide", "landslide"],
  ];
  const match = hazards.find(([key]) => query.includes(key));
  if (!match) return "";
  const [, label] = match;
  const rows = countries
    .filter((country) =>
      (country.thinkHazard?.highHazards || []).some((hazard) => normalizeSearch(hazard.name).includes(label)),
    )
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 6);
  return answerBlock(
    `Countries flagged high for ${label}`,
    rows.length
      ? rows.map((country, index) => `${index + 1}. ${escapeHtml(country.name)}: INFORM ${fmtFixed(country.risk, 1)}`).join("<br>")
      : `No countries are flagged high for ${escapeHtml(label)} in the current ThinkHazard data.`,
    [{ label: "Open hazard chart", href: "#risk-section" }],
  );
}

function answerMissingData(countries, query) {
  const fields = [
    ["oda", "drrOdaDisbursementUsd", "DRR-related ODA"],
    ["finance", "drrOdaDisbursementUsd", "DRR-related ODA"],
    ["loss", "lossUsdValue", "direct economic loss"],
    ["strategy", "nationalStrategyValue", "national DRR strategy"],
    ["displacement", "disasterDisplacementValue", "disaster displacement"],
  ];
  const match = fields.find(([key]) => query.includes(key)) || fields[0];
  const [, field, label] = match;
  const missing = countries.filter((country) => !Number.isFinite(country[field]));
  return answerBlock(
    `Missing ${label} records`,
    `${fmtNumber(missing.length)} of ${fmtNumber(countries.length)} countries do not have this value in the current public build. Examples: ${escapeHtml(
      missing.slice(0, 6).map((country) => country.name).join(", ") || "none",
    )}.`,
    [{ label: "Open coverage", href: "#methodology" }],
  );
}

function answerSources(state) {
  const sources = Array.isArray(state.data.sources) ? state.data.sources : [];
  return answerBlock(
    "Public sources in this build",
    `${fmtNumber(sources.length)} public sources are included, led by INFORM, OECD CRS, WorldRiskIndex, ThinkHazard, GCF, World Bank, OCHA FTS, ND-GAIN, WRI Aqueduct, and OWID/UNDRR series.`,
    [
      { label: "Open sources", href: "#source-audit" },
      { label: "Read source caveats", href: "./documentation.html#data-sources" },
    ],
  );
}

function answerCountrySnapshot(country) {
  return answerBlock(
    `Risk snapshot for ${country.name}`,
    [
      `INFORM risk: ${fmtFixed(country.risk, 1)}`,
      `Hazard and exposure: ${fmtFixed(country.hazardExposure, 1)}`,
      `High hazards: ${escapeHtml(fmtHazardList(country.thinkHazard?.highHazards))}`,
      `DRR-related ODA: ${fmtMoney(country.drrOdaDisbursementUsd, country.drrOdaYear)}`,
    ].join("<br>"),
    [{ label: "Open country profile", href: "#country-view" }],
  );
}

function answerCompareCountries(a, b) {
  return answerBlock(
    `Compare ${a.name} and ${b.name}`,
    [
      `INFORM risk: ${fmtFixed(a.risk, 1)} vs ${fmtFixed(b.risk, 1)}`,
      `DRR-related ODA: ${fmtMoney(a.drrOdaDisbursementUsd, a.drrOdaYear)} vs ${fmtMoney(b.drrOdaDisbursementUsd, b.drrOdaYear)}`,
      `WorldRiskIndex: ${fmtYearValue(a.worldRiskIndexValue, a.worldRiskIndexYear, 2)} vs ${fmtYearValue(b.worldRiskIndexValue, b.worldRiskIndexYear, 2)}`,
    ].join("<br>"),
    [{ label: "Open comparison", href: "#compare-view" }],
  );
}

function answerBlock(title, body, actions) {
  return `
    <strong>${escapeHtml(title)}</strong>
    <p>${body}</p>
    ${
      actions.length
        ? `<div class="answer-actions">${actions
            .map((action) => `<a class="answer-link" href="${escapeHtml(action.href)}">${escapeHtml(action.label)}</a>`)
            .join("")}</div>`
        : ""
    }
  `;
}

function attachDashboardActions(state) {
  document.querySelector("#download-country")?.addEventListener("click", () => {
    const country = countryByIso(state, state.selectedIso);
    if (!country) return;
    downloadRows(
      `${country.iso3.toLowerCase()}-drr-profile.csv`,
      countryProfileRows(country),
      ["metric", "value", "year", "source", "caveat"],
    );
    setActionStatus(`Downloaded ${country.name} profile CSV.`);
  });

  document.querySelector("#download-donors")?.addEventListener("click", () => {
    const country = countryByIso(state, state.selectedIso);
    if (!country) return;
    const donors = Array.isArray(country.drrOdaTopDonors) ? country.drrOdaTopDonors : [];
    downloadRows(
      `${country.iso3.toLowerCase()}-drr-donors.csv`,
      donors.map((donor) => ({
        recipientIso3: country.iso3,
        recipient: country.name,
        year: country.drrOdaYear || "",
        donorCode: donor.code || "",
        donor: donor.name || "",
        disbursementUsd: donor.disbursementUsd || "",
        source: "OECD CRS",
      })),
      ["recipientIso3", "recipient", "year", "donorCode", "donor", "disbursementUsd", "source"],
    );
    setActionStatus(`Downloaded ${country.name} donor CSV.`);
  });

  document.querySelector("#download-projects")?.addEventListener("click", () => {
    const country = countryByIso(state, state.selectedIso);
    if (!country) return;
    downloadRows(
      `${country.iso3.toLowerCase()}-project-signals.csv`,
      projectSignalRows(country),
      ["countryIso3", "country", "source", "id", "name", "statusOrSector", "approvedYear", "amountUsd", "url"],
    );
    setActionStatus(`Downloaded ${country.name} project signals CSV.`);
  });

  document.querySelector("#copy-country-link")?.addEventListener("click", async () => {
    const country = countryByIso(state, state.selectedIso);
    if (!country) return;
    const url = countryShareUrl(country.iso3);
    try {
      await navigator.clipboard.writeText(url);
      setActionStatus(`Copied link for ${country.name}.`);
    } catch {
      setActionStatus(url);
    }
  });
}

function countryProfileRows(country) {
  return [
    profileRow("INFORM risk score", country.risk, "", "INFORM", "0-10 current risk score."),
    profileRow("Hazard and exposure", country.hazardExposure, "", "INFORM", ""),
    profileRow("Vulnerability", country.vulnerability, "", "INFORM", ""),
    profileRow("Lack of coping capacity", country.lackCopingCapacity, "", "INFORM", ""),
    profileRow("Direct economic loss", country.lossUsdValue, country.lossUsdYear, "UNDRR / OWID", "Reported direct economic loss."),
    profileRow("Disaster displacement", country.disasterDisplacementValue, country.disasterDisplacementYear, "World Bank / IDMC", ""),
    profileRow("DRR-related ODA disbursement", country.drrOdaDisbursementUsd, country.drrOdaYear, "OECD CRS", "International DRR-related ODA only."),
    profileRow("DRR-related ODA commitment", country.drrOdaCommitmentUsd, country.drrOdaYear, "OECD CRS", "International DRR-related ODA only."),
    profileRow("World Bank DRM projects", country.worldBankDrmProjectCount, "", "World Bank Projects", "Project signal count."),
    profileRow("GCF DRR/resilience projects", country.gcfDrrProjectCount, "", "GCF", "Keyword-screened project signal count."),
    profileRow("OCHA response funding", country.ochaHumanitarianFundingUsd, country.ochaHumanitarianYear, "OCHA FTS", "Response context, not prevention spending."),
    profileRow("WorldRiskIndex", country.worldRiskIndexValue, country.worldRiskIndexYear, "WorldRiskIndex", ""),
    profileRow("ND-GAIN score", country.ndGainValue, country.ndGainYear, "ND-GAIN", ""),
    profileRow("Water stress", country.waterStressScore, "", "WRI Aqueduct", country.waterStressLabel || ""),
  ];
}

function profileRow(metricName, value, year, source, caveat) {
  return {
    metric: metricName,
    value: Number.isFinite(value) ? value : "",
    year: year || "",
    source,
    caveat,
  };
}

function projectSignalRows(country) {
  const worldBankRows = (Array.isArray(country.worldBankDrmProjects) ? country.worldBankDrmProjects : []).map(
    (project) => ({
      countryIso3: country.iso3,
      country: country.name,
      source: "World Bank Projects & Operations",
      id: project.id || "",
      name: project.name || "",
      statusOrSector: project.status || "",
      approvedYear: projectYear(project.approvedAt),
      amountUsd: project.commitmentUsd || "",
      url: project.url || "",
    }),
  );
  const gcfRows = (Array.isArray(country.gcfDrrProjects) ? country.gcfDrrProjects : []).map((project) => ({
    countryIso3: country.iso3,
    country: country.name,
    source: "Green Climate Fund",
    id: project.ref || "",
    name: project.name || "",
    statusOrSector: project.sector || "",
    approvedYear: projectYear(project.approvedAt),
    amountUsd: project.gcfBudgetUsd || "",
    url: project.url || "",
  }));
  return [...worldBankRows, ...gcfRows];
}

function countryShareUrl(iso3) {
  const url = new URL(window.location.href);
  url.search = `?country=${encodeURIComponent(iso3)}`;
  url.hash = "country-view";
  return url.toString();
}

function setActionStatus(message) {
  const status = document.querySelector("#share-status");
  if (status) status.textContent = message;
}

function downloadRows(filename, rows, columns) {
  const csv = toCsv(rows.length ? rows : [Object.fromEntries(columns.map((column) => [column, ""]))], columns);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.append(link);
  link.click();
  URL.revokeObjectURL(link.href);
  link.remove();
}

async function startCheckout(planId, state) {
  const product = state.product || {};
  const plans = Array.isArray(product.plans) ? product.plans : [];
  const plan = plans.find((item) => item.id === planId);
  const billing = product.billing || {};
  const status = document.querySelector("#billing-status");
  if (!plan || !status) return;

  if (plan.checkoutUrl) {
    window.location.href = plan.checkoutUrl;
    return;
  }

  if (!billing.checkoutEndpoint) {
    status.textContent =
      "Checkout is not active yet. Configure Stripe price IDs and a server-side checkout endpoint before taking payment.";
    return;
  }

  status.textContent = "Opening checkout...";
  try {
    const response = await fetch(billing.checkoutEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan: plan.id,
        successUrl: absoluteUrl(billing.successPath || "./?checkout=success#premium-plans"),
        cancelUrl: absoluteUrl(billing.cancelPath || "./?checkout=cancelled#premium-plans"),
      }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.url) {
      throw new Error(payload.error || "Checkout endpoint did not return a redirect URL.");
    }
    window.location.href = payload.url;
  } catch (error) {
    status.textContent = `Checkout failed: ${error.message}`;
  }
}

async function loadEntitlement(product) {
  const billing = product?.billing || {};
  const endpoint = billing.entitlementEndpoint || buildPremiumUrl(billing.premiumApiBase, "/entitlements");
  if (!endpoint) return { plan: "free", planName: "Free", premiumAccess: false };

  try {
    const token = window.localStorage.getItem("drrPremiumToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(endpoint, { headers });
    if (!response.ok) throw new Error("Entitlement check failed.");
    return await response.json();
  } catch {
    return { plan: "free", planName: "Free", premiumAccess: false };
  }
}

function buildPremiumUrl(base, path) {
  if (!base) return "";
  return `${String(base).replace(/\/$/, "")}${path}`;
}

function absoluteUrl(path) {
  return new URL(path, window.location.href).toString();
}

function fallbackProductConfig() {
  return {
    billing: {
      status: "configuration_required",
      contactEmail: "contact@bisolutions.group",
      securityNote: "Restricted data is fetched only from an authenticated backend.",
    },
    plans: [],
    premiumModules: [],
  };
}

function renderSources(sources) {
  const list = document.querySelector("#sources-list");
  list.innerHTML = sources
    .map(
      (source) => `
        <article class="source-item">
          <strong><a href="${source.url}" target="_blank" rel="noreferrer">${source.name}</a></strong>
          <p>${source.role}</p>
          <p>${source.access}</p>
        </article>
      `,
    )
    .join("");
}

function drawRiskMap(selector, state) {
  const container = d3.select(selector);
  const { width, height } = chartSize(container, 500);
  container.selectAll("*").remove();

  const svg = container.append("svg").attr("viewBox", `0 0 ${width} ${height}`);
  const { data, world } = state;
  const riskByIso = new Map(data.countries.map((country) => [country.iso3, country]));
  const mapFeatures = world.features.filter((feature) => feature.id !== "ATA");
  const mapWorld = { type: "FeatureCollection", features: mapFeatures };
  const projection = d3.geoNaturalEarth1().fitSize([width, height - 16], mapWorld);
  const path = d3.geoPath(projection);
  const color = d3
    .scaleThreshold()
    .domain([2, 3.5, 5, 6.5, 8])
    .range(THEME.riskScale);

  svg
    .append("g")
    .selectAll("path")
    .data(mapFeatures)
    .join("path")
    .attr("data-iso", (feature) => feature.id)
    .attr("d", path)
    .attr("fill", (feature) => {
      const row = riskByIso.get(feature.id);
      return row ? color(row.risk) : THEME.mapNoData;
    })
    .attr("stroke", (feature) => (feature.id === state.selectedIso ? THEME.ink : THEME.panel))
    .attr("stroke-width", (feature) => (feature.id === state.selectedIso ? 1.8 : 0.55))
    .attr("cursor", (feature) => (riskByIso.has(feature.id) ? "pointer" : "default"))
    .attr("tabindex", (feature) => (riskByIso.has(feature.id) ? 0 : null))
    .attr("role", (feature) => (riskByIso.has(feature.id) ? "button" : null))
    .attr("aria-label", (feature) => {
      const row = riskByIso.get(feature.id);
      return row ? `${row.name}, INFORM risk ${fmtFixed(row.risk, 1)}. Open country profile.` : null;
    })
    .on("mousemove", (event, feature) => {
      const row = riskByIso.get(feature.id);
      const name = row?.name || feature.properties.name;
      showTooltip(
        event,
        `<strong>${name}</strong>${row ? `INFORM risk: ${fmtFixed(row.risk, 1)}<br>Click for country profile` : "No INFORM score"}`,
      );
    })
    .on("click", (_, feature) => {
      if (riskByIso.has(feature.id)) setSelectedCountry(state, feature.id, { scrollToCountry: true });
    })
    .on("keydown", (event, feature) => {
      if (!riskByIso.has(feature.id) || !["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      setSelectedCountry(state, feature.id, { scrollToCountry: true });
    })
    .on("mouseleave", hideTooltip);

  svg
    .append("g")
    .attr("class", "map-hit-targets")
    .selectAll("circle")
    .data(
      mapFeatures
        .map((feature) => ({
          feature,
          row: riskByIso.get(feature.id),
          centroid: path.centroid(feature),
        }))
        .filter((item) => item.row && item.centroid.every(Number.isFinite)),
    )
    .join("circle")
    .attr("data-iso", (item) => item.row.iso3)
    .attr("cx", (item) => item.centroid[0])
    .attr("cy", (item) => item.centroid[1])
    .attr("r", 8)
    .attr("fill", "transparent")
    .attr("pointer-events", "all")
    .attr("aria-hidden", "true")
    .on("mousemove", (event, item) => {
      showTooltip(
        event,
        `<strong>${item.row.name}</strong>INFORM risk: ${fmtFixed(item.row.risk, 1)}<br>Click for country profile`,
      );
    })
    .on("click", (_, item) => {
      setSelectedCountry(state, item.row.iso3, { scrollToCountry: true });
    })
    .on("mouseleave", hideTooltip);

  const compact = isCompactChart(width);
  const selectedCountry = riskByIso.get(state.selectedIso);
  const labelMap = new Map();
  data.countries
    .filter((country) => Number.isFinite(country.risk))
    .sort((a, b) => b.risk - a.risk)
    .slice(0, compact ? 3 : 6)
    .forEach((country) => labelMap.set(country.iso3, country));
  if (selectedCountry) labelMap.set(selectedCountry.iso3, selectedCountry);

  svg
    .append("g")
    .attr("class", "chart-labels map-labels")
    .selectAll("text")
    .data(
      [...labelMap.values()]
        .map((country) => {
          const feature = mapFeatures.find((item) => item.id === country.iso3);
          const centroid = feature ? path.centroid(feature) : null;
          return {
            ...country,
            centroid,
            selected: country.iso3 === state.selectedIso,
          };
        })
        .filter((country) => country.centroid?.every(Number.isFinite)),
    )
    .join("text")
    .attr("class", (country) => `chart-label map-label${country.selected ? " selected-label" : ""}`)
    .attr("x", (country) => clamp(country.centroid[0] + 6, 14, width - 14))
    .attr("y", (country) => clamp(country.centroid[1] - 5, 16, height - 48))
    .attr("text-anchor", (country) => (country.centroid[0] > width - 82 ? "end" : "start"))
    .text((country) => `${country.iso3} ${fmtFixed(country.risk, 1)}`);

  const legend = svg.append("g").attr("transform", `translate(18, ${height - 32})`);
  const legendData = [
    ["<2", THEME.riskScale[0]],
    ["2-3.5", THEME.riskScale[1]],
    ["3.5-5", THEME.riskScale[2]],
    ["5-6.5", THEME.riskScale[3]],
    ["6.5-8", THEME.riskScale[4]],
    [">8", THEME.riskScale[5]],
  ];

  legend
    .selectAll("rect")
    .data(legendData)
    .join("rect")
    .attr("x", (_, index) => index * 56)
    .attr("width", 38)
    .attr("height", 9)
    .attr("fill", (item) => item[1]);

  legend
    .selectAll("text")
    .data(legendData)
    .join("text")
    .attr("x", (_, index) => index * 56)
    .attr("y", 24)
    .attr("fill", THEME.muted)
    .attr("font-size", 11)
    .text((item) => item[0]);
}

function drawTopRisk(selector, countries) {
  const container = d3.select(selector);
  const { width, height } = chartSize(container, 390);
  const margin = { top: 8, right: 28, bottom: 34, left: 132 };
  const top = countries.slice(0, 15).reverse();
  container.selectAll("*").remove();

  const svg = container.append("svg").attr("viewBox", `0 0 ${width} ${height}`);
  const x = d3.scaleLinear().domain([0, 10]).range([margin.left, width - margin.right]);
  const y = d3
    .scaleBand()
    .domain(top.map((country) => country.iso3))
    .range([height - margin.bottom, margin.top])
    .padding(0.28);

  svg.append("g").attr("class", "grid").call(axisGridBottom(x, height - margin.bottom, margin.top));
  svg
    .append("g")
    .selectAll("rect")
    .data(top)
    .join("rect")
    .attr("x", x(0))
    .attr("y", (country) => y(country.iso3))
    .attr("width", (country) => x(country.risk) - x(0))
    .attr("height", y.bandwidth())
    .attr("fill", (country) => (country.risk >= 8 ? THEME.redDark : THEME.greenDark));

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(5));

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickSize(0).tickFormat((iso3) => shortCountryName(top.find((country) => country.iso3 === iso3)?.name || iso3)))
    .call((group) => group.select(".domain").remove());

  svg
    .append("g")
    .selectAll("text")
    .data(top)
    .join("text")
    .attr("x", (country) => x(country.risk) + 6)
    .attr("y", (country) => y(country.iso3) + y.bandwidth() / 2 + 4)
    .attr("font-size", 12)
    .attr("font-weight", 800)
    .text((country) => fmtFixed(country.risk, 1));
}

function drawHazardSummary(selector, summary) {
  const container = d3.select(selector);
  const { width, height } = chartSize(container, 390);
  const margin = { top: 10, right: 32, bottom: 34, left: 122 };
  const data = [...summary].sort((a, b) => b.high + b.medium - (a.high + a.medium)).reverse();
  container.selectAll("*").remove();

  const svg = container.append("svg").attr("viewBox", `0 0 ${width} ${height}`);
  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, (row) => row.high + row.medium) || 1])
    .nice()
    .range([margin.left, width - margin.right]);
  const y = d3
    .scaleBand()
    .domain(data.map((row) => row.code))
    .range([height - margin.bottom, margin.top])
    .padding(0.32);

  svg.append("g").attr("class", "grid").call(axisGridBottom(x, height - margin.bottom, margin.top));

  const groups = svg.append("g").selectAll("g").data(data).join("g");
  groups
    .append("rect")
    .attr("x", x(0))
    .attr("y", (row) => y(row.code))
    .attr("width", (row) => x(row.medium) - x(0))
    .attr("height", y.bandwidth())
    .attr("fill", THEME.warm);
  groups
    .append("rect")
    .attr("x", (row) => x(row.medium))
    .attr("y", (row) => y(row.code))
    .attr("width", (row) => x(row.medium + row.high) - x(row.medium))
    .attr("height", y.bandwidth())
    .attr("fill", THEME.redDark);

  groups
    .append("text")
    .attr("class", "chart-label segment-label medium-segment-label")
    .attr("x", (row) => x(row.medium / 2))
    .attr("y", (row) => y(row.code) + y.bandwidth() / 2 + 4)
    .attr("text-anchor", "middle")
    .attr("font-size", 11)
    .attr("font-weight", 800)
    .text((row) => row.medium)
    .attr("display", (row) => (x(row.medium) - x(0) > 26 ? null : "none"));

  groups
    .append("text")
    .attr("class", "chart-label segment-label high-segment-label")
    .attr("x", (row) => {
      const segmentWidth = x(row.medium + row.high) - x(row.medium);
      return segmentWidth > 28 ? x(row.medium + row.high / 2) : x(row.medium + row.high) + 6;
    })
    .attr("y", (row) => y(row.code) + y.bandwidth() / 2 + 4)
    .attr("text-anchor", (row) => (x(row.medium + row.high) - x(row.medium) > 28 ? "middle" : "start"))
    .attr("font-size", 12)
    .attr("font-weight", 800)
    .text((row) => row.high);

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(6));

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(
      d3
        .axisLeft(y)
        .tickSize(0)
        .tickFormat((code) => shortHazardName(data.find((row) => row.code === code)?.name || code)),
    )
    .call((group) => group.select(".domain").remove());

  drawLegend(container, [
    { label: "Medium", color: THEME.warm },
    { label: "High", color: THEME.redDark },
  ]);
}

function drawEvents(selector, series) {
  const container = d3.select(selector);
  const { width, height } = chartSize(container, 420);
  const compact = isCompactChart(width);
  const margin = { top: 16, right: compact ? 18 : 122, bottom: 36, left: 48 };
  container.selectAll("*").remove();

  const hazardOrder = ["Flood", "Extreme weather", "Earthquake", "Drought", "Extreme temperature", "Wildfire"];
  const labels = new Map([
    ["Flood", "Floods"],
    ["Extreme weather", "Extreme weather"],
    ["Earthquake", "Earthquakes"],
    ["Drought", "Droughts"],
    ["Extreme temperature", "Extreme temperatures"],
    ["Wildfire", "Wildfires"],
  ]);
  const colors = new Map([
    ["Flood", THEME.greenDark],
    ["Extreme weather", THEME.greenLight],
    ["Earthquake", THEME.ink],
    ["Drought", THEME.warm],
    ["Extreme temperature", THEME.redDark],
    ["Wildfire", THEME.greenDark],
  ]);
  const filtered = series.filter((row) => hazardOrder.includes(row.type));
  const byYear = d3.rollups(
    filtered,
    (rows) => Object.fromEntries(rows.map((row) => [row.type, row.value])),
    (row) => row.year,
  );
  const table = byYear.map(([year, values]) => ({ year, ...values })).sort((a, b) => a.year - b.year);
  const stack = d3.stack().keys(hazardOrder).value((row, key) => row[key] || 0)(table);

  const x = d3
    .scaleLinear()
    .domain(d3.extent(table, (row) => row.year))
    .range([margin.left, width - margin.right]);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(stack, (layer) => d3.max(layer, (point) => point[1]))])
    .nice()
    .range([height - margin.bottom, margin.top]);
  const area = d3
    .area()
    .x((point) => x(point.data.year))
    .y0((point) => y(point[0]))
    .y1((point) => y(point[1]));

  const svg = container.append("svg").attr("viewBox", `0 0 ${width} ${height}`);
  svg.append("g").attr("class", "grid").call(axisGridLeft(y, margin.left, width - margin.right));
  svg
    .append("g")
    .selectAll("path")
    .data(stack)
    .join("path")
    .attr("fill", (layer) => colors.get(layer.key))
    .attr("opacity", 0.9)
    .attr("d", area)
    .append("title")
    .text((layer) => layer.key);

  if (!compact && table.length > 0) {
    const endLabels = stack
      .map((layer) => {
        const point = layer[layer.length - 1];
        const value = point ? point[1] - point[0] : 0;
        return {
          key: layer.key,
          label: labels.get(layer.key) || layer.key,
          color: colors.get(layer.key),
          value,
          x: x(point.data.year),
          y: y((point[0] + point[1]) / 2),
        };
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    placeVerticalLabels(endLabels, margin.top + 8, height - margin.bottom - 8, 16);

    const labelGroup = svg.append("g").attr("class", "chart-labels endpoint-labels");
    labelGroup
      .selectAll("line")
      .data(endLabels)
      .join("line")
      .attr("class", "label-connector")
      .attr("x1", (item) => item.x + 2)
      .attr("y1", (item) => item.y)
      .attr("x2", (item) => item.x + 14)
      .attr("y2", (item) => item.labelY)
      .attr("stroke", (item) => item.color);

    labelGroup
      .selectAll("text")
      .data(endLabels)
      .join("text")
      .attr("class", "chart-label endpoint-label")
      .attr("x", (item) => item.x + 18)
      .attr("y", (item) => item.labelY + 4)
      .attr("fill", (item) => item.color)
      .text((item) => `${item.label} ${fmtNumber(item.value)}`);
  }

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(6));
  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5))
    .call((group) => group.select(".domain").remove());

  drawLegend(container, hazardOrder.map((key) => ({ label: labels.get(key), color: colors.get(key) })));
}

function drawDamage(selector, series) {
  const container = d3.select(selector);
  const { width, height } = chartSize(container, 390);
  const compact = isCompactChart(width);
  const margin = { top: 18, right: compact ? 22 : 100, bottom: 36, left: 58 };
  const data = series
    .filter((row) => row.type === "All disasters")
    .map((row) => ({ year: row.year, value: row.value / 1e9 }))
    .sort((a, b) => a.year - b.year);
  container.selectAll("*").remove();

  const x = d3.scaleLinear().domain(d3.extent(data, (row) => row.year)).range([margin.left, width - margin.right]);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (row) => row.value)])
    .nice()
    .range([height - margin.bottom, margin.top]);
  const line = d3
    .line()
    .x((row) => x(row.year))
    .y((row) => y(row.value));

  const svg = container.append("svg").attr("viewBox", `0 0 ${width} ${height}`);
  svg.append("g").attr("class", "grid").call(axisGridLeft(y, margin.left, width - margin.right));
  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", THEME.redDark)
    .attr("stroke-width", 3)
    .attr("d", line);
  svg
    .selectAll("circle")
    .data(data.filter((_, index) => index % 5 === 0))
    .join("circle")
    .attr("cx", (row) => x(row.year))
    .attr("cy", (row) => y(row.value))
    .attr("r", 2.5)
    .attr("fill", THEME.ink);

  const latest = data[data.length - 1];
  const peak = d3.greatest(data, (row) => row.value);
  const callouts = [
    latest ? { ...latest, label: `Latest ${latest.year}: ${fmtBillions(latest.value)}` } : null,
    !compact && peak && peak.year !== latest?.year
      ? { ...peak, label: `Peak ${peak.year}: ${fmtBillions(peak.value)}` }
      : null,
  ].filter(Boolean);

  svg
    .append("g")
    .attr("class", "chart-labels damage-labels")
    .selectAll("circle")
    .data(callouts)
    .join("circle")
    .attr("cx", (row) => x(row.year))
    .attr("cy", (row) => y(row.value))
    .attr("r", 4)
    .attr("fill", THEME.redDark)
    .attr("stroke", THEME.panel)
    .attr("stroke-width", 2);

  svg
    .select(".damage-labels")
    .selectAll("text")
    .data(callouts)
    .join("text")
    .attr("class", "chart-label endpoint-label")
    .attr("x", (row) => {
      const preferred = x(row.year) + 8;
      return preferred > width - margin.right + 4 ? x(row.year) - 8 : preferred;
    })
    .attr("y", (row, index) => y(row.value) + (index === 0 ? 4 : -8))
    .attr("text-anchor", (row) => (x(row.year) > width - margin.right - 28 ? "end" : "start"))
    .text((row) => row.label);

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(5));
  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5).tickFormat((value) => `$${value}bn`))
    .call((group) => group.select(".domain").remove());
}

function drawScatter(selector, countries, selectedIso) {
  const container = d3.select(selector);
  const { width, height } = chartSize(container, 430);
  const compact = isCompactChart(width);
  const margin = { top: 20, right: compact ? 28 : 82, bottom: 52, left: 58 };
  const data = countries.filter(
    (country) => Number.isFinite(country.risk) && Number.isFinite(country.worldRiskIndexValue),
  );
  container.selectAll("*").remove();

  const x = d3
    .scaleLinear()
    .domain([0, 10])
    .nice()
    .range([margin.left, width - margin.right]);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (country) => country.worldRiskIndexValue) || 1])
    .nice()
    .range([height - margin.bottom, margin.top]);
  const radius = d3
    .scaleSqrt()
    .domain([0, d3.max(data, (country) => country.disasterDisplacementValue || 0) || 1])
    .range([4, 18]);

  const svg = container.append("svg").attr("viewBox", `0 0 ${width} ${height}`);
  svg.append("g").attr("class", "grid").call(axisGridLeft(y, margin.left, width - margin.right));
  svg.append("g").attr("class", "grid").call(axisGridBottom(x, height - margin.bottom, margin.top));

  svg
    .append("g")
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", (country) => x(country.risk))
    .attr("cy", (country) => y(country.worldRiskIndexValue))
    .attr("r", (country) => radius(country.disasterDisplacementValue || 0))
    .attr("fill", THEME.greenLight)
    .attr("fill-opacity", 0.42)
    .attr("stroke", THEME.greenDark)
    .attr("stroke-width", 1)
    .on("mousemove", (event, country) => {
      showTooltip(
        event,
        `<strong>${country.name}</strong>INFORM: ${fmtFixed(country.risk, 1)}<br>WorldRiskIndex: ${fmtFixed(country.worldRiskIndexValue, 2)}`,
      );
    })
    .on("mouseleave", hideTooltip);

  const maxDisplacement = d3.max(data, (country) => country.disasterDisplacementValue || 0) || 1;
  const labelMap = new Map();
  const selectedCountry = data.find((country) => country.iso3 === selectedIso);
  if (selectedCountry) labelMap.set(selectedCountry.iso3, selectedCountry);
  data
    .map((country) => ({
      country,
      score:
        country.risk / 10 +
        country.worldRiskIndexValue / (y.domain()[1] || 1) +
        ((country.disasterDisplacementValue || 0) / maxDisplacement) * 0.25,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, compact ? 4 : 7)
    .forEach(({ country }) => labelMap.set(country.iso3, country));

  const scatterLabels = [...labelMap.values()].map((country, index) => {
    const pointX = x(country.risk);
    const anchorEnd = pointX > width - margin.right - 44;
    return {
      ...country,
      pointX,
      pointY: y(country.worldRiskIndexValue),
      labelX: anchorEnd ? pointX - 9 : pointX + 9,
      labelY: y(country.worldRiskIndexValue) - 8 + ((index % 3) - 1) * 7,
      anchorEnd,
      selected: country.iso3 === selectedIso,
    };
  });
  placeVerticalLabels(scatterLabels, margin.top + 10, height - margin.bottom - 12, 14);

  svg
    .append("g")
    .attr("class", "chart-labels scatter-labels")
    .selectAll("text")
    .data(scatterLabels)
    .join("text")
    .attr("class", (country) => `chart-label scatter-label${country.selected ? " selected-label" : ""}`)
    .attr("x", (country) => country.labelX)
    .attr("y", (country) => country.labelY)
    .attr("text-anchor", (country) => (country.anchorEnd ? "end" : "start"))
    .text((country) => country.iso3);

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(6));
  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5))
    .call((group) => group.select(".domain").remove());

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .attr("fill", THEME.muted)
    .attr("font-size", 12)
    .text("INFORM risk score");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 17)
    .attr("text-anchor", "middle")
    .attr("fill", THEME.muted)
    .attr("font-size", 12)
    .text("WorldRiskIndex score");
}

function drawFinanceGap(selector, countries) {
  const container = d3.select(selector);
  if (!container.node()) return;
  const { width, height } = chartSize(container, 390);
  const margin = { top: 12, right: 110, bottom: 36, left: 132 };
  const data = countries
    .filter(
      (country) =>
        Number.isFinite(country.risk) &&
        country.risk >= 5 &&
        Number.isFinite(country.drrOdaDisbursementUsd),
    )
    .map((country) => ({
      ...country,
      financePerRisk: country.drrOdaDisbursementUsd / Math.max(country.risk, 0.1),
    }))
    .sort((a, b) => a.financePerRisk - b.financePerRisk || b.risk - a.risk)
    .slice(0, 14)
    .reverse();
  container.selectAll("*").remove();

  const svg = container.append("svg").attr("viewBox", `0 0 ${width} ${height}`);
  if (data.length === 0) {
    svg
      .append("text")
      .attr("x", margin.left)
      .attr("y", 40)
      .attr("fill", THEME.muted)
      .text("No finance records available.");
    return;
  }

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, (country) => country.financePerRisk / 1e6) || 1])
    .nice()
    .range([margin.left, width - margin.right]);
  const y = d3
    .scaleBand()
    .domain(data.map((country) => country.iso3))
    .range([height - margin.bottom, margin.top])
    .padding(0.28);

  svg.append("g").attr("class", "grid").call(axisGridBottom(x, height - margin.bottom, margin.top));
  svg
    .append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", x(0))
    .attr("y", (country) => y(country.iso3))
    .attr("width", (country) => Math.max(2, x(country.financePerRisk / 1e6) - x(0)))
    .attr("height", y.bandwidth())
    .attr("fill", THEME.warm);

  svg
    .append("g")
    .selectAll("text.value")
    .data(data)
    .join("text")
    .attr("class", "value")
    .attr("x", (country) => x(country.financePerRisk / 1e6) + 6)
    .attr("y", (country) => y(country.iso3) + y.bandwidth() / 2 + 4)
    .attr("font-size", 11)
    .attr("font-weight", 800)
    .text((country) => `${fmtMoney(country.financePerRisk)} / risk point`);

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickFormat((iso3) => shortCountryName(data.find((country) => country.iso3 === iso3)?.name || iso3)))
    .call((group) => group.select(".domain").remove());

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat((value) => `$${value}m`));

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 6)
    .attr("text-anchor", "middle")
    .attr("fill", THEME.muted)
    .attr("font-size", 12)
    .text("DRR-related ODA disbursements per INFORM risk point, latest CRS year");
}

function drawLegend(container, items) {
  container
    .append("div")
    .attr("class", "legend")
    .selectAll("span")
    .data(items)
    .join("span")
    .html((item) => `<i class="swatch" style="background:${item.color}"></i>${item.label}`);
}

function chartSize(container, fallbackHeight) {
  const node = container.node();
  const width = Math.max(320, Math.floor(node.getBoundingClientRect().width));
  const height = Math.max(fallbackHeight, Math.floor(node.getBoundingClientRect().height || fallbackHeight));
  return { width, height };
}

function isCompactChart(width) {
  return width < 560;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function placeVerticalLabels(items, top, bottom, minGap) {
  const sorted = [...items].sort(
    (a, b) => (Number.isFinite(a.labelY) ? a.labelY : a.y) - (Number.isFinite(b.labelY) ? b.labelY : b.y),
  );
  let cursor = top - minGap;

  for (const item of sorted) {
    const desired = Number.isFinite(item.labelY) ? item.labelY : item.y;
    item.labelY = clamp(Math.max(desired, cursor + minGap), top, bottom);
    cursor = item.labelY;
  }

  cursor = bottom + minGap;
  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    const item = sorted[index];
    item.labelY = clamp(Math.min(item.labelY, cursor - minGap), top, bottom);
    cursor = item.labelY;
  }
}

function axisGridLeft(scale, left, right) {
  return (group) =>
    group
      .attr("transform", `translate(${left},0)`)
      .call(d3.axisLeft(scale).ticks(5).tickSize(-(right - left)).tickFormat(""))
      .call((selection) => selection.select(".domain").remove());
}

function axisGridBottom(scale, bottom, top) {
  return (group) =>
    group
      .attr("transform", `translate(0,${bottom})`)
      .call(d3.axisBottom(scale).ticks(5).tickSize(-(bottom - top)).tickFormat(""))
      .call((selection) => selection.select(".domain").remove());
}

function showTooltip(event, html) {
  const tooltip = document.querySelector("#tooltip");
  tooltip.hidden = false;
  tooltip.innerHTML = html;
  const padding = 16;
  const rect = tooltip.getBoundingClientRect();
  let x = event.clientX + 14;
  let y = event.clientY + 14;
  if (x + rect.width + padding > window.innerWidth) x = event.clientX - rect.width - 14;
  if (y + rect.height + padding > window.innerHeight) y = event.clientY - rect.height - 14;
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

function hideTooltip() {
  document.querySelector("#tooltip").hidden = true;
}

function setInfoNote(selector, html) {
  const node = document.querySelector(selector);
  if (node) node.innerHTML = html;
}

function formatDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "latest available";
}

function yearExtent(rows) {
  const years = (Array.isArray(rows) ? rows : [])
    .map((row) => Number(row?.year))
    .filter(Number.isFinite);
  return {
    min: years.length ? Math.min(...years) : null,
    max: years.length ? Math.max(...years) : null,
  };
}

function formatYearRange(extent) {
  if (!Number.isFinite(extent?.min) || !Number.isFinite(extent?.max)) return "latest available";
  return extent.min === extent.max ? String(extent.max) : `${extent.min}-${extent.max}`;
}

function mostCommonYear(rows, field) {
  const counts = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const year = Number(row?.[field]);
    if (Number.isFinite(year)) counts.set(year, (counts.get(year) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0];
}

function fmtNumber(value) {
  if (!Number.isFinite(value)) return "n/a";
  return new Intl.NumberFormat().format(Math.round(value));
}

function fmtFixed(value, digits = 1) {
  if (!Number.isFinite(value)) return "n/a";
  return Number(value).toFixed(digits);
}

function fmtYearValue(value, year, digits = 0) {
  if (!Number.isFinite(value)) return "n/a";
  const display = digits > 0 ? Number(value).toFixed(digits) : fmtNumber(value);
  return `${display} (${year})`;
}

function fmtMoney(value, year) {
  if (!Number.isFinite(value)) return "n/a";
  const suffix = year ? ` (${year})` : "";
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}bn${suffix}`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}m${suffix}`;
  return `$${fmtNumber(value)}${suffix}`;
}

function fmtBillions(value) {
  if (!Number.isFinite(value)) return "n/a";
  return value >= 10 ? `$${value.toFixed(0)}bn` : `$${value.toFixed(1)}bn`;
}

function fmtPct(value, year) {
  if (!Number.isFinite(value)) return "n/a";
  return `${fmtFixed(value, value < 10 ? 2 : 1)}% (${year})`;
}

function fmtStrategy(value, year) {
  if (!Number.isFinite(value)) return "n/a";
  return `${fmtFixed(value, 2)} (${year})`;
}

function fmtAqueduct(value, label) {
  if (!Number.isFinite(value)) return "n/a";
  const clean = label ? label.replace(/\s*\([^)]*\)/g, "").replace(" - ", "-") : "";
  return clean ? `${fmtFixed(value, 1)} ${clean}` : fmtFixed(value, 1);
}

function fmtHazardList(hazards) {
  if (!Array.isArray(hazards) || hazards.length === 0) return "None flagged high";
  return hazards.map((hazard) => shortHazardName(hazard.name)).join(", ");
}

function shortHazardName(name) {
  const replacements = new Map([
    ["River flood", "River flood"],
    ["Coastal flood", "Coastal flood"],
    ["Urban flood", "Urban flood"],
    ["Earthquake", "Earthquake"],
    ["Cyclone", "Cyclone"],
    ["Extreme heat", "Extreme heat"],
    ["Wildfire", "Wildfire"],
    ["Water scarcity", "Water scarcity"],
    ["Landslide", "Landslide"],
    ["Tsunami", "Tsunami"],
    ["Volcano", "Volcano"],
  ]);
  return replacements.get(name) || name;
}

function shortCountryName(name) {
  const replacements = new Map([
    ["Congo, Democratic Republic of the", "DR Congo"],
    ["Democratic Republic of the Congo", "DR Congo"],
    ["Central African Republic", "Central African Rep."],
    ["Syrian Arab Republic", "Syria"],
    ["United States of America", "United States"],
  ]);
  const replacement = replacements.get(name) || name;
  return replacement.length > 22 ? `${replacement.slice(0, 20)}...` : replacement;
}

function projectYear(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getUTCFullYear() : "n/a";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows, columns) {
  return [
    columns.map(csvEscape).join(","),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(",")),
  ].join("\n");
}

function debounce(fn, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}
