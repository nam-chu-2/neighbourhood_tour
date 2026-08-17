import { registerSW } from "virtual:pwa-register";

// Service-worker registration + a tiny subscription so the Welcome screen can
// show "Ready for the road ✓" once the precache is complete (FR-012): after
// that moment the whole drive works with no connectivity.

let offlineReady = false;
const listeners = new Set<(ready: boolean) => void>();

export function isOfflineReady(): boolean {
  return offlineReady;
}

export function subscribeOfflineReady(listener: (ready: boolean) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function registerServiceWorker(): void {
  // The virtual module exists in dev too (no-op registration there).
  registerSW({
    immediate: true,
    onOfflineReady() {
      offlineReady = true;
      listeners.forEach((listener) => listener(true));
    },
  });
}
