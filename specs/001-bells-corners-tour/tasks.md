# Tasks: Bells Corners Drive-Through Tour

**Input**: Design documents from `/specs/001-bells-corners-tour/` (rev 2 — zero-cost static)

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: INCLUDED — the constitution (Principle III, Test-First) is non-negotiable. Within
each story, write the listed tests first, confirm they fail, then implement.

**Organization**: Tasks are grouped by user story so each story is an independently
testable increment. Paths follow plan.md: `src/`, `tests/{unit,e2e,fixtures}`, `scripts/`.
There is **no server, no API, no secrets**.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1 / US2 / US3 from spec.md
- Every task names exact file path(s)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bootstrapped, lint-clean, testable static project skeleton.

- [X] T001 Initialize project: `npm create vite@latest . -- --template react-ts`, set `"type": "module"`, add deps `react react-dom idb-keyval` and dev deps `vite-plugin-pwa vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom fake-indexeddb @playwright/test @axe-core/playwright ajv sharp typescript eslint prettier tsx qrcode` in `package.json`; scripts: `dev`, `build`, `preview`, `test`, `test:e2e`, `typecheck`, `lint`, `fixtures`, `qr`
- [X] T002 Create directory skeleton per plan.md: `src/{content/media,domain,storage,camera,recap,ui/a11y,styles}`, `tests/{unit,e2e,fixtures/places}`, `scripts/`, `.github/workflows/` (add `.gitkeep` files)
- [X] T003 [P] Configure `vite.config.ts` (React plugin, `server.host: true` for LAN phones, `base` from `VITE_BASE` env defaulting to `/`, `build.target: "es2022"`, `vite-plugin-pwa` with `registerType: "autoUpdate"`, precache `**/*.{js,css,html,svg,png,jpg,webp,woff2}`, manifest name/short_name/theme_color/icons) and `tsconfig.json` (strict)
- [X] T004 [P] Configure `vitest.config.ts` (jsdom env, `setupFiles: tests/setup.ts` importing `@testing-library/jest-dom` and `fake-indexeddb/auto`, include `tests/unit/**`)
- [X] T005 [P] Configure `playwright.config.ts` (projects: `iPhone 13`, `Pixel 5`, `Desktop Chrome`; `webServer` runs `npm run build && npm run preview -- --port 4173` so the service worker exists; baseURL `http://localhost:4173`; retries 0)
- [X] T006 [P] Configure `eslint.config.js` (typescript-eslint, react-hooks, jsx-a11y) and `.prettierrc`; add `.editorconfig`
- [X] T007 [P] Add `.gitignore` (node_modules, dist, dev-dist, playwright-report, test-results, qr.png) and `.github/workflows/pages.yml` (on push to main: `npm ci`, `npm test`, `npm run build` with `VITE_BASE=/<repo>/`, upload `dist/`, deploy to GitHub Pages)
- [X] T008 [P] Write `README.md` (what it is, zero-cost/static note, quickstart commands from `specs/001-bells-corners-tour/quickstart.md`, content-authoring pointer to `src/content/README.md`, deploy)

**Checkpoint**: `npm install && npm run typecheck && npm test && npm run test:e2e` all run (0 tests) and `npm run dev` serves a blank page on phone and desktop.

> **Checkpoint status (2026-08-17, partial)**: `npm install` and `npm run typecheck` verified
> passing. NOT yet verified: `npm test` (needs `tests/setup.ts` from T009+), `npm run build`
> and `npm run test:e2e` (need `index.html` + `src/main.tsx` from T015), `npm run dev` on a
> real phone. Expect these to fail until Phase 2 lands — that is the normal ordering, not a
> regression. Deviation from T001: scaffolded `package.json` directly instead of
> `npm create vite` (interactive, and the directory was non-empty).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types, content skeleton, styling tokens, routing, app shell, fixtures and
e2e helpers that every story builds on.

