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
- `images/` - source photography
- `build-images.js` - image preview and deploy build script

Generated folders (`build/`, `dist/`, `node_modules/`) and local backup archives are ignored by Git.
