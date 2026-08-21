// Band geometry: the pure maths that turns authored frequencies into positions
// and a scroll offset back into a station (data-model.md "Band geometry").
//
// Everything here is a pure function of numbers so the mechanic can be
// test-driven without a browser (Constitution III) — the DOM only ever
// supplies scrollLeft, scrollWidth and clientWidth.
import type { Band } from "./types";

/** How much of the gap to a neighbour counts as "in range" of a station. */
const LOCK_SHARE_OF_GAP = 0.3;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/** Where a station sits along the band, 0 (left end) to 1 (right end). */
export function positionOf(station: { frequency: number }, band: Band): number {
  const span = band.max - band.min;
  if (span <= 0) return 0;
  return clamp01((station.frequency - band.min) / span);
}

/**
 * The `--tune` value for a scroll position: 0–1 across everything the band can
 * scroll. Returns 0 when the band cannot scroll at all, and clamps rubber-band
 * overscroll at either end so the needle never reports off the dial.
 */
export function tuneAt(scrollLeft: number, scrollWidth: number, clientWidth: number): number {
  const scrollable = scrollWidth - clientWidth;
  if (scrollable <= 0) return 0;
  return clamp01(scrollLeft / scrollable);
}

/** The station closest to `tune`, with its distance in band units (0–1). */
export function nearestStation<T extends { frequency: number }>(
  tune: number,
  stations: readonly T[],
  band: Band,
): { station: T; distance: number } | null {
  let best: { station: T; distance: number } | null = null;
  for (const station of stations) {
    const distance = Math.abs(positionOf(station, band) - tune);
    if (best === null || distance < best.distance) best = { station, distance };
  }
  return best;
}

/**
 * The `--detune` value: 0 dead centre on a station, 1 at or beyond the lock
 * radius. Drives noise, blur, needle glow and hiss gain.
 */
export function detuneOf(distance: number, lockRadius: number): number {
  if (lockRadius <= 0) return 1;
  return clamp01(distance / lockRadius);
}

/**
 * How close counts as "on" a station. Derived from the tightest spacing on the
 * band so two lock zones can never overlap — which is why the content contract
 * enforces a minimum frequency gap.
 */
export function lockRadiusFor(
  stations: readonly { frequency: number }[],
  band: Band,
): number {
  if (stations.length < 2) return 0.5;
  const positions = stations.map((station) => positionOf(station, band)).sort((a, b) => a - b);
  let smallestGap = Number.POSITIVE_INFINITY;
  for (let i = 1; i < positions.length; i += 1) {
    const previous = positions[i - 1];
    const current = positions[i];
    if (previous === undefined || current === undefined) continue;
    smallestGap = Math.min(smallestGap, current - previous);
  }
  if (!Number.isFinite(smallestGap) || smallestGap <= 0) return 0;
  return smallestGap * LOCK_SHARE_OF_GAP;
}
