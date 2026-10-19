# ego-portfolio

Personal portfolio, deployed to GitHub Pages at
[egoshift.github.io/ego-portfolio](https://egoshift.github.io/ego-portfolio/).

## Versions

The site is a Vite multi-page build. Each version has its own HTML entry point
and its own component tree; everything under `src/` outside `components/` is
shared.

| Version | URL                                | Entry             | Components            |
| ------- | ---------------------------------- | ----------------- | --------------------- |
| v2      | `/ego-portfolio/` (root)           | `index.html`      | `src/components/v2/`  |
| v1      | `/ego-portfolio/v1/`               | `v1/index.html`   | `src/components/v1/`  |

v1 is the macOS-desktop portfolio and is frozen at `/v1/`. v2 has taken over the
root URL: a single non-scrolling screen holding a field of random ASCII that
ripples outward from a tap. The wave lives in `src/components/v2/ascii-ripples.ts`
— that file's header explains how a frame is drawn, and the constants at the top
(speed, band width, wavelength, colours, field density) are the tuning knobs.

## Layout

```
index.html              v2 page (root)
v1/index.html           v1 page
src/
  entries/              one mount script per version
  components/v1/        v1 UI (desktop, dock, windows)
  components/v2/        v2 UI
  contexts/ enums/      shared state
  constants/ utils/     shared data and helpers
  assets/ styles/       shared assets
public/                 static files served from the deploy base
```

Reference `public/` files through `asset()` in `src/utils/asset.ts` — it
prefixes the deploy base so a path resolves the same from `/` and from `/v1/`.
A bare relative path like `me-programmer.png` breaks on the nested v1 page.

## Development

```bash
npm install
npm run dev      # v2 at /ego-portfolio/, v1 at /ego-portfolio/v1/
npm run build
npm run preview
npm run deploy   # builds, then publishes dist/ to the gh-pages branch
```
