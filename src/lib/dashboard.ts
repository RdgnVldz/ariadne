import { STATUSES, type JobStatus } from "./job-status";
import type { ResumeSource } from "./resume";

export type ChecklistItem = { id: string; label: string; done: boolean };

/** What is still missing from the master profile. */
export function profileChecklist(source: ResumeSource): ChecklistItem[] {
  const p = source.profile;
  const roles = source.experiences;

  return [
    {
      id: "contact",
      label: "Add your contact details",
      done: Boolean(p?.fullName && p.contactEmail && p.phone),
    },
    {
      id: "summary",
      label: "Write a short summary",
      done: Boolean(p?.summary),
    },
    {
      id: "experience",
      label: "Add your work experience",
      done: roles.length > 0,
    },
    {
      id: "highlights",
      label: "Add highlights to every role",
      done: roles.length > 0 && roles.every((r) => r.highlights.length > 0),
    },
    {
      id: "projects",
      label: "Add a project",
      done: source.projects.length > 0,
    },
    {
      id: "education",
      label: "Add your education",
      done: source.education.length > 0,
    },
    {
      id: "skills",
      label: "List your skills",
      done: source.skills.length > 0,
    },
  ];
}

/** How many jobs are in each stage, including stages with none. */
export function stageCounts(
  jobs: { status: JobStatus }[]
): Record<JobStatus, number> {
  const counts = Object.fromEntries(
    STATUSES.map((status) => [status, 0])
  ) as Record<JobStatus, number>;
  for (const job of jobs) counts[job.status] += 1;
  return counts;
}

/** Active applications whose follow-up date is today or earlier. */
export function followUpsDue<
  T extends { status: JobStatus; followUpOn: string | null },
>(jobs: T[], today: string): T[] {
  return jobs.filter(
    (job) =>
      job.followUpOn !== null &&
      job.followUpOn <= today &&
      (job.status === "applied" || job.status === "interviewing")
  );
}