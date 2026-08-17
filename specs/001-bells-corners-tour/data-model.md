# Data Model: Bells Corners Drive-Through Tour

**Date**: 2026-08-17 (rev 2) | **Plan**: [plan.md](plan.md) | **Spec**: [spec.md](spec.md)

Two data domains: **authored content** (static, baked into the build) and **visitor
state** (per device, IndexedDB). Nothing is stored anywhere else.

## Authored content (static)

### Tour

| Field | Type | Rules |
|---|---|---|
| `id` | string | Constant `bells-corners` |
| `title` | string | Shown on welcome |
| `intro` | string | Frames Bells Corners for a downtown-only audience (FR-001) |
| `places` | Place[] | 6–10 entries, unique `order` 1..n, unique `id` |
| `route` | `{ viewBox, path }` | SVG path for the schematic map (FR-007) |
| `closingNote` | string | Shown after final place / on recap (FR-009) |

### Place

| Field | Type | Rules |
|---|---|---|
| `id` | slug | URL-safe, stable (deep links, storage keys) |
| `order` | integer | Route order, 1-based, unique — drives the proposal (FR-003a) |
| `name` | string | Display name; used in the proposal prompt "Is this the …?" |
| `routePosition` | `{ x, y }` | Marker position in route viewBox units |
| `media` | Media[] | ≥1; first is the hero visual (FR-004) |
| `story` | string | First-person story |
| `downtownTranslation` | string? | Optional comparison |
| `cue` | string? | Optional one-line "what to look for" shown in the proposal (e.g. "blue sign on the right") |

### Media

| Field | Type | Rules |
|---|---|---|
| `src` | string | Path under `src/content/media/` |
| `alt` | string | Required, meaningful (FR-014) |
| `credit` | string | Author / source |
| `kind` | `"photo" \| "illustration" \| "map"` | |

Validation: `contracts/tour-content.schema.json`, enforced by a unit test that loads
`src/content/tour.ts`.

## Visitor state (per device, IndexedDB via idb-keyval)

### Find

Key: `find:<placeId>`

| Field | Type | Rules |
|---|---|---|
| `placeId` | slug | FK → Place.id |
| `photo` | Blob (image/jpeg) \| null | Downscaled ≤1024 px; null for no-photo finds |
| `method` | `"proposal" \| "picked" \| "no-photo"` | How it was confirmed |
| `at` | ISO datetime | When found |

Uniqueness: one Find per place. Retake (from the place's description) replaces the photo.
Undo deletes the Find.

### Progress

Key: `progress`

| Field | Type | Rules |
|---|---|---|
| `startedAt` | ISO datetime? | First snap or Start tap |
| `completedAt` | ISO datetime? | Set when `finds.length === places.length` |

### Recap (derived)

`Find[]` ordered by `Place.order` + title + closing note. Partial recaps valid; no-photo
finds render the author's hero visual with a "no photo" badge.

## Proposal rule (pure function, unit-tested)

```text
nextProposedPlace(tour, finds):
  unfound = places not in finds, sorted by order
  if unfound is empty → null (tour complete)
  maxFound = max(order of found places) or 0
  return first p in unfound with p.order > maxFound, else unfound[0]
```

Examples: none found → place 1; found {1,2} → 3; found {1,3} → 4 (not 2); found {2..n}
→ 1; all found → null.

## State transitions (tourState reducer)

```text
Idle ──snap──▶ Capturing ──photo──▶ Proposing(place = nextProposedPlace, photo)
Proposing ──confirm──▶ Found(place, method=proposal)
Proposing ──pickDifferent──▶ Picking(unfound list, photo) ──pick(place)──▶ Found(place, method=picked)
Proposing | Picking ──retake/dismiss──▶ Idle (photo discarded)
Capturing ──camera-denied/failed──▶ CameraUnavailable(place = nextProposedPlace)
CameraUnavailable ──markWithoutPhoto(place | picked)──▶ Found(place, method=no-photo)
Found(place) ──undo──▶ Idle (Find deleted)
PlaceDetail(found) ──retakePhoto──▶ Capturing(target=place) ──photo──▶ Found(place, photo replaced)
any ──all places found──▶ Complete (completedAt set) ──▶ Recap
```

Invariants (unit-tested):
- A found place is never proposed and never listed in "pick a different place".
- Confirm/pick always produces exactly one Find; retake/dismiss produces none.
- Finds may occur in any order; progress = count of Finds.
- Deep-link readability: `found(place) || completedAt || url.after` (research R9).
