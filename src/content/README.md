# Authoring the tour content

Everything the passengers see comes from **`tour.ts`** in this directory. It is the
only file the author needs to edit, plus dropping images into **`media/`**. The shape
is enforced by `tests/unit/tourContent.test.ts` against
`specs/001-bells-corners-tour/contracts/tour-content.schema.json` — run `npm test`
after editing.

## Tour fields

| Field | What to write |
|---|---|
| `title` | The tour's name, shown on the welcome screen. |
| `intro` | 2–4 sentences framing Bells Corners for someone who only knows downtown Ottawa. |
| `route.viewBox` / `route.path` | The schematic SVG route the map draws. Keep the viewBox; bend the path however you like. |
| `closingNote` | Shown after the last place is found and on the recap. |
| `places` | 6–10 stops, in **drive order** — see below. |

## Place fields

| Field | What to write |
|---|---|
| `id` | Stable URL-safe slug (`my-old-school`). Used in share links and on-device storage — don't rename after the drive. |
| `order` | **The order you will actually drive the route.** 1-based, no gaps, no repeats. The snap proposal ("Is this the …?") follows this order, so if the rehearsal drive disagrees, fix `order`, not your driving. |
| `name` | Display name; appears in the proposal as "Is this the *name*?" |
| `routePosition` | `{ x, y }` marker position in `route.viewBox` units — place it on the path. |
| `media` | At least one item; the **first** is the hero visual on the place's page. Each needs `src` (import from `./media/`), a meaningful `alt`, a `credit`, and a `kind` (`photo` / `illustration` / `map`). |
| `story` | Your first-person memory of the place — this is the heart of the site. |
| `downtownTranslation` | Optional: "for you downtown folks, this is our …". Leave out where it doesn't fit. |
| `cue` | Optional one-liner shown with the proposal so passengers know what to point the camera at ("blue sign on the right", max 80 chars). |

## Media files

- Put optimized images in `media/` (WebP or JPEG, ≤1600 px long edge — phones on data
  will thank you).
- Reference them the way `tour.ts` already does:
  `new URL("./media/my-photo.webp", import.meta.url).href` — Vite bundles and the
  service worker precaches them for offline use in the car.
- Every image needs `alt` text that works for a screen reader ("the white church at
  the crossroads, photographed from the car"), not a filename.

## Checklist before the drive

1. `npm test` — content contract green.
2. `npm run build && npm run preview` — click through every place on your phone.
3. Rehearsal drive (quickstart.md): count how often the proposal is right; target
   ≥ 9/10. Fix `order`/`cue` if it guesses wrong.
