import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import type { SocietyEvent } from "@/lib/events/types";
import { formatEventDate, formatEventTime, lifecycleOf } from "@/lib/events/format";
import { EventCountdown } from "./EventCountdown";

/**
 * The highlighted event at the top of the events hub.
 *
 * The page chooses which event that is (the next one still to run); this
 * component only presents it, so no date is ever hard-coded here.
 */
export function FeaturedEvent({ event }: { event: SocietyEvent }) {
  const state = lifecycleOf(event);

  return (
    <article className="mt-8 grid overflow-hidden border border-line bg-white lg:grid-cols-[1.05fr_1fr]">
      <div className="relative aspect-[16/10] bg-navy lg:aspect-auto lg:min-h-[21rem]">
        {event.bannerUrl ? (
          <Image
            src={event.bannerUrl}
            alt={`${event.title} banner`}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="hairline-grid absolute inset-0 opacity-40" aria-hidden>
            <div className="absolute inset-0 bg-gradient-to-br from-navy via-ink to-navy-700" />
          </div>
        )}
        <span className="absolute left-4 top-4 whitespace-nowrap bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-navy">
          {state === "ongoing" ? "Happening now" : "Next up"}
        </span>
      </div>

      <div className="flex flex-col p-6 md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">
          {event.categoryName}
        </p>
        <h3 className="mt-3 font-serif text-2xl leading-snug text-navy md:text-[1.8rem]">
          {event.title}
        </h3>
        {event.shortDescription ? (
          <p className="mt-3 text-sm leading-relaxed text-slate">{event.shortDescription}</p>
        ) : null}

        <dl className="mt-5 space-y-2 text-sm text-slate">
          <div className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
            <div>
              <dt className="sr-only">Date</dt>
              <dd>{formatEventDate(event)}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
            <div>
              <dt className="sr-only">Time</dt>
              <dd>{formatEventTime(event)}</dd>
            </div>
          </div>
          {event.venueName ? (
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
              <div>
                <dt className="sr-only">Venue</dt>
                <dd>{event.venueName}</dd>
              </div>
            </div>
          ) : null}
        </dl>

        {event.startsAt ? (
          <div className="mt-5 border-t border-line pt-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate">Begins in</p>
            <div className="mt-3">
              <EventCountdown startsAt={event.startsAt} endsAt={event.endsAt} />
            </div>
          </div>
        ) : null}

        <div className="mt-auto pt-6">
          <Link href={`/events/${event.slug}`} className="btn btn-primary">
            {state === "completed" ? "View the event archive" : "Event details"}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
