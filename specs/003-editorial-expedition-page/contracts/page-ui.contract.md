# UI Contract: The Expedition Page

**Feature**: `003-editorial-expedition-page` · **Date**: 2026-08-21

The page is the whole product, so its observable structure is the interface contract.
Everything below is visible from outside the implementation and is what the tests assert.
Anything not listed here is free to change.

---

## 1. Section order

One document, read top to bottom. This order is asserted directly (FR-001 … FR-007).

| # | Section | `data-testid` | Contains |
| --- | --- | --- | --- |
| 1 | Hero | `hero` | Full-bleed image, `<h1>` title, dek |
| 2 | Facts | `facts` | 3–5 label/value pairs, including duration, distance, stops |
| 3 | Overview | `overview` | 1–4 paragraphs |
| 4 | Route | `route` | Decorative illustration with seven marked positions |
| 5–11 | Stops 1–7 | `stop` (+ `data-stop-id`, `data-stop-number`) | Number, headline, image, story, optional translation |
| 12 | Closing | `closing` | Closing note, credits, share control |

There are no other top-level sections, and no section is reachable only by an interaction.

## 2. Structure and roles

| Element | Semantics | Notes |
| --- | --- | --- |
| Page title | `<h1>`, exactly one | In the hero. |
| Section headings | `<h2>` per section; stop headlines are `<h2>` | Heading order never skips a level. |
| Stop | `<section id="{stop.id}">` with an accessible name from its headline | The `id` is the anchor target (FR-014). |
| Route illustration | `aria-hidden="true"` | Decorative: it carries nothing the stops do not (FR-004). |
| Stop navigation | `<nav aria-label="Stops">` with a list of anchor links | Wide screens only; `aria-current="true"` on the current stop (FR-015). |
| Images | `<img>` inside `<picture>`, always with `alt`, `width`, `height` | Empty `alt` is invalid — the schema forbids it (FR-019). |
| Share | a control that copies or shares the page link | Plain and always present (FR-016). |

## 3. Behaviour

| Input | Result |
| --- | --- |
| Scrolling | Sections settle into place as they enter view, once each, then never animate again. |
| Scrolling past a stop | The stop navigation marks that stop current. |
| Opening `#{stop-id}` | The page lands on that stop, offset clear of the top edge, with the rest of the page above and below it. |
| Opening an unknown `#id` | The page loads at the top and reads normally. No error state (FR-022). |
| Activating a nav link | Moves to that stop; instant under reduced motion, smooth otherwise. |
| Activating share | Shares the page link where supported, otherwise copies it and says so. |
| Resizing to a narrow viewport | The stop navigation is removed; nothing else changes. |

## 4. Guarantees that hold when things are missing

These are the contract's most important clauses: the page is only content, so its failure
modes are all "content missing".

| Condition | Must still be true |
| --- | --- |
| **JavaScript disabled or failed** | Every section, every stop, every word of story text is present and readable. Sections are visible by default in CSS; the reveal only ever *removes* a finished state that JS itself applied (research R1). |
| **`prefers-reduced-motion: reduce`** | No scroll-triggered motion, no route draw-on. Everything is in its finished state (FR-012). |
| **Images absent or failed** | Headlines, stories, translations, facts and closing all still read; layout does not collapse (FR-021). |
| **Offline after first load** | Every section and image is still served (FR-017). |
| **`IntersectionObserver` unsupported** | Sections stay in their finished state; the nav simply does not highlight. |

## 5. Text over imagery

Any text rendered over a photograph sits on a scrim. The guarantee is not "checked against
the current photo" but a property of the design: the text colour clears 4.5:1 against the
scrim composited over **pure white** and over **pure black**, so every possible photograph
in between is covered (FR-013, SC-005, research R3). Asserted in
`tests/unit/scrim.test.ts`.

## 6. Images

- Rendered as `<picture>` with AVIF, WebP and JPEG sources at up to three widths.
- Every `<img>` carries intrinsic `width`/`height` from the generated manifest, so its box
  is reserved before the bytes arrive — the page must not shift as photographs load
  (SC-003).
- The hero loads eagerly at high priority; every other image is lazy.
- No image variant exceeds 400 kB; the build fails if one does.

## 7. Privacy and network

- The page stores **nothing**: no `localStorage`, no cookies, no identifiers (FR-020).
- No request leaves the origin at runtime — no fonts, no analytics, no maps, no APIs
  (FR-018). The display font is served from the site's own assets.

## 8. Test hooks

Stable selectors the e2e suite depends on; treat as part of the contract.

| Hook | On |
| --- | --- |
| `data-testid="hero"`, `"facts"`, `"overview"`, `"route"`, `"closing"` | The corresponding sections. |
| `data-testid="stop"` + `data-stop-id` + `data-stop-number` | Each itinerary stop. |
| `data-testid="stop-nav"` | The wide-screen jump navigation. |
| `data-testid="share"` | The share control. |
| `data-revealed="true" \| "false"` | On each animated section, so reveal state is observable. |
