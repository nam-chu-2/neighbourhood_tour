import { useEffect, useRef, type RefObject } from "react";
import { detuneOf, nearestStation, tuneAt } from "../domain/band";
import type { Band, Station } from "../domain/types";

// The continuous half of tuning. This hook is the only thing that runs while
// the visitor is dragging, and all it does is write two numbers onto the root
// element (research R4). Nothing here causes a React render: the palette, the
// noise, the blur and the needle glow are all pure CSS functions of --tune and
// --detune.

/** Milliseconds of stillness that count as "settled" (research R2). */
export const SETTLE_MS = 120;

interface UseTuneOptions {
  bandRef: RefObject<HTMLElement | null>;
  stations: Station[];
  band: Band;
  lockRadius: number;
  /** Called with the nearest station on every animation frame of scrolling. */
  onScroll: (nearestId: string | null, distance: number) => void;
  /** Called once the band has been still long enough to count as settled. */
  onSettle: () => void;
}

export function useTune({
  bandRef,
  stations,
  band,
  lockRadius,
  onScroll,
  onSettle,
}: UseTuneOptions): void {
  // Callbacks live in refs so a re-render never detaches the scroll listener.
  const onScrollRef = useRef(onScroll);
  const onSettleRef = useRef(onSettle);
  onScrollRef.current = onScroll;
  onSettleRef.current = onSettle;

  useEffect(() => {
    const element = bandRef.current;
    if (!element) return;
    const root = document.documentElement;

    let frame = 0;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;

    const measure = (settle: boolean) => {
      const tune = tuneAt(element.scrollLeft, element.scrollWidth, element.clientWidth);
      const nearest = nearestStation(tune, stations, band);
      const distance = nearest ? nearest.distance : Number.POSITIVE_INFINITY;

      root.style.setProperty("--tune", tune.toFixed(4));
      root.style.setProperty("--detune", detuneOf(distance, lockRadius).toFixed(4));

      onScrollRef.current(nearest?.station.id ?? null, distance);

      if (!settle) return;
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(() => onSettleRef.current(), SETTLE_MS);
    };

    const onScrollEvent = () => {
      // rAF-throttled: at most one measurement per painted frame.
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        measure(true);
      });
    };

    // `scrollend` is an accelerator where it exists, never the mechanism.
    const onScrollEnd = () => measure(true);

    element.addEventListener("scroll", onScrollEvent, { passive: true });
    element.addEventListener("scrollend", onScrollEnd);

    // Paint the initial state, but do not settle: the tour opens in the static
    // with its instruction, and nothing is received until the visitor tunes.
    measure(false);

    return () => {
      element.removeEventListener("scroll", onScrollEvent);
      element.removeEventListener("scrollend", onScrollEnd);
      if (frame) cancelAnimationFrame(frame);
      if (settleTimer) clearTimeout(settleTimer);
    };
  }, [bandRef, stations, band, lockRadius]);
}
