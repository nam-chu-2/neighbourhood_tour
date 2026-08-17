import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { composeRecap, recapLayout } from "../../src/recap/composeRecap";
import { makeFind, makeTour } from "./testTour";

// FR-009: the recap is one canvas-composed JPEG of the visitor's own photos
// in route order. jsdom has no canvas; the 2D context and createImageBitmap
// are mocked and the calls captured.

const tour = makeTour(6);

describe("recapLayout", () => {
  it("uses a 2-column grid and grows by row", () => {
    const one = recapLayout(1);
    const three = recapLayout(3);
    const six = recapLayout(6);
    expect(one.cols).toBe(2);
    expect(one.rows).toBe(1);
    expect(three.rows).toBe(2);
    expect(six.rows).toBe(3);
    expect(three.height).toBeGreaterThan(one.height);
    expect(six.height).toBeGreaterThan(three.height);
    expect(one.width).toBe(six.width);
  });
});

describe("composeRecap", () => {
  let canvasSize: { width: number; height: number };
  let toBlobType: string | undefined;
  let drawImageCalls: unknown[][];
  let fillTexts: string[];

  beforeEach(() => {
    canvasSize = { width: 0, height: 0 };
    toBlobType = undefined;
    drawImageCalls = [];
    fillTexts = [];

    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => ({ width: 800, height: 600, close: vi.fn() })),
    );

    HTMLCanvasElement.prototype.getContext = vi.fn(() => {
      return {
        fillStyle: "",
        font: "",
        textAlign: "left",
        textBaseline: "alphabetic",
        fillRect: vi.fn(),
        drawImage: (...args: unknown[]) => {
          drawImageCalls.push(args);
        },
        fillText: (text: string) => {
          fillTexts.push(text);
        },
      } as unknown as CanvasRenderingContext2D;
    }) as never;

    HTMLCanvasElement.prototype.toBlob = function (
      cb: BlobCallback,
      type?: string,
      _quality?: number,
    ) {
      canvasSize = { width: this.width, height: this.height };
      toBlobType = type;
      cb(new Blob(["recap"], { type: type ?? "image/png" }));
    };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([1, 3, 6])("sizes the canvas from the layout for %i find(s)", async (count) => {
    const finds = tour.places.slice(0, count).map((place) => makeFind(place.id));
    const blob = await composeRecap(finds, tour);
    expect(blob.type).toBe("image/jpeg");
    expect(toBlobType).toBe("image/jpeg");
    const layout = recapLayout(count);
    expect(canvasSize).toEqual({ width: layout.width, height: layout.height });
  });

  it("orders tiles by place order regardless of find order", async () => {
    await composeRecap([makeFind("p5"), makeFind("p1"), makeFind("p3")], tour);
    const captions = fillTexts.filter((text) => /Place \d/.test(text));
    expect(captions).toEqual(["1. Place 1", "3. Place 3", "5. Place 5"]);
  });

  it("draws a photo for every photo find and a 'no photo' tile for null", async () => {
    await composeRecap(
      [makeFind("p1"), makeFind("p2", { photo: null, method: "no-photo" })],
      tour,
    );
    expect(drawImageCalls).toHaveLength(1);
    expect(fillTexts.some((text) => /no photo/i.test(text))).toBe(true);
  });

  it("includes the tour title and closing note", async () => {
    await composeRecap([makeFind("p1")], tour);
    expect(fillTexts).toContain(tour.title);
    expect(fillTexts.some((text) => text.includes(tour.closingNote))).toBe(true);
  });
});
