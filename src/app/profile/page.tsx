import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { linkClass, secondaryButtonClass } from "@/components/form";
import { formatMonth } from "@/lib/format";
import {
  getProfile,
  listEducation,
  listExperiences,
  listProjects,
  listSkillGroups,
} from "@/lib/profile-data";
import { requireUser } from "@/lib/session";
import { deleteExperienceAction } from "./actions";
import { ProfileForm } from "./profile-form";
import { EducationSection, ProjectsSection, SkillsSection } from "./sections";

export const metadata: Metadata = { title: "Profile" };

async function ProfileContent() {
  const user = await requireUser();
  const [profile, experiences, educationList, skillGroups, projects] =
    await Promise.all([
      getProfile(user.id),
      listExperiences(user.id),
      listEducation(user.id),
      listSkillGroups(user.id),
      listProjects(user.id),
    ]);

  const defaults = {
    fullName: profile?.fullName ?? user.name,
    headline: profile?.headline ?? "",
    contactEmail: profile?.contactEmail ?? user.email,
    phone: profile?.phone ?? "",
    location: profile?.location ?? "",
    linkedin: profile?.linkedin ?? "",
    github: profile?.github ?? "",
    website: profile?.website ?? "",
    summary: profile?.summary ?? "",
  };

  return (
    <>
      <section>
        <h2 className="text-xl font-semibold tracking-tight">
          Contact and summary
        </h2>
        <div className="mt-6">
          <ProfileForm defaults={defaults} />
        </div>
      </section>

      <section className="mt-16">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Work experience
          </h2>
          <Link href="/profile/experience/new" className={secondaryButtonClass}>
            Add role
          </Link>
        </div>

        {experiences.length === 0 ? (
          <div className="mt-6 border-l-2 border-thread pl-6">
            <p className="max-w-md text-ink-soft">
              No roles yet.{" "}
              <Link href="/profile/experience/new" className={linkClass}>
                Add your most recent job
              </Link>{" "}
              to get started.
            </p>
          </div>
        ) : (
          <ul className="mt-6">
            {experiences.map((e) => (
              <li
                key={e.id}
                className="flex flex-col gap-3 border-t border-ink/15 py-5 first:border-t-0 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <h3 className="font-semibold">
                    {e.title}, {e.company}
                  </h3>
                  <p className="text-sm text-ink-soft">
                    {formatMonth(e.startDate)} to{" "}
                    {e.endDate ? formatMonth(e.endDate) : "Present"}
                    {e.location ? `, ${e.location}` : ""}
                  </p>
                  {e.highlights.length > 0 && (
                    <ul className="mt-2 list-disc pl-5 text-sm text-ink-soft">
                      {e.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/profile/experience/${e.id}`}
                    className={secondaryButtonClass}
                  >
                    Edit
                  </Link>
                  <form action={deleteExperienceAction.bind(null, e.id)}>
                    <button className={secondaryButtonClass}>Delete</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <ProjectsSection items={projects} />
      <EducationSection items={educationList} />
      <SkillsSection groups={skillGroups} />
    </>
  );
}

export default function ProfilePage() {
  return (
    <AppShell>
      <h1 className="mb-10 text-3xl font-semibold tracking-tight">
        Your profile
      </h1>
      <Suspense fallback={<p className="text-ink-soft">Loading your profile…</p>}>
        <ProfileContent />
      </Suspense>
    </AppShell>
  );
}