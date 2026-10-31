# Project interface assets

Real screenshots captured from the public project URLs on 31 October 2026. The capture source, final URL, page title, HTTP status and time are recorded in `manifest.json`.

Each project directory has three optimised WebP files:

- `cover.webp`: 1440 × 810, for detail pages and large cards.
- `800.webp`: 800 × 450, selected through responsive `srcset`.
- `social.webp`: 1200 × 630, a stable URL for Open Graph and social sharing.

The browser frame is applied to an actual screenshot. No generated or imagined interface is used. Raw PNG captures and the full read-only audit are local build evidence in `output/portfolio/`, outside the published asset tree.

To refresh: install Playwright and Pillow in the authoring environment, run `node script/capture-portfolio-assets.mjs`, visually inspect `output/portfolio/raw`, then run `python script/build-portfolio-assets.py`. These authoring tools are not required to build or run the website.
