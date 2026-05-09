# AGENTS.md

## Project

Static photography portfolio for Elie Benchimol. Keep the architecture simple: plain HTML, CSS, and JavaScript. Do not introduce a frontend framework for routine edits.

## Commands

- Check JavaScript syntax with `node --check script.js`.
- Build previews and `dist/` with `npm run build`.
- Serve locally with `npm run serve`.

## Category Rules

Visible labels map to internal keys:

- `personas` -> `portraits`
- `formes` -> `views`
- `too close` -> `details`

The `data-category` values in `index.html` must match keys in `portfolio-data.js`.

When adding or renaming a category, update all of these together:

- the entry buttons, `.entry-nav-item`, in `index.html`
- the top menu buttons, `.category-item`, in `index.html`
- the matching category data in `portfolio-data.js`

The top menu `.category-item` buttons are the source of truth for navigation order and visible labels in `script.js`.

## UI Rules

- Category underline belongs only to `.category-item.is-active`.
- Do not re-enable underline on hover or focus; hover should only change color. This avoids white underline flicker during category changes.
- Keep `no-card-intro` on the first render after leaving the welcome screen. It prevents the portfolio grid from jumping while the welcome overlay fades out.
- Keep the fullscreen high-res viewer as a horizontal filmstrip on desktop and mobile. On desktop, vertical wheel input should map continuously to horizontal scrolling, without wheel locks or forced image-by-image jumps.
- `entry-mode` controls the welcome screen.
- `mobile-layout` is set by `script.js` from viewport and pointer checks.

## Code Rules

- Always look for chances to simplify and reduce code while working. Prefer smaller, clearer, more browser-friendly implementations that use less memory, less disk, and less runtime work.
- Treat loading time as a priority in every change. Avoid unnecessary assets, dependencies, DOM nodes, CSS rules, image variants, and JavaScript work.
- Reuse the category helpers in `script.js` instead of duplicating category state changes.
- Keep styling in `style.css`, data in `portfolio-data.js`, and interactions in `script.js`.
- Preserve existing generated paths under `build/previews/` and `dist/`; run the build script instead of editing generated image manifests by hand.
- After JavaScript changes, run `node --check script.js`.
