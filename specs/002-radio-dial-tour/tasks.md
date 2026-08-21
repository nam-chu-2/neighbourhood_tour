---

description: "Task list for 002-radio-dial-tour"
---

# Tasks: Bells Corners Radio — Tune the Dial

**Input**: Design documents from `/specs/002-radio-dial-tour/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/)

**Tests**: Test tasks are **included and mandatory**. Constitution Principle III (Test-First
Quality) is marked NON-NEGOTIABLE: acceptance tests are written and confirmed failing before
the implementation that makes them pass.

**Organization**: Tasks are grouped by user story so each story is an independently
testable, demonstrable increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task serves (US1, US2, US3)
- Exact file paths are given in every task

## Path Conventions

Single static package at repository root: `src/`, `tests/`, `scripts/` — per plan.md
"Structure Decision". No backend exists or is to be created.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Clear away the superseded 001 mechanic and prepare the build for the new one.

- [X] T001 Delete superseded 001 source: `src/camera/`, `src/recap/`, `src/ui/SnapSheet.tsx`, `src/ui/RouteMap.tsx`, `src/ui/PlaceDetail.tsx`, `src/ui/Recap.tsx`, `src/ui/Welcome.tsx`, `src/ui/TourScreen.tsx`, `src/ui/useObjectUrl.ts`, `src/domain/proposal.ts`, `src/domain/tourState.ts`, `src/domain/readability.ts`, `src/storage/findStore.ts`, `src/content/tour.ts` (research R13)
- [X] T002 Delete superseded 001 tests and fixtures: `tests/unit/{proposal,tourState,readability,findStore,downscale,composeRecap,RouteMap,tourContent,testTour}.*`, `tests/e2e/{us1-snap-flow,us1-fallbacks-offline,us2-delight-recap,us3-revisit-deeplink}.spec.ts`, `tests/fixtures/places/`, `tests/fixtures/none-1.jpg`, `scripts/make-fixtures.ts`
- [X] T003 Remove the `idb-keyval` dependency and the now-unused `fake-indexeddb` devDependency from `package.json`, drop the `fixtures` script, and run `npm install` to update the lockfile (research R7)
- [X] T004 [P] Update the PWA manifest and precache globs in `vite.config.ts` for the radio (name/short_name/description/theme_color, `orientation` allowing landscape per spec edge case), keeping the offline precache behaviour intact
- [X] T005 [P] Add `scripts/make-noise.ts` generating the tiled noise texture (≤8 kB) to `src/content/media/noise.png`, and register it as an npm script `noise` in `package.json`
- [X] T006 [P] Verify ignore files cover the build: `.gitignore` (`node_modules/`, `dist/`, `test-results/`, `*.log`, `.env*`, `.DS_Store`), `.prettierignore`, and the `ignores` entry in `eslint.config.js`; append only what is missing

**Checkpoint**: Repository builds and lints with the old mechanic gone and nothing new added yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The pure domain, the authored content, and the shared shell every story needs.

**⚠️ CRITICAL**: No user story work begins until this phase is complete.

### Domain tests (write first, confirm failing)

- [X] T007 [P] Write failing unit tests for band geometry in `tests/unit/band.test.ts`: `positionOf`, `tuneAt` (including the non-scrollable and clamped-end cases), `nearestStation`, `detuneOf` — per data-model.md "Band geometry"
- [X] T008 [P] Write failing unit tests for the tuning reducer in `tests/unit/tuning.test.ts` covering every transition and all four invariants in data-model.md "Transient tuning state" — especially that a station flown past is never received, that `RECEIVE` is idempotent, and that the reducer is total
- [X] T009 [P] Write failing unit tests for contrast maths in `tests/unit/contrast.test.ts` (known WCAG pairs, black/white extremes)
- [X] T010 [P] Write failing unit tests for the reception store in `tests/unit/receptionStore.test.ts`: round-trip, dedupe by `stationId`, unknown-id pruning on load, version mismatch discards, and **storage that throws is survivable** (research R7)
- [X] T011 [P] Write failing unit tests for content validation in `tests/unit/broadcastContent.test.ts`: Ajv against `specs/002-radio-dial-tour/contracts/broadcast-content.schema.json` plus the cross-field rules (contiguous `order`, strictly increasing `frequency`, ≥0.4 spacing, frequencies within `band`, unique ids, every visual has `alt`)
- [X] T012 [P] Write failing unit tests for the palette in `tests/unit/palette.test.ts`: 4–6 stops, `at` strictly increasing 0→1, and ≥4.5:1 contrast for `ink`-on-`bg` and `accent`-on-`bg` at every stop **and at sampled mid-points between stops** (research R5)
- [X] T013 [P] Write failing unit tests for the re-pointed router in `tests/unit/router.test.ts`: `#/`, `#/station/:id`, `#/guide`, `#/signoff`, unknown station id, and the `debug` flag

