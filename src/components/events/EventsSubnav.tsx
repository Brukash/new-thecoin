import Link from "next/link";

const links = [
  { label: "Upcoming", href: "/events" },
  { label: "Past events", href: "/events/past" },
  { label: "Announcements", href: "/events/announcements" },
  { label: "Event gallery", href: "/events/gallery" },
];

/** Sub-navigation for the events and announcements centre. */
export function EventsSubnav({ active }: { active: "upcoming" | "past" | "announcements" | "gallery" }) {
  const current: Record<string, string> = {
    upcoming: "/events",
    past: "/events/past",
    announcements: "/events/announcements",
    gallery: "/events/gallery",
  };

  return (
    <nav aria-label="Events and announcements" className="border-b border-line bg-white">
      <div className="shell flex flex-wrap gap-x-6 gap-y-1 py-3">
        {links.map((link) => {
          const isActive = current[active] === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`border-b-2 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                isActive
                  ? "border-gold text-navy"
                  : "border-transparent text-slate hover:border-line hover:text-navy"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
