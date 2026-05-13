# DRR Data Download Analysis

This project uses public sources that can be downloaded or queried programmatically. Additional DRR databases are documented as reference and future research layers for source discovery.

## Data Used In The Atlas

| Source | Download path | What it contributes | Why it was selected |
| --- | --- | --- | --- |
| INFORM Risk Index | Public API: `https://drmkc.jrc.ec.europa.eu/inform-index/API/InformAPI/...` | Current country risk scores and core components: hazard and exposure, vulnerability, and lack of coping capacity. | Best open global source for comparable current DRR risk scoring. |
| WorldRiskIndex | `https://weltrisikobericht.de/download/4566/` | Country-year disaster risk, exposure, vulnerability, susceptibility, lack of coping capacity, and lack of adaptive capacity. | Adds an independent composite risk model and a long-run trend file under CC BY 4.0. |
| OECD CRS | SDMX API query for CRS purpose codes `74010`, `41050`, and `41010` | DRR-related ODA commitments and disbursements by donor, recipient, sector, and latest available CRS year. | Adds a public donor-country finance context layer. |
| World Bank Projects & Operations | `https://search.worldbank.org/api/v2/projects` using a disaster-risk-management project search plus a metadata filter for disaster/resilience terms | World Bank project counts, active project counts, project examples, and full project commitments. | Adds concrete project examples and a multilateral financing layer. |
| Green Climate Fund Open Data Library | `https://data.greenclimate.fund/public/data/projects` | DRR/climate-resilience project signals, GCF funding, co-finance, public/private sector labels, entities, beneficiaries, and project examples. | Adds climate fund and private-sector project signal coverage with source-linked project context. |
| OCHA FTS | `https://api.hpc.tools/v1/public/fts/flow?year={year}&groupby=Country` | Current-year humanitarian response funding by destination country. | Adds response-finance context beside prevention/preparedness support signals. |
| GDACS | `https://www.gdacs.org/xml/rss.xml` | Current disaster alerts by ISO3, alert level, event type, severity, and affected-population metadata. | Adds operational alert context without treating current alerts as historical loss records. |
| World Bank World Development Indicators | World Bank API indicators `SP.POP.TOTL`, `NY.GDP.MKTP.CD`, and `NY.GDP.PCAP.CD` | Population, GDP, and GDP per capita. | Adds denominators for DRR ODA per person, DRR ODA as GDP share, displacement per 100,000 people, and loss per person. |
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

## Reference And Case-Study Source Layers

| Source | Status | Best use |
| --- | --- | --- |
| EM-DAT public export | Free for non-commercial use after registration; official export is gated. | Use manually for event-level research and replace the OWID aggregate layer when credentials are available. |
| EM-DAT archive / Dataverse | Research archive under non-commercial/no-derivatives constraints. | Use for reproducible academic analysis after checking license terms. |
| DesInventar | Country databases are downloadable, with coverage and schemas that vary by country. | Use for subnational case studies and country evidence packs. |
| DELTA Resilience | Current UNDRR system and data model, accessed through system-specific workflows. | Use for institutional loss accounting workflows and national systems. |
| Munich Re NatCatSERVICE | Valuable insured/economic loss data, but mostly commercial with public summaries. | Use for market/insurance analysis where licensed access exists. |
| ReliefWeb reports and disasters | Current v2 API access returned access restrictions for this environment. | Use for humanitarian situation reports, assessments, appeals, and recent event context after application/API access is approved. |
| IDMC GIDD event-level displacement | Public web download interface is available, but a stable automated event endpoint was not confirmed. | Use for hazard-specific displacement by event when a stable export path is configured. |
| OCHA HPC plans and requirements | Public documentation exists, but plan/cluster normalization needs a separate mapping pass. | Add humanitarian plan requirements and cluster context beside OCHA FTS funding. |
| GloFAS, GDO, GDACS, and GWIS | Hazard monitoring systems rather than compact country-year DRR datasets. GDACS is automated as current alerts; the gridded/operational systems need geospatial processing. | Use for flood, drought, wildfire, and active event monitoring. |
| IATI Datastore | The supported Datastore v3 endpoint requires an API key; the legacy/cloud endpoints are public but need de-duplication across publishers, implementers, transactions, sectors, policy markers, and activity hierarchies. | Use as a second-stage activity-level finance layer after an API key and a de-duplication method are agreed. |
| WorldPop | Public API and raster products require geospatial aggregation. | Use for exposure-weighted hazard overlays and subnational profiles. |
| NASA FIRMS | API key required. | Use for active fire and wildfire monitoring once a key is configured. |
| WMO public weather and climate warning evidence | Public reports and sites are available, but country metrics require extraction from source tables or reports. | Use for warning-system capacity and preparedness evidence. |
| World Bank Climate Change Knowledge Portal | Public portal and API-style resources require climate-variable selection and country mapping. | Use for climate stressor projections such as heat, precipitation, drought, and extremes. |
| GEM / OpenQuake | Public models and downloads require model-specific processing. | Use for deeper earthquake hazard and exposure evidence where seismic detail matters. |
| World Bank BOOST | Country-by-country budget microdata availability varies. | Use for domestic public expenditure case studies where BOOST datasets and budget classifications are public. |
| Domestic public budgets | No single global budget-tagged DRR dataset exists. Some countries publish budget portals, climate budget tagging, disaster funds, or Sendai-aligned budget documents. | Add as country-by-country evidence modules where budget classifications and documents are public. |
| Private resilience finance | Comprehensive cross-country reporting is limited. GCF private-sector projects and project co-finance are included as signals with source links. | Use project documents, insurer/reinsurer disclosures, and climate fund co-finance where public. |

## Financing Scope

The finance context layer should be read as **reported international support and related public project signals**. OECD CRS captures reported ODA and OOF flows. The atlas currently uses CRS purpose codes `74010` disaster prevention and preparedness, `41050` flood prevention/control, and `41010` environmental policy and administrative management. The final code is broader than DRR, so the atlas labels it DRR-related rather than pure DRR.

Detailed CRS rows are grouped into purpose categories: preparedness and early warning, prevention and risk mitigation, governance and enabling systems, adaptation and resilience, recovery and reconstruction context, climate mitigation co-benefit, and other DRR-related support. Recovery context is labelled separately and is not silently counted as core prevention/preparedness DRR.

World Bank project commitments are full project commitments for projects returned by the World Bank Projects API disaster-risk-management search and then filtered for natural disaster management themes or clear disaster/resilience terms in project metadata. They are used as project discovery signals with links back to source records.

GCF project figures are country-linked full project amounts selected through resilience keywords in project names and tags. They include GCF funding and co-finance, including projects marked public or private sector. Multi-country projects are linked to each listed country as project evidence signals.

OCHA FTS figures are humanitarian response funding. They are useful for understanding response pressure after crises and are shown as a separate humanitarian context layer.

## Data Scope

The public GitHub Pages bundle uses the public datasets listed above. Processed files are generated from those public sources and source links are preserved where possible.

## Download Command

Run this from the project folder:

```powershell
node .\scripts\download-data.mjs
node .\scripts\validate-data.mjs
```

The script writes raw files to `data/raw/` and atlas-ready files to `data/processed/`.
The validation step writes `data/processed/validation-report.json` and fails on critical schema or coverage problems before the weekly refresh commits new data.

## Source Catalog

`data_catalog.json` tracks automated, semi-automated, and gated/manual sources. Use it as the source inventory for future ingestion work.