### Domain implementation

- [X] T014 Rewrite `src/domain/types.ts` with `Broadcast`, `Station`, `Visual`, `PaletteStop`, `Reception`, `VisitorState`, and `TuningState` per data-model.md (removing `Place`, `Find`, `SnapPhase`, `Media.kind: "map"`)
- [X] T015 [P] Implement pure band geometry in `src/domain/band.ts` to satisfy T007
- [X] T016 [P] Implement the pure tuning reducer in `src/domain/tuning.ts` to satisfy T008
- [X] T017 [P] Implement contrast maths in `src/domain/contrast.ts` to satisfy T009
- [X] T018 [P] Implement `src/storage/receptionStore.ts` (single key `bells-corners-radio:v1`, throw-safe read/write, version guard) to satisfy T010
- [X] T019 [P] Author `src/content/palette.ts` with the dawn → daylight → golden → dusk → neon stops to satisfy T012
- [X] T020 Author `src/content/broadcast.ts` — 6 placeholder stations carried over from 001's places, given frequencies in increasing road order, with `TODO(author)` memories and translations, to satisfy T011
- [X] T021 [P] Rewrite `src/content/README.md` explaining what the author fills in (stations, frequencies and the ≥0.4 spacing rule, memories, downtown translations, visuals with `alt`, palette stops)

### Shared shell

- [X] T022 Adapt `src/router.ts` to the routes in `contracts/dial-ui.contract.md` (`#/`, `#/station/:id`, `#/guide`, `#/signoff`, `?debug=1`) to satisfy T013
- [X] T023 Implement `src/RadioProvider.tsx`: holds reception state, sound preference, and the tuning reducer; hydrates from and persists to the reception store; exposes `receive`, `openStation`, `toggleSound`; records events in the debug ring (Principle V)
- [X] T024 [P] Adapt `src/styles/tokens.css`: replace the 001 palette with the palette-stop custom properties, keep `--tap-min`/`--tap-primary` and the type scale, and define `--tune`/`--detune` defaults
- [X] T025 [P] Adapt `src/styles/global.css`: full-viewport non-scrolling page shell (no page-level horizontal scroll, FR-016) and the `prefers-reduced-motion` block per research R10
- [X] T026 Rewrite `src/App.tsx` as the route switch (dial | station | guide | signoff) mounting `RadioProvider`, and update `src/main.tsx` if its imports changed

**Checkpoint**: `npm test`, `npm run typecheck`, and `npm run lint` pass with a green domain; no UI yet.

---

## Phase 3: User Story 1 — Tune the Dial and Receive the Stations (Priority: P1) 🎯 MVP

**Goal**: The mechanic — drag the band, static between stations, lock-in opens a broadcast,
received stations stay lit, everything reachable by keyboard and from the station guide.

**Independent Test**: On a phone, tune from one end of the band to the other; every station
locks in and shows its content, received marks are distinct, a flicked-past station stays
unreceived, and the whole tour is completable by keyboard alone.

