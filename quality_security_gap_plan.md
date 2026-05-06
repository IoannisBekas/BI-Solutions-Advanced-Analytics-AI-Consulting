# Quality And Security Gap Plan

Date: 2026-05-06

## Remediation Status

The code-level remediations from this review have been applied in the current working tree:

- client-prefixed local AI secret name removed from the Power BI local env file, with env-name and Railway packaging guards added;
- Quantus service-worker private API caching removed and private API responses marked `no-store`;
- FastAPI internal routes protected by `X-Quantus-Internal-Key`, production docs disabled, production CORS validated, health output minimized, and Python bind host made configurable;
- Express state-changing requests protected by production same-origin checks;
- auth request bodies validated with bounded zod schemas;
- production 500 responses and request IDs hardened;
- blog rich-text rendering moved off `dangerouslySetInnerHTML`;
- CSP, dev host binding, proxy trust, and rate limiting tightened;
- npm and Python dependency audit findings resolved, with CI/deploy audit gates and Dependabot added;
- known statsmodels test warnings filtered and an encoding regression scan added.

Operational actions still required outside the repo: rotate the Claude/Anthropic key that had been stored under a `VITE_` name locally, and deploy with `QUANTUS_INTERNAL_KEY`, `ALLOWED_ORIGINS`, and `TRUST_PROXY_HOPS` set for the target proxy topology.

## Executive Summary

The repo has a solid baseline in several places: TypeScript strict mode is enabled, root typecheck passes, Quantus and Power BI lint/tests pass, Python tests pass, main Express uses Helmet/CSP in production, request body limits exist, SQLite access is mostly prepared-statement based, and CI already runs gitleaks plus the main lint/test/build path.

The highest-risk gaps are not generic code style issues. They are boundary and deployment issues:

1. A local Power BI env file contains a set `VITE_CLAUDE_API_KEY`, which is a client-exposed prefix and should be treated as a leaked secret until rotated.
2. The Quantus service worker can cache cookie-authenticated `GET /quantus/api/*` responses because it only excludes `Authorization` headers, not cookie credentials.
3. The FastAPI pipeline is designed as an internal service but has no internal auth dependency, public docs by default, permissive production CORS defaults, public webhook routes, and a `0.0.0.0` bind in local and production start paths.
4. Cookie-authenticated state-changing Express routes rely on `SameSite=Lax` but do not have explicit CSRF or same-origin request enforcement.
5. Dependency hygiene is incomplete: npm audit reports moderate vulnerabilities, Python deps are unpinned lower bounds, and CI does not run npm audit or pip-audit.

The plan below prioritizes containment first, then browser/API boundary fixes, then supply-chain and quality hardening.

## Scope And Evidence

Reviewed stack:

- Root app: React/Vite frontend, Express backend, SQLite via `better-sqlite3`.
- Nested products: Quantus React/Vite PWA plus Quantus Node/Express API plus Python FastAPI pipeline.
- Power BI Solutions React/Vite app using a server-side Anthropic proxy.
- CI/deploy: GitHub Actions, GitHub Pages deploy, Railway three-service start script.

Security references applied:

- JavaScript Express web server security.
- JavaScript/TypeScript React frontend security.
- General frontend JavaScript security.
- Python FastAPI web server security.

Verification performed:

- `npm run check` passed.
- `npm --prefix apps/powerbi-solutions run lint` passed.
- `npm --prefix apps/quantus run lint` passed.
- `npm --prefix apps/powerbi-solutions run test` passed: 7 tests.
- `npm --prefix apps/quantus run test` passed: 15 tests.
- `python -m pytest -q` in `apps/quantus` passed: 352 tests, 158 warnings.
- `npm audit --json` at root found 3 moderate vulnerabilities.
- `npm --prefix apps/powerbi-solutions audit --json` found 1 moderate vulnerability.
- `npm --prefix apps/quantus audit --json` found 3 moderate vulnerabilities.
- `python -m pip_audit --version` failed because `pip-audit` is not installed.

Not run:

- `npm run build` was not run because `script/build.ts` deletes and rewrites `dist`, and the current worktree already has user-owned tracked `apps/quantus/dist` deletions. Running the build would risk overwriting that state.

## Critical Findings

