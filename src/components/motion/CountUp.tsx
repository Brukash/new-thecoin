"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a published figure up to its real value when it scrolls into view.
 *
 * The number, any grouping comma and the surrounding characters ("45th",
 * "2,000+", "2016") are preserved exactly, so nothing is retyped and no term is
 * exaggerated. It runs once per mount — never on every scroll — and the final
 * value is what renders on the server, so the page is correct without JS and
 * for anyone who prefers reduced motion.
 */
export function CountUp({
  value,
  className = "",
  duration = 1400,
}: {
  value: string;
  className?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const parsed = /^(\D*)(\d[\d,]*)(.*)$/s.exec(value);
    if (!parsed) return;

    const [, prefix, digits, suffix] = parsed;
    const target = Number(digits.replace(/,/g, ""));
    if (!Number.isFinite(target) || target === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const node = ref.current;
    if (!node) return;

    const grouped = digits.includes(",");
    const format = (amount: number) =>
      `${prefix}${grouped ? amount.toLocaleString("en-US") : String(amount)}${suffix}`;

    // Start from zero only once the element is about to be seen, so a figure
    // sitting above the fold never flashes its final value first.
    const run = () => {
      if (started.current) return;
      started.current = true;
      setDisplay(format(0));

      const began = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - began) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(format(Math.round(target * eased)));
        if (progress < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    };

    if (typeof IntersectionObserver === "undefined") {
      run();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
