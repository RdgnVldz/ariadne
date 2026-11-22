"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createEducation,
  createExperience,
  createProject,
  deleteEducation,
  deleteExperience,
  deleteProject,
  replaceSkillGroups,
  saveProfile,
  updateEducation,
  updateExperience,
  updateProject,
} from "@/lib/profile-data";
import {
  educationSchema,
  experienceSchema,
  formToObject,
  profileSchema,
  projectSchema,
  skillsSchema,
} from "@/lib/profile-validation";
import { requireUser } from "@/lib/session";

export type FormState = {
  errors?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
  message?: string;
} | null;

export async function saveProfileAction(
  _prev: FormState,
  form: FormData
): Promise<FormState> {
  const user = await requireUser();
  const values = formToObject(form);
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }
  await saveProfile(user.id, parsed.data);
  revalidatePath("/profile");
  return { values, message: "Profile saved." };
}

export async function saveExperienceAction(
  id: string,
  _prev: FormState,
  form: FormData
): Promise<FormState> {
  const user = await requireUser();
  const values = formToObject(form);
  const raw = { ...values };
  if (raw.current === "on") raw.endDate = "";

  const parsed = experienceSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  if (id === "new") {
    await createExperience(user.id, parsed.data);
  } else {
    const valid = z.uuid().safeParse(id).success;
    const updated = valid && (await updateExperience(user.id, id, parsed.data));
    if (!updated) return { values, message: "That entry no longer exists." };
  }

  revalidatePath("/profile");
  redirect("/profile");
}

export async function deleteExperienceAction(id: string, _form: FormData) {
  const user = await requireUser();
  if (z.uuid().safeParse(id).success) {
    await deleteExperience(user.id, id);
  }
  revalidatePath("/profile");
}

export async function saveEducationAction(
  id: string,
  _prev: FormState,
  form: FormData
): Promise<FormState> {
  const user = await requireUser();
  const values = formToObject(form);

  const parsed = educationSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  if (id === "new") {
    await createEducation(user.id, parsed.data);
  } else {
    const valid = z.uuid().safeParse(id).success;
    const updated = valid && (await updateEducation(user.id, id, parsed.data));
    if (!updated) return { values, message: "That entry no longer exists." };
  }

  revalidatePath("/profile");
  redirect("/profile");
}

export async function deleteEducationAction(id: string, _form: FormData) {
  const user = await requireUser();
  if (z.uuid().safeParse(id).success) {
    await deleteEducation(user.id, id);
  }
  revalidatePath("/profile");
}

export async function saveSkillsAction(
  _prev: FormState,
  form: FormData
): Promise<FormState> {
  const user = await requireUser();
  const values = formToObject(form);
  const parsed = skillsSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }
  await replaceSkillGroups(user.id, parsed.data.skills);
  revalidatePath("/profile");
  return { values, message: "Skills saved." };
}

export async function saveProjectAction(
  id: string,
  _prev: FormState,
  form: FormData
): Promise<FormState> {
  const user = await requireUser();
  const values = formToObject(form);

  const parsed = projectSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  if (id === "new") {
    await createProject(user.id, parsed.data);
  } else {
    const valid = z.uuid().safeParse(id).success;
    const updated = valid && (await updateProject(user.id, id, parsed.data));
    if (!updated) return { values, message: "That project no longer exists." };
  }

  revalidatePath("/profile");
  redirect("/profile");
}

export async function deleteProjectAction(id: string, _form: FormData) {
  const user = await requireUser();
  if (z.uuid().safeParse(id).success) {
    await deleteProject(user.id, id);
  }
  revalidatePath("/profile");
}