### C1. Local Client-Prefixed AI Secret

Evidence:

- Sanitized env scan found `apps/powerbi-solutions/.env.local` contains `VITE_CLAUDE_API_KEY=set`.
- `.gitignore` ignores this file at `.gitignore:29-32`, but `.railwayignore` has no env-file exclusions at `.railwayignore:1-33`.
- `apps/powerbi-solutions/.env.example:4-6` says provider secrets must not use `VITE_` prefixes, but the local file does.

Impact:

- Any `VITE_` variable is intended for browser exposure in Vite. Even if the current source does not reference it, this is a high-risk local secret hygiene failure and the key should be rotated.

Plan:

1. Rotate the affected Claude/Anthropic key.
2. Remove `VITE_CLAUDE_API_KEY` from `apps/powerbi-solutions/.env.local`.
3. Use only server-side names: `ANTHROPIC_API_KEY` or `POWERBI_SOLUTIONS_ANTHROPIC_API_KEY`.
4. Add `.env`, `.env.*`, `**/.env`, and `**/.env.*` to `.railwayignore`.
5. Add a local secret-scan script or pre-commit hook so ignored local files can be checked before deploys.
6. Keep the existing CI gitleaks action, but add a documented local check because CI cannot see ignored local files.

Acceptance criteria:

- No `VITE_*KEY*`, `VITE_*SECRET*`, or `VITE_*TOKEN*` variables exist in local examples or committed code unless they are intentionally public.
- Sanitized env scan shows no client-prefixed secret names.
- A secret scan can be run locally without exposing secret values in output.

### C2. Quantus Service Worker Can Cache Cookie-Authenticated API Responses

Evidence:

- `apps/quantus/src/service-worker.ts:42` only checks for an `Authorization` header.
- `apps/quantus/src/service-worker.ts:110-123` caches all `GET /quantus/api/*` responses except report routes when no `Authorization` header is present.
- Quantus client auth uses cookie credentials, for example `/quantus/api/auth/me` and related calls are sent with cookies from the browser auth flow.

Impact:

- Cookie-authenticated responses such as session/user state, watchlist, alert data, or other personalized API responses can be stored in a shared browser cache for up to 4 hours. This creates same-device cross-account privacy leakage and stale authorization behavior.

Plan:

1. Change service-worker caching from broad `/quantus/api/*` matching to an explicit allowlist of public, non-personalized GET endpoints.
2. Never cache:
   - `/quantus/api/auth/*`
   - `/quantus/api/watchlist`
   - `/quantus/api/alerts`
   - `/quantus/api/usage/*`
   - any request with `request.credentials !== "omit"` or URL paths known to depend on cookies.
3. Add `Cache-Control: no-store` on all authenticated API responses in the Express routes.
4. Bump cache names and force cleanup of existing `quantus-public-api-v4` caches.
5. Add a service-worker unit or browser test proving `/quantus/api/auth/me` and `/quantus/api/watchlist` are never cached.

Acceptance criteria:

- Auth/user/watchlist/alert GET responses do not appear in Cache Storage after use.
- Existing stale API caches are removed on activation.
- Public cached routes are listed in code, not matched by broad prefix.

### C3. FastAPI Internal Service Boundary Is Not Enforced In Code

Evidence:

- FastAPI app is created with default docs/OpenAPI enabled at `apps/quantus/main.py:70-74`.
- Production CORS falls back to localhost origins and does not enforce HTTPS or wildcard checks at `apps/quantus/main.py:76-90`.
- Routers, including report and webhook routers, are mounted without an auth dependency at `apps/quantus/main.py:132-137`.
- Health returns runtime details and allowed origins at `apps/quantus/main.py:149-158`.
- Uvicorn binds `0.0.0.0` at `apps/quantus/main.py:167-169`, and production start does the same in `script/start-all.cjs`.
- Webhook routes mutate cache state without signature validation, for example `apps/quantus/api/webhooks.py:116-123`, `apps/quantus/api/webhooks.py:165-178`, and `apps/quantus/api/webhooks.py:220-226`.
- Report endpoints accept direct unauthenticated pipeline access at `apps/quantus/api/report.py:123-126`.

Impact:

