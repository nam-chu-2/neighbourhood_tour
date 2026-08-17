import { useState } from "react";
import { useTour } from "../TourProvider";
import { isComplete } from "../domain/tourState";
import type { Find, Place } from "../domain/types";
import { composeRecap } from "../recap/composeRecap";
import { useAnnounce } from "./a11y/LiveRegion";
import { useObjectUrl } from "./useObjectUrl";

// FR-009 / US2: the visitor's own photos in route order with place names,
// the closing note, and a way to keep it (Web Share with the composed JPEG,
// falling back to a download). Partial recaps are honest about what's left.
export function Recap() {
  const { state } = useTour();
  const announce = useAnnounce();
  const { tour } = state;
  const placeById = new Map(tour.places.map((place) => [place.id, place]));
  const finds = [...state.finds]
    .filter((find) => placeById.has(find.placeId))
    .sort((a, b) => placeById.get(a.placeId)!.order - placeById.get(b.placeId)!.order);
  const complete = isComplete(state);
  const [saving, setSaving] = useState(false);

  if (finds.length === 0) {
    return (
      <div className="screen locked">
        <h1>Your ride</h1>
        <p>Nothing found yet — the recap builds itself as you snap places.</p>
        <a className="btn btn--primary" href="#/tour">
          Back to the route
        </a>
      </div>
    );
  }

  const save = async () => {
    setSaving(true);
    try {
      const blob = await composeRecap(finds, tour);
      const file = new File([blob], "bells-corners-ride.jpg", { type: "image/jpeg" });
      const nav = navigator as Navigator & {
        canShare?: (data?: { files?: File[] }) => boolean;
        share?: (data?: { files?: File[]; title?: string }) => Promise<void>;
      };
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        try {
          await nav.share({ files: [file], title: tour.title });
          announce("Your ride has been shared.");
          return;
        } catch {
          // Cancelled or unsupported — fall through to a plain download.
        }
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "bells-corners-ride.jpg";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      announce("Your ride has been downloaded.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="screen recap">
      <h1>Your ride</h1>
      {complete ? (
        <p className="recap__note">{tour.closingNote}</p>
      ) : (
        <p className="recap__note">
          {finds.length} of {tour.places.length} so far — the rest of the drive is
          still out there.
        </p>
      )}

      <ol className="recap__grid">
        {finds.map((find) => (
          <RecapTile key={find.placeId} find={find} place={placeById.get(find.placeId)!} />
        ))}
      </ol>

      <div className="detail__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => void save()}
          disabled={saving}
        >
          {saving ? "Putting it together…" : "Save your ride"}
        </button>
        <a className="btn btn--quiet" href="#/tour">
          Back to the route
        </a>
      </div>
      <p className="detail__credit">
        Your photos stay on this phone unless you share them yourself.
      </p>
    </div>
  );
}

function RecapTile({ find, place }: { find: Find; place: Place }) {
  const photoUrl = useObjectUrl(find.photo);
  const hero = place.media[0]!;
  return (
    <li className="recap__tile">
      <figure>
        {photoUrl ? (
          <img src={photoUrl} alt={`Your shot of ${place.name}`} loading="lazy" />
        ) : (
          <span className="recap__no-photo">
            <img src={hero.src} alt={hero.alt} loading="lazy" />
            <span className="badge">No photo</span>
          </span>
        )}
        <figcaption>
          <span aria-hidden="true">{place.order}.</span> {place.name}
        </figcaption>
      </figure>
    </li>
  );
}
