# Implementation Plan: Bells Corners Drive-Through Tour

**Branch**: `001-bells-corners-tour` | **Date**: 2026-08-17 (rev 2 — zero-cost static) | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-bells-corners-tour/spec.md`

## Summary

A mobile-first, fully static single-page web app that six passengers open on their
phones during a real drive through Bells Corners. It shows an ordered list of places;
the passenger taps one "snap" button and photographs a place; the site proposes the
next not-yet-found place in route order ("Is this the Bells Corners sign?") — one tap
confirms, or they pick a different place — then the place's story opens, the route
animates, and the photo stays on the device. At the end the visitor gets a recap made of
their own photos. **No server, no API, no keys, no runtime cost; works offline after
first load.**

Technical approach: Vite + React + TypeScript static site, IndexedDB for photos and
progress, SVG schematic route, CSS/SVG animation honoring `prefers-reduced-motion`, a
service worker precaching the app so it works offline in the car. Free static hosting
(GitHub Pages or Vercel/Netlify static). Tests: Vitest + Testing Library (unit /
component), Playwright (mobile-viewport e2e, camera input via fixture files, offline
mode).

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 22 LTS (tooling only); browser targets
iOS Safari 16+, Chrome/Android 110+

**Primary Dependencies**: Vite 6, React 19, `idb-keyval` (IndexedDB), `vite-plugin-pwa`
(service worker precache/offline), Vitest, `@testing-library/react`, Playwright,
`@axe-core/playwright`, Ajv (content schema test only). No UI framework, no map library,
no router library (hash routing hook), **no server SDKs**.

**Storage**: Browser IndexedDB via `idb-keyval` — Finds (photo Blob + metadata) and
Progress. Nothing anywhere else.

**Testing**: Vitest (unit + component, jsdom, `fake-indexeddb`), Playwright (e2e on
iPhone 13 / Pixel 5 / Desktop Chrome, `setInputFiles` fixtures for the camera,
`context.setOffline(true)` for offline, `emulateMedia` for reduced motion), axe scans.

**Target Platform**: Mobile web (portrait ≥360 px) first; responsive to desktop. Static
hosting: GitHub Pages (free, `gh-pages` branch via CI) — Vercel/Netlify static equally fine.
Local dev via `npm run dev` (LAN host for phones).

**Project Type**: Static web application (single package, no backend).

**Performance Goals**: First usable paint ≤3 s on mid-range phone/4G (initial JS ≤150 kB
gzip, images lazy/responsive); snap → proposal → confirm → detail under 1 s with no
network; route animation ≤1 s.

**Constraints**: Fully offline after first load (service worker precache of app shell,
content and media); no secrets anywhere; photos never leave device;
`prefers-reduced-motion` respected; keyboard/screen-reader operable; camera-denied path
(no-photo find).

**Scale/Scope**: 6 users, 6–10 places, ~6 screens/states (welcome, list/route, snap
sheet [proposal | pick | camera-unavailable], place detail, recap). Cost: $0.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence / notes |
|---|---|---|
| I. Spec-Driven Delivery | PASS | spec.md rev 2 (clarification: no runtime AI) drives FR-001…FR-015; plan traces to them. |
| II. Simplicity & YAGNI | PASS | Single static package; dropped the serverless function, SDK, zod, contract tests. Only added dep is `vite-plugin-pwa` (justified: FR-012 offline). |
| III. Test-First (NON-NEGOTIABLE) | PASS | Per-story failing tests first: Vitest for `tourState`/proposal rule/storage/downscale/recap; Playwright for US1–US3 incl. offline, camera-denied, reduced motion, a11y. |
| IV. Clarity & Accessibility | PASS | Mobile-first, ≥44 px targets, high-contrast tokens, reduced-motion, alt text, `aria-live`, keyboard paths; graceful camera-denied and offline (FR-005, FR-012). |
| V. Observability & Data Stewardship | PASS | No server → no server logs; client keeps a small in-memory debug log ring (last 50 events) exposed via `?debug=1` panel for the rehearsal; no personal data collected; photos on-device only; no secrets. |
| Technical Constraints: external boundary | PASS (n/a) | No external services at runtime. Camera + storage wrapped in small modules with fakes for tests. |
| Technical Constraints: runnable from clone | PASS | quickstart.md documents install/dev/test/deploy; README added in tasks. |
| Workflow: feature branch, gates | PASS | Work on `001-bells-corners-tour`; re-check below. |

**Post-Phase-1 re-check (2026-08-17)**: Design has one runtime (browser), one dependency
added for offline; data model entirely client-side; contracts reduced to the content
schema. Gate PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-bells-corners-tour/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── tour-content.schema.json   # Shape of the authored tour content (only contract)
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── main.tsx                 # bootstrap + service worker registration
├── App.tsx                  # hash-route switch: welcome | tour | place/:id | recap
├── router.ts                # useHashRoute(), navigate()
├── TourProvider.tsx         # context: state + dispatch, hydrate/persist, snap() orchestration
├── content/
│   ├── tour.ts              # authored Tour + Place data (typed by contracts/tour-content)
│   ├── README.md            # what the author fills in
│   └── media/               # optimized place visuals
├── domain/
│   ├── types.ts             # Tour, Place, Media, Find, Progress, SnapPhase
│   ├── tourState.ts         # pure reducer + selectors (proposal rule FR-003a, undo, complete)
│   ├── proposal.ts          # nextProposedPlace(tour, finds)
│   └── readability.ts       # canRead(place, state, route)  (US3)
├── storage/
│   └── findStore.ts         # idb-keyval persistence of finds/progress/photos
├── camera/
│   ├── capture.ts           # file-input capture, permission/error mapping
│   └── downscale.ts         # canvas resize → JPEG blob ≤1024px (EXIF-orientation aware)
├── recap/
│   └── composeRecap.ts      # canvas grid → JPEG Blob (US2)
├── ui/
│   ├── Welcome.tsx
│   ├── TourScreen.tsx       # progress, RouteMap, list, Snap button, mounts SnapSheet
│   ├── RouteMap.tsx         # SVG schematic route, found/next/remaining, animation
│   ├── SnapSheet.tsx        # proposal (photo + "Yes, that's it" / "Pick a different place" / "Retake") | pick list | camera-unavailable
│   ├── PlaceDetail.tsx      # readable / locked variants, undo, share
│   ├── Recap.tsx
│   ├── DebugPanel.tsx       # ?debug=1 event ring
│   ├── useReducedMotion.ts
│   └── a11y/                # LiveRegion, focus helpers
└── styles/                  # tokens.css, global.css, motion.css

tests/
├── setup.ts
├── fixtures/places/         # <place-id>-1.jpg per placeholder place, none-1.jpg
├── unit/                    # tourState, proposal, findStore, downscale, router, readability, composeRecap, tourContent, RouteMap
└── e2e/                     # us1-snap-flow, us1-fallbacks-offline, us2-delight-recap, us3-revisit-deeplink, a11y, perf

scripts/
├── make-fixtures.ts         # generates test fixture JPEGs
└── qr.ts                    # QR code PNG for the production URL
```

**Structure Decision**: One static Vite package. No `api/` or `shared/` directories.
Deploy = `vite build` → `dist/` to static hosting.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| `vite-plugin-pwa` (service worker) | FR-012 requires the whole drive to work offline after first load; a precached app shell + content is the standard way. | Relying on HTTP cache alone is unreliable on iOS/Android for a 30-min drive with signal drop-outs; hand-writing a service worker is more code and more risk than the plugin's generated precache manifest. |
| `idb-keyval` (~600 B) | Photos are Blobs; `localStorage` cannot hold them. | Raw IndexedDB adds ~100 lines of boilerplate for the same result. |
