import Link from "next/link";
import { requireStaff } from "@/lib/cms/auth";
import { listAnnouncements, listEvents } from "@/lib/cms/events";
import { lifecycleOf, formatEventDateShort } from "@/lib/events/format";
import { createEvent, deleteEventAction, featureEventAction, publishEventAction } from "./actions";
import { ConfirmSubmit } from "../ConfirmSubmit";
import { EditButton } from "../EditButton";

export const dynamic = "force-dynamic";

const notices: Record<string, string> = {
  deleted: "Event deleted.",
  title: "Enter a title for the event.",
};

const lifecycleLabels: Record<string, string> = {
  upcoming: "Upcoming",
  ongoing: "Live now",
  completed: "Completed",
  cancelled: "Cancelled",
  postponed: "Postponed",
};

export default async function EventsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}) {
  await requireStaff();
  const params = await searchParams;
  const [events, announcements] = await Promise.all([
    listEvents({ includeDrafts: true }),
    listAnnouncements({ includeDrafts: true }),
  ]);

  const upcoming = events.filter((event) => lifecycleOf(event) === "upcoming").length;
  const drafts = events.filter((event) => event.publicationStatus === "draft").length;
  const featured = events.filter((event) => event.featured).length;

  return (
    <div>
      <Link href="/admin" className="text-[11px] uppercase tracking-[0.12em] text-slate hover:text-navy">
        ← Back to console
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="font-serif text-2xl text-navy">Events &amp; announcements</h1>
          <p className="mt-1 text-xs text-slate">
            {events.length} events ({upcoming} upcoming, {drafts} drafts, {featured} featured) ·{" "}
            {announcements.length} announcements
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/events/categories" className="btn btn-outline h-9 px-3 text-[11px]">
            Categories
          </Link>
          <Link href="/admin/announcements" className="btn btn-outline h-9 px-3 text-[11px]">
            Announcements
          </Link>
          <Link href="/events" className="btn btn-outline h-9 px-3 text-[11px]">
            View events page
          </Link>
        </div>
      </div>

      {params.deleted ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">
          {notices.deleted}
        </p>
      ) : null}
      {params.error ? (
        <p className="mt-5 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          {notices[params.error] ?? "That could not be completed."}
        </p>
      ) : null}

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-3">
          <h2 className="font-serif text-xl text-navy">Events</h2>
          <Link href="/admin/events/new" className="btn btn-primary h-9 px-4 text-[11px]">
            Create event
          </Link>
        </div>

        <ul className="divide-y divide-line border-b border-line bg-white">
          {events.map((event) => {
            const state = lifecycleOf(event);
            return (
              <li key={event.slug} className="px-4 py-4">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/events/${event.slug}`}
                        className="text-sm font-medium text-navy hover:text-gold-600"
                      >
                        {event.title}
                      </Link>
                      <span className="border border-line px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] text-slate">
                        {event.publicationStatus}
                      </span>
                      <span className="border border-line px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] text-slate">
                        {lifecycleLabels[state]}
                      </span>
                      {event.featured ? (
                        <span className="bg-gold-50 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] text-gold-600">
                          Homepage
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[11px] text-slate">
                      {formatEventDateShort(event)} · {event.categoryName}
                      {event.venueName ? ` · ${event.venueName}` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <form action={featureEventAction}>
                      <input type="hidden" name="slug" value={event.slug} />
                      <input type="hidden" name="featured" value={event.featured ? "false" : "true"} />
                      <button type="submit" className="btn btn-outline h-7 px-2 text-[10px] uppercase">
                        {event.featured ? "Unfeature" : "Feature"}
                      </button>
                    </form>
                    <form action={publishEventAction}>
                      <input type="hidden" name="slug" value={event.slug} />
                      <input
                        type="hidden"
                        name="status"
                        value={event.publicationStatus === "published" ? "archived" : "published"}
                      />
                      <button type="submit" className="btn btn-outline h-7 px-2 text-[10px] uppercase">
                        {event.publicationStatus === "published" ? "Unpublish" : "Publish"}
                      </button>
                    </form>
                    <EditButton href={`/admin/events/${event.slug}`} />
                    <Link
                      href={`/events/${event.slug}`}
                      className="btn btn-outline h-7 px-2 text-[10px] uppercase"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Preview
                    </Link>
                    <form action={deleteEventAction}>
                      <input type="hidden" name="slug" value={event.slug} />
                      <ConfirmSubmit>Delete</ConfirmSubmit>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
          {events.length === 0 ? (
            <li className="px-4 py-6 text-sm text-slate">
              No events yet. Create one to begin; it stays private as a draft until published.
            </li>
          ) : null}
        </ul>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-3">
          <h2 className="font-serif text-xl text-navy">Announcements</h2>
          <Link href="/admin/announcements" className="btn btn-outline h-9 px-3 text-[11px]">
            Manage announcements
          </Link>
        </div>
        <ul className="divide-y divide-line border-b border-line bg-white">
          {announcements.slice(0, 5).map((item) => (
            <li key={item.slug} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1 truncate text-sm text-navy">{item.title}</span>
              <span className="text-[10px] uppercase tracking-[0.1em] text-slate">
                {item.publicationStatus}
              </span>
              {item.urgent ? (
                <span className="bg-gold-50 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] text-gold-600">
                  Urgent
                </span>
              ) : null}
              <EditButton href={`/admin/announcements/${item.slug}`} />
            </li>
          ))}
          {announcements.length === 0 ? (
            <li className="px-4 py-6 text-sm text-slate">No announcements yet.</li>
          ) : null}
        </ul>
      </section>

      <p className="mt-8 text-xs leading-relaxed text-slate">
        Publishing is immediate. Scheduled events publish automatically at the time set in the
        editor. Past events stay online in the archive with their page, photographs and downloads
        intact.
      </p>
    </div>
  );
}
