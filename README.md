# Elie Benchimol Portfolio

Static photography portfolio for Elie Benchimol.

## Commands

```sh
npm install
npm run build
npm run serve:dist
```

`npm run build` generates responsive WebP previews from `images/` into `build/previews/`, then prepares the deployable site in `dist/`.

## Deploying

This repo is set up for GitHub Pages via GitHub Actions.

1. Push the repository to GitHub.
2. In the repo settings, enable Pages from GitHub Actions.
3. Let the `Deploy to GitHub Pages` workflow publish `dist/` on every push to `master`.

For a custom domain, use one canonical host and let GitHub Pages redirect the other:

1. Recommended canonical: `www.yourdomain.com`
2. Add that custom domain in GitHub Pages settings
3. Point `www.yourdomain.com` with a `CNAME` record to your Pages default domain, usually `<user>.github.io`
4. Point the apex domain with the GitHub Pages `A` records

GitHub Pages supports both apex and `www` domains and redirects between them when DNS is configured correctly. If you prefer the apex as canonical, GitHub Pages can do that too.

## Source Structure

- `index.html` - page markup
- `style.css` - layout and visual styling
- `script.js` - gallery navigation and fullscreen interactions
- `AGENTS.md` - working rules for future coding agents
- `images/` - source photography
- `build-images.js` - image preview and deploy build script

Generated folders (`build/`, `dist/`, `node_modules/`) and local backup archives are ignored by Git.

## Maintenance Notes

The site is static. Most changes happen in three files:

- `portfolio-data.js` is the content source. It defines categories, sets, and the manual contact-sheet layouts.
- `index.html` contains the visible category buttons. The `data-category` values must match keys in `portfolio-data.js`.
- `script.js` reads those buttons to decide category order, active labels, keyboard navigation, mobile navigation, and high-resolution image opening.

### Categories

Visible label -> internal key:

- `personas` -> `portraits`
- `formes` -> `views`
- `too close` -> `details`

When adding or renaming a category, update both the entry buttons and the top menu buttons in `index.html`, then add the same key in `portfolio-data.js`. The current JS derives category order and labels from `.category-item`, so the top menu is the source of truth for navigation order.

### Navigation Model

- Desktop renders one category at a time as vertical set cards.
- Mobile renders the active category as a vertical feed of sets; horizontal swipes switch categories.
- The welcome screen is an overlay controlled by the `entry-mode` body class.
- The first render after leaving the welcome screen uses `no-card-intro` so the portfolio does not jump while the overlay fades out.
- The fullscreen image viewer is built from `.high-res-image-strip`; desktop and mobile both use a horizontal filmstrip. Desktop wheel-down/wheel-up maps continuously to horizontal scrolling.

### Styling Notes

- Category underline is only for `.category-item.is-active`; hover changes color only. This prevents the white underline flicker when switching categories.
- Mobile layout is controlled by the `mobile-layout` body class, set in `script.js` from viewport width and pointer type.
- Generated previews are cache-busted by `PREVIEW_CACHE_BUST` in `script.js`; bump it after rebuilding images if browsers keep stale previews.
