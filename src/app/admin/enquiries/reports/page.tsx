import Link from "next/link";
import { requireStaff } from "@/lib/cms/auth";
import { listCases, DEPARTMENTS, isOverdue, slaState } from "@/lib/crm/cases";
import { listEnquiries } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

export default async function EnquiryReportsPage() {
  await requireStaff();

  const [cases, enquiries] = await Promise.all([listCases(), listEnquiries(500)]);

  const byDepartment = DEPARTMENTS.map((department) => {
    const entries = cases.filter((entry) => entry.department === department.value);
    return {
      ...department,
      total: entries.length,
      open: entries.filter((entry) => !["resolved", "closed"].includes(entry.status)).length,
      overdue: entries.filter(isOverdue).length,
    };
  });

  const sla = {
    met: cases.filter((entry) => slaState(entry) === "met").length,
    breached: cases.filter((entry) => slaState(entry) === "breached").length,
    open: cases.filter((entry) => ["due"].includes(slaState(entry))).length,
  };

  const withFeedback = cases.filter((entry) => entry.feedback);
  const average =
    withFeedback.length > 0
      ? (withFeedback.reduce((total, entry) => total + (entry.feedback?.rating ?? 0), 0) / withFeedback.length).toFixed(1)
      : "—";

  const decided = sla.met + sla.breached;
  const compliance = decided > 0 ? Math.round((sla.met / decided) * 100) : null;
  const unacknowledged = cases.filter((entry) => !entry.acknowledgement.sent).length;
  const oldestOpen = [...cases]
    .filter((entry) => !["resolved", "closed"].includes(entry.status))
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))[0];

  return (
    <div>
      <Link href="/admin/enquiries" className="text-[12px] uppercase tracking-[0.12em] text-slate hover:text-navy">
        ← Enquiries
      </Link>
      <h1 className="mt-4 font-serif text-2xl text-navy">Enquiry reports</h1>
      <p className="mt-1 text-xs text-slate">
        {cases.length} cases tracked · {enquiries.length} messages received · SLA clock starts when an
        enquiry arrives.
      </p>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "SLA compliance", value: compliance === null ? "—" : `${compliance}%` },
          { label: "SLA breached", value: sla.breached },
          { label: "Awaiting feedback", value: withFeedback.length },
          { label: "Average rating", value: average },
        ].map((card) => (
          <div key={card.label} className="border border-line bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate">{card.label}</p>
            <p className="mt-1 font-serif text-2xl text-navy">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 border border-line bg-white p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">By department</p>
        <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[24rem] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-[0.1em] text-slate">
              <th className="whitespace-nowrap py-2 pr-3">Department</th>
              <th className="whitespace-nowrap py-2 pr-3">SLA</th>
              <th className="whitespace-nowrap py-2 pr-3 text-right">Total</th>
              <th className="whitespace-nowrap py-2 pr-3 text-right">Open</th>
              <th className="whitespace-nowrap py-2 text-right">Past SLA</th>
            </tr>
          </thead>
          <tbody>
            {byDepartment.map((row) => (
              <tr key={row.value} className="border-b border-line/60">
                <td className="py-2 text-navy">{row.label}</td>
                <td className="py-2 text-slate">{row.slaHours}h</td>
                <td className="py-2 text-right tabular-nums text-navy">{row.total}</td>
                <td className="py-2 text-right tabular-nums text-slate">{row.open}</td>
                <td className={`py-2 text-right tabular-nums ${row.overdue > 0 ? "text-red-700" : "text-slate"}`}>
                  {row.overdue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="border border-line bg-white p-5 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">Service quality</p>
          <ul className="mt-3 space-y-2 text-slate">
            <li>Resolved within SLA: <span className="text-navy">{sla.met}</span></li>
            <li>Resolved after SLA: <span className="text-navy">{sla.breached}</span></li>
            <li>Still within SLA: <span className="text-navy">{sla.open}</span></li>
            <li>Acknowledgements not sent: <span className="text-navy">{unacknowledged}</span></li>
            {oldestOpen ? (
              <li>
                Oldest open case: <span className="font-sans text-navy">{oldestOpen.reference}</span>
              </li>
            ) : null}
          </ul>
        </div>

        <div className="border border-line bg-white p-5 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">Recent feedback</p>
          {withFeedback.length === 0 ? (
            <p className="mt-3 text-xs text-slate">No feedback yet. Customers are asked once a case is resolved.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {withFeedback.slice(0, 5).map((entry) => (
                <li key={entry.reference} className="text-xs text-slate">
                  <span className="text-navy">{entry.reference}</span> · {entry.feedback?.rating}/5
                  {entry.feedback?.comment ? ` — ${entry.feedback.comment}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <p className="mt-6 text-[12px] leading-relaxed text-slate">
        Acknowledgement delivery requires an email provider. Until <code>KNOCK_API_KEY</code> is set,
        references are recorded and shown on the tracking page, but no email is sent.
      </p>
    </div>
  );
}
