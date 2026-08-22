---

description: "Task list for 003-editorial-expedition-page"
---

# Tasks: Bells Corners — The Expedition Page

**Input**: Design documents from `/specs/003-editorial-expedition-page/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/)

**Tests**: Test tasks are **included and mandatory** — Constitution Principle III (Test-First
Quality) is NON-NEGOTIABLE: acceptance tests are written and confirmed failing before the
implementation that makes them pass.

**Organization**: Grouped by user story so each is an independently testable increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task serves (US1, US2, US3)
- Exact file paths are given in every task

## Path Conventions

Single static package at repository root: `src/`, `tests/`, `scripts/`, `public/` — per
plan.md "Structure Decision". No backend exists or is to be created.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Remove the superseded dial and prepare the build for a page made of photographs.

- [X] T001 Delete the dial implementation: `src/RadioProvider.tsx`, `src/router.ts`, `src/sound/`, `src/storage/`, `src/keepsake/`, `src/domain/band.ts`, `src/domain/tuning.ts`, `src/content/broadcast.ts`, `src/content/palette.ts`, `src/ui/{Dial,Static,Broadcast,StationGuide,SignOff,SoundToggle,Stepper}.tsx`, `src/ui/useTune.ts`, `src/ui/a11y/LiveRegion.tsx`, `src/styles/{dial,static}.css`, `scripts/make-noise.ts`, `src/content/media/noise.png` (research R8 — recoverable from commit `cab485a`)
- [X] T002 Delete the 002 test suites: `tests/unit/{band,tuning,receptionStore,palette,router,Dial,composeKeepsake}.test.*` and `tests/e2e/{us1-tuning,us1-keyboard-guide,us2-delight-signoff,us2-reduced-motion-sound,us3-keepsake-deeplink,fallbacks-offline}.spec.ts`
- [X] T003 Update `package.json`: drop the `noise` script, add `"images": "tsx scripts/make-images.ts"`, and refresh the description to the expedition page
- [X] T004 [P] Update the PWA manifest in `vite.config.ts` (name, description, theme colour for the editorial palette) and confirm the precache globs cover `avif`/`webp`/`woff2`
- [X] T005 [P] Vendor one open-licensed variable display serif into `public/fonts/` **with its licence file committed alongside it** (plan.md Complexity Tracking). If no suitable font can be obtained offline, fall back to a refined system serif stack and record the deviation in this task's notes — a font without a committed licence is not shippable
- [X] T006 [P] Verify ignore files still cover the build (`.gitignore`, `.prettierignore`, `ignores` in `eslint.config.js`); append only what is missing

**Checkpoint**: Repository builds and lints with the dial gone and nothing new added yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The pure invariants, the authored content, the image pipeline, and the page shell.

**⚠️ CRITICAL**: No user story work begins until this phase is complete.

### Tests (write first, confirm failing)

- [X] T007 [P] Write failing unit tests for the scrim invariant in `tests/unit/scrim.test.ts`: compositing a scrim over a colour, and the worst-case guarantee that text over the scrim clears 4.5:1 against the scrim over **pure white** and over **pure black** (research R3, FR-013)
- [X] T008 [P] Write failing unit tests for reveal logic in `tests/unit/reveal.test.ts`: sections animate only when JS has run **and** motion is welcome; the finished state is the default in every other case; a revealed section never returns to hidden (research R1, FR-012)
- [X] T009 [P] Write failing unit tests for content validation in `tests/unit/expeditionContent.test.ts`: Ajv against `contracts/expedition-content.schema.json`, plus contiguous 1–6 stop numbering matching array order, unique URL-safe stop ids, every image carrying `alt` and `credit`, duration/distance/stops all present in `facts`, and non-empty overview and story paragraphs
- [X] T010 [P] Write failing unit tests for the image manifest in `tests/unit/imageManifest.test.ts`: every authored `Image.src` has a manifest entry, entries carry positive intrinsic dimensions, each has AVIF/WebP/JPEG variants at each generated width, and no variant exceeds 400 kB (research R2, R9)

### Implementation

- [X] T011 Rewrite `src/domain/types.ts` with `Expedition`, `Stop`, `Image`, `ExpeditionFact`, `ImageManifestEntry`, and `Variant` per data-model.md (removing every dial type)
- [X] T012 [P] Implement `src/domain/scrim.ts` — composite a scrim colour/alpha over a background and expose the worst-case check — to satisfy T007, reusing `src/domain/contrast.ts` unchanged
- [X] T013 [P] Implement `src/domain/reveal.ts` — the pure decision of whether a section should animate at all — to satisfy T008
- [X] T014 Implement `scripts/make-images.ts`: read source photographs from `src/content/media/`, emit 640/1280/1920 × AVIF/WebP/JPEG (skipping upscales), write `src/content/images.generated.ts` with intrinsic dimensions, and **fail the build if any variant exceeds 400 kB**
- [X] T015 Author `src/content/expedition.ts` — title, dek, hero, facts, overview, six placeholder stops with `TODO(author)` prose, closing and credits — to satisfy T009
- [X] T016 Run `npm run images` to generate `src/content/images.generated.ts` and the variants, and commit them so a fresh clone builds without the script; confirm T010 passes
- [X] T017 [P] Rewrite `src/content/README.md` for the author: what each field is, the six stops, why `alt` and `credit` are required, how to add photographs, and the 400 kB guardrail
- [X] T018 [P] Rewrite `src/styles/tokens.css`: editorial type scale (display serif for headlines, system stack for body), spacing rhythm, colour, and the scrim tokens that `src/domain/scrim.ts` guarantees
- [X] T019 [P] Create `src/styles/fonts.css` with the `@font-face` declaration(s) for the vendored serif, `font-display: swap`, and a preload hint for the hero headline
- [X] T020 Adapt `src/styles/global.css`: a normally scrolling document (the dial's fixed non-scrolling shell is gone), `scroll-margin-top` for anchor targets, and the reduced-motion block per research R10
- [X] T021 Rewrite `src/App.tsx` as the page: hero, facts, overview, route, six stops, closing — in that order, with no router and no provider

**Checkpoint**: `npm test`, `npm run typecheck` and `npm run lint` pass; the page renders in order with placeholder content.

---

## Phase 3: User Story 1 — Read the Expedition (Priority: P1) 🎯 MVP

**Goal**: The whole page, top to bottom, readable on a phone: opening, facts, overview,
route, six numbered stops, closing and credits.

**Independent Test**: On a phone, scroll from top to bottom and confirm every section is
present in order, every stop shows number, headline, image, story and translation, and
nothing is clipped or requires an interaction to appear.

### Tests for User Story 1 (write first, confirm failing) ⚠️

- [X] T022 [P] [US1] Write failing component tests in `tests/unit/Stop.test.tsx`: a stop renders its number, headline, lead image with `alt`, every story paragraph, and the downtown translation only when authored
- [X] T023 [P] [US1] Write failing component tests in `tests/unit/Figure.test.tsx`: `<picture>` emits AVIF/WebP/JPEG sources, the `<img>` carries intrinsic `width`/`height` from the manifest, the hero is eager and high priority, and every other image is lazy (research R2)
- [X] T024 [P] [US1] Write failing e2e tests in `tests/e2e/us1-read.spec.ts` for spec US1 scenarios 1–7: section order top to bottom; hero title legible over the image; the facts strip carrying duration, distance and stops; six stops in numbered order each with their parts; no horizontal scrolling at 360 px; the layout adapting at tablet, desktop and landscape; and no progress, unlock, or audio anywhere on the page

### Implementation for User Story 1

- [X] T025 [P] [US1] Implement `src/ui/Figure.tsx`: `<picture>` with srcset and sizes from the generated manifest, intrinsic dimensions, lazy/eager loading, credit rendering, and a layout that holds when an image fails to load
- [X] T026 [US1] Implement `src/ui/Hero.tsx`: full-bleed opening image with the `<h1>` title and dek over it, sitting on the scrim from `src/domain/scrim.ts` (FR-001, FR-013)
- [X] T027 [P] [US1] Implement `src/ui/Facts.tsx`: the expedition facts strip as a description list (FR-002)
- [X] T028 [P] [US1] Implement `src/ui/Overview.tsx`: the framing paragraphs for a downtown-only reader (FR-003)
- [X] T029 [US1] Implement `src/ui/Stop.tsx`: a numbered `<section id="{stop.id}">` with headline, standfirst, lead image, story paragraphs and downtown translation, to satisfy T022 (FR-005, FR-006)
- [X] T030 [P] [US1] Implement `src/ui/Closing.tsx`: the closing note and imagery credits (FR-007)
- [X] T031 [US1] Implement `src/styles/page.css`: the editorial layout — full-bleed hero, facts strip, measure-constrained prose, stop rhythm, and responsive behaviour from 360 px to desktop with no horizontal page scrolling (FR-010)
- [X] T032 [US1] Wire every section into `src/App.tsx` in contract order with the `data-testid` hooks from `contracts/page-ui.contract.md` §8

**Checkpoint**: US1 complete — the entire expedition is readable on a phone.

---

## Phase 4: User Story 2 — Be Wowed by the Craft (Priority: P2)

**Goal**: Sections settle into place as they are scrolled to, the route draws itself, the
typography carries the register — and the page is complete and still under reduced motion.

**Independent Test**: On a phone, sections animate in as they enter view and the route draws
itself; with reduced motion preferred the same page is complete and static; the hero is
readable within 3 s on throttled 4G.

### Tests for User Story 2 (write first, confirm failing) ⚠️

- [X] T033 [P] [US2] Write failing e2e tests in `tests/e2e/us2-craft.spec.ts`: sections carry `data-revealed="false"` before entering view and `"true"` after, each reveals once and never reverts, and the route reaches its drawn state when scrolled to (FR-011, FR-004)
- [X] T034 [P] [US2] Write failing e2e tests in `tests/e2e/us2-reduced-motion.spec.ts` using `emulateMedia({ reducedMotion: "reduce" })`: no section is ever in a hidden state, no scroll-triggered animation runs, the route is drawn immediately, and every word of the page is present (FR-012, SC-006)
- [X] T035 [P] [US2] Write failing e2e tests in `tests/e2e/us2-contrast.spec.ts`: sample the composited colours behind the hero title and any other text-over-image and assert the contrast floor holds across the full area the text occupies (FR-013, SC-005)

### Implementation for User Story 2

- [X] T036 [US2] Implement `src/ui/useReveal.ts`: a one-shot `IntersectionObserver` that adds the revealed state, unobserves after firing, applies the hidden state **only** when JS has run and motion is welcome, and no-ops entirely where `IntersectionObserver` is unsupported (research R1)
- [X] T037 [US2] Add the reveal styles to `src/styles/page.css`: finished state as the CSS default, hidden state applied only under the JS-enabled class, transform/opacity only, settling within about half a second
- [X] T038 [P] [US2] Implement `src/ui/RouteIllustration.tsx`: decorative inline SVG road with six marked positions, `aria-hidden`, drawing itself via `stroke-dashoffset` when revealed and appearing drawn immediately under reduced motion (research R4, FR-004)
- [X] T039 [US2] Apply the scrim in `src/styles/page.css` wherever text sits over imagery, using the tokens guaranteed by `tests/unit/scrim.test.ts`, to satisfy T035
- [X] T040 [US2] Apply the display serif to headlines in `src/styles/page.css` and confirm the preload actually covers the hero headline's face

**Checkpoint**: US1 and US2 both hold; the page has its editorial craft and stays complete without motion.

---

## Phase 5: User Story 3 — Find a Stop and Pass It On (Priority: P3)

**Goal**: Any stop is directly linkable, wide screens get a jump navigation that knows where
you are, and the page offers a plain way to share.

**Independent Test**: Open a stop link on another device and land on that stop in context;
scroll on a desktop viewport and watch the navigation follow; use the share control.

### Tests for User Story 3 (write first, confirm failing) ⚠️

- [X] T041 [P] [US3] Write failing e2e tests in `tests/e2e/us3-navigate-share.spec.ts`: `#the-plaza` lands on that stop clear of the top edge with the page around it; an unknown anchor loads the top of the page and reads normally; the share control offers to share or copy the link (FR-014, FR-016, FR-022)
- [X] T042 [P] [US3] Write failing e2e tests in `tests/e2e/us3-scrollspy.spec.ts` at a desktop viewport: the stop navigation lists all six stops, marks the current one with `aria-current`, updates while scrolling, and is absent at phone widths (FR-015)

