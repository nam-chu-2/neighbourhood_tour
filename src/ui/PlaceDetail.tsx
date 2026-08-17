import { useState } from "react";
import { useTour } from "../TourProvider";
import { canRead } from "../domain/readability";
import { findFor, isComplete } from "../domain/tourState";
import type { Find, Place } from "../domain/types";
import { navigate, type Route } from "../router";
import { useAnnounce } from "./a11y/LiveRegion";
import { useObjectUrl } from "./useObjectUrl";
import { useReducedMotion } from "./useReducedMotion";

// FR-004: name, hero visual, first-person story, optional downtown
// translation. Undo ("This wasn't it"), retake photo, closing note when the
// tour completes (US1), and locked/readable deep-link variants + "Share this
// place" (US3, FR-013).
export function PlaceDetail({ route }: { route: Route }) {
  const { state } = useTour();
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

  if (!canRead(place, state, route)) {
    return <LockedPlace place={place} />;
  }

  return <ReadablePlace place={place} find={findFor(state, place.id)} />;
}

function LockedPlace({ place }: { place: Place }) {
  return (
    <div className="screen locked">
      <h1>{place.name}</h1>
      <p className="badge">Stop {place.order} — not yet found</p>
      <p>
        This story unlocks during the drive: when the car gets there, snap a photo
        of the place.
      </p>
      <a className="btn btn--primary" href="#/tour">
        Snap it from the route
      </a>
    </div>
  );
}

function ReadablePlace({ place, find }: { place: Place; find: Find | undefined }) {
  const { state, snap, undo, ackReveal } = useTour();
  const announce = useAnnounce();
  const reducedMotion = useReducedMotion();
  const { tour } = state;
  const hero = place.media[0]!;
  const yourPhotoUrl = useObjectUrl(find?.photo ?? null);
  const complete = isComplete(state);

  // The surprise moment (US2, T043): when this place was *just* found, the
  // visitor's own photo crossfades into the author's visual. Tap to skip.
  // Never replayed (ackReveal) and never played under reduced motion.
  const [revealing, setRevealing] = useState(
    () => state.lastFoundId === place.id && !!find?.photo && !reducedMotion,
  );
  const finishReveal = () => {
    setRevealing(false);
    ackReveal();
  };

  const sharePlace = async () => {
    const url = new URL(window.location.href);
    url.hash = `/place/${encodeURIComponent(place.id)}?after=1`;
    const shareUrl = url.toString();
    const nav = navigator as Navigator & {
      share?: (data?: { url?: string; title?: string }) => Promise<void>;
    };
    if (nav.share) {
      try {
        await nav.share({ url: shareUrl, title: `${place.name} — ${tour.title}` });
        return;
      } catch {
        // Cancelled or unsupported — fall through to the clipboard.
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      announce("Link copied. Anyone can open this place with it.");
    } catch {
      announce(`Couldn't copy automatically. The link is ${shareUrl}`);
    }
  };

  return (
    <article className="screen detail">
      <h1>{place.name}</h1>
      <div className="detail__hero-wrap">
        <img
          className="detail__hero"
          src={hero.src}
          alt={hero.alt}
          loading="lazy"
          decoding="async"
        />
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

      {find && (
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
      )}

      <div className="detail__actions">
        {find && (
          <>
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
          </>
        )}
        {complete && (
          <button type="button" className="btn" onClick={() => void sharePlace()}>
            Share this place
          </button>
        )}
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
