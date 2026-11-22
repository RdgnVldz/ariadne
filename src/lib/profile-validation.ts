import { z } from "zod";

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .transform((v) => v || null);

const optionalLink = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || isHttpUrl(v),
    "Enter a full link, like https://example.com."
  )
  .transform((v) => v || null);

const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Choose a valid month.");

export function parseHighlights(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean);
}

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your full name.").max(100),
  headline: optionalText(120),
  contactEmail: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || z.email().safeParse(v).success,
      "Enter a valid email address."
    )
    .transform((v) => v || null),
  phone: optionalText(40),
  location: optionalText(100),
  linkedin: optionalLink,
  github: optionalLink,
  website: optionalLink,
  summary: optionalText(1000),
});

const highlightsField = z
  .string()
  .transform(parseHighlights)
  .pipe(
    z
      .array(z.string().max(400, "Keep each bullet under 400 characters."))
      .max(12, "Use 12 bullets or fewer.")
  );

export const experienceSchema = z
  .object({
    company: z.string().trim().min(1, "Enter the company name.").max(120),
    title: z.string().trim().min(1, "Enter your job title.").max(120),
    location: optionalText(100),
    startDate: month,
    endDate: z
      .string()
      .trim()
      .transform((v) => v || null)
      .pipe(month.nullable()),
    highlights: highlightsField,
  })
  .refine((d) => d.endDate === null || d.endDate >= d.startDate, {
    message: "The end date can't be before the start date.",
    path: ["endDate"],
  });

export type ProfileInput = z.output<typeof profileSchema>;
export type ExperienceInput = z.output<typeof experienceSchema>;

export function formToObject(form: FormData): Record<string, string> {
  return Object.fromEntries(
    Array.from(form.entries()).map(([key, value]) => [
      key,
      typeof value === "string" ? value : "",
    ])
  );
}

const optionalMonth = z
  .string()
  .trim()
  .transform((v) => v || null)
  .pipe(month.nullable());

export const educationSchema = z
  .object({
    school: z.string().trim().min(1, "Enter the school name.").max(120),
    degree: z.string().trim().min(1, "Enter your degree.").max(120),
    field: optionalText(120),
    location: optionalText(100),
    startDate: optionalMonth,
    endDate: optionalMonth,
    highlights: highlightsField,
  })
  .refine((d) => !d.startDate || !d.endDate || d.endDate >= d.startDate, {
    message: "The end date can't be before the start date.",
    path: ["endDate"],
  });

export function parseSkillGroups(
  input: string
): { category: string; items: string[] }[] | null {
  const groups: { category: string; items: string[] }[] = [];
  for (const line of input.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const colon = trimmed.indexOf(":");
    if (colon <= 0) return null;
    const category = trimmed.slice(0, colon).trim();
    const seen = new Set<string>();
    const items = trimmed
      .slice(colon + 1)
      .split(",")
      .map((s) => s.trim())
      .filter((s) => {
        const key = s.toLowerCase();
        if (!s || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    if (!category || items.length === 0) return null;
    groups.push({ category, items });
  }
  return groups;
}

const skillGroupSchema = z.object({
  category: z.string().max(40, "Keep category names under 40 characters."),
  items: z
    .array(z.string().max(40, "Keep each skill under 40 characters."))
    .max(40, "Use 40 skills or fewer per category."),
});

export const skillsSchema = z.object({
  skills: z
    .string()
    .max(4000, "Keep this under 4000 characters.")
    .refine((v) => parseSkillGroups(v) !== null, {
      message: "Write each line like “Frontend: React, Next.js”.",
    })
    .transform((v) => parseSkillGroups(v) ?? [])
    .pipe(z.array(skillGroupSchema).max(12, "Use 12 categories or fewer.")),
});

export type EducationInput = z.output<typeof educationSchema>;
export type SkillGroupInput = z.output<typeof skillsSchema>["skills"][number];