### Implementation for User Story 3

- [X] T043 [P] [US3] Implement `src/ui/useCurrentStop.ts`: an `IntersectionObserver` reporting which stop occupies the middle of the viewport (research R5)
- [X] T044 [US3] Implement `src/ui/StopNav.tsx`: a labelled `<nav>` of anchor links that work without JavaScript and gain `aria-current` when it runs, to satisfy T042
- [X] T045 [US3] Add `scroll-margin-top` for stop anchors and the wide-screen-only navigation layout to `src/styles/page.css` (FR-014, FR-015)
- [X] T046 [US3] Add the share control to `src/ui/Closing.tsx`: `navigator.share` where supported, clipboard copy with confirmation otherwise, and a plain visible link as the final fallback (FR-016)

**Checkpoint**: All three user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T047 [P] Write and pass `tests/e2e/no-js.spec.ts` with `javaScriptEnabled: false`: every section, every stop, and every word of story text is present and readable (FR-021, research R1) — the test that stops the reveal ever blanking the page
- [X] T048 [P] Write and pass `tests/e2e/offline.spec.ts`: with `context.setOffline(true)` after first load, the whole page and its imagery still render with no error page; and with images blocked, the text still reads and the layout holds (FR-017, FR-021, SC-007)
- [X] T049 [P] Update `tests/e2e/a11y.spec.ts`: axe clean on the full page across iPhone 13 / Pixel 5 / Desktop Chrome, headings never skipping a level, the route announced as decorative, and every image carrying alternative text (FR-019, SC-006)
- [X] T050 [P] Update `tests/e2e/perf.spec.ts`: hero readable ≤3 s on throttled 4G, initial JS ≤60 kB gzip, no layout shift as images load, precache ≤15 MB, and no image variant over 400 kB (SC-001, SC-003, research R9)
- [X] T051 [P] Slim `src/ui/DebugPanel.tsx` to what this page can fail at — image load failures — behind `?debug=1`, with a tiny in-memory ring (Constitution V)
- [X] T052 [P] Rewrite `README.md` for the expedition page: what it is, how to run it, how to add photographs and content, the budgets, and how to deploy
- [X] T053 Confirm nothing references the deleted dial: `npm run typecheck`, `npm run lint`, and a grep for `dial`, `tuning`, `station`, `keepsake`, `RadioProvider`, `router` across `src/` and `tests/`
- [X] T054 Run the full `quickstart.md` validation: `npm test`, `npm run test:e2e`, `npm run build && npm run preview`, plus the manual daylight read on a phone
- [X] T055 Record the results in `specs/003-editorial-expedition-page/checklists/validation-run.md`, noting anything deferred and the fact that the photography is still placeholder

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — start immediately
- **Foundational (Phase 2)**: depends on Setup — **blocks all user stories**
- **User stories (Phases 3–5)**: all depend on Foundational; then deliverable in priority order P1 → P2 → P3
- **Polish (Phase 6)**: depends on the stories being delivered

