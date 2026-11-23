import { and, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { job, jobEvent } from "../db/schema";
import type { JobStatus } from "./job-status";
import type { TrackerDetails } from "./tracker";

export async function listTrackerJobs(userId: string) {
  return db
    .select({
      id: job.id,
      title: job.title,
      company: job.company,
      fitScore: job.fitScore,
      status: job.status,
      appliedOn: job.appliedOn,
      followUpOn: job.followUpOn,
      statusUpdatedAt: job.statusUpdatedAt,
    })
    .from(job)
    .where(eq(job.userId, userId))
    .orderBy(desc(job.statusUpdatedAt));
}

/**
 * Moves a job to a new stage and records the change. Both happen in one
 * transaction, so the history can never disagree with the current stage.
 * Returns false if the job isn't yours.
 */
export async function updateJobStatus(
  userId: string,
  id: string,
  status: JobStatus,
  today: string
) {
  return db.transaction(async (tx) => {
    const [current] = await tx
      .select({ status: job.status, appliedOn: job.appliedOn })
      .from(job)
      .where(and(eq(job.id, id), eq(job.userId, userId)));
    if (!current) return false;
    if (current.status === status) return true;

    await tx
      .update(job)
      .set({
        status,
        statusUpdatedAt: new Date(),
        ...(status === "applied" && !current.appliedOn
          ? { appliedOn: today }
          : {}),
      })
      .where(and(eq(job.id, id), eq(job.userId, userId)));

    await tx.insert(jobEvent).values({
      userId,
      jobId: id,
      fromStatus: current.status,
      toStatus: status,
    });
    return true;
  });
}

export async function updateJobDetails(
  userId: string,
  id: string,
  details: TrackerDetails
) {
  const rows = await db
    .update(job)
    .set(details)
    .where(and(eq(job.id, id), eq(job.userId, userId)))
    .returning({ id: job.id });
  return rows.length > 0;
}

export async function listJobEvents(userId: string, jobId: string) {
  return db
    .select()
    .from(jobEvent)
    .where(and(eq(jobEvent.jobId, jobId), eq(jobEvent.userId, userId)))
    .orderBy(desc(jobEvent.createdAt));
}