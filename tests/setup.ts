// Vitest setup (see vitest.config.ts). jsdom lacks IndexedDB; fake-indexeddb
// provides it so storage tests run with no browser and no network.
import "@testing-library/jest-dom";
import "fake-indexeddb/auto";
