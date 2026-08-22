import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/** True when the visitor prefers reduced motion (FR-012 / SC-006). */
export function useReducedMotion(): boolean {
  // No window during the build-time render, and no preference to read.
  const [reduced, setReduced] = useState(() =>
    typeof window === "undefined" ? false : (window.matchMedia?.(QUERY).matches ?? false),
  );

  useEffect(() => {
    const mql = window.matchMedia?.(QUERY);
    if (!mql) return;
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);

  return reduced;
}
