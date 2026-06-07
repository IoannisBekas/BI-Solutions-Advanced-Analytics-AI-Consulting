# BI Solutions Engineering Documentation

Last updated: 2026-06-07
Status: canonical engineer-facing project documentation

## Purpose

This file is the living engineering reference for the BI Solutions codebase.

If you change any of the following, update this file in the same commit:

- runtime topology
- public or internal API contracts
- authentication or persistence behavior
- environment variables
- deploy/build/CI behavior
- tier limits, quotas, or product gating
- production-only operational notes

Do not create parallel "source of truth" docs unless there is a strong reason. Keep this file current instead.

## Product Map

The repository currently ships four product surfaces:

1. Root BI Solutions site
   - Marketing site and shared root server
   - Frontend is built from the repo root
   - Backend lives under `apps/server`

2. Quantus Investing
   - Frontend: `apps/quantus/src`
   - Node service: `apps/quantus/server/index.ts`
   - Python service: `apps/quantus/main.py` and `apps/quantus/pipelines/*`
   - Production URL family:
     - `https://www.bisolutions.group/quantus/...`

3. Power BI Solutions
   - Frontend: `apps/powerbi-solutions/src`
   - Server-side AI proxy is mounted from the root Express app
   - Production URL family:
     - `https://www.bisolutions.group/power-bi-solutions/`

4. Bonusaki
   - Public product page: `apps/client/src/pages/products/BonusakiPage.tsx`
   - Static demo app: `apps/bonusaki`
   - Demo build output is mounted below the root site at `/bonusaki/demo/`
   - Production URL family:
     - `https://www.bisolutions.group/bonusaki`
     - `https://www.bisolutions.group/bonusaki/demo/`

### Canonical public host

- The canonical public host is `https://www.bisolutions.group`.
- Engineers should not emit new absolute links that target `https://bisolutions.group` for product routes.
- As of 2026-04-19, the apex host `https://bisolutions.group` is externally forwarded by Squarespace and currently drops subpaths like `/quantus/workspace/` instead of preserving them.
- Repo-side redirects exist if apex traffic reaches the Express app, but the durable fix for apex path preservation is infrastructure-level, not application-level.

## Runtime Topology

Production runs as a single Railway deployment that starts three services inside one container.

Entry point:

- `npm run start`
- which calls `npm run start:all`
- which runs `script/start-all.cjs`

Service topology:

1. Main Express server
   - built artifact: `dist/index.cjs`
   - listens on Railway `PORT` (typically `8080`)
   - owns SQLite persistence
   - mounts:
     - `/api/auth`
     - `/api/quantus/*`
     - `/quantus/*` proxy
     - `/power-bi-solutions/*` proxy
     - `/api/health`

2. Quantus Node server
   - built artifact: `dist/quantus-server.cjs`
   - listens on `3001`
   - serves Quantus API and frontend integration behavior
   - proxies persistence/auth requests back to the main Express server

3. Quantus Python API
   - launched via `uvicorn`
   - listens on `8000`
   - powers report generation and quantitative pipeline work

Important design rule:

- The root server is the persistence owner.
- Quantus Node must not write directly to SQLite.
- Quantus Node proxies persistence/auth operations to the root server to avoid dual-writer corruption.

## Technology Stack

### Root app

- React 19
- Vite 7
- TypeScript
- Express 4
- Tailwind
- TanStack Query
- Wouter
- better-sqlite3

### Quantus

- React 19
- Vite 6
- TypeScript
- Express 4
- Python FastAPI/Uvicorn pipeline
- Google GenAI SDK
- Vitest
- Pytest
- vite-plugin-pwa

### Power BI Solutions

- React 19
- Vite 7
- TypeScript
- Tailwind
- Vitest

### Bonusaki

- Vite 7
- Tailwind 4 via the root toolchain
- Static HTML/CSS/JavaScript demo
- No app-local backend or persistence in this repository

## Data Storage

Primary database:

- SQLite via `better-sqlite3`
- file path: `path.join(DATA_DIR, "bisolutions.db")`
- default local `DATA_DIR`: `./data`

Current schema migrations in `apps/server/db.ts`:

1. Users table
2. Quantus watchlists, alerts, snapshots, outcomes
3. App metadata and auth provider tracking
4. Quantus AI daily token usage accounting

Key persistent tables:

