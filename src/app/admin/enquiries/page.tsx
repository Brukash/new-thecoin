import Link from "next/link";
import { requireStaff } from "@/lib/cms/auth";
import { listEnquiries } from "@/lib/cms/store";
import { setEnquiryStatus } from "../actions";

export const dynamic = "force-dynamic";

/**
 * Enquiry inbox.
 *
 * Enquiries are read with the service role, which bypasses row level security,
 * so access is enforced here by `requireStaff` in addition to the
 * `enquiries_staff_read` policy that guards browser clients.
 */
export default async function EnquiriesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ handled?: string; reopened?: string }>;
}) {
  await requireStaff();

  const params = await searchParams;
  const enquiries = await listEnquiries();
  const open = enquiries.filter((enquiry) => !enquiry.handled).length;

  return (
    <div>
      <Link href="/admin" className="text-[11px] uppercase tracking-[0.12em] text-slate hover:text-navy">
        ← Back to console
      </Link>
      <h1 className="mt-4 font-serif text-2xl text-navy">Enquiries</h1>
      <p className="mt-1 text-xs text-slate">
        {enquiries.length === 0
          ? "Nothing has been submitted yet. Enquiries sent from the website appear here."
          : `${enquiries.length} received · ${open} awaiting a reply · newest first`}
      </p>

      {params.handled ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">
          Marked as handled.
        </p>
      ) : null}
      {params.reopened ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">
          Returned to the open list.
        </p>
      ) : null}

      <ul className="mt-8 space-y-4">
        {enquiries.map((enquiry) => (
          <li
            key={enquiry.id}
            className={`border bg-white p-5 ${
              enquiry.handled ? "border-line opacity-75" : "border-line border-l-2 border-l-gold"
            }`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="font-serif text-lg text-navy">{enquiry.subject || "General enquiry"}</p>
              <p className="text-[11px] tabular-nums text-slate">
                {new Date(enquiry.createdAt).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate">
              <span className="text-navy">{enquiry.name}</span>
              <a href={`mailto:${enquiry.email}`} className="underline underline-offset-4 hover:text-navy">
                {enquiry.email}
              </a>
              {enquiry.phone ? (
                <a href={`tel:${enquiry.phone.replace(/\s+/g, "")}`} className="hover:text-navy">
                  {enquiry.phone}
                </a>
              ) : null}
              {enquiry.reference ? <span className="text-slate/70">{enquiry.reference}</span> : null}
            </div>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-charcoal">
              {enquiry.message}
            </p>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
              <span
                className={`text-[10px] uppercase tracking-[0.1em] ${
                  enquiry.handled ? "text-slate/70" : "text-gold-600"
                }`}
              >
                {enquiry.handled ? "Handled" : "Awaiting reply"}
              </span>
              <form action={setEnquiryStatus}>
                <input type="hidden" name="id" value={enquiry.id} />
                <input type="hidden" name="handled" value={enquiry.handled ? "false" : "true"} />
                <button
                  type="submit"
                  className="text-[11px] uppercase tracking-[0.1em] text-slate transition-colors hover:text-navy"
                >
                  {enquiry.handled ? "Reopen" : "Mark handled"}
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
