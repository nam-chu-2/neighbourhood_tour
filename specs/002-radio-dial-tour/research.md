# Phase 0 Research: Bells Corners Radio — Tune the Dial

**Feature**: `002-radio-dial-tour` · **Date**: 2026-08-20 · **Spec**: [spec.md](spec.md)

The stack itself is not re-litigated: the constitution (Technical Constraints) requires
later features to reuse the stack ratified by the first plan — Vite + React 19 +
TypeScript, Vitest, Playwright, static hosting — unless the spec gives a documented reason
to diverge. It does not. This research resolves the *new* unknowns the pivot introduces:
how tuning feels, how "static" is drawn cheaply, how the palette travels, whether sound is
worth it, and what of 001 survives.

---

## R1 — How the dial is driven (the central decision)

**Decision**: The band is a **native scroll container with CSS scroll-snap**, not
a hand-rolled pointer-physics widget. Each station is a snap point. Dragging the dial *is*
scrolling it; letting go hands the motion to the OS compositor.

**Rationale**:

- **Punch for free.** SC-003 demands the needle track a thumb within 100 ms and never
  stutter. Native scrolling runs on the compositor thread, so it stays smooth even while
  React is busy — a JS `requestAnimationFrame` spring competes with rendering and is the
  usual source of the jank we are trying to avoid.
- **The inertia is real inertia.** Momentum, deceleration curves, and edge rubber-banding
  are the platform's, so the dial feels like the device the visitor already knows rather
  than an approximation of one (FR-003, FR-002).
- **Accessibility comes attached.** Focusable station elements inside a scroller give
  keyboard traversal, `scrollIntoView`, and screen-reader semantics without inventing a
  drag alternative — FR-021 and SC-007 are largely satisfied by construction.
- **Reduced motion is a one-line switch** (`scroll-behavior`), not a second code path
  (FR-015).
- **Less code** (Principle II): no velocity tracking, no friction constants, no
  per-platform tuning.

**Alternatives considered**:

| Alternative | Rejected because |
| --- | --- |
| Custom pointer events + rAF spring physics | Reimplements what the OS already does better; runs on the main thread; must re-solve momentum, rubber-band, and pointer-cancel per platform; needs a bespoke keyboard/AT path. |
| `<input type="range">` styled as a dial | No momentum and no flick — the analog feel (FR-003) is exactly what a range input lacks. |
| A drag/gesture library | A dependency to obtain worse behaviour than the built-in scroller (Principle II). |
| Full-page scroll with stations as sections | The dial must stay visible around the broadcast (FR-008, FR-018) and the page must not scroll horizontally (FR-016); a nested scroller keeps the frame fixed. |

**Risk & mitigation**: scroll-snap "settle" is not uniformly observable across browsers
(`scrollend` support is uneven). Mitigated by R2, which does not depend on it.

**Correction found during implementation**: the snap must be `proximity`, not
`mandatory`. Mandatory snapping never lets the needle rest between two stations, which
would remove the off-station static entirely — the state FR-005 requires. Proximity
snapping settles a flick that ends near a station and leaves one that does not in the
noise. Lock-in is computed from the needle position either way, so snapping stays an
enhancement rather than the mechanism.

---

## R2 — Detecting lock-in

**Decision**: A single rAF-throttled `scroll` listener computes the nearest station centre
and a **settle debounce of ~120 ms of no scroll events** promotes that candidate to
*locked in*. Keyboard focus on a station locks it in immediately. `scrollend` is used as an
accelerator when the browser provides it, never as the only signal.

**Rationale**: Meets FR-006 (lock-in with no extra action) and SC-004 (readable within 1 s
of settling) on every target browser, with a single code path that degrades to "slightly
later" rather than "never" where events are missing.

**Alternatives considered**: `scrollend` alone (unsupported on some targets → stations
would never open); `IntersectionObserver` alone (fires while flying past, so a fast flick
would mark stations received, violating the "flown past are not received" edge case);
polling on a timer (wasteful, and no better than the debounce).

---

## R3 — Drawing "static" without burning the frame budget

**Decision**: Static is **two or three pre-generated noise layers** (a small tiled texture
plus a scanline gradient) animated with **`transform` and `opacity` only**, their intensity
driven by one CSS custom property. No per-frame canvas noise, no animated SVG filter.

**Rationale**: Transform/opacity animation is compositor-only, so the noise costs
essentially nothing while the visitor is dragging — which is precisely when it is visible
and when the scroll must stay smooth (SC-003). A tiled texture is a few kilobytes and
precaches cleanly for offline (FR-019).

