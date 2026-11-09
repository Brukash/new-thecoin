import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { listAnnouncements, listEvents } from "@/lib/cms/events";
import { lifecycleOf } from "@/lib/events/format";

export const dynamic = "force-dynamic";

/**
 * Scheduled refresh for the events module.
 *
 * Event state (upcoming, ongoing, completed) and scheduled announcements are
 * derived from stored timestamps when a page renders, so nothing in the
 * database goes stale. This endpoint keeps the cached pages in step: call it
 * daily (or hourly) from the host's scheduler, for example:
 *
 *   curl -H "Authorization: Bearer $CRON_SECRET" \
 *     https://www.thecbncoop.com/api/cron/events
 *
 * It performs no writes and is safe to call repeatedly.
 */
/** Compares the bearer token without leaking length or content by timing. */
function authorised(header: string | null, secret: string): boolean {
  if (!header) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header);
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json(
      { ok: false, error: "CRON_SECRET is not configured on this deployment." },
      { status: 503 },
    );
  }

  if (!authorised(request.headers.get("authorization"), secret)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const [events, announcements] = await Promise.all([listEvents(), listAnnouncements()]);
  const counts = events.reduce<Record<string, number>>((totals, event) => {
    const state = lifecycleOf(event);
    totals[state] = (totals[state] ?? 0) + 1;
    return totals;
  }, {});

  for (const path of [
    "/",
    "/events",
    "/events/past",
    "/events/announcements",
    "/events/gallery",
  ]) {
    revalidatePath(path);
  }
  for (const event of events) revalidatePath(`/events/${event.slug}`);
  for (const announcement of announcements) {
    revalidatePath(`/events/announcements/${announcement.slug}`);
  }

  return Response.json({
    ok: true,
    refreshedAt: new Date().toISOString(),
    events: { total: events.length, ...counts },
    announcements: announcements.length,
  });
}
