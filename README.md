# BI Solutions Group

Monorepo for the BI Solutions Group website and its hosted product experiences.

## Repository structure

| Path | Purpose |
| --- | --- |
| `apps/client` | Main React and Vite marketing website |
| `apps/server` | Express API and production static server |
| `apps/quantus` | Quantus research workspace and API |
| `apps/powerbi-solutions` | Power BI Solutions workspace |
| `apps/bonusaki` | Bonusaki pilot experience |
| `apps/bnb-companies` | BNB treasury and CEBE dashboard at `/bnb-companies/` |
| `apps/sol-companies` | Solana treasury and CESE dashboard at `/sol-companies/` |
| `apps/btc-companies` | Bitcoin treasury and CEBTC dashboard at `/btc-companies/` |
| `shared` | Shared schemas used across applications |
| `script` | Build, prerender, validation, and operations scripts |
| `docs` | Technical, operational, and editorial documentation |

Editable blog-cover masters live in `apps/client/design/blog-covers/v4`; published PNGs live in `apps/client/public/blog/article-covers-v4`.

## Local setup

1. Copy `.env.example` to `.env` and set the required local values.
2. Install the root and nested application dependencies:

   ```powershell
   npm ci
   npm --prefix apps/quantus ci
   npm --prefix apps/powerbi-solutions ci
   ```

3. Start the full development application:

   ```powershell
   npm run dev
   ```

The main site is available at `http://127.0.0.1:5001`.

The treasury dashboards are included by `npm run build` and served by both the development and production server. Their public build includes only `index.html`, `css/`, `js/`, and `data/`; updater scripts and local credentials are not published. The homepage's Treasury trackers section and footer link to all three dashboards.

Token prices refresh directly from public market feeds. Stock closes come from the checked-in `data/market.json` snapshots, refreshed at 22:00 UTC on weekdays by `.github/workflows/update-treasury-market-data.yml`. The optional repository secret `UW_API_KEY` enables Unusual Whales quotes; the update scripts also support Yahoo Finance. See each dashboard's README for manual refresh commands.

## Verification

```powershell
npm run check
npm --prefix apps/quantus run lint
npm --prefix apps/quantus test
npm --prefix apps/powerbi-solutions run lint
npm --prefix apps/powerbi-solutions test
npm run build
npm run check:seo
```

The SEO check validates the prerendered sitemap routes after a build. The CI workflow also runs the Quantus Python tests, dependency audits, encoding and environment scans, and production route smoke tests.

## Generated and local-only folders

The following paths are intentionally excluded from Git and can be regenerated or contain machine-local state:

- `dist/`, nested `dist/` folders, `output/`, and `outputs/`
- `node_modules/` folders
- `data/` runtime databases
- local `.env` files
- local cinematic source videos under `apps/client/public/scroll-world*`
- `archive/local-outputs/` for retained operational artifacts that should not be published

The committed cinematic posters are sufficient for the production homepage. Large source video renders remain local-only.

## Documentation

- [Technical documentation](docs/technical-documentation.md)
- [Blog-cover visual system](docs/blog-cover-style-guide.md)
- [Bonusaki operations](docs/bonusaki/README.md)

Pushes to `main` run validation and deploy the static site through GitHub Pages. Railway uses the same branch for the full production service.
