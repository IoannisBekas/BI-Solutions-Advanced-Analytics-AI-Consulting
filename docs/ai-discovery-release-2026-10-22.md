# AI discovery release — 22 October 2026

This release adds English Power BI consulting and AI workflow automation pages,
links them from relevant navigation and articles, and states the owner-confirmed
Greece operating base. It retains the existing US landing pages and localized
content. Portfolio demonstrations remain explicitly synthetic and independent.

`shared/search-routes.json` now owns sitemap generation. Run
`npm run generate:sitemap` after an intentional inventory change. The committed
live baseline protects all 94 existing canonical URLs; the release contains 96
with the two new English pages. Coverage checks reject missing routes, duplicates,
unintended alternates, and mismatched sitemap metadata.

The production apex redirect retains encoded paths and the complete query using
HTTP 308. It can run only when DNS sends apex requests to Railway. Existing
Squarespace forwarding sends HTTP 302 to the homepage and loses path and query.

## Verified release checks

- TypeScript, full multi-app production build, nested lint, encoding and exposed
  environment-name checks passed.
- Search regression tests: 9 sitemap tests and 3 real HTTP redirect tests passed.
- SEO checks passed for 96 canonical routes, 632 localized blog fields/blocks,
  and 59 Greek/German pages. All 96 preview URLs returned 200 with matching
  canonical, indexing and language metadata.
- AI learning and lead acquisition tests passed. Existing product tests and
  dependency policy were retained. Power BI's existing build-only braces
  exception expires on 31 December 2026; no exceptions were added.
- Root, Quantus, Bonusaki and Python dependency audits passed. The targeted Power
  BI selector-parser override produced byte-identical CSS to the previous build.
- Browser checks covered service links, language targets after internal
  navigation, and allowed campaign fields reaching the enquiry flow.

## Live hosting and DNS handoff

Railway project `55f2e9a0-6c3a-426d-aa2d-9d0bd7e3a516`, production environment
`c2959c32-77f0-4a48-b15e-786500cd33c4`, service
`21d3733e-3930-439e-801d-5a4889692229` serves the website on port 8080. It
automatically deploys the repository's `main` branch. Railway's separate
"Wait for CI" setting was already disabled and was left unchanged.

Both `www.bisolutions.group` and `bisolutions.group` are already registered in
that service. The apex domain is waiting for DNS. Its exact displayed routing
target is `dsbv1o1g.up.railway.app`; its ownership record is the TXT named
`_railway-verify`. Read the complete current verification value in Railway's
**Show DNS records** dialog when applying it.

Squarespace manages the domain. Before changing apex routing, preserve its
existing forwarding rule, four apex A records, `www` CNAME, email records and
verification TXT records. Inspect actual ALIAS support and DNSSEC state before
removing the forwarding rule. Squarespace requires account reauthentication to
edit DNS. Do not change nameservers or weaken DNSSEC without a reviewed plan.

After DNS changes, verify HTTP and HTTPS apex requests with paths and repeated
query fields reach matching HTTPS `www` URLs permanently, with no loop, and
confirm both certificates and the existing mail records remain correct.
