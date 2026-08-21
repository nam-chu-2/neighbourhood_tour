import { describe, expect, it } from "vitest";
import {
  detuneOf,
  lockRadiusFor,
  nearestStation,
  positionOf,
  tuneAt,
} from "../../src/domain/band";
import type { Band } from "../../src/domain/types";

const band: Band = { min: 88, max: 108 };
const stations = [
  { id: "a", frequency: 88 },
  { id: "b", frequency: 98 },
  { id: "c", frequency: 108 },
];

describe("positionOf", () => {
  it("maps the band ends to 0 and 1", () => {
    expect(positionOf({ frequency: 88 }, band)).toBe(0);
    expect(positionOf({ frequency: 108 }, band)).toBe(1);
  });

  it("is linear in frequency", () => {
    expect(positionOf({ frequency: 98 }, band)).toBeCloseTo(0.5, 10);
    expect(positionOf({ frequency: 93 }, band)).toBeCloseTo(0.25, 10);
  });

  it("clamps frequencies outside the band", () => {
    expect(positionOf({ frequency: 80 }, band)).toBe(0);
    expect(positionOf({ frequency: 120 }, band)).toBe(1);
  });

  it("returns 0 for a zero-width band rather than dividing by zero", () => {
    expect(positionOf({ frequency: 99 }, { min: 99, max: 99 })).toBe(0);
  });
});

describe("tuneAt", () => {
  it("maps scroll offset to 0..1 across the scrollable width", () => {
    expect(tuneAt(0, 1000, 400)).toBe(0);
    expect(tuneAt(600, 1000, 400)).toBe(1);
    expect(tuneAt(300, 1000, 400)).toBeCloseTo(0.5, 10);
  });

  it("returns 0 when the band cannot scroll", () => {
    expect(tuneAt(0, 400, 400)).toBe(0);
    expect(tuneAt(50, 300, 400)).toBe(0);
  });

  it("clamps beyond either end (rubber-band overscroll)", () => {
    expect(tuneAt(-80, 1000, 400)).toBe(0);
    expect(tuneAt(9999, 1000, 400)).toBe(1);
  });
});

describe("nearestStation", () => {
  it("finds the closest station and its distance in band units", () => {
    const near = nearestStation(0.5, stations, band);
    expect(near?.station.id).toBe("b");
    expect(near?.distance).toBeCloseTo(0, 10);
  });

  it("measures distance from the station centre", () => {
    const near = nearestStation(0.6, stations, band);
    expect(near?.station.id).toBe("b");
    expect(near?.distance).toBeCloseTo(0.1, 10);
  });

  it("resolves the ends of the band", () => {
    expect(nearestStation(0, stations, band)?.station.id).toBe("a");
    expect(nearestStation(1, stations, band)?.station.id).toBe("c");
  });

  it("returns null when there are no stations", () => {
    expect(nearestStation(0.5, [], band)).toBeNull();
  });
});

describe("detuneOf", () => {
  it("is 0 dead centre and 1 at or beyond the lock radius", () => {
    expect(detuneOf(0, 0.1)).toBe(0);
    expect(detuneOf(0.1, 0.1)).toBe(1);
    expect(detuneOf(0.4, 0.1)).toBe(1);
  });

  it("ramps linearly inside the lock radius", () => {
    expect(detuneOf(0.05, 0.1)).toBeCloseTo(0.5, 10);
  });

  it("treats a zero lock radius as fully off-station", () => {
    expect(detuneOf(0, 0)).toBe(1);
  });
});

describe("lockRadiusFor", () => {
  it("never lets neighbouring lock zones overlap", () => {
    const radius = lockRadiusFor(stations, band);
    const gaps = [0.5, 0.5];
    for (const gap of gaps) expect(radius).toBeLessThanOrEqual(gap / 2);
    expect(radius).toBeGreaterThan(0);
  });

  it("shrinks with the tightest spacing, not the average", () => {
    const tight = [{ frequency: 88 }, { frequency: 88.4 }, { frequency: 108 }];
    expect(lockRadiusFor(tight, band)).toBeLessThan(lockRadiusFor(stations, band));
  });

  it("gives a single station the whole band", () => {
    expect(lockRadiusFor([{ frequency: 98 }], band)).toBeGreaterThan(0.4);
  });
});
