/**
 * Check if the current viewport is mobile (< 768px).
 * Only call this in client-side code.
 */
export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

