import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, CheckCircle2, MapPin } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { EnquiryForm } from "@/components/EnquiryForm";
import { findProject, listProjects } from "@/content/queries";
import { shareImages, shareImageUrl } from "@/lib/seo/metadata";
import { site } from "@/content/site";

// Projects render on demand so newly published entries do not need a rebuild.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await findProject(slug);
  if (!project) return { title: "Project not found" };

  // A project can be published before its overview is written. Rather than ship
  // an empty description, fall back to what the record does contain — its type
  // and its location — and let the console flag the missing summary.
  const place = [project.city, project.state].filter(Boolean).join(", ");
  const kind = project.type ? `${project.type} project` : "Project";
  const description =
    project.summary ||
    project.description.join(" ").slice(0, 160).trim() ||
    `${project.name} — ${kind}${place ? ` in ${place}` : ""}. A project of ${site.legalName}.`;

  return {
    title: project.name,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: project.name,
      description,
      images: shareImages(project.image),
    },
    twitter: {
      card: "summary_large_image",
      title: project.name,
      description,
      images: [shareImageUrl(project.image)],
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await findProject(slug);
  if (!project) notFound();

  const others = (await listProjects())
    .filter((entry) => entry.slug !== project.slug)
    .slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={project.type}
        title={project.name}
        intro={project.summary}
        crumbs={[{ label: "Projects", href: "/projects" }, { label: project.city }]}
      />

      <section className="bg-white py-14 md:py-20">
        <div className="shell grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div>
            <figure>
            <div className="relative aspect-[4/3] overflow-hidden border border-line bg-navy sm:aspect-[16/9]">
              {project.image ? (
                <Image
                  src={project.image}
                  alt={project.imageAlt ?? project.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 62vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-3 text-center">
                  <div className="hairline-grid absolute inset-0 opacity-40" aria-hidden />
                  <MapPin className="relative size-6 text-gold" aria-hidden />
                  <p className="relative font-serif text-xl text-white">{project.location}</p>
                  <p className="relative max-w-xs text-[12px] uppercase tracking-[0.16em] text-white/45">
                    Approved project photography will be published when released
                  </p>
                </div>
              )}
            </div>
            {project.imageNote ? (
              <figcaption className="mt-3 flex flex-wrap items-start gap-x-3 gap-y-1 text-[12px] leading-relaxed text-slate">
                {project.imageBadge ? (
                  <span className="border border-line px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-gold-600">
                    {project.imageBadge}
                  </span>
                ) : null}
                <span className="min-w-0 flex-1">{project.imageNote}</span>
              </figcaption>
            ) : null}
            </figure>

            <div className="prose-coop mt-10">
              <h2>Project overview</h2>
              {project.description.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}

              <h3>Infrastructure & delivery</h3>
              <p>
                The project is delivered by an appointed developer under a project agreement with the
                Society. Infrastructure scope, completion stage and handover arrangements are set out
                in that agreement and confirmed to subscribers in writing.
              </p>

              <h3>Subscription</h3>
              <p>
                Subscription is by enquiry. The Secretariat provides the current payment plan,
                applicable fees and the documentation required before any payment is accepted. The
                Society does not publish project prices on this website because they change over the
                life of a project.
              </p>
            </div>

            <div className="mt-10 border border-line bg-bone p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                Before you commit
              </p>
              <ul className="mt-3 space-y-2.5">
                {[
                  "Confirm the unit type, price and payment schedule in writing.",
                  "Ask for the title documentation position for the specific plot.",
                  "Confirm whether National Housing Fund access applies to this project.",
                  "Pay only into the Society's designated account and keep the receipt.",
                ].map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-slate">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="border border-line p-6">
              <dl className="space-y-4">
                {[
                  { label: "Location", value: project.location },
                  { label: "Project type", value: project.type },
                  { label: "Availability", value: project.status },
                  { label: "Scheme", value: "Home ownership & asset acquisition" },
                ].map((row) => (
                  <div key={row.label} className="border-b border-line pb-3 last:border-0 last:pb-0">
                    <dt className="text-[12px] uppercase tracking-[0.1em] text-slate">{row.label}</dt>
                    <dd className="mt-1 text-sm font-medium text-navy">{row.value}</dd>
                  </div>
                ))}
              </dl>

              <Link href="/contact" className="btn btn-ink mt-6 w-full">
                Enquire about this project
              </Link>
            </div>

            <div className="border border-line p-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                Other projects
              </p>
              <ul className="mt-4 space-y-3">
                {others.map((entry) => (
                  <li key={entry.slug}>
                    <Link
                      href={`/projects/${entry.slug}`}
                      className="group flex items-center justify-between gap-2 text-sm text-slate transition-colors hover:text-navy"
                    >
                      {entry.name}
                      <ArrowUpRight className="size-3.5 text-gold-600" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <div className="shell mt-16 max-w-3xl">
          <div className="border-t border-line pt-10">
            <h2 className="font-serif text-2xl text-navy">Enquire about {project.city}</h2>
            <p className="mt-2 text-sm text-slate">
              The Secretariat will respond with the current schedule and requirements.
            </p>
            <div className="mt-6">
              <EnquiryForm defaultType="property" />
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
