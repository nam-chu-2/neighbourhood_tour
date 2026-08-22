// The scrim: the overlay that keeps text legible over a photograph.
//
// The hard part is that the photographs do not exist yet — the author has not
// taken them. So the guarantee cannot be "we checked the hero image"; it has
// to be a property of the design. Every possible photograph lies somewhere
// between pure white and pure black, so a scrim that holds the contrast floor
// over BOTH extremes holds it over every image that could ever be dropped in
// (research R3, FR-013, SC-005).
import { contrastRatio, parseHex } from "./contrast";

export interface Scrim {
  /** Hex colour of the overlay. */
  colour: string;
  /** Overlay opacity, 0–1. */
  alpha: number;
}

export interface TextScrim extends Scrim {
  /** The colour the text is painted in on top of this scrim. */
  textColour: string;
}

const toHex = (value: number): string =>
  Math.round(Math.min(255, Math.max(0, value)))
    .toString(16)
    .padStart(2, "0");

/** Composite `scrim` over `backdrop` — plain source-over alpha blending. */
export function compositeOver(scrim: Scrim, backdrop: string): string {
  const top = parseHex(scrim.colour);
  const bottom = parseHex(backdrop);
  const a = Math.min(1, Math.max(0, scrim.alpha));
  const blend = (t: number, b: number) => t * a + b * (1 - a);
  return `#${toHex(blend(top.r, bottom.r))}${toHex(blend(top.g, bottom.g))}${toHex(
    blend(top.b, bottom.b),
  )}`;
}

/**
 * The contrast this text colour is guaranteed, whatever the photograph does:
 * the weaker of the over-white and over-black cases.
 */
export function worstCaseContrast(textColour: string, scrim: Scrim): number {
  return Math.min(
    contrastRatio(textColour, compositeOver(scrim, "#ffffff")),
    contrastRatio(textColour, compositeOver(scrim, "#000000")),
  );
}

/**
 * The scrim actually used behind hero and stop-lead text. Keep in sync with
 * --scrim-colour / --scrim-alpha in src/styles/tokens.css; the test in
 * tests/unit/scrim.test.ts is what stops these drifting apart.
 */
export const HERO_SCRIM: TextScrim = {
  colour: "#12100e",
  alpha: 0.62,
  textColour: "#fdfaf4",
};
