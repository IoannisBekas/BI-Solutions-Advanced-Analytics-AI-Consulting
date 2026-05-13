# Methodology

The Open Risk & Resilience Atlas is an independent country-level public-source atlas. It consolidates open public datasets into a single starting point for risk, hazard, readiness, loss, finance context, donor, and project-signal analysis.

## Scope

The atlas is designed to answer first-pass country questions:

- What is the current composite disaster and humanitarian crisis risk profile?
- Which hazards are flagged as high or medium?
- What loss, displacement, readiness, and climate-vulnerability indicators are available?
- What reported international support is visible for the country?
- Which donors and public project-finance signals are visible?
- Which countries show high compound hazard pressure but thin reported international support per severity point?
- Which countries have modeled risk signals that are high while public impact indicators are sparse?
- Where is reported international support going by broad purpose category?
- How does reported international support compare per person or as a share of GDP?
- Are there current GDACS alerts that provide operational context for the selected country?

Source-linked metrics make it easier to move from a country screen to the original statistical, budget, project, and finance systems when detailed verification is needed.

## Normalization

Country records are joined using ISO3 country codes. Each source is downloaded or queried programmatically where public access allows it. Metrics preserve the latest available source year where the source reports a year.

Population, GDP, and GDP per capita come from World Bank World Development Indicators. They are used only as denominators for normalized comparisons such as DRR ODA per person, DRR ODA as a share of GDP, disaster displacement per 100,000 people, and direct loss per person. These normalized figures do not estimate total domestic DRR spending.

## Finance Evidence Tiers

Finance is intentionally separated into confidence tiers:

| Tier | Included in public atlas | Interpretation |
| --- | --- | --- |
| Reported international support | OECD CRS purpose codes 74010, 41050, 41010, grouped with sector-code and text-based purpose labels | High-confidence international public finance context layer for donor and recipient screening. |
| Project finance signals | World Bank Projects & Operations, Green Climate Fund project records | Project discovery signal for follow-up evidence review. |
| Humanitarian response context | OCHA FTS country funding | Humanitarian response pressure context shown as a separate finance layer. |
| Domestic, private, and mainstreamed resilience finance | Not part of the current public atlas | Future source-discovery topic. |

## Severity, Compound Pressure, And Reporting Gaps

The atlas adds two derived screening scores:

- `observedSeverityIndex`: a 0-100 score using public deaths, displacement, direct-loss, and loss/GDP indicators where available.
- `compoundHazardPressureIndex`: a 0-100 proxy using ThinkHazard high/medium hazard counts plus INFORM hazard, vulnerability, and coping-capacity dimensions.

The compound-pressure score is a proxy for compounding or cascading pressure. It does not prove that one hazard caused another. The reporting-gap signal is also a screening signal, not a factual conclusion that a country under-reported losses.

DRR-ODA purpose categories are derived from detailed CRS rows using sector codes and available project text. Recovery and reconstruction context is labelled separately and is not silently counted as core prevention/preparedness DRR unless the CRS row is already inside the detailed DRR-related pull.

GDACS current alerts are shown as a live operational context layer. They help identify active earthquakes, floods, tropical cyclones, droughts, volcanoes, wildfires, and related alerts in the current feed. They are not used as historical event counts or disaster-loss totals.

## Refresh and Validation

The public-data workflow is configured to refresh weekly through GitHub Actions. After download, `scripts/validate-data.mjs` checks country counts, source counts, required fields, ISO uniqueness, source freshness, and coverage levels before refreshed data is committed.

## Interpretation Notes

- Some sources are updated annually or irregularly, so the atlas is a mixed-source snapshot.
- Multi-country projects are linked to listed countries and interpreted as project discovery signals.
- Domestic budgets, private finance, and mainstreamed DRR components are tracked as future source-discovery topics.
- The current atlas uses public OWID / EM-DAT series for global disaster counts and damage.
- Sources such as ReliefWeb, IATI, IDMC GIDD event-level records, WorldPop, NASA FIRMS, OCHA HPC plan requirements, World Bank BOOST, and WMO public reporting are tracked in the source catalog for future source discovery.