### Tests for User Story 1 (write first, confirm failing) ⚠️

- [X] T027 [P] [US1] Write failing component tests for the dial in `tests/unit/Dial.test.tsx`: renders one mark per station with `role="option"`, accessible names carry name + frequency + received state, and progress text reads "n of m received" (contract §2)
- [X] T028 [P] [US1] Write failing e2e tests in `tests/e2e/us1-tuning.spec.ts` for spec US1 scenarios 1–6: dial visible with instruction and no horizontal page scroll at 360 px; scrolling the band shows the off-station state with no readable story; settling opens the broadcast with name, visual, memory and translation; progress updates; a station flown past at speed stays unreceived; re-tuning a received station reopens it
- [X] T029 [P] [US1] Write failing e2e tests in `tests/e2e/us1-keyboard-guide.spec.ts` for spec US1 scenarios 7–9: `Tab` reaches the band, `←`/`→`/`Home`/`End` move between stations and lock in immediately, `#/guide` lists and opens every station, and the tour completes with sound off

### Implementation for User Story 1

- [X] T030 [US1] Implement `src/ui/useTune.ts`: one rAF-throttled scroll listener writing **only** `--tune` and `--detune` to the document root, plus a ~120 ms settle debounce (and `scrollend` where available) that dispatches `SETTLED` — no React state per frame (research R2, R4)
- [X] T031 [US1] Implement `src/styles/dial.css`: the horizontal scroll container with proximity scroll-snap, centre-fixed needle, station marks, received/unreceived treatments, and ≥44 px targets
- [X] T032 [US1] Implement `src/ui/Dial.tsx`: the `listbox` band with focusable `option` station marks, `data-testid` hooks per contract §10, `aria-selected` on lock-in, and progress text — to satisfy T027
- [X] T033 [P] [US1] Implement `src/styles/static.css`: the composited noise layers, opacity/blur/transform driven by `--detune`, compositor-only (research R3)
- [X] T034 [P] [US1] Implement `src/ui/Static.tsx`: the decorative (`aria-hidden`) noise layers plus the **off-station text line** (`data-testid="offstation"`) that gives the state a text equivalent (contract §4, FR-005, FR-021)
- [X] T035 [US1] Implement `src/ui/Broadcast.tsx`: full-screen station content — name, hero visual with `alt`, memory, downtown translation, credit — as a labelled `region` that receives focus on lock-in
- [X] T036 [P] [US1] Implement `src/ui/StationGuide.tsx`: the always-available ordered list of every station with received state, each opening its station (FR-010)
- [X] T037 [US1] Wire lock-in end to end in `src/RadioProvider.tsx` and `src/App.tsx`: settle → lock-in → reception (idempotent) → progress → `aria-live` announcement via `src/ui/a11y/LiveRegion.tsx` → focus moves to the broadcast
- [X] T038 [US1] Handle the unknown-station and empty-state paths: `#/station/<bad-id>` falls back to `#/` with a plain message that says what happened and what to do next (FR-023, contract §1)

**Checkpoint**: US1 is complete and demonstrable on a phone — the tour is fully takeable.

---

## Phase 4: User Story 2 — Analog Feel, Punch, and the Sign-Off (Priority: P2)

**Goal**: The radio feels like an object — momentum, travelling palette, decisive lock-in,
optional synthesised sound — and the tour signs off when the last station is received.

**Independent Test**: A hard flick travels and settles smoothly; the palette visibly changes
across the band; with reduced motion preferred the stepper appears and everything still
works; sound is off until asked for; receiving the last station opens the sign-off.

### Tests for User Story 2 (write first, confirm failing) ⚠️

