import { useCallback, useEffect, useRef, type CSSProperties, type KeyboardEvent } from "react";
import { useRadio } from "../RadioProvider";
import { positionOf } from "../domain/band";
import { useTune } from "./useTune";

// The dial: a native scroll container whose snap points are the stations
// (research R1). Dragging it is scrolling it, so momentum, deceleration and
// rubber-banding at the ends are the platform's, not ours.

export function Dial() {
  const {
    broadcast,
    tuning,
    lockRadius,
    tune,
    isStationReceived,
    receivedCount,
    complete,
  } = useRadio();
  const bandRef = useRef<HTMLDivElement>(null);
  const total = broadcast.stations.length;

  const onScroll = useCallback(
    (nearestId: string | null, distance: number) =>
      tune({ type: "SCROLL", nearestId, distance, lockRadius }),
    [tune, lockRadius],
  );
  const onSettle = useCallback(() => tune({ type: "SETTLED" }), [tune]);

  useTune({
    bandRef,
    stations: broadcast.stations,
    band: broadcast.band,
    lockRadius,
    onScroll,
    onSettle,
  });

  // When a station is opened from the guide, the stepper or a deep link, the
  // dial moves to it — instantly, so a shared link does not begin with a
  // several-second flight down the band (contract §1).
  const lockedId = tuning.phase === "locked" ? tuning.stationId : null;
  useEffect(() => {
    if (!lockedId) return;
    const band = bandRef.current;
    const mark = band?.querySelector<HTMLElement>(`[data-station-id="${lockedId}"]`);
    if (!band || !mark) return;
    const target = mark.offsetLeft + mark.offsetWidth / 2 - band.clientWidth / 2;
    if (Math.abs(band.scrollLeft - target) < 2) return;
    band.scrollTo({ left: target, behavior: "auto" });
  }, [lockedId]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    const marks = [...(bandRef.current?.querySelectorAll<HTMLElement>("[data-station-id]") ?? [])];
    if (marks.length === 0) return;
    const active = document.activeElement as HTMLElement | null;
    const index = marks.findIndex((mark) => mark === active);

    let next = index;
    if (event.key === "ArrowRight") next = Math.min(marks.length - 1, index + 1);
    if (event.key === "ArrowLeft") next = Math.max(0, index - 1);
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = marks.length - 1;
    if (next === index || next < 0) return;

    event.preventDefault();
    marks[next]?.focus();
  };

  return (
    <div className="dial">
      <div className="dial__readout">
        <p className="dial__progress" data-testid="progress">
          {receivedCount} of {total} received
        </p>
        {complete ? (
          <a className="dial__signoff" href="#/signoff" data-testid="signoff-link">
            Hear the sign-off
          </a>
        ) : null}
      </div>

      <div className="dial__frame">
        <div className="dial__needle" aria-hidden="true" />
        <div
          className="dial__band"
          data-testid="band"
          ref={bandRef}
          role="listbox"
          aria-orientation="horizontal"
          aria-label={`Radio dial — ${receivedCount} of ${total} stations received`}
          // Focus lives on the station marks (roving focus), not on the band
          // itself; -1 keeps the band programmatically focusable without
          // adding a tab stop that lands on nothing.
          tabIndex={-1}
          onKeyDown={onKeyDown}
        >
          {/* Presentational: the listbox must own its options directly, and
              this element exists only to give the band its scrollable width. */}
          <div
            className="dial__track"
            role="none"
            style={{ "--band-screens": total } as CSSProperties}
          >
            {broadcast.stations.map((station) => {
              const received = isStationReceived(station.id);
              const selected = lockedId === station.id;
              return (
                <button
                  key={station.id}
                  type="button"
                  className="dial__mark"
                  data-testid="station-mark"
                  data-station-id={station.id}
                  data-received={received ? "true" : "false"}
                  style={
                    { "--pos": positionOf(station, broadcast.band) } as CSSProperties
                  }
                  role="option"
                  aria-selected={selected}
                  tabIndex={0}
                  onFocus={() => tune({ type: "FOCUS_STATION", stationId: station.id })}
                  onClick={() => tune({ type: "OPEN_STATION", stationId: station.id })}
                >
                  <span className="dial__mark-freq">{station.frequency.toFixed(1)}</span>
                  <span className="visually-hidden">
                    {station.name}, {station.frequency.toFixed(1)} FM,{" "}
                    {received ? "received" : "not received"}
                  </span>
                  <span className="dial__mark-name" aria-hidden="true">
                    {station.dialLabel ?? station.callSign ?? station.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
