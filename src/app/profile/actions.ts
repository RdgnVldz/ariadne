"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createExperience,
  deleteExperience,
  saveProfile,
  updateExperience,
} from "@/lib/profile-data";
import {
  experienceSchema,
  formToObject,
  profileSchema,
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