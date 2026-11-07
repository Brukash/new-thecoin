import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { EventCard } from "@/components/events/EventCard";
import { EventsSubnav } from "@/components/events/EventsSubnav";
import { listCategories, listEvents } from "@/lib/cms/events";
import { lifecycleOf } from "@/lib/events/format";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Past events",
  description:
    "The archive of cooperative events held by the CBN Staff Multipurpose Cooperative Society Ltd, including past sales and exhibitions, AGMs and seminars.",
  alternates: { canonical: "/events/past" },
};

export default async function PastEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const [events, categories] = await Promise.all([listEvents(), listCategories()]);
  const q = (params.q ?? "").trim();
  const category = params.category ?? "";

  const past = events
    .filter((event) => lifecycleOf(event) === "completed")
    .filter(
      (event) =>
        (!q ||
          `${event.title} ${event.shortDescription} ${event.venueName}`
            .toLowerCase()
            .includes(q.toLowerCase())) &&
        (!category || event.categorySlug === category),
    )
    .sort((a, b) => (a.startDate < b.startDate ? 1 : -1));

  return (
    <>
      <PageHero
        eyebrow="Archive"
        title="Events the Society has held."
        intro="Past events remain online with their photographs, brochures and programme details — the record does not disappear when the date passes."
        crumbs={[{ label: "Events & announcements", href: "/events" }, { label: "Past events" }]}
      />

      <EventsSubnav active="past" />

      <section className="bg-white py-12 md:py-16">
        <div className="shell">
          <form method="get" action="/events/past" className="flex flex-wrap items-end gap-3 border-b border-line pb-6">
            <div className="min-w-[14rem] flex-1">
              <label htmlFor="q" className="field-label">
                Search the archive
              </label>
              <input id="q" name="q" defaultValue={q} className="field mt-1.5" placeholder="Title or venue" />
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
              <Link href="/events/past" className="pb-3 text-[12px] uppercase tracking-[0.1em] text-slate">
                Clear
              </Link>
            ) : null}
          </form>

          {past.length ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {past.map((event) => (
                <EventCard key={event.slug} event={event} compact />
              ))}
            </div>
          ) : (
            <p className="mt-8 border border-line bg-bone px-5 py-6 text-sm leading-relaxed text-slate">
              {q || category
                ? "No past events match that search."
                : "The archive is empty for now. Events move here automatically once they finish."}
            </p>
          )}
        </div>
      </section>

      <CtaBand
        eyebrow="Records"
        title="Looking for something from a past event?"
        body="Programme documents and brochures are kept on each event page. For anything not published, ask the Secretariat."
        primary={{ label: "Contact the Secretariat", href: "/contact" }}
        secondary={{ label: "Upcoming events", href: "/events" }}
      />
    </>
  );
}
