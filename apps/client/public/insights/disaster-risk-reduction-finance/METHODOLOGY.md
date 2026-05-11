# Methodology

This dashboard is an independent country-level Disaster Risk Reduction (DRR) briefing. It consolidates open public datasets into a single starting point for risk, hazard, readiness, loss, finance, donor, and project-signal analysis.

## Scope

The dashboard is designed to answer first-pass country questions:

- What is the current composite disaster and humanitarian crisis risk profile?
- Which hazards are flagged as high or medium?
- What loss, displacement, readiness, and climate-vulnerability indicators are available?
- How much international DRR-related ODA is reported for the country?
- Which donors and public project-finance signals are visible?

Source-linked metrics make it easier to move from a country screen to the original statistical, budget, project, and finance systems when detailed verification is needed.

## Normalization

Country records are joined using ISO3 country codes. Each source is downloaded or queried programmatically where public access allows it. Metrics preserve the latest available source year where the source reports a year.

## Finance Evidence Tiers

Finance is intentionally separated into confidence tiers:

| Tier | Included in public dashboard | Interpretation |
| --- | --- | --- |
| Reported international DRR-related ODA | OECD CRS purpose codes 74010, 41050, 41010 | High-confidence international public finance layer for donor and recipient screening. |
| Project finance signals | World Bank Projects & Operations, Green Climate Fund project records | Project discovery signal for follow-up evidence review. |
| Humanitarian response context | OCHA FTS country funding | Humanitarian response pressure context shown as a separate finance layer. |
| Domestic, private, and mainstreamed DRR | Protected evidence modules | Country evidence layer for deeper finance review with confidence labels. |

## Refresh and Validation

The public-data workflow is configured to refresh weekly through GitHub Actions. After download, `scripts/validate-data.mjs` checks country counts, source counts, required fields, ISO uniqueness, source freshness, and coverage levels before refreshed data is committed.

## Interpretation Notes

- Some sources are updated annually or irregularly, so the dashboard is a mixed-source snapshot.
- Multi-country projects are linked to listed countries and interpreted as project discovery signals.
- Domestic budgets, private finance, and mainstreamed DRR components are treated as separate evidence layers where source documents support them.
- EM-DAT official event-level data may require registration or licensing; the public dashboard uses EM-DAT-derived public series from Our World in Data.