- [X] T009 [P] Write unit test `tests/unit/tourContent.test.ts` that loads `src/content/tour.ts` and validates it with Ajv against `specs/001-bells-corners-tour/contracts/tour-content.schema.json`; also asserts unique ids/orders, orders are 1..n, every media has alt text
- [X] T010 [P] Implement `src/domain/types.ts`: `Tour`, `Place`, `Media`, `Find` (`photo: Blob | null`, `method: "proposal" | "picked" | "no-photo"`), `Progress`, `SnapPhase` union (`idle | capturing | proposing | picking | cameraUnavailable`) per data-model.md
- [X] T011 [P] Create content skeleton `src/content/tour.ts` typed as `Tour` with `id: "bells-corners"`, title, intro, `route {viewBox, path}`, closingNote, and 6 placeholder places (`TODO(author)` text, optional `cue`, placeholder media `src/content/media/placeholder.svg`) so T009 passes; add `src/content/README.md` explaining every field the author fills (order = drive order!)
- [X] T012 [P] Implement `src/styles/tokens.css` (sunlight-friendly high-contrast palette ≥4.5:1, spacing, radii, `--tap-min: 44px`, type scale) and `src/styles/global.css` (reset, `body` background from tokens, focus-visible ring, `@media (prefers-reduced-motion: reduce)` block collapsing all animation/transition durations)
- [X] T013 [P] Implement `src/ui/a11y/LiveRegion.tsx` (polite `aria-live` announcer + `useAnnounce()`), `src/ui/a11y/focus.ts` (`focusHeading`, `useFocusTrap`)
- [X] T014 [P] Implement `src/router.ts`: `useHashRoute()` → `{ name: "welcome"|"tour"|"place"|"recap", placeId?, after: boolean, debug: boolean }` from `#/`, `#/tour`, `#/place/:id`, `#/recap` and query flags; `navigate(to)`; unit test `tests/unit/router.test.ts`
- [X] T015 Implement `src/App.tsx` + `src/main.tsx` (+ SW registration via `virtual:pwa-register`): mount `LiveRegion`, switch on `useHashRoute()` rendering placeholder `<h1>` per route; `index.html` with viewport meta `width=device-width, initial-scale=1, viewport-fit=cover`, `theme-color`, `lang="en"`
- [X] T016 [P] Add `scripts/make-fixtures.ts` (uses `sharp` dev dep to render each placeholder place name onto a coloured 800×600 JPEG) and run it once to commit `tests/fixtures/places/<place-id>-1.jpg` and `tests/fixtures/none-1.jpg`; document regeneration in `tests/fixtures/README.md` (`npm run fixtures`)
- [X] T017 [P] Write Playwright helper `tests/e2e/helpers.ts`: `snap(page, fixturePath)` (click Snap, `setInputFiles` on the hidden input), `confirmProposal(page)`, `pickPlace(page, name)`, `expectNoHorizontalScroll(page)`, `resetStorage(page)`, `seedFinds(page, placeIds)` (writes Finds into IndexedDB via `page.evaluate`)

**Checkpoint**: `npm test` green (content, router), app shell renders each hash route on phone/desktop, fixtures and helpers exist. Stories can start.

---

## Phase 3: User Story 1 — Ride Along and Unlock Places by Photographing Them (Priority: P1) 🎯 MVP

**Goal**: Welcome → ordered list with progress → single Snap → order-aware proposal with
the photo → one-tap confirm (or pick a different place / retake) → detail opens; camera
denied → no-photo find; works offline; order-independent; persists; desktop adapts.

**Independent Test**: On a 360 px viewport, snap fixture photos through every branch
(confirm, pick, retake, camera denied), verify the proposal rule, reload persists, go
offline and continue, reach the closing note (quickstart US1 scenarios 1–9).

### Tests for User Story 1 (write first, confirm failing)

- [X] T018 [P] [US1] Unit tests `tests/unit/proposal.test.ts` for `nextProposedPlace`: none found → order 1; {1,2} → 3; {1,3} → 4; {2..n} → 1; all found → null; never returns a found place
- [X] T019 [P] [US1] Unit tests `tests/unit/tourState.test.ts` for the reducer/state machine in data-model.md: snap → capturing → photo → proposing(place, photo); confirm → Find(method proposal); pickDifferent → picking → pick → Find(method picked); retake/dismiss → idle with no Find; cameraUnavailable → markWithoutPhoto → Find(method no-photo, photo null); undo deletes Find; retakePhoto replaces photo; completedAt when all found; selectors `foundCount`, `isFound`, `unfoundPlaces`, `isComplete`
- [X] T020 [P] [US1] Unit tests `tests/unit/findStore.test.ts` (fake-indexeddb): save/load Finds with Blob and null photo, save/load Progress, delete Find, `loadAll()` ordered by place order, `clearAll()`
- [X] T021 [P] [US1] Unit tests `tests/unit/downscale.test.ts`: output ≤1024 px long edge, JPEG mime, aspect preserved, small images not upscaled (canvas/`createImageBitmap` mocked in jsdom)
- [X] T022 [P] [US1] E2E `tests/e2e/us1-snap-flow.spec.ts` (iPhone 13 + Pixel 5): welcome renders + no horizontal scroll + Start visible; snap → sheet shows photo and "Is this <place 1>?" → Yes → detail (name, hero img with alt, story, downtown translation) within 1 s; progress "1 of N"; snap → "Pick a different place" → pick place 4 → found; snap → proposal is place 5 (order-aware); snap → Retake → nothing found; find place 3 before 2; reload persists finds + photos; last place → closing note
- [X] T023 [P] [US1] E2E `tests/e2e/us1-fallbacks-offline.spec.ts`: camera denied (input `cancel` / mocked `NotAllowedError`) → explanation + "Mark <proposed> found without a photo" and pick option → Find with no photo; built app loaded once then `context.setOffline(true)` + reload → app loads from SW cache and snap/confirm/read/recap all work; Desktop Chrome project renders side-by-side layout with all content
- [X] T024 [P] [US1] E2E `tests/e2e/a11y.spec.ts`: axe scan of welcome, tour, snap sheet, place detail (no serious/critical); keyboard-only path Start → Snap → Yes → detail; sheet traps focus, Esc dismisses; every route marker has an accessible name; proposal announced via `aria-live`

