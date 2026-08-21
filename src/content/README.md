# Authoring the broadcast

Everything a visitor reads or sees lives in this folder. You do not need to touch
anything else to make the tour yours.

## The files

| File | What it holds |
| --- | --- |
| `broadcast.ts` | The tour: its title, the opening instruction, the band, every station, and the sign-off. |
| `palette.ts` | The five colours the dial travels through, from predawn to neon. |
| `media/` | Your images. `noise.png` is generated — leave it alone. |

Run `npm test` after every edit. The tests are the authoring guardrail: they fail
loudly and specifically when something in here would break the tour.

## Stations

Each station is one place in Bells Corners. Fill in:

- **`name`** — what you would call it out loud.
- **`frequency`** — where it sits on the dial, e.g. `99.5`. **The order of the
  frequencies is the order of the drive**, so list them the way you would pass
  the places. Two rules: they must increase down the list, and neighbours must
  be at least `0.4` apart, so their lock zones cannot overlap.
- **`memory`** — the first-person story. This is the heart of it; write it the
  way you would say it in the car.
- **`downtownTranslation`** — optional, and the thing that makes it land for
  people who only know the core: "this was our Rideau Centre, all eight shops of
  it."
- **`callSign`** — optional flavour, e.g. `CPLZ`. Decorative only; never put
  meaning here that is not also in the name or the memory.
- **`visuals`** — at least one. Every visual needs an **`alt`** that describes
  what is in it (someone who cannot see the image is relying on it) and a
  **`credit`**.

Six to ten stations is the intended length — long enough to be a tour, short
enough to hold attention.

## The `id` field

An id is a station's permanent address: it appears in shareable links and in the
visitor's saved progress. Change one after you have sent the link around and you
break both. Pick it once, in lower case with hyphens, and leave it.

## Palette

Five stops, each with a background, an ink colour for text, and an accent. The
dial blends between them as the visitor tunes, so a stop is not a theme — it is a
moment in the light.

Any colour you choose has to stay readable, including everywhere *between* two
stops. `npm test` checks that for you at every stop and at sampled points in
between; if it fails, darken the background or brighten the ink.

## Images

Put them in `media/` and import them the way `broadcast.ts` already does. Keep
them reasonably sized — the whole site is precached so it works offline, and
every megabyte is a megabyte someone waits for on mobile data.
