# How The DRR Dashboard Was Built

This document explains the implementation behind the Disaster Risk Reduction dashboard.

## Purpose

The dashboard was built to give individuals and organizations a single public starting point for country-level DRR research. It brings together open risk, hazard, readiness, disaster impact, finance, donor, and project-signal datasets that are otherwise spread across many public systems.

## Architecture

The public site is a static GitHub Pages application.

| Layer | Files | Purpose |
| --- | --- | --- |
| Front end | `index.html`, `styles.css`, `app.js` | Renders the public dashboard, charts, filters, country profiles, gated export prompts, premium access surfaces, and dataset Q&A. |
| Data pipeline | `scripts/download-data.mjs` | Downloads, normalizes, and joins public datasets into country-level records. |
| Validation | `scripts/validate-data.mjs` | Checks schema, country counts, source counts, missing values, and warning conditions before data is published. |
| Static audits | `scripts/audit-static.mjs`, `scripts/mobile-audit.mjs` | Checks accessibility basics, contrast, links, mobile overflow, and chart rendering. |
| Public data | `data/processed/dashboard-data.json` | Compact data used by the public dashboard. CSV exports are generated only for entitled Pro or Institution users. |
| Source inventory | `data_catalog.json`, `DATA_SOURCES.md` | Documents automated, reference, and case-study source layers. |
| Premium template | `premium-api/` | Server-side Stripe and entitlement API template for protected paid data access. |

## Data Workflow

1. Public sources are downloaded or queried by `scripts/download-data.mjs`.
2. Country names are normalized and joined primarily by ISO3 country code.
3. Source-specific values are transformed into a compact country metrics model.
4. Processed public JSON files are written to `data/processed/`; CSV exports remain behind the premium access surface.
5. `scripts/validate-data.mjs` checks the result before publication.
6. GitHub Actions runs the refresh workflow weekly and commits refreshed public data only when validation passes.

## Current Public Dataset Scope

The dashboard currently uses public or openly downloadable signals from:

- INFORM Risk Index
- OECD CRS
- WorldRiskIndex
- ThinkHazard
- Our World in Data / UNDRR indicators
- World Bank Projects and Operations
- Green Climate Fund Open Data Library
- OCHA Financial Tracking Service
- ND-GAIN
- WRI Aqueduct
- World Bank / IDMC displacement indicators
- EM-DAT-derived Our World in Data disaster series

Some important DRR datasets are documented as reference or case-study layers because they require registration, licensing, manual interpretation, or country-by-country extraction.

## Dashboard Features

- Global risk map and risk rankings.
- Country profile with risk, hazard, readiness, loss, finance, donor, and project-signal fields.
- Country-to-country comparison.
- DRR-related ODA donor view.
- Finance gap screening.
- Public CSV exports.
- Dataset Q&A bar using only the public dashboard dataset.
- Methodology, source scope, data dictionary, accessibility, terms, build, and roadmap documentation.
- Premium plan surfaces with protected-access request flows.

## Design System

The interface uses an Economist-inspired editorial approach:

- Strong serif headlines.
- Dense but readable analytical panels.
- Black rules and restrained borders.
- A limited palette using black, dark green, dark red, soft green, and warm tan.
- Direct chart labels where useful.
- Explanatory notes under charts.
- Accessible tables behind visualizations.

## Accessibility Work

Implemented accessibility features include:

- Skip links.
- Semantic landmarks.
- Visible form labels.
- Chart summaries with `aria-describedby`.
- Accessible data tables for chart data.
- Keyboard focus states.
- Reduced-motion CSS.
- Keyboard-reachable horizontally scrollable documentation tables.
- Color contrast checks.
- Mobile overflow checks.
- Axe-core checks across dashboard and documentation pages.

The latest automated checks pass. Manual keyboard-only and screen-reader smoke tests are part of the release QA workflow for major updates.

## Deployment

The live public version is deployed through GitHub Pages:

<https://ioannisbekas.github.io/Disaster-Risk-Reduction/>

The planned organizational placement is:

<https://www.bisolutions.group/insights/disaster-risk-reduction-finance/>

That placement can be coordinated through the `bisolutions.group` site repository.
