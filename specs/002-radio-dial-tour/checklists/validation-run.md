# Validation Run: Bells Corners Radio — Tune the Dial

**Feature**: `002-radio-dial-tour` · **Run**: 2026-08-21 · **Branch**: `002-radio-dial-tour`

Record of the quickstart validation (task T059) and what it proved.

## Commands

| Command | Result |
| --- | --- |
| `npm run typecheck` | Pass — no errors. |
| `npm run lint` | Pass — no errors, no warnings. |
| `npm test` | **91 passed** across 9 files. |
| `npm run build` | Pass — 68 kB gzip initial JS, 11 precache entries (254 KiB). |
| `npm run test:e2e` | **134 passed, 4 skipped** across iPhone 13 / Pixel 5 / Desktop Chrome. |

Skipped tests are the static build-analysis budgets, which are deliberately run once on
Desktop Chrome rather than repeated per device.

## Coverage by user story

| Story | Suites | Proved |
| --- | --- | --- |
| US1 (P1) | `us1-tuning`, `us1-keyboard-guide`, `Dial.test.tsx` | Dial opens in the static with its instruction; settling locks a station in with no extra tap; static and no story between stations; received marks distinct; a station flown past stays unreceived; re-tuning never double-counts; band stops at both ends; keyboard and guide complete the tour without dragging. |
| US2 (P2) | `us2-delight-signoff`, `us2-reduced-motion-sound` | Palette travels continuously across the band; needle sharpens on approach; sign-off appears only when the last station is received and names what was received; reduced motion swaps in the stepper and stills the grain; no `AudioContext` exists until the visitor asks for sound; the whole tour completes in silence. |
| US3 (P3) | `us3-keepsake-deeplink`, `composeKeepsake.test.ts` | Keepsake lists stations in dial order and offers save/share; progress survives a reload; a station link opens on a fresh context with the dial around it; a dead link says so and leaves the tour usable. |
| Cross-cutting | `fallbacks-offline`, `a11y`, `perf` | Whole tour, sign-off and keepsake work with the network cut; a reload while offline still serves the radio; storage that throws costs only persistence; audio refused says so once; axe clean on dial, broadcast, guide and sign-off; performance budgets met. |

## Measured against the spec's success criteria

| Criterion | Result |
| --- | --- |
| SC-001 dial usable ≤3 s on throttled 4G | Pass (`perf.spec.ts`). |
| SC-003 needle responds ≤100 ms | Pass — measured from scroll to `--tune` update. |
| SC-004 station readable ≤1 s after settling | Pass. |
| SC-006 renders without clipping at phone/tablet/desktop | Pass — suite runs at all three, plus an explicit no-horizontal-scroll assertion. |
| SC-007 completable silent, reduced-motion, keyboard-only | Pass — one suite each. |
| SC-008 offline after first load | Pass. |
| Bundle budget ≤150 kB gzip | Pass — 68 kB. |
| Noise texture ≤8 kB | Pass — 2,261 bytes. |

## Corrections made during implementation

- **Snap strength**: `mandatory` scroll-snap would have made the off-station state
  unreachable, deleting the static the mechanic depends on. Changed to `proximity`;
  recorded in research R1 and contract §2.
- **Hydration race**: visitor state was loaded in an effect, so a bookmarked `#/signoff`
  redirected to the dial before progress had loaded. Now hydrated synchronously.
- **Listbox ownership**: the track element between the band and its options broke
  `aria-required-children`; made presentational.
- **Scrollable region focus**: the broadcast scrolls, so it must be reachable by keyboard
  (axe `scrollable-region-focusable`); it is now a tab stop with a styled focus ring.
- **Band edges**: station frequencies were close enough to the band ends that the dial
  auto-locked station one on load. Frequencies moved inward so the tour opens in the
  static, as FR-001 intends.

## Not covered by automation

- **SC-002 / SC-005 / SC-009 / SC-010** are human outcomes (first station within 10 s
  unprompted, six co-workers finishing unaided, what they remember afterwards, whether
  they pass a link on). They need the real audience and the author's real content.
- The **one-handed daylight check** in `quickstart.md` — how the dial *feels* in the hand
  — remains a manual step.
- **Content is still placeholder.** Every station carries `TODO(author)` text and the
  stand-in illustration; the tour is mechanically complete and narratively empty until
  the author fills in `src/content/broadcast.ts`.
