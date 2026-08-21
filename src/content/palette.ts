import type { PaletteStop } from "../domain/types";

// The light the dial travels through, from one end of the band to the other
// (FR-011). Think of the backlight of a car radio as the drive goes on: cold
// blue before sunrise, green morning, low amber sun, purple dusk, and the
// strip-mall neon at the far end of Robertson Road.
//
// Every stop — and every interpolated point between stops — must keep ink and
// accent at 4.5:1 or better on its background. tests/unit/palette.test.ts
// enforces that, so edit these colours and run `npm test` before trusting them.

export const palette: PaletteStop[] = [
  {
    at: 0,
    name: "predawn",
    bg: "#0d1426",
    ink: "#e9eefb",
    accent: "#79b0ff",
  },
  {
    at: 0.25,
    name: "morning",
    bg: "#0e2320",
    ink: "#e7f6f0",
    accent: "#6ed7a4",
  },
  {
    at: 0.5,
    name: "golden",
    bg: "#2a1c0c",
    ink: "#fdf2e2",
    accent: "#f5b04a",
  },
  {
    at: 0.75,
    name: "dusk",
    bg: "#231027",
    ink: "#f7eafb",
    accent: "#dc93ff",
  },
  {
    at: 1,
    name: "neon",
    bg: "#1b0a13",
    ink: "#ffeaf4",
    accent: "#ff6ba9",
  },
];
