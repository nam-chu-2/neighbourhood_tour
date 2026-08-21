import { useEffect, useState } from "react";
import { RadioProvider, useRadio } from "./RadioProvider";
import { navigate, useHashRoute } from "./router";
import { LiveRegion } from "./ui/a11y/LiveRegion";
import { Broadcast } from "./ui/Broadcast";
import { DebugPanel } from "./ui/DebugPanel";
import { Dial } from "./ui/Dial";
import { SignOff } from "./ui/SignOff";
import { SoundToggle } from "./ui/SoundToggle";
import { StationGuide } from "./ui/StationGuide";
import { Static } from "./ui/Static";
import { Stepper } from "./ui/Stepper";
import { useReducedMotion } from "./ui/useReducedMotion";

export default function App() {
  return (
    <LiveRegion>
      <RadioProvider>
        <Radio />
      </RadioProvider>
    </LiveRegion>
  );
}

function Radio() {
  const route = useHashRoute();
  const { broadcast, complete, openStation, tuning, log } = useRadio();
  const reducedMotion = useReducedMotion();
  const [notFound, setNotFound] = useState<string | null>(null);

  // Deep links (FR-018): a station link opens that station directly, with the
  // dial around it. An id that no longer exists says so plainly and leaves the
  // visitor somewhere useful rather than on an error page (FR-023).
  useEffect(() => {
    if (route.name !== "station" || !route.stationId) return;

    const exists = broadcast.stations.some((station) => station.id === route.stationId);
    if (!exists) {
      // Say what happened, then put them somewhere useful. The notice has to
      // outlive the redirect it triggers, so it is cleared by tuning in — not
      // by landing back on the dial (FR-023).
      log(`unknown station in link: ${route.stationId}`);
      setNotFound(route.stationId);
      navigate("#/");
      return;
    }
    setNotFound(null);
    openStation(route.stationId);
  }, [route, broadcast, openStation, log]);

  // Any successful lock-in means the visitor has moved on from the bad link.
  useEffect(() => {
    if (tuning.phase === "locked") setNotFound(null);
  }, [tuning]);

  // The sign-off belongs to the end of the tour; reaching for it early simply
  // returns to the dial (contract §1).
  useEffect(() => {
    if (route.name === "signoff" && !complete) navigate("#/");
  }, [route, complete]);

  if (route.name === "guide") {
    return (
      <>
        <StationGuide />
        {route.debug ? <DebugPanel /> : null}
      </>
    );
  }

  if (route.name === "signoff" && complete) {
    return (
      <>
        <SignOff />
        {route.debug ? <DebugPanel /> : null}
      </>
    );
  }

  const lockedStation =
    tuning.phase === "locked"
      ? (broadcast.stations.find((station) => station.id === tuning.stationId) ?? null)
      : null;

  return (
    <div className="radio">
      <header className="radio__top">
        <h1 className="radio__title">{broadcast.title}</h1>
        <div className="radio__controls">
          <a className="radio__link" href="#/guide" data-testid="guide">
            Station guide
          </a>
          <SoundToggle />
        </div>
      </header>

      {notFound ? (
        <p className="radio__notice" role="status">
          That station is not on this dial any more. Tune from the start instead.
        </p>
      ) : null}

      <main className="radio__screen">
        <Static />
        {lockedStation ? <Broadcast station={lockedStation} /> : null}
      </main>

      {reducedMotion ? <Stepper /> : null}
      <Dial />
      {route.debug ? <DebugPanel /> : null}
    </div>
  );
}
