# Bells Corners — An Expedition

A short tour of Bells Corners, the village on Ottawa's west end where I grew up, built for
six co-workers who know only the downtown core.

It is an expedition brochure for a place nobody would think to run an expedition to: a
full-bleed opening photograph, a strip of facts, an overview, a drawn route, and then seven
numbered stops, each with its own headline, photograph and story. The format says *far side
of the world*; the content says *the plaza where I spent my allowance*. It is played
straight, because that is the joke and also the point.

There is nothing to do but read it. No progress, no unlocking, no sound.

**Zero cost, no server, no accounts, no API keys.** After the first load it works
completely offline, and nothing about a visitor ever leaves their device — no storage, no
identifiers, no analytics, and not a single request to another origin.

## Quickstart

```bash
npm install
npx playwright install chromium

npm run dev                        # http://localhost:5173 — also prints a LAN URL
npm run build && npm run preview   # production build, with prerendering and offline
```

Read it on a phone. This is a page about photographs at scale; a desktop window will not
tell you whether it lands.

Offline behaviour and the prerendered HTML only exist in a real build, never in `dev`.

```bash
npm test           # Vitest: scrim contrast, reveal logic, content schema, image manifest
npm run test:e2e   # Playwright: reading, craft, navigation, no-JS, offline, axe, budgets
npm run images     # regenerate photograph variants after adding or replacing one
npm run typecheck
npm run lint
```

## Making it yours

Everything a reader sees is in `src/content/` — see
[`src/content/README.md`](src/content/README.md) for the details.

The one thing worth saying twice: **the page is mostly photography.** With the stand-in
images it looks like a template, because it is one. Real photographs of the seven places are
what make the format work.

## How it works

**React never reaches the browser.** The page is rendered to HTML at build time and shipped
as a finished document; what the browser downloads is about two kilobytes of enhancement —
the scroll reveals, the current-stop highlight, and the share button. With JavaScript
disabled the whole expedition is still there, which a test in `tests/e2e/no-js.spec.ts`
enforces on every run.

Everything is finished by default and the animation can only ever *add* to it. That is
inverted from the usual pattern, deliberately: on a page that is nothing but content, the
worst possible failure is a blank screen.

**Text over photographs** sits on a scrim whose contrast is proven against pure white and
pure black — so it holds over any photograph, including ones not taken yet
(`tests/unit/scrim.test.ts`).

**Photographs** are generated at build time into three widths and three formats, with their
intrinsic dimensions recorded, so the page never shifts as they load. No variant may exceed
400 kB; the build fails if one does.

**The display serif** (Fraunces, SIL Open Font License — licence committed at
`public/fonts/Fraunces-OFL.txt`) is served from this site's own assets, which is what keeps
the page working offline and free of external requests.

## Deploying

Push to `main`; `.github/workflows/pages.yml` builds and publishes to GitHub Pages. A
project-path build uses `VITE_BASE=/neighbourhood_tour/`. `npm run qr` writes a QR code for
the published URL.

## Documentation

- Specification: [`specs/003-editorial-expedition-page/spec.md`](specs/003-editorial-expedition-page/spec.md)
- Plan, research, data model: [`specs/003-editorial-expedition-page/`](specs/003-editorial-expedition-page/)
- What the page promises:
  [`contracts/page-ui.contract.md`](specs/003-editorial-expedition-page/contracts/page-ui.contract.md)

Two earlier versions of this tour are superseded: a photograph-to-unlock ride-along
(`specs/001-bells-corners-tour/`) and a tactile radio dial
(`specs/002-radio-dial-tour/`, implemented at commit `cab485a`). Both remain in git history.
