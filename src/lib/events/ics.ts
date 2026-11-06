import type { SocietyEvent } from "./types";

/**
 * iCalendar output for a single event.
 *
 * Instants are written in UTC (Z) so calendar clients in any time zone show the
 * correct local time. Lines are folded at 74 characters as RFC 5545 requires.
 */

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function stamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function fold(line: string): string {
  if (line.length <= 74) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 74));
  rest = rest.slice(74);
  while (rest.length > 0) {
    parts.push(` ${rest.slice(0, 73)}`);
    rest = rest.slice(73);
  }
  return parts.join("\r\n");
}

export function buildIcs(event: SocietyEvent): string {
  // A published date with no time yet is exported as an all-day event rather
  // than inventing opening hours.
  const allDay = !event.startTime;
  const lastDate = event.endDate ?? event.startDate;
  const dayAfterEnd = new Date(`${lastDate}T12:00:00Z`);
  dayAfterEnd.setUTCDate(dayAfterEnd.getUTCDate() + 1);

  const start = event.startsAt
    ? new Date(event.startsAt)
    : new Date(`${event.startDate}T09:00:00+01:00`);
  const end = event.endsAt
    ? new Date(event.endsAt)
    : new Date(`${lastDate}T17:00:00+01:00`);

  const location = [event.venueName, event.venueAddress].filter(Boolean).join(", ");
  const url = `${(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.thecbncoop.com").replace(/\/$/, "")}/events/${event.slug}`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CBN Staff Multipurpose Cooperative Society//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@thecbncoop.com`,
    `DTSTAMP:${stamp(new Date())}`,
    allDay
      ? `DTSTART;VALUE=DATE:${event.startDate.replace(/-/g, "")}`
      : `DTSTART:${stamp(start)}`,
    allDay
      ? `DTEND;VALUE=DATE:${dayAfterEnd.toISOString().slice(0, 10).replace(/-/g, "")}`
      : `DTEND:${stamp(end)}`,
    fold(`SUMMARY:${escapeText(event.title)}`),
    fold(`DESCRIPTION:${escapeText(event.shortDescription)}`),
    fold(`LOCATION:${escapeText(location)}`),
    fold(`URL:${url}`),
    `STATUS:${event.organiserStatus === "cancelled" ? "CANCELLED" : "CONFIRMED"}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.join("\r\n")}\r\n`;
}
