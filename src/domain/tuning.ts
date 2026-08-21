// The discrete half of tuning: a pure, total reducer (data-model.md
// "Transient tuning state"). The continuous half — where the needle actually
// is — never reaches React; it lives in --tune / --detune (research R4).
import type { Reception, TuningEvent, TuningState } from "./types";

export const initialTuningState: TuningState = { phase: "offStation" };

export function tuningReducer(state: TuningState, event: TuningEvent): TuningState {
  switch (event.type) {
    case "SCROLL": {
      const { nearestId, distance, lockRadius } = event;
      if (nearestId === null || distance > lockRadius) {
        // Same reference when already off-station: useReducer bails out of a
        // re-render, so scrolling through the static costs React nothing.
        return state.phase === "offStation" ? state : { phase: "offStation" };
      }
      // Staying locked while the needle is still on the same station keeps
      // small jitter from closing and reopening an open broadcast.
      if (state.phase === "locked" && state.stationId === nearestId) return state;
      if (state.phase === "settling" && state.candidateId === nearestId) return state;
      return { phase: "settling", candidateId: nearestId };
    }
    case "SETTLED":
      // Settling between stations locks nothing in: a flick that ends in the
      // static leaves every station it flew past unreceived.
      return state.phase === "settling"
        ? { phase: "locked", stationId: state.candidateId }
        : state;
    case "FOCUS_STATION":
      return { phase: "locked", stationId: event.stationId };
    case "OPEN_STATION":
      return { phase: "locked", stationId: event.stationId };
    default:
      return state;
  }
}

// ---------- Receptions ----------

export function isReceived(receptions: readonly Reception[], stationId: string): boolean {
  return receptions.some((reception) => reception.stationId === stationId);
}

/** Idempotent: re-tuning a station already received never double-counts it. */
export function addReception(
  receptions: readonly Reception[],
  stationId: string,
  at: string,
): Reception[] {
  if (isReceived(receptions, stationId)) return [...receptions];
  return [...receptions, { stationId, at }];
}

export function receivedCount(receptions: readonly Reception[]): number {
  return new Set(receptions.map((reception) => reception.stationId)).size;
}

export function isComplete(
  receptions: readonly Reception[],
  stationIds: readonly string[],
): boolean {
  if (stationIds.length === 0) return false;
  return stationIds.every((id) => isReceived(receptions, id));
}
