import type { Stop } from "../domain/types";

// The route (FR-004): a drawn line with the seven stops marked along it.
//
// Deliberately decorative and deliberately not a map — no library, no tiles, no
// coordinates, no external service. It carries nothing the numbered stops below
// do not already carry, which is exactly what keeps it from becoming a second,
// unmaintained source of truth about the drive (research R4).

export function RouteIllustration({ stops }: { stops: Stop[] }) {

  // Hand-drawn-ish path across the viewBox; positions are laid along it evenly.
  const marks = stops.map((stop, index) => ({
    id: stop.id,
    x: 60 + (index * 880) / Math.max(1, stops.length - 1),
    y: 120 + Math.sin(index * 1.1) * 42,
  }));

  return (
    <div className="route" data-testid="route" data-revealed="hidden">
      <svg
        className="route__svg"
        viewBox="0 0 1000 240"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <path
          className="route__line"
          d="M 40 150 C 220 60, 300 220, 480 130 S 760 60, 960 140"
          fill="none"
          /* Normalised so the dash maths is exact rather than a guess at the
             path's real length. */
          pathLength={1}
        />
        {marks.map((mark, index) => (
          <g className="route__mark" key={mark.id}>
            <circle cx={mark.x} cy={mark.y} r="9" />
            <text x={mark.x} y={mark.y - 22} textAnchor="middle">
              {String(index + 1).padStart(2, "0")}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
