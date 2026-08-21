# Implementation Plan: Bells Corners Radio — Tune the Dial

**Branch**: `002-radio-dial-tour` | **Date**: 2026-08-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-radio-dial-tour/spec.md`

## Summary

A mobile-first, fully static single-page site that presents Bells Corners as an analog car
radio. The whole screen is one instrument: a frequency **band** the visitor drags with a
thumb, with a needle fixed at centre. Between stations the screen is **static**; when the
needle settles on a station the noise resolves and that place's **broadcast** fills the
screen — name, visual, first-person memory, downtown translation. Received stations stay
lit on the dial, which doubles as progress, route, and table of contents. The palette
travels from dawn to neon across the band. Receiving the last station triggers a sign-off
and a keepsake card.

Technical approach: the band is a **native scroll container with proximity scroll-snap**, so
momentum and thumb-tracking are the compositor's job, not JavaScript's (research R1). A
single rAF-throttled scroll listener writes two CSS custom properties — `--tune` and
`--detune` — and React re-renders **only** on lock-in, never per frame (R4). Static is
composited noise layers driven by those variables (R3); the palette is `color-mix()` in
`oklab` across authored, contrast-tested stops (R5); optional sound is synthesised with Web
Audio, off by default, with mandatory silent parity (R6). Progress is a short list of ids
in `localStorage`, which lets 001's `idb-keyval` dependency be removed (R7). The keepsake is
canvas-rendered to PNG with share/download fallbacks (R8). Offline precaching and the hash
router carry over from 001 (R9, R11). **No server, no API keys, no runtime cost.**

This plan supersedes `specs/001-bells-corners-tour/plan.md`; the map, camera, and
photo-recap code it produced is deleted, not parked (R13).

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 22 LTS (tooling only); browser targets iOS
Safari 16+, Chrome/Android 110+ — unchanged from 001.

**Primary Dependencies**: Vite 6, React 19, `vite-plugin-pwa` (offline precache), Vitest,
`@testing-library/react`, Playwright, `@axe-core/playwright`, Ajv (content schema test
only). **Removed: `idb-keyval`** (R7). No map library, no gesture/animation library, no
audio assets, no router library, no server SDKs.

**Storage**: `localStorage` — received station ids + timestamps + the sound preference.
Nothing else, nowhere else (FR-017, FR-022).

**Testing**: Vitest (unit + component, jsdom) for band maths, lock-in reducer, palette
contrast, persistence, keepsake composition, content schema, router; Playwright (iPhone 13
/ Pixel 5 / Desktop Chrome) for tuning, reception, sign-off, deep links, offline
(`context.setOffline(true)`), reduced motion and silent parity (`emulateMedia`), plus axe
scans.

**Target Platform**: Mobile web (portrait ≥360 px) first, responsive to tablet, desktop, and
landscape. Static hosting on GitHub Pages via the existing CI workflow.

**Project Type**: Static web application (single package, no backend).

**Performance Goals**: Dial interactive ≤3 s on a mid-range phone over 4G (SC-001); needle
tracks input ≤100 ms with no dropped-frame stutter across a full sweep (SC-003); station
readable ≤1 s after settling (SC-004). Budget: initial JS ≤150 kB gzip, noise texture
≤8 kB, zero per-frame React renders while tuning.

**Constraints**: Fully offline after first load (FR-019); no secrets, no external calls at
runtime (FR-020); nothing about the visitor leaves the device (FR-022);
`prefers-reduced-motion` honoured with a discrete stepper (FR-015); complete by keyboard and
screen reader (FR-021); complete in silence (FR-014); contrast ≥4.5:1 at every point of the
travelling palette (FR-021, SC-006).

**Scale/Scope**: 6 visitors, 6–10 stations, ~5 screens/states (dial + off-station, dial +
broadcast, station guide, sign-off, keepsake). Cost: $0.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence / notes |
| --- | --- | --- |
| I. Spec-Driven Delivery | PASS | Every element below traces to FR-001…FR-023 in spec.md, which explicitly supersedes 001. Superseded mechanics are deleted so no code remains without a requirement (R13). |
| II. Simplicity & YAGNI | PASS | Single static package. The pivot **removes** a dependency (`idb-keyval`, R7) and adds none: tuning uses the platform scroller rather than a gesture library (R1), sound is synthesised rather than shipped (R6), palette travel is CSS rather than JS (R5). Only carried complexity is `vite-plugin-pwa`, justified below. |
| III. Test-First (NON-NEGOTIABLE) | PASS | The mechanic is deliberately factored so its logic is pure and testable first: band layout, nearest-station/detune maths, and the lock-in reducer are pure functions (R12). Per-story failing tests precede implementation; e2e covers US1–US3 including offline, reduced motion, silent parity, and a11y. |
| IV. Clarity & Accessibility | PASS | Mobile-first, ≥44 px targets, contrast floor enforced by a unit test across every palette stop (R5), reduced-motion stepper (R10), always-available station guide (FR-010), `aria-live` announcements on lock-in, alt text on every visual, plain-language errors that leave the tour usable (FR-023). Off-station state has a text equivalent so it is not conveyed by noise alone. |
| V. Observability & Data Stewardship | PASS | No server → no server logs; the client keeps the in-memory debug ring from 001 behind `?debug=1`, extended with tuning events (lock-in, reception, storage failure). No personal data of any kind is collected — the pivot removes photos and the spec forbids location (FR-022). No secrets. |
| Technical Constraints: external boundary | PASS (n/a) | Nothing external at runtime (FR-020). Browser capabilities that can be absent — storage, Web Audio, Web Share — are each behind a thin wrapper with a working fallback, so tests run without them. |
| Technical Constraints: runnable from clone | PASS | quickstart.md documents install / dev / test / build / deploy; README updated during implementation. |
| Technical Constraints: measurable perf | PASS | SC-001/003/004 are stated in the spec and asserted in `tests/e2e/perf.spec.ts` plus the bundle-size budget. |
| Workflow: feature branch, gates | PASS | Work happens on `002-radio-dial-tour`; post-design re-check below. |

**Post-Phase-1 re-check (2026-08-20)**: The design produced one runtime (the browser), one
data store (`localStorage`), one authored content module, and two contracts (content schema
and the dial's UI contract). Phase 1 removed a dependency and introduced none. No principle
is violated; the single carried complexity is recorded in Complexity Tracking. **Gate
PASS.**

## Project Structure

### Documentation (this feature)

```text
specs/002-radio-dial-tour/
├── plan.md                              # This file
├── research.md                          # Phase 0 output
├── data-model.md                        # Phase 1 output
├── quickstart.md                        # Phase 1 output
├── contracts/
│   ├── broadcast-content.schema.json    # Shape of the authored tour content
│   └── dial-ui.contract.md              # The dial's observable behaviour + a11y contract
├── checklists/
│   └── requirements.md
└── tasks.md                             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── main.tsx                     # bootstrap + service worker registration            [keep]
├── App.tsx                      # hash-route switch: dial | station | guide | signoff [rewrite]
├── router.ts                    # useHashRoute(); routes re-pointed to #/station/:id  [adapt]
├── RadioProvider.tsx            # context: reception state, lock-in, sound preference  [new]
├── content/
│   ├── broadcast.ts             # authored Broadcast + Station data                    [rewrite]
│   ├── palette.ts               # authored palette stops (dawn → neon)                 [new]
│   ├── README.md                # what the author fills in                             [rewrite]
│   └── media/                   # station visuals + noise texture                      [keep dir]
├── domain/
│   ├── types.ts                 # Broadcast, Station, Visual, Reception, TuningState   [rewrite]
│   ├── band.ts                  # pure: station → band position, nearest station, detune [new]
│   ├── tuning.ts                # pure reducer: candidate → settle → lock-in → received  [new]
│   └── contrast.ts              # pure: contrast ratio, used by the palette test        [new]
├── storage/
│   └── receptionStore.ts        # localStorage read/write, throw-safe                   [replaces findStore]
├── keepsake/
│   └── composeKeepsake.ts       # canvas → PNG blob; share/download decided by caller   [replaces composeRecap]
├── sound/
│   └── radioSound.ts            # Web Audio hiss/ident/click; created on first opt-in   [new]
├── ui/
│   ├── Dial.tsx                 # the scroll-snap band, needle, station marks           [new]
│   ├── Static.tsx               # composited noise layers driven by --detune            [new]
│   ├── Broadcast.tsx            # a station's full-screen content                       [new]
│   ├── StationGuide.tsx         # always-available ordered list (FR-010)                [new]
│   ├── SignOff.tsx              # closing broadcast + keepsake card                     [new]
│   ├── SoundToggle.tsx          # one obvious control (FR-014)                          [new]
│   ├── Stepper.tsx              # prev/next station, reduced-motion path (FR-015)       [new]
│   ├── DebugPanel.tsx           # ?debug=1 event ring                                   [keep]
│   ├── useTune.ts               # rAF-throttled scroll → --tune/--detune (no re-render) [new]
│   ├── useReducedMotion.ts      # existing hook                                         [keep]
│   └── a11y/                    # LiveRegion, focus helpers                             [keep]
└── styles/
    ├── tokens.css               # design tokens + palette stop variables                [adapt]
    ├── global.css               # base + reduced-motion block                           [adapt]
    ├── dial.css                 # band, snap, needle, station marks                     [new]
    └── static.css               # noise layers, compositor-only animation               [new]

