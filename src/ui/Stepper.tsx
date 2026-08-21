import { useRadio } from "../RadioProvider";

// The reduced-motion path (FR-015, research R10): tuning as a discrete step
// rather than a drag, so nobody has to fling a band across the screen to take
// the tour.

export function Stepper() {
  const { broadcast, tuning, openStation } = useRadio();
  const stations = broadcast.stations;
  const currentIndex =
    tuning.phase === "locked"
      ? stations.findIndex((station) => station.id === tuning.stationId)
      : -1;

  const previous = currentIndex > 0 ? stations[currentIndex - 1] : null;
  const next =
    currentIndex < 0 ? stations[0] : (stations[currentIndex + 1] ?? null);

  return (
    <nav className="stepper" data-testid="stepper" aria-label="Step between stations">
      <button
        type="button"
        className="stepper__button"
        onClick={() => previous && openStation(previous.id)}
        disabled={!previous}
      >
        Previous station
      </button>
      <button
        type="button"
        className="stepper__button"
        onClick={() => next && openStation(next.id)}
        disabled={!next}
      >
        {currentIndex < 0 ? "Start tuning" : "Next station"}
      </button>
    </nav>
  );
}
