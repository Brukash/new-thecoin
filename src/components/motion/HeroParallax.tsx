"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Very small scroll parallax for the hero photograph.
 *
 * Deliberately limited to wide viewports and to visitors who have not asked for
 * reduced motion: on a phone the effect costs frame time and reads as jitter.
 * The wrapper is taller than the frame it sits in, so the movement can never
 * expose an edge, and the position is applied once per animation frame as a
 * transform — never as a layout change.
 */
export function HeroParallax({
  children,
  strength = 26,
}: {
  children: ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 1024px)");
    let frame = 0;

    const apply = () => {
      frame = 0;
      if (reduced.matches || !wide.matches) {
        node.style.transform = "";
        return;
      }
      const travel = Math.min(window.scrollY / (window.innerHeight || 1), 1);
      node.style.transform = `translate3d(0, ${(-travel * strength).toFixed(2)}px, 0)`;
    };

    const request = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    reduced.addEventListener("change", request);
    wide.addEventListener("change", request);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      reduced.removeEventListener("change", request);
      wide.removeEventListener("change", request);
    };
  }, [strength]);

  return (
    <div ref={ref} className="absolute inset-x-0 -inset-y-8 will-change-transform">
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
