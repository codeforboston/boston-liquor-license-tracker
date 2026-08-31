import { describe, expect, it } from "vitest";
import {
  resolveSwipe,
  SWIPE_AXIS_RATIO,
  SWIPE_MIN_DISTANCE_PX,
} from "./useZipSwipe";

describe("resolveSwipe", () => {
  it("advances on a decisive leftward swipe", () => {
    expect(resolveSwipe({ dx: -120, dy: 6 })).toBe("next");
  });

  it("goes back on a decisive rightward swipe", () => {
    expect(resolveSwipe({ dx: 120, dy: 6 })).toBe("prev");
  });

  it("ignores travel shorter than the minimum distance", () => {
    const justUnder = SWIPE_MIN_DISTANCE_PX - 1;
    expect(resolveSwipe({ dx: -justUnder, dy: 0 })).toBeNull();
    expect(resolveSwipe({ dx: justUnder, dy: 0 })).toBeNull();
  });

  it("accepts travel exactly at the minimum distance", () => {
    expect(resolveSwipe({ dx: -SWIPE_MIN_DISTANCE_PX, dy: 0 })).toBe("next");
  });

  it("ignores a vertical drag so card scrolling still works", () => {
    expect(resolveSwipe({ dx: 10, dy: 200 })).toBeNull();
    expect(resolveSwipe({ dx: -10, dy: -200 })).toBeNull();
  });

  it("ignores a diagonal drag that is not decisively horizontal", () => {
    // 80px across, 70px down: over the distance floor, under the axis ratio.
    expect(resolveSwipe({ dx: -80, dy: 70 })).toBeNull();
  });

  it("accepts a diagonal drag once it clears the axis ratio", () => {
    const dy = 40;
    const dx = -(dy * SWIPE_AXIS_RATIO + 1);
    expect(resolveSwipe({ dx, dy })).toBe("next");
  });

  it("ignores a touch that did not move", () => {
    expect(resolveSwipe({ dx: 0, dy: 0 })).toBeNull();
  });
});