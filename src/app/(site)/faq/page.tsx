import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "Answers to common questions about membership, savings, loans, investment series, property subscriptions and the member portal.",
  alternates: { canonical: "/faq" },
};

const groups = [
  {
    title: "Membership",
    items: [
      {
        q: "Who is eligible to join?",
        a: "Membership is open to CBN staff, retired staff of the CBN, and CBN staff on secondment to other institutions.",
      },
      {
        q: "How do I apply?",
        a: "Complete the Cooperative Membership Application form as directed by the Management Committee and submit it with two recent passport photographs certified by the Cooperative Representative in your branch or department, a Pensioners Representative, or a Management Committee member.",
      },
      {
        q: "What is the application fee?",
        a: "A non-refundable application fee of ₦5,000 applies, or such amount as the AGM may approve from time to time, payable into the Society's designated account with evidence attached to your application.",
      },
      {
        q: "What are the monthly contributions?",
        a: "As currently published by the Society, active members contribute ₦10,000 monthly and retired members ₦5,000 monthly.",
      },
    ],
  },
  {
    title: "Savings and credit",
    items: [
      {
        q: "Do savings earn a bonus?",
        a: "Yes. Thrift savings qualify the member for the annual savings bonus payable after every Annual General Meeting.",
      },
      {
        q: "If I take a loan in January, how is the deduction calculated?",
        a: "If you take a loan in January, the total loan amount is assessed in January of the preceding year's basis, and the same approach applies for other months. The Secretariat will confirm the schedule applicable to your facility before it is drawn.",
      },
      {
        q: "Can I take a second loan while I have an outstanding one?",
        a: "The Society's systems will not permit a further loan while a facility is outstanding unless a waiver is granted.",
      },
      {
        q: "How is the amount I can borrow decided?",
        a: "Capacity to repay is estimated by the Society from your contribution history and standing, against the lending rules in force. Current interest, tenor and security requirements are confirmed in writing at application.",
      },
    ],
  },
  {
    title: "Investment",
    items: [
      {
        q: "How long does the Coop Investment Fund run?",
        a: "The fund runs for an initial four years, after which it can be continued or discontinued. Series are opened and closed on published dates.",
      },
      {
        q: "How often are interest payments made?",
        a: "Payout frequency is agreed per investor and may be monthly, quarterly, half-yearly, yearly or up-front.",
      },
      {
        q: "What happened to the earlier series?",
        a: "Series D marked its fourth anniversary on 31 January 2024, closing the series. The Classic Diamond Series (2024–2028) was created for investors in the closed series.",
      },
    ],
  },
  {
    title: "Property and projects",
    items: [
      {
        q: "Where are the Society's projects?",
        a: "Projects are located in Asaba, Kaduna, Okota (Lagos) and across Abuja: Katampe, Jikwoyi, Asokoro and Guzape. See the projects section for each location.",
      },
      {
        q: "Why are prices not listed?",
        a: "Project prices, unit availability and payment plans change over the life of a project. The Society confirms them in writing on enquiry so that no member relies on an out-of-date figure.",
      },
      {
        q: "Can the National Housing Fund be used?",
        a: "Several of the Society's housing projects include access to the National Housing Fund through facilitation by the developer, as contained in the project agreements. Confirm the position for your specific project with the Secretariat.",
      },
    ],
  },
  {
    title: "Digital services",
    items: [
      {
        q: "Where do I see my records?",
        a: "The Coopman member portal holds member records, statements and loan status. This public website does not display any private member or financial information.",
      },
      {
        q: "Is shopping handled on this website?",
        a: "No. Shopping is handled on the Coop E-Mall, which is a separate platform. This website links to it.",
      },
      {
        q: "How do I receive announcements?",
        a: "Notices are circulated to members directly and published on the news page. You can also subscribe to the monthly summary from the footer of any page.",
      },
    ],
  },
];

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

export default function FaqPage() {
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
              Figures quoted here reflect the Society's current published position. Membership fees,
              contributions and product terms may be varied by resolution of the Annual General
              Meeting; where that happens, the latest notice from the Secretariat prevails. Write to{" "}
              <a
                href={`mailto:${site.contact.emails[0].value}`}
                className="text-gold-600 underline underline-offset-2"
              >
                {site.contact.emails[0].value}
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
