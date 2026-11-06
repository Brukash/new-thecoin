import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import type { SocietyEvent } from "@/lib/events/types";
import { formatEventDate, formatEventDateShort, lifecycleOf } from "@/lib/events/format";

const labels: Record<string, string> = {
  upcoming: "Upcoming",
  ongoing: "Live now",
  completed: "Past event",
  cancelled: "Cancelled",
  postponed: "Postponed",
};

export function EventStatusBadge({ event }: { event: SocietyEvent }) {
  const state = lifecycleOf(event);
  const tone =
    state === "cancelled" || state === "postponed"
      ? "bg-red-50 text-red-700 border-red-200"
      : state === "ongoing"
        ? "bg-gold text-ink border-gold"
        : "bg-white/95 text-navy border-line";

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${tone}`}
    >
      {state === "ongoing" ? <span className="size-1.5 rounded-full bg-ink" aria-hidden /> : null}
      {labels[state]}
    </span>
  );
}

/**
 * Event card used on the hub, archive and related sections.
 * The date badge is printed from the stored dates; nothing is invented.
 */
export function EventCard({ event, compact = false }: { event: SocietyEvent; compact?: boolean }) {
  const state = lifecycleOf(event);

  return (
    <Link
      href={`/events/${event.slug}`}
      className="card card-hover group flex h-full flex-col overflow-hidden"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-navy">
        {event.bannerUrl ? (
          <Image
            src={event.bannerUrl}
            alt={`${event.title} banner`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="hairline-grid absolute inset-0 opacity-40" aria-hidden>
            <div className="absolute inset-0 bg-gradient-to-br from-navy via-ink to-navy-700" />
          </div>
        )}
        <div className="absolute left-4 top-4">
          <EventStatusBadge event={event} />
        </div>
        {event.edition ? (
          <span className="absolute bottom-4 left-4 bg-ink/75 px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-gold-200">
            {event.edition}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-600">
          {event.categoryName}
        </p>
        <h3 className="mt-3 font-serif text-xl leading-snug text-navy">{event.title}</h3>
        {event.shortDescription && !compact ? (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate">
            {event.shortDescription}
          </p>
        ) : null}

        <dl className="mt-5 space-y-2 text-xs text-slate">
          <div className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 size-3.5 shrink-0 text-gold-600" aria-hidden />
            <div>
              <dt className="sr-only">Date</dt>
              <dd>{formatEventDate(event)}</dd>
              <dd className="text-[10px] text-slate/80 sm:hidden">{formatEventDateShort(event)}</dd>
            </div>
          </div>
          {event.venueName ? (
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-gold-600" aria-hidden />
              <div>
                <dt className="sr-only">Venue</dt>
                <dd>{event.venueName}</dd>
              </div>
            </div>
          ) : null}
        </dl>

        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-navy">
          {state === "completed" ? "View the event archive" : "Event details"}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
