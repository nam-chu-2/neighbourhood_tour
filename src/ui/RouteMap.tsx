import { useEffect, useRef, useState } from "react";
import { nextProposedPlace } from "../domain/proposal";
import type { Find, Tour } from "../domain/types";
import { useReducedMotion } from "./useReducedMotion";

// FR-007: schematic SVG route with found / next / remaining distinguishable
// by colour + glyph + accessible name. FR-011 (US2): on a new find the
// progress path draws forward (data-animating) and the new marker pops
// (data-pop); both are suppressed under prefers-reduced-motion.

export type MarkerStatus = "found" | "next" | "remaining";

interface RouteMapProps {
  tour: Tour;
  finds: Find[];
}

const STATUS_LABEL: Record<MarkerStatus, string> = {
  found: "found",
  next: "up next",
  remaining: "not yet found",
};

/** Covers the route transition (700 ms) plus the marker pop that follows. */
const ANIMATION_MS = 1000;

export function RouteMap({ tour, finds }: RouteMapProps) {
  const reducedMotion = useReducedMotion();
  const [animating, setAnimating] = useState(false);
  const [poppedId, setPoppedId] = useState<string | null>(null);
  const knownFindCount = useRef(finds.length);
  const knownFindIds = useRef(new Set(finds.map((find) => find.placeId)));

  useEffect(() => {
    const previousCount = knownFindCount.current;
    const previousIds = knownFindIds.current;
    knownFindCount.current = finds.length;
    knownFindIds.current = new Set(finds.map((find) => find.placeId));

    if (reducedMotion || finds.length <= previousCount) return;
    const fresh = finds.find((find) => !previousIds.has(find.placeId));
    setAnimating(true);
    setPoppedId(fresh?.placeId ?? null);
    const timer = setTimeout(() => {
      setAnimating(false);
      setPoppedId(null);
    }, ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [finds, reducedMotion]);

  const foundIds = new Set(finds.map((find) => find.placeId));
  const next = nextProposedPlace(tour, finds);
  const places = [...tour.places].sort((a, b) => a.order - b.order);

  // How far along the route the drive has visibly progressed: to the marker
  // of the highest-order found place (markers sit at even fractions of the
  // path, orders 1..n).
  const maxFoundOrder = Math.max(
    0,
    ...places.filter((place) => foundIds.has(place.id)).map((place) => place.order),
  );
  const fraction =
    places.length > 1 && maxFoundOrder > 0
      ? (maxFoundOrder - 1) / (places.length - 1)
      : 0;

  return (
    <div className="route-map">
      <svg
        viewBox={tour.route.viewBox}
        role="group"
        aria-label="Route map of the drive"
      >
        <path className="route-base" d={tour.route.path} pathLength={1} />
        <path
          className="route-progress"
          d={tour.route.path}
          pathLength={1}
          data-animating={animating ? "" : undefined}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: 1 - fraction,
            opacity: fraction > 0 ? 1 : 0,
          }}
        />
        {places.map((place) => {
          const status: MarkerStatus = foundIds.has(place.id)
            ? "found"
            : place.id === next?.id
              ? "next"
              : "remaining";
          return (
            <g
              key={place.id}
              className={`marker marker--${status}`}
              transform={`translate(${place.routePosition.x} ${place.routePosition.y})`}
              role="img"
              aria-label={`Stop ${place.order}: ${place.name} — ${STATUS_LABEL[status]}`}
              data-pop={poppedId === place.id ? "" : undefined}
            >
              <g className="pop">
                <circle r="16" />
                <text>{status === "found" ? "✓" : place.order}</text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