**Alternatives considered**: per-frame `canvas` noise (main-thread work every frame,
battery drain, directly competes with the scroll); animated `feTurbulence` (filter
re-rasterisation per frame is among the most expensive things a mobile GPU can be asked to
do); a noise video (bundle size, autoplay restrictions, offline weight).

---

## R4 — Getting scroll position into the visuals without re-rendering React

**Decision**: The scroll listener writes two custom properties on the root element —
`--tune` (0→1 across the whole band) and `--detune` (0→1, distance from the nearest station
centre) — and **nothing else**. Every continuous visual (noise opacity, blur, needle glow,
palette) is pure CSS derived from those two numbers. React state changes **only** on
lock-in and on reception, i.e. a handful of times per tour.

**Rationale**: This is the difference between "punchy" and "janky". Re-rendering a React
tree on every scroll frame is the standard way to miss SC-003; writing two custom
properties is a single style recalculation with no reconciliation. It also keeps the
component tree honest: the dial's continuous state lives in CSS, its discrete state lives
in React.

**Alternatives considered**: React state per scroll frame (rejected, above); CSS
scroll-driven animations (`animation-timeline: scroll()`) — attractive and would remove the
listener entirely, but support across our targets is uneven, so it is treated as a possible
progressive enhancement later, not the mechanism; a Web Animations timeline (same support
question, more code).

---

## R5 — The palette travelling across the band

**Decision**: Four to five authored **palette stops** (dawn → daylight → golden → dusk →
neon) interpolated in `oklab` via `color-mix()` keyed to `--tune`, with every stop's
text-on-background pairing contrast-checked by a unit test.

**Rationale**: Delivers FR-011's visible travel as a continuous gradient rather than a
slideshow, in CSS, with no JS. Interpolating in `oklab` keeps mid-points from going muddy
or losing luminance, which matters because the contrast floor (FR-021, SC-006) has to hold
*between* stops, not just at them. Making the stops authored data lets the test assert the
floor rather than trusting the eye.

**Alternatives considered**: per-station theme classes crossfaded (jumpy — reads as five
themes rather than one journey); sRGB interpolation (desaturated, unpredictable luminance
mid-way, harder to keep above 4.5:1); computing colours in JS (re-render per frame, see
R4).

---

## R6 — Sound

**Decision**: **Synthesised** with the Web Audio API — a filtered white-noise buffer for
hiss whose gain follows `--detune`, a short ident tone on lock-in, a click on snap. **No
audio files.** The `AudioContext` is created on the first tap of the sound toggle (never at
load), and every station is complete in silence.

**Rationale**: Zero bytes added to the bundle and nothing extra to precache for offline
(FR-019, FR-020); no licensing question; the hiss must respond continuously to detune,
which a file cannot do as gracefully as a gain node. Creating the context on the toggle tap
respects autoplay policy, which is also exactly the behaviour FR-014 asks for (off until
requested).

**Alternatives considered**: recorded hiss/ident assets (bundle + precache weight for a
strictly optional enhancement); an audio library (dependency for ~40 lines of code);
omitting sound entirely (the radio metaphor earns real delight from it, and it is cheap
when synthesised).

---

## R7 — Persistence, and dropping a dependency

**Decision**: Store received station ids and timestamps in **`localStorage`**, and
**remove `idb-keyval`** from the project.

**Rationale**: 001 needed IndexedDB because it stored photo Blobs. The pivot deletes
photos, so the entire persisted state is now a short list of ids — well inside
`localStorage`'s synchronous, universally available, offline-safe envelope. Keeping an
IndexedDB wrapper for a few strings is exactly the speculative generality Principle II
forbids. Reads and writes are wrapped in `try/catch` because storage access throws outright
in some private-browsing modes; a failure degrades to a working, non-persisting tour rather
than a broken one (FR-017, FR-023).

**Alternatives considered**: keep `idb-keyval` (unjustified dependency once Blobs are
gone); cookies (sent on every request, size-limited, no benefit); URL state (would make
progress leak into shared links, contradicting FR-018).

---

## R8 — The keepsake card

**Decision**: Compose the card on a `canvas` → PNG blob; offer `navigator.share({ files })`
where supported, otherwise a download link. The card is **always** rendered on screen
first, so the feature never depends on either API.

**Rationale**: FR-013 asks for something the visitor can save *or* pass on; an image is the
one artefact that survives every messaging app. Feature-detecting share with a download
fallback covers the target matrix, and rendering on-screen first means a visitor whose
browser supports neither still receives the keepsake.

**Alternatives considered**: a share *URL* encoding progress (leaks progress into links,
contradicts FR-018 and FR-022); server-rendered image (violates FR-020); text-only summary
(weak finish for the moment the spec spends its wow budget on).

