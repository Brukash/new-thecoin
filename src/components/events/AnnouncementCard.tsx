import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Paperclip } from "lucide-react";
import type { Announcement } from "@/lib/events/types";
import { formatAnnouncementDate } from "@/lib/events/format";

/** Announcement card for the centre, homepage and related notices. */
export function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  return (
    <article className="card card-hover flex h-full flex-col overflow-hidden">
      {announcement.featuredImage ? (
        <div className="relative aspect-[16/9] bg-bone">
          <Image
            src={announcement.featuredImage}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">
            {announcement.category}
          </span>
          {announcement.urgent ? (
            <span className="whitespace-nowrap bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700">
              Urgent
            </span>
          ) : null}
        </div>

        <h3 className="mt-3 font-serif text-xl leading-snug text-navy">
          <Link href={`/events/announcements/${announcement.slug}`} className="hover:text-gold-600">
            {announcement.title}
          </Link>
        </h3>

        {announcement.shortDescription ? (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate">
            {announcement.shortDescription}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-5 text-[12px] text-slate">
          <time className="whitespace-nowrap" dateTime={announcement.publishedAt ?? undefined}>
            {formatAnnouncementDate(announcement.publishedAt)}
          </time>
          <div className="flex items-center gap-3">
            {announcement.attachmentUrl ? (
              <span className="inline-flex items-center gap-1 text-slate/80">
                <Paperclip className="size-3" aria-hidden /> PDF
              </span>
            ) : null}
            <Link
              href={`/events/announcements/${announcement.slug}`}
              className="inline-flex items-center gap-1 font-semibold uppercase tracking-[0.1em] text-navy"
            >
              Read <ArrowUpRight className="size-3" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
