import { and, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { profile, workExperience } from "../db/schema";
import type { ExperienceInput, ProfileInput } from "./profile-validation";

export async function getProfile(userId: string) {
  const [row] = await db.select().from(profile).where(eq(profile.userId, userId));
  return row ?? null;
}

export async function saveProfile(userId: string, data: ProfileInput) {
  await db
    .insert(profile)
    .values({ userId, ...data })
    .onConflictDoUpdate({
      target: profile.userId,
      set: { ...data, updatedAt: new Date() },
    });
}

export async function listExperiences(userId: string) {
  return db
    .select()
    .from(workExperience)
    .where(eq(workExperience.userId, userId))
    .orderBy(desc(workExperience.startDate));
}

export async function getExperience(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(workExperience)
    .where(and(eq(workExperience.id, id), eq(workExperience.userId, userId)));
  return row ?? null;
}

export async function createExperience(userId: string, data: ExperienceInput) {
  const [row] = await db
    .insert(workExperience)
    .values({ userId, ...data })
    .returning({ id: workExperience.id });
  return row.id;
}

export async function updateExperience(
  userId: string,
  id: string,
  data: ExperienceInput
) {
  const rows = await db
    .update(workExperience)
    .set(data)
    .where(and(eq(workExperience.id, id), eq(workExperience.userId, userId)))
    .returning({ id: workExperience.id });
  return rows.length > 0;
}

export async function deleteExperience(userId: string, id: string) {
  const rows = await db
    .delete(workExperience)
    .where(and(eq(workExperience.id, id), eq(workExperience.userId, userId)))
    .returning({ id: workExperience.id });
  return rows.length > 0;
}