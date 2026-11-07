/**
 * Single source of truth for organisational information.
 *
 * EVERY value here is taken from the existing public website
 * (thecbncoop.com) or supplied by the Society. Nothing is invented.
 * Items requiring management confirmation are marked `pending: true`
 * and are NOT rendered publicly.
 */

export const site = {
  name: "CBN Staff Multipurpose Cooperative Society Ltd",
  shortName: "CBN Coop",
  legalName: "CBN Staff Multipurpose Cooperative Society Limited",
  tagline: "Building savings. Creating wealth. Together.",
  description:
    "The CBN Staff Multipurpose Cooperative Society Ltd serves CBN staff, retirees and staff on secondment with savings, credit, investment, home ownership and consumer services.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.thecbncoop.com",

  contact: {
    addressLines: [
      "No. 9, Zaria Street, Garki II",
      "CBN Quarters, Opposite CBN Clinic",
      "Abuja, FCT, Nigeria",
    ],
    address: "No. 9, Zaria Street, Garki II, CBN Quarters, Opposite CBN Clinic, Abuja.",
    phones: [{ label: "Telephone", value: "0909 679 7982" }],
    emails: [
      { label: "General enquiries", value: "info@cbncoopng.com" },
      { label: "Customer service", value: "customerservice@cbncoopng.com" },
    ],
    hours: [
      { days: "Monday to Friday", time: "8:00 am to 4:00 pm" },
      { days: "Saturday and Sunday", time: "Closed" },
    ],
    mapQuery: "9 Zaria Street, Garki II, Abuja, Nigeria",
  },

  /** Verified public destinations belonging to the Society. */
  portals: [
    {
      label: "Member portal",
      name: "Coopman",
      href: "https://cbn.coop.ng/Account/Login?ReturnUrl=/Memb",
      description: "Member records, statements and loan status.",
    },
    {
      label: "Online store",
      name: "Coop E-Mall",
      href: "https://mall.thecbncoop.com/",
      description: "Flexible-payment shopping for members.",
    },
    {
      label: "Sales platform",
      name: "Coop Sales",
      href: "https://sales.cbncoopng.com/",
      description: "The Society's dedicated sales platform.",
    },
  ],

  /** Online membership registration on the Coopman platform. */
  registration: {
    label: "Become a member",
    href: "https://cbn.coop.ng/Signup",
    description: "Register a new membership application online.",
  },

  social: [
    {
      label: "Facebook",
      href: "https://www.facebook.com/share/Kg2mSR74Hv2JcWr2/?mibextid=qi2Omg",
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/cbn-staff-multipurpose-cooperative-society-ltd/",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/cbncoop1",
    },
    {
      label: "WhatsApp",
      href: "https://wa.me/message/MKWXQX7FFQ2CN1",
    },
  ],

  documents: [
    {
      label: "Bye-Laws and Policies",
      href: "https://www.thecbncoop.com/public/uploads/bilaws.pdf",
      kind: "PDF",
    },
    {
      label: "Membership application form",
      href: "https://drive.google.com/file/d/1YCe3nmQk9Lmftp_4r80lLa3bgQKpwubm/view?usp=drive_link",
      kind: "Form",
    },
  ],

  vision:
    "To be the leading Cooperative Society in Nigeria, improving the well-being of members by introducing inventive products, embracing digital advancements, and fostering prosperity for all.",

  mission:
    "To be the reliable partner for our members, delivering exceptional services, fostering growth, and championing their welfare through enterprise-driven, member-centric, and digitally powered solutions.",

  values: [
    {
      title: "Member-Centricity",
      body: "We prioritise the needs and aspirations of our members, placing them at the heart of all our decisions and actions.",
    },
    {
      title: "Innovation and Digital Transformation",
      body: "We keep improving the technology behind our services so that members can use them securely and easily.",
    },
    {
      title: "Empowerment",
      body: "We are committed to providing our members with the tools, resources, and knowledge to achieve their financial goals and build a secure future.",
    },
    {
      title: "Ethical Business Practices",
      body: "We uphold the highest standards of integrity, earning the trust and confidence of our members and stakeholders.",
    },
    {
      title: "Collaborative Excellence",
      body: "We cultivate a culture of collaboration and shared success, leveraging the combined strength of our members and partners.",
    },
  ],
};

export type Officer = {
  name: string;
  role: string;
  /** Portrait in /public/images/leadership, once one has been supplied. */
  photo?: string;
};

/** Management Committee — names and offices as published on thecbncoop.com/team. */
export const leadership: readonly Officer[] = [
  { name: "Thaddeus Samuel Ukehe", role: "President", photo: "/images/leadership/president.jpg" },
  { name: "Aliyu Abubakar", role: "Vice President I", photo: "/images/leadership/vice-president-1.jpg" },
  { name: "Aliyu Abdulaziz", role: "Vice President II", photo: "/images/leadership/vice-president-2.jpg" },
  {
    name: "Christiana Ebere Ako",
    role: "General Secretary",
    photo: "/images/leadership/general-secretary.jpg",
  },
  {
    name: "Dauda Abdulmalik",
    role: "Assistant Secretary I",
    photo: "/images/leadership/assistant-secretary-1.jpg",
  },
  {
    name: "Peter Ebirim Ikenga",
    role: "Assistant Secretary II",
    photo: "/images/leadership/assistant-secretary-2.jpg",
  },
  {
    name: "Osita Osunwa Nwachukwu",
    role: "Compliance Officer",
    photo: "/images/leadership/compliance-officer.jpg",
  },
  {
    name: "Aminu Ozemoya Unuane",
    role: "Financial Secretary",
    photo: "/images/leadership/financial-secretary.jpg",
  },
  { name: "Ishaku Hassan", role: "Treasurer", photo: "/images/leadership/treasurer.jpg" },
  {
    name: "Adekunle Adejumo",
    role: "Assistant Treasurer",
    photo: "/images/leadership/assistant-treasurer.jpg",
  },
  {
    name: "Umar Muhammad Garba",
    role: "Public Relations Officer",
    photo: "/images/leadership/public-relations-officer.jpg",
  },
  { name: "Pius Okezie Obianyor", role: "General Manager", photo: "/images/leadership/general-manager.jpg" },
];

/**
 * Verified figures only.
 *
 * The previous homepage published counters (9,840 members / 4,809 loans
 * processed / 3 projects / 36 locations) with no stated basis or date.
 * Those are deliberately NOT reproduced until the Society confirms them —
 * see docs/01-audit-report.md, finding F-04.
 */
export const verifiedFacts = [
  { value: "45th", label: "Annual General Meeting held in 2026" },
  { value: "2,000+", label: "Members supported into home ownership" },
  { value: "15", label: "Years of facilitated home acquisition schemes" },
  { value: "2016", label: "Year the annual consumer exhibition began" },
] as const;

export const primaryNav = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Events", href: "/events" },
  { label: "Membership", href: "/membership" },
  { label: "News", href: "/news" },
  { label: "Partners", href: "/partners" },
  { label: "Contact", href: "/contact" },
] as const;
