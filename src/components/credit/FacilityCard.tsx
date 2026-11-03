"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Facility } from "@/content/credit-policy";

/** A single facility summary. Used by the overview, the loan index and search. */
export function FacilityCard({ facility }: { facility: Facility }) {
  return (
    <Link
      href={`/services/credit/loans/${facility.slug}`}
      className="group flex h-full flex-col border border-line bg-white p-6 transition-colors hover:border-gold/60 hover:bg-bone md:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">
          {facility.kind}
        </p>
        <ArrowUpRight
          className="size-4 shrink-0 text-slate/40 transition-colors group-hover:text-gold-600"
          aria-hidden
        />
      </div>

      <h3 className="mt-3 font-serif text-xl leading-snug text-navy">{facility.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate">{facility.summary}</p>

      <dl className="mt-5 space-y-2 border-t border-line pt-4 text-xs">
        <div className="flex gap-3">
          <dt className="w-16 shrink-0 uppercase tracking-[0.08em] text-slate">Amount</dt>
          <dd className="text-navy">{facility.amountBasis}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-16 shrink-0 uppercase tracking-[0.08em] text-slate">Tenor</dt>
          <dd className="text-navy">{facility.tenor}</dd>
        </div>
      </dl>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.08em] text-slate">
        {facility.ref}
      </p>
    </Link>
  );
}
