import { describe, expect, it } from "vitest";
import { palette } from "../../src/content/palette";
import { contrastRatio, mixOklab } from "../../src/domain/contrast";

const FLOOR = 4.5;
const SAMPLES = 9;

describe("palette stops", () => {
  it("has between 4 and 6 stops", () => {
    expect(palette.length).toBeGreaterThanOrEqual(4);
    expect(palette.length).toBeLessThanOrEqual(6);
  });

  it("runs from 0 to 1 with strictly increasing positions", () => {
    expect(palette[0]!.at).toBe(0);
    expect(palette[palette.length - 1]!.at).toBe(1);
    for (let i = 1; i < palette.length; i += 1) {
      expect(palette[i]!.at).toBeGreaterThan(palette[i - 1]!.at);
    }
  });

  it("spaces the stops evenly — the dial's CSS interpolates in equal segments", () => {
    const step = 1 / (palette.length - 1);
    palette.forEach((stop, index) => {
      expect(stop.at).toBeCloseTo(index * step, 6);
    });
  });

  it("names every stop", () => {
    const names = palette.map((stop) => stop.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("holds the contrast floor at every stop", () => {
    for (const stop of palette) {
      expect(contrastRatio(stop.ink, stop.bg)).toBeGreaterThanOrEqual(FLOOR);
      expect(contrastRatio(stop.accent, stop.bg)).toBeGreaterThanOrEqual(FLOOR);
    }
  });

  // The palette is continuous, so the floor has to hold *between* stops as
  // well — a visitor can park the needle anywhere (research R5, SC-006).
  it("holds the contrast floor at sampled mid-points between stops", () => {
    for (let i = 1; i < palette.length; i += 1) {
      const from = palette[i - 1]!;
      const to = palette[i]!;
      for (let s = 1; s < SAMPLES; s += 1) {
        const t = s / SAMPLES;
        const bg = mixOklab(from.bg, to.bg, t);
        const ink = mixOklab(from.ink, to.ink, t);
        const accent = mixOklab(from.accent, to.accent, t);
        expect(contrastRatio(ink, bg), `ink at ${from.name}→${to.name} t=${t}`).toBeGreaterThanOrEqual(FLOOR);
        expect(contrastRatio(accent, bg), `accent at ${from.name}→${to.name} t=${t}`).toBeGreaterThanOrEqual(FLOOR);
      }
    }
  });
});