- `users`
- `app_meta`
- `quantus_watchlists`
- `quantus_alert_subscriptions`
- `quantus_report_snapshots`
- `quantus_signal_outcomes`
- `quantus_ai_daily_usage`

## Authentication

Auth implementation lives in `apps/server/auth.ts`.

Current behavior:

- JWT-backed auth cookie: `auth_token`
- Cookie is HTTP-only
- Root auth accepts either:
  - cookie session
  - bearer token
- Quantus now supports cookie-backed auth through the proxy chain
- Google sign-in is optional and controlled by `GOOGLE_CLIENT_ID`

Relevant production constraints:

- `JWT_SECRET` is required in production
- Quantus production also requires `QUANTUS_INTERNAL_KEY` with minimum length 32

Deletion/auth notes:

- User deletion challenge logic exists in root auth
- Hybrid/password/google provider combinations are explicitly handled

## Quantus Product Notes

### Tier model

Shared tier logic lives in `shared/quantus.ts`.

Current tiers:

- `FREE`
- `UNLOCKED`
- `INSTITUTIONAL`

Current limits:

- Watchlist size:
  - `FREE`: 5
  - `UNLOCKED`: 25
  - `INSTITUTIONAL`: unlimited
- Monthly reports:
  - `FREE`: 3
  - `UNLOCKED`: 10
  - `INSTITUTIONAL`: unlimited
- Daily AI token budgets:
  - `FREE`: 6,000
  - `UNLOCKED`: 24,000
  - `INSTITUTIONAL`: 80,000

### Sector Packs

Sector Packs no longer depend on a blank backend state.

Current behavior:

- API route: `/quantus/api/v1/sectors/:sector/reports`
- Implementation: `apps/quantus/server/index.ts`
- Seed source: `apps/quantus/server/data/assetUniverse.ts`
- Route now returns seeded starter content even before a full live report exists
- Cached reports are preferred where available; starter shells fill the rest

This change was added specifically to prevent an empty first-visit Sector Packs experience.

### Workspace UI conventions

Shared workspace state primitives now live in:

- `apps/quantus/src/components/workspace/WorkspaceStates.tsx`

Use these instead of hand-rolled page-local variants:

- `WorkspaceError`
- `WorkspaceSkeleton`
- `WorkspaceEmpty`

This was introduced to eliminate inconsistent empty/error/loading states across:

- Accuracy
- Archive
- Sector Packs
- Watchlist

### Quantus AI guardrails

Recent guardrails now in place:

- per-user daily token accounting in SQLite
- tier-based token budgets
- lower bounded `maxOutputTokens` by tier and usage type
- request timeouts for AI paths
- request-id propagation through the proxy chain

Files involved:

- `shared/quantus.ts`
- `apps/server/db.ts`
- `apps/server/quantusRoutes.ts`
- `apps/quantus/server/index.ts`

## Power BI Solutions Notes

Power BI Solutions is a dedicated frontend app under `apps/powerbi-solutions`.

Important current behavior:

- The frontend is separate from Quantus
- Production AI requests go through the root server proxy
- The app is now part of the shared deploy/test/build path

Recent live changes included:

- updated frontend visuals/content in:
  - `apps/powerbi-solutions/src/App.tsx`
  - `apps/powerbi-solutions/src/index.css`
  - `apps/powerbi-solutions/src/sections/FooterSection.tsx`
  - `apps/powerbi-solutions/src/sections/HeroSection.tsx`
  - `apps/powerbi-solutions/src/sections/TMDLInputSection.tsx`

## Bonusaki Product Notes

Bonusaki is currently published as a first-party product page plus a static,
mock-data demo. The root server also includes a production-pilot API foundation
for privacy-safe demo events, signed reward issuing, cashier validation,
redemption audit logs, and admin campaign summaries.

Public launch checklist:

- Keep `/bonusaki` as the canonical product/discovery page.
- Keep `/bonusaki/demo/` as the public UI-only demo.
- Do not expose private backend repository names, payment-provider internals,
  redemption secrets, or merchant data in public demo copy.
- Run `npm run check`, `npm run build`, and `node script/smoke-routes.cjs`
  against a local server before deployment.
- Visually check `/bonusaki` and `/bonusaki/demo/` on desktop and mobile,
  including customer, merchant, cashier, and scratch-card states.
