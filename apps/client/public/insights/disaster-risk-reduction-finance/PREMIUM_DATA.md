# Premium Data Implementation

The public GitHub Pages dashboard can advertise plans and show locked premium modules, but it must not contain restricted datasets. Any paid-only data has to live behind an authenticated API so users cannot bypass the paywall by downloading static JSON files from the site.

## Implemented In The Static Site

- `data/product-plans.json` defines the Free, Pro, and Institution plans.
- `index.html` includes a Premium Data section and a masthead link to the plans.
- `app.js` renders pricing, locked modules, checkout status, and entitlement-aware labels.
- `styles.css` adds the editorial pricing and premium module layout.
- `premium-api/stripe-checkout-worker.mjs` provides a minimal server-side Stripe Checkout template.

The current public build is billing-ready but not yet payment-active because no Stripe Checkout links, Stripe price IDs, authenticated API, or user accounts have been configured.
Until those pieces are deployed, paid plan buttons are shown as request-access actions rather than live checkout actions.

## Required Backend Contract

The static site expects one of these payment setups:

1. Add hosted Stripe Checkout URLs to `data/product-plans.json` under each paid plan's `checkoutUrl`.
2. Or set `billing.checkoutEndpoint` to a server endpoint that creates a Stripe Checkout Session and returns:

```json
{ "url": "https://checkout.stripe.com/..." }
```

For premium access, set either `billing.entitlementEndpoint` or `billing.premiumApiBase`. The entitlement endpoint should return:

```json
{
  "plan": "pro",
  "planName": "Pro",
  "premiumAccess": true
}
```

Premium country data should be served by the backend only after entitlement verification. Do not commit premium records to `data/processed/`.

Optional access-request capture can be wired by setting:

```json
{
  "billing": {
    "requestAccessEndpoint": "https://YOUR-WORKER.example.workers.dev/request-access"
  }
}
```

The API template also exposes `GET /premium/country/:iso3`, which currently returns an authenticated placeholder. Connect this endpoint to a restricted data store before returning premium records.

## Suggested Premium Datasets

| Module | Data sources | Confidence model |
| --- | --- | --- |
| IATI activity ledger | IATI Datastore activity and transaction records | Medium until duplicates are resolved across publishers, implementers, and transactions. |
| Domestic budget evidence | National budget portals, disaster funds, climate budget tagging, finance ministry documents | Case-by-case, with source links and confidence labels. |
| Private and co-finance signals | GCF private-sector projects, project documents, insurer/reinsurer disclosures, company reports | Evidence-linked signals, not total private DRR finance. |
| Exports and API | Derived country profiles and source audit trails | Same confidence as underlying sources. |

## Stripe Notes

Stripe Checkout Sessions are created server-side and redirect users to a hosted checkout URL. The server should use `mode=subscription` for recurring Pro and Institution plans, pass the Stripe Price ID as `line_items[0][price]`, and include success and cancel URLs back to the dashboard.

Official reference: <https://docs.stripe.com/api/checkout/sessions/create>

## Security Rule

Client-side UI state is not an entitlement. Treat the browser as untrusted. The backend must verify the user's identity, subscription state, and dataset license before returning premium data.
