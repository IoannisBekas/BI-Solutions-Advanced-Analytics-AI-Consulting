# BI Solutions Group design system

The main public website uses the existing monochrome identity, warm paper backgrounds, and red editorial accent. Shared definitions live in `apps/client/src/index.css`; page components select roles instead of introducing their own heading scales and panel styles.

## Layout and reading widths

- `.site-container` owns both the maximum width (90rem) and fluid horizontal gutters (20–48px). Do not add a second padded wrapper or page-specific horizontal padding to it.
- `.page-main` / `.page-top` reserve space for the fixed navigation. `.section-space`, `.section-gap`, and `.section-stack` use one fluid 56–96px section rhythm.
- `.card-grid` fits columns of at least 20rem where space allows, with a shared 20–32px gap. The two-column case-study grid supports larger dashboard previews.
- `.reading-width` limits explanatory copy to 72ch. `.reading-panel` limits long articles and legal documents to 64rem. A wide panel does not require a full-width paragraph.

## Typography

| Role | Class | Size | Line height |
| --- | --- | --- | --- |
| Page heading | `.page-title` | Fluid 36–72px | 1.12 |
| Section heading | `.section-title` | Fluid 28–44px | 1.2 |
| Card heading | `.card-title` | Fluid 20–24px | 1.3 |
| Article subheading | `.article-heading` | Fluid 22–28px | 1.3 |
| Introduction | `.body-lead` | Fluid 17–20px | 1.65 |
| Body copy | Body / `text-base` | 16px | 1.65 |

Headings use Plus Jakarta Sans with an explicit Inter fallback for Greek glyphs; body copy uses Inter. The font request includes the bold weights used by Greek headings. Resource heroes share the page-heading scale; the cinematic homepage has its own display treatment. Headings wrap safely without depending on forced hyphenation.

## Surfaces, actions, and fields

- `.content-panel`: 32px radius, shared border, fluid 20–48px padding, and the panel shadow token. Use `p-0` for a panel whose media or internal sections own the padding.
- `.surface-card` / `Card`: 24px radius and the card shadow token. `.card-padding` supplies fluid 20–28px insets. `.surface-card--interactive` shares hover and keyboard-focus styling and respects reduced motion.
- `Button` uses pill shapes, real semantic border colors, text wrapping, and a minimum 44px height (48px for the large size). Icon buttons remain 44px square.
- `.form-control` / `Input`: 48px minimum height, 16px text, a common radius and border, and a visible focus outline. Search inputs retain their pill variant.
- Dark surfaces use explicit dark variants while sharing the same spacing and radius rules.

Review cards use two columns on tablets and three on large screens. On mobile, `CarouselContent` accepts a viewport style so the reviews section can measure the active slide with `ResizeObserver`. Navigation sits below the cards and a short review does not reserve the height of the longest review.

The projects catalogue defaults to compact thumbnail cards, with a switch to detailed cards. `ProjectCard` and `CaseStudyCard` share an optional `compact` variant; related-project cards elsewhere keep their detailed layout. Catalogue headings and spacing become denser in compact mode. The sticky toolbar provides search, a result count, and view controls; mobile category navigation uses a select. All entries, full summary text, detail links, category links, and collection metadata remain in the initial HTML. Run `node script/projects-browser-qa.mjs` to check both views, filtering, search, responsive navigation, and preserved links.

The services catalogue shares the toolbar styling and accent-insensitive search helper. Its six service pillars and delivery-options section use native `details` / `summary` controls, collapsed by default, with a global detailed view. Full content is prerendered and remains available without JavaScript. Preserve each service/capability anchor: fragment navigation reveals the parent section before scrolling to it. `node script/services-browser-qa.mjs` verifies the two views, keyboard interaction, search, preserved copy/metadata, and every direct anchor; use `--no-js` against an artifact server to test native expansion before hydration.

## Verification and review

Run `npm run check`, `npm run build`, and `npm run check:seo` after changing the shared styles.

The browser checks use the public React route inventory and save evidence under ignored `output/playwright/design-system/`:

```powershell
node script/design-system-browser-qa.mjs --before --full
# Apply changes, then compare content, links, metadata, schema, and layout.
node script/design-system-browser-qa.mjs --full
node script/design-system-browser-qa.mjs --edges
node script/design-system-interactions-qa.mjs
```

The regular matrix covers 390px, 768px, and 1440px; the edge matrix covers 320px, 1024px, and 1920px. Screenshots include Greek project heroes, services, the founder profile, forms, resource pages, and reviews. Interaction checks exercise every review slide, project navigation and filtering, article search, email-field validity/focus, and the AI learning finder without sending enquiries or email requests. Publication remains a separate action requiring the user's approval.
