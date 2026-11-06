import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/cms/auth";
import { getEvent, listEnquiries } from "@/lib/cms/events";
import { setEnquiryStatusAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EventEnquiriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireStaff();
  const { slug } = await params;
  const event = await getEvent(slug, { includeDrafts: true });
  if (!event) notFound();

  const enquiries = await listEnquiries(event.id);
  const query = await searchParams;
  const open = enquiries.filter((item) => item.status === "open").length;

  return (
    <div>
      <Link href={`/admin/events/${slug}`} className="text-[11px] uppercase tracking-[0.12em] text-slate hover:text-navy">
        ← Back to the event
      </Link>

      <div className="mt-4 border-b border-line pb-4">
        <h1 className="font-serif text-2xl text-navy">Event enquiries</h1>
        <p className="mt-1 text-xs text-slate">
          {event.title} · {enquiries.length} message{enquiries.length === 1 ? "" : "s"} · {open} open
        </p>
      </div>

      {query.saved ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">
          Enquiry updated.
        </p>
      ) : null}

      <ul className="mt-6 divide-y divide-line border-y border-line bg-white">
        {enquiries.map((enquiry) => (
          <li key={enquiry.id} className="px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-navy">
                  {enquiry.name}
                  <span className="ml-2 text-[11px] text-slate">{enquiry.email}</span>
                  {enquiry.phone ? (
                    <span className="ml-2 text-[11px] text-slate">{enquiry.phone}</span>
                  ) : null}
                </p>
                <p className="mt-2 max-w-2xl whitespace-pre-line text-[13px] leading-relaxed text-slate">
                  {enquiry.message}
                </p>
                <p className="mt-2 text-[11px] text-slate">
                  {new Date(enquiry.createdAt).toLocaleString("en-GB", {
                    timeZone: "Africa/Lagos",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              <form action={setEnquiryStatusAction} className="flex items-center gap-1">
                <input type="hidden" name="slug" value={event.slug} />
                <input type="hidden" name="id" value={enquiry.id} />
                <input
                  type="hidden"
                  name="status"
                  value={enquiry.status === "open" ? "resolved" : "open"}
                />
                <button type="submit" className="btn btn-outline h-7 px-2 text-[10px] uppercase">
                  {enquiry.status === "open" ? "Mark resolved" : "Reopen"}
                </button>
              </form>
            </div>
          </li>
        ))}
        {enquiries.length === 0 ? (
          <li className="px-4 py-6 text-sm text-slate">No enquiries for this event yet.</li>
        ) : null}
      </ul>
    </div>
  );
}
