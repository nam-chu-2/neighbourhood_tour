import { useRadio } from "../RadioProvider";

// The off-station state. The grain and the scanlines are decoration — their
// intensity is pure CSS keyed to --detune (research R3) — but the *state* they
// depict carries meaning, so it also has a text equivalent for anyone who
// cannot see it (FR-021, contract §4).

export function Static() {
  const { tuning } = useRadio();
  const offStation = tuning.phase !== "locked";

  return (
    <>
      <div className="static" aria-hidden="true">
        <div className="static__grain" />
        <div className="static__scan" />
      </div>
      {offStation ? (
        <p className="static__message" data-testid="offstation">
          <span className="static__hiss">— — — · — —</span>
          Nothing tuned in. Keep turning the dial.
        </p>
      ) : null}
    </>
  );
}
