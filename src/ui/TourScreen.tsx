import { useTour } from "../TourProvider";
import { foundCount, isComplete, isFound } from "../domain/tourState";
import { placeHref } from "../router";
import { RouteMap } from "./RouteMap";
import { SnapSheet } from "./SnapSheet";

// FR-002: ordered list with visible progress; single primary Snap action
// (FR-003) fixed at the bottom, sized for a moving car (FR-010).
export function TourScreen() {
  const { state, snap } = useTour();
  const { tour } = state;
  const places = [...tour.places].sort((a, b) => a.order - b.order);
  const found = foundCount(state);
  const complete = isComplete(state);

  return (
    <div className="screen">
      <header className="tour__header">
        <h1>The route</h1>
        <p className="tour__progress">
          {found} of {places.length} found
        </p>
      </header>

      <div className="tour__body">
        <RouteMap tour={tour} finds={state.finds} />

        <ol className="place-list">
          {places.map((place) => {
            const placeFound = isFound(state, place.id);
            return (
              <li
                key={place.id}
                className={`place-list__item${placeFound ? " place-list__item--found" : ""}`}
              >
                {placeFound ? (
                  <a className="place-list__link" href={placeHref(place.id)}>
                    <span className="place-list__order" aria-hidden="true">
                      ✓
                    </span>
                    {place.name}
                    <span className="place-list__status">Found — read it</span>
                  </a>
                ) : (
                  <>
                    <span className="place-list__order" aria-hidden="true">
                      {place.order}
                    </span>
                    {place.name}
                    <span className="place-list__status">Not yet found</span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {complete && (
        <section className="closing-note" aria-label="The end of the drive">
          <h2>That&rsquo;s the drive</h2>
          <p>{tour.closingNote}</p>
          <a className="btn" href="#/recap">
            See your ride
          </a>
        </section>
      )}

      <div className="snap-bar">
        {complete ? (
          <a className="btn btn--primary snap-button" href="#/recap">
            See your ride
          </a>
        ) : (
          <button
            type="button"
            className="btn btn--primary snap-button"
            aria-label="Snap a photo of the place you are passing"
            onClick={() => void snap()}
          >
            📸 Snap
          </button>
        )}
      </div>

      <SnapSheet />
    </div>
  );
}
