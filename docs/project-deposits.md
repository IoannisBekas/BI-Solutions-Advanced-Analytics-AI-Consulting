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
