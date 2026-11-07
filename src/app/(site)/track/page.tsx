import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { EnquiryTracker } from "@/components/EnquiryTracker";

export const metadata: Metadata = {
  title: "Track an enquiry",
  description:
    "Follow the progress of an enquiry sent to the Society, read the Secretariat's replies and leave feedback.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/track" },
};

export default function TrackPage() {
  return (
    <>
      <PageHero
        eyebrow="Help centre"
        title="Track an enquiry"
        intro="Every enquiry receives a reference. Use it here to see who is handling it, what stage it has reached and any reply the Secretariat has sent."
        crumbs={[{ label: "Track an enquiry" }]}
      />

      <section className="bg-white py-12 md:py-16">
        <div className="shell">
          <EnquiryTracker />

          <div className="mt-10 border-t border-line pt-6 text-sm text-slate">
            <p>
              Lost your reference? Call 0909 679 7982 or email{" "}
              <a href="mailto:info@cbncoopng.com" className="underline underline-offset-4 hover:text-navy">
                info@cbncoopng.com
              </a>
              . Answers to common questions are in the{" "}
              <Link href="/faq" className="underline underline-offset-4 hover:text-navy">
                help centre
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <CtaBand
        title="Not sent an enquiry yet?"
        body="Membership, savings, credit, investment and project questions all start with the same form."
        primary={{ label: "Send an enquiry", href: "/contact" }}
        secondary={{ label: "Read the FAQ", href: "/faq" }}
      />
    </>
  );
}
