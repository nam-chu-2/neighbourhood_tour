import { describe, expect, it } from "vitest";
import { contrastRatio, mixOklab, parseHex, relativeLuminance } from "../../src/domain/contrast";

describe("parseHex", () => {
  it("reads 6-digit and 3-digit hex", () => {
    expect(parseHex("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseHex("#0f0")).toEqual({ r: 0, g: 255, b: 0 });
  });

  it("rejects anything that is not a hex colour", () => {
    expect(() => parseHex("rebeccapurple")).toThrow();
    expect(() => parseHex("#ff00")).toThrow();
  });
});

describe("relativeLuminance", () => {
  it("matches the WCAG extremes", () => {
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 6);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 6);
  });
});

describe("contrastRatio", () => {
  it("is 21:1 for black on white, either way round", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 2);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 2);
  });

  it("is 1:1 for a colour against itself", () => {
    expect(contrastRatio("#3d5a80", "#3d5a80")).toBeCloseTo(1, 6);
  });

  it("matches known WCAG reference pairs", () => {
    // #767676 is the canonical darkest-passing grey on white (≈4.54:1); one
    // step lighter drops under the floor. Getting this boundary right is what
    // makes the palette test trustworthy.
    expect(contrastRatio("#767676", "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#777777", "#ffffff")).toBeLessThan(4.5);
    expect(contrastRatio("#949494", "#ffffff")).toBeLessThan(4.5);
  });
});

describe("mixOklab", () => {
  it("returns the endpoints at t=0 and t=1", () => {
    expect(mixOklab("#101828", "#ff5fa2", 0).toLowerCase()).toBe("#101828");
    expect(mixOklab("#101828", "#ff5fa2", 1).toLowerCase()).toBe("#ff5fa2");
  });

  it("produces a midpoint whose luminance sits between the two ends", () => {
    const mid = mixOklab("#101828", "#ffffff", 0.5);
    const midLum = relativeLuminance(mid);
    expect(midLum).toBeGreaterThan(relativeLuminance("#101828"));
    expect(midLum).toBeLessThan(relativeLuminance("#ffffff"));
  });

  it("interpolates perceptually, not numerically", () => {
    // Oklab's midpoint of black→white sits at perceptual lightness 0.5, whose
    // relative luminance is ≈0.125 — markedly different from the naive sRGB
    // average #808080 (≈0.216). Mixing perceptually is why the palette keeps
    // its luminance predictable between stops (research R5).
    const mid = relativeLuminance(mixOklab("#000000", "#ffffff", 0.5));
    expect(mid).toBeCloseTo(0.125, 2);
    expect(Math.abs(mid - 0.216)).toBeGreaterThan(0.05);
  });
});
