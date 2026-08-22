import { describe, expect, it } from "vitest";
import { contrastRatio } from "../../src/domain/contrast";
import { HERO_SCRIM, compositeOver, worstCaseContrast } from "../../src/domain/scrim";

// The scrim is what keeps text legible over photographs the author has not
// taken yet (research R3). The guarantee cannot be "we checked the current
// hero image" — it has to be a property of the design, so it is checked
// against the two extremes every possible photograph lies between.

const FLOOR = 4.5;

describe("compositeOver", () => {
  it("returns the backdrop when the scrim is fully transparent", () => {
    expect(compositeOver({ colour: "#000000", alpha: 0 }, "#ffffff").toLowerCase()).toBe(
      "#ffffff",
    );
  });

  it("returns the scrim colour when it is fully opaque", () => {
    expect(compositeOver({ colour: "#123456", alpha: 1 }, "#ffffff").toLowerCase()).toBe(
      "#123456",
    );
  });

  it("darkens a white backdrop toward the scrim colour", () => {
    const composited = compositeOver({ colour: "#000000", alpha: 0.5 }, "#ffffff");
    // Half black over white is mid grey.
    expect(composited.toLowerCase()).toBe("#808080");
  });

  it("lightens a black backdrop toward the scrim colour", () => {
    const composited = compositeOver({ colour: "#ffffff", alpha: 0.25 }, "#000000");
    expect(composited.toLowerCase()).toBe("#404040");
  });
});

describe("worstCaseContrast", () => {
  it("reports the weaker of the over-white and over-black cases", () => {
    const scrim = { colour: "#000000", alpha: 0.6 };
    const overWhite = contrastRatio("#ffffff", compositeOver(scrim, "#ffffff"));
    const overBlack = contrastRatio("#ffffff", compositeOver(scrim, "#000000"));
    expect(worstCaseContrast("#ffffff", scrim)).toBeCloseTo(Math.min(overWhite, overBlack), 6);
  });

  it("gets worse as the scrim thins", () => {
    const thick = worstCaseContrast("#ffffff", { colour: "#000000", alpha: 0.8 });
    const thin = worstCaseContrast("#ffffff", { colour: "#000000", alpha: 0.2 });
    expect(thin).toBeLessThan(thick);
  });

  it("catches a scrim too weak to guarantee anything", () => {
    // White text on a barely-there scrim fails over a bright sky.
    expect(worstCaseContrast("#ffffff", { colour: "#000000", alpha: 0.1 })).toBeLessThan(FLOOR);
  });
});

describe("the shipped hero scrim", () => {
  it("keeps hero text above the contrast floor over ANY photograph", () => {
    // Over pure white and over pure black both pass, so every image in
    // between passes — including ones that do not exist yet (FR-013, SC-005).
    expect(worstCaseContrast(HERO_SCRIM.textColour, HERO_SCRIM)).toBeGreaterThanOrEqual(FLOOR);
  });

  it("is stated as a real colour and alpha, so the CSS can use it directly", () => {
    expect(HERO_SCRIM.colour).toMatch(/^#[0-9a-f]{6}$/i);
    expect(HERO_SCRIM.alpha).toBeGreaterThan(0);
    expect(HERO_SCRIM.alpha).toBeLessThanOrEqual(1);
  });
});
