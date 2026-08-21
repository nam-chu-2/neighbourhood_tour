// Vitest setup (see vitest.config.ts).
import "@testing-library/jest-dom";

// This jsdom build exposes the `Storage` interface but not a working
// `window.localStorage`. The radio stores a few short strings there
// (src/storage/receptionStore.ts), so tests install a minimal in-memory
// implementation on `Storage.prototype` — real browsers provide this natively,
// and putting it on the prototype keeps `vi.spyOn(Storage.prototype, …)`
// working for the tests that simulate storage refusing to co-operate.
if (typeof window.localStorage?.getItem !== "function") {
  const store = new Map<string, string>();

  Object.defineProperties(Storage.prototype, {
    getItem: {
      configurable: true,
      writable: true,
      value: (key: string) => (store.has(String(key)) ? store.get(String(key))! : null),
    },
    setItem: {
      configurable: true,
      writable: true,
      value: (key: string, value: string) => {
        store.set(String(key), String(value));
      },
    },
    removeItem: {
      configurable: true,
      writable: true,
      value: (key: string) => {
        store.delete(String(key));
      },
    },
    clear: {
      configurable: true,
      writable: true,
      value: () => {
        store.clear();
      },
    },
    key: {
      configurable: true,
      writable: true,
      value: (index: number) => [...store.keys()][index] ?? null,
    },
    length: {
      configurable: true,
      get: () => store.size,
    },
  });

  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: Object.create(Storage.prototype) as Storage,
  });
}
