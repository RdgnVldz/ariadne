import { and, count, desc, eq, gte } from "drizzle-orm";
import { db } from "../db";
import { coverLetter, job } from "../db/schema";

export const DAILY_LETTER_LIMIT = 20;

/** The newest letter for this job, or null. */
export async function getCoverLetter(userId: string, jobId: string) {
  const [row] = await db
    .select()
    .from(coverLetter)
    .where(and(eq(coverLetter.jobId, jobId), eq(coverLetter.userId, userId)))
    .orderBy(desc(coverLetter.createdAt))
    .limit(1);
  return row ?? null;
}

/** Saves a generated letter. Returns its id, or null if the job isn't yours. */
export async function saveCoverLetter(
  userId: string,
  jobId: string,
  data: { body: string; warnings: string[]; model: string }
) {
  const [owned] = await db
    .select({ id: job.id })
    .from(job)
    .where(and(eq(job.id, jobId), eq(job.userId, userId)));
  if (!owned) return null;

  const [row] = await db
    .insert(coverLetter)
    .values({ userId, jobId, ...data })
    .returning({ id: coverLetter.id });
  return row.id;
}

/** Saves the person's edits. Returns false if the letter isn't theirs. */
export async function updateCoverLetterBody(
  userId: string,
  id: string,
  body: string
) {
  const rows = await db
    .update(coverLetter)
    .set({ body, edited: true, updatedAt: new Date() })
    .where(and(eq(coverLetter.id, id), eq(coverLetter.userId, userId)))
    .returning({ id: coverLetter.id });
  return rows.length > 0;
}

export async function countCoverLettersSince(userId: string, since: Date) {
  const [row] = await db
    .select({ n: count() })
    .from(coverLetter)
    .where(and(eq(coverLetter.userId, userId), gte(coverLetter.createdAt, since)));
  return row.n;
}