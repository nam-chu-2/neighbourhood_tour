import { useEffect, useRef } from "react";
import type { Station } from "../domain/types";

// One station, on the air: what it is, what it meant, and what it would be if
// you only knew downtown (FR-007).

export function Broadcast({ station }: { station: Station }) {
  const regionRef = useRef<HTMLElement>(null);
  const hero = station.visuals[0];

  // Move focus to the broadcast when it opens — unless the visitor is working
  // the dial from the keyboard, in which case taking focus away from the band
  // would fight them on the very next arrow key.
  useEffect(() => {
    const region = regionRef.current;
    if (!region) return;
    const active = document.activeElement;
    if (active?.closest('[data-testid="band"]')) return;
    region.focus({ preventScroll: true });
  }, [station.id]);

  return (
    <article
      className="broadcast"
      data-testid="broadcast"
      data-station-id={station.id}
      ref={regionRef}
      role="region"
      aria-label={station.name}
      // A scrollable region must be reachable by keyboard or its overflow is
      // unreadable without a mouse (axe: scrollable-region-focusable). The
      // lint rule below assumes tabindex on a non-interactive element is a
      // mistake; here it is the fix.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
    >
      <p className="broadcast__ident">
        <span className="broadcast__freq">{station.frequency.toFixed(1)}</span>
        {station.callSign ? (
          <span className="broadcast__callsign">{station.callSign}</span>
        ) : null}
      </p>

      <h2 className="broadcast__name">{station.name}</h2>

      {hero ? (
        <figure className="broadcast__figure">
          <img src={hero.src} alt={hero.alt} loading="lazy" decoding="async" />
          <figcaption>{hero.credit}</figcaption>
        </figure>
      ) : null}

      <p className="broadcast__memory">{station.memory}</p>

      {station.downtownTranslation ? (
        <p className="broadcast__translation">
          <span className="broadcast__translation-label">If you only know downtown</span>
          {station.downtownTranslation}
        </p>
      ) : null}
    </article>
  );
}
