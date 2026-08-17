import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

// Polite announcer for state that changes without a focus move — "Is this the
// Bells Corners Sign?", "3 of 6 found" (FR-014). Mounted once in App; screens
// call useAnnounce().

type Announce = (message: string) => void;

const AnnounceContext = createContext<Announce>(() => {});

export function LiveRegion({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const clearTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const announce = useCallback<Announce>((next) => {
    // Empty-then-set so repeating the same text is still announced.
    setMessage("");
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => setMessage(next), 30);
  }, []);

  const value = useMemo(() => announce, [announce]);

  return (
    <AnnounceContext.Provider value={value}>
      {children}
      <div role="status" aria-live="polite" className="visually-hidden">
        {message}
      </div>
    </AnnounceContext.Provider>
  );
}

export function useAnnounce(): Announce {
  return useContext(AnnounceContext);
}
