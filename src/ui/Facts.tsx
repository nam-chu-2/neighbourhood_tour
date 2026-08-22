import type { ExpeditionFact } from "../domain/types";

// The facts strip: how long, how far, how many stops (FR-002). A description
// list, because that is what it is — and because it reads correctly to a screen
// reader without any extra labelling.

export function Facts({ facts }: { facts: ExpeditionFact[] }) {

  return (
    <div className="facts" data-testid="facts" data-revealed="hidden">
      <dl className="facts__list">
        {facts.map((fact) => (
          <div className="facts__item" key={fact.label}>
            <dt className="facts__label">{fact.label}</dt>
            <dd className="facts__value">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
