import { getEvent } from "@/lib/cms/events";
import { buildIcs } from "@/lib/events/ics";

export const revalidate = 300;

/** Downloadable calendar entry for one event. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return new Response("Not found", { status: 404 });

  return new Response(buildIcs(event), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
