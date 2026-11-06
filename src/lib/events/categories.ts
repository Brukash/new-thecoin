/**
 * Category fallback for the console before the database categories are read,
 * and the public "what's on" filters. The database remains authoritative.
 */
export const EVENT_CATEGORY_FALLBACK = [
  { name: "Annual General Meetings", slug: "annual-general-meetings" },
  { name: "Sales and Exhibitions", slug: "sales-and-exhibitions" },
  { name: "International Day of Cooperatives", slug: "international-day-of-cooperatives" },
  { name: "Property Project Launches", slug: "property-project-launches" },
  { name: "Investment Seminars", slug: "investment-seminars" },
  { name: "Members' Engagement Meetings", slug: "members-engagement-meetings" },
  { name: "Training Programmes", slug: "training-programmes" },
  { name: "Cooperative Conferences", slug: "cooperative-conferences" },
  { name: "Other Events", slug: "other-events" },
] as const;
