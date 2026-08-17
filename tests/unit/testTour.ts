import type { Find, FindMethod, Place, Tour } from "../../src/domain/types";

// Small tour factory for unit tests: places p1..pN with order 1..N.
export function makeTour(n = 4): Tour {
  const places: Place[] = Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    order: i + 1,
    name: `Place ${i + 1}`,
    routePosition: { x: 10 * (i + 1), y: 20 * (i + 1) },
    media: [
      {
        src: `media/p${i + 1}.jpg`,
        alt: `Photo of place ${i + 1}`,
        credit: "test",
        kind: "photo",
      },
    ],
    story: `Story ${i + 1}`,
  }));
  return {
    id: "bells-corners",
    title: "Test tour",
    intro: "Intro",
    route: { viewBox: "0 0 100 100", path: "M 0 0 L 100 100" },
    closingNote: "The end.",
    places,
  };
}

/** jsdom's Blob has no .text(); read via FileReader instead. */
export function readBlobText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

export function makeFind(
  placeId: string,
  overrides: Partial<Omit<Find, "placeId">> = {},
): Find {
  return {
    placeId,
    photo: new Blob(["photo-bytes"], { type: "image/jpeg" }),
    method: "proposal" as FindMethod,
    at: "2026-08-17T12:00:00.000Z",
    ...overrides,
  };
}