- [X] T039 [P] [US2] Write failing e2e tests in `tests/e2e/us2-delight-signoff.spec.ts`: palette custom properties differ measurably between the two ends of the band; a station is readable within 1 s of settling (SC-004); receiving the final station makes the sign-off available and it names the stations received
- [X] T040 [P] [US2] Write failing e2e tests in `tests/e2e/us2-reduced-motion-sound.spec.ts` using `emulateMedia({ reducedMotion: "reduce" })`: no animated noise, instant station changes, stepper present, every station still reachable; and with default settings that **no `AudioContext` exists until the sound toggle is tapped**, that toggling works both ways, and that the tour completes in silence (FR-014, FR-015, SC-007)

### Implementation for User Story 2

- [X] T041 [US2] Implement the travelling palette in `src/styles/tokens.css` + `src/styles/dial.css`: `color-mix()` in `oklab` across the authored stops keyed to `--tune`, applied to background, ink, and accent (research R5)
- [X] T042 [US2] Tune the lock-in reveal in `src/styles/dial.css` and `src/styles/static.css` so the broadcast arrives decisively (snap, not fade) and is readable within 1 s, honouring reduced motion
- [X] T043 [P] [US2] Implement `src/sound/radioSound.ts`: Web Audio hiss (filtered noise buffer, gain from `--detune`), lock-in ident, and dial click; `AudioContext` created only on the first opt-in; feature-detected with a plain one-time message if unavailable (research R6, FR-023)
- [X] T044 [P] [US2] Implement `src/ui/SoundToggle.tsx`: one obvious control, on and off at any point, preference persisted through `RadioProvider` (FR-014)
- [X] T045 [P] [US2] Implement `src/ui/Stepper.tsx`: prev/next station controls shown on the reduced-motion path, stepping discretely and locking in immediately (research R10)
- [X] T046 [US2] Implement `src/ui/SignOff.tsx`: the closing broadcast naming the stations received, reachable only once complete, redirecting to `#/` otherwise (FR-012, contract §1)
- [X] T047 [US2] Set `completedAt` exactly once on the reception that completes the set, in `src/RadioProvider.tsx`, and route to the sign-off

**Checkpoint**: US1 and US2 both work independently; the tour now has its wow layer and an ending.

---

## Phase 5: User Story 3 — Keep It and Pass It On (Priority: P3)

**Goal**: A keepsake card the visitor can save or share, progress that survives a reload,
and per-station links that open anywhere.

**Independent Test**: Finish the tour, save or share the card, reload and find received
stations still lit, then open a station link in a fresh browser context.

### Tests for User Story 3 (write first, confirm failing) ⚠️

- [X] T048 [P] [US3] Write failing unit tests for keepsake composition in `tests/unit/composeKeepsake.test.ts`: stations appear in dial order with the broadcast title, output is a PNG blob, and composition works with a station list of any supported length
- [X] T049 [P] [US3] Write failing e2e tests in `tests/e2e/us3-keepsake-deeplink.spec.ts`: the sign-off renders the card on screen and offers save/share; reloading keeps received stations lit; `#/station/<id>` in a fresh context opens that station with the dial around it (FR-013, FR-017, FR-018)

### Implementation for User Story 3

- [X] T050 [P] [US3] Implement `src/keepsake/composeKeepsake.ts`: canvas → PNG blob listing the stations received in dial order, to satisfy T048
- [X] T051 [US3] Render the keepsake card on screen inside `src/ui/SignOff.tsx` **first**, then offer `navigator.share({ files })` where supported with a download-link fallback — feature-detected, never required (research R8)
- [X] T052 [US3] Implement the deep-link entry path: `#/station/:id` positions the dial at that station **without an inertial flight**, then locks it in (research R9, contract §1)

