import { and, count, desc, eq, gte } from "drizzle-orm";
import { db } from "../db";
import { job } from "../db/schema";
import type { Analysis } from "./analysis";

export const DAILY_ANALYSIS_LIMIT = 20;

export type NewJob = {
  title: string;
  company: string;
  postingText: string;
  analysis: Analysis;
  missingKeywords: string[];
  fitScore: number | null;
  model: string;
};

export async function countJobsSince(userId: string, since: Date) {
  const [row] = await db
    .select({ n: count() })
    .from(job)
    .where(and(eq(job.userId, userId), gte(job.createdAt, since)));
  return row.n;
}

export async function createJob(userId: string, data: NewJob) {
  const [row] = await db
    .insert(job)
    .values({ userId, ...data })
    .returning({ id: job.id });
  return row.id;
}

export async function listJobs(userId: string) {
  return db
    .select({
      id: job.id,
      title: job.title,
      company: job.company,
      fitScore: job.fitScore,
      createdAt: job.createdAt,
    })
    .from(job)
    .where(eq(job.userId, userId))
    .orderBy(desc(job.createdAt));
}

export async function getJob(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(job)
    .where(and(eq(job.id, id), eq(job.userId, userId)));
  return row ?? null;
}

export async function deleteJob(userId: string, id: string) {
  const rows = await db
    .delete(job)
    .where(and(eq(job.id, id), eq(job.userId, userId)))
    .returning({ id: job.id });
  return rows.length > 0;
}