- If the Python service is ever directly reachable, attackers can run costly report generation, inspect health/config, use OpenAPI docs, and spoof webhook invalidation events.

Plan:

1. Treat FastAPI as private infrastructure:
   - Bind Python to `127.0.0.1` by default in production start scripts.
   - Add `PYTHON_API_HOST`, defaulting to `127.0.0.1` in production.
2. Add an internal auth dependency:
   - Require a shared `X-Quantus-Internal-Key` header for all report, screener, portfolio, comparison, and webhook routes.
   - Reuse the existing root `QUANTUS_INTERNAL_KEY` pattern and verify it with constant-time comparison.
3. Disable public docs in production:
   - `docs_url=None`, `redoc_url=None`, `openapi_url=None` when `NODE_ENV=production`.
4. Harden CORS:
   - Require `ALLOWED_ORIGINS` explicitly in production.
   - Reject `*`.
   - Require `https://` production origins.
5. Redact `/health`:
   - Keep `status`, `engine`, and coarse dependency availability.
   - Remove `python_version`, `allowed_origins`, and exact missing env names from unauthenticated output.
6. Protect webhooks:
   - Add provider HMAC validation or a shared internal signature.
   - Add timestamp/replay protection and idempotency keys.

Acceptance criteria:

- Direct calls to FastAPI report/webhook routes without the internal key return 401/403.
- Production docs URLs return 404.
- Production startup fails if `ALLOWED_ORIGINS` is absent or non-HTTPS.
- Python service is not publicly bound unless explicitly overridden.

## High Findings

### H1. Missing Explicit CSRF/Same-Origin Enforcement For Cookie Auth Mutations

Evidence:

- Auth cookie is `httpOnly`, `secure` in production, and `sameSite: "lax"` at `apps/server/auth.ts:28-36`.
- State-changing routes include auth and Quantus mutations, for example logout at `apps/server/auth.ts:456-459`, account deletion at `apps/server/auth.ts:477-483`, and Quantus usage/watchlist/alert mutations in `apps/server/quantusRoutes.ts`.
- No CSRF middleware or same-origin origin check was found.

Impact:

- `SameSite=Lax` reduces common cross-site POST CSRF, but it is not a complete policy for all browser and same-site/subdomain cases. The security baseline for cookie-authenticated state-changing requests is explicit CSRF or same-origin enforcement.

Plan:

1. Add a centralized middleware for state-changing cookie-authenticated requests:
   - Require `Origin` or `Referer`.
   - Verify it against the canonical same-origin allowlist.
   - Reject missing or mismatched origins in production.
2. Add CSRF tokens for browser form/API mutations:
   - Double-submit cookie or server-generated token endpoint.
   - Require `X-CSRF-Token` on POST/PUT/PATCH/DELETE where auth cookies are accepted.
3. Exempt only internal routes that use `QUANTUS_INTERNAL_KEY`.
4. Add tests for rejected cross-origin POSTs against auth, watchlist, alerts, usage, and Power BI proxy routes.

Acceptance criteria:

- Cross-origin POST/DELETE requests with cookies fail.
- Same-origin app requests continue to work.
- Internal service-to-service requests use internal auth, not browser CSRF tokens.

### H2. Auth Input Validation Is Manual And Missing Upper Bounds

Evidence:

- Register destructures raw body and validates only required fields, email format, and minimum password length at `apps/server/auth.ts:322-343`.
- Login validates presence but not type or max length before bcrypt compare at `apps/server/auth.ts:370-385`.
- Root JSON body limit is 2 MB at `apps/server/index.ts:149-158`.

Impact:

- Large password inputs can trigger expensive bcrypt work. Oversized name/referral fields can pollute persistent data. Manual validation also diverges from the zod validation style used in other routes.

Plan:

1. Add zod schemas for register, login, Google auth, logout, and account deletion.
2. Enforce:
   - Email max 254 and normalized lowercase storage.
   - Name max 120.
   - Password min 12, max 128 or 256.
   - Referral token exact expected pattern/length.
   - Google credential max length.
3. Reject invalid shape before DB lookups or bcrypt compare.
4. Add auth route tests for type confusion, oversized strings, and invalid bodies.

Acceptance criteria:

