import type { Announcement, EventLifecycle, SocietyEvent } from "./types";

/**
 * Date, status and link helpers.
 *
 * Events are scheduled in Nigerian local time. Africa/Lagos has used a fixed
 * UTC+01:00 offset since 1919 with no daylight saving, so the offset is applied
 * explicitly rather than relying on the server's own time zone. Storage keeps
 * both the local date/time the organiser typed and the resulting instant, so
 * sorting and countdowns never depend on the reader's clock.
 */

export const EVENT_TIMEZONE = "Africa/Lagos";
const LAGOS_OFFSET = "+01:00";

export const EVENT_TIMEZONES = [
  { value: "Africa/Lagos", label: "West Africa Time (Lagos, UTC+01:00)" },
  { value: "UTC", label: "UTC" },
] as const;

function clock(value: string | null, fallback: string): string {
  if (value && /^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return fallback;
}

/** Combine a local date, a local time and the zone into an instant. */
export function eventInstant(date: string, time: string | null, fallbackTime: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const offset = LAGOS_OFFSET;
  const instant = new Date(`${date}T${clock(time, fallbackTime)}:00${offset}`);
  return Number.isNaN(instant.getTime()) ? null : instant;
}

export function lifecycleOf(
  event: Pick<
    SocietyEvent,
    "organiserStatus" | "startsAt" | "endsAt" | "startDate" | "endDate" | "startTime"
  >,
  now: Date = new Date(),
): EventLifecycle {
  if (event.organiserStatus === "cancelled") return "cancelled";
  if (event.organiserStatus === "postponed") return "postponed";

  const start =
    (event.startsAt ? new Date(event.startsAt) : null) ??
    eventInstant(event.startDate, event.startTime, "00:00");
  if (!start) return "upcoming";

  const end =
    (event.endsAt ? new Date(event.endsAt) : null) ??
    eventInstant(event.endDate ?? event.startDate, "23:59", "23:59") ??
    start;

  if (now < start) return "upcoming";
  if (now <= end) return "ongoing";
  return "completed";
}

/**
 * Chooses the event that holds the featured slot, without anyone maintaining it.
 *
 * The soonest event that is still upcoming or running wins, so the slot rolls on
 * by itself the moment an event finishes. Nothing is pinned by hand: the stored
 * featured flag does not decide the slot, and a promotion window, when set,
 * simply holds an event back until the Secretariat is ready to announce it.
 */
export function featuredEventOf(
  events: SocietyEvent[],
  now: Date = new Date(),
): SocietyEvent | null {
  const startOf = (event: SocietyEvent) =>
    event.startsAt
      ? new Date(event.startsAt).getTime()
      : new Date(`${event.startDate}T00:00:00+01:00`).getTime();

  const eligible = events.filter((event) => {
    if (event.organiserStatus !== "scheduled") return false;
    const state = lifecycleOf(event, now);
    if (state !== "upcoming" && state !== "ongoing") return false;
    if (event.promotionStart && new Date(event.promotionStart).getTime() > now.getTime()) return false;
    if (event.promotionEnd && new Date(event.promotionEnd).getTime() < now.getTime()) return false;
    return true;
  });

  if (!eligible.length) return null;

  return [...eligible].sort((a, b) => startOf(a) - startOf(b) || a.displayOrder - b.displayOrder)[0];
}

export function isPubliclyVisible(event: SocietyEvent, now: Date = new Date()): boolean {
  if (event.publicationStatus === "published") return true;
  if (event.publicationStatus === "scheduled" && event.publishedAt) {
    return new Date(event.publishedAt) <= now;
  }
  return false;
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: EVENT_TIMEZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortDateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: EVENT_TIMEZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: EVENT_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatEventDate(event: Pick<SocietyEvent, "startDate" | "endDate">): string {
  const start = new Date(`${event.startDate}T12:00:00Z`);
  const end = event.endDate ? new Date(`${event.endDate}T12:00:00Z`) : null;
  if (!end || event.endDate === event.startDate) return dateFormat.format(start);
  return `${dateFormat.format(start)} — ${dateFormat.format(end)}`;
}

export function formatEventDateShort(event: Pick<SocietyEvent, "startDate" | "endDate">): string {
  const start = new Date(`${event.startDate}T12:00:00Z`);
  const end = event.endDate ? new Date(`${event.endDate}T12:00:00Z`) : null;
  if (!end || event.endDate === event.startDate) return shortDateFormat.format(start);
  return `${shortDateFormat.format(start)} — ${shortDateFormat.format(end)}`;
}

/**
 * Never invents opening hours: without a published start time it says so.
 *
 * A stored instant is only a date anchor for ordering and the countdown, so it
 * is not presented as an opening hour.
 */
export function formatEventTime(
  event: Pick<
    SocietyEvent,
    "startTime" | "endTime" | "startsAt" | "endsAt" | "startDate" | "endDate"
  >,
): string {
  if (!event.startTime) return "Time to be announced";

  const start = event.startsAt
    ? new Date(event.startsAt)
    : eventInstant(event.startDate, event.startTime, "09:00");
  if (!start) return "Time to be announced";

  if (!event.endTime) return `${timeFormat.format(start)} (WAT)`;

  const end = event.endsAt
    ? new Date(event.endsAt)
    : eventInstant(event.endDate ?? event.startDate, event.endTime, event.startTime);
  return `${timeFormat.format(start)} — ${timeFormat.format(end ?? start)} (WAT)`;
}

export function formatAnnouncementDate(value: string | null): string {
  if (!value) return "";
  return shortDateFormat.format(new Date(value));
}

export function formatPublishedDay(value: string | null): string {
  return value ? formatAnnouncementDate(value) : "Unpublished";
}

/** Registration is open only before the deadline and before the event ends. */
export function registrationState(
  event: Pick<
    SocietyEvent,
    "registrationRequired" | "registrationUrl" | "registrationDeadline" | "startsAt" | "endsAt" | "organiserStatus" | "publicationStatus"
  >,
  now: Date = new Date(),
): "external" | "internal" | "closed" | "not-required" {
  if (!event.registrationRequired) return "not-required";
  if (event.organiserStatus !== "scheduled") return "closed";
  if (event.registrationDeadline && new Date(`${event.registrationDeadline}T23:59:59+01:00`) < now) {
    return "closed";
  }
  if (event.endsAt && new Date(event.endsAt) < now) return "closed";
  return event.registrationUrl ? "external" : "internal";
}

export function googleCalendarUrl(event: SocietyEvent): string {
  const format = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const compact = (value: string) => value.replace(/-/g, "");

  const startDate = event.startDate;
  const lastDate = event.endDate ?? event.startDate;
  const dayAfterEnd = new Date(`${lastDate}T12:00:00Z`);
  dayAfterEnd.setUTCDate(dayAfterEnd.getUTCDate() + 1);

  // Without a published start time the entry is offered as an all-day event,
  // never as a made-up hour.
  const allDay = !event.startTime;

  const start = event.startsAt ? new Date(event.startsAt) : eventInstant(startDate, event.startTime, "09:00");
  const end = event.endsAt ? new Date(event.endsAt) : eventInstant(lastDate, event.endTime, "17:00");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: allDay
      ? `${compact(startDate)}/${dayAfterEnd.toISOString().slice(0, 10).replace(/-/g, "")}`
      : `${format(start ?? new Date())}/${format(end ?? new Date())}`,
    details: `${event.shortDescription}\n\n${event.seoDescription || ""}\n\nEvent page: ${eventPageUrl(event)}`,
    location: [event.venueName, event.venueAddress].filter(Boolean).join(", "),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function siteBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.thecbncoop.com";
}

export function eventPageUrl(event: Pick<SocietyEvent, "slug">): string {
  return `${siteBaseUrl()}/events/${event.slug}`;
}

export function announcementPageUrl(announcement: Pick<Announcement, "slug">): string {
  return `${siteBaseUrl()}/events/announcements/${announcement.slug}`;
}

export function shareLinks(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  return {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
  };
}
