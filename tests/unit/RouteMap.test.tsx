import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RouteMap } from "../../src/ui/RouteMap";
import { makeFind, makeTour } from "./testTour";

// FR-011: the route visibly progresses on a find (data-animating drives the
// CSS), and prefers-reduced-motion suppresses the animation entirely.

const tour = makeTour(4);

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches,
      media: "(prefers-reduced-motion: reduce)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
}

describe("RouteMap progress & animation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("updates the progress path when a new find arrives", () => {
    mockMatchMedia(false);
    const { container, rerender } = render(<RouteMap tour={tour} finds={[]} />);
    const progress = () =>
      container.querySelector<SVGPathElement>(".route-progress")!;
    expect(parseFloat(progress().style.strokeDashoffset)).toBeCloseTo(1);

    rerender(<RouteMap tour={tour} finds={[makeFind("p3")]} />);
    // Order 3 of 4 → two thirds of the way along the path.
    expect(parseFloat(progress().style.strokeDashoffset)).toBeCloseTo(1 / 3, 5);
  });

  it("sets data-animating on a new find and clears it within 1000 ms", () => {
    mockMatchMedia(false);
    const { container, rerender } = render(<RouteMap tour={tour} finds={[]} />);
    expect(container.querySelector("[data-animating]")).toBeNull();

    rerender(<RouteMap tour={tour} finds={[makeFind("p1")]} />);
    expect(container.querySelector("[data-animating]")).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(container.querySelector("[data-animating]")).toBeNull();
  });

  it("marks the newly found marker for the pop animation", () => {
    mockMatchMedia(false);
    const { container, rerender } = render(<RouteMap tour={tour} finds={[]} />);
    rerender(<RouteMap tour={tour} finds={[makeFind("p2")]} />);
    const popped = container.querySelector("[data-pop]");
    expect(popped).not.toBeNull();
    expect(popped!.getAttribute("aria-label")).toContain("Place 2");
  });

  it("never animates under prefers-reduced-motion", () => {
    mockMatchMedia(true);
    const { container, rerender } = render(<RouteMap tour={tour} finds={[]} />);
    rerender(<RouteMap tour={tour} finds={[makeFind("p1")]} />);
    expect(container.querySelector("[data-animating]")).toBeNull();
    expect(container.querySelector("[data-pop]")).toBeNull();
    // The progress itself still updates — only motion is removed.
    const progress = container.querySelector<SVGPathElement>(".route-progress")!;
    expect(progress).not.toBeNull();
  });
});
