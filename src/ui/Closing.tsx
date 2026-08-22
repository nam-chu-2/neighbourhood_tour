import type { Expedition } from "../domain/types";

// The end of the page: the closing note, the credits, and a plain way to pass
// it on (FR-007, FR-016).

export function Closing({ expedition }: { expedition: Expedition }) {

  return (
    <section
      className="closing"
      data-testid="closing"
      data-revealed="hidden"
      aria-labelledby="closing-heading"
    >
      <h2 className="closing__heading" id="closing-heading">
        Back to the Queensway
      </h2>
      <p className="closing__note">{expedition.closing}</p>

      <div className="closing__actions">
        {/* Enhanced by src/enhance.ts; without scripting the visible link
            below is still there to copy. */}
        <button type="button" className="closing__share" data-testid="share">
          Share this expedition
        </button>
        <p className="closing__share-note" data-share-note role="status" />
      </div>

      <p className="closing__credits">{expedition.credits}</p>
    </section>
  );
}
