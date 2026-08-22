// Everything the browser actually runs.
//
// The page is prerendered at build time (src/entry-server.tsx), so React never
// reaches the visitor. What ships is this: the reveal, the current-stop
// highlight, the share button, and a small debug ring. A couple of kilobytes
// instead of a framework, on a page that has no state to manage (Principle II).
import { initialRevealState, revealReducer, shouldAnimate } from "./domain/reveal";
import { registerServiceWorker } from "./pwa";

const root = document.documentElement;

// The failsafe in index.html removes the `js` class if this file never runs,
// so a script that fails to load leaves the page finished rather than blank
// (research R1). Claim it now that we are here.
root.dataset.enhanced = "true";

const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
const animating = shouldAnimate({
  scripting: true,
  reducedMotion,
  observerSupported: typeof IntersectionObserver !== "undefined",
});

// ---------- Reveal ----------

const sections = [...document.querySelectorAll<HTMLElement>("[data-revealed]")];

if (!animating) {
  // Nothing to animate: make sure every section is in its finished state.
  for (const section of sections) section.dataset.revealed = "revealed";
} else {
  for (const section of sections) section.dataset.revealed = initialRevealState(true);

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        const current = element.dataset.revealed === "revealed" ? "revealed" : "hidden";
        element.dataset.revealed = revealReducer(current, { type: "ENTERED" });
        // One-shot: a revealed section never animates again.
        observer.unobserve(element);
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
  );

  for (const section of sections) observer.observe(section);
}

// ---------- Which stop are we in ----------

const nav = document.querySelector<HTMLElement>('[data-testid="stop-nav"]');
if (nav && typeof IntersectionObserver !== "undefined") {
  const links = new Map<string, HTMLAnchorElement>();
  for (const link of nav.querySelectorAll<HTMLAnchorElement>("a[href^='#']")) {
    links.set(link.getAttribute("href")!.slice(1), link);
  }

  const visible = new Map<string, number>();
  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.stopId;
        if (!id) continue;
        if (entry.isIntersecting) visible.set(id, entry.intersectionRatio);
        else visible.delete(id);
      }

      let best: string | null = null;
      let bestRatio = 0;
      for (const [id, ratio] of visible) {
        if (ratio >= bestRatio) {
          best = id;
          bestRatio = ratio;
        }
      }

      for (const [id, link] of links) {
        if (id === best) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      }
    },
    { rootMargin: "-35% 0px -35% 0px", threshold: [0, 0.25, 0.5, 1] },
  );

  for (const stop of document.querySelectorAll("[data-stop-id]")) spy.observe(stop);
}

// ---------- Share ----------

const shareButton = document.querySelector<HTMLButtonElement>('[data-testid="share"]');
const shareNote = document.querySelector<HTMLElement>("[data-share-note]");

shareButton?.addEventListener("click", async () => {
  const url = window.location.href.split("#")[0] ?? window.location.href;
  const title = document.title;
  try {
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    if (shareNote) shareNote.textContent = "Link copied.";
  } catch {
    // Cancelled, or both refused: say something true and useful rather than
    // reporting a failure the reader cannot act on (FR-022).
    if (shareNote) shareNote.textContent = "Copy the link from your browser's address bar.";
  }
});

// ---------- Debug ring (?debug=1) ----------

if (new URLSearchParams(window.location.search).get("debug") === "1") {
  // A read-only page has one thing it can get wrong: a photograph that will not
  // load. In memory only, never persisted, never sent anywhere (Constitution V).
  const panel = document.createElement("details");
  panel.className = "debug-panel";
  panel.open = true;
  const summary = document.createElement("summary");
  const list = document.createElement("ol");
  let failures = 0;
  summary.textContent = "Debug — 0 image failure(s)";
  panel.append(summary, list);
  document.body.append(panel);

  window.addEventListener(
    "error",
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) return;
      failures += 1;
      summary.textContent = `Debug — ${failures} image failure(s)`;
      const item = document.createElement("li");
      item.textContent = `${new Date().toISOString().slice(11, 19)} image failed: ${
        target.currentSrc || target.src
      }`;
      list.append(item);
    },
    // Image errors do not bubble, so listen in the capture phase.
    true,
  );
}

registerServiceWorker();
