# Data Dictionary

The main public dataset powering the atlas is `data/processed/dashboard-data.json`. CSV exports are generated in-browser from the public atlas dataset.

## Country Identifiers

| Field | Meaning |
| --- | --- |
| `iso3` | ISO3 country code used to join sources. |
| `name` | Country name from INFORM metadata where available. |
| `group` | INFORM regional grouping code; the atlas maps the first letter to continent labels. |

## Risk And Readiness

| Field | Meaning | Source |
| --- | --- | --- |
| `risk` | INFORM Risk score, 0-10. | INFORM Risk Index |
| `hazardExposure` | INFORM hazard and exposure score. | INFORM Risk Index |
| `naturalHazards` | INFORM natural hazard score. | INFORM Risk Index |
| `humanHazards` | INFORM human hazard score. | INFORM Risk Index |
| `vulnerability` | INFORM vulnerability score. | INFORM Risk Index |
| `lackCopingCapacity` | INFORM lack of coping capacity score. | INFORM Risk Index |
| `nationalStrategyValue` | Sendai-linked national DRR strategy indicator. | UNDRR / OWID |
| `localStrategyValue` | Local government DRR strategy coverage. | UNDRR / OWID |

## Loss, Displacement, And Hazard Screening

| Field | Meaning | Source |
| --- | --- | --- |
| `lossUsdValue` / `lossUsdYear` | Latest reported direct disaster economic loss and year. | UNDRR / OWID |
| `lossGdpValue` / `lossGdpYear` | Latest reported direct loss as GDP share and year. | UNDRR / OWID |
| `deathsValue` / `deathsYear` | Latest reported natural disaster deaths and year. | OWID |
| `disasterDisplacementValue` / `disasterDisplacementYear` | New disaster displacements and year. | World Bank / IDMC |
| `thinkHazard` | Country hazard screening levels and high/medium hazard lists. | ThinkHazard |
| `observedSeverityIndex` | 0-100 public impact-severity signal from deaths, displacement, direct loss, and loss/GDP indicators where available. | World Bank / IDMC, UNDRR / OWID |
| `observedSeverityStatus` | Indicates when public impact indicators are limited rather than interpreting the score as confirmed zero severity. | Derived signal |
| `compoundHazardPressureIndex` | 0-100 proxy for multi-hazard pressure using modeled hazards and INFORM hazard, vulnerability, and coping-capacity dimensions. | ThinkHazard, INFORM |
| `reportingGapSignal` | Low, medium, or high screening signal for possible thin public impact indicators relative to modeled risk. | Derived signal |
| `reportingGapReasons` | Short labels explaining the reporting-gap signal. | Derived signal |
| `gdacsCurrentAlertCount` | Count of current GDACS alerts matched to the country in the latest feed. | GDACS |
| `gdacsRedAlertCount` / `gdacsOrangeAlertCount` / `gdacsGreenAlertCount` | Current GDACS alert counts by alert level. | GDACS |
| `gdacsAlertTypes` | Current GDACS alert event-type counts for the country. | GDACS |
| `gdacsCurrentAlerts` | Recent current GDACS alert records with title, event type, level, date, severity, affected-population metadata, and source URL. | GDACS |
| `gdacsLatestAlertTitle` / `gdacsLatestAlertAt` | Latest current GDACS alert title and date. | GDACS |

## Population And Economy Denominators

| Field | Meaning | Source |
| --- | --- | --- |
| `populationValue` / `populationYear` | Latest population value and year. | World Bank WDI |
| `gdpUsdValue` / `gdpUsdYear` | Latest GDP in current US dollars and year. | World Bank WDI |
| `gdpPerCapitaValue` / `gdpPerCapitaYear` | Latest GDP per capita in current US dollars and year. | World Bank WDI |
| `drrOdaPerCapitaUsd` | DRR-related ODA disbursement divided by latest population. | OECD CRS / World Bank WDI |
| `drrOdaShareOfGdp` | DRR-related ODA disbursement as a percent of latest GDP. | OECD CRS / World Bank WDI |
| `disasterDisplacementPer100k` | Disaster displacement per 100,000 people. | World Bank / IDMC / World Bank WDI |
| `directLossPerCapitaUsd` | Reported direct disaster economic loss per person. | UNDRR / OWID / World Bank WDI |
| `directLossShareOfGdpDerived` | Reported direct disaster economic loss as a percent of latest GDP, derived from current-US-dollar loss and WDI GDP. | UNDRR / OWID / World Bank WDI |

