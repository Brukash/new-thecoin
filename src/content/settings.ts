import { cache } from "react";
import { site } from "./site";
import { getEntry } from "@/lib/cms/store";
import type { ContactSettings } from "@/lib/cms/schemas";

/**
 * Editable site settings.
 *
 * Structural data (navigation, leadership, verified facts) stays in
 * `content/site.ts`; what staff maintain day to day is the contact block,
 * portals and social channels. With Supabase connected the published
 * `settings/main` document wins; otherwise the verified defaults are served.
 */
export const getContactSettings = cache(async (): Promise<ContactSettings> => {
  const entry = await getEntry<ContactSettings>("settings", "main");
  const saved = entry?.data;

  return {
    name: saved?.name || site.name,
    shortName: saved?.shortName || site.shortName,
    legalName: saved?.legalName || site.legalName,
    tagline: saved?.tagline || site.tagline,
    description: saved?.description || site.description,
    contact: {
      addressLines: saved?.contact?.addressLines?.length
        ? saved.contact.addressLines
        : site.contact.addressLines,
      address: saved?.contact?.address || site.contact.address,
      mapQuery: saved?.contact?.mapQuery || site.contact.mapQuery,
      phones: saved?.contact?.phones?.length ? saved.contact.phones : site.contact.phones,
      emails: saved?.contact?.emails?.length ? saved.contact.emails : site.contact.emails,
      hours: saved?.contact?.hours?.length ? saved.contact.hours : site.contact.hours,
    },
    portals: saved?.portals?.length ? saved.portals : site.portals,
    social: saved?.social?.length ? saved.social : site.social,
    registration: saved?.registration ?? site.registration,
  };
});
