# Restaurant acquisition pages

The Greek restaurant campaign uses two entry pages and one shared enquiry flow:

- `/el/online-paraggelies`: direct online-ordering service for businesses already looking for a solution.
- `/el/meiosi-kostous-delivery`: readiness and cost assessment for businesses considering reducing their dependence on delivery platforms.

The pages qualify an enquiry; they do not themselves provide a production ordering system or demonstrate proven customer savings. PAROLI is an independent demonstration project.

## Brand and campaign experience

Both pages use the main site's logo, wordmark, heading font, dark navy hero, pill buttons and shared corporate footer. A breadcrumb and home link identify them as BI Solutions Group pages; the primary action stays focused on the restaurant assessment.

On mobile, an assessment button appears after the hero's primary action has scrolled away and hides when the assessment enters the viewport. Its clicks, and header/hero CTA clicks, emit `restaurant_cta_click` with only the landing-page type and placement, subject to analytics consent. These clicks are never lead conversions.

The production build reads Vite's manifest to include the restaurant route's CSS in the initial HTML. These pages omit the unrelated homepage poster preload, use responsive WebP photos, and request optional font display to avoid a late font swap on slow connections. The homepage keeps its existing preload and font behavior.

The Express server negotiates Brotli/gzip for these campaign documents and shared `/assets/*.css` and `/assets/*.js` files. API and streaming responses are outside this compression scope. The public assets retain their existing cache policy.

### Advertising readiness

The technical funnel supports campaign parameters, qualified enquiries and consent-gated conversion events after acknowledged delivery. This establishes implementation readiness, not measured campaign performance. The real recipient inbox and the conversion action in Google Ads still need an end-to-end delivery/Tag Assistant check before paid traffic. Campaign keywords, exclusions, geographical targeting, budget and ad/landing-page message matching must be reviewed in the advertising account; those settings are not established by this repository.

Google Ads conversion measurement is implemented in the site's existing consent system. No Meta Pixel integration is present: Instagram/Facebook traffic can carry UTMs into enquiries, but website Lead-event optimization in Meta is not configured by these pages.

The form deliberately asks for business qualification. Its completion rate and the quality of the resulting enquiries should determine whether to shorten it; no A/B winner or guaranteed conversion rate has been established.

## Delivery

The shared form uses `VITE_CONTACT_ENDPOINT` when explicitly configured, otherwise the existing same-origin `POST /api/contact`. The Express route accepts `name`, `email`, `subject`, and `message`. Restaurant details and campaign context fit within `message`; no additional email provider or CRM is required.

Server requirements:

- `RESEND_API_KEY`
- `CONTACT_RECIPIENT_EMAIL`
- A valid sender in `CONTACT_FROM_EMAIL`, with the domain/provider settings required by Resend.

Keep these values in deployment configuration. A static GitHub Pages deployment alone cannot run the Express endpoint. The canonical `www.bisolutions.group` site currently runs on Railway, so the same-origin endpoint is available there.

### Live observations, 30 October 2026 (Europe/Athens)

- `GET https://www.bisolutions.group/api/health` returned HTTP 200 with JSON health data and `Server: railway-hikari`.
- A deliberately invalid, empty JSON object posted to `/api/contact` with same-origin headers returned HTTP 400 and `Invalid contact submission.` The route checks the required Resend key and recipient before validating input, so this confirms those required settings are present. It does not verify sender acceptance or inbox delivery.
- No valid lead or email was submitted during this readiness probe.
- The production Railway service was healthy at commit `c5b9b906ebf54120ed98d67d1e37f21668a0ae21`, deployed from `main`. These are baseline observations, not a record that the new pages have been deployed.

For Railway CLI operations on this Windows host, use `C:\Users\bekas\AppData\Roaming\npm\railway.cmd`. The earlier PATH entry at `C:\Windows\System32\railway` is a zero-byte file and is not the working CLI.

## Campaign attribution and measurement

Use bounded `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, and `utm_term` values to distinguish campaigns. The enquiry includes its landing page and campaign context. Do not put names, email addresses, phone numbers, or other personal information in campaign parameters.

Example campaign destination after publication:

```text
https://www.bisolutions.group/el/online-paraggelies?utm_source=google&utm_medium=cpc&utm_campaign=restaurant_ordering&utm_content=direct_orders
```

The existing measurement implementation separates analytics permission from advertising-measurement permission. Form delivery must work independently of either permission. A lead conversion belongs after a confirmed successful submission, never on an ordinary CTA click, failed request, or page reload.

## Release verification

1. Open both canonical URLs directly and refresh them. Check their Greek title, description, canonical URL, prerendered content, and sitemap inclusion.
2. Inspect 320px/390px mobile widths and desktop: headings, screenshot labels, input controls, focus states, and primary actions must remain readable without horizontal overflow.
3. Test invalid input, server rejection, unavailable network, and success. Failed submissions must retain input; repeated clicks must not create duplicate requests or conversions.
4. Before purchasing traffic, send one clearly labelled delivery test through the published form and confirm arrival in the configured recipient inbox. Provider acceptance alone does not establish inbox arrival.

Judge the campaign using qualified enquiries, completed demos, offers, and paying customers. Page visits and form starts are supporting measurements.
