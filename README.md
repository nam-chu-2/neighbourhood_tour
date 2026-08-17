# Bells Corners Drive-Through Tour

A short ride-along tour of Bells Corners, the village on Ottawa's west end where I grew
up, built for six co-workers who know only the downtown core.

Six passengers open the site on their phones. It lists the places along one car route in
drive order. As the car reaches a place, a passenger taps **Snap** and photographs it;
the site proposes the next not-yet-found place on the route ("Is this the Bells Corners
sign?"), one tap confirms, and that place's story opens. At the end everyone gets a recap
made of their own photos.

**Zero cost, no server, no accounts, no API keys.** It is a static page. After the first
load it works completely offline for the rest of the drive, and the photos never leave
the passenger's phone.

## Quickstart

```bash
npm install
npx playwright install --with-deps chromium

npm run dev            # http://localhost:5173 — also prints a LAN URL for phones
npm run build && npm run preview   # production build with the service worker
```

Offline behaviour only exists in the built app (`preview`), not in `dev`.

```bash
npm test               # Vitest: unit + component, no network
npm run test:e2e       # Playwright: mobile flows, offline, reduced motion, axe
npm run typecheck && npm run lint
npm run fixtures       # regenerate test photo fixtures
npm run qr -- https://<user>.github.io/neighbourhood_tour/   # qr.png for the deployed URL
```

Full validation walkthrough: [`specs/001-bells-corners-tour/quickstart.md`](specs/001-bells-corners-tour/quickstart.md).

## Writing the tour content

All the personal content — the places, their order, the stories, the "downtown
translation" for each, and the visuals — lives in `src/content/tour.ts`, with images in
`src/content/media/`. See [`src/content/README.md`](src/content/README.md) for what each
field means. `order` must match the real drive order: it is what makes the site's
proposal right without any location or image recognition.

## Deploy

Push to `main`. The workflow in `.github/workflows/pages.yml` builds and publishes to
GitHub Pages. Share the URL as a QR code (`npm run qr`) and ask everyone to open it once
on Wi-Fi before setting off, so the offline cache is warm.

## How it is built

Vite + React + TypeScript, IndexedDB for photos and progress, an SVG schematic route, and
a service worker precache for offline. No map library, no UI framework, no backend.

Specification, plan, and task breakdown: [`specs/001-bells-corners-tour/`](specs/001-bells-corners-tour/).
Project principles: [`.specify/memory/constitution.md`](.specify/memory/constitution.md).