### User Story Dependencies

- **US1 (P1)**: depends only on Foundational. This is the MVP — the complete, readable expedition.
- **US2 (P2)**: depends on US1's sections existing, since it animates them; adds no content of its own.
- **US3 (P3)**: depends only on Foundational for its logic and on US1's stop `id`s for its anchors.

### Within Each Story

Tests written and confirmed failing → pure logic → components → styles → wiring.

### Parallel Opportunities

- T004, T005, T006 (Setup) are independent
- T007–T010 (all Foundational tests) are independent of each other
- T012, T013, T017, T018, T019 (distinct files) are independent
- T022–T024 (US1 tests), T033–T035 (US2 tests), T041–T042 (US3 tests) are independent
- T025, T027, T028, T030 (US1 components in distinct files) are independent
- Every Phase 6 task except T053–T055 is independent

---

## Parallel Example: Foundational tests

```bash
# Write these four failing test files together, then implement against them:
Task: "Scrim contrast invariant in tests/unit/scrim.test.ts"
Task: "Reveal logic in tests/unit/reveal.test.ts"
Task: "Content schema in tests/unit/expeditionContent.test.ts"
Task: "Image manifest in tests/unit/imageManifest.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1: Setup — dial removed, build clean
2. Phase 2: Foundational — invariants, content, image pipeline, shell
3. Phase 3: US1 — the whole page, readable
4. **STOP and VALIDATE**: read it top to bottom on a phone
5. Deployable at this point: the complete expedition without the craft layer

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. + US1 → the page reads (MVP)
3. + US2 → it feels commissioned rather than assembled
4. + US3 → it is navigable and shareable
5. + Polish → no-JS, offline, a11y, perf and docs verified

### Notes

- `[P]` means different files with no incomplete dependencies
- Verify each test fails before writing the code that makes it pass (Principle III)
- Commit after each task or logical group
- The page's wow depends on real photographs; with placeholders it will look like a template
  (spec Assumptions). That is expected until the author supplies imagery.
