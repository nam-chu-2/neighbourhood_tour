import type { Broadcast } from "../domain/types";

// The single authored artefact of this site — see src/content/README.md.
// Validated by tests/unit/broadcastContent.test.ts against
// specs/002-radio-dial-tour/contracts/broadcast-content.schema.json.
//
// TODO(author): every station below is a placeholder carried over from the
// first version of this tour. Replace the names, memories, translations and
// visuals with the real thing — and set the frequencies in the order you would
// actually pass the places driving through the village.

const placeholder = new URL("./media/placeholder.svg", import.meta.url).href;

const stand_in = (name: string) => ({
  src: placeholder,
  alt: `Placeholder illustration standing in for a photograph of ${name}`,
  credit: "Placeholder — author photograph to come",
  kind: "illustration" as const,
});

export const broadcast: Broadcast = {
  id: "bells-corners",
  title: "Bells Corners Radio",
  intro:
    "You know the Ottawa of Parliament, the Market and the Canal. Twenty minutes west, " +
    "past the Greenbelt, there is the village I grew up in — and it is on the air. " +
    "Drag the dial. Every station is a place I know by heart.",
  band: { min: 87.5, max: 108.5 },
  signOff:
    "TODO(author): the sign-off — what Bells Corners means to you now, and a thank-you " +
    "to the six of you for tuning in.",
  stations: [
    {
      id: "bells-corners-sign",
      order: 1,
      frequency: 89.5,
      name: "The Bells Corners Sign",
      callSign: "CBLL",
      memory:
        "TODO(author): the story of arriving in Bells Corners — what crossing this line " +
        "meant when you were a kid.",
      downtownTranslation:
        "TODO(author): e.g. this sign is our Welcome-to-the-ByWard-Market arch.",
      visuals: [stand_in("the Bells Corners sign")],
    },
    {
      id: "old-richmond-road",
      order: 2,
      frequency: 92.9,
      name: "Old Richmond Road",
      callSign: "CORR",
      memory:
        "TODO(author): the main-street story — walking this road, what was where, what " +
        "has changed.",
      visuals: [stand_in("Old Richmond Road")],
    },
    {
      id: "the-school",
      order: 3,
      frequency: 96.3,
      name: "My Elementary School",
      callSign: "CSCH",
      memory:
        "TODO(author): a first-person school memory — a teacher, a snow day, the walk home.",
      downtownTranslation: "TODO(author): e.g. this yard was our Major's Hill Park.",
      visuals: [stand_in("the author's elementary school")],
    },
    {
      id: "the-plaza",
      order: 4,
      frequency: 99.7,
      name: "The Plaza",
      callSign: "CPLZ",
      memory:
        "TODO(author): the plaza story — the corner store, allowance money, Friday nights.",
      downtownTranslation:
        "TODO(author): e.g. this was our Rideau Centre, all eight shops of it.",
      visuals: [stand_in("the plaza")],
    },
    {
      id: "greenbelt-woods",
      order: 5,
      frequency: 103.1,
      name: "The Greenbelt Woods",
      callSign: "CGRN",
      memory:
        "TODO(author): the woods story — bikes, forts, getting home before the streetlights.",
      downtownTranslation: "TODO(author): e.g. our Gatineau Park, no car required.",
      visuals: [stand_in("the Greenbelt woods trailhead")],
    },
    {
      id: "childhood-street",
      order: 6,
      frequency: 106.5,
      name: "My Childhood Street",
      callSign: "CHOM",
      memory:
        "TODO(author): the home story — the street, the neighbours, the driveway hockey net.",
      visuals: [stand_in("the author's childhood street")],
    },
  ],
};
