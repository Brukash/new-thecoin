import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { ProjectMap } from "@/components/projects/ProjectMap";
import { listProjects } from "@/content/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Project map",
  description:
    "Where the Society's housing projects are located, city by city, with links to each project's details.",
  alternates: { canonical: "/projects/map" },
  openGraph: {
    title: "Project map | CBN Coop",
    description: "Explore the Society's project locations across Nigeria.",
    images: [{ url: "/images/og-default.jpg", width: 1200, height: 630, alt: "CBN Coop project map" }],
  },
};

export default async function ProjectMapPage() {
  const projects = await listProjects();

  // Only records with a real place name can be mapped. Nothing is geocoded or
  // guessed: the pin is the city or state the Secretariat entered.
  const mapped = projects
    .map((project) => ({
      slug: project.slug,
      name: project.name,
      city: project.city,
      state: project.state,
      status: project.status,
      query: (project.location || [project.city, project.state].filter(Boolean).join(", ")).trim(),
    }))
    .filter((project) => project.query.length > 0);

  return (
    <>
      <PageHero
        eyebrow="Projects"
        title="Project map"
        intro="The Society's property projects, shown at the city or state recorded for each one. Confirm exact site details with the Secretariat before travelling."
        crumbs={[
          { label: "Projects", href: "/projects" },
          { label: "Map" },
        ]}
      />

      <section className="bg-white py-12 md:py-16">
        <div className="shell">
          {mapped.length === 0 ? (
            <div className="border border-line bg-bone p-6">
              <p className="font-serif text-xl text-navy">No project locations recorded yet.</p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate">
                Projects appear here once a city or state is entered in the console.{" "}
                <Link href="/projects" className="underline underline-offset-4 hover:text-navy">
                  Browse the projects
                </Link>{" "}
                in the meantime.
              </p>
            </div>
          ) : (
            <ProjectMap projects={mapped} />
          )}

          <p className="mt-8 flex items-start gap-2 text-[12px] leading-relaxed text-slate">
            <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Pins mark the city or state named on the project record, not a surveyed plot boundary.
            Prices, availability and delivery schedules are confirmed by the Secretariat on enquiry.
          </p>
        </div>
      </section>

      <CtaBand
        title="Interested in a project?"
        body="The Secretariat can confirm availability, pricing and inspection arrangements for any project shown here."
        primary={{ label: "Enquire about a project", href: "/contact" }}
        secondary={{ label: "See all projects", href: "/projects" }}
      />
    </>
  );
}
