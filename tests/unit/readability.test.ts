import { describe, expect, it } from "vitest";
import { canRead } from "../../src/domain/readability";
import { initialState, reducer } from "../../src/domain/tourState";
import type { Route } from "../../src/router";
import { makeFind, makeTour } from "./testTour";

// US3 / research R9: a place's description is readable if it was found on
// this device, OR the tour is complete on this device, OR the link carries
// ?after=1 (post-drive share). Otherwise the deep link shows it locked.
const tour = makeTour(4);
const place2 = tour.places[1]!;

const route = (after: boolean): Route => ({
  name: "place",
  placeId: place2.id,
  after,
  debug: false,
});

function stateWith(findIds: string[], completedAt?: string) {
  return reducer(initialState(tour), {
    type: "hydrate",
    finds: findIds.map((id) => makeFind(id)),
    progress: completedAt ? { completedAt } : {},
  });
}

describe("canRead", () => {
  it("is readable when the place was found on this device", () => {
    expect(canRead(place2, stateWith(["p2"]), route(false))).toBe(true);
  });

  it("is readable everywhere once the tour is complete on this device", () => {
    const complete = stateWith(["p1", "p2", "p3", "p4"], "2026-08-17T15:00:00.000Z");
    for (const place of tour.places) {
      expect(canRead(place, complete, route(false))).toBe(true);
    }
  });

  it("is readable via an ?after=1 share link with nothing found", () => {
    expect(canRead(place2, stateWith([]), route(true))).toBe(true);
  });

  it("is locked otherwise — even when other places are found", () => {
    expect(canRead(place2, stateWith([]), route(false))).toBe(false);
    expect(canRead(place2, stateWith(["p1", "p3"]), route(false))).toBe(false);
  });
});
