/**
 * Credit section navigation. Kept in its own module so client components
 * (the section tab bar) can import it without pulling in the file system.
 */
export const creditNav = [
  { label: "Overview", href: "/services/credit" },
  { label: "Types of loans", href: "/services/credit/loans" },
  { label: "Eligibility", href: "/services/credit/eligibility" },
  { label: "Repayment", href: "/services/credit/repayment" },
  { label: "Global limits", href: "/services/credit/limits" },
  { label: "FAQs", href: "/services/credit/faq" },
] as const;
