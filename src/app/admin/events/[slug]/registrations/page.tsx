import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/cms/auth";
import { getEvent, listRegistrations } from "@/lib/cms/events";
import { setRegistrationStatusAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function RegistrationsPage({
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

  const registrations = await listRegistrations(event.id);
  const query = await searchParams;
  const totalAttendees = registrations.reduce((sum, item) => sum + item.attendeeCount, 0);

  return (
    <div>
      <Link href={`/admin/events/${slug}`} className="text-[11px] uppercase tracking-[0.12em] text-slate hover:text-navy">
        ← Back to the event
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="font-serif text-2xl text-navy">Registrations</h1>
          <p className="mt-1 text-xs text-slate">
            {event.title} · {registrations.length} registration
            {registrations.length === 1 ? "" : "s"} · {totalAttendees} attendee
            {totalAttendees === 1 ? "" : "s"}
          </p>
        </div>
        <a
          href={`/admin/events/${slug}/registrations.csv`}
          className="btn btn-outline h-9 px-3 text-[11px]"
        >
          Export CSV
        </a>
      </div>

      {query.saved ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">
          Registration updated.
        </p>
      ) : null}

      <div className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <thead className="border-b border-line bg-bone text-[10px] uppercase tracking-[0.12em] text-slate">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Contact</th>
              <th className="px-3 py-2 font-medium">Organisation</th>
              <th className="px-3 py-2 font-medium">Attendees</th>
              <th className="px-3 py-2 font-medium">Received</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {registrations.map((registration) => (
              <tr key={registration.id} className="align-top">
                <td className="px-3 py-3 text-navy">
                  {registration.fullName}
                  {registration.additionalInformation ? (
                    <p className="mt-1 max-w-xs text-[11px] text-slate">
                      {registration.additionalInformation}
                    </p>
                  ) : null}
                </td>
                <td className="px-3 py-3 text-[12px] text-slate">
                  <a href={`mailto:${registration.email}`} className="block break-all hover:text-navy">
                    {registration.email}
                  </a>
                  {registration.phone ? <span className="block">{registration.phone}</span> : null}
                </td>
                <td className="px-3 py-3 text-[12px] text-slate">{registration.organisation || "—"}</td>
                <td className="px-3 py-3 text-[12px] tabular-nums text-slate">
                  {registration.attendeeCount}
                </td>
                <td className="px-3 py-3 text-[11px] text-slate">
                  {new Date(registration.registrationDate).toLocaleString("en-GB", {
                    timeZone: "Africa/Lagos",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-3 py-3">
                  <form action={setRegistrationStatusAction} className="flex items-center gap-1">
                    <input type="hidden" name="slug" value={event.slug} />
                    <input type="hidden" name="id" value={registration.id} />
                    <select
                      name="status"
                      defaultValue={registration.status}
                      className="field h-8 w-28 text-[11px]"
                    >
                      <option value="received">Received</option>
                      <option value="approved">Approved</option>
                      <option value="declined">Declined</option>
                      <option value="attended">Attended</option>
                    </select>
                    <button type="submit" className="btn btn-outline h-8 px-2 text-[10px] uppercase">
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {registrations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-slate">
                  No registrations yet. {event.registrationRequired
                    ? "The form is shown on the public event page."
                    : "This event does not collect registrations."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate">
        Registration records are private: they are visible here to signed-in staff only, and are
        never published. Export only what the Society needs, and do not circulate personal data
        beyond the organising team.
      </p>
    </div>
  );
}
