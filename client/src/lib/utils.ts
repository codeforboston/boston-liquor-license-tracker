import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * True modulo. JavaScript's `%` keeps the sign of the dividend, so `-1 % 13`
 * is `-1` rather than `12`. Used for wrap-around navigation, where stepping
 * back from the first item should land on the last.
 */
export function mod(x: number, y: number) {
  return ((x % y) + y) % y
}
