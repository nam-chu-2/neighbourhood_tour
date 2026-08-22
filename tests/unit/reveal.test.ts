import { describe, expect, it } from "vitest";
import { initialRevealState, revealReducer, shouldAnimate } from "../../src/domain/reveal";

// The reveal animation must only ever be able to ADD to a page that already
// works. Its default is "finished", and the hidden state is applied only when
// JavaScript is running and motion is welcome (research R1, FR-012, FR-021).

describe("shouldAnimate", () => {
  it("animates when scripting is live and motion is welcome", () => {
    expect(shouldAnimate({ scripting: true, reducedMotion: false, observerSupported: true })).toBe(
      true,
    );
  });

  it("does not animate when the visitor prefers reduced motion", () => {
    expect(shouldAnimate({ scripting: true, reducedMotion: true, observerSupported: true })).toBe(
      false,
    );
  });

  it("does not animate when scripting never ran", () => {
    expect(shouldAnimate({ scripting: false, reducedMotion: false, observerSupported: true })).toBe(
      false,
    );
  });

  it("does not animate where IntersectionObserver is unsupported", () => {
    expect(shouldAnimate({ scripting: true, reducedMotion: false, observerSupported: false })).toBe(
      false,
    );
  });
});

describe("revealReducer", () => {
  it("starts hidden only when animating; otherwise starts finished", () => {
    expect(initialRevealState(true)).toBe("hidden");
    expect(initialRevealState(false)).toBe("revealed");
  });

  it("reveals when the section enters view", () => {
    expect(revealReducer("hidden", { type: "ENTERED" })).toBe("revealed");
  });

  it("never returns a revealed section to hidden — reveals are one-shot", () => {
    expect(revealReducer("revealed", { type: "LEFT" })).toBe("revealed");
    expect(revealReducer("revealed", { type: "ENTERED" })).toBe("revealed");
  });

  it("stays hidden until something enters view", () => {
    expect(revealReducer("hidden", { type: "LEFT" })).toBe("hidden");
  });

  it("is total — every event is handled from every state", () => {
    for (const state of ["hidden", "revealed"] as const) {
      for (const event of [{ type: "ENTERED" }, { type: "LEFT" }] as const) {
        expect(["hidden", "revealed"]).toContain(revealReducer(state, event));
      }
    }
  });
});
