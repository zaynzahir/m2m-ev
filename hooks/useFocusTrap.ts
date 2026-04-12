import { type RefObject, useEffect } from "react";

/**
 * Keeps keyboard focus inside `rootRef` while `active` (modal pattern).
 */
export function useFocusTrap(
  active: boolean,
  rootRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!active || !rootRef.current) return;
    const root = rootRef.current;

    const selector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getEls = () =>
      Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
      );

    const focusables = getEls();
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || focusables.length === 0) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    root.addEventListener("keydown", onKeyDown);
    return () => root.removeEventListener("keydown", onKeyDown);
  }, [active, rootRef]);
}
