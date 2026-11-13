# Project deposits with Revolut

Issue one private payment link for each accepted quote. Use the exact deposit from the quote in EUR. The project enquiry form does not supply the amount.

## Configure

1. Open the [Revolut API Console](https://developer.revolut.com/docs/guides/merchant/get-started) and start in Sandbox. Production requires an approved Revolut Business Merchant account.
2. On the Express server, set `PROJECT_DEPOSIT_REVOLUT_ENV` (`sandbox` or `production`), `PROJECT_DEPOSIT_REVOLUT_API_KEY` (an Orders Read key), and `PROJECT_DEPOSIT_TOKEN_SECRET` (a dedicated random secret of at least 32 characters).
3. On the machine issuing the links, use the same environment and signing secret. Set `PROJECT_DEPOSIT_REVOLUT_ISSUER_KEY` to an Orders Write key and `PROJECT_DEPOSIT_ORIGIN` to the site's origin. The issuer can also use an Orders Write key in `PROJECT_DEPOSIT_REVOLUT_API_KEY` for local testing. Use different credentials and signing secrets for Sandbox and Production. Use API keys without optional request signing, since this integration authenticates with a bearer token.
4. Issue links for an account from one operator machine and retain its `data/project-deposit-issuance/` directory (or use a persistent `DATA_DIR`). This records attempts when the result of a create request is uncertain.

## Issue a link

Run from the repository root using Node.js 22 or later. The command reads `.env` and `.env.local` if present, as well as exported environment variables.

```powershell
npm.cmd run project-deposit:issue -- --reference BI-2026-042 --amount 250.00 --days 7 --locale el
```

Use a unique quote reference, such as `BI-2026-042`. `--days` defaults to `7` and accepts `1` through `30`. `--locale` defaults to `el` and also accepts `en` or `de`. Send the resulting private URL to the intended customer along with the quote. The page shows the agreed amount and opens the same Revolut order each time. Revolut shows the result after checkout, and reopening the private URL checks the order directly with Revolut. The Merchant dashboard remains available for reconciliation after the link expires.

If the issuance command fails after an attempted creation, rerun it with the same reference and amount. The command looks for the existing order before it tries to create anything. If it reports an existing attempt without finding the order, reconcile the reference in the Merchant dashboard. Clear that quote's attempt file only after confirming that Revolut did not create an order. To issue a revised quote, first cancel any unpaid order for the old quote in Revolut, then use a new quote reference. For the same reference, the original amount and expiry are preserved.

For a full test, point the development server and the issuance command at Sandbox, set `PROJECT_DEPOSIT_ORIGIN=http://127.0.0.1:5001`, and use a [Revolut test card](https://developer.revolut.com/docs/guides/merchant/test-and-go-live/testing/test-cards) on the hosted checkout. Reopen the private link and check that it shows the payment as completed before switching to Production.

## Issue a monthly offer

1. In [Revolut Business → Merchant → Subscriptions](https://business.revolut.com/merchant/subscriptions), create a plan for this offer with the service name, fixed monthly amount in EUR, and agreed number of payments. Use a plan that ends after the agreed number of payments. Generate the hosted signup link and copy its `https://checkout.revolut.com/subscription/…` URL. Preview it and check the terms against the offer before issuing the site link.
2. Provide the customer with the agreed terms, including the billing amount, schedule, and cancellation instructions. In Subscriptions settings, check Customer communications and Preventive notifications for automatic payments, as well as receipts. The [Merchant terms](https://www.revolut.com/en-GR/legal/business-acquiring/) describe these obligations.
3. Issue the private site link using a new offer reference and the exact same amount and term. The monthly link is available with Production configuration.

```powershell
npm.cmd run project-deposit:issue -- --reference BI-2026-043 --amount 150.00 --months 6 --service "Website maintenance" --monthly-link "<Revolut signup link>"
```

The customer reviews the monthly terms on the site and signs up on Revolut. Treat the Revolut signup URL as reusable. Share it through the private offer and close enrollment in the Merchant dashboard once the intended customer has signed up. Track enrollment and payments there. The site link's expiry controls access to the site page. Use a unique reference per offer and use the same issuance machine for one-off and monthly links.

## Accept a direct payment

The public `/el/pay` page accepts a customer-entered amount between €1 and €1,000 for a one-off payment. Revolut's embedded widget collects the card and billing details. Use the private offer flow for a fixed quote or a monthly plan. Reconcile direct payments in Revolut Merchant under the order's reference. A direct payment does not automatically create a project or fulfill a service.

Set the `DIRECT_PAYMENTS_*` variables in `.env.example` on the server. Use matching public and secret Merchant API keys for the chosen environment. Keep the order-attempt database on persistent storage and set `DIRECT_PAYMENTS_ENABLED=true` once the embedded widget loads and Card is enabled in the [Revolut Checkout settings](https://developer.revolut.com/docs/guides/merchant/accept-payments/online-payments/revolut-checkout/web#customise-revolut-checkout). Use separate Sandbox credentials and Revolut test cards to test the charge and confirmation flow without moving money.

## Test customer-entered monthly payments

The monthly option on `/el/pay` is available when the recurring Sandbox configuration is enabled. The customer chooses the exact EUR amount and supplies an email address for the Revolut customer record. They approve the amount and the monthly schedule before opening Revolut's card form. After the first payment, Revolut schedules subsequent charges. The customer can check the status or cancel through their private management link.

Use `RECURRING_PAYMENTS_ENABLED=true` and `RECURRING_PAYMENTS_REVOLUT_ENV=sandbox` with a Sandbox Merchant key and a dedicated random signing secret of at least 32 characters. Keep the attempt database on a persistent path if the test runs on a remote service. Use the [Revolut test cards](https://developer.revolut.com/docs/guides/merchant/test-and-go-live/testing/test-cards) to verify enrolment, repeated status checks, and cancellation. Test that authorizing a subscription starts monthly billing for the amount displayed on the site.

## Enable live monthly payments

Use `RECURRING_PAYMENTS_REVOLUT_ENV=production`, a current Production Merchant key with Customers Write, Subscriptions Write and Orders Read, a dedicated signing secret, and a persistent data directory. Retain the signing secret and database so customers can continue using existing management links across releases. The test and live integrations use separate databases and management links.

Set `RECURRING_PAYMENTS_FROM_EMAIL` to a verified sender with `RESEND_API_KEY`. The live checkout records the service, accepted terms and price, and sends the terms and private cancellation link before opening the card form. The server reads Revolut's scheduled renewal date, queues an email eight days before renewal and sends receipts for completed payments. If the reminder has not been accepted by the email provider one hour before the seven-day deadline, the server asks Revolut to postpone the renewal and sends the updated date. Keep the notification database and signing secret on persistent storage and monitor failed or late notices. Verify email delivery and avoid duplicate native receipts when configuring the merchant account.

Confirm with Revolut that the account permits automatic card collections through Subscriptions and the proposed rolling one-month terms. Revolut requires advance notice and a receipt for each automatic charge. Its Greece eligibility guidance requires notice at least seven days before auto-renewal. [Greek Merchant eligibility](https://help.revolut.com/en-GR/business/help/merchant-accounts/setting-up-a-merchant-account/prohibited-and-restricted-industries-business-models-for-a-merchant-account/) · [Payment processing agreement](https://www.revolut.com/el-GR/legal/business-acquiring/)

Set `RECURRING_PAYMENTS_ENABLED=true` after these requirements are met. Verify that the production checkout and private cancellation link work and that the customer receives the applicable emails. To pause new signups, set `RECURRING_PAYMENTS_NEW_SIGNUPS=false` and keep the recurring service enabled so existing customers can cancel and continue receiving reminders.
