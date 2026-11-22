import { and, count, desc, eq, gte } from "drizzle-orm";
import { db } from "../db";
import { job, resume } from "../db/schema";
import {
  getProfile,
  listEducation,
  listExperiences,
  listProjects,
  listSkillGroups,
} from "./profile-data";
import type { ResumeSource, Tailored } from "./resume";

export const DAILY_RESUME_LIMIT = 20;

export async function loadResumeSource(userId: string): Promise<ResumeSource> {
  const [profile, experiences, projects, education, skills] = await Promise.all([
    getProfile(userId),
    listExperiences(userId),
    listProjects(userId),
    listEducation(userId),
    listSkillGroups(userId),
  ]);
  return { profile, experiences, projects, education, skills };
}

/** The newest resume generated for this job, or null. */
export async function getResume(userId: string, jobId: string) {
  const [row] = await db
    .select()
    .from(resume)
    .where(and(eq(resume.jobId, jobId), eq(resume.userId, userId)))
    .orderBy(desc(resume.createdAt))
    .limit(1);
  return row ?? null;
}

/** Saves a resume for a job. Returns false if the job isn't yours. */
export async function saveResume(
  userId: string,
  jobId: string,
  data: { tailored: Tailored; warnings: string[]; model: string }
) {
  const [owned] = await db
    .select({ id: job.id })
    .from(job)
    .where(and(eq(job.id, jobId), eq(job.userId, userId)));
  if (!owned) return false;

  await db.insert(resume).values({ userId, jobId, ...data });
  return true;
}

export async function countResumesSince(userId: string, since: Date) {
  const [row] = await db
    .select({ n: count() })
    .from(resume)
    .where(and(eq(resume.userId, userId), gte(resume.createdAt, since)));
  return row.n;
}