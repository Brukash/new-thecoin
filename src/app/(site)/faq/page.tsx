import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { getContactSettings, getFaqGroups } from "@/content/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "Answers to common questions about membership, savings, loans, investment series, property subscriptions and the member portal.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const [groups, settings] = await Promise.all([getFaqGroups(), getContactSettings()]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((group) =>
      group.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    ),
  };

  return (
    <>
      <PageHero
        eyebrow="Help centre"
        title="Frequently asked questions."
        intro="The questions members ask most often about joining, saving, borrowing, investing and buying into a project."
        crumbs={[{ label: "FAQ" }]}
      />

      <section className="bg-white py-14 md:py-20">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <nav aria-label="FAQ sections" className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">
              On this page
            </p>
            <ul className="mt-4 space-y-2.5 border-l border-line">
              {groups.map((group) => (
                <li key={group.title}>
                  <a
                    href={`#${group.title.toLowerCase().replace(/\s+/g, "-")}`}
                    className="block border-l-2 border-transparent pl-4 text-sm text-slate transition-colors hover:border-gold hover:text-navy"
                  >
                    {group.title}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-8 border border-line bg-bone p-5">
              <p className="text-sm font-semibold text-navy">Still stuck?</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate">
                The Secretariat answers specific questions directly.
              </p>
              <Link href="/contact" className="link-underline mt-4 text-[11px]">
                Contact us
              </Link>
            </div>
          </nav>

          <div className="space-y-12">
            {groups.map((group) => (
              <section
                key={group.title}
                id={group.title.toLowerCase().replace(/\s+/g, "-")}
                className="scroll-mt-32"
              >
                <h2 className="font-serif text-2xl text-navy md:text-[1.75rem]">{group.title}</h2>
                <div className="mt-5 divide-y divide-line border-y border-line">
                  {group.items.map((item) => (
                    <details key={item.q} className="group py-5">
                      <summary className="flex cursor-pointer items-start justify-between gap-6 text-[15px] font-medium text-navy marker:content-none">
                        {item.q}
                        <span className="mt-0.5 shrink-0 font-serif text-lg leading-none text-gold-600 transition-transform group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}

            <p className="text-xs leading-relaxed text-slate">
              Figures quoted here reflect the Society&apos;s current published position. Membership
              fees, contributions and product terms may be varied by resolution of the Annual
              General Meeting; where that happens, the latest notice from the Secretariat prevails.
              Write to{" "}
              <a
                href={`mailto:${settings.contact.emails[0]?.value ?? ""}`}
                className="text-gold-600 underline underline-offset-2"
              >
                {settings.contact.emails[0]?.value}
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <CtaBand
        eyebrow="Membership"
        title="Ready to join the Society?"
        body="Check your eligibility and send an enquiry. The Secretariat will confirm the rest."
        primary={{ label: "Membership details", href: "/membership" }}
        secondary={{ label: "Contact the Secretariat", href: "/contact" }}
      />
    </>
  );
}
