import Link from "next/link";
import { requireStaff } from "@/lib/cms/auth";
import { listEnquiries } from "@/lib/cms/store";
import { listAnnouncements, listEvents } from "@/lib/cms/events";
import { listArticles, listProjects, listServices } from "@/content/queries";
import { readRecords } from "@/lib/security";

export const dynamic = "force-dynamic";

type View = { path: string; at: string };

const DAY = 86_400_000;

function dayKey(value: string | Date): string {
  return (typeof value === "string" ? value : value.toISOString()).slice(0, 10);
}

export default async function AnalyticsPage() {
  await requireStaff();

  const [views, enquiries, subscribers, events, announcements, articles, projects, services] =
    await Promise.all([
      readRecords<View>("pageviews"),
      listEnquiries(500),
      readRecords<{ email: string }>("newsletter"),
      listEvents(),
      listAnnouncements({ limit: 200 }),
      listArticles(),
      listProjects(),
      listServices(),
    ]);

  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(Date.now() - (13 - index) * DAY);
    return {
      key: dayKey(date),
      label: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    };
  });

  const windowStart = days[0].key;
  const recent = views.filter((view) => typeof view.at === "string" && dayKey(view.at) >= windowStart);
  const perDay = new Map<string, number>(days.map((day) => [day.key, 0]));
  const perPath = new Map<string, number>();

  for (const view of recent) {
    const key = dayKey(view.at);
    perDay.set(key, (perDay.get(key) ?? 0) + 1);
    if (typeof view.path === "string") perPath.set(view.path, (perPath.get(view.path) ?? 0) + 1);
  }

  const peak = Math.max(1, ...perDay.values());
  const topPaths = [...perPath.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const openEnquiries = enquiries.filter((enquiry) => !enquiry.handled).length;
  const published = articles.length + projects.length + services.length + events.length + announcements.length;
  const gaConfigured = Boolean(process.env.NEXT_PUBLIC_GA_ID);

  return (
    <div>
      <Link href="/admin" className="text-[12px] uppercase tracking-[0.12em] text-slate hover:text-navy">
        ← Console
      </Link>
      <h1 className="mt-4 font-serif text-2xl text-navy">Website analytics</h1>
      <p className="mt-1 text-xs text-slate">
        First-party page views kept by this site. No cookies, no visitor identifiers.
      </p>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Views, 14 days", value: recent.length, href: undefined },
          { label: "Open enquiries", value: openEnquiries, href: "/admin/enquiries" },
          { label: "Newsletter subscribers", value: subscribers.length, href: "/admin/newsletter" },
          { label: "Published items", value: published, href: undefined },
        ].map((card) => (
          <div key={card.label} className="border border-line bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate">{card.label}</p>
            <p className="mt-2 font-serif text-3xl text-navy">{card.value}</p>
            {card.href ? (
              <Link href={card.href} className="mt-2 inline-block text-[12px] text-slate underline underline-offset-4 hover:text-navy">
                Open
              </Link>
            ) : null}
          </div>
        ))}
      </section>

      <section className="mt-10 border border-line bg-white p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">Daily views</p>
        <div className="mt-4 flex h-40 items-end gap-1.5">
          {days.map((day) => {
            const count = perDay.get(day.key) ?? 0;
            return (
              <div key={day.key} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full bg-navy/80"
                  style={{ height: `${Math.round((count / peak) * 100)}%`, minHeight: count > 0 ? 2 : 0 }}
                  title={`${count} views on ${day.label}`}
                />
                <span className="text-[10px] tabular-nums text-slate">{day.label.split(" ")[0]}</span>
              </div>
            );
          })}
        </div>
        {recent.length === 0 ? (
          <p className="mt-3 text-xs text-slate">
            No views recorded yet. Counting starts as visitors browse the public site.
          </p>
        ) : null}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="border border-line bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">Most read pages</p>
          {topPaths.length === 0 ? (
            <p className="mt-3 text-xs text-slate">Nothing recorded yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {topPaths.map(([path, count]) => (
                <li key={path} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-navy">{path}</span>
                  <span className="tabular-nums text-slate">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-line bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">Traffic sources</p>
          <p className="mt-3 text-xs leading-relaxed text-slate">
            {gaConfigured
              ? "Google Analytics 4 is configured, so acquisition channels, devices and geography are in the GA property."
              : "Google Analytics is not configured, so acquisition and geography are not collected. Set NEXT_PUBLIC_GA_ID and rebuild to add them; these counts continue to work either way."}
          </p>
          <p className="mt-3 text-[12px] leading-relaxed text-slate">
            First-party counting stores one record per page view in <code>data/submissions/pageviews.jsonl</code>.
            It is anonymous but still personal data in the broad sense — mention it in the privacy notice.
          </p>
        </div>
      </section>
    </div>
  );
}
