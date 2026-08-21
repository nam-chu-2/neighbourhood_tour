import { readFileSync } from "node:fs";
import { resolve } from "node:path";
// The contract is a 2020-12 schema, so Ajv's 2020 build is the right one.
import Ajv from "ajv/dist/2020";
import { describe, expect, it } from "vitest";
import { broadcast } from "../../src/content/broadcast";

// Read from the repo root: the contract lives with the spec, not with the
// source, so the authored content is checked against the published contract.
const schema = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "specs/002-radio-dial-tour/contracts/broadcast-content.schema.json"),
    "utf8",
  ),
);

// The authored content is the one artefact a non-developer edits, so these
// assertions are the authoring guardrail described in quickstart.md.
describe("broadcast content", () => {
  it("matches the published content contract", () => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validate = ajv.compile(schema);
    const valid = validate(JSON.parse(JSON.stringify(broadcast)));
    expect(validate.errors ?? []).toEqual([]);
    expect(valid).toBe(true);
  });

  it("has 1-based, contiguous order matching array position", () => {
    broadcast.stations.forEach((station, index) => {
      expect(station.order).toBe(index + 1);
    });
  });

  it("has strictly increasing frequencies — the band order is the road order", () => {
    const frequencies = broadcast.stations.map((s) => s.frequency);
    const sorted = [...frequencies].sort((a, b) => a - b);
    expect(frequencies).toEqual(sorted);
    expect(new Set(frequencies).size).toBe(frequencies.length);
  });

  it("keeps neighbouring stations at least 0.4 apart so lock zones cannot overlap", () => {
    const frequencies = broadcast.stations.map((station) => station.frequency);
    for (let i = 1; i < frequencies.length; i += 1) {
      expect(frequencies[i]! - frequencies[i - 1]!).toBeGreaterThanOrEqual(0.4);
    }
  });

  it("keeps every frequency inside the band", () => {
    for (const station of broadcast.stations) {
      expect(station.frequency).toBeGreaterThanOrEqual(broadcast.band.min);
      expect(station.frequency).toBeLessThanOrEqual(broadcast.band.max);
    }
  });

  it("has unique, URL-safe station ids — they are deep links and storage keys", () => {
    const ids = broadcast.stations.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("gives every visual a meaningful text alternative", () => {
    for (const station of broadcast.stations) {
      expect(station.visuals.length).toBeGreaterThan(0);
      for (const visual of station.visuals) {
        expect(visual.alt.trim().length).toBeGreaterThan(0);
        expect(visual.credit.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("carries an intro and a sign-off", () => {
    expect(broadcast.intro.trim().length).toBeGreaterThan(0);
    expect(broadcast.signOff.trim().length).toBeGreaterThan(0);
  });
});
