import { nextProposedPlace } from "../domain/proposal";
import type { Find, Tour } from "../domain/types";

// FR-007: schematic SVG route with found / next / remaining distinguishable
// by colour + glyph + accessible name. Static in US1; US2 (T042) animates the
// progress path via --route-progress and data-animating.

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

export function RouteMap({ tour, finds }: RouteMapProps) {
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
            >
              <circle r="16" />
              <text>{status === "found" ? "✓" : place.order}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
