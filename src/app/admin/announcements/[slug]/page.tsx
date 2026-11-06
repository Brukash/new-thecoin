import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/cms/auth";
import { getAnnouncement } from "@/lib/cms/events";
import { saveAnnouncementAction } from "../../events/actions";

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  invalid: "Check the fields. The expiry date must be a date and links need https://.",
  upload: "A file could not be uploaded. Images must be under 5 MB and PDFs under 10 MB.",
  missing: "That announcement could not be found.",
};

export default async function AnnouncementEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; created?: string; error?: string }>;
}) {
  await requireStaff();
  const { slug } = await params;
  const announcement = await getAnnouncement(slug, { includeDrafts: true });
  if (!announcement) notFound();

  const query = await searchParams;
  const publishedInput = announcement.publishedAt
    ? new Date(new Date(announcement.publishedAt).getTime() + 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16)
    : "";

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/announcements"
        className="text-[11px] uppercase tracking-[0.12em] text-slate hover:text-navy"
      >
        ← All announcements
      </Link>

      <h1 className="mt-4 font-serif text-2xl text-navy">{announcement.title}</h1>
      <p className="mt-1 text-xs text-slate">
        {announcement.publicationStatus} · /events/announcements/{announcement.slug}
      </p>

      {query.created ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">
          Announcement created as a draft. Complete the notice, then publish.
        </p>
      ) : null}
      {query.saved ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">Saved.</p>
      ) : null}
      {query.error ? (
        <p className="mt-5 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors[query.error] ?? "That could not be completed."}
        </p>
      ) : null}

      <form action={saveAnnouncementAction} className="mt-6 space-y-5 bg-white p-6 ring-1 ring-line">
        <input type="hidden" name="slug" value={announcement.slug} />

        <div>
          <label htmlFor="title" className="field-label">
            Title
          </label>
          <input id="title" name="title" defaultValue={announcement.title} className="field mt-2" required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="field-label">
              Category
            </label>
            <input
              id="category"
              name="category"
              list="announcement-categories"
              defaultValue={announcement.category}
              className="field mt-2"
            />
            <datalist id="announcement-categories">
              {[
                "Official notice",
                "AGM announcement",
                "Project update",
                "Policy change",
                "Member information",
                "Deadline",
                "Service interruption",
                "General notice",
              ].map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="publicationStatus" className="field-label">
              Publication status
            </label>
            <select
              id="publicationStatus"
              name="publicationStatus"
              defaultValue={announcement.publicationStatus}
              className="field mt-2"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="shortDescription" className="field-label">
            Short summary
          </label>
          <textarea
            id="shortDescription"
            name="shortDescription"
            rows={2}
            defaultValue={announcement.shortDescription}
            className="field mt-2"
            maxLength={400}
          />
        </div>

        <div>
          <label htmlFor="fullDescription" className="field-label">
            Full notice
          </label>
          <textarea
            id="fullDescription"
            name="fullDescription"
            rows={10}
            defaultValue={announcement.fullDescription}
            className="field mt-2"
          />
          <p className="mt-1 text-[11px] text-slate">Separate paragraphs with a blank line.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="publishedAt" className="field-label">
              Publication date and time
            </label>
            <input
              id="publishedAt"
              name="publishedAt"
              type="datetime-local"
              defaultValue={publishedInput}
              className="field mt-2"
            />
            <p className="mt-1 text-[11px] text-slate">
              Used for scheduled notices. Leave blank to publish immediately.
            </p>
          </div>
          <div>
            <label htmlFor="expiryDate" className="field-label">
              Expiry date
            </label>
            <input
              id="expiryDate"
              name="expiryDate"
              type="date"
              defaultValue={announcement.expiryDate ?? ""}
              className="field mt-2"
            />
            <p className="mt-1 text-[11px] text-slate">
              After this date the notice disappears from the website but is not deleted.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 border-t border-line pt-4">
          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" name="urgent" defaultChecked={announcement.urgent} className="size-4" />
            Show as an urgent banner
          </label>
          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" name="featured" defaultChecked={announcement.featured} className="size-4" />
            Feature on the announcements page
          </label>
        </div>

        <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
          <div className="border border-line bg-bone p-4">
            <p className="field-label">Featured image</p>
            <input type="hidden" name="featuredImageUrl" value={announcement.featuredImage} />
            {announcement.featuredImage ? (
              <div className="relative mt-3 aspect-[16/9] bg-white">
                <Image
                  src={announcement.featuredImage}
                  alt=""
                  fill
                  sizes="320px"
                  className="object-cover"
                />
              </div>
            ) : (
              <p className="mt-2 text-[11px] text-slate">None uploaded.</p>
            )}
            <input
              id="featuredImage"
              name="featuredImage"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="field mt-3 py-2 text-xs"
            />
          </div>

          <div className="border border-line bg-bone p-4">
            <p className="field-label">Attachment (PDF)</p>
            <input type="hidden" name="attachmentUrl" value={announcement.attachmentUrl} />
            {announcement.attachmentUrl ? (
              <p className="mt-2 break-all text-[11px] text-slate">{announcement.attachmentUrl}</p>
            ) : (
              <p className="mt-2 text-[11px] text-slate">None uploaded.</p>
            )}
            <input
              id="attachment"
              name="attachment"
              type="file"
              accept="application/pdf"
              className="field mt-3 py-2 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-primary h-10 px-6">
            Save announcement
          </button>
          <Link href="/admin/announcements" className="text-xs text-slate hover:text-navy">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
