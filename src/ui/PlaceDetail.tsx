import { useState } from "react";
import { useTour } from "../TourProvider";
import { findFor, isComplete } from "../domain/tourState";
import { navigate, type Route } from "../router";
import { useObjectUrl } from "./useObjectUrl";
import { useReducedMotion } from "./useReducedMotion";

// FR-004: name, hero visual, first-person story, optional downtown
// translation. Undo ("This wasn't it"), retake photo, and — once the tour is
// complete — the closing note (US1 scenario 5).
export function PlaceDetail({ route }: { route: Route }) {
  const { state, snap, undo } = useTour();
  const { tour } = state;
  const place = tour.places.find((candidate) => candidate.id === route.placeId);

  if (!place) {
    return (
      <div className="screen locked">
        <h1>Not part of this drive</h1>
        <p>That link doesn&rsquo;t match any place on the tour.</p>
        <a className="btn" href="#/tour">
          Back to the route
        </a>
      </div>
    );
  }

  const find = findFor(state, place.id);

  if (!find) {
    return <LockedPlace name={place.name} order={place.order} />;
  }

  return <FoundPlace placeId={place.id} findPhoto={find.photo} snap={snap} undo={undo} />;
}

function LockedPlace({ name, order }: { name: string; order: number }) {
  return (
    <div className="screen locked">
      <h1>{name}</h1>
      <p className="badge">Stop {order} — not yet found</p>
      <p>
        You haven&rsquo;t found this one yet. When the car gets there, snap a photo
        of it and the story unlocks.
      </p>
      <a className="btn btn--primary" href="#/tour">
        Back to the route
      </a>
    </div>
  );
}

function FoundPlace({
  placeId,
  findPhoto,
  snap,
  undo,
}: {
  placeId: string;
  findPhoto: Blob | null;
  snap: (opts?: { retakeFor?: string }) => Promise<void>;
  undo: (placeId: string) => void;
}) {
  const { state, ackReveal } = useTour();
  const reducedMotion = useReducedMotion();
  const { tour } = state;
  const place = tour.places.find((candidate) => candidate.id === placeId)!;
  const hero = place.media[0]!;
  const yourPhotoUrl = useObjectUrl(findPhoto);
  const complete = isComplete(state);

  // The surprise moment (US2, T043): when this place was *just* found, the
  // visitor's own photo crossfades into the author's visual. Tap to skip.
  // Never replayed (ackReveal) and never played under reduced motion.
  const [revealing, setRevealing] = useState(
    () => state.lastFoundId === placeId && !!findPhoto && !reducedMotion,
  );
  const finishReveal = () => {
    setRevealing(false);
    ackReveal();
  };

  return (
    <article className="screen detail">
      <h1>{place.name}</h1>
      <div className="detail__hero-wrap">
        <img className="detail__hero" src={hero.src} alt={hero.alt} />
        {revealing && yourPhotoUrl && (
          <button
            type="button"
            className="reveal-overlay"
            aria-label="Skip the photo reveal"
            onClick={finishReveal}
            onAnimationEnd={finishReveal}
          >
            <img src={yourPhotoUrl} alt="" />
          </button>
        )}
      </div>
      {hero.credit && <p className="detail__credit">{hero.credit}</p>}

      <p className="detail__story">{place.story}</p>

      {place.downtownTranslation && (
        <aside className="detail__translation">
          <h2>Downtown translation</h2>
          <p>{place.downtownTranslation}</p>
        </aside>
      )}

      <section className="detail__your-photo" aria-label="Your photo of this place">
        {yourPhotoUrl ? (
          <>
            <img src={yourPhotoUrl} alt={`Your shot of ${place.name}`} />
            <p>Your photo — it stays on this phone.</p>
          </>
        ) : (
          <p>
            <span className="badge">No photo</span> You marked this one found
            without a photo.
          </p>
        )}
      </section>

      <div className="detail__actions">
        <button
          type="button"
          className="btn"
          onClick={() => void snap({ retakeFor: place.id })}
        >
          Retake photo
        </button>
        <button
          type="button"
          className="btn btn--danger"
          onClick={() => {
            undo(place.id);
            navigate("#/tour");
          }}
        >
          This wasn&rsquo;t it
        </button>
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

      <p>
        <a className="btn btn--quiet" href="#/tour">
          ← Back to the route
        </a>
      </p>
    </article>
  );
}
