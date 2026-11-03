"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FacilityCard } from "@/components/credit/FacilityCard";
import type { Facility } from "@/content/credit-policy";

/** Client-side search over the facilities, so members can find a facility by name or purpose. */
export function PolicySearch({ facilities }: { facilities: Facility[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return facilities;

    return facilities.filter((facility) =>
      [facility.name, facility.kind, facility.summary, facility.amountBasis, facility.tenor]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [facilities, query]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor="facility-search" className="sr-only">
          Search loan types
        </label>
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate"
            aria-hidden
          />
          <input
            id="facility-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search loans, for example project or savings"
            className="h-11 w-full border border-line bg-white pl-10 pr-3 text-sm text-navy placeholder:text-slate/70"
          />
        </div>
        <p aria-live="polite" className="text-[11px] uppercase tracking-[0.1em] text-slate">
          {results.length} of {facilities.length} facilities
        </p>
      </div>

      {results.length > 0 ? (
        <ul className="mt-8 grid gap-px bg-line md:grid-cols-2">
          {results.map((facility) => (
            <li key={facility.slug} className="bg-white">
              <FacilityCard facility={facility} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 border border-line bg-bone p-6 text-sm text-slate">
          No facility matches that search. Clear the box to see every loan type, or ask the
          Secretariat which facility fits your purpose.
        </p>
      )}
    </div>
  );
}
