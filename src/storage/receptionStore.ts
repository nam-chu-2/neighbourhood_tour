// The visitor's progress, on their own device and nowhere else (FR-017,
// FR-022). Photos are gone with the 001 mechanic, so the whole document is a
// few short strings and localStorage is enough — which is why this feature
// drops the IndexedDB dependency (research R7).
//
// Every access is wrapped: storage throws outright in some private-browsing
// modes, and a visitor whose browser refuses to persist should still get a
// working tour, just one that forgets (FR-023).
import type { Reception, VisitorState } from "../domain/types";

export const STORAGE_KEY = "bells-corners-radio:v1";
export const STORAGE_VERSION = 1;

export function emptyVisitorState(): VisitorState {
  return { version: STORAGE_VERSION, receptions: [], soundOn: false };
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function isReception(value: unknown): value is Reception {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Reception).stationId === "string" &&
    typeof (value as Reception).at === "string"
  );
}

/**
 * Load progress, keeping only receptions for stations that still exist in the
 * authored content and only the first reception of each.
 */
export function loadVisitorState(knownStationIds: readonly string[]): VisitorState {
  const raw = readRaw();
  if (raw === null) return emptyVisitorState();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyVisitorState();
  }

  if (typeof parsed !== "object" || parsed === null) return emptyVisitorState();
  const document = parsed as Partial<VisitorState>;

  // A document from another schema version is discarded rather than guessed
  // at: a clean restart beats a half-understood tour.
  if (document.version !== STORAGE_VERSION) return emptyVisitorState();

  const known = new Set(knownStationIds);
  const seen = new Set<string>();
  const receptions: Reception[] = [];
  for (const candidate of Array.isArray(document.receptions) ? document.receptions : []) {
    if (!isReception(candidate)) continue;
    if (!known.has(candidate.stationId) || seen.has(candidate.stationId)) continue;
    seen.add(candidate.stationId);
    receptions.push({ stationId: candidate.stationId, at: candidate.at });
  }

  const state: VisitorState = {
    version: STORAGE_VERSION,
    receptions,
    soundOn: document.soundOn === true,
  };
  if (typeof document.startedAt === "string") state.startedAt = document.startedAt;
  if (typeof document.completedAt === "string") state.completedAt = document.completedAt;
  return state;
}

/** Returns false when storage refused; the caller carries on from memory. */
export function saveVisitorState(state: VisitorState): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearVisitorState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do — the visitor simply keeps whatever is in memory.
  }
}
