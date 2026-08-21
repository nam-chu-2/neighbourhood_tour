# Quickstart & Validation: Bells Corners Radio — Tune the Dial

**Feature**: `002-radio-dial-tour` · **Date**: 2026-08-20

How to run the site from a fresh clone and how to prove each user story actually works.
Details live elsewhere: content shape in
[contracts/broadcast-content.schema.json](contracts/broadcast-content.schema.json),
observable behaviour in [contracts/dial-ui.contract.md](contracts/dial-ui.contract.md),
entities and state transitions in [data-model.md](data-model.md).

## Prerequisites

- Node.js 22 LTS or newer (`node -v`)
- A modern browser; a phone on the same Wi-Fi is strongly recommended — this is a
  thumb-driven interface and the desktop experience does not tell you whether it feels
  right
- No API keys, accounts, or services. There is no backend (FR-020).

## Setup

```bash
npm install
npx playwright install chromium   # first time only, for e2e
```

## Run it

```bash
npm run dev            # Vite dev server, printed on both localhost and the LAN URL
```

Open the **LAN URL** on a phone (`http://<your-ip>:5173`). Drag the band with a thumb.

```bash
npm run build && npm run preview   # production build, incl. service worker (offline)
```

The service worker is only active in a real build, so **offline behaviour must be validated
against `preview`, not `dev`**.

## Checks

```bash
npm test           # Vitest: band maths, tuning reducer, palette contrast, storage,
                   # keepsake, router, content schema
npm run test:e2e   # Playwright on iPhone 13 / Pixel 5 / Desktop Chrome
npm run typecheck  # tsc --noEmit
npm run lint       # eslint, incl. jsx-a11y
```

## Authoring the content

Everything the author writes lives in `src/content/`:

- `broadcast.ts` — the stations: name, frequency, memory, downtown translation, visuals.
  Frequencies must increase in the order the places occur along the road, with at least
  `0.4` between neighbours.
- `palette.ts` — the four-to-six palette stops the band travels through (dawn → neon).
- `media/` — the visuals. Every one needs a meaningful `alt`.

`npm test` fails loudly on a content mistake — a duplicate id, an out-of-order frequency,
stations too close together, a missing `alt`, or a palette stop that drops below 4.5:1
contrast. Treat that suite as the authoring guardrail.

---

## Validating the user stories

Each block is runnable end to end and maps to one story in [spec.md](spec.md).

### US1 — Tune the dial and receive the stations (P1)

```bash
npm run dev            # then open the LAN URL on a phone
npm run test:e2e -- us1-tuning
```

Expected:

1. The dial fills the screen with the needle at centre, one instruction, and no page-level
   horizontal scrolling at 360 px (FR-001, FR-016).
2. Dragging moves the needle with the thumb; releasing mid-drag carries it on and settles
   it (FR-002, FR-003).
3. Between stations: visible noise, an off-station text line, and no readable story
   (FR-005).
4. Settling near a station clears the noise and opens its broadcast — name, hero visual,
   memory, downtown translation — with no extra tap (FR-006, FR-007).
5. Received marks look different from unreceived ones and say so to a screen reader;
   "n of m received" is always visible (FR-008).
6. Flicking hard past a station leaves it unreceived; tuning back to it opens it (FR-009).
7. `Tab` to the band, then `←`/`→`: each focused station locks in immediately; `#/guide`
   lists every station and opens any of them (FR-010, FR-021).

### US2 — Analog feel, punch, and the sign-off (P2)

```bash
npm run test:e2e -- us2-delight-signoff
npm run test:e2e -- perf
```

Expected:

1. A hard flick travels and settles smoothly; a full sweep of the band drops no frames
   (SC-003).
2. The palette visibly changes from one end of the band to the other (FR-011).
3. A station is fully readable within 1 s of settling (SC-004).
4. With `emulateMedia({ reducedMotion: "reduce" })`: no animated noise, instant station
   changes, the stepper is present, and every station is still reachable (FR-015).
5. Sound is off on load and no `AudioContext` exists until the toggle is tapped; toggling
   works both ways; every assertion in the suite holds with sound off (FR-014, SC-007).
6. Receiving the last station makes the sign-off available and it names what was received
   (FR-012).

### US3 — Keep it and pass it on (P3)

```bash
npm run test:e2e -- us3-keepsake-deeplink
```

Expected:

1. The sign-off renders the keepsake card on screen and offers to save or share it; the
   card lists the stations in dial order (FR-013).
2. Reloading the page keeps received stations lit (FR-017).
3. Opening `#/station/<id>` on a fresh browser context lands directly on that station with
   the dial around it (FR-018).

### Fallbacks, offline, and accessibility

```bash
npm run build && npm run preview
npm run test:e2e -- fallbacks-offline
npm run test:e2e -- a11y
```

Expected:

1. With `context.setOffline(true)` after first load: tuning, every station, the sign-off,
   and the keepsake all still work, and no error page appears (FR-019, SC-008).
2. With storage made to throw (private-browsing simulation): the tour runs normally and
   only persistence is lost — no error screen (FR-017, FR-023).
3. With Web Audio unavailable: the toggle explains it once and the tour continues
   (FR-023).
4. axe reports no violations on the dial, a broadcast, the guide, the sign-off, and the
   keepsake; contrast holds across the palette (FR-021, SC-006).

### Manual check that no test can make for you

Take the tour on a phone, one-handed, outdoors in daylight, with the volume off. It should
feel like an object. If the dial feels like a web page, the mechanic has failed regardless
of what the suite says (SC-002, SC-005, SC-009).

## Deploy

Push to `main`; `.github/workflows/pages.yml` builds and publishes to GitHub Pages. The
project-path build uses `VITE_BASE=/neighbourhood_tour/`. Generate a QR code for the
published URL with `npm run qr` — the fastest way to get six phones onto the same link.
