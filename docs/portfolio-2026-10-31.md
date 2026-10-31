# Website and application portfolio — 31 October 2026

The project directory at `/projects` includes all 24 submitted public URLs and retains the existing PAROLI project. All 25 entries appear in the initial HTML. The homepage keeps its existing selected-project carousel, with a prominent link to the complete directory. Desktop and mobile navigation, the footer and the web development service chapter also link to the directory.

## Structure

- One directory, five industry collection pages and 25 project detail pages.
- Genuine English, Greek and German content for all 31 new routes: 93 indexable URLs, bringing the sitemap to 191 URLs without dropping existing pages.
- Localised canonical and reciprocal hreflang links, descriptions, stable Open Graph images, CollectionPage/ItemList, CreativeWork and BreadcrumbList schema.
- Related projects and service links connect each detail page to the existing service architecture. Enquiry links use the existing `need=web-app` vocabulary.
- Homepage and services sitemap modification dates reflect this release. `llms.txt` exposes the directory and industry collections.

## Content and assets

`shared/portfolio-projects.json` is the project content source. `apps/client/src/data/portfolio.ts` defines the category copy and shared presentation labels.

All 25 public destinations returned HTTP 200 during capture. Covers show actual interfaces rather than generated mockups. Each project has a 1440 × 810 cover, 800 × 450 responsive version and 1200 × 630 social card. The 75 WebP assets total 3.53 MiB. Provenance and file metadata are published in `apps/client/public/assets/projects/manifest.json`; raw screenshots remain in ignored `output/portfolio/`.

The submitted Real Estate Dubai URL now presents the fictional Nivora Estates demo, so its current identity and sample inventory are described accurately. The Barber URL now has a monochrome typographic design. EveryWatch and Subscription BizOps explicitly identify synthetic data in their descriptions. Research dashboards are not described as guaranteed live market feeds.

## Validation

- TypeScript and a full production build, including nested application lint/build tasks, passed.
- `npm run check:seo` passed for all 191 sitemap routes, including 121 Greek/German page translation checks and portfolio coverage tests.
- `script/portfolio-browser-qa.mjs` passed 117 checks: all 75 translated detail pages, all industry collections, 320/390/768/1024/1440-pixel directory layouts, image loading, language-preserving navigation, mobile menu, enquiry routing, homepage controls, no-JavaScript discovery and invalid project/category routes. No page or console errors remained.
- Root request validation and acquisition tests passed. Quantus and Power BI Solutions tests passed, along with clean dependency audits for the root and both nested applications.
- Source encoding and client-exposed environment-name scans passed.

Browser QA requires a server that resolves `/route` to `/route/index.html`. A generic SPA preview returning homepage HTML for every route creates false hydration failures and does not test the deployed output.

## Deployment prerequisites repaired

The preceding production deployment was already failing its dependency audit. Separate dependency changes pin `minimatch` 11.0.3 and `glob` 14.0.3 in the nested applications, above the patched versions listed in [the minimatch advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249) and [the glob advisory](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4). No audit checks were disabled. Existing application tests, lint, PWA build and audits passed with these versions.

Invalid URL checks also exposed the existing GitHub Pages fallback hydrating homepage HTML after restoring a different URL. The client now renders a restored route afresh while retaining hydration for actual prerendered pages. Both unknown project and unknown category URLs pass the noindex/error checks.

The work was prepared in `.worktrees/portfolio-complete` from the current production branch, preserving the original checkout's pre-existing changes.
