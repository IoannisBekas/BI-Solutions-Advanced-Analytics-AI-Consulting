# Accessibility Checklist

Target: WCAG 2.2 AA-oriented release QA.

## Implemented

- Skip link to main content.
- Semantic header, main, nav, sections, buttons, links, labels, and status regions.
- Visible form labels for country, continent, and comparison controls.
- `aria-describedby` links from chart containers to explanatory notes and screen-reader summaries.
- Keyboard-accessible risk-map country selection with Enter and Space.
- Accessible data table containers behind every chart.
- Accessible data tables behind visual charts; CSV export controls have descriptive labels.
- Focus-visible styles for links, buttons, inputs, selects, details summaries, and skip link.
- Reduced-motion CSS preference.
- Static contrast audit script: `npm run audit:static`.
- Local Chrome/Edge mobile viewport audit helper: `npm run audit:mobile`.

## Manual QA Before Major Launches

- Keyboard-only navigation through all controls, details panels, map countries, and export buttons.
- Screen-reader smoke test in at least one browser/screen-reader pair.
- Mobile viewport checks at 390px, 430px, and 768px.
- Confirm data table content matches the visible charts after each data refresh.
- Confirm color contrast after any palette change.

## Release QA

Automated checks are complemented by manual keyboard and screen-reader checks for major updates. A third-party WCAG audit can be added when formal conformance certification is required.
