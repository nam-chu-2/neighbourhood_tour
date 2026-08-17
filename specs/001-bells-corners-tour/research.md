# Research: Bells Corners Drive-Through Tour

**Date**: 2026-08-17 (rev 2 — zero-cost static) | **Plan**: [plan.md](plan.md)

All Technical Context unknowns are resolved below. Each entry: Decision / Rationale /
Alternatives considered.

## R1. How a snapped photo becomes a "find" (replaces the earlier image-recognition design)

- **Decision**: **Smart-default snap.** After the photo is taken, the site proposes the
  next not-yet-found place in route order (`nextProposedPlace`: first unfound place with
  order > highest found order, else first unfound overall) and shows the photo with three
  actions: "Yes, that's it" (find), "Pick a different place" (list of unfound places),
  "Retake" (discard). Pure client logic; no network.
- **Rationale**: The author's clarification: no paid runtime service (an Anthropic API
  key needs separate pay‑as‑you‑go credit not covered by the Claude Max plan). The drive
  follows the route, so the next-unfound default is right ~always; a one-tap confirm
  keeps the "snap → it knows" feel with zero cost, zero latency, and full offline
  operation. Rehearsal target SC-002a checks the default is right ≥9/10 snaps.
- **Alternatives considered**: (a) Claude vision via a serverless proxy — best magic,
  but ~$5 of separate API credit and a server; explicitly rejected on cost. (b) On-device
  embedding model (MobileNet/CLIP in the browser) — free but 10–100 MB download, poor
  accuracy from a moving car, significant engineering. (c) Location-based unlock —
  rejected earlier (permissions, GPS lag). (d) Pure honour-system pick-from-list — works,
  but the order-aware default is strictly better UX at the same cost.

## R2. Hosting with no server

- **Decision**: Static hosting on **GitHub Pages** (repo already on GitHub; free; deploy
  via GitHub Actions `vite build` → Pages). Vite `base` set for the repo path (or a
  custom domain later). Vercel/Netlify static are equivalent fallbacks.
- **Rationale**: $0, HTTPS (required for camera + service worker), trivial CI.
- **Alternatives**: Vercel (fine, also free for static); local Wi‑Fi hotspot serving —
  fragile in a car.

## R3. Offline in the car

- **Decision**: `vite-plugin-pwa` (Workbox `generateSW`) precaching the app shell,
  `tour.ts` bundle and all place media; `registerType: "autoUpdate"`; a small "Ready for
  the road ✓" indicator on the welcome screen once the precache completes. No install
  prompt required (browser tab is fine); manifest included so "Add to Home Screen" works.
- **Rationale**: FR-012 requires everything after first load to work offline; suburban
  coverage has drop-outs; a precache is the reliable mechanism.
- **Alternatives**: HTTP caching only (unreliable); hand-rolled service worker (more code
  than the plugin).

## R4. Camera capture on mobile web

- **Decision**: `<input type="file" accept="image/*" capture="environment">` opened from
  the single Snap button; downscale via canvas to ≤1024 px long edge, JPEG q≈0.82,
  EXIF orientation via `createImageBitmap(file, {imageOrientation: "from-image"})`
  before storing.
- **Rationale**: Most reliable cross-browser path, native camera UI, no persistent
  permission prompt; downscaling keeps IndexedDB small and recap composition fast.
- **Alternatives**: `getUserMedia` viewfinder — permission friction and lifecycle bugs in
  a car; possible later enhancement.

## R5. On-device persistence

- **Decision**: `idb-keyval` store keyed `find:<placeId>` → `{ placeId, photo: Blob|null,
  method: "proposal"|"picked"|"no-photo", at }` and `progress` → `{ startedAt,
  completedAt }`. Load on boot; write after every change (FR-008).
- **Rationale**: Blobs need IndexedDB; survives refresh/lock/reopen; per-device is the
  privacy model.
- **Alternatives**: `localStorage` + base64 (5 MB cap); any server (rejected).

## R6. Route map visual

- **Decision**: Hand-authored SVG schematic (stylized path + numbered markers positioned
  in `tour.ts`), animated with `stroke-dashoffset` as places are found; found/next/
  remaining differentiated by colour + icon + text.
- **Rationale**: No keys, no tiles, offline, themeable, more "designed" than a generic map.
- **Alternatives**: Leaflet/MapLibre tiles (network, heavy, generic); static image (not
  animatable).

## R7. Motion, delight, reduced motion

- **Decision**: CSS transitions/keyframes + SVG animation only; global
  `prefers-reduced-motion: reduce` block collapses durations. Reveal: route segment draws
  → marker pops → detail sheet slides up, with a crossfade from the visitor's photo to the
  author's visual as the "surprise" moment (skippable).
- **Alternatives**: framer-motion (+30 kB, unnecessary).

## R8. Recap keepsake

- **Decision**: In-app grid of the visitor's photos in route order with names; "Save"
  composes one JPEG on a canvas and uses Web Share (`navigator.share({files})`) when
  available, else a download link. Partial recaps allowed. No-photo finds show the
  author's visual with a "no photo" badge.
- **Alternatives**: Server-generated (no server); PDF (heavier).

## R9. Routing and deep links

- **Decision**: Hash routes (`#/`, `#/tour`, `#/place/<id>`, `#/recap`) via a ~30-line
  hook — works on GitHub Pages without rewrites. Readability rule: a place's description
  is readable if found on this device, OR the tour is complete on this device, OR the URL
  carries `?after=1` (post-drive share link). Otherwise the deep link shows the place as
  "not yet found" with the Snap action.
- **Alternatives**: React Router (weight); path routes (need SPA rewrites).

## R10. Testing strategy

- **Decision**:
  - Unit (Vitest): `tourState` reducer, `proposal` rule (order-aware, never proposes a
    found place, wraps to first unfound), `findStore` (fake-indexeddb), `downscale`,
    `router`, `readability`, `composeRecap`, content schema validation (Ajv), `RouteMap`
    animation attribute + reduced motion.
  - E2E (Playwright, iPhone 13 & Pixel 5 & Desktop Chrome): welcome→snap→proposal→
    confirm→detail; pick a different place; retake; camera denied → no-photo find; offline
    (`setOffline(true)` after load, reload from SW cache) → full flow still works;
    order-aware proposal after finding place 3 first; persistence across reload; recap;
    deep link locked / `?after=1`; reduced motion; axe; perf budget.
  - Rehearsal: a checklist run (quickstart) driving the route with the fake camera off —
    counts how often the proposal was right (SC-002a).
- **Rationale**: Constitution III; no network in tests.

## R11. Debug/observability without a server

- **Decision**: In-memory ring buffer of the last 50 UI events (snap, proposal shown,
  confirm/pick/retake, camera error, persistence write) exposed by `?debug=1` panel;
  never persisted, never sent anywhere.
- **Rationale**: Constitution V asks for reconstructable behaviour; this is the minimum
  useful thing for a rehearsal on a real phone.

## Resolved Technical Context summary

| Item | Resolution |
|---|---|
| Language/Version | TypeScript 5 / Node 22 (tooling) |
| Framework | Vite + React, static |
| Find mechanic | Smart-default snap (order-aware proposal + one-tap confirm) |
| Storage | IndexedDB (`idb-keyval`) on device |
| Offline | `vite-plugin-pwa` precache |
| Map | SVG schematic |
| Motion | CSS/SVG, reduced-motion aware |
| Tests | Vitest, Testing Library, Playwright, axe |
| Hosting | GitHub Pages (free) |
| Runtime cost | $0 |
