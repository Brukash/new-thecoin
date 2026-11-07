"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

type MappedProject = {
  slug: string;
  name: string;
  city: string;
  state: string;
  status: string;
  query: string;
};

/**
 * Map + list. The embed is a plain map search for the recorded place, so no API
 * key is needed and no coordinates are invented — the map shows the city or
 * state the Secretariat entered.
 */
export function ProjectMap({ projects }: { projects: MappedProject[] }) {
  const [active, setActive] = useState(projects[0]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">
          {projects.length} {projects.length === 1 ? "location" : "locations"}
        </p>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {projects.map((project) => {
            const selected = project.slug === active.slug;
            return (
              <li key={project.slug}>
                <button
                  type="button"
                  onClick={() => setActive(project)}
                  aria-pressed={selected}
                  className={`flex w-full items-start gap-3 px-3 py-4 text-left transition-colors ${
                    selected ? "bg-bone" : "hover:bg-bone/60"
                  }`}
                >
                  <MapPin
                    className={`mt-0.5 size-4 shrink-0 ${selected ? "text-gold-600" : "text-slate"}`}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-[15px] text-navy">{project.name}</span>
                    <span className="mt-0.5 block text-[12px] uppercase tracking-[0.1em] text-slate">
                      {[project.city, project.state].filter(Boolean).join(", ") || project.query}
                    </span>
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.1em] text-slate">{project.status}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <Link
          href={`/projects/${active.slug}`}
          className="mt-4 inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.12em] text-navy underline underline-offset-4"
        >
          {active.name} details
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>

      <div>
        <div className="relative aspect-[4/3] w-full overflow-hidden border border-line bg-bone">
          <iframe
            key={active.slug}
            title={`Map of ${active.name} — ${active.query}`}
            src={`https://www.google.com/maps?q=${encodeURIComponent(active.query)}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 size-full border-0"
          />
        </div>
        <p className="mt-3 text-[12px] text-slate">
          Showing <span className="text-navy">{active.query}</span>. Browsing this map sends your
          request to Google.
        </p>
      </div>
    </div>
  );
}
