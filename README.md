# Elie Benchimol Portfolio

Static photography portfolio for Elie Benchimol.

## Commands

```sh
npm install
npm run build
npm run serve:dist
```

`npm run build` generates responsive WebP previews from `images/` into `build/previews/`, then prepares the deployable site in `dist/`.

## Source Structure

- `index.html` - page markup
- `style.css` - layout and visual styling
- `script.js` - gallery navigation and fullscreen interactions
- `images/` - source photography
- `build-images.js` - image preview and deploy build script

Generated folders (`build/`, `dist/`, `node_modules/`) and local backup archives are ignored by Git.
