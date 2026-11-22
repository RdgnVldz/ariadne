import { and, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { education, profile, skillGroup, workExperience } from "../db/schema";
import type {
  EducationInput,
  ExperienceInput,
  ProfileInput,
  SkillGroupInput,
} from "./profile-validation";

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

export async function listEducation(userId: string) {
  return db
    .select()
    .from(education)
    .where(eq(education.userId, userId))
    .orderBy(desc(education.endDate), desc(education.createdAt));
}

export async function getEducation(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(education)
    .where(and(eq(education.id, id), eq(education.userId, userId)));
  return row ?? null;
}

export async function createEducation(userId: string, data: EducationInput) {
  const [row] = await db
    .insert(education)
    .values({ userId, ...data })
    .returning({ id: education.id });
  return row.id;
}

export async function updateEducation(
  userId: string,
  id: string,
  data: EducationInput
) {
  const rows = await db
    .update(education)
    .set(data)
    .where(and(eq(education.id, id), eq(education.userId, userId)))
    .returning({ id: education.id });
  return rows.length > 0;
}

export async function deleteEducation(userId: string, id: string) {
  const rows = await db
    .delete(education)
    .where(and(eq(education.id, id), eq(education.userId, userId)))
    .returning({ id: education.id });
  return rows.length > 0;
}

export async function listSkillGroups(userId: string) {
  return db
    .select()
    .from(skillGroup)
    .where(eq(skillGroup.userId, userId))
    .orderBy(skillGroup.position);
}

export async function replaceSkillGroups(
  userId: string,
  groups: SkillGroupInput[]
) {
  await db.transaction(async (tx) => {
    await tx.delete(skillGroup).where(eq(skillGroup.userId, userId));
    if (groups.length > 0) {
      await tx.insert(skillGroup).values(
        groups.map((g, position) => ({
          userId,
          category: g.category,
          items: g.items,
          position,
        }))
      );
    }
  });
}