# Phase 1 Data Model: Bells Corners Radio — Tune the Dial

**Feature**: `002-radio-dial-tour` · **Date**: 2026-08-20 · **Spec**: [spec.md](spec.md)

Two domains, as in 001: **authored content**, static and baked into the build; and
**visitor state**, which never leaves the device. The pivot removes photo Blobs entirely,
so visitor state is now small enough for `localStorage` (research R7).

A third, deliberately separate category is **transient tuning state**, which is split in
two: its *continuous* part (where the needle is, how far off-station) lives in CSS custom
properties and is never React state (R4); its *discrete* part (which station is a
candidate, whether it has locked in) is a small pure reducer.

---

## Authored content

### Broadcast

The tour itself. Exactly one exists.

| Field | Type | Rules |
| --- | --- | --- |
| `id` | `"bells-corners"` | Constant. |
| `title` | string | Non-empty. Station-ident styling on the dial. |
| `intro` | string | Non-empty. The single instruction shown before the first lock-in (FR-001). |
| `band` | `{ min: number; max: number }` | `min < max`; the frequency range the dial spans. |
| `stations` | Station[] | 6–10 items (spec Assumptions), ordered, see rules below. |
| `signOff` | string | Non-empty. The closing broadcast (FR-012). |

**Validation rules** (enforced by `tests/unit/broadcastContent.test.ts` against
[`contracts/broadcast-content.schema.json`](contracts/broadcast-content.schema.json), plus
cross-field checks the schema cannot express):

- `stations[].order` is 1-based, unique, contiguous, and matches array index order.
- `stations[].frequency` is strictly increasing with `order` — the band's left-to-right
  order *is* the order the places occur along the road (FR-004).
- Every `frequency` falls within `[band.min, band.max]`.
- Adjacent frequencies are at least `0.4` apart, so no two stations can occupy overlapping
  snap zones (see *Band geometry*).
- Every station has at least one `visuals` entry, and every visual has a non-empty `alt`
  (FR-021).
- Every `id` is a URL-safe slug and unique — ids appear in deep links and storage keys, so
  changing one after the tour has been shared breaks both (FR-018).

### Station

One place in Bells Corners.

| Field | Type | Rules |
| --- | --- | --- |
| `id` | string | URL-safe slug, unique, stable. |
| `order` | integer ≥ 1 | Unique, contiguous. |
| `frequency` | number | e.g. `101.7`. Strictly increasing with `order`; also the on-screen ident. |
| `name` | string | Non-empty. |
| `callSign` | string (optional) | Short flavour ident, e.g. `CBLL`. Decorative — never the only carrier of meaning. |
| `visuals` | Visual[] | ≥ 1; the first is the hero (FR-007). |
| `memory` | string | Non-empty first-person story (FR-007). |
| `downtownTranslation` | string (optional) | Comparison for a downtown-only audience (FR-007). |
| `dialLabel` | string (optional) | Very short label printed on the band; falls back to `frequency`. |

### Visual

| Field | Type | Rules |
| --- | --- | --- |
| `src` | string | Vite-resolved asset URL under `src/content/media/`. |
| `alt` | string | Non-empty, meaningful (FR-021). |
| `credit` | string | Non-empty. |
| `kind` | `"photo" \| "illustration"` | The `"map"` kind from 001 is removed — there is no map. |

### PaletteStop

Authored in `src/content/palette.ts`; drives the band's travel from dawn to neon (FR-011).

| Field | Type | Rules |
| --- | --- | --- |
| `at` | number 0–1 | Position along the band. First stop is `0`, last is `1`, strictly increasing. |
| `name` | string | e.g. `dawn`, `daylight`, `golden`, `dusk`, `neon`. For debugging and tests. |
| `bg` | colour | Background. |
| `ink` | colour | Body text on `bg`. |
| `accent` | colour | Needle/highlight; also used for text on `bg` in places. |

**Validation rules** (`tests/unit/palette.test.ts`, using `domain/contrast.ts`):

- `ink` on `bg` ≥ 4.5:1 and `accent` on `bg` ≥ 4.5:1 **at every stop**.
- The same floor holds at interpolated mid-points sampled between adjacent stops (the
  palette is continuous, so contrast must be checked between stops, not only at them —
  R5, SC-006).
- 4–6 stops total; `at` values strictly increasing from 0 to 1.

---

## Visitor state (per device, `localStorage`)

### Reception

The record that a station has been received. This is the entire persisted model.

| Field | Type | Rules |
| --- | --- | --- |
| `stationId` | string | Must match a `Station.id` in the current content; unknown ids are dropped on load. |
| `at` | ISO datetime string | When it locked in. |

### VisitorState (the stored document)

| Field | Type | Rules |
| --- | --- | --- |
| `version` | integer | Schema version; a mismatch discards the document rather than guessing (a clean restart beats a corrupt tour). |
| `receptions` | Reception[] | Deduplicated by `stationId`; first reception wins. |
| `soundOn` | boolean | The visitor's sound preference (FR-014). Default `false`. |
| `startedAt` | ISO datetime (optional) | First lock-in. |
| `completedAt` | ISO datetime (optional) | Set when every station has been received (FR-012). |

