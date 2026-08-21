import { useRadio } from "../RadioProvider";
import { stationHref } from "../router";

// The station guide (FR-010): the whole dial as an ordered list, so the tour
// is completable without dragging anything — and so anyone can see at a glance
// what is left.

export function StationGuide() {
  const { broadcast, isStationReceived, receivedCount } = useRadio();

  return (
    <div className="guide">
      <header className="guide__top">
        <h1>Station guide</h1>
        <a className="radio__link" href="#/">
          Back to the dial
        </a>
      </header>

      <p className="guide__progress" data-testid="progress">
        {receivedCount} of {broadcast.stations.length} received
      </p>

      <ol className="guide__list">
        {broadcast.stations.map((station) => {
          const received = isStationReceived(station.id);
          return (
            <li key={station.id} className="guide__item" data-received={received}>
              <a className="guide__link" href={stationHref(station.id)}>
                <span className="guide__freq">{station.frequency.toFixed(1)}</span>
                <span className="guide__name">{station.name}</span>
                <span className="guide__state">{received ? "received" : "not received"}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
