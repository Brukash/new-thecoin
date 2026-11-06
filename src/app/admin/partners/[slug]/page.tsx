import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/cms/auth";
import { getPartner } from "@/lib/cms/partners";
import { PARTNER_CATEGORIES } from "@/content/partners";
import { savePartnerAction } from "../../actions";

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  invalid: "Check the details. The website address must be a full https:// address.",
  upload: "The logo could not be uploaded. Use an SVG, PNG, JPG or WebP file under 2 MB.",
  save: "The change could not be saved. Check that Supabase is configured.",
};

export default async function PartnerEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; created?: string; error?: string }>;
}) {
  await requireStaff();

  const { slug } = await params;
  const partner = await getPartner(decodeURIComponent(slug));
  if (!partner) notFound();

  const query = await searchParams;

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/partners"
        className="text-[11px] uppercase tracking-[0.12em] text-slate hover:text-navy"
      >
        ← All partners
      </Link>

      <h1 className="mt-4 font-serif text-2xl text-navy">{partner.organisationName}</h1>
      <p className="mt-1 text-xs text-slate">
        {partner.active ? "Visible on the public directory." : "Hidden from the public directory."}
      </p>

      {query.created ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">
          Organisation added. Upload a logo and publish it when the details are correct.
        </p>
      ) : null}
      {query.saved ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">Saved.</p>
      ) : null}
      {query.error ? (
        <p className="mt-5 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors[query.error] ?? "That could not be completed."}
        </p>
      ) : null}

      <form action={savePartnerAction} className="mt-8 space-y-6 bg-white p-6 ring-1 ring-line">
        <input type="hidden" name="slug" value={partner.slug} />
        <input type="hidden" name="logoUrl" value={partner.logoUrl} />

        <div>
          <label htmlFor="organisationName" className="field-label">
            Organisation name
          </label>
          <input
            id="organisationName"
            name="organisationName"
            defaultValue={partner.organisationName}
            className="field mt-2"
            required
          />
        </div>

        <div>
          <label htmlFor="websiteUrl" className="field-label">
            Website
          </label>
          <input
            id="websiteUrl"
            name="websiteUrl"
            type="url"
            placeholder="https://"
            defaultValue={partner.websiteUrl}
            className="field mt-2"
          />
          <p className="mt-1 text-[11px] text-slate">
            The logo links to this address on the public page.
          </p>
        </div>

        <div>
          <label htmlFor="description" className="field-label">
            Short description
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={partner.description}
            className="field mt-2"
          />
          <p className="mt-1 text-[11px] text-slate">
            Shown to screen readers and in the page metadata. Keep it factual.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="field-label">
              Category
            </label>
            <input
              id="category"
              name="category"
              list="partner-categories"
              defaultValue={partner.category}
              className="field mt-2"
            />
            <datalist id="partner-categories">
              {PARTNER_CATEGORIES.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="displayOrder" className="field-label">
              Display order
            </label>
            <input
              id="displayOrder"
              name="displayOrder"
              type="number"
              min={0}
              max={999}
              step={10}
              defaultValue={partner.displayOrder}
              className="field mt-2"
            />
          </div>
        </div>

        <div className="border-t border-line pt-5">
          <p className="field-label">Logo</p>
          <div className="mt-3 flex items-center gap-4">
            <div
              className={`flex h-16 w-32 items-center justify-center border border-line px-3 ${
                partner.logoBackground === "dark" ? "bg-navy" : "bg-white"
              }`}
            >
              {partner.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={partner.logoUrl}
                  alt={`${partner.organisationName} logo`}
                  className="max-h-10 w-auto max-w-full object-contain"
                />
              ) : (
                <span className="text-[10px] uppercase tracking-[0.1em] text-slate/60">
                  No logo
                </span>
              )}
            </div>
            <div className="text-[11px] leading-relaxed text-slate">
              {partner.logoUrl ? (
                <p className="break-all">{partner.logoUrl}</p>
              ) : (
                <p>
                  The public directory shows the organisation name in place of a logo until one is
                  uploaded.
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="logo" className="field-label">
              Replace logo
            </label>
            <input
              id="logo"
              name="logo"
              type="file"
              accept="image/svg+xml,image/png,image/jpeg,image/webp"
              className="field mt-2 py-2 text-sm"
            />
            <p className="mt-1 text-[11px] text-slate">
              SVG or transparent PNG preferred. Stored in the Supabase partner-logos bucket.
            </p>
          </div>

          {partner.logoUrl ? (
            <label className="mt-3 flex items-center gap-2 text-xs text-slate">
              <input type="checkbox" name="removeLogo" className="size-4" />
              Remove this logo and show the name placeholder instead
            </label>
          ) : null}
        </div>

        <label className="flex items-center gap-3 border-t border-line pt-5 text-sm text-navy">
          <input
            type="checkbox"
            name="active"
            defaultChecked={partner.active}
            className="size-4"
          />
          Show on the public partners directory
        </label>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-primary h-10 px-6">
            Save
          </button>
          <Link href="/admin/partners" className="text-xs text-slate hover:text-navy">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
