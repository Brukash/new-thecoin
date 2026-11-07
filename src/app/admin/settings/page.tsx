import Link from "next/link";
import { requireStaff } from "@/lib/cms/auth";
import { getContactSettings } from "@/content/settings";
import { saveSettings } from "../actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireStaff();
  const settings = await getContactSettings();
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin" className="text-[12px] uppercase tracking-[0.12em] text-slate hover:text-navy">
        ← Back to console
      </Link>
      <h1 className="mt-4 font-serif text-2xl text-navy">Contact details</h1>
      <p className="mt-1 text-xs text-slate">
        These values appear in the header, footer, contact page and structured data.
      </p>

      {params.saved ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">
          Settings saved and published.
        </p>
      ) : null}
      {params.error ? (
        <p className="mt-5 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          Some fields were invalid. Check the email addresses and required text.
        </p>
      ) : null}

      <form action={saveSettings} className="mt-8 space-y-6 bg-white p-6 ring-1 ring-line">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="field-label">
              Society name
            </label>
            <input id="name" name="name" defaultValue={settings.name} required className="field mt-2" />
          </div>
          <div>
            <label htmlFor="shortName" className="field-label">
              Short name
            </label>
            <input
              id="shortName"
              name="shortName"
              defaultValue={settings.shortName}
              required
              className="field mt-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="legalName" className="field-label">
            Legal name
          </label>
          <input
            id="legalName"
            name="legalName"
            defaultValue={settings.legalName}
            required
            className="field mt-2"
          />
        </div>

        <div>
          <label htmlFor="tagline" className="field-label">
            Tagline
          </label>
          <input id="tagline" name="tagline" defaultValue={settings.tagline} className="field mt-2" />
        </div>

        <div>
          <label htmlFor="description" className="field-label">
            Description used by search engines
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={settings.description}
            className="field mt-2"
          />
        </div>

        <div>
          <label htmlFor="addressLines" className="field-label">
            Address lines (one per line)
          </label>
          <textarea
            id="addressLines"
            name="addressLines"
            rows={3}
            defaultValue={settings.contact.addressLines.join("\n")}
            className="field mt-2"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="address" className="field-label">
              Address in one line
            </label>
            <input
              id="address"
              name="address"
              defaultValue={settings.contact.address}
              className="field mt-2"
            />
          </div>
          <div>
            <label htmlFor="mapQuery" className="field-label">
              Map search text
            </label>
            <input
              id="mapQuery"
              name="mapQuery"
              defaultValue={settings.contact.mapQuery}
              className="field mt-2"
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="phones" className="field-label">
              Telephones (label | number, one per line)
            </label>
            <textarea
              id="phones"
              name="phones"
              rows={3}
              defaultValue={settings.contact.phones.map((p) => `${p.label} | ${p.value}`).join("\n")}
              className="field mt-2 font-sans text-[14px]"
            />
          </div>
          <div>
            <label htmlFor="emails" className="field-label">
              Email addresses (label | address, one per line)
            </label>
            <textarea
              id="emails"
              name="emails"
              rows={3}
              defaultValue={settings.contact.emails.map((e) => `${e.label} | ${e.value}`).join("\n")}
              className="field mt-2 font-sans text-[14px]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="hours" className="field-label">
            Opening hours (days | time, one per line)
          </label>
          <textarea
            id="hours"
            name="hours"
            rows={3}
            defaultValue={settings.contact.hours.map((h) => `${h.days} | ${h.time}`).join("\n")}
            className="field mt-2 font-sans text-[14px]"
          />
        </div>

        <div className="flex gap-3 border-t border-line pt-5">
          <button type="submit" className="btn btn-primary">
            Publish changes
          </button>
          <Link href="/admin" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
