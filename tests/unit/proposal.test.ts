import { describe, expect, it } from "vitest";
import { nextProposedPlace } from "../../src/domain/proposal";
import { makeFind, makeTour } from "./testTour";

// FR-003a: the proposal is the first not-yet-found place whose order is
// greater than the highest found order, else the first not-yet-found overall;
// a found place is never proposed.
describe("nextProposedPlace", () => {
  const tour = makeTour(5);
  const finds = (...ids: string[]) => ids.map((id) => makeFind(id));

  it("proposes place 1 when nothing is found", () => {
    expect(nextProposedPlace(tour, [])?.id).toBe("p1");
  });

  it("proposes the next in order after contiguous finds ({1,2} → 3)", () => {
    expect(nextProposedPlace(tour, finds("p1", "p2"))?.id).toBe("p3");
  });

  it("skips past the highest found order, not into gaps ({1,3} → 4)", () => {
    expect(nextProposedPlace(tour, finds("p1", "p3"))?.id).toBe("p4");
  });

  it("wraps to the first unfound when the tail is found ({2..n} → 1)", () => {
    expect(nextProposedPlace(tour, finds("p2", "p3", "p4", "p5"))?.id).toBe("p1");
  });

  it("returns null when every place is found", () => {
    expect(nextProposedPlace(tour, finds("p1", "p2", "p3", "p4", "p5"))).toBeNull();
  });

  it("never returns a found place, whatever the find order", () => {
    const combos = [
      ["p1"],
      ["p2"],
      ["p5"],
      ["p1", "p4"],
      ["p3", "p2"],
      ["p5", "p1", "p3"],
    ];
    for (const ids of combos) {
      const proposed = nextProposedPlace(tour, finds(...ids));
      expect(proposed).not.toBeNull();
      expect(ids).not.toContain(proposed!.id);
    }
  });
});