- Oversized password/name/credential payloads fail fast with 400.
- Bcrypt is never run for invalid or oversized login inputs.
- Auth validation is schema-driven.

### H3. Dependency And Supply-Chain Controls Are Incomplete

Evidence:

- Root `npm audit` reports moderate vulnerabilities in `postcss`, `express-rate-limit`, and `ip-address`.
- Power BI audit reports moderate `postcss`.
- Quantus audit reports moderate `postcss`, `express-rate-limit`, and `ip-address`.
- Root `package.json:58-60` and `package.json:96` show affected direct deps.
- Python requirements are broad lower bounds at `apps/quantus/pipelines/requirements.txt:1-14`.
- CI installs Python deps but does not run `pip-audit` at `.github/workflows/ci.yml:43-45`.
- CI does not run npm audit at `.github/workflows/ci.yml:33-72`.

Plan:

1. Update `postcss` to a patched version across root and subapps.
2. Resolve `express-rate-limit`/`ip-address` via the least disruptive supported version path:
   - Check whether a newer `express-rate-limit` release resolves the advisory.
   - If npm's suggested downgrade to `8.0.0` is the only advisory-free route, regression test rate limiting before accepting it.
3. Add `npm audit --audit-level=high` to CI immediately, then ratchet to `moderate` after current findings are resolved.
4. Add Python locking:
   - Use `pip-tools` or `uv` to generate a lock/constraints file.
   - Keep `requirements.in` for intent and a locked file for deploy.
5. Add `pip-audit` to CI for the locked environment.
6. Add Dependabot or Renovate for root, subapp npm, GitHub Actions, and Python deps.

Acceptance criteria:

- npm audit has zero high/critical findings immediately and a tracked path to zero moderate findings.
- Python dependency audit runs in CI.
- Production deploy uses pinned Python versions, not open lower bounds.

### H4. Rate Limiting Is Proxy-Sensitive And In-Memory

Evidence:

- Main Express rate limiters are defined at `apps/server/index.ts:202-243`.
- Quantus Express rate limiters are defined at `apps/quantus/server/index.ts:103-107`.
- No `trust proxy` configuration was found in `apps`.

Impact:

- Behind Railway or another reverse proxy, IP detection can be wrong. Limits can either collapse many users onto one proxy IP or become bypassable if proxy headers are trusted incorrectly later. In-memory stores also reset on restart and do not coordinate across instances.

Plan:

1. Set `app.set("trust proxy", value)` deliberately for Railway, with documentation for the expected proxy topology.
2. Add a startup assertion/test around `X-Forwarded-For` behavior in production-like config.
3. Add per-account rate limits for expensive authenticated AI/report routes.
4. Use a shared store if multiple instances are planned.

Acceptance criteria:

- Rate limiter keys are stable and correct behind the production proxy.
- Restarting or scaling does not erase important abuse controls.

## Medium Findings

### M1. Main Express Error Handler Leaks Internal Messages

Evidence:

- Error handler returns `err.message` directly at `apps/server/index.ts:348-353`.

Plan:

1. Return generic messages for 500s in production.
2. Preserve explicit safe 4xx messages.
3. Log request ID and error details server-side only.
4. Add tests for production error responses.

### M2. Blog Rich Text Rendering Uses Unsanitized HTML Injection

Evidence:

- `renderRichText` only replaces bold markers with `<strong>` at `apps/client/src/pages/BlogPost.tsx:16-18`.
- Rendered content is injected with `dangerouslySetInnerHTML` at `apps/client/src/pages/BlogPost.tsx:74-89`.
- Blog data already contains raw anchor HTML around `apps/client/src/data/blogData.ts:1519`.

Plan:

1. Replace the custom renderer with React elements or a safe Markdown parser.
2. If HTML support is required, sanitize with a strict allowlist for tags/attributes/protocols.
3. Explicitly reject `javascript:`, event handler attributes, and inline styles unless sanitized.
4. Add regression tests with malicious blog content.

### M3. Quantus Standalone CSP Allows Inline Scripts

Evidence:

- Quantus Express production CSP uses `script-src 'self' 'unsafe-inline'` at `apps/quantus/server/index.ts:61-72`.

Plan:

