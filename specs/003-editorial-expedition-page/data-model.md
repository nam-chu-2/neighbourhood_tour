# Phase 1 Data Model: Bells Corners — The Expedition Page

**Feature**: `003-editorial-expedition-page` · **Date**: 2026-08-21 · **Spec**: [spec.md](spec.md)

This feature has **one** data domain: authored content, static and baked into the build.
There is no visitor state. 001 stored photographs, 002 stored received stations; this
feature stores nothing at all, on the device or anywhere else (FR-020). Nothing here has a
lifecycle, because nothing changes while the page is read.

Two derived, non-authored structures exist: the **image manifest** produced by the build
script, and the transient **reveal/scrollspy** view state that lives only in the DOM.

---

## Authored content

### Expedition

The page itself. Exactly one exists.

| Field | Type | Rules |
| --- | --- | --- |
| `id` | `"bells-corners"` | Constant. |
| `title` | string | Non-empty. The full-bleed opening headline. |
| `dek` | string | Non-empty, ≤160 chars. The single line under the title saying what this is (FR-001). |
| `heroImage` | Image | The opening photograph (FR-001). |
| `facts` | ExpeditionFact[] | 3–5 items; MUST include duration, distance, and number of stops (FR-002). |
| `overview` | string[] | 1–4 paragraphs framing Bells Corners for a downtown-only reader (FR-003). |
| `stops` | Stop[] | Exactly 6 (spec Assumptions), numbered contiguously from 1. |
| `closing` | string | Non-empty. The closing note (FR-007). |
| `credits` | string | Non-empty. Imagery credit line (FR-007). |

**Validation rules** (enforced by `tests/unit/expeditionContent.test.ts` against
[`contracts/expedition-content.schema.json`](contracts/expedition-content.schema.json),
plus cross-field checks the schema cannot express):

- `stops[].number` is 1-based, unique, contiguous, and matches array order — the page's
  numbering is the itinerary's numbering (FR-005).
- Every `stops[].id` is a URL-safe slug and unique: ids are the anchor targets that make
  stops linkable, so changing one after the link has been shared breaks it (FR-014).
- Every Image has non-empty `alt` and `credit` (FR-019).
- `facts` contains labels matching duration, distance, and stops (case-insensitive), so
  the strip cannot silently lose one of the three the spec names.
- `overview` and every `stops[].story` are non-empty after trimming — the page has no
  mechanic to hide missing prose behind.

### Stop

One place in Bells Corners, presented as an itinerary entry.

| Field | Type | Rules |
| --- | --- | --- |
| `id` | string | URL-safe slug, unique, stable. The anchor target (`#our-lady-of-peace`). |
| `number` | integer ≥ 1 | Unique, contiguous, matches array order. |
| `headline` | string | Non-empty. The stop's title. |
| `standfirst` | string (optional) | One line under the headline, in the editorial sense. |
| `images` | Image[] | ≥ 1; the first is the stop's lead photograph (FR-005). |
| `story` | string[] | 1–4 paragraphs, first person, non-empty (FR-005). |
| `downtownTranslation` | string (optional) | Ties the place to something familiar downtown (FR-006). |

### Image

| Field | Type | Rules |
| --- | --- | --- |
| `src` | string | Path to the **source** photograph under `src/content/media/`. The build script derives every variant from it. |
| `alt` | string | Non-empty, meaningful (FR-019). |
| `credit` | string | Non-empty. |
| `focus` | `"top" \| "centre" \| "bottom"` (optional) | Where to anchor the crop when the frame is tighter than the photograph. Defaults to `centre`. |

### ExpeditionFact

| Field | Type | Rules |
| --- | --- | --- |
| `label` | string | Non-empty, e.g. `Duration`. |
| `value` | string | Non-empty, e.g. `25 minutes`. |

---

## Derived: the image manifest

Produced by `scripts/make-images.ts` into `src/content/images.generated.ts`. Generated, never
hand-edited, and committed so a fresh clone builds without running the script.

| Field | Type | Meaning |
| --- | --- | --- |
| `source` | string | The source path, as written in `Image.src` — the manifest's key. |
| `width` / `height` | integer | The source's intrinsic dimensions. Rendered into every `<img>` so the box is reserved before the bytes arrive (research R2). |
| `aspectRatio` | number | `width / height`, precomputed for CSS. |
| `variants` | Variant[] | One per width × format. |

**Variant**: `{ format: "avif" | "webp" | "jpeg"; width: number; url: string; bytes: number }`.

**Rules** (`tests/unit/imageManifest.test.ts`):

- Every `Image.src` in the authored content has a manifest entry — an unmanifested image
  is a build error, not a broken page in front of six co-workers.
- Every entry has all three formats at each of the three widths (640 / 1280 / 1920), except
  where the source is narrower than a target width, in which case that width is skipped
  rather than upscaled.
- No variant exceeds **400 kB**; the script fails the build if one does (research R9).
- `width`, `height`, and `bytes` are positive integers.

---

## Derived: the scrim guarantee

Not stored, but a checked property of the design (research R3). A **Scrim** is
`{ colour: string; alpha: number }` composited under text that sits over a photograph.

**Invariant** (`tests/unit/scrim.test.ts`): for the text colour used over imagery, the
contrast ratio against the scrim composited over **pure white** and against the scrim
composited over **pure black** are both ≥ 4.5:1.

Because every possible photograph lies between those two extremes, satisfying both bounds
satisfies every image the author may later supply — including ones that do not exist yet.

---

## Transient view state (DOM only)

Neither of these is application state; both are attributes on elements, and both have a
correct value when JavaScript never runs.

| State | Where | Default without JS |
| --- | --- | --- |
| Section revealed | `data-revealed` on each section | **Revealed.** The stylesheet's default is the finished state; the hidden state is only ever applied when JS has run *and* motion is welcome (research R1). |
| Current stop | `aria-current` on a `StopNav` link | Absent. The links still navigate; only the highlight is missing. |

---

## Relationships

```text
Expedition 1 ──── 1 ── Image (hero)
     │
     ├──── 3..5 ── ExpeditionFact
     ├──── 6 ───── Stop 1 ──── 1..n ── Image
     └──── 1 ───── Route (decorative illustration; carries no data of its own)

Image.src ──── 1 ── ImageManifestEntry ──── n ── Variant   (generated at build time)
```

The route illustration is deliberately **not** an entity: it holds no information the
numbered stops do not already hold, which is what keeps it decorative and prevents it
becoming a second source of truth about the drive (FR-004, research R4).

## What changed from 002's data model

| 002 | 003 | Why |
| --- | --- | --- |
| `Broadcast` with `band` | `Expedition` with `facts`, `overview`, `credits` | The dial is gone; the page is an itinerary, not an instrument. |
| `Station.frequency` (band position) | `Stop.number` (itinerary position) | Order is now presentational, not spatial. |
| `Reception`, `VisitorState`, `localStorage` | *removed entirely* | The page is read-only: nothing to record (FR-008, FR-020). |
| `TuningState` machine | *removed entirely* | No mechanic to have states. |
| `PaletteStop` (palette travelling with `--tune`) | *removed*; replaced by the Scrim invariant | Colour no longer moves; the contrast risk moved to text-over-photography. |
| — | `ImageManifestEntry` / `Variant` | New: photography is now the payload, so its dimensions and weight must be known at build time. |