## International Finance And Project Signals

| Field | Meaning | Source |
| --- | --- | --- |
| `drrOdaYear` | Latest OECD CRS year used for DRR-related ODA. | OECD CRS |
| `drrOdaDisbursementUsd` | DRR-related ODA disbursements for selected CRS purpose codes. | OECD CRS |
| `drrOdaCommitmentUsd` | DRR-related ODA commitments for selected CRS purpose codes. | OECD CRS |
| `drrOdaTopDonors` | Top donor disbursement records for the latest CRS year. | OECD CRS |
| `drrOdaSectors` | Sector split for selected CRS purpose codes. | OECD CRS |
| `drrOdaPurposeCategories` | DRR-related ODA grouped into preparedness and early warning, prevention and risk mitigation, governance and enabling systems, adaptation and resilience, recovery context, climate mitigation co-benefit, or other DRR-related support. | OECD CRS |
| `drrOdaPerSeverityPoint` | DRR-related ODA disbursement divided by observed severity index. | OECD CRS and derived severity signal |
| `drrOdaPerCompoundRiskPoint` | DRR-related ODA disbursement divided by compound hazard pressure index. | OECD CRS and derived pressure signal |
| `worldBankDrmProjectCount` | Count of World Bank projects matched to DRM/resilience screening. | World Bank Projects |
| `worldBankDrmCommitmentUsd` | Full project commitment total for matched World Bank projects. | World Bank Projects |
| `worldBankDrmProjects` | Example project records with source URLs. | World Bank Projects |
| `gcfDrrProjectCount` | Count of GCF projects matched to resilience screening. | Green Climate Fund |
| `gcfDrrLinkedGcfBudgetUsd` | GCF budget linked to matched projects. | Green Climate Fund |
| `gcfDrrLinkedCoFinancingUsd` | Co-finance linked to matched projects. | Green Climate Fund |
| `gcfDrrProjects` | Example GCF project records with source URLs. | Green Climate Fund |
| `ochaHumanitarianFundingUsd` | Humanitarian response funding context. | OCHA FTS |

## Climate And Water Risk

| Field | Meaning | Source |
| --- | --- | --- |
| `worldRiskIndexValue` | Latest WorldRiskIndex score. | WorldRiskIndex |
| `worldRiskExposureValue` | WorldRiskIndex exposure component. | WorldRiskIndex |
| `worldRiskVulnerabilityValue` | WorldRiskIndex vulnerability component. | WorldRiskIndex |
| `worldRiskSusceptibilityValue` | WorldRiskIndex susceptibility component. | WorldRiskIndex |
| `worldRiskLackCopingValue` | WorldRiskIndex lack of coping component. | WorldRiskIndex |
| `worldRiskLackAdaptationValue` | WorldRiskIndex lack of adaptation component. | WorldRiskIndex |
| `ndGainValue` | ND-GAIN country score. | ND-GAIN |
| `ndGainVulnerabilityValue` | ND-GAIN vulnerability score. | ND-GAIN |
| `ndGainReadinessValue` | ND-GAIN readiness score. | ND-GAIN |
| `waterStressScore` | Baseline water stress score. | WRI Aqueduct |
| `waterStress2050Score` | Projected 2050 water stress score. | WRI Aqueduct |
| `riverFloodRiskScore` | River flood risk score. | WRI Aqueduct |
| `droughtRiskScore` | Drought risk score. | WRI Aqueduct |
