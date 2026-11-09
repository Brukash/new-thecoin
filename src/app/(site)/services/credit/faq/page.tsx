import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { PolicyBanner } from "@/components/credit/PolicyBanner";
import { CreditNav } from "@/components/credit/CreditNav";
import { PolicyFaqList } from "@/components/credit/PolicyFaqList";
import { getCreditPolicy, policyRobots } from "@/content/credit-policy";
import { jsonLdScript } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: "Credit and loan FAQs",
  description:
    "Answers to the questions members ask about borrowing from the Society, drawn from the 2026 Credit Policy with the clause reference for each answer.",
  alternates: { canonical: "/services/credit/faq" },
  robots: policyRobots(),
};

export default function CreditFaqPage() {
  const policy = getCreditPolicy();

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: policy.faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <PageHero
        eyebrow="Credit and loans"
        title="Credit questions, answered."
        intro="Every answer below is drawn from the Credit Policy, and the clause it comes from is printed underneath. Where the policy is silent, the answer says so."
        crumbs={[
          { label: "Services", href: "/services" },
          { label: "Credit and loans", href: "/services/credit" },
          { label: "FAQs" },
        ]}
      />

      <PolicyBanner version={policy.version} />
      <CreditNav />

      <section className="bg-white py-14 md:py-20">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_2.2fr] lg:gap-16">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">Remember</p>
            <p className="mt-4 text-sm leading-relaxed text-slate">
              A loan is a commitment against future pay. Read the facility page and the policy
              before you apply, and ask the Secretariat to confirm the rate, tenor and deduction that
              apply to you.
            </p>
            <div className="mt-6 border border-line bg-bone p-5">
              <p className="text-sm font-semibold text-navy">Policy extracts only</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate">
                These pages are an extract of an internal policy, not a substitute for it. The
                signed PDF is the authoritative text.
              </p>
              <Link href={policy.version.sourceFile} className="link-underline mt-4 text-[12px]">
                Read the PDF
              </Link>
            </div>
          </aside>

          <div>
            <PolicyFaqList items={policy.faqs} />

            <p className="mt-10 border-t border-line pt-6 text-xs leading-relaxed text-slate">
              If an answer here does not match a document the Society has given you, the document
              prevails. Write to{" "}
              <Link href="/contact" className="text-gold-600 underline underline-offset-2">
                the Secretariat
              </Link>{" "}
              and we will correct the page.
            </p>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(schema) }}
      />

      <CtaBand
        eyebrow="Still unsure?"
        title="Ask a specific question."
        body="The Secretariat answers questions about limits, guarantors and repayment in writing."
        primary={{ label: "Contact the Secretariat", href: "/contact" }}
        secondary={{ label: "See the limits", href: "/services/credit/limits" }}
      />
    </>
  );
}
