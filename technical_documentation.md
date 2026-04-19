# BI Solutions Engineering Documentation

Last updated: 2026-04-19
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

The repository currently ships three product surfaces:

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
- `SEC_EDGAR_USER_AGENT`
  - required for SEC filing access hygiene

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
