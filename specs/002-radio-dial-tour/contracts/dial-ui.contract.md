# UI Contract: The Dial

**Feature**: `002-radio-dial-tour` · **Date**: 2026-08-20

The dial is the site's only interface, so its observable behaviour is the interface
contract — the equivalent of an API surface for this project. Everything below is
observable from outside the implementation and is what the tests assert against. Anything
not listed here is free to change.

---

## 1. Routes

Hash routes, so no server rewrites are needed (FR-018, FR-020, research R9).

| Route | Shows |
| --- | --- |
| `#/` | The dial, off-station, with the intro instruction (FR-001). |
| `#/station/:id` | The dial with that station locked in and its broadcast open. Unknown `:id` falls back to `#/` with a plain message (FR-023). |
| `#/guide` | The station guide — the ordered list of every station (FR-010). |
| `#/signoff` | The sign-off and keepsake card. Reachable only once every station is received; otherwise redirects to `#/` (FR-012). |
| `?debug=1` | Adds the debug event panel (Principle V). |

Opening `#/station/:id` positions the dial at that station **without an inertial flight**,
then locks it in.

## 2. Structure and roles

| Element | Role / semantics | Notes |
| --- | --- | --- |
| Band | `role="listbox"`, `aria-label="Radio dial"`, `aria-orientation="horizontal"` | The scroll container; **proximity** scroll-snap (see note). |
| Station mark | `role="option"`, focusable, `aria-selected` when locked in | One per station, snap-aligned to centre. |
| Needle | `aria-hidden="true"` | Decorative; fixed at the band's centre. |
| Static layers | `aria-hidden="true"` | Decorative; the off-station *state* has a text equivalent (§4). |
| Broadcast | `role="region"`, labelled by the station name | Receives focus on lock-in. |
| Progress | text, e.g. "3 of 7 received", in the accessible name of the band | Always present (FR-008). |
| Live region | `aria-live="polite"` | Announces lock-in, reception, and completion. |

**Snap strength**: snapping is `proximity`, never `mandatory`. Mandatory snapping
would make it impossible to come to rest between two stations, which would delete
the off-station state the mechanic depends on (§4, FR-005). Proximity snapping
settles the needle when a flick ends near a station and leaves it in the static
otherwise — which is exactly the described behaviour. Lock-in is computed from the
needle position regardless, so the dial behaves correctly even where snapping is
unsupported.

Every station mark carries an accessible name that includes the station name, its
frequency, and whether it has been received — so the dial's progress is available without
seeing which marks are lit (FR-008, FR-021).

## 3. Tuning

| Input | Result |
| --- | --- |
| Drag / swipe the band | Needle tracks the pointer with no perceptible delay; motion is the platform's own scrolling (FR-002, SC-003). |
| Flick and release | Motion carries on and settles; it is never cut off at release (FR-003). |
| Settle within the lock radius | Station locks in after ≈120 ms of no scrolling, or on `scrollend` where available (FR-006). |
| Settle beyond the lock radius | Off-station state (FR-005). |
| Fly past a station without settling | Station does **not** lock in and is **not** received. |
| Reach either end of the band | Motion stops at a visible limit; the band does not wrap. |
| `←` / `→`, `Home` / `End` | Move between station marks; the focused station locks in immediately, no settle wait. |
| `Tab` | Reaches the band, the sound toggle, the guide link, and the open broadcast's controls. |
| Open from the guide, the stepper, or a deep link | Dial moves to that station and locks it in. |

**Lock-in effects**: the broadcast opens, the station is marked received (idempotent — a
second visit never double-counts), progress updates, the live region announces, and focus
moves to the broadcast region.

## 4. States the visitor can observe

| State | Must be true |
| --- | --- |
| Off-station | Noise is visible, **and** a short text line states that nothing is tuned in and to keep tuning. No story text is readable. |
| Settling | Noise is thinning; the approaching station's ident is becoming legible. |
| Locked in | Noise cleared; name, hero visual, memory, and (if authored) downtown translation are all present (FR-007). |
| Received | The station's mark is visually distinct from unreceived marks **and** says so in its accessible name (FR-008). |
| Complete | Sign-off is reachable and the keepsake card is offered (FR-012, FR-013). |

The off-station text line exists because the noise alone would convey the state visually
only — the state carries meaning, so it needs a text equivalent (FR-021).

## 5. CSS custom property contract

Written on the document root by the tuning hook; the **only** per-frame work (research R4).

| Property | Range | Meaning |
| --- | --- | --- |
| `--tune` | `0`–`1` | Position across the whole band. Drives the palette and the dial's lighting. |
| `--detune` | `0`–`1` | Distance from the nearest station centre; `0` centred, `1` fully off-station. Drives noise opacity, blur, needle glow, and hiss gain. |

No component re-renders in response to either value. React state changes only on the
discrete transitions in §3.

## 6. Reduced motion (`prefers-reduced-motion: reduce`)

- Noise layers stop animating; a low-opacity still texture remains so the off-station
  state is still legible.
- Scrolling between stations is instant — no smooth flights, no inertial travel.
- A prev/next **stepper** is shown, so tuning is a discrete step rather than a drag.
- Everything else — every station, the guide, the sign-off, the keepsake — is unchanged and
  reachable (FR-015).

## 7. Sound

- **Off by default.** No `AudioContext` is created until the visitor turns sound on.
- One toggle, reachable at any point, on and off (FR-014).
- The preference persists with the rest of the visitor state.
- **Silent parity is mandatory**: no information exists only in audio. Every test in the
  suite passes with sound off, and the tour is completable without it (SC-007).
- If Web Audio is unavailable or blocked, the toggle reports it plainly once and the tour
  continues (FR-023).

## 8. Storage

- One key: `bells-corners-radio:v1`; the document shape is in
  [data-model.md](../data-model.md).
- Written on reception, sound toggle, and completion — never during scrolling.
- If storage is unavailable or throws, the tour runs from memory without an error screen;
  only persistence is lost (FR-017, FR-023).
- Nothing else is stored or transmitted: no location, no identifiers, no analytics
  (FR-022).

## 9. Offline

After first load, every route, station, visual, the sign-off, and the keepsake work with
the network off. Losing connectivity never produces an error page or blocks a step
(FR-019).

## 10. Test hooks

Stable selectors the e2e suite depends on; treat as part of the contract.

| Hook | On |
| --- | --- |
| `data-testid="band"` | The scroll container (tests scroll it directly). |
| `data-testid="station-mark"` + `data-station-id` + `data-received` | Each station mark. |
| `data-testid="broadcast"` + `data-station-id` | The open broadcast. |
| `data-testid="offstation"` | The off-station text line. |
| `data-testid="progress"` | The "n of m received" text. |
| `data-testid="sound-toggle"`, `data-testid="guide"`, `data-testid="stepper"` | Controls. |
| `data-testid="signoff"`, `data-testid="keepsake"` | End of tour. |
