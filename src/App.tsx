import { LiveRegion } from "./ui/a11y/LiveRegion";
import { useHashRoute } from "./router";

// Placeholder shell (T015): each hash route renders a heading so the skeleton
// is navigable on phones. Real screens land with User Story 1 (T035).
export default function App() {
  const route = useHashRoute();

  return (
    <LiveRegion>
      <main>
        {route.name === "welcome" && <h1>Bells Corners: The Drive</h1>}
        {route.name === "tour" && <h1>The route</h1>}
        {route.name === "place" && <h1>Place: {route.placeId}</h1>}
        {route.name === "recap" && <h1>Your ride</h1>}
      </main>
    </LiveRegion>
  );
}
