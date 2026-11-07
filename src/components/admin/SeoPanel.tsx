"use client";

import { useEffect, useState } from "react";
import { scoreContent, type SeoInput } from "@/lib/seo/score";

/**
 * Search-listing score shown beside a record in the staff console.
 *
 * It reads the live form rather than saved values, so an editor sees the number
 * move as they type instead of after a save-and-reload. Field names are passed
 * in because the console uses different names per content type (an event keeps
 * its real title in `seoTitle` when one is set, a news article in `title`).
 */

type FieldMap = Partial<Record<keyof SeoInput, string[]>>;

/**
 * `null` means "this editor has no such field", which keeps the saved value;
 * an empty string means the field exists and is currently blank.
 */
function readField(names: string[] | undefined): string | null {
  if (!names) return null;
  let found = false;
  for (const name of names) {
    const element = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      `[name="${name}"]`,
    );
    if (!element) continue;
    found = true;
    const value = element.value.trim();
    if (value) return value;
  }
  return found ? "" : null;
}

const TONE = {
  pass: "text-emerald-700",
  warn: "text-amber-700",
  fail: "text-red-700",
} as const;

const DOT = {
  pass: "bg-emerald-600",
  warn: "bg-amber-500",
  fail: "bg-red-600",
} as const;

const GRADE_TONE = {
  Good: "border-emerald-600/30 bg-emerald-50",
  "Needs work": "border-amber-500/40 bg-amber-50",
  Poor: "border-red-500/40 bg-red-50",
} as const;

export function SeoPanel({
  fields,
  initial,
  previewHref,
  notes,
}: {
  fields: FieldMap;
  initial: SeoInput;
  previewHref?: string;
  notes?: string;
}) {
  const [input, setInput] = useState<SeoInput>(initial);

  useEffect(() => {
    const sync = () => {
      setInput((previous) => ({
        title: readField(fields.title) ?? previous.title ?? "",
        description: readField(fields.description) ?? previous.description ?? "",
        slug: readField(fields.slug) ?? previous.slug,
        image: readField(fields.image) ?? previous.image ?? "",
        imageAlt: readField(fields.imageAlt) ?? previous.imageAlt ?? "",
        body: fields.body ? (readField(fields.body) ?? previous.body ?? "") : undefined,
        hasSchema: previous.hasSchema,
        skip: previous.skip,
      }));
    };

    sync();
    document.addEventListener("input", sync);
    return () => document.removeEventListener("input", sync);
  }, [fields]);

  const report = scoreContent(input);

  return (
    <section className="mt-10 border border-line bg-white">
      <div className={`flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4 ${GRADE_TONE[report.grade]}`}>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">
            Search listing score
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="font-serif text-3xl text-navy">{report.score}</span>
            <span className="text-xs uppercase tracking-[0.12em] text-slate">/ 100 · {report.grade}</span>
          </p>
        </div>
        {previewHref ? (
          <a
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] uppercase tracking-[0.12em] text-navy underline underline-offset-4"
          >
            View page
          </a>
        ) : null}
      </div>

      <div className="h-1 w-full bg-bone">
        <div
          className="h-1 bg-navy transition-[width] duration-300"
          style={{ width: `${report.score}%` }}
          role="progressbar"
          aria-valuenow={report.score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Search listing score"
        />
      </div>

      <div className="grid gap-8 px-6 py-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">Checks</p>
          <ul className="mt-3 space-y-2.5">
            {report.checks.map((item) => (
              <li key={item.id} className="flex gap-2.5 text-[14px] leading-relaxed">
                <span
                  className={`mt-[6px] size-1.5 shrink-0 rounded-full ${DOT[item.status]}`}
                  aria-hidden
                />
                <span>
                  <span className={`font-medium ${TONE[item.status]}`}>{item.label}</span>
                  <span className="text-slate"> — {item.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">
            Recommendations
          </p>
          {report.recommendations.length === 0 ? (
            <p className="mt-3 text-[14px] leading-relaxed text-emerald-800">
              Nothing outstanding. This record is ready to publish.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-navy">
              {report.recommendations.map((item) => (
                <li key={item} className="border-l-2 border-gold pl-3">
                  {item}
                </li>
              ))}
            </ul>
          )}
          {notes ? <p className="mt-4 text-[12px] leading-relaxed text-slate">{notes}</p> : null}
        </div>
      </div>
    </section>
  );
}
