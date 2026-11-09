import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Clock,
  Download,
  ExternalLink,
  MapPin,
  Users,
} from "lucide-react";
import { jsonLdScript } from "@/lib/seo/json-ld";
import { CtaBand } from "@/components/CtaBand";
import { EventCard } from "@/components/events/EventCard";
import { EventCountdown } from "@/components/events/EventCountdown";
import { EventShare } from "@/components/events/EventShare";
import { EventRegistrationForm } from "@/components/events/EventRegistrationForm";
import { EventEnquiryForm } from "@/components/events/EventEnquiryForm";
import { getEvent, listEvents } from "@/lib/cms/events";
import {
  eventPageUrl,
  formatEventDate,
  formatEventTime,
  googleCalendarUrl,
  lifecycleOf,
  registrationState,
} from "@/lib/events/format";
import { site } from "@/content/site";
import { shareImages } from "@/lib/seo/metadata";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: "Event not found" };

  const description =
    event.seoDescription || event.shortDescription || `${event.title} — ${formatEventDate(event)}.`;

  return {
    title: event.seoTitle || event.title,
    description,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      type: "website",
      title: event.seoTitle || event.title,
      description,
      url: eventPageUrl(event),
      images: shareImages(event.bannerUrl),
    },
    twitter: {
      card: "summary_large_image",
      title: event.seoTitle || event.title,
      description,
      images: shareImages(event.bannerUrl),
    },
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const others = (await listEvents()).filter((item) => item.slug !== event.slug).slice(0, 3);
  const state = lifecycleOf(event);
  const registration = registrationState(event);
  const intro = event.fullDescription
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.thecbncoop.com").replace(/\/$/, "");

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.shortDescription || event.seoDescription,
    startDate: event.startsAt,
    endDate: event.endsAt,
    eventStatus:
      event.organiserStatus === "cancelled"
        ? "https://schema.org/EventCancelled"
        : event.organiserStatus === "postponed"
          ? "https://schema.org/EventPostponed"
          : "https://schema.org/EventScheduled",
    eventAttendanceMode: event.onlineEventUrl
      ? "https://schema.org/MixedEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    url: `${base}/events/${event.slug}`,
    image: event.bannerUrl ? [event.bannerUrl] : undefined,
    location: event.venueName
      ? {
          "@type": "Place",
          name: event.venueName,
          address: event.venueAddress || undefined,
        }
      : undefined,
    organizer: {
      "@type": "Organization",
      name: site.legalName,
      url: base,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Events", item: `${base}/events` },
      { "@type": "ListItem", position: 3, name: event.title, item: `${base}/events/${event.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Structured data is generated from stored fields only.
        dangerouslySetInnerHTML={{ __html: jsonLdScript([eventSchema, breadcrumbSchema]) }}
      />

      {/* ------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        {event.bannerUrl ? (
          <div className="absolute inset-0">
            <Image
              src={event.bannerUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
          </div>
        ) : (
          <div className="hairline-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden />
        )}

        <div className="shell relative py-12 md:py-20">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-[12px] uppercase tracking-[0.14em] text-white/50">
              <li>
                <Link href="/" className="hover:text-gold-200">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/events" className="hover:text-gold-200">
                  Events
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-gold-200">{event.categoryName}</li>
            </ol>
          </nav>

          <div
            className={`grid gap-10 ${
              state === "upcoming" && event.startsAt ? "lg:grid-cols-[1.35fr_1fr] lg:items-end" : ""
            }`}
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-gold/40 bg-gold/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-200">
                  {event.categoryName}
                </span>
                {event.edition ? (
                  <span className="border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white/70">
                    {event.edition}
                  </span>
                ) : null}
                {state === "ongoing" ? (
                  <span className="bg-gold px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink">
                    Live now
                  </span>
                ) : null}
              </div>

              <h1 className="display mt-5 max-w-2xl text-[2.25rem] leading-[1.08] text-white md:text-[3.25rem]">
                {event.title}
              </h1>

              {event.shortDescription ? (
                <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
                  {event.shortDescription}
                </p>
              ) : null}

              <dl className="mt-8 grid gap-3 text-sm text-white/75 sm:grid-cols-2">
                <div className="flex items-start gap-2.5">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                  <div>
                    <dt className="sr-only">Date</dt>
                    <dd>{formatEventDate(event)}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                  <div>
                    <dt className="sr-only">Time</dt>
                    <dd>{formatEventTime(event)}</dd>
                  </div>
                </div>
                {event.venueName ? (
                  <div className="flex items-start gap-2.5 sm:col-span-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                    <div>
                      <dt className="sr-only">Venue</dt>
                      <dd>
                        {event.venueName}
                        {event.venueAddress ? `, ${event.venueAddress}` : ""}
                      </dd>
                    </div>
                  </div>
                ) : null}
              </dl>

              <div className="mt-8 flex flex-wrap gap-3">
                {registration === "external" ? (
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    Register for this event
                    <ArrowRight className="size-4" aria-hidden />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : registration === "internal" ? (
                  <a href="#register" className="btn btn-primary">
                    Register for this event
                    <ArrowRight className="size-4" aria-hidden />
                  </a>
                ) : null}
                {event.brochureUrl ? (
                  <a href={event.brochureUrl} className="btn btn-outline-invert" download>
                    <Download className="size-4" aria-hidden />
                    Event brochure
                  </a>
                ) : null}
              </div>
            </div>

            {state === "upcoming" && event.startsAt ? (
              <div className="border border-white/15 bg-ink/60 p-6 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-gold-200">
                  {event.organiserStatus === "postponed" ? "Postponed — new date once confirmed" : "Counting down"}
                </p>
                <div className="mt-4">
                  <EventCountdown startsAt={event.startsAt} endsAt={event.endsAt} variant="invert" />
                </div>
                <p className="mt-4 text-[12px] leading-relaxed text-white/50">
                  All times are West Africa Time (WAT).
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {state === "cancelled" || state === "postponed" ? (
        <div className="border-b border-red-200 bg-red-50">
          <div className="shell flex items-start gap-3 py-4">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-700" aria-hidden />
            <p className="text-sm leading-relaxed text-red-800">
              <strong className="font-semibold">
                This event has been {state === "cancelled" ? "cancelled" : "postponed"}.
              </strong>{" "}
              {state === "cancelled"
                ? "It will not take place on the date shown. Please contact the Secretariat if you had registered or planned to attend."
                : "A new date has not been published. This page will be updated when the Society confirms one."}
            </p>
          </div>
        </div>
      ) : null}

      <section className="bg-white py-12 md:py-16">
        <div className="shell grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div>
            <p className="eyebrow">About this event</p>
            <h2 className="display mt-4 text-[1.8rem] leading-tight text-navy md:text-[2.3rem]">
              What to expect.
            </h2>

            {intro.length ? (
              <div className="prose-coop mt-6">
                {intro.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm leading-relaxed text-slate">
                The Society has not published a full description for this event yet. Details are
                confirmed by the Secretariat.
              </p>
            )}

            {event.objectives.length ? (
              <div className="mt-10">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                  Objectives
                </h3>
                <ul className="mt-4 space-y-3">
                  {event.objectives.map((objective) => (
                    <li key={objective} className="flex gap-3 text-sm leading-relaxed text-slate">
                      <span className="mt-2 size-1.5 shrink-0 rotate-45 bg-gold" aria-hidden />
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {event.exhibitors.length ? (
              <div className="mt-10">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                  Participating organisations
                </h3>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {event.exhibitors.map((exhibitor) => (
                    <li
                      key={exhibitor}
                      className="flex items-center gap-2 border border-line bg-bone px-3 py-2 text-sm text-navy"
                    >
                      <Users className="size-3.5 text-gold-600" aria-hidden />
                      {exhibitor}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {event.programmeUrl || event.posterUrl ? (
              <div className="mt-10 flex flex-wrap gap-3">
                {event.programmeUrl ? (
                  <a href={event.programmeUrl} download className="btn btn-outline">
                    <Download className="size-4" aria-hidden />
                    Download the programme
                  </a>
                ) : null}
                {event.posterUrl ? (
                  <a href={event.posterUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                    <ExternalLink className="size-4" aria-hidden />
                    View the event poster
                  </a>
                ) : null}
              </div>
            ) : null}

            {event.gallery.length ? (
              <div className="mt-12">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                  Event gallery
                </h3>
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {event.gallery.map((image) => (
                    <li key={image.id} className="relative aspect-[4/3] overflow-hidden bg-bone">
                      <Image
                        src={image.imageUrl}
                        alt={image.caption || `${event.title} photograph`}
                        fill
                        sizes="(max-width: 640px) 45vw, 20vw"
                        className="object-cover"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-10 border-t border-line pt-6">
              <EventShare
                url={`${base}/events/${event.slug}`}
                title={event.title}
                googleCalendar={googleCalendarUrl(event)}
                icsUrl={`/events/${event.slug}/calendar.ics`}
              />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="border border-line bg-bone p-6">
              <p className="eyebrow">When and where</p>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-slate">Date</dt>
                  <dd className="mt-1 text-navy">{formatEventDate(event)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-slate">Time</dt>
                  <dd className="mt-1 text-navy">{formatEventTime(event)}</dd>
                </div>
                {event.venueName ? (
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.12em] text-slate">Venue</dt>
                    <dd className="mt-1 leading-relaxed text-navy">
                      {event.venueName}
                      {event.venueAddress ? <span className="block text-slate">{event.venueAddress}</span> : null}
                    </dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-5 flex flex-col gap-2">
                {event.mapsUrl ? (
                  <a
                    href={event.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline h-9 px-3 text-[11px] uppercase"
                  >
                    <MapPin className="size-3.5" aria-hidden />
                    Directions
                  </a>
                ) : event.venueAddress ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      [event.venueName, event.venueAddress].filter(Boolean).join(", "),
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline h-9 px-3 text-[11px] uppercase"
                  >
                    <MapPin className="size-3.5" aria-hidden />
                    Directions
                  </a>
                ) : null}

                {event.venueAddress ? (
                  <div className="mt-2 border border-line bg-white">
                    <iframe
                      title={`Map of ${event.venueName || event.venueAddress}`}
                      src={`https://www.google.com/maps?q=${encodeURIComponent(
                        [event.venueName, event.venueAddress].filter(Boolean).join(", "),
                      )}&output=embed`}
                      className="h-48 w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                ) : null}

                {event.onlineEventUrl ? (
                  <a
                    href={event.onlineEventUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline h-9 px-3 text-[11px] uppercase"
                  >
                    <ExternalLink className="size-3.5" aria-hidden />
                    Join online
                  </a>
                ) : null}
              </div>
            </div>

            <div className="border border-line p-6">
              <p className="eyebrow">Contact</p>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                Questions about attendance, exhibition space or registration should go to the
                Secretariat.
              </p>
              <dl className="mt-4 space-y-2 text-sm text-navy">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-slate">Telephone</dt>
                  <dd>{event.contactPhone || site.contact.phones[0].value}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-slate">Email</dt>
                  <dd className="break-all">{event.enquiryEmail || site.contact.emails[0].value}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </section>

      {/* ------------------------------------------------------- registration */}
      <section id="register" className="border-t border-line bg-bone py-14 md:py-20">
        <div className="shell grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div>
            <p className="eyebrow">Take part</p>
            <h2 className="display mt-4 text-[1.8rem] leading-tight text-navy md:text-[2.3rem]">
              {registration === "external"
                ? "Register on the event platform."
                : registration === "internal"
                  ? "Register your attendance."
                  : registration === "closed"
                    ? "Registration has closed."
                    : "Attendance information."}
            </h2>

            {registration === "external" ? (
              <>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate md:text-base">
                  Registration for this event is handled on the Society&rsquo;s event platform. The
                  form there collects what the organisers need.
                </p>
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary mt-6"
                >
                  Open the registration page
                  <ExternalLink className="size-4" aria-hidden />
                </a>
              </>
            ) : null}

            {registration === "internal" ? (
              <div className="mt-6">
                <EventRegistrationForm
                  slug={event.slug}
                  deadline={event.registrationDeadline}
                  enquiryEmail={event.enquiryEmail}
                />
              </div>
            ) : null}

            {registration === "closed" ? (
              <p className="mt-4 max-w-xl border-l-2 border-gold bg-white px-4 py-3 text-sm leading-relaxed text-slate">
                {event.organiserStatus !== "scheduled"
                  ? `This event has been ${event.organiserStatus}. Registration is not being taken.`
                  : event.registrationDeadline
                    ? `Registration closed on ${event.registrationDeadline}.`
                    : "Registration is closed for this event."}{" "}
                Contact the Secretariat if you need to confirm your place.
              </p>
            ) : null}

            {registration === "not-required" ? (
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate md:text-base">
                No registration is required for this event. Attendance details are confirmed by the
                Secretariat.
              </p>
            ) : null}
          </div>

          <div className="border border-line bg-white p-6">
            <p className="eyebrow">Enquiries</p>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              Send a question to the organising team. Messages are sent to the Secretariat, not
              published.
            </p>
            <div className="mt-5">
              <EventEnquiryForm slug={event.slug} />
            </div>
          </div>
        </div>
      </section>

      {others.length ? (
        <section className="bg-white py-14 md:py-20">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-serif text-2xl text-navy md:text-[1.9rem]">Other events</h2>
              <Link href="/events" className="link-underline">
                All events
              </Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {others.map((item) => (
                <EventCard key={item.slug} event={item} compact />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand
        eyebrow="Membership"
        title="Not a member yet?"
        body="The Society serves CBN staff, retirees and staff on secondment. Membership details and the application route are published online."
        primary={{ label: "Membership details", href: "/membership" }}
        secondary={{ label: "Contact the Secretariat", href: "/contact" }}
      />
    </>
  );
}
