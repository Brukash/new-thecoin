import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";
import { Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Our partners",
  description:
    "Institutions the CBN Staff Multipurpose Cooperative Society works with, including its banking partners and its enterprise development partnership.",
  alternates: { canonical: "/partners" },
};

/**
 * Only marks the Society already publishes on its own website are used here.
 * No partnership is implied beyond what the Society has announced.
 */
const banks = [
  { src: "/images/partners/gtb.jpg", alt: "Guaranty Trust Bank", name: "Guaranty Trust Bank" },
  { src: "/images/partners/zenith.png", alt: "Zenith Bank", name: "Zenith Bank" },
  { src: "/images/partners/fbn.png", alt: "First Bank of Nigeria", name: "First Bank of Nigeria" },
  { src: "/images/partners/heritage.jpg", alt: "Heritage Bank", name: "Heritage Bank" },
  { src: "/images/partners/cordros.jpg", alt: "Cordros", name: "Cordros" },
];

const institutional = [
  {
    name: "Enterprise Development Centre, Pan-Atlantic University",
    role: "Enterprise development partner",
    body: "A Memorandum of Understanding was signed to strengthen the cooperative as an economic tool for national development.",
  },
  {
    name: "Pro-Serve Integrated Services Limited",
    role: "Partnership delivery",
    body: "Signatory to the same Memorandum of Understanding, supporting delivery of the enterprise development programme.",
  },
  {
    name: "Houses for Africa Nigeria Limited",
    role: "Project developer",
    body: "Project agreement for the River Park II project (terraces and blocks of flats, Abuja), partly financed through the National Housing Fund.",
  },
];

export default function PartnersPage() {
  return (
    <>
      <PageHero
        eyebrow="Institutional relationships"
        title="Institutions the Society works with."
        intro="The Society works with banks, developers and enterprise institutions. Every relationship on this page has been announced publicly by the Society."
        crumbs={[{ label: "Partners" }]}
      />

      <section className="bg-white py-14 md:py-20">
        <div className="shell">
          <div className="max-w-2xl">
            <p className="eyebrow">Banking & financial</p>
            <h2 className="display mt-5 text-[1.9rem] leading-tight text-navy md:text-[2.4rem]">
              Financial institutions.
            </h2>
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-5">
            {banks.map((bank) => (
              <li
                key={bank.src}
                className="flex h-32 flex-col items-center justify-center gap-3 bg-white px-5"
              >
                <Image
                  src={bank.src}
                  alt={bank.alt}
                  width={200}
                  height={80}
                  className="max-h-12 w-auto object-contain opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
                />
                <span className="text-center text-[10px] uppercase tracking-[0.12em] text-slate">
                  {bank.name}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-16 max-w-2xl">
            <p className="eyebrow">Institutional & delivery</p>
            <h2 className="display mt-5 text-[1.9rem] leading-tight text-navy md:text-[2.4rem]">
              Institutions and developers.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {institutional.map((partner, index) => (
              <Reveal key={partner.name} delay={index * 60} as="article">
                <div className="card h-full p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-600">
                    {partner.role}
                  </p>
                  <h3 className="mt-4 font-serif text-xl leading-snug text-navy">{partner.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate">{partner.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 flex gap-3 border border-line bg-bone p-5">
            <Info className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
            <p className="text-xs leading-relaxed text-slate">
              Partner marks are reproduced from the Society's existing website and appear here for
              identification only. No partnership beyond those announced by the Society is implied.
              The directory is updated as new relationships are approved for publication.
            </p>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="Partnership"
        title="Interested in working with the Society?"
        body="Institutions with an offer relevant to members in housing, finance, enterprise or consumer services should contact the Secretariat."
        primary={{ label: "Contact the Secretariat", href: "/contact" }}
        secondary={{ label: "About the Society", href: "/about" }}
      />
    </>
  );
}
