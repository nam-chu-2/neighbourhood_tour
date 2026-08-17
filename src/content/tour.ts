import type { Tour } from "../domain/types";

// The single authored artefact of this site (see src/content/README.md for
// what each field means). Validated by tests/unit/tourContent.test.ts against
// specs/001-bells-corners-tour/contracts/tour-content.schema.json.
//
// TODO(author): every place below is a placeholder. Replace the names,
// stories, cues, translations and media with the real drive — order = the
// order you will actually drive it!

const placeholder = new URL("./media/placeholder.svg", import.meta.url).href;

export const tour: Tour = {
  id: "bells-corners",
  title: "Bells Corners: The Drive",
  intro:
    "You know the Ottawa of Parliament, the Market and the Canal. Twenty minutes " +
    "west, past the Greenbelt, there's the small village I grew up in. For the next " +
    "half hour you're not downtown any more — you're riding shotgun through my " +
    "childhood. When we pass a place on the list, snap a photo of it to unlock its story.",
  route: {
    viewBox: "0 0 360 640",
    path:
      "M 60 60 C 180 60 280 70 280 130 C 280 200 130 170 90 220 " +
      "C 40 280 300 260 300 330 C 300 410 180 390 120 440 " +
      "C 60 490 260 480 260 560",
  },
  closingNote:
    "TODO(author): the closing note — what Bells Corners means to you now, and a " +
    "thank-you to the six of you for riding along.",
  places: [
    {
      id: "bells-corners-sign",
      order: 1,
      name: "The Bells Corners Sign",
      routePosition: { x: 60, y: 60 },
      cue: "Look right — the sign at the edge of the village",
      story:
        "TODO(author): the story of arriving in Bells Corners — what crossing this " +
        "line meant when you were a kid.",
      downtownTranslation:
        "TODO(author): e.g. this sign is our Welcome-to-the-ByWard-Market arch.",
      media: [
        {
          src: placeholder,
          alt: "Placeholder illustration standing in for a photo of the Bells Corners sign",
          credit: "Placeholder — author photo to come",
          kind: "illustration",
        },
      ],
    },
    {
      id: "old-richmond-road",
      order: 2,
      name: "Old Richmond Road",
      routePosition: { x: 280, y: 130 },
      cue: "The long straight stretch with the old storefronts",
      story:
        "TODO(author): the main-street story — walking this road, what was where, " +
        "what has changed.",
      media: [
        {
          src: placeholder,
          alt: "Placeholder illustration standing in for a photo of Old Richmond Road",
          credit: "Placeholder — author photo to come",
          kind: "illustration",
        },
      ],
    },
    {
      id: "the-school",
      order: 3,
      name: "My Elementary School",
      routePosition: { x: 90, y: 220 },
      cue: "Red brick, low roof, big yard on the left",
      story:
        "TODO(author): a first-person school memory — a teacher, a snow day, the " +
        "walk home.",
      downtownTranslation:
        "TODO(author): e.g. this yard was our Major's Hill Park.",
      media: [
        {
          src: placeholder,
          alt: "Placeholder illustration standing in for a photo of the author's elementary school",
          credit: "Placeholder — author photo to come",
          kind: "illustration",
        },
      ],
    },
    {
      id: "the-plaza",
      order: 4,
      name: "The Plaza",
      routePosition: { x: 300, y: 330 },
      cue: "Strip mall with the big parking lot",
      story:
        "TODO(author): the plaza story — the corner store, allowance money, " +
        "Friday nights.",
      downtownTranslation:
        "TODO(author): e.g. this was our Rideau Centre, all eight shops of it.",
      media: [
        {
          src: placeholder,
          alt: "Placeholder illustration standing in for a photo of the plaza",
          credit: "Placeholder — author photo to come",
          kind: "illustration",
        },
      ],
    },
    {
      id: "greenbelt-woods",
      order: 5,
      name: "The Greenbelt Woods",
      routePosition: { x: 120, y: 440 },
      cue: "Trailhead just past the bend",
      story:
        "TODO(author): the woods story — bikes, forts, getting home before the " +
        "streetlights.",
      downtownTranslation:
        "TODO(author): e.g. our Gatineau Park, no car required.",
      media: [
        {
          src: placeholder,
          alt: "Placeholder illustration standing in for a photo of the Greenbelt woods trailhead",
          credit: "Placeholder — author photo to come",
          kind: "illustration",
        },
      ],
    },
    {
      id: "childhood-street",
      order: 6,
      name: "My Childhood Street",
      routePosition: { x: 260, y: 560 },
      cue: "Third house on the left after the corner",
      story:
        "TODO(author): the home story — the street, the neighbours, the driveway " +
        "hockey net.",
      media: [
        {
          src: placeholder,
          alt: "Placeholder illustration standing in for a photo of the author's childhood street",
          credit: "Placeholder — author photo to come",
          kind: "illustration",
        },
      ],
    },
  ],
};
