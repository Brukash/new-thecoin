/**
 * Photographs shown in the home page hero.
 *
 * To add a picture: put the cleaned file in `public/images/site/` and add one
 * entry below. The hero rotates through the list in order; the first entry is
 * the one loaded eagerly, so keep the strongest photograph first.
 */
export type HeroPhoto = {
  src: string;
  alt: string;
};

export const heroPhotos: HeroPhoto[] = [
  {
    src: "/images/site/staff-1.jpg",
    alt: "Staff of the Society photographed in the Secretariat office",
  },
  {
    src: "/images/hero/head-office.jpg",
    alt: "Sam Olabanji House, the Society's Secretariat in Garki II, Abuja",
  },
  {
    src: "/images/site/people-1.jpg",
    alt: "Officers of the Society photographed at the Secretariat",
  },
  {
    src: "/images/site/staff-2.jpg",
    alt: "Staff of the Society photographed at the Secretariat",
  },
  {
    src: "/images/site/staff-3.jpg",
    alt: "Staff of the Society photographed at the Secretariat",
  },
  {
    src: "/images/site/staff-4.jpg",
    alt: "Staff of the Society photographed at the Secretariat",
  },
];
