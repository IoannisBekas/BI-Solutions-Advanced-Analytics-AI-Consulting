# BI Solutions Group entity consistency register

Reviewed: 2026-09-08

Use this register before editing Google Business Profile, LinkedIn, Clutch, TechBehemoths, or another public profile. “Observed” means the value is currently public; it does not prove that the business fact is legally or operationally correct.

## Stable public identity

| Field | Canonical working value | Evidence / note | Status |
| --- | --- | --- | --- |
| Brand name | BI Solutions Group | Website title, organization structured data, and current LinkedIn display name agree | Consistent |
| Descriptor / tagline | Advanced Analytics & AI Consulting | Website brand lockup and LinkedIn display descriptor agree | Consistent; keep outside the legal/name field where a platform requires the real-world business name |
| Canonical website | https://www.bisolutions.group/ | Website canonical host; non-`www` redirects | Consistent |
| Contact email | contact@bisolutions.group | Published in the website footer | Consistent |
| Founder | Ioannis Bekas | Website person structured data, About page, LinkedIn, and GitHub | Consistent |
| LinkedIn | https://www.linkedin.com/company/bi-solutions-by-bekas-ioannis/ | URL slug is legacy, but the current indexed display name is “BI Solutions Group — Advanced Analytics & AI Consulting” | Display name consistent; no rename task remains |
| GitHub | https://github.com/IoannisBekas | Website organization and person references agree | Consistent |
| Instagram | https://www.instagram.com/bisolutions.group/ | Website organization references agree | Consistent |
| Country | Greece | Website structured data publishes country `GR`; privacy and legal pages say Greece | Consistent at country level |

## Business facts awaiting owner confirmation

| Field | Currently observed | Why confirmation is required | Confirmed value |
| --- | --- | --- | --- |
| Public business name | GBP currently shows “BI Solutions Group — Advanced Analytics & AI Consulting”; website organization name is “BI Solutions Group” | Google expects the name used in the real world, not descriptive additions |  |
| Street address | GBP: Andrea Miaouli 9, Artemida, Attiki 19016; website schema publishes country only | Confirm whether customers are served at the address; otherwise use a hidden service-area profile |  |
| Service areas | GBP: Canada, Greece, Germany, Switzerland, United States; website says worldwide/international delivery | Confirm actual current markets rather than aspirational coverage |  |
| Hours | GBP and website schema: Monday–Friday, 09:00–17:00 | Confirm these are customer-facing hours |  |
| Opening date | GBP: 2019-09-03 | Confirm this is the start date of the current business entity or brand |  |
| Founded year | Directory draft: 2019 | Must match the confirmed opening/legal start basis |  |
| Team size | Not published | Required by Clutch and some directories; do not infer contractors or partners as employees |  |
| Minimum project size | Not published | Commercial fact required by Clutch |  |
| Hourly range | Not published | Commercial fact required by Clutch |  |
| Profile owner | Not recorded | Name the person accountable for keeping all listings current |  |
| Approved profile photos | None recorded | Use only authentic premises/work/team/project images with necessary permissions |  |
| GBP social profiles | Personal LinkedIn only | Confirm whether to retain the personal profile; add the canonical company LinkedIn and Instagram accounts |  |

## Current profile state

- Google Business Profile remains unverified after a failed video attempt; Business Video is the only offered method.
- The 2026-09-08 signed-in audit confirmed that expanding verification options provides only “Verify later,” not another verification method.
- The GBP service editor currently has no services configured and offers custom services only.
- The GBP description covers analytics, AI, machine learning, statistics, data engineering, dashboards, automation, trends, and pipelines, but it does not yet mention website/web-app development or SEO/AEO/GEO.
- The GBP social section currently links only to Ioannis's personal LinkedIn; the canonical company LinkedIn and Instagram profiles are not present.
- Google Search displayed a 5.0 rating and 339 reviews during the signed-in audit. This is an observed platform count, not independent verification of each review.
- Do not expand the website's country-only address schema or publicly expose the street address until the customer-facing-versus-service-area decision is confirmed.
- The website's “Worldwide” service description can coexist with narrower GBP service areas only if international delivery is real and the GBP list reflects markets actually served.
- The LinkedIn display name is already aligned; the legacy URL slug does not create a second public entity.

## Client-name consistency for the priority case study

| Source | Observed name |
| --- | --- |
| BI Solutions Group and Ioannis LinkedIn posts | Risenfire |
| Client website | Risen Fire Protection Inc. |

Ask Dave Parfitt which display name is approved before publishing the case study or requesting a third-party acknowledgement. Working pack: `docs/case-study-candidate-risen-fire.md`.

## Safe update order

1. Complete Business Video verification using the real operating location and management evidence.
2. Confirm every blank value in this register.
3. Update Google Business Profile with the confirmed name, address visibility, areas, hours, services, and authentic photos.
4. Reuse exactly the same confirmed facts for Clutch and TechBehemoths.
5. Recheck the website organization structured data only if the confirmed facts require a change.
6. Record profile URLs and review dates in the authority tracker.
