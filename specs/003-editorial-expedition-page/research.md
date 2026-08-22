# Phase 0 Research: Bells Corners — The Expedition Page

**Feature**: `003-editorial-expedition-page` · **Date**: 2026-08-21 · **Spec**: [spec.md](spec.md)

The stack is not re-litigated: the constitution requires later features to reuse the stack
ratified by the first plan — Vite + React + TypeScript, Vitest, Playwright, static hosting
— unless the spec gives a documented reason to diverge. It does not. This research resolves
the unknowns the editorial pivot introduces: how a page of photographs stays fast, how text
stays legible over imagery that has not been taken yet, how scroll pacing degrades, what
carries the typography, and what survives from the dial.

The governing difference from 002: **the previous feature's risk was interaction; this
one's risk is weight and legibility.** A page whose wow is photography fails by being slow,
by shifting under the reader as images arrive, or by putting pale text on a pale sky.

---

## R1 — Scroll-paced reveals that cannot hide content

**Decision**: `IntersectionObserver` adds a `revealed` class once per section, animating
`transform` and `opacity` only, then unobserves. Crucially, the hidden-then-revealed state
is applied **only** when two conditions hold: JavaScript has run (a class set on the root
element at startup) **and** `prefers-reduced-motion: no-preference` matches. The default
state of every section in the stylesheet is *visible and finished*.

**Rationale**: This inverts the usual failure mode. The common implementation hides
sections in CSS and reveals them with JS, so a JS error, a slow parse, or an unsupported
browser leaves a blank page — for a read-only page whose entire purpose is text and
photographs, that is the worst possible failure. Making "finished" the default means the
animation can only ever *add* to a page that already works (FR-012, FR-021, SC-006).
One-shot observation keeps the work off the scroll path entirely: no scroll listener runs
during reading.

**Alternatives considered**:

| Alternative | Rejected because |
| --- | --- |
| Scroll listener computing offsets | Runs work on every frame of every scroll, the thing 002's research (R4) went to lengths to avoid; `IntersectionObserver` is the platform's answer to exactly this. |
| CSS scroll-driven animations (`animation-timeline: view()`) | Genuinely elegant and needs no JS, but support across the target browsers is uneven; usable later as an enhancement, not as the mechanism. |
| An animation library (AOS, Framer Motion, GSAP) | A dependency, and shipped JavaScript, to do what ~25 lines of `IntersectionObserver` and a CSS class do (Principle II). |
| Hiding sections in CSS by default | Any JS failure yields a blank page. Non-negotiable for a page that is only content. |

---

## R2 — Responsive imagery without layout shift

**Decision**: A build-time script (`scripts/make-images.ts`) uses `sharp` — already a
devDependency — to emit each source photograph at three widths (640/1280/1920) in AVIF and
WebP plus a JPEG fallback, and to record each image's intrinsic dimensions into a generated
manifest. The page renders `<picture>` with `srcset`/`sizes`, and every `<img>` carries
explicit `width`/`height` so the box is reserved before the bytes arrive. The hero is
`fetchpriority="high"` and eager; every other image is `loading="lazy"`.

**Rationale**: SC-003 (smooth scrolling) and the spec's "images load progressively without
the page jumping around" edge case are both really one requirement: *reserve the space
first*. Intrinsic dimensions in a generated manifest make that automatic rather than a
thing the author has to remember per image. Generating at build time keeps runtime cost at
zero (FR-018) and keeps the author's workflow to "drop a photo in the folder".

**Alternatives considered**: `vite-imagetools` (a new dependency for what a 40-line script
using an existing one does); shipping a single large image per stop (punishes mobile data
and blows the offline precache budget); runtime image CDN (an external paid service —
forbidden by FR-018); author-authored dimensions (a manual step that will silently rot).

---

## R3 — Text over photographs, before the photographs exist

**Decision**: Any text over imagery sits on a **scrim** — a gradient overlay whose colour
and opacity are chosen so that the composite is dark enough for the text regardless of what
is underneath. The invariant is enforced by a unit test that composites the scrim over
**pure white and pure black** and asserts the text colour clears 4.5:1 against both.