### Implementation for User Story 1

- [X] T025 [P] [US1] Implement `src/domain/proposal.ts` (`nextProposedPlace(tour, finds)`) (makes T018 pass)
- [X] T026 [P] [US1] Implement `src/domain/tourState.ts`: `initialState(tour)`, `reducer(state, action)` for actions `hydrate | snapStarted | photoCaptured | confirmProposal | pickDifferent | pickPlace | retake | cameraUnavailable | markWithoutPhoto | undoFind | retakePhoto | dismiss`; selectors (makes T019 pass; uses T025)
- [X] T027 [P] [US1] Implement `src/storage/findStore.ts` with `idb-keyval` (`saveFind`, `deleteFind`, `loadFinds`, `saveProgress`, `loadProgress`, `clearAll`) (makes T020 pass)
- [X] T028 [P] [US1] Implement `src/camera/downscale.ts` (`downscaleToJpeg(file, {maxEdge: 1024, quality: 0.82})` using `createImageBitmap(file, {imageOrientation: "from-image"})` + canvas → Blob) and `src/camera/capture.ts` (`openCamera(): Promise<File | CameraError>` wrapping a hidden `<input type=file accept=image/* capture=environment>`, mapping cancel/permission errors) (makes T021 pass)
- [X] T029 [US1] Implement `src/TourProvider.tsx`: React context with `tourState` + dispatch, hydrates from `findStore` on mount (exposes `ready`), persists on every Find/Progress change, `snap()` orchestration (capture → downscale → dispatch photoCaptured / cameraUnavailable), `debugLog` ring buffer (last 50 events) for `?debug=1`
- [X] T030 [P] [US1] Implement `src/ui/Welcome.tsx`: title, intro, single primary "Start the ride" → `#/tour`; "Ready for the road ✓" once SW precache is done (listens to `virtual:pwa-register` `onOfflineReady`)
- [X] T031 [P] [US1] Implement `src/ui/RouteMap.tsx`: SVG from `tour.route`, numbered markers at `routePosition`, found/next/remaining by colour + icon + `aria-label`, `stroke-dasharray` progress path (static here; animated in US2)
- [X] T032 [US1] Implement `src/ui/TourScreen.tsx`: header progress ("3 of 8 found"), `RouteMap`, ordered place list (found ✓ / not yet found; tap found → `#/place/:id`), fixed bottom "Snap" button (≥64 px), mounts `SnapSheet`; responsive side-by-side ≥900 px
- [X] T033 [US1] Implement `src/ui/SnapSheet.tsx`: bottom sheet states `proposing` (photo preview, "Is this **<name>**?" + optional `cue`, buttons "Yes, that's it" / "Pick a different place" / "Retake"), `picking` (list of unfound places, large buttons, back), `cameraUnavailable` (plain explanation, "Mark <proposed> found without a photo", "Pick a different place"), focus trap + Esc, `aria-live` announcements
- [X] T034 [US1] Implement `src/ui/PlaceDetail.tsx`: name, hero media with alt, story, optional downtown translation, "your photo" thumbnail (or "no photo" badge), "This wasn't it" undo, "Retake photo", back to tour; shows closing note when `isComplete`
- [X] T035 [US1] Implement `src/ui/DebugPanel.tsx` (renders `debugLog` when route `debug`), wire `src/App.tsx` routes to real screens with a loading state until `ready`, and an error boundary with a friendly message + reload (never a raw error)
- [X] T036 [US1] Run and fix until T018–T024 pass; `npm run lint && npm run typecheck`

**Checkpoint**: MVP — a passenger can complete the whole drive offline; deploy a preview.

---

