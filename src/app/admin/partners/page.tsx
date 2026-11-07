import Link from "next/link";
import { requireStaff } from "@/lib/cms/auth";
import { listPartners } from "@/lib/cms/partners";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPartner, deletePartnerAction, movePartnerAction, togglePartnerAction } from "../actions";
import { ConfirmSubmit } from "../ConfirmSubmit";
import { EditButton } from "../EditButton";

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  name: "Enter the organisation name.",
};

export default async function PartnersAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; toggled?: string; moved?: string; error?: string }>;
}) {
  await requireStaff();

  const params = await searchParams;
  const partners = await listPartners({ includeInactive: true });
  const active = partners.filter((partner) => partner.active).length;

  return (
    <div>
      <Link href="/admin" className="text-[12px] uppercase tracking-[0.12em] text-slate hover:text-navy">
        ← Back to console
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="font-serif text-2xl text-navy">Partners</h1>
          <p className="mt-1 text-xs text-slate">
            {active} of {partners.length} shown on the public directory. Order here is the order on
            the website.
          </p>
        </div>

        <form action={createPartner} className="flex items-center gap-2">
          <label htmlFor="new-partner-name" className="sr-only">
            New organisation name
          </label>
          <input
            id="new-partner-name"
            name="name"
            placeholder="Organisation name"
            className="field h-9 w-56 text-sm"
            required
          />
          <button type="submit" className="btn btn-primary h-9 px-4 text-[12px]">
            Add
          </button>
        </form>
      </div>

      {params.deleted ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">
          Organisation removed.
        </p>
      ) : null}
      {params.toggled ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">
          Visibility updated.
        </p>
      ) : null}
      {params.moved ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">
          Display order updated.
        </p>
      ) : null}
      {params.error ? (
        <p className="mt-5 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors[params.error] ?? "That could not be completed."}
        </p>
      ) : null}

      {isSupabaseConfigured() ? null : (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-xs leading-relaxed text-slate">
          Supabase is not configured here, so the directory is read-only and shows the seeded list.
        </p>
      )}

      <ul className="mt-8 divide-y divide-line border-y border-line bg-white">
        {partners.map((partner, index) => (
          <li key={partner.slug} className="flex flex-wrap items-center gap-4 px-4 py-3">
            <div
              className={`flex h-12 w-24 shrink-0 items-center justify-center border border-line px-2 ${
                partner.logoBackground === "dark" ? "bg-navy" : "bg-white"
              }`}
            >
              {partner.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={partner.logoUrl}
                  alt=""
                  className="max-h-8 w-auto max-w-full object-contain"
                />
              ) : (
                <span className="text-[10px] uppercase tracking-[0.1em] text-slate/60">No logo</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-navy">{partner.organisationName}</p>
              <p className="text-[12px] text-slate">
                {partner.category} · order {partner.displayOrder}
                {partner.active ? "" : " · hidden"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <form action={movePartnerAction}>
                <input type="hidden" name="slug" value={partner.slug} />
                <input type="hidden" name="direction" value="up" />
                <button
                  type="submit"
                  className="btn btn-outline h-7 px-2 text-[12px]"
                  disabled={index === 0}
                  aria-label={`Move ${partner.organisationName} up`}
                >
                  ↑
                </button>
              </form>
              <form action={movePartnerAction}>
                <input type="hidden" name="slug" value={partner.slug} />
                <input type="hidden" name="direction" value="down" />
                <button
                  type="submit"
                  className="btn btn-outline h-7 px-2 text-[12px]"
                  disabled={index === partners.length - 1}
                  aria-label={`Move ${partner.organisationName} down`}
                >
                  ↓
                </button>
              </form>
            </div>

            <form action={togglePartnerAction}>
              <input type="hidden" name="slug" value={partner.slug} />
              <input type="hidden" name="active" value={partner.active ? "false" : "true"} />
              <button type="submit" className="btn btn-outline h-7 px-3 text-[11px] uppercase">
                {partner.active ? "Hide" : "Show"}
              </button>
            </form>

            <EditButton href={`/admin/partners/${partner.slug}`} />

            <form action={deletePartnerAction}>
              <input type="hidden" name="slug" value={partner.slug} />
              <ConfirmSubmit>Delete</ConfirmSubmit>
            </form>
          </li>
        ))}
        {partners.length === 0 ? (
          <li className="px-4 py-6 text-sm text-slate">
            No organisations yet. Add the first one above.
          </li>
        ) : null}
      </ul>

      <p className="mt-6 text-xs leading-relaxed text-slate">
        Each logo is a trademark of its owner and is shown for identification only. Add an
        organisation only when the Society has approved it for publication.
      </p>
    </div>
  );
}
