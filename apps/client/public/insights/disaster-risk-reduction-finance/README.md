# Disaster Risk Reduction Dashboard

This project collects key databases for Disaster Risk Reduction (DRR) research across countries and turns selected open datasets into a static editorial dashboard.

## Live Dashboard Files

- `index.html` - static dashboard page.
- `app.js` - D3 rendering logic.
- `styles.css` - print-inspired editorial styling.
- `scripts/download-data.mjs` - repeatable data download and normalization script.
- `data_catalog.json` - source catalog with access mode and automation status.
- `data/raw/` - source downloads.
- `data/processed/dashboard-data.json` - compact dashboard dataset.
- `DATA_SOURCES.md` - analysis of what can be downloaded directly and what requires gated/manual access.
- `METHODOLOGY.md` - methodology, evidence tiers, and public-beta caveats.
- `DATA_DICTIONARY.md` - field definitions for the processed dashboard dataset and CSV export.
- `ACCESSIBILITY_CHECKLIST.md` - accessibility and mobile hardening checklist.
- `TERMS_PRIVACY.md` - public beta terms, privacy, and contact note.
- `PREMIUM_DATA.md` - paid-plan and premium-data backend contract.
- `HOW_IT_WAS_BUILT.md` - implementation architecture, data workflow, design choices, and deployment notes.
- `PENDING_WORK.md` - roadmap of remaining product, data, premium, accessibility, and governance work.
- `premium-api/` - minimal Stripe Checkout API template for future backend deployment.

To refresh the data:

```powershell
node .\scripts\download-data.mjs
node .\scripts\validate-data.mjs
```

To run static accessibility and contrast checks:

```powershell
npm run audit:static
npm run audit:mobile
```

## Recommended Starting Trio

For cross-country comparative DRR research, start with:

1. [EM-DAT](https://www.emdat.be/) - global disaster event and loss records.
2. [Sendai Framework Monitor](https://sendaimonitor.undrr.org/) - official disaster statistics and Sendai Framework progress tracking.
3. [INFORM Risk Index](https://drmkc.jrc.ec.europa.eu/inform-index) - composite risk scoring for humanitarian crises and disasters.

Use [DesInventar](https://www.desinventar.net/) or [DELTA Resilience](https://www.undrr.org/building-risk-knowledge/disaster-losses-and-damages-tracking-system-delta-resilience) when subnational disaster loss granularity is required.

## Databases By Type

### Global Disaster Loss And Impact Databases

| Database | Link | Main use |
| --- | --- | --- |
| EM-DAT - Emergency Events Database | <https://www.emdat.be/> | Global human and economic disaster losses from 1900 to present; useful as a main international reference. |
| DesInventar - Disaster Inventory System | <https://www.desinventar.net/> | Open-source disaster inventory platform with strong subnational and local disaster records. |
| DELTA Resilience | <https://www.undrr.org/building-risk-knowledge/disaster-losses-and-damages-tracking-system-delta-resilience> | UNDRR system for tracking hazardous events and recording losses and damages at national and subnational levels. |

### Risk Index And Assessment Tools

| Database | Link | Main use |
| --- | --- | --- |
| INFORM Risk Index | <https://drmkc.jrc.ec.europa.eu/inform-index> | Open-source risk assessment for humanitarian crises and disasters, supporting prevention, preparedness, and response decisions. |
| Sendai Framework Monitor | <https://sendaimonitor.undrr.org/> | Official disaster statistics and national progress tracking under the Sendai Framework targets. |
| World Risk Index | <https://weltrisikobericht.de/worldriskreport> | Country risk rankings and indicators for exposure, vulnerability, and susceptibility. |

### Development And Multilateral Sources

| Database | Link | Main use |
| --- | --- | --- |
| World Bank - Disaster Risk Management Data | <https://libguides.worldbank.org/disasterriskmanagement/data> | Aggregates World Bank and external DRR datasets, including World Development Indicators and disaster risk management resources. |
| PreventionWeb - Global Risk Data Sets | <https://www.preventionweb.net/understanding-disaster-risk/disaster-losses-and-statistics/global-risk-data-sets> | UNDRR portal for global open-source datasets, risk profiles, and hazard information resources. |

### Hazard-Specific Databases

| Database | Link | Main use |
| --- | --- | --- |
| GloFAS - Global Flood Awareness System | <https://www.globalfloods.eu/> | Flood monitoring and forecasting. |
| Global Wildfire Information System (GWIS) | <https://gwis.jrc.ec.europa.eu/> | Global wildfire monitoring and related hazard information. |
| NatCatSERVICE - Munich Re | <https://www.munichre.com/en/solutions/for-industry-clients/natcatservice.html> | Economic and insured disaster loss data by country; public access may be limited to summaries and reports. |

### Meta-Resource

| Database | Link | Main use |
| --- | --- | --- |
| CONVERGE Disaster Databases Directory | <https://converge.colorado.edu/data/disaster-databases/> | Curated directory of specialized disaster databases by hazard type and geography. |

## Suggested Research Uses

| Research need | Suggested sources |
| --- | --- |
| Cross-country disaster event comparison | EM-DAT, Sendai Framework Monitor |
| Official policy target tracking | Sendai Framework Monitor |
| Composite disaster risk scoring | INFORM Risk Index, WorldRiskIndex |
| DRR-related international finance and donors | OECD CRS, World Bank Projects & Operations, GCF Open Data Library |
| Humanitarian response funding context | OCHA Financial Tracking Service |
| Domestic and private DRR finance evidence | National budgets, climate budget tagging, IATI/project documents where public |
| Subnational loss analysis | DesInventar, DELTA Resilience |
| Flood monitoring and forecasts | GloFAS |
| Wildfire monitoring | GWIS |
| Economic and insured losses | NatCatSERVICE, EM-DAT |
| Dataset discovery by hazard or geography | CONVERGE Disaster Databases Directory, PreventionWeb |

## Paid Data Plans

The live static site now includes Free, Pro, and Institution plan surfaces. The current public build does not collect payment yet because Stripe Checkout and the authenticated premium API still need production credentials.

Restricted premium data must be served from a backend after entitlement checks. It should not be committed into `data/processed/` or any other public static file. See `PREMIUM_DATA.md` for the backend contract and recommended premium data modules.

## Production Readiness Notes

The public dashboard includes CSV exports, country comparison, source-linked metrics, chart data tables, and a visible methodology/trust section. Before institutional procurement or formal accessibility claims, run a manual keyboard and screen-reader QA pass, verify the deployed premium API, and update the contact email if `contact@bisolutions.group` is not the preferred support address.

## Legacy Source Table

- `data/drr_databases.csv` - structured version of the original database list for spreadsheet or analysis workflows.
