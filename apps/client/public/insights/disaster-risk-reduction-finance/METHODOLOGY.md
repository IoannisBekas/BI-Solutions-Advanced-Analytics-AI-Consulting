# Methodology

This dashboard is an independent public beta for country-level Disaster Risk Reduction (DRR) exploration. It consolidates open public datasets into a single starting point for risk, hazard, readiness, loss, finance, donor, and project-signal analysis.

## Scope

The dashboard is designed to answer first-pass country questions:

- What is the current composite disaster and humanitarian crisis risk profile?
- Which hazards are flagged as high or medium?
- What loss, displacement, readiness, and climate-vulnerability indicators are available?
- How much international DRR-related ODA is reported for the country?
- Which donors and public project-finance signals are visible?

It is not a replacement for official databases, country budget systems, licensed disaster-loss datasets, or a full project appraisal.

## Normalization

Country records are joined using ISO3 country codes. Each source is downloaded or queried programmatically where public access allows it. Metrics preserve the latest available source year where the source reports a year.

## Finance Evidence Tiers

Finance is intentionally separated into confidence tiers:

| Tier | Included in public dashboard | Interpretation |
| --- | --- | --- |
| Reported international DRR-related ODA | OECD CRS purpose codes 74010, 41050, 41010 | High-confidence international public finance, not total national DRR spending. |
| Project finance signals | World Bank Projects & Operations, Green Climate Fund project records | Useful project discovery signal; not exact DRR component value. |
| Humanitarian response context | OCHA FTS country funding | Response pressure context, not prevention or preparedness spending. |
| Domestic, private, and mainstreamed DRR | Methodology backlog / premium evidence tier | Requires country-by-country evidence review and source confidence labels. |

## Refresh and Validation

The public-data workflow is configured to refresh weekly through GitHub Actions. After download, `scripts/validate-data.mjs` checks country counts, source counts, required fields, ISO uniqueness, source freshness, and coverage levels before refreshed data is committed.

## Known Limitations

- Some sources are updated annually or irregularly, so the dashboard is a mixed-source snapshot.
- Multi-country projects are linked to listed countries and should not be summed as exact national allocations.
- Domestic budgets, private finance, and mainstreamed DRR components do not have a single comparable global public source.
- EM-DAT official event-level data may require registration or licensing; the public dashboard uses EM-DAT-derived public series from Our World in Data.
