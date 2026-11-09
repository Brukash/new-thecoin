import { getStaffUser } from "@/lib/cms/auth";
import { getEvent, listRegistrations } from "@/lib/cms/events";

export const dynamic = "force-dynamic";

function cell(value: string | number): string {
  // Registrant fields are attacker-controlled and end up in a spreadsheet.
  // A leading =, +, -, @, tab or CR makes Excel and Sheets evaluate the cell as
  // a formula, so the text is neutralised with a leading apostrophe and the
  // remaining control characters are removed.
  let text = String(value ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Staff-only CSV export of one event's registrations. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const staff = await getStaffUser();
  if (!staff) return new Response("Unauthorized", { status: 401 });

  const { slug } = await params;
  const event = await getEvent(slug, { includeDrafts: true });
  if (!event) return new Response("Not found", { status: 404 });

  const registrations = await listRegistrations(event.id);
  const header = [
    "Name",
    "Email",
    "Telephone",
    "Organisation",
    "Attendees",
    "Additional information",
    "Status",
    "Registered at",
  ];

  const rows = registrations.map((registration) =>
    [
      registration.fullName,
      registration.email,
      registration.phone,
      registration.organisation,
      registration.attendeeCount,
      registration.additionalInformation,
      registration.status,
      registration.registrationDate,
    ]
      .map(cell)
      .join(","),
  );

  const csv = [header.join(","), ...rows].join("\r\n");
  const filename = `${event.slug}-registrations.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
