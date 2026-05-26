import type { AnyRouter } from "@tanstack/router-core";
import {
  defaultGetScrollRestorationKey,
  scrollRestorationCache,
} from "@tanstack/router-core";

/**
 * TanStack Router's built-in restoreScroll treats `window.location.hash` as an
 * element id. With hash-based routing (`#/maps`), that branch always runs and
 * returns without scrolling to the top. This fills the gap: scroll to top when
 * there is no saved window position for the destination.
 */
export function setupHashHistoryScrollRestoration(router: AnyRouter) {
  router.subscribe("onRendered", (event) => {
    if (!router.resetNextScroll) {
      router.resetNextScroll = true;
      return;
    }

    const getKey =
      router.options.getScrollRestorationKey ?? defaultGetScrollRestorationKey;
    const key = getKey(event.toLocation);
    const windowEntry = scrollRestorationCache?.state?.[key]?.window;

    if (!windowEntry) {
      window.scrollTo(0, 0);
    }
  });
}
