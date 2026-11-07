import { ConfirmSubmit } from "@/app/admin/ConfirmSubmit";
import type { SocietyEvent } from "@/lib/events/types";
import { deleteEventAction, featureEventAction, publishEventAction } from "../actions";

/** Publication controls that sit above the event editor. */
export function EventAdminBar({ event }: { event: SocietyEvent }) {
  const cancelled = event.organiserStatus !== "scheduled";

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2 border border-line bg-white px-4 py-3">
      <span className="text-[11px] uppercase tracking-[0.12em] text-slate">Status</span>
      <span className="border border-line px-2 py-0.5 text-[11px] uppercase tracking-[0.1em] text-navy">
        {event.publicationStatus}
      </span>
      {event.featured ? (
        <span className="bg-gold-50 px-2 py-0.5 text-[11px] uppercase tracking-[0.1em] text-gold-600">
          Featured on homepage
        </span>
      ) : null}
      {cancelled ? (
        <span className="bg-red-50 px-2 py-0.5 text-[11px] uppercase tracking-[0.1em] text-red-700">
          {event.organiserStatus}
        </span>
      ) : null}

      <div className="ml-auto flex flex-wrap items-center gap-1.5">
        <form action={publishEventAction}>
          <input type="hidden" name="slug" value={event.slug} />
          <input
            type="hidden"
            name="status"
            value={event.publicationStatus === "published" ? "draft" : "published"}
          />
          <button type="submit" className="btn btn-outline h-7 px-2 text-[11px] uppercase">
            {event.publicationStatus === "published" ? "Unpublish" : "Publish"}
          </button>
        </form>
        <form action={publishEventAction}>
          <input type="hidden" name="slug" value={event.slug} />
          <input type="hidden" name="status" value="archived" />
          <button type="submit" className="btn btn-outline h-7 px-2 text-[11px] uppercase">
            Archive
          </button>
        </form>
        <form action={featureEventAction}>
          <input type="hidden" name="slug" value={event.slug} />
          <input type="hidden" name="featured" value={event.featured ? "false" : "true"} />
          <button type="submit" className="btn btn-outline h-7 px-2 text-[11px] uppercase">
            {event.featured ? "Remove from homepage" : "Feature on homepage"}
          </button>
        </form>
        <form action={deleteEventAction}>
          <input type="hidden" name="slug" value={event.slug} />
          <ConfirmSubmit>Delete event</ConfirmSubmit>
        </form>
      </div>
    </div>
  );
}
