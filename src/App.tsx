import { Component, Suspense, lazy, type ReactNode } from "react";
import { TourProvider, useTour } from "./TourProvider";
import { tour } from "./content/tour";
import { useHashRoute, type Route } from "./router";
import { LiveRegion } from "./ui/a11y/LiveRegion";
import { DebugPanel } from "./ui/DebugPanel";
import { PlaceDetail } from "./ui/PlaceDetail";
import { TourScreen } from "./ui/TourScreen";
import { Welcome } from "./ui/Welcome";

// The recap is only needed at the end of the drive — keep it out of the
// initial bundle (SC-001). The chunk is still precached for offline use.
const Recap = lazy(() =>
  import("./ui/Recap").then((module) => ({ default: module.Recap })),
);

// Route switch behind a hydration gate: nothing renders as "locked" or
// "0 found" until IndexedDB state has loaded (FR-008; US3 deep links).
function Screens({ route }: { route: Route }) {
  const { ready } = useTour();

  if (!ready) {
    return (
      <div className="app-status" aria-busy="true">
        <p>Loading the drive…</p>
      </div>
    );
  }

  switch (route.name) {
    case "welcome":
      return <Welcome />;
    case "tour":
      return <TourScreen />;
    case "place":
      return <PlaceDetail route={route} />;
    case "recap":
      return (
        <Suspense
          fallback={
            <div className="app-status" aria-busy="true">
              <p>Loading your ride…</p>
            </div>
          }
        >
          <Recap />
        </Suspense>
      );
  }
}

// A crash must never strand a passenger mid-drive with a blank page or a raw
// stack trace (Constitution IV): explain and offer a reload — state is safe
// in IndexedDB.
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="app-status">
          <h1>Something went wrong</h1>
          <p>
            The tour hit a snag, but your finds and photos are safe on this phone.
            Reload to pick up where you left off.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => window.location.reload()}
          >
            Reload the tour
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const route = useHashRoute();

  return (
    <ErrorBoundary>
      <LiveRegion>
        <TourProvider tour={tour}>
          <main>
            <Screens route={route} />
          </main>
          {route.debug && <DebugPanel />}
        </TourProvider>
      </LiveRegion>
    </ErrorBoundary>
  );
}
