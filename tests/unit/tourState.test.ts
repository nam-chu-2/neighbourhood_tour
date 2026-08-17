import { describe, expect, it } from "vitest";
import {
  findFor,
  foundCount,
  initialState,
  isComplete,
  isFound,
  reducer,
  unfoundPlaces,
  type TourAction,
  type TourState,
} from "../../src/domain/tourState";
import { makeFind, makeTour } from "./testTour";

// The reducer/state machine from data-model.md "State transitions".
const tour = makeTour(4);
const photo = () => new Blob(["jpeg"], { type: "image/jpeg" });

function run(state: TourState, ...actions: TourAction[]): TourState {
  return actions.reduce(reducer, state);
}

describe("tourState reducer — snap flow", () => {
  it("starts idle with no finds", () => {
    const s = initialState(tour);
    expect(s.snap.phase).toBe("idle");
    expect(s.finds).toEqual([]);
    expect(foundCount(s)).toBe(0);
  });

  it("snap → capturing → photo → proposing the next unfound place with the photo", () => {
    const p = photo();
    let s = run(initialState(tour), { type: "snapStarted" });
    expect(s.snap.phase).toBe("capturing");
    s = run(s, { type: "photoCaptured", photo: p });
    expect(s.snap).toMatchObject({ phase: "proposing", placeId: "p1" });
    expect(s.snap.phase === "proposing" && s.snap.photo).toBe(p);
  });

  it("confirm → exactly one Find with method 'proposal' and the photo, back to idle", () => {
    const p = photo();
    const s = run(
      initialState(tour),
      { type: "snapStarted" },
      { type: "photoCaptured", photo: p },
      { type: "confirmProposal", at: "2026-08-17T15:00:00.000Z" },
    );
    expect(s.snap.phase).toBe("idle");
    expect(s.finds).toHaveLength(1);
    expect(s.finds[0]).toMatchObject({
      placeId: "p1",
      method: "proposal",
      at: "2026-08-17T15:00:00.000Z",
    });
    expect(s.finds[0]!.photo).toBe(p);
    expect(s.lastFoundId).toBe("p1");
  });

  it("pickDifferent → picking, then pick → Find with method 'picked'", () => {
    const p = photo();
    let s = run(
      initialState(tour),
      { type: "snapStarted" },
      { type: "photoCaptured", photo: p },
      { type: "pickDifferent" },
    );
    expect(s.snap.phase).toBe("picking");
    s = run(s, { type: "pickPlace", placeId: "p3" });
    expect(s.snap.phase).toBe("idle");
    expect(s.finds[0]).toMatchObject({ placeId: "p3", method: "picked" });
    expect(s.finds[0]!.photo).toBe(p);
  });

  it("retake and dismiss discard the photo and produce no Find", () => {
    for (const type of ["retake", "dismiss"] as const) {
      const s = run(
        initialState(tour),
        { type: "snapStarted" },
        { type: "photoCaptured", photo: photo() },
        { type },
      );
      expect(s.snap.phase).toBe("idle");
      expect(s.finds).toEqual([]);
    }
  });

  it("proposing skips found places (order-aware default)", () => {
    let s = run(
      initialState(tour),
      { type: "hydrate", finds: [makeFind("p1"), makeFind("p2")], progress: {} },
    );
    s = run(s, { type: "snapStarted" }, { type: "photoCaptured", photo: photo() });
    expect(s.snap).toMatchObject({ phase: "proposing", placeId: "p3" });
  });
});

describe("tourState reducer — camera unavailable (FR-005)", () => {
  it("cameraUnavailable proposes the next place; markWithoutPhoto → no-photo Find", () => {
    let s = run(
      initialState(tour),
      { type: "snapStarted" },
      { type: "cameraUnavailable", error: "cancelled" },
    );
    expect(s.snap).toMatchObject({ phase: "cameraUnavailable", placeId: "p1" });
    s = run(s, { type: "markWithoutPhoto" });
    expect(s.finds[0]).toMatchObject({ placeId: "p1", method: "no-photo", photo: null });
    expect(s.snap.phase).toBe("idle");
  });

  it("markWithoutPhoto accepts an explicit (picked) place", () => {
    const s = run(
      initialState(tour),
      { type: "snapStarted" },
      { type: "cameraUnavailable", error: "failed" },
      { type: "markWithoutPhoto", placeId: "p3" },
    );
    expect(s.finds[0]).toMatchObject({ placeId: "p3", method: "no-photo", photo: null });
  });
});

