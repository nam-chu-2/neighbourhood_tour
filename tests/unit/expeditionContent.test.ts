import { readFileSync } from "node:fs";
import { resolve } from "node:path";
// The contract is a 2020-12 schema, so Ajv's 2020 build is the right one.
import Ajv from "ajv/dist/2020";
import { describe, expect, it } from "vitest";
import { expedition } from "../../src/content/expedition";

const schema = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "specs/003-editorial-expedition-page/contracts/expedition-content.schema.json"),
    "utf8",
  ),
);

const allImages = () => [
  expedition.heroImage,
  ...expedition.stops.flatMap((stop) => stop.images),
];

// The authored content is the one artefact a non-developer edits, so these
// assertions are the authoring guardrail described in quickstart.md.
describe("expedition content", () => {
  it("matches the published content contract", () => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validate = ajv.compile(schema);
    const valid = validate(JSON.parse(JSON.stringify(expedition)));
    expect(validate.errors ?? []).toEqual([]);
    expect(valid).toBe(true);
  });

  it("numbers the stops 1..7 contiguously, matching their order on the page", () => {
    expect(expedition.stops).toHaveLength(7);
    expedition.stops.forEach((stop, index) => {
      expect(stop.number).toBe(index + 1);
    });
  });

  it("has unique, URL-safe stop ids — they are the anchors people share", () => {
    const ids = expedition.stops.map((stop) => stop.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("gives every image a meaningful text alternative and a credit", () => {
    for (const image of allImages()) {
      expect(image.alt.trim().length).toBeGreaterThan(0);
      expect(image.credit.trim().length).toBeGreaterThan(0);
    }
  });

  it("covers duration, distance and number of stops in the facts strip", () => {
    const labels = expedition.facts.map((fact) => fact.label.toLowerCase()).join(" ");
    for (const required of ["duration", "distance", "stops"]) {
      expect(labels, `facts strip must mention ${required}`).toContain(required);
    }
    for (const fact of expedition.facts) {
      expect(fact.value.trim().length).toBeGreaterThan(0);
    }
  });

  it("has prose everywhere the page has no mechanic to hide behind", () => {
    expect(expedition.overview.length).toBeGreaterThan(0);
    for (const paragraph of expedition.overview) {
      expect(paragraph.trim().length).toBeGreaterThan(0);
    }
    for (const stop of expedition.stops) {
      expect(stop.story.length).toBeGreaterThan(0);
      for (const paragraph of stop.story) {
        expect(paragraph.trim().length).toBeGreaterThan(0);
      }
      expect(stop.headline.trim().length).toBeGreaterThan(0);
    }
    expect(expedition.closing.trim().length).toBeGreaterThan(0);
    expect(expedition.credits.trim().length).toBeGreaterThan(0);
    expect(expedition.dek.trim().length).toBeGreaterThan(0);
  });
});
