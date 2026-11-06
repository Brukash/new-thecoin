/**
 * Published rate schedule.
 *
 * Source: "Notification of Review of Investment Bond and Lending Rates",
 * CBN Staff Multipurpose Cooperative Society Ltd, approved by the Management
 * Committee on 24 September 2026, effective 1 October 2026.
 *
 * Every figure is reproduced as printed in that notice. Nothing is
 * annualised, averaged or derived, and where the notice shows a rate as
 * unchanged it is marked rather than recalculated.
 */

export type RateRow = {
  /** Term or product exactly as named in the notice. */
  label: string;
  /** Rate in force before 1 October 2026. */
  previous: string;
  /** Rate in force from 1 October 2026. */
  current: string;
  /** Set where the notice shows the same rate on both sides. */
  unchanged?: boolean;
  /** Terms the Credit Policy attaches to the product, shown under the label. */
  note?: string;
};

export type RatePlan = {
  name: string;
  rows: RateRow[];
};

export const rateNotice = {
  title: "Notification of Review of Investment Bond and Lending Rates",
  approvedOn: "24 September 2026",
  effectiveFrom: "1 October 2026",
  reason: "a reduction in the Monetary Policy Rate and Nigerian Treasury Bill yields",
} as const;

export const bondPlans: RatePlan[] = [
  {
    name: "4-year plan",
    rows: [
      { label: "Monthly", previous: "18.25%", current: "17.25%" },
      { label: "Quarterly", previous: "18.50%", current: "17.50%" },
      { label: "Half yearly", previous: "18.75%", current: "17.75%" },
      { label: "Upfront", previous: "18.00%", current: "17.00%" },
      { label: "Backend", previous: "19.00%", current: "18.00%" },
    ],
  },
  {
    name: "2-year plan",
    rows: [
      { label: "Monthly", previous: "17.25%", current: "16.25%" },
      { label: "Upfront", previous: "17.00%", current: "16.00%" },
      { label: "Backend", previous: "18.00%", current: "17.00%" },
    ],
  },
  {
    name: "1-year plan (Tripple plan)",
    rows: [
      { label: "Quarterly (91 days)", previous: "15.00%", current: "14.00%" },
      { label: "Semi-annual (182 days)", previous: "16.00%", current: "15.00%" },
      { label: "Upfront (annual, 365 days)", previous: "17.00%", current: "16.00%" },
      { label: "Backend (annual, 365 days)", previous: "18.00%", current: "17.00%" },
    ],
  },
];

export const loanRates: RateRow[] = [
  { label: "Normal loan", previous: "13.00%", current: "11.50%" },
  { label: "Special loan", previous: "20.50%", current: "19.00%" },
  {
    label: "Quick loan (up to 3 months)",
    previous: "11.00% – 13.00%",
    current: "9.50% – 11.50%",
    note: "Quick Credit under the Credit Policy: up to 20% of savings, capped by grade, and repayable within three months. The rate follows the month chosen — 9.50% at one month, 11.50% at three months.",
  },
  { label: "Seasonal sales loan", previous: "20.50%", current: "19.00%" },
  { label: "Investment loan", previous: "20.50%", current: "19.00%" },
  { label: "LPO Finance", previous: "11% flat", current: "11% flat", unchanged: true },
  { label: "Project loan", previous: "20.50%", current: "19.00%" },
];