**Storage rules**:

- Single key: `bells-corners-radio:v1`. Written on reception, on sound toggle, and on
  completion — never on scroll.
- All reads and writes are wrapped; if storage throws or is unavailable (private browsing),
  the tour runs normally from in-memory state and the visitor is not shown an error,
  because nothing they can act on has failed (FR-017, FR-023). The failure is recorded in
  the debug ring (Principle V).
- Nothing else is persisted: no location, no identifiers, no analytics (FR-022).

### Keepsake

Derived, never stored. The stations received in dial order, plus the broadcast title and
the completion date, rendered to an image on demand (FR-013, R8).

---

## Band geometry (pure, `domain/band.ts`)

The maths that turns authored frequencies into positions and a scroll offset back into a
station. Pure functions, unit-tested first (Principle III).

| Function | Contract |
| --- | --- |
| `positionOf(station, band)` | → 0–1 along the band. Linear in `frequency` between `band.min` and `band.max`. |
| `tuneAt(scrollLeft, scrollWidth, clientWidth)` | → `--tune`, 0–1. Clamped at both ends; returns `0` when the band is not scrollable. |
| `nearestStation(tune, stations, band)` | → `{ station, distance }` where `distance` is in band units (0–1). |
| `detuneOf(distance, lockRadius)` | → `--detune`, 0 when centred, 1 at or beyond `lockRadius`. Drives noise, hiss, and blur. |

`lockRadius` is derived from the minimum station spacing so that lock zones can never
overlap — this is why the content schema enforces a minimum frequency gap.

---

## Transient tuning state

### Continuous (CSS only — never React state)

| Property | Range | Written by | Read by |
| --- | --- | --- | --- |
| `--tune` | 0–1 | `useTune.ts`, rAF-throttled scroll | palette interpolation, dial lighting |
| `--detune` | 0–1 | same | noise opacity, blur, needle glow, hiss gain |

Writing these two numbers is the **only** work done per scroll frame (R4).

### Discrete (`domain/tuning.ts`, pure reducer)

```text
TuningState =
  | { phase: "offStation" }                      // needle between stations
  | { phase: "settling";  candidateId: string }  // near a station, motion not finished
  | { phase: "locked";    stationId: string }    // broadcast open
```

**Transitions**:

| From | Event | To | Notes |
| --- | --- | --- | --- |
| any | `SCROLL` (nearest beyond `lockRadius`) | `offStation` | Closes an open broadcast; the station stays received (FR-009). |
| any | `SCROLL` (nearest within `lockRadius`) | `settling{candidate}` | Candidate may change while still settling. |
| `settling` | `SETTLED` (≈120 ms without scroll, or `scrollend`) | `locked{station}` | Emits `RECEIVE` if not already received (FR-006, R2). |
| any | `FOCUS_STATION(id)` | `locked{id}` | Keyboard/AT path — no settle wait (FR-021). |
| any | `OPEN_STATION(id)` (guide, stepper, deep link) | `locked{id}` | Dial is scrolled to match; reduced motion jumps instantly (FR-010, FR-015, FR-018). |
| `locked` | `RECEIVE` | `locked` | Idempotent: re-tuning a received station never duplicates a reception. |

**Invariants** (asserted in unit tests):

- A station flown past at speed never reaches `locked`, so it is never received — only a
  settle or an explicit open receives it (spec edge case).
- `receptions` never contains duplicates, and its count never exceeds the station count.
- `completedAt` is set exactly once, on the reception that completes the set.
- The reducer is total: every event is handled from every phase, so no interaction can
  strand the visitor on a blank screen (spec edge case, FR-023).

---

## Relationships

```text
Broadcast 1 ──── 6..10 ── Station 1 ──── 1..n ── Visual
     │                        │
     │                        └── 0..1 ── Reception   (per device, localStorage)
     │
     ├──── 4..6 ── PaletteStop        (authored, contrast-tested)
     └──── 0..1 ── Keepsake           (derived from Receptions at sign-off)
```

## What changed from 001's data model

| 001 | 002 | Why |
| --- | --- | --- |
| `Place.routePosition` (map coordinates) | `Station.frequency` (band position) | The dial replaces the map; order along the band carries the geography (FR-004). |
| `Media.kind: "map"` | removed | No map exists. |
| `Find` (photo Blob, method, timestamp) | `Reception` (id, timestamp) | No camera; nothing to store but the fact of arrival (R7). |
| IndexedDB via `idb-keyval` | `localStorage` | State is now a few short strings; the dependency is dropped (Principle II). |
| `Progress.startedAt/completedAt` | folded into `VisitorState` | One stored document instead of two keys. |
| `SnapPhase` state machine | `TuningState` state machine | The snap flow is replaced by the tuning flow. |
| — | `PaletteStop` | New: the band's travel from dawn to neon (FR-011). |
