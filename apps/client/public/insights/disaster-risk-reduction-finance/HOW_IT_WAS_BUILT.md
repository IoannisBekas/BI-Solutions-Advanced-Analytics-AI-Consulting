# How The Open Risk & Resilience Atlas Was Built

This document explains the implementation behind the Open Risk & Resilience Atlas.

## Purpose

The atlas was built to give individuals and organizations a single public starting point for country-level risk and resilience research. It brings together open risk, hazard, readiness, disaster impact, finance context, donor, and project-signal datasets that are otherwise spread across many public systems.

## Architecture

The public site is a static GitHub Pages application.

| Layer | Files | Purpose |
| --- | --- | --- |
| Front end | `index.html`, `styles.css`, `app.js` | Renders the public atlas, charts, filters, country profiles, public CSV exports, and dataset Q&A. |
| Data pipeline | `scripts/download-data.mjs` | Downloads, normalizes, and joins public datasets into country-level records. |
| Validation | `scripts/validate-data.mjs` | Checks schema, country counts, source counts, missing values, and warning conditions before data is published. |
| Static audits | `scripts/audit-static.mjs`, `scripts/mobile-audit.mjs` | Checks accessibility basics, contrast, links, mobile overflow, and chart rendering. |
| Public data | `data/processed/dashboard-data.json` | Compact data used by the public atlas. CSV exports are generated in-browser from the public atlas dataset. |
| Source inventory | `data_catalog.json`, `DATA_SOURCES.md` | Documents automated, reference, and case-study source layers. |

## Data Workflow

1. Public sources are downloaded or queried by `scripts/download-data.mjs`.
2. Country names are normalized and joined primarily by ISO3 country code.
3. Source-specific values are transformed into a compact country metrics model.
4. Processed public JSON files are written to `data/processed/`; CSV exports are generated from the same public dataset.
5. `scripts/validate-data.mjs` checks the result before publication.
6. GitHub Actions runs the refresh workflow weekly and commits refreshed public data only when validation passes.

## Current Public Dataset Scope

The atlas currently uses public or openly downloadable signals from:

- INFORM Risk Index
- OECD CRS
- WorldRiskIndex
- ThinkHazard
- Our World in Data / UNDRR indicators
- World Bank Projects and Operations
- Green Climate Fund Open Data Library
- OCHA FTS
- GDACS current alerts
- World Bank World Development Indicators
- ND-GAIN
- WRI Aqueduct
- World Bank / IDMC displacement indicators
- EM-DAT-derived Our World in Data disaster series
- Public deaths, displacement, direct-loss, and loss/GDP indicators

Some important DRR datasets are documented as reference or case-study layers because they require registration, licensing, manual interpretation, or country-by-country extraction.

## Atlas Features

- Global risk map and risk rankings.
- Country profile with risk, hazard, readiness, loss, finance context, donor, and project-signal fields.
- Country-to-country comparison.
- DRR-related ODA donor view.
- Finance gap screening.
- Severity-finance alignment, reporting-gap screening, and DRR-ODA purpose allocation.
- Normalized support indicators per person and as a share of GDP.
- Current GDACS alert context for selected countries.
- CSV exports for public atlas tables and country records.
- Dataset Q&A bar using only the public atlas dataset.
- Methodology, source scope, data dictionary, accessibility, terms, build, and roadmap documentation.

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
- Axe-core checks across atlas and documentation pages.

The latest automated checks pass. Manual keyboard-only and screen-reader smoke tests are part of the release QA workflow for major updates.

## Deployment

The live public version is deployed through GitHub Pages:

<https://www.bisolutions.group/insights/disaster-risk-reduction-finance/>

The planned organizational placement is:

<https://www.bisolutions.group/insights/open-risk-resilience-atlas/>

That placement can be coordinated through the `bisolutions.group` site repository.
