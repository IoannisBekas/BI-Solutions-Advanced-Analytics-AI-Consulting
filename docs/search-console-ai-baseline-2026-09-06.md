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
- No additional indexing requests were submitted because every inspected priority URL was already indexed.
- The Generative AI report was not re-baselined after only two days; retain the monthly comparison cadence below.

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

## Monthly comparison rule

Compare the same trailing three-month window once per month. Track total impressions, top landing pages, country mix, and device mix. Do not interpret day-to-day movement as a trend.
