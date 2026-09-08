# Google Search Console baseline — 2026-09-06

Property: `sc-domain:bisolutions.group`

## Search generative AI

- Inclusion setting: **Include**
- Reporting window: **2026-06-05 through 2026-09-04** (3 months)
- Total impressions: **384**
- Clicks: **Not exposed in the current Generative AI report**
- Field data: report updated approximately three hours before capture

### Top pages by impressions

| Page | Impressions |
| --- | ---: |
| `https://www.bisolutions.group/` | 332 |
| `https://bisolutions.group/` | 22 |
| `/blog/power-bi-consulting-dashboards-business-infrastructure` | 20 |
| `/quantus` | 5 |
| `/services` | 4 |
| `/power-bi-solutions` | 3 |
| `/blog/cloud-data-warehouse-vs-spreadsheets` | 2 |
| `/blog/kpi-dictionary-business-intelligence` | 2 |
| `/blog/dashboard-requirements-before-power-bi-build` | 1 |
| `/case-studies/ifc-talent-strategy` | 1 |

The report contained 13 page rows in total.

### Top countries by impressions

| Country | Impressions |
| --- | ---: |
| United States | 142 |
| Greece | 59 |
| South Africa | 50 |
| United Kingdom | 31 |
| India | 17 |
| Germany | 8 |
| Canada | 7 |
| Australia | 6 |
| Bosnia & Herzegovina | 6 |
| Netherlands | 5 |

The report contained 45 country rows in total.

### Devices

| Device | Impressions |
| --- | ---: |
| Desktop | 346 |
| Mobile | 38 |

## Sitemap and URL inspection

- `https://www.bisolutions.group/sitemap.xml`: **Success**, last read 2026-09-06, 31 discovered pages.
- Already indexed; no new request submitted: `/`, `/services`, `/blog`, `/blog/power-bi-consulting-dashboards-business-infrastructure`, `/blog/kpi-dictionary-business-intelligence`.
- Indexing requested on 2026-09-06: `/about`, `/blog/cloud-data-warehouse-vs-spreadsheets`, `/blog/dashboard-requirements-before-power-bi-build`.
- The two article URLs above were previously **Crawled — currently not indexed**. `/about` was previously **Unknown to Google**.
- After genuine Greek and German versions were deployed, indexing was requested and explicitly confirmed for `/el/about`, `/de/about`, `/el/start-a-project`, and `/de/start-a-project` on 2026-09-06. All four were **Unknown to Google** when inspected. A request only adds a URL to the priority crawl queue; it does not prove that Google has indexed it.

### Indexing follow-up — 2026-09-08

- Search Console overview: **48 total web-search clicks**, **19 indexed pages**, and **34 not-indexed pages** in the reporting period displayed by the interface.
- Now confirmed **URL is on Google** and **Page is indexed**: `/about`, `/blog/cloud-data-warehouse-vs-spreadsheets`, `/blog/dashboard-requirements-before-power-bi-build`, `/el/about`, `/de/about`, `/el/start-a-project`, and `/de/start-a-project`.
- All seven inspected URLs were also reported as served over HTTPS.
- No additional indexing requests were submitted during that first follow-up because every inspected priority URL was already indexed.
- The Generative AI report was not re-baselined after only two days; retain the monthly comparison cadence below.

### Exclusion audit and localized sitemap follow-up — 2026-09-08

- The 34 excluded URLs in the report last updated 2026-09-04 were reviewed individually: 9 intentional `noindex` drafts, 5 retired or missing routes grouped by Google as 404s (including deliberate 410 responses), 3 expected canonical-host redirects, 1 alternate-language canonical, and 16 crawled-but-not-indexed URLs.
- The 16 crawled-but-not-indexed examples contained 3 tracking-query duplicates, 3 intentional `noindex` drafts, 1 retired route, 2 stale rows for articles now confirmed indexed, and 7 genuinely actionable article URLs.
- Exact inspection confirmed `/el/case-studies/ifc-talent-strategy` is indexed; the older alternate-canonical row is stale.
- The sitemap was expanded from 31 URLs to **87 URLs**: 29 canonical routes in English, Greek, and German, each with reciprocal `en`, `el-GR`, `de-DE`, and `x-default` alternates.
- `https://www.bisolutions.group/sitemap.xml` was resubmitted after deployment. Search Console immediately reported **Success**, last read 2026-09-08, with **87 discovered pages**.
- Exact inspection confirmed these four English articles were still not on Google, and each was successfully added to the priority crawl queue: `/blog/data-governance-gdpr-scale-analytics-control`, `/blog/prompt-workflow-design-business-teams`, `/blog/mlops-small-mid-sized-teams-productionize-ai`, and `/blog/ai-assistant-governance-company-policy`.
- Exact inspection confirmed the three priority German articles were not on Google. After the corrected localized article deployment was live, all three were successfully added to the priority crawl queue: `/de/blog/semantic-modeling-power-bi-clean-models`, `/de/blog/dashboard-requirements-before-power-bi-build`, and `/de/blog/power-bi-consulting-dashboards-business-infrastructure`.
- The three strongest Greek counterparts were also confirmed not indexed and successfully added to the priority crawl queue: `/el/blog/semantic-modeling-power-bi-clean-models`, `/el/blog/dashboard-requirements-before-power-bi-build`, and `/el/blog/power-bi-consulting-dashboards-business-infrastructure`.
- Ten requests were submitted in total during this follow-up: 4 English, 3 German, and 3 Greek article URLs. No query-string duplicates, intentional `noindex` pages, retired routes, redirects, or already-indexed pages were submitted.

