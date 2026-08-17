import { beforeEach, describe, expect, it } from "vitest";
import {
  clearAll,
  deleteFind,
  loadFinds,
  loadProgress,
  saveFind,
  saveProgress,
} from "../../src/storage/findStore";
import { makeFind, makeTour, readBlobText } from "./testTour";

// FR-008: finds (photo included) and progress live in IndexedDB on the
// visitor's device and survive reloads. fake-indexeddb stands in here.
const tour = makeTour(4);

beforeEach(async () => {
  await clearAll();
});

describe("findStore", () => {
  it("round-trips a Find with its photo Blob", async () => {
    const find = makeFind("p2");
    await saveFind(find);
    const loaded = await loadFinds(tour);
    expect(loaded).toHaveLength(1);
    expect(loaded[0]).toMatchObject({ placeId: "p2", method: "proposal", at: find.at });
    expect(loaded[0]!.photo).toBeInstanceOf(Blob);
    expect(loaded[0]!.photo!.type).toBe("image/jpeg");
    expect(await readBlobText(loaded[0]!.photo!)).toBe("photo-bytes");
  });

  it("round-trips a no-photo Find (photo null)", async () => {
    await saveFind(makeFind("p1", { photo: null, method: "no-photo" }));
    const loaded = await loadFinds(tour);
    expect(loaded[0]!.photo).toBeNull();
    expect(loaded[0]!.method).toBe("no-photo");
  });

  it("overwrites a Find saved for the same place (one Find per place)", async () => {
    await saveFind(makeFind("p1"));
    await saveFind(makeFind("p1", { method: "picked" }));
    const loaded = await loadFinds(tour);
    expect(loaded).toHaveLength(1);
    expect(loaded[0]!.method).toBe("picked");
  });

  it("loads Finds ordered by place order regardless of save order", async () => {
    await saveFind(makeFind("p3"));
    await saveFind(makeFind("p1"));
    await saveFind(makeFind("p4"));
    const loaded = await loadFinds(tour);
    expect(loaded.map((f) => f.placeId)).toEqual(["p1", "p3", "p4"]);
  });

  it("ignores finds for places no longer in the tour", async () => {
    await saveFind(makeFind("gone-place"));
    await saveFind(makeFind("p1"));
    expect((await loadFinds(tour)).map((f) => f.placeId)).toEqual(["p1"]);
  });

  it("deletes a Find", async () => {
    await saveFind(makeFind("p1"));
    await saveFind(makeFind("p2"));
    await deleteFind("p1");
    expect((await loadFinds(tour)).map((f) => f.placeId)).toEqual(["p2"]);
  });

  it("saves and loads Progress; null when never saved", async () => {
    expect(await loadProgress()).toBeNull();
    const progress = {
      startedAt: "2026-08-17T14:00:00.000Z",
      completedAt: "2026-08-17T15:00:00.000Z",
    };
    await saveProgress(progress);
    expect(await loadProgress()).toEqual(progress);
  });

  it("clearAll wipes finds and progress", async () => {
    await saveFind(makeFind("p1"));
    await saveProgress({ startedAt: "2026-08-17T14:00:00.000Z" });
    await clearAll();
    expect(await loadFinds(tour)).toEqual([]);
    expect(await loadProgress()).toBeNull();
  });
});
