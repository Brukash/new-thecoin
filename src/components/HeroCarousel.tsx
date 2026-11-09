"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { HeroPhoto } from "@/content/hero-photos";

/**
 * Home hero photography.
 *
 * Cross-fades between the Society's own photographs. It pauses while the
 * pointer or keyboard focus is inside it, and does not advance at all when the
 * visitor asks for reduced motion — in that case the selector still works.
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
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (photos.length < 2 || paused || reducedMotion) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % photos.length),
      intervalMs,
    );
    return () => window.clearInterval(timer);
  }, [photos.length, paused, reducedMotion, intervalMs]);

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
    >
      {photos.map((photo, position) => {
        const active = position === index;
        return (
          <div
            key={photo.src}
            aria-hidden={!active}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${
              active ? "opacity-100" : "opacity-0"
            }`}
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

      {photos.length > 1 ? (
        <div className="pointer-events-auto absolute right-4 top-4 flex gap-2">
          {photos.map((photo, position) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => setIndex(position)}
              aria-label={`Show photograph ${position + 1} of ${photos.length}`}
              aria-current={position === index}
              className={`h-1.5 w-7 transition-colors duration-300 ${
                position === index ? "bg-gold" : "bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
