# Writing the expedition

Everything a reader sees is in this folder. You do not need to touch anything
else to make the page yours.

## The files

| File | What it holds |
| --- | --- |
| `expedition.ts` | The page: title, dek, facts, overview, seven stops, closing, credits. |
| `media/` | Your photographs. Drop them in here. |
| `images.generated.ts` | Generated — do not edit. Written by `npm run images`. |

Run `npm test` after every edit. The tests are the guardrail: they fail loudly
and specifically when something in here would break the page.

## The shape of it

- **`title`** and **`dek`** — the opening. The dek is one line saying what this
  is; keep it under 160 characters.
- **`facts`** — three to five label/value pairs. Duration, distance and number of
  stops are required; the test checks for them by name.
- **`overview`** — one to four paragraphs. This is where you explain Bells
  Corners to someone whose Ottawa stops at the Greenbelt.
- **`stops`** — exactly seven, numbered 1 to 7 in the order you would drive them.
  Each has a headline, an optional standfirst, at least one image, one to four
  story paragraphs, and an optional `downtownTranslation`.
- **`closing`** and **`credits`** — the end.

The **`downtownTranslation`** is the field that does the most work for the least
effort. "This was our Rideau Centre, all one shop of it" lands harder than a
paragraph of description, because it is written in a language the reader already
speaks.

## Stop ids

An id is a stop's permanent address: it is the anchor in a shareable link
(`…/#our-lady-of-peace`). Change one after you have sent the link round and you break it.
Pick it once, lower case with hyphens, and leave it alone.

## Photographs

**This is the part that decides whether the page works.** An expedition layout
is mostly photography — it has no mechanic to hide behind. With the stand-in
images it will look like a template, because it is one.

1. Put your photographs in `media/`, named to match the `src` in
   `expedition.ts` (e.g. `stop-4-plaza.jpg`).
2. Run `npm run images`.

That generates each photograph at three widths in three formats and records its
dimensions, which is what stops the page jumping around as images load. Commit
the generated files — a fresh clone has to build without running the script.

Two rules the build enforces:

- **Every image needs an `alt` and a `credit`.** The `alt` is what someone who
  cannot see the photograph gets instead; describe what is in it, not that it is
  a photograph.
- **No generated variant may exceed 400 kB.** If the build fails on this, the
  source is far larger than it needs to be — 2000px on the long edge is plenty.

If a photograph named in `expedition.ts` is missing, the script generates a
labelled placeholder rather than failing, and warns you. That is so you can write
the page before you have been out with a camera; it is not meant to ship.
