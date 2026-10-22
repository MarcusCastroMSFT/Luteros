"use client";

import { useEffect, useRef } from "react";

const TARGETS = "[data-reveal], [data-reveal-stagger]";
const COLUMN_STEP_MS = 90;
const MAX_COLUMNS = 4;

/** Short cascade by column, so a grid enters left to right instead of all at once. */
function staggerChildren(container: HTMLElement) {
  let rowTop: number | null = null;
  let column = 0;
  for (const child of Array.from(container.children) as HTMLElement[]) {
    const top = child.offsetTop;
    if (rowTop === null || Math.abs(top - rowTop) > 8) {
      rowTop = top;
      column = 0;
    }
    child.style.setProperty("--reveal-delay", `${Math.min(column, MAX_COLUMNS - 1) * COLUMN_STEP_MS}ms`);
    column += 1;
  }
}

/**
 * Site-wide motion: reveals `[data-reveal]` / `[data-reveal-stagger]` elements
 * as they scroll into view and draws a thin reading-progress bar.
 * Hidden states live in `globals.css` and only apply with scripting on and
 * `prefers-reduced-motion: no-preference`.
 */
export function PageMotion() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      bar?.style.setProperty("--scroll-progress", progress.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const show = (element: HTMLElement) => {
      if (element.hasAttribute("data-reveal-stagger")) staggerChildren(element);
      element.classList.add("is-visible");
    };

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll<HTMLElement>(TARGETS).forEach(show);
      return;
    }

    const observed = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target as HTMLElement);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>(TARGETS).forEach((element) => {
        if (observed.has(element) || element.classList.contains("is-visible")) return;
        observed.add(element);
        io.observe(element);
      });
    };

    // Pages stream in and change on client navigation, so new targets keep appearing.
    let scanFrame = 0;
    const mutations = new MutationObserver(() => {
      if (!scanFrame) {
        scanFrame = requestAnimationFrame(() => {
          scanFrame = 0;
          scan();
        });
      }
    });
    scan();
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      io.disconnect();
      if (scanFrame) cancelAnimationFrame(scanFrame);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="scroll-progress pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] bg-gradient-to-r from-[#198189] via-[#198189] to-[#630a79]"
    />
  );
}
