"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { PolicyFaq } from "@/content/credit-policy";

/** Searchable, expandable policy FAQs. Each answer lists the clauses it came from. */
export function PolicyFaqList({ items }: { items: PolicyFaq[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      [item.group, item.q, item.a].join(" ").toLowerCase().includes(term),
    );
  }, [items, query]);

  const groups = useMemo(() => {
    const list: { group: string; items: PolicyFaq[] }[] = [];
    for (const item of filtered) {
      const existing = list.find((entry) => entry.group === item.group);
      if (existing) existing.items.push(item);
      else list.push({ group: item.group, items: [item] });
    }
    return list;
  }, [filtered]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor="faq-search" className="sr-only">
          Search questions
        </label>
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate"
            aria-hidden
          />
          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the questions"
            className="h-11 w-full border border-line bg-white pl-10 pr-3 text-sm text-navy placeholder:text-slate/70"
          />
        </div>
        <p aria-live="polite" className="text-[11px] uppercase tracking-[0.1em] text-slate">
          {filtered.length} of {items.length} questions
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="mt-8 border border-line bg-bone p-6">
          <p className="text-sm text-slate">
            Nothing matches that search. Ask the Secretariat directly and we will answer in
            writing.
          </p>
          <Link href="/contact" className="link-underline mt-4 text-[11px]">
            Contact the Secretariat
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {groups.map((group) => (
            <section key={group.group}>
              <h2 className="font-serif text-2xl text-navy">{group.group}</h2>
              <div className="mt-4 divide-y divide-line border-y border-line">
                {group.items.map((item) => (
                  <details key={item.q} className="group py-5">
                    <summary className="flex cursor-pointer items-start justify-between gap-6 text-[15px] font-medium text-navy marker:content-none">
                      <span>{item.q}</span>
                      <span
                        className="mt-0.5 shrink-0 font-serif text-lg leading-none text-gold-600 transition-transform group-open:rotate-45"
                        aria-hidden
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate">{item.a}</p>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-slate/80">
                      {item.refs.join(" · ")}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
