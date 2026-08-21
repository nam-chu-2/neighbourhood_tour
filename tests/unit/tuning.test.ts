import { describe, expect, it } from "vitest";
import {
  addReception,
  initialTuningState,
  isComplete,
  isReceived,
  receivedCount,
  tuningReducer,
} from "../../src/domain/tuning";
import type { TuningEvent, TuningState } from "../../src/domain/types";

const RADIUS = 0.1;
const near = (id: string, distance: number): TuningEvent => ({
  type: "SCROLL",
  nearestId: id,
  distance,
  lockRadius: RADIUS,
});

const at = "2026-08-20T12:00:00.000Z";

describe("tuningReducer transitions", () => {
  it("starts off-station", () => {
    expect(initialTuningState).toEqual({ phase: "offStation" });
  });

  it("goes off-station when the nearest station is beyond the lock radius", () => {
    const state = tuningReducer({ phase: "settling", candidateId: "b" }, near("b", 0.3));
    expect(state).toEqual({ phase: "offStation" });
  });

  it("closes an open broadcast when tuning away from it", () => {
    const state = tuningReducer({ phase: "locked", stationId: "b" }, near("b", 0.4));
    expect(state).toEqual({ phase: "offStation" });
  });

  it("becomes a settling candidate inside the lock radius", () => {
    const state = tuningReducer(initialTuningState, near("b", 0.04));
    expect(state).toEqual({ phase: "settling", candidateId: "b" });
  });

  it("swaps candidate while still settling", () => {
    const state = tuningReducer({ phase: "settling", candidateId: "b" }, near("c", 0.02));
    expect(state).toEqual({ phase: "settling", candidateId: "c" });
  });

  it("keeps a locked station locked while it is still the nearest in range", () => {
    const state = tuningReducer({ phase: "locked", stationId: "b" }, near("b", 0.03));
    expect(state).toEqual({ phase: "locked", stationId: "b" });
  });

  it("locks in on settle", () => {
    const state = tuningReducer({ phase: "settling", candidateId: "b" }, { type: "SETTLED" });
    expect(state).toEqual({ phase: "locked", stationId: "b" });
  });

  it("settling off-station changes nothing — a flick that ends between stations locks nothing in", () => {
    expect(tuningReducer({ phase: "offStation" }, { type: "SETTLED" })).toEqual({
      phase: "offStation",
    });
  });

  it("locks in immediately on keyboard focus, with no settle wait", () => {
    const state = tuningReducer(initialTuningState, {
      type: "FOCUS_STATION",
      stationId: "c",
    });
    expect(state).toEqual({ phase: "locked", stationId: "c" });
  });

  it("locks in immediately when opened from the guide, stepper or a deep link", () => {
    const state = tuningReducer(
      { phase: "locked", stationId: "a" },
      { type: "OPEN_STATION", stationId: "c" },
    );
    expect(state).toEqual({ phase: "locked", stationId: "c" });
  });

  it("goes off-station when there is no nearest station at all", () => {
    const state = tuningReducer({ phase: "locked", stationId: "a" }, {
      type: "SCROLL",
      nearestId: null,
      distance: Number.POSITIVE_INFINITY,
      lockRadius: RADIUS,
    });
    expect(state).toEqual({ phase: "offStation" });
  });
});

describe("tuningReducer invariants", () => {
  it("never lets a station flown past at speed lock in", () => {
    // A fast flick: the nearest station changes every frame and never settles.
    let state: TuningState = initialTuningState;
    for (const [id, distance] of [
      ["a", 0.02],
      ["b", 0.05],
      ["c", 0.3],
    ] as const) {
      state = tuningReducer(state, near(id, distance));
    }
    expect(state).toEqual({ phase: "offStation" });
  });

  it("is total — every event is handled from every phase", () => {
    const phases: TuningState[] = [
      { phase: "offStation" },
      { phase: "settling", candidateId: "b" },
      { phase: "locked", stationId: "b" },
    ];
    const events: TuningEvent[] = [
      near("b", 0.01),
      near("b", 0.9),
      { type: "SETTLED" },
      { type: "FOCUS_STATION", stationId: "a" },
      { type: "OPEN_STATION", stationId: "a" },
    ];
    for (const phase of phases) {
      for (const event of events) {
        const next = tuningReducer(phase, event);
        expect(["offStation", "settling", "locked"]).toContain(next.phase);
      }
    }
  });
});

describe("receptions", () => {
  it("records a reception", () => {
    expect(addReception([], "a", at)).toEqual([{ stationId: "a", at }]);
  });

  it("is idempotent — re-tuning a received station never double-counts", () => {
    const once = addReception([], "a", at);
    const twice = addReception(once, "a", "2026-08-20T13:00:00.000Z");
    expect(twice).toHaveLength(1);
    expect(twice[0]!.at).toBe(at);
  });

  it("never exceeds the station count", () => {
    let receptions = addReception([], "a", at);
    receptions = addReception(receptions, "b", at);
    receptions = addReception(receptions, "a", at);
    expect(receivedCount(receptions)).toBe(2);
  });

  it("reports whether a station is received", () => {
    const receptions = addReception([], "a", at);
    expect(isReceived(receptions, "a")).toBe(true);
    expect(isReceived(receptions, "b")).toBe(false);
  });

  it("is complete only when every station has been received", () => {
    const ids = ["a", "b"];
    let receptions = addReception([], "a", at);
    expect(isComplete(receptions, ids)).toBe(false);
    receptions = addReception(receptions, "b", at);
    expect(isComplete(receptions, ids)).toBe(true);
  });

  it("ignores receptions for stations that are not in the broadcast", () => {
    const receptions = addReception([], "ghost", at);
    expect(isComplete(receptions, ["a"])).toBe(false);
  });
});
