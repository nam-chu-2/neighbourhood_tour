import { useEffect, useState } from "react";

// Hash routing (research R9): works on GitHub Pages with no rewrites.
// Routes: #/ (welcome) · #/tour · #/place/:id · #/recap
// Flags (in the hash query or the page query): after=1 — post-drive share link
// makes descriptions readable (FR-013); debug=1 — shows the event ring panel.

export type RouteName = "welcome" | "tour" | "place" | "recap";

export interface Route {
  name: RouteName;
  placeId?: string;
  after: boolean;
  debug: boolean;
}

/** Pure parser — unit-tested directly. `search` is window.location.search. */
export function parseRoute(hash: string, search = ""): Route {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const [path = "", hashQuery = ""] = raw.split("?");
  const hashParams = new URLSearchParams(hashQuery);
  const pageParams = new URLSearchParams(search);
  const flag = (key: string) =>
    hashParams.get(key) === "1" || pageParams.get(key) === "1";

  const base: Omit<Route, "name"> = { after: flag("after"), debug: flag("debug") };
  const segments = path.split("/").filter(Boolean);

  if (segments[0] === "tour") return { name: "tour", ...base };
  if (segments[0] === "recap") return { name: "recap", ...base };
  if (segments[0] === "place" && segments[1]) {
    return { name: "place", placeId: decodeURIComponent(segments[1]), ...base };
  }
  return { name: "welcome", ...base };
}

/** Navigate by setting the hash; `to` may include a leading "#". */
export function navigate(to: string): void {
  window.location.hash = to.startsWith("#") ? to.slice(1) : to;
}

export function placeHref(placeId: string, opts?: { after?: boolean }): string {
  return `#/place/${encodeURIComponent(placeId)}${opts?.after ? "?after=1" : ""}`;
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
