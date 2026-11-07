import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, FileText, Info } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Reveal } from "@/components/Reveal";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Membership",
  description:
    "Who can join the CBN Staff Multipurpose Cooperative Society, the admission process, requirements, fees and membership benefits.",
  alternates: { canonical: "/membership" },
};

const eligibility = [
  "CBN active staff",
  "CBN retired staff",
  "CBN pensioners",
  "CBN staff on secondment to other institutions",
  "Coop staff",
];

const benefits = [
  "Thrift savings with an annual savings bonus declared after the AGM",
  "Access to the Society's credit facility, subject to standing and approval",
  "Participation in Coop Investment Fund series",
  "Access to home ownership and asset acquisition schemes",
  "Consumer access through the Coop E-Mall and annual exhibition",
  "A vote at the Annual General Meeting",
];

const steps = [
  {
    step: "01",
    title: "Confirm your eligibility",
    body: "Membership is open to CBN active staff, retired staff, pensioners and staff on secondment, and to Coop staff. If your category is unclear, ask the Secretariat before paying anything.",
  },
  {
    step: "02",
    title: "Complete the application",
    body: "Complete the Cooperative Membership Application form as directed by the Management Committee, and submit it with two recent passport photographs certified by your Cooperative Representative or a Management Committee member.",
  },
  {
    step: "03",
    title: "Pay the application fee",
    body: "A non-refundable application fee of ₦5,000, or the amount approved by the AGM, is payable into the Society's designated account. Attach the payment evidence to your application.",
  },
  {
    step: "04",
    title: "Submit and confirm",
    body: "Submit your application with the supporting documents. Applications are confirmed before processing, so keep the confirmation you receive.",
  },
  {
    step: "05",
    title: "Begin your contributions",
    body: "Once admitted, monthly thrift contributions apply: ₦10,000 for active members and ₦5,000 for retired members, as currently published by the Society.",
  },
];

const faqs = [
  {
    q: "Do I need to know a member to join?",
    a: "No. Membership is determined by your employment status with the CBN, not by nomination. Your application is certified by the Cooperative Representative in your branch or department, or by a Management Committee member.",
  },
  {
    q: "What does membership cost?",
    a: "A non-refundable application fee of ₦5,000 applies, or such amount as the AGM approves from time to time. Monthly thrift contributions follow admission.",
  },
  {
    q: "Can retired staff join?",
    a: "Yes. Retired CBN staff are expressly within the Society's membership, with a reduced monthly contribution.",
  },
  {
    q: "How do I get my member records?",
    a: "Existing members use the Coopman member portal for records, statements and loan status. The Secretariat can assist if you cannot sign in.",
  },
];

export default function MembershipPage() {
  return (
    <>
      <PageHero
        eyebrow="Join the Society"
        title="Who can join, and how."
        intro="CBN Coop is owned by its members. Every contribution you make funds another member's loan, and every facility you draw is funded by theirs."
        crumbs={[{ label: "Membership" }]}
        image="/images/hero/p11.jpg"
        imageAlt="A member reviewing documents at a desk"
      />

      {/* Eligibility + benefits */}
      <section className="bg-white py-14 md:py-20">
        <div className="shell grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">Eligibility</p>
            <h2 className="display mt-5 text-[1.9rem] leading-tight text-navy md:text-[2.4rem]">
              Who can join.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate">
              Membership of the Society is open to the following categories, as set out in its
              published membership rules:
            </p>

            <ul className="mt-7 space-y-3">
              {eligibility.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 border border-line bg-bone px-4 py-3.5 text-sm text-navy"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex gap-3 border-l-2 border-gold pl-4">
              <p className="text-xs leading-relaxed text-slate">
                Eligibility rules and fees can change by AGM resolution. This page reflects the
                Society's current published position. Confirm with the Secretariat before paying.
              </p>
            </div>
          </div>

          <div>
            <p className="eyebrow">Benefits</p>
            <h2 className="display mt-5 text-[1.9rem] leading-tight text-navy md:text-[2.4rem]">
              What membership gives you.
            </h2>

            <ul className="mt-7 divide-y divide-line border-y border-line">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 py-4 text-sm text-slate">
                  <span className="mt-1.5 size-1.5 shrink-0 rotate-45 bg-gold" aria-hidden />
                  {benefit}
                </li>
              ))}
            </ul>

            <a
              href={site.portals[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-gold-600"
            >
              Existing member? Sign in to Coopman
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* How to join */}
      <section className="border-y border-line bg-bone py-14 md:py-20">
        <div className="shell">
          <div className="max-w-2xl">
            <p className="eyebrow">Admission</p>
            <h2 className="display mt-5 text-[1.9rem] leading-tight text-navy md:text-[2.4rem]">
              How to join, in five steps.
            </h2>
          </div>

          <div className="mt-10 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => (
              <Reveal key={step.step} delay={index * 50} as="article">
                <div className="h-full bg-white p-6 md:p-7">
                  <span className="font-sans text-[12px] tracking-widest text-gold-600">
                    {step.step}
                  </span>
                  <h3 className="mt-4 font-serif text-lg leading-snug text-navy">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate">{step.body}</p>
                </div>
              </Reveal>
            ))}

            <div className="flex h-full flex-col justify-between bg-navy p-6 text-white md:p-7">
              <FileText className="size-5 text-gold" aria-hidden />
              <div className="mt-5">
                <h3 className="font-serif text-lg leading-snug text-white">Get the forms</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  Download the membership form pack, or collect a copy from the Secretariat.
                </p>
                <a
                  href={site.documents[1].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-gold-200 hover:text-white"
                >
                  Download forms <ArrowUpRight className="size-3.5" aria-hidden />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-center">
            <a
              href={site.registration.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Become a member
              <ArrowUpRight className="size-4" aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a
              href={site.documents[1].href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              Download the application form
            </a>
            <p className="text-xs leading-relaxed text-slate sm:ml-2 sm:max-w-xs">
              Registration is handled on the Coopman platform. Keep the confirmation you receive.
            </p>
          </div>

          <div className="mt-8 flex gap-3 border border-line bg-white p-5">
            <Info className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
            <div className="text-xs leading-relaxed text-slate">
              <p className="font-semibold text-navy">Payment details as published by the Society</p>
              <p className="mt-1">
                Account name: CBN STAFF MULTIPURPOSE COOPERATIVE · Bank: Guaranty Trust Bank (GTB) ·
                Account number: 0023723318. Pay only into the Society's designated account and keep
                your receipt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ + form */}
      <section className="bg-white py-14 md:py-20">
        <div className="shell grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">Questions</p>
            <h2 className="display mt-5 text-[1.9rem] leading-tight text-navy md:text-[2.4rem]">
              Before you apply.
            </h2>

            <div className="mt-8 divide-y divide-line border-y border-line">
              {faqs.map((faq) => (
                <details key={faq.q} className="group py-4">
                  <summary className="flex cursor-pointer items-start justify-between gap-4 text-sm font-medium text-navy marker:content-none">
                    {faq.q}
                    <span className="mt-0.5 shrink-0 text-gold-600 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate">{faq.a}</p>
                </details>
              ))}
            </div>

            <Link href="/faq" className="link-underline mt-8">
              All frequently asked questions
            </Link>
          </div>

          <div>
            <p className="eyebrow">Enquiry</p>
            <h2 className="display mt-5 text-[1.9rem] leading-tight text-navy md:text-[2.4rem]">
              Ask the Secretariat.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate">
              If you are unsure whether you qualify, send us a note with your staff category and we
              will confirm the position.
            </p>
            <div className="mt-7">
              <EnquiryForm defaultType="membership" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
