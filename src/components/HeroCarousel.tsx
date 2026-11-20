"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import type { HeroPhoto } from "@/content/hero-photos";
import { HeroParallax } from "@/components/motion/HeroParallax";

/**
 * Home hero photography.
 *
 * Cross-fades between the Society's own photographs with a slight settling
 * scale, so a change reads as a dissolve and never as a cut. The active
 * indicator fills over the length of the interval, which makes the next move
 * legible before it happens. It pauses while the pointer or keyboard focus is
 * inside it, stops for the visit once a visitor picks a photograph themselves,
 * and does not advance at all under reduced motion — in that case the selector
 * still works.
 */
export function HeroCarousel({
  photos,
  intervalMs = 7000,
}: {
  photos: HeroPhoto[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [taken, setTaken] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const running = !paused && !taken && !reducedMotion;

  useEffect(() => {
    if (photos.length < 2 || !running) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % photos.length),
      intervalMs,
    );
    return () => window.clearInterval(timer);
  }, [photos.length, running, intervalMs]);

  if (photos.length === 0) return null;

  return (
    <div
      className="absolute inset-0"
      role="group"
      aria-roledescription="carousel"
      aria-label="Photographs of the Society"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Only the photographs drift on scroll. The selector below stays
          anchored to the frame, so it cannot ride out of the clipped area. */}
      <HeroParallax>
        {photos.map((photo, position) => {
          const active = position === index;
          return (
            <div
              key={photo.src}
              aria-hidden={!active}
              className={`hero-frame absolute inset-0 ${active ? "is-active" : ""}`}
            >
              <Image
                src={photo.src}
                alt={active ? photo.alt : ""}
                fill
                priority={position === 0}
                loading={position === 0 ? "eager" : "lazy"}
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover object-center"
              />
            </div>
          );
        })}
      </HeroParallax>

      {/* The selector sits over photographs of very different brightness, so it
          carries a soft scrim rather than relying on white-on-white contrast. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/65 via-ink/20 to-transparent"
        aria-hidden
      />

      {photos.length > 1 ? (
        <div
          className="pointer-events-auto absolute right-4 top-4 flex gap-2"
          style={{ "--hero-dot-duration": `${intervalMs}ms` } as CSSProperties}
        >
          {photos.map((photo, position) => {
            const active = position === index;
            return (
              <button
                key={photo.src}
                type="button"
                onClick={() => {
                  setIndex(position);
                  setTaken(true);
                }}
                aria-label={`Show photograph ${position + 1} of ${photos.length}`}
                aria-current={active}
                data-running={active && running}
                data-paused={active && paused && !taken}
                className="hero-dot group flex h-7 w-7 items-center justify-center"
              >
                {/* The bar stays the size it should look; the button around it
                    is 28px square so it can be hit with a thumb. */}
                <span
                  className={`relative block h-1.5 w-7 overflow-hidden transition-colors duration-300 ${
                    active ? "bg-white/30" : "bg-white/60 group-hover:bg-white/85"
                  }`}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
