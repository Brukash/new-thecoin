/**
 * Partner directory seed.
 *
 * The organisations below are the ones supplied by the Society for the
 * Partners section. Presence here is not, by itself, evidence of an active
 * partnership or an endorsement: the public page says so explicitly.
 *
 * Logo files were downloaded from each organisation's own website (or a
 * documented fallback) and are stored under public/images/partners. An empty
 * `logoUrl` means no verified asset could be obtained, so the public page and
 * the console show a name placeholder until an administrator uploads one.
 */

export type PartnerCategory =
  | "Commercial Banks"
  | "Fund and Asset Managers"
  | "Investment Institutions"
  | "Development Finance Institutions"
  | "Financial Services Partners";

export const PARTNER_CATEGORIES: PartnerCategory[] = [
  "Commercial Banks",
  "Fund and Asset Managers",
  "Investment Institutions",
  "Development Finance Institutions",
  "Financial Services Partners",
];

export type SeedPartner = {
  organisationName: string;
  slug: string;
  logoUrl: string;
  websiteUrl: string;
  description: string;
  category: PartnerCategory;
  displayOrder: number;
  active: boolean;
  logoBackground: "light" | "dark";
};

export const seedPartners: SeedPartner[] = [
  {
    organisationName: "GTBank",
    slug: "gtbank",
    logoUrl: "/images/partners/gtbank.png",
    websiteUrl: "https://www.gtbank.com",
    description: "Commercial bank",
    category: "Commercial Banks",
    displayOrder: 10,
    active: true,
    logoBackground: "light",
  },
  {
    organisationName: "Fidelity Bank",
    slug: "fidelity-bank",
    logoUrl: "/images/partners/fidelity-bank.svg",
    websiteUrl: "https://www.fidelitybank.ng",
    description: "Commercial bank",
    category: "Commercial Banks",
    displayOrder: 20,
    active: true,
    logoBackground: "light",
  },
  {
    organisationName: "First Bank",
    slug: "first-bank",
    logoUrl: "/images/partners/first-bank.svg",
    websiteUrl: "https://www.firstbanknigeria.com",
    description: "Commercial bank",
    category: "Commercial Banks",
    displayOrder: 30,
    active: true,
    logoBackground: "light",
  },
  {
    organisationName: "Zenith Bank",
    slug: "zenith-bank",
    logoUrl: "/images/partners/zenith-bank.png",
    websiteUrl: "https://www.zenithbank.com",
    description: "Commercial bank",
    category: "Commercial Banks",
    displayOrder: 40,
    active: true,
    logoBackground: "light",
  },
  {
    organisationName: "UBA",
    slug: "uba",
    logoUrl: "/images/partners/uba.png",
    websiteUrl: "https://www.ubagroup.com",
    description: "Commercial bank",
    category: "Commercial Banks",
    displayOrder: 50,
    active: true,
    logoBackground: "light",
  },
  {
    organisationName: "ARM",
    slug: "arm",
    logoUrl: "/images/partners/arm.png",
    websiteUrl: "https://www.armgroup.com",
    description: "Asset and fund manager",
    category: "Fund and Asset Managers",
    displayOrder: 60,
    active: true,
    logoBackground: "light",
  },
  {
    organisationName: "TrustBanc",
    slug: "trustbanc",
    logoUrl: "/images/partners/trustbanc.png",
    websiteUrl: "https://www.trustbancgroup.com",
    description: "Fund and asset manager",
    category: "Fund and Asset Managers",
    displayOrder: 70,
    active: true,
    logoBackground: "light",
  },
  {
    organisationName: "Cordros",
    slug: "cordros",
    logoUrl: "/images/partners/cordros.png",
    websiteUrl: "https://www.cordros.com",
    description: "Fund and asset manager",
    category: "Fund and Asset Managers",
    displayOrder: 80,
    active: true,
    logoBackground: "light",
  },
  {
    organisationName: "Cowry",
    slug: "cowry",
    logoUrl: "/images/partners/cowry.png",
    websiteUrl: "https://www.cowryasset.com",
    description: "Fund and asset manager",
    category: "Fund and Asset Managers",
    displayOrder: 90,
    active: true,
    logoBackground: "light",
  },
  {
    organisationName: "Norrenberger",
    slug: "norrenberger",
    logoUrl: "/images/partners/norrenberger.png",
    websiteUrl: "https://www.norrenberger.com",
    description: "Fund and asset manager",
    category: "Fund and Asset Managers",
    displayOrder: 100,
    active: true,
    logoBackground: "light",
  },
  {
    organisationName: "Alpha Morgan",
    slug: "alpha-morgan",
    logoUrl: "/images/partners/alpha-morgan.jpg",
    websiteUrl: "https://www.alphamorgan.com",
    description: "Asset and fund manager",
    category: "Fund and Asset Managers",
    displayOrder: 110,
    active: true,
    logoBackground: "light",
  },
  {
    organisationName: "APEL",
    slug: "apel",
    logoUrl: "/images/partners/apel.svg",
    websiteUrl: "https://www.apel.com.ng",
    description: "Financial services group",
    category: "Fund and Asset Managers",
    displayOrder: 120,
    active: true,
    logoBackground: "light",
  },
  {
    organisationName: "DLM",
    slug: "dlm",
    logoUrl: "/images/partners/dlm.png",
    websiteUrl: "https://dlm.group",
    description: "Investment institution",
    category: "Investment Institutions",
    displayOrder: 130,
    active: true,
    logoBackground: "light",
  },
  {
    organisationName: "United Capital",
    slug: "united-capital",
    logoUrl: "/images/partners/united-capital.png",
    websiteUrl: "https://unitedcapitalplcgroup.com",
    description: "Investment institution",
    category: "Investment Institutions",
    displayOrder: 140,
    active: true,
    logoBackground: "light",
  },
  {
    organisationName: "First Icon",
    slug: "first-icon",
    logoUrl: "/images/partners/first-icon.png",
    websiteUrl: "https://firsticon.com",
    description: "Investment and wealth management group",
    category: "Fund and Asset Managers",
    displayOrder: 150,
    active: true,
    logoBackground: "light",
  },
  {
    organisationName: "Tatum",
    slug: "tatum",
    logoUrl: "",
    websiteUrl: "https://www.tatumbank.com",
    description: "Commercial bank",
    category: "Commercial Banks",
    displayOrder: 160,
    active: true,
    logoBackground: "light",
  },
  {
    organisationName: "Union Bank",
    slug: "union-bank",
    logoUrl: "/images/partners/union-bank.png",
    websiteUrl: "https://www.unionbankng.com",
    description: "Commercial bank",
    category: "Commercial Banks",
    displayOrder: 170,
    active: true,
    logoBackground: "light",
  },
  {
    organisationName: "WealthBridge",
    slug: "wealthbridge",
    logoUrl: "/images/partners/wealthbridge.webp",
    websiteUrl: "https://www.wealthbridge.com.ng",
    description: "Fund and asset manager",
    category: "Fund and Asset Managers",
    displayOrder: 180,
    active: true,
    logoBackground: "light",
  },
  {
    organisationName: "Alpha 10",
    slug: "alpha-10",
    logoUrl: "/images/partners/alpha-10.png",
    websiteUrl: "https://alpha10group.com",
    description: "Fund and asset manager",
    category: "Fund and Asset Managers",
    displayOrder: 190,
    active: true,
    logoBackground: "dark",
  },
  {
    organisationName: "Radix",
    slug: "radix",
    logoUrl: "/images/partners/radix.png",
    websiteUrl: "https://radixng.com",
    description: "Investment institution",
    category: "Fund and Asset Managers",
    displayOrder: 200,
    active: true,
    logoBackground: "light",
  },
  {
    organisationName: "NIRSAL",
    slug: "nirsal",
    logoUrl: "/images/partners/nirsal.png",
    websiteUrl: "https://www.nirsal.com",
    description: "Development finance institution",
    category: "Development Finance Institutions",
    displayOrder: 210,
    active: true,
    logoBackground: "light",
  },
];
