import type { Stop } from "../domain/types";

// Jump navigation for wide screens (FR-015). The links are plain anchors, so
// they work with no JavaScript at all; the current-stop highlight is the only
// part that needs scripting, and its absence costs nothing.

export function StopNav({ stops }: { stops: Stop[] }) {
  return (
    <nav className="stop-nav" aria-label="Stops" data-testid="stop-nav">
      <p className="stop-nav__title">The itinerary</p>
      <ol className="stop-nav__list">
        {stops.map((stop) => (
          <li key={stop.id}>
            <a
              className="stop-nav__link"
              href={`#${stop.id}`}
            >
              <span className="stop-nav__number">{String(stop.number).padStart(2, "0")}</span>
              <span className="stop-nav__name">{stop.headline}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
