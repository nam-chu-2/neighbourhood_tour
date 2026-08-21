import { useCallback, useState } from "react";
import { useRadio } from "../RadioProvider";
import {
  composeKeepsake,
  keepsakeFileName,
  keepsakeLines,
} from "../keepsake/composeKeepsake";
import { stationHref } from "../router";

// The end of the tour (FR-012): a closing broadcast that names what the
// visitor has just been through, and — once composed — the keepsake they can
// keep or pass on (FR-013).

export function SignOff() {
  const { broadcast, receptions, log } = useRadio();
  const lines = keepsakeLines(broadcast, receptions);
  const [saveNote, setSaveNote] = useState<string | null>(null);

  // The card is on screen either way; this only decides how a copy of it
  // leaves the device — shared where the browser supports it, downloaded
  // where it does not (research R8).
  const save = useCallback(async () => {
    setSaveNote(null);
    const blob = await composeKeepsake(broadcast, receptions);
    if (!blob) {
      setSaveNote("This browser will not let us build the image — the card above is yours to screenshot.");
      log("keepsake image unavailable");
      return;
    }

    const file = new File([blob], keepsakeFileName(), { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: broadcast.title });
        log("keepsake shared");
        return;
      } catch {
        // Cancelled or refused — fall through to the download.
      }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = keepsakeFileName();
    link.click();
    URL.revokeObjectURL(url);
    log("keepsake downloaded");
  }, [broadcast, receptions, log]);

  return (
    <div className="signoff" data-testid="signoff">
      <header className="signoff__top">
        <p className="signoff__ident">End of broadcast</p>
        <h1>{broadcast.title}</h1>
      </header>

      <p className="signoff__note">{broadcast.signOff}</p>

      <section className="keepsake" data-testid="keepsake" aria-labelledby="keepsake-heading">
        <h2 className="signoff__heading" id="keepsake-heading">
          You tuned in to
        </h2>
        <ol className="signoff__list">
          {lines.map((line) => {
            const station = broadcast.stations.find((s) => s.name === line.name);
            return (
              <li key={line.name} data-testid="keepsake-station">
                <a href={station ? stationHref(station.id) : "#/"}>
                  <span className="signoff__freq">{line.frequency.toFixed(1)}</span>
                  {line.name}
                </a>
              </li>
            );
          })}
        </ol>

        <p className="signoff__count">
          {lines.length} of {broadcast.stations.length} stations received
        </p>

        <button
          type="button"
          className="radio__link"
          data-testid="keepsake-save"
          onClick={() => void save()}
        >
          Keep this card
        </button>
        {saveNote ? (
          <p className="signoff__note" role="status">
            {saveNote}
          </p>
        ) : null}
      </section>

      <a className="radio__link" href="#/">
        Back to the dial
      </a>
    </div>
  );
}
