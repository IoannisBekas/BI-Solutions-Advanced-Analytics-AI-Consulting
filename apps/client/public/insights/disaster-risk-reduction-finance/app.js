(async function init() {
  const [data, world, product] = await Promise.all([
    d3.json("./data/processed/dashboard-data.json"),
    d3.json("./data/processed/world.geojson"),
    d3.json("./data/product-plans.json").catch(() => null),
  ]);

  const state = {
    data,
    world,
    product: product || fallbackProductConfig(),
    entitlement: null,
    selectedIso: data.countries.some((country) => country.iso3 === "PHL")
      ? "PHL"
      : data.countries[0].iso3,
  };
  state.entitlement = await loadEntitlement(state.product);

  populateCountrySelect(state);
  renderAll(state);
  window.addEventListener("resize", debounce(() => renderCharts(state), 150));
  window.addEventListener("scroll", hideTooltip, { passive: true });
})();

function renderAll(state) {
  renderHeader(state.data);
  renderKpis(state.data);
  renderCountryProfile(state);
  renderFinanceProfile(state);
  renderPremiumAccess(state);
  renderSources(state.data.sources);
  renderCharts(state);
}

function renderCharts(state) {
  drawRiskMap("#risk-map", state);
  drawHazardSummary("#hazard-summary-chart", state.data.series.thinkHazardSummary);
  drawTopRisk("#top-risk-chart", state.data.countries);
  drawEvents("#events-chart", state.data.series.disasterEvents);
  drawDamage("#damage-chart", state.data.series.economicDamage);
  drawScatter("#scatter-chart", state.data.countries);
  drawFinanceGap("#finance-gap-chart", state.data.countries);
}

