# Country-Level DRR Risk and Finance Briefing

This project collects key databases for Disaster Risk Reduction (DRR) research across countries and turns selected open datasets into a static editorial dashboard.

## Live Dashboard Files

- `index.html` - static dashboard page.
- `app.js` - D3 rendering logic.
- `styles.css` - print-inspired editorial styling.
- `scripts/download-data.mjs` - repeatable data download and normalization script.
- `data_catalog.json` - source catalog with access mode and automation status.
- `data/raw/` - source downloads.
- `data/processed/dashboard-data.json` - compact dashboard dataset.
- `DATA_SOURCES.md` - analysis of downloadable, reference, and case-study source layers.
- `METHODOLOGY.md` - methodology, evidence tiers, and interpretation notes.
- `DATA_DICTIONARY.md` - field definitions for the processed dashboard dataset and CSV export.
- `ACCESSIBILITY_CHECKLIST.md` - accessibility and mobile hardening checklist.
- `TERMS_PRIVACY.md` - terms, privacy, and contact note.
- `PREMIUM_DATA.md` - paid-plan and premium-data backend contract.
- `HOW_IT_WAS_BUILT.md` - implementation architecture, data workflow, design choices, and deployment notes.
- `ROADMAP.md` - enhancement roadmap for data depth, premium access, exports, and governance.
- `premium-api/` - minimal Stripe Checkout API template for protected premium access.

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

The live static site includes Free, Pro, and Institution plan surfaces. Pro is priced at `$59` per month billed annually, and Institution is priced at `$199` per month billed annually.

Restricted premium data is designed to be served through authenticated API access with entitlement checks. It should not be committed into `data/processed/` or any other public static file. See `PREMIUM_DATA.md` for the backend contract and recommended premium data modules.

## Release Notes

The public dashboard includes CSV exports, country comparison, source-linked metrics, chart data tables, dataset Q&A, documentation, and visible methodology/source-scope sections. Release QA includes static accessibility checks, mobile overflow checks, link checks, and manual keyboard/screen-reader review for major updates.

## Legacy Source Table

- `data/drr_databases.csv` - structured version of the original database list for spreadsheet or analysis workflows.
