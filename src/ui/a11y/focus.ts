import { useEffect, type RefObject } from "react";

// Focus helpers (Constitution IV): move focus to the screen's heading on
// route changes, and trap focus inside the snap sheet while it is open.

/** Focus the first h1/h2 inside `root` (or the document) without scrolling jank. */
export function focusHeading(root: ParentNode = document): void {
  const heading = root.querySelector<HTMLElement>("h1, h2");
  if (!heading) return;
  if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: false });
}

const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
  'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Trap Tab focus inside `ref` while `active`; Escape calls `onEscape`.
 * Restores focus to the previously focused element when deactivated.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape?: () => void,
): void {
  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Move focus in so keyboard/screen-reader users land in the sheet.
    const initial = container.querySelector<HTMLElement>(TABBABLE);
    (initial ?? container).focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onEscape?.();
        return;
      }
      if (event.key !== "Tab") return;
      const tabbables = [...container.querySelectorAll<HTMLElement>(TABBABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (tabbables.length === 0) {
        event.preventDefault();
        return;
      }
      const first = tabbables[0]!;
      const last = tabbables[tabbables.length - 1]!;
      const current = document.activeElement;
      if (event.shiftKey && (current === first || current === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      previouslyFocused?.focus();
    };
  }, [ref, active, onEscape]);
}
