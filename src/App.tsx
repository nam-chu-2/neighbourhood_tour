import { expedition } from "./content/expedition";
import { Closing } from "./ui/Closing";
import { Facts } from "./ui/Facts";
import { Hero } from "./ui/Hero";
import { Overview } from "./ui/Overview";
import { RouteIllustration } from "./ui/RouteIllustration";
import { Stop } from "./ui/Stop";
import { StopNav } from "./ui/StopNav";

// The whole product: one document, read top to bottom (contract §1).
//
// This runs at BUILD time only — see src/entry-server.tsx. React is the
// templating language here, not a runtime: the browser is sent finished HTML
// plus src/enhance.ts, which is about two kilobytes. There is no state to
// hydrate, so shipping a framework to rebuild this page in the browser would
// be pure cost (Principle II).

export default function App() {
  return (
    <div className="page">
      <a className="skip-link" href="#stops">
        Skip to the itinerary
      </a>

      <Hero expedition={expedition} />
      <Facts facts={expedition.facts} />
      <Overview paragraphs={expedition.overview} />
      <RouteIllustration stops={expedition.stops} />

      <StopNav stops={expedition.stops} />

      <div className="stops" id="stops">
        {expedition.stops.map((stop) => (
          <Stop key={stop.id} stop={stop} />
        ))}
      </div>

      <Closing expedition={expedition} />

    </div>
  );
}