1. Align Quantus with the main server nonce/hash approach.
2. Remove `unsafe-inline` for scripts.
3. Keep any inline style exception documented until Tailwind/runtime style constraints are removed.

### M4. Dev Servers Bind Broadly And Main Vite Allows Any Host

Evidence:

- Root Vite server uses `host: "0.0.0.0"` and `allowedHosts: true` at `vite.config.ts:29-35`.
- Quantus package scripts bind dev client to `0.0.0.0` at `apps/quantus/package.json:7-10`.

Plan:

1. Default dev servers to localhost.
2. Require an explicit env flag for LAN testing.
3. Replace `allowedHosts: true` with a small allowlist.

### M5. Env Packaging Is Inconsistent

Evidence:

- `.gitignore` excludes env files at `.gitignore:25-32`.
- `.railwayignore` does not exclude `.env` or nested `.env.*` at `.railwayignore:1-33`.

Plan:

1. Add env-file exclusions to `.railwayignore`.
2. Verify Railway deploy source cannot package ignored local secrets.
3. Add a deployment preflight that fails if env files are present in the deploy artifact.

### M6. Health Endpoints Leak More Detail Than Needed

Evidence:

- FastAPI `/health` returns `python_version`, `allowed_origins`, and missing env details at `apps/quantus/main.py:149-158`.
- Quantus and advisor health expose configuration booleans.

Plan:

1. Split public liveness from private diagnostics.
2. Keep public health minimal: `status`, `timestamp`, `requestId`.
3. Move detailed config checks behind internal auth.

## Quality Findings

### Q1. Source Encoding/Mojibake Is Widespread

Evidence:

- Multiple TypeScript and Python files display corrupted dash/Greek/text sequences in comments and user-facing strings, including `apps/server/index.ts`, `apps/server/auth.ts`, `apps/server/routes/advisor.ts`, `apps/quantus/server/index.ts`, and `apps/quantus/src/service-worker.ts`.

Impact:

- User-facing Greek copy and logs can render incorrectly. It also makes review and future editing error-prone.

Plan:

1. Add an encoding detection script for likely mojibake sequences.
2. Fix user-facing strings first, especially Greek advisor messages.
3. Normalize all source files to UTF-8.
4. Add a CI check for common mojibake byte sequences.

### Q2. Monorepo Dependency Drift And No Workspace Model

Evidence:

- React/Vite/TypeScript/Tailwind/lucide versions differ across root, Quantus, and Power BI.
- There are three package locks and duplicated dependency sets.

Plan:

1. Decide whether this should be a real npm workspace.
2. If yes, consolidate shared versions and use workspace scripts.
3. If no, document why versions intentionally diverge.
4. Add a small dependency drift report in CI.

### Q3. Generated Artifacts Are Tracked Or Dirty

Evidence:

- Current git status shows tracked `apps/quantus/dist` files deleted while `.gitignore` also ignores `apps/quantus/dist/`.
- Root build deletes and rewrites `dist` via `script/build.ts`.

Plan:

1. Decide whether `apps/quantus/dist` should be tracked.
2. Prefer untracking generated dist artifacts and relying on CI/build outputs.
3. Add a clean build artifact policy to docs.
4. Keep deploy output out of source control.

### Q4. Test Coverage Is Healthy In Pockets But Missing Security/E2E Gates

Evidence:

- Existing checks pass, but there is no coverage script or coverage threshold.
- No Playwright/Cypress E2E dependency was found.
- `script/smoke-routes.cjs` exists but is not run in CI.

Plan:

1. Add API integration tests for auth, CSRF/origin checks, service-worker cache exclusions, and proxy boundaries.
2. Add Playwright smoke tests for:
   - Main site shell.
   - Quantus workspace auth/session.
   - Power BI workspace auth/proxy errors.
3. Run `script/smoke-routes.cjs` in CI against a local production server after build.
4. Add coverage reporting and thresholds once security regression tests are in place.

### Q5. Python Tests Emit 158 Warnings

Evidence:

- `python -m pytest -q` passed, but emitted 158 warnings from statsmodels date index/future behavior and convergence warnings.

Plan:

1. Triage warnings into expected numerical/model warnings versus future-breaking warnings.
2. Fix date index/frequency issues where feasible.
3. Add warning filters only for known safe model warnings with comments.
4. Fail CI on new warning categories.

