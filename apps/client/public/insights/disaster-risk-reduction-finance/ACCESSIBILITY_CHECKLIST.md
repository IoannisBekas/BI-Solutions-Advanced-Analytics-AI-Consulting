# Accessibility Checklist

Target: WCAG 2.2 AA-oriented public beta hardening.

## Implemented

- Skip link to main content.
- Semantic header, main, nav, sections, buttons, links, labels, and status regions.
- Visible form labels for country, continent, and comparison controls.
- `aria-describedby` links from chart containers to explanatory notes and screen-reader summaries.
- Keyboard-accessible risk-map country selection with Enter and Space.
- Accessible data table containers behind every chart.
- CSV download actions for full country metrics, selected country profile, donors, project signals, and chart tables.
- Focus-visible styles for links, buttons, inputs, selects, details summaries, and skip link.
- Reduced-motion CSS preference.
- Static contrast audit script: `npm run audit:static`.
- Local Chrome/Edge mobile viewport audit helper: `npm run audit:mobile`.

## Manual QA Before Major Launches

- Keyboard-only navigation through all controls, details panels, map countries, and premium buttons.
- Screen-reader smoke test in at least one browser/screen-reader pair.
- Mobile viewport checks at 390px, 430px, and 768px.
- Confirm data table content matches the visible charts after each data refresh.
- Confirm color contrast after any palette change.

## Known Follow-Up

The dashboard is designed to be accessible in a static-public beta context. A full third-party WCAG audit is still recommended before institutional procurement, paid subscriptions, or formal claims of WCAG conformance.
