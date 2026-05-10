# Pending Work

This document lists the main work remaining before the dashboard can be treated as an institutional-grade DRR intelligence product.

## Current Status

The public dashboard is live and functional as an exploratory research product.

Implemented:

- Public GitHub Pages deployment.
- Weekly public-data refresh workflow.
- Public country metrics covering risk, hazard, readiness, loss, finance, donors, and project signals.
- CSV exports.
- Country comparison.
- Dataset Q&A bar.
- Styled methodology, source, dictionary, accessibility, terms, build, and roadmap documentation.
- Premium plan UI in waitlist mode.
- Static, mobile, and axe-core accessibility checks.

Not yet implemented:

- Live payments.
- Authenticated premium access.
- Restricted premium datasets.
- Organization accounts.
- Production support process.
- Formal WCAG certification.

## Priority 1: Trust And Launch Readiness

- Complete a manual keyboard-only QA pass.
- Complete a screen-reader smoke test with NVDA, VoiceOver, or JAWS.
- Add visible failed-source warnings if any source fails during refresh.
- Add versioned release notes for data refreshes.
- Add a support and correction workflow.
- Confirm the preferred public contact email.

## Priority 2: Premium Backend

- Deploy the `premium-api` backend.
- Configure Stripe products and annual subscription prices.
- Add test-mode checkout first, then production checkout.
- Add authentication.
- Add entitlement checks.
- Keep premium data out of GitHub Pages and serve it only after entitlement verification.
- Add billing-success and billing-cancel flows.

## Priority 3: Expanded Finance Coverage

The public dashboard currently shows international DRR-related finance, not total DRR spending. To move closer to total finance intelligence, add evidence tiers for:

- IATI activities and transactions, with duplicate-detection rules.
- National budget lines.
- Disaster management funds.
- Climate budget tagging.
- Public investment programs.
- Private and blended finance signals.
- Co-finance from project documents.
- Insurer, reinsurer, and philanthropic disclosures where public.

These sources need confidence labels because they are not globally standardized in the same way as OECD CRS.

## Priority 4: Institutional User Workflows

- Save country profiles.
- Export country briefs as PDF.
- Add donor drilldowns.
- Add project lists with source links.
- Add organization accounts.
- Add API keys.
- Add export audit trails.
- Add team-level usage limits and permissions.

## Priority 5: Data Governance

- Add source licensing notes.
- Add data retention policy for future accounts.
- Add country correction workflow.
- Add source freshness thresholds.
- Add anomaly detection for large year-to-year value changes.
- Add a methodology version number to exports.
- Add reproducible release tags for public data snapshots.

## Priority 6: Production Placement

The current live URL is:

<https://ioannisbekas.github.io/Disaster-Risk-Reduction/>

The recommended thought-leadership placement is:

<https://www.bisolutions.group/insights/disaster-risk-reduction-finance/>

Pending steps:

- Decide whether the dashboard remains on GitHub Pages and is embedded or linked from `bisolutions.group`.
- Or move the static build into the `bisolutions.group` repository under the `/insights/disaster-risk-reduction-finance/` route.
- Confirm canonical URL and metadata.
- Add social preview tags for LinkedIn sharing.
- Add analytics only if the privacy policy is updated accordingly.

## Recommended Next Sequence

1. Complete manual accessibility checks.
2. Add social preview metadata for LinkedIn launch.
3. Deploy premium API in test mode.
4. Build one pilot premium country evidence pack.
5. Add visible source-failure and data-version notices.
6. Move or embed the page under `bisolutions.group`.