## PageSpeed Insights

Homepage mobile report captured 2026-09-06:

- No origin-level real-user field data was available.
- Performance: **77**
- Accessibility: **92**
- Best Practices: **100**
- SEO: **100**
- First Contentful Paint: **3.2 s**
- Largest Contentful Paint: **4.4 s**
- Total Blocking Time: **120 ms**
- Cumulative Layout Shift: **0**
- Speed Index: **3.8 s**

Primary lab opportunities: render-blocking requests (estimated 1,640 ms), image delivery (estimated 220 KiB), and unused JavaScript (estimated 80 KiB). Google returned a temporary overloaded-service error for the homepage desktop and services-page runs; retry those before treating this as a complete performance baseline.

### Post-deployment homepage recheck

After non-blocking font loading, deferred below-the-fold images, and removal of the zoom restriction were deployed, the mobile lab report improved to:

- Performance: **92** (up from 77)
- Accessibility: **97** (up from 92)
- SEO: **100**
- First Contentful Paint: **2.3 s** (down from 3.2 s)
- Largest Contentful Paint: **3.0 s** (down from 4.4 s)
- Total Blocking Time: **10 ms** (down from 120 ms)
- Cumulative Layout Shift: **0**
- Speed Index: **2.3 s** (down from 3.8 s)

The site still had no origin-level real-user field data. A responsive preload for the hero image was added after this recheck to reduce discovery delay for the remaining LCP image.

### Services-page PageSpeed baseline — 2026-09-08

The first successful mobile lab run for `/services` reported:

- No page-level real-user field data was available.
- Performance: **80**
- Accessibility: **97**
- Best Practices: **92**
- SEO: **100**
- First Contentful Paint: **3.2 s**
- Largest Contentful Paint: **3.6 s**
- Total Blocking Time: **0 ms**
- Cumulative Layout Shift: **0**
- Speed Index: **5.5 s**

The LCP element was the hero heading, with **1,230 ms** of element render delay. Lighthouse also reported a CSP-blocked inline font-load handler. The hero reveal animation was removed and font activation was moved into the bundled application script.

The first post-deployment mobile run reported Performance **77**, Accessibility **97**, Best Practices **100**, SEO **100**, FCP **3.6 s**, LCP **4.4 s**, TBT **0 ms**, CLS **0**, and Speed Index **3.6 s**. The throttled headline result varied, but the targeted LCP render-delay diagnostic improved to **820 ms** and the CSP console error disappeared. The remaining render-blocking item was the first-party stylesheet, with an estimated **380 ms** saving; unused JavaScript was estimated at **88 KiB**. Treat these as lab diagnostics, not a real-user Core Web Vitals failure, until Search Console or CrUX has enough field data.

### Final render-payload remediation — 2026-09-08

A fresh pre-remediation mobile run exposed additional first-load costs that the earlier variable Lighthouse runs did not make as clear:

- Homepage: Performance **71**, Accessibility **97**, Best Practices **100**, SEO **100**, FCP **3.8 s**, LCP **5.5 s**, TBT **60 ms**, CLS **0**, and Speed Index **3.8 s**.
- Services: Performance **75**, Accessibility **97**, Best Practices **100**, SEO **100**, FCP **3.8 s**, LCP **4.5 s**, TBT **0 ms**, CLS **0**, and Speed Index **3.8 s**.

The homepage report attributed about **514 KiB** of avoidable transfer to oversized portfolio images. It also identified the cookie notice as the LCP element, including **1,440 ms** of element render delay because it appeared only after hydration. The English application was also eagerly loading the entire long-form translation catalogue and a monolithic vendor bundle.

The deployed remediation added responsive portfolio and hero images, prerendered the cookie notice while preserving stored consent behavior, loaded the large translation catalogue only on Greek and German routes, removed unused global UI providers, and replaced small animation/select dependencies with lightweight native or CSS behavior. The always-loaded application shell fell from roughly **494 KiB gzip** of main-plus-vendor JavaScript to about **75 KiB gzip**, with the homepage and shared navigation chunks loaded separately.

Post-deployment mobile lab reports captured at 18:16–18:19 Europe/Athens reported:

- Homepage: Performance **89**, Accessibility **97**, Best Practices **100**, SEO **100**, FCP **2.9 s**, LCP **2.9 s**, TBT **0 ms**, CLS **0**, and Speed Index **2.9 s**.
- Services: Performance **90**, Accessibility **96**, Best Practices **100**, SEO **100**, FCP **2.9 s**, LCP **2.9 s**, TBT **0 ms**, CLS **0**, and Speed Index **2.9 s**.

These are throttled Lighthouse lab measurements and can vary between runs. Google still reported no page-level or origin-level CrUX data, so this is evidence of a materially improved lab profile, not a field Core Web Vitals pass.

## Monthly comparison rule

Compare the same trailing three-month window once per month. Track total impressions, top landing pages, country mix, and device mix. Do not interpret day-to-day movement as a trend.
