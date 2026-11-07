import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import type { SocietyEvent } from "@/lib/events/types";
import { formatEventDate, formatEventTime } from "@/lib/events/format";
import { EventCountdown } from "./EventCountdown";

/**
 * Homepage promotion for the featured event.
 *
 * The page chooses which event is eligible (published, featured, inside its
 * promotion window); this component only presents it.
 */
export function HomepageEvent({ event }: { event: SocietyEvent }) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      {event.bannerUrl ? (
        <div className="absolute inset-0" aria-hidden>
          <Image
            src={event.bannerUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/50" />
        </div>
      ) : (
        <div className="hairline-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden />
      )}

      <div
        className={`shell relative grid gap-10 py-14 md:py-20 ${
          event.startsAt ? "lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-16" : ""
        }`}
      >
        <div>
          <p className="eyebrow eyebrow-invert">Featured event</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="border border-gold/40 bg-gold/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-200">
              {event.categoryName}
            </span>
            {event.edition ? (
              <span className="border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white/70">
                {event.edition}
              </span>
            ) : null}
          </div>

          <h2 className="display mt-5 max-w-xl text-[2rem] leading-[1.08] text-white md:text-[2.9rem]">
            {event.title}
          </h2>

          {event.shortDescription ? (
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/70 md:text-base">
              {event.shortDescription}
            </p>
          ) : null}

          <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-gold" aria-hidden />
              <dt className="sr-only">Date</dt>
              <dd>{formatEventDate(event)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-gold" aria-hidden />
              <dt className="sr-only">Time</dt>
              <dd>{formatEventTime(event)}</dd>
            </div>
            {event.venueName ? (
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-gold" aria-hidden />
                <dt className="sr-only">Venue</dt>
                <dd>{event.venueName}</dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={`/events/${event.slug}`} className="btn btn-primary">
              View event details
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href="/events" className="btn btn-outline-invert">
              All events
            </Link>
          </div>
        </div>

        {event.startsAt ? (
          <div className="border border-white/15 bg-ink/60 p-6 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gold-200">Begins in</p>
            <div className="mt-4">
              <EventCountdown startsAt={event.startsAt} endsAt={event.endsAt} variant="invert" />
            </div>
            <p className="mt-4 text-[12px] leading-relaxed text-white/50">
              West Africa Time (WAT). Registration details are on the event page.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
