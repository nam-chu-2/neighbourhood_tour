import { useEffect, useState } from "react";
import { useTour } from "../TourProvider";
import { isOfflineReady, subscribeOfflineReady } from "../pwa";
import { foundCount } from "../domain/tourState";

// FR-001: frame Bells Corners for a downtown-only audience, one primary
// action. Shows "Ready for the road ✓" once the offline precache is complete.
export function Welcome() {
  const { state } = useTour();
  const [ready, setReady] = useState(isOfflineReady);

  useEffect(() => subscribeOfflineReady(setReady), []);

  const started = foundCount(state) > 0;

  return (
    <div className="welcome">
      <h1>{state.tour.title}</h1>
      <p>{state.tour.intro}</p>
      <p className="welcome__how">
        {state.tour.places.length} places, one drive. Snap a photo of each one as we
        pass it to unlock its story.
      </p>
      <a className="btn btn--primary btn--block snap-button" href="#/tour">
        {started ? "Back to the ride" : "Start the ride"}
      </a>
      {ready && (
        <p className="welcome__ready" role="status">
          Ready for the road ✓ — works without signal from here on.
        </p>
      )}
    </div>
  );
}
