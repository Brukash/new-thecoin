import Link from "next/link";
import { requireStaff } from "@/lib/cms/auth";
import { listEnquiries } from "@/lib/cms/store";
import { setEnquiryStatus } from "../actions";
import {
  DEPARTMENTS,
  STATUSES,
  departmentLabel,
  isOverdue,
  listCases,
  slaState,
} from "@/lib/crm/cases";
import { assignCase, setCaseStatus, addCaseNote, recordCaseReply } from "./actions";

export const dynamic = "force-dynamic";

const badge = {
  breached: "bg-red-50 text-red-700",
  due: "bg-bone text-slate",
  met: "bg-emerald-50 text-emerald-800",
  closed: "bg-bone text-slate",
} as const;

export default async function EnquiriesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ handled?: string; reopened?: string }>;
}) {
  await requireStaff();

  const params = await searchParams;
  const [enquiries, cases] = await Promise.all([listEnquiries(), listCases()]);
  const byReference = new Map(cases.map((entry) => [entry.reference, entry]));

  const open = enquiries.filter((enquiry) => !enquiry.handled).length;
  const overdue = cases.filter(isOverdue).length;
  const unacknowledged = cases.filter((entry) => !entry.acknowledgement.sent).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin" className="text-[12px] uppercase tracking-[0.12em] text-slate hover:text-navy">
            ← Back to console
          </Link>
          <h1 className="mt-4 font-serif text-2xl text-navy">Enquiries</h1>
          <p className="mt-1 text-xs text-slate">
            {enquiries.length} received · {open} awaiting a reply · {cases.length} tracked as cases
          </p>
        </div>
        <Link href="/admin/enquiries/reports" className="btn btn-outline h-9 px-3 text-[12px]">
          Reports
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Open", value: open },
          { label: "Past SLA", value: overdue },
          { label: "Acknowledgement not sent", value: unacknowledged },
        ].map((card) => (
          <div key={card.label} className="border border-line bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate">{card.label}</p>
            <p className={`mt-1 font-serif text-2xl ${card.label === "Past SLA" && card.value > 0 ? "text-red-700" : "text-navy"}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {params.handled || params.reopened ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">
          {params.handled ? "Marked as handled." : "Returned to the open list."}
        </p>
      ) : null}

      <ul className="mt-8 space-y-5">
        {enquiries.map((enquiry) => {
          const entry = byReference.get(enquiry.reference);
          const state = entry ? slaState(entry) : null;

          return (
            <li key={enquiry.id} className="border border-line bg-white p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="font-serif text-lg text-navy">{enquiry.subject || "General enquiry"}</p>
                <div className="flex items-center gap-2">
                  {entry && state ? (
                    <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${badge[state]}`}>
                      {state === "breached" ? "SLA breached" : state === "met" ? "SLA met" : state === "closed" ? "Closed" : "Within SLA"}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-slate">No case</span>
                  )}
                  <p className="text-[12px] tabular-nums text-slate">
                    {new Date(enquiry.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate">
                <span className="text-navy">{enquiry.name}</span>
                <a href={`mailto:${enquiry.email}`} className="break-all underline underline-offset-4 hover:text-navy">
                  {enquiry.email}
                </a>
                {enquiry.phone ? <a href={`tel:${enquiry.phone.replace(/\s+/g, "")}`}>{enquiry.phone}</a> : null}
                <span className="font-sans">{enquiry.reference}</span>
                {entry ? <span>{departmentLabel(entry.department)}{entry.officer ? ` · ${entry.officer}` : ""}</span> : null}
                {entry ? <span className="uppercase tracking-[0.08em]">{entry.status}</span> : null}
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-charcoal">{enquiry.message}</p>

              {entry ? (
                <div className="mt-4 grid gap-4 border-t border-line pt-4 lg:grid-cols-2">
                  <form action={assignCase} className="space-y-2">
                    <input type="hidden" name="reference" value={enquiry.reference} />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate">Assignment</p>
                    <div className="flex flex-wrap gap-2">
                      <select name="department" defaultValue={entry.department} className="field h-9 w-full text-xs sm:w-40">
                        {DEPARTMENTS.map((department) => (
                          <option key={department.value} value={department.value}>
                            {department.label}
                          </option>
                        ))}
                      </select>
                      <input
                        name="officer"
                        defaultValue={entry.officer}
                        placeholder="Officer email or name"
                        className="field h-9 w-full text-xs sm:w-44"
                      />
                      <select name="priority" defaultValue={entry.priority} className="field h-9 w-full text-xs sm:w-24">
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                      </select>
                      <button type="submit" className="btn btn-outline h-9 px-3 text-[12px]">
                        Save
                      </button>
                    </div>
                    <p className="text-[11px] text-slate">
                      Reply due {new Date(entry.dueAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </form>

                  <form action={setCaseStatus} className="space-y-2">
                    <input type="hidden" name="reference" value={enquiry.reference} />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate">Status</p>
                    <div className="flex flex-wrap gap-2">
                      <select name="status" defaultValue={entry.status} className="field h-9 w-full text-xs sm:w-44">
                        {STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="btn btn-outline h-9 px-3 text-[12px]">
                        Update
                      </button>
                    </div>
                  </form>

                  <form action={setEnquiryStatus} className="flex items-end">
                    <input type="hidden" name="id" value={enquiry.id} />
                    <input type="hidden" name="handled" value={enquiry.handled ? "false" : "true"} />
                    <button type="submit" className="h-9 text-[12px] text-slate hover:text-navy">
                      {enquiry.handled ? "Reopen inbox item" : "Mark handled"}
                    </button>
                  </form>

                  <form action={recordCaseReply} className="space-y-2">
                    <input type="hidden" name="reference" value={enquiry.reference} />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate">
                      Reply to customer
                    </p>
                    <textarea name="body" rows={3} required className="field text-xs" placeholder="Visible on the tracking page" />
                    <button type="submit" className="btn btn-primary h-9 px-3 text-[12px]">
                      Record reply
                    </button>
                  </form>

                  <form action={addCaseNote} className="space-y-2">
                    <input type="hidden" name="reference" value={enquiry.reference} />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate">
                      Internal note
                    </p>
                    <textarea name="body" rows={3} required className="field text-xs" placeholder="Never shown to the customer" />
                    <button type="submit" className="btn btn-outline h-9 px-3 text-[12px]">
                      Add note
                    </button>
                  </form>

                  {entry.notes.length > 0 ? (
                    <div className="lg:col-span-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate">Recent notes</p>
                      <ul className="mt-2 space-y-1.5">
                        {entry.notes.slice(-3).reverse().map((note) => (
                          <li key={`${note.at}-${note.body}`} className="border-l-2 border-line pl-3 text-[12px] text-slate">
                            <span className="text-navy">{note.by}</span> ·{" "}
                            {new Date(note.at).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })} — {note.body}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}

        {enquiries.length === 0 ? (
          <li className="border border-line bg-white p-6 text-sm text-slate">
            Nothing has been submitted yet. Enquiries sent from the website appear here as cases.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
