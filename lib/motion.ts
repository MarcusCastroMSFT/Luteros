import type { CSSProperties } from "react";

/** Props for an element that fades up when it scrolls into view (handled by `PageMotion`). */
export function reveal(index = 0, step = 90) {
  return {
    "data-reveal": "",
    style: { "--reveal-delay": `${index * step}ms` } as CSSProperties,
  };
}

/** Entrance delay (ms) for above-the-fold elements using `.hero-enter` / `.hero-rise`. */
export function enterDelay(ms: number) {
  return { "--enter-delay": `${ms}ms` } as CSSProperties;
}
