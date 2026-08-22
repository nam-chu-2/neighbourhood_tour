import { renderToStaticMarkup } from "react-dom/server";
import App from "./App";

// Build-time rendering entry (research R1). The page is content, so its HTML
// must exist in the document rather than waiting on a JavaScript bundle: with
// scripting off the whole expedition is still there, and with scripting on the
// hero paints sooner (SC-001).
export function render(): string {
  return renderToStaticMarkup(<App />);
}
