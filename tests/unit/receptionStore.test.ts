import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  STORAGE_KEY,
  STORAGE_VERSION,
  emptyVisitorState,
  loadVisitorState,
  saveVisitorState,
} from "../../src/storage/receptionStore";

const IDS = ["a", "b", "c"];
const at = "2026-08-20T12:00:00.000Z";

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("loadVisitorState", () => {
  it("returns an empty state when nothing is stored", () => {
    expect(loadVisitorState(IDS)).toEqual(emptyVisitorState());
  });

  it("round-trips a saved state", () => {
    const state = {
      ...emptyVisitorState(),
      receptions: [{ stationId: "a", at }],
      soundOn: true,
      startedAt: at,
    };
    expect(saveVisitorState(state)).toBe(true);
    expect(loadVisitorState(IDS)).toEqual(state);
  });

  it("drops receptions for stations that are no longer in the broadcast", () => {
    saveVisitorState({
      ...emptyVisitorState(),
      receptions: [
        { stationId: "a", at },
        { stationId: "ghost", at },
      ],
    });
    expect(loadVisitorState(IDS).receptions).toEqual([{ stationId: "a", at }]);
  });

  it("de-duplicates receptions by station, keeping the first", () => {
    saveVisitorState({
      ...emptyVisitorState(),
      receptions: [
        { stationId: "a", at },
        { stationId: "a", at: "2026-08-20T13:00:00.000Z" },
      ],
    });
    const loaded = loadVisitorState(IDS);
    expect(loaded.receptions).toHaveLength(1);
    expect(loaded.receptions[0]!.at).toBe(at);
  });

  it("discards a document from a different schema version rather than guessing", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION + 1, receptions: [{ stationId: "a", at }] }),
    );
    expect(loadVisitorState(IDS)).toEqual(emptyVisitorState());
  });

  it("survives corrupt JSON", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadVisitorState(IDS)).toEqual(emptyVisitorState());
  });

  it("survives storage that throws on read (private browsing)", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    expect(loadVisitorState(IDS)).toEqual(emptyVisitorState());
  });
});

describe("saveVisitorState", () => {
  it("reports failure instead of throwing when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });
    expect(saveVisitorState(emptyVisitorState())).toBe(false);
  });

  it("stores nothing beyond the visitor's own progress and preference", () => {
    saveVisitorState({ ...emptyVisitorState(), receptions: [{ stationId: "a", at }] });
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? "";
    expect(Object.keys(JSON.parse(raw)).sort()).toEqual([
      "receptions",
      "soundOn",
      "version",
    ]);
  });

  it("uses exactly one storage key", () => {
    saveVisitorState(emptyVisitorState());
    expect(window.localStorage.length).toBe(1);
    expect(window.localStorage.key(0)).toBe(STORAGE_KEY);
  });
});
