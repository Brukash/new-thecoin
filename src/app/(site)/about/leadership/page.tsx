import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";
import { leadership } from "@/content/site";
import { Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Management Committee",
  description:
    "The elected Management Committee of the CBN Staff Multipurpose Cooperative Society Ltd, with the office held by each member.",
  alternates: { canonical: "/about/leadership" },
};

export default function LeadershipPage() {
  return (
    <>
      <PageHero
        eyebrow="Governance"
        title="The Management Committee."
        intro="The Society is administered by a Management Committee drawn from the membership. Names and offices below are as published by the Society."
        crumbs={[{ label: "About", href: "/about" }, { label: "Leadership" }]}
      />

      <section className="bg-white py-14 md:py-20">
        <div className="shell">
          <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {leadership.map((officer, index) => (
              <Reveal key={officer.name} delay={index * 35} as="article">
                <div className="h-full bg-white p-6">
                  {officer.photo ? (
                    <Image
                      src={officer.photo}
                      alt={`${officer.name}, ${officer.role}`}
                      width={400}
                      height={400}
                      sizes="160px"
                      className="size-40 object-cover object-top"
                    />
                  ) : (
                    <div className="flex size-40 items-center justify-center bg-bone font-serif text-3xl text-gold-600">
                      {officer.name
                        .split(" ")
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")}
                    </div>
                  )}
                  <h2 className="mt-5 font-serif text-lg leading-snug text-navy">{officer.name}</h2>
                  <p className="mt-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-gold-600">
                    {officer.role}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 flex gap-3 border border-line bg-bone p-4">
            <Info className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
            <p className="text-xs leading-relaxed text-slate">
              Committee composition and tenure are governed by the Society's Bye-Laws. Where an
              office changes, the Society updates this register; members should rely on the current
              notice circulated by the Secretariat.
            </p>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="Governance"
        title="See how the offices fit together."
        body="The organisational structure page sets out the relationship between the Annual General Meeting, the Management Committee and the Secretariat."
        primary={{ label: "Organisational structure", href: "/about/structure" }}
        secondary={{ label: "Read the Bye-Laws", href: "/faq" }}
      />
    </>
  );
}
