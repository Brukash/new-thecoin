import type { FaqDocument } from "@/lib/cms/schemas";

/**
 * Default FAQ copy. Staff edit this from the console; the grouped shape is
 * shared with the public page and the FAQPage structured data.
 */
export const faqGroups: FaqDocument["groups"] = [
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
        a: "Payout frequency is agreed per investor and may be monthly, quarterly, half-yearly, yearly, up-front or backend. The rate for the plan depends on the option chosen.",
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
