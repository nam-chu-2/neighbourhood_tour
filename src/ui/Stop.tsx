import type { Stop as StopModel } from "../domain/types";
import { Figure } from "./Figure";

// One itinerary stop: the unit an expedition page is built from. Numbered,
// headlined, photographed, and told in the first person (FR-005, FR-006).

export function Stop({ stop }: { stop: StopModel }) {
  const lead = stop.images[0];

  return (
    <section
      className="stop"
      id={stop.id}
      data-testid="stop"
      data-stop-id={stop.id}
      data-stop-number={stop.number}
      data-revealed="hidden"
      aria-labelledby={`${stop.id}-headline`}
    >
      <div className="stop__head">
        <p className="stop__number" aria-hidden="true">
          {String(stop.number).padStart(2, "0")}
        </p>
        <div>
          <h2 className="stop__headline" id={`${stop.id}-headline`}>
            <span className="visually-hidden">Stop {stop.number}: </span>
            {stop.headline}
          </h2>
          {stop.standfirst ? <p className="stop__standfirst">{stop.standfirst}</p> : null}
        </div>
      </div>

      {lead ? <Figure image={lead} className="stop__figure" sizes="(min-width: 60rem) 60rem, 100vw" /> : null}

      <div className="stop__prose">
        {stop.story.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}

        {stop.downtownTranslation ? (
          <aside className="stop__translation">
            <p className="stop__translation-label">If you only know downtown</p>
            <p>{stop.downtownTranslation}</p>
          </aside>
        ) : null}
      </div>

      {stop.images.slice(1).map((image) => (
        <Figure key={image.src} image={image} className="stop__figure" />
      ))}
    </section>
  );
}