---

## R9 — Routing and deep links

**Decision**: Reuse the existing hash router from 001 (`src/router.ts`), re-pointing routes
to `#/station/:id`. Opening a station link jumps the dial to that station with snapping
disabled for that jump, then locks it in.

**Rationale**: Hash routes need no server rewrites, which is what makes FR-018 free on
static hosting (FR-020). Jumping without animation avoids a deep link starting with a
several-second flight down the band.

**Alternatives considered**: History API routes (requires host rewrite rules — a server
concern the spec forbids); query parameters (same rewrite issue on some hosts, uglier
links).

---

## R10 — Reduced motion

**Decision**: Under `prefers-reduced-motion: reduce`, the noise layers stop animating (a
low-opacity still texture remains so "off-station" is still legible as a *state*), snapping
becomes instant (`scroll-behavior: auto`, no smooth flights), and a **prev/next station
stepper** is shown so tuning is a discrete step rather than a drag. The station guide
(FR-010) is always present regardless.

**Rationale**: FR-015 requires minimised motion with no loss of content or function. The
off-station state carries meaning (FR-005), so it is dimmed rather than deleted — removing
it entirely would lose information, not just motion.

**Alternatives considered**: only disabling animations (leaves a long inertial flight,
which is the most motion-sickness-inducing part); a separate reduced-motion page (two code
paths to keep in sync — a maintenance trap).

---

## R11 — Offline

**Decision**: Keep `vite-plugin-pwa` precaching the app shell, content, media, and noise
texture, exactly as ratified in 001.

**Rationale**: FR-019 is unchanged from 001's FR-012 and the mechanism is already in the
repo and proven by its e2e suite. No new research.

---

## R12 — How the dial gets tested

**Decision**:

- **Vitest (pure logic)**: band layout (station → position), nearest-station and detune
  maths, the settle/lock-in reducer, palette-stop contrast, persistence wrapper (including
  the throwing-storage case), keepsake composition, content-schema validation, router.
- **Playwright (behaviour)**: drive the dial by scrolling the band container
  (`mouse.wheel` and programmatic `scrollTo`) on iPhone 13 / Pixel 5 / desktop viewports;
  assert lock-in, reception marking, flown-past stations staying unreceived, sign-off,
  keepsake, deep link, offline (`context.setOffline(true)`), reduced motion
  (`emulateMedia`), silent parity, and axe scans.

**Rationale**: Keeps the physics-free parts of the mechanic (which is most of it) in fast
unit tests, and reserves browser tests for the things only a browser can answer. Test-first
per Principle III; the maths being pure is what makes "write the failing test first"
practical for an interaction this visual.

**Alternatives considered**: testing the dial only through e2e (slow, flaky, poor failure
messages); visual-regression snapshots (brittle against a deliberately animated surface,
and adds tooling).

---

## R13 — What happens to the 001 code

**Decision**: The pivot **deletes** the mechanics it supersedes rather than leaving them
parked: `src/camera/`, `src/ui/SnapSheet.tsx`, `src/ui/RouteMap.tsx`,
`src/domain/proposal.ts`, the IndexedDB `findStore`, photo-based recap composition, and
their tests and fixtures. It **keeps and repurposes**: `src/router.ts`, `src/ui/a11y/`,
`useReducedMotion`, `DebugPanel`, the design tokens and global styles, the content module
shape and its schema test, and the PWA/offline setup.

**Rationale**: Principle II — code kept "just in case" against a superseded spec is dead
weight that later readers must reason about. The spec explicitly supersedes 001, so the
map, camera, and photo-recap code have no requirement left to trace to (Principle I).
Deletion is safe and reversible: 001's implementation stays in git history and its spec
directory remains on disk.

**Alternatives considered**: keeping the old screens behind a flag (two products, double
the test surface, no requirement asking for it); leaving the files unreferenced (dead code
that still fails lint/typecheck budgets and misleads).

---

## Resolved unknowns

Every `NEEDS CLARIFICATION` raised in Technical Context is resolved above:

| Unknown | Resolved by |
| --- | --- |
| How tuning is driven and made to feel analog | R1, R2 |
| How static is rendered within the frame budget | R3, R4 |
| How the palette travels while holding contrast | R5 |
| Whether sound needs assets or a service | R6 |
| Where progress lives now that photos are gone | R7 |
| How the keepsake is produced and shared without a server | R8 |
| How deep links work on static hosting | R9 |
| What reduced motion replaces the drag with | R10 |
| How an inertial, visual mechanic is tested first | R12 |
| What becomes of the superseded 001 code | R13 |
