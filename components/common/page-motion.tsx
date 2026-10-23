"use client";

import { useEffect, useRef } from "react";

const TARGETS = "[data-reveal], [data-reveal-stagger]";

/**
 * Site-wide motion: reveals `[data-reveal]` / `[data-reveal-stagger]` elements as they
 * scroll into view and draws a thin reading-progress bar.
 *
 * It only ever sets the `data-revealed` attribute on those elements. Never touch `class`
 * or `style` here: React compares both during hydration, and pages that stream
 * (Suspense) would fail to hydrate and render blank.
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

    const show = (element: Element) => element.setAttribute("data-revealed", "");

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(TARGETS).forEach(show);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );

    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll(TARGETS).forEach((element) => {
        if (seen.has(element) || element.hasAttribute("data-revealed")) return;
        seen.add(element);
        io.observe(element);
      });
    };

    // Streamed pages and client navigations add targets later. Only observing and setting
    // an attribute here, so it is safe to run while React is still swapping content in.
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
