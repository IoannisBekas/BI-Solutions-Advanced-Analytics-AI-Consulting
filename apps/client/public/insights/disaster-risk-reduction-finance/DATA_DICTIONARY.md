# Data Dictionary

The main public dataset is `data/processed/dashboard-data.json`. A flatter export is available at `data/processed/country_metrics.csv`.

## Country Identifiers

| Field | Meaning |
| --- | --- |
| `iso3` | ISO3 country code used to join sources. |
| `name` | Country name from INFORM metadata where available. |
| `group` | INFORM regional grouping code; the dashboard maps the first letter to continent labels. |

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

## International Finance And Project Signals

| Field | Meaning | Source |
| --- | --- | --- |
| `drrOdaYear` | Latest OECD CRS year used for DRR-related ODA. | OECD CRS |
| `drrOdaDisbursementUsd` | DRR-related ODA disbursements for selected CRS purpose codes. | OECD CRS |
| `drrOdaCommitmentUsd` | DRR-related ODA commitments for selected CRS purpose codes. | OECD CRS |
| `drrOdaTopDonors` | Top donor disbursement records for the latest CRS year. | OECD CRS |
| `drrOdaSectors` | Sector split for selected CRS purpose codes. | OECD CRS |
| `worldBankDrmProjectCount` | Count of World Bank projects matched to DRM/resilience screening. | World Bank Projects |
| `worldBankDrmCommitmentUsd` | Full project commitment total for matched World Bank projects. | World Bank Projects |
| `worldBankDrmProjects` | Example project records with source URLs. | World Bank Projects |
| `gcfDrrProjectCount` | Count of GCF projects matched to DRR/resilience screening. | Green Climate Fund |
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
