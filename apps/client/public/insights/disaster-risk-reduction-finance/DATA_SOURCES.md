# DRR Data Download Analysis

This project uses sources that can be downloaded or queried programmatically without private credentials. Several important DRR databases are excellent research sources but are not suitable as automatic public dashboard inputs because they require registration, licensing, country-by-country extraction, or manual interpretation.

## Data Used In The Dashboard

| Source | Download path | What it contributes | Why it was selected |
| --- | --- | --- | --- |
| INFORM Risk Index | Public API: `https://drmkc.jrc.ec.europa.eu/inform-index/API/InformAPI/...` | Current country risk scores and core components: hazard and exposure, vulnerability, and lack of coping capacity. | Best open global source for comparable current DRR risk scoring. |
| WorldRiskIndex | `https://weltrisikobericht.de/download/4566/` | Country-year disaster risk, exposure, vulnerability, susceptibility, lack of coping capacity, and lack of adaptive capacity. | Adds an independent composite risk model and a long-run trend file under CC BY 4.0. |
| OECD CRS | SDMX API query for CRS purpose codes `74010`, `41050`, and `41010` | DRR-related ODA commitments and disbursements by donor, recipient, sector, and latest available CRS year. | Adds the core donor-country finance layer for Sendai Target F style questions. |
| World Bank Projects & Operations | `https://search.worldbank.org/api/v2/projects` using a disaster-risk-management project search plus a metadata filter for disaster/resilience terms | World Bank project counts, active project counts, project examples, and full project commitments. | Adds concrete project examples and a multilateral financing layer. |
| Green Climate Fund Open Data Library | `https://data.greenclimate.fund/public/data/projects` | DRR/climate-resilience project signals, GCF funding, co-finance, public/private sector labels, entities, beneficiaries, and project examples. | Adds climate fund and private-sector project signal coverage without treating it as exact country DRR spending. |
| OCHA Financial Tracking Service | `https://api.hpc.tools/v1/public/fts/flow?year={year}&groupby=Country` | Current-year humanitarian response funding by destination country. | Adds response-finance context beside, not inside, prevention/preparedness DRR finance. |
| OWID / EM-DAT | `https://ourworldindata.org/grapher/natural-disasters-by-type.csv` | Global reported disaster counts by hazard type. | Direct CSV access and clear citation metadata; useful for long-run global context. |
| OWID / EM-DAT | `https://ourworldindata.org/grapher/economic-damage-from-natural-disasters.csv` | Global economic damage by disaster type. | Direct CSV access; complements event frequency with damage severity. |
| OWID / UNDRR SDG indicators | `https://ourworldindata.org/grapher/direct-disaster-economic-loss.csv` | Country-year direct economic losses attributed to disasters. | Public country-level official Sendai/SDG aligned indicator. |
| OWID / UNDRR SDG indicators | `https://ourworldindata.org/grapher/direct-disaster-loss-as-a-share-of-gdp.csv` | Country-year direct economic losses as a share of GDP. | Normalizes losses across economies of different sizes. |
| OWID / UNDRR SDG indicators | `https://ourworldindata.org/grapher/legislative-provisions-for-managing-disaster-risk.csv` | Country national DRR strategy score under the Sendai Framework. | Adds policy readiness, not just hazard exposure. |
| OWID / UNDRR SDG indicators | `https://ourworldindata.org/grapher/local-govts-risk-reduction.csv` | Share of local governments with local DRR strategies. | Adds subnational implementation signal. |
| OWID / WHO | `https://ourworldindata.org/grapher/deaths-from-natural-disasters.csv` | Country-year deaths from natural disasters. | Adds human impact; available as direct CSV. |
| World Bank / IDMC | World Bank API indicator `VC.IDP.NWDS` | Country-year new internal displacement associated with disasters. | Adds a human mobility impact measure that complements deaths and economic loss. |
| ThinkHazard | JSON API at `https://int.thinkhazard.org/report/{ISO3}.json` | Country hazard-screening levels across major natural hazards. | Adds multi-hazard exposure signals independent of recent event counts. |
| ND-GAIN Country Index | ZIP download from `https://gain-new.crc.nd.edu/about/download` | Climate vulnerability, readiness, and adaptation score through 2023. | Adds climate-adaptation capacity and vulnerability context. |
| WRI Aqueduct 4.0 Country Rankings | ZIP download from `https://www.wri.org/data/aqueduct-40-country-rankings` | Baseline and projected water stress, river flood risk, and drought risk. | Adds water-specific hazard and climate-pressure indicators. |

