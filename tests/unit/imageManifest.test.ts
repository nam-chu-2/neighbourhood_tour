import { describe, expect, it } from "vitest";
import { expedition } from "../../src/content/expedition";
import { imageManifest, lookupImage } from "../../src/content/images.generated";

// The manifest is what stops the page shifting under the reader as
// photographs arrive, and what keeps an 8 MB phone snap out of the build
// (research R2, R9).

const MAX_VARIANT_BYTES = 400 * 1024;

const authoredSources = () =>
  [expedition.heroImage, ...expedition.stops.flatMap((stop) => stop.images)].map(
    (image) => image.src,
  );

describe("image manifest", () => {
  it("has an entry for every image the content references", () => {
    for (const source of authoredSources()) {
      expect(lookupImage(source), `no manifest entry for ${source}`).toBeDefined();
    }
  });

  it("records positive intrinsic dimensions so every image box is reserved", () => {
    for (const entry of imageManifest) {
      expect(entry.width).toBeGreaterThan(0);
      expect(entry.height).toBeGreaterThan(0);
      expect(Number.isInteger(entry.width)).toBe(true);
      expect(Number.isInteger(entry.height)).toBe(true);
      expect(entry.aspectRatio).toBeCloseTo(entry.width / entry.height, 4);
    }
  });

  it("offers every format at every generated width", () => {
    for (const entry of imageManifest) {
      const widths = [...new Set(entry.variants.map((variant) => variant.width))];
      for (const width of widths) {
        const formats = entry.variants
          .filter((variant) => variant.width === width)
          .map((variant) => variant.format)
          .sort();
        expect(formats, `${entry.source} at ${width}px`).toEqual(["avif", "jpeg", "webp"]);
      }
    }
  });

  it("never upscales past the source width", () => {
    for (const entry of imageManifest) {
      for (const variant of entry.variants) {
        expect(variant.width).toBeLessThanOrEqual(entry.width);
      }
    }
  });

  it("keeps every variant inside the weight budget", () => {
    for (const entry of imageManifest) {
      for (const variant of entry.variants) {
        expect(
          variant.bytes,
          `${entry.source} ${variant.format}@${variant.width} is over budget`,
        ).toBeLessThanOrEqual(MAX_VARIANT_BYTES);
      }
    }
  });

  it("gives every variant a usable url", () => {
    for (const entry of imageManifest) {
      expect(entry.variants.length).toBeGreaterThan(0);
      for (const variant of entry.variants) {
        expect(variant.url.length).toBeGreaterThan(0);
      }
    }
  });
});