function renderHeader(data) {
  const generated = new Date(data.generatedAt);
  const published = data.informWorkflow.publishedAt
    ? new Date(data.informWorkflow.publishedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "latest available";
  document.querySelector("#data-edition").textContent = `${data.informWorkflow.name}`;
  document.querySelector("#data-note").textContent =
    `INFORM published ${published}. Dashboard generated ${generated.toLocaleDateString()}.`;
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

function populateCountrySelect(state) {
  const selectors = document.querySelectorAll("#country-select, #quick-country-select");
  const countries = [...state.data.countries].sort((a, b) => a.name.localeCompare(b.name));
  const options = countries
    .map((country) => `<option value="${escapeHtml(country.iso3)}">${escapeHtml(country.name)}</option>`)
    .join("");

  selectors.forEach((select) => {
    select.innerHTML = options;
    select.value = state.selectedIso;
    select.addEventListener("change", () => {
      setSelectedCountry(state, select.value, {
        scrollToCountry: select.id === "quick-country-select",
      });
    });
  });
}

function setSelectedCountry(state, iso3, options = {}) {
  if (!state.data.countries.some((country) => country.iso3 === iso3)) return;
  state.selectedIso = iso3;
  syncCountryControls(state);
  renderCountryProfile(state);
  renderFinanceProfile(state);
  renderPremiumAccess(state);
  drawRiskMap("#risk-map", state);
  hideTooltip();

  if (options.scrollToCountry) {
    document.querySelector("#country-view")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function syncCountryControls(state) {
  document.querySelectorAll("#country-select, #quick-country-select").forEach((select) => {
    select.value = state.selectedIso;
  });
}

function renderCountryProfile(state) {
  const country = state.data.countries.find((item) => item.iso3 === state.selectedIso);
  const profile = document.querySelector("#country-profile");
  if (!country) return;

  profile.innerHTML = `
    <div class="profile-main">
      <span>${country.iso3}</span>
      <strong>${fmtFixed(country.risk, 1)}</strong>
      <span>INFORM risk score</span>
    </div>
    <div class="metric-grid">
      ${metric("Hazard and exposure", fmtFixed(country.hazardExposure, 1))}
      ${metric("Natural hazards", fmtFixed(country.naturalHazards, 1))}
      ${metric("Human hazards", fmtFixed(country.humanHazards, 1))}
      ${metric("Vulnerability", fmtFixed(country.vulnerability, 1))}
      ${metric("Lack of coping capacity", fmtFixed(country.lackCopingCapacity, 1))}
      ${metric("Direct loss / GDP", fmtPct(country.lossGdpValue, country.lossGdpYear))}
      ${metric("National DRR strategy", fmtStrategy(country.nationalStrategyValue, country.nationalStrategyYear))}
      ${metric("Local DRR coverage", fmtPct(country.localStrategyValue, country.localStrategyYear))}
      ${metric("Natural disaster deaths", fmtYearValue(country.deathsValue, country.deathsYear))}
      ${metric("Disaster displacement", fmtYearValue(country.disasterDisplacementValue, country.disasterDisplacementYear))}
      ${metric("Direct economic loss", fmtMoney(country.lossUsdValue, country.lossUsdYear))}
      ${metric("DRR ODA disb.", fmtMoney(country.drrOdaDisbursementUsd, country.drrOdaYear))}
      ${metric("DRR ODA commit.", fmtMoney(country.drrOdaCommitmentUsd, country.drrOdaYear))}
      ${metric("GCF DRR/resilience", fmtNumber(country.gcfDrrProjectCount))}
      ${metric("GCF linked budget", fmtMoney(country.gcfDrrLinkedTotalBudgetUsd))}
      ${metric("OCHA response funding", fmtMoney(country.ochaHumanitarianFundingUsd, country.ochaHumanitarianYear))}
      ${metric("WorldRiskIndex", fmtYearValue(country.worldRiskIndexValue, country.worldRiskIndexYear, 2))}
      ${metric("WRI exposure", fmtFixed(country.worldRiskExposureValue, 1))}
      ${metric("WRI vulnerability", fmtFixed(country.worldRiskVulnerabilityValue, 1))}
      ${metric("WRI susceptibility", fmtFixed(country.worldRiskSusceptibilityValue, 1))}
      ${metric("WRI lack of coping", fmtFixed(country.worldRiskLackCopingValue, 1))}
      ${metric("WRI lack of adaptation", fmtFixed(country.worldRiskLackAdaptationValue, 1))}
      ${metric("ND-GAIN score", fmtYearValue(country.ndGainValue, country.ndGainYear, 1))}
      ${metric("ND-GAIN vulnerability", fmtFixed(country.ndGainVulnerabilityValue, 3))}
      ${metric("ND-GAIN readiness", fmtFixed(country.ndGainReadinessValue, 3))}
      ${metric("Water stress", fmtAqueduct(country.waterStressScore, country.waterStressLabel))}
      ${metric("Water stress 2050", fmtAqueduct(country.waterStress2050Score, country.waterStress2050Label))}
      ${metric("River flood risk", fmtAqueduct(country.riverFloodRiskScore, country.riverFloodRiskLabel))}
      ${metric("Drought risk", fmtAqueduct(country.droughtRiskScore, country.droughtRiskLabel))}
      ${metric("WB DRM projects", fmtNumber(country.worldBankDrmProjectCount))}
      ${metric("High hazards", fmtHazardList(country.thinkHazard?.highHazards), true)}
    </div>
  `;
}

function metric(label, value, wide = false) {
  return `<div class="metric${wide ? " metric-wide" : ""}"><span>${label}</span><strong>${value}</strong></div>`;
}

function renderFinanceProfile(state) {
  const country = state.data.countries.find((item) => item.iso3 === state.selectedIso);
  const panel = document.querySelector("#finance-profile");
  if (!country || !panel) return;

  const donors = Array.isArray(country.drrOdaTopDonors) ? country.drrOdaTopDonors : [];
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
      </article>
      <article>
        <span>Top reported donor</span>
        ${confidenceBadge("High confidence")}
        <strong>${topDonor ? escapeHtml(topDonor.name) : "n/a"}</strong>
        <p>${topDonor ? fmtMoney(topDonor.disbursementUsd, country.drrOdaYear) : "No donor breakdown in latest CRS year."}</p>
      </article>
      <article>
        <span>World Bank DRM-tagged projects</span>
        ${confidenceBadge("Project signal")}
        <strong>${fmtNumber(country.worldBankDrmProjectCount)}</strong>
        <p>${fmtNumber(country.worldBankDrmActiveProjectCount)} active; ${fmtMoney(country.worldBankDrmCommitmentUsd)} full project commitments.</p>
      </article>
      <article>
        <span>GCF DRR/resilience project signals</span>
        ${confidenceBadge("Project signal")}
        <strong>${fmtNumber(country.gcfDrrProjectCount)}</strong>
        <p>${fmtMoney(country.gcfDrrLinkedGcfBudgetUsd)} GCF funding; ${fmtMoney(country.gcfDrrLinkedCoFinancingUsd)} co-finance.</p>
      </article>
      <article>
        <span>OCHA humanitarian response context</span>
        ${confidenceBadge("Response funding")}
        <strong>${fmtMoney(country.ochaHumanitarianFundingUsd, country.ochaHumanitarianYear)}</strong>
        <p>Response funding tracked by FTS, not counted as prevention or preparedness spending.</p>
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
                        <span>${escapeHtml(donor.name)}</span>
                        <strong>${fmtMoney(donor.disbursementUsd)}</strong>
                      </div>
                    `,
                  )
                  .join("")
              : `<p class="empty-note">No OECD CRS donor records in the latest finance year.</p>`
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
        <strong>${billingReady ? "Checkout ready" : "Setup required"}</strong>
        <p>${billingReady ? "Plan buttons can send users through a configured checkout flow." : "Add Stripe Checkout links or a checkout API endpoint before collecting payments."}</p>
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
          <span>Module</span>
          <span>Fields</span>
          <span>Value</span>
          <span>Tier</span>
        </div>
        ${rows
          .map(
            (row) => `
              <div class="preview-row" role="row">
                <span>${escapeHtml(row[0])}</span>
                <span>${escapeHtml(row[1])}</span>
                <span>${escapeHtml(row[2])}</span>
                <strong>${escapeHtml(row[3])} locked</strong>
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

function requestAccess(planId, state) {
  const product = state.product || {};
  const plans = Array.isArray(product.plans) ? product.plans : [];
  const plan = plans.find((item) => item.id === planId);
  const status = document.querySelector("#billing-status");
  if (!plan || !status) return;
  const country = state.data.countries.find((item) => item.iso3 === state.selectedIso);
  const countryName = country ? country.name : "the selected country";
  status.textContent =
    `${plan.name} access requests are not connected yet. Next step: deploy the premium API, connect Stripe, and capture request details for ${countryName}.`;
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
    .range(["#f5efe2", "#f1cdb3", "#e99573", "#dc5a42", "#b8231c", "#6d0c08"]);

  svg
    .append("g")
    .selectAll("path")
    .data(mapFeatures)
    .join("path")
    .attr("data-iso", (feature) => feature.id)
    .attr("d", path)
    .attr("fill", (feature) => {
      const row = riskByIso.get(feature.id);
      return row ? color(row.risk) : "#ded8ce";
    })
    .attr("stroke", (feature) => (feature.id === state.selectedIso ? "#111111" : "#fffdf8"))
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

  const legend = svg.append("g").attr("transform", `translate(18, ${height - 32})`);
  const legendData = [
    ["<2", "#f5efe2"],
    ["2-3.5", "#f1cdb3"],
    ["3.5-5", "#e99573"],
    ["5-6.5", "#dc5a42"],
    ["6.5-8", "#b8231c"],
    [">8", "#6d0c08"],
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
    .attr("fill", "#555")
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
    .attr("fill", (country) => (country.risk >= 8 ? "#9f0d08" : "#e3120b"));

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
    .attr("fill", "#c99700");
  groups
    .append("rect")
    .attr("x", (row) => x(row.medium))
    .attr("y", (row) => y(row.code))
    .attr("width", (row) => x(row.medium + row.high) - x(row.medium))
    .attr("height", y.bandwidth())
    .attr("fill", "#e3120b");

  groups
    .append("text")
    .attr("x", (row) => x(row.medium + row.high) + 6)
    .attr("y", (row) => y(row.code) + y.bandwidth() / 2 + 4)
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
    { label: "Medium", color: "#c99700" },
    { label: "High", color: "#e3120b" },
  ]);
}

function drawEvents(selector, series) {
  const container = d3.select(selector);
  const { width, height } = chartSize(container, 420);
  const margin = { top: 16, right: 18, bottom: 36, left: 48 };
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
    ["Flood", "#33658a"],
    ["Extreme weather", "#297373"],
    ["Earthquake", "#6d597a"],
    ["Drought", "#c99700"],
    ["Extreme temperature", "#e3120b"],
    ["Wildfire", "#4d7c0f"],
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
  const margin = { top: 18, right: 18, bottom: 36, left: 58 };
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
    .attr("stroke", "#e3120b")
    .attr("stroke-width", 3)
    .attr("d", line);
  svg
    .selectAll("circle")
    .data(data.filter((_, index) => index % 5 === 0))
    .join("circle")
    .attr("cx", (row) => x(row.year))
    .attr("cy", (row) => y(row.value))
    .attr("r", 2.5)
    .attr("fill", "#111");

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

function drawScatter(selector, countries) {
  const container = d3.select(selector);
  const { width, height } = chartSize(container, 430);
  const margin = { top: 20, right: 28, bottom: 52, left: 58 };
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
    .attr("fill", "#e3120b")
    .attr("fill-opacity", 0.42)
    .attr("stroke", "#9f0d08")
    .attr("stroke-width", 1)
    .on("mousemove", (event, country) => {
      showTooltip(
        event,
        `<strong>${country.name}</strong>INFORM: ${fmtFixed(country.risk, 1)}<br>WorldRiskIndex: ${fmtFixed(country.worldRiskIndexValue, 2)}`,
      );
    })
    .on("mouseleave", hideTooltip);

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
    .attr("fill", "#555")
    .attr("font-size", 12)
    .text("INFORM risk score");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 17)
    .attr("text-anchor", "middle")
    .attr("fill", "#555")
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
      .attr("fill", "#555")
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
    .attr("fill", "#cfa000");

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
    .attr("fill", "#555")
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

function debounce(fn, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}