**Rationale**: FR-013 and SC-005 have to hold for photographs the author has not taken yet,
so the guarantee cannot be "we checked the hero image" — it must be a property of the
design. Compositing over the two extremes bounds every possible photograph in between: if
white-behind and black-behind both pass, every pixel of every future image passes. This is
the same move 002 made with the palette (checking interpolated mid-points rather than only
the authored stops), and it reuses `src/domain/contrast.ts` unchanged.

**Alternatives considered**: `text-shadow` alone (helps on busy images, provably fails on a
bright sky); blurring the image behind the text (expensive on mobile and muddies the
photograph the design is selling); moving all text off imagery (safe, but discards the
full-bleed opening the reference's register depends on); checking contrast per shipped
image (breaks the moment the author swaps a photograph).

---

## R4 — The route illustration

**Decision**: An authored inline SVG: one path for the road and seven marked positions along
it, drawn with `stroke-dasharray`/`stroke-dashoffset` so the line draws itself when it
scrolls into view. The whole graphic is `aria-hidden`, and the stop names it depicts are
present as real text in the itinerary below it.

**Rationale**: FR-004 requires a route that is decorative and explicitly *not* a map — no
library, no tiles, no external service, no coordinates. Inline SVG costs nothing at runtime,
scales to any viewport, and the draw-on effect animates a single property. Marking it
decorative is honest: it carries no information that the numbered stops do not already
carry, which is also what keeps it from becoming a second, unmaintained source of truth.

**Alternatives considered**: a real map component (a library plus, in practice, a tile
provider and a key — the thing the spec forbids and the user rejected two pivots ago); a
static image of a map (heavier, unreadable when zoomed, and still needs alternative text
for something decorative); animating the path with JS (a property CSS animates for free).

---

## R5 — Stop navigation and knowing where you are

**Decision**: A second `IntersectionObserver` tracks which stop occupies the middle of the
viewport and marks the corresponding link `aria-current="true"`. The navigation itself is a
plain list of anchor links, rendered at wide viewports only, and it is progressive: without
JS the links still work, they simply do not highlight.

**Rationale**: FR-015 asks for navigation that indicates the current stop — the highlight
is the enhancement, the links are the function. Reusing the observer pattern from R1 means
one mechanism, not two.

**Alternatives considered**: scroll-position maths (per-frame work, and it must be redone
on every resize and image load); `:target`-based highlighting (only reflects clicks, not
scrolling); a mobile version of the nav (competes with the content on a 360 px screen for
no benefit — the page is seven stops long).

---

## R6 — Deep links, and deleting the router

**Decision**: Stops are `id`-bearing sections reached by ordinary `#stop-3` anchors, with
`scroll-margin-top` so a linked stop is not jammed under the top edge. **`src/router.ts` is
deleted**: with no screens to switch between, there is nothing left to route.

**Rationale**: FR-014 is satisfied by what browsers already do — anchors survive with
JavaScript off, restore correctly on reload, and are what the platform gives for free. A
hash router existed in 001 and 002 because those features had distinct screens; this feature
is one document, so keeping the router would be code with no requirement behind it
(Principle II). A stop id that no longer exists lands the reader at the top of the page,
which is the spec's stated behaviour with no error handling required.

**Alternatives considered**: keeping the hash router (no screens to route); History API
routes (needs server rewrites — forbidden); scroll-restoration logic of our own (the
browser's is better and free).

---

## R7 — What carries the typography

**Decision**: One self-hosted variable display serif for headlines, subset to Latin and
vendored into the repository with its OFL licence file alongside; body text stays on the
system sans stack. Fonts are `preload`ed for the hero headline and declared
`font-display: swap`.

**Rationale**: With the mechanic gone, typography is doing a large share of the work the
spec's wow criteria depend on. A display serif is the single strongest signal of the
editorial register being borrowed, and the system stack cannot supply one consistently
across the six co-workers' devices. Self-hosting keeps FR-017/FR-018 intact — no external
font host, works offline, no key, no cost. **Obligation recorded**: the chosen face must be
open-licensed and its licence file must be committed alongside the font; this is a
condition of the decision, not an afterthought.

**Alternatives considered**: a hosted font service (an external runtime dependency, and it
breaks offline — forbidden by FR-017/FR-018); system serif stack only (zero bytes, but
renders as Times on Windows, which reads as *unstyled* rather than *editorial*); two custom
faces (double the bytes for a page whose body text is short).

---

## R8 — What survives from the dial

**Decision**: **Kept** — `src/domain/contrast.ts` (now enforcing the scrim invariant),
`src/ui/useReducedMotion.ts`, the design-token and global-stylesheet structure, the PWA and
offline setup, the Vitest/Playwright configuration, and a slimmed debug ring. **Deleted** —
`Dial`, `Static`, `Broadcast`, `StationGuide`, `SignOff`, `SoundToggle`, `Stepper`,
`useTune`, `RadioProvider`, `router`, `domain/band`, `domain/tuning`, `storage/`, `sound/`,
`keepsake/`, `content/palette`, `content/broadcast`, `styles/dial.css`, `styles/static.css`,
`ui/a11y/LiveRegion`, and every test that covers them.

**Rationale**: Principle II and Principle I together: code with no requirement behind it is
deleted, not parked. The spec supersedes 002 outright, so the dial's modules trace to
nothing. `LiveRegion` goes with them — it announced lock-ins, and a page that never changes
under the reader has nothing to announce. The debug ring stays but shrinks to what a static
page can actually fail at (an image that will not load), which is what Principle V asks for
here.

**Alternatives considered**: keeping the dial behind a route (two products, double the test
surface, and the user explicitly chose deletion); leaving modules unreferenced (dead code
that still costs typecheck, lint, and reader attention).

**Safety note**: the 002 implementation was committed to `002-radio-dial-tour` before this
feature began, so deletion here is recoverable from git history — which is what made the
user's "delete it, as 001 was deleted" choice safe to act on.

---

## R9 — Keeping a photography-heavy page inside its budgets

**Decision**: Budgets are set per-artefact and asserted in the e2e suite: initial JS
≤60 kB gzip (down from 002's 150 kB — there is far less behaviour), largest single image
variant ≤400 kB, total precached payload ≤15 MB, and hero readable ≤3 s on throttled 4G.
The image script fails the build if a generated variant exceeds its cap.

**Rationale**: SC-001 and SC-007 pull against each other — everything must be precached for
offline, and the first load must still be quick. Bounding the *variant* size rather than
the total is what keeps that tension honest: seven photographs at three widths stay well
inside the precache cap while the hero stays small enough to land in three seconds. Failing
the build on an oversized variant puts the limit where the author will meet it, rather than
in a document they will not read.

**Alternatives considered**: no image budget (the author drops in 8 MB phone photographs and
the page dies on mobile data); runtime compression (needs a server); excluding images from
the precache (breaks FR-017 — offline is a hard requirement).

---

## R10 — How an editorial page gets tested

**Decision**:

- **Vitest**: content-schema validation (including that every image has alternative text
  and every stop is numbered contiguously), the scrim contrast invariant over white and
  black, the reveal state machine as a pure function, and the image-manifest shape.
- **Playwright**: section order top to bottom, every stop rendering its parts, deep links
  landing on the right stop, scrollspy marking the current stop, reduced-motion parity,
  offline after first load, axe on the full page, perf budgets, and — the one this feature
  specifically needs — **the page rendered with JavaScript disabled**, asserting the
  complete text is present.

**Rationale**: The JS-disabled test is the direct executable form of R1's decision and
FR-021. Without it, "the reveal must never hide content" is a comment rather than a
guarantee, and the failure it prevents is the total one: a blank page.

**Alternatives considered**: visual-regression snapshots (brittle against photography that
is still placeholder, and they would need updating the moment the author supplies real
images); testing reveals only by eye (the blank-page failure is exactly what a human misses,
because it looks fine to whoever has JS working).

---

## Resolved unknowns

| Unknown | Resolved by |
| --- | --- |
| How sections animate without risking blank content | R1, R10 |
| How photography stays fast and stops the page shifting | R2, R9 |
| How text stays legible over images not yet taken | R3 |
| How the route is drawn without becoming a map | R4 |
| How the reader knows which stop they are in | R5 |
| Whether the router survives | R6 |
| What supplies the editorial voice | R7 |
| What of the dial is kept or deleted | R8 |
