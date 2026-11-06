import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { AnnouncementCard } from "@/components/events/AnnouncementCard";
import { EventsSubnav } from "@/components/events/EventsSubnav";
import { listAnnouncements } from "@/lib/cms/events";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Announcements",
  description:
    "Official notices, AGM announcements, project updates, policy changes and member information from the CBN Staff Multipurpose Cooperative Society Ltd.",
  alternates: { canonical: "/events/announcements" },
};

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const all = await listAnnouncements();
  const q = (params.q ?? "").trim();
  const category = params.category ?? "";

  const categories = Array.from(new Set(all.map((item) => item.category))).sort();
  const notices = all
    .filter(
      (item) =>
        (!q ||
          `${item.title} ${item.shortDescription} ${item.fullDescription}`
            .toLowerCase()
            .includes(q.toLowerCase())) &&
        (!category || item.category === category),
    )
    .sort((a, b) => {
      if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
      return 0;
    });

  return (
    <>
      <PageHero
        eyebrow="Notices"
        title="What the Society has announced."
        intro="Official notices, project updates, policy changes and deadlines, published here as they are issued to members."
        crumbs={[{ label: "Events & announcements", href: "/events" }, { label: "Announcements" }]}
      />

      <EventsSubnav active="announcements" />

      <section className="bg-white py-12 md:py-16">
        <div className="shell">
          <form
            method="get"
            action="/events/announcements"
            className="flex flex-wrap items-end gap-3 border-b border-line pb-6"
          >
            <div className="min-w-[14rem] flex-1">
              <label htmlFor="q" className="field-label">
                Search notices
              </label>
              <input id="q" name="q" defaultValue={q} className="field mt-1.5" placeholder="Keyword" />
            </div>
            <div className="w-56">
              <label htmlFor="category" className="field-label">
                Category
              </label>
              <select id="category" name="category" defaultValue={category} className="field mt-1.5">
                <option value="">All categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary h-11 px-5 text-[11px]">
              Filter
            </button>
            {q || category ? (
              <Link href="/events/announcements" className="pb-3 text-[11px] uppercase tracking-[0.1em] text-slate">
                Clear
              </Link>
            ) : null}
          </form>

          {notices.length ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {notices.map((announcement) => (
                <AnnouncementCard key={announcement.slug} announcement={announcement} />
              ))}
            </div>
          ) : (
            <p className="mt-8 border border-line bg-bone px-5 py-6 text-sm leading-relaxed text-slate">
              No announcements have been published yet. Notices appear here as soon as they are
              issued.
            </p>
          )}
        </div>
      </section>

      <CtaBand
        eyebrow="Member services"
        title="Notices that affect you reach members first."
        body="Announcements are circulated to members directly. For anything unclear, the Secretariat can confirm the position."
        primary={{ label: "Contact the Secretariat", href: "/contact" }}
        secondary={{ label: "News", href: "/news" }}
      />
    </>
  );
}