**Checkpoint**: All three user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T053 [P] Write and pass `tests/e2e/fallbacks-offline.spec.ts`: with `context.setOffline(true)` after first load, tuning, every station, the sign-off, and the keepsake all still work with no error page; storage forced to throw leaves the tour usable with only persistence lost; Web Audio unavailable is reported once and the tour continues (FR-019, FR-023, SC-008)
- [X] T054 [P] Update `tests/e2e/a11y.spec.ts`: axe scans with no violations on the dial, an open broadcast, the guide, the sign-off, and the keepsake, across iPhone 13 / Pixel 5 / Desktop Chrome
- [X] T055 [P] Update `tests/e2e/perf.spec.ts`: dial interactive ≤3 s (SC-001), needle responds ≤100 ms and a full band sweep drops no frames (SC-003), station readable ≤1 s after settling (SC-004), and the initial JS bundle stays ≤150 kB gzip
- [X] T056 [P] Extend `src/ui/DebugPanel.tsx` (`?debug=1`) with tuning events: candidate changes, lock-in, reception, completion, and storage/audio failures (Principle V)
- [X] T057 [P] Rewrite `README.md` for the radio: what the site is, how to run it, how to author content, how to deploy, and the fact that it needs no server, keys, or accounts
- [X] T058 Confirm nothing references the deleted 001 modules — `npm run typecheck`, `npm run lint`, and a grep for `snap`, `RouteMap`, `findStore`, `idb-keyval` across `src/` and `tests/`
- [X] T059 Run the full `quickstart.md` validation end to end: `npm test`, `npm run test:e2e`, `npm run build && npm run preview`, and the manual one-handed daylight check
- [X] T060 Record the validation results in `specs/002-radio-dial-tour/checklists/validation-run.md` (mirroring the 001 record) noting anything deferred

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — start immediately
- **Foundational (Phase 2)**: depends on Setup — **blocks all user stories**
- **User stories (Phases 3–5)**: all depend on Foundational; then independently deliverable in priority order P1 → P2 → P3
- **Polish (Phase 6)**: depends on the stories being delivered

### User Story Dependencies

- **US1 (P1)**: depends only on Foundational. This is the MVP — a complete, takeable tour.
- **US2 (P2)**: depends only on Foundational; layers delight and the ending onto US1's surfaces without changing its behaviour.
- **US3 (P3)**: depends only on Foundational for its logic; its keepsake is rendered inside the sign-off, so deliver it after US2 or render the card on a standalone route if US2 is deferred.

### Within Each Story

Tests are written and confirmed failing → pure domain → styles → components → wiring →
error/edge paths. Story complete before moving to the next priority.

### Parallel Opportunities

- T004, T005, T006 (Setup) are independent
- T007–T013 (all Foundational tests) are independent of each other
- T015–T019, T021 (Foundational implementations in distinct files) are independent
- T027–T029, T039–T040, T048–T049 (each story's tests) are independent
- T033/T034, T036 (US1), T043/T044/T045 (US2), T050 (US3) touch distinct files
- Every Phase 6 task except T058–T060 is independent

---

## Parallel Example: Foundational tests

```bash
# Write these seven failing test files together, then implement against them:
Task: "Band geometry tests in tests/unit/band.test.ts"
Task: "Tuning reducer tests in tests/unit/tuning.test.ts"
Task: "Contrast maths tests in tests/unit/contrast.test.ts"
Task: "Reception store tests in tests/unit/receptionStore.test.ts"
Task: "Content schema tests in tests/unit/broadcastContent.test.ts"
Task: "Palette contrast tests in tests/unit/palette.test.ts"
Task: "Router tests in tests/unit/router.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1: Setup — old mechanic removed, build clean
2. Phase 2: Foundational — green domain, authored content, shell
3. Phase 3: US1 — the dial, static, lock-in, guide
4. **STOP and VALIDATE**: take the whole tour on a phone, one-handed
5. Deployable at this point: a complete tour without the wow layer

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. + US1 → the tour works (MVP)
3. + US2 → it feels like a radio and it ends properly
4. + US3 → it can be kept and passed on
5. + Polish → offline, a11y, perf, docs verified

### Notes

- `[P]` means different files with no incomplete dependencies
- Verify each test fails before writing the code that makes it pass (Principle III)
- Commit after each task or logical group
- Any checkpoint is a safe place to stop and validate a story independently
