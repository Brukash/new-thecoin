import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireStaff } from "@/lib/cms/auth";
import { readPolicyStore } from "@/lib/credit-admin";
import { saveFacilityDetails } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminFacilityPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireStaff();

  const { slug } = await params;
  const { saved } = await searchParams;
  const store = readPolicyStore();
  const facility = store.facilities.find((entry) => entry.slug === slug);
  if (!facility) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/credit"
        className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.12em] text-slate hover:text-navy"
      >
        <ArrowLeft className="size-3.5" aria-hidden /> Credit policy
      </Link>

      <h1 className="mt-4 font-serif text-2xl text-navy">{facility.name}</h1>
      <p className="mt-1 text-xs text-slate">
        {facility.ref} · {facility.slug}
      </p>

      {saved && (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">
          Facility saved. The policy is now awaiting approval before the change becomes public.
        </p>
      )}

      <form
        action={saveFacilityDetails}
        className="mt-6 space-y-6 bg-white p-6 ring-1 ring-line"
      >
        <input type="hidden" name="slug" value={facility.slug} />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="field-label">
              Name
            </label>
            <input id="name" name="name" defaultValue={facility.name} className="field mt-2" required />
          </div>
          <div>
            <label htmlFor="kind" className="field-label">
              Kind
            </label>
            <input id="kind" name="kind" defaultValue={facility.kind} className="field mt-2" />
          </div>
          <div>
            <label htmlFor="clause" className="field-label">
              Clause
            </label>
            <input
              id="clause"
              name="clause"
              defaultValue={facility.clause}
              className="field mt-2 font-sans text-sm"
            />
          </div>
          <div>
            <label htmlFor="ref" className="field-label">
              Source reference (clause and page)
            </label>
            <input
              id="ref"
              name="ref"
              defaultValue={facility.ref}
              className="field mt-2 font-sans text-xs"
            />
          </div>
        </div>

        <div>
          <label htmlFor="summary" className="field-label">
            Summary (one line)
          </label>
          <input id="summary" name="summary" defaultValue={facility.summary} className="field mt-2" />
        </div>

        <div>
          <label htmlFor="description" className="field-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={facility.description}
            className="field mt-2"
          />
        </div>

        <div>
          <label htmlFor="eligibility" className="field-label">
            Eligibility (one point per line)
          </label>
          <textarea
            id="eligibility"
            name="eligibility"
            rows={4}
            defaultValue={facility.eligibility.join("\n")}
            className="field mt-2"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="amountBasis" className="field-label">
              Amount
            </label>
            <textarea
              id="amountBasis"
              name="amountBasis"
              rows={3}
              defaultValue={facility.amountBasis}
              className="field mt-2"
            />
          </div>
          <div>
            <label htmlFor="tenor" className="field-label">
              Tenor
            </label>
            <textarea id="tenor" name="tenor" rows={3} defaultValue={facility.tenor} className="field mt-2" />
          </div>
          <div>
            <label htmlFor="interest" className="field-label">
              Interest
            </label>
            <textarea
              id="interest"
              name="interest"
              rows={3}
              defaultValue={facility.interest}
              className="field mt-2"
            />
          </div>
          <div>
            <label htmlFor="security" className="field-label">
              Security
            </label>
            <textarea
              id="security"
              name="security"
              rows={3}
              defaultValue={facility.security}
              className="field mt-2"
            />
          </div>
          <div>
            <label htmlFor="guarantor" className="field-label">
              Guarantor
            </label>
            <textarea
              id="guarantor"
              name="guarantor"
              rows={2}
              defaultValue={facility.guarantor}
              className="field mt-2"
            />
          </div>
          <div>
            <label htmlFor="approval" className="field-label">
              Approval authority
            </label>
            <textarea
              id="approval"
              name="approval"
              rows={2}
              defaultValue={facility.approval}
              className="field mt-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="conditions" className="field-label">
            Conditions (one per line)
          </label>
          <textarea
            id="conditions"
            name="conditions"
            rows={4}
            defaultValue={facility.conditions.join("\n")}
            className="field mt-2"
          />
        </div>

        <p className="border-t border-line pt-4 text-xs leading-relaxed text-slate">
          Do not change a rate, limit, percentage or repayment period unless the signed policy or a
          Management Committee resolution states the new figure. Add the source reference for any
          change.
        </p>

        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary">
            Save facility
          </button>
          <Link href="/admin/credit" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
