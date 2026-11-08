import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Project } from "@/lib/content";

/**
 * Project card. When the Society has not yet released approved photography for
 * a project, an intentional navy placeholder is shown rather than a stock image
 * of an unrelated building.
 */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group card card-hover flex h-full flex-col">
      <Link
        href={`/projects/${project.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-navy"
      >
        {project.image && project.imageBadge ? (
          <span className="absolute left-3 top-3 z-10 border border-white/25 bg-ink/80 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/85">
            {project.imageBadge}
          </span>
        ) : null}
        {project.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.image}
            alt={project.imageAlt ?? ""}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="relative flex size-full flex-col justify-between p-5">
            <div
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  "linear-gradient(140deg, #08101f 0%, #102541 55%, #102541 100%)",
              }}
              aria-hidden
            />
            <svg
              className="absolute inset-0 size-full text-gold/25"
              viewBox="0 0 400 300"
              fill="none"
              aria-hidden
            >
              <path d="M0 250 L110 190 L200 225 L300 165 L400 205" stroke="currentColor" strokeWidth="1" />
              <path d="M0 270 L110 215 L200 245 L300 190 L400 228" stroke="currentColor" strokeWidth="1" opacity="0.55" />
              <path d="M120 205 V120 H190 V205" stroke="currentColor" strokeWidth="1.2" />
              <path d="M210 205 V95 H285 V205" stroke="currentColor" strokeWidth="1.2" />
              <path d="M120 140 H190 M210 118 H285" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            </svg>
            <div className="relative flex items-start justify-between">
              <span className="border border-gold/30 px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-gold-200">
                {project.type}
              </span>
            </div>
            <div className="relative">
              <p className="font-serif text-lg leading-snug text-white/90">{project.city}</p>
              <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-white/45">
                Photography pending release
              </p>
            </div>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <p className="flex items-center gap-1.5 text-[12px] uppercase tracking-[0.14em] text-slate">
          <MapPin className="size-3 text-gold-600" aria-hidden />
          {project.location}
        </p>

        <h3 className="mt-3 font-serif text-xl leading-snug text-navy">
          <Link href={`/projects/${project.slug}`} className="transition-colors hover:text-gold-600">
            {project.name}
          </Link>
        </h3>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate">{project.summary}</p>

        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-gold-600">
            {project.status}
          </span>
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-navy"
          >
            View <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