tests/
├── setup.ts                                                                        [keep]
├── unit/                        # band, tuning, contrast, receptionStore, composeKeepsake,
│                                # router, broadcastContent, Dial (component)       [rewrite set]
└── e2e/                         # us1-tuning, us2-delight-signoff, us3-keepsake-deeplink,
                                 # fallbacks-offline, a11y, perf                    [rewrite set]

scripts/
├── make-noise.ts                # generates the tiled noise texture                [new]
└── qr.ts                        # QR code PNG for the production URL               [keep]
```

**Removed by this feature (R13)**: `src/camera/`, `src/ui/SnapSheet.tsx`,
`src/ui/RouteMap.tsx`, `src/ui/PlaceDetail.tsx`, `src/ui/Recap.tsx`, `src/ui/Welcome.tsx`,
`src/ui/TourScreen.tsx`, `src/ui/useObjectUrl.ts`, `src/domain/proposal.ts`,
`src/domain/tourState.ts`, `src/domain/readability.ts`, `src/storage/findStore.ts`,
`src/recap/`, `src/content/tour.ts`, `scripts/make-fixtures.ts`, `tests/fixtures/places/`,
and the 001 unit/e2e specs that cover them. The `idb-keyval` dependency is dropped from
`package.json`.

**Structure Decision**: One static Vite package, unchanged from 001 — no `api/`, no
`shared/`, no second runtime. Deploy remains `vite build` → `dist/` → GitHub Pages via the
existing workflow. The internal shape changes to match the new mechanic: pure band/tuning
maths in `domain/`, continuous visual state in CSS variables, discrete state in React, and
each optional browser capability (storage, audio, share) isolated behind one small module
so the fallbacks are testable.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| `vite-plugin-pwa` (service worker) — carried from 001 | FR-019 requires the whole tour to keep working offline after first load. A precached shell + content is the standard mechanism and is already proven by the existing e2e suite. | Relying on the HTTP cache is unreliable across mobile browsers and signal drop-outs; hand-writing a service worker is more code and more risk than the plugin's generated precache manifest. |
| Canvas-composed keepsake image (`keepsake/composeKeepsake.ts`) | FR-013 requires a keepsake the visitor can save or pass on, and FR-020 forbids a server, so the image must be produced on the device. | A text-only summary is a weak finish for the moment the spec spends its wow budget on; a share *URL* encoding progress would leak visitor state into links, contradicting FR-018 and FR-022. |
