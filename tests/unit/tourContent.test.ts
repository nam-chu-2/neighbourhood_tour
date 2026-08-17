import { describe, expect, it } from "vitest";
import Ajv2020 from "ajv/dist/2020";
import schema from "../../specs/001-bells-corners-tour/contracts/tour-content.schema.json";
import { tour } from "../../src/content/tour";

// The authored content is the only contract in this feature (plan.md):
// whatever the author writes into src/content/tour.ts must satisfy
// contracts/tour-content.schema.json or the build is not shippable.
describe("tour content contract", () => {
  it("validates against tour-content.schema.json", () => {
    const ajv = new Ajv2020({ allErrors: true });
    const validate = ajv.compile(schema);
    // Media src values are Vite asset URLs at runtime; the schema only
    // requires non-empty strings, so the real object validates as-is.
    const valid = validate(JSON.parse(JSON.stringify(tour)));
    expect(validate.errors ?? []).toEqual([]);
    expect(valid).toBe(true);
  });

  it("has unique place ids", () => {
    const ids = tour.places.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique orders covering exactly 1..n", () => {
    const orders = [...tour.places.map((p) => p.order)].sort((a, b) => a - b);
    expect(orders).toEqual(tour.places.map((_, i) => i + 1));
  });

  it("gives every media item meaningful alt text", () => {
    for (const place of tour.places) {
      expect(place.media.length).toBeGreaterThanOrEqual(1);
      for (const media of place.media) {
        expect(media.alt.trim().length).toBeGreaterThanOrEqual(3);
      }
    }
  });
});
