import { useEffect, useState } from "react";

// Hash routing (research R9): needs no server rewrites, which is what makes
// per-station links free on static hosting.
// Routes: #/ (the dial) · #/station/:id · #/guide · #/signoff
// Flag: debug=1 (in the hash query or the page query) shows the event ring.

export type RouteName = "dial" | "station" | "guide" | "signoff";

export interface Route {
  name: RouteName;
  stationId?: string;
  debug: boolean;
}

/** Pure parser — unit-tested directly. `search` is window.location.search. */
export function parseRoute(hash: string, search = ""): Route {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const [path = "", hashQuery = ""] = raw.split("?");
  const hashParams = new URLSearchParams(hashQuery);
  const pageParams = new URLSearchParams(search);
  const debug = hashParams.get("debug") === "1" || pageParams.get("debug") === "1";

  const segments = path.split("/").filter(Boolean);

  if (segments[0] === "guide") return { name: "guide", debug };
  if (segments[0] === "signoff") return { name: "signoff", debug };
  if (segments[0] === "station" && segments[1]) {
    return { name: "station", stationId: decodeURIComponent(segments[1]), debug };
  }
  return { name: "dial", debug };
}

/** Navigate by setting the hash; `to` may include a leading "#". */
export function navigate(to: string): void {
  window.location.hash = to.startsWith("#") ? to.slice(1) : to;
}

export function stationHref(stationId: string): string {
  return `#/station/${encodeURIComponent(stationId)}`;
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() =>
    parseRoute(window.location.hash, window.location.search),
  );
  useEffect(() => {
    const onHashChange = () =>
      setRoute(parseRoute(window.location.hash, window.location.search));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return route;
}
