# Quickstart: Bells Corners Drive-Through Tour

Validation guide — how to run the app and prove each user story works end to end.
Implementation detail lives in tasks.md; the only contract is
[contracts/tour-content.schema.json](contracts/tour-content.schema.json).

**No API keys, no server, no cost.** Everything runs in the browser.

## Prerequisites

- Node.js 22 LTS, npm 10+
- A phone on the same Wi‑Fi as your laptop (optional, for real-device checks)

## Setup

```bash
git clone <repo> && cd neighbourhood_tour
npm install
npx playwright install --with-deps chromium
```

## Run locally

```bash
npm run dev            # Vite on http://localhost:5173 (also prints a LAN URL for phones)
npm run build && npm run preview   # production build with the service worker (offline testing)
```

Use the phone via the LAN URL, or the devtools device toolbar (iPhone 13 / Pixel 5,
portrait). Offline behaviour only exists in the built app (`preview`), not `dev`.

## Test

```bash
npm test               # Vitest: unit + component (no network)
npm run test:e2e       # Playwright: mobile flows, offline, reduced motion, axe
npm run typecheck && npm run lint
```

## Validation scenarios

### US1 — Ride along and unlock by photographing (P1)

1. **Welcome + list**: open `/` at 360 px portrait → welcome text, ordered place list all
   "not yet found", no horizontal scroll, one primary "Start the ride" (FR-001, FR-002,
   FR-010). "Ready for the road ✓" appears once precache completes (built app).
2. **Snap → proposal → confirm**: tap Snap, choose `tests/fixtures/places/<id>-1.jpg`
   (Playwright `setInputFiles`) → sheet shows the photo and "Is this **<place 1 name>**?"
   with "Yes, that's it" / "Pick a different place" / "Retake"; tap Yes → place 1 found,
   detail opens (name, hero image with alt, story, downtown translation) within 1 s
   (FR-003, FR-004, SC-002).
3. **Pick a different place**: snap again → proposal is place 2; tap "Pick a different
   place" → list of unfound places; pick place 4 → found with that photo (method
   `picked`).
4. **Order-aware proposal**: with {1,4} found, snap → proposal is place 5 (first unfound
   after highest found), never 2 or 3 unless picked; with {2..n} found → proposes 1
   (FR-003a).
5. **Retake**: snap → "Retake" → nothing found, photo discarded (FR-003).
6. **Camera denied**: simulate input cancel / `NotAllowedError` → plain explanation and
   "Mark <proposed place> found without a photo" + pick option (FR-005).
7. **Offline**: build + preview, load once, `context.setOffline(true)`, reload → app
   loads from cache; snap/confirm/read/recap all work (FR-012, SC-007).
8. **Persistence**: reload mid-tour → finds and photos still present (FR-008).
9. **Desktop**: 1280 px → adapted layout, all content present (FR-010).

### US2 — Delight, motion, keepsake (P2)

1. On confirm, route draws to the new marker, marker pops, detail sheet slides in — all
   settled within ~1 s (FR-011). With `prefers-reduced-motion: reduce` emulated: same
   content, no motion (SC-006).
2. After the last place → closing note → Recap shows the visitor's photos in route order
   with names; "Save your ride" triggers Web Share (mocked) with one JPEG, else a
   download link (FR-009).
3. Partial completion (3 of N) → Recap reachable and shows 3 items; no-photo finds show
   the author's visual with a "no photo" badge.

### US3 — Revisit and share (P3)

1. Reopen after completion (same profile) → finds and recap present.
2. Deep link `#/place/<id>` on a fresh profile → locked (name, marker context, Snap CTA);
   with `?after=1` → full description in route context (FR-013).

### Accessibility & responsiveness (FR-010, FR-014)

- Keyboard-only: Start → Snap (opens file input) → Yes / Pick → detail → recap; focus
  visible; sheet traps focus and closes with Esc.
- Every `<img>` and route marker has meaningful alt/aria; proposal and results announced
  via `aria-live`.
- axe (Playwright): no serious/critical violations on welcome, tour, sheet, detail, recap.
- Contrast ≥ 4.5:1 with the sunlight-friendly tokens.

### Performance (SC-001)

- `vite build` report: initial JS ≤150 kB gzip; `tests/e2e/perf.spec.ts` asserts welcome
  usable < 3 s under Playwright's throttled 4G.

### Rehearsal (SC-002a) — do this in the car before the real day

Drive the route once with the built app on one phone. For each stop, snap and note
whether the proposal was right. Target: ≥ 9/10 correct. If the drive order and the
content order disagree, fix `order` in `src/content/tour.ts`.

## Deploy (free)

```bash
npm run build                    # → dist/
# GitHub Pages: push to main; the workflow in .github/workflows/pages.yml publishes dist/
```

Share the Pages URL as a QR code (`npm run qr` → `qr.png`) before the drive; ask everyone
to open it once on Wi‑Fi so the offline cache is warm.
