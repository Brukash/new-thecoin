import Link from "next/link";
import { requireStaff } from "@/lib/cms/auth";
import { listAnnouncements } from "@/lib/cms/events";
import { createAnnouncement, deleteAnnouncementAction } from "../events/actions";
import { ConfirmSubmit } from "../ConfirmSubmit";
import { EditButton } from "../EditButton";

export const dynamic = "force-dynamic";

export default async function AnnouncementsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}) {
  await requireStaff();
  const announcements = await listAnnouncements({ includeDrafts: true });
  const query = await searchParams;

  return (
    <div>
      <Link href="/admin/events" className="text-[11px] uppercase tracking-[0.12em] text-slate hover:text-navy">
        ← Events &amp; announcements
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="font-serif text-2xl text-navy">Announcements</h1>
          <p className="mt-1 text-xs text-slate">
            {announcements.length} notices. Urgent notices can appear as a banner across the
            website.
          </p>
        </div>
        <form action={createAnnouncement} className="flex items-center gap-2">
          <label htmlFor="new-announcement-title" className="sr-only">
            New announcement title
          </label>
          <input
            id="new-announcement-title"
            name="title"
            placeholder="Notice title"
            className="field h-9 w-64 text-sm"
            required
          />
          <button type="submit" className="btn btn-primary h-9 px-4 text-[11px]">
            Add
          </button>
        </form>
      </div>

      {query.deleted ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">
          Announcement deleted.
        </p>
      ) : null}
      {query.error ? (
        <p className="mt-5 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          Enter a title for the announcement.
        </p>
      ) : null}

      <ul className="mt-8 divide-y divide-line border-y border-line bg-white">
        {announcements.map((item) => (
          <li key={item.slug} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-navy">{item.title}</p>
              <p className="text-[11px] text-slate">
                {item.category} · {item.publicationStatus}
                {item.publishedAt
                  ? ` · ${new Date(item.publishedAt).toLocaleDateString("en-GB", { timeZone: "Africa/Lagos" })}`
                  : ""}
                {item.expiryDate ? ` · expires ${item.expiryDate}` : ""}
              </p>
            </div>
            {item.urgent ? (
              <span className="bg-gold-50 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] text-gold-600">
                Urgent
              </span>
            ) : null}
            {item.featured ? (
              <span className="border border-line px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] text-slate">
                Featured
              </span>
            ) : null}
            <EditButton href={`/admin/announcements/${item.slug}`} />
            <form action={deleteAnnouncementAction}>
              <input type="hidden" name="slug" value={item.slug} />
              <ConfirmSubmit>Delete</ConfirmSubmit>
            </form>
          </li>
        ))}
        {announcements.length === 0 ? (
          <li className="px-4 py-6 text-sm text-slate">
            No announcements yet. Add the first notice above; it stays private as a draft.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
