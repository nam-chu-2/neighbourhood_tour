import { useRadio, type DebugEntry } from "../RadioProvider";

// ?debug=1 event ring (Constitution V): the last 50 UI events — tuning,
// lock-ins, receptions, storage and audio failures — in memory only, never
// persisted and never sent anywhere.
export function DebugPanel() {
  const { debugLog } = useRadio();
  return (
    <details className="debug-panel" open>
      <summary>Debug — last {debugLog.length} events</summary>
      <ol>
        {debugLog.map((entry: DebugEntry, index: number) => (
          <li key={`${entry.at}-${index}`}>
            {entry.at.slice(11, 19)} {entry.event}
          </li>
        ))}
      </ol>
    </details>
  );
}
