# Validation Run: Bells Corners — The Expedition Page

**Feature**: `003-editorial-expedition-page` · **Run**: 2026-08-21 · **Branch**: `003-editorial-expedition-page`

Record of the quickstart validation (task T054) and what it proved.

## Commands

| Command | Result |
| --- | --- |
| `npm run typecheck` | Pass — no errors. |
| `npm run lint` | Pass — no errors, no warnings. |
| `npm test` | **52 passed** across 7 files. |
| `npm run build` | Pass — 2.3 kB gzip JS, 2.6 kB gzip CSS, 15.8 kB prerendered HTML, 59 precache entries. |
| `npm run test:e2e` | **141 passed, 6 skipped** across iPhone 13 / Pixel 5 / Desktop Chrome. |

Skipped tests are the static build-analysis budgets, deliberately run once on Desktop
Chrome rather than repeated per device.

## Coverage by user story

| Story | Suites | Proved |
| --- | --- | --- |
| US1 (P1) | `us1-read`, `Stop.test.tsx`, `Figure.test.tsx` | Full-bleed opening with the title over it; sections in contract order; duration/distance/stops in the facts strip; six numbered stops each with number, headline, photograph, story and translation; no horizontal scrolling at 360 px; adapts to desktop and landscape; nothing asks the reader to act and nothing is stored. |
| US2 (P2) | `us2-craft`, `us2-reduced-motion`, `us2-contrast` | Sections settle as they are scrolled to and never revert; the route draws itself; the display serif is applied and served from this origin; **no request reaches another origin at all**; under reduced motion nothing is hidden, nothing animates, and every word is present. |
| US3 (P3) | `us3-navigate-share`, `us3-scrollspy` | Stop links land clear of the top edge with the page around them; an unknown anchor reads normally; share copies or shares; the wide-screen nav lists all six stops, marks the current one, follows the reader, and is absent on a phone. |
| Cross-cutting | `no-js`, `offline`, `a11y`, `perf` | The whole expedition renders with **JavaScript disabled**; everything works offline including photographs; with images blocked the stories still read; axe clean; headings never skip a level; budgets met. |

## Measured against the spec's success criteria

| Criterion | Result |
| --- | --- |
| SC-001 hero readable ≤3 s on throttled 4G | Pass. |
| SC-003 smooth scrolling, no shift as images load | Pass — every image declares intrinsic dimensions. |
| SC-004 renders at phone/tablet/desktop, both orientations | Pass. |
| SC-005 contrast floor over photography | Pass — proven against pure white and pure black, so it holds for photographs not yet taken. |
| SC-006 complete with motion off, images absent, keyboard only | Pass — one suite each. |
| SC-007 offline after first load | Pass, including imagery. |
| Initial JS ≤60 kB gzip | Pass — **2.3 kB**. |
| No image variant over 400 kB | Pass — enforced at build time. |

## Decisions and corrections made during implementation

- **React was removed from the browser entirely.** The first working build shipped 66.7 kB
  gzip of React to hydrate a page with no state, which missed the plan's 60 kB budget and
  contradicted Principle II. The page is now prerendered at build time and ships ~2.3 kB of
  vanilla enhancement — 29× smaller, and it makes the no-JS guarantee literal rather than
  approximate.
- **Prerendering was added** once it became clear a client-rendered app cannot satisfy the
  contract clause "a JS failure can never blank the page" — React itself would have been
  the thing blanking it.
- **`file:///` paths were being baked into the shipped HTML.** Resolving image URLs through
  `import.meta.url` inside the SSR bundle produced absolute paths to the build machine.
  Caught by the "no external request" test; fixed by serving variants from `public/` and
  resolving against the deployment base. This would have broken every photograph for every
  visitor and leaked local paths.
- **Stylesheets were being loaded from JavaScript**, so removing the client React entry left
  the page unstyled — and would have left the no-JS page unstyled too. CSS is now linked
  from the document.
- **The hero scrim was too strong**, flattening the photograph the design exists to show.
  Reworked as a bottom-weighted gradient that reaches the guaranteed alpha only where the
  text sits.
- **The route path is normalised** with `pathLength="1"` so "drawn" is exactly zero rather
  than a guess at the path's real length.
- **A failsafe was added to `index.html`**: if the enhancement script never loads, the `js`
  class is removed after 2.5 s and the page renders finished rather than staying hidden.

## Not covered by automation

- **SC-002 / SC-008 / SC-009 / SC-010** are human outcomes — reading it end to end in six
  minutes, six co-workers finishing unprompted, what they remember, whether they pass it on.
  They need the real audience and the real content.
- The **daylight read on a phone** in `quickstart.md` remains manual.
- **The photography is still placeholder**, and this is the material risk. Every stop
  carries a generated stand-in and `TODO(author)` prose. The mechanics are complete; the
  page will look like a template until real photographs replace them, because an expedition
  layout is mostly photography and has nothing else to hide behind.
