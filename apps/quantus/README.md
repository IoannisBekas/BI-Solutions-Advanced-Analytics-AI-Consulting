<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c7df1ca4-1417-4918-b88b-4fe758c524e9

## Run Locally

**Prerequisites:** Node.js and Python 3.11+


1. Install dependencies:
   `npm install`
2. Install Python dependencies:
   `pip install -r pipelines/requirements.txt`
3. Copy [.env.example](.env.example) to `.env.local` and set at minimum:
   `APP_URL`, `AUTH_API_TARGET`, `PYTHON_API_URL`, `ALLOWED_ORIGINS`, `JWT_SECRET`, `QUANTUS_INTERNAL_KEY`, and either `ANTHROPIC_API_KEY` or `GEMINI_API_KEY`
   Optional: set `ANTHROPIC_MODEL` to pin the Claude model snapshot used for report narratives.
   Optional: set `QUANTUS_PYTHON_TIMEOUT_MS` to allow longer live-pipeline runs for slower tickers.
   Optional but recommended for production: `FMP_API_KEY`, `SEC_EDGAR_USER_AGENT`, `DATA_DIR`, and `SCREENER_SEED_TICKERS`.
4. Run the app:
   `npm run dev`

## Production Notes

- Set `JWT_SECRET` explicitly in production. Do not rely on local defaults.
- Set `QUANTUS_INTERNAL_KEY` explicitly in production. It must be at least 32 characters and must match the root BI Solutions server.
- Set `ALLOWED_ORIGINS` explicitly in production and include every browser origin that will hit the app. For the live site, include both `https://bisolutions.group` and `https://www.bisolutions.group` if both hostnames are in use.
- Quantus proxies auth to the root BI Solutions server via `AUTH_API_TARGET`; production targets must be loopback/private unless `AUTH_API_TARGET_ALLOW_REMOTE=true` is set, and remote targets must use HTTPS.
- The Python API must be reachable at `PYTHON_API_URL`; production targets must be loopback/private unless `PYTHON_API_URL_ALLOW_REMOTE=true` is set, and remote targets must use HTTPS.
- Set `QUANTUS_BILLING_OPERATOR_KEY` in production before using the billing renewal sweep. It must be at least 32 characters and is sent as `x-quantus-operator-key`.
- Revolut billing only sends API credentials to `REVOLUT_ALLOWED_API_HOSTS`, which defaults to the official production and sandbox Merchant API hosts. Add a host only when you intentionally proxy billing traffic.
- If `AUTH_SERVICE_URL` is set for billing tier sync, private hosts are allowed directly; public hosts must be listed in `AUTH_SERVICE_ALLOWED_HOSTS`.
- Quantus cache persistence is SQLite-backed. On Railway, mount a volume and point `DATA_DIR` at that mount so reports and the scanner index survive restarts.
- The scanner seed list is controlled by `SCREENER_SEED_TICKERS` and merged with every ticker that already has a cached report.
- `SEC_EDGAR_USER_AGENT` is optional locally but should be set in production to a real contact string for SEC requests.
- Demo/mock data is disabled in production by default unless `QUANTUS_ALLOW_DEMO_DATA=true`.
- Push subscriptions are disabled unless `QUANTUS_ENABLE_PUSH=true` and a valid `VITE_VAPID_PUBLIC_KEY` is configured.

## Verification

- Frontend/unit tests: `npm run test`
- Python tests: `npm run test:python`
- Full check: `npm run test:all`
