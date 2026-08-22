import type { Expedition } from "../domain/types";
import { Figure } from "./Figure";

// The opening: one photograph at full bleed, the title over it, and a single
// line saying what this is (FR-001). The text sits on a scrim whose contrast is
// guaranteed against any photograph the author might later supply — see
// src/domain/scrim.ts and tests/unit/scrim.test.ts.

export function Hero({ expedition }: { expedition: Expedition }) {
  return (
    <header className="hero" data-testid="hero">
      <div className="hero__media">
        <Figure image={expedition.heroImage} priority sizes="100vw" className="hero__figure" />
        <div className="hero__scrim" aria-hidden="true" />
      </div>

      <div className="hero__text">
        <p className="hero__eyebrow">An expedition</p>
        <h1 className="hero__title">{expedition.title}</h1>
        <p className="hero__dek">{expedition.dek}</p>
      </div>
    </header>
  );
}
