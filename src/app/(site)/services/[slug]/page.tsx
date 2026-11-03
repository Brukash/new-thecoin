import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Info } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { EnquiryForm } from "@/components/EnquiryForm";
import { getService, services } from "@/content/services";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Service not found" };

  return {
    title: service.title,
    description: service.summary,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { title: service.title, description: service.summary },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = service.related
    .map((relatedSlug) => getService(relatedSlug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return (
    <>
      <PageHero
        eyebrow={`Service ${service.index}`}
        title={service.title}
        intro={service.summary}
        crumbs={[{ label: "Services", href: "/services" }, { label: service.shortTitle }]}
      />

      <section className="bg-white py-14 md:py-20">
        <div className="shell grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <article>
            <p className="font-serif text-xl leading-relaxed text-navy md:text-2xl">
              {service.intro}
            </p>

            <div className="prose-coop mt-10">
              {service.body.map((block) => (
                <section key={block.heading ?? block.paragraphs[0]?.slice(0, 24)}>
                  {block.heading && <h2>{block.heading}</h2>}
                  {block.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                  ))}
                  {block.bullets && (
                    <ul>
                      {block.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            {service.reviewNote && (
              <div className="mt-10 flex gap-3 border border-line bg-bone p-4">
                <Info className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
                <p className="text-xs leading-relaxed text-slate">
                  <strong className="text-navy">Note:</strong> {service.reviewNote}
                </p>
              </div>
            )}

            <div className="mt-12 border-t border-line pt-10">
              <h2 className="font-serif text-2xl text-navy">Enquire about {service.shortTitle.toLowerCase()}</h2>
              <p className="mt-2 text-sm text-slate">
                Send the Secretariat a short note and we will respond with the current terms.
              </p>
              <div className="mt-6">
                <EnquiryForm defaultType="advisory" />
              </div>
            </div>
          </article>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {service.facts && (
              <div className="border border-line bg-bone p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                  At a glance
                </p>
                <dl className="mt-4 space-y-4">
                  {service.facts.map((fact) => (
                    <div key={fact.label} className="border-b border-line pb-3 last:border-0 last:pb-0">
                      <dt className="text-[11px] uppercase tracking-[0.1em] text-slate">
                        {fact.label}
                      </dt>
                      <dd className="mt-1 font-serif text-lg text-navy">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="border border-line p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                Related services
              </p>
              <ul className="mt-4 space-y-3">
                {related.map((entry) => (
                  <li key={entry.slug}>
                    <Link
                      href={`/services/${entry.slug}`}
                      className="group flex items-center justify-between gap-2 text-sm text-slate transition-colors hover:text-navy"
                    >
                      {entry.shortTitle}
                      <ArrowUpRight className="size-3.5 text-gold-600" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-ink p-6 text-white">
              <p className="font-serif text-xl text-white">Need it in writing?</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Ask the Secretariat for the current terms, forms and eligibility rules before
                committing any funds.
              </p>
              <Link href="/contact" className="btn btn-primary mt-5 w-full">
                {service.cta.label}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