### Q6. Crash Handling And Request IDs Need Production Hardening

Evidence:

- Main Express accepts a client-supplied request ID without a length/character cap at `apps/server/index.ts:161-168`.
- `unhandledRejection` logs but does not exit or mark the process unhealthy at `apps/server/index.ts:398-401`.

Plan:

1. Validate request ID length and characters, or always generate server request IDs while forwarding client IDs separately.
2. Treat unhandled rejections as fatal in production after logging and graceful shutdown.
3. Add structured logs with request ID, route, status, and error classification.

## Remediation Roadmap

### Phase 0: Containment - Same Day

1. Rotate the local `VITE_CLAUDE_API_KEY` value.
2. Remove client-prefixed secret variables from local env files.
3. Add env-file exclusions to `.railwayignore`.
4. Add a local secret-scan command and document it.
5. Clear old Quantus service-worker caches manually in production if private cache leakage may have occurred.

### Phase 1: Browser And Internal-Service Boundaries - 1 To 2 Days

1. Restrict service-worker API caching to explicit public routes.
2. Add `Cache-Control: no-store` for authenticated API responses.
3. Bind internal FastAPI and Quantus Node services to loopback in production scripts.
4. Add internal-key enforcement to FastAPI routers.
5. Disable FastAPI docs/OpenAPI in production.
6. Redact public health endpoints.

### Phase 2: Auth And API Hardening - 2 To 4 Days

1. Add CSRF/same-origin middleware for cookie-authenticated mutations.
2. Add zod schemas and max lengths to auth routes.
3. Configure `trust proxy` deliberately.
4. Add per-user rate limits for AI/report routes.
5. Make production error responses generic.
6. Add regression tests for each security control.

### Phase 3: Supply Chain - 1 To 2 Days

1. Patch npm vulnerabilities.
2. Add `npm audit` gates to CI.
3. Add Python lock/constraints generation.
4. Add `pip-audit` to CI.
5. Enable Dependabot/Renovate across package ecosystems.

### Phase 4: Frontend Content And CSP - 1 To 3 Days

1. Replace unsafe blog rich-text rendering with sanitized rendering.
2. Align Quantus CSP with the main app CSP.
3. Restrict dev host binding/allowed hosts.
4. Add tests for malicious content and CSP-sensitive pages.

### Phase 5: Quality Cleanup - 3 To 5 Days

1. Fix mojibake and add an encoding check.
2. Decide and enforce generated artifact policy.
3. Consolidate dependency versions or document intentional drift.
4. Add route smoke tests to CI.
5. Add Playwright smoke coverage for the three main product surfaces.
6. Triage Python warnings and fail on new warning classes.

## Suggested Work Order

1. Open a security branch for containment and boundary fixes.
2. Commit Phase 0 separately because it may involve key rotation and deploy ignore rules.
3. Commit service-worker cache hardening separately and deploy it quickly.
4. Commit FastAPI internal auth and production docs/CORS hardening.
5. Commit CSRF/origin and auth validation changes with tests.
6. Commit supply-chain updates and CI gates.
7. Commit quality cleanup in smaller batches: encoding, generated artifacts, workspace/dependency alignment, smoke/E2E tests.

## Final Verification Checklist

Run locally:

```bash
npm run check
npm --prefix apps/quantus run lint
npm --prefix apps/quantus run test
python -m pytest -q
npm --prefix apps/powerbi-solutions run lint
npm --prefix apps/powerbi-solutions run test
npm audit --audit-level=moderate
npm --prefix apps/quantus audit --audit-level=moderate
npm --prefix apps/powerbi-solutions audit --audit-level=moderate
python -m pip_audit -r apps/quantus/pipelines/requirements.lock
```

Run after build in CI or a disposable worktree:

```bash
npm run build
npm run smoke:routes -- http://localhost:5001
```

Manual/browser checks:

- Clear service workers and caches, then verify Quantus still loads.
- Confirm authenticated API responses are not stored in Cache Storage.
- Confirm cross-origin POSTs are rejected.
- Confirm FastAPI docs are unavailable in production.
- Confirm public health output is minimal.
- Confirm no env files are included in deploy artifacts.
