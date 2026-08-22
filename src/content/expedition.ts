import type { Expedition } from "../domain/types";

// The single authored artefact of this site — see src/content/README.md.
// Validated by tests/unit/expeditionContent.test.ts against
// specs/003-editorial-expedition-page/contracts/expedition-content.schema.json.
//
// TODO(author): the prose below is placeholder. Replace the overview, the seven
// stories, the translations and the closing with the real thing — and put real
// photographs in src/content/media/, then run `npm run images`. Until then the
// page renders stand-in images and will look like a template, which is exactly
// what it is.

export const expedition: Expedition = {
  id: "bells-corners",
  title: "Bells Corners",
  dek: "Twenty-five minutes west of Parliament, seven stops through the village I grew up in — and the beach at the end of it.",
  heroImage: {
    src: "hero-robertson-road.jpg",
    alt: "Robertson Road running west through Bells Corners at the end of the afternoon",
    credit: "Placeholder — author photograph to come",
  },
  facts: [
    // TODO(author): check the duration and distance against the drive you actually did.
    { label: "Duration", value: "35 minutes" },
    { label: "Distance", value: "15 kilometres" },
    { label: "Stops", value: "Seven" },
    { label: "Season", value: "Any, but it is best in September" },
    { label: "Difficulty", value: "One right turn off the Queensway" },
  ],
  overview: [
    "TODO(author): the opening framing — what Bells Corners is, where it sits relative to " +
      "the Ottawa your readers know, and why a village swallowed by a city is still a village.",
    "TODO(author): the personal turn — why you are the one giving this tour, and what you " +
      "want someone who has only ever seen the Market and the Canal to understand by the end.",
  ],
  closing:
    "TODO(author): the closing note — what Bells Corners means to you now that you have " +
    "driven your co-workers through it, and a thank-you for coming along.",
  credits: "Photographs by the author. Bells Corners, Ottawa.",
  stops: [
    {
      id: "st-paul-high-school",
      number: 1,
      headline: "St. Paul High School",
      standfirst: "Five years, and the bus that got me there",
      images: [
        {
          src: "stop-1-st-paul.jpg",
          alt: "St. Paul High School seen from the road, its long low front and the field beside it",
          credit: "Placeholder — author photograph to come",
        },
      ],
      story: [
        "TODO(author): the high-school story — the bus ride out, a teacher who mattered, " +
          "the field, the cafeteria, and what it felt like to leave at the end of it.",
      ],
      downtownTranslation:
        "TODO(author): e.g. this was our Lisgar, minus the two hundred years of it.",
    },
    {
      id: "st-john-the-apostle",
      number: 2,
      headline: "St. John the Apostle School",
      standfirst: "Red brick, low roof, and a yard that seemed enormous",
      images: [
        {
          src: "stop-2-st-john.jpg",
          alt: "St. John the Apostle School: red brick, low roof, and the wide yard behind it",
          credit: "Placeholder — author photograph to come",
        },
      ],
      story: [
        "TODO(author): a first-person elementary-school memory — a teacher, a snow day, the " +
          "walk home in the dark at four in the afternoon.",
      ],
      downtownTranslation: "TODO(author): e.g. this yard was our Major's Hill Park.",
    },
    {
      id: "stinson-avenue",
      number: 3,
      headline: "5 Stinson Avenue",
      standfirst: "The address that still comes out before any other",
      images: [
        {
          src: "stop-3-stinson-avenue.jpg",
          alt: "The house at 5 Stinson Avenue, seen from the end of the driveway",
          credit: "Placeholder — author photograph to come",
        },
      ],
      story: [
        "TODO(author): the home story — the street, the neighbours, the driveway hockey net, " +
          "and what it is like to drive past it as a visitor.",
      ],
    },
    {
      id: "our-lady-of-peace",
      number: 4,
      headline: "Our Lady of Peace",
      standfirst: "Sunday mornings, and the parking lot afterwards",
      images: [
        {
          src: "stop-4-our-lady-of-peace.jpg",
          alt: "Our Lady of Peace, its doors and the parking lot in front of them",
          credit: "Placeholder — author photograph to come",
        },
      ],
      story: [
        "TODO(author): the parish story — who you sat with, what the year sounded like from " +
          "inside it, and how much of the village you only ever saw in that car park.",
      ],
      downtownTranslation:
        "TODO(author): e.g. this was our Notre-Dame, at a tenth of the scale and twice the " +
        "attendance.",
    },
    {
      id: "mcdonalds",
      number: 5,
      headline: "The McDonald's",
      standfirst: "The one on Robertson Road, and for years the only thing open",
      images: [
        {
          src: "stop-5-mcdonalds.jpg",
          alt: "The McDonald's on Robertson Road, its sign lit against the evening",
          credit: "Placeholder — author photograph to come",
        },
      ],
      story: [
        "TODO(author): the McDonald's story — after school, after games, after everything; " +
          "who you met there and what a booth is for when you are fifteen.",
      ],
      downtownTranslation:
        "TODO(author): e.g. this was our Elgin Street, all of it, under one roof.",
    },
    {
      id: "canadian-tire",
      number: 6,
      headline: "Canadian Tire",
      standfirst: "An afternoon out, if the afternoon was slow enough",
      images: [
        {
          src: "stop-6-canadian-tire.jpg",
          alt: "The Canadian Tire storefront and its parking lot",
          credit: "Placeholder — author photograph to come",
        },
      ],
      story: [
        "TODO(author): the Canadian Tire story — errands with a parent, the aisle you " +
          "disappeared into, the skates or the bike that came home in the back seat.",
      ],
      downtownTranslation: "TODO(author): e.g. this was our Rideau Centre, all one shop of it.",
    },
    {
      id: "britannia-beach",
      number: 7,
      headline: "Britannia Beach",
      standfirst: "Where the village went to see water",
      images: [
        {
          src: "stop-7-britannia-beach.jpg",
          alt: "Britannia Beach on the Ottawa River, the sand curving away towards the water",
          credit: "Placeholder — author photograph to come",
        },
      ],
      story: [
        "TODO(author): the beach story — the drive out, summers on the sand, and why the " +
          "tour ends here rather than back where it started.",
      ],
      downtownTranslation: "TODO(author): e.g. our Dow's Lake, with an actual river attached.",
    },
  ],
};