## Phase 4: User Story 2 — Be Wowed: Delight, Motion, and a Personal Keepsake (Priority: P2)

**Goal**: Confirming a place is a moment (route draws to the marker, marker pops, detail
reveals with a photo→visual crossfade, ≤1 s); reduced-motion honored; recap of the
visitor's own photos with Save/Share.

**Independent Test**: With finds seeded in IndexedDB, observe the animation on a new
confirm (and its absence under reduced motion), then open `#/recap` → photos in route
order with names; "Save" produces one JPEG via share/download (quickstart US2 1–3).

### Tests for User Story 2 (write first, confirm failing)

- [X] T037 [P] [US2] Unit tests `tests/unit/composeRecap.test.ts`: `composeRecap(finds, tour)` returns a JPEG Blob with expected dimensions for 1, 3, N finds (canvas mocked), orders by place order, renders a "no photo" tile for null photos
- [X] T038 [P] [US2] Component test `tests/unit/RouteMap.test.tsx`: progress path updates on new find; `data-animating` set then cleared within 1000 ms; with `matchMedia('(prefers-reduced-motion: reduce)')` mocked true, no `data-animating`
- [X] T039 [P] [US2] E2E `tests/e2e/us2-delight-recap.spec.ts`: on confirm, marker gains "found" and detail sheet is visible ≤1 s; `page.emulateMedia({reducedMotion: 'reduce'})` → identical content, no transitions; after all found → closing note → recap shows N items in route order with names; "Save your ride" calls mocked `navigator.share` with one image file, else a download link exists; partial recap (3 of N) reachable from tour screen

### Implementation for User Story 2

- [X] T040 [P] [US2] Add `src/styles/motion.css`: route `stroke-dashoffset` transition (700 ms), marker pop keyframes (300 ms), sheet slide-up (350 ms), photo→hero crossfade (600 ms); all neutralized by the reduced-motion block from T012
- [X] T041 [P] [US2] Implement `src/ui/useReducedMotion.ts` (matchMedia hook) and `src/recap/composeRecap.ts` (canvas grid, 2 cols mobile, place names, tour title, closing note strip → JPEG Blob) (makes T037 pass)
- [X] T042 [US2] Enhance `src/ui/RouteMap.tsx`: animate progress path to the newly found marker (`data-animating`), marker pop, respects `useReducedMotion` (makes T038 pass)
- [X] T043 [US2] Enhance `src/ui/SnapSheet.tsx` + `src/ui/PlaceDetail.tsx`: reveal sequence on confirm (map animates → detail slides → the visitor's photo crossfades into the author's visual — the "surprise" moment, tap to skip)
- [X] T044 [US2] Implement `src/ui/Recap.tsx`: grid in route order with names (no-photo badge where applicable), closing note, "Save your ride" (Web Share with files when `navigator.canShare`, else `<a download>`), partial-recap notice; link from TourScreen when ≥1 find; auto-navigate on completion after closing note
- [X] T045 [US2] Run and fix until T037–T039 pass; re-run US1 e2e for regressions

**Checkpoint**: US1 + US2 pass independently.

---

## Phase 5: User Story 3 — Revisit and Share Afterwards (Priority: P3)

**Goal**: Reopening later keeps finds/recap; deep links open a place in route context;
`?after=1` makes descriptions readable without photos.

**Independent Test**: Complete → reopen same profile → finds present; fresh profile
`#/place/<id>` → locked with Snap; `?after=1` → readable (quickstart US3 1–2).

### Tests for User Story 3 (write first, confirm failing)

- [X] T046 [P] [US3] Unit tests `tests/unit/readability.test.ts`: `canRead(place, state, route)` true if found, or completedAt set, or `route.after`; false otherwise
- [X] T047 [P] [US3] E2E `tests/e2e/us3-revisit-deeplink.spec.ts`: after completion, new page in same context shows finds + recap; fresh context `#/place/<id>` → locked (name, marker context, Snap CTA); `#/place/<id>?after=1` → full description; "Share this place" produces the `?after=1` link (mocked share/clipboard)

### Implementation for User Story 3

- [X] T048 [P] [US3] Implement `src/domain/readability.ts` (`canRead`) (makes T046 pass)
- [X] T049 [US3] Enhance `src/ui/PlaceDetail.tsx`: locked vs readable variants per `canRead`; "Share this place" (Web Share URL or clipboard) building `#/place/<id>?after=1` once the tour is complete
- [X] T050 [US3] Confirm `TourProvider` hydration gate prevents flashing locked content on reload/deep link; run and fix until T046–T047 pass

