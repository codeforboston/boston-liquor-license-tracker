import { useCallback, useRef, type TouchEvent } from "react";

/**
 * Minimum horizontal travel, in px, before a touch counts as a swipe.
 * Anything shorter is treated as a tap or an accidental drag.
 */
export const SWIPE_MIN_DISTANCE_PX = 48;

/**
 * How much more horizontal than vertical the travel must be. The zip details
 * card scrolls vertically, so a mostly-vertical drag must never be read as a
 * swipe or the card becomes impossible to scroll.
 */
export const SWIPE_AXIS_RATIO = 1.5;

/**
 * Touches starting this close to either screen edge are ignored, so we don't
 * compete with the browser's own edge-swipe back/forward gesture (iOS Safari).
 */
export const SWIPE_EDGE_GUARD_PX = 24;

export type SwipeDirection = "prev" | "next";

export type SwipeVector = {
  dx: number;
  dy: number;
};

/**
 * Pure swipe decision. Exported separately from the hook so it can be unit
 * tested without a DOM environment.
 *
 * Swiping left (negative dx) advances forward, matching the direction
 * convention of a carousel: the content moves left as you move forward.
 */
export function resolveSwipe({ dx, dy }: SwipeVector): SwipeDirection | null {
  const distanceX = Math.abs(dx);
  const distanceY = Math.abs(dy);

  if (distanceX < SWIPE_MIN_DISTANCE_PX) return null;
  if (distanceX < distanceY * SWIPE_AXIS_RATIO) return null;

  return dx < 0 ? "next" : "prev";
}

type UseZipSwipeOptions = {
  onSwipe: (direction: SwipeDirection) => void;
};

/**
 * Returns touch handlers to spread onto the element that should respond to
 * horizontal swipes. Attach these to the zip details card rather than the map
 * container: the card sits above the map as a sibling node, so touches on it
 * never reach MapLibre's canvas and cannot interfere with pan or pinch-zoom.
 *
 * The element should also set `touch-action: pan-y` so the browser keeps
 * handling vertical scrolling natively.
 */
export function useZipSwipe({ onSwipe }: UseZipSwipeOptions) {
  const origin = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    // Multi-touch is a pinch, not a swipe.
    if (event.touches.length !== 1) {
      origin.current = null;
      return;
    }

    const touch = event.touches[0];
    const nearLeftEdge = touch.clientX <= SWIPE_EDGE_GUARD_PX;
    const nearRightEdge =
      touch.clientX >= window.innerWidth - SWIPE_EDGE_GUARD_PX;

    if (nearLeftEdge || nearRightEdge) {
      origin.current = null;
      return;
    }

    origin.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchMove = useCallback((event: TouchEvent<HTMLDivElement>) => {
    // A second finger landing mid-gesture cancels the swipe.
    if (event.touches.length > 1) {
      origin.current = null;
    }
  }, []);

  const onTouchEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      const start = origin.current;
      origin.current = null;

      if (!start) return;

      const touch = event.changedTouches[0];
      if (!touch) return;

      const direction = resolveSwipe({
        dx: touch.clientX - start.x,
        dy: touch.clientY - start.y,
      });

      if (direction) {
        onSwipe(direction);
      }
    },
    [onSwipe]
  );

  const onTouchCancel = useCallback(() => {
    origin.current = null;
  }, []);

  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel };
}