describe("tourState reducer — undo and retake photo", () => {
  it("undoFind deletes the Find", () => {
    let s = run(
      initialState(tour),
      { type: "hydrate", finds: [makeFind("p1"), makeFind("p2")], progress: {} },
    );
    s = run(s, { type: "undoFind", placeId: "p1" });
    expect(s.finds.map((f) => f.placeId)).toEqual(["p2"]);
    expect(isFound(s, "p1")).toBe(false);
  });

  it("undoFind clears completedAt so the tour is no longer complete", () => {
    let s = run(initialState(tour), {
      type: "hydrate",
      finds: tour.places.map((p) => makeFind(p.id)),
      progress: { completedAt: "2026-08-17T15:00:00.000Z" },
    });
    expect(isComplete(s)).toBe(true);
    s = run(s, { type: "undoFind", placeId: "p4" });
    expect(isComplete(s)).toBe(false);
    expect(s.progress.completedAt).toBeUndefined();
  });

  it("retakePhoto replaces the photo of an existing Find, keeping its method", () => {
    const original = makeFind("p2", { method: "picked" });
    const replacement = photo();
    let s = run(initialState(tour), {
      type: "hydrate",
      finds: [original],
      progress: {},
    });
    s = run(
      s,
      { type: "retakePhoto", placeId: "p2" },
      { type: "photoCaptured", photo: replacement },
    );
    expect(s.snap.phase).toBe("idle");
    expect(s.finds).toHaveLength(1);
    expect(s.finds[0]!.photo).toBe(replacement);
    expect(s.finds[0]!.method).toBe("picked");
  });

  it("a failed camera during a photo retake returns to idle without a sheet", () => {
    let s = run(initialState(tour), {
      type: "hydrate",
      finds: [makeFind("p2")],
      progress: {},
    });
    s = run(
      s,
      { type: "retakePhoto", placeId: "p2" },
      { type: "cameraUnavailable", error: "cancelled" },
    );
    expect(s.snap.phase).toBe("idle");
    expect(s.finds).toHaveLength(1);
  });
});

describe("tourState reducer — completion and progress", () => {
  it("sets completedAt when the last place is found", () => {
    let s = run(initialState(tour), {
      type: "hydrate",
      finds: [makeFind("p1"), makeFind("p2"), makeFind("p3")],
      progress: { startedAt: "2026-08-17T14:00:00.000Z" },
    });
    expect(isComplete(s)).toBe(false);
    s = run(
      s,
      { type: "snapStarted" },
      { type: "photoCaptured", photo: photo() },
      { type: "confirmProposal", at: "2026-08-17T15:30:00.000Z" },
    );
    expect(s.finds).toHaveLength(4);
    expect(s.progress.completedAt).toBe("2026-08-17T15:30:00.000Z");
    expect(isComplete(s)).toBe(true);
  });

  it("sets startedAt on the first snap", () => {
    const s = run(initialState(tour), { type: "snapStarted", at: "2026-08-17T14:00:00.000Z" });
    expect(s.progress.startedAt).toBe("2026-08-17T14:00:00.000Z");
  });
});

describe("tourState selectors", () => {
  const s = run(initialState(tour), {
    type: "hydrate",
    finds: [makeFind("p3"), makeFind("p1")],
    progress: {},
  });

  it("foundCount / isFound / findFor", () => {
    expect(foundCount(s)).toBe(2);
    expect(isFound(s, "p1")).toBe(true);
    expect(isFound(s, "p2")).toBe(false);
    expect(findFor(s, "p3")?.placeId).toBe("p3");
    expect(findFor(s, "p2")).toBeUndefined();
  });

  it("unfoundPlaces is sorted by route order and excludes found places", () => {
    expect(unfoundPlaces(s).map((p) => p.id)).toEqual(["p2", "p4"]);
  });

  it("isComplete only when every place is found", () => {
    expect(isComplete(s)).toBe(false);
    const done = run(s, {
      type: "hydrate",
      finds: tour.places.map((p) => makeFind(p.id)),
      progress: { completedAt: "2026-08-17T15:00:00.000Z" },
    });
    expect(isComplete(done)).toBe(true);
  });
});
