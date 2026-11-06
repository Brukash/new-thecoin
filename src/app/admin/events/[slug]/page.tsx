import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/cms/auth";
import { getEvent, listCategories, listEnquiries, listRegistrations } from "@/lib/cms/events";
import { formatEventDate, lifecycleOf } from "@/lib/events/format";
import { saveEventAction } from "../actions";
import { EventForm } from "../EventForm";
import { EventAdminBar } from "./EventAdminBar";
import { GalleryManager } from "./GalleryManager";

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  invalid: "Check the details. The end date must follow the start date and links need https://.",
  upload: "A file could not be uploaded. Images must be under 5 MB and documents under 10 MB.",
  gallery: "The photograph could not be uploaded. Use an image under 5 MB.",
  missing: "That event could not be found.",
};

const notices: Record<string, string> = {
  created: "Event created. Add the details, then publish when the Society has approved them.",
  saved: "Event saved.",
  status: "Publication status updated.",
  featured: "Homepage selection updated.",
  gallery: "Gallery updated.",
};

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; created?: string; status?: string; featured?: string; gallery?: string; error?: string }>;
}) {
  await requireStaff();

  const { slug } = await params;
  const event = await getEvent(decodeURIComponent(slug), { includeDrafts: true });
  if (!event) notFound();

  const query = await searchParams;
  const [categories, registrations, enquiries] = await Promise.all([
    listCategories({ includeInactive: true }),
    listRegistrations(event.id),
    listEnquiries(event.id),
  ]);

  const state = lifecycleOf(event);
  const openEnquiries = enquiries.filter((item) => item.status === "open").length;

  return (
    <div>
      <Link href="/admin/events" className="text-[11px] uppercase tracking-[0.12em] text-slate hover:text-navy">
        ← All events
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="font-serif text-2xl text-navy">{event.title}</h1>
          <p className="mt-1 text-xs text-slate">
            {formatEventDate(event)} · {event.categoryName} · {event.publicationStatus} · {state}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/events/${event.slug}`} className="btn btn-outline h-9 px-3 text-[11px]" target="_blank" rel="noopener noreferrer">
            Preview page
          </Link>
          <Link href={`/admin/events/${event.slug}/registrations`} className="btn btn-outline h-9 px-3 text-[11px]">
            Registrations ({registrations.length})
          </Link>
          <Link href={`/admin/events/${event.slug}/enquiries`} className="btn btn-outline h-9 px-3 text-[11px]">
            Enquiries ({openEnquiries} open)
          </Link>
        </div>
      </div>

      {query.error ? (
        <p className="mt-5 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors[query.error] ?? "That could not be completed."}
        </p>
      ) : null}
      {["created", "saved", "status", "featured", "gallery"].map((key) =>
        query[key as "saved"] ? (
          <p key={key} className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">
            {notices[key]}
          </p>
        ) : null,
      )}

      <EventAdminBar event={event} />

      <form action={saveEventAction} className="mt-8">
        <input type="hidden" name="slug" value={event.slug} />
        <EventForm event={event} categories={categories} />
        <div className="sticky bottom-0 mt-4 flex items-center gap-3 border-t border-line bg-white/95 px-6 py-4 backdrop-blur">
          <button type="submit" className="btn btn-primary h-10 px-6">
            Save changes
          </button>
          <Link href="/admin/events" className="text-xs text-slate hover:text-navy">
            Cancel
          </Link>
          <span className="ml-auto text-[11px] text-slate">
            Last updated {new Date(event.updatedAt).toLocaleString("en-GB", { timeZone: "Africa/Lagos" })}
          </span>
        </div>
      </form>

      <GalleryManager slug={event.slug} images={event.gallery} />
    </div>
  );
}
