import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { EventsSubnav } from "@/components/events/EventsSubnav";
import { listEvents } from "@/lib/cms/events";
import { formatEventDateShort } from "@/lib/events/format";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Event gallery",
  description:
    "Photographs from cooperative events, sales and exhibitions held by the CBN Staff Multipurpose Cooperative Society Ltd.",
  alternates: { canonical: "/events/gallery" },
};

export default async function EventGalleryPage() {
  const events = await listEvents();
  const withImages = events.filter((event) => event.gallery.length > 0);

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Photographs from Society events."
        intro="Images published by the Society from its meetings, exhibitions and conferences."
        crumbs={[{ label: "Events & announcements", href: "/events" }, { label: "Gallery" }]}
      />

      <EventsSubnav active="gallery" />

      <section className="bg-white py-12 md:py-16">
        <div className="shell">
          {withImages.length ? (
            withImages.map((event) => (
              <div key={event.slug} className="mb-14 last:mb-0">
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
                  <div>
                    <h2 className="font-serif text-2xl text-navy">
                      <Link href={`/events/${event.slug}`} className="hover:text-gold-600">
                        {event.title}
                      </Link>
                    </h2>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate">
                      {formatEventDateShort(event)} · {event.gallery.length} photograph
                      {event.gallery.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Link href={`/events/${event.slug}`} className="link-underline">
                    Event page
                  </Link>
                </div>

                <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {event.gallery.map((image) => (
                    <li key={image.id} className="group relative aspect-[4/3] overflow-hidden bg-bone">
                      <Image
                        src={image.imageUrl}
                        alt={image.caption || `${event.title} photograph`}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      {image.caption ? (
                        <span className="absolute inset-x-0 bottom-0 bg-ink/75 px-3 py-2 text-[10px] leading-snug text-white/85">
                          {image.caption}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className="border border-line bg-bone px-5 py-6 text-sm leading-relaxed text-slate">
              No event photographs have been published yet. Images appear here once the Society
              releases them for an event.
            </p>
          )}
        </div>
      </section>

      <CtaBand
        eyebrow="Events"
        title="See what is coming up."
        body="The diary carries the next exhibition, AGM, seminar or members' meeting, with registration details where they apply."
        primary={{ label: "Upcoming events", href: "/events" }}
        secondary={{ label: "Past events", href: "/events/past" }}
      />
    </>
  );
}