- After deployment, verify:
  - `https://www.bisolutions.group/bonusaki`
  - `https://www.bisolutions.group/bonusaki/demo/`
- Confirm the QR asset opens `https://www.bisolutions.group/bonusaki/demo/`.
- Confirm `POST /api/bonusaki/events` records demo engagement without
  customer email addresses or reward secrets.

Production pilot readiness:

- Set `BONUSAKI_PILOT_ENABLED=true` only after a merchant pilot agreement is in
  place.
- Set a dedicated `BONUSAKI_TOKEN_SECRET` with at least 32 characters. If it is
  absent, the server can fall back to `JWT_SECRET`, but a dedicated secret is
  preferred before real rewards are issued.
- Set `BONUSAKI_CASHIER_PIN` before enabling cashier redemption.
- Set `BONUSAKI_ADMIN_KEY` with at least 24 characters before using admin
  campaign summaries.
- Define merchant campaign rules, prize inventory, expiration policy, cashier
  operating process, fraud handling, billing, and privacy ownership before
  live customers scan production QR codes.
- Use the cafe pilot operations pack in `docs/bonusaki/` before launch:
  - `cafe-pilot-agreement.md`
  - `campaign-rules-template.md`
  - `cashier-sop.md`
  - `privacy-notice-template.md`
  - `support-runbook.md`
  - `wallet-and-onboarding-roadmap.md`
  - `launch-checklist.md`

Generate a real cafe QR batch:

```powershell
npm run bonusaki:qr
```

For a custom cafe, copy `docs/bonusaki/sample-cafe-pilot.json`, change the
merchant/campaign fields, then run:

```powershell
node script/bonusaki-generate-qr-batch.cjs --config path\to\cafe-config.json
```

The output is written to `output/bonusaki-qr/` with SVG QR files,
`manifest.csv`, `config.json`, and a printable `index.html`.
Generated URLs include `merchant`, `campaign`, and `qr` query parameters; the
Bonusaki demo event tracker includes those values in privacy-safe event
metadata.

Bonusaki API endpoints:

- `GET /api/bonusaki/health`
  - reports pilot readiness flags and default pilot slugs.
- `GET /api/bonusaki/campaign`
  - returns public campaign and reward-tier metadata for the default pilot.
- `POST /api/bonusaki/events`
  - stores privacy-safe demo engagement events.
- `POST /api/bonusaki/rewards/issue`
  - issues a signed single-use reward token when the pilot is enabled.
- `POST /api/bonusaki/rewards/validate`
  - validates a token or public code for cashier inspection.
- `POST /api/bonusaki/rewards/redeem`
  - redeems an issued reward when cashier validation is configured.
- `GET /api/bonusaki/admin/summary`
  - requires `x-bonusaki-admin-key` and returns campaign counts.

## Environment Variables

### Required in production

- `JWT_SECRET`
  - required by root auth and Quantus Node
- `QUANTUS_INTERNAL_KEY`
  - required by Quantus Node in production
- `ALLOWED_ORIGINS`
  - must contain the concrete origins that access Quantus with credentials

### Strongly recommended for live functionality

- `ANTHROPIC_API_KEY`
  - required for server-side AI proxy features that depend on Anthropic
- `GOOGLE_CLIENT_ID`
  - enables Google sign-in
- `FMP_API_KEY`
  - live market/news enrichment for Quantus
- `BONUSAKI_PILOT_ENABLED`
  - set to `true` only for an approved merchant pilot
- `SEC_EDGAR_USER_AGENT`
  - required for SEC filing access hygiene

### Required before live Bonusaki merchant pilots

- `BONUSAKI_TOKEN_SECRET`
  - required before issuing real Bonusaki reward tokens
- `BONUSAKI_CASHIER_PIN`
  - required before real Bonusaki cashier redemption is enabled
- `BONUSAKI_ADMIN_KEY`
  - required before Bonusaki admin summaries are available; use at least 24
    characters

### Runtime/config variables used by Quantus

- `AUTH_API_TARGET`
- `QUANTUS_ALLOW_DEMO_DATA`
- `QUANTUS_ENABLE_PUSH`
- `QUANTUS_SHOW_ENGINE_BANNER`
- `QUANTUS_PYTHON_TIMEOUT_MS`
- `QUANTUS_AI_STREAM_TIMEOUT_MS`

### Persistence/runtime

- `DATA_DIR`
- `PORT`
- `NODE_ENV`

