import type { Metadata } from "next";
import { Info } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { PolicyBanner } from "@/components/credit/PolicyBanner";
import { CreditNav } from "@/components/credit/CreditNav";
import { PolicySearch } from "@/components/credit/PolicySearch";
import { PolicyDownload } from "@/components/credit/PolicyDownload";
import { getCreditPolicy, policyRobots } from "@/content/credit-policy";

export const metadata: Metadata = {
  title: "Types of loans",
  description:
    "The nine credit facilities in the 2026 Credit Policy: special withdrawal, normal, special, quick credit, investment, project, end of service, agricultural and inter-cooperative loans.",
  alternates: { canonical: "/services/credit/loans" },
  robots: policyRobots(),
};

export default function LoanTypesPage() {
  const policy = getCreditPolicy();

  return (
    <>
      <PageHero
        eyebrow="Credit and loans"
        title="Types of loans."
        intro="Each facility has its own purpose, ceiling, tenor and security. Search the list, then read the facility page for the exact terms and the clause they come from."
        crumbs={[
          { label: "Services", href: "/services" },
          { label: "Credit and loans", href: "/services/credit" },
          { label: "Types of loans" },
        ]}
      />

      <PolicyBanner version={policy.version} />
      <CreditNav />

      <section className="bg-white py-14 md:py-20">
        <div className="shell">
          <PolicySearch facilities={policy.facilities} />

          <div className="mt-10 flex gap-3 border border-line bg-bone p-4">
            <Info className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
            <p className="text-xs leading-relaxed text-slate">
              <strong className="text-navy">About interest rates.</strong> The policy does not set
              one rate for every facility. Rates are recommended by the Investment Committee,
              approved by the Management Committee and published annually, with a flat charge of 2%
              every month stated for Quick Credit. The rate that applies to your request is confirmed
              in writing before you sign.{" "}
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-slate/80">
                Cl. 4.4.1 to 4.4.3; Cl. 2.4.2
              </span>
            </p>
          </div>

          <div className="mt-10">
            <PolicyDownload version={policy.version} />
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="Guidance"
        title="Not sure which facility fits?"
        body="Describe what the money is for and the Secretariat will point you to the right facility and its conditions."
        primary={{ label: "Contact the Secretariat", href: "/contact" }}
        secondary={{ label: "Check your eligibility", href: "/services/credit/eligibility" }}
      />
    </>
  );
}
