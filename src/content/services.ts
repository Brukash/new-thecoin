/**
 * Service catalogue.
 *
 * Bodies are drawn from the Society's existing published service pages
 * (thecbncoop.com/service/view/1,2,5,8), the Bye-Laws summary on the
 * membership pages and the rate notice of 24 September 2026. No rate,
 * eligibility rule or financial term is derived here: published figures are
 * reproduced from the Society's own notices, and anything unpublished is
 * confirmed by the Secretariat before a member commits.
 */

export type Service = {
  slug: string;
  title: string;
  shortTitle: string;
  /** Two-digit index used by the editorial numbering on the site. */
  index: string;
  /** Illustrative photograph used on the service card and the detail masthead. */
  image: string;
  summary: string;
  intro: string;
  body: { heading?: string; paragraphs: string[]; bullets?: string[] }[];
  facts?: { label: string; value: string }[];
  /** Set when copy must be confirmed by the Society before launch. */
  reviewNote?: string;
  /** Which published rate schedule belongs on the page, if any. */
  rates?: "bond" | "loans";
  related: string[];
  cta: { label: string; href: string };
};

export const services: Service[] = [
  {
    slug: "credit-and-thrift",
    title: "Credit and Thrift",
    shortTitle: "Credit & Thrift",
    index: "01",
    image: "/images/hero/p7.jpg",
    summary:
      "Monthly thrift savings, a credit facility for members, and an annual bonus declared after the Annual General Meeting.",
    intro:
      "The primary objective of a cooperative society is to cultivate a savings culture in an individual member's life. It is an age-long established fact that nobody can escape poverty without a savings habit. Anybody who spends everything on consumption is just a step away from poverty and its consequences, no matter how rich the person is today.",
    body: [
      {
        heading: "Building savings, creating wealth",
        paragraphs: [
          "CBN Coop gives members ample opportunity to build their savings as active or retired members through monthly contributions. Apart from securing their funds, thrift contributions also qualify members for the annual savings bonus payable after every Annual General Meeting.",
          "The Society's member savings have consistently grown at approximately 12% per annum.",
        ],
      },
      {
        heading: "The Coop credit facility",
        paragraphs: [
          "Alongside thrift savings, the Society operates a credit facility for members. Loan amounts and repayment terms are determined by the Management Committee in line with the Society's Bye-Laws and are confirmed with the member at the point of application.",
          "Members should contact the Secretariat for the current lending terms applicable to their category.",
        ],
      },
    ],
    facts: [
      { label: "Monthly contribution (active members)", value: "₦10,000" },
      { label: "Monthly contribution (retired members)", value: "₦5,000" },
      { label: "Savings growth (published)", value: "~12% p.a." },
    ],
    related: ["savings", "loans", "financial-advisory"],
    cta: { label: "Speak to the Secretariat", href: "/contact" },
  },
  {
    slug: "savings",
    title: "Savings",
    shortTitle: "Savings",
    index: "02",
    image: "/images/hero/p8.jpg",
    summary:
      "Structured monthly thrift savings that build a member's capital and earn an annual savings bonus.",
    intro:
      "Savings are the foundation of every other service the Society offers. Members contribute monthly at a level set for their category, and those contributions form the pool from which credit, investment and property participation are financed.",
    body: [
      {
        heading: "How member savings work",
        paragraphs: [
          "Active members contribute monthly, and retired members contribute at a reduced rate. Contributions are recorded against the member's account and remain the member's property.",
          "Savings qualify the member for the annual savings bonus declared after each Annual General Meeting, and they establish the contribution history used when a member applies for credit.",
        ],
      },
      {
        heading: "Why the discipline matters",
        paragraphs: [
          "Regular thrift contributions keep the Society's pool liquid, which in turn keeps credit available to members who need it.",
        ],
      },
    ],
    facts: [
      { label: "Active member contribution", value: "₦10,000 / month" },
      { label: "Retired member contribution", value: "₦5,000 / month" },
      { label: "Bonus", value: "Declared after the AGM" },
    ],
    related: ["credit-and-thrift", "loans", "investment-services"],
    cta: { label: "Enquire about savings", href: "/contact" },
  },
  {
    slug: "loans",
    title: "Loans",
    shortTitle: "Loans",
    index: "03",
    image: "/images/hero/p10.jpg",
    summary:
      "Credit for members, administered under the Society's Bye-Laws with transparent deduction and repayment.",
    intro:
      "The Society extends credit to members from the collective savings pool. Applications are assessed against the member's contribution history and capacity, and approved facilities are recovered through structured deductions.",
    body: [
      {
        heading: "Applying for credit",
        paragraphs: [
          "A member applies through the Secretariat. The application is reviewed against the member's standing and the lending rules in force at the time, and the member is told the approved amount and repayment schedule before the facility is drawn.",
          "Where a member already has an outstanding facility, the Society's systems will not permit a further loan unless a waiver is granted.",
        ],
      },
      {
        heading: "Terms are confirmed in writing",
        paragraphs: [
          "The Society publishes its lending rates. The Management Committee approved revised rates on 24 September 2026, effective 1 October 2026, and they are set out below. Tenor and security requirements are confirmed by the Secretariat in writing at the point of application.",
        ],
      },
    ],
    facts: [
      { label: "Eligibility", value: "Members in good standing" },
      { label: "Assessment", value: "Contribution history & capacity" },
      { label: "Repayment", value: "Structured deduction" },
    ],
    reviewNote:
      "Rates are as published in the notice of 24 September 2026. Maximum amounts and tenors follow the Credit Policy and are confirmed in writing.",
    rates: "loans",
    related: ["credit-and-thrift", "savings", "home-ownership"],
    cta: { label: "Request lending terms", href: "/contact" },
  },
  {
    slug: "investment-services",
    title: "Investment Services",
    shortTitle: "Investments",
    index: "04",
    image: "/images/hero/p13.jpg",
    summary:
      "Four-year investment series and a short-term Triple Plan that finance the Society's activities and pay returns to investors.",
    intro:
      "The Coop Investment Fund allows members to participate in the financing of the Society's activities while earning a return on their capital. Each series runs for a defined tenor, matures on a published date and is approved by the Management Committee.",
    body: [
      {
        heading: "The series open to members",
        paragraphs: [
          "Three four-year series are currently open. The Classic Diamond Series (2024–2028) followed the closure of Series D and matures in January 2028. The Classic Excel Series (2025–2029) followed the closure of Series E and matures in January 2029.",
          "The Classic Investment Fund (2025–2029) opened on 1 October 2025 and matures in September 2029, with a 30 September anniversary. Alongside the four-year series, the Classic Triple Plan is a short-term window for excess liquidity, running for three, six or twelve months.",
        ],
      },
      {
        heading: "How the return is paid",
        paragraphs: [
          "Within each series the rate depends on how interest is paid. The monthly, quarterly and half-yearly options pay during the tenor, the front-end option pays the year's interest at the start, and the backend option pays at the end of the period.",
          "Interest is computed from the day payment is confirmed in the Society's account, and is paid to the member's bank account or credited to their Coop savings account. Interest credited to savings also qualifies for the savings bonus; the principal does not.",
        ],
      },
      {
        heading: "Subscription limits",
        paragraphs: [
          "The minimum subscription is ₦1,000,000. Serving members may hold up to ₦50,000,000 per investment tranche; retiring staff may hold up to ₦100,000,000 per tranche and may invest in multiple tranches.",
          "Application is open to all members. Transfers from Coop savings, or from another investment series into a new series, are not permitted.",
        ],
      },
      {
        heading: "Liquidation, switching and rollover",
        paragraphs: [
          "Liquidating before maturity without the required notice attracts a charge on interest already earned: 50% under the Diamond and Excel series, and 25% on interest paid upfront. The Classic Investment Fund applies a 40% charge and requires 90 days' notice, without which a further 10% applies.",
          "Switching between payment options is allowed once per investment anniversary and attracts a fee of 5% of interest earned. Under the Triple Plan, a switch between tenor or payment option before maturity is not allowed, and an investment rolls over automatically at maturity unless the Society is notified at least 10 days beforehand.",
        ],
      },
    ],
    facts: [
      { label: "Minimum subscription", value: "₦1,000,000" },
      { label: "Maximum per tranche", value: "₦50m · ₦100m retiring" },
      { label: "Tenors", value: "3, 6 or 12 months · 4 years" },
      { label: "Current series", value: "Diamond · Excel · Classic Fund" },
    ],
    reviewNote:
      "Figures are reproduced from the series documents dated 1 October 2026 and the Classic Triple Plan. The rate, payment option and payment account for your tranche are confirmed by the Secretariat in writing before funds are committed.",
    rates: "bond",
    related: ["financial-advisory", "savings", "credit-and-thrift"],
    cta: { label: "Ask about the current series", href: "/contact" },
  },
  {
    slug: "financial-advisory",
    title: "Financial Advisory and Wealth Management",
    shortTitle: "Advisory & Wealth",
    index: "05",
    image: "/images/hero/p9.jpg",
    summary:
      "Investment management and financial advice for members, including the Coop Special Savings scheme.",
    intro:
      "Wealth management is the highest level of financial planning. It generally combines comprehensive investment management with financial advice, tax guidance, estate planning and, where appropriate, legal assistance.",
    body: [
      {
        heading: "The Coop Special Savings scheme",
        paragraphs: [
          "In its drive to innovate, the Society developed a wealth-creation product for members built around the ability to manage money. The scheme is designed for members who want structure around how they save, invest and plan.",
        ],
      },
      {
        heading: "The Coop Investment Funds",
        paragraphs: [
          "The fund runs for an initial four years, after which it can be continued or discontinued. It is structured to provide guaranteed cash flow from periodic interest payments: monthly, quarterly, half-yearly, yearly, up-front or backend.",
        ],
        bullets: [
          "Guaranteed cash flow from periodic interest payments",
          "Payment frequency matched to the investor's preference",
          "Managed within the Society's approved investment framework",
        ],
      },
      {
        heading: "Advice before commitment",
        paragraphs: [
          "Members considering an investment product should speak with the Secretariat so that the current series terms, tenor and payment structure are confirmed in writing before funds are committed.",
        ],
      },
    ],
    facts: [
      { label: "Products", value: "Special Savings · Investment Fund" },
      { label: "Payout options", value: "Monthly to backend" },
      { label: "Guidance", value: "One-to-one with the Secretariat" },
    ],
    related: ["investment-services", "savings", "home-ownership"],
    cta: { label: "Book an advisory conversation", href: "/contact" },
  },
  {
    slug: "home-ownership",
    title: "Coop Home Ownership and Asset Acquisition Scheme",
    shortTitle: "Home Ownership",
    index: "06",
    image: "/images/hero/p3.jpg",
    summary:
      "Affordable housing and asset acquisition on flexible payment plans, delivered through the Society's developer partnerships.",
    intro:
      "This scheme was introduced by the Management of CBN SMCSL to empower members to participate in the real-estate projects promoted by the Society and to support many to own valuable assets.",
    body: [
      {
        heading: "Flexible payment, real assets",
        paragraphs: [
          "The scheme provides affordable housing and financial assistance under flexible payment plans which may extend to the end of the project. Over 2,000 members of the Society have benefited from the various home acquisition schemes facilitated by the Cooperative over the past 15 years.",
        ],
      },
      {
        heading: "Delivered through developers",
        paragraphs: [
          "Projects are delivered with appointed developers under project agreements. The River Park II project (terraces and blocks of flats, Abuja), for example, was agreed with Houses for Africa Nigeria Limited to construct blocks of flats and terrace duplexes of different designs, partly financed through the National Housing Fund scheme of the Federal Government.",
          "Several of the Society's housing projects include access to the National Housing Fund through developer facilitation, as contained in the project agreements.",
        ],
      },
      {
        heading: "What a subscriber should ask for",
        paragraphs: [
          "Before subscribing, ask the Secretariat for the current project schedule, the payment plan applicable to the unit you are interested in, the delivery timeline, and the title documentation position. Those details are project-specific and are confirmed in writing.",
        ],
      },
    ],
    facts: [
      { label: "Members housed", value: "2,000+" },
      { label: "Scheme history", value: "15 years" },
      { label: "Financing", value: "Flexible plans · NHF access" },
    ],
    related: ["loans", "investment-services", "consumer-operations"],
    cta: { label: "Explore property projects", href: "/projects" },
  },
  {
    slug: "consumer-operations",
    title: "Consumer Operations",
    shortTitle: "Consumer",
    index: "07",
    image: "/images/hero/p14.jpg",
    summary:
      "The annual Coop Exhibition and Consumer Fair, now extended online through the Coop E-Mall.",
    intro:
      "The Society's Consumer Operations introduced the Annual Exhibition and Consumer Fair in 2016 as part of its services to members.",
    body: [
      {
        heading: "An exhibition built around members",
        paragraphs: [
          "The exhibition showcases a wide range of products and services available for purchase under flexible payment terms designed to ease the financial burden on members, and provides an avenue for staff to learn about reputable vendors in and around Abuja.",
        ],
        bullets: [
          "Real estate and automobile",
          "Solar and inverters, generators",
          "Electronics, phones and appliances",
          "Furniture and household goods",
          "Groceries, clothing and childrenswear",
        ],
      },
      {
        heading: "From fairground to E-Mall",
        paragraphs: [
          "The Consumer Fair has evolved into the online Coop E-Mall, available to serving and retired staff of the CBN within and outside Abuja. Shopping is handled on the E-Mall platform, which sits outside this website.",
        ],
      },
    ],
    facts: [
      { label: "First held", value: "2016" },
      { label: "Format", value: "Annual fair · Online E-Mall" },
      { label: "Audience", value: "Serving & retired CBN staff" },
    ],
    related: ["home-ownership", "savings", "credit-and-thrift"],
    cta: { label: "Visit the Coop E-Mall", href: "https://mall.thecbncoop.com/" },
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);

/**
 * Artwork for a service. Services published through the CMS may not carry an
 * image field yet, so fall back to the catalogue's own choice by slug.
 */
const imageBySlug = new Map(services.map((service) => [service.slug, service.image]));

export const serviceImage = (slug: string) => imageBySlug.get(slug) ?? "/images/hero/p6.jpg";
