# BI Solutions blog-cover visual system

Use this guide for every new BI Solutions insight article. It keeps all covers recognisable as one editorial series while still giving each topic its own visual motif.

The editable reference set is in [`apps/client/design/blog-covers/v4`](../apps/client/design/blog-covers/v4). Publication PNGs live in [`apps/client/public/blog/article-covers-v4`](../apps/client/public/blog/article-covers-v4), without a second generated copy beside the SVG masters.

## Non-negotiable format

- Canvas: **1920 x 1080 px** (16:9).
- File formats: publish the PNG; keep the SVG alongside it as the master.
- Background: warm white (`#FAFAFA`) with plenty of open space.
- Header: use the exact article title, left aligned in the upper third.
- Category label: `BI SOLUTIONS INSIGHT` in small uppercase text with a cyan dot.
- Article number: two digits in red at the upper-right, for example `20`.
- Typography: bold, clean sans serif (Arial/Helvetica equivalent), black (`#050505`).
- Title: keep to three lines or fewer. Never abbreviate a title in a way that changes the article’s meaning.

## Visual language

The covers should feel like the supplied reference image: clean flat infographic design, not a stock photograph or a 3D render.

- Main colors: cyan `#5BC2E6`, blue `#579FC9`, red `#F34B3B`, grey `#B8C3C4`, light grey `#D7D7D7`, and black outlines.
- Use bold black outlines, simple geometric forms, charts, reports, nodes, clouds, shields, arrows, and dotted connectors.
- Use one main topic-related illustration in the lower two-thirds, plus a few subtle secondary dots or lines.
- Keep shapes flat: no gradients, photorealism, shadows, logos, watermarking, or decorative text inside the illustration.
- Leave a clear gap between the headline area and the motif. The image must still read cleanly at a small card size.

## Choose a motif that matches the article

| Article subject | Preferred motif |
| --- | --- |
| BI, KPIs, reporting, forecasting | Doughnut/bar/line chart with a report card |
| Semantic models, data relationships | Connected-node network and central data object |
| Requirements, quality, documents | Report/table, checklist, or magnifier |
| Data strategy and roadmaps | Layered blocks, staged roadmap, or connected decision path |
| AI workflows and prompting | Connected flow cards or a simple automation network |
| Governance, policy, privacy | Shield with a tick and a small document |
| Cloud and warehousing | Cloud connected to structured storage blocks |
| Websites and web apps | Browser frame with responsive content blocks |
| Build vs buy | Two balanced panels connected by a dotted decision line |
| MLOps and monitoring | Circular lifecycle or a monitoring line chart |

## Production workflow for a new article

1. Add the new post to the website as usual and decide its sequential article number.
2. Add a row to [`manifest.csv`](../apps/client/design/blog-covers/v4/manifest.csv) with `index`, `title`, `article_url`, `svg_file`, and `png_file`. Use a stable slug-based filename such as `20-new-article-slug.svg` and `20-new-article-slug.png`.
3. In [`script/generate_infographic_covers.py`](../script/generate_infographic_covers.py), append a suitable motif name to `THEMES` in the same order as the manifest. Available values are: `decision`, `semantic`, `requirements`, `foundation`, `ai`, `web`, `kpi`, `quality`, `roadmap`, `governance`, `cloud`, `buildbuy`, `documents`, `prompts`, `forecast`, `literacy`, `mlops`, and `monitoring`.
4. Generate the SVG master and publication PNG:

   ```powershell
   python script/generate_infographic_covers.py `
     apps/client/design/blog-covers/v4/manifest.csv `
     apps/client/design/blog-covers/v4

   python script/render_svg_covers.py `
     apps/client/design/blog-covers/v4 `
     --output-dir apps/client/public/blog/article-covers-v4
   ```

5. Refresh the visual overview:

   ```powershell
   python script/create_cover_contact_sheet.py `
     apps/client/public/blog/article-covers-v4 `
     --manifest apps/client/design/blog-covers/v4/manifest.csv `
     --output output/blog-covers-v4-contact-sheet.png
   ```

6. Review the new cover at 100% size and in the contact sheet before publishing.

## Release checklist

- [ ] Header uses the article’s exact title and is legible at card size.
- [ ] Header stays inside the top third and uses no more than three lines.
- [ ] The visual motif matches the article subject.
- [ ] The palette uses cyan/blue/red/grey with black outlines.
- [ ] PNG is exactly 1920 x 1080 px.
- [ ] SVG master and PNG share the same slug and number.
- [ ] No logos, watermarks, generated text, gradients, or generic stock-photo imagery appear in the cover.
- [ ] The contact sheet remains balanced and visually consistent with the previous covers.

## Avoid

- Reusing the older white-card dashboard template.
- Very large title text that overlaps illustration elements.
- AI-generated text baked into artwork: render all article text as native SVG so it is exact and editable.
- Adding new colors or type styles without applying them consistently across the series.
