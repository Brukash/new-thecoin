import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Download, Paperclip } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { EventsSubnav } from "@/components/events/EventsSubnav";
import { EventShare } from "@/components/events/EventShare";
import { AnnouncementCard } from "@/components/events/AnnouncementCard";
import { getAnnouncement, listAnnouncements } from "@/lib/cms/events";
import {
  announcementPageUrl,
  formatAnnouncementDate,
  siteBaseUrl,
} from "@/lib/events/format";
import { site } from "@/content/site";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const announcement = await getAnnouncement(slug);
  if (!announcement) return { title: "Announcement not found" };

  const description = announcement.shortDescription || announcement.fullDescription.slice(0, 160);
  const images = announcement.featuredImage
    ? [announcement.featuredImage]
    : [{ url: "/images/og-default.jpg", width: 1200, height: 630, alt: site.name }];

  return {
    title: announcement.title,
    description,
    alternates: { canonical: `/events/announcements/${announcement.slug}` },
    openGraph: {
      type: "article",
      title: announcement.title,
      description,
      url: announcementPageUrl(announcement),
      publishedTime: announcement.publishedAt ?? undefined,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: announcement.title,
      description,
      images: announcement.featuredImage
        ? [announcement.featuredImage]
        : ["/images/og-default.jpg"],
    },
  };
}

export default async function AnnouncementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const announcement = await getAnnouncement(slug);
  if (!announcement) notFound();

  const related = (await listAnnouncements({ limit: 4 }))
    .filter((item) => item.slug !== announcement.slug)
    .slice(0, 3);

  const paragraphs = announcement.fullDescription
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const noticeDescription =
    announcement.shortDescription || announcement.fullDescription.slice(0, 160);

  // An official notice published on a date is an Article: the type is accurate
  // and lets Google associate the notice with the Society as its publisher.
  const noticeSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: announcement.title,
    description: noticeDescription,
    datePublished: announcement.publishedAt ?? undefined,
    dateModified: announcement.updatedAt,
    articleSection: announcement.category,
    ...(announcement.featuredImage ? { image: [announcement.featuredImage] } : {}),
    author: { "@type": "Organization", name: site.legalName, url: site.url },
    publisher: {
      "@type": "Organization",
      name: site.legalName,
      url: site.url,
      logo: { "@type": "ImageObject", url: `${site.url}/images/logo.png` },
    },
    mainEntityOfPage: announcementPageUrl(announcement),
  };

  return (
    <>
      <PageHero
        eyebrow={announcement.category}
        title={announcement.title}
        intro={announcement.shortDescription || undefined}
        crumbs={[{ label: "Events & announcements", href: "/events" }, { label: "Announcements", href: "/events/announcements" }, { label: "Notice" }]}
      />

      <EventsSubnav active="announcements" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(noticeSchema) }}
      />

      <section className="bg-white py-12 md:py-16">
        <div className="shell grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <article>
            <div className="flex flex-wrap items-center gap-4 border-b border-line pb-5 text-[12px] uppercase tracking-[0.12em]">
              <span className="font-semibold text-gold-600">{announcement.category}</span>
              <time dateTime={announcement.publishedAt ?? undefined} className="text-slate">
                {formatAnnouncementDate(announcement.publishedAt)}
              </time>
              {announcement.urgent ? (
                <span className="bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                  Urgent
                </span>
              ) : null}
            </div>

            {announcement.featuredImage ? (
              <div className="relative mt-6 aspect-[16/9] overflow-hidden bg-bone">
                <Image
                  src={announcement.featuredImage}
                  alt={announcement.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>
            ) : null}

            {paragraphs.length ? (
              <div className="prose-coop mt-8">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="mt-8 text-sm leading-relaxed text-slate">
                The full text of this notice has not been added yet. Please contact the Secretariat
                for details.
              </p>
            )}

            {announcement.attachmentUrl ? (
              <a
                href={announcement.attachmentUrl}
                className="mt-8 inline-flex items-center gap-2 border border-line bg-bone px-4 py-3 text-sm text-navy transition-colors hover:border-navy"
                download
              >
                <Paperclip className="size-4 text-gold-600" aria-hidden />
                Download the attachment (PDF)
                <Download className="size-4" aria-hidden />
              </a>
            ) : null}

            <div className="mt-8 border-t border-line pt-6">
              <EventShare
                url={announcementPageUrl(announcement)}
                title={announcement.title}
                googleCalendar=""
                icsUrl=""
                compact
              />
            </div>
          </article>

          <aside className="space-y-6">
            <div className="border border-line bg-bone p-6">
              <p className="eyebrow">Contact</p>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                Questions about this notice should go to the Secretariat.
              </p>
              <dl className="mt-4 space-y-2 text-sm text-navy">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-slate">Telephone</dt>
                  <dd>{site.contact.phones[0].value}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-slate">Email</dt>
                  <dd className="break-all">{site.contact.emails[0].value}</dd>
                </div>
              </dl>
              <Link href="/contact" className="link-underline mt-4 inline-flex">
                Contact the Secretariat
              </Link>
            </div>

            <p className="text-xs leading-relaxed text-slate">
              Published at {siteBaseUrl()}/events/announcements/{announcement.slug}
            </p>
          </aside>
        </div>
      </section>

      {related.length ? (
        <section className="border-t border-line bg-bone py-14">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-serif text-2xl text-navy">Other notices</h2>
              <Link href="/events/announcements" className="link-underline">
                All announcements
              </Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((item) => (
                <AnnouncementCard key={item.slug} announcement={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand
        eyebrow="Stay informed"
        title="Notices reach members directly."
        body="The website carries the public record. Members also receive notices through the Society's own channels."
        primary={{ label: "Contact the Secretariat", href: "/contact" }}
        secondary={{ label: "Events & announcements", href: "/events" }}
      />
    </>
  );
}
