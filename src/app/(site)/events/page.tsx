import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { EventCard } from "@/components/events/EventCard";
import { FeaturedEvent } from "@/components/events/FeaturedEvent";
import { EventsSubnav } from "@/components/events/EventsSubnav";
import { AnnouncementCard } from "@/components/events/AnnouncementCard";
import { listAnnouncements, listCategories, listEvents } from "@/lib/cms/events";
import { featuredEventOf, lifecycleOf } from "@/lib/events/format";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Events & announcements",
  description:
    "Upcoming cooperative events, the annual sales and exhibition, AGMs, investment seminars and official notices from the CBN Staff Multipurpose Cooperative Society Ltd.",
  alternates: { canonical: "/events" },
};

function matches(event: { title: string; shortDescription: string; venueName: string }, query: string) {
  if (!query) return true;
  const haystack = `${event.title} ${event.shortDescription} ${event.venueName}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const [events, categories, announcements] = await Promise.all([
    listEvents(),
    listCategories(),
    listAnnouncements({ limit: 3 }),
  ]);

  const q = (params.q ?? "").trim();
  const category = params.category ?? "";

  const scheduled = events.filter((event) => {
    const state = lifecycleOf(event);
    return state === "upcoming" || state === "ongoing";
  });

  const listed = scheduled.filter(
    (event) =>
      matches(event, q) &&
      (!category || event.categorySlug === category) &&
      event.organiserStatus === "scheduled",
  );

  // The featured panel is the next event still to run, chosen at render time so
  // it moves on by itself when a date passes. Filters leave the plain list alone.
  const filtered = Boolean(q || category);
  const featuredEvent = filtered ? null : featuredEventOf(scheduled);
  const grid = filtered
    ? listed
    : listed.filter((event) => event.slug !== featuredEvent?.slug);

  const changes = scheduled.filter((event) => event.organiserStatus !== "scheduled");

  return (
    <>
      <PageHero
        eyebrow="Events & announcements"
        title="What's happening at the Society."
        intro="Sales and exhibitions, annual general meetings, investment seminars and members' meetings — with the notices that affect them."
        crumbs={[{ label: "Events & announcements" }]}
      />

      <EventsSubnav active="upcoming" />

      <section className="bg-white py-12 md:py-16">
        <div className="shell">
          <form method="get" action="/events" className="flex flex-wrap items-end gap-3 border-b border-line pb-6">
            <div className="min-w-[14rem] flex-1">
              <label htmlFor="q" className="field-label">
                Search events
              </label>
              <input
                id="q"
                name="q"
                defaultValue={q}
                placeholder="Title, venue or keyword"
                className="field mt-1.5"
              />
            </div>
            <div className="w-56">
              <label htmlFor="category" className="field-label">
                Category
              </label>
              <select id="category" name="category" defaultValue={category} className="field mt-1.5">
                <option value="">All categories</option>
                {categories.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary h-11 px-5 text-[12px]">
              Filter
            </button>
            {q || category ? (
              <Link href="/events" className="pb-3 text-[12px] uppercase tracking-[0.1em] text-slate">
                Clear
              </Link>
            ) : null}
          </form>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Diary</p>
              <h2 className="display mt-4 text-[1.9rem] leading-tight text-navy md:text-[2.4rem]">
                Upcoming events.
              </h2>
            </div>
            <Link href="/events/past" className="link-underline shrink-0">
              Past events <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          {featuredEvent ? <FeaturedEvent event={featuredEvent} /> : null}

          {grid.length ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {grid.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          ) : featuredEvent ? null : (
            <p className="mt-8 border border-line bg-bone px-5 py-6 text-sm leading-relaxed text-slate">
              {q || category
                ? "No upcoming events match that search. Clear the filters to see the full diary."
                : "There are no upcoming events on the calendar at present. New dates are published here as soon as they are confirmed."}
            </p>
          )}

          {changes.length ? (
            <div className="mt-12 border border-line bg-bone p-6">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                Changes to scheduled events
              </h3>
              <ul className="mt-4 space-y-3">
                {changes.map((event) => (
                  <li key={event.slug} className="text-sm leading-relaxed text-slate">
                    <Link href={`/events/${event.slug}`} className="font-medium text-navy hover:text-gold-600">
                      {event.title}
                    </Link>{" "}
                    has been {event.organiserStatus === "cancelled" ? "cancelled" : "postponed"}.{" "}
                    <Link href={`/events/${event.slug}`} className="underline">
                      Read the notice
                    </Link>
                    .
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      {announcements.length ? (
        <section className="border-t border-line bg-bone py-14 md:py-20">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Notices</p>
                <h2 className="display mt-4 text-[1.9rem] leading-tight text-navy md:text-[2.4rem]">
                  Important announcements.
                </h2>
              </div>
              <Link href="/events/announcements" className="link-underline shrink-0">
                All announcements <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {announcements.map((announcement) => (
                <AnnouncementCard key={announcement.slug} announcement={announcement} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand
        eyebrow="Take part"
        title="Come to the next Society event."
        body="Attendance, exhibition space and registration requirements are confirmed by the Secretariat for each event. Ask before you travel."
        primary={{ label: "Contact the Secretariat", href: "/contact" }}
        secondary={{ label: "About the Society", href: "/about" }}
      />
    </>
  );
}