## Important Sources Not Fully Automated

| Source | Status | Best use |
| --- | --- | --- |
| EM-DAT public export | Free for non-commercial use after registration; official export is gated. | Use manually for event-level research and replace the OWID aggregate layer when credentials are available. |
| EM-DAT archive / Dataverse | Research archive under non-commercial/no-derivatives constraints. | Use for reproducible academic analysis after checking license terms. |
| DesInventar | Country databases are downloadable, but coverage and schemas are fragmented by country. | Use for subnational case studies, not a first-pass global dashboard. |
| DELTA Resilience | Current UNDRR system and data model; not exposed as one simple public bulk dataset. | Use for institutional loss accounting workflows and national systems. |
| Munich Re NatCatSERVICE | Valuable insured/economic loss data, but mostly commercial with public summaries. | Use for market/insurance analysis where licensed access exists. |
| GloFAS and GWIS | Hazard monitoring systems rather than compact country-year DRR datasets. | Use for flood/wildfire operational dashboards or event monitoring. |
| IATI Datastore | The supported Datastore v3 endpoint requires an API subscription key; the legacy/cloud endpoints are public but need de-duplication across publishers, implementers, transactions, sectors, policy markers, and activity hierarchies. | Use as a second-stage activity-level finance layer after an API key and a de-duplication method are agreed. |
| Domestic public budgets | No single global budget-tagged DRR dataset exists. Some countries publish budget portals, climate budget tagging, disaster funds, or Sendai-aligned budget documents. | Add as country-by-country evidence modules where budget classifications and documents are public. |
| Private DRR finance | Not comprehensively reported across countries. GCF private-sector projects and project co-finance are included as signals, but not as total private investment. | Use project documents, insurer/reinsurer disclosures, and climate fund co-finance where public. |

## Financing Scope Caveat

The finance layer should be read as **DRR-related international support**, not total country DRR financing. OECD CRS captures reported ODA and OOF flows. The dashboard currently uses CRS purpose codes `74010` disaster prevention and preparedness, `41050` flood prevention/control, and `41010` environmental policy and administrative management. The final code is broader than DRR, so the dashboard labels it DRR-related rather than pure DRR.

World Bank project commitments are full project commitments for projects returned by the World Bank Projects API disaster-risk-management search and then filtered for natural disaster management themes or clear disaster/resilience terms in project metadata. They are useful for project discovery, but they do not represent the exact DRR component value inside each project.

GCF project figures are country-linked full project amounts selected through DRR/resilience keywords in project names and tags. They include GCF funding and co-finance, including projects marked public or private sector. Multi-country projects are linked to each listed country and should not be summed as a precise country allocation.

OCHA FTS figures are humanitarian response funding. They are useful for understanding response pressure after crises, but they are not counted as DRR prevention, preparedness, or domestic budget spending.

## Premium Data Boundary

The dashboard now has a paid-plan surface for deeper finance intelligence, but the public GitHub Pages bundle remains open data only. Premium records such as IATI de-duplicated activities, domestic budget evidence, private finance signals, and export APIs should be served from an authenticated backend after billing and entitlement checks.

Do not publish premium datasets as static JSON, CSV, or hidden JavaScript in this repository. If a dataset is licensed, manually collected, or intended for paid users only, store it outside the public Pages build and expose only server-filtered results to entitled users.

## Download Command

Run this from the project folder:

```powershell
node .\scripts\download-data.mjs
```

The script writes raw files to `data/raw/` and dashboard-ready files to `data/processed/`.

## Source Catalog

`data_catalog.json` tracks automated, semi-automated, and gated/manual sources. Use it as the project backlog for future ingestion work.
