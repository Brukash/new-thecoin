import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/Reveal";
import { getProjectsIntro, listProjects } from "@/content/queries";
import { Camera, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Projects & real estate",
  description:
    "The CBN Staff Multipurpose Cooperative Society's property portfolio in Asaba, Kaduna, Okota, Katampe, Gidan Daya, Jikwoyi, Asokoro and Guzape, offered to members through the home ownership scheme.",
  alternates: { canonical: "/projects" },
};

// The portfolio is maintained in the CMS, so the index must pick up a newly
// published project without waiting for a redeploy.
export const revalidate = 300;

export default async function ProjectsPage() {
  const projects = await listProjects();
  const intro = await getProjectsIntro();

  return (
    <>
      <PageHero
        eyebrow="Property & investment"
        title="Homes and land offered to members."
        intro={intro}
        crumbs={[{ label: "Projects" }]}
        image="/images/projects/katampe/katampe-project-site.jpg"
        imageAlt="Aerial view of the Katampe project site."
      />

      <section className="bg-white py-14 md:py-20">
        <div className="shell">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-6">
            <h2 className="font-serif text-xl text-navy">
              {projects.length} projects across Nigeria
            </h2>
            <p className="text-xs uppercase tracking-[0.12em] text-slate">
              Asaba · Kaduna · Lagos · Abuja
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <Reveal key={project.slug} delay={index * 50}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>

          <p className="mt-6 flex items-start gap-2 text-[12px] leading-relaxed text-slate">
            <Camera className="mt-0.5 size-3.5 shrink-0 text-gold-600" aria-hidden />
            Site photographs are published as the Secretariat releases them. Where a project has no
            photograph yet, its card carries the location instead of a building from another project.
          </p>

          <div className="mt-14 grid gap-8 border-t border-line pt-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="eyebrow">How subscription works</p>
              <h2 className="mt-4 font-serif text-2xl leading-snug text-navy">
                Confirm the terms before you commit.
              </h2>
            </div>
            <div className="space-y-4">
              {[
                "Ask the Secretariat for the current project schedule and the payment plan for the unit you want.",
                "Request the title documentation position and the delivery timeline in writing.",
                "Confirm whether the National Housing Fund applies. Several projects include NHF access through the developer.",
                "Only pay into the Society's designated account, and keep your receipt.",
              ].map((item) => (
                <p key={item} className="flex gap-3 text-sm leading-relaxed text-slate">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="Property enquiry"
        title="Interested in a specific project?"
        body="Tell us which location you are considering and the Secretariat will send the current schedule, payment plan and documentation position."
        primary={{ label: "Enquire about a project", href: "/contact" }}
        secondary={{ label: "Home ownership scheme", href: "/services/home-ownership" }}
      />
    </>
  );
}
