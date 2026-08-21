import { describe, expect, it, vi } from "vitest";
import { keepsakeLines } from "../../src/keepsake/composeKeepsake";
import type { Broadcast } from "../../src/domain/types";

const broadcast: Broadcast = {
  id: "bells-corners",
  title: "Test Radio",
  intro: "Drag the dial.",
  band: { min: 88, max: 108 },
  signOff: "Goodnight.",
  stations: [
    {
      id: "one",
      order: 1,
      frequency: 90,
      name: "First",
      memory: "m",
      visuals: [{ src: "/a.svg", alt: "a", credit: "c", kind: "illustration" }],
    },
    {
      id: "two",
      order: 2,
      frequency: 95,
      name: "Second",
      memory: "m",
      visuals: [{ src: "/b.svg", alt: "b", credit: "c", kind: "illustration" }],
    },
    {
      id: "three",
      order: 3,
      frequency: 100,
      name: "Third",
      memory: "m",
      visuals: [{ src: "/c.svg", alt: "c", credit: "c", kind: "illustration" }],
    },
  ],
};

const at = "2026-08-20T12:00:00.000Z";

describe("keepsakeLines", () => {
  it("lists received stations in dial order, whatever order they were received", () => {
    const lines = keepsakeLines(broadcast, [
      { stationId: "three", at },
      { stationId: "one", at },
    ]);
    expect(lines.map((line) => line.name)).toEqual(["First", "Third"]);
  });

  it("carries each station's frequency for the card", () => {
    const lines = keepsakeLines(broadcast, [{ stationId: "two", at }]);
    expect(lines[0]).toMatchObject({ name: "Second", frequency: 95 });
  });

  it("ignores receptions for stations that are not in the broadcast", () => {
    const lines = keepsakeLines(broadcast, [
      { stationId: "ghost", at },
      { stationId: "one", at },
    ]);
    expect(lines).toHaveLength(1);
  });

  it("handles an empty tour without throwing", () => {
    expect(keepsakeLines(broadcast, [])).toEqual([]);
  });

  it("handles every station received", () => {
    const lines = keepsakeLines(
      broadcast,
      broadcast.stations.map((station) => ({ stationId: station.id, at })),
    );
    expect(lines).toHaveLength(3);
  });
});

describe("composeKeepsake", () => {
  it("reports failure instead of throwing when the canvas cannot be used", async () => {
    // jsdom has no 2D context; the card must degrade to "no image", never to a
    // broken sign-off (research R8 — the card is always on screen first).
    const { composeKeepsake } = await import("../../src/keepsake/composeKeepsake");
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    await expect(composeKeepsake(broadcast, [{ stationId: "one", at }])).resolves.toBeNull();
  });
});
