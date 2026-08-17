import { useCallback, useEffect, useRef } from "react";
import { useTour } from "../TourProvider";
import { unfoundPlaces } from "../domain/tourState";
import { navigate, placeHref } from "../router";
import { useAnnounce } from "./a11y/LiveRegion";
import { useFocusTrap } from "./a11y/focus";
import { useObjectUrl } from "./useObjectUrl";

// The snap bottom sheet (FR-003, FR-005): proposal with one-tap confirm,
// "pick a different place", retake/dismiss, and the camera-unavailable
// fallback. Everything runs locally — no network.

export function SnapSheet() {
  const { state, confirm, pickDifferent, pick, retake, dismiss, markWithoutPhoto } =
    useTour();
  const announce = useAnnounce();
  const sheetRef = useRef<HTMLDivElement>(null);

  const { snap } = state;
  const open =
    snap.phase === "proposing" ||
    snap.phase === "picking" ||
    snap.phase === "cameraUnavailable";

  const proposedPlace =
    snap.phase === "proposing"
      ? state.tour.places.find((place) => place.id === snap.placeId)
      : snap.phase === "cameraUnavailable" && snap.placeId
        ? state.tour.places.find((place) => place.id === snap.placeId)
        : undefined;

  const photo =
    snap.phase === "proposing" || snap.phase === "picking" ? snap.photo : null;
  const photoUrl = useObjectUrl(photo);

  useEffect(() => {
    if (snap.phase === "proposing" && proposedPlace) {
      announce(
        `Photo taken. Is this ${proposedPlace.name}? Confirm, pick a different place, or retake.`,
      );
    } else if (snap.phase === "cameraUnavailable") {
      announce(
        "No photo was taken. You can mark the place found without one so the tour continues.",
      );
    }
  }, [snap.phase, proposedPlace, announce]);

  const close = useCallback(() => dismiss(), [dismiss]);
  useFocusTrap(sheetRef, open, close);

  if (!open) return null;

  const openPlace = (placeId: string) => navigate(placeHref(placeId));

  return (
    <>
      <button
        type="button"
        className="sheet-backdrop"
        aria-label="Close"
        onClick={close}
        tabIndex={-1}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="snap-sheet-title"
        className="sheet"
      >
        {snap.phase === "proposing" && proposedPlace && (
          <>
            {photoUrl && (
              <img className="sheet__photo" src={photoUrl} alt="Your photo, just taken" />
            )}
            <h2 id="snap-sheet-title">Is this {proposedPlace.name}?</h2>
            {proposedPlace.cue && <p className="sheet__cue">{proposedPlace.cue}</p>}
            <div className="sheet__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  const placeId = confirm();
                  if (placeId) openPlace(placeId);
                }}
              >
                Yes, that&rsquo;s it
              </button>
              <button type="button" className="btn" onClick={pickDifferent}>
                Pick a different place
              </button>
              <button type="button" className="btn btn--quiet" onClick={retake}>
                Retake
              </button>
            </div>
          </>
        )}

        {snap.phase === "picking" && (
          <>
            <h2 id="snap-sheet-title">Which place is this?</h2>
            {photoUrl && (
              <img className="sheet__photo" src={photoUrl} alt="Your photo, just taken" />
            )}
            {!photo && (
              <p className="sheet__cue">
                The place you pick will be marked found without a photo.
              </p>
            )}
            <ul className="sheet__pick-list">
              {unfoundPlaces(state).map((place) => (
                <li key={place.id}>
                  <button
                    type="button"
                    className="btn btn--block"
                    onClick={() => openPlace(pick(place.id))}
                  >
                    <span aria-hidden="true">{place.order}.</span> {place.name}
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn--quiet" onClick={retake}>
              Retake
            </button>
          </>
        )}

        {snap.phase === "cameraUnavailable" && (
          <>
            <h2 id="snap-sheet-title">The camera didn&rsquo;t work</h2>
            <p>
              No photo was taken — the camera may be closed, blocked, or unavailable
              on this phone. The ride goes on: you can mark the place as found
              without a photo.
            </p>
            <div className="sheet__actions">
              {proposedPlace && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    const placeId = markWithoutPhoto();
                    if (placeId) openPlace(placeId);
                  }}
                >
                  Mark {proposedPlace.name} found without a photo
                </button>
              )}
              <button type="button" className="btn" onClick={pickDifferent}>
                Pick a different place
              </button>
              <button type="button" className="btn btn--quiet" onClick={close}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