## Build, Test, and Local Development

### Root

- Type check:
  - `npm run check`
- Full build:
  - `npm run build`
- Root server dev:
  - `npm run dev`

### Quantus

- Dev:
  - `cd apps/quantus`
  - `npm run dev`
- Lint:
  - `npm run lint`
- Frontend tests:
  - `npm run test`
- Python tests:
  - `python -m pytest -q`
- Build:
  - `npm run build`

### Power BI Solutions

- Dev:
  - `cd apps/powerbi-solutions`
  - `npm run dev`
- Lint:
  - `npm run lint`
- Test:
  - `npm test`
- Build:
  - `npm run build`

### Bonusaki

- Dev:
  - `cd apps/bonusaki`
  - `npm run dev`
- Lint:
  - `npm run lint`
- Build:
  - `npm run build`

## CI and Deploy

### CI

Canonical CI workflow:

- `.github/workflows/ci.yml`

Current CI coverage:

- gitleaks secret scan
- root type check
- Quantus lint
- Quantus frontend tests
- Quantus Python tests
- root build

### GitHub Pages

Workflow:

- `.github/workflows/deploy.yml`

Behavior:

- runs on push to `main`/`master`
- installs root, Quantus, and Power BI dependencies
- uses root Node tooling for the dependency-free Bonusaki static demo
- runs root typecheck
- runs Quantus lint/tests/Python tests
- runs Power BI lint/tests
- builds the repo
- uploads `dist/public` to GitHub Pages

### Railway

Config:

- `railway.json`

Current Railway behavior:

- Nixpacks build
- installs root, Quantus, and Power BI dependencies
- uses root Node tooling for the dependency-free Bonusaki static demo
- builds all artifacts
- starts the three-service topology via `npm run start`
- healthcheck path: `/api/health`

## Production State Notes

As of 2026-04-19:

- Railway deployment is healthy
- `/api/health` returns `200`
- Quantus Sector Packs seeded endpoints are live and returning `200`
- both `Technology` and `Utilities` Sector Packs return non-empty data
- production logs showed optional env warnings, not fatal failures

Observed optional env warnings on Railway:

- missing `FMP_API_KEY`
- missing `SEC_EDGAR_USER_AGENT`
- missing `GOOGLE_CLIENT_ID`

Observed non-issues:

- no `JWT_SECRET` startup failure
- no `ANTHROPIC_API_KEY` startup failure in the deployed build tested here
- no Sector Packs `502`
- no Quantus startup crash

Observed live routing constraint:

- `https://www.bisolutions.group/quantus/workspace/` renders correctly in a clean browser session
- `https://bisolutions.group/quantus/workspace/` is not a valid product entrypoint today because the current apex-domain forward strips the path and sends users to `https://www.bisolutions.group`
- If users report a blank page while the address bar still shows the apex host, clear site data/service workers for `bisolutions.group` first, then verify the apex-domain forwarding rule outside the repo

## Known Engineering Rules

1. Do not bypass root persistence ownership.
   - If a Quantus feature needs durable data, add or extend a root route first.

2. Do not ship workspace UI one-offs when a shared primitive should exist.
   - Prefer shared workspace states and shared layout tokens.

3. Keep deploy safety in the critical path.
   - If a product can fail lint/tests/build, wire that into CI before shipping.

4. Keep this file current.
   - If the change matters to another engineer a week from now, document it here.

## Change Log Snapshot

Recent engineering changes already reflected in this repo:

- Quantus auth/proxy chain fixed for cookie-backed sessions
- Quantus logout route aligned
- Quantus sector backend seeded for first-visit content
- Quantus workspace loading/error/empty states unified
- Quantus active nav/search affordances improved
- Quantus accuracy gate now shows anonymized preview rows
- Quantus AI usage budgets persisted and enforced
- referral signup credit flow made transactional
- Quantus referral links normalized to the `www` canonical host
- root CI workflow added
- Power BI frontend refinements shipped alongside the latest release

## Update Checklist

Before merging a meaningful change, update this document if any answer below is "yes":

- Did routing, auth, persistence, or topology change?
- Did we add/remove an env var?
- Did a tier limit, usage budget, or gating rule change?
- Did deploy or CI behavior change?
- Did production operations or a known live constraint change?
- Did we add a new shared engineering pattern other contributors should follow?