**Checkpoint**: All three stories pass independently.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T051 [P] Author-content pass: replace placeholders in `src/content/tour.ts` with real Bells Corners places in drive order, stories, downtown translations, optional `cue`s, optimized media in `src/content/media/` (WebP/JPEG ≤1600 px + alt + credit); keep `tests/unit/tourContent.test.ts` green (requires author input)
- [ ] T052 [P] Performance: verify initial JS ≤150 kB gzip via `vite build` report; lazy-load `Recap`; hero images `loading="lazy"` + responsive `srcset`; add `tests/e2e/perf.spec.ts` asserting welcome usable <3 s under Playwright's throttled 4G; confirm precache size is reasonable (<15 MB) and lists all media
- [ ] T053 [P] Add `scripts/qr.ts` (`qrcode` → `qr.png` for the Pages URL) and `npm run qr`; document in `README.md`
- [ ] T054 [P] Hardening: `index.html` meta `referrer` no-referrer, `Permissions-Policy` via `<meta http-equiv>` where supported, no external requests at runtime (assert in `tests/e2e/us1-fallbacks-offline.spec.ts` that no request leaves the origin after load)
- [ ] T055 Run full `specs/001-bells-corners-tour/quickstart.md` validation on a real phone over LAN and once against the built/preview app offline; record results in `specs/001-bells-corners-tour/checklists/validation-run.md`
- [ ] T056 Deploy: push to `main` → GitHub Pages workflow; open on a phone once on Wi‑Fi (warm cache); do the rehearsal drive counting correct proposals (SC-002a ≥ 9/10); adjust `order`/`cue` in `src/content/tour.ts` if needed; generate `qr.png`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: none — start immediately
- **Foundational (Phase 2)**: depends on Setup; BLOCKS all stories
- **US1 (Phase 3)**: depends on Foundational — MVP
- **US2 (Phase 4)**: depends on Foundational; enhances US1 components but is testable with seeded finds
- **US3 (Phase 5)**: depends on Foundational; small edits to US1 screens
- **Polish (Phase 6)**: after desired stories; T051 (content) can start any time after T011 and is required before T056

### User Story Dependencies

- **US1**: independent after Phase 2
- **US2**: separate files (T040, T041) parallel; merges into US1 components (T042–T044)
- **US3**: independent logic (T048) + edits to `PlaceDetail`/`TourProvider`

### Within Each Story

- Tests first (must fail) → domain → storage/camera → provider → UI → run until green
- `proposal` (T025) → `tourState` (T026) → `TourProvider` (T029) → screens (T032–T034)

### Parallel Opportunities

- Phase 1: T003–T008 after T001–T002
- Phase 2: T009 test, then T010–T014, T016, T017 in parallel
- US1: T018–T024 in parallel; then T025–T028 + T030–T031 in parallel; T032–T034 after T029
- US2: T037–T039 in parallel; T040 + T041 in parallel
- US3: T046–T047 in parallel; T048 with T049
- Polish: T051–T054 in parallel

---

## Parallel Example: User Story 1

```bash
# Tests first (all parallel):
Task: "tests/unit/proposal.test.ts"
Task: "tests/unit/tourState.test.ts"
Task: "tests/unit/findStore.test.ts"
Task: "tests/unit/downscale.test.ts"
Task: "tests/e2e/us1-snap-flow.spec.ts / us1-fallbacks-offline.spec.ts / a11y.spec.ts"

# Then domain + infra (parallel, different files):
Task: "src/domain/proposal.ts"
Task: "src/domain/tourState.ts"
Task: "src/storage/findStore.ts"
Task: "src/camera/downscale.ts + capture.ts"
Task: "src/ui/Welcome.tsx"
Task: "src/ui/RouteMap.tsx"

# Then TourProvider → TourScreen / SnapSheet / PlaceDetail → App wiring
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 Setup → Phase 2 Foundational
2. Phase 3 US1 end to end (works offline, zero cost)
3. STOP and validate: quickstart US1 on a real phone
4. Deploy to GitHub Pages — this alone is a usable ride-along

### Incremental Delivery

1. Setup + Foundational → skeleton on phones
2. US1 → validate → deploy (MVP)
3. US2 → validate → deploy (the "wow")
4. US3 → validate → deploy
5. Polish: content, perf, rehearsal drive, QR

### Author dependency

T051 (real places, stories, photos) and T056 (rehearsal drive) need the author. Everything
else runs on placeholders and fixtures.

---

## Notes

- [P] = different files, no dependency on an incomplete task
- No network calls at runtime; no secrets in the repo (Constitution V, FR-003b, FR-015)
- Commit after each task or logical group on branch `001-bells-corners-tour`
- Stop at any checkpoint to validate the story independently
