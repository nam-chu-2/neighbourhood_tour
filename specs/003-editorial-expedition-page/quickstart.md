# Quickstart & Validation: Bells Corners — The Expedition Page

**Feature**: `003-editorial-expedition-page` · **Date**: 2026-08-21

How to run the page from a fresh clone and how to prove each user story works. Details live
elsewhere: content shape in
[contracts/expedition-content.schema.json](contracts/expedition-content.schema.json),
observable structure in [contracts/page-ui.contract.md](contracts/page-ui.contract.md),
entities in [data-model.md](data-model.md).

## Prerequisites

- Node.js 22 LTS or newer (`node -v`)
- A phone on the same Wi-Fi is recommended — this is a page read on a phone, and a desktop
  window will not tell you whether the photographs land
- No API keys, accounts, or services. There is no backend (FR-018).

## Setup

```bash
npm install
npx playwright install chromium   # first time only, for e2e
```

## Run it

```bash
npm run dev            # Vite dev server, printed on both localhost and the LAN URL
npm run build && npm run preview   # production build, incl. service worker (offline)
```

The service worker only exists in a real build, so **offline behaviour must be validated
against `preview`, not `dev`**.

## Checks

```bash
npm test           # Vitest: content schema, scrim contrast, reveal logic, image manifest
npm run test:e2e   # Playwright on iPhone 13 / Pixel 5 / Desktop Chrome
npm run typecheck
npm run lint
```

## Adding photographs

```bash
npm run images     # sharp → 640/1280/1920 × AVIF/WebP/JPEG + src/content/images.generated.ts
```

Drop source photographs into `src/content/media/`, reference them from
`src/content/expedition.ts`, and run `npm run images`. The script writes every variant and
records intrinsic dimensions into the generated manifest, which is what stops the page
shifting as images load. **It fails the build if a variant exceeds 400 kB** — that is the
guardrail against dropping in an 8 MB phone photograph.

Commit the generated manifest and variants: a fresh clone must build without running the
script.

## Authoring the content

Everything a reader sees is in `src/content/expedition.ts` — see
[`src/content/README.md`](../../src/content/README.md).

- `title`, `dek`, `heroImage` — the opening
- `facts` — duration, distance, number of stops
- `overview` — how you'd explain Bells Corners to someone who only knows the core
- `stops` — seven entries: headline, images, story, optional downtown translation
- `closing`, `credits`

`npm test` is the authoring guardrail: it fails on a duplicate or non-slug stop id,
out-of-order numbering, a missing `alt` or `credit`, a missing duration/distance/stops fact,
an empty story, or an image with no manifest entry.

---

## Validating the user stories

### US1 — Read the expedition (P1)

```bash
npm run dev            # then open the LAN URL on a phone
npm run test:e2e -- us1-read
```

Expected:

1. A full-bleed photograph fills the screen with the title legible over it; no horizontal
   scrolling at 360 px (FR-001, FR-010).
2. Scrolling meets, in order: facts, overview, route, stops 1–7, closing, credits (FR-002 …
   FR-007).
3. Each stop shows its number, headline, image with alternative text, story, and the
   downtown translation where authored (FR-005, FR-006).
4. The page adapts to tablet, desktop and landscape without losing content (FR-010).
5. Nothing asks the reader to act: no progress, no unlocking, no sound (FR-008, FR-009).

### US2 — Be wowed by the craft (P2)

```bash
npm run test:e2e -- us2-craft
npm run test:e2e -- perf
```

Expected:

1. Sections settle into place as they enter view and are readable within about half a
   second (FR-011).
2. The route draws itself when scrolled into view, and is announced as decorative (FR-004).
3. With `emulateMedia({ reducedMotion: "reduce" })`: no scroll-triggered motion, every
   section in its finished state, nothing missing (FR-012).
4. Hero readable within 3 s over throttled 4G; scrolling stays smooth; the page does not
   shift as images arrive (SC-001, SC-003).
5. Text over imagery clears the contrast floor against the worst case the scrim allows
   (FR-013, SC-005).

### US3 — Find a stop and pass it on (P3)

```bash
npm run test:e2e -- us3-navigate-share
```

Expected:

1. Opening `#our-lady-of-peace` lands on that stop, clear of the top edge, with the page around it
   (FR-014).
2. On a desktop viewport the stop navigation marks the current stop while scrolling
   (FR-015).
3. The share control offers to share or copy the link (FR-016).
4. An unknown anchor loads the page at the top and reads normally (FR-022).

### The failure modes that matter most

```bash
npm run build && npm run preview
npm run test:e2e -- no-js
npm run test:e2e -- offline
npm run test:e2e -- a11y
```

Expected:

1. **With JavaScript disabled**: every section and every word of story text is present
   (FR-021). This is the test that keeps the reveal animation from ever being able to blank
   the page.
2. **Offline after first load**: the whole page and its imagery still render, no error page
   (FR-017, SC-007).
3. **Images blocked**: headlines, stories and facts still read; the layout holds (FR-021).
4. axe reports no violations on the full page; headings never skip a level; the route is
   marked decorative (FR-019, SC-006).

### The manual check no test can make

Read it on a phone, in daylight, on mobile data, with the real photographs in place. An
expedition page lives or dies on whether the pictures feel worth the scale they are given —
if it reads as a template with photos dropped in, the format has failed regardless of what
the suite says (SC-008, SC-009).

## Deploy

Push to `main`; `.github/workflows/pages.yml` builds and publishes to GitHub Pages. The
project-path build uses `VITE_BASE=/neighbourhood_tour/`. `npm run qr` writes a QR code for
the published URL.
