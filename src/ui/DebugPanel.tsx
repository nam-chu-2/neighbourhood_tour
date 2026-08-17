import { useTour } from "../TourProvider";

// ?debug=1 event ring (Constitution V, research R11): the last 50 UI events,
// in memory only — never persisted, never sent anywhere.
export function DebugPanel() {
  const { debugLog } = useTour();
  return (
    <details className="debug-panel" open>
      <summary>Debug — last {debugLog.length} events</summary>
      <ol>
        {debugLog.map((entry, index) => (
          <li key={`${entry.at}-${index}`}>
            {entry.at.slice(11, 19)} {entry.event}
          </li>
        ))}
      </ol>
    </details>
  );
}
